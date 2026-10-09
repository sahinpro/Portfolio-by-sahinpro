/** Public JSON APIs are cached on the server (Redis). Do not CDN-cache — flush must work instantly. */
export const PUBLIC_API_CACHE_CONTROL =
  "private, no-cache, no-store, must-revalidate";
