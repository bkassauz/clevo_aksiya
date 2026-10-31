import crypto from 'crypto';
export function verifyInit(initData, token) {
  if (!initData || !token) return null;
  const p = new URLSearchParams(initData); const h = p.get('hash'); p.delete('hash');
  const str = [...p.entries()].map(([k, v]) => k + '=' + v).sort().join('\n');
  const key = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
  if (crypto.createHmac('sha256', key).update(str).digest('hex') !== h) return null;
  try { return JSON.parse(p.get('user')); } catch { return null; }
}
export const tg = (token, m, b) => fetch(`https://api.telegram.org/bot${token}/${m}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b || {}) }).then(r => r.json());
