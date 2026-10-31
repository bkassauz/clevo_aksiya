'use client';
import { useEffect, useState } from 'react';
import Wheel, { nextRot } from '@/components/Wheel';
const call = async b => { const r = await fetch('/api/app', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...b, initData: window.Telegram?.WebApp?.initData || '' }) }); return r.json(); };
const fmt = d => new Date(d).toLocaleString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const ST = { yetkazilmoqda: ['Yetkazilmoqda', 'wait'], tayyor: ['Sizni kutyapti', 'bad'], topshirildi: ['Topshirildi', ''] };

export default function MiniApp() {
  const [d, setD] = useState(null), [view, setView] = useState('wheel'), [menu, setMenu] = useState(false), [rot, setRot] = useState(0);
  const [code, setCode] = useState(''), [busy, setBusy] = useState(false), [toast, setToast] = useState(''), [name, setName] = useState('');
  const [list, setList] = useState([]), [mk, setMk] = useState({ products: [], points: [] }), [pick, setPick] = useState(null), [point, setPoint] = useState(''), [zoom, setZoom] = useState(null), [tilt, setTilt] = useState([0, 0]);
  const say = t => { setToast(t); setTimeout(() => setToast(''), 3200); };
  const load = async () => { const r = await call({ a: 'me' }); if (r.error) setD({ error: r.error }); else setD(r); };
  useEffect(() => { const w = window.Telegram?.WebApp; w?.ready(); w?.expand(); load(); }, []);
  if (!d) return <div className="bg" />;
  if (d.error) return <div className="bg" style={{ display: 'grid', placeItems: 'center', color: '#fff', padding: 24, textAlign: 'center' }}>{d.error}</div>;
  const { me, prizes } = d;
  const go = async v => { setMenu(false); setView(v); if (v === 'codes') setList(await call({ a: 'codes' })); if (v === 'gifts') { setList(await call({ a: 'gifts' })); load(); } if (v === 'market') setMk(await call({ a: 'market' })); };
  const saveName = async () => { const r = await call({ a: 'setname', name }); r.error ? say(r.error) : load(); };
  const spin = async () => {
    if (busy || !code.trim()) return; setBusy(true);
    const r = await call({ a: 'spin', code });
    if (r.error) { say(r.error); setBusy(false); return; }
    setRot(x => nextRot(x, r.index, prizes.length));
    setTimeout(() => { setD(x => ({ ...x, me: { ...x.me, coins: r.coins } })); say(r.prize.coins > 0 ? `🎉 +${r.prize.coins} coin yutdingiz!` : `🎉 Siz yutdingiz: ${r.prize.name}`); setCode(''); setBusy(false); }, 4700);
  };
  const buy = async () => { const r = await call({ a: 'buy', product_id: pick.id, point_id: Number(point) }); if (r.error) return say(r.error);
    setD(x => ({ ...x, me: { ...x.me, coins: r.coins } })); setPick(null); say('Buyurtma qabul qilindi'); go('gifts'); };

  if (!me.name) return (
    <div className="bg" style={{ display: 'grid', placeItems: 'center', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 380, display: 'grid', gap: 12 }}>
        <h2>Xush kelibsiz!</h2><p>Ism va familiyangizni yozing</p>
        <input className="input" placeholder="Ism Familiya" value={name} onChange={e => setName(e.target.value)} />
        <button className="btn" onClick={saveName}>Davom etish</button>
      </div>{toast && <div className="toast">{toast}</div>}</div>);

  const Item = ({ icon, t, s, v }) => <div className={'mi' + (view === v ? ' on' : '')} onClick={() => go(v)}><span style={{ fontSize: 24 }}>{icon}</span><div>{t}<small>{s}</small></div>{v === 'gifts' && d.ready > 0 && <span className="dot">{d.ready}</span>}</div>;
  return (
    <div className="bg">
      {menu && <div className="scrim" onClick={() => setMenu(false)} />}
      <div className={'drawer' + (menu ? ' open' : '')}>
        <div style={{ fontWeight: 800, marginBottom: 14 }}>👤 {me.name}</div>
        <Item icon="🕒" t="Kodlar" s="Ko‘rish tarixi" v="codes" /><Item icon="🎁" t="Sovg‘alarim" s="Yutilgan sovg‘alar" v="gifts" /><Item icon="🛒" t="Clevo Market" s="Coinlarga xarid qilish" v="market" />
        <div className="mi" onClick={() => go('wheel')}><span style={{ fontSize: 24 }}>🎡</span><div>Baraban</div></div>
      </div>
      <div className="top">
        <button className="burger" onClick={() => setMenu(true)} aria-label="Menyu"><i /><i /><i /></button>
        <div className="coins">COINS: <b>{me.coins.toLocaleString()}</b><span className="coin">C</span></div><span style={{ width: 46 }} />
      </div>

      {view === 'wheel' && <><div className="wheelbox" style={{ paddingTop: 34 }}><Wheel prizes={prizes} rot={rot} size={Math.min(340, window.innerWidth - 40)} /></div>
        <div className="codebar"><input placeholder="Etiketkadagi kodni kiriting..." value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && spin()} /><button className="btn" disabled={busy} onClick={spin}>SUBMIT</button></div></>}

      {view === 'codes' && <><div className="title">Kodlar tarixi</div><div className="list">{list.length === 0 && <div className="card">Hali kod kiritilmagan</div>}
        {list.map?.(c => <div className="card row" key={c.id}><div><small>{fmt(c.created_at)}</small><div style={{ fontWeight: 800 }}>{c.code}</div></div><span className={'tag' + (c.ok ? '' : ' bad')}>{c.ok ? 'MUVAFFAQIYATLI' : 'XATO KOD'}</span></div>)}</div></>}

      {view === 'gifts' && <><div className="title">Sovg‘alarim</div><div className="list">{list.length === 0 && <div className="card">Hozircha sovg‘a yo‘q</div>}
        {list.map?.(g => { const [l, c] = ST[g.status] || ST.yetkazilmoqda; return (
          <div className="card" key={g.id} style={g.status === 'tayyor' ? { border: '2px solid var(--red)' } : null}>
            <div className="row"><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{g.image_url ? <img src={g.image_url} alt="" width="46" height="46" style={{ borderRadius: 10, objectFit: 'cover' }} /> : <span style={{ fontSize: 34 }}>{g.icon || '🎁'}</span>}<div><b>{g.title}</b><br /><small>{fmt(g.created_at)} · {g.source === 'market' ? `${g.cost} coin` : 'Barabandan'}</small></div></div><span className={'tag ' + c}>{l}</span></div>
            {g.status === 'tayyor' && <div style={{ marginTop: 10, color: 'var(--red)', fontWeight: 700 }}>🔴 Mahsulot sizni kutyapti{g.point ? `: ${g.point.name}, ${g.point.address}` : ''}. Chek raqami: #{g.id}</div>}
            {g.point && g.status !== 'tayyor' && <small>📍 {g.point.name} · chek #{g.id}</small>}
          </div>); })}</div></>}

      {view === 'market' && <><div className="title">Clevo Market</div><div className="grid2">{mk.products?.length === 0 && <div className="card">Mahsulotlar hali qo‘shilmagan</div>}
        {mk.products?.map(p => <div className="card" key={p.id}><img className="pimg" src={p.image_url || ''} alt={p.name} onClick={() => setZoom(p)} /><div style={{ margin: '8px 0', fontSize: 14, fontWeight: 700 }}>{p.name}</div><div style={{ fontSize: 13, marginBottom: 8 }}>{p.price} COINS</div>
          <button className="btn sm" style={{ width: '100%' }} onClick={() => { setPick(p); setPoint(''); }}>SOTIB OLISH</button></div>)}</div></>}

      {pick && <div className="modal" onClick={() => setPick(null)}><div className="sheet" onClick={e => e.stopPropagation()} style={{ display: 'grid', gap: 12 }}>
        <b>{pick.name} — {pick.price} coin</b><p>Qaysi sotuv nuqtasidan olasiz?</p>
        <select className="input" value={point} onChange={e => setPoint(e.target.value)}><option value="">Tanlang...</option>{mk.points.map(p => <option key={p.id} value={p.id}>{p.name} — {p.address}</option>)}</select>
        {point && <small>{mk.points.find(p => p.id == point)?.landmark && '📍 Mo‘ljal: ' + mk.points.find(p => p.id == point).landmark}</small>}
        <button className="btn" disabled={!point} onClick={buy}>Buyurtma berish</button></div></div>}

      {zoom && <div className="modal" onClick={() => setZoom(null)} onPointerMove={e => setTilt([(e.clientX / innerWidth - .5) * 50, -(e.clientY / innerHeight - .5) * 30])}>
        <div style={{ perspective: 800, textAlign: 'center', color: '#fff' }}>
          <img src={zoom.image_url} alt={zoom.name} style={{ maxWidth: '86vw', maxHeight: '65vh', borderRadius: 18, transform: `rotateY(${tilt[0]}deg) rotateX(${tilt[1]}deg)`, transition: 'transform .1s', boxShadow: '0 20px 40px #000a' }} />
          <h3 style={{ marginTop: 14 }}>{zoom.name}</h3></div></div>}
      {toast && <div className="toast">{toast}</div>}
    </div>);
}
