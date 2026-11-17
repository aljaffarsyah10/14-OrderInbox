/**
 * Structured Logger for OrderInbox
 * Provides consistent, structured logging across Next.js API Route Handlers,
 * domain services, and BullMQ background workers.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context?: string;
  message: string;
  data?: unknown;
  error?: {
    name?: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private defaultContext?: string;

  constructor(defaultContext?: string) {
    this.defaultContext = defaultContext;
  }

  private formatError(err: unknown) {
    if (err instanceof Error) {
      return {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      };
    }
    if (typeof err === "string") {
      return { message: err };
    }
    return { message: String(err) };
  }

  private log(level: LogLevel, message: string, context?: string, meta?: unknown) {
    const ctx = context || this.defaultContext;
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: ctx,
      message,
    };

    if (meta !== undefined) {
      if (level === "error" || (meta instanceof Error)) {
        entry.error = this.formatError(meta);
      } else {
        entry.data = meta;
      }
    }

    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction) {
      // In production, emit single-line structured JSON
      const jsonLine = JSON.stringify(entry);
      if (level === "error") {
        console.error(jsonLine);
      } else if (level === "warn") {
        console.warn(jsonLine);
      } else {
        console.log(jsonLine);
      }
    } else {
      // In development / test, emit human-readable format
      const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]${ctx ? ` [${ctx}]` : ""}`;
      if (level === "error") {
        if (entry.error?.stack) {
          console.error(`${prefix} ${message}`, entry.error.stack);
        } else if (meta !== undefined) {
          console.error(`${prefix} ${message}`, meta);
        } else {
          console.error(`${prefix} ${message}`);
        }
      } else if (level === "warn") {
        if (meta !== undefined) {
          console.warn(`${prefix} ${message}`, meta);
        } else {
          console.warn(`${prefix} ${message}`);
        }
      } else {
        if (meta !== undefined) {
          console.log(`${prefix} ${message}`, meta);
        } else {
          console.log(`${prefix} ${message}`);
        }
      }
    }
  }

  public debug(message: string, meta?: unknown, context?: string) {
    if (process.env.NODE_ENV !== "production") {
      this.log("debug", message, context, meta);
    }
  }

  public info(message: string, meta?: unknown, context?: string) {
    this.log("info", message, context, meta);
  }

  public warn(message: string, meta?: unknown, context?: string) {
    this.log("warn", message, context, meta);
  }

  public error(message: string, error?: unknown, context?: string) {
    this.log("error", message, context, error);
  }

  public child(context: string): Logger {
    return new Logger(context);
  }
}

export const logger = new Logger();
