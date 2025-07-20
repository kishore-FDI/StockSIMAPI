import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  username: process.env.REDIS_USERNAME || undefined, // if using Redis Cloud
  password: process.env.REDIS_PASSWORD || undefined, // if needed
  db: 0, // default DB
  tls: process.env.REDIS_TLS === "true" ? {} : undefined, // Redis Cloud (optional)
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

export { redis };
