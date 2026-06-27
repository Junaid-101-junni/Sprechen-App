// API configuration for Juni Boli Talk
// Uses Vercel deployment for AI features

const API_BASE_URL = "https://sprechen-app.vercel.app";

export function getApiUrl(endpoint: string): string {
  if (typeof window !== "undefined") {
    // Dev server: localhost:3000
    if (window.location.hostname === "localhost" && window.location.port === "3000") {
      return endpoint;
    }
    // Vercel deployment
    if (window.location.hostname.includes("vercel.app")) {
      return endpoint;
    }
    // Sandbox preview URL
    if (window.location.hostname.includes("space-z.ai")) {
      return endpoint;
    }
  }
  // Everything else (APK/Capacitor) → use Vercel URL
  return `${API_BASE_URL}${endpoint}`;
}
