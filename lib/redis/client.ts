import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client if credentials exist in .env.local
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const isRedisConfigured = Boolean(url && token && url.startsWith('http'));

export const redis = isRedisConfigured
  ? new Redis({
      url: url!,
      token: token!,
    })
  : null;

/**
 * Get item from Redis cache with safety check
 */
export async function getRedisCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const data = await redis.get<T>(key);
    return data;
  } catch (error) {
    console.warn(`[Redis Cache GET Error] Key: ${key}`, error);
    return null;
  }
}

/**
 * Set item in Redis cache with TTL in seconds
 */
export async function setRedisCache<T>(key: string, data: T, ttlSeconds: number = 60): Promise<boolean> {
  if (!redis) return false;
  try {
    await redis.set(key, data, { ex: ttlSeconds });
    return true;
  } catch (error) {
    console.warn(`[Redis Cache SET Error] Key: ${key}`, error);
    return false;
  }
}

/**
 * Delete item or pattern from Redis cache
 */
export async function deleteRedisCache(key: string): Promise<boolean> {
  if (!redis) return false;
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.warn(`[Redis Cache DEL Error] Key: ${key}`, error);
    return false;
  }
}
