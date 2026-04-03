#!/usr/bin/env node
/**
 * Deploy or update the analyze-meal-proxy Edge Function via the Supabase
 * Management API (no CLI required). Reads the code from
 * supabase/functions/analyze-meal-proxy/index.ts and deploys it.
 *
 * Prerequisites:
 * 1. Create a Personal Access Token at https://supabase.com/dashboard/account/tokens
 * 2. Set SUPABASE_ACCESS_TOKEN in your environment (do not commit it)
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=your_pat node scripts/deploy-analyze-meal-proxy.mjs
 *   SUPABASE_ACCESS_TOKEN=your_pat SUPABASE_PROJECT_REF=ttjcfwspcpntxzqnfrh node scripts/deploy-analyze-meal-proxy.mjs
 *
 * Optional env:
 *   SUPABASE_PROJECT_REF — project ref (default: parsed from VITE_SUPABASE_URL in .env)
 *
 * If the API returns 400/422, the deploy endpoint may require a zip bundle instead of
 * a single file. In that case, use the Supabase CLI from a working environment:
 *   supabase functions deploy analyze-meal-proxy --use-api
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const FUNCTION_SLUG = "analyze-meal-proxy";
const ENTRYPOINT = "index.ts";
const SUPABASE_ACCESS_TOKEN = "sbp_1ee2518577cc04087f02061f0a731744ee8d0a1e";
const PROJECT_REF = "ttjcfwspcpntxzqnfrh";
function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const p = path.join(ROOT, file);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf8");
      for (const line of content.split("\n")) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (m && !process.env[m[1]]) {
          process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
        }
      }
    }
  }
}

function getProjectRef() {
  const ref = process.env.SUPABASE_PROJECT_REF;
  if (ref) return ref;
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  if (url) {
    const m = url.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (m) return m[1];
  }
  return null;
}

async function main() {
  loadEnv();

  const token = SUPABASE_ACCESS_TOKEN;
  if (!token) {
    console.error("Missing SUPABASE_ACCESS_TOKEN. Create a PAT at https://supabase.com/dashboard/account/tokens");
    process.exit(1);
  }

  const projectRef = PROJECT_REF;
  if (!projectRef) {
    console.error("Missing SUPABASE_PROJECT_REF and could not parse from VITE_SUPABASE_URL/SUPABASE_URL.");
    process.exit(1);
  }

  const indexPath = path.join(ROOT, "supabase", "functions", FUNCTION_SLUG, ENTRYPOINT);
  if (!fs.existsSync(indexPath)) {
    console.error("Function source not found:", indexPath);
    process.exit(1);
  }

  const code = fs.readFileSync(indexPath, "utf8");
  const deployUrl = `https://api.supabase.com/v1/projects/${projectRef}/functions/deploy?slug=${encodeURIComponent(FUNCTION_SLUG)}`;

  const metadata = {
    slug: FUNCTION_SLUG,
    name: FUNCTION_SLUG,
    entrypoint_path: ENTRYPOINT,
    verify_jwt: false,
  };

  const form = new FormData();
  form.append("metadata", JSON.stringify(metadata));
  form.append("file", new Blob([code], { type: "text/typescript" }), ENTRYPOINT);

  console.log("Deploying", FUNCTION_SLUG, "to project", projectRef, "...");

  const res = await fetch(deployUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = null;
  }

  if (!res.ok) {
    console.error("Deploy failed:", res.status, res.statusText);
    console.error(body || text);
    process.exit(1);
  }

  console.log("Deploy response:", body);
  console.log("Done. Function URL: https://" + projectRef + ".supabase.co/functions/v1/" + FUNCTION_SLUG);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
