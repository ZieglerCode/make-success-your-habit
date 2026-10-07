import {createHmac} from "node:crypto";
import {mkdirSync} from "node:fs";
import path from "node:path";
import {createClient, type Client} from "@libsql/client";

export type AiUsageLimits = {
  perMinute: number;
  perVisitorDay: number;
  perIpMinute?: number;
  perIpDay?: number;
  globalDay: number;
  globalMonth: number;
};

export type UsageLimitReason =
  | "visitor_minute"
  | "visitor_day"
  | "ip_minute"
  | "ip_day"
  | "global_day"
  | "global_month"
  | "unconfigured";

export type UsageDecision = {
  allowed: boolean;
  reason?: UsageLimitReason;
};

export type ClientIdentity = {
  visitorId: string;
  ipId?: string;
};

export type ConsumeTarget = string | ClientIdentity;

type AiUsageStoreOptions = {
  path: string;
  limits: AiUsageLimits;
};

type Counter = {scope: string; period: string; limit: number; reason: UsageLimitReason};

export const DEFAULT_AI_USAGE_LIMITS: AiUsageLimits = {
  perMinute: 10,
  perVisitorDay: 50,
  perIpMinute: 10,
  perIpDay: 50,
  globalDay: 250,
  globalMonth: 5_000,
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

  consume(target: ConsumeTarget, now = Date.now()): Promise<UsageDecision> {
    const operation = this.queue.then(() => this.consumeAtomic(target, now));
    this.queue = operation.catch(() => undefined);
    return operation;
  }

  close() {
    this.client.close();
  }

  private async consumeAtomic(target: ConsumeTarget, now: number): Promise<UsageDecision> {
    await this.initialized;
    const date = new Date(now);
    const minute = date.toISOString().slice(0, 16);
    const day = date.toISOString().slice(0, 10);
    const month = date.toISOString().slice(0, 7);

    const visitorId = typeof target === "string" ? target : target.visitorId;
    const ipId = typeof target === "object" ? target.ipId : undefined;

    const ipMinuteLimit = this.limits.perIpMinute ?? this.limits.perMinute;
    const ipDayLimit = this.limits.perIpDay ?? this.limits.perVisitorDay;

    const counters: Counter[] = [];

    // 1. IP rate limiting: prevents brute-force / flood attacks even if attacker rotates client tokens
    if (ipId) {
      counters.push(
        {scope: `ip:${ipId}:minute`, period: minute, limit: ipMinuteLimit, reason: "ip_minute"},
        {scope: `ip:${ipId}:day`, period: day, limit: ipDayLimit, reason: "ip_day"},
      );
    }

    // 2. Visitor session rate limiting: prevents high-frequency usage by a single browser session
    if (visitorId) {
      counters.push(
        {scope: `visitor:${visitorId}:minute`, period: minute, limit: this.limits.perMinute, reason: "visitor_minute"},
        {scope: `visitor:${visitorId}:day`, period: day, limit: this.limits.perVisitorDay, reason: "visitor_day"},
      );
    }

    // 3. Global site limits: bounds total Gemini usage and budget across all users
    counters.push(
      {scope: "global:day", period: day, limit: this.limits.globalDay, reason: "global_day"},
      {scope: "global:month", period: month, limit: this.limits.globalMonth, reason: "global_month"},
    );

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

function isValidIp(ip: string): boolean {
  if (!ip || ip.length > 45) return false;
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6 = /^[0-9a-fA-F:]+$/;
  return ipv4.test(ip) || (ip.includes(":") && ipv6.test(ip));
}

export function extractClientIp(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp && isValidIp(cfIp)) return cfIp;

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && isValidIp(realIp)) return realIp;

  const vercelIp = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercelIp && isValidIp(vercelIp)) return vercelIp;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first && isValidIp(first)) return first;
  }

  return "unknown";
}

export function createClientIdentity(request: Request, secret: string, clientToken = ""): ClientIdentity {
  const ip = extractClientIp(request);
  const ipId = createHmac("sha256", secret).update(`ip:${ip}`).digest("hex");
  const visitorId = createHmac("sha256", secret).update(`visitor:${ip}\n${clientToken}`).digest("hex");
  return {ipId, visitorId};
}

export function createClientFingerprint(request: Request, secret: string, clientToken = ""): string {
  return createClientIdentity(request, secret, clientToken).visitorId;
}
