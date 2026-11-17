export interface HeaderRule {
  header: string;
  operator: "CONTAINS" | "EQUALS" | "NOT_CONTAINS" | "EXISTS";
  value?: string;
}

export interface BodyRule {
  type:
    | "JSON_PROPERTY_EQUALS"
    | "BODY_CONTAINS"
    | "BODY_REGEX"
    | "CONTAINS_TEXT"
    | "NOT_CONTAINS_TEXT"
    | "JSON_PROPERTY_EXISTS";
  path?: string;
  value?: string;
}

export interface ValidationTarget {
  httpStatus: number;
  headers: Record<string, string>;
  body: string;
}

export interface ValidationExpectations {
  expectedStatus: number[];
  headerRules?: HeaderRule[] | null;
  bodyRules?: BodyRule[] | null;
}

export interface ValidationOutcome {
  isValid: boolean;
  failures: string[];
  summary: string;
}

/**
 * Resolves a nested property in a JSON object using dot notation (e.g. "data.user.id")
 */
export function getNestedProperty(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== "object" || !path) {
    return undefined;
  }

  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

/**
 * Evaluates HTTP status code, header rules, and body rules against actual response data.
 */
export function validateResponse(
  target: ValidationTarget,
  expectations: ValidationExpectations
): ValidationOutcome {
  const failures: string[] = [];

  // 1. HTTP Status Code validation
  if (
    expectations.expectedStatus.length > 0 &&
    !expectations.expectedStatus.includes(target.httpStatus)
  ) {
    failures.push(
      `HTTP status ${target.httpStatus} is not in expected list [${expectations.expectedStatus.join(
        ", "
      )}]`
    );
  }

  // 2. Header rules evaluation
  if (expectations.headerRules && expectations.headerRules.length > 0) {
    for (const rule of expectations.headerRules) {
      const headerKey = rule.header.toLowerCase().trim();
      const actualValue = target.headers[headerKey];

      switch (rule.operator) {
        case "EXISTS":
          if (actualValue === undefined) {
            failures.push(`Expected header "${rule.header}" to exist in response`);
          }
          break;

        case "EQUALS":
          if (actualValue === undefined) {
            failures.push(`Expected header "${rule.header}" to equal "${rule.value}", but header was missing`);
          } else if (actualValue !== rule.value) {
            failures.push(
              `Header "${rule.header}" value "${actualValue}" does not equal expected "${rule.value}"`
            );
          }
          break;

        case "CONTAINS":
          if (actualValue === undefined) {
            failures.push(`Expected header "${rule.header}" to contain "${rule.value}", but header was missing`);
          } else if (rule.value && !actualValue.toLowerCase().includes(rule.value.toLowerCase())) {
            failures.push(
              `Header "${rule.header}" value "${actualValue}" does not contain "${rule.value}"`
            );
          }
          break;

        case "NOT_CONTAINS":
          if (
            actualValue !== undefined &&
            rule.value &&
            actualValue.toLowerCase().includes(rule.value.toLowerCase())
          ) {
            failures.push(
              `Header "${rule.header}" value "${actualValue}" unexpectedly contains "${rule.value}"`
            );
          }
          break;
      }
    }
  }

  // 3. Body rules evaluation
  if (expectations.bodyRules && expectations.bodyRules.length > 0) {
    let parsedJson: unknown = null;
    let jsonParsedAttempted = false;

    const tryParseJson = () => {
      if (!jsonParsedAttempted) {
        jsonParsedAttempted = true;
        try {
          parsedJson = JSON.parse(target.body);
        } catch {
          parsedJson = null;
        }
      }
      return parsedJson;
    };

    for (const rule of expectations.bodyRules) {
      const expectedVal = rule.value ?? "";

      switch (rule.type) {
        case "BODY_CONTAINS":
        case "CONTAINS_TEXT":
          if (!target.body.includes(expectedVal)) {
            failures.push(`Response body does not contain expected text: "${expectedVal}"`);
          }
          break;

        case "NOT_CONTAINS_TEXT":
          if (target.body.includes(expectedVal)) {
            failures.push(`Response body unexpectedly contains forbidden text: "${expectedVal}"`);
          }
          break;

        case "BODY_REGEX":
          try {
            const regex = new RegExp(expectedVal);
            if (!regex.test(target.body)) {
              failures.push(`Response body does not match regular expression: /${expectedVal}/`);
            }
          } catch (e) {
            failures.push(`Invalid regular expression rule: /${expectedVal}/ (${String(e)})`);
          }
          break;

        case "JSON_PROPERTY_EXISTS": {
          const json = tryParseJson();
          if (json === null) {
            failures.push("Response body is not valid JSON, cannot evaluate JSON_PROPERTY_EXISTS");
          } else if (rule.path) {
            const propertyVal = getNestedProperty(json, rule.path);
            if (propertyVal === undefined) {
              failures.push(`JSON property path "${rule.path}" does not exist in response`);
            }
          }
          break;
        }

        case "JSON_PROPERTY_EQUALS": {
          const json = tryParseJson();
          if (json === null) {
            failures.push("Response body is not valid JSON, cannot evaluate JSON_PROPERTY_EQUALS");
          } else if (rule.path) {
            const propertyVal = getNestedProperty(json, rule.path);
            if (propertyVal === undefined) {
              failures.push(`JSON property path "${rule.path}" not found`);
            } else if (String(propertyVal) !== expectedVal) {
              failures.push(
                `JSON property at "${rule.path}" equals "${String(propertyVal)}", expected "${expectedVal}"`
              );
            }
          }
          break;
        }
      }
    }
  }

  const isValid = failures.length === 0;
  const summary = isValid
    ? "All validations passed"
    : `Validation failed: ${failures.join("; ")}`;

  return {
    isValid,
    failures,
    summary,
  };
}
