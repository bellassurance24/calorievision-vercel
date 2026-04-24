import type { VercelRequest, VercelResponse } from '@vercel/node';

// Map dashboard filter names to Meta API date_preset values
const DATE_PRESET_MAP: Record<string, string> = {
  today:      'today',
  yesterday:  'yesterday',
  last7days:  'last_7d',
  last30days: 'last_30d',
  last90days: 'last_90d',
  thismonth:  'this_month',
  lastmonth:  'last_month',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = process.env.META_ACCESS_TOKEN;
  const rawAccountId = process.env.META_AD_ACCOUNT_ID;

  if (!token || !rawAccountId) {
    return res.status(500).json({ error: 'Meta env vars missing on server' });
  }

  const accountId = rawAccountId.startsWith('act_') ? rawAccountId : `act_${rawAccountId}`;
  const base = 'https://graph.facebook.com/v19.0';
  const type = req.query.type as string;

  const filterKey = (req.query.filter as string | undefined) ?? 'last7days';
  const dateFrom  = req.query.from as string | undefined;
  const dateTo    = req.query.to   as string | undefined;

  const buildTimeRange = (): string => {
    if (dateFrom && dateTo) {
      return `&time_range=${encodeURIComponent(JSON.stringify({ since: dateFrom, until: dateTo }))}`;
    }
    const preset = DATE_PRESET_MAP[filterKey] ?? 'last_7d';
    return `&date_preset=${preset}`;
  };

  const timeRange = buildTimeRange();

  try {
    if (type === 'campaigns') {
      const r = await fetch(
        `${base}/${accountId}/campaigns?fields=name,insights%7Bimpressions%2Cclicks%2Ccpc%2Cspend${encodeURIComponent(timeRange)}%7D&access_token=${token}`
      );
      const data = await r.json();
      return res.status(200).json(data);
    }

    if (type === 'insights') {
      const r = await fetch(
        `${base}/${accountId}/insights?fields=impressions%2Cclicks%2Cdate_start&time_increment=1${timeRange}&access_token=${token}`
      );
      const data = await r.json();
      return res.status(200).json(data);
    }

    return res.status(400).json({ error: 'type param required: campaigns or insights' });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
}