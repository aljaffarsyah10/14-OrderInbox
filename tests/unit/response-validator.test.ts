import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateResponse,
  getNestedProperty,
  ValidationTarget,
  ValidationExpectations,
} from "../../worker/src/monitoring/response-validator";

describe("Response Validator", () => {
  describe("getNestedProperty", () => {
    it("should resolve single and deeply nested keys", () => {
      const payload = {
        status: "ok",
        data: {
          user: {
            id: 42,
            active: true,
          },
        },
      };

      assert.equal(getNestedProperty(payload, "status"), "ok");
      assert.equal(getNestedProperty(payload, "data.user.id"), 42);
      assert.equal(getNestedProperty(payload, "data.user.active"), true);
      assert.equal(getNestedProperty(payload, "data.missing.key"), undefined);
    });
  });

  describe("validateResponse HTTP Status", () => {
    it("should pass when status is in expectedStatus list", () => {
      const target: ValidationTarget = {
        httpStatus: 200,
        headers: { "content-type": "application/json" },
        body: '{"status":"ok"}',
      };
      const expectations: ValidationExpectations = {
        expectedStatus: [200, 201],
      };

      const result = validateResponse(target, expectations);
      assert.equal(result.isValid, true);
      assert.equal(result.failures.length, 0);
    });

    it("should fail when status is not in expected list", () => {
      const target: ValidationTarget = {
        httpStatus: 500,
        headers: {},
        body: "Internal Server Error",
      };
      const expectations: ValidationExpectations = {
        expectedStatus: [200, 204],
      };

      const result = validateResponse(target, expectations);
      assert.equal(result.isValid, false);
      assert.match(result.failures[0], /HTTP status 500 is not in expected list/);
    });
  });

  describe("Header Rules Validation", () => {
    const target: ValidationTarget = {
      httpStatus: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "x-custom-api": "v2.5-prod",
      },
      body: "{}",
    };

    it("should validate header CONTAINS (case-insensitive)", () => {
      const result = validateResponse(target, {
        expectedStatus: [200],
        headerRules: [
          { header: "content-type", operator: "CONTAINS", value: "application/json" },
        ],
      });
      assert.equal(result.isValid, true);
    });

    it("should validate header EQUALS", () => {
      const result = validateResponse(target, {
        expectedStatus: [200],
        headerRules: [
          { header: "x-custom-api", operator: "EQUALS", value: "v2.5-prod" },
        ],
      });
      assert.equal(result.isValid, true);
    });

    it("should fail header NOT_CONTAINS when forbidden value is present", () => {
      const result = validateResponse(target, {
        expectedStatus: [200],
        headerRules: [
          { header: "content-type", operator: "NOT_CONTAINS", value: "json" },
        ],
      });
      assert.equal(result.isValid, false);
      assert.match(result.failures[0], /unexpectedly contains "json"/);
    });

    it("should validate header EXISTS", () => {
      const result = validateResponse(target, {
        expectedStatus: [200],
        headerRules: [
          { header: "x-custom-api", operator: "EXISTS" },
        ],
      });
      assert.equal(result.isValid, true);

      const missingResult = validateResponse(target, {
        expectedStatus: [200],
        headerRules: [
          { header: "x-missing-header", operator: "EXISTS" },
        ],
      });
      assert.equal(missingResult.isValid, false);
    });
  });

  describe("Body Rules Validation", () => {
    const jsonBody = JSON.stringify({
      code: 200,
      message: "Success",
      data: {
        orderId: "ord-98712",
        itemsCount: 3,
        isSettled: true,
      },
    });

    it("should validate CONTAINS_TEXT and NOT_CONTAINS_TEXT", () => {
      const valid = validateResponse(
        { httpStatus: 200, headers: {}, body: jsonBody },
        {
          expectedStatus: [200],
          bodyRules: [
            { type: "CONTAINS_TEXT", value: "ord-98712" },
            { type: "NOT_CONTAINS_TEXT", value: "FATAL_ERROR" },
          ],
        }
      );
      assert.equal(valid.isValid, true);
    });

    it("should validate BODY_REGEX pattern matching", () => {
      const valid = validateResponse(
        { httpStatus: 200, headers: {}, body: jsonBody },
        {
          expectedStatus: [200],
          bodyRules: [{ type: "BODY_REGEX", value: "ord-\\d+" }],
        }
      );
      assert.equal(valid.isValid, true);
    });

    it("should validate JSON_PROPERTY_EXISTS and JSON_PROPERTY_EQUALS", () => {
      const valid = validateResponse(
        { httpStatus: 200, headers: {}, body: jsonBody },
        {
          expectedStatus: [200],
          bodyRules: [
            { type: "JSON_PROPERTY_EXISTS", path: "data.orderId" },
            { type: "JSON_PROPERTY_EQUALS", path: "data.itemsCount", value: "3" },
            { type: "JSON_PROPERTY_EQUALS", path: "message", value: "Success" },
          ],
        }
      );
      assert.equal(valid.isValid, true);
    });

    it("should fail when JSON property equals does not match", () => {
      const invalid = validateResponse(
        { httpStatus: 200, headers: {}, body: jsonBody },
        {
          expectedStatus: [200],
          bodyRules: [
            { type: "JSON_PROPERTY_EQUALS", path: "message", value: "Failed" },
          ],
        }
      );
      assert.equal(invalid.isValid, false);
      assert.match(invalid.failures[0], /equals "Success", expected "Failed"/);
    });
  });
});
