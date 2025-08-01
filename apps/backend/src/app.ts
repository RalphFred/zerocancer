import { Hono } from "hono";
import { env } from "hono/adapter";
import { cors } from "hono/cors";
import { getRouterName, showRoutes } from "hono/dev"; // import { serveStatic } from "@hono/node-server/serve-static";
import { logger } from "hono/logger";
import { adminApp } from "./api/admin";
import analyticsApp from "./api/analytics";
import { appointmentApp } from "./api/appointments";
import { authApp } from "./api/auth";
import { centerApp } from "./api/center";
import { donationApp } from "./api/donation";
import { notificationApp } from "./api/notification";
import { payoutsApp } from "./api/payouts";
// import receiptApp from "./api/receipts";
import { registerApp } from "./api/registration";
import { screeningTypesApp } from "./api/screening-types";
import { waitlistApp } from "./api/waitlist";
import { TEnvs } from "./lib/types";
import { displayEnvVars } from "./lib/utils";

// Create the main app (no basePath for root)
const app = new Hono();

// Create API app (no basePath since we'll mount it at /api/v1)
const apiApp = new Hono();

app.use(logger());

// Enable CORS for all routes
app.use("*", async (c, next) => {
  const { FRONTEND_URL } = env<TEnvs>(c);

  const corsMiddlewareHandler = cors({
    origin: [FRONTEND_URL],
    credentials: true,
  });

  return corsMiddlewareHandler(c, next);
});

// ========================================
// API ROUTES
// ========================================

apiApp.get("/", (c) => c.text("Hello from Hono.js + Prisma + CORS!"));
apiApp.get("/healthz", (c) => c.json({ status: "ok" }));

// Debug endpoint to check environment variables
apiApp.get("/debug/env", (c) => {
  const envVars = displayEnvVars(c);

  return c.json({
    status: "ok",
    environment: envVars,
    timestamp: new Date().toISOString(),
  });
});

// ROUTES
apiApp.route("/auth", authApp);
apiApp.route("/register", registerApp);
apiApp.route("/center", centerApp);
apiApp.route("/appointment", appointmentApp);
apiApp.route("/screening-types", screeningTypesApp);
apiApp.route("/waitlist", waitlistApp);
apiApp.route("/donor", donationApp);
apiApp.route("/admin", adminApp);
apiApp.route("/analytics", analyticsApp);
apiApp.route("/notifications", notificationApp);
// apiApp.route("/receipts", receiptApp);
apiApp.route("/payouts", payoutsApp);

// Mount API app BEFORE static file serving
app.route("/api/v1", apiApp);

// ========================================
// FALLBACK HANDLERS FOR DEV MODE
// ========================================

// Development fallback - helpful message
app.get("*", async (c) => {
  const { ENV_MODE } = env<TEnvs>(c);

  if (ENV_MODE !== "production") {
    return c.html(`
      <html>
        <head><title>Zerocancer Backend</title></head>
        <body style="font-family: Arial, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto;">
          <h1>🏥 Zerocancer Backend</h1>
          <p><strong>Development Mode</strong></p>
          <p>The backend API is running. The frontend should be served separately in development.</p>
          <h2>🔗 Available Endpoints:</h2>
          <ul>
            <li><a href="/api/v1/healthz">/api/v1/healthz</a> - Health check</li>
            <li><a href="/api/v1">/api/v1</a> - API root</li>
          </ul>
          <h2>🚀 Frontend Development:</h2>
          <p>Run <code>pnpm dev</code> in the frontend directory to start the development server.</p>
          <p>The frontend will typically be available at <code>http://localhost:3000</code></p>
        </body>
      </html>
    `);
  }

  // Production fallback for unknown routes
  return c.json(
    {
      error: "Not Found",
      message: "The requested resource was not found.",
    },
    404
  );
});

export default app;
