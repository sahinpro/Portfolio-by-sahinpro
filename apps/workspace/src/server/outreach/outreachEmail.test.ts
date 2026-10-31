import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  buildOutreachHtml,
  buildOutreachPlainText,
  leadsAdminUrl,
  siteBaseUrl,
} from "./outreachEmail";
import type { WindowOpenMatch } from "./windowScheduler";

const CANONICAL_LEADS_URL = "https://workspace.sahinpro.me/leads";
const PREVIEW_DEPLOY_URL =
  "portfolio-by-sahinpro-ncn8qbcvp-sahin-alams-projects-be5700f1.vercel.app";

function makeMatch(): WindowOpenMatch {
  return {
    zone: {
      marketId: "uk",
      marketName: "United Kingdom",
      flag: "🇬🇧",
      zoneId: "london",
      city: "London · GMT/BST",
      tz: "Europe/London",
    },
    localDate: "2026-11-03",
    localTimeLabel: "Tue 09:32",
    bdWindowLabel: "Tue 15:02 – 16:32 (Bangladesh)",
  };
}

const originalEnv = {
  SITE_URL: process.env.SITE_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  VERCEL_URL: process.env.VERCEL_URL,
};

function setEnv(patch: Record<string, string | undefined>): void {
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

afterEach(() => setEnv(originalEnv));

describe("siteBaseUrl / leadsAdminUrl", () => {
  it("uses SITE_URL and never the deployment-specific VERCEL_URL", () => {
    setEnv({
      SITE_URL: "https://workspace.sahinpro.me",
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_URL: PREVIEW_DEPLOY_URL,
    });
    assert.equal(siteBaseUrl(), "https://workspace.sahinpro.me");
    assert.equal(leadsAdminUrl(), CANONICAL_LEADS_URL);
  });

  it("falls back to the canonical constant when no env var is set (not VERCEL_URL)", () => {
    setEnv({
      SITE_URL: undefined,
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_URL: PREVIEW_DEPLOY_URL,
    });
    assert.equal(leadsAdminUrl(), CANONICAL_LEADS_URL);
    assert.ok(!leadsAdminUrl().includes("vercel.app"));
  });

  it("honours the legacy NEXT_PUBLIC_SITE_URL when SITE_URL is unset", () => {
    setEnv({
      SITE_URL: undefined,
      NEXT_PUBLIC_SITE_URL: "https://staging.example.com",
      VERCEL_URL: undefined,
    });
    assert.equal(leadsAdminUrl(), "https://staging.example.com/leads");
  });

  it("normalises schemeless hosts and trailing slashes", () => {
    setEnv({
      SITE_URL: "workspace.sahinpro.me/",
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_URL: undefined,
    });
    assert.equal(leadsAdminUrl(), CANONICAL_LEADS_URL);
  });

  it("SITE_URL wins over NEXT_PUBLIC_SITE_URL", () => {
    setEnv({
      SITE_URL: "https://workspace.sahinpro.me",
      NEXT_PUBLIC_SITE_URL: "https://old.example.com",
      VERCEL_URL: undefined,
    });
    assert.equal(leadsAdminUrl(), CANONICAL_LEADS_URL);
  });
});

describe("reminder email Leads button", () => {
  it("scheduled and test emails both link to the canonical production URL", () => {
    setEnv({
      SITE_URL: "https://workspace.sahinpro.me",
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_URL: PREVIEW_DEPLOY_URL,
    });
    const match = makeMatch();
    for (const testMode of [false, true]) {
      const text = buildOutreachPlainText(match, testMode);
      const html = buildOutreachHtml(match, testMode);
      assert.ok(
        text.includes(`Leads: ${CANONICAL_LEADS_URL}`),
        `plain-text link (testMode=${testMode})`,
      );
      assert.ok(
        html.includes(`href="${CANONICAL_LEADS_URL}"`),
        `html href (testMode=${testMode})`,
      );
      assert.ok(
        !text.includes("vercel.app") && !html.includes("vercel.app"),
        "no deployment URL leaks into the email",
      );
    }
  });

  it("embeds no credentials or tokens in the link", () => {
    setEnv({
      SITE_URL: "https://workspace.sahinpro.me",
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_URL: undefined,
    });
    const html = buildOutreachHtml(makeMatch(), false);
    assert.ok(!/[?&](token|secret|key|password|api)=/i.test(html));
    assert.ok(!html.includes("service_role") && !html.includes("anon"));
  });
});
