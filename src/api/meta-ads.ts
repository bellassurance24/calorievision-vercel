import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = process.env.META_ACCESS_TOKEN;
  const rawAccountId = process.env.META_AD_ACCOUNT_ID;

  if (!token || !rawAccountId) {
    return res.status(500).json({ error: 'Meta env vars missing on server' });
  }

  const accountId = rawAccountId.startsWith('act_') ? rawAccountId : `act_${rawAccountId}`;
  const base = 'https://graph.facebook.com/v19.0';
  const type = req.query.type;

  try {
    if (type === 'campaigns') {
      const r = await fetch(
        `${base}/${accountId}/campaigns?fields=name,insights%7Bimpressions%2Cclicks%2Ccpc%2Cspend%7D&access_token=${token}`
      );
      const data = await r.json();
      return res.status(200).json(data);
    }

    if (type === 'insights') {
      const r = await fetch(
        `${base}/${accountId}/insights?fields=impressions%2Cclicks%2Cdate_start&time_increment=1&date_preset=last_7_days&access_token=${token}`
      );
      const data = await r.json();
      return res.status(200).json(data);
    }

    return res.status(400).json({ error: 'type param required: campaigns or insights' });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
