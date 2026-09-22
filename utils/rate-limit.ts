import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Upstash-e banaano Redis-er sathe connection.
// Env var na thakle limiter undefined thake — tokhon site
// cholbe thik-i, shudhu limit off thakbe (jate kokhono
// puro site bhang na hoy)
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : undefined;

// Login/signup page: protti IP 1 minute-e max 10 bar
export const authPagesLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      prefix: "sau-alumni:auth-pages",
    })
  : undefined;

// API mutation routes (/api/admin, /api/notices, /api/delete-image): protti IP 1 minute-e max 30 bar
export const apiMutationLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "sau-alumni:api-mutations",
    })
  : undefined;