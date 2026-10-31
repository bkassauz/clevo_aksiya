'use client';
import { useEffect, useState } from 'react';
import Wheel from '@/components/Wheel';
const call = async b => { const r = await fetch('/api/admin', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) }); return r.json(); };
const ICONS = ['🧴', '🍽️', '🧼', '🧺', '📺', '📱', '🪙', '🎁', '🏷️', '⚡', '💻', '🎧'];
const TABS = [['dash', '📊', 'Dashboard'], ['wheel', '🎡', 'Baraban'], ['bot', '🤖', 'Bot nazorati'], ['market', '🛒', 'Clevo Market'], ['points', '📍', 'Sotuv nuqtalari'], ['codes', '🔑', 'Kodlar'], ['analytics', '📈', 'Analitika'], ['settings', '⚙️', 'Sozlamalar']];
const ST = { yetkazilmoqda: 'Yetkazilmoqda', tayyor: 'Yetkazib berildi', topshirildi: 'Topshirildi' };

function Bars({ data, onClick, color = '#2aa59a' }) {
  const m = Math.max(1, ...data.map(x => x.v)), w = 100 / data.length;
  return <svg viewBox="0 0 100 44" style={{ width: '100%', cursor: 'pointer' }} onClick={onClick}>{data.map((x, i) => <g key={i}><rect x={i * w + 1} y={36 - (x.v / m) * 32} width={w - 2} height={(x.v / m) * 32 + .5} rx="1" fill={color} /><text x={i * w + w / 2} y="42" fontSize="3" textAnchor="middle" fill="#567">{x.d.slice(8)}</text></g>)}</svg>;
}
function Donut({ data, onClick }) {
  const t = data.reduce((s, x) => s + x.v, 0) || 1, C = ['#2aa59a', '#f2c24a', '#e5484d', '#6c8cff', '#9b6bd1', '#58c27d', '#ff9a5c']; let acc = 0;
  return <div onClick={onClick} style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', cursor: 'pointer' }}>
    <svg viewBox="-1 -1 2 2" width="150" style={{ transform: 'rotate(-90deg)' }}>{data.map((x, i) => { const a0 = acc / t * 6.2832; acc += x.v; const a1 = acc / t * 6.2832, l = a1 - a0 > 3.14 ? 1 : 0;
      return <path key={i} d={`M${Math.cos(a0)} ${Math.sin(a0)}A1 1 0 ${l} 1 ${Math.cos(a1 - .001)} ${Math.sin(a1 - .001)}L0 0Z`} fill={C[i % C.length]} />; })}<circle r=".55" fill="#fff" /></svg>
    <div>{data.length === 0 && 'Ma’lumot yo‘q'}{data.map((x, i) => <div key={i}><span style={{ color: C[i % C.length] }}>●</span> {x.name}: <b>{x.v}</b></div>)}</div></div>;
}
function Modal({ title, onClose, children }) { return <div className="modal" onClick={onClose}><div className="sheet" onClick={e => e.stopPropagation()}><div className="row" style={{ marginBottom: 10 }}><b>{title}</b><button className="btn sm" onClick={onClose}>✕</button></div>{children}</div></div>; }

function Login({ onOk }) {
  const [l, setL] = useState(''), [p, setP] = useState(''), [see, setSee] = useState(false), [err, setErr] = useState('');
  const go = async e => { e.preventDefault(); const r = await call({ a: 'login', login: l, password: p }); r.ok ? onOk() : setErr(r.error); };
  return <div className="bg login"><form className="card frm" style={{ width: '100%', maxWidth: 360, padding: 24 }} onSubmit={go}>
    <div style={{ textAlign: 'center' }}><span className="coin" style={{ margin: '0 auto 8px', width: 54, height: 54, fontSize: 26 }}>C</span><h2>Clevo Admin</h2></div>
    <input className="input" placeholder="Login" value={l} onChange={e => setL(e.target.value)} autoComplete="username" />
    <div className="pw"><input className="input" type={see ? 'text' : 'password'} placeholder="Parol" value={p} onChange={e => setP(e.target.value)} autoComplete="current-password" /><button type="button" onClick={() => setSee(!see)} aria-label="Parolni ko‘rsatish">{see ? '🙈' : '👁️'}</button></div>
    {err && <small style={{ color: 'var(--red)' }}>{err}</small>}<button className="btn">Kirish</button></form></div>;
}

function Dash({ s, open }) {
  const c = s.cards, items = [['👥', 'Bot foydalanuvchilari', c.users], ['🔑', 'Ishlatilgan kodlar', c.codesUsed], ['🎁', 'Berilgan sovg‘alar', c.wins], ['🛒', 'Market xaridlari', c.sales], ['🪙', 'Aylanmadagi coin', c.coinsTotal], ['💸', 'Sarflangan coin', c.coinsSpent], ['🔓', 'Ishlatilmagan kodlar', c.codesLeft], ['⚠️', 'Xato kod urinishlari', c.failed]];
  return <><div className="stats">{items.map(([i, t, v]) => <div className="stat" key={t} onClick={() => open('analytics')}>{i}<b>{v.toLocaleString()}</b>{t}</div>)}</div>
    <div className="panel"><b>Oxirgi 14 kun: barabanlar</b><Bars data={s.series.spins} /></div></>;
}

function WheelTab() {
  const [rows, setRows] = useState([]), [msg, setMsg] = useState('');
  useEffect(() => { call({ a: 'prizes_get' }).then(r => setRows(r.prizes)); }, []);
  const set = (i, k, v) => setRows(rows.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const total = rows.reduce((s, r) => s + (Number(r.percent) || 0), 0);
  const save = async () => { const r = await call({ a: 'prizes_save', prizes: rows }); setMsg(r.error || 'Saqlandi ✓'); };
  return <><div className="panel"><div className="row"><b>Baraban qismlari: {rows.length}</b><span>Jami foiz: <b style={{ color: total === 100 ? 'var(--ok)' : 'var(--red)' }}>{total}%</b></span></div>
    {rows.map((r, i) => <div key={i} className="frm cols" style={{ margin: '10px 0', alignItems: 'center' }}>
      <input className="input" placeholder="Sovg‘a nomi" value={r.name} onChange={e => set(i, 'name', e.target.value)} />
      <select className="ico" value={r.icon} onChange={e => set(i, 'icon', e.target.value)}>{ICONS.map(x => <option key={x}>{x}</option>)}</select>
      <input className="input" type="number" placeholder="Foiz %" value={r.percent} onChange={e => set(i, 'percent', e.target.value)} />
      <input className="input" type="number" placeholder="Coin (0 = buyum)" value={r.coins} onChange={e => set(i, 'coins', e.target.value)} />
      <button className="btn red sm" onClick={() => setRows(rows.filter((_, j) => j !== i))}>O‘chirish</button></div>)}
    <div className="row" style={{ justifyContent: 'flex-start' }}><button className="btn sm" onClick={() => setRows([...rows, { name: '', icon: '🎁', percent: 0, coins: 0 }])}>+ Qism qo‘shish</button><button className="btn dark sm" onClick={save}>Saqlash</button><span>{msg}</span></div></div>
    <div className="panel" style={{ display: 'grid', placeItems: 'center', background: 'var(--teal)' }}><Wheel prizes={rows} size={280} /></div></>;
}

function BotTab() {
  const [bot, setBot] = useState(null), [t, setT] = useState(''), [msg, setMsg] = useState('');
  useEffect(() => { call({ a: 'bot_get' }).then(r => setBot(r.bot)); }, []);
  const save = async () => { const r = await call({ a: 'bot_save', token: t }); if (r.error) return setMsg(r.error); setBot(r.bot); setT(''); setMsg(r.ok ? 'Mini app yaratildi ✓' : 'Webhook o‘rnatilmadi'); };
  return <div className="panel frm">{bot && <div className="card">✅ Ulangan bot: <b>@{bot.username}</b><br /><small>QR kod havolasi: https://t.me/{bot.username}?start=1</small></div>}
    <b>BotFather tokeni</b><input className="input" placeholder="123456:ABC-DEF..." value={t} onChange={e => setT(e.target.value)} /><button className="btn" onClick={save}>{bot ? 'Tokenni yangilash' : 'Botni ulash va mini app yaratish'}</button><span>{msg}</span></div>;
}

function MarketTab() {
  const [sub, setSub] = useState('p'), [ps, setPs] = useState([]), [f, setF] = useState(null), [sales, setSales] = useState([]), [msg, setMsg] = useState('');
  const load = async () => { setPs((await call({ a: 'products_list' })).products); setSales((await call({ a: 'sales_list' })).gifts); }; useEffect(() => { load(); }, []);
  const file = e => { const x = e.target.files[0]; if (!x) return; const r = new FileReader(); r.onload = async () => { setMsg('Yuklanmoqda...'); const u = await call({ a: 'upload', data: r.result }); u.error ? setMsg(u.error) : (setF(o => ({ ...o, image_url: u.url })), setMsg('')); }; r.readAsDataURL(x); };
  const save = async () => { const r = await call({ a: 'product_save', ...f }); r.error ? setMsg(r.error) : (setF(null), setMsg(''), load()); };
  return <><div className="row" style={{ justifyContent: 'flex-start', marginBottom: 12 }}><button className={'btn sm' + (sub === 'p' ? '' : ' dark')} onClick={() => setSub('p')}>Mahsulotlar</button><button className={'btn sm' + (sub === 's' ? '' : ' dark')} onClick={() => setSub('s')}>Sotuvlar tarixi</button></div>
    {sub === 'p' && <><button className="btn" onClick={() => setF({ name: '', price: '', image_url: '' })}>+ Mahsulot qo‘shish</button>
      <div className="stats" style={{ marginTop: 14 }}>{ps.map(p => <div className="panel" key={p.id} style={{ margin: 0 }}>{p.image_url && <img src={p.image_url} alt="" style={{ width: '100%', aspectRatio: 1, objectFit: 'cover', borderRadius: 12 }} />}<b>{p.name}</b><div>{p.price} coin</div>
        <div className="row"><button className="btn sm" onClick={() => setF(p)}>Tahrir</button><button className="btn red sm" onClick={async () => { if (confirm('O‘chirilsinmi?')) { await call({ a: 'product_del', id: p.id }); load(); } }}>✕</button></div></div>)}</div></>}
    {sub === 's' && <div className="panel" style={{ overflowX: 'auto' }}><table className="tbl"><thead><tr><th>#Chek</th><th>Mijoz</th><th>Mahsulot</th><th>Coin</th><th>Nuqta</th><th>Holat</th></tr></thead><tbody>
      {sales.map(g => <tr key={g.id}><td>{g.id}</td><td>{g.user?.name || g.user?.username || g.tg_id}</td><td>{g.title}{g.source === 'baraban' && ' (yutuq)'}</td><td>{g.cost || '—'}</td><td>{g.point?.name || '—'}</td>
        <td><select className="input" value={g.status} onChange={async e => { await call({ a: 'gift_status', id: g.id, status: e.target.value }); load(); }}>{Object.entries(ST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></td></tr>)}</tbody></table></div>}
    {f && <Modal title={f.id ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'} onClose={() => setF(null)}><div className="frm">
      {f.image_url && <img src={f.image_url} alt="" style={{ width: 120, borderRadius: 12 }} />}<input type="file" accept="image/*" onChange={file} />
      <input className="input" placeholder="Mahsulot nomi" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /><input className="input" type="number" placeholder="Narxi (coin)" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} />
      <small style={{ color: 'var(--red)' }}>{msg}</small><button className="btn" onClick={save}>Saqlash</button></div></Modal>}</>;
}

function PointsTab() {
  const [ps, setPs] = useState([]), [f, setF] = useState(null), [msg, setMsg] = useState('');
  const load = async () => setPs((await call({ a: 'points_list' })).points); useEffect(() => { load(); }, []);
  const save = async () => { const r = await call({ a: 'point_save', ...f }); r.error ? setMsg(r.error) : (setF(null), setMsg(''), load()); };
  return <><button className="btn" onClick={() => setF({ name: '', address: '', landmark: '' })}>+ Sotuv nuqtasi qo‘shish</button>
    <div className="panel" style={{ marginTop: 14, overflowX: 'auto' }}><table className="tbl"><thead><tr><th>Joylashuv</th><th>Manzil</th><th>Mo‘ljal</th><th /></tr></thead><tbody>{ps.map(p => <tr key={p.id}><td>{p.name}</td><td>{p.address}</td><td>{p.landmark}</td><td><button className="btn sm" onClick={() => setF(p)}>Tahrir</button> <button className="btn red sm" onClick={async () => { if (confirm('O‘chirilsinmi?')) { await call({ a: 'point_del', id: p.id }); load(); } }}>✕</button></td></tr>)}</tbody></table></div>
    {f && <Modal title="Sotuv nuqtasi" onClose={() => setF(null)}><div className="frm">{[['name', 'Joylashuv nomi'], ['address', 'Lokatsiya / manzil'], ['landmark', 'Mo‘ljal']].map(([k, ph]) => <input key={k} className="input" placeholder={ph} value={f[k] || ''} onChange={e => setF({ ...f, [k]: e.target.value })} />)}
      <small style={{ color: 'var(--red)' }}>{msg}</small><button className="btn" onClick={save}>Saqlash</button></div></Modal>}</>;
}

function CodesTab() {
  const [n, setN] = useState(100), [cs, setCs] = useState([]), [bot, setBot] = useState(null);
  const load = async () => setCs((await call({ a: 'codes_list' })).codes); useEffect(() => { load(); call({ a: 'bot_get' }).then(r => setBot(r.bot)); }, []);
  const gen = async () => { const r = await call({ a: 'codes_gen', n }); const u = bot ? `https://t.me/${bot.username}?start=` : ''; const csv = 'code,qr_link\n' + r.codes.map(c => `${c},${u}${c}`).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'clevo-kodlar.csv'; a.click(); load(); };
  return <><div className="panel row" style={{ justifyContent: 'flex-start' }}><input className="input" style={{ maxWidth: 140 }} type="number" value={n} onChange={e => setN(e.target.value)} /><button className="btn" onClick={gen}>Kod yaratish (CSV yuklanadi)</button></div>
    <div className="panel" style={{ overflowX: 'auto' }}><table className="tbl"><thead><tr><th>Kod</th><th>Holat</th></tr></thead><tbody>{cs.map(c => <tr key={c.code}><td>{c.code}</td><td>{c.used_by ? 'Ishlatilgan' : 'Bo‘sh'}</td></tr>)}</tbody></table></div></>;
}

function Analytics({ s }) {
  const [m, setM] = useState(null), S = s.series;
  const show = (t, d) => setM({ t, d });
  return <><div className="panel"><b>Yangi foydalanuvchilar</b><Bars data={S.users} onClick={() => show('Yangi foydalanuvchilar', S.users)} /></div>
    <div className="panel"><b>Baraban aylantirishlar</b><Bars data={S.spins} color="#f2c24a" onClick={() => show('Baraban aylantirishlar', S.spins)} /></div>
    <div className="panel"><b>Market xaridlari</b><Bars data={S.sales} color="#6c8cff" onClick={() => show('Market xaridlari', S.sales)} /></div>
    <div className="panel"><b>Xato kod urinishlari</b><Bars data={S.failed} color="#e5484d" onClick={() => show('Xato kod urinishlari', S.failed)} /></div>
    <div className="panel"><b>Yutuqlar taqsimoti</b><Donut data={s.prizes} onClick={() => show('Yutuqlar', s.prizes.map(x => ({ d: x.name, v: x.v })))} /></div>
    <div className="panel"><b>Sotuv nuqtalari bo‘yicha xaridlar</b><Donut data={s.points} onClick={() => show('Nuqtalar', s.points.map(x => ({ d: x.name, v: x.v })))} /></div>
    {m && <Modal title={m.t} onClose={() => setM(null)}><table className="tbl"><tbody>{m.d.map((x, i) => <tr key={i}><td>{x.d}</td><td><b>{x.v}</b></td></tr>)}</tbody></table></Modal>}</>;
}

function Settings() {
  const [f, setF] = useState({ old_login: '', old_password: '', login: '', password: '' }), [msg, setMsg] = useState(''), [see, setSee] = useState(false);
  const save = async () => { const r = await call({ a: 'creds', ...f }); setMsg(r.error || 'Yangilandi ✓'); };
  return <div className="panel frm"><b>Login va parolni yangilash</b>
    <input className="input" placeholder="Joriy login" value={f.old_login} onChange={e => setF({ ...f, old_login: e.target.value })} />
    <input className="input" type="password" placeholder="Joriy parol" value={f.old_password} onChange={e => setF({ ...f, old_password: e.target.value })} />
    <input className="input" placeholder="Yangi login" value={f.login} onChange={e => setF({ ...f, login: e.target.value })} />
    <div className="pw"><input className="input" type={see ? 'text' : 'password'} placeholder="Yangi parol (kamida 8 belgi)" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /><button type="button" onClick={() => setSee(!see)}>{see ? '🙈' : '👁️'}</button></div>
    <button className="btn" onClick={save}>Saqlash</button><span>{msg}</span></div>;
}

export default function Admin() {
  const [ok, setOk] = useState(null), [tab, setTab] = useState('dash'), [side, setSide] = useState(false), [s, setS] = useState(null);
  useEffect(() => { call({ a: 'me' }).then(r => setOk(!!r.ok)); }, []);
  useEffect(() => { if (ok) call({ a: 'stats' }).then(setS); }, [ok, tab]);
  if (ok === null) return <div className="bg" />;
  if (!ok) return <Login onOk={() => setOk(true)} />;
  const go = t => { setTab(t); setSide(false); };
  return <div className="bg"><div className="adm">
    {side && <div className="scrim" onClick={() => setSide(false)} />}
    <div className={'side' + (side ? ' open' : '')}><div className="row" style={{ marginBottom: 18 }}><b style={{ fontSize: 20 }}>Clevo Admin</b><span className="coin">C</span></div>
      {TABS.map(([k, i, t]) => <div key={k} className={'mi' + (tab === k ? ' on' : '')} onClick={() => go(k)}><span style={{ fontSize: 22 }}>{i}</span>{t}</div>)}
      <div className="mi" onClick={async () => { await call({ a: 'logout' }); setOk(false); }}><span style={{ fontSize: 22 }}>🚪</span>Chiqish</div></div>
    <div><div className="top"><button className="burger admburger" onClick={() => setSide(true)} aria-label="Menyu"><i /><i /><i /></button><div className="title" style={{ margin: '0 auto' }}>{TABS.find(t => t[0] === tab)[2]}</div><span style={{ width: 46 }} /></div>
      <div className="main">{tab === 'dash' && s && <Dash s={s} open={go} />}{tab === 'wheel' && <WheelTab />}{tab === 'bot' && <BotTab />}{tab === 'market' && <MarketTab />}{tab === 'points' && <PointsTab />}{tab === 'codes' && <CodesTab />}{tab === 'analytics' && s && <Analytics s={s} />}{tab === 'settings' && <Settings />}</div></div>
  </div></div>;
}
