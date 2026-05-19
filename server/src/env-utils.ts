/**
 * Get environment variable with fallback for server-side
 * @param key Environment variable key
 * @param fallback Fallback value if env var is not set
 * @returns Environment variable value or fallback
 */
export function getEnvVar(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

/**
 * Get server URL
 */
export function getServerUrl(): string {
  return getEnvVar(
    "NEXT_PUBLIC_SERVER_URL",
    "https://mln131-internal.hyudequeue.xyz"
  );
}

/**
 * Get client URL
 */
export function getClientUrl(): string {
  return getEnvVar("CLIENT_URL", "https://vnr202.hyudequeue.xyz");
}

/**
 * Get server port
 */
export function getServerPort(): number {
  return parseInt(getEnvVar("PORT", "25578"), 10);
}

/**
 * Get allowed origins for CORS
 */
export function getAllowedOrigins(): string[] {
  const origins: string[] = [];

  const clientUrl = process.env.CLIENT_URL;
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  if (clientUrl) origins.push(clientUrl);
  if (serverUrl) origins.push(serverUrl);

  origins.push("https://mln131.hyudequeue.xyz");
  origins.push("https://mln131-internal.hyudequeue.xyz");
  origins.push("https://hcm202.hyudequeue.xyz");
  origins.push("http://localhost:25576");

  if (process.env.NODE_ENV === "development") {
    origins.push("http://localhost:25576");
    origins.push("http://localhost:25577");
    origins.push("http://localhost:25578");
  }

  if (origins.length === 2) {
    if (process.env.NODE_ENV === "development") {
      origins.push("http://localhost:25576");
    }
  }

  return [...new Set(origins)];

  return origins;
}
