import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export class RedisClient {
  static async set(key: string, value: string) {
    await redis.set(key, value);
  }

  static async get(key: string) {
    return await redis.get(key);
  }

  async del(key: string) {
    await redis.del(key);
  }
}
