import { NextResponse } from 'next/server';
import { db, getSetting } from '@/lib/db';
import { verifyInit } from '@/lib/tg';
const J = (d, s = 200) => NextResponse.json(d, { status: s });
export async function POST(req) {
  const b = await req.json(); const bot = await getSetting('bot');
  const tu = verifyInit(b.initData, bot?.token);
  if (!tu) return J({ error: 'Telegram orqali oching' }, 401);
  const id = tu.id;
  let { data: me } = await db.from('users').select('*').eq('tg_id', id).maybeSingle();
  if (!me) { await db.from('users').insert({ tg_id: id, username: tu.username || null, coins: 0 }); me = { tg_id: id, name: null, coins: 0 }; }
  const a = b.a;
  if (a === 'me') {
    const { data: prizes } = await db.from('prizes').select('*').order('sort');
    const { count } = await db.from('gifts').select('id', { count: 'exact', head: true }).eq('tg_id', id).eq('status', 'tayyor');
    return J({ me, prizes, ready: count || 0 });
  }
  if (a === 'setname') { const n = String(b.name || '').trim().slice(0, 60); if (n.length < 3) return J({ error: 'Ism familiyani yozing' }, 400);
    await db.from('users').update({ name: n }).eq('tg_id', id); return J({ ok: true }); }
  if (a === 'spin') {
    const code = String(b.code || '').trim().toUpperCase();
    const log = (ok, note) => db.from('code_log').insert({ tg_id: id, code, ok, note });
    const { data: used } = await db.from('codes').update({ used_by: id, used_at: new Date().toISOString() }).eq('code', code).is('used_by', null).select();
    if (!used?.length) { await log(false, 'Xato yoki ishlatilgan kod'); return J({ error: 'Kod noto‘g‘ri yoki oldin ishlatilgan' }, 400); }
    const { data: prizes } = await db.from('prizes').select('*').order('sort');
    const total = prizes.reduce((s, p) => s + Number(p.percent), 0); let r = Math.random() * total, i = 0;
    for (; i < prizes.length - 1; i++) { r -= Number(prizes[i].percent); if (r < 0) break; }
    const p = prizes[i];
    if (p.coins > 0) await db.from('users').update({ coins: me.coins + p.coins }).eq('tg_id', id);
    else await db.from('gifts').insert({ tg_id: id, title: p.name, icon: p.icon, source: 'baraban', status: 'yetkazilmoqda' });
    await log(true, p.name);
    return J({ index: i, prize: p, coins: me.coins + (p.coins || 0) });
  }
  if (a === 'codes') return J((await db.from('code_log').select('*').eq('tg_id', id).order('id', { ascending: false }).limit(100)).data);
  if (a === 'gifts') { const { data: pts } = await db.from('points').select('*');
    const { data } = await db.from('gifts').select('*').eq('tg_id', id).order('id', { ascending: false });
    return J(data.map(g => ({ ...g, point: pts.find(p => p.id === g.point_id) || null }))); }
  if (a === 'market') return J({ products: (await db.from('products').select('*').order('id', { ascending: false })).data, points: (await db.from('points').select('*')).data });
  if (a === 'buy') {
    const { data: pr } = await db.from('products').select('*').eq('id', b.product_id).maybeSingle();
    if (!pr || !b.point_id) return J({ error: 'Mahsulot yoki sotuv nuqtasi tanlanmadi' }, 400);
    if (me.coins < pr.price) return J({ error: 'Coin yetarli emas' }, 400);
    const { data: ok } = await db.from('users').update({ coins: me.coins - pr.price }).eq('tg_id', id).eq('coins', me.coins).select();
    if (!ok?.length) return J({ error: 'Qayta urinib ko‘ring' }, 409);
    await db.from('gifts').insert({ tg_id: id, title: pr.name, image_url: pr.image_url, source: 'market', cost: pr.price, point_id: b.point_id, status: 'yetkazilmoqda' });
    return J({ ok: true, coins: me.coins - pr.price });
  }
  return J({ error: 'unknown' }, 400);
}
