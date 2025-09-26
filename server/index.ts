import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Get environment once and use consistently
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (!isProduction) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Default to 3000 for development, 5000 for production to avoid macOS conflicts
  // this serves both the API and the client.
  const defaultPort = isProduction ? '5000' : '3000';
  const port = parseInt(process.env.PORT || defaultPort, 10);
  // Some platforms (macOS, certain Node builds) may not support SO_REUSEPORT
  // and will throw ENOTSUP when reusePort: true is passed. Only enable on
  // Linux where it's commonly supported, and provide a fallback retry
  // without reusePort if we see ENOTSUP.
  const listenOptions: any = { port, host: "0.0.0.0" };
  if (process.platform === "linux") {
    listenOptions.reusePort = true;
  }

  // Attach an error handler to detect ENOTSUP and retry without reusePort.
  const onError = (err: any) => {
    if (err && err.code === 'ENOTSUP') {
      log(`listen reusePort unsupported, retrying without reusePort: ${err.message}`);
      try {
        server.listen({ port, host: "0.0.0.0" }, () => {
          log(`serving on port ${port} (fallback)`);
        });
      } catch (e) {
        // If retry also fails, rethrow the original error for visibility.
        throw err;
      }
    } else {
      throw err;
    }
  };

  server.once('error', onError);

  server.listen(listenOptions, () => {
    // remove our one-time error handler once listening succeeds
    server.removeListener('error', onError);
    log(`serving on port ${port}`);
  });
})();
