import Redis, { RedisOptions } from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy(times) {
    // Retry with exponential backoff up to 10s, but don't spam if Redis isn't running
    if (times > 5) {
      return 10000;
    }
    return Math.min(times * 1000, 3000);
  },
};

const globalForRedis = globalThis as unknown as {
  redisClient: Redis | undefined;
};

export function getRedisClient(): Redis {
  if (globalForRedis.redisClient) {
    return globalForRedis.redisClient;
  }

  const client = new Redis(REDIS_URL, redisOptions);

  client.on("error", (err) => {
    // Log gracefully so offline Redis doesn't crash the server process
    if (process.env.NODE_ENV !== "test") {
      console.warn("[Redis Connection Warning]", err.message);
    }
  });

  if (process.env.NODE_ENV !== "production") {
    globalForRedis.redisClient = client;
  }

  return client;
}

export const redis = getRedisClient();

export function createRedisConnection(): Redis {
  const client = new Redis(REDIS_URL, redisOptions);
  client.on("error", (err) => {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[Redis Worker Connection Warning]", err.message);
    }
  });
  return client;
}
