import { NextRequest } from "next/server";
import { getTokenFromRequest, getTokenRemainingSeconds } from "@/app/lib/auth";
import { blacklistToken } from "@/app/lib/redis";
import { ok } from "@/app/lib/response";

/**
 * POST /api/auth/logout
 * 将 token 加入黑名单（内存 Map 模拟 Redis），使其立即失效
 */
export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (token) {
    // 按 token 剩余有效时间加入黑名单
    await blacklistToken(token, getTokenRemainingSeconds(token));
  }
  return ok(null, "退出登录成功");
}
