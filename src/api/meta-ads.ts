import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = process.env.META_ACCESS_TOKEN;
  const accountId = process.env.META_AD_ACCOUNT_ID;
  if (!token || !accountId) return res.status(500).json({ error: 'env vars missing' });
  const url = `https://graph.facebook.com/v19.0/${accountId}/insights?fields=campaign_name,impressions,clicks,spend,reach&date_preset=last_30d&level=campaign&access_token=${token}`;
  const response = await fetch(url);
  const data = await response.json();
  res.status(200).json(data);
}