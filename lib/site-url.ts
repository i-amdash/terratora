const configuredUrl = (
  process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL
)?.trim();
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const localUrl = "http://localhost:3000";
const productionFallback = "https://terratoraconsulting.com";

function resolveSiteUrl() {
  if (configuredUrl && !(process.env.NODE_ENV === "production" && isLocalUrl(configuredUrl))) return configuredUrl;
  if (vercelUrl) return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
  return process.env.NODE_ENV === "production" ? productionFallback : localUrl;
}

export const siteUrl = resolveSiteUrl().replace(/\/$/, "");

export function absoluteUrl(path: string) {
  return new URL(path, `${siteUrl}/`).toString();
}

function isLocalUrl(value: string) {
  try {
    const hostname = new URL(value).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return true;
  }
}
