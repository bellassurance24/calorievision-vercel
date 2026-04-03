/**
 * generate-og.mjs
 * Regenerates public/og-image.png.
 *
 * Two-step pipeline:
 *   1. Satori + @resvg/resvg-js → background, decorative circle, brand text (PNG buffer)
 *   2. Sharp → composites the full-detail citrus-wheel logo (green needle, labels)
 *      directly onto the PNG — no data-URL encoding, perfect transparency handling.
 *
 * Run with:  node scripts/generate-og.mjs
 *        or: npm run generate:og
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

/**
 * Fetch a Google Font as an ArrayBuffer.
 * IE 11 UA → Google Fonts returns WOFF (magic 774f4646 "wOFF").
 * Satori 0.26 supports TTF / OTF / WOFF but NOT WOFF2.
 */
async function fetchGoogleFont(family, weight) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
      },
    },
  ).then((r) => r.text());

  const match = css.match(/src:\s*url\(['"]?([^'")\s]+)['"]?\)/);
  if (!match) throw new Error(`Font URL not found for ${family}:${weight}`);
  return fetch(match[1]).then((r) => r.arrayBuffer());
}

/* ─── Main ────────────────────────────────────────────────────────────────── */

async function main() {
  /* ── 1. Fonts ─────────────────────────────────────────────────────────── */
  console.log('🔤  Fetching fonts from Google Fonts…');
  const [outfitBold, dmSansRegular] = await Promise.all([
    fetchGoogleFont('Outfit', 700),
    fetchGoogleFont('DM+Sans', 400),
  ]);
  console.log('    ✓ Outfit 700  ✓ DM Sans 400');

  /* ── 2. Design tokens ─────────────────────────────────────────────────── */
  const W          = 1200;
  const H          = 630;
  const PAD_X      = 72;
  const PAD_Y      = 62;
  const BG         = '#1a3c28';   // dark forest green
  const WHITE      = '#ffffff';
  const SUBTITLE   = '#86efac';   // green-300
  const MUTED      = 'rgba(255,255,255,0.42)';
  const DECO_FILL  = 'rgba(255,255,255,0.055)';
  const LOGO_SIZE  = 210;         // rendered size of the citrus-wheel logo

  /* ── 3. Satori layer — background + decorative circle + brand text ─────
   *    The logo is intentionally OMITTED here; sharp composites it in step 5
   *    so we get native PNG alpha-blending with no data-URL artefacts.    */
  console.log('🎨  Rendering background + text layer with Satori…');

  const bgLayer = {
    type: 'div',
    props: {
      style: {
        display:         'flex',
        flexDirection:   'column',
        width:           `${W}px`,
        height:          `${H}px`,
        backgroundColor: BG,
        padding:         `${PAD_Y}px ${PAD_X}px`,
        overflow:        'hidden',
        position:        'relative',
      },
      children: [

        /* Decorative circle — upper-right, partially outside frame */
        {
          type: 'div',
          props: {
            style: {
              display:         'flex',
              position:        'absolute',
              right:           '30px',
              top:             '-50px',
              width:           '420px',
              height:          '420px',
              borderRadius:    '50%',
              backgroundColor: DECO_FILL,
            },
          },
        },

        /* Flexible spacer — pushes text group to the bottom */
        { type: 'div', props: { style: { display: 'flex', flexGrow: 1 } } },

        /* Brand name */
        {
          type: 'div',
          props: {
            style: {
              display:       'flex',
              color:         WHITE,
              fontSize:      74,
              fontWeight:    700,
              fontFamily:    'Outfit',
              lineHeight:    1.05,
              letterSpacing: '-1px',
              marginBottom:  '14px',
            },
            children: 'CalorieVision',
          },
        },

        /* Subtitle — updated brand line */
        {
          type: 'div',
          props: {
            style: {
              display:      'flex',
              color:        SUBTITLE,
              fontSize:     29,
              fontWeight:   400,
              fontFamily:   'DM Sans',
              lineHeight:   1.3,
              marginBottom: '14px',
            },
            children: 'AI Meal Scanner & Nutrition Tracker',
          },
        },

        /* Domain */
        {
          type: 'div',
          props: {
            style: {
              display:    'flex',
              color:      MUTED,
              fontSize:   20,
              fontFamily: 'DM Sans',
            },
            children: 'calorievision.online',
          },
        },

      ],
    },
  };

  const svg = await satori(bgLayer, {
    width: W,
    height: H,
    fonts: [
      { name: 'Outfit',  data: outfitBold,    weight: 700, style: 'normal' },
      { name: 'DM Sans', data: dmSansRegular, weight: 400, style: 'normal' },
    ],
  });

  /* ── 4. Resvg → PNG buffer ────────────────────────────────────────────── */
  console.log('🖼️   Converting SVG → PNG…');
  const resvg     = new Resvg(svg, { fitTo: { mode: 'width', value: W } });
  const bgPngBuf  = Buffer.from(resvg.render().asPng());

  /* ── 5. Sharp — composite the logo onto the background ──────────────────
   *    favicon-v4.png (512×512, RGBA, hasAlpha:true) is the correct source:
   *      • Green gauge needle pointing upper-right  ✓
   *      • PRO / CARB / FAT labels                 ✓
   *      • Numerical markings 200/400/600/1000      ✓
   *      • Genuine alpha transparency in corners    ✓  (no mask hack needed)
   *
   *    Pipeline: resize → composite over bg with blend:'over' →
   *              flatten residual alpha → fully opaque output PNG.
   */
  console.log('🍊  Compositing citrus-wheel logo (green needle, RGBA source)…');

  const logoPath   = join(ROOT, 'public', 'favicon-v4.png');
  const logoBuffer = await sharp(logoPath)
    .resize(LOGO_SIZE, LOGO_SIZE)  // 512×512 → 190×190, no letterbox (square→square)
    .png()
    .toBuffer();

  // Position: right-aligned (PAD_X from right edge), vertically centred
  const logoLeft = W - PAD_X - LOGO_SIZE;           // 1200 - 72 - 190 = 938
  const logoTop  = Math.round((H - LOGO_SIZE) / 2); // (630 - 190) / 2  = 220

  const finalPng = await sharp(bgPngBuf)
    .composite([{ input: logoBuffer, left: logoLeft, top: logoTop, blend: 'over' }])
    // Flatten any residual alpha to BG colour — final OG image must be fully opaque.
    .flatten({ background: { r: 26, g: 60, b: 40 } })
    .png()
    .toBuffer();

  /* ── 6. Write output ─────────────────────────────────────────────────── */
  const outPath = join(ROOT, 'public', 'og-image.png');
  writeFileSync(outPath, finalPng);

  const kb = (finalPng.length / 1024).toFixed(1);
  console.log(`\n✅  OG image saved → public/og-image.png  (${kb} KB)`);
  console.log(`    Logo: ${LOGO_SIZE}×${LOGO_SIZE} at (${logoLeft}, ${logoTop}) — needle & labels fully visible`);
  console.log('    Subtitle: "AI Meal Scanner & Nutrition Tracker"');
}

main().catch((err) => {
  console.error('\n❌  Generation failed:', err.message);
  process.exit(1);
});
