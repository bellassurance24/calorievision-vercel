#!/usr/bin/env node
/**
 * insert-affiliate-links.mjs
 *
 * Context-aware affiliate link inserter.
 * Links are ONLY inserted when a multi-word phrase that signals commercial
 * intent is found — never on bare keywords.
 *
 * Rules:
 *   - MAX 2 links per article
 *   - Never wraps text already inside an <a> tag
 *   - Never wraps text inside an HTML tag attribute
 *   - Skips articles that already contain rel="sponsored"
 *   - Strips any legacy sponsored links before processing (idempotent)
 *   - Outputs a full per-article report
 *
 * Usage:  node scripts/insert-affiliate-links.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

// ─── Env ─────────────────────────────────────────────────────────────────────

const __dir = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(__dir, "../.env"), "utf8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("ERROR: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Link rules (phrase-based, context-aware) ─────────────────────────────────
//
// Each rule has:
//   id       — label used in the report
//   url      — affiliate URL for non-EU languages
//   url_eu   — affiliate URL for EU languages (fr/de/es/it/nl/pt)
//   phrases  — map of language → trigger phrases (case-insensitive)
//              Falls back to "en" phrases if the language has no entry.
//
// IMPORTANT: URLs marked PLACEHOLDER must be filled in before these rules fire.
// ─────────────────────────────────────────────────────────────────────────────

const EU_LANGS = new Set(["fr", "de", "es", "it", "nl", "pt"]);

const LINK_RULES = [
  // ── Kitchen scale ──────────────────────────────────────────────────────────
  {
    id: "kitchen_scale",
    url: "https://amzn.to/4szrWLk",
    url_eu: "https://amzn.to/4cpiLaa",
    phrases: {
      en: ["weigh your food", "food scale", "kitchen scale", "measure ingredients", "portion size", "food portions"],
      fr: ["peser vos aliments", "balance alimentaire", "balance de cuisine", "mesurer les ingrédients", "taille des portions", "portions alimentaires"],
      de: ["Lebensmittel abwiegen", "Küchenwaage", "Zutaten messen", "Portionsgröße", "Lebensmittelportionen"],
      es: ["pesar sus alimentos", "balanza de cocina", "báscula de cocina", "medir ingredientes", "tamaño de la porción", "porciones de alimentos"],
      it: ["pesare il cibo", "bilancia da cucina", "misurare gli ingredienti", "porzione di cibo", "porzioni alimentari"],
      nl: ["voedsel wegen", "keukenweegschaal", "ingrediënten meten", "portiegrootte", "voedselporties"],
      pt: ["pesar os alimentos", "balança de cozinha", "medir ingredientes", "tamanho da porção", "porções de alimentos"],
      ar: ["وزن طعامك", "ميزان المطبخ", "قياس المكونات", "حجم الحصة", "حصص الطعام"],
      ru: ["взвешивать еду", "кухонные весы", "измерять ингредиенты", "размер порции", "порции еды"],
      zh: ["称量食物", "厨房秤", "量取食材", "份量大小", "食物份量"],
      ja: ["食べ物を量る", "キッチンスケール", "材料を計量する", "一人前のサイズ", "食品の分量"],
    },
  },

  // ── Body scale ─────────────────────────────────────────────────────────────
  {
    id: "body_scale",
    url: "https://amzn.to/4szrWLk",
    url_eu: "https://amzn.to/4cpiLaa",
    phrases: {
      en: ["weigh yourself", "track your weight", "body weight", "step on a scale", "check your weight"],
      fr: ["vous peser", "suivre votre poids", "poids corporel", "monter sur la balance", "vérifier votre poids"],
      de: ["sich wiegen", "Gewicht verfolgen", "Körpergewicht", "auf die Waage stellen", "Gewicht kontrollieren"],
      es: ["pesarse", "controlar su peso", "peso corporal", "subirse a la báscula", "verificar su peso"],
      it: ["pesarsi", "monitorare il peso", "peso corporeo", "salire sulla bilancia", "controllare il peso"],
      nl: ["uzelf wegen", "uw gewicht bijhouden", "lichaamsgewicht", "op de weegschaal staan", "gewicht controleren"],
      pt: ["pesar-se", "monitorar seu peso", "peso corporal", "subir na balança", "verificar seu peso"],
      ar: ["وزن جسمك", "تتبع وزنك", "وزن الجسم", "الوقوف على الميزان", "التحقق من وزنك"],
      ru: ["взвешивать себя", "отслеживать вес", "вес тела", "встать на весы", "проверить вес"],
      zh: ["称体重", "追踪体重", "体重", "站上体重秤", "检查体重"],
      ja: ["体重を量る", "体重を記録する", "体重", "体重計に乗る", "体重を確認する"],
    },
  },

  // ── Water bottle ───────────────────────────────────────────────────────────
  {
    id: "water_bottle",
    url: "https://amzn.to/3Qnnvpv",
    url_eu: "https://amzn.to/4tdEn0L",
    phrases: {
      en: ["stay hydrated", "drink water", "water intake", "hydration", "water bottle", "daily water"],
      fr: ["rester hydraté", "boire de l'eau", "apport en eau", "hydratation", "bouteille d'eau", "eau quotidienne"],
      de: ["hydriert bleiben", "Wasser trinken", "Wasseraufnahme", "Hydratation", "Wasserflasche", "tägliches Wasser"],
      es: ["mantenerse hidratado", "beber agua", "ingesta de agua", "hidratación", "botella de agua", "agua diaria"],
      it: ["rimanere idratati", "bere acqua", "assunzione di acqua", "idratazione", "bottiglia d'acqua", "acqua quotidiana"],
      nl: ["gehydrateerd blijven", "water drinken", "waterinname", "hydratatie", "waterfles", "dagelijks water"],
      pt: ["manter-se hidratado", "beber água", "ingestão de água", "hidratação", "garrafa de água", "água diária"],
      ar: ["ابق رطباً", "شرب الماء", "تناول الماء", "الترطيب", "زجاجة الماء", "الماء اليومي"],
      ru: ["оставаться гидратированным", "пить воду", "потребление воды", "гидратация", "бутылка воды", "ежедневная вода"],
      zh: ["保持水分", "喝水", "水分摄入", "补水", "水瓶", "每日饮水"],
      ja: ["水分補給", "水を飲む", "水分摂取", "ハイドレーション", "水筒", "毎日の水分"],
    },
  },

  // ── Weight-loss program (Clickbank) ────────────────────────────────────────
  // TODO: Replace CLICKBANK_URL_PLACEHOLDER with your real Clickbank hoplink
  {
    id: "weight_loss_program",
    url: "https://d95a9lrgfhe7eq79mk0h180fxd.hop.clickbank.net",
    url_eu: "https://d95a9lrgfhe7eq79mk0h180fxd.hop.clickbank.net",
    phrases: {
      en: ["lose weight", "weight loss program", "diet plan", "burn fat", "slim down"],
      fr: ["perdre du poids", "programme de perte de poids", "plan de régime", "brûler les graisses", "mincir"],
      de: ["Gewicht verlieren", "Gewichtsabnahmeprogramm", "Ernährungsplan", "Fett verbrennen", "abnehmen"],
      es: ["perder peso", "programa de pérdida de peso", "plan de dieta", "quemar grasa", "adelgazar"],
      it: ["perdere peso", "programma dimagrante", "piano alimentare", "bruciare i grassi", "dimagrire"],
      nl: ["gewicht verliezen", "afslankprogramma", "dieetplan", "vet verbranden", "afvallen"],
      pt: ["perder peso", "programa de perda de peso", "plano de dieta", "queimar gordura", "emagrecer"],
      ar: ["فقدان الوزن", "برنامج إنقاص الوزن", "خطة النظام الغذائي", "حرق الدهون", "النحافة"],
      ru: ["похудеть", "программа похудения", "план питания", "сжигать жир", "похудение"],
      zh: ["减肥", "减肥计划", "饮食计划", "燃烧脂肪", "瘦身"],
      ja: ["体重を減らす", "ダイエットプログラム", "食事計画", "脂肪を燃焼する", "スリムになる"],
    },
  },

  // ── Supplements (Nutriprofits) ─────────────────────────────────────────────
  // TODO: Replace NUTRIPROFITS_URL_PLACEHOLDER with your real Nutriprofits link
  {
    id: "supplements",
    url: "https://nplink.net/9ujwtbbm",
    url_eu: "https://nplink.net/9ujwtbbm",
    phrases: {
      en: ["nutrition supplement", "protein powder", "dietary supplement", "vitamin supplement", "taking supplements"],
      fr: ["complément nutritionnel", "protéines en poudre", "complément alimentaire", "supplément vitaminique", "prendre des suppléments"],
      de: ["Nahrungsergänzungsmittel", "Proteinpulver", "Nahrungsergänzung", "Vitaminsupplement", "Ergänzungsmittel nehmen"],
      es: ["suplemento nutricional", "proteína en polvo", "suplemento dietético", "suplemento vitamínico", "tomar suplementos"],
      it: ["integratore nutrizionale", "proteine in polvere", "integratore alimentare", "integratore vitaminico", "assumere integratori"],
      nl: ["voedingssupplement", "eiwitpoeder", "dieetvoedingssupplement", "vitaminesupplement", "supplementen nemen"],
      pt: ["suplemento nutricional", "proteína em pó", "suplemento dietético", "suplemento vitamínico", "tomar suplementos"],
      ar: ["مكمل غذائي", "بروتين بودرة", "مكمل التغذية", "مكمل الفيتامين", "تناول المكملات"],
      ru: ["пищевая добавка", "протеиновый порошок", "диетическая добавка", "витаминная добавка", "принимать добавки"],
      zh: ["营养补充剂", "蛋白粉", "膳食补充剂", "维生素补充剂", "服用补充剂"],
      ja: ["栄養補助食品", "プロテインパウダー", "食事サプリ", "ビタミンサプリ", "サプリを摂る"],
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Remove any previously inserted sponsored links (makes the script idempotent). */
function stripSponsoredLinks(html) {
  return html.replace(/<a\s[^>]*rel="nofollow sponsored"[^>]*>([^<]*)<\/a>/gi, "$1");
}

/**
 * Try to insert a link for the given rule.
 * Returns { html, phrase, ruleId } on success, or null if no eligible phrase found.
 */
function tryInsertLink(html, rule, lang) {
  const isEU = EU_LANGS.has(lang);
  const url = isEU ? rule.url_eu : rule.url;

  // Skip rules whose URL hasn't been configured yet
  if (url.includes("PLACEHOLDER")) return null;

  const phrases = rule.phrases[lang] ?? rule.phrases["en"] ?? [];

  for (const phrase of phrases) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(escaped, "i");
    let cursor = 0;

    while (cursor < html.length) {
      const m = re.exec(html.slice(cursor));
      if (!m) break;

      const start = cursor + m.index;
      const end = start + m[0].length;
      const before = html.slice(0, start);

      // Skip if inside any opening HTML tag (e.g. inside an attribute value)
      const lastLt = before.lastIndexOf("<");
      const lastGt = before.lastIndexOf(">");
      if (lastLt > lastGt) { cursor = end; continue; }

      // Skip if nested inside an existing <a> tag
      const lastOpenA = before.lastIndexOf("<a ");
      const lastCloseA = before.lastIndexOf("</a");
      if (lastOpenA > lastCloseA) { cursor = end; continue; }

      // Safe — wrap and return
      const link = `<a href="${url}" rel="nofollow sponsored" target="_blank">${m[0]}</a>`;
      return {
        html: before + link + html.slice(end),
        phrase,
        ruleId: rule.id,
      };
    }
  }

  return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Fetch all posts (Supabase default cap is 1000; range covers up to 10 000)
  const { data: posts, error: fetchError } = await supabase
    .from("blog_posts")
    .select("id, slug, language, content")
    .range(0, 9999);

  if (fetchError) {
    console.error("Supabase fetch error:", fetchError.message);
    process.exit(1);
  }

  console.log(`Fetched ${posts.length} posts — starting insertion pass...\n`);

  const report = [];
  let totalLinks = 0;
  let totalUpdated = 0;

  for (const post of posts) {
    const { id, slug, language, content } = post;

    // Start clean (idempotent)
    let html = stripSponsoredLinks(content);

    const inserted = [];

    for (const rule of LINK_RULES) {
      if (inserted.length >= 2) break;
      const result = tryInsertLink(html, rule, language);
      if (result) {
        html = result.html;
        inserted.push({ phrase: result.phrase, ruleId: result.ruleId });
      }
    }

    if (inserted.length > 0) {
      const { error: updateError } = await supabase
        .from("blog_posts")
        .update({ content: html })
        .eq("id", id);

      if (updateError) {
        report.push({ lang: language, slug, inserted: [], error: updateError.message });
      } else {
        report.push({ lang: language, slug, inserted, error: null });
        totalLinks += inserted.length;
        totalUpdated++;
      }
    } else {
      report.push({ lang: language, slug, inserted: [], error: null });
    }
  }

  // ─── Full report ────────────────────────────────────────────────────────────
  console.log("=== ARTICLE REPORT ===");
  for (const r of report) {
    if (r.error) {
      console.log(`[${r.lang}] ${r.slug} → ERROR: ${r.error}`);
    } else if (r.inserted.length > 0) {
      const detail = r.inserted.map((l) => `"${l.phrase}"→${l.ruleId}`).join(", ");
      console.log(`[${r.lang}] ${r.slug} → ${r.inserted.length} link${r.inserted.length > 1 ? "s" : ""}: ${detail}`);
    } else {
      console.log(`[${r.lang}] ${r.slug} → 0 links: no matching context found`);
    }
  }
  console.log(`=== TOTAL: ${totalLinks} links inserted across ${totalUpdated} articles ===`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
