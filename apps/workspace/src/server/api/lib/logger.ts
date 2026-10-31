/**
 * Structured server-side logging for the API layer.
 *
 * `next.config.ts` sets `compiler.removeConsole`, which strips `console.*` from
 * production bundles — so logs are written straight to the stdout/stderr
 * streams Vercel collects. One JSON object per line.
 */
type LogLevel = "info" | "warn" | "error";

type LogFields = Record<string, string | number | boolean | undefined>;

export function logServerEvent(
  level: LogLevel,
  message: string,
  fields: LogFields = {},
): void {
  const line = `${JSON.stringify({
    ts: new Date().toISOString(),
    level,
    app: "workspace-api",
    message,
    ...fields,
  })}\n`;

  if (level === "error") {
    process.stderr.write(line);
    return;
  }
  process.stdout.write(line);
}
