import {createHmac} from "node:crypto";
import {mkdirSync} from "node:fs";
import path from "node:path";
import {createClient, type Client} from "@libsql/client";

export type AiUsageLimits = {
  perMinute: number;
  perVisitorDay: number;
  globalDay: number;
  globalMonth: number;
};

export type UsageLimitReason =
  | "visitor_minute"
  | "visitor_day"
  | "global_day"
  | "global_month"
  | "unconfigured";

export type UsageDecision = {allowed: true} | {allowed: false; reason: UsageLimitReason};

type AiUsageStoreOptions = {
  path: string;
  limits: AiUsageLimits;
};

type Counter = {scope: string; period: string; limit: number; reason: UsageLimitReason};

export const DEFAULT_AI_USAGE_LIMITS: AiUsageLimits = {
  perMinute: 3,
  perVisitorDay: 10,
  globalDay: 50,
  globalMonth: 1_000,
};

export class AiUsageStore {
  private readonly client: Client;
  private readonly limits: AiUsageLimits;
  private readonly initialized: Promise<void>;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(options: AiUsageStoreOptions) {
    mkdirSync(path.dirname(options.path), {recursive: true});
    this.client = createClient({url: `file:${options.path}`});
    this.limits = options.limits;
    this.initialized = this.client
      .execute(`CREATE TABLE IF NOT EXISTS ai_usage_counters (
        scope TEXT NOT NULL,
        period TEXT NOT NULL,
        count INTEGER NOT NULL,
        PRIMARY KEY (scope, period)
      )`)
      .then(() => undefined);
  }

  consume(clientId: string, now = Date.now()): Promise<UsageDecision> {
    const operation = this.queue.then(() => this.consumeAtomic(clientId, now));
    this.queue = operation.catch(() => undefined);
    return operation;
  }

  close() {
    this.client.close();
  }

  private async consumeAtomic(clientId: string, now: number): Promise<UsageDecision> {
    await this.initialized;
    const date = new Date(now);
    const minute = date.toISOString().slice(0, 16);
    const day = date.toISOString().slice(0, 10);
    const month = date.toISOString().slice(0, 7);
    const counters: Counter[] = [
      {scope: `visitor:${clientId}:minute`, period: minute, limit: this.limits.perMinute, reason: "visitor_minute"},
      {scope: `visitor:${clientId}:day`, period: day, limit: this.limits.perVisitorDay, reason: "visitor_day"},
      {scope: "global:day", period: day, limit: this.limits.globalDay, reason: "global_day"},
      {scope: "global:month", period: month, limit: this.limits.globalMonth, reason: "global_month"},
    ];

    const transaction = await this.client.transaction("write");
    try {
      for (const counter of counters) {
        const result = await transaction.execute({
          sql: "SELECT count FROM ai_usage_counters WHERE scope = ? AND period = ?",
          args: [counter.scope, counter.period],
        });
        const count = Number(result.rows[0]?.count ?? 0);
        if (count >= counter.limit) {
          await transaction.rollback();
          return {allowed: false, reason: counter.reason};
        }
      }

      for (const counter of counters) {
        await transaction.execute({
          sql: `INSERT INTO ai_usage_counters (scope, period, count) VALUES (?, ?, 1)
                ON CONFLICT(scope, period) DO UPDATE SET count = count + 1`,
          args: [counter.scope, counter.period],
        });
      }
      await transaction.commit();
      return {allowed: true};
    } finally {
      transaction.close();
    }
  }
}

export function createClientFingerprint(request: Request, secret: string, clientToken = "") {
  const address =
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown";
  return createHmac("sha256", secret).update(`${address}\n${clientToken}`).digest("hex");
}
