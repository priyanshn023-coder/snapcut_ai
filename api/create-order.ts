type RazorpayRequest = { body?: { amount?: unknown; currency?: unknown } };

type RazorpayResponse = { statusCode: number; setHeader: (name: string, value: string) => void; end: (body: string) => void };

export default async function handler(request: RazorpayRequest, response: RazorpayResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if ((request as { method?: string }).method === 'OPTIONS') { response.statusCode = 204; response.end(''); return; }
  if ((request as { method?: string }).method !== 'POST') { response.statusCode = 405; response.end(JSON.stringify({ error: 'Method not allowed' })); return; }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const amount = request.body?.amount;
  const currency = typeof request.body?.currency === 'string' ? request.body.currency : 'INR';
  if (!keyId || !keySecret) { response.statusCode = 500; response.end(JSON.stringify({ error: 'Razorpay server credentials are not configured' })); return; }
  if (!Number.isInteger(amount) || (amount as number) <= 0 || (amount as number) > 100000000) { response.statusCode = 400; response.end(JSON.stringify({ error: 'Invalid payment amount' })); return; }

  try {
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency, receipt: `snapcut_${Date.now()}` }),
    });
    const result = await razorpayResponse.json();
    response.statusCode = razorpayResponse.ok ? 200 : 502;
    response.end(JSON.stringify(razorpayResponse.ok ? result : { error: result?.error?.description || 'Razorpay order creation failed' }));
  } catch { response.statusCode = 502; response.end(JSON.stringify({ error: 'Unable to reach Razorpay' })); }
}
