/**
 * 模拟 Redis 客户端
 *
 * 说明：暂不安装 ioredis，这里用内存 Map 模拟 Redis 的核心能力，
 * 所有方法只打印 console.log 并返回对应类型的空值/模拟值，保证项目不报错。
 * 后续接入真实 Redis 时，替换本文件实现即可。
 */

export interface MockRedis {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ...args: unknown[]): Promise<'OK'>
  del(key: string): Promise<number>
  incr(key: string): Promise<number>
  expire(key: string, seconds: number): Promise<number>
}

// 内存存储（key -> value）
const store = new Map<string, string>()

// 内存黑名单（key -> 过期时间戳，用于模拟 logout 的 token 黑名单）
const blacklist = new Map<string, number>()

export const redis: MockRedis = {
  async get(key) {
    console.log('[mock-redis] GET', key)
    return store.get(key) ?? null
  },
  async set(key, value, ...args) {
    console.log('[mock-redis] SET', key, value, ...args)
    store.set(key, value)
    return 'OK'
  },
  async del(key) {
    console.log('[mock-redis] DEL', key)
    store.delete(key)
    blacklist.delete(key)
    return 1
  },
  async incr(key) {
    console.log('[mock-redis] INCR', key)
    const next = Number.parseInt(store.get(key) ?? '0', 10) + 1
    store.set(key, String(next))
    return next
  },
  async expire(key, seconds) {
    console.log('[mock-redis] EXPIRE', key, seconds)
    return 1
  },
}

/**
 * 将 token 加入黑名单（模拟 Redis 黑名单，内存 Map 实现）
 * @param token JWT token
 * @param expiresInSeconds token 剩余有效秒数
 */
export async function blacklistToken(token: string, expiresInSeconds: number) {
  console.log('[mock-redis] BLACKLIST', token.slice(-20), expiresInSeconds)
  blacklist.set(token, Date.now() + expiresInSeconds * 1000)
}

/**
 * 判断 token 是否在黑名单中
 */
export async function isTokenBlacklisted(token: string) {
  const expireAt = blacklist.get(token)
  if (!expireAt) {
    return false
  }
  // 已过期则清理
  if (expireAt < Date.now()) {
    blacklist.delete(token)
    return false
  }
  return true
}

export default redis
