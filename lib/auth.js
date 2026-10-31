import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getSetting } from './db';
const sign = p => crypto.createHmac('sha256', process.env.SESSION_SECRET).update(p).digest('hex');
export const hashPw = (pw, salt = crypto.randomBytes(8).toString('hex')) => ({ salt, hash: crypto.scryptSync(pw, salt, 32).toString('hex') });
export async function checkLogin(l, p) {
  const a = await getSetting('admin');
  if (a) return l === a.login && crypto.scryptSync(p || '', a.salt, 32).toString('hex') === a.hash;
  return l === process.env.ADMIN_LOGIN && p === process.env.ADMIN_PASSWORD;
}
export const makeCookie = () => { const e = String(Date.now() + 7 * 864e5); return e + '.' + sign(e); };
export function isAdmin() {
  const c = cookies().get('adm')?.value; if (!c) return false;
  const [e, s] = c.split('.'); return s === sign(e) && +e > Date.now();
}
export const webhookSecret = () => crypto.createHash('sha256').update(process.env.SESSION_SECRET).digest('hex').slice(0, 24);
