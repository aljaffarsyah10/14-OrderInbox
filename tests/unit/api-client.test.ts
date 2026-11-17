import { describe, it } from "node:test";
import assert from "node:assert";
import {
  formatLatencySeries,
  formatUptimeDays,
  calculateLatencyStats,
} from "../../src/lib/api/monitoring";
import { ApiClientError } from "../../src/lib/api/client";
import { MonitorCheck } from "../../src/types";

describe("Frontend API & Monitoring Helpers", () => {
  describe("calculateLatencyStats", () => {
    it("should return zeros for empty or invalid latency arrays", () => {
      const statsEmpty = calculateLatencyStats([]);
      assert.deepStrictEqual(statsEmpty, { min: 0, max: 0, avg: 0, p95: 0 });

      const statsNulls = calculateLatencyStats([null, undefined, NaN]);
      assert.deepStrictEqual(statsNulls, { min: 0, max: 0, avg: 0, p95: 0 });
    });

    it("should calculate min, max, avg, and p95 correctly", () => {
      // 100 values from 1 to 100
      const latencies = Array.from({ length: 100 }, (_, i) => i + 1);
      const stats = calculateLatencyStats(latencies);

      assert.strictEqual(stats.min, 1);
      assert.strictEqual(stats.max, 100);
      assert.strictEqual(stats.avg, 51); // (1+100)*100/2 / 100 = 50.5 -> 51
      assert.strictEqual(stats.p95, 95);
    });

    it("should filter out negative or invalid values", () => {
      const latencies = [50, 100, 150, -10, null, 200];
      const stats = calculateLatencyStats(latencies);

      assert.strictEqual(stats.min, 50);
      assert.strictEqual(stats.max, 200);
      assert.strictEqual(stats.avg, 125);
    });
  });

  describe("formatLatencySeries", () => {
    it("should return an empty array when given no checks", () => {
      const result = formatLatencySeries([]);
      assert.deepStrictEqual(result, []);
    });

    it("should reverse checks so oldest is first for chart chronological order", () => {
      const mockChecks: MonitorCheck[] = [
        {
          id: "chk-2",
          endpointId: "ep-1",
          status: "SUCCESS",
          httpStatus: 200,
          responseTimeMs: 150,
          checkedAt: "2026-11-17T10:00:00.000Z",
        },
        {
          id: "chk-1",
          endpointId: "ep-1",
          status: "SUCCESS",
          httpStatus: 200,
          responseTimeMs: 120,
          checkedAt: "2026-11-17T09:00:00.000Z",
        },
      ];

      const series = formatLatencySeries(mockChecks, 10);
      assert.strictEqual(series.length, 2);
      assert.strictEqual(series[0].timestamp, "2026-11-17T09:00:00.000Z");
      assert.strictEqual(series[0].latencyMs, 120);
      assert.strictEqual(series[1].timestamp, "2026-11-17T10:00:00.000Z");
      assert.strictEqual(series[1].latencyMs, 150);
    });

    it("should limit output to desiredPoints count", () => {
      const checks: MonitorCheck[] = Array.from({ length: 50 }, (_, i) => ({
        id: `chk-${i}`,
        endpointId: "ep-1",
        status: "SUCCESS" as const,
        httpStatus: 200,
        responseTimeMs: 100 + i,
        checkedAt: new Date(Date.now() - i * 60000).toISOString(),
      }));

      const series = formatLatencySeries(checks, 10);
      assert.strictEqual(series.length, 10);
    });
  });

  describe("formatUptimeDays", () => {
    it("should generate 90 days of summaries", () => {
      const summaries = formatUptimeDays([], 90);
      assert.strictEqual(summaries.length, 90);
      assert.strictEqual(summaries[0].uptimeRatio, 100);
      assert.strictEqual(summaries[0].status, "UP");
    });

    it("should mark degraded or down days when failed checks exist", () => {
      const todayStr = new Date().toISOString().split("T")[0];
      const checks: MonitorCheck[] = [
        {
          id: "chk-fail",
          endpointId: "ep-1",
          status: "FAILED",
          httpStatus: 500,
          responseTimeMs: 900,
          checkedAt: `${todayStr}T08:00:00.000Z`,
        },
        {
          id: "chk-ok",
          endpointId: "ep-1",
          status: "SUCCESS",
          httpStatus: 200,
          responseTimeMs: 120,
          checkedAt: `${todayStr}T09:00:00.000Z`,
        },
      ];

      const summaries = formatUptimeDays(checks, 7);
      const todaySummary = summaries.find((s) => s.date === todayStr);
      assert.ok(todaySummary);
      assert.strictEqual(todaySummary.checksTotal, 2);
      assert.strictEqual(todaySummary.checksFailed, 1);
      assert.strictEqual(todaySummary.uptimeRatio, 50);
      assert.strictEqual(todaySummary.status, "DEGRADED");
    });
  });

  describe("ApiClientError", () => {
    it("should construct with custom code and status", () => {
      const error = new ApiClientError("Forbidden access", "FORBIDDEN", 403, { reason: "ownership" });
      assert.strictEqual(error.name, "ApiClientError");
      assert.strictEqual(error.message, "Forbidden access");
      assert.strictEqual(error.code, "FORBIDDEN");
      assert.strictEqual(error.status, 403);
      assert.deepStrictEqual(error.details, { reason: "ownership" });
    });
  });
});
