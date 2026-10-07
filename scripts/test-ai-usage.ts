import assert from "node:assert/strict";
import {mkdtemp, rm} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {AiUsageStore, createClientFingerprint} from "../lib/ai/usage-store";

const directory = await mkdtemp(path.join(os.tmpdir(), "msyh-ai-usage-"));
const databasePath = path.join(directory, "usage.sqlite");
const limits = {perMinute: 3, perVisitorDay: 10, globalDay: 50, globalMonth: 1_000};
const now = Date.UTC(2026, 7, 1, 10, 15, 0);

try {
  const store = new AiUsageStore({path: databasePath, limits});
  assert.deepEqual(await store.consume("visitor-a", now), {allowed: true});
  assert.deepEqual(await store.consume("visitor-a", now), {allowed: true});
  assert.deepEqual(await store.consume("visitor-a", now), {allowed: true});
  assert.deepEqual(await store.consume("visitor-a", now), {
    allowed: false,
    reason: "visitor_minute",
  });
  store.close();

  const reopened = new AiUsageStore({path: databasePath, limits});
  assert.deepEqual(await reopened.consume("visitor-a", now), {
    allowed: false,
    reason: "visitor_minute",
  });
  assert.deepEqual(await reopened.consume("visitor-a", now + 60_000), {allowed: true});
  reopened.close();

  const visitorDb = path.join(directory, "visitor.sqlite");
  const visitorStore = new AiUsageStore({
    path: visitorDb,
    limits: {...limits, perMinute: 20, perVisitorDay: 2},
  });
  assert.equal((await visitorStore.consume("visitor-a", now)).allowed, true);
  assert.equal((await visitorStore.consume("visitor-a", now)).allowed, true);
  assert.deepEqual(await visitorStore.consume("visitor-a", now), {
    allowed: false,
    reason: "visitor_day",
  });
  assert.equal((await visitorStore.consume("visitor-a", now + 86_400_000)).allowed, true);
  visitorStore.close();

  const globalDayDb = path.join(directory, "global-day.sqlite");
  const globalDayStore = new AiUsageStore({
    path: globalDayDb,
    limits: {...limits, perMinute: 20, perVisitorDay: 20, globalDay: 2},
  });
  assert.equal((await globalDayStore.consume("visitor-a", now)).allowed, true);
  assert.equal((await globalDayStore.consume("visitor-b", now)).allowed, true);
  assert.deepEqual(await globalDayStore.consume("visitor-c", now), {
    allowed: false,
    reason: "global_day",
  });
  globalDayStore.close();

  const globalMonthDb = path.join(directory, "global-month.sqlite");
  const globalMonthStore = new AiUsageStore({
    path: globalMonthDb,
    limits: {...limits, perMinute: 20, perVisitorDay: 20, globalDay: 20, globalMonth: 2},
  });
  assert.equal((await globalMonthStore.consume("visitor-a", now)).allowed, true);
  assert.equal((await globalMonthStore.consume("visitor-b", now + 86_400_000)).allowed, true);
  assert.deepEqual(await globalMonthStore.consume("visitor-c", now + 2 * 86_400_000), {
    allowed: false,
    reason: "global_month",
  });
  globalMonthStore.close();

  const concurrentDb = path.join(directory, "concurrent.sqlite");
  const concurrentStore = new AiUsageStore({
    path: concurrentDb,
    limits: {...limits, perMinute: 3, perVisitorDay: 100, globalDay: 100, globalMonth: 100},
  });
  const decisions = await Promise.all(
    Array.from({length: 12}, () => concurrentStore.consume("visitor-a", now)),
  );
  assert.equal(decisions.filter((decision) => decision.allowed).length, 3);
  concurrentStore.close();

  const request = new Request("https://example.test/api/chat", {
    headers: {"x-forwarded-for": "203.0.113.7, 198.51.100.2"},
  });
  const fingerprint = createClientFingerprint(request, "test-secret", "browser-token");
  assert.equal(fingerprint.length, 64);
  assert(!fingerprint.includes("203.0.113.7"));
  assert.equal(
    fingerprint,
    createClientFingerprint(request, "test-secret", "browser-token"),
  );

  // Test IP rate limiting and prevention of token-rotation attacks
  const ipStoreDb = path.join(directory, "ip-limits.sqlite");
  const ipStore = new AiUsageStore({
    path: ipStoreDb,
    limits: {...limits, perMinute: 10, perVisitorDay: 10, perIpMinute: 2, perIpDay: 5},
  });

  // Client rotating visitor tokens from the same IP
  const identity1 = {ipId: "ip-attacker", visitorId: "token-1"};
  const identity2 = {ipId: "ip-attacker", visitorId: "token-2"};
  const identity3 = {ipId: "ip-attacker", visitorId: "token-3"};

  assert.equal((await ipStore.consume(identity1, now)).allowed, true);
  assert.equal((await ipStore.consume(identity2, now)).allowed, true);
  // Third request from same IP must be BLOCKED despite new visitor token!
  const blocked = await ipStore.consume(identity3, now);
  assert.equal(blocked.allowed, false);
  assert.equal((blocked as {allowed: false; reason: string}).reason, "ip_minute");
  ipStore.close();
} finally {
  await rm(directory, {recursive: true, force: true});
}

console.log("AI usage limit tests passed");
