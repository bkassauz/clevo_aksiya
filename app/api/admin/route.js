import { NextResponse } from 'next/server';
import { db, getSetting, setSetting } from '@/lib/db';
import { checkLogin, makeCookie, isAdmin, hashPw, webhookSecret } from '@/lib/auth';
import { tg } from '@/lib/tg';
const day = d => new Date(d).toISOString().slice(0, 10);
const series = (rows, key = 'created_at', n = 14) => {
  const out = []; for (let i = n - 1; i >= 0; i--) out.push({ d: day(Date.now() - i * 864e5), v: 0 });
  rows.forEach(r => { const o = out.find(x => x.d === day(r[key])); if (o) o.v++; }); return out;
};
const H = {
  async me() { return { ok: true }; },
  async stats() {
    const [u, c, g, p, pt, cl] = await Promise.all(['users', 'codes', 'gifts', 'products', 'points', 'code_log'].map(t => db.from(t).select('*').limit(20000)));
    const users = u.data || [], codes = c.data || [], gifts = g.data || [], logs = cl.data || [];
    const sales = gifts.filter(x => x.source === 'market'), wins = gifts.filter(x => x.source === 'baraban');
    const pts = {}; sales.forEach(s => { const n = (pt.data || []).find(q => q.id === s.point_id)?.name || '—'; pts[n] = (pts[n] || 0) + 1; });
    const pz = {}; logs.filter(l => l.ok).forEach(l => pz[l.note] = (pz[l.note] || 0) + 1);
    return {
      cards: { users: users.length, codesUsed: codes.filter(x => x.used_by).length, codesLeft: codes.filter(x => !x.used_by).length, wins: wins.length,
        sales: sales.length, coinsTotal: users.reduce((s, x) => s + x.coins, 0), coinsSpent: sales.reduce((s, x) => s + x.cost, 0), products: (p.data || []).length, points: (pt.data || []).length, failed: logs.filter(l => !l.ok).length },
      series: { users: series(users), spins: series(logs.filter(l => l.ok)), sales: series(sales), failed: series(logs.filter(l => !l.ok)) },
      prizes: Object.entries(pz).map(([name, v]) => ({ name, v })), points: Object.entries(pts).map(([name, v]) => ({ name, v })),
    };
  },
  async prizes_get() { return { prizes: (await db.from('prizes').select('*').order('sort')).data }; },
  async prizes_save(b) {
    const rows = (b.prizes || []).filter(r => r.name).map((r, i) => ({ name: r.name, icon: r.icon || '🎁', percent: Number(r.percent) || 0, coins: parseInt(r.coins) || 0, sort: i }));
    if (rows.length < 2) return { error: 'Kamida 2 ta qism kerak' };
    await db.from('prizes').delete().gte('id', 0); await db.from('prizes').insert(rows); return { ok: true };
  },
  async bot_get() { const b = await getSetting('bot'); return { bot: b ? { username: b.username, name: b.name } : null }; },
  async bot_save(b, req) {
    const token = String(b.token || '').trim(); const me = await tg(token, 'getMe');
    if (!me.ok) return { error: 'Token noto‘g‘ri' };
    const base = req.nextUrl.origin;
    const w = await tg(token, 'setWebhook', { url: `${base}/api/tg?s=${webhookSecret()}`, allowed_updates: ['message'] });
    await tg(token, 'setChatMenuButton', { menu_button: { type: 'web_app', text: 'Clevo o‘yini', web_app: { url: base + '/app' } } });
    await setSetting('bot', { token, username: me.result.username, name: me.result.first_name });
    return { ok: w.ok, bot: { username: me.result.username, name: me.result.first_name } };
  },
  async products_list() { return { products: (await db.from('products').select('*').order('id', { ascending: false })).data }; },
  async product_save(b) {
    const r = { name: b.name, price: parseInt(b.price) || 0, image_url: b.image_url || null };
    if (!r.name || r.price <= 0) return { error: 'Nom va narxni kiriting' };
    if (b.id) await db.from('products').update(r).eq('id', b.id); else await db.from('products').insert(r); return { ok: true };
  },
  async product_del(b) { await db.from('products').delete().eq('id', b.id); return { ok: true }; },
  async upload(b) {
    const m = /^data:(image\/\w+);base64,(.+)$/.exec(b.data || ''); if (!m) return { error: 'Rasm noto‘g‘ri' };
    const path = Date.now() + '.' + m[1].split('/')[1];
    const { error } = await db.storage.from('products').upload(path, Buffer.from(m[2], 'base64'), { contentType: m[1] });
    if (error) return { error: error.message };
    return { url: db.storage.from('products').getPublicUrl(path).data.publicUrl };
  },
  async points_list() { return { points: (await db.from('points').select('*').order('id')).data }; },
  async point_save(b) {
    const r = { name: b.name, address: b.address, landmark: b.landmark };
    if (!r.name || !r.address) return { error: 'Nom va manzilni kiriting' };
    if (b.id) await db.from('points').update(r).eq('id', b.id); else await db.from('points').insert(r); return { ok: true };
  },
  async point_del(b) { await db.from('points').delete().eq('id', b.id); return { ok: true }; },
  async sales_list() {
    const [g, u, p] = await Promise.all([db.from('gifts').select('*').order('id', { ascending: false }).limit(500), db.from('users').select('tg_id,name,username'), db.from('points').select('*')]);
    return { gifts: g.data.map(x => ({ ...x, user: u.data.find(q => q.tg_id === x.tg_id), point: p.data.find(q => q.id === x.point_id) })) };
  },
  async gift_status(b) { if (!['yetkazilmoqda', 'tayyor', 'topshirildi'].includes(b.status)) return { error: 'status' }; await db.from('gifts').update({ status: b.status }).eq('id', b.id); return { ok: true }; },
  async codes_gen(b) {
    const n = Math.min(Math.max(parseInt(b.n) || 0, 1), 2000), A = 'ABCDEFGHJKLMNPQRSTUVWXYZ', D = '23456789', rows = [];
    for (let i = 0; i < n; i++) { let c = ''; for (let k = 0; k < 3; k++) c += A[Math.random() * A.length | 0] + D[Math.random() * D.length | 0]; rows.push({ code: c }); }
    await db.from('codes').upsert(rows, { onConflict: 'code', ignoreDuplicates: true }); return { ok: true, codes: rows.map(r => r.code) };
  },
  async codes_list() { const { data } = await db.from('codes').select('*').order('created_at', { ascending: false }).limit(300); return { codes: data }; },
  async creds(b) {
    if (!(await checkLogin(b.old_login, b.old_password))) return { error: 'Eski login yoki parol xato' };
    if (!b.login || (b.password || '').length < 8) return { error: 'Parol kamida 8 belgi bo‘lsin' };
    await setSetting('admin', { login: b.login, ...hashPw(b.password) }); return { ok: true };
  },
};
export async function POST(req) {
  const b = await req.json();
  if (b.a === 'login') {
    if (!(await checkLogin(b.login, b.password))) return NextResponse.json({ ok: false, error: 'Login yoki parol xato' }, { status: 401 });
    const r = NextResponse.json({ ok: true }); r.cookies.set('adm', makeCookie(), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 604800 }); return r;
  }
  if (b.a === 'logout') { const r = NextResponse.json({ ok: true }); r.cookies.delete('adm'); return r; }
  if (!isAdmin()) return NextResponse.json({ error: 'auth' }, { status: 401 });
  if (!H[b.a]) return NextResponse.json({ error: 'unknown' }, { status: 400 });
  return NextResponse.json(await H[b.a](b, req));
}
