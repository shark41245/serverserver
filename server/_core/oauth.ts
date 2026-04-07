import type { Express, Request, Response } from "express";
import * as db from "../db";

export function registerOAuthRoutes(app: Express) {
  // ✅ OAuth callback (Vercel 기준 경로 수정)
  app.get("/oauth/callback", async (req: Request, res: Response) => {
    try {
      const { code } = req.query;

      if (!code || typeof code !== "string") {
        return res.status(400).json({ error: "Missing code" });
      }

      // 🔥 여기 실제 OAuth 서버 요청 (예시)
      // 필요하면 네 OAuth 서버 URL로 수정
      const oauthServer = process.env.OAUTH_SERVER_URL;

      if (!oauthServer) {
        throw new Error("OAUTH_SERVER_URL is not defined");
      }

      const response = await fetch(`${oauthServer}/token?code=${code}`);
      const data = await response.json();

      const { openId } = data;

      if (!openId) {
        return res.status(400).json({ error: "Invalid OAuth response" });
      }

      // ✅ 유저 생성 or 업데이트
      const user = await db.upsertUser({
        openId,
      });

      // 👉 필요하면 JWT 발급
      // (지금은 간단히 user 반환)
      return res.json({
        success: true,
        user,
      });
    } catch (error: any) {
      console.error("OAuth callback error:", error);

      return res.status(500).json({
        error: "OAuth callback failed",
        message: error.message,
      });
    }
  });
}
