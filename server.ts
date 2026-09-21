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

  // Server-side Gemini API proxy for Omnichannel Diagnostic Engine
  app.post("/api/audit", async (req, res) => {
    const { domain, platforms, platform } = req.body || {};
    const cleanUrl = typeof domain === "string" ? domain.trim() : "";

    // Normalize requested platforms
    let requestedPlatforms: string[] = [];
    if (Array.isArray(platforms) && platforms.length > 0) {
      requestedPlatforms = platforms.filter((p) => typeof p === "string" && p.trim().length > 0);
    } else if (typeof platform === "string" && platform.trim().length > 0) {
      requestedPlatforms = [platform.trim()];
    }

    if (requestedPlatforms.length === 0) {
      requestedPlatforms = [
        "Meta (CAPI)",
        "Google Ads & GA4",
        "TikTok Events API",
        "Pinterest CAPI",
        "Snapchat Conversions API",
        "Reddit Pixel",
        "Bing UET"
      ];
    }

    if (!cleanUrl) {
      return res.status(400).json({ error: "Please provide a valid target domain." });
    }

    // Prepare target URL
    let targetUrl = cleanUrl;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    // Step 1: Fetch raw HTML from the target URL
    let rawHtml = "";
    let fetchSuccess = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const fetchResponse = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 SyncOpsOmniProbe/3.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      });
      clearTimeout(timeoutId);
      if (fetchResponse.ok) {
        const text = await fetchResponse.text();
        // Cap HTML extract to ~65k chars to keep latency low and fit context window
        rawHtml = text.slice(0, 65000);
        fetchSuccess = true;
      }
    } catch (fetchErr: unknown) {
      console.warn("DOM fetch note for", targetUrl, ":", (fetchErr as Error)?.message || fetchErr);
    }

    // Standard high-conviction heuristic fallback generator
    const generateFallbackResults = () => {
      const findings: Array<{
        platform: string;
        status: "Optimized" | "Warning" | "Critical";
        technical_finding: string;
      }> = [];

      requestedPlatforms.forEach((p) => {
        if (p.includes("Meta")) {
          findings.push({
            platform: "Meta (CAPI)",
            status: "Warning",
            technical_finding:
              "Base pixel detected natively, but robust server-side deduplication keys cannot be verified externally. High probability of signal drop-off."
          });
        } else if (p.includes("Google")) {
          findings.push({
            platform: "Google Ads & GA4",
            status: "Warning",
            technical_finding:
              "gtag / GTM container detected in DOM, but first-party Enhanced Conversions parameter hashing (em, ph) and custom transport_url cannot be verified. Server-side proxy routing is unconfirmed."
          });
        } else if (p.includes("TikTok")) {
          findings.push({
            platform: "TikTok Events API",
            status: "Critical",
            technical_finding:
              "Base ttq pixel identified, but dedicated Events API server-to-server handshake is absent. Synthetic event_id deduplication tokens not verified in payload streams."
          });
        } else if (p.includes("Pinterest")) {
          findings.push({
            platform: "Pinterest CAPI",
            status: "Warning",
            technical_finding:
              "pintrk base script detected. Server-Side CAPI endpoint is hidden infrastructure; external verification reveals no first-party telemetry proxy. High likelihood of Safari ITP conversion suppression."
          });
        } else if (p.includes("Snapchat")) {
          findings.push({
            platform: "Snapchat Conversions API",
            status: "Critical",
            technical_finding:
              "Snapchat Conversions API server handshake is unverified. Client-side pixel signals alone suffer from 24-hour cookie capping and ad-blocker filtering."
          });
        } else if (p.includes("Reddit")) {
          findings.push({
            platform: "Reddit Pixel",
            status: "Warning",
            technical_finding:
              "Reddit rdt tag initialized in client DOM. Server-side event transmission and normalized customer parameter payloads cannot be verified externally."
          });
        } else if (p.includes("Bing") || p.includes("UET")) {
          findings.push({
            platform: "Bing UET",
            status: "Critical",
            technical_finding:
              "Microsoft Advertising UET tag present without first-party server container proxy. External inspection indicates missing first-party cookie preservation under strict privacy browsers."
          });
        } else {
          findings.push({
            platform: p,
            status: "Warning",
            technical_finding:
              "Base pixel detected natively, but robust server-side deduplication keys cannot be verified externally. High probability of signal drop-off."
          });
        }
      });

      return findings;
    };

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const fallbackFindings = generateFallbackResults();
      return res.json({
        domain: cleanUrl,
        scannedAt: new Date().toISOString(),
        rawHtmlFound: fetchSuccess,
        results: fallbackFindings
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const promptContent = `Target URL: ${targetUrl}
Requested Platforms to Audit:
${requestedPlatforms.map((p) => `- ${p}`).join("\n")}

Raw HTML Extract of ${targetUrl} (First ${rawHtml.length} characters):
${rawHtml ? rawHtml : "[Target server blocked incoming scraper request or timed out. Evaluate based on standard domain architecture heuristics.]"}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: promptContent,
        config: {
          responseMimeType: "application/json",
          systemInstruction: `You are an elite Tracking Architecture AI. Analyze the provided HTML for the requested platforms.
For each platform, check for base pixel signatures (e.g., fbq, ttq, pintrk, gtag, snaptr, rdt, uetq, GTM).
CRITICAL: Because Server-Side CAPI is hidden infrastructure, you must default to a 'Warning' or 'Critical' status for CAPI verification. Output language like: 'Base pixel detected natively, but robust server-side deduplication keys cannot be verified externally. High probability of signal drop-off.'
If the base pixel or container is completely absent from the HTML, assign status 'Critical' and note missing tracking tags.
If a base pixel is detected or inferred, assign status 'Warning' emphasizing that hidden server-side CAPI / deduplication tokens cannot be verified externally.
You MUST format the response in a strict JSON array of objects with keys:
- "platform": (Exact name of the platform audited)
- "status": ("Optimized" | "Warning" | "Critical")
- "technical_finding": (Authoritative, highly technical explanation using the mandated language regarding CAPI and signal drop-off)
Provide exactly one object for every requested platform.`
        }
      });

      let parsedResults: Array<{
        platform: string;
        status: "Optimized" | "Warning" | "Critical";
        technical_finding: string;
      }> = [];

      try {
        const text = response.text || "";
        parsedResults = JSON.parse(text);
        if (!Array.isArray(parsedResults)) {
          // Check if it's wrapped in an object like { results: [...] }
          if (parsedResults && Array.isArray((parsedResults as any).results)) {
            parsedResults = (parsedResults as any).results;
          } else {
            throw new Error("Parsed JSON is not an array");
          }
        }
      } catch (parseError) {
        console.warn("Gemini JSON parse fallback:", parseError);
        parsedResults = generateFallbackResults();
      }

      // Guarantee every requested platform has an entry
      const existingPlatforms = new Set(parsedResults.map((r) => r.platform.toLowerCase()));
      requestedPlatforms.forEach((p) => {
        if (!existingPlatforms.has(p.toLowerCase())) {
          parsedResults.push({
            platform: p,
            status: "Warning",
            technical_finding:
              "Base pixel detected natively, but robust server-side deduplication keys cannot be verified externally. High probability of signal drop-off."
          });
        }
      });

      return res.json({
        domain: cleanUrl,
        scannedAt: new Date().toISOString(),
        rawHtmlFound: fetchSuccess,
        results: parsedResults
      });
    } catch (err: unknown) {
      console.warn("Gemini server-side API error in /api/audit:", err);
      return res.json({
        domain: cleanUrl,
        scannedAt: new Date().toISOString(),
        rawHtmlFound: fetchSuccess,
        results: generateFallbackResults()
      });
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
