// API configuration for Juni Boli Talk
// When running as web app (dev/Vercel): uses relative paths ("/api/chat")
// When running as APK (Capacitor): needs full URL to deployed server

// Change this to your deployed Vercel URL after deploying
// Example: "https://juni-boli-talk.vercel.app"
const API_BASE_URL = "";

export function getApiUrl(endpoint: string): string {
  // If running in Capacitor (APK), use full URL
  if (typeof window !== "undefined") {
    // Check if running as Capacitor app (file:// protocol)
    if (window.location.protocol === "file:" || window.location.protocol === "https:") {
      if (API_BASE_URL) {
        return `${API_BASE_URL}${endpoint}`;
      }
    }
  }
  // Default: relative path (works for dev and Vercel)
  return endpoint;
}
