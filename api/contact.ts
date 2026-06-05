import { handleContactSubmission } from "../src/server/contactHandler";

type ApiRequest = {
  method?: string;
  body?: unknown;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
    end: () => void;
  };
};

export default async function handler(
  req: ApiRequest,
  res: ApiResponse,
): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const result = await handleContactSubmission(
      (req.body ?? {}) as Record<string, string | undefined>,
    );

    if (result.ok) {
      res.status(200).json({ ok: true });
      return;
    }

    res.status(result.status).json({ error: result.error });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
}
