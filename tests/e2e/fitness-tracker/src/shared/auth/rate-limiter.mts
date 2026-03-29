import type { IAuthConfig } from "./interfaces/i-auth-config.mjs";

/**
 * In-memory sliding window rate limiter.
 * Tracks request timestamps per IP and per user in Maps.
 * A cleanup interval removes stale entries every 60 seconds.
 */
export class RateLimiter {

  readonly #ipWindows: Map<string, number[]> = new Map();

  readonly #userWindows: Map<string, number[]> = new Map();

  readonly #config: IAuthConfig;

  readonly #cleanupInterval: ReturnType<typeof setInterval>;

  readonly #windowMs = 60_000;

  public constructor(config: IAuthConfig) {
    this.#config = config;
    this.#cleanupInterval = setInterval(() => this.#cleanup(), this.#windowMs);
  }

  public checkIp(ip: string): boolean {
    return this.#check(this.#ipWindows, ip, this.#config.rateLimitIpPerMin);
  }

  public checkUser(userId: string): boolean {
    return this.#check(this.#userWindows, userId, this.#config.rateLimitUserPerMin);
  }

  public destroy(): void {
    clearInterval(this.#cleanupInterval);
  }

  #check(windows: Map<string, number[]>, key: string, limit: number): boolean {
    const now = Date.now();
    const cutoff = now - this.#windowMs;
    const timestamps = (windows.get(key) ?? []).filter((t) => t > cutoff);
    timestamps.push(now);
    windows.set(key, timestamps);
    return timestamps.length <= limit;
  }

  #cleanup(): void {
    const cutoff = Date.now() - this.#windowMs;
    for (const [key, timestamps] of this.#ipWindows) {
      const filtered = timestamps.filter((t) => t > cutoff);
      if (filtered.length === 0) {
        this.#ipWindows.delete(key);
      } else {
        this.#ipWindows.set(key, filtered);
      }
    }
    for (const [key, timestamps] of this.#userWindows) {
      const filtered = timestamps.filter((t) => t > cutoff);
      if (filtered.length === 0) {
        this.#userWindows.delete(key);
      } else {
        this.#userWindows.set(key, filtered);
      }
    }
  }
}
