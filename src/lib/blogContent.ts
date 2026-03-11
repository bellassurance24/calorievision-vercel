export type TocItem = {
  id: string;
  text: string;
  level: number;
};

// Generate slug from text (used for in-page anchor links)
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Known table patterns - each defines a header and the exact items to look for
// Supports both English and French (common translations)
const KNOWN_TABLE_CONFIGS = [
  // PIZZA patterns
  {
    trigger: /Pizza\s*Type\s*Calories/i,
    headers: ['Pizza Type', 'Calories'],
    items: [
      'Plain cheese pizza (thin crust)',
      'Plain cheese pizza (regular crust)',
      'Plain cheese pizza (deep dish)',
      'Plain cheese pizza',
      'Pepperoni pizza',
      'Meat lovers pizza',
      'Veggie pizza',
      'Margherita pizza',
      'BBQ chicken pizza',
      'Hawaiian pizza',
      'Supreme pizza'
    ]
  },
  {
    trigger: /Crust\s*Type\s*Calories/i,
    headers: ['Crust Type', 'Calories'],
    items: [
      'Thin crust',
      'Regular hand-tossed',
      'Pan/deep dish',
      'Stuffed crust',
      'Cauliflower crust',
      'Gluten-free crust'
    ]
  },
  {
    trigger: /Cheese\s*Amount\s*Calories/i,
    headers: ['Cheese Amount', 'Calories'],
    items: [
      'Light cheese',
      'Regular cheese',
      'Extra cheese',
      'Double cheese'
    ]
  },
  {
    trigger: /Sauce\s*Type\s*Calories/i,
    headers: ['Sauce Type', 'Calories'],
    items: [
      'Marinara (tomato)',
      'White garlic sauce',
      'BBQ sauce',
      'Alfredo sauce',
      'Olive oil base',
      'Pesto'
    ]
  },
  {
    trigger: /Topping\s*Calories\s*Added/i,
    headers: ['Topping', 'Calories Added'],
    items: [
      'Pepperoni',
      'Italian sausage',
      'Bacon',
      'Ham',
      'Grilled chicken',
      'Ground beef',
      'Mushrooms',
      'Onions',
      'Bell peppers',
      'Olives',
      'Jalapeños',
      'Pineapple',
      'Spinach',
      'Tomatoes',
      'Anchovies'
    ]
  },
  // English patterns
  {
    trigger: /Bun Type Calories/i,
    headers: ['Bun Type', 'Calories'],
    items: [
      'Standard white bun',
      'Brioche bun',
      'Whole wheat bun',
      'Lettuce wrap (no bun)',
      'Lettuce wrap',
      'Pretzel bun'
    ]
  },
  // French: Le pain
  {
    trigger: /Type de pain Calories/i,
    headers: ['Type de pain', 'Calories'],
    items: [
      'Pain blanc standard',
      'Pain brioché',
      'Pain complet',
      'Feuille de laitue (sans pain)',
      'Feuille de laitue',
      'Pain bretzel'
    ]
  },
  {
    trigger: /Patty Type Calories/i,
    headers: ['Patty Type', 'Calories'],
    items: [
      '80/20 ground beef',
      '90/10 lean ground beef',
      'Turkey burger',
      'Chicken burger',
      'Veggie burger',
      'Beyond/Impossible burger'
    ]
  },
  // French: La viande
  {
    trigger: /Type de galette Calories|Type de steak Calories/i,
    headers: ['Type de galette', 'Calories'],
    items: [
      'Bœuf haché 80/20',
      'Bœuf haché maigre 90/10',
      'Burger de dinde',
      'Burger de poulet',
      'Burger végétarien',
      'Burger Beyond/Impossible'
    ]
  },
  {
    trigger: /Cheese Type Calories/i,
    headers: ['Cheese Type', 'Calories'],
    items: [
      'American cheese',
      'Cheddar cheese',
      'Swiss cheese',
      'Pepper jack',
      'Blue cheese'
    ]
  },
  // French: Le fromage
  {
    trigger: /Type de fromage Calories/i,
    headers: ['Type de fromage', 'Calories'],
    items: [
      'Fromage américain',
      'Fromage cheddar',
      'Fromage suisse',
      'Pepper jack',
      'Fromage bleu'
    ]
  },
  {
    trigger: /Topping Calories/i,
    headers: ['Topping', 'Calories'],
    items: [
      'Lettuce',
      'Tomato (2 slices)',
      'Tomato',
      'Onion (raw)',
      'Onion',
      'Pickles',
      'Jalapeños',
      'Bacon (2 strips)',
      'Bacon',
      'Fried egg',
      'Avocado (2 slices)',
      'Avocado',
      'Fried onion rings',
      'Mushrooms (sautéed)',
      'Mushrooms'
    ]
  },
  // French: Les garnitures
  {
    trigger: /Garniture Calories/i,
    headers: ['Garniture', 'Calories'],
    items: [
      'Laitue',
      'Tomate (2 tranches)',
      'Tomate',
      'Oignon (cru)',
      'Oignon',
      'Cornichons',
      'Jalapeños',
      'Bacon (2 tranches)',
      'Bacon',
      'Œuf frit',
      'Avocat (2 tranches)',
      'Avocat',
      'Rondelles d\'oignon frites',
      'Champignons (sautés)',
      'Champignons'
    ]
  },
  {
    trigger: /Sauce Calories/i,
    headers: ['Sauce', 'Calories'],
    items: [
      'Ketchup',
      'Mustard',
      'Mayonnaise',
      'Special sauce',
      'BBQ sauce',
      'Ranch dressing',
      'Aioli',
      // French versions
      'Moutarde',
      'Sauce spéciale',
      'Sauce BBQ',
      'Sauce ranch',
      'Aïoli'
    ]
  },
  {
    trigger: /Burger Calories/i,
    headers: ['Burger', 'Calories'],
    items: [
      'Hamburger',
      'Cheeseburger',
      'McDouble',
      'Quarter Pounder with Cheese',
      'Quarter Pounder',
      'Big Mac',
      'Double Quarter Pounder',
      'Whopper Jr.',
      'Whopper Jr',
      'Whopper with Cheese',
      'Whopper',
      'Double Whopper',
      'Jr. Hamburger',
      'Jr. Cheeseburger',
      "Dave's Single",
      "Dave's Double",
      "Dave's Triple",
      'Baconator',
      'Little Hamburger',
      'Little Cheeseburger',
      'Hamburger (double patty)',
      'Cheeseburger (double patty)',
      'Bacon Cheeseburger',
      'Shack Burger',
      'SmokeShack',
      'Double Shack Burger',
      'Shack Stack',
      'Double-Double',
      'Protein Style (lettuce wrap)',
      'Protein Style',
      // French versions
      'Quarter Pounder au fromage',
      'Petit Hamburger',
      'Petit Cheeseburger',
      'Hamburger (double galette)',
      'Cheeseburger (double galette)',
      'Bacon Cheeseburger'
    ]
  },
  {
    trigger: /Type\s+(?:Typical\s+)?Calorie/i,
    headers: ['Type', 'Calorie Range'],
    items: [
      'Casual dining burger',
      'Gourmet pub burger',
      'Loaded specialty burger',
      // French
      'Burger de restauration décontractée',
      'Burger de pub gastronomique',
      'Burger spécialité garni'
    ]
  },
  // French: Type Plage de calories typique
  {
    trigger: /Type\s+Plage de calories/i,
    headers: ['Type', 'Plage de calories'],
    items: [
      'Burger de restauration décontractée',
      'Burger de pub gastronomique',
      'Burger spécialité garni'
    ]
  }
];

// Extract items and values from plain text table
const extractTableData = (text: string, items: string[]): Array<[string, string]> => {
  const rows: Array<[string, string]> = [];

  // Sort items by length (longest first) to avoid partial matches
  const sortedItems = [...items].sort((a, b) => b.length - a.length);

  let workingText = text;

  for (const item of sortedItems) {
    // Escape special regex characters in the item name
    const escapedItem = item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match the item followed by a calorie value (with optional parenthetical notes)
    // Also handle French number formatting (e.g., "1 200" instead of "1200")
    const pattern = new RegExp(
      escapedItem + '\\s*(?:\\([^)]*\\))?\\s*(\\d[\\d\\s]*(?:[-–à]\\s*\\d[\\d\\s]*)?\\+?)',
      'i'
    );

    const match = workingText.match(pattern);
    if (match) {
      // Clean up the number (remove internal spaces that French uses)
      const cleanNumber = match[1].replace(/(\d)\s+(\d)/g, '$1$2').trim();
      rows.push([item, cleanNumber]);
      // Remove matched text to prevent double-matching
      workingText = workingText.replace(match[0], ' ');
    }
  }

  return rows;
};

const escapeHtml = (input: string): string =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Normalize "inline" tables where words are concatenated (e.g. "TypeCalories")
// by inserting spaces at common boundaries.
const normalizeInlineTableText = (input: string): string => {
  return input
    // Add spaces between letter->Uppercase transitions (including accents)
    .replace(/([a-zà-öø-ÿ])([A-ZÀ-ÖØ-Ý])/g, '$1 $2')
    // Add spaces after closing parens when a new word begins
    .replace(/\)(?=[A-ZÀ-ÖØ-Ý])/g, ') ')
    // Split back-to-back numeric columns (common in exported tables).
    // IMPORTANT: use a non-space delimiter so we don't interpret it as a thousands separator.
    // e.g. "205130" -> "205 | 130", "16095" -> "160 | 95"
    .replace(/\b(\d{3})(\d{3})\b/g, '$1 | $2')
    .replace(/\b(\d{3})(\d{2})\b/g, '$1 | $2')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
};


type GenericMultiValueTable = {
  headers: string[];
  rows: Array<{ label: string; values: string[] }>;
};

// Heuristic parser for inline tables with 2+ numeric columns.
// Examples:
// - "Rice Type Calories per Cup (Cooked) Calories per 100g (Cooked) White rice ... 205 130 ..."
// - "Nutriment Riz blanc (1 tasse) Riz brun (1 tasse) Manganèse 37% 88% ..."
const parseGenericMultiValueTable = (plainText: string): GenericMultiValueTable | null => {
  const text = normalizeInlineTableText(plainText);

  // Numeric token:
  // - supports ranges (180-220)
  // - supports percents (37%)
  // - avoids header numbers like "(1 cup)" and unit strings like "100g" by requiring:
  //    * 2+ digits OR a % sign
  //    * and NOT immediately followed by a letter (e.g. "g")
  // Also avoids fractions like 80/20.
  const valueRegex =
    /(?<!\/)(?:\d{2,4}(?:[\s,]\d{3})*(?:[.,]\d+)?(?:\s*[–-]\s*\d{2,4}(?:[\s,]\d{3})*(?:[.,]\d+)?)?\+?%?|\d{1,3}%)(?![A-Za-zÀ-ÖØ-öø-ÿ\/])/g;

  const matches = Array.from(text.matchAll(valueRegex));
  if (matches.length < 6) return null;

  // Try 2 or 3 numeric columns per row.
  for (const numericCols of [2, 3]) {
    const rows: Array<{ label: string; values: string[] }> = [];
    let prevIdx = 0;
    let groupingValid = true;

    for (let i = 0; i + (numericCols - 1) < matches.length; i += numericCols) {
      const group = matches.slice(i, i + numericCols);

      // If there are letters between numeric tokens, it's likely NOT multi-column (it is likely a
      // single-value-per-row table like pizza/burger). Abort this numericCols attempt.
      for (let j = 0; j < group.length - 1; j++) {
        const a = group[j];
        const b = group[j + 1];
        const aStart = a.index ?? 0;
        const bStart = b.index ?? 0;
        const aEnd = aStart + String(a[0]).length;
        const between = text.slice(aEnd, bStart);
        const betweenCleaned = between.replace(/[\s|,:;\/–—-]+/g, '');
        if (betweenCleaned.length > 0) {
          groupingValid = false;
          break;
        }
      }
      if (!groupingValid) break;

      const first = group[0];
      const last = group[group.length - 1];

      const firstIdx = first.index ?? 0;
      const lastIdx = last.index ?? 0;
      const lastLen = String(last[0]).length;

      const labelRaw = text.slice(prevIdx, firstIdx).replace(/\s+/g, ' ').trim();
      const values = group.map((m) => String(m[0]).replace(/\s+/g, ' ').trim());

      prevIdx = lastIdx + lastLen;

      if (!labelRaw) continue;
      rows.push({ label: labelRaw, values });
    }

    if (!groupingValid) continue;

    // Trailing text after last value: if long, likely not a table paragraph.
    const trailing = text.slice(prevIdx).trim();
    if (trailing.length > 40) continue;

    const normalizedRows = rows
      .map((r) => ({
        label: r.label.replace(/^[-•–\s:]+/, '').trim(),
        values: r.values,
      }))
      .filter((r) => r.label.length >= 2 && r.label.length <= 120);

    if (normalizedRows.length < 3) continue;

    // Reject if labels look like full sentences.
    const sentencePunctCount = normalizedRows.reduce(
      (acc, r) => acc + (r.label.match(/[.!?]/g)?.length ?? 0),
      0
    );
    if (sentencePunctCount > 0) continue;

    // Header inference from the first "label" chunk, which often contains headers + first row label.
    let headers: string[] = ['Item', ...Array.from({ length: numericCols }, (_, i) => `Value ${i + 1}`)];

    const firstLabel = normalizedRows[0]?.label ?? '';
    const splitPoints = Array.from(firstLabel.matchAll(/\)\s+(?=[A-ZÀ-ÖØ-Ý])/g));
    if (splitPoints.length > 0) {
      const lastSplit = splitPoints[splitPoints.length - 1];
      const splitIdx = (lastSplit.index ?? 0) + 1;
      const headerPrefix = firstLabel.slice(0, splitIdx).trim();
      const actualFirstRowLabel = firstLabel.slice(splitIdx).trim();

      // Try to extract column headers as phrases containing parentheses.
      const parenPhrases = headerPrefix.match(/[^()]+\([^)]*\)/g)?.map((s) => s.trim()) ?? [];
      if (parenPhrases.length >= numericCols) {
        const colHeaders = parenPhrases.slice(0, numericCols);
        let left = headerPrefix;
        for (const h of colHeaders) left = left.replace(h, ' ');
        const h1 = left.replace(/\s+/g, ' ').trim();
        if (h1.length >= 2 && h1.length <= 60) {
          headers = [h1, ...colHeaders];
        }
      } else {
        // Secondary: split by calorie keyword occurrences.
        const calorieMatches = Array.from(headerPrefix.matchAll(new RegExp(CALORIE_HEADER_REGEX.source, 'gi')));
        if (calorieMatches.length >= numericCols) {
          const parts: string[] = [];
          const firstIdx = calorieMatches[0].index ?? 0;
          parts.push(headerPrefix.slice(0, firstIdx).trim());
          for (let j = 0; j < numericCols; j++) {
            const start = calorieMatches[j].index ?? 0;
            const end = (calorieMatches[j + 1]?.index ?? headerPrefix.length);
            parts.push(headerPrefix.slice(start, end).trim());
          }
          if (parts.length === numericCols + 1 && parts.every((p) => p.length > 0)) headers = parts;
        }
      }

      if (actualFirstRowLabel) normalizedRows[0].label = actualFirstRowLabel;
    }

    return { headers, rows: normalizedRows };
  }

  return null;
};

// A language-agnostic (heuristic) detector for "inline" 2-column tables written as plain text.
// Example: "Component Calories 4 oz beef patty (80/20) 285 White bun 140 ..."
// Works for translated content too because it relies on repeated numeric values, not specific item lists.
const CALORIE_HEADER_REGEX =
  /\b(calories|calorie|calor[ií]as|calorias|kalorien|kalori(?:ën|er)?|calorieën|kcal|\u0643\u0627\u0644\u0648\u0631\u064a(?:\u0627\u062a)?|\u0633\u0639\u0631\u0627\u062a|\u5361\u8def\u91cc|\u30ab\u30ed\u30ea\u30fc|\uce7c\uB85C\uB9AC)\b/i;

type GenericTwoColTable = {
  headers: [string, string];
  rows: Array<[string, string]>;
};

const parseGenericTwoColumnTable = (plainText: string): GenericTwoColTable | null => {
  const calorieMatch = plainText.match(CALORIE_HEADER_REGEX);
  // Require the "numeric column" keyword near the beginning to avoid converting normal paragraphs.
  // Increased threshold to 60 to catch patterns like "Pizza TypeCalories per Slice..."
  if (!calorieMatch || (calorieMatch.index ?? 999) > 60) return null;

  // Only treat 2+ digit numbers (or ranges) as values so we don't break labels like "4 oz" or "80/20".
  // Also avoid matching fractions like 80/20 by disallowing a slash on either side.
  const valueRegex = /(?<!\/ )\b\d{2,4}(?:[.,]\d+)?(?:\s*[–-]\s*\d{2,4}(?:[.,]\d+)?)*\+?\b(?!\/)/g;
  const matches = Array.from(plainText.matchAll(valueRegex));
  if (matches.length < 3) return null;

  const rows: Array<[string, string]> = [];
  let prevIdx = 0;

  for (const m of matches) {
    const idx = m.index ?? 0;
    const labelRaw = plainText.slice(prevIdx, idx).replace(/\s+/g, ' ').trim();
    const valueRaw = m[0].replace(/\s+/g, ' ').trim();
    prevIdx = idx + m[0].length;

    if (!labelRaw) continue;
    rows.push([labelRaw, valueRaw]);
  }

  // If there's a lot of trailing text after the last value, it's probably not a table.
  const trailing = plainText.slice(prevIdx).trim();
  if (trailing.length > 25) return null;

  // Reject if it looks like full sentences.
  const sentencePunctCount = rows.reduce(
    (acc, [label]) => acc + (label.match(/[.!?]/g)?.length ?? 0),
    0
  );
  if (sentencePunctCount > 0) return null;

  const normalizedRows = rows
    .map(([label, value]) => [label.replace(/^[-•–\s]+/, '').trim(), value] as [string, string])
    .filter(([label]) => label.length >= 2 && label.length <= 90);

  if (normalizedRows.length < 3) return null;

  // Try to strip the header part from the first row label when possible.
  // Handle patterns like "Pizza TypeCalories per SlicePlain cheese" -> extract header and clean first row
  const header2 = calorieMatch[0];
  const firstLabel = normalizedRows[0]?.[0];
  if (firstLabel) {
    const idx = firstLabel.toLowerCase().indexOf(header2.toLowerCase());
    if (idx !== -1) {
      // Extract what comes before "Calories" as potential header1
      const before = firstLabel.slice(0, idx).trim();
      const after = firstLabel.slice(idx + header2.length).trim();

      // Remove common header suffixes like "per Slice", "Added", etc.
      const cleanedAfter = after.replace(/^(?:per\s+slice|added|per\s+serving|range|content)\s*/i, '').trim();

      if (cleanedAfter.length >= 2) {
        normalizedRows[0][0] = cleanedAfter;
      }

      // If we found a meaningful header1, use it
      if (before.length >= 2 && before.length <= 30) {
        return { headers: [before, header2], rows: normalizedRows };
      }
    }
  }

  // We keep header 1 generic (safe across languages).
  return { headers: ['Item', header2], rows: normalizedRows };
};

// Convert markdown table syntax to HTML table
const convertMarkdownTableToHtml = (markdownTable: string): string => {
  const lines = markdownTable.trim().split('\n').filter(line => line.trim());
  if (lines.length < 2) return markdownTable;

  // Check if this is a markdown table (has | pipes)
  if (!lines[0].includes('|')) return markdownTable;

  const parseRow = (line: string): string[] => {
    return line
      .split('|')
      .map(cell => cell.trim())
      .filter((cell, index, arr) => {
        // Remove empty first/last cells from pipes at start/end
        if (index === 0 && cell === '') return false;
        if (index === arr.length - 1 && cell === '') return false;
        return true;
      });
  };

  // Check if line is a separator (e.g., |---|---|)
  const isSeparatorLine = (line: string): boolean => {
    return /^\|?\s*[-:]+\s*\|/.test(line) && line.replace(/[\s|:-]/g, '').length === 0;
  };

  const headers = parseRow(lines[0]);
  if (headers.length === 0) return markdownTable;

  // Find separator line (usually line 1)
  let dataStartIndex = 1;
  if (lines.length > 1 && isSeparatorLine(lines[1])) {
    dataStartIndex = 2;
  }

  const dataRows = lines.slice(dataStartIndex).map(parseRow).filter(row => row.length > 0);

  if (dataRows.length === 0) return markdownTable;

  const tableHtml = `<div class="table-wrapper"><table>
  <thead>
    <tr>
      ${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('\n      ')}
    </tr>
  </thead>
  <tbody>
    ${dataRows.map(row => `<tr>
      ${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('\n      ')}
    </tr>`).join('\n    ')}
  </tbody>
</table></div>`;

  return tableHtml;
};

// Detect and convert markdown tables in HTML content
const processMarkdownTables = (html: string): string => {
  // Match markdown tables that might be inside <p> tags or raw in content
  // Pattern: lines starting with | and containing |
  const markdownTableRegex = /(?:<p[^>]*>)?((?:\|[^\n]+\|\s*\n?)+)(?:<\/p>)?/gi;

  return html.replace(markdownTableRegex, (match, tableContent) => {
    const cleaned = tableContent
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .trim();

    // Verify it's actually a markdown table (at least 2 rows with pipes)
    const lines = cleaned.split('\n').filter((l: string) => l.includes('|'));
    if (lines.length >= 2) {
      return convertMarkdownTableToHtml(cleaned);
    }
    return match;
  });
};

// Convert plain-text table data to HTML tables
const convertPlainTextTablesToHtml = (html: string): string => {
  // First, process any markdown tables
  let result = processMarkdownTables(html);

  // Process each paragraph that might contain table data
  const pTagRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;

  result = result.replace(pTagRegex, (match, innerContent) => {
    // Skip if already processed as a table
    if (match.includes('<table>')) return match;

    // Remove HTML tags to get plain text for analysis
    const plainText = innerContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    // Skip very short paragraphs
    if (plainText.length < 40) return match;

    // 1) Check against known table patterns (high precision)
    for (const config of KNOWN_TABLE_CONFIGS) {
      if (config.trigger.test(plainText)) {
        const rows = extractTableData(plainText, config.items);

        if (rows.length >= 2) {
          const tableHtml = `<div class="table-wrapper"><table>
  <thead>
    <tr>
      <th>${escapeHtml(config.headers[0])}</th>
      <th>${escapeHtml(config.headers[1])}</th>
    </tr>
  </thead>
  <tbody>
    ${rows
      .map(
        ([item, value]) => `<tr>
      <td>${escapeHtml(item)}</td>
      <td>${escapeHtml(value)}</td>
    </tr>`
      )
      .join('\n    ')}
  </tbody>
</table></div>`;

          return tableHtml;
        }
      }
    }

    // 2) Fallback: multi-column inline tables (2+ numeric columns per row)
    const multi = parseGenericMultiValueTable(plainText);
    if (multi) {
      const tableHtml = `<div class="table-wrapper"><table>
  <thead>
    <tr>
      ${multi.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}
    </tr>
  </thead>
  <tbody>
    ${multi.rows
      .map((r) => {
        const tds = [
          `<td>${escapeHtml(r.label)}</td>`,
          ...r.values.map((v) => `<td>${escapeHtml(v)}</td>`),
        ].join('');
        return `<tr>${tds}</tr>`;
      })
      .join('\n    ')}
  </tbody>
</table></div>`;

      return tableHtml;
    }

    // 3) Fallback: generic (heuristic) detector for translated / unknown tables (single numeric column)
    const generic = parseGenericTwoColumnTable(plainText);
    if (generic) {
      const tableHtml = `<div class="table-wrapper"><table>
  <thead>
    <tr>
      <th>${escapeHtml(generic.headers[0])}</th>
      <th>${escapeHtml(generic.headers[1])}</th>
    </tr>
  </thead>
  <tbody>
    ${generic.rows
      .map(
        ([item, value]) => `<tr>
      <td>${escapeHtml(item)}</td>
      <td>${escapeHtml(value)}</td>
    </tr>`
      )
      .join('\n    ')}
  </tbody>
</table></div>`;

      return tableHtml;
    }

    return match;
  });

  return result;
};

// Extract headings and add IDs to HTML content
// Handles both proper h2/h3 tags AND bold text used as headings in older posts
export const processContentWithIds = (
  html: string
): { processedHtml: string; tocItems: TocItem[] } => {
  const tocItems: TocItem[] = [];
  
  // Check if content is Markdown (contains | pipes for tables or ## headings)
  // If yes, skip heuristic HTML table converter and let ReactMarkdown handle it
  const isMarkdown = /\|[^\n]+\||^#{1,3}\s+/m.test(html);
  
  // Only convert plain-text tables if content is NOT already Markdown
  let processedHtml = isMarkdown ? html : convertPlainTextTablesToHtml(html);

  // Pattern 1: Proper h2/h3 tags
  const headingRegex = /<(h[23])([^>]*)>(.*?)<\/\1>/gi;
  processedHtml = processedHtml.replace(headingRegex, (match, tag, attrs, content) => {
    const textContent = String(content).replace(/<[^>]*>/g, '').trim();
    const id = generateSlug(textContent) || `heading-${tocItems.length}`;
    const level = parseInt(String(tag).charAt(1));

    tocItems.push({ id, text: textContent, level });

    return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
  });

  // Pattern 2: <div><b>Title</b></div>, <p><b>Title</b></p>, <p><strong>Title</strong></p>
  const boldHeadingPatterns = [
    /<(div|p)(?:\s+[^>]*)?>\s*<(b|strong)>([\s\S]*?)<\/\2>\s*<\/\1>(?:\s*<(?:div|p)(?:\s+[^>]*)?>\s*<br\s*\/?\s*>\s*<\/(?:div|p)>)?/gi,
    /<h1[^>]*>\s*<(b|strong)>([\s\S]*?)<\/\1>\s*<\/h1>/gi,
  ];

  // Process bold headings in divs/p as h2 equivalents
  processedHtml = processedHtml.replace(boldHeadingPatterns[0], (match, tag, boldTag, content) => {
    const rawHtml = String(content ?? '').trim();
    const textContent = rawHtml.replace(/<[^>]*>/g, '').trim();

    if (textContent.length > 100 || !textContent) return match;

    const id = generateSlug(textContent) || `heading-${tocItems.length}`;
    tocItems.push({ id, text: textContent, level: 2 });

    return `<h2 id="${id}" class="font-bold">${rawHtml}</h2>`;
  });

  // Process h1 with bold/strong to h2
  processedHtml = processedHtml.replace(boldHeadingPatterns[1], (match, boldTag, content) => {
    const rawHtml = String(content ?? '').trim();
    const textContent = rawHtml.replace(/<[^>]*>/g, '').trim();
    if (!textContent) return match;

    const id = generateSlug(textContent) || `heading-${tocItems.length}`;
    tocItems.push({ id, text: textContent, level: 2 });

    return `<h2 id="${id}" class="font-bold">${rawHtml}</h2>`;
  });

  return { processedHtml, tocItems: [...tocItems] };
};
