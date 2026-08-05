import { PrismaClient } from '@prisma/client'

// 全局单例，避免开发模式热重载时创建多个数据库连接
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
