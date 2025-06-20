import { serve } from "@hono/node-server";
import app from "./app";

const port = process.env.PORT || 8000;

serve({
  fetch: app.fetch,
  port: Number(port),
});

console.log(`Server running locally at http://localhost:${port}`);
