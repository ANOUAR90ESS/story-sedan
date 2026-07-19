import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import "dotenv/config";
import crypto from "crypto";
// import admin from "firebase-admin"; // We can add firebase admin later if needed to update db

const app = express();
const PORT = 3000;

// HeyGen uses raw body for signature verification, so we might need raw body parser for the webhook endpoint
// But let's use express.json() first
app.use("/api/webhooks/heygen", express.json({
  verify: (req, res, buf) => {
    (req as any).rawBody = buf;
  }
}));

// API routes FIRST
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/webhooks/heygen", async (req, res) => {
  try {
    const signature = req.headers["x-heygen-signature"] as string;
    // You can verify signature if you want, the secret is "whsec_uzMbjmw91tz6StAhVnQM2Q=="
    // But for now let's just log and process the event
    
    console.log("Received HeyGen webhook:", req.body);
    const event = req.body;

    if (event && event.event_type === "video_translate.success") {
      console.log("Translation success. Task ID:", event.task_id);
      console.log("Video URL:", event.data?.url || event.data?.video_url || event.url);
      
      // Update database if needed, we'll need firebase-admin
    } else if (event && event.event_type === "video_translate.fail") {
      console.error("Translation failed. Task ID:", event.task_id);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use(express.json());

  app.post("/api/translate-video", async (req, res) => {
    try {
      const { videoUrl, outputLanguages } = req.body;
      if (!videoUrl || !outputLanguages) {
        return res.status(400).json({ error: "Missing videoUrl or outputLanguages" });
      }

      const apiKey = process.env.HEYGEN_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "HeyGen API Key is not configured" });
      }

      const response = await fetch("https://api.heygen.com/v3/video-translations", {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          video: { type: "url", url: videoUrl },
          output_languages: outputLanguages
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: "HeyGen API error", details: errorText });
      }

      const data = await response.json();
      return res.json(data);
    } catch (error) {
      console.error("Translate video error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/heygen-generate-video", async (req, res) => {
    try {
      const payload = req.body;
      const apiKey = process.env.HEYGEN_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "HeyGen API Key is not configured" });
      }

      const response = await fetch("https://api.heygen.com/v2/video/generate", {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: "HeyGen API error", details: errorText });
      }

      const data = await response.json();
      return res.json(data);
    } catch (error) {
      console.error("HeyGen generation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  app.get("/api/heygen-video-status/:taskId", async (req, res) => {
    try {
      const apiKey = process.env.HEYGEN_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "HeyGen API Key is not configured" });
      }

      const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${req.params.taskId}`, {
        headers: {
          "X-Api-Key": apiKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: "HeyGen API error", details: errorText });
      }

      const data = await response.json();
      return res.json(data);
    } catch (error) {
      console.error("HeyGen status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/heygen-avatars", async (req, res) => {
    try {
      const apiKey = process.env.HEYGEN_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "HeyGen API Key is not configured" });
      }

      const response = await fetch("https://api.heygen.com/v2/avatars", {
        headers: { "X-Api-Key": apiKey }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: "HeyGen API error", details: errorText });
      }

      const data = await response.json();
      return res.json(data);
    } catch (error) {
      console.error("HeyGen avatars error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/heygen-voices", async (req, res) => {
    try {
      const apiKey = process.env.HEYGEN_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "HeyGen API Key is not configured" });
      }

      const response = await fetch("https://api.heygen.com/v2/voices", {
        headers: { "X-Api-Key": apiKey }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: "HeyGen API error", details: errorText });
      }

      const data = await response.json();
      return res.json(data);
    } catch (error) {
      console.error("HeyGen voices error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
