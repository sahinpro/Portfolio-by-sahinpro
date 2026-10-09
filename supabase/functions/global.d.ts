/* eslint-disable @typescript-eslint/triple-slash-reference -- Deno edge types ship as ambient refs */
/// <reference path="../../node_modules/@supabase/functions-js/src/edge-runtime.d.ts" />

/** Supabase Edge (Deno) APIs used by functions in this folder    merges with `Deno.errors` from functions-js. */
declare namespace Deno {
  function serve(handler: (req: Request) => Response | Promise<Response>): void;

  const env: {
    get(key: string): string | undefined;
  };
}
