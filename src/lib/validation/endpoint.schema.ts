import { z } from "zod";

export const httpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"] as const;

export const headerItemSchema = z.object({
  key: z.string().trim(),
  value: z.string().trim(),
});

export const headerRuleSchema = z.object({
  header: z.string().min(1, "Header name is required"),
  operator: z.enum(["CONTAINS", "EQUALS", "NOT_CONTAINS"]),
  value: z.string().min(1, "Expected value is required"),
});

export const bodyRuleSchema = z.object({
  type: z.enum(["JSON_PROPERTY_EQUALS", "BODY_CONTAINS", "BODY_REGEX"]),
  path: z.string().optional(),
  value: z.string().min(1, "Assertion value is required"),
});

export const endpointFormSchema = z.object({
  name: z
    .string()
    .min(2, "Monitor name must be at least 2 characters")
    .max(100, "Monitor name cannot exceed 100 characters"),
  url: z
    .string()
    .url("Please enter a valid HTTP/HTTPS URL")
    .refine(
      (val) => val.startsWith("http://") || val.startsWith("https://"),
      "URL must begin with http:// or https://"
    ),
  method: z.enum(httpMethods, {
    error: "Select a valid HTTP method",
  }),
  intervalSeconds: z
    .number()
    .min(60, "Minimum interval is 60 seconds (1 minute)")
    .max(86400, "Maximum interval is 86400 seconds (24 hours)"),
  timeoutMs: z
    .number()
    .min(1000, "Minimum timeout is 1,000ms (1s)")
    .max(30000, "Maximum timeout is 30,000ms (30s)"),
  expectedStatus: z
    .string()
    .min(1, "Specify at least one expected status code (e.g. 200, 201)")
    .refine((val) => {
      const parts = val.split(",").map((s) => s.trim());
      return parts.every((p) => {
        const num = Number(p);
        return !isNaN(num) && num >= 100 && num <= 599;
      });
    }, "Expected status must be comma-separated HTTP status codes between 100 and 599 (e.g. '200, 201')"),
  headers: z.array(headerItemSchema),
  body: z.string().optional(),
  headerRules: z.array(headerRuleSchema),
  bodyRules: z.array(bodyRuleSchema),
});

export type EndpointFormValues = z.infer<typeof endpointFormSchema>;
