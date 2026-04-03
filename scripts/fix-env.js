#!/usr/bin/env node
/**
 * One-time script to set N8N_WEBHOOK_URL (and optionally other secrets) for
 * Supabase Edge Functions via the Management API. Use this when CLI deploy
 * fails and you need to point analyze-meal-proxy at your n8n webhook.
 *
 * Prerequisites:
 * 1. Create a Personal Access Token (PAT) at https://supabase.com/dashboard/account/tokens
 * 2. Set SUPABASE_ACCESS_TOKEN in your environment (do not commit it to .env)
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=your_pat node scripts/fix-env.js
 *   SUPABASE_ACCESS_TOKEN=your_pat N8N_WEBHOOK_URL=https://n8n.example.com/webhook/Me node scripts/fix-env.js
 *
 * Optional env:
 *   SUPABASE_PROJECT_REF  — project ref (default: parsed from VITE_SUPABASE_URL in .env)
 *   N8N_WEBHOOK_URL      — webhook URL to set (default: https://n8n.birdstyl.com/webhook/Calorie_Vision)
 */

const fs = require("fs");
const path = require("path");

const DEFAULT_N8N_URL = "https://n8n.birdstyl.com/webhook/Calorie_Vision";

function loadEnv() {
  const root = path.resolve(__dirname, "..");
  for (const file of [".env.local", ".env"]) {
    const p = path.join(root, file);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf8");
      for (const line of content.split("\n")) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (m) {
          const key = m[1];
          const val = m[2].replace(/^["']|["']$/g, "").trim();
          if (!process.env[key]) process.env[key] = val;
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

  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    console.error("Missing SUPABASE_ACCESS_TOKEN. Create a PAT at https://supabase.com/dashboard/account/tokens");
    process.exit(1);
  }

  const projectRef = getProjectRef();
  if (!projectRef) {
    console.error("Missing SUPABASE_PROJECT_REF and could not parse from VITE_SUPABASE_URL/SUPABASE_URL.");
    process.exit(1);
  }

  const n8nUrl = process.env.N8N_WEBHOOK_URL || DEFAULT_N8N_URL;
  const url = `https://api.supabase.com/v1/projects/${projectRef}/secrets`;
  const body = [{ name: "N8N_WEBHOOK_URL", value: n8nUrl }];

  console.log("Setting Edge Function secret for project:", projectRef);
  console.log("N8N_WEBHOOK_URL =", n8nUrl);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Management API error:", res.status, text);
    process.exit(1);
  }

  console.log("Done. The analyze-meal-proxy function will use this URL on the next invocation (no redeploy needed).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
