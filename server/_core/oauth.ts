import type { Express, Request, Response } from "express";
import * as db from "../db.js";
import { getSessionCookieOptions } from "./cookies.js";
import { sdk } from "./sdk.js";

export function registerOAuthRoutes(app: Express) {
  app.get("/oauth/callback", async (req: Request, res: Response) => {
    try {
      const { code } = req.query;

      if (!code || typeof code !== "string") {
        return res.status(400).json({ error: "Missing code" });
      }

      const oauthServer = process.env.OAUTH_SERVER_URL;

      if (!oauthServer) {
        return res.status(500).json({
          error: "OAUTH_SERVER_URL is not defined",
        });
      }

      const response = await fetch(
        `${oauthServer}/token?code=${encodeURIComponent(code)}`
      );

      if (!response.ok) {
        const text = await response.text();
        return res.status(500).json({
          error: "OAuth server request failed",
          details: text,
        });
      }

      const data = await response.json();
      const { openId } = data ?? {};

      if (!openId) {
        return res.status(400).json({ error: "Invalid OAuth response" });
      }

      const user = await db.upsertUser({ openId });

      return res.json({
        success: true,
        user,
      });
    } catch (error) {
      console.error("OAuth callback error:", error);

      return res.status(500).json({
        error: "OAuth callback failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
}
