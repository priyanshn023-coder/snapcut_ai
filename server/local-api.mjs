import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';

const envPath = new URL('../.env', import.meta.url);
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*["']?(.*?)["']?\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

const port = Number(process.env.LOCAL_API_PORT || 8787);

async function createOrder(body) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required in .env');
  if (!Number.isInteger(body.amount) || body.amount <= 0 || body.amount > 100000000) throw new Error('Invalid payment amount');
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount: body.amount, currency: body.currency || 'INR', receipt: `snapcut_${Date.now()}` }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.error?.description || 'Razorpay order creation failed');
  return result;
}

createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (request.method === 'OPTIONS') { response.writeHead(204); response.end(); return; }
  if (request.method !== 'POST' || request.url !== '/api/create-order') { response.writeHead(404); response.end('Not found'); return; }
  try {
    let rawBody = '';
    for await (const chunk of request) rawBody += chunk;
    const result = await createOrder(JSON.parse(rawBody));
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(result));
  } catch (error) {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Order creation failed' }));
  }
}).listen(port, () => console.log(`Local payment API listening on http://localhost:${port}`));
