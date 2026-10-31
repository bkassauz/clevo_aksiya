'use client';
export default function Wheel({ prizes = [], rot = 0, size = 300 }) {
  const n = Math.max(prizes.length, 2), s = 360 / n, R = 92, P = (a, r) => [Math.cos((a - 90) * Math.PI / 180) * r, Math.sin((a - 90) * Math.PI / 180) * r];
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', zIndex: 3, width: 26, height: 34, background: 'linear-gradient(#ffe38a,#d8a02a)', clipPath: 'polygon(0 0,100% 0,50% 100%)' }} />
      <svg viewBox="-100 -100 200 200" width={size} height={size} style={{ filter: 'drop-shadow(0 8px 14px #0005)' }}>
        <circle r="99" fill="#2b8f87" /><circle r="95" fill="#e9fffb" />
        <g style={{ transform: `rotate(${rot}deg)`, transition: 'transform 4.5s cubic-bezier(.12,.7,.1,1)' }}>
          {prizes.map((p, i) => { const [x1, y1] = P(i * s, R), [x2, y2] = P((i + 1) * s, R), [tx, ty] = P((i + .5) * s, 62);
            return (<g key={i}><path d={`M0 0L${x1} ${y1}A${R} ${R} 0 0 1 ${x2} ${y2}Z`} fill={i % 2 ? '#bfeee8' : '#fff'} stroke="#2aa59a" strokeWidth=".6" />
              <text x={tx} y={ty} fontSize="17" textAnchor="middle" dominantBaseline="central" transform={`rotate(${(i + .5) * s} ${tx} ${ty})`}>{p.icon}</text></g>); })}
        </g>
        <circle r="17" fill="#f2c24a" stroke="#b8821f" strokeWidth="3" /><text textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="17" fill="#8a5a00">C</text>
      </svg>
    </div>);
}
export const nextRot = (cur, index, n) => (Math.floor(cur / 360) + 6) * 360 + (360 - (index + .5) * 360 / n);
