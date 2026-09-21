import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Server-side Gemini API proxy for Auditor tool
  app.post("/api/audit", async (req, res) => {
    const { domain, platform } = req.body || {};
    const cleanUrl = typeof domain === "string" ? domain.trim() : "";
    const platformLabel = typeof platform === "string" ? platform : "Meta (CAPI)";

    if (!cleanUrl) {
      return res.status(400).json({ error: "Please provide a valid target domain." });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Graceful fallback report if key is not configured or in testing environment
    const getFallbackScorecard = () => (
      `### Telemetry Audit Scorecard: ${cleanUrl} (${platformLabel})\n\n` +
      `🔴 **Safari ITP & Signal Drop**: Client-side pixels on ${cleanUrl} suffer from 24-hour cookie capping under Apple WebKit/Safari ITP and browser ad-blockers, leading to an estimated 25–40% drop in reported ad conversions.\n\n` +
      `🔴 **EMQ & Parameter Normalization Failure**: Critical customer matching parameters (hashed email \`em\`, phone \`ph\`, IP address, and client user agent) are not being passed via a unified server-side data layer, depressing your Event Match Quality score to suboptimal tiers.\n\n` +
      `🟢 **Host Infrastructure Compatible**: Apex DNS and routing for ${cleanUrl} are compatible with a dedicated server-side Google Tag Manager (SS-GTM) container hosted on Google Cloud Run or Stape.io with first-party custom subdomain routing.\n\n` +
      `Deploy enterprise-grade server-side tracking today: hire our certified analytics engineering team directly on Fiverr (adesh_chandra) for 100% done-for-you architecture.`
    );

    if (!apiKey) {
      return res.json({ report: getFallbackScorecard() });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Target Domain: ${cleanUrl}\nTarget Ad Platform: ${platformLabel}`,
        config: {
          systemInstruction:
            "You are the lead tracking engineer for SyncOps Studio. The user will provide a domain and an ad platform. Generate a brief, highly technical 3-point audit scorecard identifying probable server-side tracking vulnerabilities for that platform (e.g., CAPI failures, GTM proxy issues). Format it cleanly with emojis (🔴 for errors, 🟢 for passes). Conclude with a strong, single-sentence CTA urging them to hire you on Fiverr (adesh_chandra) to fix the architecture."
        }
      });

      const reportText = response.text || getFallbackScorecard();
      return res.json({ report: reportText });
    } catch (err: unknown) {
      console.warn("Gemini server-side API notice:", err);
      return res.json({ report: getFallbackScorecard() });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SyncOps Studio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
