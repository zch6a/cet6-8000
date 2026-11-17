// 六级 8000 词 · 逐词手绘场景（由 build/anim/scenes.txt 生成，页面空闲时按需加载）
(function(){
  const {f1, burst, rays, flame, esc, role, shortMean} = window.CET6_LIB;
  // 高频词各配一幕小剧场：词根按顺序各演一段，下面的算式跟着一节节亮起，最后合出词义。
  // 每幕自己写关键帧（百分比），所以节奏能按这个词的故事来安排。舞台 300×150，地面 y=128。
  const SKIN = '#f2c49b', HAIR = '#3b2c25', INK = '#2b2b2b', BREAD = '#d9a35b', WOOD = '#b07a4a';
  const CL = {t: 'var(--teal)', a: 'var(--accent)', v: 'var(--violet)', g: 'var(--gold)', m: 'var(--ink3)', p: 'var(--paper)', k: 'var(--ink)'};
  const fl = (c, o) => `style="fill:${c}${o != null ? ';fill-opacity:' + o : ''}"`;
  const sk = (c, w = 3, o) => `style="fill:none;stroke:${c};stroke-width:${w}px${o != null ? ';stroke-opacity:' + o : ''}"`;
  const fs = (f, s, w = 2, fo) => `style="fill:${f};stroke:${s};stroke-width:${w}px${fo != null ? ';fill-opacity:' + fo : ''}"`;
  class Stage {
    constructor(id, dur){ this.id = id; this.dur = dur; this.n = 0; this.css = ''; }
    // 一组关键帧 → style 属性；more 可加 transform-origin 等
    a(frames, more = '', dur){
      const name = `sc-${this.id}-${this.n++}`;
      this.css += `@keyframes ${name}{${Object.keys(frames).sort((x, y) => x - y).map(p => `${p}%{${frames[p]}}`).join('')}}`;
      return `style="animation:${name} ${dur || this.dur}s cubic-bezier(.45,0,.25,1) var(--d,0ms) infinite both${more ? ';' + more : ''}"`;
    }
  }
  const T = (x = 0, y = 0, e = '') => `transform:translate(${x}px,${y}px)${e ? ' ' + e : ''}`;
  const R = d => `transform:rotate(${d}deg)`;
  // 计数器：第 i 个数字只在 ts[i]→ts[i+1] 之间显示（第一个从头显示，最后一个显示到结尾）
  const slot = (ts, i) => i === 0 ? {0: 'opacity:1', [ts[1]]: 'opacity:1', [ts[1] + .5]: 'opacity:0', 99: 'opacity:0', 100: 'opacity:1'}
    : {0: 'opacity:0', [ts[i]]: 'opacity:0', [ts[i] + .5]: 'opacity:1', [ts[i + 1]]: 'opacity:1', [ts[i + 1] + .5]: 'opacity:0', 100: 'opacity:0'};
  // p0→p1 之间来回摆 n 下（a ↔ b 度），用于挥锤、锄地、写字
  const swing = (p0, p1, n, a, b) => { const f = {0: R(0), [p0]: R(0), [p1]: R(0), 100: R(0)}; for (let i = 1; i < n; i++) f[f1(p0 + (p1 - p0) * i / n)] = R(i % 2 ? a : b); return f; };
  const ORG = (x, y) => `transform-origin:${x}px ${y}px;transform-box:view-box`;
  const FOOT = 'transform-origin:50% 100%;transform-box:fill-box';
  // 常用节奏
  const pop = p => ({0: 'opacity:0;transform:scale(.3)', [p]: 'opacity:0;transform:scale(.3)', [p + 5]: 'opacity:1;transform:scale(1.15)', [p + 9]: 'opacity:1;transform:scale(1)', 92: 'opacity:1;transform:scale(1)', 100: 'opacity:0;transform:scale(1)'});
  const showAt = (p, q = 92) => ({0: 'opacity:0', [p]: 'opacity:0', [p + 4]: 'opacity:1', [q]: 'opacity:1', [Math.min(q + 4, 100)]: 'opacity:0', 100: 'opacity:0'});
  const hideAt = p => ({0: 'opacity:0', 4: 'opacity:1', [p]: 'opacity:1', [p + 3]: 'opacity:0', 100: 'opacity:0'});
  const growY = (p0, p1) => ({0: 'transform:scaleY(0)', [p0]: 'transform:scaleY(0)', [p1]: 'transform:scaleY(1)', 92: 'transform:scaleY(1);opacity:1', 100: 'transform:scaleY(1);opacity:0'});
  const growX = (p0, p1) => ({0: 'transform:scaleX(0)', [p0]: 'transform:scaleX(0)', [p1]: 'transform:scaleX(1)', 92: 'transform:scaleX(1);opacity:1', 100: 'transform:scaleX(1);opacity:0'});
  const drawP = (p0, p1) => ({0: 'stroke-dashoffset:100', [p0]: 'stroke-dashoffset:100', [p1]: 'stroke-dashoffset:0', 92: 'stroke-dashoffset:0;opacity:1', 100: 'stroke-dashoffset:0;opacity:0'});
  const DASH = 'pathLength="100" stroke-dasharray="100"';
  const fadeP = (p0, p1) => ({0: 'opacity:0', [p0]: 'opacity:0', [p1]: 'opacity:1', 92: 'opacity:1', 100: 'opacity:0'});
  // 沿着几个点走：[[百分比, x, y, 额外变换], …]，开头淡入、结尾淡出
  const move = pts => {
    const f = {}, [, x0, y0, e0 = ''] = pts[0], [, xl, yl, el = ''] = pts[pts.length - 1];
    f[0] = T(x0, y0, e0) + ';opacity:0'; f[3] = T(x0, y0, e0) + ';opacity:1';
    for (const [p, x, y, e = ''] of pts) f[p] = T(x, y, e) + ';opacity:1';
    f[92] = T(xl, yl, el) + ';opacity:1'; f[100] = T(xl, yl, el) + ';opacity:0';
    return f;
  };
  // 和 move 一样，但在第一个时间点之前一直藏着（适合「后出场」的东西）
  const moveIn = pts => { const f = move(pts), [p0, x0, y0, e0 = ''] = pts[0]; f[3] = T(x0, y0, e0) + ';opacity:0'; f[Math.max(3.5, p0 - 1)] = T(x0, y0, e0) + ';opacity:0'; f[p0] = T(x0, y0, e0) + ';opacity:1'; return f; };
  // 走路时两条腿前后摆：p0→p1 之间摆 n 下
  const legs = (p0, p1, n, sign = 1) => {
    const f = {0: 'transform:rotate(0)', [p0]: 'transform:rotate(0)', [p1]: 'transform:rotate(0)', 100: 'transform:rotate(0)'};
    for (let i = 1; i < n; i++) f[f1(p0 + (p1 - p0) * i / n)] = `transform:rotate(${(i % 2 ? 24 : -24) * sign}deg)`;
    return f;
  };
  // 小人：脚踩 (x, y)，c 是衣服颜色。o.k 缩放，o.aL / o.aR 手的位置（相对肩下方），o.legL / o.legR 腿的动画，o.mood 'sad'，o.noFace
  function kid(x, y, c, o = {}){
    const k = o.k || 1, X = d => f1(x + d * k), Y = d => f1(y + d * k), sw = f1(4.6 * k);
    const [lx, ly] = o.aL || [-13, -21], [rx, ry] = o.aR || [13, -21];
    const leg = (a, b, st) => `<path d="M${X(a)} ${Y(-19)}L${X(b)} ${Y(0)}" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round" ${st || ''}/>`;
    const arm = (sx, ex, ey, st, hold) => `<g ${st || ''}><path d="M${X(sx)} ${Y(-35)}L${X(ex)} ${Y(ey)}" stroke="${SKIN}" stroke-width="${sw}" stroke-linecap="round"/>${hold || ''}</g>`;
    return leg(-4.5, -6, o.legL) + leg(4.5, 6, o.legR) +
      `<rect x="${X(-10)}" y="${Y(-41)}" width="${f1(20 * k)}" height="${f1(24 * k)}" rx="${f1(8 * k)}" ${fl(c)}/>` +
      arm(-8, lx, ly, o.armL, o.holdL) + arm(8, rx, ry, o.armR, o.holdR) + (o.noHead ? '' :
      `<circle cx="${X(0)}" cy="${Y(-52)}" r="${f1(11 * k)}" fill="${SKIN}"/>` +
      `<path d="M${X(-11)} ${Y(-53)}a${f1(11 * k)} ${f1(11 * k)} 0 0 1 ${f1(22 * k)} 0q${f1(-5 * k)} ${f1(-5 * k)} ${f1(-11 * k)} ${f1(-3.5 * k)}t${f1(-11 * k)} ${f1(3.5 * k)}z" fill="${HAIR}"/>` +
      (o.noFace ? '' : face(x, y, k, o.mood)));
  }
  function face(x, y, k = 1, mood){
    const X = d => f1(x + d * k), Y = d => f1(y + d * k);
    const mouth = mood === 'sad' ? `M${X(-3.5)} ${Y(-45)}q${f1(3.5 * k)} ${f1(-3 * k)} ${f1(7 * k)} 0` : `M${X(-3.5)} ${Y(-47)}q${f1(3.5 * k)} ${f1(3.5 * k)} ${f1(7 * k)} 0`;
    return `<circle cx="${X(-4)}" cy="${Y(-52)}" r="${f1(1.7 * k)}" fill="${INK}"/><circle cx="${X(4)}" cy="${Y(-52)}" r="${f1(1.7 * k)}" fill="${INK}"/>` +
      `<circle cx="${X(-7)}" cy="${Y(-47.5)}" r="${f1(2.2 * k)}" fill="#f08f7f" opacity=".55"/><circle cx="${X(7)}" cy="${Y(-47.5)}" r="${f1(2.2 * k)}" fill="#f08f7f" opacity=".55"/>` +
      `<path d="${mouth}" stroke="${INK}" stroke-width="${f1(1.6 * k)}" fill="none" stroke-linecap="round"/>`;
  }
  const hip = (x, y, side, k = 1) => ORG(f1(x + side * 4.5 * k), f1(y - 19 * k));
  const shoulder = (x, y, side, k = 1) => ORG(f1(x + side * 8 * k), f1(y - 35 * k));
  const walkLegs = (s, x, y, p0, p1, n, k = 1) => ({legL: s.a(legs(p0, p1, n, 1), hip(x, y, -1, k)), legR: s.a(legs(p0, p1, n, -1), hip(x, y, 1, k))});
  const GND = (x0 = 8, x1 = 292) => `<path d="M${x0} 128H${x1}" ${sk(CL.m, 2, .5)}/>`;
  const heartAt = (x, y, s = 1, c = CL.a) => `<path d="M${x} ${f1(y + 8 * s)}s${f1(-9 * s)} ${f1(-6 * s)} ${f1(-9 * s)} ${f1(-12 * s)}a${f1(4.5 * s)} ${f1(4.5 * s)} 0 0 1 ${f1(9 * s)} ${f1(-1.5 * s)}a${f1(4.5 * s)} ${f1(4.5 * s)} 0 0 1 ${f1(9 * s)} ${f1(1.5 * s)}c0 ${f1(6 * s)} ${f1(-9 * s)} ${f1(12 * s)} ${f1(-9 * s)} ${f1(12 * s)}z" ${fl(c)}/>`;
  const sparkle = (x, y, r, c = CL.g) => `<path d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}z" ${fl(c)}/>`;
  const bubble = (cx, cy) => `<path d="M${cx - 14} ${cy - 10}h28a5 5 0 0 1 5 5v9a5 5 0 0 1-5 5h-15l-6 6v-6h-7a5 5 0 0 1-5-5v-9a5 5 0 0 1 5-5z" ${fs(CL.p, CL.m, 2)}/>`;
  // 圆角小标签：p% 时弹出
  const chip = (s, x, y, w, t, c, p) => `<g ${s.a(pop(p), ORG(x, y))}><rect x="${f1(x - w / 2)}" y="${y - 10}" width="${w}" height="20" rx="6" ${fl(c)}/><text x="${x}" y="${y + 4}" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">${t}</text></g>`;
  // 五角星：外半径 R、内半径 r
  const star5 = (cx, cy, R, r, c) => `<path d="M${[...Array(10)].map((_, i) => { const a = (-90 + i * 36) * Math.PI / 180, q = i % 2 ? r : R; return f1(cx + q * Math.cos(a)) + ' ' + f1(cy + q * Math.sin(a)); }).join('L')}z" ${fl(c)}/>`;
  const SCENES = {
    research: {dur: 5, hl: [30, 10], end: 66, lit: '反复地找', draw: s => {
      const docs = [110, 160, 210].map(x => `<rect x="${x}" y="46" width="40" height="50" rx="3" ${fs(CL.p, CL.m, 2)}/><path d="M${x + 7} 58h26M${x + 7} 66h26M${x + 7} 74h18M${x + 7} 82h22" ${sk(CL.m, 2, .7)}/>`).join('');
      return GND() + `<rect x="96" y="96" width="186" height="7" rx="3" ${fl(CL.m, .45)}/><path d="M106 103v25M272 103v25" ${sk(CL.m, 4, .45)}/>` + docs +
        `<rect x="205" y="41" width="50" height="60" rx="5" ${sk(CL.a, 3)} ${s.a(pop(62), ORG(230, 71))}/>` +
        kid(55, 128, CL.t, {aR: [24, -32]}) +
        `<g ${s.a(move([[10, 0, 0], [30, 100, 0], [45, 0, 0], [62, 100, 0]]))}><circle cx="130" cy="70" r="15" ${fs(CL.p, CL.k, 4, .55)}/><path d="M141 81l13 13" ${sk(CL.k, 6)}/></g>` +
        [30, 45, 62].map((p, i) => `<circle cx="${238 + i * 14}" cy="20" r="5" ${sk(CL.m, 2)}/><circle cx="${238 + i * 14}" cy="20" r="5" ${fl(CL.a)} ${s.a(pop(p - 3), ORG(238 + i * 14, 20))}/>`).join('') +
        `<path d="M224 15a6 6 0 1 0 1.5 7" ${sk(CL.a, 2.2)}/><path d="M222 11l3 4.5 4-3" ${sk(CL.a, 2.2)}/>` +
        `<g ${s.a(pop(64), ORG(55, 28))}><path d="M47 26a8 8 0 1 1 16 0c0 4-3 5-3 9h-10c0-4-3-5-3-9z" ${fl(CL.g)}/><path d="M51 39h8" ${sk(CL.k, 2)}/><path d="M55 9V4M42 15l-4-3M68 15l4-3" ${sk(CL.g, 2.5)}/></g>`;
    }},
    social: {dur: 5, hl: [12, 58], end: 64, lit: '同伴之间的', draw: s => {
      const A = walkLegs(s, 60, 124, 12, 40, 6), C = walkLegs(s, 240, 124, 12, 40, 6);
      return GND() +
        `<ellipse cx="150" cy="88" rx="96" ry="54" ${sk(CL.v, 2.5)} stroke-dasharray="6 6" ${s.a(pop(58), ORG(150, 88))}/>` +
        `<g ${s.a(move([[12, 0, 0], [40, 40, 0]]))}>${kid(60, 124, CL.t, A)}</g>` +
        kid(150, 124, CL.a) +
        `<g ${s.a(move([[12, 0, 0], [40, -40, 0]]))}>${kid(240, 124, CL.v, C)}</g>` +
        `<path d="M114 103q11 7 22 0" ${sk(CL.g, 3.5)} ${DASH} ${s.a(drawP(42, 50))}/><path d="M164 103q11 7 22 0" ${sk(CL.g, 3.5)} ${DASH} ${s.a(drawP(47, 55))}/>` +
        `<g ${s.a(pop(44), ORG(100, 40))}>${bubble(100, 40)}<circle cx="93" cy="40" r="2" ${fl(CL.m)}/><circle cx="100" cy="40" r="2" ${fl(CL.m)}/><circle cx="107" cy="40" r="2" ${fl(CL.m)}/></g>` +
        `<g ${s.a(pop(50), ORG(200, 40))}>${bubble(200, 40)}${heartAt(200, 38, .6)}</g>`;
    }},
    different: {dur: 5.4, hl: [30, 6, 62], end: 66, lit: '带着走向不同方向', draw: s => {
      const A = walkLegs(s, 36, 98, 6, 62, 12, .72), B = walkLegs(s, 10, 111, 6, 62, 12, .72);
      const box = (x, y) => `<rect x="${x - 6}" y="${y - 25}" width="12" height="10" rx="2" ${fl(CL.g)}/>`;
      return `<path d="M0 104H120L300 56M120 104L300 140" ${sk(CL.m, 22, .16)}/><path d="M0 104H120L300 56M120 104L300 140" ${sk(CL.p, 2)} stroke-dasharray="6 8"/>` +
        `<g ${s.a(move([[6, 0, 0], [30, 86, 2], [62, 214, -26]]))}>${kid(36, 98, CL.t, {k: .72, aL: [-6, -24], aR: [6, -24], ...A})}${box(36, 98)}</g>` +
        `<g ${s.a(move([[6, 0, 0], [30, 100, -4], [62, 230, 20]]))}>${kid(10, 111, CL.a, {k: .72, aL: [-6, -24], aR: [6, -24], ...B})}${box(10, 111)}</g>` +
        `<text x="268" y="110" font-size="30" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(pop(62), ORG(268, 100))}>≠</text>`;
    }},
    increase: {dur: 5, hl: [16, 8], end: 62, lit: '越长越多', draw: s => {
      const bars = [[150, 18, 12], [180, 36, 22], [210, 56, 32], [240, 80, 42]].map(([x, h, p]) => `<rect x="${x}" y="${124 - h}" width="20" height="${h}" rx="3" ${fl(CL.a)} ${s.a(growY(p, p + 10), 'transform-origin:50% 100%;transform-box:fill-box')}/>`).join('');
      const leaf = (x, y, dir, p) => `<path d="M${x} ${y}q${dir * 16} 0 ${dir * 18} -13q${-dir * 15} -1 ${-dir * 18} 13z" ${fl(CL.t)} ${s.a(pop(p), ORG(x, y))}/>`;
      return GND() + `<path d="M140 18v106h134" ${sk(CL.m, 2.5)}/>` + bars +
        `<path d="M146 112L262 36" ${sk(CL.t, 4)} ${DASH} ${s.a(drawP(16, 56))}/><path d="M247.3 37.2L262 36l-7.1 13" ${sk(CL.t, 4)} ${s.a(showAt(55))}/>` +
        `<path d="M62 98V34" ${sk(CL.t, 3.5)} ${DASH} ${s.a(drawP(8, 56))}/>` + leaf(62, 82, -1, 24) + leaf(62, 66, 1, 36) + leaf(62, 50, -1, 46) +
        `<g ${s.a(pop(56), ORG(62, 30))}>${[0, 72, 144, 216, 288].map(a => `<circle cx="${f1(62 + 6 * Math.cos(a * Math.PI / 180))}" cy="${f1(30 + 6 * Math.sin(a * Math.PI / 180))}" r="4.5" ${fl(CL.g)}/>`).join('')}<circle cx="62" cy="30" r="3.5" ${fl(CL.a)}/></g>` +
        `<rect x="40" y="98" width="44" height="8" rx="2" ${fl(CL.a)}/><path d="M44 106h36l-5 22H49z" ${fl(CL.a, .8)}/>`;
    }},
    company: {dur: 5.4, hl: [8, 32, 58], end: 64, lit: '一起分面包的人', draw: s => {
      const A = walkLegs(s, 40, 128, 8, 30, 5), B = walkLegs(s, 260, 128, 8, 30, 5);
      const win = [0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${126 + c * 18}" y="${30 + r * 18}" width="11" height="11" rx="1.5" ${fl(CL.p, .8)}/>`).join('')).join('');
      return `<g ${s.a(growY(58, 66), 'transform-origin:50% 100%;transform-box:fill-box')}><rect x="118" y="22" width="64" height="76" rx="2" ${fl(CL.m, .3)}/>${win}</g>` + GND() +
        `<rect x="96" y="96" width="108" height="7" rx="3" ${fl(WOOD)}/><path d="M106 103v25M194 103v25" ${sk(WOOD, 4)}/>` +
        `<g ${s.a(move([[8, 0, 0], [30, 48, 0]]))}>${kid(40, 128, CL.t, A)}</g>` +
        `<g ${s.a(move([[8, 0, 0], [30, -48, 0]]))}>${kid(260, 128, CL.v, B)}</g>` +
        `<g ${s.a({0: 'opacity:0;transform:scale(.3)', 32: 'opacity:0;transform:scale(.3)', 37: 'opacity:1;transform:scale(1.12)', 40: 'opacity:1;transform:scale(1)', 42: 'opacity:1', 43: 'opacity:0', 100: 'opacity:0'}, ORG(150, 90))}><path d="M126 96q0-18 24-18t24 18z" fill="${BREAD}"/><path d="M138 85l4 6M150 82v8M162 85l-4 6" stroke="#9c6a35" stroke-width="2" stroke-linecap="round"/></g>` +
        `<path d="M126 96q0-18 24-18v18z" fill="${BREAD}" ${s.a({0: 'opacity:0;' + T(), 42: 'opacity:0;' + T(), 43: 'opacity:1;' + T(), 55: 'opacity:1;' + T(-36), 92: 'opacity:1;' + T(-36), 100: 'opacity:0;' + T(-36)})}/>` +
        `<path d="M150 78q24 0 24 18h-24z" fill="${BREAD}" ${s.a({0: 'opacity:0;' + T(), 42: 'opacity:0;' + T(), 43: 'opacity:1;' + T(), 55: 'opacity:1;' + T(36), 92: 'opacity:1;' + T(36), 100: 'opacity:0;' + T(36)})}/>` +
        `<g ${s.a(pop(55), ORG(88, 50))}>${heartAt(88, 48, .8)}</g><g ${s.a(pop(57), ORG(212, 50))}>${heartAt(212, 48, .8)}</g>`;
    }},
    experience: {dur: 5.6, hl: [10, 28, 60], end: 64, lit: '亲自出去试过', draw: s => {
      const W = walkLegs(s, 40, 128, 10, 24, 4, .68);
      return GND(8, 96) + GND(224, 292) +
        `<rect x="96" y="118" width="128" height="12" rx="3" ${fl(CL.t, .3)}/><path d="M100 124q6-3 12 0t12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0" ${sk(CL.t, 1.5, .6)}/>` +
        [130, 165, 200].map(x => `<ellipse cx="${x}" cy="120" rx="10" ry="4" ${fl(CL.m, .75)}/>`).join('') +
        `<path d="M8 70L40 44l32 26z" ${fl(CL.a, .85)}/><rect x="14" y="70" width="52" height="58" ${fl(CL.g, .35)}/><rect x="30" y="84" width="20" height="44" ${fl(CL.k, .55)}/>` +
        `<g ${s.a(move([[10, 0, 0], [24, 52, 0], [28, 71, -22], [32, 90, -9], [36, 107, -30], [40, 125, -9], [42, 125, -9, 'rotate(-12deg)'], [44, 125, -9, 'rotate(8deg)'], [46, 125, -9], [50, 142, -30], [54, 160, -9], [58, 180, -22], [62, 200, 0]]), FOOT)}>${kid(40, 128, CL.t, {k: .68, ...W})}</g>` +
        `<rect x="29" y="84" width="22" height="47" fill="${WOOD}" ${s.a({0: 'transform:scaleX(1)', 5: 'transform:scaleX(1)', 11: 'transform:scaleX(.12)', 90: 'transform:scaleX(.12)', 100: 'transform:scaleX(1)'}, 'transform-origin:0% 50%;transform-box:fill-box')}/>` +
        `<rect x="198" y="14" width="90" height="10" rx="5" ${sk(CL.m, 2)}/><rect x="200" y="16" width="86" height="6" rx="3" ${fl(CL.a)} ${s.a(growX(58, 66), 'transform-origin:0% 50%;transform-box:fill-box')}/>` +
        `<text x="243" y="44" font-size="14" font-weight="700" text-anchor="middle" ${fl(CL.a)} ${s.a(pop(62), ORG(243, 40))}>经验 +1</text>`;
    }},
    product: {dur: 5, hl: [6, 14], end: 62, lit: '引导着向前做出来的', draw: s => {
      return GND() + `<rect x="16" y="104" width="268" height="12" rx="6" ${sk(CL.m, 3)}/>` +
        `<path d="M24 104H276" ${sk(CL.m, 3)} stroke-dasharray="8 8" ${s.a({0: 'stroke-dashoffset:0', 100: 'stroke-dashoffset:-80'}, 'animation-timing-function:linear')}/>` +
        [36, 84, 132, 168, 216, 264].map(x => `<circle cx="${x}" cy="110" r="3" ${fl(CL.m)}/>`).join('') +
        `<path d="M24 88H104" ${sk(CL.t, 3)} ${DASH} ${s.a(drawP(6, 24))}/><path d="M97 81l7 7-7 7" ${sk(CL.t, 3)} ${s.a(showAt(22))}/>` +
        `<path d="M34 102q-6-10 4-14t14 2 0 12-18 0z" ${fl(CL.m, .85)} ${s.a({0: 'opacity:0;' + T(), 3: 'opacity:1;' + T(), 30: 'opacity:1;' + T(82), 32: 'opacity:0;' + T(86), 100: 'opacity:0;' + T(86)})}/>` +
        `<g ${s.a({0: 'opacity:0;' + T(-8), 38: 'opacity:0;' + T(-8), 40: 'opacity:1;' + T(-4), 58: 'opacity:1;' + T(62), 92: 'opacity:1;' + T(62), 100: 'opacity:0;' + T(62)})}><rect x="176" y="83" width="22" height="21" rx="2" ${fl(CL.a)}/><path d="M187 83v21M176 92h22" ${sk(CL.p, 2.5)}/></g>` +
        `<rect x="118" y="40" width="64" height="64" rx="6" ${fl(CL.m, .35)}/><rect x="118" y="80" width="8" height="24" ${fl(CL.k, .45)}/><rect x="174" y="80" width="8" height="24" ${fl(CL.k, .45)}/>` +
        `<g ${s.a({0: 'transform:rotate(0)', 100: 'transform:rotate(360deg)'}, ORG(150, 62) + ';animation-timing-function:linear')}><circle cx="150" cy="62" r="11" ${sk(CL.p, 7)} stroke-dasharray="5.8 5.8"/><circle cx="150" cy="62" r="4" ${fl(CL.p)}/></g>` +
        `<g ${s.a(pop(60), ORG(262, 66))}>${sparkle(262, 66, 10)}</g>`;
    }},
    health: {dur: 5.2, hl: [22, 58], end: 62, lit: '治好了的状态', draw: s => {
      return GND() +
        `<g ${s.a({0: T(0, 0, 'rotate(-9deg)'), 22: T(0, 0, 'rotate(-9deg)'), 40: T(0, 0, 'rotate(0deg)'), 44: T(0, 0, 'rotate(0deg)'), 48: T(0, -16, 'rotate(0deg)'), 52: T(0, 0, 'rotate(0deg)'), 56: T(0, -16, 'rotate(0deg)'), 60: T(0, 0, 'rotate(0deg)'), 94: T(0, 0, 'rotate(0deg)'), 100: T(0, 0, 'rotate(-9deg)')}, FOOT)}>` +
        kid(150, 128, CL.a, {noFace: true}) +
        `<g ${s.a(hideAt(40))}>${face(150, 128, 1, 'sad')}</g><g ${s.a(showAt(40))}>${face(150, 128)}</g>` +
        `<g ${s.a(pop(50), ORG(150, 100))}>${heartAt(150, 98, .55, CL.p)}</g></g>` +
        `<g ${s.a(hideAt(30))}><rect x="171" y="52" width="6" height="20" rx="3" ${fs(CL.p, CL.m, 1.5)}/><circle cx="174" cy="74" r="5" ${fl('#e25b4a')}/><path d="M163 58q-3 5 0 7" ${sk('#6db7e8', 2.5)}/></g>` +
        `<g ${s.a({0: 'opacity:0;' + T(90, -10, 'scale(1)'), 6: 'opacity:1;' + T(90, -10, 'scale(1)'), 22: 'opacity:1;' + T(90, -10, 'scale(1)'), 38: 'opacity:1;' + T(0, 0, 'scale(1)'), 42: 'opacity:1;' + T(0, 0, 'scale(1.3)'), 46: 'opacity:0;' + T(0, 0, 'scale(.2)'), 100: 'opacity:0;' + T(0, 0, 'scale(.2)')})}><path d="M182 52h8v8h8v8h-8v8h-8v-8h-8v-8h8z" ${fl(CL.t)}/></g>` +
        `<path d="M196 40h16l5-12 7 24 6-18 4 6h22" ${sk(CL.t, 3)} ${DASH} ${s.a(drawP(44, 62))}/>` +
        `<g ${s.a(hideAt(30))}><path d="M131 46a7 7 0 0 1 12-7 9 9 0 0 1 17 3 6.5 6.5 0 0 1-1 13h-26a5 5 0 0 1-2-9z" ${fl(CL.m, .6)}/><path d="M136 60l-2 5M145 60l-2 5M154 60l-2 5" ${sk("#6db7e8", 2)}/></g>` +
        `<g ${s.a(pop(46), ORG(108, 34))}><circle cx="108" cy="34" r="8" ${fl(CL.g)}/><path d="M108 20v-4M108 52v-4M94 34h-4M126 34h-4M98 24l-3-3M118 24l3-3M98 44l-3 3M118 44l3 3" ${sk(CL.g, 2.5)}/></g>`;
    }},
    benefit: {dur: 5.4, hl: [44, 28], end: 62, lit: '做好事得到的', draw: s => {
      const A = walkLegs(s, 60, 128, 6, 24, 4);
      return GND() +
        `<g ${s.a(move([[6, 0, 0], [24, 92, 0]]))}>${kid(60, 128, CL.t, {...A, aR: [16, -36]})}</g>` +
        kid(214, 128, CL.a, {aL: [-16, -36], noFace: true}) + `<g ${s.a(hideAt(42))}>${face(214, 128, 1, 'sad')}</g>` +
        `<g ${s.a({0: T(), 28: T(), 40: T(0, -14), 92: T(0, -14), 100: T()})}><rect x="170" y="100" width="28" height="28" rx="3" ${fl(WOOD)}/><path d="M170 112h28" ${sk(CL.p, 2, .5)}/></g>` +
        `<g ${s.a(showAt(42))}>${face(214, 128)}</g>` +
        `<g ${s.a(pop(42), ORG(184, 66))}>${heartAt(184, 64, 1.1)}</g>` +
        `<g ${s.a({0: 'opacity:0;' + T(), 49: 'opacity:0;' + T(), 51: 'opacity:1;' + T(), 56: 'opacity:1;' + T(-32, -22), 62: 'opacity:1;' + T(-62, -8), 92: 'opacity:1;' + T(-62, -8), 100: 'opacity:0;' + T(-62, -8)})}><circle cx="214" cy="60" r="9" ${fl(CL.g)}/><text x="214" y="64.5" font-size="12" font-weight="700" text-anchor="middle" ${fl(CL.p)}>¥</text></g>` +
        `<g ${s.a(pop(62), ORG(136, 46))}>${sparkle(136, 46, 6)}${sparkle(170, 42, 4)}</g>`;
    }},
    include: {dur: 5, hl: [8, 46], end: 60, lit: '放进去关起来', draw: s => {
      return GND() + `<rect x="108" y="84" width="84" height="44" rx="3" ${fl(CL.g, .45)}/>` +
        `<g ${s.a(move([[8, 0, 0], [18, 0, 82]]))}><circle cx="130" cy="20" r="9" ${fl(CL.a)}/></g>` +
        `<g ${s.a(move([[18, 0, 0], [28, 0, 84]]))}><rect x="142" y="10" width="18" height="22" rx="2" ${fl(CL.v)}/><path d="M146 16h10M146 21h10" ${sk(CL.p, 2)}/></g>` +
        `<g ${s.a(move([[28, 0, 0], [38, 0, 80]]))}>${sparkle(174, 22, 11, CL.t)}</g>` +
        `<rect x="108" y="96" width="84" height="32" rx="3" ${fl(CL.g)}/>` +
        `<rect x="106" y="78" width="88" height="8" rx="3" ${fl(CL.g)} ${s.a({0: 'transform:rotate(-105deg)', 46: 'transform:rotate(-105deg)', 54: 'transform:rotate(4deg)', 57: 'transform:rotate(0)', 94: 'transform:rotate(0)', 100: 'transform:rotate(-105deg)'}, ORG(108, 84))}/>` +
        `<g ${s.a(pop(58), ORG(150, 112))}><circle cx="150" cy="112" r="10" ${fl(CL.t)}/><path d="M145 112l3.5 3.5 6.5-7" ${sk(CL.p, 2.5)}/></g>`;
    }},
    provide: {dur: 5.4, hl: [6, 10], end: 58, lit: '提前看到需要', draw: s => {
      return GND() +
        kid(50, 128, CL.t, {aR: [7, -51]}) +
        `<path d="M64 74H222" ${sk(CL.t, 2.5)} stroke-dasharray="4 5" ${s.a(fadeP(6, 24))}/>` +
        kid(240, 128, CL.a, {noFace: true}) + `<g ${s.a(hideAt(52))}>${face(240, 128, 1, 'sad')}</g><g ${s.a(showAt(52))}>${face(240, 128)}</g>` +
        `<g ${s.a({...pop(16), 50: 'opacity:1;transform:scale(1)', 54: 'opacity:0;transform:scale(1)', 92: 'opacity:0', 100: 'opacity:0'}, ORG(240, 46))}>${bubble(240, 46)}<path d="M240 39q-5 6-5 9a5 5 0 0 0 10 0q0-3-5-9z" ${fl('#6db7e8')}/></g>` +
        `<g ${s.a(move([[30, 0, 0], [41, 76, -42], [52, 154, 0]]))}><rect x="60" y="86" width="11" height="18" rx="3" ${fl('#6db7e8', .85)}/><rect x="62.5" y="81" width="6" height="6" rx="1" ${fl(CL.t)}/></g>` +
        `<g ${s.a(pop(55), ORG(240, 48))}>${heartAt(240, 46, .9)}</g>`;
    }},
    result: {dur: 5, hl: [26, 34], end: 60, lit: '弹回来的东西', draw: s => {
      const bricks = [0, 1, 2, 3, 4, 5].map(r => `<path d="M262 ${40 + r * 15}h22" ${sk(CL.p, 1.5, .8)}/>`).join('');
      return GND() + `<rect x="262" y="26" width="22" height="102" ${fl(CL.a, .35)}/>` + bricks +
        kid(50, 128, CL.t, {armR: s.a({0: 'transform:rotate(30deg)', 4: 'transform:rotate(30deg)', 9: 'transform:rotate(-70deg)', 20: 'transform:rotate(-70deg)', 30: 'transform:rotate(0)', 100: 'transform:rotate(0)'}, shoulder(50, 128, 1))}) +
        `<g ${s.a(move([[6, 0, 0], [26, 186, -30], [34, 140, 32], [40, 115, 2], [46, 90, 32], [50, 72, 16], [54, 56, 32], [58, 46, 32]]))}><circle cx="66" cy="92" r="7" ${fl(CL.g)}/></g>` +
        `<g ${s.a(pop(60), ORG(112, 62))}><rect x="92" y="40" width="40" height="46" rx="4" ${fs(CL.p, CL.k, 2.5)}/><path d="M101 63l7 7 14-15" ${sk(CL.a, 4)}/></g>` +
        `<g ${s.a(showAt(26, 58))}><path d="M254 52l-6-6M254 72l-7 4M256 62h-9" ${sk(CL.g, 2.5)}/></g>`;
    }},
    // ---------- 第二批 ----------
    researcher: {dur: 5, hl: [6, 44], end: 60, lit: '做研究的人', draw: s => {
      const bubbles = [[212, 0], [219, .55], [215, 1.1]].map(([x, dl]) => `<circle cx="${x}" cy="78" r="2.5" ${fl(CL.t)} ${s.a({0: 'opacity:0;' + T(), 10: 'opacity:1;' + T(), 80: 'opacity:0;' + T(0, -34), 100: 'opacity:0;' + T(0, -34)}, `animation-delay:${dl}s`, 1.6)}/>`).join('');
      return `<path d="M108 0h44l26 128H82z" ${fl(CL.g, .14)} ${s.a(showAt(44))}/>` + GND() +
        `<rect x="172" y="92" width="110" height="7" rx="3" ${fl(CL.m, .45)}/><path d="M182 99v29M272 99v29" ${sk(CL.m, 4, .45)}/>` +
        `<path d="M208 52h14M210 52v14l-12 22a3 3 0 0 0 3 4h28a3 3 0 0 0 3-4l-12-22V52" ${fs(CL.p, CL.m, 2.5)}/><path d="M203.5 79h23l5 9a2 2 0 0 1-2 3h-29a2 2 0 0 1-2-3z" ${fl(CL.t, .8)}/>` + bubbles +
        [[246, CL.a], [258, CL.v]].map(([x, c]) => `<rect x="${x}" y="60" width="8" height="32" rx="4" ${fs(CL.p, CL.m, 1.5)}/><rect x="${x + 1.5}" y="76" width="5" height="14" rx="2.5" ${fl(c)}/>`).join('') +
        kid(130, 128, '#eef1f4', {aR: [26, -44]}) + `<rect x="120" y="87" width="20" height="24" rx="8" ${sk(CL.m, 1.2)}/>` +
        `<circle cx="126" cy="76" r="3.3" ${sk(INK, 1.4)}/><circle cx="134" cy="76" r="3.3" ${sk(INK, 1.4)}/><path d="M129.3 76h1.4" ${sk(INK, 1.4)}/>` +
        `<g ${s.a({0: T(), 6: T(), 20: T(30, -4), 34: T(54, -2), 44: T(54, -2), 52: T(), 100: T()})}><circle cx="160" cy="76" r="8" ${fs(CL.p, CL.k, 3, .5)}/><path d="M154 82l-4 4" ${sk(CL.k, 3)}/></g>` +
        `<g ${s.a(pop(44), ORG(135, 99))}><rect x="127" y="93" width="16" height="11" rx="2" ${fl(CL.v)}/><text x="135" y="101.5" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">er</text></g>`;
    }},
    without: {dur: 5, hl: [6, 30], end: 58, lit: '跟着的东西跑到外面去了', draw: s => {
      return GND() + kid(110, 128, CL.t, {aR: [16, -40], noFace: true}) +
        `<g ${s.a(hideAt(40))}>${face(110, 128)}</g><g ${s.a(showAt(40))}>${face(110, 128, 1, 'sad')}</g>` +
        `<g ${s.a({0: 'opacity:0;' + T(), 3: 'opacity:1;' + T(), 30: 'opacity:1;' + T(0, 0, 'rotate(0deg)'), 38: 'opacity:1;' + T(12, -12, 'rotate(8deg)'), 58: 'opacity:1;' + T(170, -120, 'rotate(14deg)'), 100: 'opacity:0;' + T(170, -120, 'rotate(14deg)')})}>` +
        `<path d="M126 88q8-18 10-38" ${sk(CL.m, 1.5)}/><ellipse cx="138" cy="38" rx="12" ry="14" ${fl(CL.a)}/><path d="M134 30a5 6 0 0 1 4-4" ${sk('#fff', 2, .7)}/><path d="M136 52l2-2 2 2z" ${fl(CL.a)}/></g>` +
        `<g ${s.a(showAt(26, 50))}><g ${s.a({0: T(-20), 100: T(40)}, 'animation-timing-function:linear', 1)}><path d="M30 36h34M22 48h40M34 60h26" ${sk(CL.m, 2.5)}/></g></g>` +
        `<g ${s.a(pop(54), ORG(138, 38))}><ellipse cx="138" cy="38" rx="12" ry="14" ${sk(CL.m, 2)} stroke-dasharray="4 4"/><path d="M132 32l12 12M144 32l-12 12" ${sk(CL.a, 2.5)}/></g>`;
    }},
    parent: {dur: 5.2, hl: [26, 8], end: 62, lit: '生育你的人', mean: '父母', draw: s => {
      return GND() + kid(120, 128, CL.v, {k: 1.35, aR: [14, -31]}) +
        `<g ${s.a({...pop(24), 44: 'opacity:1;transform:scale(1)', 47: 'opacity:0;transform:scale(1)', 92: 'opacity:0', 100: 'opacity:0'}, ORG(141, 86))}><circle cx="141" cy="86" r="14" ${fl(CL.g, .25)}/><ellipse cx="143" cy="90" rx="10" ry="6" fill="#fbe7c6"/><circle cx="136" cy="86" r="4.5" fill="${SKIN}"/><circle cx="135" cy="85.5" r=".8" fill="${INK}"/></g>` +
        `<g ${s.a({0: 'opacity:0;transform:scale(.35)', 45: 'opacity:0;transform:scale(.35)', 49: 'opacity:1;transform:scale(.5)', 62: 'opacity:1;transform:scale(1)', 92: 'opacity:1;transform:scale(1)', 100: 'opacity:0;transform:scale(1)'}, FOOT)}>${kid(176, 128, CL.a, {k: .78, aL: [-15, -30]})}</g>` +
        `<g ${s.a(pop(58), ORG(150, 30))}>${heartAt(150, 30, 1.2)}</g>`;
    }},
    according: {dur: 5.2, hl: [40, 56], end: 60, lit: '照着它、和它一致地', mean: '根据', draw: s => {
      const up = (side, x) => s.a({0: 'transform:rotate(0deg)', 32: 'transform:rotate(0deg)', 42: `transform:rotate(${side * -125}deg)`, 92: `transform:rotate(${side * -125}deg)`, 100: 'transform:rotate(0deg)'}, shoulder(x, 128, side));
      return GND() + `<path d="M64 128l12-36M100 128l-12-36" ${sk(WOOD, 4)}/>` +
        `<g ${s.a(pop(4), ORG(82, 72))}><path d="M50 50l32 6v42l-32-6z" ${fs(CL.p, CL.m, 2)}/><path d="M114 50l-32 6v42l32-6z" ${fs(CL.p, CL.m, 2)}/><path d="M56 62l20 4M56 70l20 4M56 78l14 3" ${sk(CL.m, 1.5, .7)}/>` +
        `<circle cx="98" cy="64" r="3.2" fill="${INK}"/><path d="M98 67v11M98 78l-3.5 7M98 78l3.5 7M98 70l-6-7M98 70l6-7" ${sk(INK, 1.8)}/></g>` +
        `<path d="M120 72H172" ${sk(CL.t, 2.5)} stroke-dasharray="4 5" ${s.a(fadeP(16, 30))}/><path d="M166 66l6 6-6 6" ${sk(CL.t, 2.5)} ${s.a(showAt(29))}/>` +
        kid(214, 128, CL.t, {armL: up(-1, 214), armR: up(1, 214)}) +
        `<text x="150" y="112" font-size="26" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(pop(46), ORG(150, 104))}>=</text>` +
        `<g ${s.a(pop(52), ORG(150, 34))}><circle cx="150" cy="34" r="12" ${fl(CL.t)}/><path d="M144 34l4.5 4.5 8-9" ${sk('#fff', 3)}/></g>`;
    }},
    public: {dur: 5.4, hl: [8, 50], end: 60, lit: '属于大家（人民）的', draw: s => {
      const ppl = [[52, CL.t, -80, 8, 36], [88, CL.g, -100, 12, 40], [212, CL.v, 100, 8, 36], [248, CL.a, 80, 12, 40]];
      return GND() + `<ellipse cx="150" cy="96" rx="120" ry="42" ${sk(CL.t, 2.5)} stroke-dasharray="6 6" ${s.a(pop(54), ORG(150, 96))}/>` +
        `<path d="M118 112h64l-6 16h-52z" ${fl(CL.m, .5)}/><rect x="146" y="86" width="8" height="26" ${fl(CL.m, .55)}/><path d="M134 86h32q-3 8-16 8t-16-8z" ${fl(CL.m, .55)}/>` +
        `<path d="M150 82q-16-20-28 26M150 82q16-20 28 26" ${sk('#6db7e8', 2.5)} stroke-dasharray="5 4" ${s.a({0: 'stroke-dashoffset:0', 100: 'stroke-dashoffset:-27'}, 'animation-timing-function:linear', 1)}/>` +
        ppl.map(([x, c, dx, p0, p1]) => `<g ${s.a(move([[p0, dx, 0], [p1, 0, 0]]))}>${kid(x, 128, c, {k: .66, ...walkLegs(s, x, 128, p0, p1, 6, .66)})}</g>`).join('') +
        `<g ${s.a(pop(50), ORG(150, 26))}><path d="M150 38v10" ${sk(CL.m, 2.5)}/><rect x="122" y="14" width="56" height="24" rx="5" ${fl(CL.t)}/><text x="150" y="31" font-size="13" font-weight="700" text-anchor="middle" fill="#fff">公共</text></g>`;
    }},
    university: {dur: 5.6, hl: [6, 44], end: 62, lit: '包罗万象的学问之地', draw: s => {
      const orbit = {};
      for (let i = 0; i <= 20; i++) { const a = Math.PI * 2 * i / 20; orbit[i * 5] = T(f1(80 * Math.cos(a)), f1(22 * Math.sin(a))); }
      orbit[0] += ';opacity:1'; orbit[100] += ';opacity:1';
      const cols = [104, 124, 144, 164, 184].map(x => `<rect x="${x}" y="82" width="10" height="38" ${fs(CL.p, CL.m, 1.5)}/>`).join('');
      return GND() + `<ellipse cx="150" cy="54" rx="80" ry="22" ${sk(CL.v, 1.5, .6)} stroke-dasharray="3 5"/>` +
        [[36, 30, 0], [262, 24, .5], [56, 76, 1], [250, 84, 1.4]].map(([x, y, dl]) => `<g ${s.a({0: 'opacity:.15', 50: 'opacity:1', 100: 'opacity:.15'}, `animation-delay:${dl}s`, 1.6)}>${sparkle(x, y, 5, CL.v)}</g>`).join('') +
        `<rect x="96" y="120" width="108" height="8" ${fl(CL.m, .5)}/>` + cols + `<rect x="98" y="76" width="104" height="7" ${fl(CL.a, .9)}/><path d="M94 76L150 50l56 26z" ${fl(CL.a, .85)}/>` +
        `<g ${s.a(orbit, 'animation-timing-function:linear')}><circle cx="150" cy="54" r="0"/><circle cx="230" cy="54" r="7" ${fl(CL.g)}/><ellipse cx="230" cy="54" rx="12" ry="3.5" ${sk(CL.g, 1.5)}/></g>` +
        `<g ${s.a({0: 'opacity:0;' + T(), 43: 'opacity:0;' + T(), 45: 'opacity:1;' + T(), 54: 'opacity:1;' + T(0, -70, 'rotate(-20deg)'), 60: 'opacity:1;' + T(0, -64, 'rotate(10deg)'), 92: 'opacity:1;' + T(0, -64, 'rotate(10deg)'), 100: 'opacity:0;' + T(0, -64, 'rotate(10deg)')}, ORG(150, 112))}><path d="M150 106l-18 6 18 6 18-6z" fill="${INK}"/><path d="M138 114v6q12 6 24 0v-6" fill="${INK}"/><path d="M168 112v9" ${sk(CL.g, 2)}/></g>`;
    }},
    something: {dur: 5, hl: [6, 40], end: 58, lit: '某个东西', draw: s => {
      return GND() +
        `<g ${s.a({0: 'opacity:0;' + T(0, 12), 38: 'opacity:0;' + T(0, 12), 46: 'opacity:1;' + T(0, -22), 56: 'opacity:1;' + T(0, -30), 92: 'opacity:1;' + T(0, -30), 100: 'opacity:0;' + T(0, -30)})}><circle cx="150" cy="80" r="11" ${fl(CL.g)}/>` + rays(150, 80, 15, 22, 8).replace('<path ', `<path ${sk(CL.g, 2.5)} `) + `</g>` +
        `<g ${s.a({0: 'transform:rotate(0deg)', 16: 'transform:rotate(0deg)', 20: 'transform:rotate(-6deg)', 24: 'transform:rotate(6deg)', 28: 'transform:rotate(-5deg)', 32: 'transform:rotate(4deg)', 36: 'transform:rotate(0deg)', 100: 'transform:rotate(0deg)'}, FOOT)}>` +
        `<rect x="128" y="94" width="44" height="34" rx="3" ${fl(CL.a, .9)}/><path d="M150 94v34" ${sk(CL.g, 5)}/>` +
        `<g ${s.a({0: T(), 36: T(0, 0, 'rotate(0deg)'), 44: T(-56, 8, 'rotate(-62deg)'), 92: T(-56, 8, 'rotate(-62deg)'), 100: T(0, 0, 'rotate(0deg)')})}><rect x="124" y="86" width="52" height="10" rx="3" ${fl(CL.a)}/><path d="M150 86q-10-12-14-4t14 4q10-12 14-4t-14 4" ${sk(CL.g, 3)}/></g></g>` +
        `<text x="150" y="68" font-size="34" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a({0: 'opacity:0;transform:scale(.4)', 4: 'opacity:0;transform:scale(.4)', 9: 'opacity:1;transform:scale(1.15)', 13: 'opacity:1;transform:scale(1)', 34: 'opacity:1;transform:scale(1)', 38: 'opacity:0;transform:scale(1)', 100: 'opacity:0'}, ORG(150, 58))}>?</text>`;
    }},
    create: {dur: 5.4, hl: [10, 50], end: 60, lit: '让它从无到有长出来', draw: s => {
      const stroke = (d, p0, p1, c = CL.k, w = 2.5) => `<path d="${d}" ${sk(c, w)} ${DASH} ${s.a(drawP(p0, p1))}/>`;
      const paint = {0: 'transform:rotate(0deg)', 10: 'transform:rotate(0deg)', 100: 'transform:rotate(0deg)', 50: 'transform:rotate(0deg)'};
      for (let i = 1; i < 10; i++) paint[10 + i * 4] = `transform:rotate(${i % 2 ? -14 : 6}deg)`;
      return GND() + `<path d="M172 128l14-92M232 128l-14-92M202 44v84" ${sk(WOOD, 4)}/><rect x="160" y="28" width="84" height="64" rx="2" ${fs(CL.p, CL.m, 2)}/>` +
        stroke('M168 84h68', 10, 16, CL.m) + stroke('M186 84V66', 16, 22, WOOD, 3) +
        `<circle cx="186" cy="56" r="11" ${fl(CL.t)} ${s.a(pop(24), ORG(186, 56))}/>` +
        `<circle cx="228" cy="42" r="6" ${fl(CL.g)} ${s.a(pop(32), ORG(228, 42))}/>` + stroke('M228 30v-3M216 42h-3M220 34l-2-2M236 34l2-2', 34, 40, CL.g, 2) +
        stroke('M206 84V70l9-8 9 8v14', 40, 50, CL.a, 2.5) + `<rect x="212" y="75" width="6" height="9" ${fl(CL.a)} ${s.a(showAt(50))}/>` +
        kid(120, 128, CL.v, {aR: [24, -42], armR: s.a(paint, shoulder(120, 128, 1)), holdR: `<path d="M144 86l12-14" ${sk(WOOD, 3)}/><path d="M156 72l3-4" ${sk(CL.a, 4)}/>`}) +
        `<g ${s.a(pop(52), ORG(250, 24))}>${sparkle(250, 24, 8)}${sparkle(160, 22, 5)}</g>`;
    }},
    employee: {dur: 5.2, hl: [10, 42], end: 60, lit: '被雇用的人', draw: s => {
      return GND() + `<path d="M24 128V40h40v88" ${fl(CL.m, .2)}/>` + [0, 1, 2, 3].map(r => `<rect x="32" y="${48 + r * 18}" width="10" height="10" ${fl(CL.p, .8)}/><rect x="46" y="${48 + r * 18}" width="10" height="10" ${fl(CL.p, .8)}/>`).join('') +
        kid(92, 128, '#3d4a5c', {k: 1.15, aR: [18, -30]}) + `<path d="M92 82l-3 4 3 12 3-12z" fill="#c0392b"/>` +
        kid(214, 128, CL.t, {aL: [-17, -31]}) +
        `<g ${s.a({0: 'opacity:0;' + T(), 6: 'opacity:1;' + T(), 10: 'opacity:1;' + T(), 32: 'opacity:1;' + T(84, 2, 'rotate(8deg)'), 38: 'opacity:1;' + T(84, 2, 'rotate(8deg)'), 41: 'opacity:0;' + T(84, 2, 'rotate(8deg)'), 100: 'opacity:0;' + T(84, 2, 'rotate(8deg)')})}><rect x="110" y="84" width="16" height="20" rx="1.5" ${fs(CL.p, CL.m, 1.5)}/><path d="M113 90h10M113 95h10M113 100h6" ${sk(CL.m, 1.2)}/></g>` +
        `<g ${s.a(pop(42), ORG(214, 100))}><path d="M208 87l6 8 6-8" ${sk(CL.v, 1.5)}/><rect x="206" y="95" width="16" height="12" rx="2" ${fl(CL.v)}/><text x="214" y="104" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">ee</text></g>` +
        `<g ${s.a(pop(50), ORG(240, 48))}>${sparkle(240, 50, 6)}${sparkle(190, 44, 4)}</g>`;
    }},
    impact: {dur: 4.8, hl: [8, 32], end: 58, lit: '撞进去、压出痕迹', draw: s => {
      const ring = p => `<ellipse cx="150" cy="97" rx="26" ry="7" ${sk(CL.a, 2)} ${s.a({0: 'opacity:0;transform:scale(.5)', [p]: 'opacity:0;transform:scale(.5)', [p + 2]: 'opacity:.9;transform:scale(.7)', [p + 22]: 'opacity:0;transform:scale(2.2)', 100: 'opacity:0;transform:scale(2.2)'}, ORG(150, 97))}/>`;
      return `<path d="M60 128v-26q0-6 6-6h168q6 0 6 6v26z" ${fl(CL.g, .7)}/>` +
        `<ellipse cx="150" cy="97" rx="20" ry="5" ${fl(CL.k, .4)} ${s.a(growX(31, 35), ORG(150, 97))}/>` +
        `<path d="M130 99l-10 8-4 10M170 99l9 7 6 11M150 102v12" ${sk(CL.k, 1.8, .55)} ${DASH} ${s.a(drawP(33, 44))}/>` + ring(34) + ring(42) +
        `<g ${s.a({0: 'opacity:0;' + T(-130, -86), 6: 'opacity:1;' + T(-130, -86), 30: 'opacity:1;' + T(0, 0, 'scale(1,1)'), 33: 'opacity:1;' + T(0, 4, 'scale(1.35,.65)'), 38: 'opacity:1;' + T(0, 2, 'scale(1,1)'), 92: 'opacity:1;' + T(0, 2, 'scale(1,1)'), 100: 'opacity:0;' + T(0, 2, 'scale(1,1)')})}>` +
        `<path d="M136 74l-20-14M132 82l-24-10" ${sk(CL.m, 2.5)} ${s.a(showAt(6, 30))}/><circle cx="150" cy="86" r="10" ${fl(CL.a)}/></g>` +
        `<g ${s.a(showAt(30, 40))}>${burst(150, 88, 22).replace('<path ', `<path ${sk(CL.g, 3)} `)}</g>`;
    }},
    effect: {dur: 5.4, hl: [38, 6], end: 60, lit: '做出来的结果', mean: '效果', draw: s => {
      const drops = [0, .25, .5].map(dl => `<path d="M150 84q-2 3-2 4a2 2 0 0 0 4 0q0-1-2-4z" ${fl('#6db7e8')} ${s.a({0: 'opacity:0;' + T(), 10: 'opacity:1;' + T(), 90: 'opacity:1;' + T(18, 34), 100: 'opacity:0;' + T(18, 34)}, `animation-delay:${dl}s;animation-timing-function:ease-in`, .75)}/>`).join('');
      const flower = (x, h, c, p) => `<path d="M${x} 126V${126 - h}" ${sk(CL.t, 3)} ${DASH} ${s.a(drawP(p, p + 8))}/><g ${s.a(pop(p + 7), ORG(x, 126 - h))}>${[0, 72, 144, 216, 288].map(a => `<circle cx="${f1(x + 5 * Math.cos(a * Math.PI / 180))}" cy="${f1(126 - h + 5 * Math.sin(a * Math.PI / 180))}" r="4" ${fl(c)}/>`).join('')}<circle cx="${x}" cy="${126 - h}" r="3" ${fl(CL.g)}/></g>`;
      return GND() + `<path d="M152 128q36-14 72 0z" ${fl(WOOD, .75)}/>` +
        `<g ${s.a(showAt(8, 34))}>${drops}</g>` + flower(170, 30, CL.a, 36) + flower(188, 40, CL.v, 42) + flower(206, 28, CL.a, 48) +
        kid(90, 128, CL.t, {aR: [26, -34], armR: s.a({0: 'transform:rotate(0deg)', 8: 'transform:rotate(0deg)', 12: 'transform:rotate(-14deg)', 32: 'transform:rotate(-14deg)', 36: 'transform:rotate(0deg)', 100: 'transform:rotate(0deg)'}, shoulder(90, 128, 1)),
          holdR: `<rect x="114" y="86" width="20" height="15" rx="3" ${fl(CL.m, .8)}/><path d="M134 90l14-6" ${sk(CL.m, 3)}/><path d="M118 86q6-8 12 0" ${sk(CL.m, 2)}/>`}) +
        `<g ${s.a(pop(56), ORG(240, 60))}>${sparkle(240, 60, 9)}${sparkle(150, 52, 5)}</g>`;
    }},
    process: {dur: 6, hl: [6, 6], end: 64, lit: '一步一步向前走', draw: s => {
      const flag = (x, n, p) => `<path d="M${x} 128V92" ${sk(CL.m, 2.5)}/><path d="M${x} 92h16l-4 6 4 6H${x}z" ${fl(CL.m, .5)}/><path d="M${x} 92h16l-4 6 4 6H${x}z" ${fl(CL.a)} ${s.a(showAt(p))}/><text x="${x + 6}" y="102" font-size="9" font-weight="700" fill="#fff">${n}</text>`;
      return `<path d="M14 130H286" ${sk(CL.m, 8, .2)}/>` + flag(84, 1, 18) + flag(154, 2, 36) + flag(224, 3, 54) +
        `<path d="M270 128V86" ${sk(CL.k, 2.5)}/>` + [0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${270 + c * 6}" y="${86 + r * 6}" width="6" height="6" ${fl((r + c) % 2 ? CL.k : CL.p)}/>`).join('')).join('') +
        `<g ${s.a(move([[6, 0, 0], [18, 50, 0], [24, 50, 0], [36, 120, 0], [42, 120, 0], [54, 190, 0], [58, 190, 0], [64, 226, 0]]))}>${kid(30, 128, CL.t, walkLegs(s, 30, 128, 6, 64, 18))}</g>` +
        `<rect x="40" y="14" width="220" height="10" rx="5" ${sk(CL.m, 2)}/><rect x="42" y="16" width="216" height="6" rx="3" ${fl(CL.t)} ${s.a({0: 'transform:scaleX(0)', 6: 'transform:scaleX(0)', 18: 'transform:scaleX(.3)', 24: 'transform:scaleX(.3)', 36: 'transform:scaleX(.62)', 42: 'transform:scaleX(.62)', 54: 'transform:scaleX(.9)', 58: 'transform:scaleX(.9)', 64: 'transform:scaleX(1)', 92: 'transform:scaleX(1);opacity:1', 100: 'transform:scaleX(1);opacity:0'}, 'transform-origin:0% 50%;transform-box:fill-box')}/>`;
    }},
    // ---------- 第三批 ----------
    science: {dur: 5.6, hl: [16, 56], end: 60, lit: '系统的知识', draw: s => {
      const orb = (phi, dl) => { const f = {}, c = Math.cos(phi * Math.PI / 180), sn = Math.sin(phi * Math.PI / 180);
        for (let i = 0; i <= 20; i++) { const a = Math.PI * 2 * i / 20; f[i * 5] = T(f1(36 * Math.cos(a) * c - 12 * Math.sin(a) * sn), f1(36 * Math.cos(a) * sn + 12 * Math.sin(a) * c)); }
        return s.a(f, `animation-timing-function:linear;animation-delay:${dl}s`, 1.8); };
      return GND() + kid(80, 128, CL.t, {aR: [9, -44]}) +
        `<text x="80" y="54" font-size="22" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a({0: 'opacity:0', 3: 'opacity:1', 14: 'opacity:1', 17: 'opacity:0', 100: 'opacity:0'})}>?</text>` +
        `<g ${s.a(pop(16), ORG(80, 40))}><path d="M72 38a8 8 0 1 1 16 0c0 4-3 5-3 9h-10c0-4-3-5-3-9z" ${fl(CL.g)}/><path d="M76 51h8" ${sk(CL.k, 2)}/><path d="M80 22v-4M67 28l-3-3M93 28l3-3" ${sk(CL.g, 2.5)}/></g>` +
        [[0, 28], [1, 34], [2, 40]].map(([i, p]) => `<rect x="${128 + i * 3}" y="${118 - i * 10}" width="${34 - i * 4}" height="9" rx="2" ${fl([CL.a, CL.v, CL.g][i])} ${s.a(pop(p), ORG(145, 122 - i * 10))}/>`).join('') +
        `<g ${s.a(pop(26), ORG(220, 66))}>` + [0, 60, 120].map(a => `<ellipse cx="220" cy="66" rx="36" ry="12" transform="rotate(${a} 220 66)" ${sk(CL.v, 2, .7)}/>`).join('') +
        `<circle cx="217" cy="64" r="6" ${fl(CL.a)}/><circle cx="223" cy="68" r="6" ${fl(CL.t)}/>` +
        [[0, 0], [60, .6], [120, 1.2]].map(([a, dl]) => `<circle cx="220" cy="66" r="3.5" ${fl(CL.v)} ${orb(a, dl)}/>`).join('') + `</g>`;
    }},
    technology: {dur: 5.4, hl: [6, 44], end: 60, lit: '研究技艺的学问', draw: s => {
      const turn = {0: 'transform:rotate(0deg)', 6: 'transform:rotate(0deg)', 36: 'transform:rotate(0deg)', 100: 'transform:rotate(0deg)'};
      for (let i = 1; i < 8; i++) turn[6 + i * 3.75] = `transform:rotate(${i % 2 ? -18 : 8}deg)`;
      return GND() + `<rect x="190" y="108" width="8" height="20" rx="2" ${fl(CL.m, .7)}/><rect x="212" y="108" width="8" height="20" rx="2" ${fl(CL.m, .7)}/>` +
        `<rect x="182" y="70" width="46" height="40" rx="6" ${fl(CL.m, .55)}/><rect x="188" y="42" width="34" height="26" rx="6" ${fl(CL.m, .7)}/><path d="M205 42v-8" ${sk(CL.m, 2.5)}/><circle cx="205" cy="32" r="3" ${fl(CL.a)}/>` +
        `<circle cx="198" cy="55" r="4" ${fl(CL.k, .6)}/><circle cx="212" cy="55" r="4" ${fl(CL.k, .6)}/><g ${s.a(showAt(40))}><circle cx="198" cy="55" r="4" ${fl(CL.g)}/><circle cx="212" cy="55" r="4" ${fl(CL.g)}/><path d="M199 63h12" ${sk(CL.g, 2)}/></g>` +
        `<path d="M182 76l-8 18" ${sk(CL.m, 6, .7)}/><g ${s.a({0: 'transform:rotate(0deg)', 44: 'transform:rotate(0deg)', 48: 'transform:rotate(-150deg)', 52: 'transform:rotate(-120deg)', 56: 'transform:rotate(-150deg)', 60: 'transform:rotate(-120deg)', 64: 'transform:rotate(-150deg)', 92: 'transform:rotate(-150deg)', 100: 'transform:rotate(0deg)'}, ORG(228, 76))}><path d="M228 76l8 18" ${sk(CL.m, 6, .7)}/></g>` +
        `<circle cx="205" cy="90" r="5" ${fs(CL.p, CL.k, 2)}/><path d="M202 90h6" ${sk(CL.k, 1.5)}/>` +
        kid(150, 128, CL.t, {aR: [22, -36], armR: s.a(turn, shoulder(150, 128, 1)), holdR: `<path d="M172 92L196 90" ${sk(CL.k, 4)}/><circle cx="199" cy="90" r="5" ${sk(CL.k, 3)}/>`}) +
        `<g ${s.a(showAt(8, 34))}><g ${s.a({0: 'opacity:0', 50: 'opacity:1', 100: 'opacity:0'}, '', .5)}>${sparkle(212, 84, 4)}${sparkle(196, 100, 3)}</g></g>` +
        `<g ${s.a(pop(46), ORG(60, 40))}><path d="M40 30l20 4v24l-20-4zM80 30l-20 4v24l20-4z" ${fs(CL.p, CL.v, 2)}/><circle cx="70" cy="45" r="5" ${sk(CL.v, 2.5)} stroke-dasharray="2.5 2"/></g>`;
    }},
    government: {dur: 5.6, hl: [6, 42], end: 62, lit: '掌舵治理的机构', draw: s => {
      const wheel = {0: 'transform:rotate(0deg)', 6: 'transform:rotate(0deg)', 14: 'transform:rotate(-50deg)', 22: 'transform:rotate(30deg)', 30: 'transform:rotate(-15deg)', 36: 'transform:rotate(0deg)', 100: 'transform:rotate(0deg)'};
      const house = (x, r0, dx, p) => `<g ${s.a({0: T(dx, 4, `rotate(${r0}deg)`), [p]: T(dx, 4, `rotate(${r0}deg)`), [p + 10]: T(0, 0, 'rotate(0deg)'), 94: T(0, 0, 'rotate(0deg)'), 100: T(dx, 4, `rotate(${r0}deg)`)}, FOOT)}><path d="M${x - 11} 110l11-10 11 10z" ${fl(CL.a, .85)}/><rect x="${x - 9}" y="110" width="18" height="18" ${fl(CL.g, .45)}/><rect x="${x - 3}" y="118" width="6" height="10" ${fl(CL.k, .4)}/></g>`;
      return GND() +
        `<g ${s.a(growY(40, 50), 'transform-origin:50% 100%;transform-box:fill-box')}><rect x="188" y="118" width="96" height="10" ${fl(CL.m, .5)}/>` + [196, 216, 236, 256].map(x => `<rect x="${x}" y="78" width="9" height="40" ${fs(CL.p, CL.m, 1.5)}/>`).join('') +
        `<rect x="190" y="72" width="92" height="7" ${fl(CL.v, .9)}/><path d="M186 72L236 48l50 24z" ${fl(CL.v, .85)}/><path d="M236 48V24" ${sk(CL.m, 2)}/></g>` +
        `<g ${s.a(pop(50), ORG(236, 24))}><g ${s.a({0: 'transform:skewY(0deg)', 50: 'transform:skewY(-8deg)', 100: 'transform:skewY(0deg)'}, 'transform-origin:0% 50%;transform-box:fill-box', 1)}><path d="M236 18h18v12h-18z" fill="#d23c2f"/><path d="M240 22l1 2 2 0-1.6 1.2.6 2-2-1.2-2 1.2.6-2-1.6-1.2 2 0z" fill="#f6d34a"/></g></g>` +
        house(118, -14, -8, 14) + house(146, 12, 6, 18) + house(174, -10, 4, 22) +
        kid(60, 128, CL.t, {aL: [-12, -30], aR: [12, -30]}) +
        `<g ${s.a(wheel, ORG(60, 102))}><circle cx="60" cy="102" r="13" ${sk(WOOD, 4)}/><circle cx="60" cy="102" r="3.5" fill="${WOOD}"/><path d="M60 85v34M43 102h34M48 90l24 24M72 90l-24 24" ${sk(WOOD, 3)}/></g>`;
    }},
    media: {dur: 5.4, hl: [18, 52], end: 60, lit: '在中间传话的', draw: s => {
      const wave = (x0, x1, dl, p0, p1) => `<g ${s.a(showAt(p0, p1))}><path d="M${x0} 62q8 12 0 24" ${sk(CL.t, 2.5)} ${s.a({0: 'opacity:0;' + T(), 15: 'opacity:1;' + T(), 85: 'opacity:1;' + T(x1 - x0), 100: 'opacity:0;' + T(x1 - x0)}, `animation-timing-function:linear;animation-delay:${dl}s`, .9)}/></g>`;
      return GND() +
        `<g ${s.a(pop(2), ORG(40, 70))}>${sparkle(40, 70, 18, CL.a)}<text x="40" y="76" font-size="16" font-weight="700" text-anchor="middle" fill="#fff">!</text></g>` +
        wave(62, 126, 0, 10, 26) + wave(62, 126, .45, 10, 26) +
        `<path d="M150 98v26M138 128h24" ${sk(CL.m, 3)}/><path d="M140 82a10 10 0 0 0 20 0" ${sk(CL.m, 2.5)}/><rect x="143" y="58" width="14" height="26" rx="7" ${fl(CL.k, .75)}/>` +
        `<g ${s.a(pop(18), ORG(150, 50))}><circle cx="150" cy="50" r="4" ${fl(CL.a)}/></g>` +
        wave(166, 212, 0, 26, 50) + wave(166, 212, .3, 26, 50) + wave(166, 212, .6, 26, 50) +
        `<rect x="220" y="46" width="64" height="44" rx="4" ${fl(CL.k, .75)}/><path d="M244 90l-6 8M260 90l6 8" ${sk(CL.m, 2.5)}/>` +
        `<g ${s.a(showAt(48))}><rect x="224" y="50" width="56" height="36" rx="2" ${fl(CL.p)}/>${sparkle(240, 66, 8, CL.a)}<text x="262" y="72" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.t)}>NEWS</text></g>` +
        kid(236, 128, CL.v, {k: .5}) + kid(270, 128, CL.g, {k: .5});
    }},
    ability: {dur: 5.2, hl: [26, 50], end: 58, lit: '能够做到的本事', draw: s => {
      const up = side => s.a({0: 'transform:rotate(0deg)', 26: 'transform:rotate(0deg)', 38: `transform:rotate(${side * -165}deg)`, 92: `transform:rotate(${side * -165}deg)`, 100: 'transform:rotate(0deg)'}, shoulder(150, 128, side));
      const bar = {0: T(), 6: T(), 100: T()};
      for (let i = 0; i < 5; i++) bar[8 + i * 4] = T(0, i % 2 ? 0 : -3);
      Object.assign(bar, {26: T(), 38: T(0, -53), 92: T(0, -53)});
      return GND() + `<rect x="30" y="40" width="14" height="84" rx="7" ${sk(CL.m, 2)}/><rect x="32" y="42" width="10" height="80" rx="5" ${fl(CL.t)} ${s.a(growY(26, 46), 'transform-origin:50% 100%;transform-box:fill-box')}/>` +
        kid(150, 128, CL.a, {noFace: true, aL: [-13, -9], aR: [13, -9], armL: up(-1), armR: up(1)}) +
        `<g ${s.a(hideAt(32))}>${face(150, 128, 1, 'sad')}<path d="M164 70q-3 5 0 7" ${sk('#6db7e8', 2.5)}/></g><g ${s.a(showAt(32))}>${face(150, 128)}</g>` +
        `<g ${s.a(bar)}><path d="M112 119H188" ${sk(CL.k, 4)}/><rect x="110" y="109" width="9" height="20" rx="2" ${fl(CL.k, .85)}/><rect x="181" y="109" width="9" height="20" rx="2" ${fl(CL.k, .85)}/></g>` +
        `<g ${s.a(pop(44), ORG(214, 40))}>${sparkle(214, 40, 8)}${sparkle(86, 46, 5)}</g>`;
    }},
    education: {dur: 5.6, hl: [6, 56], end: 60, lit: '教育这件事', draw: s => {
      const chalk = (d, p0, p1) => `<path d="${d}" ${sk('#f4f1e6', 3)} ${DASH} ${s.a(drawP(p0, p1))}/>`;
      const point = {0: 'transform:rotate(0deg)', 6: 'transform:rotate(0deg)', 38: 'transform:rotate(0deg)', 100: 'transform:rotate(0deg)'};
      for (let i = 1; i < 8; i++) point[6 + i * 4] = `transform:rotate(${i % 2 ? -10 : 4}deg)`;
      return GND() + `<rect x="128" y="20" width="156" height="72" rx="3" ${fs("#2f4f43", WOOD, 4)}/>` +
        chalk('M146 76l9-34 9 34M149 64h12', 8, 18) + chalk('M178 42v34h9a8 8 0 0 0 0-17h-9h8a7 7 0 0 0 0-17z', 18, 28) + chalk('M230 48a13 13 0 1 0 0 24', 28, 38) +
        chalk('M248 60h10M253 55v10M262 60h8', 38, 44) +
        kid(108, 128, CL.v, {k: 1.1, aR: [20, -46], armR: s.a(point, shoulder(108, 128, 1, 1.1)), holdR: `<path d="M130 77l14-14" ${sk(WOOD, 2.5)}/>`}) +
        kid(40, 128, CL.t, {k: .8, armR: s.a({0: 'transform:rotate(0deg)', 42: 'transform:rotate(0deg)', 48: 'transform:rotate(-140deg)', 92: 'transform:rotate(-140deg)', 100: 'transform:rotate(0deg)'}, shoulder(40, 128, 1, .8))}) +
        `<g ${s.a(pop(50), ORG(40, 48))}><path d="M33 46a7 7 0 1 1 14 0c0 3-2.5 4-2.5 7.5h-9c0-3.5-2.5-4.5-2.5-7.5z" ${fl(CL.g)}/><path d="M36.5 57h7" ${sk(CL.k, 1.8)}/></g>`;
    }},
    language: {dur: 5.2, hl: [6, 30], end: 58, lit: '舌头上说出来的', draw: s => {
      const wag = {0: 'transform:rotate(0deg)', 100: 'transform:rotate(0deg)'};
      for (let i = 0; i < 8; i++) wag[6 + i * 2.5] = `transform:rotate(${i % 2 ? 18 : -14}deg)`;
      wag[26] = 'transform:rotate(0deg)';
      const word = (t, dx, dy, p, c) => `<g ${s.a(move([[p, 0, 0, 'scale(.3)'], [p + 10, dx, dy, 'scale(1)']]))}><rect x="96" y="78" width="${t.length > 3 ? 54 : 40}" height="22" rx="11" ${fl(c)}/><text x="${96 + (t.length > 3 ? 27 : 20)}" y="93.5" font-size="12" font-weight="700" text-anchor="middle" fill="#fff">${t}</text></g>`;
      return `<circle cx="66" cy="76" r="32" fill="${SKIN}"/><path d="M34 74a32 32 0 0 1 60-14q-14-6-30-4t-30 18z" fill="${HAIR}"/><circle cx="80" cy="66" r="3" fill="${INK}"/><circle cx="84" cy="80" r="4" fill="#f08f7f" opacity=".5"/>` +
        `<ellipse cx="90" cy="90" rx="9" ry="7" fill="#7a2e2e"/><ellipse cx="91" cy="93" rx="6" ry="3" fill="#f08f9a" ${s.a(wag, ORG(86, 93))}/>` +
        `<path d="M58 108q8 14 22 18" ${sk(SKIN, 6)}/>` +
        word('Hello', 80, -50, 30, CL.t) + word('你好', 120, -6, 38, CL.a) + word('Hola', 70, 34, 46, CL.v);
    }},
    actually: {dur: 5.6, hl: [40, 54], end: 58, lit: '实际情况是…', draw: s => {
      return `<rect x="0" y="0" width="300" height="128" ${fl(CL.m, .08)}/>` + GND() +
        `<path d="M130 120c-8-30-4-64 10-86l6 14 10-18 10 18 6-14c14 22 18 56 10 86l-10-20-10 20-12-20-10 20z" fill="${INK}" ${s.a(hideAt(40))} style="fill-opacity:.6"/>` +
        `<g><ellipse cx="200" cy="120" rx="14" ry="8" fill="#e8963c"/><circle cx="214" cy="110" r="8" fill="#e8963c"/><path d="M208 104l2-7 4 5M216 103l4-6 1 7" fill="#e8963c"/><path d="M186 118q-12-4-8-16" ${sk('#e8963c', 4)}/><circle cx="212" cy="109" r="1.3" fill="${INK}"/><circle cx="217" cy="109" r="1.3" fill="${INK}"/></g>` +
        `<rect x="0" y="0" width="300" height="150" fill="#0e1216" ${s.a({0: 'opacity:.6', 34: 'opacity:.6', 40: 'opacity:0', 94: 'opacity:0', 100: 'opacity:.6'})}/>` +
        `<rect x="30" y="64" width="12" height="18" rx="2" ${fs(CL.p, CL.m, 1.5)}/><path d="M36 68v4" ${sk(CL.k, 3)} ${s.a({0: 'transform:translateY(0)', 34: 'transform:translateY(0)', 36: 'transform:translateY(6px)', 94: 'transform:translateY(6px)', 100: 'transform:translateY(0)'})}/>` +
        `<g ${s.a({0: T(), 4: T(-2), 8: T(2), 12: T(-2), 16: T(2), 20: T(-2), 24: T(2), 28: T(), 100: T()})}>${kid(80, 128, CL.t, {noFace: true, aL: [-11, -44]})}<g ${s.a(hideAt(40))}>${face(80, 128, 1, 'sad')}</g><g ${s.a(showAt(40))}>${face(80, 128)}</g></g>` +
        `<g ${s.a(pop(46), ORG(226, 84))}>${bubble(230, 86)}<text x="230" y="90" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.a)}>喵~</text></g>`;
    }},
    economic: {dur: 5.6, hl: [6, 50], end: 60, lit: '和经济有关的', draw: s => {
      const loop = [[60, 92], [150, 40], [240, 92], [60, 92]];
      const coin = dl => { const f = {}; loop.forEach(([x, y], i) => { f[i * 33.3] = T(x - 60, y - 92); }); f[100] = T(); return `<g ${s.a(f, `animation-timing-function:linear;animation-delay:${dl}s`, 3)}><circle cx="60" cy="92" r="6" ${fl(CL.g)}/><text x="60" y="95.5" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">¥</text></g>`; };
      return GND() + `<path d="M60 92L150 40L240 92Z" ${sk(CL.m, 2)} stroke-dasharray="4 5"/>` +
        `<path d="M38 104v-14l8-6v6l8-6v6l8-6v20z" ${fl(CL.m, .7)}/><rect x="70" y="80" width="6" height="24" ${fl(CL.m, .7)}/><path d="M38 104h44" ${sk(CL.m, 2)}/>` +
        `<rect x="132" y="22" width="36" height="24" ${fl(CL.g, .45)}/><path d="M128 22h44l-4-8h-36z" ${fl(CL.a, .85)}/>` +
        `<path d="M224 92l16-14 16 14z" ${fl(CL.a, .85)}/><rect x="228" y="92" width="24" height="18" ${fl(CL.t, .4)}/>` +
        `<g ${s.a(showAt(6))}>${coin(0)}${coin(1)}${coin(2)}</g>` +
        [[132, 8], [144, 16], [156, 24], [168, 32]].map(([x, h], i) => `<rect x="${x}" y="${124 - h}" width="9" height="${h}" rx="1.5" ${fl(CL.t)} ${s.a(growY(30 + i * 6, 38 + i * 6), 'transform-origin:50% 100%;transform-box:fill-box')}/>`).join('');
    }},
    really: {dur: 5, hl: [36, 52], end: 58, lit: '真真切切地', mean: '确实', draw: s => {
      return GND() + `<ellipse cx="110" cy="112" rx="34" ry="10" ${fl(CL.v, .4)}/>` +
        `<path d="M94 84h32l8 10-24 20-24-20z" fill="#6db7e8"/><path d="M86 94h48M102 84l8 30 8-30M94 84l8 10 8-10 8 10 8-10" ${sk('#fff', 1.2, .7)}/>` +
        `<g ${s.a(move([[6, -30, -10], [18, 10, -6], [28, -4, -8]]))}><circle cx="110" cy="80" r="14" ${fs(CL.p, CL.k, 3.5, .45)}/><path d="M120 90l10 10" ${sk(CL.k, 5)}/></g>` +
        `<rect x="196" y="34" width="70" height="86" rx="3" ${fs(CL.p, CL.m, 2)}/><path d="M206 50h50M206 60h50M206 70h34" ${sk(CL.m, 2, .6)}/>` +
        `<g ${s.a({0: T(0, -40), 26: T(0, -40), 34: T(0, 0), 40: T(0, 0), 48: T(0, -40), 100: T(0, -40)})}><rect x="216" y="70" width="30" height="10" rx="2" fill="${WOOD}"/><rect x="226" y="50" width="10" height="20" rx="3" fill="${WOOD}"/><circle cx="231" cy="48" r="6" fill="${WOOD}"/></g>` +
        `<g ${s.a(pop(35), ORG(231, 96))}><circle cx="231" cy="96" r="14" ${sk('#d23c2f', 3)}/><text x="231" y="102" font-size="16" font-weight="700" text-anchor="middle" fill="#d23c2f">真</text></g>` +
        `<g ${s.a(pop(46), ORG(150, 70))}>${sparkle(150, 74, 7, '#6db7e8')}${sparkle(76, 78, 5, '#6db7e8')}</g>`;
    }},
    community: {dur: 5.6, hl: [30, 52], end: 60, lit: '共同生活的一群人', draw: s => {
      const house = (x, c, p) => `<g ${s.a(pop(p), 'transform-origin:50% 100%;transform-box:fill-box')}><path d="M${x - 16} 104l16-14 16 14z" ${fl(c, .9)}/><rect x="${x - 13}" y="104" width="26" height="24" ${fl(CL.g, .4)}/><rect x="${x - 4}" y="114" width="8" height="14" ${fl(CL.k, .45)}/></g>`;
      const ppl = [[40, CL.t, 82], [96, CL.a, 30], [204, CL.v, -30], [260, CL.g, -82]];
      return GND() + `<ellipse cx="150" cy="100" rx="128" ry="40" ${sk(CL.t, 2.5)} stroke-dasharray="6 6" ${s.a(pop(52), ORG(150, 100))}/>` +
        house(40, CL.a, 4) + house(96, CL.v, 8) + house(204, CL.t, 12) + house(260, CL.a, 16) +
        `<g ${s.a(pop(20), 'transform-origin:50% 100%;transform-box:fill-box')}><path d="M150 128V100" ${sk(WOOD, 5)}/><circle cx="150" cy="86" r="18" ${fl(CL.t, .85)}/><circle cx="140" cy="80" r="8" ${fl(CL.t)}/></g>` +
        ppl.map(([x, c, dx]) => `<g ${s.a(move([[24, 0, 0], [44, dx, 0]]))}>${kid(x, 128, c, {k: .55, ...walkLegs(s, x, 128, 24, 44, 5, .55)})}</g>`).join('') +
        `<g ${s.a(pop(46), ORG(150, 44))}>${heartAt(150, 44, 1)}</g>`;
    }},
    however: {dur: 5.4, hl: [12, 34], end: 58, lit: '无论怎样；话锋一转', mean: '然而', draw: s => {
      return `<path d="M0 116H178V0" ${sk(CL.m, 26, .16)}/><path d="M0 116H178V0" ${sk(CL.p, 2)} stroke-dasharray="6 8"/>` +
        `<g ${s.a(move([[6, 0, 0], [28, 130, 0], [34, 130, 0], [36, 138, -4, 'scale(.95)'], [58, 140, -66, 'scale(.6)']]), FOOT)}>${kid(30, 124, CL.t, walkLegs(s, 30, 124, 6, 58, 14))}</g>` +
        `<text x="162" y="62" font-size="24" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a({0: 'opacity:0;transform:scale(.4)', 22: 'opacity:0;transform:scale(.4)', 26: 'opacity:1;transform:scale(1.15)', 29: 'opacity:1;transform:scale(1)', 34: 'opacity:1', 37: 'opacity:0', 100: 'opacity:0'}, ORG(162, 54))}>?</text>` +
        `<path d="M226 128V70" ${sk(CL.m, 3)}/><g ${s.a(pop(30), ORG(226, 56))}><rect x="204" y="38" width="44" height="36" rx="5" ${fl(CL.g)}/><path d="M216 66V52h16M226 46l7 6-7 6" ${sk('#fff', 3.5)}/></g>`;
    }},
    // ---------- 第四批 ----------
    value: {dur: 5.2, hl: [20, 52], end: 58, lit: '有分量、值钱', draw: s => {
      const pan = x => `<path d="M${x} 56l-12 22M${x} 56l12 22" ${sk(CL.m, 1.5)}/><path d="M${x - 16} 78h32q-2 8-16 8t-16-8z" ${fl(CL.m, .7)}/>`;
      return GND() + `<path d="M150 128V58M130 128h40" ${sk(CL.m, 4)}/><circle cx="150" cy="56" r="4" ${fl(CL.k)}/>` +
        `<g ${s.a({0: R(0), 20: R(0), 30: R(16), 34: R(11), 38: R(14), 92: R(14), 100: R(0)}, ORG(150, 56))}><path d="M84 56h132" ${sk(CL.k, 3.5)}/>` + pan(86) + pan(214) +
        `<path d="M76 78l4-8 7 1 3 7zM90 78l3-6 6 2 1 4z" ${fl(CL.m)}/><path d="M204 66h20l5 6-15 10-15-10z" fill="#6db7e8"/><path d="M199 72h30M209 66l5 16 5-16" ${sk('#fff', 1, .7)}/></g>` +
        `<g ${s.a(pop(40), ORG(226, 82))}>${sparkle(232, 92, 6, '#6db7e8')}</g>` +
        `<g ${s.a(pop(52), ORG(250, 30))}><path d="M228 22h38l8 9-8 9h-38z" ${fl(CL.g)}/><circle cx="234" cy="31" r="2.5" ${fl(CL.p)}/><text x="252" y="35.5" font-size="12" font-weight="700" text-anchor="middle" fill="#fff">¥¥¥</text></g>`;
    }},
    worker: {dur: 5.2, hl: [6, 46], end: 58, lit: '干活的人', draw: s => {
      const bricks = [[150, 116], [178, 116], [206, 116], [164, 106], [192, 106], [150, 96], [178, 96], [206, 96], [164, 86], [192, 86]];
      return GND() + bricks.map(([x, y], i) => `<rect x="${x}" y="${y}" width="26" height="9" rx="1.5" fill="#c8664a" ${s.a(pop(8 + i * 3.6), ORG(x + 13, y + 4))}/>`).join('') +
        kid(100, 128, CL.t, {aR: [22, -40], armR: s.a(swing(6, 44, 10, -45, 8), shoulder(100, 128, 1)),
          holdR: `<path d="M122 88l12-12" ${sk(WOOD, 3.5)}/><rect x="128" y="66" width="14" height="8" rx="1.5" transform="rotate(45 135 70)" ${fl(CL.m)}/>`}) +
        `<path d="M88 74a12 12 0 0 1 24 0z" fill="#f2b632"/><path d="M85 74h30" ${sk('#f2b632', 3)}/>` +
        `<g ${s.a(pop(46), ORG(100, 100))}><rect x="92" y="94" width="16" height="11" rx="2" ${fl(CL.v)}/><text x="100" y="102.5" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">er</text></g>`;
    }},
    recent: {dur: 5, hl: [8, 40], end: 58, lit: '刚刚又新出现的', draw: s => {
      const page = (n, c) => `<rect x="112" y="34" width="76" height="80" rx="4" ${fs(CL.p, CL.m, 1.5)}/><rect x="112" y="34" width="76" height="16" rx="4" ${fl(c)}/><text x="150" y="96" font-size="36" font-weight="700" text-anchor="middle" ${fl(CL.k, .75)}>${n}</text>`;
      return GND() + page(5, CL.a) + `<text x="150" y="108" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.a)}>今天</text>` +
        [4, 3, 2, 1].map((n, i) => `<g ${s.a({0: 'transform:scaleY(1)', [8 + (3 - i) * 7]: 'transform:scaleY(1)', [13 + (3 - i) * 7]: 'transform:scaleY(0)', 94: 'transform:scaleY(0)', 100: 'transform:scaleY(1)'}, 'transform-origin:50% 0%;transform-box:fill-box')}>${page(n, CL.m)}</g>`).join('') +
        `<path d="M126 30v10M150 30v10M174 30v10" ${sk(CL.k, 3)}/>` +
        `<g ${s.a(pop(40), ORG(198, 40))}><path d="M182 32h32l-4 8 4 8h-32z" ${fl(CL.t)}/><text x="197" y="44" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">NEW</text></g>` +
        `<g ${s.a(pop(44), ORG(96, 50))}>${sparkle(96, 52, 7)}${sparkle(210, 96, 5)}</g>`;
    }},
    memory: {dur: 5.6, hl: [10, 50], end: 60, lit: '记在脑子里的', draw: s => {
      const photo = (icon, dx, dy, p) => `<g ${s.a(move([[p, 0, 0, 'scale(.3)'], [p + 12, dx, dy, 'scale(1)']]))}><rect x="64" y="56" width="22" height="24" rx="2" ${fs(CL.p, CL.m, 1.5)}/>${icon}</g>`;
      const cloud = 'M138 88a17 17 0 0 1 6-32 23 23 0 0 1 42-12 21 21 0 0 1 40 6 17 17 0 0 1 10 38z';
      return GND() + kid(60, 128, CL.t) + `<circle cx="84" cy="64" r="3" ${fl(CL.m, .5)}/><circle cx="96" cy="58" r="4.5" ${fl(CL.m, .5)}/><circle cx="112" cy="54" r="6" ${fl(CL.m, .5)}/>` +
        `<path d="${cloud}" ${fs(CL.p, CL.m, 2)}/><path d="${cloud}" ${sk(CL.v, 3)} ${s.a(showAt(46))}/>` +
        photo(sparkle(75, 66, 6, CL.g), 88, -4, 10) + photo(heartAt(75, 65, .55), 118, -14, 20) + photo(`<path d="M68 72l7-7 7 7v5H68z" ${fl(CL.a)}/>`, 148, -4, 30) +
        `<g ${s.a(pop(50), ORG(244, 30))}>${sparkle(244, 30, 6, CL.v)}</g>`;
    }},
    themselves: {dur: 5.4, hl: [6, 30], end: 58, lit: '他们本人', draw: s => {
      const wave = (x, side) => s.a({0: R(0), 34: R(0), 40: R(side * -130), 46: R(side * -100), 52: R(side * -130), 58: R(side * -100), 64: R(0), 100: R(0)}, shoulder(x, 128, side));
      return GND() + `<rect x="156" y="20" width="132" height="108" rx="4" ${fs('#bfe1f2', WOOD, 4, .3)}/><path d="M172 34l14-10M172 48l26-20" ${sk('#fff', 3, .6)}/>` +
        `<g ${s.a(showAt(26))} >${kid(216, 128, CL.t, {armL: wave(216, -1)})}${kid(178, 128, CL.a, {armR: wave(178, 1)})}<rect x="158" y="22" width="128" height="104" ${fl(CL.p, .45)}/></g>` +
        `<g ${s.a(move([[6, -60, 0], [26, 0, 0]]))}>${kid(96, 128, CL.t, {armR: wave(96, 1), ...walkLegs(s, 96, 128, 6, 26, 4)})}</g>` +
        `<g ${s.a(move([[6, -60, 0], [26, 0, 0]]))}>${kid(134, 128, CL.a, {armL: wave(134, -1), ...walkLegs(s, 134, 128, 6, 26, 4)})}</g>` +
        `<g ${s.a(pop(36), ORG(160, 14))}>${sparkle(152, 14, 6)}</g>`;
    }},
    scientist: {dur: 5.4, hl: [6, 46], end: 58, lit: '搞科学的人', draw: s => {
      const puff = [[204, 40, 12, CL.v], [222, 32, 10, CL.a], [188, 30, 9, CL.t], [212, 22, 8, CL.g]].map(([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" ${fl(c, .75)}/>`).join('');
      return GND() + `<rect x="176" y="96" width="100" height="7" rx="3" ${fl(CL.m, .45)}/><path d="M186 103v25M266 103v25" ${sk(CL.m, 4, .45)}/>` +
        `<path d="M202 60h12M204 60v12l-10 18a3 3 0 0 0 3 4h22a3 3 0 0 0 3-4l-10-18V60" ${fs(CL.p, CL.m, 2.5)}/><path d="M199 82h18l4 8a2 2 0 0 1-2 3h-22a2 2 0 0 1-2-3z" ${fl(CL.t, .85)}/><path d="M199 82h18l4 8a2 2 0 0 1-2 3h-22a2 2 0 0 1-2-3z" ${fl(CL.v)} ${s.a(showAt(28))}/>` +
        `<path d="M196 50q4 4 10 12" ${sk(CL.a, 3)} ${s.a(showAt(14, 28))}/>` +
        kid(156, 128, '#eef1f4', {aR: [26, -58], armR: s.a({0: R(0), 10: R(0), 16: R(28), 28: R(28), 32: R(0), 100: R(0)}, shoulder(156, 128, 1)), holdR: `<path d="M180 64h12v14h-12z" ${fs(CL.p, CL.m, 1.5)}/><path d="M181 70h10v7h-10z" ${fl(CL.a, .85)}/>`}) +
        `<rect x="146" y="87" width="20" height="24" rx="8" ${sk(CL.m, 1.2)}/><path d="M146 72h20" ${sk('#6db7e8', 3)}/><circle cx="151" cy="72" r="3.5" ${fs('#bfe1f2', INK, 1.2)}/><circle cx="161" cy="72" r="3.5" ${fs('#bfe1f2', INK, 1.2)}/>` +
        `<g ${s.a(pop(30), ORG(206, 34))}>${puff}${sparkle(240, 18, 6)}${sparkle(176, 16, 5)}</g>` +
        `<g ${s.a(pop(46), ORG(156, 100))}><rect x="148" y="94" width="16" height="11" rx="2" ${fl(CL.v)}/><text x="156" y="102.5" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">ist</text></g>`;
    }},
    animal: {dur: 5.6, hl: [6, 40], end: 58, lit: '有生命、会动的东西', draw: s => {
      const hop = {0: 'opacity:0;' + T(), 38: 'opacity:0;' + T(), 40: 'opacity:1;' + T()};
      for (let i = 0; i < 4; i++) { hop[44 + i * 12] = 'opacity:1;' + T(8 + i * 16, -16); hop[50 + i * 12] = 'opacity:1;' + T(16 + i * 16, 0); }
      hop[92] = 'opacity:1;' + T(64, 0); hop[100] = 'opacity:0;' + T(64, 0);
      return GND() + `<ellipse cx="236" cy="128" rx="40" ry="7" fill="#6db7e8" opacity=".6"/>` +
        `<g ${s.a({0: 'opacity:0;transform:scale(.4)', 4: 'opacity:1;transform:scale(1)', 30: 'opacity:1;transform:scale(1)', 38: 'opacity:0;transform:scale(2)', 100: 'opacity:0'}, ORG(150, 60))}><g ${s.a({0: 'transform:scale(1)', 15: 'transform:scale(1.2)', 30: 'transform:scale(.95)', 45: 'transform:scale(1.08)', 60: 'transform:scale(1)', 100: 'transform:scale(1)'}, ORG(150, 60), 1)}>${heartAt(150, 58, 2)}</g></g>` +
        `<path d="M96 60h30l6-14 8 28 7-20 5 6h52" ${sk(CL.a, 2.5)} ${DASH} ${s.a({...drawP(6, 30), 36: 'stroke-dashoffset:0;opacity:1', 40: 'stroke-dashoffset:0;opacity:0', 92: 'opacity:0', 100: 'opacity:0'})}/>` +
        `<g ${s.a(hop)}><ellipse cx="50" cy="118" rx="14" ry="10" fill="#d9cfc4"/><circle cx="62" cy="106" r="8" fill="#d9cfc4"/><ellipse cx="60" cy="92" rx="3" ry="8" fill="#d9cfc4"/><ellipse cx="66" cy="93" rx="3" ry="8" fill="#d9cfc4"/><circle cx="65" cy="105" r="1.4" fill="${INK}"/><circle cx="37" cy="114" r="4" fill="#fff"/></g>` +
        `<g ${s.a({0: 'opacity:0;' + T(-40, 20), 40: 'opacity:0;' + T(-40, 20), 42: 'opacity:1;' + T(-40, 20), 56: 'opacity:1;' + T(0, 0), 70: 'opacity:1;' + T(20, -6), 84: 'opacity:1;' + T(40, 2), 92: 'opacity:1;' + T(40, 2), 100: 'opacity:0;' + T(40, 2)})}><ellipse cx="150" cy="56" rx="12" ry="7" ${fl(CL.v)}/><circle cx="160" cy="50" r="5" ${fl(CL.v)}/><path d="M164 50l6 2-6 2z" fill="#f2b632"/><circle cx="161" cy="49" r="1.2" fill="#fff"/><path d="M144 54q6-16 14-12q-4 6-6 14z" ${fl(CL.v, .6)} ${s.a({0: 'transform:scaleY(1)', 50: 'transform:scaleY(-.6)', 100: 'transform:scaleY(1)'}, 'transform-origin:50% 100%;transform-box:fill-box', .45)}/></g>` +
        `<g ${s.a({0: 'opacity:0;' + T(), 44: 'opacity:0;' + T(0, 10), 46: 'opacity:1;' + T(0, 10, 'rotate(-30deg)'), 54: 'opacity:1;' + T(16, -34, 'rotate(10deg)'), 62: 'opacity:1;' + T(32, 4, 'rotate(50deg)'), 64: 'opacity:0;' + T(32, 10, 'rotate(50deg)'), 100: 'opacity:0'})}><ellipse cx="222" cy="120" rx="10" ry="5" fill="#e8963c"/><path d="M212 120l-7-5v10z" fill="#e8963c"/><circle cx="227" cy="119" r="1.2" fill="${INK}"/></g>`;
    }},
    development: {dur: 5.6, hl: [10, 52], end: 60, lit: '一步步发展起来', draw: s => {
      const bld = (x, w, h, c, p) => `<g ${s.a(growY(p, p + 10), 'transform-origin:50% 100%;transform-box:fill-box')}><rect x="${x}" y="${128 - h}" width="${w}" height="${h}" ${fl(c, .85)}/>${Array.from({length: Math.floor(h / 14)}, (_, r) => `<rect x="${x + 5}" y="${128 - h + 6 + r * 14}" width="${w - 10}" height="6" ${fl(CL.p, .7)}/>`).join('')}</g>`;
      return GND() + `<g ${s.a(pop(4), 'transform-origin:50% 100%;transform-box:fill-box')}><path d="M28 112l14-12 14 12z" fill="${WOOD}"/><rect x="31" y="112" width="22" height="16" ${fl(CL.g, .5)}/></g>` +
        `<g ${s.a(pop(16), 'transform-origin:50% 100%;transform-box:fill-box')}><path d="M70 108l16-14 16 14z" ${fl(CL.a, .9)}/><rect x="74" y="108" width="24" height="20" ${fl(CL.g, .45)}/></g>` +
        `<g ${s.a(pop(22), 'transform-origin:50% 100%;transform-box:fill-box')}><path d="M106 104l18-16 18 16z" ${fl(CL.v, .9)}/><rect x="110" y="104" width="28" height="24" ${fl(CL.g, .45)}/></g>` +
        bld(152, 26, 56, CL.t, 28) + bld(184, 30, 84, CL.v, 34) + bld(220, 24, 66, CL.a, 40) +
        `<path d="M266 128V30M260 34h-34M266 34h10" ${sk(CL.g, 3)}/><g ${s.a({0: R(0), 40: R(0), 48: R(-12), 56: R(6), 64: R(0), 100: R(0)}, ORG(266, 34))}><path d="M240 34v18" ${sk(CL.m, 1.5)}/><rect x="235" y="52" width="10" height="8" ${fl(CL.a)}/></g>` +
        `<path d="M30 80Q120 70 180 26" ${sk(CL.t, 3)} ${DASH} ${s.a(drawP(10, 56))}/>`;
    }},
    society: {dur: 5.4, hl: [10, 46], end: 58, lit: '同伴们聚成的整体', draw: s => {
      const spots = [[60, 104, CL.t], [100, 104, CL.a], [140, 104, CL.v], [180, 104, CL.g], [220, 104, CL.t], [80, 128, CL.v], [120, 128, CL.g], [160, 128, CL.a], [200, 128, CL.v], [240, 128, CL.a]];
      const links = [[0, 1], [1, 2], [2, 3], [3, 4], [5, 6], [6, 7], [7, 8], [8, 9], [0, 5], [1, 6], [2, 7], [3, 8], [4, 9], [1, 5], [2, 6], [3, 7], [4, 8]];
      return [[20, 40], [44, 24], [72, 52], [228, 30], [256, 46]].map(([x, h]) => `<rect x="${x}" y="${80 - h}" width="22" height="${h + 48}" ${fl(CL.m, .18)}/>`).join('') + GND() +
        links.map(([a, b], i) => `<path d="M${spots[a][0]} ${spots[a][1] - 18}L${spots[b][0]} ${spots[b][1] - 18}" ${sk(CL.g, 2, .8)} ${DASH} ${s.a(drawP(34 + i * .8, 40 + i * .8))}/>`).join('') +
        spots.map(([x, y, c], i) => `<g ${s.a(pop(8 + i * 2.4), 'transform-origin:50% 100%;transform-box:fill-box')}>${kid(x, y, c, {k: .5})}</g>`).join('') +
        `<ellipse cx="150" cy="94" rx="122" ry="44" ${sk(CL.v, 2.5)} stroke-dasharray="6 6" ${s.a(pop(48), ORG(150, 94))}/>`;
    }},
    culture: {dur: 5.8, hl: [6, 46], end: 60, lit: '精神上的耕耘', draw: s => {
      const xs = [140, 172, 204, 236, 268];
      const syms = [`<path d="M-9 -8l9 3 9-3v14l-9 3-9-3z" ${fs(CL.p, CL.v, 1.6)}/><path d="M0 -5v14" ${sk(CL.v, 1.4)}/>`, `<path d="M-2 6V-8l8-2v12" ${sk(CL.a, 2)}/><circle cx="-4" cy="6" r="3" ${fl(CL.a)}/><circle cx="4" cy="3" r="3" ${fl(CL.a)}/>`,
        `<text x="0" y="6" font-size="17" font-weight="700" text-anchor="middle" ${fl(CL.t)}>文</text>`, `<path d="M-5 8l8-14" ${sk(WOOD, 3)}/><path d="M3 -6l3-4" ${sk(INK, 4)}/>`, `<ellipse cx="0" cy="0" rx="7" ry="9" fill="#d23c2f"/><path d="M-4 -9h8M-4 9h8M0 9v5" ${sk(CL.g, 2)}/>`];
      return `<path d="M120 112h176v16H120z" fill="${WOOD}" opacity=".55"/><path d="M124 116h168M124 122h168" ${sk(WOOD, 1.5)}/>` + GND(8, 120) +
        xs.map((x, i) => `<g ${s.a(pop(24 + i * 3), ORG(x, 112))}><path d="M${x} 112v-8" ${sk(CL.t, 2.5)}/><path d="M${x} 106q-6 0-7-5q6 0 7 5zM${x} 105q6 0 7-5q-6 0-7 5z" ${fl(CL.t)}/></g>` +
          `<g ${s.a({0: 'opacity:0;' + T(0, 20, 'scale(.3)'), [44 + i * 2]: 'opacity:0;' + T(0, 20, 'scale(.3)'), [46 + i * 2]: 'opacity:1;' + T(0, 20, 'scale(.3)'), [54 + i * 2]: 'opacity:1;' + T(0, 0, 'scale(1)'), 92: 'opacity:1;' + T(0, 0, 'scale(1)'), 100: 'opacity:0;' + T(0, 0, 'scale(1)')})}><g transform="translate(${x} 78)">${syms[i]}</g></g>`).join('') +
        kid(70, 128, CL.t, {aR: [20, -32], armR: s.a(swing(6, 32, 8, -40, 6), shoulder(70, 128, 1)), holdR: `<path d="M90 96l18 26" ${sk(WOOD, 3)}/><path d="M104 120l10-2 2 6z" ${fl(CL.m)}/>`});
    }},
    personal: {dur: 5.4, hl: [8, 40], end: 58, lit: '属于某个人的', draw: s => {
      return `<path d="M128 0h44l22 128h-88z" ${fl(CL.g, .16)} ${s.a(showAt(8))}/>` + GND() +
        `<g opacity=".35">${kid(40, 128, CL.m)}${kid(84, 128, CL.m)}${kid(216, 128, CL.m)}${kid(260, 128, CL.m)}</g>` +
        kid(150, 128, CL.a, {aR: [18, -30]}) +
        `<g ${s.a(pop(26), ORG(172, 96))}><rect x="166" y="86" width="14" height="22" rx="3" ${fl(CL.k, .85)}/><rect x="168" y="89" width="10" height="15" rx="1" fill="#6db7e8"/></g>` +
        `<g ${s.a(pop(32), ORG(122, 104))}><rect x="112" y="94" width="20" height="24" rx="2" ${fl(CL.v)}/><path d="M116 94v24" ${sk(CL.p, 1.5)}/></g>` +
        `<g ${s.a(pop(40), ORG(150, 40))}><rect x="128" y="28" width="44" height="22" rx="6" ${fl(CL.t)}/><text x="150" y="43.5" font-size="12" font-weight="700" text-anchor="middle" fill="#fff">我的</text><path d="M176 33v-3a5 5 0 0 1 10 0v3" ${sk(CL.k, 2)}/><rect x="174" y="33" width="14" height="11" rx="2" ${fl(CL.k)}/></g>`;
    }},
    business: {dur: 5.4, hl: [6, 46], end: 58, lit: '忙活的事', draw: s => {
      const busy = {0: T(), 6: T(), 100: T()};
      for (let i = 1; i < 10; i++) busy[6 + i * 4] = T(i % 2 ? -30 : 30, 0);
      busy[46] = T(); busy[92] = T();
      const coin = p => `<g ${s.a({0: 'opacity:0;' + T(), [p]: 'opacity:0;' + T(), [p + 1]: 'opacity:1;' + T(), [p + 6]: 'opacity:1;' + T(50, -18), [p + 11]: 'opacity:1;' + T(84, 6), [p + 13]: 'opacity:0;' + T(84, 6), 100: 'opacity:0'})}><circle cx="120" cy="84" r="5" ${fl(CL.g)}/></g>`;
      return GND() + `<path d="M96 52V128M244 52V128" ${sk(WOOD, 4)}/>` +
        [0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M${96 + i * 21.4} 34h21.4l-2 18h-17.4z" fill="${i % 2 ? '#f4e6c8' : '#d23c2f'}"/>`).join('') +
        `<g ${s.a(busy)}>${kid(170, 128, CL.t, {aL: [-17, -36], aR: [17, -36]})}<path d="M184 66q-3 5 0 7" ${sk('#6db7e8', 2.5)}/></g>` +
        `<rect x="100" y="92" width="140" height="36" rx="3" fill="${WOOD}"/><path d="M100 92h140" ${sk('#8c5a30', 3)}/>` +
        `<path d="M196 76h22v16h-22z" ${fs(CL.p, CL.m, 1.5)}/><path d="M199 79h16v4h-16z" ${fl(CL.g, .6)}/>` + [10, 20, 30, 40].map(coin).join('') +
        `<g ${s.a(move([[4, -50, 0], [16, 0, 0]]))}>${kid(70, 128, CL.v, {k: .85, ...walkLegs(s, 70, 128, 4, 16, 3, .85)})}</g>` +
        `<g ${s.a(move([[8, 50, 0], [20, 0, 0]]))}>${kid(270, 128, CL.a, {k: .85, ...walkLegs(s, 270, 128, 8, 20, 3, .85)})}</g>` +
        `<g ${s.a(pop(46), ORG(150, 20))}><text x="150" y="26" font-size="16" font-weight="700" text-anchor="middle" ${fl(CL.a)}>¥ ¥ ¥</text></g>`;
    }},
    // ---------- 第五批 ----------
    decision: {dur: 5.6, hl: [30, 54], end: 60, lit: '下定主意，砍掉别的', mean: '决定', draw: s => {
      const sign = (x, dir, c) => `<path d="M${x} 128V70" ${sk(WOOD, 4)}/><path d="${dir > 0 ? `M${x - 22} 52h44l10 10-10 10h-44z` : `M${x - 22} 52h44v20h-44l-10-10z`}" ${fl(c, .9)}/>`;
      return GND() + sign(70, -1, CL.v) + sign(230, 1, CL.t) +
        `<text x="70" y="68" font-size="15" font-weight="700" text-anchor="middle" fill="#fff">A</text><text x="230" y="68" font-size="15" font-weight="700" text-anchor="middle" fill="#fff">B</text>` +
        `<g ${s.a({0: T(), 30: T(), 36: T(0, 0), 56: T(56, 0), 92: T(56, 0), 100: T()})}>${kid(150, 128, CL.a, {...walkLegs(s, 150, 128, 36, 56, 5)})}</g>` +
        `<text x="150" y="58" font-size="22" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a({0: 'opacity:0;' + T(), 4: 'opacity:1;' + T(-24, 0), 12: 'opacity:1;' + T(24, 0), 20: 'opacity:1;' + T(-24, 0), 26: 'opacity:1;' + T(0, 0), 29: 'opacity:0', 100: 'opacity:0'})}>?</text>` +
        `<g ${s.a(pop(30), ORG(70, 62))}><path d="M54 48l32 28M86 48l-32 28" ${sk(CL.a, 5)}/></g>` +
        `<g ${s.a(pop(32), ORG(240, 34))}><circle cx="240" cy="34" r="12" ${fl(CL.t)}/><path d="M234 34l4.5 4.5 8-9" ${sk('#fff', 3)}/></g>` +
        `<g ${s.a({0: 'opacity:0;' + T(-40, -40, 'rotate(-30deg)'), 27: 'opacity:0;' + T(-40, -40, 'rotate(-30deg)'), 28: 'opacity:1;' + T(-40, -40, 'rotate(-30deg)'), 33: 'opacity:1;' + T(0, 0, 'rotate(0deg)'), 40: 'opacity:0;' + T(0, 0, 'rotate(0deg)'), 100: 'opacity:0'})}><path d="M112 84l16 10M112 100l16-10" ${sk(CL.k, 2.5)}/><circle cx="108" cy="82" r="4" ${sk(CL.k, 2)}/><circle cx="108" cy="102" r="4" ${sk(CL.k, 2)}/></g>`;
    }},
    manager: {dur: 5.6, hl: [8, 46], end: 60, lit: '管事的人', draw: s => {
      const box = (x, p, dx) => `<g ${s.a(move([[p, dx, 0], [p + 16, 0, 0]]))}><rect x="${x}" y="${x > 230 ? 84 : 100}" width="18" height="16" rx="2" fill="${WOOD}"/></g>`;
      return GND() + `<path d="M180 116h100M180 100h100M184 84v44M276 84v44" ${sk(CL.m, 3)}/><path d="M180 84h100" ${sk(CL.m, 3)}/>` +
        box(186, 10, -60) + box(210, 18, -80) + box(234, 26, -100) + box(258, 34, -120) +
        kid(60, 128, '#3d4a5c', {k: 1.1, aR: [26, -50], holdL: `<rect x="40" y="90" width="12" height="16" rx="1.5" ${fs(CL.p, CL.m, 1.5)}/>`}) + `<path d="M60 84l-3 4 3 12 3-12z" fill="#c0392b"/>` +
        [0, 1, 2, 3].map(i => `<path d="M42 ${94 + i * 3.4}l1.5 1.5 3-3" ${sk(CL.t, 1.3)} ${s.a(showAt(26 + i * 8))}/>`).join('') +
        `<path d="M90 76L176 76" ${sk(CL.v, 2)} stroke-dasharray="4 5" ${s.a(fadeP(6, 18))}/><path d="M170 70l6 6-6 6" ${sk(CL.v, 2)} ${s.a(showAt(17))}/>` +
        `<g ${s.a(pop(46), ORG(60, 102))}><rect x="52" y="96" width="16" height="11" rx="2" ${fl(CL.v)}/><text x="60" y="104.5" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">-r</text></g>`;
    }},
    attention: {dur: 5.4, hl: [44, 28, 54], end: 58, lit: '把心思伸向它', draw: s => {
      return GND() + kid(46, 128, '#4f6b3a', {k: 1.1, aR: [16, -52]}) + `<path d="M34 62h24l-3-8h-18z" fill="#4f6b3a"/>` +
        `<g ${s.a(pop(4), ORG(92, 48))}>${bubble(92, 48).replace('h28', 'h44').replace('M78', 'M70')}<text x="92" y="52" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.a)}>Attention!</text></g>` +
        `<g ${s.a({0: T(0, 0, 'scaleY(.86)'), 12: T(0, 0, 'scaleY(.86)'), 20: T(0, 0, 'scaleY(1.04)'), 24: T(0, 0, 'scaleY(1)'), 94: T(0, 0, 'scaleY(1)'), 100: T(0, 0, 'scaleY(.86)')}, FOOT)}>${kid(150, 128, CL.t)}</g>` +
        `<path d="M162 76H252" ${sk(CL.t, 2.5)} stroke-dasharray="4 4" ${s.a(fadeP(28, 44))}/><path d="M162 80l90 10" ${sk(CL.t, 2.5)} stroke-dasharray="4 4" ${s.a(fadeP(30, 46))}/>` +
        `<path d="M262 128V60" ${sk(CL.m, 2.5)}/><circle cx="262" cy="78" r="13" ${fs(CL.p, CL.a, 3)}/><circle cx="262" cy="78" r="6" ${fl(CL.a)}/>` +
        `<g ${s.a(pop(44), ORG(262, 78))}><circle cx="262" cy="78" r="18" ${sk(CL.g, 2.5)}/></g>` +
        `<text x="262" y="44" font-size="22" font-weight="700" text-anchor="middle" ${fl(CL.a)} ${s.a(pop(46), ORG(262, 38))}>!</text>`;
    }},
    resource: {dur: 5.6, hl: [34, 6], end: 60, lit: '能一再取用的源泉', draw: s => {
      const trip = {0: T(), 8: T(), 16: T(28, 0), 22: T(28, 0), 30: T(), 34: T(), 42: T(28, 0), 48: T(28, 0), 56: T(), 100: T()};
      const fill = {0: 'transform:scaleY(0)', 16: 'transform:scaleY(0)', 22: 'transform:scaleY(1)', 30: 'transform:scaleY(1)', 31: 'transform:scaleY(0)', 42: 'transform:scaleY(0)', 48: 'transform:scaleY(1)', 92: 'transform:scaleY(1)', 100: 'transform:scaleY(0)'};
      return GND() + `<path d="M196 128l12-58q10-14 30-12t30 18l8 52z" ${fl(CL.m, .55)}/>` +
        `<path d="M212 78q-10 6-12 22" ${sk('#6db7e8', 5)} stroke-dasharray="6 5" ${s.a({0: 'stroke-dashoffset:0', 100: 'stroke-dashoffset:-22'}, 'animation-timing-function:linear', .8)}/>` +
        `<ellipse cx="196" cy="124" rx="34" ry="7" fill="#6db7e8" opacity=".75"/><path d="M174 122q6-3 12 0t12 0 12 0" ${sk('#fff', 1.5, .6)}/>` +
        `<g ${s.a(trip)}>${kid(120, 128, CL.t, {aR: [16, -24], ...walkLegs(s, 120, 128, 8, 56, 12)})}<g><path d="M132 102h14l-2 12h-10z" ${fs(CL.m, CL.k, 1.5, .4)}/><path d="M133 104h12l-1.6 9h-8.8z" fill="#6db7e8" ${s.a(fill, 'transform-origin:50% 100%;transform-box:fill-box')}/></g></g>` +
        `<text x="120" y="50" font-size="14" font-weight="700" text-anchor="middle" ${fl(CL.t)} ${s.a(showAt(22, 32))}>1</text><text x="120" y="50" font-size="14" font-weight="700" text-anchor="middle" ${fl(CL.t)} ${s.a(showAt(48))}>2</text>` +
        `<g ${s.a(pop(52), ORG(60, 60))}><path d="M50 88V70" ${sk(WOOD, 3)}/><circle cx="50" cy="62" r="11" ${fl(CL.t, .85)}/><path d="M70 88h18v-8l-6-4h-6l-6 4z" fill="${INK}" opacity=".7"/><circle cx="34" cy="84" r="6" fill="#e8b23c"/></g>`;
    }},
    system: {dur: 5.6, hl: [28, 10], end: 60, lit: '站到一起成一个整体', draw: s => {
      const g = (cx, cy, r, n, from, spin, dl) => { const dash = f1(Math.PI * r / n);
        return `<g ${s.a({0: T(from[0], from[1], 'scale(1,.22)'), 10: T(from[0], from[1], 'scale(1,.22)'), 24: T(from[0], from[1], 'scale(1,1)'), 36: T(0, 0, 'scale(1,1)'), 94: T(0, 0, 'scale(1,1)'), 100: T(from[0], from[1], 'scale(1,.22)')})}>` +
          `<g ${s.a({0: R(0), 38: R(0), 100: R(spin)}, ORG(cx, cy) + ';animation-timing-function:linear')}><circle cx="${cx}" cy="${cy}" r="${r}" ${sk(CL.v, 7)} stroke-dasharray="${dash} ${dash}" stroke-linecap="butt"/><circle cx="${cx}" cy="${cy}" r="${r - 3}" ${fl(CL.v, .25)}/><circle cx="${cx}" cy="${cy}" r="${f1(r * .3)}" ${fl(CL.v)}/></g></g>`; };
      return GND() + g(110, 84, 18, 8, [-70, 30], 400, 0) + g(146, 70, 13, 6, [10, 50], -550, 0) + g(178, 90, 16, 7, [90, 28], 450, 0) +
        `<path d="M196 90h40V60" ${sk(CL.m, 4)}/><path d="M228 46a8 8 0 1 1 16 0c0 4-3 5-3 9h-10c0-4-3-5-3-9z" ${fl(CL.m, .4)}/><g ${s.a(showAt(44))}><path d="M228 46a8 8 0 1 1 16 0c0 4-3 5-3 9h-10c0-4-3-5-3-9z" ${fl(CL.g)}/><path d="M236 30v-5M223 36l-3-3M249 36l3-3" ${sk(CL.g, 2.5)}/></g>`;
    }},
    finding: {dur: 5.6, hl: [34, 50], end: 60, lit: '发现到的东西', draw: s => {
      return `<path d="M150 128q30-16 60 0z" fill="${WOOD}" opacity=".7"/>` + GND() +
        `<g ${s.a({0: 'opacity:0;' + T(0, 18), 32: 'opacity:0;' + T(0, 18), 34: 'opacity:1;' + T(0, 18), 42: 'opacity:1;' + T(0, 0), 92: 'opacity:1;' + T(0, 0), 100: 'opacity:0;' + T(0, 0)})}><rect x="164" y="98" width="34" height="24" rx="3" fill="${WOOD}"/><path d="M164 106h34M181 106v8" ${sk('#f2b632', 3)}/></g>` +
        `<g ${s.a(showAt(42))}><path d="M181 96l-14-22M181 96l14-22M181 96V70" ${sk(CL.g, 3)}/></g>` +
        `<g ${s.a({0: 'opacity:0;' + T(0, 0, 'scale(.3)'), 47: 'opacity:0;' + T(0, 0, 'scale(.3)'), 48: 'opacity:1;' + T(0, 0, 'scale(.3)'), 56: 'opacity:1;' + T(0, -30, 'scale(1)'), 92: 'opacity:1;' + T(0, -30, 'scale(1)'), 100: 'opacity:0;' + T(0, -30, 'scale(1)')}, ORG(181, 70))}><rect x="166" y="48" width="30" height="34" rx="2" ${fs(CL.p, CL.m, 1.5)}/><path d="M171 76V64M178 76V58M185 76V66M190 76V54" ${sk(CL.t, 3)}/></g>` +
        kid(118, 128, CL.a, {aR: [24, -26], armR: s.a(swing(6, 32, 8, -30, 14), shoulder(118, 128, 1)), holdR: `<path d="M142 102l14 18" ${sk(WOOD, 3)}/><path d="M152 116l9 2-3 8-8-3z" ${fl(CL.m)}/>`});
    }},
    avoid: {dur: 5, hl: [20, 32], end: 56, lit: '让它落了空', draw: s => {
      return GND() + `<g ${s.a({0: T(), 13: T(), 19: T(0, -46), 30: T(0, -46), 36: T(), 100: T()})}>${kid(170, 128, CL.t, {noFace: true})}<g ${s.a(hideAt(30))}>${face(170, 128, 1, 'sad')}</g><g ${s.a(showAt(30))}>${face(170, 128)}</g></g>` +
        `<g ${s.a(move([[6, 0, 0], [32, 230, 0]]))}><circle cx="30" cy="96" r="9" ${fl(CL.a)}/><path d="M16 92h-10M18 100H8" ${sk(CL.m, 2.5)}/></g>` +
        `<g ${s.a(showAt(20, 40))}><path d="M170 128v-9a11 11 0 0 1 22 0v9M159 66a11 11 0 1 1 22 0 11 11 0 1 1-22 0" transform="translate(-11 0)" ${sk(CL.m, 2)} stroke-dasharray="4 4"/><text x="170" y="56" font-size="14" font-weight="700" text-anchor="middle" ${fl(CL.m)}>空</text></g>`;
    }},
    instead: {dur: 5.8, hl: [36, 6], end: 62, lit: '站到（别人的）位置上', mean: '代替', draw: s => {
      const chair = `<path d="M170 76v36M140 98h30v14M144 112v16M168 112v16" ${sk(WOOD, 4)}/>`;
      return GND() + `<ellipse cx="156" cy="128" rx="26" ry="5" ${fl(CL.g, .5)} ${s.a(pop(4), ORG(156, 128))}/>` + chair +
        `<g ${s.a({0: 'opacity:1;' + T(), 10: 'opacity:1;' + T(), 14: 'opacity:1;' + T(0, -6), 32: 'opacity:1;' + T(110, 0), 35: 'opacity:0;' + T(110, 0), 94: 'opacity:0;' + T(110, 0), 100: 'opacity:1;' + T()})}>${kid(156, 112, CL.v, {k: .85})}</g>` +
        `<g ${s.a({0: 'opacity:0;' + T(-110, 6), 30: 'opacity:0;' + T(-110, 6), 33: 'opacity:1;' + T(-110, 6), 50: 'opacity:1;' + T(0, 6), 54: 'opacity:1;' + T(0, 0), 92: 'opacity:1;' + T(0, 0), 100: 'opacity:0;' + T(0, 0)})}>${kid(156, 112, CL.a, {k: .85, ...walkLegs(s, 156, 112, 33, 50, 4, .85)})}</g>` +
        `<path d="M100 40q56-26 112 0" ${sk(CL.t, 2.5)} ${DASH} ${s.a(drawP(34, 52))}/><path d="M204 32l8 8-10 4" ${sk(CL.t, 2.5)} ${s.a(showAt(51))}/>`;
    }},
    local: {dur: 5.4, hl: [10, 40], end: 58, lit: '某个地方的', draw: s => {
      return `<rect x="30" y="20" width="240" height="110" rx="10" ${fl(CL.t, .12)}/><path d="M30 70h240M120 20v110M200 20v110M30 100q80-20 240 6" ${sk(CL.p, 6)}/><path d="M30 70h240M120 20v110M200 20v110" ${sk(CL.m, 1, .5)}/>` +
        `<rect x="132" y="80" width="20" height="14" ${fl(CL.a, .5)}/><rect x="160" y="78" width="16" height="16" ${fl(CL.v, .5)}/><rect x="138" y="44" width="22" height="16" ${fl(CL.g, .5)}/>` +
        `<ellipse cx="158" cy="72" rx="10" ry="3" ${fl(CL.k, .3)}/>` +
        `<g ${s.a(move([[10, 0, -40], [22, 0, 0]]))}><path d="M158 72s-13-13-13-23a13 13 0 0 1 26 0c0 10-13 23-13 23z" ${fl(CL.a)}/><circle cx="158" cy="49" r="5" fill="#fff"/></g>` +
        `<ellipse cx="158" cy="72" rx="24" ry="7" ${sk(CL.a, 2)} ${s.a(pop(22), ORG(158, 72))}/>` +
        [[100, 128, CL.t, 40], [214, 128, CL.v, 44], [70, 128, CL.g, 48]].map(([x, y, c, p]) => `<g ${s.a(pop(p), 'transform-origin:50% 100%;transform-box:fill-box')}>${kid(x, y, c, {k: .55, aR: [12, -50]})}</g>`).join('') +
        `<g ${s.a(pop(50), ORG(230, 30))}><rect x="208" y="20" width="46" height="20" rx="5" ${fl(CL.a)}/><text x="231" y="34" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">本地</text></g>`;
    }},
    relationship: {dur: 6, hl: [8, 36], end: 62, lit: '同在一条船上的状态', mean: '关系', draw: s => {
      return `<rect x="0" y="112" width="300" height="38" fill="#6db7e8" opacity=".35"/>` + `<path d="M-20 120${'q10 -5 20 0'.repeat(17)}" ${sk('#fff', 2, .7)} ${s.a({0: T(), 100: T(-20)}, 'animation-timing-function:linear', 1.4)}/>` +
        `<g ${s.a(hideAt(34))}>${kid(40, 112, CL.t)}${kid(260, 112, CL.a)}<path d="M53 91Q150 120 247 91" ${sk(CL.v, 2.5)} ${DASH} ${s.a(drawP(8, 28))}/></g>` +
        `<g ${s.a({0: 'opacity:0;' + T(-60, 0), 32: 'opacity:0;' + T(-60, 0), 36: 'opacity:1;' + T(-40, 0), 92: 'opacity:1;' + T(40, 0), 100: 'opacity:0;' + T(40, 0)})}><g ${s.a({0: R(-4), 50: R(4), 100: R(-4)}, ORG(150, 116), 1.6)}>` +
        `${kid(134, 112, CL.t, {k: .8})}${kid(166, 112, CL.a, {k: .8})}<path d="M106 108h88l-12 16h-64z" fill="${WOOD}"/><path d="M150 108V62" ${sk(CL.m, 2.5)}/><path d="M152 64l26 30h-26z" ${fl(CL.p)} style="stroke:var(--ink3);stroke-width:1.5px"/>` +
        `<g ${s.a(pop(44), ORG(150, 50))}>${heartAt(150, 48, 1)}</g></g></g>`;
    }},
    individual: {dur: 5.8, hl: [40, 10, 56], end: 60, lit: '不能再分的一个', draw: s => {
      const piece = (x, y, dx, dy) => `<g ${s.a({0: T(), 12: T(), 22: T(dx, dy), 92: T(dx, dy), 100: T()})}><rect x="${x}" y="${y}" width="40" height="36" rx="3" ${fl(CL.v, .3)}/></g>`;
      return GND() + piece(110, 56, -30, -10) + piece(150, 56, 30, -10) + piece(110, 92, -30, 0) + piece(150, 92, 30, 0) +
        `<g ${s.a(showAt(20))}>${[[100, 92], [200, 92], [100, 128], [200, 128]].map(([x, y]) => kid(x, y, CL.m, {k: .5})).join('')}</g>` +
        `<g ${s.a(showAt(26))}><path d="M150 128V104" ${sk(CL.m, 0)}/>${kid(150, 128, CL.a, {k: .75})}</g>` +
        `<g ${s.a({0: T(0, -40), 4: T(0, -40), 10: T(0, -4), 14: T(0, -40), 34: T(0, -40), 40: T(0, -12), 43: T(0, -24, 'rotate(-20deg)'), 50: T(0, -40), 100: T(0, -40)})}><path class="knife" d="M146 4h8v22l-4 6-4-6z" ${fl(CL.k, .75)}/></g>` +
        `<path d="M150 50V128M110 92h80" ${sk(CL.p, 2.5)} ${DASH} ${s.a(drawP(8, 14))}/>` +
        `<g ${s.a(pop(42), ORG(172, 44))}><path d="M164 36l16 16M180 36l-16 16" ${sk(CL.a, 3.5)}/></g>` +
        `<path d="M128 0h44l20 128h-84z" ${fl(CL.g, .14)} ${s.a(showAt(50))}/>`;
    }},
    interest: {dur: 5.6, hl: [8, 30], end: 60, lit: '身在其中就有一份', mean: '利益；兴趣', draw: s => {
      const slice = (a, p) => { const r = 34, x1 = 150 + r * Math.cos(a), y1 = 70 + r * Math.sin(a), x2 = 150 + r * Math.cos(a + 1.05), y2 = 70 + r * Math.sin(a + 1.05);
        return `<path d="M150 70L${f1(x1)} ${f1(y1)}A${r} ${r} 0 0 1 ${f1(x2)} ${f1(y2)}z" ${fs(CL.g, CL.p, 2, .85)}/>`; };
      return GND() + [0, 1, 2, 3, 4, 5].map(i => slice(i * 1.047 - 1.57, 0)).join('') +
        `<g ${s.a({0: T(), 30: T(), 40: T(-40, 8, 'scale(.6)'), 92: T(-40, 8, 'scale(.6)'), 100: T()}, ORG(150, 70))}>${slice(1.57, 0).replace(CL.g, CL.a)}</g>` +
        `<g ${s.a(move([[8, -80, 0], [24, 0, 0]]))}>${kid(96, 128, CL.t, {noFace: true, ...walkLegs(s, 96, 128, 8, 24, 4)})}<g ${s.a(hideAt(42))}>${face(96, 128)}</g><g ${s.a(showAt(42))}>${face(96, 128)}${heartAt(92, 74, .3)}${heartAt(100, 74, .3)}</g></g>` +
        `<ellipse cx="150" cy="78" rx="84" ry="56" ${sk(CL.t, 2)} stroke-dasharray="5 5"/>` +
        `<g ${s.a(pop(48), ORG(240, 40))}><circle cx="236" cy="40" r="9" ${fl(CL.g)}/><circle cx="248" cy="32" r="7" ${fl(CL.g, .8)}/><text x="236" y="44" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">¥</text></g>`;
    }},
    // ---------- 第六批 ----------
    global: {dur: 5.6, hl: [6, 48], end: 60, lit: '整个地球的', draw: s => {
      const land = dx => `<path d="M${118 + dx} 52q10-8 22-2t8 14-14 10-12-4-4-18zM${150 + dx} 78q12-4 18 4t-4 16-16-2zM${96 + dx} 86q8-6 14 2t-2 12-10-4z" fill="#5fae6a"/>`;
      const orbit = {};
      for (let i = 0; i <= 20; i++) { const a = Math.PI * 2 * i / 20; orbit[i * 5] = T(f1(72 * Math.cos(a)), f1(22 * Math.sin(a))); }
      return `<defs><clipPath id="sc-glob-clip"><circle cx="150" cy="70" r="40"/></clipPath></defs>` +
        `<g ${s.a(pop(4), ORG(150, 70))}><circle cx="150" cy="70" r="40" fill="#6db7e8"/><g clip-path="url(#sc-glob-clip)"><g ${s.a({0: T(), 100: T(-80)}, 'animation-timing-function:linear', 6)}>${land(0)}${land(80)}${land(-80)}</g></g><circle cx="150" cy="70" r="40" ${sk(CL.k, 1.5, .3)}/></g>` +
        `<ellipse cx="150" cy="70" rx="72" ry="22" ${sk(CL.m, 1.5, .6)} stroke-dasharray="3 5"/>` +
        `<g ${s.a(showAt(28))}><g ${s.a(orbit, 'animation-timing-function:linear', 2.4)}><path d="M150 70l-4 8 14-8-14-8z" ${fl(CL.a)}/></g></g>` +
        `<path d="M122 58Q150 30 176 62M130 88q24 14 40-10" ${sk(CL.g, 2.5)} ${DASH} ${s.a(drawP(46, 56))}/>` +
        [[122, 58], [176, 62], [130, 88], [170, 78]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" ${fl(CL.g)} ${s.a(pop(50), ORG(x, y))}/>`).join('') +
        `<g ${s.a(pop(52), ORG(150, 132))}><rect x="122" y="120" width="56" height="22" rx="6" ${fl(CL.t)}/><text x="150" y="135.5" font-size="12" font-weight="700" text-anchor="middle" fill="#fff">全球</text></g>`;
    }},
    someone: {dur: 5.4, hl: [6, 40], end: 58, lit: '某一个人', draw: s => {
      return GND() + `<rect x="126" y="28" width="68" height="100" ${fl(CL.k, .55)}/>` +
        `<g ${s.a({0: 'opacity:0', 38: 'opacity:0', 42: 'opacity:1', 94: 'opacity:1', 100: 'opacity:0'})}>${kid(160, 128, CL.v, {aL: [-14, -40]})}</g>` +
        `<g ${s.a({0: 'transform:scaleX(1)', 38: 'transform:scaleX(1)', 46: 'transform:scaleX(.18)', 92: 'transform:scaleX(.18)', 100: 'transform:scaleX(1)'}, 'transform-origin:0% 50%;transform-box:fill-box')}>` +
        `<rect x="126" y="28" width="68" height="100" fill="${WOOD}"/><rect x="134" y="38" width="52" height="46" rx="3" fill="#bfe1f2" opacity=".75"/><circle cx="184" cy="88" r="3" fill="#f2b632"/>` +
        `<g ${s.a(showAt(6, 38))}><circle cx="160" cy="56" r="9" fill="${INK}" opacity=".5"/><path d="M146 84q0-16 14-16t14 16z" fill="${INK}" opacity=".5"/></g></g>` +
        `<text x="160" y="22" font-size="22" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a({...pop(6), 36: 'opacity:1;transform:scale(1)', 40: 'opacity:0;transform:scale(1)', 92: 'opacity:0', 100: 'opacity:0'}, ORG(160, 16))}>?</text>` +
        [0, 1].map(i => `<path d="M${204 + i * 6} ${60 + i * 8}l8-4M${204 + i * 6} ${68 + i * 8}h9" ${sk(CL.m, 2.5)} ${s.a({0: 'opacity:0', [16 + i * 6]: 'opacity:0', [18 + i * 6]: 'opacity:1', [22 + i * 6]: 'opacity:0', 100: 'opacity:0'})}/>`).join('');
    }},
    factor: {dur: 5.6, hl: [30, 52], end: 60, lit: '促成结果的东西', draw: s => {
      const arrow = (d, p) => `<path d="${d}" ${sk(CL.m, 2)} stroke-dasharray="4 4" ${s.a(fadeP(p, p + 8))}/>`;
      const num = (x, y, n, p) => `<g ${s.a(pop(p), ORG(x, y))}><circle cx="${x}" cy="${y}" r="7" ${fl(CL.v)}/><text x="${x}" y="${y + 3.5}" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">${n}</text></g>`;
      return GND() + `<g ${s.a(pop(6), ORG(44, 34))}><circle cx="44" cy="34" r="11" ${fl(CL.g)}/>${rays(44, 34, 15, 21, 8).replace('<path ', `<path ${sk(CL.g, 2.5)} `)}</g>` + arrow('M58 44L136 84', 10) + num(28, 20, 1, 8) +
        `<g ${s.a(pop(16), ORG(258, 30))}><path d="M240 36a10 10 0 0 1 10-14 14 14 0 0 1 24 4 9 9 0 0 1-2 18h-26a8 8 0 0 1-6-8z" ${fl(CL.m, .5)}/><path d="M250 50l-2 6M260 50l-2 6M270 50l-2 6" ${sk('#6db7e8', 2.5)}/></g>` + arrow('M244 62L168 88', 20) + num(276, 18, 2, 18) +
        `<g ${s.a(pop(26), ORG(44, 112))}><path d="M30 128v-24l6-6h16l6 6v24z" fill="${WOOD}"/><path d="M36 110h16" ${sk(CL.p, 2)}/></g>` + arrow('M62 112L130 112', 30) + num(24, 96, 3, 28) +
        `<path d="M150 116V70" ${sk(CL.t, 3.5)} ${DASH} ${s.a(drawP(34, 50))}/>` +
        `<path d="M150 96q-14 0-16-12q14-1 16 12z" ${fl(CL.t)} ${s.a(pop(40), ORG(150, 96))}/><path d="M150 84q14 0 16-12q-14-1-16 12z" ${fl(CL.t)} ${s.a(pop(44), ORG(150, 84))}/>` +
        `<g ${s.a(pop(50), ORG(150, 66))}>${[0, 72, 144, 216, 288].map(a => `<circle cx="${f1(150 + 6 * Math.cos(a * Math.PI / 180))}" cy="${f1(66 + 6 * Math.sin(a * Math.PI / 180))}" r="5" ${fl(CL.a)}/>`).join('')}<circle cx="150" cy="66" r="4" ${fl(CL.g)}/></g>` +
        `<path d="M134 116h32l-4 12h-24z" ${fl(CL.a, .8)}/>`;
    }},
    program: {dur: 5.8, hl: [6, 10], end: 62, lit: '事先写好的单子', mean: '节目；程序', draw: s => {
      const show = (p, inner) => `<g ${s.a({0: 'opacity:0', [p]: 'opacity:0', [p + 2]: 'opacity:1', [p + 10]: 'opacity:1', [p + 12]: 'opacity:0', 100: 'opacity:0'})}>${inner}</g>`;
      return GND() + `<rect x="30" y="22" width="84" height="100" rx="3" ${fs(CL.p, CL.m, 2)}/><text x="72" y="38" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.k)}>节目单</text>` +
        [0, 1, 2].map(i => `<circle cx="42" cy="${56 + i * 20}" r="3" ${fl(CL.a)} ${s.a(showAt(8 + i * 7))}/><path d="M50 ${56 + i * 20}h52" ${sk(CL.m, 2.5)} ${DASH} ${s.a(drawP(8 + i * 7, 14 + i * 7))}/>`).join('') +
        `<rect x="34" y="47" width="76" height="18" rx="3" ${fl(CL.g, .3)} ${s.a({0: 'opacity:0;' + T(), 34: 'opacity:0;' + T(), 35: 'opacity:1;' + T(), 46: 'opacity:1;' + T(), 47: 'opacity:1;' + T(0, 20), 58: 'opacity:1;' + T(0, 20), 59: 'opacity:1;' + T(0, 40), 70: 'opacity:1;' + T(0, 40), 72: 'opacity:0;' + T(0, 40), 100: 'opacity:0'})}/>` +
        `<path d="M124 72h28" ${sk(CL.m, 2.5)}/><path d="M146 66l6 6-6 6" ${sk(CL.m, 2.5)}/>` +
        `<rect x="164" y="30" width="112" height="74" rx="6" ${fl(CL.k, .8)}/><rect x="170" y="36" width="100" height="62" rx="3" ${fl(CL.p)}/><path d="M206 104l-8 12M234 104l8 12" ${sk(CL.m, 3)}/>` +
        show(34, sparkle(220, 66, 16, CL.a)) + show(46, `<path d="M214 80V54l14-4v24" ${sk(CL.v, 3)}/><circle cx="210" cy="80" r="5" ${fl(CL.v)}/><circle cx="224" cy="74" r="5" ${fl(CL.v)}/>`) +
        show(58, `<circle cx="220" cy="66" r="15" ${fl(CL.t)}/><path d="M205 66h30M220 51q-8 15 0 30" ${sk('#fff', 2)}/>`);
    }},
    environment: {dur: 5.6, hl: [30, 8, 54], end: 60, lit: '围在四周的一圈', draw: s => {
      return GND() + kid(150, 116, CL.a, {k: .8}) +
        `<ellipse cx="150" cy="80" rx="122" ry="58" ${sk(CL.t, 3)} stroke-dasharray="7 6" ${s.a(fadeP(8, 28))}/>` +
        `<g ${s.a(pop(30), 'transform-origin:50% 100%;transform-box:fill-box')}><path d="M64 128V104" ${sk(WOOD, 5)}/><circle cx="64" cy="92" r="16" fill="#5fae6a"/></g>` +
        `<g ${s.a(pop(34), ORG(214, 40))}><circle cx="214" cy="40" r="10" ${fl(CL.g)}/>${rays(214, 40, 14, 19, 8).replace('<path ', `<path ${sk(CL.g, 2.5)} `)}</g>` +
        `<g ${s.a(pop(38), ORG(96, 50))}><path d="M84 52q6-8 12 0q6-8 12 0" ${sk(CL.k, 2.5)}/></g>` +
        `<g ${s.a(pop(42), ORG(232, 120))}><path d="M200 124q8-5 16 0t16 0 16 0" ${sk('#6db7e8', 4)}/></g>` +
        `<g ${s.a(pop(46), 'transform-origin:50% 100%;transform-box:fill-box')}><path d="M110 128v-12" ${sk(CL.t, 2.5)}/><circle cx="110" cy="112" r="5" ${fl(CL.v)}/><path d="M190 128v-10" ${sk(CL.t, 2.5)}/><circle cx="190" cy="114" r="4.5" ${fl(CL.a)}/></g>`;
    }},
    growth: {dur: 5.6, hl: [8, 54], end: 60, lit: '长大这件事', draw: s => {
      const K = [.55, .75, .95, 1.12], P = [6, 22, 38, 52];
      const f = {0: 'transform:scale(.55)', 100: 'transform:scale(.55)'};
      K.forEach((k, i) => { f[P[i]] = `transform:scale(${k})`; f[P[i] + 8] = `transform:scale(${k})`; });
      f[92] = 'transform:scale(1.12)';
      return GND() + `<rect x="200" y="20" width="22" height="108" ${fl(CL.g, .35)}/>` + Array.from({length: 10}, (_, i) => `<path d="M200 ${30 + i * 10}h${i % 2 ? 6 : 11}" ${sk(CL.k, 1.5, .6)}/>`).join('') +
        K.map((k, i) => `<g ${s.a(showAt(P[i] + 6))}><path d="M168 ${f1(128 - 63 * k)}h34" ${sk(CL.a, 2)} stroke-dasharray="3 3"/><text x="232" y="${f1(132 - 63 * k)}" font-size="9" font-weight="700" ${fl(CL.a)}>${i + 1}</text></g>`).join('') +
        `<g ${s.a(f, FOOT)}>${kid(150, 128, CL.t)}</g>` +
        `<g ${s.a(pop(54), ORG(96, 40))}>${sparkle(96, 40, 7)}</g>`;
    }},
    passage: {dur: 5.6, hl: [6, 46], end: 60, lit: '穿过去的一段', mean: '短文；通道', draw: s => {
      return GND() + `<path d="M108 128V78a42 42 0 0 1 84 0v50z" ${fl(INK, .7)}/>` +
        [[86, 96], [86, 112], [200, 96], [200, 112]].map(([x, y]) => `<path d="M${x} ${y}h14" ${sk(CL.p, 1.5, .5)}/>`).join('') +
        `<g ${s.a(move([[6, 0, 0], [44, 240, 0]]))}>${kid(30, 128, CL.t, walkLegs(s, 30, 128, 6, 44, 10))}</g>` +
        `<path d="M86 128V72a64 64 0 0 1 128 0v56zM108 128V78a42 42 0 0 1 84 0v50z" fill-rule="evenodd" fill="#b9bcc2"/>` +
        `<g ${s.a(pop(46), ORG(150, 36))}><path d="M110 18l40 8v34l-40-8zM190 18l-40 8v34l40-8z" ${fs(CL.p, CL.v, 2)}/><text x="130" y="38" font-size="7" font-weight="700" text-anchor="middle" ${fl(CL.v)}>Passage</text>` +
        `<path d="M118 44l24 4M118 50l24 4M158 30l24-4M158 36l24-4M158 42l24-4M158 48l18-3" ${sk(CL.m, 1.5)}/></g>`;
    }},
    service: {dur: 5.6, hl: [10, 50], end: 60, lit: '为别人做事', draw: s => {
      return GND() + `<rect x="196" y="96" width="70" height="6" rx="2" fill="${WOOD}"/><path d="M204 102v26M258 102v26" ${sk(WOOD, 4)}/>` +
        `<path d="M266 80v48M240 110h26" ${sk(WOOD, 4)}/>` + kid(250, 110, CL.v, {k: .85, noFace: true}) + `<g ${s.a(hideAt(42))}>${face(250, 110, .85)}</g><g ${s.a(showAt(42))}>${face(250, 110, .85)}${heartAt(250, 46, .9)}</g>` +
        `<g ${s.a(move([[6, 0, 0], [30, 126, 0]]))}>${kid(60, 128, CL.a, {aR: [16, -48], ...walkLegs(s, 60, 128, 6, 30, 6)})}<path d="M54 88l6 3 6-3-6-3z" fill="${INK}"/>` +
        `<path d="M64 80h28" ${sk(CL.m, 3)}/><g ${s.a({0: 'opacity:1', 32: 'opacity:1', 33: 'opacity:0', 94: 'opacity:0', 100: 'opacity:1'})}><path d="M74 70h12l-2 10h-8z" ${fl(CL.p)} style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M78 66q2-4 0-8" ${sk(CL.m, 1.5)}/></g></g>` +
        `<g ${s.a(showAt(33))}><path d="M226 86h12l-2 10h-8z" ${fl(CL.p)} style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M230 82q2-4 0-8M234 82q2-4 0-8" ${sk(CL.m, 1.5)}/></g>` +
        `<g ${s.a(pop(36), ORG(150, 34))}><path d="M140 40a10 10 0 0 1 20 0z" ${fl(CL.g)}/><path d="M136 41h28M150 30v-3" ${sk(CL.g, 2.5)}/><path d="M168 26l5-3M168 36h6M132 26l-5-3" ${sk(CL.g, 2)}/></g>`;
    }},
    consumer: {dur: 5.6, hl: [26, 52], end: 60, lit: '买东西、用东西的人', draw: s => {
      const item = (x, y, c, p, tx) => `<g ${s.a(move([[p, 0, 0], [p + 4, 8, -14], [p + 10, tx - x, 96 - y]]))}><rect x="${x}" y="${y}" width="12" height="12" rx="2" ${fl(c)}/></g>`;
      return GND() + `<path d="M20 48h70M20 76h70M20 104h70M24 40v88M86 40v88" ${sk(CL.m, 2.5)}/>` +
        `<g ${s.a(move([[6, -30, 0], [22, 70, 0]]))}>${kid(84, 128, CL.t, {aR: [24, -30], ...walkLegs(s, 84, 128, 6, 22, 4)})}<path d="M108 98h34l-6 20h-24z" ${fs(CL.p, CL.k, 2.5, .3)}/><circle cx="116" cy="122" r="3" ${fl(CL.k)}/><circle cx="134" cy="122" r="3" ${fl(CL.k)}/></g>` +
        item(30, 36, CL.a, 26, 190) + item(56, 64, CL.v, 31, 202) + item(40, 92, CL.g, 36, 196) +
        `<rect x="250" y="80" width="40" height="48" rx="3" ${fl(CL.m, .5)}/><rect x="256" y="70" width="28" height="12" rx="2" ${fl(CL.k, .7)}/>` +
        `<g ${s.a({0: 'opacity:0;' + T(), 44: 'opacity:0;' + T(), 45: 'opacity:1;' + T(), 52: 'opacity:1;' + T(70, -12), 54: 'opacity:0;' + T(70, -12), 100: 'opacity:0'})}><circle cx="196" cy="88" r="6" ${fl(CL.g)}/></g>` +
        `<g ${s.a({0: 'transform:scaleY(0)', 52: 'transform:scaleY(0)', 58: 'transform:scaleY(1)', 92: 'transform:scaleY(1);opacity:1', 100: 'transform:scaleY(1);opacity:0'}, 'transform-origin:50% 100%;transform-box:fill-box')}><rect x="262" y="40" width="16" height="30" ${fs(CL.p, CL.m, 1.5)}/><path d="M265 48h10M265 54h10M265 60h6" ${sk(CL.m, 1.2)}/></g>` +
        `<g ${s.a(pop(52), ORG(154, 100))}><rect x="146" y="94" width="16" height="11" rx="2" ${fl(CL.v)}/><text x="154" y="102.5" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">-r</text></g>`;
    }},
    effort: {dur: 5.6, hl: [6, 20], end: 60, lit: '使出力气', draw: s => {
      const up = {0: T(), 6: T()}; for (let i = 1; i <= 11; i++) up[f1(6 + i * 4)] = T(f1(i * 10 + (i % 2 ? -2 : 0)), f1(-i * 3.1));
      up[92] = T(110, -34); up[100] = T();
      return `<path d="M40 128L260 60V128z" ${fl(CL.m, .2)}/><path d="M0 128h40L260 60h40" ${sk(CL.m, 2.5)}/>` +
        `<g ${s.a(up)}><circle cx="100" cy="86" r="22" ${fl(CL.m, .8)}/><path d="M88 78l6 4M104 92l8-2" ${sk(CL.k, 2, .4)}/>` +
        `<g transform="rotate(18 66 115)">${kid(66, 115, CL.a, {aL: [16, -32], aR: [20, -36], noFace: true})}${face(66, 115, 1, 'sad')}</g><path d="M80 52q-3 5 0 7M88 58q-3 5 0 7" ${sk('#6db7e8', 2.5)}/></g>` +
        `<path d="M262 60V28" ${sk(CL.k, 2.5)}/><path d="M262 28h18l-4 6 4 6h-18z" ${fl(CL.a)} ${s.a(pop(54), ORG(262, 34))}/>` +
        `<g ${s.a(pop(56), ORG(230, 24))}>${sparkle(232, 22, 7)}</g>`;
    }},
    speaker: {dur: 5.4, hl: [6, 40], end: 58, lit: '说话的人或东西', mean: '演讲者；扬声器', draw: s => {
      const wave = (x, y, dl, d = 1) => `<path d="M${x} ${y - 10}q${8 * d} 10 0 20" ${sk(CL.t, 2.5)} ${s.a({0: 'opacity:0;' + T(), 15: 'opacity:1;' + T(), 85: 'opacity:1;' + T(28 * d), 100: 'opacity:0;' + T(28 * d)}, `animation-delay:${dl}s;animation-timing-function:linear`, 1)}/>`;
      return GND() + kid(76, 128, CL.v) + `<rect x="54" y="92" width="48" height="36" ${fl(WOOD)}/><path d="M60 100h36" ${sk(CL.p, 2, .5)}/><path d="M90 92l6-12" ${sk(CL.k, 2)}/><circle cx="97" cy="78" r="3.5" ${fl(CL.k)}/>` +
        `<g ${s.a(showAt(6, 40))}>${wave(104, 76, 0)}${wave(104, 76, .5)}</g>` +
        `<g ${s.a(pop(40), ORG(200, 56))}><rect x="186" y="36" width="28" height="40" rx="4" ${fl(CL.k, .8)}/><circle cx="200" cy="64" r="8" ${fl(CL.m)}/><circle cx="200" cy="46" r="4" ${fl(CL.m)}/></g>` +
        `<g ${s.a(showAt(44))}>${wave(218, 56, 0)}${wave(218, 56, .33)}${wave(218, 56, .66)}</g>` +
        kid(236, 128, CL.t, {k: .55}) + kid(270, 128, CL.g, {k: .55});
    }},
    participant: {dur: 5.8, hl: [6, 26, 48], end: 60, lit: '拿走一份的人', draw: s => {
      const kx = [52, 116, 184, 248];
      const slice = (i) => { const a0 = i * Math.PI / 2 - Math.PI, a1 = a0 + Math.PI / 2, r = 28;
        const d = `M150 66L${f1(150 + r * Math.cos(a0))} ${f1(66 + r * Math.sin(a0))}A${r} ${r} 0 0 1 ${f1(150 + r * Math.cos(a1))} ${f1(66 + r * Math.sin(a1))}z`;
        const p = 24 + i * 5;
        return `<g ${s.a({0: T(), [p]: T(), [p + 10]: T(f1(kx[i] - 150), 30, 'scale(.6)'), 92: T(f1(kx[i] - 150), 30, 'scale(.6)'), 100: T()}, ORG(150, 66))}><path d="${d}" ${fs(BREAD, CL.p, 2)}/></g>`; };
      return GND() + [0, 1, 2, 3].map(slice).join('') +
        `<path d="M122 66h56M150 38v56" ${sk(CL.p, 2.5)} ${DASH} ${s.a({...drawP(6, 20), 24: 'stroke-dashoffset:0;opacity:1', 27: 'stroke-dashoffset:0;opacity:0', 92: 'opacity:0', 100: 'opacity:0'})}/>` +
        kx.map((x, i) => kid(x, 128, [CL.t, CL.a, CL.v, CL.g][i], {k: .7, aR: [14, -36]}) + `<g ${s.a(pop(48 + i * 2), ORG(x, 108))}><rect x="${x - 7}" y="104" width="14" height="9" rx="2" ${fl(CL.v)}/><text x="${x}" y="111" font-size="6.5" font-weight="700" text-anchor="middle" fill="#fff">ant</text></g>`).join('');
    }},
    // ---------- 第七批 ----------
    design: {dur: 5.6, hl: [22, 6], end: 60, lit: '画出标记、定下样子', draw: s => {
      const line = (d, p0, p1) => `<path d="${d}" ${sk('#fff', 2.5)} ${DASH} ${s.a(drawP(p0, p1))}/>`;
      return GND() + `<path d="M40 128l20-36M120 128l-20-36" ${sk(WOOD, 4)}/><rect x="26" y="34" width="110" height="64" rx="3" fill="#2f6fae"/>` +
        `<path d="M26 46h110M26 58h110M26 70h110M26 82h110M50 34v64M74 34v64M98 34v64M122 34v64" ${sk('#fff', .6, .3)}/>` +
        line('M62 50v38M62 70h34v18M96 70V80', 6, 22) + line('M62 50h10v20', 14, 22) +
        `<g ${s.a(showAt(22))}><path d="M58 92h42M58 89v6M100 89v6" ${sk('#ffd76a', 1.8)}/><text x="79" y="91" font-size="7" font-weight="700" text-anchor="middle" fill="#ffd76a">40</text><path d="M104 70v18M101 70h6M101 88h6" ${sk('#ffd76a', 1.8)}/></g>` +
        `<g ${s.a(pop(46), 'transform-origin:50% 100%;transform-box:fill-box')}><path d="M206 66v62M206 96h46v32M252 106v22M210 128v-6" ${sk(WOOD, 6)}/><rect x="204" y="92" width="52" height="8" rx="2" fill="${WOOD}"/></g>` +
        `<path d="M142 72q30-14 54 0" ${sk(CL.t, 2.5)} ${DASH} ${s.a(drawP(36, 46))}/><path d="M190 66l6 6-8 3" ${sk(CL.t, 2.5)} ${s.a(showAt(45))}/>` +
        `<g ${s.a(pop(52), ORG(230, 56))}>${sparkle(232, 56, 7)}</g>`;
    }},
    offer: {dur: 5.4, hl: [6, 28], end: 58, lit: '带到你面前', mean: '提供', draw: s => {
      return GND() + `<g ${s.a(move([[6, 0, 0], [24, 74, 0]]))}>${kid(60, 128, CL.t, {aR: [22, -32], ...walkLegs(s, 60, 128, 6, 24, 4)})}` +
        `<g ${s.a({0: T(), 26: T(), 38: T(30, -6), 92: T(30, -6), 100: T()})}><rect x="76" y="86" width="22" height="18" rx="2" ${fl(CL.a)}/><path d="M87 86v18M76 94h22" ${sk(CL.g, 2.5)}/><path d="M87 86q-6-8-9-3t9 3q6-8 9-3t-9 3" ${sk(CL.g, 2)}/></g></g>` +
        kid(222, 128, CL.v, {noFace: true, aL: [-16, -32]}) + `<g ${s.a(hideAt(42))}>${face(222, 128)}</g><g ${s.a(showAt(42))}>${face(222, 128)}${heartAt(222, 50, 1)}</g>` +
        `<path d="M110 60h60" ${sk(CL.t, 2.5)} ${DASH} ${s.a(drawP(6, 20))}/><path d="M164 54l6 6-6 6" ${sk(CL.t, 2.5)} ${s.a(showAt(19))}/>`;
    }},
    opportunity: {dur: 6, hl: [8, 22, 54], end: 60, lit: '顺风驶向港口的好时候', mean: '机会', draw: s => {
      return `<rect x="0" y="104" width="300" height="46" fill="#6db7e8" opacity=".35"/><path d="M-20 108${'q10 -5 20 0'.repeat(17)}" ${sk('#fff', 2, .7)} ${s.a({0: T(), 100: T(-20)}, 'animation-timing-function:linear', 1.4)}/>` +
        `<path d="M232 104h68v-14h-50z" ${fl(CL.m, .55)}/><rect x="258" y="44" width="14" height="46" ${fl(CL.p)} style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M258 56h14M258 70h14" ${sk(CL.a, 4)}/><path d="M255 44h20l-4-8h-12z" ${fl(CL.a)}/>` +
        `<g ${s.a(showAt(22))}><path d="M265 38l-40-12v20z" ${fl(CL.g, .35)}/><circle cx="265" cy="40" r="4" ${fl(CL.g)}/></g>` +
        `<g ${s.a({0: T(), 10: T(), 100: T()})}>${[0, 1, 2].map(i => `<path d="M${14 + i * 4} ${40 + i * 12}h30a5 5 0 1 0-5-5" ${sk(CL.m, 2.5)} ${s.a({0: 'opacity:0;' + T(-10), 20: 'opacity:1;' + T(), 80: 'opacity:1;' + T(20), 100: 'opacity:0;' + T(30)}, `animation-delay:${i * .3}s;animation-timing-function:linear`, 1.6)}/>`).join('')}</g>` +
        `<g ${s.a({0: T(), 8: T(), 50: T(150, 0), 92: T(150, 0), 100: T()})}><g ${s.a({0: R(-5), 50: R(5), 100: R(-5)}, ORG(66, 104), 1.6)}><path d="M40 98h52l-8 10H48z" fill="${WOOD}"/><path d="M66 98V54" ${sk(CL.m, 2.5)}/><path d="M68 56q24 18 0 38z" ${fl(CL.p)} style="stroke:var(--ink3);stroke-width:1.5px"/>${kid(54, 98, CL.t, {k: .5})}</g></g>` +
        `<g ${s.a(pop(54), ORG(200, 30))}>${sparkle(200, 30, 9)}${sparkle(178, 50, 5)}</g>`;
    }},
    academic: {dur: 5.6, hl: [4, 50], end: 60, lit: '学院里的', mean: '学术的', draw: s => {
      const f = (t, x, y, p) => `<g ${s.a({0: 'opacity:0;' + T(0, 20, 'scale(.4)'), [p]: 'opacity:0;' + T(0, 20, 'scale(.4)'), [p + 2]: 'opacity:1;' + T(0, 16, 'scale(.5)'), [p + 10]: 'opacity:1;' + T(0, 0, 'scale(1)'), 92: 'opacity:1;' + T(0, 0, 'scale(1)'), 100: 'opacity:0;' + T(0, 0, 'scale(1)')}, ORG(x, y))}><text x="${x}" y="${y}" font-size="13" font-weight="700" font-family="Georgia,serif" text-anchor="middle" ${fl(CL.v)}>${t}</text></g>`;
      return GND() + `<g ${s.a(pop(2), 'transform-origin:50% 100%;transform-box:fill-box')}><rect x="16" y="118" width="110" height="10" ${fl(CL.m, .5)}/>` + [24, 46, 68, 90, 110].map(x => `<rect x="${x}" y="78" width="9" height="40" ${fs(CL.p, CL.m, 1.5)}/>`).join('') +
        `<rect x="18" y="72" width="106" height="7" ${fl(CL.v, .85)}/><path d="M14 72L71 46l57 26z" ${fl(CL.v, .8)}/></g>` +
        kid(186, 128, CL.a, {aL: [-14, -32], aR: [14, -32]}) + `<path d="M186 66l-16 5 16 5 16-5z" fill="${INK}"/><path d="M200 71v8" ${sk(CL.g, 2)}/>` +
        `<rect x="170" y="94" width="32" height="18" rx="2" ${fs('#f4e6c8', WOOD, 1.5)}/><path d="M174 100h24M174 105h18" ${sk(CL.m, 1.2)}/>` +
        f('E=mc²', 150, 40, 16) + f('π', 230, 50, 24) + f('Σ', 214, 26, 32) + f('√x', 262, 34, 40);
    }},
    natural: {dur: 5.8, hl: [6, 50], end: 60, lit: '大自然的', mean: '自然的', draw: s => {
      return `<g ${s.a({0: T(0, 40), 6: T(0, 40), 24: T(0, 0), 92: T(0, 0), 100: T(0, 40)})}><circle cx="150" cy="56" r="16" ${fl(CL.g)}/>${rays(150, 56, 20, 27, 10).replace('<path ', `<path ${sk(CL.g, 2.5)} `)}</g>` +
        `<path d="M0 128L70 54l50 46 40-30 70 58z" fill="#7d9c7a"/><path d="M150 128l60-62 90 62z" fill="#5e8a68"/><path d="M58 66l12-12 10 10-8-2z" fill="#fff" opacity=".8"/>` +
        `<path d="M0 132q40-10 80 0t80 0 80 0 80 0" ${sk('#6db7e8', 6)}/>` +
        `<g ${s.a(growY(20, 34), 'transform-origin:50% 100%;transform-box:fill-box')}><path d="M236 128V100" ${sk(WOOD, 5)}/><circle cx="236" cy="88" r="16" fill="#3f8f4f"/><circle cx="226" cy="96" r="9" fill="#3f8f4f"/></g>` +
        `<g ${s.a(move([[30, -60, 10], [50, 40, -10]]))}><path d="M80 40q6-8 12 0q6-8 12 0" ${sk(INK, 2.5)}/></g>` +
        `<g ${s.a(pop(36), 'transform-origin:50% 100%;transform-box:fill-box')}><path d="M40 128v-10" ${sk(CL.t, 2)}/><circle cx="40" cy="116" r="4" ${fl(CL.a)}/><path d="M276 128v-8" ${sk(CL.t, 2)}/><circle cx="276" cy="118" r="3.5" ${fl(CL.v)}/></g>`;
    }},
    population: {dur: 5.6, hl: [6, 50], end: 60, lit: '人的总数', mean: '人口', draw: s => {
      const spots = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) spots.push([40 + c * 26 + (r % 2) * 13, 76 + r * 26]);
      const order = spots.map((p, i) => [p, i]).sort((a, b) => Math.hypot(a[0][0] - 150, a[0][1] - 102) - Math.hypot(b[0][0] - 150, b[0][1] - 102));
      return GND() + order.map(([[x, y], i], k) => `<g ${s.a(pop(6 + Math.floor(Math.log2(k + 1)) * 8), 'transform-origin:50% 100%;transform-box:fill-box')}>${kid(x, y, [CL.t, CL.a, CL.v, CL.g][i % 4], {k: .36})}</g>`).join('') +
        `<rect x="104" y="14" width="92" height="26" rx="6" ${fl(CL.k, .8)}/>` +
        ['1', '3', '15', '27', '9999+'].map((t, i) => `<text x="150" y="32" font-size="13" font-weight="700" text-anchor="middle" fill="#7cf0b0" ${s.a({0: 'opacity:0', [6 + i * 8]: 'opacity:0', [7 + i * 8]: 'opacity:1', [i < 4 ? 14 + i * 8 : 94]: 'opacity:1', [i < 4 ? 15 + i * 8 : 96]: 'opacity:0', 100: 'opacity:0'})}>${t}</text>`).join('');
    }},
    quality: {dur: 5.6, hl: [8, 46], end: 60, lit: '东西本身的好坏', mean: '质量', draw: s => {
      const apple = (x, c, bad) => `<circle cx="${x}" cy="100" r="18" fill="${c}"/><path d="M${x} 82q2-8 8-10" ${sk(WOOD, 2.5)}/><path d="M${x + 2} 80q8-6 12 0q-8 4-12 0z" fill="#5fae6a"/>` + (bad ? `<circle cx="${x - 6}" cy="104" r="6" fill="#7a4a2a" opacity=".55"/><circle cx="${x + 7}" cy="96" r="3" fill="#7a4a2a" opacity=".5"/>` : `<path d="M${x - 9} 94a10 10 0 0 1 6-6" ${sk('#fff', 3, .7)}/>`);
      return GND() + `<rect x="60" y="118" width="180" height="10" rx="2" ${fl(CL.m, .4)}/>` + apple(100, '#b8574a', true) + apple(200, '#e2473a', false) +
        `<g ${s.a(move([[8, -10, 0], [22, 0, 0], [30, 0, 0], [42, 100, 0]]))}><circle cx="100" cy="72" r="16" ${fs(CL.p, CL.k, 3.5, .45)}/><path d="M111 83l12 12" ${sk(CL.k, 5)}/></g>` +
        `<g ${s.a(pop(26), ORG(100, 50))}><path d="M92 42l16 16M108 42l-16 16" ${sk(CL.a, 4)}/></g>` +
        `<g ${s.a(pop(44), ORG(200, 50))}><circle cx="200" cy="48" r="14" ${sk('#d23c2f', 3)}/><text x="200" y="53" font-size="12" font-weight="700" text-anchor="middle" fill="#d23c2f">A+</text></g>` +
        `<g ${s.a(pop(50), ORG(230, 84))}>${sparkle(232, 84, 6)}</g>`;
    }},
    project: {dur: 5.8, hl: [16, 6], end: 62, lit: '往前抛出的计划', mean: '项目', draw: s => {
      const arc = {0: 'opacity:0;' + T(0, 0, 'rotate(-10deg)'), 10: 'opacity:0;' + T(0, 0, 'rotate(-10deg)'), 12: 'opacity:1;' + T(0, 0, 'rotate(-10deg)'), 22: 'opacity:1;' + T(50, -34, 'rotate(-4deg)'), 32: 'opacity:1;' + T(110, -40, 'rotate(6deg)'), 42: 'opacity:1;' + T(160, -6, 'rotate(16deg)'), 44: 'opacity:0;' + T(162, 0, 'rotate(16deg)'), 100: 'opacity:0'};
      return GND() + kid(48, 128, CL.t, {armR: s.a({0: R(40), 6: R(40), 12: R(-80), 26: R(-80), 34: R(0), 100: R(0)}, shoulder(48, 128, 1))}) +
        `<g ${s.a(arc)}><path d="M64 86l26 6-26 6 6-6z" ${fl(CL.p)} style="stroke:var(--ink3);stroke-width:1.5px"/></g>` +
        `<path d="M70 80Q140 30 228 82" ${sk(CL.m, 1.5)} stroke-dasharray="3 5" ${s.a(fadeP(12, 30))}/>` +
        `<g ${s.a({0: 'opacity:0;transform:scale(.2)', 42: 'opacity:0;transform:scale(.2)', 46: 'opacity:1;transform:scale(1.1)', 50: 'opacity:1;transform:scale(1)', 92: 'opacity:1;transform:scale(1)', 100: 'opacity:0;transform:scale(1)'}, ORG(232, 90))}>` +
        `<rect x="196" y="56" width="74" height="68" rx="4" ${fs(CL.p, CL.t, 2.5)}/><text x="233" y="72" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.t)}>项目计划</text>` +
        [0, 1, 2].map(i => `<rect x="204" y="${80 + i * 13}" width="8" height="8" rx="1.5" ${sk(CL.m, 1.5)}/><path d="M216 ${84 + i * 13}h44" ${sk(CL.m, 2)}/><path d="M205 ${84 + i * 13}l2.5 2.5 4-5" ${sk(CL.a, 2)} ${s.a(showAt(52 + i * 4))}/>`).join('') + `</g>`;
    }},
    require: {dur: 5.8, hl: [18, 6], end: 62, lit: '一再索要', mean: '要求', draw: s => {
      const ask = {0: R(0), 100: R(0)}; [6, 18, 30].forEach(p => { ask[p] = R(0); ask[p + 3] = R(-55); ask[p + 8] = R(-55); ask[p + 10] = R(0); });
      return GND() + kid(90, 128, CL.t, {armR: s.a(ask, shoulder(90, 128, 1))}) +
        [6, 18, 30].map((p, i) => `<g ${s.a({0: 'opacity:0;transform:scale(.3)', [p]: 'opacity:0;transform:scale(.3)', [p + 3]: 'opacity:1;transform:scale(1.1)', [p + 5]: 'opacity:1;transform:scale(1)', [i < 2 ? p + 10 : 92]: 'opacity:1;transform:scale(1)', [i < 2 ? p + 12 : 96]: 'opacity:0', 100: 'opacity:0'}, ORG(120, 40))}>${bubble(120 + i * 12, 40 - i * 4)}<text x="${120 + i * 12}" y="${44 - i * 4}" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.a)}>${['我要!', '还要!', '再要!'][i]}</text></g>`).join('') +
        kid(220, 128, '#3d4a5c', {k: 1.1, aL: [-16, -34]}) +
        `<g ${s.a(pop(44), ORG(190, 82))}><rect x="176" y="62" width="30" height="38" rx="2" ${fs(CL.p, CL.m, 1.5)}/><text x="191" y="74" font-size="7" font-weight="700" text-anchor="middle" ${fl(CL.k)}>要求</text>${[0, 1, 2].map(i => `<path d="M181 ${80 + i * 6}h20" ${sk(CL.m, 1.5)}/>`).join('')}</g>`;
    }},
    expert: {dur: 5.8, hl: [46, 6], end: 62, lit: '试过无数次的人', mean: '专家', draw: s => {
      const hits = [[248, 48], [264, 84], [236, 92], [250, 70]];
      const dart = (i) => { const p = 6 + i * 9, [hx, hy] = hits[i];
        return `<g ${s.a({0: 'opacity:0;' + T(), [p]: 'opacity:0;' + T(), [p + 1]: 'opacity:1;' + T(), [p + 5]: 'opacity:1;' + T(hx - 80, hy - 80), 92: 'opacity:1;' + T(hx - 80, hy - 80), 100: 'opacity:0;' + T(hx - 80, hy - 80)})}><path d="M68 80h12M64 77l4 3-4 3" ${sk(CL.k, 2.5)}/></g>` +
          (i < 3 ? `<g ${s.a(pop(p + 5), ORG(hx, hy - 12))}><path d="M${hx - 5} ${hy - 18}l10 10M${hx + 5} ${hy - 18}l-10 10" ${sk(CL.a, 2.5)}/></g>` : ''); };
      return GND() + `<path d="M250 128V100" ${sk(WOOD, 4)}/><circle cx="250" cy="70" r="30" ${fl(CL.p)} style="stroke:var(--ink3);stroke-width:2px"/><circle cx="250" cy="70" r="20" ${fl(CL.a, .25)}/><circle cx="250" cy="70" r="10" ${fl(CL.a, .6)}/><circle cx="250" cy="70" r="4" ${fl(CL.a)}/>` +
        kid(60, 128, CL.t, {aR: [16, -48], armR: s.a(swing(6, 40, 8, -30, 10), shoulder(60, 128, 1))}) + [0, 1, 2, 3].map(dart).join('') +
        `<g ${s.a(pop(46), ORG(60, 58))}><circle cx="60" cy="50" r="10" ${fl(CL.g)}/><path d="M54 58l-4 12 10-4 10 4-4-12" ${fl(CL.a)}/><text x="60" y="54" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">★</text></g>` +
        `<g ${s.a(pop(42), ORG(250, 70))}><circle cx="250" cy="70" r="34" ${sk(CL.g, 3)}/></g>`;
    }},
    support: {dur: 5.6, hl: [8, 30], end: 58, lit: '在下面托着运', mean: '支持', draw: s => {
      const up = side => s.a({0: R(0), 6: R(0), 14: R(side * -150), 92: R(side * -150), 100: R(0)}, shoulder(110, 128, side));
      return GND() + `<g ${s.a({0: T(), 30: T(), 54: T(90, 0), 92: T(90, 0), 100: T()})}>` +
        `<g ${s.a({0: T(0, 20), 6: T(0, 20), 14: T(0, 0), 92: T(0, 0), 100: T(0, 20)})}><rect x="78" y="66" width="64" height="8" rx="2" fill="${WOOD}"/>${kid(110, 66, CL.a, {k: .8})}</g>` +
        kid(110, 128, CL.t, {aL: [-9, -10], aR: [9, -10], armL: up(-1), armR: up(1), ...walkLegs(s, 110, 128, 30, 54, 6)}) + `</g>` +
        `<path d="M70 122l-8 6M150 122l8 6" ${sk(CL.m, 2)} ${s.a(showAt(8, 30))}/>` +
        `<path d="M100 140h100" ${sk(CL.t, 2.5)} ${DASH} ${s.a(drawP(30, 54))}/><path d="M194 134l6 6-6 6" ${sk(CL.t, 2.5)} ${s.a(showAt(53))}/>`;
    }},
    achieve: {dur: 6, hl: [6, 46], end: 62, lit: '走到头、登上顶', mean: '实现', draw: s => {
      const path = [[6, 0, 0], [16, 40, -14], [26, 70, -34], [36, 104, -52], [46, 134, -74]];
      return `<path d="M0 128L150 40l40 8 110 80z" fill="#9aa59a" opacity=".55"/><path d="M150 40l-14 10 8 4 6-6 8 6 6-8z" fill="#fff" opacity=".9"/>` + GND() +
        `<path d="M40 128L72 116L104 98L140 78L166 56" ${sk(CL.m, 2)} stroke-dasharray="3 5"/>` +
        `<g ${s.a(move(path))}>${kid(32, 128, CL.t, {k: .7, ...walkLegs(s, 32, 128, 6, 46, 10, .7)})}</g>` +
        `<path d="M172 54V20" ${sk(CL.k, 2.5)} ${s.a(growY(46, 50), 'transform-origin:50% 100%;transform-box:fill-box')}/><g ${s.a(pop(50), ORG(172, 26))}><path d="M172 20h22l-5 6 5 6h-22z" ${fl(CL.a)}/><text x="182" y="29.5" font-size="7" font-weight="700" text-anchor="middle" fill="#fff">目标</text></g>` +
        `<g ${s.a(pop(54), ORG(210, 30))}>${sparkle(212, 30, 7)}${sparkle(140, 24, 5)}</g>`;
    }},
    // ---------- 第八批 ----------
    promote: {dur: 5.6, hl: [8, 8], end: 60, lit: '推着向前、往上动', mean: '促进；晋升', draw: s => {
      const steps = [[40, 128], [100, 104], [160, 80], [220, 56]];
      const climb = {0: 'opacity:0;' + T(), 3: 'opacity:1;' + T()};
      steps.forEach(([x, y], i) => { if (i) { const p = 8 + (i - 1) * 14; climb[p] = 'opacity:1;' + T(steps[i - 1][0] - 40, steps[i - 1][1] - 128); climb[p + 5] = 'opacity:1;' + T(x - 40 - 30, y - 128 - 18); climb[p + 9] = 'opacity:1;' + T(x - 40, y - 128); } });
      climb[92] = 'opacity:1;' + T(180, -72); climb[100] = 'opacity:0;' + T(180, -72);
      return steps.map(([x, y], i) => `<rect x="${x - 30}" y="${y}" width="${300 - x + 30}" height="${150 - y}" ${fl([CL.m, CL.t, CL.v, CL.a][i], i ? .35 : .15)}/>`).join('') +
        `<g ${s.a(climb)}>${kid(40, 128, CL.g, {k: .7})}<path d="M22 100l-10-4M22 108H8" ${sk(CL.m, 2.5)}/></g>` +
        [1, 2, 3].map(i => `<text x="${steps[i][0] + 8}" y="${steps[i][1] + 18}" font-size="10" font-weight="700" fill="#fff" ${s.a(showAt(14 + (i - 1) * 14))}>Lv${i + 1}</text>`).join('') +
        `<g ${s.a(pop(50), ORG(226, 22))}><path d="M216 30l-4-14 9 6 5-10 5 10 9-6-4 14z" ${fl(CL.g)}/></g>` +
        `<path d="M30 70L120 34" ${sk(CL.t, 3)} ${DASH} ${s.a(drawP(8, 48))}/><path d="M110 32l10 2-6 8" ${sk(CL.t, 3)} ${s.a(showAt(47))}/>`;
    }},
    towards: {dur: 5.4, hl: [30, 8], end: 58, lit: '朝着某个方向', mean: '朝向', draw: s => {
      return GND() + `<circle cx="60" cy="52" r="22" ${fs(CL.p, CL.m, 2.5)}/><text x="60" y="38" font-size="8" font-weight="700" text-anchor="middle" ${fl(CL.a)}>N</text>` +
        `<g ${s.a({0: R(-120), 8: R(-120), 16: R(40), 22: R(-10), 28: R(95), 32: R(85), 36: R(90), 92: R(90), 100: R(-120)}, ORG(60, 52))}><path d="M60 36l5 16h-10z" ${fl(CL.a)}/><path d="M60 68l5-16h-10z" ${fl(CL.m)}/></g><circle cx="60" cy="52" r="3" ${fl(CL.k)}/>` +
        `<path d="M262 128V70" ${sk(CL.k, 2.5)}/><path d="M262 70h24l-6 8 6 8h-24z" ${fl(CL.a)}/>` +
        `<g ${s.a(move([[30, 0, 0], [56, 130, 0]]))}>${kid(110, 128, CL.t, walkLegs(s, 110, 128, 30, 56, 6))}</g>` +
        `<path d="M96 104H246" ${sk(CL.a, 2)} stroke-dasharray="4 5" ${s.a(fadeP(30, 36))}/>`;
    }},
    difference: {dur: 5.8, hl: [8, 8, 50], end: 60, lit: '分开后不一样的地方', mean: '差异', draw: s => {
      const pic = (x, alt) => `<rect x="${x}" y="22" width="118" height="96" rx="4" ${fs(CL.p, CL.m, 2)}/><path d="M${x + 4} 104h110" ${sk(CL.m, 1.5)}/>` +
        `<path d="M${x + 22} 104V76l18-16 18 16v28z" ${fl(CL.g, .5)}/><path d="M${x + 18} 78l22-20 22 20" ${sk(CL.a, 3)}/><rect x="${x + 34}" y="88" width="10" height="16" ${fl(CL.k, .5)}/>` +
        `<rect x="${x + 26}" y="78" width="7" height="7" ${fl(CL.p)} style="stroke:var(--ink3);stroke-width:1px"/>` + (alt ? '' : `<rect x="${x + 47}" y="78" width="7" height="7" ${fl(CL.p)} style="stroke:var(--ink3);stroke-width:1px"/>`) +
        `<circle cx="${x + 94}" cy="42" r="10" ${fl(alt ? CL.a : CL.g)}/>` + (alt ? '' : `<path d="M${x + 92} 104V84" ${sk(WOOD, 3)}/><circle cx="${x + 92}" cy="78" r="9" fill="#5fae6a"/>`);
      const ring = (x, y, p) => `<circle cx="${x}" cy="${y}" r="13" ${sk(CL.v, 3)} ${s.a(pop(p), ORG(x, y))}/>`;
      return pic(22, false) + pic(160, true) + ring(254, 42, 20) + ring(210, 81, 32) + ring(252, 90, 44) + ring(116, 42, 20) + ring(72, 81, 32) + ring(114, 90, 44) +
        `<text x="150" y="76" font-size="20" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(pop(6), ORG(150, 70))}>≠</text>` +
        `<g ${s.a(pop(50), ORG(150, 136))}><rect x="118" y="126" width="64" height="20" rx="5" ${fl(CL.v)}/><text x="150" y="140" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">3 处不同</text></g>`;
    }},
    energy: {dur: 5.6, hl: [8, 38], end: 60, lit: '内在做功的本事', mean: '能量', draw: s => {
      return GND() + `<rect x="40" y="46" width="70" height="40" rx="6" ${fs(CL.p, CL.k, 3)}/><rect x="110" y="58" width="8" height="16" rx="2" ${fl(CL.k)}/>` +
        [0, 1, 2, 3].map(i => `<rect x="${46 + i * 16}" y="52" width="12" height="28" rx="2" ${fl(CL.t)} ${s.a(showAt(8 + i * 7))}/>`).join('') +
        `<path d="M75 54l-8 14h8l-4 12 12-16h-8l4-10z" fill="#fff" ${s.a(showAt(34))}/>` +
        `<path d="M118 66H170" ${sk(CL.g, 3)} ${DASH} ${s.a(drawP(36, 42))}/><path d="M156 52l-8 14h8l-4 12" ${sk(CL.g, 3)} ${s.a(showAt(40))}/>` +
        `<path d="M196 128V84" ${sk(CL.m, 4)}/><circle cx="196" cy="70" r="6" ${fl(CL.k)}/>` +
        `<g ${s.a({0: R(0), 40: R(0), 100: R(1440)}, ORG(196, 70))}>${[0, 90, 180, 270].map(a => `<path d="M196 70q-6-18 0-28q6 10 0 28z" transform="rotate(${a} 196 70)" ${fl(CL.v, .85)}/>`).join('')}</g>` +
        `<g ${s.a(showAt(44))}>${[0, 1, 2].map(i => `<path d="M${226 + i * 8} 52q6 18 0 36" ${sk(CL.m, 2)} ${s.a({0: 'opacity:0;' + T(), 20: 'opacity:1;' + T(), 100: 'opacity:0;' + T(20)}, `animation-delay:${i * .25}s`, .8)}/>`).join('')}</g>`;
    }},
    habit: {dur: 6, hl: [6, 50], end: 62, lit: '一直保有的做法', mean: '习惯', draw: s => {
      const days = ['一', '二', '三', '四', '五', '六', '日'];
      return GND() + kid(60, 128, CL.t, {aR: [12, -46], armR: s.a(swing(4, 52, 24, -16, 8), shoulder(60, 128, 1)), holdR: `<path d="M72 82l6-8" ${sk(CL.a, 3)}/><path d="M78 74l3-3" ${sk('#fff', 3)}/>`}) +
        `<circle cx="66" cy="78" r="2" fill="#fff" ${s.a({0: 'opacity:0', 50: 'opacity:1', 100: 'opacity:0'}, '', .6)}/>` +
        `<rect x="110" y="40" width="176" height="56" rx="6" ${fs(CL.p, CL.m, 2)}/>` +
        days.map((d, i) => `<text x="${124 + i * 25}" y="58" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.m)}>${d}</text><rect x="${115 + i * 25}" y="64" width="18" height="18" rx="3" ${sk(CL.m, 1.5)}/><path d="M${119 + i * 25} 73l4 4 7-8" ${sk(CL.t, 2.5)} ${s.a(pop(6 + i * 6.5), ORG(124 + i * 25, 73))}/>`).join('') +
        `<g ${s.a(pop(50), ORG(198, 22))}><rect x="168" y="12" width="60" height="20" rx="5" ${fl(CL.t)}/><text x="198" y="26" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">天天如此</text></g>`;
    }},
    income: {dur: 5.6, hl: [20, 6], end: 60, lit: '进来的钱', mean: '收入', draw: s => {
      const coin = (p, sx) => `<g ${s.a({0: 'opacity:0;' + T(), [p]: 'opacity:0;' + T(), [p + 1]: 'opacity:1;' + T(), [p + 6]: 'opacity:1;' + T(f1((150 - sx) / 2), -30), [p + 11]: 'opacity:1;' + T(150 - sx, 10), [p + 12]: 'opacity:0;' + T(150 - sx, 10), 100: 'opacity:0'})}><circle cx="${sx}" cy="60" r="7" ${fl(CL.g)}/><text x="${sx}" y="64" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">¥</text></g>`;
      return GND() + `<ellipse cx="150" cy="100" rx="34" ry="26" fill="#f2a3b3"/><circle cx="182" cy="96" r="9" fill="#f2a3b3"/><circle cx="185" cy="95" r="2" fill="${INK}"/><path d="M136 76l-6-8 12 4z" fill="#f2a3b3"/><circle cx="160" cy="92" r="2" fill="${INK}"/>` +
        `<path d="M130 124v6M170 124v6" ${sk('#f2a3b3', 6)}/><rect x="140" y="74" width="20" height="4" rx="2" fill="#c76b80"/>` +
        [[6, 270], [14, 250], [22, 280], [30, 240], [38, 266]].map(([p, x]) => coin(p, x)).join('') +
        `<rect x="40" y="30" width="70" height="26" rx="6" ${fl(CL.k, .8)}/>` + ['¥0', '¥20', '¥40', '¥60', '¥80', '¥100'].map((t, i) => `<text x="75" y="48" font-size="13" font-weight="700" text-anchor="middle" fill="#7cf0b0" ${s.a(slot([0, 17, 25, 33, 41, 49, 94], i))}>${t}</text>`).join('') +
        `<g ${s.a(pop(54), ORG(150, 50))}>${sparkle(150, 52, 7)}</g>`;
    }},
    understanding: {dur: 5.6, hl: [30, 52], end: 60, lit: '心意对上了', mean: '理解', draw: s => {
      return GND() + kid(60, 128, CL.t) + kid(240, 128, CL.a) +
        `<g ${s.a(pop(6), ORG(92, 40))}>${bubble(92, 40)}<path d="M86 36l6-6 6 6-6 6z" ${fl(CL.t)}/></g>` +
        `<g ${s.a(pop(18), ORG(208, 40))}>${bubble(208, 40)}<path d="M202 36l6-6 6 6-6 6z" ${fl(CL.t)}/><text x="222" y="38" font-size="10" font-weight="700" ${fl(CL.a)}>!</text></g>` +
        `<g ${s.a({0: 'opacity:0;' + T(-30), 26: 'opacity:0;' + T(-30), 28: 'opacity:1;' + T(-30), 40: 'opacity:1;' + T(), 92: 'opacity:1;' + T(), 100: 'opacity:0;' + T()})}><path d="M120 76h22v8a5 5 0 1 0 0 10v8h-22z" ${fl(CL.t)}/></g>` +
        `<g ${s.a({0: 'opacity:0;' + T(30), 26: 'opacity:0;' + T(30), 28: 'opacity:1;' + T(30), 40: 'opacity:1;' + T(), 92: 'opacity:1;' + T(), 100: 'opacity:0;' + T()})}><path d="M142 76h22v26h-22v-8a5 5 0 1 0 0-10z" ${fl(CL.a)}/></g>` +
        `<g ${s.a(showAt(40, 48))}>${burst(142, 89, 22).replace('<path ', `<path ${sk(CL.g, 2.5)} `)}</g>` +
        `<g ${s.a(pop(50), ORG(142, 56))}>${heartAt(142, 54, 1)}</g>`;
    }},
    activity: {dur: 5.4, hl: [6, 50], end: 58, lit: '动起来的事', mean: '活动', draw: s => {
      const jump = {0: T(), 100: T()}; for (let i = 0; i < 6; i++) { jump[6 + i * 8] = T(); jump[10 + i * 8] = T(0, -16); } jump[54] = T();
      return GND() + `<g ${s.a(jump, FOOT)}>${kid(60, 128, CL.t, {aL: [-17, -46], aR: [17, -46]})}</g>` +
        `<path d="M44 124q16 18 32 0" ${sk(CL.g, 2)} ${s.a({0: 'transform:scaleY(1)', 50: 'transform:scaleY(-1)', 100: 'transform:scaleY(1)'}, 'transform-origin:50% 0%;transform-box:fill-box', .5)}/>` +
        kid(150, 128, CL.a, {legR: s.a({0: R(0), 20: R(-40), 30: R(10), 100: R(0)}, hip(150, 128, 1), 1.4)}) +
        `<g ${s.a({0: T(), 22: T(), 32: T(40, -30), 44: T(70, 0), 50: T(70, 0), 100: T()}, '', 1.4)}><circle cx="164" cy="122" r="6" ${fl(CL.k)}/><path d="M160 120l8 4M164 116v12" ${sk('#fff', 1.2)}/></g>` +
        `<g ${s.a(move([[6, -30, 0], [30, 30, 0], [54, -30, 0]]))}>${kid(250, 128, CL.v, {aR: [12, -50], ...walkLegs(s, 250, 128, 6, 54, 12)})}<path d="M262 78V60l14 5-14 5" ${fl(CL.g)} ${sk(CL.g, 1)}/></g>`;
    }},
    affect: {dur: 5.6, hl: [6, 14], end: 60, lit: '对别人做了点什么', mean: '影响', draw: s => {
      const xs = [70, 94, 118, 142, 166, 190, 214];
      return GND() + kid(36, 128, CL.t, {aR: [16, -30], armR: s.a({0: R(0), 6: R(0), 10: R(-30), 14: R(0), 100: R(0)}, shoulder(36, 128, 1))}) +
        xs.map((x, i) => `<rect x="${x - 4}" y="96" width="8" height="32" rx="1.5" ${fl([CL.a, CL.v, CL.t, CL.g][i % 4])} ${s.a({0: R(0), [12 + i * 5]: R(0), [16 + i * 5]: R(64), 92: R(64), 100: R(0)}, ORG(x + 4, 128))}/>`).join('') +
        `<path d="M246 128V70" ${sk(WOOD, 3)}/><g ${s.a({0: R(0), 50: R(0), 52: R(-20), 54: R(18), 56: R(-14), 58: R(10), 60: R(0), 100: R(0)}, ORG(246, 70))}><path d="M234 92a12 12 0 0 1 24 0v4h-24z" ${fl(CL.g)}/><circle cx="246" cy="100" r="3" ${fl(CL.g)}/></g><path d="M224 104l14 0" ${sk(CL.m, 3)}/>` +
        `<g ${s.a(showAt(50))}><path d="M266 80l8-6M268 92h10M266 104l8 6" ${sk(CL.g, 2.5)}/></g>`;
    }},
    century: {dur: 5.8, hl: [20, 50], end: 60, lit: '一百年', mean: '世纪', draw: s => {
      const yrs = ['1901', '1925', '1950', '1975', '2000'];
      return GND() + `<rect x="30" y="30" width="80" height="34" rx="6" ${fl(CL.k, .8)}/>` + yrs.map((y, i) => `<text x="70" y="53" font-size="18" font-weight="700" text-anchor="middle" fill="#7cf0b0" ${s.a(slot([0, 16, 26, 36, 46, 94], i))}>${y}</text>`).join('') +
        `<g ${s.a({0: 'transform:scale(.25)', 6: 'transform:scale(.25)', 50: 'transform:scale(1)', 92: 'transform:scale(1)', 100: 'transform:scale(.25)'}, 'transform-origin:50% 100%;transform-box:fill-box')}><path d="M210 128q-4-40 2-60M210 96l-18-14M212 84l16-12" ${sk(WOOD, 9)}/><circle cx="190" cy="66" r="24" fill="#4f9a5c"/><circle cx="230" cy="62" r="26" fill="#3f8f4f"/><circle cx="212" cy="40" r="26" fill="#5fae6a"/></g>` +
        `<g ${s.a(pop(50), ORG(70, 92))}><circle cx="70" cy="92" r="18" ${fl(CL.a)}/><text x="70" y="97" font-size="13" font-weight="700" text-anchor="middle" fill="#fff">100</text></g>`;
    }},
    condition: {dur: 5.8, hl: [30, 6, 50], end: 60, lit: '双方一起说定的', mean: '条件', draw: s => {
      return GND() + `<g ${s.a(move([[28, -24, 0], [40, 0, 0]]))}>${kid(110, 128, CL.t, {aR: [18, -30]})}</g><g ${s.a(move([[28, 24, 0], [40, 0, 0]]))}>${kid(190, 128, CL.a, {aL: [-18, -30]})}</g>` +
        `<g ${s.a({...pop(6), 26: 'opacity:1;transform:scale(1)', 28: 'opacity:0;transform:scale(1)', 92: 'opacity:0', 100: 'opacity:0'}, ORG(80, 40))}>${bubble(80, 40)}<text x="80" y="44" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.t)}>如果…</text></g>` +
        `<g ${s.a({...pop(14), 26: 'opacity:1;transform:scale(1)', 28: 'opacity:0;transform:scale(1)', 92: 'opacity:0', 100: 'opacity:0'}, ORG(220, 40))}>${bubble(220, 40)}<text x="220" y="44" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.a)}>就…</text></g>` +
        `<g ${s.a(pop(30), ORG(150, 40))}><rect x="120" y="14" width="60" height="50" rx="3" ${fs(CL.p, CL.m, 1.5)}/><text x="150" y="27" font-size="8" font-weight="700" text-anchor="middle" ${fl(CL.k)}>条件</text>${[0, 1, 2].map(i => `<path d="M128 ${35 + i * 8}h44" ${sk(CL.m, 1.4)}/>`).join('')}</g>` +
        `<g ${s.a(pop(44), ORG(150, 98))}><circle cx="150" cy="98" r="7" fill="${SKIN}"/>${sparkle(150, 82, 6)}</g>`;
    }},
    negative: {dur: 5.4, hl: [20, 50], end: 58, lit: '否定的', mean: '消极的；否定的', draw: s => {
      return GND() + kid(80, 128, CL.t, {noFace: true}) + `<g ${s.a(hideAt(24))}>${face(80, 128)}</g><g ${s.a(showAt(24))}>${face(80, 128, 1, 'sad')}</g>` +
        `<g ${s.a({...pop(4), 22: 'opacity:1;transform:scale(1)', 26: 'opacity:.35;transform:scale(1)', 92: 'opacity:.35', 100: 'opacity:0'}, ORG(112, 40))}>${bubble(112, 40)}<path d="M106 38l4 4 8-8" ${sk(CL.t, 2.5)}/></g>` +
        `<g ${s.a(pop(20), ORG(112, 42))}><circle cx="112" cy="40" r="20" ${sk('#d23c2f', 4)}/><path d="M98 54L126 26" ${sk('#d23c2f', 4)}/></g>` +
        `<g ${s.a(showAt(28))}><path d="M60 52a8 8 0 0 1 14-6 10 10 0 0 1 18 4 7 7 0 0 1-2 13H62a6 6 0 0 1-2-11z" ${fl(CL.m, .6)}/><path d="M66 68l-2 5M76 68l-2 5M86 68l-2 5" ${sk('#6db7e8', 2)}/></g>` +
        `<path d="M170 40L210 76l24-14 40 48" ${sk(CL.a, 3.5)} ${DASH} ${s.a(drawP(30, 50))}/><path d="M266 102l8 8 2-11" ${sk(CL.a, 3.5)} ${s.a(showAt(49))}/>` +
        `<g ${s.a(pop(50), ORG(220, 30))}><circle cx="220" cy="30" r="13" ${fl(CL.a)}/><path d="M213 30h14" ${sk('#fff', 3.5)}/></g>`;
    }},
    // ---------- 第九批 ----------
    success: {dur: 5.8, hl: [6, 6], end: 60, lit: '一路走下去，走到了', mean: '成功', draw: s => {
      const run = {0: 'opacity:0;' + T(), 3: 'opacity:1;' + T(), 6: 'opacity:1;' + T(), 18: 'opacity:1;' + T(70, 0), 22: 'opacity:1;' + T(90, -26), 26: 'opacity:1;' + T(110, 0), 38: 'opacity:1;' + T(170, 0), 42: 'opacity:1;' + T(190, -26), 46: 'opacity:1;' + T(210, 0), 52: 'opacity:1;' + T(226, 0), 92: 'opacity:1;' + T(226, 0), 100: 'opacity:0;' + T(226, 0)};
      return GND() + [100, 200].map(x => `<path d="M${x} 128v-18M${x + 10} 128v-18M${x - 2} 112h14" ${sk(CL.a, 3)}/>`).join('') + `<path d="M256 128V70M286 128V70" ${sk(CL.m, 3)}/>` +
        `<path d="M256 84h30" ${sk(CL.g, 2.5)} ${s.a({0: 'opacity:1', 50: 'opacity:1', 51: 'opacity:0', 94: 'opacity:0', 100: 'opacity:1'})}/><path d="M256 84l-8 12M286 84l8 12" ${sk(CL.g, 2.5)} ${s.a(showAt(50))}/>` +
        `<g ${s.a(run)}>${kid(30, 128, CL.t, walkLegs(s, 30, 128, 6, 52, 14))}</g>` +
        `<g ${s.a(pop(52), ORG(150, 40))}><path d="M138 26h24v10a12 12 0 0 1-24 0z" ${fl(CL.g)}/><path d="M138 30h-6a6 6 0 0 0 6 8M162 30h6a6 6 0 0 1-6 8M150 48v8M142 58h16" ${sk(CL.g, 3)}/></g>` +
        [[110, 20, CL.a], [190, 24, CL.v], [126, 60, CL.t], [178, 58, CL.g]].map(([x, y, c], i) => `<rect x="${x}" y="${y}" width="6" height="3" ${fl(c)} ${s.a({0: 'opacity:0;' + T(0, -16, 'rotate(0deg)'), [51 + i]: 'opacity:0;' + T(0, -16, 'rotate(0deg)'), [52 + i]: 'opacity:1;' + T(0, -16, 'rotate(0deg)'), [64 + i]: 'opacity:1;' + T(i % 2 ? 6 : -6, 10, 'rotate(160deg)'), 92: 'opacity:1;' + T(i % 2 ? 6 : -6, 10, 'rotate(160deg)'), 100: 'opacity:0;' + T(i % 2 ? 6 : -6, 10, 'rotate(160deg)')})}/>`).join('');
    }},
    advice: {dur: 5.6, hl: [30, 6], end: 60, lit: '把我的看法给你', mean: '建议', draw: s => {
      return GND() + kid(70, 128, CL.v, {k: 1.1, noFace: true, aR: [18, -34]}) + `<path d="M58 60a12 12 0 0 1 24 0q-6-4-12-3t-12 3z" fill="#d8d8d8"/>` + face(70, 128, 1.1) + `<path d="M62 68h16" ${sk(INK, 1.2)}/>` +
        kid(220, 128, CL.t, {k: .85, noFace: true}) + `<g ${s.a(hideAt(46))}>${face(220, 128, .85, 'sad')}<text x="236" y="66" font-size="14" font-weight="700" ${fl(CL.v)}>?</text></g><g ${s.a(showAt(46))}>${face(220, 128, .85)}</g>` +
        `<g ${s.a(pop(6), ORG(100, 40))}><path d="M86 40q14-12 28 0q-14 12-28 0z" ${fs(CL.p, CL.k, 2)}/><circle cx="100" cy="40" r="4" ${fl(CL.k)}/></g>` +
        `<g ${s.a({0: 'opacity:0;' + T(0, 0, 'scale(.5)'), 27: 'opacity:0;' + T(0, 0, 'scale(.5)'), 29: 'opacity:1;' + T(0, 0, 'scale(.5)'), 44: 'opacity:1;' + T(96, 8, 'scale(1)'), 92: 'opacity:1;' + T(96, 8, 'scale(1)'), 100: 'opacity:0;' + T(96, 8, 'scale(1)')}, ORG(110, 64))}>${bubble(110, 64)}<path d="M104 62a6 6 0 1 1 12 0c0 3-2 3.5-2 6h-8c0-2.5-2-3-2-6z" ${fl(CL.g)}/></g>` +
        `<g ${s.a(pop(48), ORG(220, 50))}><path d="M212 52a8 8 0 1 1 16 0c0 4-3 5-3 9h-10c0-4-3-5-3-9z" ${fl(CL.g)}/><path d="M220 36v-4M208 42l-3-3M232 42l3-3" ${sk(CL.g, 2)}/></g>`;
    }},
    already: {dur: 5.4, hl: [6, 40], end: 58, lit: '全都准备好了', mean: '已经', draw: s => {
      const items = [[60, `<rect x="44" y="96" width="32" height="26" rx="4" ${fl(CL.a)}/><path d="M54 96v-6h12v6" ${sk(CL.k, 2.5)}/>`], [130, `<rect x="114" y="102" width="32" height="18" rx="2" ${fl(CL.g)}/><path d="M130 102v18" ${sk(CL.p, 2)} stroke-dasharray="2 2"/>`], [200, `<path d="M186 120v-8q0-6 6-6h6l8 8h6v6z" ${fl(CL.v)}/>`]];
      return GND() + items.map(([x, art], i) => art + `<g ${s.a(pop(8 + i * 10), ORG(x, 82))}><circle cx="${x}" cy="82" r="9" ${fl(CL.t)}/><path d="M${x - 4} 82l3 3 6-6" ${sk('#fff', 2.5)}/></g>`).join('') +
        kid(254, 128, CL.t, {aL: [-14, -42]}) + `<path d="M238 82l2-8 4 6" ${sk(SKIN, 4)} ${s.a(showAt(40))}/>` +
        `<g ${s.a(pop(40), ORG(150, 40))}><rect x="104" y="24" width="92" height="30" rx="8" ${fl(CL.t)} transform="rotate(-6 150 40)"/><text x="150" y="46" font-size="16" font-weight="700" text-anchor="middle" fill="#fff" transform="rotate(-6 150 40)">Ready!</text></g>`;
    }},
    concern: {dur: 5.6, hl: [30, 6], end: 58, lit: '心里反复掂量', mean: '担忧；关心', draw: s => {
      const shake = {0: T(), 100: T()}; for (let i = 0; i < 12; i++) shake[6 + i * 4] = T(i % 2 ? 8 : -8, 0); shake[54] = T();
      return GND() + kid(110, 128, CL.t, {noFace: true, aL: [-16, -30], aR: [16, -30]}) + face(110, 128, 1, 'sad') + `<path d="M102 70l4 2M118 70l-4 2" ${sk(INK, 1.4)}/>` +
        `<g ${s.a(shake)}><ellipse cx="110" cy="100" rx="24" ry="6" ${fs(CL.p, CL.m, 2.5)}/><path d="M90 100q20 10 40 0" ${sk(CL.m, 1.5)} stroke-dasharray="2 2"/></g>` +
        [0, .3, .6, .9].map(dl => `<circle cx="${102 + dl * 18}" cy="106" r="1.6" ${fl(WOOD)} ${s.a({0: 'opacity:0;' + T(), 10: 'opacity:1;' + T(), 90: 'opacity:1;' + T(0, 20), 100: 'opacity:0;' + T(0, 20)}, `animation-delay:${dl}s`, .9)}/>`).join('') +
        `<path d="M170 54a12 12 0 0 1 10-18 18 18 0 0 1 32-4 16 16 0 0 1 28 6 12 12 0 0 1 2 24h-64a10 10 0 0 1-8-8z" ${fs(CL.p, CL.m, 2)}/>` +
        `<g ${s.a(showAt(24))}><g ${s.a({0: R(0), 100: R(360)}, ORG(206, 50) + ';animation-timing-function:linear', 2)}><text x="190" y="54" font-size="14" font-weight="700" ${fl(CL.a)}>?</text><text x="214" y="48" font-size="14" font-weight="700" ${fl(CL.v)}>!</text><text x="200" y="64" font-size="11" font-weight="700" ${fl(CL.m)}>?</text></g></g>` +
        `<circle cx="140" cy="76" r="2.5" ${fl(CL.m, .5)}/><circle cx="152" cy="68" r="4" ${fl(CL.m, .5)}/>`;
    }},
    expect: {dur: 5.8, hl: [6, 6], end: 60, lit: '伸长脖子往外看', mean: '期待', draw: s => {
      return GND() + `<rect x="30" y="50" width="70" height="78" ${fl(CL.g, .35)}/><rect x="70" y="70" width="24" height="58" ${fl(CL.k, .5)}/>` +
        kid(82, 128, CL.t, {noHead: true, aR: [10, -48]}) +
        `<g ${s.a({0: T(), 6: T(), 20: T(14, -22), 92: T(14, -22), 100: T()})}><path d="M82 87v-6" ${sk(SKIN, 6)}/><circle cx="82" cy="76" r="11" fill="${SKIN}"/><path d="M71 75a11 11 0 0 1 22 0q-5-5-11-3.5t-11 3.5z" fill="${HAIR}"/><circle cx="86" cy="76" r="1.7" fill="${INK}"/><circle cx="92" cy="76" r="1.7" fill="${INK}"/><path d="M86 81h6" ${sk(INK, 1.4)}/></g>` +
        `<path d="M82 87q6-12 14-20" ${sk(SKIN, 6)} ${s.a(showAt(18))}/>` +
        `<path d="M110 54H230" ${sk(CL.t, 2)} stroke-dasharray="4 5" ${s.a(fadeP(22, 30))}/>` +
        `<g ${s.a({0: 'opacity:0;' + T(40, 0, 'scale(.4)'), 36: 'opacity:0;' + T(40, 0, 'scale(.4)'), 40: 'opacity:1;' + T(30, 0, 'scale(.45)'), 58: 'opacity:1;' + T(0, 0, 'scale(.75)'), 92: 'opacity:1;' + T(0, 0, 'scale(.75)'), 100: 'opacity:0;' + T(0, 0, 'scale(.75)')}, FOOT)}>${kid(250, 128, CL.a, {aR: [12, -50]})}<rect x="234" y="96" width="14" height="12" rx="2" fill="${WOOD}"/></g>` +
        `<g ${s.a(pop(58), ORG(160, 30))}>${heartAt(160, 30, .9)}</g>`;
    }},
    teacher: {dur: 5.6, hl: [6, 46], end: 58, lit: '教书的人', mean: '老师', draw: s => {
      const point = {0: R(0), 100: R(0)}; for (let i = 0; i < 6; i++) point[6 + i * 5] = R(i % 2 ? -8 : 4); point[36] = R(0);
      return GND() + `<rect x="120" y="22" width="160" height="66" rx="3" ${fs('#2f4f43', WOOD, 4)}/>` +
        `<text x="200" y="64" font-size="22" font-weight="700" text-anchor="middle" fill="#f4f1e6" ${s.a(showAt(6))}>2 + 3 =</text><text x="262" y="64" font-size="22" font-weight="700" text-anchor="middle" fill="#ffd76a" ${s.a(pop(30), ORG(262, 56))}>5</text>` +
        kid(96, 128, CL.v, {k: 1.15, aR: [22, -48], armR: s.a(point, shoulder(96, 128, 1, 1.15)), holdR: `<path d="M121 73l18-14" ${sk(WOOD, 2.5)}/>`}) + `<path d="M84 70h24" ${sk(INK, 1.2)}/><circle cx="91" cy="68" r="3" ${sk(INK, 1.2)}/><circle cx="101" cy="68" r="3" ${sk(INK, 1.2)}/>` +
        kid(30, 128, CL.t, {k: .7, armR: s.a({0: R(0), 34: R(0), 40: R(-150), 92: R(-150), 100: R(0)}, shoulder(30, 128, 1, .7))}) +
        `<g ${s.a(pop(36), ORG(30, 58))}>${sparkle(42, 66, 5)}</g>` +
        `<g ${s.a(pop(46), ORG(96, 100))}><rect x="88" y="94" width="16" height="11" rx="2" ${fl(CL.g)}/><text x="96" y="102.5" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">er</text></g>`;
    }},
    feeling: {dur: 6, hl: [6, 50], end: 60, lit: '心里感觉到的', mean: '感觉；情感', draw: s => {
      const em = (i, mouth, extra = '') => `<g ${s.a(slot([0, 6 + i * 11, 17 + i * 11], 1))}><g transform="translate(${190} 50)"><circle r="22" fill="#f6d34a"/><circle cx="-7" cy="-5" r="2.5" fill="${INK}"/><circle cx="7" cy="-5" r="2.5" fill="${INK}"/><path d="${mouth}" ${sk(INK, 2.2)}/>${extra}</g></g>`;
      return GND() + kid(90, 128, CL.a) +
        `<g ${s.a({0: 'transform:scale(1)', 15: 'transform:scale(1.25)', 30: 'transform:scale(.95)', 45: 'transform:scale(1.1)', 60: 'transform:scale(1)', 100: 'transform:scale(1)'}, ORG(90, 100), 1)}>${heartAt(90, 98, .55, CL.p)}</g>` +
        `<circle cx="120" cy="70" r="3" ${fl(CL.m, .5)}/><circle cx="134" cy="62" r="4.5" ${fl(CL.m, .5)}/><circle cx="152" cy="56" r="6" ${fl(CL.m, .5)}/>` +
        em(0, 'M-9 6q9 9 18 0') + em(1, 'M-4 8a4 4 0 1 0 8 0a4 4 0 1 0-8 0', '<path d="M-10-14l6 3M10-14l-6 3" stroke="#2b2b2b" stroke-width="1.5"/>') + em(2, 'M-8 11q8-8 16 0', '<path d="M-8-1q-2 5 0 7" stroke="#6db7e8" stroke-width="2.5" fill="none"/>') +
        `<g ${s.a(showAt(39))}><g transform="translate(190 50)"><circle r="22" fill="#f6d34a"/><path d="M-11-8a4 4 0 0 1 8 0q-4 5-4 5t-4-5zM3-8a4 4 0 0 1 8 0q-4 5-4 5t-4-5z" fill="#e2473a"/><path d="M-9 6q9 9 18 0" ${sk(INK, 2.2)}/></g></g>`;
    }},
    reduce: {dur: 5.6, hl: [10, 10], end: 58, lit: '往回引、变少', mean: '减少', draw: s => {
      const H = {0: 'transform:scaleY(1)', 10: 'transform:scaleY(1)', 18: 'transform:scaleY(.72)', 24: 'transform:scaleY(.72)', 32: 'transform:scaleY(.48)', 38: 'transform:scaleY(.48)', 46: 'transform:scaleY(.25)', 92: 'transform:scaleY(.25)', 100: 'transform:scaleY(1)'};
      return GND() + `<path d="M40 128V40h10v88" ${fl(CL.m, .5)}/>` +
        `<g ${s.a({0: 'opacity:1', 46: 'opacity:.2', 92: 'opacity:.2', 100: 'opacity:1'})}>${[0, 1, 2].map(i => `<circle cx="${45 + i * 8}" cy="${30 - i * 10}" r="${8 + i * 3}" ${fl(CL.m, .55)} ${s.a({0: T(), 100: T(10, -10)}, `animation-delay:${i * .4}s`, 1.2)}/>`).join('')}</g>` +
        `<rect x="150" y="28" width="40" height="100" rx="3" ${fl(CL.a)} ${s.a(H, 'transform-origin:50% 100%;transform-box:fill-box')}/>` +
        `<path d="M212 40v70M202 98l10 12 10-12" ${sk(CL.t, 4)} ${DASH} ${s.a(drawP(10, 46))}/>` +
        `<path d="M120 40q-20 20 0 40" ${sk(CL.v, 2.5)} ${DASH} ${s.a(drawP(10, 24))}/><path d="M114 74l6 6 2-8" ${sk(CL.v, 2.5)} ${s.a(showAt(23))}/>` +
        `<text x="170" y="22" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.t)} ${s.a(showAt(48))}>−75%</text>`;
    }},
    situation: {dur: 5.6, hl: [10, 50], end: 60, lit: '所处的位置', mean: '处境；情况', draw: s => {
      const shark = dl => { const f = {}; for (let i = 0; i <= 20; i++) { const a = Math.PI * 2 * i / 20; f[i * 5] = T(f1(150 + 74 * Math.cos(a)), f1(122 + 16 * Math.sin(a)), Math.sin(a) < 0 ? 'scale(.8)' : 'scale(1)'); } return `<g ${s.a(f, `animation-timing-function:linear;animation-delay:${dl}s`, 4)}><path d="M-6 0l10-18 6 18z" fill="#6b7480"/><path d="M-12 1h28" stroke="#fff" stroke-width="1.5" opacity=".6"/></g>`; };
      return `<rect x="0" y="80" width="300" height="70" fill="#6db7e8" opacity=".45"/><ellipse cx="150" cy="104" rx="44" ry="12" fill="#e6c98a"/><path d="M150 100V60" ${sk(WOOD, 4)}/><path d="M150 60q-18-6-26 6M150 60q18-6 26 6M150 60q-6-14-18-14M150 60q6-14 18-14" ${sk('#3f8f4f', 4)}/>` +
        shark(0) + shark(2) + kid(132, 104, CL.t, {k: .7, noFace: true, aL: [-14, -40]}) + face(132, 104, .7, 'sad') +
        `<g ${s.a({0: 'opacity:0;' + T(0, -40), 10: 'opacity:0;' + T(0, -40), 12: 'opacity:1;' + T(0, -40), 22: 'opacity:1;' + T(), 92: 'opacity:1;' + T(), 100: 'opacity:0;' + T()})}><path d="M132 50s-9-9-9-16a9 9 0 0 1 18 0c0 7-9 16-9 16z" ${fl(CL.a)}/><circle cx="132" cy="34" r="3.5" fill="#fff"/></g>` +
        `<g ${s.a(pop(24), ORG(80, 30))}><rect x="46" y="20" width="68" height="20" rx="5" ${fl(CL.a)}/><text x="80" y="34" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">你在这里</text></g>`;
    }},
    almost: {dur: 5.6, hl: [30, 10], end: 58, lit: '差不多全部', mean: '几乎', draw: s => {
      const jump = {0: T(), 100: T()}; [10, 24, 38].forEach(p => { jump[p] = T(); jump[p + 4] = T(0, -26); jump[p + 8] = T(); });
      return GND() + `<path d="M220 128V64" ${sk(WOOD, 7)}/><circle cx="206" cy="48" r="26" fill="#3f8f4f"/><circle cx="238" cy="54" r="22" fill="#4f9a5c"/>` +
        `<circle cx="176" cy="66" r="7" fill="#e2473a"/><path d="M176 59v-4" ${sk(WOOD, 2)}/>` +
        `<g ${s.a(jump, FOOT)}>${kid(162, 128, CL.t, {aR: [12, -54]})}</g>` +
        `<g ${s.a(pop(44), ORG(130, 36))}><rect x="92" y="24" width="72" height="22" rx="6" ${fl(CL.v)}/><text x="128" y="39" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">差一点!</text></g>` +
        `<rect x="20" y="138" width="200" height="8" rx="4" ${sk(CL.m, 1.5)}/><rect x="21" y="139" width="198" height="6" rx="3" ${fl(CL.t)} ${s.a({0: 'transform:scaleX(0)', 10: 'transform:scaleX(0)', 48: 'transform:scaleX(.97)', 92: 'transform:scaleX(.97)', 100: 'transform:scaleX(0)'}, 'transform-origin:0% 50%;transform-box:fill-box')}/>` +
        `<text x="246" y="146" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.t)} ${s.a(showAt(48))}>97%</text>`;
    }},
    computer: {dur: 5.4, hl: [6, 50], end: 58, lit: '用来计算的东西', mean: '计算机', draw: s => {
      return GND() + `<rect x="150" y="30" width="110" height="70" rx="6" ${fl(CL.k, .85)}/><rect x="156" y="36" width="98" height="56" rx="3" fill="#1e3a2f"/><path d="M196 100h18l4 12h-26z" ${fl(CL.m)}/><rect x="168" y="112" width="74" height="10" rx="3" ${fl(CL.m, .7)}/>` +
        `<text x="205" y="58" font-size="12" font-weight="700" text-anchor="middle" fill="#7cf0b0" font-family="monospace" ${s.a(showAt(6))}>12×34=</text>` +
        ['371', '583', '129', '408'].map((t, i) => `<text x="205" y="80" font-size="15" font-weight="700" text-anchor="middle" fill="${i === 3 ? '#ffd76a' : '#7cf0b0'}" font-family="monospace" ${s.a(slot([0, 14, 22, 30, 38, 94].map((v, j) => j === 0 ? 14 : v), i + 1))}>${t}</text>`).join('') +
        kid(110, 128, CL.t, {aR: [26, -12], armR: s.a(swing(6, 38, 14, -6, 4), shoulder(110, 128, 1))}) +
        `<g ${s.a(pop(40), ORG(262, 34))}>${sparkle(264, 30, 6)}</g>`;
    }},
    access: {dur: 5.8, hl: [24, 34], end: 60, lit: '走向它的路', mean: '通道；使用权', draw: s => {
      return GND() + `<path d="M230 128V44h56v84" ${fl(CL.v, .25)}/><rect x="244" y="88" width="28" height="40" ${fl(CL.k, .4)}/>` +
        `<rect x="150" y="70" width="10" height="58" ${fl(CL.m, .6)}/><rect x="152" y="80" width="6" height="8" rx="1" fill="#d23c2f"/><rect x="152" y="80" width="6" height="8" rx="1" fill="#3fbf6a" ${s.a(showAt(20))}/>` +
        `<g ${s.a({0: R(0), 20: R(0), 26: R(-80), 92: R(-80), 100: R(0)}, ORG(160, 92))}><rect x="160" y="88" width="64" height="8" rx="3" fill="#e2473a"/><path d="M174 88v8M190 88v8M206 88v8" ${sk('#fff', 3)}/></g>` +
        `<g ${s.a(move([[4, -40, 0], [16, 0, 0], [22, 0, 0], [28, 0, 0], [52, 130, 0]]))}>${kid(110, 128, CL.t, {aR: [22, -40], ...walkLegs(s, 110, 128, 28, 52, 6)})}<rect x="130" y="80" width="10" height="13" rx="1.5" ${fl(CL.g)}/></g>` +
        `<g ${s.a(pop(22), ORG(155, 50))}><rect x="118" y="40" width="74" height="20" rx="5" fill="#3fbf6a"/><text x="155" y="54" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">允许进入</text></g>`;
    }},
    // ---------- 第十批 ----------
    adult: {dur: 5.6, hl: [6, 6], end: 58, lit: '朝着长大，已经长成', mean: '成年人', draw: s => {
      const stage = (k, c, p0, p1, extra = '') => `<g ${s.a(p0 ? slot([0, p0, p1], 1) : slot([0, p1], 0))}>${kid(150, 128, c, {k})}${extra}</g>`;
      return GND() + stage(.5, CL.a, 0, 18) + stage(.8, CL.v, 18, 36) +
        `<g ${s.a(slot([0, 36, 94], 1))}>${kid(150, 128, '#3d4a5c', {k: 1.2, aR: [14, -26]})}<path d="M150 80l-3 4 3 12 3-12z" fill="#c0392b"/><rect x="160" y="96" width="20" height="14" rx="2" fill="${WOOD}"/><path d="M166 96v-3h8v3" ${sk(WOOD, 2)}/></g>` +
        `<path d="M200 128V20" ${sk(CL.m, 2)} stroke-dasharray="3 4"/><path d="M196 96h8M196 78h8M196 52h8" ${sk(CL.m, 2)}/>` +
        `<path d="M110 120Q100 60 140 40" ${sk(CL.t, 2.5)} ${DASH} ${s.a(drawP(6, 36))}/><path d="M132 38l8 2-4 7" ${sk(CL.t, 2.5)} ${s.a(showAt(35))}/>` +
        `<g ${s.a(pop(40), ORG(240, 40))}><circle cx="240" cy="40" r="16" ${fl(CL.a)}/><text x="240" y="45" font-size="13" font-weight="700" text-anchor="middle" fill="#fff">18+</text></g>`;
    }},
    emotion: {dur: 5.6, hl: [30, 14, 50], end: 60, lit: '心被触动、涌出来', mean: '情感；情绪', draw: s => {
      const jolt = {0: 'transform:scale(1)', 14: 'transform:scale(1)', 18: 'transform:scale(1.35)', 22: 'transform:scale(.9)', 26: 'transform:scale(1.25)', 30: 'transform:scale(1)', 100: 'transform:scale(1)'};
      return GND() + `<rect x="16" y="30" width="80" height="54" rx="4" ${fl(CL.k, .8)}/><path d="M50 128V84M36 128h28" ${sk(CL.m, 3)}/>` +
        `<g ${s.a(showAt(4))}>${heartAt(40, 54, .9, '#f2a3b3')}<circle cx="68" cy="60" r="8" fill="${SKIN}"/><circle cx="66" cy="59" r="1" fill="${INK}"/><circle cx="71" cy="59" r="1" fill="${INK}"/></g>` +
        kid(170, 128, CL.t, {noFace: true}) + `<g ${s.a(hideAt(30))}>${face(170, 128)}</g><g ${s.a(showAt(30))}>${face(170, 128, 1, 'sad')}<path d="M164 78q-2 5 0 7M176 78q2 5 0 7" ${sk('#6db7e8', 2)}/></g>` +
        `<g ${s.a(jolt, ORG(170, 100))}>${heartAt(170, 98, .55, CL.p)}</g>` +
        [0, 1, 2].map(i => `<g ${s.a({0: 'opacity:0;' + T(), [30 + i * 6]: 'opacity:0;' + T(), [32 + i * 6]: 'opacity:1;' + T(0, 0, 'scale(.5)'), [46 + i * 6]: 'opacity:1;' + T((i - 1) * 30, -60, 'scale(1)'), [52 + i * 6]: 'opacity:0;' + T((i - 1) * 36, -70, 'scale(1)'), 100: 'opacity:0'})}>${heartAt(170, 96, .7, [CL.a, CL.v, '#f2a3b3'][i])}</g>`).join('') +
        [0, 1].map(i => `<path d="M${150 + i * 40} 96q${i ? 8 : -8} -6 0-12" ${sk(CL.a, 2)} ${s.a(showAt(16, 32))}/>`).join('');
    }},
    event: {dur: 5.4, hl: [20, 20], end: 58, lit: '突然冒出来的事', mean: '事件', draw: s => {
      return GND() + `<rect x="118" y="96" width="64" height="32" rx="3" ${fl(CL.a, .9)}/><path d="M118 104h64" ${sk(CL.g, 3)}/>` +
        `<g ${s.a({0: R(0), 18: R(0), 22: R(-110), 92: R(-110), 100: R(0)}, ORG(118, 96))}><rect x="116" y="90" width="68" height="8" rx="2" ${fl(CL.a)}/></g>` +
        `<g ${s.a({0: 'opacity:0;transform:scaleY(.1)', 18: 'opacity:0;transform:scaleY(.1)', 20: 'opacity:1;transform:scaleY(.1)', 26: 'opacity:1;transform:scaleY(1.15)', 30: 'opacity:1;transform:scaleY(.92)', 34: 'opacity:1;transform:scaleY(1)', 92: 'opacity:1;transform:scaleY(1)', 100: 'opacity:0;transform:scaleY(1)'}, 'transform-origin:50% 100%;transform-box:fill-box')}>` +
        `<path d="M150 96l-8-6 16-6-16-6 16-6-8-6" ${sk(CL.m, 2.5)}/><circle cx="150" cy="48" r="14" ${fl(CL.g)}/><circle cx="145" cy="45" r="2" fill="${INK}"/><circle cx="155" cy="45" r="2" fill="${INK}"/><path d="M144 53q6 5 12 0" ${sk(INK, 2)}/><path d="M138 36l6 4M162 36l-6 4" ${sk(CL.a, 3)}/></g>` +
        `<g ${s.a(showAt(24, 40))}>${burst(150, 48, 30).replace('<path ', `<path ${sk(CL.a, 2.5)} `)}</g>` +
        `<text x="214" y="56" font-size="30" font-weight="700" ${fl(CL.a)} ${s.a(pop(26), ORG(220, 46))}>!</text>` +
        `<g ${s.a(pop(40), ORG(56, 60))}><rect x="30" y="40" width="52" height="46" rx="4" ${fs(CL.p, CL.m, 2)}/><rect x="30" y="40" width="52" height="12" rx="4" ${fl(CL.a)}/><circle cx="56" cy="70" r="9" ${sk(CL.a, 2.5)}/></g>`;
    }},
    prevent: {dur: 5.6, hl: [6, 22], end: 58, lit: '在它来之前先挡住', mean: '阻止；预防', draw: s => {
      return GND() + `<path d="M232 128v-30q-12-4-12-16 0-10 10-14h12q10 4 10 14 0 12-12 16v30" ${fl(CL.v, .8)}/>` +
        `<g ${s.a({0: 'opacity:0;' + T(-40), 4: 'opacity:1;' + T(-40), 16: 'opacity:1;' + T(), 92: 'opacity:1;' + T(), 100: 'opacity:0;' + T()})}>${kid(176, 128, CL.t, {aL: [-16, -30]})}<rect x="154" y="72" width="8" height="56" rx="2" fill="${WOOD}"/></g>` +
        `<g ${s.a({0: 'opacity:0;' + T(), 20: 'opacity:0;' + T(), 22: 'opacity:1;' + T(), 34: 'opacity:1;' + T(110, 0, 'rotate(360deg)'), 40: 'opacity:1;' + T(70, 0, 'rotate(200deg)'), 48: 'opacity:1;' + T(56, 0, 'rotate(160deg)'), 92: 'opacity:1;' + T(56, 0, 'rotate(160deg)'), 100: 'opacity:0;' + T(56, 0, 'rotate(160deg)')})}><circle cx="34" cy="118" r="10" ${fl(CL.a)}/><path d="M24 118h20M34 108v20" ${sk('#fff', 1.5)}/></g>` +
        `<g ${s.a(showAt(34, 42))}>${burst(152, 110, 14).replace('<path ', `<path ${sk(CL.g, 2.5)} `)}</g>` +
        `<g ${s.a(pop(46), ORG(232, 50))}><circle cx="232" cy="48" r="10" ${fl(CL.t)}/><path d="M227 48l3.5 3.5 6-7" ${sk('#fff', 2.5)}/></g>`;
    }},
    publish: {dur: 5.8, hl: [30, 6], end: 60, lit: '让公众看到', mean: '出版；发表', draw: s => {
      const press = {0: T(), 100: T()}; [6, 12, 18].forEach(p => { press[p] = T(); press[p + 2] = T(0, 14); press[p + 4] = T(); });
      const book = (tx, p) => `<g ${s.a({0: 'opacity:0;' + T(), [p]: 'opacity:0;' + T(), [p + 1]: 'opacity:1;' + T(), [p + 10]: 'opacity:1;' + T(tx, -6), 92: 'opacity:1;' + T(tx, -6), 100: 'opacity:0;' + T(tx, -6)})}><rect x="80" y="96" width="14" height="18" rx="1.5" ${fl(CL.a)}/><path d="M83 100h8M83 104h8" ${sk('#fff', 1.2)}/></g>`;
      return GND() + `<rect x="30" y="54" width="70" height="74" rx="4" ${fl(CL.m, .55)}/><rect x="40" y="110" width="50" height="6" ${fl(CL.k, .6)}/>` +
        `<g ${s.a(press)}><path d="M65 30v24" ${sk(CL.k, 5)}/><rect x="42" y="54" width="46" height="12" rx="2" ${fl(CL.k, .85)}/></g>` +
        `<text x="65" y="92" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">印刷</text>` +
        book(96, 24) + book(146, 30) + book(196, 36) +
        [0, 1, 2].map(i => kid(186 + i * 50 - 6, 128, [CL.t, CL.v, CL.g][i], {k: .6, aL: [-12, -34]})).join('') +
        `<g ${s.a(pop(48), ORG(150, 34))}><rect x="112" y="22" width="76" height="22" rx="6" ${fl(CL.t)}/><text x="150" y="37" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">大家都能看</text></g>`;
    }},
    communication: {dur: 5.6, hl: [6, 50], end: 60, lit: '你来我往地交流', mean: '交流；通讯', draw: s => {
      const msg = (p, dir, c) => `<g ${s.a({0: 'opacity:0;' + T(), [p]: 'opacity:0;' + T(), [p + 1]: 'opacity:1;' + T(), [p + 10]: 'opacity:1;' + T(dir * 120, 0), [p + 12]: 'opacity:0;' + T(dir * 120, 0), 100: 'opacity:0'})}><rect x="${dir > 0 ? 84 : 186}" y="56" width="30" height="18" rx="8" ${fl(c)}/><circle cx="${dir > 0 ? 92 : 194}" cy="65" r="1.8" fill="#fff"/><circle cx="${dir > 0 ? 99 : 201}" cy="65" r="1.8" fill="#fff"/><circle cx="${dir > 0 ? 106 : 208}" cy="65" r="1.8" fill="#fff"/></g>`;
      return GND() + kid(50, 128, CL.t, {aR: [14, -40]}) + kid(250, 128, CL.a, {aL: [-14, -40]}) +
        `<rect x="60" y="80" width="10" height="16" rx="2" ${fl(CL.k)}/><rect x="230" y="80" width="10" height="16" rx="2" ${fl(CL.k)}/>` +
        msg(6, 1, CL.t) + msg(18, -1, CL.a) + msg(30, 1, CL.t) + msg(42, -1, CL.a) +
        `<path d="M150 20v20M142 26q8-8 16 0M136 20q14-14 28 0" ${sk(CL.v, 2.5)} ${s.a(showAt(6))}/>` +
        `<g ${s.a(pop(54), ORG(150, 100))}>${heartAt(150, 98, 1)}</g>`;
    }},
    conflict: {dur: 5, hl: [6, 18], end: 56, lit: '互相击打', mean: '冲突', draw: s => {
      const hit = side => { const f = {0: R(0), 100: R(0)}; [8, 20, 32].forEach(p => { f[p] = R(side * 40); f[p + 5] = R(side * -70); f[p + 9] = R(side * 40); }); return s.a(f, shoulder(side < 0 ? 200 : 100, 128, side)); };
      const pillow = (x, y) => `<rect x="${x - 10}" y="${y - 7}" width="20" height="14" rx="5" fill="#f4f1e6" style="stroke:var(--ink3);stroke-width:1.5px"/>`;
      return GND() + kid(100, 128, CL.t, {noFace: true, aR: [18, -40], armR: hit(1), holdR: pillow(126, 80)}) + face(100, 128, 1, 'sad') + `<path d="M93 72l5 2M107 72l-5 2" ${sk(INK, 1.5)}/>` +
        kid(200, 128, CL.a, {noFace: true, aL: [-18, -40], armL: hit(-1), holdL: pillow(174, 80)}) + face(200, 128, 1, 'sad') + `<path d="M193 72l5 2M207 72l-5 2" ${sk(INK, 1.5)}/>` +
        [13, 25, 37].map(p => `<g ${s.a(showAt(p, p + 6))}>${burst(150, 62, 18).replace('<path ', `<path ${sk(CL.g, 3)} `)}</g>`).join('') +
        [[140, 0], [158, .3], [150, .6], [134, .9]].map(([x, dl]) => `<path d="M${x} 60q4-4 8 0q-4 4-8 0z" fill="#fff" style="stroke:var(--ink3);stroke-width:1px" ${s.a({0: 'opacity:0;' + T(), 10: 'opacity:1;' + T(), 100: 'opacity:0;' + T(dl * 20 - 8, 50, 'rotate(180deg)')}, `animation-delay:${dl}s`, 1.6)}/>`).join('');
    }},
    cultural: {dur: 5.8, hl: [6, 50], end: 60, lit: '和文化有关的', mean: '文化的', draw: s => {
      const frame = (x, inner, p) => `<g ${s.a(pop(p), ORG(x, 70))}><rect x="${x - 26}" y="40" width="52" height="62" rx="3" fill="${WOOD}"/><rect x="${x - 22}" y="44" width="44" height="54" rx="2" ${fl(CL.p)}/>${inner}</g>`;
      return GND() + `<path d="M10 104h280" ${sk(WOOD, 3)}/>` +
        frame(48, `<text x="48" y="80" font-size="26" font-weight="700" text-anchor="middle" fill="${INK}">文</text>`, 8) +
        frame(116, `<ellipse cx="116" cy="72" rx="13" ry="16" fill="#d23c2f"/><path d="M108 56h16M108 88h16M116 88v6" ${sk('#f2b632', 2)}/>`, 18) +
        frame(184, `<ellipse cx="184" cy="72" rx="14" ry="18" fill="#fff" style="stroke:var(--ink);stroke-width:1.5px"/><path d="M174 64q5-5 8 0M186 64q5-5 8 0" ${sk('#d23c2f', 3)}/><path d="M178 80q6 6 12 0" ${sk(INK, 2)}/><path d="M184 54v10" ${sk('#d23c2f', 3)}/>`, 28) +
        frame(252, `<path d="M240 82h24l-3 10h-18z" ${fl(CL.t)}/><path d="M264 84a5 5 0 0 1 0 6" ${sk(CL.t, 2)}/><path d="M248 76q-3-6 0-12M256 76q-3-6 0-12" ${sk(CL.m, 1.5)}/>`, 38) +
        kid(150, 128, CL.a, {k: .55}) + `<g ${s.a(pop(50), ORG(150, 24))}><rect x="110" y="14" width="80" height="20" rx="6" ${fl(CL.a)}/><text x="150" y="28" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">文化展</text></g>`;
    }},
    decade: {dur: 5.8, hl: [6, 50], end: 60, lit: '十个一组的年', mean: '十年', draw: s => {
      return GND() + `<rect x="60" y="92" width="180" height="36" rx="6" fill="#f2c9a0"/><path d="M60 104q15 8 30 0t30 0 30 0 30 0 30 0 30 0" fill="#fff" opacity=".8"/>` +
        Array.from({length: 10}, (_, i) => { const x = 72 + i * 17.5;
          return `<rect x="${x - 2.5}" y="72" width="5" height="20" rx="1.5" ${fl([CL.a, CL.v, CL.t, CL.g][i % 4])}/><g ${s.a(pop(6 + i * 4), ORG(x, 66))}><path d="M${x} 60q-4 4 0 9q4-5 0-9z" fill="#f6a623"/></g>`; }).join('') +
        `<g ${s.a(pop(50), ORG(150, 34))}><rect x="112" y="20" width="76" height="26" rx="8" ${fl(CL.a)}/><text x="150" y="38" font-size="14" font-weight="700" text-anchor="middle" fill="#fff">10 年</text></g>`;
    }},
    economy: {dur: 5.8, hl: [6, 14], end: 60, lit: '管家理财', mean: '经济', draw: s => {
      const coin = (tx, p) => `<g ${s.a({0: 'opacity:0;' + T(), [p]: 'opacity:0;' + T(), [p + 1]: 'opacity:1;' + T(), [p + 5]: 'opacity:1;' + T(f1(tx / 2), -24), [p + 10]: 'opacity:1;' + T(tx, 0), [p + 11]: 'opacity:0;' + T(tx, 0), 100: 'opacity:0'})}><circle cx="110" cy="80" r="5" ${fl(CL.g)}/></g>`;
      const jar = (x, label, c) => `<path d="M${x - 16} 92h32v32a4 4 0 0 1-4 4h-24a4 4 0 0 1-4-4z" ${fs('#e8f3f8', CL.m, 1.5)}/><text x="${x}" y="88" font-size="9" font-weight="700" text-anchor="middle" ${fl(c)}>${label}</text>`;
      return GND() + `<path d="M20 70l36-30 36 30z" ${fl(CL.a, .85)}/><rect x="28" y="70" width="56" height="58" ${fl(CL.g, .4)}/><rect x="48" y="96" width="16" height="32" ${fl(CL.k, .4)}/>` +
        kid(110, 128, CL.t, {aR: [14, -46]}) + `<rect x="94" y="100" width="12" height="16" rx="1.5" ${fs(CL.p, CL.m, 1.2)}/>` +
        jar(170, '吃饭', CL.a) + jar(214, '上学', CL.v) + jar(258, '存起来', CL.t) +
        coin(60, 14) + coin(104, 22) + coin(148, 30) + coin(60, 38) + coin(148, 46) +
        [0, 1, 2].map(i => `<rect x="${170 + i * 44 - 12}" y="${124 - (i === 2 ? 14 : 7)}" width="24" height="${i === 2 ? 14 : 7}" rx="2" ${fl(CL.g)} ${s.a(growY(24 + i * 10, 34 + i * 10), 'transform-origin:50% 100%;transform-box:fill-box')}/>`).join('');
    }},
    encourage: {dur: 6, hl: [10, 30], end: 60, lit: '使人有勇气', mean: '鼓励', draw: s => {
      const cheer = {0: 'transform:translateY(0)', 100: 'transform:translateY(0)'}; for (let i = 0; i < 6; i++) { cheer[10 + i * 5] = 'transform:translateY(0)'; cheer[12 + i * 5] = 'transform:translateY(-8px)'; }
      return `<rect x="150" y="64" width="150" height="64" ${fl(CL.m, .35)}/><rect x="0" y="100" width="150" height="50" fill="#6db7e8" opacity=".4"/>` +
        `<g ${s.a(cheer)}>${kid(230, 64, CL.v, {k: .8, aL: [-16, -48], aR: [16, -48]})}<circle cx="212" cy="20" r="5" ${fl(CL.g)}/><circle cx="248" cy="20" r="5" ${fl(CL.g)}/></g>` +
        `<g ${s.a(pop(10), ORG(256, 16))}><text x="268" y="20" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.a)}>加油!</text></g>` +
        `<g ${s.a({0: 'opacity:1;' + T(0, 0, 'rotate(0deg)'), 6: 'opacity:1;' + T(-1.5, 0, 'rotate(0deg)'), 8: 'opacity:1;' + T(1.5, 0, 'rotate(0deg)'), 10: 'opacity:1;' + T(-1.5, 0, 'rotate(0deg)'), 12: 'opacity:1;' + T(1.5, 0, 'rotate(0deg)'), 14: 'opacity:1;' + T(-1.5, 0, 'rotate(0deg)'), 16: 'opacity:1;' + T(1.5, 0, 'rotate(0deg)'), 18: 'opacity:1;' + T(0, 0, 'rotate(0deg)'), 42: 'opacity:1;' + T(0, 0, 'rotate(0deg)'), 46: 'opacity:1;' + T(-20, -30, 'rotate(-10deg)'), 52: 'opacity:1;' + T(-60, 30, 'rotate(-30deg)'), 56: 'opacity:0;' + T(-70, 40, 'rotate(-40deg)'), 94: 'opacity:0;' + T(-70, 40, 'rotate(-40deg)'), 100: 'opacity:1;' + T(0, 0, 'rotate(0deg)')})}>${kid(166, 64, CL.t, {k: .8, noFace: true})}` +
        `<g ${s.a(hideAt(34))}>${face(166, 64, .8, 'sad')}</g><g ${s.a(showAt(34))}>${face(166, 64, .8)}</g>` +
        `<g ${s.a({0: 'transform:scale(0)', 28: 'transform:scale(0)', 40: 'transform:scale(1.2)', 92: 'transform:scale(1.2)', 100: 'transform:scale(0)'}, ORG(166, 43))}>${flame('ff').replace('class="ff"', 'fill="#f6a623" transform="translate(153.2 29.4) scale(.4)"')}</g></g>` +
        `<g ${s.a(showAt(54, 62))}>${burst(100, 104, 18).replace('<path ', `<path ${sk('#fff', 2.5)} `)}</g>`;
    }},
    everyone: {dur: 5.8, hl: [6, 6], end: 60, lit: '每一个人', mean: '每个人', draw: s => {
      const xs = [40, 84, 128, 172, 216, 260];
      return GND() + xs.map((x, i) => kid(x, 128, [CL.t, CL.a, CL.v, CL.g, CL.t, CL.a][i], {k: .7}) +
        `<path d="M${x - 16} 0h32l12 128h-56z" ${fl(CL.g, .16)} ${s.a({0: 'opacity:0', [6 + i * 7]: 'opacity:0', [7 + i * 7]: 'opacity:1', [12 + i * 7]: 'opacity:1', [13 + i * 7]: 'opacity:0', 100: 'opacity:0'})}/>` +
        `<g ${s.a(pop(7 + i * 7), ORG(x, 66))}><circle cx="${x}" cy="66" r="7" ${fl(CL.t)}/><path d="M${x - 3} 66l2.5 2.5 4.5-5" ${sk('#fff', 2)}/></g>`).join('') +
        `<ellipse cx="150" cy="104" rx="140" ry="38" ${sk(CL.v, 2.5)} stroke-dasharray="6 6" ${s.a(pop(50), ORG(150, 104))}/>`;
    }},
    // ---------- 第十一批 ----------
    library: {dur: 5.8, hl: [6, 34], end: 60, lit: '放书的地方', mean: '图书馆', draw: s => {
      const cols = [CL.a, CL.v, CL.t, CL.g];
      const book = (x, y, i, p) => `<g ${s.a({0: 'opacity:0;' + T(130 - x, 100 - y, 'rotate(-30deg)'), [p]: 'opacity:0;' + T(130 - x, 100 - y, 'rotate(-30deg)'), [p + 1]: 'opacity:1;' + T(130 - x, 100 - y, 'rotate(-30deg)'), [p + 8]: 'opacity:1;' + T(0, 0, 'rotate(0deg)'), 92: 'opacity:1;' + T(0, 0, 'rotate(0deg)'), 100: 'opacity:0;' + T(0, 0, 'rotate(0deg)')})}><rect x="${x}" y="${y}" width="9" height="20" rx="1" ${fl(cols[i % 4])}/></g>`;
      let books = ''; let n = 0;
      for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) { books += `<rect x="${186 + c * 11}" y="${34 + r * 30}" width="9" height="20" rx="1" ${fl(cols[(r + c) % 4], .55)}/>`; }
      for (let c = 0; c < 4; c++) books += book(186 + (c + 2) * 11, 94, c, 6 + n++ * 6);
      return GND() + `<rect x="180" y="24" width="80" height="104" ${fs('none', WOOD, 4)}/><path d="M180 56h80M180 86h80M180 116h80" ${sk(WOOD, 4)}/>` + books +
        `<path d="M40 128v-24h40v24M40 104v-20" ${sk(WOOD, 4)}/>` + kid(60, 104, CL.t, {k: .8, aL: [-10, -28], aR: [10, -28]}) + `<path d="M52 84l8 3 8-3v10l-8 3-8-3z" ${fs(CL.p, CL.v, 1.5)}/>` +
        `<g ${s.a(pop(34), ORG(220, 12))}><rect x="190" y="2" width="60" height="18" rx="5" ${fl(CL.a)}/><text x="220" y="15" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">图书馆</text></g>`;
    }},
    nature: {dur: 5.8, hl: [20, 50], end: 60, lit: '生来就有的', mean: '自然；本性', draw: s => {
      const peck = {0: R(0), 100: R(0)}; for (let i = 0; i < 6; i++) { peck[32 + i * 4] = R(0); peck[34 + i * 4] = R(28); }
      return GND() + `<path d="M120 128q30-8 60 0z" fill="#e6c98a"/>` +
        `<g ${s.a({0: R(0), 6: R(-6), 8: R(6), 10: R(-6), 12: R(6), 14: R(-4), 16: R(0), 100: R(0)}, 'transform-origin:50% 100%;transform-box:fill-box')}><g ${s.a(hideAt(20))}><ellipse cx="150" cy="110" rx="16" ry="20" fill="#f6efe0" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M138 104l6 4 6-6 6 6 6-4" ${sk(CL.m, 1.5)} ${s.a(showAt(12))}/></g></g>` +
        `<g ${s.a(showAt(20))}><path d="M134 128q0-12 16-12t16 12z" fill="#f6efe0" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M134 116l6 4 6-6" ${sk(CL.m, 1.5)}/>` +
        `<g ${s.a({0: T(0, 10), 20: T(0, 10), 26: T(0, -2), 30: T(0, 0), 100: T(0, 0)})}><g ${s.a(peck, ORG(150, 118))}><circle cx="150" cy="104" r="12" fill="#f6d34a"/><circle cx="158" cy="94" r="7" fill="#f6d34a"/><circle cx="160" cy="92" r="1.4" fill="${INK}"/><path d="M164 94l6 2-6 2z" fill="#e8963c"/></g></g></g>` +
        [176, 190, 204].map((x, i) => `<circle cx="${x}" cy="126" r="1.8" fill="${WOOD}" ${s.a(hideAt(34 + i * 8))}/>`).join('') +
        `<g ${s.a(pop(50), ORG(80, 50))}><rect x="40" y="38" width="80" height="22" rx="6" ${fl(CL.t)}/><text x="80" y="53" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">天生就会</text></g>`;
    }},
    online: {dur: 5.6, hl: [30, 6], end: 58, lit: '挂在网线上', mean: '在线的', draw: s => {
      const dot = dl => `<circle cx="96" cy="86" r="3.5" ${fl(CL.g)} ${s.a({0: 'opacity:0;' + T(), 10: 'opacity:1;' + T(), 50: 'opacity:1;' + T(50, -40), 90: 'opacity:1;' + T(130, -50), 100: 'opacity:0;' + T(130, -50)}, `animation-delay:${dl}s;animation-timing-function:linear`, 1.6)}/>`;
      return GND() + `<rect x="30" y="72" width="64" height="40" rx="4" ${fl(CL.k, .85)}/><rect x="34" y="76" width="56" height="32" rx="2" ${fl('#1e3a2f')}/><path d="M22 116h80" ${sk(CL.m, 4)}/>` +
        `<path d="M96 86Q150 20 226 36" ${sk(CL.v, 3)} ${DASH} ${s.a(drawP(6, 26))}/>` +
        `<g ${s.a(showAt(28))}>${dot(0)}${dot(.5)}${dot(1)}</g>` +
        `<path d="M216 44a12 12 0 0 1 8-20 18 18 0 0 1 32-2 13 13 0 0 1 12 22z" ${fl(CL.t, .3)} style="stroke:var(--teal);stroke-width:2px"/>` +
        `<g ${s.a(showAt(30))}><circle cx="62" cy="92" r="9" fill="${SKIN}"/><path d="M53 92a9 9 0 0 1 18 0q-4-3-9-2.5t-9 2.5z" fill="${HAIR}"/><circle cx="84" cy="80" r="5" fill="#3fbf6a"/></g>` +
        `<g ${s.a(pop(32), ORG(62, 52))}><rect x="34" y="44" width="56" height="18" rx="9" fill="#3fbf6a"/><text x="62" y="57" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">在线</text></g>`;
    }},
    yourself: {dur: 5.4, hl: [6, 30], end: 58, lit: '你本人', mean: '你自己', draw: s => {
      return GND() + kid(110, 128, CL.t, {aR: [26, -50]}) + `<rect x="134" y="62" width="22" height="36" rx="4" ${fl(CL.k, .9)}/>` +
        `<g ${s.a(showAt(28))}><rect x="137" y="66" width="16" height="26" rx="2" fill="#bfe1f2"/><circle cx="145" cy="78" r="5" fill="${SKIN}"/><path d="M140 77a5 5 0 0 1 10 0q-2-1.5-5-1t-5 1z" fill="${HAIR}"/><path d="M141 92q4-8 8 0" fill="var(--teal)"/></g>` +
        `<g ${s.a({0: 'opacity:0', 28: 'opacity:0', 29: 'opacity:1', 32: 'opacity:0', 100: 'opacity:0'})}><rect x="0" y="0" width="300" height="150" fill="#fff"/></g>` +
        `<g ${s.a(pop(4), ORG(230, 70))}><path d="M206 70h34" ${sk(SKIN, 9)}/><path d="M240 70l14 0" ${sk(SKIN, 6)}/><text x="230" y="50" font-size="14" font-weight="700" text-anchor="middle" ${fl(CL.a)}>你!</text></g>` +
        `<g ${s.a(pop(34), ORG(145, 40))}><rect x="118" y="28" width="56" height="20" rx="6" ${fl(CL.v)}/><text x="146" y="42" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">就是你</text></g>`;
    }},
    degree: {dur: 5.8, hl: [6, 6], end: 60, lit: '一级一级的', mean: '程度；度数；学位', draw: s => {
      const lv = {0: 'transform:scaleY(1)', 6: 'transform:scaleY(1)'}; [.8, .6, .4].forEach((v, i) => { lv[14 + i * 10] = `transform:scaleY(${v})`; lv[20 + i * 10] = `transform:scaleY(${v})`; }); lv[92] = 'transform:scaleY(.4)'; lv[100] = 'transform:scaleY(1)';
      return GND() + `<rect x="46" y="20" width="16" height="92" rx="8" ${fs(CL.p, CL.m, 2)}/><circle cx="54" cy="116" r="11" fill="#e2473a"/><rect x="50" y="26" width="8" height="88" rx="4" fill="#e2473a" ${s.a(lv, 'transform-origin:50% 100%;transform-box:fill-box')}/>` +
        [0, 1, 2, 3, 4].map(i => `<path d="M64 ${30 + i * 18}h8" ${sk(CL.m, 1.5)}/><text x="76" y="${33 + i * 18}" font-size="8" ${fl(CL.m)}>${40 - i * 10}°</text>`).join('') +
        [[110, 52], [140, 72], [170, 92], [200, 112]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="${300 - x}" height="${128 - y}" ${fl([CL.t, CL.v, CL.a, CL.g][i], .25)}/>`).join('') +
        `<g ${s.a(move([[6, 0, 0], [16, 30, 20], [26, 60, 40], [36, 90, 60]]))}>${kid(124, 52, CL.t, {k: .6})}</g>` +
        `<g ${s.a(pop(44), ORG(244, 38))}><rect x="220" y="22" width="50" height="34" rx="2" ${fs('#f4e6c8', WOOD, 2)}/><circle cx="256" cy="48" r="5" fill="#d23c2f"/><path d="M228 32h34M228 38h26" ${sk(CL.m, 1.5)}/><path d="M244 10l-14 5 14 5 14-5z" fill="${INK}"/></g>`;
    }},
    digital: {dur: 5.4, hl: [6, 50], end: 58, lit: '用数字表示的', mean: '数字的；数码的', draw: s => {
      const col = (x, dl) => `<text x="${x}" font-size="11" font-weight="700" font-family="monospace" fill="#3fbf6a" ${s.a({0: 'opacity:0;' + T(0, 0), 10: 'opacity:1;' + T(0, 20), 90: 'opacity:1;' + T(0, 110), 100: 'opacity:0;' + T(0, 120)}, `animation-delay:${dl}s;animation-timing-function:linear`, 1.8)}><tspan x="${x}" dy="0">1</tspan><tspan x="${x}" dy="12">0</tspan><tspan x="${x}" dy="12">1</tspan></text>`;
      return `<rect x="0" y="0" width="300" height="150" fill="#0e1a14" ${s.a(showAt(0, 40))}/>` + `<g ${s.a(showAt(0, 40))}>${[20, 50, 80, 110, 190, 220, 250, 280].map((x, i) => col(x, (i * .37) % 1.8)).join('')}</g>` +
        `<rect x="118" y="20" width="64" height="112" rx="8" ${fl(CL.k, .9)}/><rect x="123" y="28" width="54" height="94" rx="3" fill="#1e3a2f"/>` +
        `<g ${s.a(showAt(36))}><rect x="123" y="28" width="54" height="94" rx="3" fill="#bfe1f2"/><circle cx="162" cy="48" r="7" fill="#f6d34a"/><path d="M123 110l18-24 14 16 10-10 12 18z" fill="#5fae6a"/></g>` +
        `<g ${s.a(showAt(18, 38))}><text x="150" y="80" font-size="10" font-weight="700" font-family="monospace" text-anchor="middle" fill="#3fbf6a">0101</text><text x="150" y="94" font-size="10" font-weight="700" font-family="monospace" text-anchor="middle" fill="#3fbf6a">1100</text></g>` +
        `<g ${s.a(pop(50), ORG(240, 40))}><rect x="210" y="30" width="60" height="20" rx="6" ${fl(CL.t)}/><text x="240" y="44" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">数码照片</text></g>`;
    }},
    influence: {dur: 6, hl: [10, 20], end: 60, lit: '慢慢流进去', mean: '影响', draw: s => {
      return `<path d="M110 40h80l-6 88h-68z" fill="#e8f3f8" style="stroke:var(--ink3);stroke-width:2.5px"/>` +
        `<path d="M113 56h74l-5 70h-64z" fill="#7a4fbf" ${s.a({0: 'opacity:0', 20: 'opacity:0', 56: 'opacity:.7', 92: 'opacity:.7', 100: 'opacity:0'})}/>` +
        `<g ${s.a({0: 'opacity:0;' + T(0, -30), 6: 'opacity:1;' + T(0, -30), 18: 'opacity:1;' + T(0, 20), 20: 'opacity:0;' + T(0, 24), 100: 'opacity:0'})}><path d="M150 24q-6 8-6 12a6 6 0 0 0 12 0q0-4-6-12z" fill="#7a4fbf"/></g>` +
        [0, 1, 2].map(i => `<path d="M150 60q${-20 + i * 20} 20 ${-10 + i * 10} 50" ${sk('#7a4fbf', 6 - i, .6)} ${DASH} ${s.a(drawP(20 + i * 4, 44 + i * 4))}/>`).join('') +
        `<ellipse cx="150" cy="58" rx="8" ry="3" ${sk('#7a4fbf', 2)} ${s.a({0: 'opacity:0;transform:scale(.4)', 19: 'opacity:0;transform:scale(.4)', 21: 'opacity:1;transform:scale(1)', 34: 'opacity:0;transform:scale(4)', 100: 'opacity:0'}, ORG(150, 58))}/>` +
        `<path d="M40 128h220" ${sk(CL.m, 2, .5)}/>`;
    }},
    performance: {dur: 6, hl: [10, 20, 52], end: 60, lit: '完整地呈现出来', mean: '表现；演出', draw: s => {
      const dance = {0: R(0), 100: R(0)}; for (let i = 0; i < 8; i++) dance[20 + i * 4] = R(i % 2 ? 12 : -12); dance[52] = R(0);
      return `<rect x="30" y="100" width="240" height="14" fill="${WOOD}"/>` +
        `<path d="M150 0L110 100h80z" ${fl(CL.g, .2)} ${s.a(showAt(16))}/>` +
        `<g ${s.a(dance, ORG(150, 100))}>${kid(150, 100, CL.v, {k: .85, aL: [-16, -44], aR: [16, -44]})}</g>` +
        `<g ${s.a({0: 'transform:scaleX(1)', 8: 'transform:scaleX(1)', 18: 'transform:scaleX(.18)', 92: 'transform:scaleX(.18)', 100: 'transform:scaleX(1)'}, 'transform-origin:0% 50%;transform-box:fill-box')}><rect x="30" y="10" width="120" height="90" fill="#b8323a"/></g>` +
        `<g ${s.a({0: 'transform:scaleX(1)', 8: 'transform:scaleX(1)', 18: 'transform:scaleX(.18)', 92: 'transform:scaleX(.18)', 100: 'transform:scaleX(1)'}, 'transform-origin:100% 50%;transform-box:fill-box')}><rect x="150" y="10" width="120" height="90" fill="#b8323a"/></g>` +
        `<path d="M30 10h240" ${sk('#8c2028', 6)}/>` +
        [70, 110, 190, 230].map((x, i) => `<circle cx="${x}" cy="138" r="8" fill="${INK}" opacity=".7"/>` + `<path d="M${x - 6} 126l3 4M${x + 6} 126l-3 4" ${sk(CL.g, 2)} ${s.a({0: 'opacity:0', 40: 'opacity:0', 44: 'opacity:1', 48: 'opacity:0', 52: 'opacity:1', 56: 'opacity:0', 100: 'opacity:0'})}/>`).join('') +
        `<g ${s.a(pop(52), ORG(250, 30))}><text x="250" y="34" font-size="13" text-anchor="middle" fill="#f6d34a">★★★</text></g>`;
    }},
    thinking: {dur: 5.6, hl: [6, 50], end: 58, lit: '思考的过程', mean: '思考；想法', draw: s => {
      const gear = (cx, cy, r, n, dir) => { const dash = f1(Math.PI * r / n); return `<g ${s.a({0: R(0), 100: R(dir * 360)}, ORG(cx, cy) + ';animation-timing-function:linear', 2)}><circle cx="${cx}" cy="${cy}" r="${r}" ${sk(CL.v, 5)} stroke-dasharray="${dash} ${dash}" stroke-linecap="butt"/><circle cx="${cx}" cy="${cy}" r="${f1(r * .35)}" ${fl(CL.v)}/></g>`; };
      return GND() + `<rect x="64" y="104" width="34" height="24" rx="3" ${fl(CL.m, .5)}/>` + kid(80, 104, CL.t, {k: .85, aR: [6, -42]}) +
        `<circle cx="104" cy="56" r="3" ${fl(CL.m, .5)}/><circle cx="116" cy="46" r="5" ${fl(CL.m, .5)}/>` +
        `<path d="M134 52a14 14 0 0 1 10-22 22 22 0 0 1 40-6 18 18 0 0 1 34 6 14 14 0 0 1 4 28h-80a10 10 0 0 1-8-6z" ${fs(CL.p, CL.m, 2)}/>` +
        `<g ${s.a(showAt(6, 46))}>${gear(166, 38, 10, 7, 1)}${gear(190, 32, 7, 5, -1)}<text x="210" y="50" font-size="14" font-weight="700" ${fl(CL.a)}>?</text></g>` +
        `<g ${s.a(pop(46), ORG(186, 38))}><path d="M178 38a8 8 0 1 1 16 0c0 4-3 5-3 9h-10c0-4-3-5-3-9z" ${fl(CL.g)}/><path d="M186 22v-4M173 28l-3-3M199 28l3-3" ${sk(CL.g, 2)}/></g>`;
    }},
    increasingly: {dur: 6, hl: [6, 50], end: 60, lit: '越来越…地', mean: '越来越多地', draw: s => {
      return `<path d="M0 40L300 128H0z" fill="#e8f3f8"/><path d="M0 40L300 128" ${sk(CL.m, 2)}/>` +
        `<g ${s.a({0: 'opacity:0;' + T(0, 0, 'scale(.3)'), 4: 'opacity:1;' + T(0, 0, 'scale(.3)'), 50: 'opacity:1;' + T(200, 59, 'scale(1.6)'), 92: 'opacity:1;' + T(200, 59, 'scale(1.6)'), 100: 'opacity:0;' + T(200, 59, 'scale(1.6)')}, ORG(40, 40))}>` +
        `<g ${s.a({0: R(0), 100: R(720)}, ORG(40, 40) + ';animation-timing-function:linear', 3)}><circle cx="40" cy="40" r="14" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M32 36l4 4M44 42l3-3M38 48h4" ${sk(CL.m, 1.5)}/></g></g>` +
        [[60, 0], [120, 1], [180, 2], [240, 3]].map(([x, i]) => `<text x="${x}" y="${64 + i * 26}" font-size="${10 + i * 3}" font-weight="700" ${fl(CL.t)} ${s.a(showAt(10 + i * 10))}>+</text>`).join('') +
        `<g ${s.a(pop(50), ORG(80, 110))}><path d="M50 118l20-20 14 10 22-26" ${sk(CL.a, 3)}/><path d="M98 80l8 2-2 8" ${sk(CL.a, 3)}/></g>`;
    }},
    produce: {dur: 5.8, hl: [14, 14], end: 60, lit: '往前引出来', mean: '生产；产生', draw: s => {
      const pull = {0: T(), 14: T(), 22: T(-12, 0), 26: T(-8, 0), 100: T()};
      const carrot = (x, p) => `<g ${s.a({0: 'opacity:1;' + T(), [p]: 'opacity:1;' + T(), [p + 6]: 'opacity:1;' + T(0, -26), [p + 12]: 'opacity:1;' + T(0, -26), [p + 16]: 'opacity:1;' + T(160 - x, -6), [p + 17]: 'opacity:0;' + T(160 - x, -6), 98: 'opacity:0;' + T(160 - x, -6), 99: 'opacity:0;' + T(), 100: 'opacity:1;' + T()})}><path d="M${x - 5} 112h10l-5 22z" fill="#e8963c"/><path d="M${x} 112l-4-10M${x} 112l4-10M${x} 112v-12" ${sk('#3f8f4f', 2.5)}/></g>`;
      return `<rect x="0" y="122" width="300" height="28" fill="${WOOD}" opacity=".55"/>` + GND(220, 292) +
        carrot(130, 12) + carrot(160, 26) + carrot(190, 40) +
        `<g ${s.a(pull)}>${kid(110, 122, CL.t, {aR: [20, -24]})}</g>` +
        `<path d="M260 128h-34l-4-22h42z" fill="${WOOD}"/>` + [0, 1, 2].map(i => `<path d="M${232 + i * 9} 106h10l-5 -14z" fill="#e8963c" ${s.a(showAt(29 + i * 14))}/>`).join('') +
        `<g ${s.a(pop(54), ORG(244, 70))}>${sparkle(244, 72, 7)}</g>`;
    }},
    exist: {dur: 5.6, hl: [6, 20], end: 58, lit: '站出来了', mean: '存在', draw: s => {
      return GND() + `<g ${s.a({0: 'opacity:1', 22: 'opacity:1', 26: 'opacity:0', 94: 'opacity:0', 100: 'opacity:1'})}><circle cx="150" cy="76" r="11" ${sk(CL.m, 2)} stroke-dasharray="3 3"/><path d="M140 128v-40h20v40" ${sk(CL.m, 2)} stroke-dasharray="3 3"/></g>` +
        `<text x="150" y="56" font-size="16" font-weight="700" text-anchor="middle" ${fl(CL.m)} ${s.a(showAt(2, 18))}>?</text>` +
        `<g ${s.a({0: 'opacity:0;' + T(0, 30, 'scale(1,.4)'), 18: 'opacity:0;' + T(0, 30, 'scale(1,.4)'), 20: 'opacity:1;' + T(0, 20, 'scale(1,.5)'), 30: 'opacity:1;' + T(0, 0, 'scale(1,1.08)'), 34: 'opacity:1;' + T(0, 0, 'scale(1,1)'), 92: 'opacity:1;' + T(0, 0, 'scale(1,1)'), 100: 'opacity:0;' + T(0, 0, 'scale(1,1)')}, FOOT)}>${kid(150, 128, CL.a, {aR: [16, -50]})}</g>` +
        `<g ${s.a(pop(36), ORG(206, 46))}>${bubble(206, 46)}<text x="206" y="50" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.a)}>我在这儿!</text></g>`;
    }},
    // ---------- 第十二批 ----------
    material: {dur: 5.8, hl: [6, 50], end: 60, lit: '做东西用的物质', mean: '材料；物质的', draw: s => {
      const go = (dx, dy, p) => ({0: 'opacity:1;' + T(), [p]: 'opacity:1;' + T(), [p + 10]: 'opacity:1;' + T(dx, dy, 'scale(.4)'), [p + 11]: 'opacity:0;' + T(dx, dy, 'scale(.4)'), 98: 'opacity:0;' + T(dx, dy, 'scale(.4)'), 99: 'opacity:0;' + T(), 100: 'opacity:1;' + T()});
      return GND() + `<g ${s.a(go(160, -10, 10))}><circle cx="40" cy="112" r="10" fill="${WOOD}"/><circle cx="62" cy="112" r="10" fill="${WOOD}"/><circle cx="51" cy="94" r="10" fill="${WOOD}"/><circle cx="40" cy="112" r="4" fill="#d9a35b"/><circle cx="62" cy="112" r="4" fill="#d9a35b"/><circle cx="51" cy="94" r="4" fill="#d9a35b"/></g>` +
        `<g ${s.a(go(110, -10, 18))}>${[0, 1, 2].map(i => `<rect x="${92 + (i % 2) * 6}" y="${106 - i * 10}" width="26" height="9" rx="1" fill="#c8664a"/>`).join('')}</g>` +
        `<g ${s.a(go(60, -10, 26))}><ellipse cx="150" cy="106" rx="10" ry="22" fill="#6db7e8"/><ellipse cx="150" cy="86" rx="10" ry="4" fill="#9fd0ee"/></g>` +
        `<path d="M180 100h20" ${sk(CL.m, 3)}/><path d="M194 94l6 6-6 6" ${sk(CL.m, 3)}/>` +
        `<g ${s.a(pop(40), 'transform-origin:50% 100%;transform-box:fill-box')}><path d="M214 128V86l24-20 24 20v42z" fill="#c8664a"/><path d="M208 88l30-26 30 26" ${sk(WOOD, 5)}/><rect x="230" y="104" width="16" height="24" fill="${WOOD}"/><rect x="220" y="92" width="10" height="10" fill="#9fd0ee"/></g>` +
        [['木', 51, 74], ['砖', 105, 74], ['玻璃', 150, 74]].map(([t, x, y], i) => `<text x="${x}" y="${y}" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)} ${s.a({0: 'opacity:1', [10 + i * 8]: 'opacity:1', [12 + i * 8]: 'opacity:0', 98: 'opacity:0', 100: 'opacity:1'})}>${t}</text>`).join('');
    }},
    percent: {dur: 6, hl: [30, 6], end: 60, lit: '每一百个里', mean: '百分之…', draw: s => {
      let cells = '';
      for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) { const i = r * 10 + c, x = 30 + c * 9, y = 24 + r * 9;
        cells += `<rect x="${x}" y="${y}" width="8" height="8" rx="1" ${fl(CL.m, .25)}/>` + (i < 25 ? `<rect x="${x}" y="${y}" width="8" height="8" rx="1" ${fl(CL.a)} ${s.a(showAt(30 + i * .7, 92))}/>` : ''); }
      return cells + `<g ${s.a(showAt(4))}><text x="75" y="126" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.m)}>一共 100 格</text></g>` +
        `<circle cx="200" cy="70" r="40" ${fl(CL.m, .25)}/><path d="M200 70V30A40 40 0 0 1 240 70z" ${fl(CL.a)} ${s.a(pop(48), ORG(200, 70))}/>` +
        `<g ${s.a(pop(52), ORG(200, 128))}><text x="200" y="134" font-size="20" font-weight="700" text-anchor="middle" ${fl(CL.a)}>25%</text></g>`;
    }},
    tourist: {dur: 5.6, hl: [6, 46], end: 58, lit: '旅游的人', mean: '游客', draw: s => {
      return GND() + `<path d="M216 128V70M248 128V70" ${sk('#b8323a', 6)}/><path d="M200 74h64l-6-10h-52z" fill="#b8323a"/><path d="M206 64h52l-8-12h-36z" fill="#d9a35b"/><path d="M212 52h40l-8-12h-24z" fill="#b8323a"/><path d="M232 40v-8" ${sk(CL.g, 3)}/>` +
        `<g ${s.a(move([[6, -60, 0], [28, 0, 0]]))}>${kid(110, 128, CL.t, {aR: [20, -44], ...walkLegs(s, 110, 128, 6, 28, 5)})}<path d="M96 66h28l-4-8h-20z" fill="#f2b632"/><rect x="92" y="86" width="10" height="20" rx="3" fill="${WOOD}"/>` +
        `<rect x="126" y="78" width="14" height="10" rx="2" ${fl(CL.k)}/><circle cx="133" cy="83" r="3" ${fl(CL.m)}/></g>` +
        [32, 40].map(p => `<g ${s.a(showAt(p, p + 3))}><rect x="0" y="0" width="300" height="150" fill="#fff" opacity=".7"/>${burst(133, 83, 16).replace('<path ', `<path ${sk(CL.g, 2.5)} `)}</g>`).join('') +
        `<g ${s.a(pop(46), ORG(110, 108))}><rect x="102" y="102" width="16" height="11" rx="2" ${fl(CL.v)}/><text x="110" y="110.5" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">ist</text></g>`;
    }},
    building: {dur: 6, hl: [6, 50], end: 60, lit: '建造出来的东西', mean: '建筑物', draw: s => {
      const floor = (i, p) => `<g ${s.a({0: 'opacity:0;' + T(60, -40), [p]: 'opacity:0;' + T(60, -40), [p + 1]: 'opacity:1;' + T(60, -40), [p + 8]: 'opacity:1;' + T(), 92: 'opacity:1;' + T(), 100: 'opacity:0;' + T()})}><rect x="110" y="${108 - i * 20}" width="70" height="20" ${fl([CL.t, CL.v, CL.a, CL.g][i % 4], .8)}/><rect x="118" y="${113 - i * 20}" width="12" height="10" ${fl(CL.p, .8)}/><rect x="139" y="${113 - i * 20}" width="12" height="10" ${fl(CL.p, .8)}/><rect x="160" y="${113 - i * 20}" width="12" height="10" ${fl(CL.p, .8)}/></g>`;
      return GND() + `<path d="M240 128V14M240 18H150M240 18h22" ${sk(CL.g, 4)}/><path d="M244 28l-8 8M244 48l-8 8M244 68l-8 8M244 88l-8 8" ${sk(CL.g, 2)}/>` +
        `<g ${s.a({0: T(), 100: T()})}><path d="M170 18v${0}" ${sk(CL.m, 1.5)}/></g>` + [0, 1, 2, 3, 4].map(i => floor(i, 6 + i * 9)).join('') +
        `<g ${s.a(pop(50), ORG(145, 14))}><path d="M145 28V8" ${sk(CL.k, 2)}/><path d="M145 8h14l-3 4 3 4h-14z" fill="#d23c2f"/></g>`;
    }},
    compare: {dur: 5.8, hl: [10, 30], end: 58, lit: '放在一起看是否对等', mean: '比较', draw: s => {
      return GND() + `<g ${s.a(move([[10, -60, 0], [26, 0, 0]]))}>${kid(130, 128, CL.t, {k: 1.05})}</g><g ${s.a(move([[10, 60, 0], [26, 0, 0]]))}>${kid(170, 128, CL.a, {k: .85})}</g>` +
        `<path d="M110 62h40M160 74h40" ${sk(CL.k, 2)} ${s.a(showAt(30))}/>` +
        `<path d="M240 128V30" ${sk(CL.g, 6)}/>` + [0, 1, 2, 3, 4, 5].map(i => `<path d="M236 ${120 - i * 16}h8" ${sk(CL.k, 1.5)}/>`).join('') +
        `<path d="M150 62h90M190 74h50" ${sk(CL.a, 1.5)} stroke-dasharray="3 3" ${s.a(fadeP(34, 40))}/>` +
        `<g ${s.a(pop(44), ORG(150, 40))}><circle cx="150" cy="38" r="14" ${fl(CL.v)}/><text x="150" y="44" font-size="18" font-weight="700" text-anchor="middle" fill="#fff">&gt;</text></g>`;
    }},
    especially: {dur: 5.8, hl: [30, 20, 52], end: 60, lit: '特别特别地', mean: '尤其；特别', draw: s => {
      const xs = [40, 84, 128, 172, 216, 260];
      return GND() + `<rect x="20" y="108" width="260" height="8" rx="2" ${fl(WOOD, .6)}/>` +
        xs.map((x, i) => i === 3 ? '' : `<circle cx="${x}" cy="94" r="14" ${fl(CL.m, .55)}/><path d="M${x} 80q2-6 6-8" ${sk(WOOD, 2)}/>`).join('') +
        `<path d="M152 0h40l26 108h-92z" ${fl(CL.g, .2)} ${s.a(showAt(20))}/>` +
        `<g ${s.a({0: 'transform:scale(1)', 28: 'transform:scale(1)', 36: 'transform:scale(1.25)', 92: 'transform:scale(1.25)', 100: 'transform:scale(1)'}, 'transform-origin:50% 100%;transform-box:fill-box')}><circle cx="172" cy="94" r="14" fill="#e2473a"/><path d="M172 80q2-6 6-8" ${sk(WOOD, 2)}/><path d="M164 88a8 8 0 0 1 5-5" ${sk('#fff', 2.5, .7)}/></g>` +
        `<g ${s.a(pop(36), ORG(196, 60))}>${sparkle(196, 60, 7)}${sparkle(150, 66, 5)}</g>` +
        `<g ${s.a(pop(52), ORG(172, 30))}><path d="M172 14l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" ${fl(CL.g)}/><text x="210" y="34" font-size="11" font-weight="700" ${fl(CL.a)}>尤其是它</text></g>`;
    }},
    explain: {dur: 6, hl: [20, 34], end: 60, lit: '摊平说清楚', mean: '解释', draw: s => {
      return GND() + kid(250, 128, CL.v, {noFace: true}) + `<g ${s.a(hideAt(46))}>${face(250, 128, 1, 'sad')}<text x="266" y="64" font-size="14" font-weight="700" ${fl(CL.v)}>?</text></g><g ${s.a(showAt(46))}>${face(250, 128)}<text x="270" y="66" font-size="10" font-weight="700" ${fl(CL.t)}>哦~</text></g>` +
        `<g ${s.a(hideAt(22))}><circle cx="130" cy="74" r="22" fill="#f4f1e6" style="stroke:var(--ink3);stroke-width:2px"/><path d="M114 66l10 6-4 8 12-4 4 10 6-12M120 84l14-4 6 6" ${sk(CL.m, 1.5)}/></g>` +
        `<g ${s.a({0: 'opacity:0;transform:scale(.3,.3)', 20: 'opacity:0;transform:scale(.3,.3)', 22: 'opacity:1;transform:scale(.4,.6)', 32: 'opacity:1;transform:scale(1,1)', 92: 'opacity:1;transform:scale(1,1)', 100: 'opacity:0;transform:scale(1,1)'}, ORG(130, 74))}>` +
        `<rect x="84" y="40" width="92" height="68" rx="2" fill="#fffdf6" style="stroke:var(--ink3);stroke-width:1.5px"/>` +
        [0, 1, 2].map(i => `<g ${s.a(showAt(34 + i * 4))}><circle cx="${100 + i * 30}" cy="74" r="9" ${fl([CL.t, CL.a, CL.v][i])}/><text x="${100 + i * 30}" y="78" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">${i + 1}</text>${i < 2 ? `<path d="M${110 + i * 30} 74h10" ${sk(CL.m, 2)}/>` : ''}</g>`).join('') + `</g>` +
        kid(50, 128, CL.t, {aR: [22, -40]});
    }},
    within: {dur: 5.6, hl: [6, 24], end: 58, lit: '在范围里面', mean: '在…之内', draw: s => {
      return GND() + `<ellipse cx="190" cy="118" rx="60" ry="12" ${fl(CL.t, .15)} style="stroke:var(--teal);stroke-width:2.5px;stroke-dasharray:6 5"/>` +
        `<g ${s.a(move([[6, 0, 0], [16, 60, -60], [26, 140, -4]]))}><circle cx="40" cy="110" r="8" ${fl(CL.a)}/></g>` +
        `<g ${s.a(showAt(26))}><ellipse cx="180" cy="118" rx="12" ry="3" ${fl(CL.k, .3)}/></g>` +
        `<g ${s.a(pop(28), ORG(190, 70))}><circle cx="190" cy="70" r="14" ${fl(CL.t)}/><path d="M183 70l5 5 9-10" ${sk('#fff', 3)}/></g>` +
        `<g ${s.a(pop(40), ORG(60, 40))}><circle cx="60" cy="40" r="18" ${fs(CL.p, CL.k, 2.5)}/><path d="M60 40V28M60 40l8 4" ${sk(CL.k, 2.5)}/><text x="96" y="44" font-size="12" font-weight="700" ${fl(CL.a)}>7 天内</text></g>`;
    }},
    effective: {dur: 5.8, hl: [30, 50], end: 60, lit: '产生了效果的', mean: '有效的', draw: s => {
      const bug = (x, y, dl) => `<g ${s.a(hideAt(30))}><g ${s.a({0: T(), 50: T(3, -2), 100: T()}, `animation-delay:${dl}s`, .5)}><ellipse cx="${x}" cy="${y}" rx="4" ry="3" fill="${INK}"/><path d="M${x - 4} ${y - 2}l-3-3M${x + 4} ${y - 2}l3-3" ${sk(INK, 1)}/></g></g>`;
      return GND() + `<path d="M180 128h40l-4-18h-32z" fill="#c8664a"/>` +
        `<g ${s.a({0: R(0), 34: R(0), 46: R(0), 100: R(0)}, 'transform-origin:50% 100%;transform-box:fill-box')}><g ${s.a(hideAt(34))}><path d="M200 110q-2-20-14-28M200 110q2-18 12-24" ${sk('#9a8a5a', 3)}/><ellipse cx="186" cy="82" rx="8" ry="4" fill="#9a8a5a"/></g>` +
        `<g ${s.a(showAt(34))}><path d="M200 110V70" ${sk('#3f8f4f', 3)}/><path d="M200 92q-14 0-16-12q14-1 16 12zM200 84q14 0 16-12q-14-1-16 12z" fill="#3f8f4f"/>${[0, 72, 144, 216, 288].map(a => `<circle cx="${f1(200 + 6 * Math.cos(a * Math.PI / 180))}" cy="${f1(64 + 6 * Math.sin(a * Math.PI / 180))}" r="5" ${fl(CL.a)}/>`).join('')}<circle cx="200" cy="64" r="4" ${fl(CL.g)}/></g></g>` +
        bug(186, 86, 0) + bug(208, 92, .2) + bug(196, 100, .4) +
        kid(110, 128, CL.t, {aR: [26, -44]}) + `<rect x="134" y="80" width="12" height="18" rx="2" ${fl(CL.v)}/><path d="M140 80v-6h8" ${sk(CL.k, 2.5)}/>` +
        `<g ${s.a(showAt(14, 30))}>${[0, 1, 2].map(i => `<circle cx="158" cy="76" r="2.5" fill="#9fd0ee" ${s.a({0: 'opacity:0;' + T(), 10: 'opacity:1;' + T(), 100: 'opacity:0;' + T(30, 6 + i * 6)}, `animation-delay:${i * .15}s`, .6)}/>`).join('')}</g>` +
        `<g ${s.a(pop(50), ORG(250, 40))}><rect x="224" y="30" width="52" height="20" rx="6" ${fl(CL.t)}/><text x="250" y="44" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">有效 ✓</text></g>`;
    }},
    environmental: {dur: 5.8, hl: [6, 50], end: 60, lit: '和环境有关的', mean: '环境的', draw: s => {
      const arrow = a => `<path d="M${f1(150 + 30 * Math.cos(a))} ${f1(56 + 30 * Math.sin(a))}A30 30 0 0 1 ${f1(150 + 30 * Math.cos(a + 1.6))} ${f1(56 + 30 * Math.sin(a + 1.6))}" ${sk(CL.t, 6)}/>`;
      return GND() + `<g ${s.a({0: R(0), 100: R(360)}, ORG(150, 56) + ';animation-timing-function:linear', 5)}>${[0, 2.09, 4.19].map(arrow).join('')}</g>` +
        `<circle cx="150" cy="56" r="20" fill="#6db7e8"/><path d="M138 50q8-6 14 0t8 10-10 4-12-14z" fill="#5fae6a"/>` +
        kid(50, 128, CL.a, {aR: [22, -24]}) + `<g ${s.a(growY(14, 30), 'transform-origin:50% 100%;transform-box:fill-box')}><path d="M84 128V108" ${sk(WOOD, 3)}/><circle cx="84" cy="100" r="10" fill="#3f8f4f"/></g>` +
        `<rect x="228" y="96" width="30" height="32" rx="2" ${fl(CL.t)}/><path d="M226 96h34" ${sk(CL.t, 4)}/><path d="M236 108l4-6 4 6h-8M252 116l-4 6h8z" ${sk('#fff', 1.5)}/>` +
        `<g ${s.a({0: 'opacity:0;' + T(-30, -30, 'rotate(0deg)'), 29: 'opacity:0;' + T(-30, -30, 'rotate(0deg)'), 30: 'opacity:1;' + T(-30, -30, 'rotate(0deg)'), 42: 'opacity:1;' + T(0, 8, 'rotate(180deg)'), 46: 'opacity:0;' + T(0, 24, 'rotate(180deg)'), 100: 'opacity:0;' + T(0, 24, 'rotate(180deg)')})}><rect x="236" y="76" width="12" height="14" rx="2" fill="#6db7e8" opacity=".85"/></g>`;
    }},
    evidence: {dur: 6, hl: [30, 6, 50], end: 60, lit: '看得出来的东西', mean: '证据', draw: s => {
      const prints = [[60, 120], [84, 112], [108, 120], [132, 112], [156, 120]];
      return GND() + prints.map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="3.5" ${fl(CL.k, .35)} ${s.a(showAt(4 + i * 4))}/>`).join('') +
        `<g ${s.a(move([[6, -60, -20], [28, 60, -10], [36, 110, -30]]))}><circle cx="90" cy="96" r="14" ${fs(CL.p, CL.k, 3.5, .45)}/><path d="M100 106l10 10" ${sk(CL.k, 5)}/></g>` +
        `<rect x="190" y="70" width="40" height="44" rx="3" fill="${WOOD}" opacity=".5"/><g ${s.a(showAt(30))}><path d="M202 82q8-6 16 0M200 88q10-8 20 0M200 94q10-8 20 0M202 100q8-6 16 0" ${sk(CL.a, 1.6)}/></g>` +
        `<g ${s.a(pop(48), ORG(254, 40))}><rect x="232" y="24" width="44" height="34" rx="3" ${fs('#fffdf6', CL.m, 1.5)}/><path d="M232 32h44" ${sk(CL.a, 4)}/><text x="254" y="50" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.a)}>证据</text></g>`;
    }},
    financial: {dur: 5.6, hl: [6, 50], end: 58, lit: '和钱有关的', mean: '金融的；财政的', draw: s => {
      return GND() + `<g ${s.a(pop(2), 'transform-origin:50% 100%;transform-box:fill-box')}><rect x="26" y="118" width="100" height="10" ${fl(CL.m, .5)}/>` + [34, 56, 78, 100].map(x => `<rect x="${x}" y="80" width="10" height="38" ${fs(CL.p, CL.m, 1.5)}/>`).join('') +
        `<path d="M22 80L76 52l54 28z" ${fl(CL.g, .9)}/><text x="76" y="76" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">BANK</text></g>` +
        `<rect x="150" y="30" width="130" height="80" rx="4" ${fs(CL.p, CL.m, 2)}/>` +
        `<path d="M158 96l20-12 16 8 18-24 16 6 20-30 20 10" ${sk(CL.a, 3)} ${DASH} ${s.a(drawP(10, 44))}/>` +
        [0, 1, 2].map(i => `<g ${s.a({0: 'opacity:0;' + T(), [14 + i * 10]: 'opacity:0;' + T(), [15 + i * 10]: 'opacity:1;' + T(), [24 + i * 10]: 'opacity:1;' + T(100, -50), [26 + i * 10]: 'opacity:0;' + T(100, -50), 100: 'opacity:0;' + T()})}><circle cx="76" cy="66" r="6" ${fl(CL.g)}/><text x="76" y="69.5" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">¥</text></g>`).join('') +
        `<g ${s.a(pop(50), ORG(220, 128))}><rect x="196" y="116" width="48" height="28" rx="4" ${fl(CL.v)}/><rect x="202" y="122" width="10" height="7" rx="1" fill="#f2b632"/><path d="M202 136h30" ${sk('#fff', 1.5)}/></g>`;
    }},
    // ---------- 第十三批 ----------
    professor: {dur: 5.6, hl: [6, 14, 46], end: 58, lit: '站在前面讲课的人', mean: '教授', draw: s => {
      const wave = dl => `<path d="M118 66q8 10 0 20" ${sk(CL.t, 2.5)} ${s.a({0: 'opacity:0;' + T(), 15: 'opacity:1;' + T(), 85: 'opacity:1;' + T(40), 100: 'opacity:0;' + T(46)}, `animation-delay:${dl}s;animation-timing-function:linear`, 1.2)}/>`;
      return [0, 1, 2].map(r => [0, 1, 2, 3, 4].map(c => `<circle cx="${170 + c * 24 - r * 6}" cy="${80 + r * 22}" r="${7 + r}" fill="${INK}" opacity="${.3 + r * .15}"/><path d="M${161 + c * 24 - r * 6} ${92 + r * 22}h${18 + r * 2}" ${sk(INK, 6 + r, .2)}/>`).join('')).join('') +
        GND() + kid(90, 128, '#4a4f57', {k: 1.15, aR: [18, -40]}) + `<path d="M80 72h20" ${sk(INK, 1.3)}/><circle cx="86" cy="70" r="3.4" ${sk(INK, 1.3)}/><circle cx="96" cy="70" r="3.4" ${sk(INK, 1.3)}/>` +
        `<path d="M72 128l6-34h24l6 34z" fill="${WOOD}"/>` + `<g ${s.a(showAt(14, 46))}>${wave(0)}${wave(.4)}${wave(.8)}</g>` +
        `<g ${s.a(pop(46), ORG(90, 30))}><rect x="62" y="18" width="56" height="20" rx="6" ${fl(CL.v)}/><text x="90" y="32" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">教授</text></g>`;
    }},
    journal: {dur: 6, hl: [6, 48], end: 60, lit: '每天记下来的', mean: '期刊；日志', draw: s => {
      const days = ['一', '二', '三', '四'];
      return GND() + days.map((d, i) => { const x = 30 + i * 52, p = 6 + i * 9;
          return `<g ${s.a({0: 'opacity:0;' + T(), [p]: 'opacity:0;' + T(), [p + 1]: 'opacity:1;' + T(), 42: 'opacity:1;' + T(), 50: 'opacity:1;' + T(206 - x, 0, 'scale(.3)'), 52: 'opacity:0;' + T(206 - x, 0, 'scale(.3)'), 100: 'opacity:0'})}><rect x="${x}" y="40" width="44" height="56" rx="3" ${fs(CL.p, CL.m, 1.5)}/><circle cx="${x + 10}" cy="50" r="5" ${fl(CL.g)}/><text x="${x + 32}" y="54" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>周${d}</text>` +
            `<path d="M${x + 6} 66h32M${x + 6} 74h32M${x + 6} 82h22" ${sk(CL.k, 1.5)} ${DASH} ${s.a(drawP(p + 1, p + 7))}/></g>`; }).join('') +
        `<g ${s.a(pop(50), ORG(236, 70))}><rect x="214" y="40" width="46" height="60" rx="3" ${fl(CL.v)}/><rect x="214" y="40" width="7" height="60" ${fl(CL.k, .4)}/><text x="240" y="66" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">Journal</text><path d="M228 76h24M228 82h18" ${sk('#fff', 1.5)}/></g>`;
    }},
    mental: {dur: 5.6, hl: [6, 50], end: 58, lit: '心智上的', mean: '心理的；精神的', draw: s => {
      return GND() + `<path d="M110 128v-16q-24-6-24-40a40 40 0 0 1 80 0q0 10-4 16l8 12-10 4v10q0 8-10 8h-10v6z" ${fl(CL.m, .35)}/>` +
        `<g ${s.a({0: 'transform:scale(1)', 15: 'transform:scale(1.06)', 30: 'transform:scale(1)', 100: 'transform:scale(1)'}, ORG(124, 66), 1.6)}><path d="M104 66a14 14 0 0 1 10-20 14 14 0 0 1 22 0 14 14 0 0 1 8 22 12 12 0 0 1-12 14 12 12 0 0 1-18 0 12 12 0 0 1-10-16z" fill="#f2a3b3"/><path d="M114 50q4 8-2 14M128 48q-4 10 4 16M122 66q6 4 2 12" ${sk('#c76b80', 2)}/></g>` +
        [0, 1, 2].map(i => `<path d="M${168 + i * 16} ${50 - i * 6}q8 14 0 28" ${sk(CL.v, 2.5)} ${s.a({0: 'opacity:0;' + T(), 20: 'opacity:1;' + T(), 100: 'opacity:0;' + T(16)}, `animation-delay:${i * .3}s`, 1.4)}/>`).join('') +
        `<g ${s.a(pop(30), ORG(126, 28))}><path d="M118 30a8 8 0 1 1 16 0c0 4-3 5-3 9h-10c0-4-3-5-3-9z" ${fl(CL.g)}/></g>` +
        `<g ${s.a(pop(50), ORG(240, 40))}><rect x="210" y="30" width="60" height="20" rx="6" ${fl(CL.v)}/><text x="240" y="44" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">心理健康</text></g>`;
    }},
    passion: {dur: 5.6, hl: [6, 50], end: 58, lit: '强烈的感受', mean: '激情；酷爱', draw: s => {
      const strum = {0: R(0), 100: R(0)}; for (let i = 0; i < 12; i++) strum[6 + i * 4] = R(i % 2 ? -14 : 6);
      return GND() + `<g ${s.a({0: 'opacity:0;transform:scale(.4)', 10: 'opacity:0;transform:scale(.4)', 30: 'opacity:1;transform:scale(1)', 92: 'opacity:1;transform:scale(1)', 100: 'opacity:0;transform:scale(1)'}, 'transform-origin:50% 100%;transform-box:fill-box')}>` +
        [[110, .7], [190, .7], [150, 1.1]].map(([x, k]) => `<g ${s.a({0: 'transform:scale(1,1)', 25: 'transform:scale(.92,1.08)', 50: 'transform:scale(1.05,.95)', 75: 'transform:scale(.96,1.05)', 100: 'transform:scale(1,1)'}, 'transform-origin:50% 100%;transform-box:fill-box', .8)}>${flame('ff').replace('class="ff"', `fill="#f6a623" opacity=".85" transform="translate(${x - 32 * k} ${128 - 54 * k}) scale(${k})"`)}</g>`).join('') + `</g>` +
        kid(150, 128, CL.a, {aR: [16, -28], armR: s.a(strum, shoulder(150, 128, 1))}) +
        `<path d="M128 108l30-12" ${sk(WOOD, 3)}/><ellipse cx="134" cy="108" rx="12" ry="9" fill="${WOOD}" transform="rotate(-20 134 108)"/><circle cx="134" cy="107" r="3" fill="${INK}"/>` +
        `<g ${s.a({0: 'transform:scale(1)', 15: 'transform:scale(1.25)', 30: 'transform:scale(.95)', 45: 'transform:scale(1.1)', 100: 'transform:scale(1)'}, ORG(150, 100), .7)}>${heartAt(150, 98, .5, '#fff')}</g>` +
        [[90, 40, 0], [220, 46, .6]].map(([x, y, dl]) => `<text x="${x}" y="${y}" font-size="16" ${fl(CL.v)} ${s.a({0: 'opacity:0;' + T(), 20: 'opacity:1;' + T(), 100: 'opacity:0;' + T(0, -20)}, `animation-delay:${dl}s`, 1.6)}>♪</text>`).join('');
    }},
    patient: {dur: 6, hl: [6, 40], end: 60, lit: '忍着病痛的人', mean: '病人；耐心的', draw: s => {
      return `<path d="M40 128V96h150v32M40 96V70" ${sk(CL.m, 4)}/><rect x="44" y="84" width="142" height="14" rx="4" fill="#e8f3f8"/><rect x="40" y="70" width="18" height="20" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/>` +
        `<circle cx="70" cy="80" r="11" fill="${SKIN}"/><path d="M59 79a11 11 0 0 1 22 0q-5-4-11-3t-11 3z" fill="${HAIR}"/><circle cx="66" cy="81" r="1.5" fill="${INK}"/><circle cx="74" cy="81" r="1.5" fill="${INK}"/><path d="M66 87h8" ${sk(INK, 1.5)}/>` +
        `<path d="M82 88h96v10H82z" ${fl(CL.t, .7)}/><path d="M78 76l10 2" ${sk('#fff', 3)}/><rect x="84" y="74" width="12" height="4" rx="2" fill="#e2473a"/>` +
        `<path d="M222 128V40" ${sk(CL.m, 3)}/><path d="M210 40h24" ${sk(CL.m, 3)}/><rect x="212" y="44" width="20" height="26" rx="4" fill="#bfe1f2"/><path d="M222 70q0 10-30 20" ${sk(CL.m, 1.5)}/>` +
        `<circle cx="260" cy="44" r="18" ${fs(CL.p, CL.k, 2.5)}/><path d="M260 44V32" ${sk(CL.k, 2.5)}/><g ${s.a({0: R(0), 100: R(720)}, ORG(260, 44) + ';animation-timing-function:linear')}><path d="M260 44h11" ${sk(CL.a, 2)}/></g>` +
        `<g ${s.a(pop(40), ORG(120, 40))}><rect x="88" y="28" width="66" height="22" rx="6" ${fl(CL.v)}/><text x="121" y="43" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">忍一忍…</text></g>`;
    }},
    physical: {dur: 5.4, hl: [6, 50], end: 58, lit: '身体上的', mean: '身体的；物理的', draw: s => {
      const jack = {0: 'transform:translateY(0)', 100: 'transform:translateY(0)'}; for (let i = 0; i < 6; i++) { jack[6 + i * 8] = 'transform:translateY(0)'; jack[10 + i * 8] = 'transform:translateY(-10px)'; }
      const arm = side => { const f = {0: R(0), 100: R(0)}; for (let i = 0; i < 6; i++) { f[6 + i * 8] = R(0); f[10 + i * 8] = R(side * -150); } return s.a(f, shoulder(130, 128, side)); };
      return GND() + `<g ${s.a(jack)}>${kid(130, 128, CL.a, {armL: arm(-1), armR: arm(1)})}<path d="M144 70q-3 5 0 7" ${sk('#6db7e8', 2.5)}/></g>` +
        `<g ${s.a({0: 'opacity:0', 8: 'opacity:1', 50: 'opacity:1', 100: 'opacity:0'})}><rect x="196" y="40" width="70" height="44" rx="6" ${fs(CL.p, CL.m, 2)}/><path d="M202 62h12l5-12 7 24 6-16 4 4h18" ${sk('#e2473a', 2.5)} ${DASH} ${s.a(drawP(8, 40))}/></g>` +
        `<g ${s.a(pop(50), ORG(130, 30))}><path d="M114 30q8-12 16 0q8-12 16 0q-2 10-16 16q-14-6-16-16z" ${fl(CL.t)}/><text x="130" y="36" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">身体</text></g>`;
    }},
    policy: {dur: 5.8, hl: [6, 40], end: 60, lit: '城邦定下的规矩', mean: '政策', draw: s => {
      return GND() + `<path d="M20 128V80h20v-8h12v8h20v-8h12v8h20v48z" ${fl(CL.m, .45)}/><path d="M40 128V104a12 12 0 0 1 24 0v24" ${fl(CL.k, .4)}/>` +
        `<path d="M126 32h120" ${sk(WOOD, 6)}/><rect x="130" y="32" width="112" height="70" ${fl('#f4e6c8')} ${s.a({0: 'transform:scaleY(0)', 8: 'transform:scaleY(0)', 24: 'transform:scaleY(1)', 92: 'transform:scaleY(1)', 100: 'transform:scaleY(0)'}, 'transform-origin:50% 0%;transform-box:fill-box')}/>` +
        `<path d="M126 104h120" ${sk(WOOD, 6)} ${s.a({0: T(), 8: T(0, -70), 24: T(), 92: T(), 100: T(0, -70)})}/>` +
        `<text x="186" y="50" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.a)} ${s.a(showAt(24))}>政策</text>` +
        [0, 1, 2].map(i => `<path d="M142 ${62 + i * 12}h88" ${sk(CL.m, 2)} ${DASH} ${s.a(drawP(26 + i * 4, 32 + i * 4))}/>`).join('') +
        [0, 1, 2].map(i => `<g ${s.a(move([[40 + i * 3, 0, 0], [56 + i * 3, 0, 0]]))}>${kid(110 + i * 26, 128, [CL.t, CL.v, CL.g][i], {k: .45})}</g>`).join('') +
        `<path d="M100 120h80" ${sk(CL.t, 2)} ${DASH} ${s.a(drawP(40, 52))}/>`;
    }},
    region: {dur: 5.8, hl: [6, 44], end: 60, lit: '统治所及的范围', mean: '地区；区域', draw: s => {
      return `<rect x="20" y="16" width="260" height="120" rx="10" fill="#e8f3f8"/><path d="M40 60q40-30 90-10t80 20 60-10M30 110q60-20 110 0t130-10" ${sk('#9fd0ee', 6)}/>` +
        `<path d="M96 46q40-16 70 0t20 40-50 26-50-14-10-36z" ${fl(CL.a, .25)} ${s.a(showAt(30))}/>` +
        `<path d="M96 46q40-16 70 0t20 40-50 26-50-14-10-36z" ${sk(CL.a, 2.5)} stroke-dasharray="6 5" ${s.a(fadeP(14, 30))}/>` +
        `<g ${s.a({0: 'opacity:0;' + T(0, -40), 4: 'opacity:1;' + T(0, -40), 14: 'opacity:1;' + T(), 92: 'opacity:1;' + T(), 100: 'opacity:0;' + T()})}><path d="M126 78l-3-14 8 6 6-10 6 10 8-6-3 14z" ${fl(CL.g)}/></g>` +
        `<g ${s.a(pop(44), ORG(234, 30))}><rect x="204" y="20" width="60" height="20" rx="6" ${fl(CL.a)}/><text x="234" y="34" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">这一片</text></g>`;
    }},
    scientific: {dur: 5.6, hl: [6, 50], end: 58, lit: '讲科学的', mean: '科学的', draw: s => {
      return GND() + `<path d="M150 128h50M170 128v-10M162 118h26l-6-40-8-8" ${sk(CL.k, 4)}/><rect x="160" y="40" width="12" height="36" rx="3" transform="rotate(-24 166 58)" ${fl(CL.k)}/><circle cx="182" cy="96" r="10" ${fs(CL.p, CL.m, 2)}/>` +
        kid(110, 128, '#eef1f4', {aR: [26, -58]}) + `<rect x="100" y="87" width="20" height="24" rx="8" ${sk(CL.m, 1.2)}/>` +
        `<g ${s.a(pop(20), ORG(246, 60))}><circle cx="246" cy="60" r="30" fill="#e8f3f8" style="stroke:var(--ink);stroke-width:3px"/>` +
        [[236, 52, CL.t], [256, 66, CL.a], [244, 72, CL.v], [254, 48, CL.g]].map(([x, y, c], i) => `<circle cx="${x}" cy="${y}" r="5" ${fl(c)} ${s.a({0: T(), 50: T(i % 2 ? 4 : -4, i % 2 ? -3 : 3), 100: T()}, '', 1.2 + i * .2)}/>`).join('') + `</g>` +
        `<path d="M188 70q20-10 30-12" ${sk(CL.m, 1.5)} stroke-dasharray="3 3" ${s.a(fadeP(18, 22))}/>` +
        `<g ${s.a(pop(50), ORG(60, 40))}><rect x="24" y="30" width="72" height="20" rx="6" ${fl(CL.t)}/><text x="60" y="44" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">用证据说话</text></g>`;
    }},
    training: {dur: 6, hl: [6, 50], end: 60, lit: '一遍遍地练', mean: '训练；培训', draw: s => {
      const lap = {0: 'opacity:1;' + T()}; for (let i = 0; i < 3; i++) { lap[6 + i * 16] = 'opacity:1;' + T(); lap[12 + i * 16] = 'opacity:1;' + T(70, -24); lap[18 + i * 16] = 'opacity:1;' + T(140, 0); lap[19 + i * 16] = 'opacity:0;' + T(140, 0); lap[20 + i * 16] = 'opacity:0;' + T(); lap[21 + i * 16] = 'opacity:1;' + T(); }
      lap[92] = 'opacity:1;' + T(); lap[100] = 'opacity:1;' + T();
      return GND() + `<path d="M120 128v-16M128 128v-16M118 114h12M190 128v-16M198 128v-16M188 114h12" ${sk(CL.a, 3)}/>` +
        `<g ${s.a(lap)}>${kid(80, 128, CL.t, {k: .8, ...walkLegs(s, 80, 128, 6, 54, 18, .8)})}</g>` +
        kid(260, 128, CL.v, {aL: [-12, -46]}) + `<path d="M248 82h-6" ${sk(CL.k, 3)}/><circle cx="240" cy="82" r="3" ${fl(CL.g)}/>` +
        `<g ${s.a(showAt(6))}><circle cx="40" cy="40" r="16" ${fs(CL.p, CL.k, 2.5)}/><g ${s.a({0: R(0), 100: R(360)}, ORG(40, 40) + ';animation-timing-function:linear', 1.5)}><path d="M40 40V28" ${sk(CL.a, 2)}/></g></g>` +
        ['第1遍', '第2遍', '第3遍'].map((t, i) => `<text x="150" y="40" font-size="12" font-weight="700" text-anchor="middle" ${fl(CL.t)} ${s.a(slot([0, 6 + i * 16, 22 + i * 16].map((v, j) => j === 0 ? 0 : v), 1))}>${t}</text>`).join('');
    }},
    background: {dur: 5.6, hl: [20, 6], end: 58, lit: '衬在后面的底子', mean: '背景', draw: s => {
      return `<rect x="40" y="16" width="220" height="118" rx="6" fill="#fffdf6" style="stroke:var(--ink3);stroke-width:2px"/>` +
        `<g ${s.a({0: 'opacity:0;' + T(0, 40), 6: 'opacity:0;' + T(0, 40), 22: 'opacity:1;' + T(), 92: 'opacity:1;' + T(), 100: 'opacity:0;' + T()})}><rect x="44" y="20" width="212" height="84" fill="#bfe1f2"/><path d="M44 104l50-50 40 34 30-24 50 40 42-20v20z" fill="#7d9c7a"/><circle cx="214" cy="40" r="10" ${fl(CL.g)}/></g>` +
        `<rect x="44" y="104" width="212" height="26" ${fl(WOOD, .5)} ${s.a(growY(6, 16), 'transform-origin:50% 100%;transform-box:fill-box')}/>` +
        kid(150, 128, CL.a, {aR: [14, -48]}) +
        `<g ${s.a(pop(40), ORG(150, 146))}><path d="M110 140l6-6h68l6 6" ${sk(CL.v, 2)}/><text x="150" y="148" font-size="8" font-weight="700" text-anchor="middle" ${fl(CL.v)}>后面这一片就是背景</text></g>`;
    }},
    certain: {dur: 5.6, hl: [20, 50], end: 58, lit: '确定下来的', mean: '确定的；某个', draw: s => {
      return GND() + kid(70, 128, CL.t, {noFace: true, aR: [20, -40]}) + `<g ${s.a(hideAt(22))}>${face(70, 128, 1, 'sad')}<text x="86" y="62" font-size="13" font-weight="700" ${fl(CL.v)}>?</text></g><g ${s.a(showAt(22))}>${face(70, 128)}</g>` +
        [0, 1, 2].map(i => `<rect x="150" y="${40 + i * 30}" width="18" height="18" rx="3" ${sk(CL.m, 2.5)}/><path d="M176 ${49 + i * 30}h70" ${sk(CL.m, 3, .5)}/>`).join('') +
        `<path d="M153 79l6 6 12-14" ${sk(CL.a, 4)} ${DASH} ${s.a(drawP(18, 24))}/>` +
        `<g ${s.a({0: 'opacity:0;' + T(-30, 30), 6: 'opacity:1;' + T(-30, 30), 10: 'opacity:1;' + T(0, -30), 14: 'opacity:1;' + T(0, 30), 18: 'opacity:1;' + T(0, 0), 24: 'opacity:1;' + T(0, 0), 30: 'opacity:0;' + T(0, 0), 100: 'opacity:0'})}><path d="M166 82l14 16" ${sk(CL.k, 3)}/><path d="M160 76l6 6-8 2z" ${fl(CL.k)}/></g>` +
        `<g ${s.a(pop(36), ORG(264, 80))}><path d="M256 78v-6a8 8 0 0 1 16 0v6" ${sk(CL.k, 3)}/><rect x="252" y="78" width="24" height="18" rx="3" ${fl(CL.g)}/></g>` +
        `<g ${s.a(pop(50), ORG(206, 128))}><rect x="176" y="118" width="60" height="20" rx="6" ${fl(CL.a)}/><text x="206" y="132" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">100% 确定</text></g>`;
    }},
    // ---------- 第十四批 ----------
    identify: {dur: 5.8, hl: [30, 44], end: 58, lit: '确认是同一个', mean: '识别', draw: s => {
      const xs = [150, 200, 250], cs = [CL.v, CL.a, CL.t];
      return GND() + `<rect x="24" y="30" width="60" height="74" rx="3" ${fs(CL.p, CL.m, 2)}/><circle cx="54" cy="58" r="12" fill="${SKIN}"/><path d="M42 57a12 12 0 0 1 24 0q-6-5-12-4t-12 4z" fill="${HAIR}"/><path d="M38 96q0-18 16-18t16 18z" fill="var(--accent)"/><text x="54" y="44" font-size="7" font-weight="700" text-anchor="middle" ${fl(CL.m)}>照片</text>` +
        xs.map((x, i) => kid(x, 128, cs[i], {k: .85})).join('') +
        `<g ${s.a({0: 'opacity:0;' + T(), 8: 'opacity:1;' + T(), 18: 'opacity:1;' + T(50, 0), 28: 'opacity:1;' + T(100, 0), 34: 'opacity:1;' + T(50, 0), 92: 'opacity:1;' + T(50, 0), 100: 'opacity:0;' + T(50, 0)})}><rect x="134" y="66" width="32" height="44" rx="3" ${sk(CL.g, 2.5)}/><path d="M134 88h32" ${sk(CL.g, 1.5, .6)}/></g>` +
        `<path d="M86 66Q140 30 200 66" ${sk(CL.a, 2.5)} ${DASH} ${s.a(drawP(34, 44))}/>` +
        `<g ${s.a(pop(44), ORG(200, 40))}><circle cx="200" cy="36" r="11" ${fl(CL.t)}/><path d="M195 36l3.5 3.5 6-7" ${sk('#fff', 2.5)}/><text x="230" y="40" font-size="10" font-weight="700" ${fl(CL.t)}>就是他</text></g>`;
    }},
    similar: {dur: 5.6, hl: [30, 50], end: 58, lit: '差不多相同的', mean: '相似的', draw: s => {
      const cat = (x, c, ear) => `<ellipse cx="${x}" cy="108" rx="22" ry="16" fill="${c}"/><circle cx="${x + 18}" cy="86" r="14" fill="${c}"/><path d="M${x + 8} 76l2-12 8 8M${x + 22} 72l6-10 2 12" fill="${c}"/><circle cx="${x + 14}" cy="85" r="2" fill="${INK}"/><circle cx="${x + 23}" cy="85" r="2" fill="${INK}"/><path d="M${x - 20} 104q-16-8-10-24" ${sk(c, 5)}/>` + (ear ? `<circle cx="${x + 26}" cy="70" r="2.5" fill="#f2a3b3"/>` : '');
      return GND() + cat(80, '#e8963c', false) + cat(200, '#e8963c', true) +
        `<g ${s.a({0: 'opacity:0;' + T(), 26: 'opacity:0;' + T(), 28: 'opacity:.8;' + T(), 42: 'opacity:.8;' + T(-120, 0), 50: 'opacity:0;' + T(-120, 0), 100: 'opacity:0'})}><g style="opacity:.6">${cat(200, 'none', false).replace(/fill="none"/g, 'fill="none" stroke="#5b4b9a" stroke-width="2" stroke-dasharray="3 3"')}</g></g>` +
        `<g ${s.a(pop(48), ORG(140, 50))}><circle cx="140" cy="50" r="14" ${fl(CL.v)}/><text x="140" y="57" font-size="18" font-weight="700" text-anchor="middle" fill="#fff">≈</text></g>` +
        `<g ${s.a(pop(54), ORG(226, 66))}><circle cx="226" cy="70" r="7" ${sk(CL.a, 2)}/></g>`;
    }},
    sometimes: {dur: 6, hl: [30, 6], end: 60, lit: '有那么几个时候', mean: '有时', draw: s => {
      const days = ['一', '二', '三', '四', '五', '六', '日'], rainy = [2, 5];
      return days.map((d, i) => { const x = 22 + i * 38, p = 6 + i * 6, r = rainy.includes(i);
        return `<rect x="${x}" y="40" width="34" height="56" rx="4" ${fs(CL.p, r ? CL.v : CL.m, r ? 2.5 : 1.5)}/><text x="${x + 17}" y="54" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>周${d}</text>` +
          `<g ${s.a(pop(p), ORG(x + 17, 74))}>${r ? `<path d="M${x + 7} 76a6 6 0 0 1 4-10 9 9 0 0 1 16 2 5 5 0 0 1 0 10h-16a4 4 0 0 1-4-2z" ${fl(CL.m, .6)}/><path d="M${x + 12} 84l-2 5M${x + 19} 84l-2 5" ${sk('#6db7e8', 2)}/>` : `<circle cx="${x + 17}" cy="74" r="7" ${fl(CL.g)}/>`}</g>`; }).join('') +
        rainy.map(i => `<g ${s.a(pop(48), ORG(39 + i * 38, 112))}><path d="M${29 + i * 38} 112a10 10 0 0 1 20 0z" ${fl(CL.v)}/><path d="M${39 + i * 38} 112v8a3 3 0 0 0 6 0" ${sk(CL.k, 1.5)}/></g>`).join('') +
        `<g ${s.a(pop(52), ORG(150, 22))}><rect x="104" y="12" width="92" height="20" rx="6" ${fl(CL.v)}/><text x="150" y="26" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">有时会下雨</text></g>`;
    }},
    survey: {dur: 6, hl: [6, 14], end: 60, lit: '从上往下全看一遍', mean: '调查', draw: s => {
      return GND() + `<path d="M40 128L56 40M72 128L56 40M44 108h24M48 88h16M52 68h8" ${sk(WOOD, 3)}/>` + kid(56, 44, CL.t, {k: .7, aL: [-8, -40], aR: [8, -40]}) +
        `<rect x="50" y="10" width="12" height="7" rx="2" ${fl(CL.k)}/>` +
        `<g ${s.a({0: R(-10), 6: R(-10), 26: R(-60), 46: R(-10), 92: R(-10), 100: R(-10)}, ORG(60, 14))}><path d="M60 14L280 120" ${sk(CL.g, 18, .18)}/></g>` +
        [110, 150, 190, 230, 270].map((x, i) => kid(x, 128, [CL.a, CL.v, CL.g, CL.t, CL.a][i], {k: .55}) + `<g ${s.a(pop(16 + i * 6), ORG(x, 80))}><circle cx="${x}" cy="80" r="6" ${fl(i % 2 ? CL.a : CL.t)}/><path d="M${x - 2.5} 80l2 2 3.5-4" ${sk('#fff', 1.6)}/></g>`).join('') +
        `<g ${s.a(pop(48), ORG(180, 34))}><rect x="140" y="14" width="80" height="40" rx="4" ${fs(CL.p, CL.m, 1.5)}/>${[0, 1, 2].map(i => `<rect x="${152 + i * 20}" y="${48 - (i + 1) * 9}" width="12" height="${(i + 1) * 9}" ${fl([CL.t, CL.a, CL.v][i])}/>`).join('')}</g>`;
    }},
    artist: {dur: 5.8, hl: [6, 46], end: 58, lit: '搞艺术的人', mean: '艺术家', draw: s => {
      const paint = (d, c, p0, p1, w = 4) => `<path d="${d}" ${sk(c, w)} ${DASH} ${s.a(drawP(p0, p1))}/>`;
      return GND() + `<path d="M176 128l12-90M240 128l-12-90" ${sk(WOOD, 4)}/><rect x="164" y="24" width="92" height="72" rx="2" ${fs('#fffdf6', CL.m, 2)}/>` +
        paint('M210 92V60', '#3f8f4f', 8, 14) + paint('M210 76q-10-2-14-10', '#3f8f4f', 14, 18, 3) +
        `<g ${s.a(pop(18), ORG(210, 46))}>${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<ellipse cx="${f1(210 + 11 * Math.cos(a * Math.PI / 180))}" cy="${f1(46 + 11 * Math.sin(a * Math.PI / 180))}" rx="6" ry="3.5" transform="rotate(${a} ${f1(210 + 11 * Math.cos(a * Math.PI / 180))} ${f1(46 + 11 * Math.sin(a * Math.PI / 180))})" fill="#f6c21c"/>`).join('')}<circle cx="210" cy="46" r="7" fill="${WOOD}"/></g>` +
        paint('M172 36q10-6 20 0', '#6db7e8', 24, 30, 3) +
        kid(120, 128, CL.v, {aR: [24, -42], armR: s.a(swing(6, 40, 12, -12, 6), shoulder(120, 128, 1)), holdR: `<path d="M144 86l14-14" ${sk(WOOD, 2.5)}/><path d="M158 72l3-3" ${sk(CL.a, 4)}/>`}) +
        `<path d="M108 66q12-10 24 0" fill="${CL.a}" style="fill:var(--accent)"/><ellipse cx="96" cy="100" rx="12" ry="8" fill="${WOOD}"/>` + [[90, 98, '#e2473a'], [98, 96, '#f6c21c'], [102, 102, '#6db7e8']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="2.5" fill="${c}"/>`).join('') +
        `<g ${s.a(pop(46), ORG(120, 100))}><rect x="112" y="94" width="16" height="11" rx="2" ${fl(CL.g)}/><text x="120" y="102.5" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">ist</text></g>`;
    }},
    conversation: {dur: 6, hl: [6, 14], end: 60, lit: '你一句我一句轮流转', mean: '交谈', draw: s => {
      const say = (p, left, t) => `<g ${s.a({0: 'opacity:0;transform:scale(.4)', [p]: 'opacity:0;transform:scale(.4)', [p + 2]: 'opacity:1;transform:scale(1)', [p + 9]: 'opacity:1;transform:scale(1)', [p + 11]: 'opacity:0;transform:scale(1)', 100: 'opacity:0'}, ORG(left ? 96 : 204, 50))}>${bubble(left ? 96 : 204, 50)}<text x="${left ? 96 : 204}" y="54" font-size="10" font-weight="700" text-anchor="middle" ${fl(left ? CL.t : CL.a)}>${t}</text></g>`;
      return GND() + kid(60, 128, CL.t) + kid(240, 128, CL.a) +
        say(6, true, '你好!') + say(17, false, '你好呀') + say(28, true, '吃了吗?') + say(39, false, '吃啦!') +
        `<g ${s.a({0: R(0), 6: R(0), 14: R(180), 17: R(180), 25: R(360), 28: R(360), 36: R(540), 39: R(540), 47: R(720), 100: R(720)}, ORG(150, 96))}><path d="M136 90a14 14 0 0 1 26-4" ${sk(CL.v, 3)}/><path d="M158 80l4 6-7 2" ${sk(CL.v, 3)}/><path d="M164 102a14 14 0 0 1-26 4" ${sk(CL.v, 3)}/><path d="M142 112l-4-6 7-2" ${sk(CL.v, 3)}/></g>`;
    }},
    importance: {dur: 5.6, hl: [20, 50], end: 58, lit: '重要的程度', mean: '重要性', draw: s => {
      return GND() + [0, 1, 2, 3].map(i => i === 2 ? '' : `<g ${s.a({0: 'opacity:1', 20: 'opacity:1', 30: 'opacity:.35', 92: 'opacity:.35', 100: 'opacity:1'})}><rect x="${40 + i * 60}" y="60" width="44" height="56" rx="3" ${fs(CL.p, CL.m, 1.5)}/><path d="M${46 + i * 60} 74h32M${46 + i * 60} 84h32M${46 + i * 60} 94h22" ${sk(CL.m, 1.5)}/></g>`).join('') +
        `<g ${s.a({0: T(0, 0, 'scale(1)'), 20: T(0, 0, 'scale(1)'), 30: T(0, -10, 'scale(1.25)'), 92: T(0, -10, 'scale(1.25)'), 100: T(0, 0, 'scale(1)')}, ORG(182, 88))}><rect x="160" y="60" width="44" height="56" rx="3" ${fs(CL.p, CL.a, 2.5)}/><path d="M166 74h32M166 84h32M166 94h22" ${sk(CL.m, 1.5)}/>` +
        `<g ${s.a(pop(18), ORG(194, 66))}><circle cx="198" cy="64" r="11" fill="#d23c2f"/><text x="198" y="69" font-size="13" font-weight="700" text-anchor="middle" fill="#fff">!</text></g></g>` +
        `<g ${s.a(pop(50), ORG(182, 30))}><rect x="152" y="20" width="60" height="20" rx="6" fill="#d23c2f"/><text x="182" y="34" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">重要!</text></g>`;
    }},
    organization: {dur: 5.8, hl: [6, 50], end: 60, lit: '组织起来的团体', mean: '组织；机构', draw: s => {
      const spots = [[150, 64, -80, 50], [90, 128, 60, -20], [150, 128, -40, -10], [210, 128, 40, -30]];
      return `<path d="M150 70v14M90 84h120M90 84v14M150 84v14M210 84v14" ${sk(CL.m, 2.5)} ${s.a(showAt(30))}/>` +
        spots.map(([x, y, dx, dy], i) => `<g ${s.a({0: T(dx, dy, 'rotate(' + (i * 20 - 30) + 'deg)'), 6: T(dx, dy, 'rotate(' + (i * 20 - 30) + 'deg)'), 26: T(0, 0, 'rotate(0deg)'), 92: T(0, 0, 'rotate(0deg)'), 100: T(dx, dy, 'rotate(' + (i * 20 - 30) + 'deg)')})}>${kid(x, y, i ? [CL.t, CL.v, CL.g][i - 1] : '#3d4a5c', {k: i ? .55 : .6})}</g>`).join('') +
        `<path d="M10 128h280" ${sk(CL.m, 2, .5)}/>` +
        `<g ${s.a(pop(50), ORG(250, 40))}><rect x="214" y="30" width="72" height="20" rx="6" ${fl(CL.v)}/><text x="250" y="44" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">一个团队</text></g>`;
    }},
    respect: {dur: 6, hl: [24, 24], end: 60, lit: '回头多看两眼', mean: '尊重；尊敬', draw: s => {
      return GND() + kid(200, 128, CL.m, {noFace: true, k: 1.05}) + `<path d="M188 70a12 12 0 0 1 24 0q-6-4-12-3t-12 3z" fill="#d8d8d8"/>` + face(200, 128, 1.05) + `<path d="M212 128V84" ${sk(WOOD, 3)}/>` +
        `<g ${s.a({0: T(), 4: T(), 20: T(196, 0), 24: T(196, 0), 28: T(196, 0), 40: T(196, 0), 92: T(196, 0), 100: T()})}>` +
        `<g ${s.a({0: 'transform:scaleX(1)', 24: 'transform:scaleX(1)', 26: 'transform:scaleX(-1)', 92: 'transform:scaleX(-1)', 100: 'transform:scaleX(1)'}, 'transform-origin:50% 50%;transform-box:fill-box')}><g ${s.a({0: R(0), 34: R(0), 40: R(28), 50: R(28), 56: R(0), 100: R(0)}, ORG(80, 128))}>${kid(80, 128, CL.t, {...walkLegs(s, 80, 128, 4, 20, 6)})}</g></g></g>` +
        `<path d="M252 60q-8-10-16 0" ${sk(CL.t, 2.5)} ${s.a(showAt(26, 40))}/><circle cx="244" cy="54" r="2" ${fl(CL.t)} ${s.a(showAt(26, 40))}/>` +
        `<g ${s.a(pop(52), ORG(236, 40))}>${heartAt(236, 40, .9)}</g>`;
    }},
    account: {dur: 6, hl: [20, 6], end: 60, lit: '把钱数清楚', mean: '账户；解释', draw: s => {
      const coin = (i) => { const p = 6 + i * 8; return `<g ${s.a({0: 'opacity:0;' + T(), [p]: 'opacity:0;' + T(), [p + 1]: 'opacity:1;' + T(), [p + 6]: 'opacity:1;' + T(80, -6 - i * 5), 92: 'opacity:1;' + T(80, -6 - i * 5), 100: 'opacity:0;' + T(80, -6 - i * 5)})}><ellipse cx="100" cy="104" rx="9" ry="3.5" ${fl(CL.g)}/></g>` +
        `<text x="100" y="80" font-size="14" font-weight="700" text-anchor="middle" ${fl(CL.a)} ${s.a(slot([0, p, p + 8], 1))}>${i + 1}</text>`; };
      return GND() + kid(70, 128, CL.t, {aR: [24, -20]}) + [0, 1, 2, 3].map(coin).join('') +
        `<rect x="210" y="46" width="70" height="56" rx="4" ${fs(CL.p, CL.t, 2)}/><rect x="210" y="46" width="70" height="14" rx="4" ${fl(CL.t)}/><text x="245" y="57" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">账户</text>` +
        ['¥0', '¥10', '¥20', '¥30', '¥40'].map((t, i) => `<text x="245" y="86" font-size="14" font-weight="700" text-anchor="middle" ${fl(CL.k)} ${s.a(i === 0 ? slot([0, 13], 0) : slot([0, 5 + i * 8, i < 4 ? 13 + i * 8 : 94], 1))}>${t}</text>`).join('');
    }},
    involve: {dur: 5.8, hl: [20, 6], end: 58, lit: '卷进去', mean: '涉及；使参与', draw: s => {
      const swirl = `<path d="M150 80m-40 0a40 16 0 1 0 80 0a30 12 0 1 0-60 0a20 8 0 1 0 40 0" ${sk(CL.v, 3)}/>`;
      return GND() + `<g ${s.a({0: R(0), 100: R(360)}, ORG(150, 80) + ';animation-timing-function:linear', 1.6)}>${swirl}</g>` +
        [[124, 72, CL.a], [176, 86, CL.g]].map(([x, y, c], i) => `<g ${s.a({0: R(0), 100: R(360)}, ORG(150, 80) + ';animation-timing-function:linear', 1.6)}><circle cx="${x}" cy="${y}" r="6" ${fl(c)}/></g>`).join('') +
        `<g ${s.a({0: 'opacity:1;' + T(0, 0, 'rotate(0deg) scale(1)'), 18: 'opacity:1;' + T(0, 0, 'rotate(0deg) scale(1)'), 26: 'opacity:1;' + T(-30, -20, 'rotate(-40deg) scale(.9)'), 40: 'opacity:1;' + T(-100, -30, 'rotate(-300deg) scale(.6)'), 46: 'opacity:1;' + T(-110, -40, 'rotate(-420deg) scale(.55)'), 92: 'opacity:1;' + T(-110, -40, 'rotate(-420deg) scale(.55)'), 100: 'opacity:0;' + T(-110, -40, 'rotate(-420deg) scale(.55)')})}>${kid(256, 128, CL.t, {noFace: true})}${face(256, 128, 1, 'sad')}</g>` +
        `<g ${s.a(showAt(14, 30))}><path d="M232 76h-14M234 88h-18M232 100h-14" ${sk(CL.m, 2.5)}/></g>`;
    }},
    usually: {dur: 6, hl: [6, 50], end: 60, lit: '照常地', mean: '通常', draw: s => {
      const days = ['一', '二', '三', '四', '五'];
      return days.map((d, i) => { const y = 18 + i * 22, p = 6 + i * 8;
        return `<text x="30" y="${y + 13}" font-size="10" font-weight="700" ${fl(CL.m)}>周${d}</text><path d="M60 ${y + 9}h200" ${sk(CL.m, 1.5, .4)}/>` +
          `<g ${s.a(pop(p), ORG(110, y + 9))}><circle cx="110" cy="${y + 9}" r="8" ${fs(CL.p, CL.k, 1.8)}/><path d="M110 ${y + 9}v-5M110 ${y + 9}h4" ${sk(CL.k, 1.5)}/><text x="132" y="${y + 13}" font-size="9" font-weight="700" ${fl(CL.t)}>7:00 起床</text></g>`; }).join('') +
        `<path d="M110 22V114" ${sk(CL.a, 2)} stroke-dasharray="3 3" ${s.a(fadeP(46, 50))}/>` +
        `<g ${s.a(pop(50), ORG(238, 70))}><rect x="204" y="58" width="70" height="24" rx="6" ${fl(CL.a)}/><text x="239" y="74" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">通常如此</text></g>`;
    }},
    // ---------- 第十五批 ----------
    workplace: {dur: 5.8, hl: [6, 20], end: 58, lit: '工作的地方', mean: '工作场所', draw: s => {
      const desk = (x, c, dl) => `<rect x="${x - 26}" y="96" width="52" height="6" fill="${WOOD}"/><path d="M${x - 22} 102v26M${x + 22} 102v26" ${sk(WOOD, 3)}/><rect x="${x - 10}" y="78" width="22" height="16" rx="2" ${fl(CL.k, .85)}/><rect x="${x - 8}" y="80" width="18" height="12" fill="#1e3a2f"/>` +
        kid(x - 22, 112, c, {k: .7, aR: [16, -20], armR: s.a(swing(0, 100, 30, -8, 4), shoulder(x - 22, 112, 1, .7), .9 + dl)});
      return GND() + `<rect x="20" y="14" width="260" height="58" ${fl(CL.m, .12)}/>` + [40, 100, 160, 220].map(x => `<rect x="${x}" y="22" width="40" height="30" rx="2" fill="#bfe1f2"/>`).join('') +
        desk(110, CL.v, 0) + desk(210, CL.a, .2) +
        `<g ${s.a(move([[6, -40, 0], [20, 0, 0]]))}>${kid(40, 128, CL.t, {aR: [14, -24], ...walkLegs(s, 40, 128, 6, 20, 4)})}<rect x="52" y="104" width="14" height="10" rx="2" fill="${WOOD}"/></g>` +
        `<circle cx="266" cy="34" r="10" ${fs(CL.p, CL.k, 2)}/><path d="M266 34v-6M266 34h4" ${sk(CL.k, 1.5)}/>` +
        `<g ${s.a(pop(40), ORG(150, 136))}><rect x="122" y="128" width="56" height="18" rx="5" ${fl(CL.t)}/><text x="150" y="141" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">职场</text></g>`;
    }},
    achievement: {dur: 5.8, hl: [6, 46], end: 58, lit: '实现了的东西', mean: '成就', draw: s => {
      return GND() + `<rect x="110" y="96" width="40" height="32" ${fl(CL.g, .8)}/><rect x="70" y="108" width="40" height="20" ${fl(CL.m, .5)}/><rect x="150" y="112" width="40" height="16" ${fl(WOOD, .6)}/><text x="130" y="118" font-size="14" font-weight="700" text-anchor="middle" fill="#fff">1</text>` +
        `<g ${s.a(move([[6, -100, 32], [18, -60, 32], [26, -30, 0], [32, 0, 0]]))}>${kid(130, 96, CL.t, {aL: [-14, -46], aR: [14, -46]})}</g>` +
        `<g ${s.a({0: 'opacity:0;' + T(0, -40), 34: 'opacity:0;' + T(0, -40), 36: 'opacity:1;' + T(0, -40), 44: 'opacity:1;' + T(), 92: 'opacity:1;' + T(), 100: 'opacity:0;' + T()})}><path d="M124 58l6 10 6-10" ${sk('#d23c2f', 3)}/><circle cx="130" cy="72" r="6" ${fl(CL.g)}/><text x="130" y="75" font-size="7" font-weight="700" text-anchor="middle" fill="#fff">★</text></g>` +
        `<rect x="220" y="40" width="60" height="6" fill="${WOOD}"/><rect x="220" y="80" width="60" height="6" fill="${WOOD}"/>` +
        [[230, 40, 0], [252, 40, 1], [232, 80, 2], [256, 80, 3]].map(([x, y, i]) => `<g ${s.a(pop(40 + i * 4), 'transform-origin:50% 100%;transform-box:fill-box')}>${i % 2 ? `<path d="M${x - 6} ${y}h14v-14l-7-4-7 4z" ${fl(CL.v)}/>` : `<path d="M${x - 6} ${y - 18}h12v6a6 6 0 0 1-12 0zM${x - 2} ${y - 6}h4v6h-4z" ${fl(CL.g)}/>`}</g>`).join('') +
        [[90, 30, CL.a], [170, 24, CL.v], [110, 44, CL.t], [156, 46, CL.g]].map(([x, y, c], i) => `<rect x="${x}" y="${y}" width="6" height="3" ${fl(c)} ${s.a({0: 'opacity:0;' + T(0, -10), [44 + i]: 'opacity:0;' + T(0, -10), [45 + i]: 'opacity:1;' + T(0, -10), [60 + i]: 'opacity:1;' + T(i % 2 ? 6 : -6, 20, 'rotate(160deg)'), 92: 'opacity:1;' + T(i % 2 ? 6 : -6, 20, 'rotate(160deg)'), 100: 'opacity:0;' + T(i % 2 ? 6 : -6, 20, 'rotate(160deg)')})}/>`).join('');
    }},
    contribute: {dur: 6, hl: [30, 6], end: 60, lit: '大家一起给', mean: '贡献', draw: s => {
      const xs = [40, 90, 210, 260];
      return GND() + `<rect x="128" y="88" width="44" height="40" rx="3" ${fl(CL.a, .85)}/><rect x="140" y="88" width="20" height="4" rx="2" ${fl(CL.k, .6)}/>${heartAt(150, 104, .7, '#fff')}` +
        xs.map((x, i) => { const p = 6 + i * 8, dx = 150 - x;
          return kid(x, 128, [CL.t, CL.v, CL.g, CL.t][i], {k: .8, aR: [12 * Math.sign(dx), -36]}) + `<g ${s.a({0: 'opacity:0;' + T(), [p]: 'opacity:0;' + T(), [p + 1]: 'opacity:1;' + T(), [p + 5]: 'opacity:1;' + T(f1(dx / 2), -34), [p + 9]: 'opacity:1;' + T(dx - 10 * Math.sign(dx), 2), [p + 10]: 'opacity:0;' + T(dx - 10 * Math.sign(dx), 2), 100: 'opacity:0'})}><circle cx="${x + 10 * Math.sign(dx)}" cy="88" r="5" ${fl(CL.g)}/></g>`; }).join('') +
        `<g ${s.a({0: 'opacity:0;transform:scale(.5)', 40: 'opacity:0;transform:scale(.5)', 46: 'opacity:1;transform:scale(1.3)', 52: 'opacity:1;transform:scale(1)', 92: 'opacity:1;transform:scale(1)', 100: 'opacity:0;transform:scale(1)'}, ORG(150, 70))}>${heartAt(150, 64, 1.4)}</g>` +
        `<g ${s.a(pop(50), ORG(150, 24))}><rect x="116" y="14" width="68" height="20" rx="6" ${fl(CL.a)}/><text x="150" y="28" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">一起出力</text></g>`;
    }},
    fountain: {dur: 5, hl: [6, 50], end: 58, lit: '水不断涌出的地方', mean: '喷泉；源泉', draw: s => {
      const jet = (d, dl) => `<path d="${d}" ${sk('#6db7e8', 3.5)} stroke-dasharray="6 6" ${s.a({0: 'stroke-dashoffset:0', 100: 'stroke-dashoffset:-24'}, `animation-timing-function:linear;animation-delay:${dl}s`, .6)}/>`;
      return GND() + `<ellipse cx="150" cy="120" rx="80" ry="10" fill="#6db7e8" opacity=".55"/><path d="M70 120v8h160v-8" ${fl(CL.m, .55)}/>` +
        `<rect x="144" y="70" width="12" height="50" ${fl(CL.m, .6)}/><path d="M124 70h52q-4 10-26 10t-26-10z" ${fl(CL.m, .6)}/>` +
        `<g ${s.a(growY(4, 16), 'transform-origin:50% 100%;transform-box:fill-box')}>` + jet('M150 70V24', 0) + jet('M150 30q-30-8-50 40', .1) + jet('M150 30q30-8 50 40', .2) + jet('M150 40q-16 0-26 30', .3) + jet('M150 40q16 0 26 30', .15) + `</g>` +
        [0, .4, .8].map(dl => `<ellipse cx="150" cy="120" rx="10" ry="2" ${sk('#fff', 1.5)} ${s.a({0: 'opacity:.8;transform:scale(1)', 100: 'opacity:0;transform:scale(5)'}, ORG(150, 120) + `;animation-delay:${dl}s`, 1.2)}/>`).join('') +
        `<g ${s.a(move([[30, -80, -20], [50, 0, 0]]))}><path d="M210 80q5-6 10 0q5-6 10 0" ${sk(INK, 2)}/></g>`;
    }},
    professional: {dur: 6, hl: [6, 50], end: 60, lit: '内行的、本职的', mean: '专业的；职业的', draw: s => {
      const hat = (i, inner) => `<g ${s.a(slot([0, 6 + i * 12, 18 + i * 12], 1))}>${inner}</g>`;
      return GND() + kid(150, 128, '#3d4a5c', {k: 1.1}) +
        hat(0, `<path d="M136 66q0-14 14-14t14 14z" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M140 56q-6-10 4-12t6 4q2-8 8-4t-2 10" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><text x="104" y="50" font-size="10" font-weight="700" ${fl(CL.m)}>厨师</text>`) +
        hat(1, `<path d="M136 64h28l-4-8h-20z" fill="#2f4f8f"/><path d="M134 64h32" ${sk('#2f4f8f', 3)}/><circle cx="150" cy="59" r="2.5" fill="#f2b632"/><text x="104" y="50" font-size="10" font-weight="700" ${fl(CL.m)}>飞行员</text>`) +
        hat(2, `<path d="M140 96v-8a10 10 0 0 1 20 0v8" ${sk(CL.m, 2.5)}/><circle cx="160" cy="100" r="4" ${fl(CL.m)}/><text x="104" y="50" font-size="10" font-weight="700" ${fl(CL.m)}>医生</text>`) +
        `<g ${s.a(showAt(42))}><path d="M150 80l-3 4 3 12 3-12z" fill="#c0392b"/></g>` +
        `<g ${s.a(pop(50), ORG(220, 60))}><rect x="196" y="42" width="48" height="36" rx="3" ${fs('#f4e6c8', WOOD, 2)}/><circle cx="232" cy="68" r="5" fill="#d23c2f"/><path d="M204 52h30M204 58h22" ${sk(CL.m, 1.5)}/><text x="220" y="34" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.a)}>专业</text></g>`;
    }},
    action: {dur: 5.4, hl: [10, 50], end: 58, lit: '行动起来', mean: '行动', draw: s => {
      return GND() + `<g ${s.a({0: R(-30), 8: R(-30), 12: R(0), 92: R(0), 100: R(-30)}, ORG(52, 48))}><rect x="30" y="38" width="64" height="12" rx="2" fill="${INK}"/><path d="M38 38l8 12M54 38l8 12M70 38l8 12" ${sk('#fff', 3)}/></g>` +
        `<rect x="30" y="50" width="64" height="40" rx="2" fill="${INK}"/><text x="62" y="72" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">ACTION</text><text x="62" y="84" font-size="7" text-anchor="middle" fill="#aaa">场 1 · 镜 1</text>` +
        `<g ${s.a(showAt(12, 22))}>${burst(52, 44, 16).replace('<path ', `<path ${sk(CL.g, 2.5)} `)}</g>` +
        `<g ${s.a({0: 'opacity:1;' + T(), 12: 'opacity:1;' + T(), 20: 'opacity:1;' + T(40, -24), 28: 'opacity:1;' + T(80, 0), 36: 'opacity:1;' + T(120, -24), 44: 'opacity:1;' + T(160, 0), 92: 'opacity:1;' + T(160, 0), 100: 'opacity:1;' + T()})}>${kid(110, 128, CL.a, {aL: [-17, -44], aR: [17, -44], ...walkLegs(s, 110, 128, 12, 44, 8)})}</g>` +
        `<text x="150" y="30" font-size="16" font-weight="700" text-anchor="middle" ${fl(CL.a)} ${s.a(pop(10), ORG(150, 24))}>开拍!</text>`;
    }},
    anxiety: {dur: 5.8, hl: [10, 50], end: 58, lit: '心被揪紧', mean: '焦虑', draw: s => {
      const squeeze = {0: 'transform:scale(1,1)', 10: 'transform:scale(1,1)', 100: 'transform:scale(1,1)'}; for (let i = 0; i < 8; i++) squeeze[14 + i * 5] = `transform:scale(${i % 2 ? .95 : .72},${i % 2 ? 1 : 1.08})`; squeeze[56] = 'transform:scale(.75,1.06)'; squeeze[92] = 'transform:scale(.75,1.06)';
      return GND() + kid(80, 128, CL.t, {noFace: true, aR: [4, -46]}) + face(80, 128, 1, 'sad') + `<path d="M92 66q-3 5 0 7M68 62q-3 5 0 7" ${sk('#6db7e8', 2.5)}/>` +
        `<g ${s.a(squeeze, ORG(190, 70))}>${heartAt(190, 66, 2.4, '#e2473a')}</g>` +
        `<g ${s.a({0: 'opacity:0', 10: 'opacity:0', 14: 'opacity:1', 92: 'opacity:1', 100: 'opacity:0'})}><path d="M162 62q28 10 56 0" ${sk(WOOD, 4)}/><path d="M162 62l-14-8M218 62l14-8" ${sk(WOOD, 4)}/></g>` +
        `<circle cx="256" cy="30" r="14" ${fs(CL.p, CL.k, 2)}/><g ${s.a({0: R(0), 100: R(720)}, ORG(256, 30) + ';animation-timing-function:linear', 2)}><path d="M256 30V20" ${sk(CL.a, 2)}/></g>` +
        `<g ${s.a(pop(50), ORG(190, 128))}><rect x="160" y="120" width="60" height="20" rx="6" ${fl(CL.v)}/><text x="190" y="134" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">好紧张…</text></g>`;
    }},
    consequence: {dur: 6, hl: [10, 20, 50], end: 60, lit: '紧跟着来的', mean: '后果', draw: s => {
      return GND() + `<rect x="200" y="20" width="80" height="108" ${fl(CL.g, .35)}/><rect x="220" y="40" width="40" height="34" fill="#bfe1f2" style="stroke:var(--ink3);stroke-width:2px"/>` +
        `<g ${s.a(showAt(30))}><path d="M240 57l-14-12M240 57l16-10M240 57l-10 16M240 57l14 12M240 57l2-18" ${sk('#fff', 2.5)}/><path d="M240 57l-14-12M240 57l16-10M240 57l-10 16M240 57l14 12M240 57l2-18" ${sk(CL.m, 1)}/></g>` +
        kid(60, 128, CL.t, {noFace: true, legR: s.a({0: R(0), 8: R(0), 11: R(-50), 16: R(0), 100: R(0)}, hip(60, 128, 1))}) + `<g ${s.a(hideAt(32))}>${face(60, 128)}</g><g ${s.a(showAt(32))}>${face(60, 128, 1, 'sad')}</g>` +
        `<g ${s.a({0: 'opacity:1;' + T(), 10: 'opacity:1;' + T(), 20: 'opacity:1;' + T(90, -60), 30: 'opacity:1;' + T(170, -66), 32: 'opacity:0;' + T(170, -66), 98: 'opacity:0;' + T(170, -66), 99: 'opacity:0;' + T(), 100: 'opacity:1;' + T()})}><circle cx="74" cy="122" r="6" ${fl(CL.a)}/></g>` +
        `<g ${s.a({0: 'opacity:0;' + T(0, 20), 38: 'opacity:0;' + T(0, 20), 44: 'opacity:1;' + T(), 92: 'opacity:1;' + T(), 100: 'opacity:0;' + T()})}><circle cx="240" cy="88" r="10" fill="${SKIN}"/><path d="M230 86a10 10 0 0 1 20 0q-5-4-10-3t-10 3z" fill="${HAIR}"/><path d="M234 84l4 2M246 84l-4 2M236 94q4-3 8 0" ${sk(INK, 1.5)}/><text x="262" y="96" font-size="14" font-weight="700" ${fl(CL.a)}>!!</text></g>` +
        `<path d="M86 104Q150 70 220 70" ${sk(CL.v, 2)} stroke-dasharray="3 5" ${s.a(fadeP(12, 26))}/>`;
    }},
    demand: {dur: 5.8, hl: [20, 6], end: 58, lit: '强硬地要', mean: '需求；要求', draw: s => {
      return GND() + `<rect x="210" y="60" width="70" height="68" ${fl(CL.m, .35)}/><path d="M206 60h78l-8-14h-62z" fill="#d23c2f"/><text x="245" y="96" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>商店</text>` +
        [40, 80, 120, 160].map((x, i) => `<g ${s.a({0: T(), [6 + i * 4]: T(), [10 + i * 4]: T(0, -4), 100: T()})}>${kid(x, 128, [CL.t, CL.v, CL.g, CL.a][i], {k: .7, armR: s.a({0: R(0), [6 + i * 4]: R(0), [10 + i * 4]: R(-150), 92: R(-150), 100: R(0)}, shoulder(x, 128, 1, .7))})}</g>`).join('') +
        `<g ${s.a(pop(18), ORG(100, 40))}><rect x="66" y="28" width="68" height="22" rx="8" ${fl(CL.a)}/><text x="100" y="43" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">我要! 我要!</text></g>` +
        `<g ${s.a(pop(40), ORG(244, 28))}><rect x="214" y="6" width="60" height="40" rx="3" ${fs(CL.p, CL.m, 1.5)}/><path d="M220 40l14-8 10 4 16-22" ${sk(CL.a, 2.5)}/><text x="244" y="18" font-size="7" font-weight="700" text-anchor="middle" ${fl(CL.m)}>需求 ↑</text></g>`;
    }},
    meaning: {dur: 5.6, hl: [20, 50], end: 58, lit: '它所表示的意思', mean: '意义；含义', draw: s => {
      return GND() + `<rect x="30" y="44" width="80" height="44" rx="6" ${fs(CL.p, CL.v, 2.5)}/><text x="70" y="72" font-size="16" font-weight="700" text-anchor="middle" font-family="Georgia,serif" ${fl(CL.k)}>apple</text>` +
        `<text x="70" y="36" font-size="16" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(showAt(2, 20))}>?</text>` +
        `<path d="M116 66H174" ${sk(CL.t, 3)} ${DASH} ${s.a(drawP(20, 30))}/><path d="M166 58l8 8-8 8" ${sk(CL.t, 3)} ${s.a(showAt(29))}/>` +
        `<g ${s.a(pop(30), ORG(220, 66))}><circle cx="220" cy="70" r="22" fill="#e2473a"/><path d="M220 48q2-10 8-12" ${sk(WOOD, 3)}/><path d="M222 46q10-8 16 0q-10 4-16 0z" fill="#5fae6a"/><path d="M208 62a12 12 0 0 1 6-6" ${sk('#fff', 3, .7)}/></g>` +
        `<g ${s.a(pop(46), ORG(220, 116))}><rect x="190" y="106" width="60" height="20" rx="6" ${fl(CL.t)}/><text x="220" y="120" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">= 苹果</text></g>`;
    }},
    modern: {dur: 6, hl: [6, 40], end: 60, lit: '当下的方式', mean: '现代的', draw: s => {
      const old = `<g ${s.a({0: 'opacity:1', 20: 'opacity:1', 30: 'opacity:.25', 92: 'opacity:.25', 100: 'opacity:1'})}><rect x="40" y="80" width="56" height="34" rx="6" fill="#7a5a3a"/><circle cx="68" cy="97" r="11" fill="#d9c2a0"/><path d="M44 76q24-16 48 0" ${sk(INK, 5)}/><rect x="40" y="132" width="70" height="0"/><text x="68" y="132" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>过去</text></g>`;
      return GND() + old + `<path d="M112 98h60" ${sk(CL.m, 3)} ${DASH} ${s.a(drawP(22, 34))}/><path d="M164 90l8 8-8 8" ${sk(CL.m, 3)} ${s.a(showAt(33))}/>` +
        `<g ${s.a(pop(36), 'transform-origin:50% 100%;transform-box:fill-box')}><rect x="200" y="56" width="34" height="62" rx="6" fill="${INK}"/><rect x="203" y="62" width="28" height="48" rx="2" fill="#6db7e8"/><path d="M208 70h18M208 78h12M208 86h16" ${sk('#fff', 2)}/><circle cx="217" cy="114" r="2" fill="#888"/></g>` +
        `<g ${s.a(showAt(40))}><text x="217" y="132" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.t)}>现在</text>${sparkle(248, 56, 6)}</g>`;
    }},
    nation: {dur: 6, hl: [6, 40], end: 60, lit: '生在同一片土地上的人', mean: '国家；民族', draw: s => {
      const spots = [[60, 124], [92, 120], [124, 124], [176, 124], [208, 120], [240, 124], [110, 108], [190, 108]];
      return `<path d="M0 128q80-30 150-24t150 24z" fill="#e6c98a"/>` + GND() +
        spots.map(([x, y], i) => `<g ${s.a(pop(6 + i * 3.5), 'transform-origin:50% 100%;transform-box:fill-box')}>${kid(x, y, [CL.t, CL.v, CL.a, CL.g][i % 4], {k: .45})}</g>`).join('') +
        `<path d="M150 104V36" ${sk(CL.k, 2.5)} ${s.a(growY(34, 42), 'transform-origin:50% 100%;transform-box:fill-box')}/>` +
        `<g ${s.a(pop(42), ORG(150, 42))}><g ${s.a({0: 'transform:skewY(0deg)', 50: 'transform:skewY(-8deg)', 100: 'transform:skewY(0deg)'}, 'transform-origin:0% 50%;transform-box:fill-box', 1.2)}><rect x="150" y="36" width="40" height="26" fill="#d23c2f"/><path d="M160 42l2 4 4 0-3 2.5 1 4-4-2.5-4 2.5 1-4-3-2.5 4 0z" fill="#f6d34a"/></g></g>` +
        `<ellipse cx="150" cy="110" rx="130" ry="26" ${sk(CL.a, 2.5)} stroke-dasharray="6 6" ${s.a(pop(48), ORG(150, 110))}/>`;
    }},
    // ---------- 第十六批 ----------
    position: {dur: 5.6, hl: [10, 46], end: 58, lit: '放下去的地方', mean: '位置；职位', draw: s => {
      let board = ''; for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) board += `<rect x="${40 + c * 28}" y="${20 + r * 22}" width="28" height="22" ${(r + c) % 2 ? fl(WOOD, .7) : fl('#f4e6c8')}/>`;
      return board + `<rect x="152" y="64" width="28" height="22" ${sk(CL.a, 3)} ${s.a(pop(30), ORG(166, 75))}/>` +
        `<g ${s.a({0: 'opacity:0;' + T(-110, -50), 6: 'opacity:1;' + T(-110, -50), 24: 'opacity:1;' + T(0, -18), 32: 'opacity:1;' + T(0, 0), 92: 'opacity:1;' + T(0, 0), 100: 'opacity:0;' + T(0, 0)})}><path d="M156 82h20l-3-6h-14zM160 76h12l-2-10h-8zM162 66a4 4 0 1 1 8 0z" fill="${INK}"/></g>` +
        `<g ${s.a(pop(46), ORG(166, 136))}><rect x="130" y="128" width="72" height="18" rx="5" ${fl(CL.a)}/><text x="166" y="141" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">放在这个位置</text></g>`;
    }},
    reflect: {dur: 5.8, hl: [30, 20, 50], end: 60, lit: '光弯回来', mean: '反射；反思', draw: s => {
      return GND() + `<rect x="226" y="20" width="14" height="108" rx="3" fill="#bfe1f2" style="stroke:var(--ink3);stroke-width:2px"/><path d="M229 30l6-6M229 46l8-8" ${sk('#fff', 2)}/>` +
        `<circle cx="40" cy="40" r="12" ${fl(CL.g)}/>` + rays(40, 40, 16, 22, 8).replace('<path ', `<path ${sk(CL.g, 2.5)} `) +
        `<path d="M50 48L226 84" ${sk(CL.g, 3)} ${DASH} ${s.a(drawP(6, 22))}/><path d="M226 84L110 110" ${sk(CL.g, 3)} ${DASH} ${s.a(drawP(22, 34))}/>` +
        `<g ${s.a(showAt(20, 30))}>${burst(226, 84, 12).replace('<path ', `<path ${sk(CL.g, 2)} `)}</g>` +
        kid(100, 128, CL.t, {noFace: true}) + `<g ${s.a(hideAt(36))}>${face(100, 128)}</g><g ${s.a(showAt(36))}>${face(100, 128, 1, 'sad')}</g>` +
        `<g ${s.a(pop(46), ORG(150, 40))}><path d="M130 50a10 10 0 0 1 8-16 14 14 0 0 1 26-2 12 12 0 0 1 4 20z" ${fs(CL.p, CL.m, 2)}/><text x="150" y="46" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.v)}>想一想…</text></g>`;
    }},
    cognitive: {dur: 5.8, hl: [6, 20, 50], end: 60, lit: '和「知道」有关的', mean: '认知的', draw: s => {
      const shapes = [[`<circle cx="0" cy="0" r="10" ${fl(CL.a)}/>`, 80], [`<path d="M0 -11l11 19H-11z" ${fl(CL.t)}/>`, 150], [`<rect x="-10" y="-10" width="20" height="20" ${fl(CL.v)}/>`, 220]];
      const order = [2, 0, 1];
      return GND() + shapes.map(([, x]) => `<rect x="${x - 16}" y="96" width="32" height="26" rx="3" ${fl(CL.m, .3)}/>`).join('') +
        `<circle cx="80" cy="109" r="10" ${sk(CL.m, 2)} stroke-dasharray="3 3"/><path d="M150 98l11 19h-22z" ${sk(CL.m, 2)} stroke-dasharray="3 3"/><rect x="210" y="99" width="20" height="20" ${sk(CL.m, 2)} stroke-dasharray="3 3"/>` +
        shapes.map(([art, x], i) => { const p = 14 + order.indexOf(i) * 10, sx = 100 + order.indexOf(i) * 50;
          return `<g ${s.a({0: 'opacity:0;' + T(sx, 40), [p - 6]: 'opacity:0;' + T(sx, 40), [p - 4]: 'opacity:1;' + T(sx, 40), [p + 6]: 'opacity:1;' + T(x, 109), 92: 'opacity:1;' + T(x, 109), 100: 'opacity:0;' + T(x, 109)})}>${art}</g>` +
            `<g ${s.a(pop(p + 6), ORG(x, 84))}><circle cx="${x}" cy="84" r="6" ${fl(CL.t)}/><path d="M${x - 3} 84l2 2 4-4" ${sk('#fff', 1.6)}/></g>`; }).join('') +
        `<g ${s.a(pop(4), ORG(150, 30))}><path d="M136 30a10 10 0 0 1 8-14 10 10 0 0 1 14 0 10 10 0 0 1 6 14 8 8 0 0 1-8 10h-12a8 8 0 0 1-8-10z" fill="#f2a3b3"/><path d="M146 22q4 6-2 10M156 20q-2 8 4 10" ${sk('#c76b80', 1.6)}/></g>`;
    }},
    connect: {dur: 5.4, hl: [10, 22], end: 58, lit: '连到一起', mean: '连接', draw: s => {
      return GND() + `<path d="M10 88h70" ${sk(INK, 4)}/><path d="M290 88h-70" ${sk(INK, 4)}/>` +
        `<g ${s.a({0: T(), 10: T(), 22: T(36, 0), 92: T(36, 0), 100: T()})}><rect x="80" y="78" width="26" height="20" rx="4" ${fl(CL.m)}/><path d="M106 83h10M106 93h10" ${sk(CL.g, 3)}/></g>` +
        `<g ${s.a({0: T(), 10: T(), 22: T(-36, 0), 92: T(-36, 0), 100: T()})}><rect x="194" y="76" width="26" height="24" rx="4" ${fl(CL.m)}/><rect x="186" y="80" width="8" height="16" rx="2" ${fl(CL.k, .5)}/></g>` +
        `<g ${s.a(showAt(22, 30))}>${burst(150, 88, 16).replace('<path ', `<path ${sk(CL.g, 2.5)} `)}</g>` +
        `<path d="M10 88h70M290 88h-70" ${sk(CL.g, 2)} stroke-dasharray="4 8" ${s.a({0: 'opacity:0;stroke-dashoffset:0', 24: 'opacity:0;stroke-dashoffset:0', 26: 'opacity:1;stroke-dashoffset:0', 92: 'opacity:1;stroke-dashoffset:-60', 100: 'opacity:0;stroke-dashoffset:-60'})}/>` +
        `<path d="M138 40a12 12 0 1 1 24 0c0 6-4 7-4 13h-16c0-6-4-7-4-13z" ${fl(CL.m, .35)}/><g ${s.a(showAt(28))}><path d="M138 40a12 12 0 1 1 24 0c0 6-4 7-4 13h-16c0-6-4-7-4-13z" ${fl(CL.g)}/><path d="M150 18v-6M132 26l-4-4M168 26l4-4" ${sk(CL.g, 2.5)}/></g><path d="M142 57h16" ${sk(CL.k, 2.5)}/>`;
    }},
    creative: {dur: 5.8, hl: [10, 50], end: 60, lit: '能创造出新东西的', mean: '有创造力的', draw: s => {
      const idea = (x, y, art, p) => `<g ${s.a(moveIn([[p, 150 - x, 60 - y, 'scale(.3)'], [p + 8, 0, 0, 'scale(1)']]), ORG(x, y))}>${art}</g>`;
      return GND() + kid(150, 128, CL.v) +
        `<g ${s.a(pop(8), ORG(150, 50))}><path d="M142 50a8 8 0 1 1 16 0c0 4-3 5-3 9h-10c0-4-3-5-3-9z" ${fl(CL.g)}/><path d="M150 34v-4M137 40l-3-3M163 40l3-3" ${sk(CL.g, 2)}/></g>` +
        idea(60, 50, `<path d="M60 34l8 16h-16z" ${fl(CL.a)}/><rect x="56" y="50" width="8" height="12" ${fl(CL.m)}/><path d="M56 62l-4 6M64 62l4 6" ${sk(CL.g, 2)}/>`, 14) +
        idea(240, 54, `<rect x="230" y="44" width="20" height="18" rx="3" ${fl(CL.m)}/><circle cx="236" cy="52" r="2.5" ${fl(CL.g)}/><circle cx="244" cy="52" r="2.5" ${fl(CL.g)}/><path d="M240 44v-6" ${sk(CL.m, 2)}/>`, 22) +
        idea(80, 100, `<path d="M70 100l10-10 10 10-10 10z" ${fl(CL.t)}/>`, 30) +
        idea(224, 100, `<circle cx="224" cy="100" r="10" fill="none" style="stroke:var(--accent);stroke-width:3px;stroke-dasharray:4 3"/>`, 38) +
        `<g ${s.a(pop(48), ORG(150, 18))}><rect x="112" y="8" width="76" height="20" rx="6" ${fl(CL.v)}/><text x="150" y="22" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">点子真多!</text></g>`;
    }},
    engage: {dur: 6, hl: [10, 26], end: 60, lit: '许诺投入', mean: '参与；订婚', draw: s => {
      return GND() + kid(90, 128, CL.t, {aR: [20, -30]}) + kid(210, 128, CL.a, {aL: [-20, -30]}) +
        `<g ${s.a(pop(8), ORG(132, 96))}><rect x="120" y="92" width="24" height="12" rx="2" ${fl('#7a2e2e')}/></g>` +
        `<g ${s.a({0: R(0), 14: R(0), 20: R(-110), 92: R(-110), 100: R(0)}, ORG(120, 92))}><rect x="120" y="86" width="24" height="7" rx="2" ${fl('#9a3e3e')}/></g>` +
        `<g ${s.a(pop(20), ORG(132, 86))}><circle cx="132" cy="86" r="5" ${sk(CL.g, 2)}/><path d="M130 80l2-4 2 4z" fill="#bfe1f2"/></g>` +
        `<g ${s.a(pop(26), ORG(160, 44))}>${bubble(160, 44)}<text x="160" y="48" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.t)}>我保证</text></g>` +
        `<g ${s.a(pop(46), ORG(150, 20))}>${heartAt(150, 20, 1.1)}</g>`;
    }},
    explore: {dur: 6, hl: [6, 14], end: 60, lit: '边喊边四处搜寻', mean: '探索', draw: s => {
      const echo = dl => `<path d="M100 74q8 10 0 20" ${sk(CL.t, 2.5)} ${s.a({0: 'opacity:0;' + T(), 15: 'opacity:1;' + T(), 85: 'opacity:.3;' + T(110), 100: 'opacity:0;' + T(120)}, `animation-delay:${dl}s;animation-timing-function:linear`, 1.4)}/>`;
      return `<path d="M170 128V60q0-40 60-40t60 40v68z" fill="#5a4a3a"/><path d="M190 128V70q0-26 40-26t40 26v58z" fill="#1d1712"/>` + GND() +
        `<g ${s.a(move([[30, 0, 0], [56, 60, 0]]))}>${kid(80, 128, CL.g, {aR: [16, -36], ...walkLegs(s, 80, 128, 30, 56, 6)})}<path d="M66 70h28l-4-8h-20z" fill="${WOOD}"/>` +
        `<path d="M96 92v10" ${sk(CL.k, 2)}/><rect x="91" y="102" width="10" height="12" rx="2" fill="#f2b632"/><circle cx="96" cy="108" r="12" fill="#f6d34a" opacity=".3"/></g>` +
        `<g ${s.a(showAt(10, 30))}>${echo(0)}${echo(.45)}${echo(.9)}<text x="110" y="64" font-size="12" font-weight="700" ${fl(CL.t)}>喂~</text></g>` +
        `<text x="236" y="96" font-size="22" font-weight="700" text-anchor="middle" fill="#f2b632" ${s.a(pop(40), ORG(236, 88))}>?</text>`;
    }},
    realize: {dur: 6, hl: [30, 20], end: 60, lit: '让它变成真的', mean: '实现；意识到', draw: s => {
      return GND() + kid(60, 128, CL.t) + `<circle cx="80" cy="64" r="3" ${fl(CL.m, .5)}/><circle cx="92" cy="56" r="4.5" ${fl(CL.m, .5)}/>` +
        `<g ${s.a({0: 'opacity:1', 26: 'opacity:1', 32: 'opacity:0', 94: 'opacity:0', 100: 'opacity:1'})}><path d="M104 50a14 14 0 0 1 10-22 22 22 0 0 1 40-6 18 18 0 0 1 34 6 14 14 0 0 1 4 28h-80a10 10 0 0 1-8-6z" ${fs(CL.p, CL.m, 2)}/>` +
        `<path d="M136 46l16-14 16 14v14h-32z" fill="none" style="stroke:var(--ink3);stroke-width:2px;stroke-dasharray:3 3"/></g>` +
        `<g ${s.a({0: 'opacity:0;' + T(-60, -56, 'scale(.5)'), 24: 'opacity:0;' + T(-60, -56, 'scale(.5)'), 30: 'opacity:1;' + T(-60, -56, 'scale(.5)'), 44: 'opacity:1;' + T(0, 0, 'scale(1)'), 92: 'opacity:1;' + T(0, 0, 'scale(1)'), 100: 'opacity:0;' + T(0, 0, 'scale(1)')}, 'transform-origin:50% 100%;transform-box:fill-box')}>` +
        `<path d="M184 128V88l32-28 32 28v40z" fill="#c8664a"/><path d="M176 90l40-36 40 36" ${sk(WOOD, 6)}/><rect x="206" y="104" width="20" height="24" fill="${WOOD}"/><rect x="192" y="94" width="10" height="10" fill="#bfe1f2"/></g>` +
        `<g ${s.a(pop(48), ORG(216, 30))}>${sparkle(216, 30, 8)}<text x="252" y="34" font-size="10" font-weight="700" ${fl(CL.a)}>成真了!</text></g>`;
    }},
    variety: {dur: 5.8, hl: [10, 50], end: 60, lit: '花样多变', mean: '多样性；种类', draw: s => {
      const flavors = ['#f2a3b3', '#8b5a3a', '#f6e8b0', '#9fd88a', '#b8a0e8', '#f6a623'];
      return GND() + `<rect x="30" y="88" width="240" height="40" rx="4" ${fl(CL.m, .35)}/><rect x="30" y="84" width="240" height="8" rx="3" ${fl(CL.m, .55)}/>` +
        flavors.map((c, i) => { const x = 54 + i * 38;
          return `<path d="M${x - 9} 74l9 22 9-22z" fill="#e0b070"/><g ${s.a(pop(10 + i * 5), 'transform-origin:50% 100%;transform-box:fill-box')}><circle cx="${x}" cy="66" r="11" fill="${c}"/><circle cx="${x - 3}" cy="62" r="2.5" fill="#fff" opacity=".6"/></g>`; }).join('') +
        `<g ${s.a(pop(48), ORG(150, 30))}><rect x="104" y="20" width="92" height="22" rx="6" ${fl(CL.a)}/><text x="150" y="35" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">6 种口味</text></g>`;
    }},
    various: {dur: 5.8, hl: [10, 50], end: 60, lit: '变出许多样子的', mean: '各种各样的', draw: s => {
      const fruits = [`<circle cx="0" cy="0" r="10" fill="#e2473a"/><path d="M0-10q2-5 5-6" stroke="#7a4a2a" stroke-width="2" fill="none"/>`, `<path d="M-14 4q14 10 28-10q-4 16-28 10z" fill="#f6d34a"/>`, `<circle cx="-4" cy="-3" r="5" fill="#8b5fbf"/><circle cx="4" cy="-3" r="5" fill="#8b5fbf"/><circle cx="0" cy="5" r="5" fill="#8b5fbf"/>`, `<circle cx="0" cy="0" r="10" fill="#f6a623"/>`, `<path d="M-8 6q0-16 8-16t8 16q-8 6-16 0z" fill="#9fd88a"/>`];
      const tgt = [[124, 92], [150, 86], [176, 92], [136, 100], [164, 100]];
      return GND() + fruits.map((f, i) => { const p = 8 + i * 7, [tx, ty] = tgt[i];
          return `<g ${s.a({0: 'opacity:0;' + T(tx, 10), [p]: 'opacity:0;' + T(tx, 10), [p + 1]: 'opacity:1;' + T(tx, 10), [p + 8]: 'opacity:1;' + T(tx, ty), 92: 'opacity:1;' + T(tx, ty), 100: 'opacity:0;' + T(tx, ty)})}>${f}</g>`; }).join('') +
        `<path d="M110 100h80l-10 28h-60z" fill="${WOOD}"/><path d="M114 108h72M118 116h64" ${sk('#8c5a30', 2)}/><path d="M114 100q36-40 72 0" ${sk(WOOD, 4)}/>` +
        `<g ${s.a(pop(48), ORG(250, 50))}><rect x="214" y="40" width="72" height="20" rx="6" ${fl(CL.t)}/><text x="250" y="54" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">各种各样</text></g>`;
    }},
    connection: {dur: 6, hl: [10, 50], end: 60, lit: '连起来的关系', mean: '联系；关系', draw: s => {
      const nodes = [[50, 50], [110, 30], [170, 60], [240, 36], [80, 110], [150, 116], [230, 104]];
      const links = [[0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6], [2, 5], [3, 6], [1, 5]];
      return links.map(([a, b], i) => `<path d="M${nodes[a][0]} ${nodes[a][1]}L${nodes[b][0]} ${nodes[b][1]}" ${sk(CL.v, 2.5)} ${DASH} ${s.a(drawP(10 + i * 4, 16 + i * 4))}/>`).join('') +
        nodes.map(([x, y], i) => `<g ${s.a(pop(4 + i * 1.5), ORG(x, y))}><circle cx="${x}" cy="${y}" r="11" fill="${SKIN}" style="stroke:var(--violet);stroke-width:2.5px"/><circle cx="${x - 3}" cy="${y - 1}" r="1.4" fill="${INK}"/><circle cx="${x + 3}" cy="${y - 1}" r="1.4" fill="${INK}"/><path d="M${x - 11} ${y - 2}a11 11 0 0 1 22 0q-5-4-11-3t-11 3z" fill="${HAIR}"/></g>`).join('') +
        `<g ${s.a(pop(50), ORG(150, 142))}><rect x="116" y="134" width="68" height="16" rx="5" ${fl(CL.v)}/><text x="150" y="146" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">人脉关系</text></g>`;
    }},
    determine: {dur: 6, hl: [30, 10, 50], end: 60, lit: '划定界限、定下来', mean: '决定；确定', draw: s => {
      const stake = (x, p) => `<g ${s.a({0: 'opacity:0;' + T(0, -30), [p]: 'opacity:0;' + T(0, -30), [p + 2]: 'opacity:1;' + T(0, -30), [p + 6]: 'opacity:1;' + T(), 92: 'opacity:1;' + T(), 100: 'opacity:0;' + T()})}><path d="M${x} 128v-22" ${sk(WOOD, 5)}/><path d="M${x - 3} 106l3-6 3 6" fill="${WOOD}"/></g>`;
      return GND() + `<path d="M0 128h300" ${sk('#e6c98a', 12)}/>` + [60, 130, 200, 270].map((x, i) => stake(x, 8 + i * 6)).join('') +
        `<path d="M60 110H270" ${sk(CL.a, 3)} ${DASH} ${s.a(drawP(34, 46))}/>` +
        kid(30, 128, CL.t, {aR: [16, -40]}) +
        `<g ${s.a(pop(48), ORG(166, 50))}><circle cx="166" cy="50" r="20" ${sk('#d23c2f', 3.5)}/><text x="166" y="57" font-size="18" font-weight="700" text-anchor="middle" fill="#d23c2f">定</text></g>`;
    }},
    // ---------- 第十七批 ----------
    internet: {dur: 5.8, hl: [30, 10], end: 58, lit: '互相连起来的网', mean: '互联网', draw: s => {
      const pcs = [[40, 40], [250, 36], [40, 110], [250, 112], [150, 130]];
      const pc = (x, y) => `<rect x="${x - 14}" y="${y - 10}" width="28" height="18" rx="2" ${fl(CL.k, .85)}/><rect x="${x - 12}" y="${y - 8}" width="24" height="14" fill="#1e3a2f"/><path d="M${x - 6} ${y + 10}h12" ${sk(CL.m, 3)}/>`;
      return `<circle cx="150" cy="70" r="34" fill="#6db7e8" opacity=".35"/><ellipse cx="150" cy="70" rx="34" ry="12" ${sk(CL.t, 1.5)}/><ellipse cx="150" cy="70" rx="12" ry="34" ${sk(CL.t, 1.5)}/><path d="M116 70h68" ${sk(CL.t, 1.5)}/>` +
        pcs.map(([x, y], i) => `<path d="M${x} ${y}L150 70" ${sk(CL.v, 2)} ${DASH} ${s.a(drawP(10 + i * 4, 16 + i * 4))}/>`).join('') +
        `<path d="M40 40L250 36M40 110L250 112M40 40L40 110M250 36L250 112" ${sk(CL.v, 1.5, .5)} stroke-dasharray="3 4" ${s.a(fadeP(30, 36))}/>` +
        pcs.map(([x, y]) => pc(x, y)).join('') +
        pcs.map(([x, y], i) => `<g ${s.a(showAt(36))}><circle cx="${x}" cy="${y}" r="3" ${fl(CL.g)} ${s.a({0: T(), 50: T(f1((150 - x) * .9), f1((70 - y) * .9)), 100: T()}, `animation-delay:${i * .2}s`, 1.6)}/></g>`).join('');
    }},
    knowledge: {dur: 5.8, hl: [10, 50], end: 58, lit: '知道了的东西', mean: '知识', draw: s => {
      const item = (art, p, i) => `<g ${s.a(moveIn([[p, 0, 0, 'scale(1)'], [p + 10, -60, -44 + i * 6, 'scale(.4)']]))} >${art}</g>`;
      return GND() + kid(90, 128, CL.t, {aL: [-10, -28], aR: [10, -28]}) + `<path d="M76 96l14 5 14-5v14l-14 5-14-5z" ${fs(CL.p, CL.v, 1.5)}/>` +
        `<g ${s.a({0: 'transform:scale(1)', 50: 'transform:scale(1.04)', 100: 'transform:scale(1)'}, ORG(90, 76), 1.2)}><circle cx="90" cy="76" r="11" fill="${SKIN}" opacity="0"/></g>` +
        item(`<text x="150" y="100" font-size="12" font-weight="700" font-family="Georgia,serif" ${fl(CL.a)}>E=mc²</text>`, 10, 0) +
        item(`<circle cx="160" cy="100" r="8" fill="#6db7e8"/><path d="M154 98q6-4 10 2" ${sk('#5fae6a', 3)}/>`, 20, 1) +
        item(`<path d="M154 104V90l10-3v14" ${sk(CL.v, 2)}/><circle cx="151" cy="104" r="3" ${fl(CL.v)}/><circle cx="161" cy="101" r="3" ${fl(CL.v)}/>`, 30, 2) +
        `<g ${s.a(pop(44), ORG(90, 36))}><path d="M82 38a8 8 0 1 1 16 0c0 4-3 5-3 9h-10c0-4-3-5-3-9z" ${fl(CL.g)}/></g>` +
        `<g ${s.a(pop(50), ORG(220, 40))}>${[0, 1, 2, 3].map(i => `<rect x="${196}" y="${60 - i * 10}" width="${50 - i * 4}" height="9" rx="1.5" ${fl([CL.a, CL.v, CL.t, CL.g][i])}/>`).join('')}<text x="220" y="16" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.a)}>知识</text></g>`;
    }},
    manage: {dur: 6, hl: [6, 40], end: 60, lit: '用手打理', mean: '管理；设法做到', draw: s => {
      const items = [[60, 112, CL.a, 220, 54], [86, 104, CL.v, 244, 54], [70, 92, CL.t, 220, 82], [100, 118, CL.g, 244, 82], [50, 98, CL.a, 220, 110]];
      const hand = `<path d="M-10 0h14a6 6 0 0 1 0 12h-4M-10 0v14h16" fill="${SKIN}" stroke="${SKIN}" stroke-width="6"/>`;
      return GND() + `<path d="M206 40v88M262 40v88M206 68h56M206 96h56M206 124h56" ${sk(WOOD, 3)}/>` +
        items.map(([x, y, c, tx, ty], i) => { const p = 8 + i * 8; return `<g ${s.a({0: T(0, 0, 'rotate(' + (i * 25 - 30) + 'deg)'), [p]: T(0, 0, 'rotate(' + (i * 25 - 30) + 'deg)'), [p + 7]: T(tx - x, ty - y, 'rotate(0deg)'), 92: T(tx - x, ty - y, 'rotate(0deg)'), 100: T(0, 0, 'rotate(' + (i * 25 - 30) + 'deg)')})}><rect x="${x - 9}" y="${y - 7}" width="18" height="14" rx="2" ${fl(c)}/></g>`; }).join('') +
        `<g ${s.a(Object.assign({0: 'opacity:0;' + T(60, 100)}, ...items.map(([x, y, , tx, ty], i) => ({[8 + i * 8]: 'opacity:1;' + T(x, y - 14), [15 + i * 8]: 'opacity:1;' + T(tx, ty - 14)})), {50: 'opacity:0;' + T(244, 96), 100: 'opacity:0;' + T(60, 100)}))}>${hand}</g>` +
        `<g ${s.a(pop(50), ORG(130, 30))}><rect x="96" y="20" width="68" height="20" rx="6" ${fl(CL.t)}/><text x="130" y="34" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">井井有条</text></g>`;
    }},
    ourselves: {dur: 5.6, hl: [6, 30], end: 58, lit: '我们本人', mean: '我们自己', draw: s => {
      return GND() + kid(100, 128, CL.t, {aR: [16, -66]}) + kid(140, 128, CL.a) + kid(180, 128, CL.v, {aL: [-14, -46]}) +
        `<rect x="106" y="34" width="20" height="30" rx="4" ${fl(CL.k, .9)}/>` +
        `<g ${s.a({0: 'opacity:0', 26: 'opacity:0', 27: 'opacity:.8', 30: 'opacity:0', 100: 'opacity:0'})}><rect x="0" y="0" width="300" height="150" fill="#fff"/></g>` +
        `<g ${s.a(pop(32), ORG(240, 56))}><rect x="208" y="28" width="66" height="54" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><rect x="212" y="32" width="58" height="38" fill="#bfe1f2"/>` +
        [[226, CL.t], [241, CL.a], [256, CL.v]].map(([x, c]) => `<circle cx="${x}" cy="48" r="5" fill="${SKIN}"/><path d="M${x - 5} 47a5 5 0 0 1 10 0z" fill="${HAIR}"/><path d="M${x - 6} 70q0-12 6-12t6 12z" fill="${c}"/>`).join('') + `</g>` +
        `<g ${s.a(pop(40), ORG(150, 24))}><rect x="112" y="14" width="76" height="20" rx="6" ${fl(CL.v)}/><text x="150" y="28" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">我们自己</text></g>`;
    }},
    reading: {dur: 5.8, hl: [6, 50], end: 58, lit: '读这件事', mean: '阅读', draw: s => {
      return GND() + kid(70, 128, CL.t, {aR: [26, -30]}) +
        `<path d="M110 50l50 8v56l-50-8zM210 50l-50 8v56l50-8z" ${fs(CL.p, CL.m, 2)}/>` + [0, 1, 2, 3, 4].map(i => `<path d="M118 ${66 + i * 9}l34 5M168 ${71 + i * 9}l34-5" ${sk(CL.m, 1.5, .7)}/>`).join('') +
        `<rect x="116" y="60" width="38" height="8" rx="2" ${fl(CL.g, .35)} ${s.a({0: T(), 6: T(), 14: T(0, 9), 22: T(0, 18), 30: T(0, 27), 38: T(0, 36), 46: T(0, 36), 92: T(0, 36), 100: T()})}/>` +
        `<path d="M80 74l28 0" ${sk(CL.t, 1.5)} stroke-dasharray="2 3" ${s.a(showAt(6, 46))}/>` +
        `<g ${s.a({0: 'transform:scaleX(1)', 46: 'transform:scaleX(1)', 52: 'transform:scaleX(-1)', 92: 'transform:scaleX(-1)', 100: 'transform:scaleX(1)'}, 'transform-origin:0% 50%;transform-box:fill-box')}><path d="M160 58l50-8v56l-50 8z" ${fs(CL.p, CL.m, 1.5)}/></g>` +
        `<g ${s.a(pop(50), ORG(250, 30))}><rect x="222" y="20" width="56" height="20" rx="6" ${fl(CL.t)}/><text x="250" y="34" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">翻页</text></g>`;
    }},
    collect: {dur: 6, hl: [30, 10], end: 60, lit: '挑出来放一起', mean: '收集', draw: s => {
      const shells = [[40, 126, 1], [72, 130, 0], [100, 124, 1], [132, 130, 0], [160, 126, 1], [196, 130, 0]];
      const picked = shells.filter(x => x[2]);
      return `<rect x="0" y="118" width="300" height="32" fill="#e6c98a"/>` +
        shells.map(([x, y, star], i) => star ? `<g ${s.a({0: 'opacity:1;' + T(), [10 + picked.findIndex(p => p[0] === x) * 12]: 'opacity:1;' + T(), [18 + picked.findIndex(p => p[0] === x) * 12]: 'opacity:1;' + T(238 + picked.findIndex(p => p[0] === x) * 12 - x, 112 - picked.findIndex(p => p[0] === x) * 9 - y, 'scale(.8)'), 92: 'opacity:1;' + T(238 + picked.findIndex(p => p[0] === x) * 12 - x, 112 - picked.findIndex(p => p[0] === x) * 9 - y, 'scale(.8)'), 100: 'opacity:1;' + T()})}>${sparkle(x, y - 4, 7, '#f6a623')}</g>` : `<ellipse cx="${x}" cy="${y}" rx="7" ry="4" fill="#d8c8b8"/>`).join('') +
        `<path d="M230 80h40v40a6 6 0 0 1-6 6h-28a6 6 0 0 1-6-6z" fill="#e8f3f8" fill-opacity=".15" style="stroke:var(--ink3);stroke-width:2px"/><rect x="226" y="74" width="48" height="8" rx="3" ${fl(CL.m, .6)}/>` +
        `<g ${s.a({0: T(), 10: T(), 18: T(60, 0), 22: T(60, 0), 30: T(120, 0), 34: T(120, 0), 42: T(0, 0), 100: T()})}><circle cx="40" cy="96" r="12" fill="#fff" fill-opacity=".4" style="stroke:var(--ink);stroke-width:3px"/><path d="M48 104l8 8" ${sk(CL.k, 4)}/></g>` +
        `<g ${s.a(pop(48), ORG(250, 50))}><rect x="222" y="40" width="56" height="20" rx="6" ${fl(CL.g)}/><text x="250" y="54" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">只要星星</text></g>`;
    }},
    introduce: {dur: 5.8, hl: [20, 10], end: 58, lit: '领进来', mean: '介绍；引进', draw: s => {
      return GND() + `<rect x="10" y="40" width="40" height="88" ${fl(WOOD, .55)}/>` +
        kid(200, 128, CL.v, {k: .8}) + kid(240, 128, CL.g, {k: .8}) + kid(270, 128, CL.t, {k: .8}) +
        `<g ${s.a(move([[6, -50, 0], [26, 0, 0]]))}>${kid(130, 128, CL.a, {aR: [22, -36], ...walkLegs(s, 130, 128, 6, 26, 4)})}</g>` +
        `<g ${s.a(move([[10, -60, 0], [30, 0, 0]]))}>${kid(90, 128, CL.t, {k: .85, ...walkLegs(s, 90, 128, 10, 30, 4, .85)})}</g>` +
        `<g ${s.a(pop(32), ORG(150, 40))}>${bubble(150, 40)}<text x="150" y="44" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.a)}>这是小明</text></g>` +
        [200, 240, 270].map((x, i) => `<g ${s.a(pop(40 + i * 3), ORG(x, 66))}><text x="${x}" y="70" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.v)}>Hi!</text></g>`).join('');
    }},
    personality: {dur: 6, hl: [6, 20, 50], end: 60, lit: '一个人的样子', mean: '个性', draw: s => {
      return GND() + kid(70, 128, CL.a) + kid(150, 128, CL.t) + kid(230, 128, CL.v) +
        `<g ${s.a(pop(14), ORG(86, 100))}><ellipse cx="88" cy="102" rx="10" ry="7" fill="${WOOD}" transform="rotate(-20 88 102)"/><path d="M92 98l14-14" ${sk(WOOD, 2.5)}/></g>` +
        `<g ${s.a(pop(24), ORG(166, 120))}><circle cx="168" cy="122" r="6" ${fl(CL.k)}/><path d="M164 120l8 4M168 116v12" ${sk('#fff', 1.2)}/></g>` +
        `<g ${s.a(pop(34), ORG(246, 104))}><path d="M238 98l10 4 10-4v14l-10 4-10-4z" ${fs(CL.p, CL.v, 1.5)}/></g>` +
        [[70, '♪', CL.a], [150, '⚽', CL.t], [230, '📖', CL.v]].map(([x], i) => `<g ${s.a(pop(16 + i * 10), ORG(x, 50))}>${['<path d="M64 52V38l10-3v14" stroke="#b8432f" stroke-width="2.5" fill="none"/><circle cx="61" cy="52" r="3.5" fill="#b8432f"/><circle cx="71" cy="49" r="3.5" fill="#b8432f"/>', `<path d="M140 50l10-10 10 10-10 10z" ${fl(CL.t)}/>`, `<circle cx="230" cy="48" r="9" ${fl(CL.v)}/><text x="230" y="52" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">?</text>`][i]}</g>`).join('') +
        `<g ${s.a(pop(50), ORG(150, 18))}><rect x="104" y="8" width="92" height="20" rx="6" ${fl(CL.g)}/><text x="150" y="22" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">每人都不一样</text></g>`;
    }},
    solution: {dur: 6, hl: [10, 50], end: 60, lit: '解开的办法', mean: '解决办法；溶液', draw: s => {
      return GND() + `<g ${s.a({0: 'opacity:1', 28: 'opacity:1', 32: 'opacity:0', 94: 'opacity:0', 100: 'opacity:1'})}><path d="M60 70q20-30 40 0t-20 20 0-30 30 10-30 20-20-20M100 70q30-10 60 0" ${sk(CL.a, 4)}/></g>` +
        `<path d="M40 70h220" ${sk(CL.a, 4)} ${s.a({0: 'opacity:0', 28: 'opacity:0', 34: 'opacity:1', 92: 'opacity:1', 100: 'opacity:0'})}/>` +
        `<g ${s.a(showAt(8, 30))}><g ${s.a({0: R(0), 50: R(25), 100: R(0)}, ORG(80, 96), .5)}>${'<path d="M80 96l10-24" stroke="#f2c49b" stroke-width="6" stroke-linecap="round"/>'}</g><g ${s.a({0: R(0), 50: R(-25), 100: R(0)}, ORG(120, 96), .5)}><path d="M120 96l-10-24" stroke="${SKIN}" stroke-width="6" stroke-linecap="round"/></g></g>` +
        `<g ${s.a(pop(36), ORG(150, 30))}><path d="M142 32a8 8 0 1 1 16 0c0 4-3 5-3 9h-10c0-4-3-5-3-9z" ${fl(CL.g)}/><path d="M150 16v-4M137 22l-3-3M163 22l3-3" ${sk(CL.g, 2)}/></g>` +
        `<path d="M222 96h36l-4 32h-28z" fill="#e8f3f8" style="stroke:var(--ink3);stroke-width:2px"/><path d="M225 106h30l-3 22h-24z" fill="#6db7e8" opacity=".6"/>` +
        `<rect x="234" y="86" width="12" height="12" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px" ${s.a({0: 'opacity:1;' + T(), 40: 'opacity:1;' + T(), 48: 'opacity:1;' + T(0, 24), 60: 'opacity:0;' + T(0, 30, 'scale(.3)'), 94: 'opacity:0', 100: 'opacity:1;' + T()})}/>` +
        `<g ${s.a(pop(52), ORG(240, 140))}><text x="240" y="146" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.t)}>溶液</text></g>`;
    }},
    strategy: {dur: 6, hl: [6, 20], end: 60, lit: '带兵打仗的谋划', mean: '战略；策略', draw: s => {
      return `<rect x="70" y="30" width="200" height="100" rx="4" fill="#e6dcc0" style="stroke:var(--ink3);stroke-width:2px"/><path d="M80 110q40-30 80-10t80-30" ${sk('#9fd0ee', 6)}/><path d="M220 50l10-12 10 12z" fill="#7d9c7a"/>` +
        `<path d="M100 110Q140 60 210 60" ${sk(CL.a, 3)} stroke-dasharray="6 4" ${s.a(fadeP(12, 22))}/><path d="M204 52l8 8-10 4" ${sk(CL.a, 3)} ${s.a(showAt(22))}/>` +
        `<path d="M100 110Q160 120 240 100" ${sk(CL.v, 3)} stroke-dasharray="6 4" ${s.a(fadeP(20, 30))}/>` +
        [0, 1, 2].map(i => `<g ${s.a(moveIn([[30 + i * 4, 0, 0], [52 + i * 4, 100 - i * 6, -48 + i * 4]]))}><rect x="${96 + i * 8}" y="${106 - i * 4}" width="7" height="10" rx="1.5" ${fl(CL.a)}/></g>`).join('') +
        `<path d="M220 56l8-12 8 12z" fill="#d23c2f" ${s.a(pop(58), ORG(228, 50))}/>` +
        kid(40, 128, '#4f6b3a', {k: 1.05, aR: [24, -44]}) + `<path d="M28 64h24l-3-8h-18z" fill="#4f6b3a"/>` + GND(8, 70);
    }},
    daily: {dur: 6, hl: [6, 40], end: 60, lit: '每一天的', mean: '每日的；日常的', draw: s => {
      return GND() + `<g ${s.a({0: R(-90), 100: R(270)}, ORG(150, 128) + ';animation-timing-function:linear', 2)}><circle cx="150" cy="38" r="12" ${fl(CL.g)}/></g>` +
        `<path d="M0 128h300v22H0z" ${fl(CL.p)}/>` + GND() +
        `<rect x="40" y="96" width="30" height="32" ${fl(CL.a, .5)}/><path d="M34 98l21-18 21 18z" fill="#c8664a"/>` +
        [0, 1, 2].map(i => `<g ${s.a(moveIn([[8 + i * 16, 180, 0, 'rotate(0deg)'], [14 + i * 16, 60, -10, 'rotate(-30deg)'], [18 + i * 16, 30, 4, 'rotate(0deg)']]))}><rect x="${40 + i * 4}" y="${104 - i * 3}" width="22" height="14" rx="2" fill="#fffdf6" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M${43 + i * 4} ${108 - i * 3}h16" ${sk(CL.k, 1.5)}/></g>`).join('') +
        `<rect x="200" y="20" width="80" height="26" rx="6" ${fl(CL.k, .8)}/>` + ['第1天', '第2天', '第3天'].map((t, i) => `<text x="240" y="38" font-size="12" font-weight="700" text-anchor="middle" fill="#7cf0b0" ${s.a(slot([0, 6 + i * 16, i === 2 ? 94 : 22 + i * 16], 1))}>${t}</text>`).join('') +
        `<g ${s.a(pop(54), ORG(150, 80))}><rect x="112" y="70" width="76" height="20" rx="6" ${fl(CL.t)}/><text x="150" y="84" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">每天一份报</text></g>`;
    }},
    happiness: {dur: 5.6, hl: [6, 50], end: 58, lit: '快乐的状态', mean: '幸福；快乐', draw: s => {
      const jump = {0: T(), 100: T()}; for (let i = 0; i < 6; i++) { jump[6 + i * 8] = T(); jump[10 + i * 8] = T(0, -20); } jump[54] = T();
      return GND() + `<g ${s.a(jump, FOOT)}>${kid(150, 128, CL.a, {aL: [-17, -46], aR: [17, -46]})}</g>` +
        `<g ${s.a(pop(4), ORG(50, 36))}><circle cx="50" cy="36" r="16" ${fl(CL.g)}/><path d="M44 34h0M56 34h0" ${sk(INK, 3)}/><path d="M43 40q7 6 14 0" ${sk(INK, 2)}/></g>` +
        [[90, '#e2473a', 0], [210, '#6db7e8', .5], [240, '#f6d34a', 1]].map(([x, c, dl]) => `<g ${s.a({0: T(), 50: T(0, -10), 100: T()}, `animation-delay:${dl}s`, 2)}><ellipse cx="${x}" cy="48" rx="12" ry="15" fill="${c}"/><path d="M${x} 63q-3 20 ${x > 150 ? -30 : 40} 50" ${sk(CL.m, 1)}/></g>`).join('') +
        [0, 1, 2].map(i => `<g ${s.a(pop(20 + i * 10), ORG(120 + i * 30, 30))}>${heartAt(120 + i * 30, 30, .6)}</g>`).join('') +
        `<g ${s.a(pop(50), ORG(150, 140))}><rect x="116" y="132" width="68" height="16" rx="5" ${fl(CL.a)}/><text x="150" y="144" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">好开心!</text></g>`;
    }},
    // ---------- 第十八批 ----------
    intelligence: {dur: 6, hl: [10, 22, 50], end: 60, lit: '在几样之间挑对的', mean: '智力；情报', draw: s => {
      return GND() + kid(50, 128, CL.t) +
        `<path d="M80 90h40M120 90l30-40h60M120 90l30 0h60M120 90l30 40h60" ${sk(CL.m, 6, .3)}/>` +
        `<text x="226" y="54" font-size="14" font-weight="700" ${fl(CL.a)}>✗</text><text x="226" y="94" font-size="14" font-weight="700" ${fl(CL.t)} ${s.a(pop(30), ORG(230, 88))}>✓</text><text x="226" y="134" font-size="14" font-weight="700" ${fl(CL.a)}>✗</text>` +
        `<path d="M120 90l30-40h56" ${sk(CL.m, 2)} stroke-dasharray="3 4" ${s.a(fadeP(10, 14))}/><path d="M120 90l30 40h56" ${sk(CL.m, 2)} stroke-dasharray="3 4" ${s.a(fadeP(14, 18))}/>` +
        `<path d="M80 90h40l30 0h56" ${sk(CL.t, 3.5)} ${DASH} ${s.a(drawP(22, 36))}/>` +
        `<g ${s.a(pop(40), ORG(50, 40))}><path d="M40 44a10 10 0 0 1 6-14 10 10 0 0 1 12 0 10 10 0 0 1 6 14 8 8 0 0 1-6 8h-12a8 8 0 0 1-6-8z" fill="#f2a3b3"/>${rays(52, 40, 14, 19, 8).replace('<path ', `<path ${sk(CL.g, 2)} `)}</g>` +
        `<g ${s.a(pop(50), ORG(120, 30))}><rect x="96" y="20" width="48" height="22" rx="5" ${fl(CL.v)}/><text x="120" y="35" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">AI</text></g>`;
    }},
    maintain: {dur: 6, hl: [6, 20], end: 60, lit: '一直握在手里', mean: '维持；维修', draw: s => {
      const sway = {0: T(0, 0, 'rotate(0deg)'), 100: T(0, 0, 'rotate(0deg)')}; for (let i = 0; i < 10; i++) sway[6 + i * 5] = T(i % 2 ? 10 : -10, i % 2 ? -4 : 4, `rotate(${i % 2 ? 8 : -8}deg)`); sway[56] = T(0, 0, 'rotate(0deg)');
      return GND() + kid(60, 128, CL.t, {aR: [18, -40]}) + `<path d="M76 84l6 4M78 80l4-2" ${sk(SKIN, 4)}/>` +
        `<path d="M80 86Q150 60 200 46" ${sk(CL.m, 1.5)}/>` +
        `<g ${s.a(sway, ORG(210, 40))}><path d="M210 20l20 20-20 20-20-20z" ${fl(CL.a)}/><path d="M210 20v40M190 40h40" ${sk('#fff', 1.5)}/><path d="M210 60q6 10 0 18q-6 8 0 14" ${sk(CL.g, 2)}/></g>` +
        `<g ${s.a(showAt(6, 56))}>${[0, 1, 2].map(i => `<path d="M${240 + i * 8} ${30 + i * 16}h-20" ${sk(CL.m, 2.5)} ${s.a({0: 'opacity:0;' + T(20), 20: 'opacity:1;' + T(10), 100: 'opacity:0;' + T(-20)}, `animation-delay:${i * .25}s`, 1)}/>`).join('')}</g>` +
        `<g ${s.a(pop(50), ORG(130, 128))}><rect x="96" y="120" width="68" height="18" rx="5" ${fl(CL.t)}/><text x="130" y="133" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">稳稳握住</text></g>`;
    }},
    marketing: {dur: 5.8, hl: [6, 40], end: 58, lit: '推向市场', mean: '营销', draw: s => {
      const wave = dl => `<path d="M118 64q10 12 0 24" ${sk(CL.a, 2.5)} ${s.a({0: 'opacity:0;' + T(), 15: 'opacity:1;' + T(), 85: 'opacity:.3;' + T(60), 100: 'opacity:0;' + T(70)}, `animation-delay:${dl}s;animation-timing-function:linear`, 1.2)}/>`;
      return GND() + `<path d="M10 128V60h70v68" ${fl(CL.m, .3)}/><path d="M6 60h78l-6-12H12z" fill="#d23c2f"/><text x="45" y="96" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>新品</text>` +
        kid(90, 128, CL.a, {aR: [16, -44]}) + `<path d="M104 76l14-8v24l-14-8z" ${fl(CL.g)}/>` + `<g ${s.a(showAt(6))}>${wave(0)}${wave(.4)}${wave(.8)}</g>` +
        `<g ${s.a(pop(10), ORG(140, 34))}><rect x="110" y="22" width="60" height="22" rx="6" ${fl(CL.a)}/><text x="140" y="37" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">促销!</text></g>` +
        [200, 236, 270].map((x, i) => `<g ${s.a(moveIn([[20 + i * 6, 40, 0], [36 + i * 6, 0, 0]]))}>${kid(x, 128, [CL.t, CL.v, CL.g][i], {k: .65, aL: [-10, -36]})}</g>`).join('') +
        `<g ${s.a(pop(48), ORG(236, 40))}><rect x="214" y="28" width="44" height="24" rx="3" ${fs(CL.p, CL.m, 1.5)}/><path d="M218 46l10-6 8 3 12-10" ${sk(CL.a, 2)}/></g>`;
    }},
    medical: {dur: 5.8, hl: [6, 50], end: 58, lit: '和医有关的', mean: '医学的；医疗的', draw: s => {
      return GND() + `<g ${s.a(pop(4), ORG(250, 40))}><rect x="230" y="20" width="40" height="40" rx="6" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M244 28h12v8h8v12h-8v8h-12v-8h-8V36h8z" fill="#e2473a"/></g>` +
        kid(110, 128, '#eef1f4', {aR: [26, -40]}) + `<rect x="100" y="87" width="20" height="24" rx="8" ${sk(CL.m, 1.2)}/><path d="M104 88v8a6 6 0 0 0 12 0" ${sk(CL.k, 1.8)}/>` +
        `<path d="M136 88q10 0 20 6" ${sk(CL.k, 1.8)}/><circle cx="158" cy="96" r="4" ${fl(CL.m)}/>` + kid(180, 128, CL.a, {k: .85}) +
        `<g ${s.a(showAt(16, 46))}>${[0, 1, 2].map(i => `<g ${s.a({0: 'transform:scale(1)', 15: 'transform:scale(1.4)', 30: 'transform:scale(1)', 100: 'transform:scale(1)'}, ORG(180 + i * 0, 96), .8)}>${heartAt(196, 70 - i * 0, .45)}</g>`).join('')}</g>` +
        `<g ${s.a(pop(40), ORG(56, 100))}><rect x="40" y="96" width="32" height="12" rx="6" fill="#e2473a"/><rect x="56" y="96" width="16" height="12" rx="6" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/></g>`;
    }},
    perform: {dur: 6, hl: [30, 14], end: 60, lit: '把事情完整做成', mean: '执行；表演', draw: s => {
      return `<rect x="20" y="110" width="260" height="14" fill="${WOOD}"/>` + kid(110, 110, CL.v, {k: .9, aR: [24, -40], armR: s.a({0: R(0), 10: R(0), 14: R(-30), 20: R(0), 30: R(-40), 40: R(-40), 100: R(0)}, shoulder(110, 110, 1, .9))}) +
        `<path d="M96 66h28l-4-6h-20z" fill="${INK}"/><rect x="100" y="48" width="20" height="14" rx="2" fill="${INK}"/>` +
        `<path d="M140 110h28l-4-20h-20z" fill="${INK}"/><ellipse cx="154" cy="90" rx="14" ry="4" fill="${INK}"/>` +
        `<g ${s.a({0: 'opacity:0;' + T(0, 14), 28: 'opacity:0;' + T(0, 14), 30: 'opacity:1;' + T(0, 14), 40: 'opacity:1;' + T(0, -22), 92: 'opacity:1;' + T(0, -22), 100: 'opacity:0;' + T(0, -22)})}><ellipse cx="154" cy="84" rx="10" ry="9" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><ellipse cx="150" cy="70" rx="3" ry="9" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><ellipse cx="158" cy="70" rx="3" ry="9" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><circle cx="157" cy="82" r="1.3" fill="${INK}"/></g>` +
        `<g ${s.a(showAt(36, 46))}>${burst(154, 70, 20).replace('<path ', `<path ${sk(CL.g, 2)} `)}</g>` +
        [50, 90, 200, 240].map(x => `<circle cx="${x}" cy="134" r="7" fill="${INK}" opacity=".7"/><path d="M${x - 12} 150q0-10 12-10t12 10z" fill="${INK}" opacity=".7"/>`).join('') + `<text x="220" y="40" font-size="12" font-weight="700" ${fl(CL.a)} ${s.a(pop(46), ORG(230, 36))}>好!</text>`;
    }},
    potential: {dur: 6, hl: [20, 50], end: 60, lit: '藏着的力量', mean: '潜力；潜在的', draw: s => {
      return `<rect x="150" y="10" width="140" height="118" ${fl(CL.m, .12)}/>` + GND() +
        `<g ${s.a({0: 'opacity:0', 16: 'opacity:0', 30: 'opacity:.85', 92: 'opacity:.85', 100: 'opacity:0'})}><circle cx="210" cy="42" r="16" fill="${INK}" opacity=".35"/><path d="M186 128v-30a24 24 0 0 1 48 0v30z" fill="${INK}" opacity=".35"/><path d="M186 70l-22 40h22M234 70l22 40h-22" fill="${INK}" opacity=".25"/><path d="M200 84l10 10 10-10" ${sk(CL.g, 3)}/></g>` +
        kid(100, 128, CL.t, {k: .7}) + `<path d="M108 120l60-40" ${sk(CL.g, 2)} stroke-dasharray="3 4" ${s.a(fadeP(16, 24))}/>` +
        `<g ${s.a(pop(48), ORG(100, 50))}><rect x="66" y="40" width="68" height="20" rx="6" ${fl(CL.g)}/><text x="100" y="54" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">潜力无限</text></g>`;
    }},
    private: {dur: 5.8, hl: [6, 40], end: 58, lit: '属于个人的', mean: '私人的；私立的', draw: s => {
      return GND() + `<rect x="120" y="30" width="70" height="98" fill="${WOOD}"/><rect x="128" y="38" width="54" height="22" rx="3" fill="#fff"/><text x="155" y="53" font-size="9" font-weight="700" text-anchor="middle" fill="#d23c2f">PRIVATE</text>` +
        `<circle cx="180" cy="84" r="3" fill="#f2b632"/><path d="M174 92v-4a6 6 0 0 1 12 0v4" ${sk(CL.k, 2)} ${s.a(showAt(24))}/><rect x="172" y="92" width="16" height="12" rx="2" ${fl(CL.k)} ${s.a(showAt(24))}/>` +
        `<g ${s.a({0: T(), 8: T(), 22: T(44, 0), 30: T(36, 0), 92: T(36, 0), 100: T()})}>${kid(60, 128, CL.a, {...walkLegs(s, 60, 128, 8, 22, 3)})}</g>` +
        `<g ${s.a(pop(26), ORG(116, 50))}><circle cx="110" cy="48" r="11" ${fl('#d23c2f')}/><path d="M102 48h16" ${sk('#fff', 3)}/></g>` +
        `<g ${s.a(pop(40), ORG(240, 60))}><rect x="214" y="50" width="56" height="20" rx="6" ${fl(CL.v)}/><text x="242" y="64" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">私人房间</text></g>`;
    }},
    productivity: {dur: 6, hl: [6, 50], end: 60, lit: '多产的程度', mean: '生产率；生产力', draw: s => {
      const box = (dl, dur) => `<rect x="150" y="96" width="14" height="12" rx="2" fill="${WOOD}" ${s.a({0: 'opacity:0;' + T(), 10: 'opacity:1;' + T(), 90: 'opacity:1;' + T(120, 0), 100: 'opacity:0;' + T(130, 0)}, `animation-delay:${dl}s;animation-timing-function:linear`, dur)}/>`;
      return GND() + `<rect x="120" y="108" width="170" height="8" rx="4" ${sk(CL.m, 2)}/><rect x="100" y="60" width="50" height="56" rx="4" ${fl(CL.m, .5)}/>` +
        `<g ${s.a({0: R(0), 100: R(360)}, ORG(125, 80) + ';animation-timing-function:linear', 1)}><circle cx="125" cy="80" r="10" ${sk(CL.v, 5)} stroke-dasharray="5 4"/></g>` +
        `<g ${s.a(hideAt(30))}>${box(0, 3)}</g><g ${s.a(showAt(30))}>${[0, .3, .6, .9].map(dl => box(dl, 1.2)).join('')}</g>` +
        `<path d="M40 100a20 20 0 0 1 40 0" ${sk(CL.m, 4)}/><g ${s.a({0: R(-70), 28: R(-70), 40: R(60), 92: R(60), 100: R(-70)}, ORG(60, 100))}><path d="M60 100V84" ${sk(CL.a, 3)}/></g><circle cx="60" cy="100" r="3" ${fl(CL.k)}/>` +
        `<text x="60" y="118" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>效率</text>` +
        `<g ${s.a(pop(50), ORG(200, 40))}><rect x="164" y="30" width="72" height="20" rx="6" ${fl(CL.t)}/><text x="200" y="44" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">产量 ×4</text></g>`;
    }},
    progress: {dur: 6, hl: [6, 6], end: 60, lit: '一路向前走', mean: '进步；进展', draw: s => {
      const marks = [[60, '60'], [130, '75'], [200, '90'], [262, '100']];
      return `<path d="M20 116H286" ${sk(CL.m, 8, .2)}/>` + GND() +
        marks.map(([x, t], i) => `<path d="M${x} 116v-12" ${sk(CL.m, 2)}/><text x="${x}" y="98" font-size="11" font-weight="700" text-anchor="middle" ${fl(i === 3 ? CL.a : CL.m)} ${s.a(pop(8 + i * 14), ORG(x, 94))}>${t}</text>`).join('') +
        `<g ${s.a(move([[6, 0, 0], [20, 70, 0], [34, 140, 0], [48, 202, 0]]))}>${kid(40, 128, CL.t, walkLegs(s, 40, 128, 6, 48, 12))}</g>` +
        `<path d="M40 60L262 30" ${sk(CL.t, 3)} ${DASH} ${s.a(drawP(6, 48))}/><path d="M252 26l10 4-8 7" ${sk(CL.t, 3)} ${s.a(showAt(47))}/>` +
        `<g ${s.a(pop(52), ORG(262, 70))}>${sparkle(262, 70, 8)}</g>`;
    }},
    reality: {dur: 6, hl: [30, 50], end: 60, lit: '真实的东西', mean: '现实', draw: s => {
      return GND() + `<g ${s.a({0: 'opacity:1', 26: 'opacity:1', 32: 'opacity:0', 94: 'opacity:0', 100: 'opacity:1'})}><rect x="160" y="16" width="130" height="94" rx="8" fill="#2a1f4a"/>${[0, 1, 2, 3].map(i => sparkle(180 + i * 30, 30 + (i % 2) * 14, 4, '#f6d34a')).join('')}` +
        `<path d="M200 90q10-30 30-30t20 20l20-10-10 20 10 6-20 4q-20 10-40 0z" fill="#5fae6a"/><circle cx="252" cy="70" r="2" fill="#fff"/><path d="M270 82q12-6 16 4" ${sk('#f6a623', 3)}/></g>` +
        `<g ${s.a({0: 'opacity:0', 28: 'opacity:0', 34: 'opacity:1', 92: 'opacity:1', 100: 'opacity:0'})}><rect x="160" y="16" width="130" height="94" rx="8" fill="#f4efe4" style="stroke:var(--ink3);stroke-width:1.5px"/><rect x="190" y="36" width="40" height="30" fill="#bfe1f2"/><rect x="240" y="70" width="34" height="40" fill="${WOOD}"/><path d="M176 110h100" ${sk(CL.m, 2)}/></g>` +
        kid(100, 128, CL.t, {aL: [-12, -48], aR: [12, -48]}) +
        `<g ${s.a({0: T(), 26: T(), 34: T(0, -20), 92: T(0, -20), 100: T()})}><rect x="88" y="70" width="24" height="10" rx="4" fill="${INK}"/><path d="M88 75h-4M112 75h4" ${sk(INK, 2)}/></g>` +
        `<g ${s.a(pop(50), ORG(100, 30))}><rect x="66" y="20" width="68" height="20" rx="6" ${fl(CL.a)}/><text x="100" y="34" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">回到现实</text></g>`;
    }},
    absence: {dur: 6, hl: [10, 24], end: 60, lit: '人离开了、不在场', mean: '缺席；缺乏', draw: s => {
      const desks = [50, 110, 170, 230];
      return GND() + desks.map((x, i) => (i === 2 ? '' : kid(x, 122, [CL.t, CL.v, '', CL.g][i], {k: .65})) + `<rect x="${x - 20}" y="102" width="40" height="6" fill="${WOOD}"/><path d="M${x - 16} 108v20M${x + 16} 108v20" ${sk(WOOD, 3)}/>`).join('') +
        `<g ${s.a({0: 'opacity:1;' + T(), 8: 'opacity:1;' + T(), 24: 'opacity:1;' + T(110, 26), 28: 'opacity:0;' + T(120, 26), 94: 'opacity:0;' + T(120, 26), 100: 'opacity:1;' + T()})}>${kid(170, 122, CL.a, {k: .65})}</g>` +
        `<g ${s.a(showAt(28))}><path d="M170 102v-6a8 8 0 0 0-16 0v6M162 84a7 7 0 1 1 0 .1" ${sk(CL.m, 2)} stroke-dasharray="3 3" transform="translate(8 0)"/></g>` +
        `<rect x="236" y="14" width="56" height="64" rx="3" ${fs(CL.p, CL.m, 1.5)}/>` + desks.map((x, i) => `<text x="${246}" y="${30 + i * 13}" font-size="8" ${fl(CL.m)}>${i + 1}</text><text x="${276}" y="${30 + i * 13}" font-size="10" font-weight="700" ${fl(i === 2 ? CL.a : CL.t)} ${s.a(pop(32 + i * 4), ORG(278, 27 + i * 13))}>${i === 2 ? '✗' : '✓'}</text>`).join('');
    }},
    argument: {dur: 6, hl: [6, 50], end: 60, lit: '论证的观点', mean: '论点；争论', draw: s => {
      return GND() + `<path d="M40 128l6-34h40l6 34z" fill="${WOOD}"/>` + kid(66, 94, CL.t, {k: .85, aR: [20, -40]}) +
        `<g ${s.a(pop(6), ORG(130, 46))}><rect x="100" y="20" width="76" height="60" rx="4" ${fs(CL.p, CL.t, 2)}/><text x="138" y="34" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.t)}>我的论点</text>` +
        [0, 1, 2].map(i => `<circle cx="110" cy="${46 + i * 11}" r="3.5" ${fl(CL.t)} ${s.a(pop(10 + i * 8), ORG(110, 46 + i * 11))}/><path d="M118 ${46 + i * 11}h48" ${sk(CL.m, 2)} ${DASH} ${s.a(drawP(10 + i * 8, 16 + i * 8))}/>`).join('') + `</g>` +
        kid(240, 128, CL.a, {aL: [-16, -46]}) +
        `<g ${s.a(pop(36), ORG(226, 50))}>${bubble(226, 50)}<text x="226" y="54" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.a)}>但是…</text></g>` +
        `<g ${s.a(showAt(40, 52))}>${burst(190, 80, 12).replace('<path ', `<path ${sk(CL.g, 2)} `)}</g>`;
    }},
    // ---------- 第十九批 ----------
    decide: {dur: 5.8, hl: [30, 20], end: 58, lit: '一刀切下去', mean: '决定', draw: s => {
      return GND() + kid(150, 128, CL.t, {aR: [22, -46], armR: s.a({0: R(0), 16: R(-40), 22: R(30), 26: R(30), 100: R(0)}, shoulder(150, 128, 1)), holdR: `<path d="M172 82l12-14" ${sk(CL.m, 3)}/><path d="M184 68l8-10 4 3-8 10z" fill="#bfc6cc"/>`}) +
        `<path d="M110 62Q130 76 150 66" ${sk(CL.m, 1.5)}/><path d="M190 62Q170 76 150 66" ${sk(CL.m, 1.5)} ${s.a(hideAt(22))}/>` +
        `<g><ellipse cx="104" cy="44" rx="16" ry="19" fill="#5fae6a"/><text x="104" y="49" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">去</text></g>` +
        `<g ${s.a({0: T(), 22: T(), 50: T(40, -80, 'rotate(20deg)'), 92: 'opacity:0;' + T(40, -80, 'rotate(20deg)'), 100: 'opacity:1;' + T()})}><ellipse cx="196" cy="44" rx="16" ry="19" fill="#b8a0e8"/><text x="196" y="49" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">不去</text></g>` +
        `<g ${s.a(showAt(22, 30))}>${burst(170, 64, 12).replace('<path ', `<path ${sk(CL.g, 2)} `)}</g>` +
        `<g ${s.a(pop(44), ORG(104, 18))}><circle cx="124" cy="22" r="9" ${fl(CL.t)}/><path d="M120 22l3 3 5-6" ${sk('#fff', 2)}/></g>`;
    }},
    decline: {dur: 5.8, hl: [10, 10], end: 58, lit: '向下倾斜', mean: '下降；婉拒', draw: s => {
      return `<rect x="30" y="20" width="240" height="108" rx="4" ${fs(CL.p, CL.m, 1.5)}/><path d="M40 118h220M40 118V28" ${sk(CL.m, 2)}/>` +
        `<path d="M48 40l50 14 40 26 40 10 50 22" ${sk(CL.a, 3.5)} ${DASH} ${s.a(drawP(10, 44))}/><path d="M220 106l10 6-10 4" ${sk(CL.a, 3.5)} ${s.a(showAt(43))}/>` +
        `<g ${s.a({0: 'opacity:0;' + T(0, 0, 'rotate(0deg)'), 8: 'opacity:1;' + T(0, 0, 'rotate(0deg)'), 18: T(50, 14, 'rotate(160deg)'), 28: T(90, 40, 'rotate(320deg)'), 36: T(130, 50, 'rotate(440deg)'), 44: T(180, 72, 'rotate(600deg)'), 92: 'opacity:1;' + T(180, 72, 'rotate(600deg)'), 100: 'opacity:0;' + T(180, 72, 'rotate(600deg)')})}><circle cx="48" cy="32" r="7" ${fl(CL.v)}/><path d="M42 32h12" ${sk('#fff', 1.5)}/></g>` +
        `<g ${s.a(pop(48), ORG(160, 40))}><rect x="128" y="30" width="64" height="20" rx="6" ${fl(CL.a)}/><text x="160" y="44" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">下降 ↓</text></g>`;
    }},
    enable: {dur: 6, hl: [20, 40], end: 60, lit: '使…能够', mean: '使能够', draw: s => {
      return GND() + `<path d="M210 30v98M210 46h60M210 46v6" ${sk(WOOD, 4)}/><rect x="236" y="30" width="16" height="16" rx="2" fill="#e2473a"/>` +
        `<g ${s.a({0: 'opacity:0;' + T(-60, 0), 18: 'opacity:0;' + T(-60, 0), 20: 'opacity:1;' + T(-60, 0), 30: 'opacity:1;' + T(), 92: 'opacity:1;' + T(), 100: 'opacity:0;' + T()})}><path d="M178 128l14-80M198 128l14-80M182 112h18M186 96h18M190 80h18M194 64h18" ${sk(WOOD, 3)}/></g>` +
        kid(70, 128, CL.v, {k: .9, aR: [22, -36]}) + `<g ${s.a(pop(18), ORG(96, 92))}><path d="M90 92l10-4" ${sk(SKIN, 4)}/></g>` +
        `<g ${s.a({0: T(), 8: T(0, -6), 12: T(), 16: T(0, -6), 20: T(), 36: T(), 46: T(56, -40), 92: T(56, -40), 100: T()})}>${kid(176, 128, CL.t, {noFace: true, aR: [14, -60]})}<g ${s.a(hideAt(40))}>${face(176, 128, 1, 'sad')}</g><g ${s.a(showAt(40))}>${face(176, 128)}</g></g>` +
        `<g ${s.a(pop(48), ORG(150, 26))}><rect x="112" y="16" width="76" height="20" rx="6" ${fl(CL.t)}/><text x="150" y="30" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">现在够得着了</text></g>`;
    }},
    island: {dur: 6, hl: [30, 6], end: 60, lit: '被水围住的一块陆地', mean: '岛', draw: s => {
      return `<path d="M60 128q30-34 90-34t90 34z" fill="#e6c98a"/><path d="M150 96V60" ${sk(WOOD, 4)}/><path d="M150 60q-16-6-24 6M150 60q16-6 24 6M150 60q-6-14-18-14M150 60q6-14 18-14" ${sk('#3f8f4f', 4)}/>` +
        `<rect x="0" y="0" width="300" height="150" fill="#6db7e8" opacity=".55" ${s.a({0: 'transform:translateY(150px)', 6: 'transform:translateY(150px)', 30: 'transform:translateY(108px)', 92: 'transform:translateY(108px)', 100: 'transform:translateY(150px)'})}/>` +
        `<path d="M60 128q30-34 90-34t90 34z" fill="#e6c98a" ${s.a({0: 'opacity:0', 28: 'opacity:0', 30: 'opacity:1', 92: 'opacity:1', 100: 'opacity:0'})} transform="translate(0 0)"/>` +
        `<path d="M150 96V60" ${sk(WOOD, 4)} ${s.a(showAt(30))}/><path d="M150 60q-16-6-24 6M150 60q16-6 24 6M150 60q-6-14-18-14M150 60q6-14 18-14" ${sk('#3f8f4f', 4)} ${s.a(showAt(30))}/>` +
        `<g ${s.a(pop(44), ORG(240, 30))}><rect x="214" y="20" width="52" height="20" rx="6" ${fl(CL.a)}/><text x="240" y="34" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">岛</text></g>`;
    }},
    recently: {dur: 6, hl: [10, 30, 50], end: 60, lit: '刚刚又新出现地', mean: '最近', draw: s => {
      const dots = [40, 90, 140, 190];
      return `<path d="M20 90H272" ${sk(CL.m, 3)}/><path d="M264 82l10 8-10 8" ${sk(CL.m, 3)}/>` +
        dots.map((x, i) => `<circle cx="${x}" cy="90" r="6" ${fl(CL.m, .5)} ${s.a(pop(4 + i * 4), ORG(x, 90))}/><text x="${x}" y="114" font-size="8" text-anchor="middle" ${fl(CL.m)}>${['去年', '上月', '上周', '昨天'][i]}</text>`).join('') +
        `<g ${s.a(pop(28), ORG(240, 90))}><circle cx="240" cy="90" r="9" ${fl(CL.a)}/><circle cx="240" cy="90" r="14" ${sk(CL.a, 2)} ${s.a({0: 'opacity:.8;transform:scale(1)', 100: 'opacity:0;transform:scale(2)'}, ORG(240, 90), 1.2)}/></g>` +
        `<text x="240" y="114" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.a)} ${s.a(showAt(28))}>刚刚</text>` +
        `<g ${s.a(pop(48), ORG(240, 54))}><rect x="214" y="44" width="52" height="20" rx="6" ${fl(CL.a)}/><text x="240" y="58" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">最近</text></g>`;
    }},
    resident: {dur: 6, hl: [20, 30, 50], end: 60, lit: '坐下来住着的人', mean: '居民', draw: s => {
      return GND() + `<path d="M140 128V70l50-40 50 40v58z" ${fl(CL.g, .35)}/><path d="M130 72l60-48 60 48" ${sk('#c8664a', 6)}/><rect x="200" y="96" width="24" height="32" fill="${WOOD}"/>` +
        `<rect x="150" y="80" width="30" height="20" ${fl('#bfe1f2')}/><rect x="150" y="80" width="30" height="20" fill="#f6d34a" ${s.a(showAt(40))}/>` +
        `<path d="M150 116h36v-10a4 4 0 0 0-4-4h-28a4 4 0 0 0-4 4z" ${fl(CL.v, .8)}/>` +
        `<g ${s.a({0: 'opacity:1;' + T(), 6: 'opacity:1;' + T(), 22: 'opacity:1;' + T(100, 0), 30: 'opacity:1;' + T(110, -6, 'scale(.8)'), 92: 'opacity:1;' + T(110, -6, 'scale(.8)'), 100: 'opacity:1;' + T()})}>${kid(56, 128, CL.t, {aL: [-14, -34], aR: [14, -34], ...walkLegs(s, 56, 128, 6, 22, 4)})}</g>` +
        `<g ${s.a({0: 'opacity:1;' + T(), 6: 'opacity:1;' + T(), 22: 'opacity:1;' + T(100, 0), 26: 'opacity:0;' + T(100, 0), 94: 'opacity:0;' + T(100, 0), 100: 'opacity:1;' + T()})}><rect x="44" y="90" width="24" height="18" rx="2" fill="${WOOD}"/></g>` +
        `<g ${s.a(pop(48), ORG(80, 40))}><rect x="46" y="30" width="68" height="20" rx="6" ${fl(CL.t)}/><text x="80" y="44" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">住下来了</text></g>`;
    }},
    subject: {dur: 6, hl: [20, 10], end: 60, lit: '摆到下面的功课', mean: '科目；主题', draw: s => {
      const subs = [['语文', CL.a], ['数学', CL.t], ['英语', CL.v], ['科学', CL.g]];
      return `<rect x="50" y="70" width="200" height="56" rx="4" ${fs(CL.p, CL.m, 2)}/><text x="150" y="64" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.k)}>课程表</text>` +
        [0, 1, 2, 3].map(i => `<rect x="${58 + i * 48}" y="80" width="42" height="36" rx="3" ${sk(CL.m, 1.5)} stroke-dasharray="3 3"/>`).join('') +
        subs.map(([t, c], i) => `<g ${s.a(moveIn([[10 + i * 8, 0, -70, 'rotate(-20deg)'], [18 + i * 8, 0, 0, 'rotate(0deg)']]))}><rect x="${58 + i * 48}" y="80" width="42" height="36" rx="3" ${fl(c)}/><text x="${79 + i * 48}" y="102" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">${t}</text></g>`).join('') +
        `<g ${s.a(pop(50), ORG(150, 24))}><rect x="116" y="14" width="68" height="20" rx="6" ${fl(CL.v)}/><text x="150" y="28" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">四门科目</text></g>`;
    }},
    successful: {dur: 6, hl: [30, 50], end: 60, lit: '成功了的', mean: '成功的', draw: s => {
      return GND() + `<path d="M120 128h60M130 128l10-14h20l10 14" ${sk(CL.m, 3)}/>` +
        `<g ${s.a({0: T(), 20: T(), 22: T(-1, 0), 24: T(1, 0), 26: T(-1, 0), 28: T(), 50: T(0, -160), 100: T(0, -160)})}><path d="M150 40q12 12 12 40v20h-24V80q0-28 12-40z" fill="#eef1f4" style="stroke:var(--ink3);stroke-width:1.5px"/><circle cx="150" cy="70" r="5" fill="#6db7e8"/><path d="M138 90l-8 14h8M162 90l8 14h-8" fill="#e2473a"/>` +
        `<g ${s.a(showAt(26, 52))}><path d="M142 104q8 20 16 0" fill="#f6a623"/></g></g>` +
        `<g ${s.a(showAt(26, 40))}><ellipse cx="150" cy="122" rx="40" ry="8" fill="${CL.m}" style="fill:var(--ink3);opacity:.3"/></g>` +
        `<g ${s.a(pop(50), ORG(150, 60))}><rect x="104" y="48" width="92" height="26" rx="8" ${fl(CL.a)}/><text x="150" y="66" font-size="14" font-weight="700" text-anchor="middle" fill="#fff">发射成功!</text></g>` +
        [[90, 30], [210, 34], [120, 100], [190, 96]].map(([x, y], i) => `<g ${s.a(pop(52 + i * 2), ORG(x, y))}>${sparkle(x, y, 6)}</g>`).join('');
    }},
    accept: {dur: 6, hl: [10, 26], end: 60, lit: '伸手拿过来', mean: '接受', draw: s => {
      return GND() + kid(90, 128, '#3d4a5c', {k: 1.1, aR: [20, -34]}) +
        `<g ${s.a({0: T(), 26: T(), 36: T(70, 0), 92: T(70, 0), 100: T()})}><rect x="114" y="82" width="22" height="16" rx="2" fill="#f4e6c8" style="stroke:var(--ink3);stroke-width:1.5px"/><circle cx="130" cy="94" r="3" fill="#d23c2f"/></g>` +
        kid(220, 128, CL.t, {aL: [-14, -30], armL: s.a({0: R(0), 10: R(0), 20: R(30), 92: R(30), 100: R(0)}, shoulder(220, 128, -1))}) +
        `<g ${s.a(pop(40), ORG(220, 50))}>${bubble(220, 50)}<text x="220" y="54" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.t)}>谢谢，我收下</text></g>` +
        `<g ${s.a(pop(46), ORG(160, 40))}><circle cx="160" cy="40" r="9" ${fl(CL.t)}/><path d="M156 40l3 3 5-6" ${sk('#fff', 2)}/></g>`;
    }},
    amount: {dur: 6, hl: [10, 20], end: 60, lit: '堆成一座山', mean: '数量；总额', draw: s => {
      let coins = ''; let k = 0;
      for (let r = 0; r < 5; r++) for (let c = 0; c <= 4 - r; c++) { const x = 110 + c * 20 + r * 10, y = 120 - r * 12; coins += `<g ${s.a(pop(6 + k * 2), ORG(x, y))}><ellipse cx="${x}" cy="${y}" rx="10" ry="5" ${fl(CL.g)} style="stroke:#a8741a;stroke-width:1px"/></g>`; k++; }
      return GND() + coins + `<rect x="210" y="24" width="76" height="28" rx="6" ${fl(CL.k, .8)}/>` +
        ['¥100', '¥500', '¥1500'].map((t, i) => `<text x="248" y="43" font-size="13" font-weight="700" text-anchor="middle" fill="#7cf0b0" ${s.a(i === 0 ? slot([0, 16], 0) : slot([0, i === 1 ? 16 : 30, i === 1 ? 30 : 94], 1))}>${t}</text>`).join('') +
        `<g ${s.a(pop(40), ORG(150, 40))}><path d="M110 50l40-30 40 30" ${sk(CL.m, 2)} stroke-dasharray="4 4"/><text x="150" y="34" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.m)}>山</text></g>` +
        `<g ${s.a(pop(48), ORG(248, 70))}><rect x="216" y="60" width="64" height="20" rx="6" ${fl(CL.a)}/><text x="248" y="74" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">总数量</text></g>`;
    }},
    audience: {dur: 6, hl: [20, 50], end: 60, lit: '来听的人', mean: '观众；听众', draw: s => {
      const wave = dl => `<path d="M90 50q10 12 0 24" ${sk(CL.v, 2.5)} ${s.a({0: 'opacity:0;' + T(), 15: 'opacity:1;' + T(), 85: 'opacity:.3;' + T(80, 30), 100: 'opacity:0;' + T(90, 34)}, `animation-delay:${dl}s;animation-timing-function:linear`, 1.4)}/>`;
      return `<rect x="20" y="70" width="80" height="12" fill="${WOOD}"/>` + kid(60, 70, CL.a, {k: .7, aR: [12, -30]}) + `<path d="M68 52l8-8" ${sk(WOOD, 2)}/><path d="M76 44l6 4" ${sk(CL.k, 2)}/>` +
        `<g ${s.a(showAt(8))}>${wave(0)}${wave(.45)}${wave(.9)}</g>` +
        [0, 1].map(r => [0, 1, 2, 3, 4].map(c => { const x = 140 + c * 30 - r * 10, y = 112 + r * 20; return `<circle cx="${x}" cy="${y}" r="9" fill="${SKIN}"/><path d="M${x - 9} ${y - 1}a9 9 0 0 1 18 0q-4-3-9-2.5t-9 2.5z" fill="${HAIR}"/><path d="M${x - 14} ${y + 22}q0-12 14-12t14 12z" ${fl([CL.t, CL.v, CL.g][(r + c) % 3])}/>` +
          `<g ${s.a(pop(20 + (r * 5 + c) * 2), ORG(x - 10, y))}><ellipse cx="${x - 10}" cy="${y}" rx="3" ry="5" fill="#f2a3b3"/></g>`; }).join('')).join('') +
        `<g ${s.a(pop(50), ORG(220, 40))}><rect x="186" y="30" width="68" height="20" rx="6" ${fl(CL.v)}/><text x="220" y="44" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">都在听</text></g>`;
    }},
    current: {dur: 6, hl: [6, 50], end: 60, lit: '正在流动着的', mean: '当前的；水流；电流', draw: s => {
      return `<rect x="0" y="60" width="300" height="70" fill="#6db7e8" opacity=".45"/>` +
        [70, 90, 110].map((y, i) => `<path d="M-40 ${y}h40l8-6v12l-8-6" ${sk('#fff', 2.5, .8)} ${s.a({0: T(), 100: T(340, 0)}, `animation-delay:${i * .5}s;animation-timing-function:linear`, 2.2)}/>`).join('') +
        `<g ${s.a({0: T(0, 0, 'rotate(-4deg)'), 50: T(160, 0, 'rotate(4deg)'), 92: T(200, 0, 'rotate(-4deg)'), 100: T(0, 0, 'rotate(-4deg)')})}><path d="M20 84h44l-8 12H28z" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M42 84V62l14 18z" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/></g>` +
        GND(0, 300) + `<path d="M30 30h120" ${sk(CL.k, 3)}/><path d="M30 30h120" ${sk(CL.g, 2)} stroke-dasharray="4 8" ${s.a({0: 'stroke-dashoffset:0', 100: 'stroke-dashoffset:-48'}, 'animation-timing-function:linear', 1)}/>` +
        `<path d="M150 22a10 10 0 1 1 0 .1" fill="#f6d34a"/><path d="M150 12v-4M138 18l-3-3M162 18l3-3" ${sk(CL.g, 2)}/>` +
        `<g ${s.a(pop(50), ORG(240, 30))}><rect x="206" y="20" width="68" height="20" rx="6" ${fl(CL.t)}/><text x="240" y="34" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">流动中</text></g>`;
    }},
    // ---------- 第二十批 ----------
    disease: {dur: 6, hl: [30, 6], end: 60, lit: '浑身不舒服', mean: '疾病', draw: s => {
      const germ = (x, y, p) => `<g ${s.a(moveIn([[p, 60, -40, 'scale(.4)'], [p + 10, 0, 0, 'scale(1)']]), ORG(x, y))}><g ${s.a({0: R(0), 100: R(360)}, ORG(x, y) + ';animation-timing-function:linear', 2)}><circle cx="${x}" cy="${y}" r="7" fill="#7fbf5a"/><path d="M${x - 10} ${y}h20M${x} ${y - 10}v20M${x - 7} ${y - 7}l14 14M${x + 7} ${y - 7}l-14 14" ${sk('#7fbf5a', 2)}/></g><circle cx="${x - 2}" cy="${y - 1}" r="1.2" fill="${INK}"/><circle cx="${x + 2}" cy="${y - 1}" r="1.2" fill="${INK}"/></g>`;
      return `<path d="M60 128v-24q0-8 8-8h104q8 0 8 8v24z" ${fl(CL.v, .6)}/><path d="M60 104h120v-16q0-8-8-8H68q-8 0-8 8z" ${fl(CL.v, .4)}/>` + GND() +
        kid(120, 104, CL.a, {noFace: true, aL: [-16, -24], aR: [16, -24]}) + `<g ${s.a(hideAt(30))}>${face(120, 104)}</g><g ${s.a(showAt(30))}>${face(120, 104, 1, 'sad')}<path d="M114 54q-3 5 0 7" ${sk('#6db7e8', 2.5)}/></g>` +
        `<g ${s.a(showAt(30))}><circle cx="120" cy="52" r="11" fill="#9fd88a" opacity=".45"/></g>` +
        germ(150, 60, 14) + germ(96, 70, 20) + germ(150, 90, 26) +
        `<g ${s.a(pop(40), ORG(230, 50))}><rect x="224" y="30" width="8" height="30" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><circle cx="228" cy="64" r="6" fill="#e2473a"/><rect x="226" y="40" width="4" height="22" fill="#e2473a"/><text x="250" y="50" font-size="10" font-weight="700" ${fl(CL.a)}>39°</text></g>`;
    }},
    elderly: {dur: 6, hl: [6, 50], end: 60, lit: '上了年纪的', mean: '年长的；老年人', draw: s => {
      return GND() + kid(110, 128, CL.m, {noFace: true, k: 1, aR: [14, -26]}) + `<path d="M98 72a12 12 0 0 1 24 0q-6-4-12-3t-12 3z" fill="#e6e6e6"/>` + face(110, 128) + `<path d="M104 80q6 4 12 0" ${sk('#e6e6e6', 2)}/><path d="M124 106v22" ${sk(WOOD, 3)}/><path d="M118 106h8" ${sk(WOOD, 3)}/>` +
        `<g ${s.a(moveIn([[16, 60, 0], [30, 0, 0]]))}>${kid(150, 128, CL.t, {k: .7, aL: [-16, -30]})}</g>` +
        `<rect x="210" y="98" width="56" height="30" rx="4" fill="#f2c9a0"/><path d="M210 106q14 6 28 0t28 0" fill="#fff" opacity=".8"/>` + [0, 1, 2, 3, 4].map(i => `<rect x="${216 + i * 10}" y="86" width="3" height="12" ${fl(CL.a)}/><path d="M${217.5 + i * 10} 80q-3 3 0 6q3-3 0-6z" fill="#f6a623" ${s.a(pop(8 + i * 4), ORG(217.5 + i * 10, 83))}/>`).join('') +
        `<text x="238" y="120" font-size="12" font-weight="700" text-anchor="middle" fill="#b8432f">80</text>` +
        `<g ${s.a(pop(46), ORG(130, 40))}>${heartAt(130, 40, .9)}</g>`;
    }},
    imagine: {dur: 6, hl: [20, 50], end: 60, lit: '在脑中成像', mean: '想象', draw: s => {
      return GND() + kid(60, 128, CL.t, {noFace: true}) + face(60, 128) + `<path d="M54 76h4M62 76h4" ${sk(INK, 2)}/>` + `<circle cx="80" cy="66" r="3" ${fl(CL.m, .5)}/><circle cx="94" cy="58" r="4.5" ${fl(CL.m, .5)}/>` +
        `<path d="M110 66a18 18 0 0 1 14-30 28 28 0 0 1 52-6 24 24 0 0 1 46 8 18 18 0 0 1 6 34H122a14 14 0 0 1-12-6z" ${fs(CL.p, CL.m, 2)}/>` +
        `<g ${s.a({0: 'opacity:0;transform:scale(.6)', 16: 'opacity:0;transform:scale(.6)', 36: 'opacity:1;transform:scale(1)', 92: 'opacity:1;transform:scale(1)', 100: 'opacity:0;transform:scale(1)'}, ORG(170, 50))}>` +
        `<path d="M140 70V40h10v-6h6v6h12v-6h6v6h10v30z" fill="#b8a0e8"/><rect x="156" y="54" width="10" height="16" rx="5" fill="${WOOD}"/><path d="M178 70V34l4-10 4 10v36z" fill="#9a84d0"/><path d="M182 24v-8l8 3-8 3" fill="#e2473a"/>` +
        `<path d="M196 50q10-12 20-4l6-6v10l6 4-8 2q-10 10-24-6z" fill="#5fae6a"/></g>` +
        `<g ${s.a(pop(50), ORG(170, 110))}><rect x="136" y="100" width="68" height="20" rx="6" ${fl(CL.v)}/><text x="170" y="114" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">想象出来</text></g>`;
    }},
    interaction: {dur: 5.6, hl: [10, 20, 50], end: 58, lit: '相互之间你来我往', mean: '互动；相互作用', draw: s => {
      const ball = {0: 'opacity:1;' + T(0, 0)}; for (let i = 0; i < 4; i++) { const p = 6 + i * 10, go = i % 2 === 0; ball[p] = 'opacity:1;' + T(go ? 0 : 140, 0); ball[p + 5] = 'opacity:1;' + T(70, -40); ball[p + 10] = 'opacity:1;' + T(go ? 140 : 0, 0); } ball[92] = 'opacity:1;' + T(0, 0); ball[100] = 'opacity:1;' + T(0, 0);
      return GND() + kid(60, 128, CL.t, {aR: [16, -40]}) + kid(240, 128, CL.a, {aL: [-16, -40]}) +
        `<g ${s.a(ball)}><circle cx="80" cy="86" r="7" ${fl(CL.g)}/><path d="M73 86h14M80 79v14" ${sk('#fff', 1.2)}/></g>` +
        `<path d="M90 60Q150 10 210 60" ${sk(CL.v, 2)} stroke-dasharray="4 5" ${s.a(fadeP(10, 16))}/><path d="M204 52l6 8-10 2" ${sk(CL.v, 2)} ${s.a(showAt(15))}/><path d="M96 66l-6-6 10-2" ${sk(CL.v, 2)} ${s.a(showAt(15))}/>` +
        `<g ${s.a(pop(50), ORG(150, 112))}><rect x="116" y="102" width="68" height="20" rx="6" ${fl(CL.t)}/><text x="150" y="116" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">你来我往</text></g>`;
    }},
    recognize: {dur: 6, hl: [20, 30, 50], end: 60, lit: '再一次认出来', mean: '认出；认可', draw: s => {
      return GND() + [130, 170, 250].map((x, i) => kid(x, 128, [CL.m, CL.v, CL.m][i], {k: .75})).join('') + kid(210, 128, CL.a, {k: .75}) +
        kid(60, 128, CL.t, {noFace: true}) + `<g ${s.a(hideAt(30))}>${face(60, 128)}<text x="78" y="62" font-size="14" font-weight="700" ${fl(CL.v)}>?</text></g><g ${s.a(showAt(30))}>${face(60, 128)}<text x="78" y="62" font-size="16" font-weight="700" ${fl(CL.a)}>!</text></g>` +
        `<g ${s.a({0: 'opacity:0', 12: 'opacity:0', 16: 'opacity:1', 92: 'opacity:1', 100: 'opacity:0'})}><path d="M84 48a10 10 0 0 1 8-14 14 14 0 0 1 24 0 10 10 0 0 1 6 14z" ${fs(CL.p, CL.m, 1.5)}/><circle cx="104" cy="40" r="5" fill="${SKIN}"/><path d="M98 50q0-6 6-6t6 6z" ${fl(CL.a)}/></g>` +
        `<path d="M110 40Q170 20 210 70" ${sk(CL.a, 2)} stroke-dasharray="3 4" ${s.a(fadeP(28, 34))}/>` +
        `<g ${s.a(pop(32), ORG(210, 62))}><circle cx="210" cy="84" r="22" ${sk(CL.a, 3)}/></g>` +
        `<g ${s.a(pop(48), ORG(210, 30))}><rect x="176" y="18" width="68" height="20" rx="6" ${fl(CL.a)}/><text x="210" y="32" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">认出来了!</text></g>`;
    }},
    rely: {dur: 6, hl: [20, 10], end: 60, lit: '绑在别人身上', mean: '依靠；信赖', draw: s => {
      const lean = {0: T(0, 0, 'rotate(0deg)'), 20: T(0, 0, 'rotate(0deg)'), 32: T(14, 0, 'rotate(16deg)'), 92: T(14, 0, 'rotate(16deg)'), 100: T(0, 0, 'rotate(0deg)')};
      return GND() + kid(190, 128, '#3d4a5c', {k: 1.25}) + `<g ${s.a(lean, FOOT)}>${kid(144, 128, CL.t, {k: .75, aR: [16, -30]})}</g>` +
        `<path d="M150 104q20 6 40 0" ${sk(WOOD, 3)} ${DASH} ${s.a(drawP(10, 20))}/><path d="M148 100q22 10 44 0" ${sk(WOOD, 3)} ${DASH} ${s.a(drawP(12, 22))}/>` +
        `<g ${s.a(pop(36), ORG(170, 50))}>${heartAt(170, 50, .9)}</g>` +
        `<g ${s.a(pop(48), ORG(80, 40))}><rect x="46" y="30" width="68" height="20" rx="6" ${fl(CL.t)}/><text x="80" y="44" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">靠着你</text></g>`;
    }},
    responsibility: {dur: 6, hl: [10, 20, 50], end: 60, lit: '答应了要回应的事', mean: '责任；职责', draw: s => {
      return GND() + kid(100, 128, '#3d4a5c', {k: 1.05, aR: [20, -30]}) + kid(200, 128, CL.t, {aL: [-20, -30], aR: [14, -54]}) +
        `<g ${s.a(pop(8), ORG(150, 96))}><circle cx="150" cy="98" r="6" fill="${SKIN}"/></g>` +
        `<g ${s.a(pop(16), ORG(150, 50))}>${bubble(150, 50)}<text x="150" y="54" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.t)}>交给我!</text></g>` +
        `<g ${s.a({0: 'opacity:0;' + T(-60, -20), 26: 'opacity:0;' + T(-60, -20), 28: 'opacity:1;' + T(-60, -20), 40: 'opacity:1;' + T(0, 0), 92: 'opacity:1;' + T(0, 0), 100: 'opacity:0;' + T(0, 0)})}><rect x="196" y="40" width="40" height="26" rx="3" fill="${WOOD}"/><text x="216" y="58" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">责任</text></g>` +
        `<g ${s.a(pop(48), ORG(200, 100))}><rect x="192" y="94" width="16" height="11" rx="2" ${fl(CL.a)}/><text x="200" y="102.5" font-size="7" font-weight="700" text-anchor="middle" fill="#fff">负责</text></g>`;
    }},
    stranger: {dur: 6, hl: [10, 46], end: 60, lit: '陌生的人', mean: '陌生人', draw: s => {
      return GND() + `<rect x="10" y="40" width="50" height="88" ${fl(WOOD, .55)}/>` +
        `<g ${s.a(move([[6, 60, 0], [20, 0, 0]]))}><g>${kid(230, 128, '#5a5a6a', {k: 1.05, noFace: true})}<path d="M216 72h28l-3-10h-22z" fill="${INK}"/><path d="M212 72h36" ${sk(INK, 3)}/><path d="M220 84h20" ${sk(INK, 2)}/><circle cx="226" cy="79" r="1.5" fill="${INK}"/><circle cx="234" cy="79" r="1.5" fill="${INK}"/></g></g>` +
        `<g ${s.a(pop(22), ORG(230, 40))}><text x="230" y="46" font-size="20" font-weight="700" text-anchor="middle" ${fl(CL.v)}>?</text></g>` +
        kid(110, 128, CL.v, {k: 1.1}) + `<g ${s.a({0: T(), 20: T(), 28: T(-20, 0), 92: T(-20, 0), 100: T()})}>${kid(126, 128, CL.a, {k: .6, noFace: true})}${face(126, 128, .6, 'sad')}</g>` +
        `<g ${s.a(pop(46), ORG(160, 30))}><rect x="126" y="20" width="68" height="20" rx="6" ${fl(CL.v)}/><text x="160" y="34" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">不认识他</text></g>`;
    }},
    teaching: {dur: 6, hl: [6, 50], end: 60, lit: '教的这件事', mean: '教学', draw: s => {
      return GND() + `<rect x="150" y="84" width="110" height="8" fill="${WOOD}"/><path d="M160 92v36M250 92v36" ${sk(WOOD, 3)}/><rect x="176" y="60" width="64" height="24" rx="2" fill="#fffdf6" style="stroke:var(--ink3);stroke-width:1.5px"/>` +
        `<path d="M200 66l-8 14M200 66l10 14" ${sk(INK, 3)} ${DASH} ${s.a(drawP(16, 30))}/>` +
        kid(200, 128, CL.t, {k: .75, aR: [12, -32]}) + kid(140, 128, CL.v, {k: 1.05, aR: [34, -36]}) +
        `<g ${s.a(move([[16, 0, 0], [24, -6, 10], [30, 10, 10]]))}><path d="M208 64l6-10" ${sk(CL.a, 2.5)}/></g>` +
        `<g ${s.a(pop(34), ORG(80, 50))}>${bubble(80, 50)}<text x="80" y="54" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.v)}>一撇一捺</text></g>` +
        `<g ${s.a(pop(50), ORG(240, 40))}><circle cx="246" cy="44" r="10" ${fl(CL.t)}/><path d="M242 44l3 3 5-6" ${sk('#fff', 2)}/></g>`;
    }},
    colleague: {dur: 6, hl: [20, 10], end: 60, lit: '同一个团队里的人', mean: '同事', draw: s => {
      return GND() + `<rect x="100" y="14" width="100" height="26" rx="6" ${fl(CL.v)}/><text x="150" y="31" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">市场部</text>` +
        [80, 130, 180, 230].map((x, i) => `<g ${s.a(moveIn([[6 + i * 4, (x < 150 ? -60 : 60), 0], [20 + i * 4, 0, 0]]))}>${kid(x, 128, ['#3d4a5c', CL.t, CL.a, CL.g][i], {k: .85, aL: [-14, -46], aR: [14, -46]})}<rect x="${x - 6}" y="94" width="12" height="9" rx="2" ${fl(CL.v)}/></g>`).join('') +
        `<g ${s.a(showAt(36, 46))}>${burst(155, 74, 14).replace('<path ', `<path ${sk(CL.g, 2)} `)}${burst(105, 74, 14).replace('<path ', `<path ${sk(CL.g, 2)} `)}${burst(205, 74, 14).replace('<path ', `<path ${sk(CL.g, 2)} `)}</g>` +
        `<g ${s.a(pop(48), ORG(150, 140))}><rect x="110" y="132" width="80" height="16" rx="5" ${fl(CL.t)}/><text x="150" y="144" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">我们是同事</text></g>`;
    }},
    depend: {dur: 6, hl: [10, 10], end: 60, lit: '挂在别人身上', mean: '依靠；取决于', draw: s => {
      const swing = {0: R(0), 100: R(0)}; for (let i = 0; i < 6; i++) swing[10 + i * 8] = R(i % 2 ? -14 : 14); swing[58] = R(0);
      return `<path d="M0 40q80-14 300 0" ${sk(WOOD, 8)}/><path d="M260 40q10-20 30-24" ${sk(WOOD, 5)}/><circle cx="270" cy="24" r="14" fill="#3f8f4f"/>` +
        `<g ${s.a(swing, ORG(150, 40))}><path d="M150 40v40" ${sk(CL.m, 2)}/><circle cx="150" cy="96" r="14" fill="#8b5a3a"/><circle cx="150" cy="82" r="8" fill="#8b5a3a"/><circle cx="147" cy="81" r="1.4" fill="${INK}"/><circle cx="153" cy="81" r="1.4" fill="${INK}"/><path d="M150 108q10 16 0 24" ${sk('#8b5a3a', 3)}/><path d="M144 76l-4-8M156 76l4-8" ${sk('#8b5a3a', 3)}/></g>` +
        `<g ${s.a(pop(46), ORG(70, 100))}><rect x="34" y="90" width="72" height="20" rx="6" ${fl(CL.v)}/><text x="70" y="104" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">全靠这根枝</text></g>` + GND();
    }},
    major: {dur: 6, hl: [10, 50], end: 60, lit: '大的那个', mean: '主要的；专业', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#cfe5c8" opacity=".5"/>` +
        `<path d="M0 90h300" ${sk(CL.m, 26)}/><path d="M0 90h300" ${sk('#fff', 2)} stroke-dasharray="10 10"/>` +
        `<path d="M80 90L120 10M200 90L250 150" ${sk(CL.m, 8, .6)}/>` +
        `<g ${s.a({0: 'opacity:0;' + T(-40, 0), 8: 'opacity:1;' + T(-40, 0), 50: 'opacity:1;' + T(300, 0), 52: 'opacity:0;' + T(320, 0), 100: 'opacity:0'})}><rect x="20" y="78" width="40" height="16" rx="5" fill="#e2473a"/><rect x="28" y="72" width="22" height="10" rx="3" fill="#e2473a"/><circle cx="30" cy="96" r="5" fill="${INK}"/><circle cx="52" cy="96" r="5" fill="${INK}"/></g>` +
        `<g ${s.a(pop(10), ORG(150, 60))}><rect x="122" y="52" width="56" height="18" rx="4" fill="#3f8f4f"/><text x="150" y="65" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">主干道</text></g>` +
        `<g ${s.a(pop(50), ORG(240, 30))}><rect x="206" y="20" width="68" height="20" rx="6" ${fl(CL.a)}/><text x="240" y="34" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">主要的</text></g>`;
    }},
    // ---------- 第二十一批 ----------
    related: {dur: 6, hl: [20, 50], end: 60, lit: '有联系的', mean: '相关的；亲属的', draw: s => {
      const face0 = (x, y, hair, c, p) => `<g ${s.a(pop(p), ORG(x, y))}><circle cx="${x}" cy="${y}" r="12" fill="${SKIN}"/><path d="M${x - 12} ${y - 1}a12 12 0 0 1 24 0q-6-4-12-3t-12 3z" fill="${hair}"/><circle cx="${x - 4}" cy="${y + 1}" r="1.5" fill="${INK}"/><circle cx="${x + 4}" cy="${y + 1}" r="1.5" fill="${INK}"/><path d="M${x - 16} ${y + 26}q0-12 16-12t16 12z" fill="${c}"/></g>`;
      return face0(150, 24, '#e6e6e6', 'var(--ink3)', 4) + face0(90, 72, HAIR, 'var(--violet)', 12) + face0(210, 72, HAIR, 'var(--gold)', 16) + face0(60, 118, HAIR, 'var(--teal)', 24) + face0(120, 118, HAIR, 'var(--accent)', 28) +
        [[150, 50, 90, 58], [150, 50, 210, 58], [90, 98, 60, 104], [90, 98, 120, 104]].map(([a, b, c, d], i) => `<path d="M${a} ${b}L${c} ${d}" ${sk(CL.v, 2.5)} ${DASH} ${s.a(drawP(20 + i * 5, 26 + i * 5))}/>`).join('') +
        `<g ${s.a(pop(50), ORG(240, 120))}><rect x="204" y="110" width="72" height="20" rx="6" ${fl(CL.v)}/><text x="240" y="124" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">一家人</text></g>`;
    }},
    unite: {dur: 6, hl: [30, 50], end: 60, lit: '合成一个', mean: '团结；联合', draw: s => {
      const fishAt = (x, y, c = '#e2473a') => `<path d="M${x - 6} ${y}q6-5 12 0q-6 5-12 0zM${x - 6} ${y}l-4-3v6z" fill="${c}"/>`;
      const spots = []; for (let r = -2; r <= 2; r++) for (let c = -3; c <= 3; c++) if (Math.abs(r) * 1.6 + Math.abs(c) * .9 < 4) spots.push([170 + c * 14, 72 + r * 10]);
      return `<rect x="0" y="0" width="300" height="150" fill="#6db7e8" opacity=".35"/>` +
        spots.map(([x, y], i) => { const sx = ((i * 73) % 260) + 20, sy = ((i * 41) % 110) + 20;
          return `<g ${s.a({0: T(sx - x, sy - y), 8: T(sx - x, sy - y), 30: T(0, 0), 92: T(0, 0), 100: T(sx - x, sy - y)})}>${fishAt(x, y)}</g>`; }).join('') +
        `<circle cx="206" cy="66" r="3" fill="#fff" ${s.a(showAt(30))}/>` +
        `<g ${s.a({0: T(), 30: T(), 46: T(-90, 0, 'scale(1,1)'), 50: T(-100, 0, 'scale(-1,1)'), 92: T(-160, 0, 'scale(-1,1)'), 100: T()})}><path d="M60 110q30-16 60 0q-30 16-60 0zM60 110l-12-8v16z" fill="#556070"/><circle cx="104" cy="106" r="2" fill="#fff"/></g>` +
        `<g ${s.a(pop(50), ORG(240, 130))}><rect x="196" y="120" width="88" height="20" rx="6" ${fl(CL.a)}/><text x="240" y="134" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">团结成一条大鱼</text></g>`;
    }},
    visit: {dur: 6, hl: [30, 10], end: 60, lit: '去看看', mean: '参观；拜访', draw: s => {
      return GND() + `<path d="M180 128V40h110v88" ${fl(CL.m, .2)}/><path d="M174 40l61-24 61 24z" ${fl(CL.m, .4)}/><text x="235" y="36" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>博物馆</text>` +
        `<path d="M200 118h70M210 118q0-20 16-20t20-10 16 0 6 10M226 98v20M246 88v30M262 88q6-14 14-10" ${sk('#d8c8b0', 4)}/><circle cx="276" cy="76" r="6" fill="#d8c8b0"/>` +
        `<g ${s.a(move([[10, 0, 0], [30, 90, 0]]))}>${kid(60, 128, CL.t, {...walkLegs(s, 60, 128, 10, 30, 5)})}</g>` +
        `<path d="M160 76Q200 60 240 90" ${sk(CL.t, 2)} stroke-dasharray="3 4" ${s.a(fadeP(32, 38))}/>` +
        `<g ${s.a(pop(34), ORG(150, 50))}><path d="M138 50q12-10 24 0q-12 10-24 0z" ${fs(CL.p, CL.k, 1.5)}/><circle cx="150" cy="50" r="3" ${fl(CL.k)}/></g>` +
        `<g ${s.a(pop(48), ORG(110, 30))}><rect x="76" y="20" width="68" height="20" rx="6" ${fl(CL.t)}/><text x="110" y="34" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">去看看</text></g>`;
    }},
    writing: {dur: 6, hl: [6, 50], end: 60, lit: '写的这件事', mean: '写作', draw: s => {
      return `<rect x="70" y="16" width="160" height="118" rx="3" fill="#fffdf6" style="stroke:var(--ink3);stroke-width:2px"/><text x="150" y="32" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>Part I  Writing</text>` +
        [0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M82 ${48 + i * 12}h136" ${sk(CL.m, 1, .4)}/><path d="M84 ${46 + i * 12}c8-4 10 2 18-1s10 2 18-1 10 2 18-1 10 2 18-1 10 2 18-1 10 2 18-1" ${sk(CL.v, 1.6)} ${DASH} ${s.a(drawP(6 + i * 6, 12 + i * 6))}/>`).join('') +
        `<g ${s.a({0: T(0, 0), ...Object.fromEntries([0, 1, 2, 3, 4, 5, 6].flatMap(i => [[6 + i * 6, T(0, i * 12)], [12 + i * 6, T(126, i * 12)]])), 92: T(126, 72), 100: T(0, 0)})}><path d="M84 46l-8 8M84 46l10-18 4 2-10 18z" ${fl(CL.k)}/></g>` +
        `<circle cx="262" cy="30" r="14" ${fs(CL.p, CL.k, 2)}/><g ${s.a({0: R(0), 100: R(360)}, ORG(262, 30) + ';animation-timing-function:linear', 2)}><path d="M262 30v-10" ${sk(CL.a, 2)}/></g>`;
    }},
    associate: {dur: 6, hl: [30, 10], end: 60, lit: '拉到一起成伙伴', mean: '把…联系起来', draw: s => {
      const items = [[60, 40, `<circle cx="60" cy="40" r="12" ${fl(CL.g)}/>`, '太阳'], [240, 40, `<path d="M232 50l8-22 8 22z" fill="#f2a3b3"/><circle cx="240" cy="28" r="6" fill="#fff"/>`, '冰淇淋'], [60, 116, `<path d="M44 120q16-12 32 0" ${sk('#6db7e8', 4)}/>`, '海边'], [240, 116, `<path d="M226 112a14 14 0 0 0 28 0z" fill="#e2473a"/><path d="M226 112h28" stroke="#3f8f4f" stroke-width="3"/><circle cx="236" cy="117" r="1.4" fill="#2b2b2b"/><circle cx="244" cy="117" r="1.4" fill="#2b2b2b"/>`, '西瓜']];
      return `<g ${s.a(pop(4), ORG(150, 78))}><ellipse cx="150" cy="78" rx="34" ry="20" ${fl(CL.a)}/><text x="150" y="83" font-size="13" font-weight="700" text-anchor="middle" fill="#fff">夏天</text></g>` +
        items.map(([x, y, art, label], i) => `<path d="M150 78L${x} ${y}" ${sk(CL.v, 2.5)} ${DASH} ${s.a(drawP(10 + i * 8, 16 + i * 8))}/><g ${s.a(pop(16 + i * 8), ORG(x, y))}><circle cx="${x}" cy="${y}" r="18" fill="#fff" style="stroke:var(--violet);stroke-width:2px"/>${art}</g><text x="${x}" y="${y + 30}" font-size="8" font-weight="700" text-anchor="middle" ${fl(CL.m)} ${s.a(showAt(18 + i * 8))}>${label}</text>`).join('');
    }},
    attract: {dur: 5.6, hl: [20, 10], end: 58, lit: '朝这边拉过来', mean: '吸引', draw: s => {
      const clip = (x, y, p) => `<g ${s.a({0: T(), [p]: T(), [p + 12]: T(f1(200 - x), f1(76 - y), 'rotate(30deg)'), 92: T(f1(200 - x), f1(76 - y), 'rotate(30deg)'), 100: T()})}><rect x="${x - 6}" y="${y - 3}" width="12" height="6" rx="3" ${sk(CL.m, 2)}/></g>`;
      return GND() + `<path d="M218 56h20a20 20 0 0 1 0 40h-20v-12h20a8 8 0 0 0 0-16h-20z" fill="#d23c2f"/><rect x="212" y="56" width="10" height="12" ${fl(CL.m)}/><rect x="212" y="84" width="10" height="12" ${fl(CL.m)}/>` +
        [0, 1, 2].map(i => `<path d="M200 ${66 + i * 10}h-14" ${sk(CL.v, 2)} ${s.a({0: 'opacity:0;' + T(), 20: 'opacity:1;' + T(), 100: 'opacity:0;' + T(-30)}, `animation-delay:${i * .2}s`, 1)}/>`).join('') +
        clip(40, 110, 10) + clip(70, 90, 16) + clip(100, 120, 22) + clip(60, 50, 28) + clip(120, 70, 34) +
        `<g ${s.a(pop(50), ORG(110, 30))}><rect x="76" y="20" width="68" height="20" rx="6" ${fl(CL.a)}/><text x="110" y="34" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">全被吸过来</text></g>`;
    }},
    creativity: {dur: 6, hl: [10, 50], end: 60, lit: '创造的本事', mean: '创造力', draw: s => {
      const blocks = [[150, 116, 40, 14, CL.v], [150, 100, 26, 18, CL.t], [150, 80, 20, 16, CL.g], [136, 98, 8, 20, CL.a], [164, 98, 8, 20, CL.a], [144, 130, 10, 12, CL.k], [156, 130, 10, 12, CL.k], [150, 68, 4, 8, CL.a]];
      return GND() + blocks.map(([x, y, w, h, c], i) => `<g ${s.a(moveIn([[6 + i * 5, ((i * 61) % 200) - 100, -60, 'rotate(' + (i * 40) + 'deg)'], [12 + i * 5, 0, 0, 'rotate(0deg)']]))}><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="2" ${fl(c)}/></g>`).join('') +
        `<g ${s.a(pop(50), ORG(150, 80))}><circle cx="146" cy="78" r="2" fill="#fff"/><circle cx="154" cy="78" r="2" fill="#fff"/></g>` +
        kid(60, 128, CL.a, {aR: [16, -44]}) + `<g ${s.a(pop(6), ORG(60, 44))}><path d="M52 46a8 8 0 1 1 16 0c0 4-3 5-3 9h-10c0-4-3-5-3-9z" ${fl(CL.g)}/></g>` +
        `<g ${s.a(pop(52), ORG(240, 40))}><rect x="204" y="30" width="72" height="20" rx="6" ${fl(CL.v)}/><text x="240" y="44" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">我拼的机器人</text></g>`;
    }},
    ensure: {dur: 6, hl: [20, 36], end: 60, lit: '使它确定无误', mean: '确保', draw: s => {
      return GND() + `<rect x="160" y="30" width="80" height="98" fill="${WOOD}"/><circle cx="226" cy="84" r="4" fill="#f2b632"/>` +
        `<g ${s.a({0: 'opacity:0', 18: 'opacity:0', 22: 'opacity:1', 92: 'opacity:1', 100: 'opacity:0'})}><path d="M214 92v-4a6 6 0 0 1 12 0v4" ${sk(CL.k, 2)}/><rect x="212" y="92" width="16" height="12" rx="2" ${fl(CL.k)}/></g>` +
        `<g ${s.a({0: T(), 22: T(), 26: T(-4), 28: T(4), 30: T(-4), 32: T(4), 34: T(), 100: T()})}>${kid(130, 128, CL.t, {aR: [26, -40]})}</g>` +
        `<g ${s.a(pop(36), ORG(200, 30))}><path d="M200 12l18 6v12c0 10-8 16-18 20-10-4-18-10-18-20V18z" fill="#3fbf6a"/><path d="M192 30l6 6 10-11" ${sk('#fff', 3)}/></g>` +
        `<g ${s.a(pop(48), ORG(80, 40))}><rect x="46" y="30" width="68" height="20" rx="6" ${fl(CL.t)}/><text x="80" y="44" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">确保锁好了</text></g>`;
    }},
    friendship: {dur: 6, hl: [6, 30], end: 60, lit: '朋友之间的关系', mean: '友谊', draw: s => {
      return GND() + [0, 1, 2, 3, 4, 5].map(i => `<path d="M${30 + i * 48} 0l-6 14" ${sk('#6db7e8', 2)} ${s.a({0: T(0, -10), 100: T(-10, 150)}, `animation-delay:${i * .15}s;animation-timing-function:linear`, .9)}/>`).join('') +
        kid(120, 128, CL.t, {aR: [18, -48]}) + `<g ${s.a(move([[6, 80, 0], [24, 0, 0]]))}>${kid(176, 128, CL.a, {...walkLegs(s, 176, 128, 6, 24, 4)})}</g>` +
        `<path d="M138 80V54" ${sk(CL.k, 2)}/><path d="M104 56q44-36 88 0z" ${fl(CL.v)} ${s.a(pop(26), ORG(148, 50))}/>` +
        `<g ${s.a(pop(34), ORG(148, 30))}>${heartAt(148, 30, 1)}</g>` +
        `<g ${s.a(pop(48), ORG(240, 40))}><rect x="210" y="30" width="60" height="20" rx="6" ${fl(CL.v)}/><text x="240" y="44" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">好朋友</text></g>`;
    }},
    majority: {dur: 6, hl: [30, 50], end: 60, lit: '占大头的那部分', mean: '大多数', draw: s => {
      const xs = [30, 56, 82, 108, 134, 160, 186, 212, 238, 264];
      return GND() + xs.map((x, i) => kid(x, 128, i < 7 ? CL.t : CL.m, {k: .55, armR: i < 7 ? s.a({0: R(0), [8 + i * 2]: R(0), [12 + i * 2]: R(-150), 92: R(-150), 100: R(0)}, shoulder(x, 128, 1, .55)) : ''})).join('') +
        `<circle cx="150" cy="40" r="22" ${fl(CL.m, .35)}/><path d="M150 40V18A22 22 0 1 1 129 47z" ${fl(CL.t)} ${s.a(pop(30), ORG(150, 40))}/>` +
        `<g ${s.a(pop(46), ORG(230, 40))}><rect x="196" y="30" width="68" height="20" rx="6" ${fl(CL.t)}/><text x="230" y="44" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">7 / 10 举手</text></g>`;
    }},
    national: {dur: 6, hl: [10, 50], end: 60, lit: '国家的', mean: '国家的；全国的', draw: s => {
      const firework = (x, y, c, p) => `<g ${s.a({0: 'opacity:0;transform:scale(.2)', [p]: 'opacity:0;transform:scale(.2)', [p + 4]: 'opacity:1;transform:scale(1)', [p + 14]: 'opacity:0;transform:scale(1.3)', 100: 'opacity:0'}, ORG(x, y))}>${burst(x, y, 18).replace('<path ', `<path ${sk(c, 2.5)} `)}</g>`;
      return `<rect x="0" y="0" width="300" height="150" fill="#1d2440" opacity=".25"/>` + GND() + `<path d="M150 128V20" ${sk(CL.m, 3)}/>` +
        `<g ${s.a({0: T(0, 80), 8: T(0, 80), 34: T(0, 0), 92: T(0, 0), 100: T(0, 80)})}><g ${s.a({0: 'transform:skewY(0deg)', 50: 'transform:skewY(-6deg)', 100: 'transform:skewY(0deg)'}, 'transform-origin:0% 50%;transform-box:fill-box', 1.2)}><rect x="150" y="20" width="48" height="32" fill="#d23c2f"/><path d="M162 28l2 4 4 0-3 2.5 1 4-4-2.5-4 2.5 1-4-3-2.5 4 0z" fill="#f6d34a"/></g></g>` +
        firework(60, 40, '#f6d34a', 40) + firework(240, 50, '#e2473a', 46) + firework(90, 70, '#9fd0ee', 52) +
        [60, 100, 200, 240].map(x => kid(x, 128, CL.m, {k: .55})).join('');
    }},
    popular: {dur: 6, hl: [10, 50], end: 60, lit: '人们喜欢的', mean: '受欢迎的；流行的', draw: s => {
      return GND() + `<rect x="210" y="70" width="70" height="58" ${fl(CL.g, .4)}/><path d="M206 70h78l-8-14h-62z" fill="#d23c2f"/><text x="245" y="100" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>奶茶</text>` +
        [190, 164, 138, 112, 86, 60, 34].map((x, i) => `<g ${s.a(moveIn([[4 + i * 4, -40, 0], [14 + i * 4, 0, 0]]))}>${kid(x, 128, [CL.t, CL.v, CL.a, CL.g][i % 4], {k: .6})}</g>`).join('') +
        [0, 1, 2].map(i => `<g ${s.a(pop(40 + i * 4), ORG(150 + i * 30, 40))}>${heartAt(140 + i * 30, 40, .6)}</g>`).join('') +
        `<g ${s.a(pop(50), ORG(80, 40))}><rect x="46" y="30" width="68" height="20" rx="6" ${fl(CL.a)}/><text x="80" y="44" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">排起长队</text></g>`;
    }},
    // ---------- 第二十二批 ----------
    pursue: {dur: 6, hl: [8, 22], end: 60, lit: '跟在后面一路往前', mean: '追求；追赶', draw: s => {
      const W = walkLegs(s, 50, 128, 22, 58, 12);
      return GND() + `<path d="M24 140H258" ${sk(CL.t, 2.5)} stroke-dasharray="6 6" ${s.a(fadeP(8, 14))}/><path d="M256 134l8 6-8 6" ${sk(CL.t, 2.5)} ${s.a(fadeP(8, 14))}/>` +
        `<g ${s.a(moveIn([[8, 0, 0], [22, 30, -6], [40, 110, 4], [58, 150, -4]]))}>${star5(110, 40, 13, 5.5, CL.g)}<text x="110" y="68" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.g)}>梦想</text></g>` +
        `<g ${s.a(move([[22, 0, 0], [58, 150, 0]]))}>${kid(50, 128, CL.t, {...W, aR: [20, -46]})}<path d="M30 84h-12M32 96h-16M30 108h-10" ${sk(CL.m, 2)} ${s.a(showAt(24, 56))}/></g>` +
        chip(s, 90, 24, 96, '一直追着梦想跑', CL.t, 46);
    }},
    spending: {dur: 6, hl: [10, 44], end: 60, lit: '花出去的钱', mean: '开支；花费', draw: s => {
      const goods = [[176, `<path d="M168 82h16l-2 18h-12z" fill="#e8c9a0"/><path d="M166 82h20" ${sk('#8b5a3a', 3)}/><path d="M178 82l4-10" ${sk(CL.a, 2)}/>`], [216, `<rect x="205" y="84" width="22" height="16" rx="1" ${fl(CL.v)}/><path d="M216 84v16" ${sk(CL.p, 1.5)}/>`], [258, `<path d="M246 84l6-4h12l6 4-3 6h-3v10h-12v-10h-3z" ${fl(CL.a)}/>`]];
      const coin = (i, tx) => { const p = 10 + i * 10; return `<g ${s.a({0: 'opacity:0;' + T(), [p]: 'opacity:0;' + T(), [p + 1]: 'opacity:1;' + T(), [p + 5]: 'opacity:1;' + T(f1(tx / 2), -34), [p + 9]: 'opacity:1;' + T(tx, -4), [p + 10]: 'opacity:0;' + T(tx, -4), 100: 'opacity:0;' + T(tx, -4)})}><circle cx="86" cy="94" r="6" ${fs(CL.g, '#a8741a', 1)}/><text x="86" y="97.5" font-size="8" font-weight="700" text-anchor="middle" fill="#a8741a">¥</text></g>`; };
      const rows = [['奶茶', '15'], ['书', '40'], ['衣服', '120']];
      return GND() + `<rect x="150" y="100" width="136" height="6" rx="2" fill="${WOOD}"/><path d="M158 106v22M278 106v22" ${sk(WOOD, 3)}/>` + goods.map(g => g[1]).join('') +
        kid(60, 128, CL.t, {aR: [18, -30]}) + `<rect x="74" y="88" width="22" height="15" rx="3" fill="#8b5a3a"/><path d="M74 94h22" ${sk('#6b4428', 1.5)}/>` +
        goods.map(([x], i) => coin(i, x - 86)).join('') +
        goods.map(([x], i) => `<g ${s.a(pop(19 + i * 10), ORG(x + 10, 72))}><circle cx="${x + 10}" cy="72" r="6" fill="#3fbf6a"/><path d="M${x + 7} 72l2 2 4-4" ${sk('#fff', 1.6)}/></g>`).join('') +
        `<g ${s.a(growY(44, 52), 'transform-origin:50% 0%;transform-box:fill-box')}><rect x="98" y="6" width="66" height="64" rx="2" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/>` +
        rows.map(([a, b], i) => `<text x="104" y="${20 + i * 12}" font-size="8" ${fl(CL.k)}>${a}</text><text x="158" y="${20 + i * 12}" font-size="8" text-anchor="end" ${fl(CL.k)}>${b}</text>`).join('') +
        `<path d="M104 52h54" ${sk(CL.m, 1)} stroke-dasharray="2 2"/><text x="104" y="64" font-size="9" font-weight="700" fill="#d23c2f">开支</text><text x="158" y="64" font-size="9" font-weight="700" text-anchor="end" fill="#d23c2f">175</text></g>` +
        `<path d="M76 62q-4 6 0 8a3 3 0 0 0 0-8z" fill="#6db7e8" ${s.a(showAt(46))}/>`;
    }},
    throughout: {dur: 6, hl: [10, 40], end: 60, lit: '穿过全部', mean: '遍及；贯穿', draw: s => {
      const xs = [30, 75, 120, 165, 210, 255];
      return `<rect x="0" y="0" width="300" height="150" fill="#1d2440" opacity=".25"/><circle cx="270" cy="22" r="9" fill="#f6e7a8"/>` +
        xs.map(x => `<path d="M${x - 17} 90L${x} 76l17 14z" ${fl(CL.m, .55)}/><rect x="${x - 15}" y="90" width="30" height="38" ${fl(CL.m, .35)}/><rect x="${x - 6}" y="96" width="12" height="10" rx="1" ${fl(CL.k, .5)}/>` +
          `<g ${s.a(showAt(f1(10 + (x + 10) / 12)))}><circle cx="${x}" cy="101" r="13" fill="#f6d34a" opacity=".25"/><rect x="${x - 6}" y="96" width="12" height="10" rx="1" fill="#f6d34a"/></g>`).join('') + GND() +
        `<g ${s.a(move([[10, -60, 0], [40, 300, 0]]))}><path d="M50 112l18 3v6l-18 3z" fill="#f6d34a" opacity=".5"/><rect x="0" y="110" width="50" height="14" rx="4" ${fl(CL.a)}/><rect x="6" y="113" width="8" height="5" rx="1" fill="#fff"/><rect x="20" y="113" width="8" height="5" rx="1" fill="#fff"/><rect x="34" y="113" width="8" height="5" rx="1" fill="#fff"/><circle cx="12" cy="125" r="3" fill="${INK}"/><circle cx="38" cy="125" r="3" fill="${INK}"/></g>` +
        `<path d="M12 72q0-8 8-8h260q8 0 8 8" ${sk(CL.g, 2.5)} ${DASH} ${s.a(drawP(40, 48))}/>` + chip(s, 150, 40, 92, '全城处处亮灯', CL.a, 46);
    }},
    automation: {dur: 6, hl: [8, 22, 50], end: 60, lit: '自己会动', mean: '自动化', draw: s => {
      const ps = [22, 31, 40], press = {0: T(), 100: T()};
      ps.forEach(p => { press[p + 6] = T(); press[p + 7.5] = T(0, 12); press[p + 9] = T(); });
      const box = p => `<g ${s.a({0: 'opacity:0;' + T(), [p - .5]: 'opacity:0;' + T(), [p]: 'opacity:1;' + T(), [p + 6]: 'opacity:1;' + T(80), [p + 9]: 'opacity:1;' + T(80), [p + 15]: 'opacity:1;' + T(160), [p + 16]: 'opacity:0;' + T(165), 100: 'opacity:0;' + T(165)})}><rect x="109" y="84" width="22" height="20" rx="2" fill="${WOOD}"/><path d="M109 91h22" ${sk('#8b5a3a', 1.5)}/><g ${s.a({0: 'opacity:0', [p + 7.5]: 'opacity:0', [p + 8]: 'opacity:1', 99: 'opacity:1', 100: 'opacity:0'})}>${star5(120, 97, 5, 2.2, CL.a)}</g></g>`;
      return GND() + `<rect x="100" y="104" width="190" height="10" rx="5" ${sk(CL.m, 3)}/>` + [112, 150, 190, 230, 270].map(x => `<circle cx="${x}" cy="109" r="2.5" ${fl(CL.m)}/>`).join('') + `<path d="M110 114v14M280 114v14" ${sk(CL.m, 3)}/>` +
        ps.map(box).join('') +
        `<rect x="168" y="8" width="64" height="6" rx="2" ${fl(CL.m)}/><g ${s.a(press)}><rect x="197" y="14" width="6" height="48" ${fl(CL.m, .8)}/><rect x="188" y="62" width="24" height="10" rx="2" ${fl(CL.v)}/></g>` +
        `<rect x="238" y="22" width="52" height="30" rx="4" ${fl(CL.k, .8)}/><text x="256" y="41" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">AUTO</text><circle cx="279" cy="37" r="4" fill="#666"/><circle cx="279" cy="37" r="4" fill="#3fbf6a" ${s.a(showAt(8))}/>` +
        kid(50, 128, CL.a, {aR: [14, -30]}) + `<rect x="60" y="88" width="10" height="12" rx="2" fill="#fff" style="stroke:var(--ink3);stroke-width:1.2px"/><path d="M63 84q-2-3 0-6M67 84q-2-3 0-6" ${sk(CL.m, 1.4)} ${s.a(showAt(8))}/>` +
        chip(s, 62, 30, 84, '机器自己干活', CL.t, 50);
    }},
    consumption: {dur: 6, hl: [8, 20, 50], end: 60, lit: '用掉的量', mean: '消费；消耗', draw: s => {
      const blade = a => `<ellipse cx="255" cy="73" rx="4.5" ry="10" ${fl(CL.t)} transform="rotate(${a} 255 84)"/>`;
      return GND() + `<rect x="26" y="40" width="50" height="80" rx="6" ${sk(CL.k, 3)}/><rect x="41" y="33" width="20" height="7" rx="2" ${fl(CL.k)}/>` +
        `<rect x="32" y="46" width="38" height="68" rx="3" fill="#3fbf6a" ${s.a({0: 'transform:scaleY(1);fill:#3fbf6a', 20: 'transform:scaleY(1);fill:#3fbf6a', 36: 'transform:scaleY(.55);fill:#f2b632', 50: 'transform:scaleY(.18);fill:#e2473a', 92: 'transform:scaleY(.18);fill:#e2473a', 100: 'transform:scaleY(1);fill:#3fbf6a'}, 'transform-origin:50% 100%;transform-box:fill-box')}/>` +
        ['100%', '50%', '15%'].map((t, i) => `<text x="51" y="26" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.k)} ${s.a(slot([0, 32, 46, 99], i))}>${t}</text>`).join('') +
        `<path d="M76 112h8v12H262" ${sk(CL.m, 2)}/><path d="M130 124v-2M195 124v-8M255 124v-2" ${sk(CL.m, 2)}/>` +
        `<g ${s.a(fadeP(8, 12))}><path d="M84 124H262" ${sk('#f6d34a', 3)} stroke-dasharray="3 9" ${s.a({0: 'stroke-dashoffset:0', 100: 'stroke-dashoffset:-48'}, 'animation-timing-function:linear', 1)}/></g>` +
        `<path d="M122 70l-14 50h44l-14-50z" fill="#f6d34a" opacity=".3" ${s.a(showAt(8))}/><path d="M130 128V84" ${sk(CL.k, 2.5)}/><path d="M120 70h20l6 14h-32z" ${fl(CL.g)}/><path d="M122 128h16" ${sk(CL.k, 3)}/>` +
        `<rect x="172" y="82" width="46" height="34" rx="3" ${fl(CL.k, .85)}/><rect x="176" y="86" width="38" height="26" rx="1" fill="#3a3a3a"/><g ${s.a(showAt(12))}><rect x="176" y="86" width="38" height="26" rx="1" fill="#9fd0ee"/><path d="M180 108l9-10 6 6 5-4 10 8z" fill="#3f8f4f"/></g><path d="M186 116l-4 12M204 116l4 12" ${sk(CL.k, 2.5)}/>` +
        `<path d="M255 128V88" ${sk(CL.k, 2.5)}/><path d="M245 128h20" ${sk(CL.k, 3)}/><g ${s.a({0: R(0), 16: R(0), 92: R(2880), 100: R(2880)}, ORG(255, 84))}>${blade(0)}${blade(120)}${blade(240)}</g><circle cx="255" cy="84" r="3" ${fl(CL.k)}/>` +
        chip(s, 160, 30, 96, '电量一路往下掉', CL.a, 50);
    }},
    management: {dur: 6, hl: [10, 50], end: 60, lit: '管理这件事', mean: '管理；管理层', draw: s => {
      const low = [80, 140, 200];
      return GND() + `<rect x="40" y="20" width="200" height="108" ${fl(CL.m, .15)}/><path d="M40 128V20h200v108M40 72h200" ${sk(CL.m, 2.5)}/>` +
        `<rect x="136" y="30" width="28" height="20" rx="2" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M140 46l6-6 5 4 9-9" ${sk(CL.a, 2)}/>` +
        kid(118, 72, '#3d4a5c', {k: .6, aR: [16, -30]}) + kid(184, 72, '#3d4a5c', {k: .6}) +
        low.map((x, i) => kid(x, 128, [CL.t, CL.v, CL.g][i], {k: .6, aL: [-10, -24], aR: [10, -24]}) + `<rect x="${x - 13}" y="106" width="26" height="5" fill="${WOOD}"/><path d="M${x - 11} 111v17M${x + 11} 111v17" ${sk(WOOD, 2)}/>`).join('') +
        low.map((x, i) => `<g ${s.a(moveIn([[10 + i * 4, 150 - x, -44], [17 + i * 4, (150 - x) / 2, -50], [24 + i * 4, 0, 0]]))}><rect x="${x - 6}" y="98" width="12" height="8" rx="1" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/><path d="M${x - 3} 101h6M${x - 3} 103.5h4" ${sk(CL.m, .8)}/></g>`).join('') +
        low.map((x, i) => `<g ${s.a(pop(30 + i * 4), ORG(x + 12, 84))}><circle cx="${x + 12}" cy="84" r="6" fill="#3fbf6a"/><path d="M${x + 9} 84l2 2 4-4" ${sk('#fff', 1.6)}/></g>`).join('') +
        `<rect x="43" y="23" width="194" height="46" rx="3" ${sk(CL.a, 3)} ${s.a(pop(46), ORG(140, 46))}/>` + chip(s, 270, 46, 52, '管理层', CL.a, 50);
    }},
    prepare: {dur: 6, hl: [8, 22], end: 60, lit: '事先安排好', mean: '准备', draw: s => {
      const items = [[262, 60, `<path d="M254 56l5-3h6l5 3-2 4h-2v8h-8v-8h-2z" ${fl(CL.a)}/>`], [270, 86, `<rect x="262" y="82" width="16" height="9" rx="4" fill="${INK}"/>`], [258, 110, `<rect x="252" y="103" width="12" height="15" rx="1" fill="#2f5d8a"/><circle cx="258" cy="110" r="2.5" fill="#f6d34a"/>`]];
      return GND() + `<rect x="238" y="40" width="52" height="88" ${fl(WOOD, .4)}/><path d="M238 70h52M238 96h52M238 122h52" ${sk(WOOD, 2.5)}/>` +
        items.map(([x, y, art], i) => { const p = 22 + i * 8; return `<g ${s.a(move([[p, 0, 0], [p + 4, f1((150 - x) / 2), f1(-30 - (y - 60) / 2)], [p + 7, 150 - x, 116 - y]]))}>${art}</g>`; }).join('') +
        `<rect x="114" y="104" width="72" height="24" rx="4" ${fl(CL.v)}/><path d="M114 114h72" ${sk(CL.p, 1.5, .5)}/>` +
        `<g ${s.a({0: R(-100), 48: R(-100), 54: R(4), 56: R(0), 94: R(0), 100: R(-100)}, ORG(116, 104))}><rect x="114" y="98" width="72" height="8" rx="3" ${fl(CL.v)}/><rect x="140" y="93" width="20" height="5" rx="2" ${fl(CL.k)}/></g>` +
        kid(70, 128, CL.t, {aR: [18, -40]}) +
        `<g ${s.a(pop(8), ORG(60, 32))}><rect x="34" y="12" width="52" height="40" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><rect x="34" y="12" width="52" height="11" rx="3" fill="#d23c2f"/><text x="60" y="41" font-size="9" font-weight="700" text-anchor="middle" fill="${INK}">明天出发</text></g>` +
        chip(s, 150, 76, 60, '准备好了', CL.t, 56);
    }},
    protect: {dur: 6, hl: [12, 30], end: 60, lit: '挡在前面盖住', mean: '保护', draw: s => {
      const W = walkLegs(s, 40, 128, 12, 24, 4);
      const rain = (x, i, len = 150) => `<path d="M${x} -10l-6 12" ${sk('#6db7e8', 2)} ${s.a({0: T(0, 0), 100: T(-36, len)}, `animation-delay:${(i * .13).toFixed(2)}s;animation-timing-function:linear`, .9)}/>`;
      return GND() + [205, 230, 255, 280, 305, 330, 20, 45, 70].map((x, i) => rain(x, i)).join('') +
        `<g ${s.a(hideAt(29))}>${[112, 134, 156, 178].map((x, i) => rain(x, i + 9, 118)).join('')}</g>` +
        kid(110, 128, CL.v, {k: .7, noFace: true, aL: [-6, -30], aR: [6, -30]}) + `<g ${s.a(hideAt(32))}>${face(110, 128, .7, 'sad')}</g><g ${s.a(showAt(32))}>${face(110, 128, .7)}</g>` +
        `<g ${s.a(move([[12, 0, 0], [24, 110, 0]]))}>${kid(40, 128, CL.t, {...W, aL: [-10, -50]})}</g>` +
        `<g ${s.a({0: 'opacity:0;transform:scale(.2)', 28: 'opacity:0;transform:scale(.2)', 32: 'opacity:1;transform:scale(1.05)', 34: 'opacity:1;transform:scale(1)', 92: 'opacity:1;transform:scale(1)', 100: 'opacity:0;transform:scale(1)'}, ORG(140, 80))}><path d="M140 80V42" ${sk(CL.k, 2.5)}/><path d="M92 46a48 30 0 0 1 96 0q-8-5-16 0t-16 0-16 0-16 0-16 0-16 0z" ${fl(CL.a)}/><path d="M140 16v-4" ${sk(CL.k, 2.5)}/></g>` +
        `<g ${s.a(showAt(34))}><path d="M118 20l-3-5M140 12v-6M162 20l3-5" ${sk('#6db7e8', 2)}/>${[92, 188].map((x, i) => `<path d="M${x} 48v5" ${sk('#6db7e8', 2)} ${s.a({0: 'opacity:1;' + T(0, 0), 100: 'opacity:0;' + T(0, 22)}, `animation-delay:${i * .3}s;animation-timing-function:linear`, .7)}/>`).join('')}</g>` +
        chip(s, 236, 24, 72, '替你挡住雨', CL.t, 46);
    }},
    receive: {dur: 6, hl: [10, 42], end: 60, lit: '把送回来的拿到手', mean: '收到；接待', draw: s => {
      const env = `<rect x="-10" y="-7" width="20" height="14" rx="1.5" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M-10 -7l10 8 10-8" ${sk(CL.m, 1.5)}/>`;
      return GND() + `<rect x="197" y="80" width="6" height="48" fill="${WOOD}"/><path d="M178 80V62a12 12 0 0 1 12-12h20a12 12 0 0 1 12 12v18z" fill="#2f5d8a"/><path d="M186 64h16" ${sk(INK, 2.5)}/>` +
        `<g ${s.a({0: R(0), 24: R(0), 28: R(-90), 92: R(-90), 100: R(0)}, ORG(222, 72))}><path d="M222 72h18" ${sk(INK, 2.5)}/><rect x="232" y="72" width="10" height="7" fill="#d23c2f"/></g>` +
        `<g ${s.a({0: 'opacity:0;' + T(20, 30, 'rotate(-20deg) scale(1)'), 10: 'opacity:0;' + T(20, 30, 'rotate(-20deg) scale(1)'), 11: 'opacity:1;' + T(20, 30, 'rotate(-20deg) scale(1)'), 17: 'opacity:1;' + T(110, 14, 'rotate(10deg) scale(1)'), 24: 'opacity:1;' + T(194, 62, 'rotate(0deg) scale(.6)'), 25: 'opacity:0;' + T(194, 64, 'rotate(0deg) scale(.5)'), 100: 'opacity:0;' + T(194, 64, 'rotate(0deg) scale(.5)')})}>${env}</g>` +
        `<g ${s.a(move([[28, 0, 0], [40, 96, 0]]))}>${kid(60, 128, CL.t, {...walkLegs(s, 60, 128, 28, 40, 4), aR: [20, -34]})}</g>` +
        `<g ${s.a({0: 'opacity:0;' + T(194, 62), 42: 'opacity:0;' + T(194, 62), 43: 'opacity:1;' + T(194, 62), 48: 'opacity:1;' + T(182, 92), 92: 'opacity:1;' + T(182, 92), 100: 'opacity:0;' + T(182, 92)})}>${env}</g>` +
        chip(s, 96, 30, 64, '收到信啦', CL.t, 52);
    }},
    significant: {dur: 6, hl: [10, 24, 50], end: 60, lit: '要做记号的', mean: '重要的；显著的', draw: s => {
      return `<rect x="56" y="12" width="150" height="124" rx="3" fill="#fffdf6" style="stroke:var(--ink3);stroke-width:2px"/>` +
        `<rect x="68" y="68" width="126" height="14" rx="2" fill="#f6e36a" fill-opacity=".85" ${s.a(growX(10, 20), 'transform-origin:0% 50%;transform-box:fill-box')}/>` +
        [110, 90, 120, 116, 100, 84, 112].map((w, i) => `<path d="M70 ${30 + i * 15}h${w}" ${i === 3 ? sk(CL.k, 3, .9) : sk(CL.m, 2.5, .45)}/>`).join('') +
        `<g ${s.a({0: 'opacity:0;' + T(), 8: 'opacity:0;' + T(), 10: 'opacity:1;' + T(), 20: 'opacity:1;' + T(122, 0), 23: 'opacity:0;' + T(122, 0), 100: 'opacity:0;' + T(122, 0)})}><path d="M74 69l18-22 6 5-18 22z" fill="#f2c641"/><path d="M70 75l4-6 6 5z" fill="#c9a21e"/></g>` +
        `<ellipse cx="131" cy="75" rx="70" ry="13" ${sk('#d23c2f', 2.5)} ${DASH} ${s.a(drawP(24, 36))}/>` +
        `<g ${s.a(pop(36), ORG(216, 58))}>${star5(216, 58, 10, 4, '#d23c2f')}</g>` + chip(s, 252, 100, 76, '这句是重点', CL.a, 50);
    }},
    traditional: {dur: 6, hl: [10, 50], end: 60, lit: '代代传下来的', mean: '传统的', draw: s => {
      const lan = (x, y) => `<path d="M${x} ${y - 14}v4" ${sk('#a8741a', 1.5)}/><rect x="${x - 5}" y="${y - 10}" width="10" height="3" fill="#e2b13c"/><ellipse cx="${x}" cy="${y}" rx="11" ry="8" fill="#d23c2f"/><path d="M${x} ${y - 8}v16" ${sk('#a82a20', 1)}/><rect x="${x - 5}" y="${y + 7}" width="10" height="3" fill="#e2b13c"/><path d="M${x} ${y + 10}v7" ${sk('#e2b13c', 1.5)}/>`;
      const up = [[50, 23.4], [100, 27.6], [150, 29], [200, 27.6], [250, 23.4]];
      const couplet = (x, txt) => `<rect x="${x}" y="50" width="16" height="68" fill="#d23c2f"/>` + [...txt].map((c, i) => `<text x="${x + 8}" y="${66 + i * 15}" font-size="10" font-weight="700" text-anchor="middle" fill="#f6d34a">${c}</text>`).join('');
      return GND() + `<path d="M10 18q140 22 280 0" ${sk(CL.m, 1.5)}/>` +
        up.map(([x, y], i) => { const p = 30 + i * 3; return `<g ${s.a(showAt(p))}><circle cx="${x}" cy="${f1(y + 16)}" r="16" fill="#f6d34a" opacity=".3"/></g><g ${s.a({0: 'opacity:.35', [p]: 'opacity:.35', [p + 4]: 'opacity:1', 92: 'opacity:1', 100: 'opacity:.35'})}>${lan(x, f1(y + 16))}</g>`; }).join('') +
        `<g ${s.a(pop(38), ORG(22, 84))}>${couplet(14, '辞旧迎新')}</g><g ${s.a(pop(40), ORG(278, 84))}>${couplet(270, '万事如意')}</g>` +
        `<g ${s.a(pop(42), ORG(150, 64))}><rect x="138" y="52" width="24" height="24" fill="#d23c2f" transform="rotate(45 150 64)"/><text x="150" y="69" font-size="14" font-weight="700" text-anchor="middle" fill="#f6d34a">福</text></g>` +
        kid(90, 128, '#8b5a3a', {aR: [18, -34]}) + `<path d="M79 75a11 11 0 0 1 22 0q-5-5-11-3.5t-11 3.5z" fill="#dcdcdc"/><circle cx="90" cy="63" r="5" fill="#dcdcdc"/>` +
        kid(196, 128, CL.t, {k: .75, aL: [-26, -40]}) +
        `<g ${s.a(move([[10, 0, 0], [17, 34, -14], [24, 68, 4]]))}>${lan(108, 108)}</g>` +
        chip(s, 150, 140, 64, '代代相传', '#d23c2f', 50);
    }},
    approach: {dur: 6, hl: [8, 20], end: 60, lit: '朝着它越走越近', mean: '接近；方法', draw: s => {
      return GND() + `<rect x="232" y="104" width="44" height="24" rx="2" fill="${WOOD}"/><path d="M230 104q24-18 48 0z" fill="#8b5a3a"/><rect x="250" y="100" width="8" height="10" rx="1" fill="#f6d34a"/>` +
        `<path d="M70 54H222" ${sk(CL.v, 2.5)} stroke-dasharray="5 5" ${s.a(fadeP(8, 14))}/><path d="M216 48l8 6-8 6" ${sk(CL.v, 2.5)} ${s.a(fadeP(8, 14))}/>` +
        `<g ${s.a(move([[20, 0, 0], [52, 166, 0]]))}>${kid(40, 128, CL.t, {...walkLegs(s, 40, 128, 20, 52, 10), aR: [16, -30]})}</g>` +
        ['10 m', '5 m', '1 m'].map((t, i) => `<text x="150" y="38" font-size="14" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(slot([0, 31, 44, 99], i))}>${t}</text>`).join('') +
        `<g ${s.a(pop(54), ORG(254, 84))}>${sparkle(240, 86, 6)}${sparkle(266, 80, 4)}</g>` + chip(s, 72, 24, 64, '越走越近', CL.v, 54);
    }},
    // ---------- 第二十三批 ----------
    complex: {dur: 6, hl: [8, 24], end: 60, lit: '编在一起', mean: '复杂的；综合体', draw: s => {
      const cols = [CL.a, CL.t, CL.v];
      const knot = i => { const pts = []; for (let j = 0; j < 22; j++) { const a = j * 1.05 + i * 2.1, r = 13 + 13 * Math.sin(j * 1.7 + i * 1.3); pts.push(f1(150 + r * Math.cos(a)) + ' ' + f1(75 + r * .8 * Math.sin(a))); }
        return `<path d="M110 ${75 + (i - 1) * 6}Q${pts[0]} ${pts[1]}T${pts.slice(2).join('T')}" ${sk(cols[i], 3)} stroke-linejoin="round" ${DASH} ${s.a(drawP(24 + i * 3, 44 + i * 3))}/>`; };
      return GND() + cols.map((c, i) => `<path d="M14 ${40 + i * 35}C50 ${24 + i * 35} 70 ${56 + i * 35} 110 ${75 + (i - 1) * 6}" ${sk(c, 4)} ${DASH} ${s.a(drawP(8 + i * 2, 20 + i * 2))}/>`).join('') +
        `<g ${s.a(showAt(23))}>${[0, 1, 2].map(knot).join('')}</g>` +
        kid(250, 128, CL.g, {aR: [8, -62], noFace: true}) + face(250, 128, 1, 'sad') +
        `<text x="234" y="44" font-size="18" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(pop(46), ORG(234, 38))}>?</text><text x="266" y="36" font-size="14" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(pop(50), ORG(266, 30))}>?</text>` +
        chip(s, 150, 22, 84, '缠成一团好复杂', CL.a, 52);
    }},
    conduct: {dur: 6, hl: [10, 24], end: 60, lit: '领着大家一起做', mean: '实施；指挥', draw: s => {
      const note = (x, y, c) => `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="3.5" ${fl(c)} transform="rotate(-20 ${x} ${y})"/><path d="M${x + 4} ${y - 1}v-14q5 2 6 7" ${sk(c, 1.8)}/>`;
      const wave = {0: R(0), 24: R(0), 56: R(0), 100: R(0)}; for (let i = 1; i < 8; i++) wave[f1(24 + i * 4)] = R(i % 2 ? -40 : 10);
      const players = [[170, CL.t], [212, CL.v], [254, CL.a]];
      return GND() + `<rect x="48" y="112" width="44" height="16" rx="2" fill="${WOOD}"/>` +
        kid(70, 112, '#3d4a5c', {aR: [18, -40], armR: s.a(wave, shoulder(70, 112, 1)), holdR: `<path d="M88 72l16-16" ${sk(INK, 2)}/>`}) +
        players.map(([x, c], i) => `<g ${s.a(moveIn([[4 + i * 3, 50, 0], [10 + i * 3, 0, 0]]))}>${kid(x, 128, c, {k: .7, aL: [-10, -26], aR: [10, -26]})}<ellipse cx="${x + 2}" cy="${106}" rx="6" ry="8" fill="${WOOD}"/><path d="M${x + 2} 98v16" ${sk('#6b4428', 1)}/></g>`).join('') +
        players.map(([x, c], i) => [28, 40].map(p0 => { const p = p0 + i * 4; return `<g ${s.a({0: 'opacity:0;' + T(), [p]: 'opacity:0;' + T(), [p + 2]: 'opacity:1;' + T(), [p + 12]: 'opacity:0;' + T(10, -36), 100: 'opacity:0;' + T(10, -36)})}>${note(x + 10, 84, c)}</g>`; }).join('')).join('') +
        chip(s, 160, 24, 76, '领着一起演奏', CL.v, 52);
    }},
    damage: {dur: 6, hl: [30, 50], end: 60, lit: '造成的损失', mean: '损害；损坏', draw: s => {
      const cracks = [[-10, -12], [14, -8], [-6, 16], [18, 10], [-14, 4], [4, -16]];
      return GND() + `<rect x="180" y="20" width="110" height="108" ${fl(CL.m, .25)}/><rect x="206" y="40" width="56" height="44" rx="2" fill="#bfe1f2" style="stroke:var(--ink3);stroke-width:3px"/><path d="M234 40v44M206 62h56" ${sk(CL.m, 2.5)}/>` +
        `<path d="M216 50l8-4 6 6-4 8-8-2z" fill="#3a3a3a" ${s.a(showAt(28))}/>` +
        cracks.map(([dx, dy], i) => `<path d="M222 54l${dx} ${dy}" ${sk(INK, 1.8)} ${DASH} ${s.a(drawP(28 + i, 32 + i))}/>`).join('') +
        [[214, 70, 34], [228, 52, 38], [222, 60, 42]].map(([x, y, p]) => `<g ${s.a(moveIn([[p - 6, 0, 0], [p + 4, -6, 128 - y - 4, 'rotate(120deg)']]))}><path d="M${x} ${y}l6-2-2 6z" fill="#9fd0ee"/></g>`).join('') +
        kid(50, 128, CL.t, {noFace: true, legR: s.a({0: R(0), 10: R(0), 14: R(-50), 18: R(0), 100: R(0)}, hip(50, 128, 1))}) + `<g ${s.a(hideAt(32))}>${face(50, 128)}</g><g ${s.a(showAt(32))}>${face(50, 128, 1, 'sad')}</g>` +
        `<g ${s.a(move([[14, 0, 0], [20, 70, -60], [28, 162, -68], [32, 150, -46], [40, 126, 0]]))}><circle cx="62" cy="122" r="6" fill="#fff" style="stroke:var(--ink);stroke-width:1.5px"/><path d="M58 119l4 2 4-2M62 121v5" ${sk(INK, 1)}/></g>` +
        chip(s, 110, 30, 84, '窗户被砸坏了', CL.a, 50);
    }},
    educational: {dur: 6, hl: [10, 50], end: 60, lit: '起教育作用的', mean: '有教育意义的', draw: s => {
      const bone = (d, p0, p1) => `<path d="${d}" ${sk('#f4f1e6', 2.5)} ${DASH} ${s.a(drawP(p0, p1))}/>`;
      return GND() + `<rect x="140" y="22" width="130" height="84" rx="5" ${fl(CL.k, .85)}/><rect x="146" y="28" width="118" height="72" rx="2" fill="#26324a"/><path d="M176 106l-8 22M234 106l8 22" ${sk(CL.k, 3)}/>` +
        bone('M152 86Q170 58 204 62Q222 60 230 44Q234 36 240 38Q245 42 238 46Q232 48 230 56Q226 70 222 80V94H216V82Q204 86 190 84V94H184V82Q170 80 152 86Z', 10, 34) + `<circle cx="236" cy="41" r="1.6" fill="#f4f1e6" ${s.a(showAt(30))}/>` + bone('M196 70v10M204 69v11', 32, 38) +
        `<text x="205" y="40" font-size="8" font-weight="700" text-anchor="middle" fill="#f6d34a" ${s.a(showAt(8))}>恐龙纪录片</text>` +
        kid(70, 128, CL.v) +
        `<g ${s.a(pop(32), ORG(70, 40))}><path d="M62 40a8 8 0 1 1 16 0c0 4-3 5-3 9h-10c0-4-3-5-3-9z" ${fl(CL.g)}/><path d="M66 53h8" ${sk(CL.k, 2)}/><path d="M70 23v-4M57 29l-3-3M83 29l3-3" ${sk(CL.g, 2)}/></g>` +
        `<text x="104" y="44" font-size="10" font-weight="700" ${fl(CL.t)} ${s.a(pop(38), ORG(112, 40))}>+知识</text>` +
        chip(s, 205, 140, 92, '看纪录片涨知识', CL.t, 50);
    }},
    emission: {dur: 6, hl: [8, 20, 50], end: 60, lit: '送出去的东西', mean: '排放；排放物', draw: s => {
      const puff = i => { const p = 8 + i * 7, dx = 70 + i * 6; return `<g ${s.a({0: 'opacity:0;' + T(0, 0, 'scale(.4)'), [p]: 'opacity:0;' + T(0, 0, 'scale(.4)'), [p + 2]: 'opacity:.95;' + T(0, -6, 'scale(.6)'), [p + 22]: 'opacity:.8;' + T(dx, -16, 'scale(1.3)'), [p + 30]: 'opacity:0;' + T(dx + 30, -20, 'scale(1.5)'), 100: 'opacity:0;' + T(dx + 30, -20, 'scale(1.5)')}, ORG(100, 36))}><circle cx="92" cy="34" r="9" fill="#8a8a8a"/><circle cx="104" cy="30" r="11" fill="#8a8a8a"/><circle cx="112" cy="38" r="8" fill="#8a8a8a"/>${i % 2 ? '' : `<text x="102" y="37" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">CO₂</text>`}</g>`; };
      return `<rect x="0" y="0" width="300" height="150" fill="#8a8a8a" ${s.a({0: 'opacity:0', 20: 'opacity:0', 50: 'opacity:.3', 92: 'opacity:.3', 100: 'opacity:0'})}/>` + GND() +
        `<path d="M30 128V90l24-12v12l24-12v12l24-12v12l24-12v50z" ${fl(CL.m, .55)}/><rect x="40" y="100" width="12" height="10" ${fl(CL.p, .7)}/><rect x="64" y="100" width="12" height="10" ${fl(CL.p, .7)}/><rect x="88" y="100" width="12" height="10" ${fl(CL.p, .7)}/>` +
        `<rect x="92" y="38" width="16" height="44" fill="#7a6a62"/><path d="M92 46h16M92 56h16" ${sk('#d23c2f', 3)}/>` +
        [0, 1, 2, 3, 4, 5, 6].map(puff).join('') +
        `<path d="M150 18H246" ${sk(CL.m, 2)} stroke-dasharray="5 5" ${s.a(fadeP(20, 26))}/><path d="M240 13l7 5-7 5" ${sk(CL.m, 2)} ${s.a(fadeP(20, 26))}/>` +
        chip(s, 230, 104, 64, '碳排放', '#556070', 50);
    }},
    emotional: {dur: 6, hl: [12, 50], end: 60, lit: '情绪上的', mean: '情感的；情绪的', draw: s => {
      const pulse = {0: 'transform:scale(1)', 12: 'transform:scale(1)', 100: 'transform:scale(1)'}; for (let i = 1; i < 10; i++) pulse[12 + i * 4] = `transform:scale(${i % 2 ? 1.35 : 1})`; pulse[52] = 'transform:scale(1)';
      return GND() + kid(90, 128, CL.t, {k: 1.3, noFace: true}) +
        `<g ${s.a({0: 'opacity:1', 20: 'opacity:1', 21: 'opacity:0', 36: 'opacity:0', 37: 'opacity:1', 100: 'opacity:1'})}>${face(90, 128, 1.3)}</g>` +
        `<g ${s.a({0: 'opacity:0', 20: 'opacity:0', 21: 'opacity:1', 36: 'opacity:1', 37: 'opacity:0', 100: 'opacity:0'})}>${face(90, 128, 1.3, 'sad')}<path d="M83 66q-2 6 0 9M97 66q2 6 0 9" ${sk('#6db7e8', 2.5)}/></g>` +
        `<g ${s.a(pulse, ORG(90, 92))}>${heartAt(90, 88, .7, CL.p)}</g>` +
        `<rect x="160" y="20" width="128" height="80" rx="4" ${fs(CL.p, CL.m, 2)}/><path d="M168 60H282" ${sk(CL.m, 1, .5)} stroke-dasharray="3 3"/><text x="166" y="31" font-size="8" ${fl(CL.m)}>开心</text><text x="166" y="96" font-size="8" ${fl(CL.m)}>难过</text>` +
        `<path d="M168 60q10-36 19 0t19 0 19 0 19 0 19 0 19 0" ${sk(CL.a, 3)} ${DASH} ${s.a(drawP(12, 46))}/>` +
        chip(s, 224, 122, 80, '情绪起伏好大', CL.a, 50);
    }},
    general: {dur: 6, hl: [8, 40], end: 60, lit: '整个种类的', mean: '总体的；一般的', draw: s => {
      const grapes = [[0, 0], [-6, -8], [6, -8], [-9, 2], [9, 2], [-3, 10], [3, 10], [0, -16]].reverse().map(([dx, dy]) => `<circle cx="${170 + dx}" cy="${86 + dy}" r="5" fill="#8b4fb0"/>`).join('');
      const fruits = [[60, '苹果', `<circle cx="60" cy="86" r="14" fill="#e2473a"/><path d="M60 72q2-6 8-6" ${sk('#3f8f4f', 2.5)}/>`], [115, '香蕉', `<path d="M100 76q15 28 34 4q-12 10-26-8z" fill="#f2d03a"/>`], [170, '葡萄', grapes], [230, '橙子', `<circle cx="230" cy="86" r="14" fill="#f29a2e"/><path d="M230 72q6-6 10-2q-4 4-10 2z" fill="#3f8f4f"/>`]];
      return GND() + fruits.map(([x, t, art], i) => `<g ${s.a(pop(8 + i * 6), ORG(x, 86))}>${art}</g><text x="${x}" y="114" font-size="8" text-anchor="middle" ${fl(CL.m)} ${s.a(showAt(10 + i * 6))}>${t}</text>`).join('') +
        `<rect x="32" y="56" width="236" height="66" rx="10" ${sk(CL.v, 3)} ${DASH} ${s.a(drawP(36, 46))}/>` + chip(s, 150, 44, 76, '统称：水果', CL.v, 44);
    }},
    graduate: {dur: 6, hl: [8, 46], end: 60, lit: '一步步走完', mean: '毕业；毕业生', draw: s => {
      const cap = (x, y) => `<path d="M${x - 12} ${y}l12-5 12 5-12 5z" fill="${INK}"/><rect x="${x - 6}" y="${y + 2}" width="12" height="5" fill="${INK}"/><path d="M${x + 9} ${y + 1}v8" ${sk('#f6d34a', 1.5)}/>`;
      return GND() + ['大一', '大二', '大三', '大四'].map((t, i) => `<rect x="${80 + i * 36}" y="${112 - i * 14}" width="${i < 3 ? 36 : 102}" height="${16 + i * 14}" ${fl(CL.m, .25 + i * .08)}/><text x="${98 + i * 36}" y="${123 - i * 14}" font-size="8" font-weight="700" text-anchor="middle" ${fl(CL.k)} ${s.a(showAt(14 + i * 6))}>${t}</text>`).join('') +
        `<g ${s.a(move([[8, 0, 0], [11, 24, -24], [14, 48, -16], [17, 66, -38], [20, 84, -30], [23, 102, -52], [26, 120, -44], [29, 138, -66], [32, 156, -58], [40, 190, -58]]))}>${kid(50, 128, CL.v, {k: .7, armR: s.a({0: R(0), 44: R(0), 47: R(-140), 92: R(-140), 100: R(0)}, shoulder(50, 128, 1, .7))})}<g ${s.a({0: 'opacity:1', 46: 'opacity:1', 46.5: 'opacity:0', 99: 'opacity:0', 100: 'opacity:1'})}>${cap(50, 80)}</g></g>` +
        `<g ${s.a({0: 'opacity:0;' + T(0, 0, 'rotate(0deg)'), 46: 'opacity:0;' + T(0, 0, 'rotate(0deg)'), 46.5: 'opacity:1;' + T(0, 0, 'rotate(0deg)'), 54: 'opacity:1;' + T(10, -18, 'rotate(200deg)'), 92: 'opacity:1;' + T(10, -18, 'rotate(200deg)'), 100: 'opacity:0;' + T(10, -18, 'rotate(200deg)')}, ORG(240, 26))}>${cap(240, 22)}</g>` +
        `<g ${s.a(pop(50), ORG(214, 30))}>${sparkle(212, 30, 6)}${sparkle(270, 40, 5)}</g>` + chip(s, 90, 30, 60, '毕业啦', CL.a, 50);
    }},
    greenhouse: {dur: 6, hl: [8, 24], end: 60, lit: '种绿植的房子', mean: '温室', draw: s => {
      const sprout = (x, p) => `<g ${s.a(growY(p, p + 10), FOOT)}><path d="M${x} 128v-26" ${sk('#3f8f4f', 3)}/><path d="M${x} 112q-12-2-14-12q12 0 14 12zM${x} 106q12-2 14-12q-12 0-14 12z" fill="#3fbf6a"/></g>`;
      return GND() + `<circle cx="36" cy="30" r="12" ${fl(CL.g)}/><path d="M36 10v-5M16 30h-5M22 16l-4-4M50 16l4-4" ${sk(CL.g, 2.5)}/>` +
        sprout(118, 8) + sprout(150, 11) + sprout(182, 14) +
        `<g ${s.a(fadeP(24, 32))}><path d="M90 128V72h120v56M84 72l66-26 66 26z" fill="#bfe1f2" fill-opacity=".35" style="stroke:#7fa9c4;stroke-width:2.5px"/><path d="M130 72v56M170 72v56M150 46v26" ${sk('#7fa9c4', 1.5)}/></g>` +
        [[50, 40, 112, 70], [56, 32, 140, 58]].map(([a, b, c, d], i) => `<path d="M${a} ${b}L${c} ${d}" ${sk(CL.g, 2.5)} ${DASH} ${s.a(drawP(34 + i * 2, 40 + i * 2))}/>`).join('') +
        `<g ${s.a(showAt(42))}><path d="M110 96q6-6 12 0t12 0 12 0 12 0 12 0 12 0" ${sk('#e2473a', 2)}/><path d="M104 84q6-6 12 0t12 0 12 0 12 0 12 0 12 0" ${sk('#e2473a', 2, .6)}/></g>` +
        `<rect x="254" y="40" width="12" height="74" rx="6" ${fs(CL.p, CL.m, 2)}/><circle cx="260" cy="118" r="9" fill="#e2473a"/><rect x="257" y="60" width="6" height="54" fill="#e2473a" ${s.a(growY(34, 50), FOOT)}/>` +
        chip(s, 150, 22, 72, '里面暖洋洋', CL.a, 50);
    }},
    interview: {dur: 6, hl: [10, 22], end: 60, lit: '面对面互相看', mean: '面试；采访', draw: s => {
      const eye = (x, y) => `<path d="M${x - 10} ${y}q10-9 20 0q-10 9-20 0z" ${fs(CL.p, CL.k, 1.5)}/><circle cx="${x}" cy="${y}" r="3" ${fl(CL.k)}/>`;
      return GND() + kid(80, 128, CL.t, {aR: [18, -30]}) + `<path d="M93 64q-3 5 0 7a3 3 0 0 0 0-7z" fill="#6db7e8" ${s.a(showAt(14))}/>` +
        kid(220, 128, '#3d4a5c', {aL: [-16, -34]}) + `<circle cx="216" cy="76" r="3.8" ${sk(INK, 1.2)}/><circle cx="224" cy="76" r="3.8" ${sk(INK, 1.2)}/>` +
        `<rect x="110" y="96" width="80" height="7" rx="2" fill="${WOOD}"/><path d="M118 103v25M182 103v25" ${sk(WOOD, 3)}/>` +
        `<g ${s.a(fadeP(10, 14))}><path d="M96 70H200" ${sk(CL.v, 2)} stroke-dasharray="4 4"/><path d="M194 65l7 5-7 5" ${sk(CL.v, 2)}/></g>` +
        `<g ${s.a(fadeP(12, 16))}><path d="M204 82H100" ${sk(CL.a, 2)} stroke-dasharray="4 4"/><path d="M106 77l-7 5 7 5" ${sk(CL.a, 2)}/></g>` +
        `<g ${s.a(pop(22), ORG(80, 40))}>${eye(80, 40)}</g><g ${s.a(pop(24), ORG(220, 40))}>${eye(220, 40)}</g>` +
        `<g ${s.a(move([[30, 0, 0], [38, 92, -6]]))}><rect x="92" y="88" width="14" height="18" rx="1" fill="#fff" style="stroke:var(--ink3);stroke-width:1.2px"/><path d="M95 93h8M95 97h8M95 101h5" ${sk(CL.m, 1)}/></g>` +
        chip(s, 150, 22, 68, '面试开始', CL.v, 50);
    }},
    leader: {dur: 6, hl: [8, 50], end: 60, lit: '带队的人', mean: '领导者；领袖', draw: s => {
      const crew = [[100, CL.t], [76, CL.v], [52, CL.g], [28, CL.t]];
      const flag = `<path d="M140 78V36" ${sk(INK, 2)}/><path d="M140 36l22 7-22 7z" fill="#d23c2f"/>`;
      return GND() + `<path d="M170 140H280" ${sk(CL.a, 2.5)} stroke-dasharray="6 6" ${s.a(fadeP(8, 12))}/><path d="M276 134l8 6-8 6" ${sk(CL.a, 2.5)} ${s.a(fadeP(8, 12))}/>` +
        `<g ${s.a(move([[10, 0, 0], [50, 120, 0]]))}>` + crew.map(([x, c]) => kid(x, 128, c, {k: .7, ...walkLegs(s, x, 128, 10, 50, 10, .7)})).join('') +
        kid(130, 128, CL.a, {aR: [10, -50], holdR: flag, ...walkLegs(s, 130, 128, 10, 50, 10)}) + `</g>` +
        `<g ${s.a(pop(50), ORG(250, 50))}>${star5(236, 50, 8, 3.4, CL.g)}</g>` + chip(s, 80, 30, 64, '领队的人', CL.a, 50);
    }},
    lifestyle: {dur: 6, hl: [8, 26], end: 60, lit: '生活的样子', mean: '生活方式', draw: s => {
      const W = walkLegs(s, 60, 128, 8, 56, 16);
      const icons = [[190, 40, '早起', 190, 22, 'middle', `<circle cx="190" cy="40" r="6" ${fl(CL.g)}/><path d="M190 30v-3M180 40h-3M200 40h3M183 33l-2-2M197 33l2-2" ${sk(CL.g, 2)}/>`],
        [222, 72, '跑步', 244, 75, 'start', `<path d="M213 76q0-8 6-8l3 4h6q4 0 4 4z" fill="${CL.a}"/>`],
        [190, 104, '吃蔬菜', 190, 136, 'middle', `<path d="M180 102h20a10 10 0 0 1-20 0z" fill="${WOOD}"/><circle cx="186" cy="99" r="4" fill="#3fbf6a"/><circle cx="193" cy="98" r="4" fill="#3f8f4f"/>`],
        [158, 72, '早睡', 136, 75, 'end', `<path d="M164 63a9 9 0 1 0 0 18a10 10 0 0 1 0-18z" fill="#f6d34a"/>`]];
      return GND() + `<circle cx="190" cy="72" r="46" ${fs(CL.p, CL.m, 3)}/>` +
        `<g ${s.a({0: R(0), 26: R(0), 56: R(360), 100: R(360)}, ORG(190, 72))}><path d="M190 72V44" ${sk(CL.k, 2.5)}/></g><circle cx="190" cy="72" r="3" ${fl(CL.k)}/>` +
        icons.map(([x, y, t, tx, ty, an, art], i) => `<g ${s.a(pop(26 + i * 7), ORG(x, y))}>${art}</g><text x="${tx}" y="${ty}" font-size="9" font-weight="700" text-anchor="${an}" ${fl(CL.t)} ${s.a(showAt(28 + i * 7))}>${t}</text>`).join('') +
        `<g ${s.a({0: T(), 8: T(), ...Object.fromEntries([...Array(12)].map((_, i) => [f1(8 + i * 4), T(0, i % 2 ? -3 : 0)])), 56: T(), 100: T()})}>${kid(60, 128, CL.t, W)}</g>` +
        chip(s, 64, 34, 84, '健康的生活方式', CL.t, 52);
    }},
    // ---------- 第二十四批 ----------
    mostly: {dur: 6, hl: [8, 46], end: 60, lit: '大多数时候', mean: '主要地；大部分', draw: s => {
      const rice = x => `<path d="M${x - 13} 84h26a13 12 0 0 1-26 0z" fill="#6db7e8"/><path d="M${x - 11} 84a11 7 0 0 1 22 0z" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/>`;
      const burger = x => `<path d="M${x - 11} 82a11 8 0 0 1 22 0z" fill="${BREAD}"/><rect x="${x - 12}" y="82" width="24" height="4" fill="#8b4a2a"/><rect x="${x - 12}" y="86" width="24" height="3" fill="#3fbf6a"/><path d="M${x - 11} 89h22a3 3 0 0 1-3 5h-16a3 3 0 0 1-3-5z" fill="${BREAD}"/>`;
      return ['一', '二', '三', '四', '五', '六', '日'].map((d, i) => { const x = 36 + i * 38;
        return `<rect x="${x - 17}" y="50" width="34" height="58" rx="5" ${fs(CL.p, CL.m, 1.5)}/><text x="${x}" y="63" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>周${d}</text>` +
          `<g ${s.a(pop(8 + i * 4), ORG(x, 88))}>${i === 3 ? burger(x) : rice(x)}</g>` +
          (i === 3 ? '' : `<g ${s.a(pop(40), ORG(x, 116))}><circle cx="${x}" cy="116" r="5" fill="#3fbf6a"/><path d="M${x - 2.5} 116l1.8 1.8 3.4-3.6" ${sk('#fff', 1.4)}/></g>`); }).join('') +
        `<text x="150" y="34" font-size="16" font-weight="700" text-anchor="middle" ${fl(CL.t)} ${s.a(pop(42), ORG(150, 28))}>6 / 7</text>` +
        chip(s, 150, 136, 104, '大多数天吃米饭', CL.t, 46);
    }},
    purchase: {dur: 6, hl: [8, 18], end: 60, lit: '追着去买', mean: '购买；购买物', draw: s => {
      const W = walkLegs(s, 40, 128, 18, 40, 6);
      const cart = `<path d="M62 92h44l-6 22H68z" ${fs(CL.p, CL.m, 2.5)}/><path d="M56 86l6 6" ${sk(CL.m, 2.5)}/><circle cx="72" cy="120" r="4" fill="${INK}"/><circle cx="98" cy="120" r="4" fill="${INK}"/>`;
      return GND() + `<rect x="222" y="60" width="68" height="68" ${fl(WOOD, .4)}/><path d="M222 98h68M222 124h68" ${sk(WOOD, 2.5)}/>` +
        `<rect x="256" y="84" width="14" height="14" rx="1" ${fl(CL.v)}/><rect x="274" y="86" width="10" height="12" rx="1" ${fl(CL.t)}/><rect x="230" y="110" width="16" height="14" rx="1" ${fl(CL.g)}/><rect x="252" y="112" width="14" height="12" rx="1" ${fl(CL.a)}/>` +
        `<g ${s.a(pop(8), ORG(256, 40))}><rect x="224" y="30" width="64" height="20" rx="4" fill="#d23c2f"/><text x="256" y="44" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">限时半价</text></g>` +
        `<path d="M112 140H206" ${sk(CL.t, 2.5)} stroke-dasharray="6 6" ${s.a(fadeP(8, 14))}/><path d="M204 134l8 6-8 6" ${sk(CL.t, 2.5)} ${s.a(fadeP(8, 14))}/>` +
        `<g ${s.a({0: 'opacity:0;' + T(), 42: 'opacity:0;' + T(), 43: 'opacity:1;' + T(), 46: 'opacity:1;' + T(-18, -22), 49: 'opacity:1;' + T(-38, 0), 92: 'opacity:1;' + T(-38, 0), 100: 'opacity:0;' + T(-38, 0)})}><rect x="234" y="84" width="16" height="14" rx="1" fill="#e2473a"/></g>` +
        `<g ${s.a(move([[18, 0, 0], [40, 120, 0]]))}>${cart}${kid(40, 128, CL.t, {...W, aR: [16, -42]})}<path d="M22 84h-12M24 96h-16M22 108h-10" ${sk(CL.m, 2)} ${s.a(showAt(18, 36))}/></g>` +
        chip(s, 110, 30, 60, '买到啦', CL.a, 52);
    }},
    regard: {dur: 6, hl: [8, 20], end: 60, lit: '仔细地看待', mean: '把…视为；关心', draw: s => {
      const lean = {0: R(0), 8: R(0), 12: R(8), 15: R(2), 18: R(8), 21: R(2), 24: R(8), 36: R(8), 40: R(0), 100: R(0)};
      return GND() + `<rect x="180" y="102" width="40" height="26" ${fl(CL.m, .35)}/>` +
        `<path d="M184 102q-4-14 8-18q8-8 18-2q10 4 6 20z" fill="#9a948c" ${s.a(hideAt(46))}/>` +
        `<g ${s.a(pop(46), ORG(200, 92))}><path d="M186 90l6-8h16l6 8-14 13z" fill="#6db7e8"/><path d="M186 90h28M192 82l8 21M208 82l-8 21" ${sk('#fff', 1, .7)}/></g>` +
        `<g ${s.a(pop(50), ORG(200, 70))}>${sparkle(178, 76, 5)}${sparkle(222, 72, 6)}</g>` +
        `<g ${s.a(lean, FOOT)}>${kid(96, 128, CL.t, {aR: [20, -36], holdR: `<path d="M116 92l8-8" ${sk(INK, 2.5)}/><circle cx="130" cy="78" r="9" ${fs('#bfe1f2', INK, 2.5, .6)}/>`})}</g>` +
        `<path d="M140 80L184 92" ${sk(CL.v, 2)} stroke-dasharray="3 4" ${s.a(fadeP(20, 26))}/>` +
        `<g ${s.a(pop(34), ORG(80, 30))}>${bubble(80, 30)}<path d="M73 28l3-4h8l3 4-7 6z" fill="#6db7e8"/></g>` +
        chip(s, 220, 30, 96, '把石头视为宝贝', CL.v, 50);
    }},
    relevant: {dur: 6, hl: [8, 20, 50], end: 60, lit: '能撬动问题的', mean: '相关的；切题的', draw: s => {
      const tilt = {0: R(12), 18: R(12), 24: R(-12), 26: R(-9), 28: R(-12), 92: R(-12), 100: R(12)};
      return GND() + `<path d="M150 102l-14 26h28z" ${fl(CL.m, .7)}/>` +
        `<g ${s.a(tilt, ORG(150, 99))}><rect x="56" y="96" width="188" height="6" rx="2" fill="${WOOD}"/>` +
        `<g ${s.a(moveIn([[8, 0, -70], [18, 0, 0]]))}><rect x="66" y="76" width="34" height="20" rx="2" ${fl(CL.t)}/><text x="83" y="90" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">答案</text></g>` +
        `<rect x="198" y="72" width="40" height="24" rx="2" ${fl(CL.a)}/><text x="218" y="88" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">问题</text></g>` +
        `<g ${s.a(pop(44), ORG(150, 56))}><rect x="134" y="50" width="18" height="11" rx="5.5" ${sk(CL.v, 3)}/><rect x="148" y="50" width="18" height="11" rx="5.5" ${sk(CL.v, 3)}/></g>` +
        chip(s, 150, 26, 84, '答案对上问题', CL.v, 50);
    }},
    vegetarian: {dur: 6, hl: [10, 40], end: 60, lit: '只吃植物的人', mean: '素食者；素食的', draw: s => {
      const shake = {0: R(0), 32: R(0), 34: R(-7), 36: R(7), 38: R(-7), 40: R(0), 100: R(0)};
      return GND() + `<rect x="140" y="100" width="130" height="6" rx="2" fill="${WOOD}"/><path d="M150 106v22M260 106v22" ${sk(WOOD, 3)}/><ellipse cx="196" cy="98" rx="32" ry="6" ${fs('#fff', CL.m, 1.5)}/>` +
        `<g ${s.a(pop(10), ORG(180, 90))}><path d="M180 98v-6" ${sk('#3f8f4f', 3)}/><circle cx="176" cy="88" r="5" fill="#3f8f4f"/><circle cx="184" cy="88" r="5" fill="#3f8f4f"/><circle cx="180" cy="84" r="5" fill="#3fbf6a"/></g>` +
        `<g ${s.a(pop(14), ORG(196, 92))}><path d="M190 96l14-8-2 6z" fill="#f29a2e"/><path d="M204 88l4-3M204 88l4 1" ${sk('#3f8f4f', 1.5)}/></g>` +
        `<g ${s.a(pop(18), ORG(212, 92))}><circle cx="212" cy="92" r="6" fill="#e2473a"/><path d="M210 86h4" ${sk('#3f8f4f', 2)}/></g>` +
        `<g ${s.a({0: 'opacity:0;' + T(60), 26: 'opacity:0;' + T(60), 27: 'opacity:1;' + T(60), 32: 'opacity:1;' + T(), 40: 'opacity:1;' + T(), 46: 'opacity:1;' + T(70), 47: 'opacity:0;' + T(70), 100: 'opacity:0;' + T(70)})}><path d="M232 92q0-10 12-10t10 10q-2 8-12 6z" fill="#b5651d"/><path d="M252 94l8 4" ${sk('#f4e6d8', 3)}/></g>` +
        `<path d="M234 80l20 20M254 80l-20 20" ${sk('#d23c2f', 3)} ${s.a(showAt(34, 40))}/>` +
        `<g ${s.a(shake, ORG(90, 92))}>${kid(90, 128, CL.t, {aR: [18, -32]})}</g>` +
        `<g ${s.a(pop(40), ORG(90, 104))}><path d="M84 108q0-10 12-12q0 10-12 12z" fill="#3fbf6a"/><path d="M84 108l8-7" ${sk('#fff', 1)}/></g>` +
        chip(s, 100, 30, 92, '不吃肉，只吃素', CL.t, 50);
    }},
    wellbeing: {dur: 6, hl: [8, 30], end: 60, lit: '活得好好的', mean: '幸福；健康', draw: s => {
      const sway = {0: R(0), 8: R(0), 16: R(-6), 24: R(6), 32: R(-6), 40: R(0), 100: R(0)};
      return GND() + `<g ${s.a(sway, FOOT)}>${kid(70, 128, CL.t, {aL: [-14, -60], aR: [14, -60]})}</g>` +
        ['身体', '心情', '睡眠'].map((t, i) => { const y = 40 + i * 26, p = 8 + i * 8;
          return `<text x="150" y="${y + 10}" font-size="10" font-weight="700" ${fl(CL.k)}>${t}</text><rect x="180" y="${y}" width="90" height="12" rx="6" ${fs(CL.p, CL.m, 1.5)}/><rect x="181" y="${y + 1}" width="88" height="10" rx="5" fill="#3fbf6a" ${s.a(growX(p, p + 12), 'transform-origin:0% 50%;transform-box:fill-box')}/>` +
            `<g ${s.a(pop(p + 12), ORG(282, y + 6))}><circle cx="282" cy="${y + 6}" r="5" fill="#3fbf6a"/><path d="M279.5 ${y + 6}l1.8 1.8 3.4-3.6" ${sk('#fff', 1.4)}/></g>`; }).join('') +
        [0, 1, 2].map(i => `<g ${s.a({0: 'opacity:0;' + T(), [32 + i * 5]: 'opacity:0;' + T(), [34 + i * 5]: 'opacity:1;' + T(), [50 + i * 5]: 'opacity:0;' + T((i - 1) * 16, -40), 100: 'opacity:0;' + T((i - 1) * 16, -40)})}>${heartAt(70, 56, .6, [CL.a, '#f2a3b3', CL.v][i])}</g>`).join('') +
        chip(s, 226, 128, 64, '身心都好', CL.t, 50);
    }},
    basic: {dur: 6, hl: [8, 30], end: 60, lit: '打底的', mean: '基本的；基础的', draw: s => {
      return GND() + `<g ${s.a(growY(8, 14), FOOT)}><rect x="80" y="112" width="140" height="16" fill="#8a8a8a"/><path d="M80 120h140" ${sk('#6a6a6a', 1.5)}/></g>` +
        `<g ${s.a(showAt(14, 40))}><path d="M254 120H228" ${sk(CL.a, 2)}/><path d="M234 115l-7 5 7 5" ${sk(CL.a, 2)}/><text x="258" y="124" font-size="10" font-weight="700" ${fl(CL.a)}>地基</text></g>` +
        [0, 1, 2, 3].map(r => { const y = 102 - r * 10, xs = []; for (let x = 90 + (r % 2 ? 10 : 20); x < 210; x += 20) xs.push(`M${x} ${y}v10`);
          return `<g ${s.a(moveIn([[24 + r * 4, 0, -24], [28 + r * 4, 0, 0]]))}><rect x="90" y="${y}" width="120" height="10" fill="#c8664a"/><path d="${xs.join('')}M90 ${y + 10}h120" ${sk('#f4e6d8', 1.2)}/></g>`; }).join('') +
        `<path d="M84 72l66-34 66 34z" fill="#d23c2f" ${s.a(moveIn([[42, 0, -30], [47, 0, 0]]))}/>` +
        `<g ${s.a(pop(50), ORG(150, 92))}><rect x="140" y="88" width="20" height="24" rx="2" fill="${WOOD}"/><rect x="104" y="82" width="18" height="14" fill="#bfe1f2"/><rect x="178" y="82" width="18" height="14" fill="#bfe1f2"/></g>` +
        chip(s, 150, 22, 96, '先打地基再盖楼', CL.t, 52);
    }},
    cathedral: {dur: 6, hl: [8, 30], end: 60, lit: '设主教宝座的', mean: '大教堂', draw: s => {
      const tower = x => `<rect x="${x}" y="34" width="30" height="94" fill="#cbb89c"/><path d="M${x - 2} 34l17-28 17 28z" fill="#8b6f56"/><path d="M${x + 15} 48v14" ${sk('#3a2e28', 5)}/>`;
      return GND() + `<g ${s.a(growY(24, 40), FOOT)}><rect x="98" y="58" width="104" height="70" fill="#d8c8b0"/><path d="M94 58l56-22 56 22z" fill="#8b6f56"/>${tower(70)}${tower(200)}` +
        `<circle cx="150" cy="74" r="11" fill="#9fd0ee" style="stroke:#8b6f56;stroke-width:2px"/><path d="M150 63v22M139 74h22M142 66l16 16M158 66l-16 16" ${sk('#8b6f56', 1)}/><path d="M130 128V104a20 20 0 0 1 40 0V128z" fill="#3a2e28"/></g>` +
        `<g ${s.a(pop(8), ORG(150, 112))}><rect x="143" y="96" width="14" height="18" rx="2" fill="#d23c2f" style="stroke:#e2b13c;stroke-width:1.5px"/><rect x="139" y="112" width="22" height="5" rx="1" fill="#e2b13c"/><path d="M142 117v10M158 117v10" ${sk('#e2b13c', 2)}/><circle cx="150" cy="93" r="3" fill="#e2b13c"/></g>` +
        `<text x="150" y="82" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.a)} ${s.a(showAt(10, 22))}>主教宝座</text>` +
        `<g ${s.a(showAt(46))}><path d="M60 50q-6 6 0 12M54 46q-10 10 0 20M240 50q6 6 0 12M246 46q10 10 0 20" ${sk(CL.g, 2)}/></g>` +
        chip(s, 150, 140, 96, '主教坐镇的教堂', CL.v, 50);
    }},
    celebrity: {dur: 6, hl: [8, 40], end: 60, lit: '出名的人', mean: '名人；名声', draw: s => {
      const fans = [[36, CL.t], [70, CL.v], [230, CL.g], [264, CL.a]];
      const flash = (x, y, p) => `<g ${s.a({0: 'opacity:0;transform:scale(.4)', [p]: 'opacity:0;transform:scale(.4)', [p + 1]: 'opacity:1;transform:scale(1)', [p + 5]: 'opacity:0;transform:scale(1.5)', 100: 'opacity:0'}, ORG(x, y))}>${sparkle(x, y, 9, '#fff6c8')}${sparkle(x, y, 5, CL.g)}</g>`;
      return GND() + `<path d="M150 0L108 118h84z" fill="#f6e7a8" opacity=".55" ${s.a(showAt(8))}/><path d="M104 128L132 104h36l28 24z" fill="#d23c2f"/>` +
        kid(150, 108, CL.v, {k: .9, aR: [14, -52]}) + `<path d="M142 61h16" ${sk(INK, 3.5)}/>` +
        fans.map(([x, c]) => kid(x, 128, c, {k: .6, aR: [8, -46], holdR: `<rect x="${x + 2}" y="92" width="7" height="10" rx="1" fill="${INK}"/>`})).join('') +
        fans.map(([x], i) => flash(x + 5, 90, 14 + i * 6)).join('') +
        fans.map(([x], i) => `<g ${s.a({0: 'opacity:0;' + T(), [40 + i * 3]: 'opacity:0;' + T(), [42 + i * 3]: 'opacity:1;' + T(), [56 + i * 3]: 'opacity:0;' + T(0, -36), 100: 'opacity:0;' + T(0, -36)})}>${heartAt(x, 78, .5)}</g>`).join('') +
        `<g ${s.a(pop(40), ORG(150, 34))}>${star5(150, 34, 9, 3.8, CL.g)}</g>` + chip(s, 150, 14, 96, '大家都追的名人', CL.a, 50);
    }},
    complete: {dur: 6, hl: [8, 20], end: 60, lit: '填满了', mean: '完成；完整的', draw: s => {
      const ys = [42, 60, 78, 96], pen = {0: 'opacity:0;' + T(108, 42), 7: 'opacity:0;' + T(108, 42), 8: 'opacity:1;' + T(110, 42), 28: 'opacity:0;' + T(186, 96), 100: 'opacity:0;' + T(186, 96)};
      ys.forEach((y, i) => { pen[8 + i * 5] = 'opacity:1;' + T(112, y); pen[12 + i * 5] = 'opacity:1;' + T(184, y); });
      return `<rect x="60" y="10" width="140" height="128" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="130" y="26" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>报名表</text>` +
        ys.map((y, i) => `<path d="M70 ${y}h28" ${sk(CL.m, 2.5, .5)}/><rect x="106" y="${y - 7}" width="84" height="14" rx="2" ${sk(CL.m, 1.5)}/><path d="M112 ${y}c6-4 8 2 14-1s8 2 14-1 8 2 14-1 8 2 14-1 8 2 14-1" ${sk(CL.v, 1.8)} ${DASH} ${s.a(drawP(8 + i * 5, 12 + i * 5))}/>`).join('') +
        `<g ${s.a(pen)}><path d="M0 0l3-8 14-14 5 5-14 14z" fill="${INK}"/></g>` +
        `<rect x="228" y="28" width="26" height="96" rx="5" ${fs(CL.p, CL.m, 2)}/><rect x="231" y="31" width="20" height="90" rx="3" fill="#3fbf6a" ${s.a(growY(8, 28), FOOT)}/>` +
        `<text x="241" y="20" font-size="11" font-weight="700" text-anchor="middle" fill="#3fbf6a" ${s.a(pop(30), ORG(241, 16))}>100%</text>` +
        `<g ${s.a(pop(44), ORG(150, 120))}><circle cx="150" cy="120" r="13" ${sk('#d23c2f', 2.5)}/><text x="150" y="124" font-size="10" font-weight="700" text-anchor="middle" fill="#d23c2f">完成</text></g>`;
    }},
    experiment: {dur: 6, hl: [8, 16, 50], end: 60, lit: '出手反复尝试', mean: '实验；试验', draw: s => {
      const tube = (c, p) => `<g ${s.a(showAt(p, p + 6))}><rect x="150" y="30" width="8" height="26" rx="4" ${fs(c, CL.m, 1)} transform="rotate(50 154 43)"/><path d="M164 52v8" ${sk(c, 2.5)}/></g>`;
      return `<rect x="110" y="100" width="170" height="6" rx="2" fill="${WOOD}"/><path d="M120 106v22M270 106v22" ${sk(WOOD, 3)}/>` + GND() +
        `<path d="M164 60v16l-16 24h48l-16-24V60z" fill="#eef6fb" style="stroke:var(--ink3);stroke-width:2px"/>` +
        `<path d="M156 88h32l8 12h-48z" fill="#9fd0ee" ${s.a({0: 'fill:#9fd0ee', 14: 'fill:#9fd0ee', 18: 'fill:#8a8a8a', 30: 'fill:#8a8a8a', 38: 'fill:#3fbf6a', 92: 'fill:#3fbf6a', 100: 'fill:#9fd0ee'})}/>` +
        tube('#f6d34a', 10) + tube('#f2a3b3', 30) +
        `<g ${s.a(showAt(18, 26))}><circle cx="166" cy="48" r="8" fill="#8a8a8a"/><circle cx="178" cy="40" r="10" fill="#8a8a8a"/><circle cx="190" cy="48" r="7" fill="#8a8a8a"/></g>` +
        `<path d="M206 40l12 12M218 40l-12 12" ${sk('#d23c2f', 3)} ${s.a(showAt(20, 28))}/>` +
        [0, 1, 2].map(i => `<circle cx="${164 + i * 8}" cy="94" r="2.5" fill="#fff" ${s.a({0: 'opacity:0;' + T(), [38 + i * 2]: 'opacity:0;' + T(), [40 + i * 2]: 'opacity:1;' + T(), [52 + i * 2]: 'opacity:0;' + T(0, -46), 100: 'opacity:0;' + T(0, -46)})}/>`).join('') +
        `<g ${s.a(pop(42), ORG(212, 46))}><circle cx="212" cy="46" r="8" fill="#3fbf6a"/><path d="M208 46l3 3 5-6" ${sk('#fff', 2)}/></g>` +
        kid(124, 128, CL.v, {aR: [26, -58]}) + `<rect x="115" y="73" width="18" height="6" rx="3" fill="#6db7e8" fill-opacity=".7" style="stroke:var(--ink);stroke-width:1px"/>` +
        chip(s, 236, 20, 96, '失败了再试一次', CL.t, 46);
    }},
    international: {dur: 6, hl: [30, 8, 50], end: 60, lit: '国与国之间的', mean: '国际的', draw: s => {
      const flag = (x, y, c) => `<path d="M${x} ${y}v-18" ${sk(INK, 1.5)}/><path d="M${x} ${y - 18}h12v8h-12z" fill="${c}"/>`;
      const lands = [[60, 92, `<path d="M30 100q-4-20 20-24q20-6 34 8q10 14-6 22q-24 10-48-6z" fill="#8fc98a"/>`, '#d23c2f'], [240, 64, `<path d="M212 70q-2-18 22-20q22 0 26 14q4 16-20 18q-22 2-28-12z" fill="#e8c47a"/>`, '#2f5d8a'], [168, 118, `<path d="M140 122q2-14 22-14q24 0 28 10q2 12-22 12q-24 2-28-8z" fill="#9fc3e8"/>`, '#3f8f4f']];
      const pf = moveIn([[34, 70, 80, 'rotate(-40deg)'], [38, 110, 52, 'rotate(-25deg)'], [42, 151, 38, 'rotate(0deg)'], [46, 193, 38, 'rotate(15deg)'], [50, 236, 52, 'rotate(30deg)']]);
      pf[51] = T(236, 52, 'rotate(30deg)') + ';opacity:0'; pf[92] = pf[51];
      return lands.map(([x, y, art, c], i) => `<g ${s.a(pop(8 + i * 4), ORG(x, y))}>${art}${flag(x, y - 2, c)}</g>`).join('') +
        ['M70 80Q150 10 236 52', 'M240 76Q236 110 192 114', 'M80 104Q120 132 146 120'].map((d, i) => `<path d="${d}" ${sk(CL.v, 2)} stroke-dasharray="4 5" ${s.a(fadeP(30 + i * 2, 34 + i * 2))}/>`).join('') +
        `<g ${s.a(pf)}><path d="M-9 -1.5h15q4 1.5 0 3h-15zM-1 -1l-5-7h3l7 7zM-1 1l-5 7h3l7-7zM-9 -1l-2-4h2l3 4z" fill="#fff" style="stroke:var(--ink);stroke-width:.8px"/></g>` +
        chip(s, 110, 24, 76, '国与国之间', CL.v, 50);
    }},
    // ---------- 第二十五批 ----------
    pressure: {dur: 6, hl: [10, 44], end: 60, lit: '压下来的力', mean: '压力；施压', draw: s => {
      const squash = {0: 'transform:scale(1,1)', 18: 'transform:scale(1,1)', 22: 'transform:scale(1.12,.78)', 26: 'transform:scale(1.06,.84)', 92: 'transform:scale(1.06,.84)', 100: 'transform:scale(1,1)'};
      const needle = {0: R(-70), 20: R(-70), 44: R(70), 48: R(58), 52: R(70), 92: R(70), 100: R(-70)};
      return GND() + `<g ${s.a(squash, FOOT)}>${kid(100, 128, CL.t, {noFace: true, aL: [-16, -60], aR: [16, -60]})}<g ${s.a(hideAt(19))}>${face(100, 128)}</g><g ${s.a(showAt(19))}>${face(100, 128, 1, 'sad')}<path d="M116 66q-3 5 0 7a3 3 0 0 0 0-7z" fill="#6db7e8"/></g></g>` +
        `<g ${s.a({0: 'opacity:0;' + T(0, -90), 10: 'opacity:0;' + T(0, -90), 11: 'opacity:1;' + T(0, -90), 18: 'opacity:1;' + T(0, -10), 22: 'opacity:1;' + T(0, 4), 26: 'opacity:1;' + T(0, 0), 92: 'opacity:1;' + T(0, 0), 100: 'opacity:0;' + T(0, 0)})}><path d="M93 45a7 7 0 0 1 14 0" ${sk('#3a4250', 3)}/><path d="M74 75h52l-6-30h-40z" fill="#556070"/><text x="100" y="66" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">考试</text></g>` +
        `<path d="M200 80a30 30 0 0 1 30-30" ${sk('#3fbf6a', 6)}/><path d="M230 50a30 30 0 0 1 30 30" ${sk('#e2473a', 6)}/><path d="M196 80h68" ${sk(CL.m, 2)}/>` +
        `<g ${s.a(needle, ORG(230, 80))}><path d="M230 80V56" ${sk(CL.k, 3)}/></g><circle cx="230" cy="80" r="4" ${fl(CL.k)}/><text x="230" y="98" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>压力值</text>` +
        chip(s, 230, 124, 72, '压力山大', CL.a, 46);
    }},
    specific: {dur: 6, hl: [8, 30], end: 60, lit: '看清楚的', mean: '具体的；特定的', draw: s => {
      const xs = [40, 84, 128, 172, 216, 260], ys = [66, 98, 130];
      return ys.map((y, r) => xs.map(x => x + (r % 2 ? 22 : 0)).filter(x => x < 290).map(x => (x === 194 && y === 98) ? '' : kid(x, y, '#b8b8b8', {k: .42, noFace: true})).join('')).join('') +
        kid(194, 98, '#b8b8b8', {k: .42, noFace: true}) +
        `<g ${s.a(showAt(30))}>${kid(194, 98, CL.a, {k: .42})}<path d="M187.5 74a6.5 6.5 0 0 1 13 0h4v2h-17z" fill="#d23c2f"/></g>` +
        `<g ${s.a(moveIn([[8, -150, -10], [18, -70, 20], [28, 0, 0]]))}><circle cx="194" cy="80" r="16" ${fs('#bfe1f2', INK, 3, .35)}/><path d="M205 92l12 12" ${sk(INK, 5)}/></g>` +
        chip(s, 194, 22, 84, '具体到这一个', CL.a, 40);
    }},
    temperature: {dur: 6, hl: [10, 44], end: 60, lit: '冷热调和的程度', mean: '温度；体温', draw: s => {
      return GND() + `<rect x="123" y="64" width="54" height="61" rx="3" ${s.a({0: 'transform:scaleY(0);fill:#e2473a', 10: 'transform:scaleY(0);fill:#e2473a', 20: 'transform:scaleY(.5);fill:#e2473a', 22: 'transform:scaleY(.5);fill:#e2473a', 32: 'transform:scaleY(.95);fill:#f29a2e', 92: 'transform:scaleY(.95);fill:#f29a2e', 100: 'transform:scaleY(0);fill:#f29a2e'}, FOOT)}/>` +
        `<path d="M120 60v64a4 4 0 0 0 4 4h52a4 4 0 0 0 4-4V60" ${sk(CL.m, 3)}/>` +
        `<g ${s.a({0: R(0), 10: R(0), 13: R(35), 20: R(35), 22: R(0), 100: R(0)}, ORG(96, 30))}><rect x="64" y="24" width="32" height="28" rx="4" fill="#e2473a"/><path d="M96 26l10-4-10 10z" fill="#e2473a"/><path d="M64 30h-6v16h6" ${sk('#e2473a', 3)}/><text x="80" y="43" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">热</text></g>` +
        `<path d="M110 36Q126 44 140 64" ${sk('#e2473a', 3)} ${s.a(showAt(12, 17))}/>` +
        `<g ${s.a({0: R(0), 22: R(0), 25: R(-35), 32: R(-35), 34: R(0), 100: R(0)}, ORG(204, 30))}><rect x="204" y="24" width="32" height="28" rx="4" fill="#4a90d0"/><path d="M204 26l-10-4 10 10z" fill="#4a90d0"/><path d="M236 30h6v16h-6" ${sk('#4a90d0', 3)}/><text x="220" y="43" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">冷</text></g>` +
        `<path d="M190 36Q174 44 160 64" ${sk('#4a90d0', 3)} ${s.a(showAt(24, 29))}/>` +
        `<rect x="256" y="40" width="12" height="74" rx="6" ${fs(CL.p, CL.m, 2)}/><circle cx="262" cy="118" r="8" fill="#e2473a"/><rect x="259" y="44" width="6" height="70" fill="#e2473a" ${s.a({0: 'transform:scaleY(.15)', 12: 'transform:scaleY(.15)', 20: 'transform:scaleY(.9)', 24: 'transform:scaleY(.9)', 32: 'transform:scaleY(.5)', 92: 'transform:scaleY(.5)', 100: 'transform:scaleY(.15)'}, FOOT)}/>` +
        ['20℃', '90℃', '45℃'].map((t, i) => `<text x="262" y="32" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)} ${s.a(slot([0, 20, 32, 99], i))}>${t}</text>`).join('') +
        chip(s, 150, 140, 72, '冷热调匀了', CL.t, 46);
    }},
    chemical: {dur: 6, hl: [8, 40], end: 60, lit: '化学上的', mean: '化学的；化学品', draw: s => {
      const bottles = [[180, 'HCl', '#9fd0ee'], [214, 'NaOH', '#f2a3b3'], [248, 'CuSO₄', '#4a90d0']];
      return GND() + `<g ${s.a({0: R(0), 20: R(0), 30: R(-12), 40: R(12), 50: R(0), 100: R(0)}, ORG(90, 76))}>` +
        `<path d="M90 72L70 90M90 72L110 90" ${sk(CL.m, 4)} ${s.a(showAt(18))}/><circle cx="90" cy="70" r="14" fill="#e2473a"/><text x="90" y="74" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">O</text>` +
        [[70, -50], [110, 50]].map(([x, dx]) => `<g ${s.a(moveIn([[8, dx, -40], [18, 0, 0]]))}><circle cx="${x}" cy="90" r="9" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><text x="${x}" y="93.5" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>H</text></g>`).join('') + `</g>` +
        `<text x="90" y="120" font-size="12" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(pop(20), ORG(90, 116))}>H₂O</text>` +
        `<rect x="160" y="108" width="110" height="5" rx="2" fill="${WOOD}"/><path d="M168 113v15M262 113v15" ${sk(WOOD, 3)}/>` +
        bottles.map(([x, t, c], i) => `<g ${s.a(pop(40 + i * 3), ORG(x, 90))}><path d="M${x - 5} 66v10l-9 12v20h28v-20l-9-12v-10z" fill="${c}" style="stroke:var(--ink3);stroke-width:1.5px"/><rect x="${x - 7}" y="62" width="14" height="5" rx="1" ${fl(CL.k)}/><rect x="${x - 12}" y="92" width="24" height="10" fill="#fff"/><text x="${x}" y="100" font-size="6.5" font-weight="700" text-anchor="middle" ${fl(CL.k)}>${t}</text></g>`).join('') +
        chip(s, 214, 34, 80, '化学品要小心', CL.a, 50);
    }},
    concept: {dur: 6, hl: [8, 22], end: 60, lit: '脑子里抓住的', mean: '概念；观念', draw: s => {
      const bits = [[160, 30, `<circle cx="160" cy="30" r="8" ${fl(CL.v, .85)}/>`], [256, 40, `<path d="M247 48l9-16 9 16z" ${fl(CL.t, .85)}/>`], [236, 100, `<path d="M224 100q6-9 12 0t12 0" ${sk(CL.a, 4, .85)}/>`]];
      return GND() + bits.map(([x, y, art]) => `<g ${s.a({0: 'opacity:0;' + T(), 3: 'opacity:1;' + T(), 8: 'opacity:1;' + T(), 18: 'opacity:1;' + T(200 - x, 56 - y), 19: 'opacity:0;' + T(200 - x, 56 - y), 100: 'opacity:0;' + T(200 - x, 56 - y)})}>${art}</g>`).join('') +
        `<g ${s.a({0: 'opacity:0;' + T(), 18: 'opacity:0;' + T(), 19: 'opacity:1;' + T(), 22: 'opacity:1;' + T(), 32: 'opacity:1;' + T(-110, -16), 92: 'opacity:1;' + T(-110, -16), 100: 'opacity:0;' + T(-110, -16)})}><path d="M192 52a8 8 0 1 1 16 0c0 4-3 5-3 9h-10c0-4-3-5-3-9z" ${fl(CL.g)}/><path d="M196 65h8" ${sk(CL.k, 2)}/></g>` +
        `<g ${s.a(showAt(33))}><path d="M90 20v-5M76 26l-4-3M104 26l4-3" ${sk(CL.g, 2.5)}/></g>` +
        kid(90, 128, CL.t, {armR: s.a({0: R(0), 18: R(0), 24: R(-130), 32: R(-130), 38: R(0), 100: R(0)}, shoulder(90, 128, 1))}) +
        chip(s, 214, 116, 84, '抓住一个想法', CL.v, 46);
    }},
    content: {dur: 6, hl: [8, 22], end: 60, lit: '握在里面的', mean: '内容；满足的', draw: s => {
      const items = [[132, 112, `<rect x="122" y="104" width="20" height="16" rx="1" ${fl(CL.v)}/><path d="M132 104v16" ${sk(CL.p, 1.2)}/>`], [152, 116, `<circle cx="152" cy="114" r="7" fill="#e2473a"/><path d="M152 107l2-4" ${sk('#3f8f4f', 2)}/>`], [170, 110, `<path d="M166 122l8-24" ${sk(CL.g, 4)}/><path d="M174 98l1-4" ${sk(INK, 2)}/>`]];
      return GND() + `<rect x="116" y="84" width="68" height="44" fill="#6b4428"/>` +
        items.map(([x, y, art], i) => `<g ${s.a(moveIn([[8 + i * 4, 0, -76], [14 + i * 4, 0, 0]]))}>${art}</g>`).join('') +
        `<rect x="116" y="84" width="68" height="44" fill="${WOOD}" ${s.a({0: 'opacity:0', 3: 'opacity:0', 4: 'opacity:1', 7: 'opacity:1', 8: 'opacity:1', 40: 'opacity:1', 44: 'opacity:.25', 92: 'opacity:.25', 100: 'opacity:0'})}/><path d="M116 84h68" ${sk('#6b4428', 2)}/>` +
        `<g ${s.a({0: R(-100), 20: R(-100), 26: R(3), 28: R(0), 94: R(0), 100: R(-100)}, ORG(116, 84))}><rect x="114" y="78" width="72" height="8" rx="2" fill="${WOOD}"/></g>` +
        `<g ${s.a(showAt(26, 40))}><path d="M100 96q-10 10 0 22M200 96q10 10 0 22" ${sk(SKIN, 6)}/></g>` +
        chip(s, 150, 34, 112, '内容：书、苹果、笔', CL.t, 46);
    }},
    describe: {dur: 6, hl: [8, 14], end: 60, lit: '写下来', mean: '描述；形容', draw: s => {
      const lines = ['黄色的猫', '胖乎乎', '爱睡觉'];
      const pen = moveIn([[8, 162, 46], [14, 162, 46], [22, 240, 46], [24, 162, 72], [32, 230, 72], [34, 162, 98], [42, 230, 98]]);
      return GND() + `<ellipse cx="70" cy="122" rx="36" ry="6" fill="#d23c2f" fill-opacity=".6"/><path d="M96 112q20-4 16-22" ${sk('#f2a35a', 5)}/><ellipse cx="74" cy="110" rx="26" ry="13" fill="#f2a35a"/>` +
        `<circle cx="48" cy="102" r="11" fill="#f2a35a"/><path d="M40 94l2-9 6 6M50 91l6-6 2 9" fill="#f2a35a"/><path d="M42 102q2 2 4 0M50 102q2 2 4 0" ${sk(INK, 1.2)}/>` +
        `<text x="56" y="80" font-size="10" font-weight="700" ${fl(CL.m)} ${s.a(showAt(4))}>z z</text>` +
        `<rect x="150" y="22" width="130" height="100" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/>` +
        lines.map((t, i) => { const y = 50 + i * 26, p0 = 14 + i * 10, p1 = 22 + i * 10; return `<text x="162" y="${y}" font-size="13" font-weight="700" ${fl(CL.v)}>${t}</text><rect x="160" y="${y - 14}" width="92" height="18" fill="#fff" ${s.a({0: 'transform:scaleX(1)', [p0]: 'transform:scaleX(1)', [p1]: 'transform:scaleX(0)', 92: 'transform:scaleX(0)', 100: 'transform:scaleX(1)'}, 'transform-origin:100% 50%;transform-box:fill-box')}/>`; }).join('') +
        `<g ${s.a(pen)}><path d="M0 0l3-8 14-14 5 5-14 14z" fill="${INK}"/></g>` +
        chip(s, 74, 44, 72, '把猫写出来', CL.v, 50);
    }},
    easily: {dur: 6, hl: [10, 46], end: 60, lit: '容易地', mean: '容易地；无疑', draw: s => {
      const note = (x, y, c) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="3" ${fl(c)}/><path d="M${x + 3.5} ${y - 1}v-12q4 2 5 6" ${sk(c, 1.6)}/>`;
      return GND() + `<rect x="140" y="20" width="140" height="76" rx="3" ${fs('#2f4f43', WOOD, 4)}/><text x="196" y="66" font-size="20" font-weight="700" text-anchor="middle" fill="#f4f1e6">1 + 1 =</text>` +
        `<text x="252" y="66" font-size="20" font-weight="700" text-anchor="middle" fill="#f4f1e6" ${s.a(hideAt(18))}>?</text><text x="252" y="66" font-size="20" font-weight="700" text-anchor="middle" fill="#f6d34a" ${s.a(showAt(18))}>2</text>` +
        `<g ${s.a(pop(22), ORG(262, 34))}><circle cx="262" cy="34" r="8" fill="#3fbf6a"/><path d="M258 34l3 3 5-6" ${sk('#fff', 2)}/></g>` +
        kid(100, 128, CL.a, {aR: [22, -48], aL: [-8, -18]}) +
        [0, 1].map(i => `<g ${s.a({0: 'opacity:0;' + T(), [26 + i * 8]: 'opacity:0;' + T(), [28 + i * 8]: 'opacity:1;' + T(), [42 + i * 8]: 'opacity:0;' + T(-14, -30), 100: 'opacity:0;' + T(-14, -30)})}>${note(84, 62, [CL.v, CL.t][i])}</g>`).join('') +
        chip(s, 70, 30, 64, '轻轻松松', CL.a, 46);
    }},
    generally: {dur: 6, hl: [10, 46], end: 60, lit: '总体上来说', mean: '通常；大体上', draw: s => {
      const trees = [[30, 46, 26], [62, 60, 30], [96, 40, 24], [124, 54, 28], [150, 64, 32], [178, 48, 26], [206, 58, 30], [238, 44, 24], [268, 56, 28]];
      return `<g ${s.a({0: 'transform:scale(2.6)', 10: 'transform:scale(2.6)', 34: 'transform:scale(1)', 92: 'transform:scale(1)', 100: 'transform:scale(2.6)'}, ORG(150, 100))}>` + GND(-100, 400) +
        trees.map(([x, h, w], i) => `<rect x="${x - 2}" y="118" width="4" height="10" fill="${WOOD}"/><path d="M${x} ${118 - h}l${w / 2} ${h}h-${w}z" fill="${i % 2 ? '#3f8f4f' : '#4fa65c'}"/>`).join('') +
        `<circle cx="156" cy="90" r="3" fill="#e2473a"/><circle cx="144" cy="104" r="3" fill="#e2473a"/><path d="M150 72q4-3 8 0q-4 4-8 0z" fill="${INK}"/></g>` +
        `<g ${s.a(hideAt(14))}><rect x="8" y="8" width="84" height="20" rx="6" ${fl(CL.k, .75)}/><text x="50" y="22" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">只盯着一棵树</text></g>` +
        chip(s, 150, 22, 108, '总体来看：一片森林', CL.t, 40);
    }},
    identity: {dur: 6, hl: [24, 46], end: 60, lit: '始终是同一个你', mean: '身份；认同', draw: s => {
      const ages = [[40, .45, 4], [96, .7, 10], [166, 1, 16]];
      return GND() + ages.map(([x, k, p]) => `<g ${s.a(pop(p), FOOT)}>${kid(x, 128, CL.t, {k})}</g>`).join('') +
        `<path d="M56 112h18M114 104h26" ${sk(CL.m, 2)} stroke-dasharray="3 3" ${s.a(fadeP(18, 22))}/>` +
        ages.map(([x, k], i) => `<g ${s.a(pop(24 + i * 4), ORG(x, f1(128 - 29 * k)))}>${star5(x, f1(128 - 29 * k), f1(6 * k), f1(2.6 * k), CL.g)}</g>`).join('') +
        `<g ${s.a(pop(46), ORG(250, 80))}><rect x="214" y="58" width="72" height="46" rx="5" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><circle cx="232" cy="76" r="8" fill="${SKIN}"/><path d="M224 76a8 8 0 0 1 16 0q-4-3-8-2t-8 2z" fill="${HAIR}"/><path d="M222 96q0-8 10-8t10 8z" fill="var(--teal)"/><path d="M248 72h30M248 82h24M248 92h28" ${sk(CL.m, 2, .6)}/>${star5(276, 64, 4, 1.8, CL.g)}</g>` +
        chip(s, 250, 30, 64, '身份证', CL.v, 50);
    }},
    institution: {dur: 6, hl: [8, 22, 50], end: 60, lit: '建立起来的机构', mean: '机构；制度', draw: s => {
      return GND() + `<rect x="70" y="116" width="160" height="12" fill="#cbb89c" ${s.a(growY(8, 14), FOOT)}/>` +
        [90, 120, 150, 180, 210].map((x, i) => `<rect x="${x - 6}" y="70" width="12" height="46" fill="#e8dcc8" style="stroke:#b8a68c;stroke-width:1px" ${s.a(growY(22 + i * 2, 30 + i * 2), FOOT)}/>`).join('') +
        `<rect x="74" y="62" width="152" height="8" fill="#cbb89c" ${s.a(moveIn([[34, 0, -30], [38, 0, 0]]))}/>` +
        `<g ${s.a(moveIn([[38, 0, -30], [42, 0, 0]]))}><path d="M70 62l80-26 80 26z" fill="#b8a68c"/><text x="150" y="57" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">大学</text></g>` +
        [[30, CL.t], [270, CL.a]].map(([x, c]) => `<g ${s.a(moveIn([[44, 0, 0], [54, x < 150 ? 100 : -100, 0]]))}>${kid(x, 128, c, {k: .5, ...walkLegs(s, x, 128, 44, 54, 4, .5)})}</g>`).join('') +
        chip(s, 150, 140, 112, '学校、医院都是机构', CL.v, 50);
    }},
    interact: {dur: 6, hl: [10, 20], end: 60, lit: '你来我往', mean: '互动；相互作用', draw: s => {
      return GND() + `<g ${s.a(move([[26, 0, 0], [34, 48, 0]]))}>${kid(80, 128, CL.t, {aR: [18, -58], ...walkLegs(s, 80, 128, 26, 34, 4)})}</g>` +
        `<g ${s.a(move([[26, 0, 0], [34, -48, 0]]))}>${kid(220, 128, CL.a, {aL: [-18, -58], ...walkLegs(s, 220, 128, 26, 34, 4)})}</g>` +
        `<g ${s.a(pop(10), ORG(70, 36))}>${bubble(70, 36)}<text x="70" y="40" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.t)}>你好！</text></g>` +
        `<g ${s.a(pop(18), ORG(230, 36))}>${bubble(230, 36)}<text x="230" y="40" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.a)}>嗨～</text></g>` +
        `<g ${s.a(showAt(34, 46))}>${burst(150, 70, 14).replace('<path ', `<path ${sk(CL.g, 2.5)} `)}</g>` +
        chip(s, 150, 140, 64, '击掌互动', CL.v, 46);
    }},
    // ---------- 第二十六批 ----------
    invest: {dur: 6, hl: [8, 14], end: 60, lit: '塞进背心里生钱', mean: '投资；投入', draw: s => {
      const coin = `<circle cx="0" cy="0" r="5.5" ${fs(CL.g, '#a8741a', 1)}/>`;
      const c1 = moveIn([[6, 86, 94], [10, 82, 86], [14, 74, 102]]); c1[15] = T(74, 102) + ';opacity:0'; c1[92] = c1[15];
      const c2 = moveIn([[22, 74, 102], [26, 140, 60], [30, 200, 112]]); c2[31] = T(200, 112) + ';opacity:0'; c2[92] = c2[31];
      return GND() + kid(70, 128, CL.t, {aR: [16, -32]}) + `<path d="M60 90q0-3 4-3h3l3 10 3-10h3q4 0 4 3v19q0 2-2 2h-16q-2 0-2-2z" fill="#556070"/><rect x="69" y="99" width="10" height="7" rx="1" ${sk('#8b96a8', 1.5)}/>` +
        `<rect x="56" y="84" width="28" height="30" rx="6" ${sk(CL.g, 2.5)} ${s.a(pop(14), ORG(70, 99))}/>` +
        `<g ${s.a(c1)}>${coin}</g><g ${s.a(c2)}>${coin}</g>` +
        `<g ${s.a(growY(30, 42), FOOT)}><path d="M200 114V76" ${sk(WOOD, 5)}/><circle cx="200" cy="64" r="22" fill="#3fbf6a"/><circle cx="186" cy="74" r="12" fill="#3f8f4f"/><circle cx="214" cy="72" r="12" fill="#3f8f4f"/></g>` +
        `<path d="M184 112h32l-4 16h-24z" fill="${WOOD}"/>` +
        [[188, 58, 44], [212, 56, 46], [200, 76, 48]].map(([x, y, p]) => `<g ${s.a(pop(p), ORG(x, y))}><circle cx="${x}" cy="${y}" r="5.5" ${fs(CL.g, '#a8741a', 1)}/></g>`).join('') +
        chip(s, 140, 22, 64, '钱生钱', CL.a, 50);
    }},
    particularly: {dur: 6, hl: [8, 14, 20, 46], end: 60, lit: '格外地', mean: '尤其；特别', draw: s => {
      const xs = [40, 95, 150, 205, 260];
      const art = [`<circle cx="40" cy="96" r="12" fill="#e2473a"/><path d="M40 84q2-5 7-5" ${sk('#3f8f4f', 2)}/>`, `<path d="M84 90q11 22 26 3q-9 8-20-6z" fill="#f2d03a"/>`,
        `<path d="M139 90q11-7 22 0q-2 17-11 22q-9-5-11-22z" fill="#e2473a"/><path d="M142 89l8-6 8 6" ${sk('#3f8f4f', 3)}/><circle cx="146" cy="97" r="1" fill="#fff"/><circle cx="154" cy="99" r="1" fill="#fff"/><circle cx="150" cy="105" r="1" fill="#fff"/>`,
        [[0, 0], [-5, -7], [5, -7], [-7, 2], [7, 2], [0, 9]].map(([dx, dy]) => `<circle cx="${205 + dx}" cy="${98 + dy}" r="4.5" fill="#8b4fb0"/>`).join(''), `<circle cx="260" cy="96" r="12" fill="#f29a2e"/>`];
      return GND() + `<path d="M150 0L120 118h60z" fill="#f6e7a8" opacity=".55" ${s.a(showAt(28))}/>` +
        xs.map((x, i) => `<ellipse cx="${x}" cy="114" rx="20" ry="4" ${fl(CL.m, .3)}/><g ${s.a(pop(8 + i * 2), ORG(x, 96))}>${art[i]}</g>` + (i === 2 ? '' : `<g ${s.a(pop(20 + i), ORG(x, 66))}>${heartAt(x, 64, .4, '#f2a3b3')}</g>`)).join('') +
        `<ellipse cx="150" cy="98" rx="22" ry="22" ${sk(CL.a, 2.5)} ${DASH} ${s.a(drawP(28, 36))}/>` +
        `<g ${s.a(pop(32), ORG(150, 56))}>${heartAt(150, 52, 1.1, '#e2473a')}</g>` + chip(s, 150, 22, 72, '尤其爱草莓', CL.a, 46);
    }},
    perhaps: {dur: 6, hl: [8, 16], end: 60, lit: '凭运气', mean: '也许；大概', draw: s => {
      const coin = `<ellipse cx="122" cy="86" rx="7" ry="7" ${fs(CL.g, '#a8741a', 1)}/><text x="122" y="89" font-size="8" font-weight="700" text-anchor="middle" fill="#a8741a">¥</text>`;
      const alt = (p, on) => ({0: 'opacity:' + (on ? 0 : 1), [p]: 'opacity:' + (on ? 0 : 1), [p + .5]: 'opacity:' + (on ? 1 : 0), 31: 'opacity:' + (on ? 1 : 0), 31.5: 'opacity:' + (on ? 0 : 1), 100: 'opacity:' + (on ? 0 : 1)});
      return GND() + kid(100, 128, CL.t, {aR: [16, -36]}) +
        `<g ${s.a({0: T(), 8: T(), 20: T(0, -62), 32: T(0, 0), 100: T()})}><g ${s.a(alt(8, false))}>${coin}</g><g ${s.a(alt(8, true))}><g ${s.a({0: 'transform:scaleX(1)', 50: 'transform:scaleX(.1)', 100: 'transform:scaleX(1)'}, ORG(122, 86), .35)}>${coin}</g></g></g>` +
        `<g ${s.a(pop(34), ORG(170, 46))}>${bubble(170, 46)}<text x="170" y="51" font-size="13" font-weight="700" text-anchor="middle" ${fl(CL.v)}>?</text></g>` +
        [['正面', 220, 36], ['反面', 262, 44]].map(([t, x, p]) => `<g ${s.a({0: 'opacity:0', [p]: 'opacity:0', [p + 2]: 'opacity:1', [p + 6]: 'opacity:.35', [p + 10]: 'opacity:1', 92: 'opacity:1', 100: 'opacity:0'})}><rect x="${x - 18}" y="66" width="36" height="18" rx="5" ${fs(CL.p, CL.v, 1.5)}/><text x="${x}" y="79" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.v)}>${t}</text></g>`).join('') +
        chip(s, 240, 112, 76, '也许是正面吧', CL.v, 50);
    }},
    weight: {dur: 6, hl: [10, 44], end: 60, lit: '称出来的量', mean: '重量；体重', draw: s => {
      return GND() + `<rect x="150" y="118" width="60" height="10" rx="3" fill="#e8e8e8" style="stroke:var(--ink3);stroke-width:1.5px" ${s.a({0: 'transform:scaleY(1)', 20: 'transform:scaleY(1)', 23: 'transform:scaleY(.7)', 26: 'transform:scaleY(1)', 100: 'transform:scaleY(1)'}, FOOT)}/>` +
        `<path d="M210 122q20 0 30-30t20-32" ${sk(CL.m, 1.5)}/><rect x="222" y="30" width="68" height="30" rx="4" fill="#26324a"/>` +
        ['0 kg', '25 kg', '50 kg'].map((t, i) => `<text x="256" y="51" font-size="13" font-weight="700" text-anchor="middle" fill="#7cf0b0" ${s.a(slot([0, 22, 30, 99], i))}>${t}</text>`).join('') +
        `<g ${s.a(move([[10, 0, 0], [20, 110, 0], [22, 120, -10]]))}>${kid(60, 128, CL.v, {...walkLegs(s, 60, 128, 10, 20, 4)})}</g>` +
        chip(s, 100, 30, 76, '称一称有多重', CL.v, 46);
    }},
    address: {dur: 6, hl: [8, 20], end: 60, lit: '朝着它写清楚', mean: '地址；处理', draw: s => {
      const cover = (x, y, w, p0, p1) => `<rect x="${x}" y="${y}" width="${w}" height="16" fill="#fff" ${s.a({0: 'transform:scaleX(1)', [p0]: 'transform:scaleX(1)', [p1]: 'transform:scaleX(0)', 92: 'transform:scaleX(0)', 100: 'transform:scaleX(1)'}, 'transform-origin:100% 50%;transform-box:fill-box')}/>`;
      return GND() + `<path d="M222 128V80h66v48" ${fl(CL.g, .35)}/><path d="M216 80l39-26 39 26z" fill="#d23c2f"/><rect x="246" y="100" width="18" height="28" fill="${WOOD}"/>` +
        `<g ${s.a(pop(46), ORG(255, 92))}><rect x="242" y="86" width="26" height="11" rx="2" fill="#2f5d8a"/><text x="255" y="94.5" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">88号</text></g>` +
        `<path d="M156 70Q190 50 214 76" ${sk(CL.t, 2)} stroke-dasharray="4 4" ${s.a(fadeP(8, 14))}/><path d="M206 74l9 3 0-9" ${sk(CL.t, 2)} ${s.a(fadeP(8, 14))}/>` +
        `<g ${s.a({0: 'opacity:0;' + T(0, 0, 'scale(1)'), 3: 'opacity:1;' + T(0, 0, 'scale(1)'), 40: 'opacity:1;' + T(0, 0, 'scale(1)'), 47: 'opacity:1;' + T(160, 22, 'scale(.3)'), 48: 'opacity:0;' + T(160, 22, 'scale(.3)'), 100: 'opacity:0;' + T(160, 22, 'scale(.3)')}, ORG(95, 80))}>` +
        `<rect x="30" y="46" width="124" height="72" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><rect x="132" y="52" width="16" height="18" fill="#d23c2f"/>` +
        `<text x="40" y="84" font-size="12" font-weight="700" ${fl(CL.k)}>幸福路 88 号</text>${cover(38, 72, 96, 20, 30)}<text x="40" y="106" font-size="10" ${fl(CL.m)}>小明 收</text>${cover(38, 94, 50, 30, 36)}</g>` +
        chip(s, 150, 24, 76, '地址对上了', CL.t, 50);
    }},
    assert: {dur: 6, hl: [8, 18], end: 60, lit: '把观点硬插进来', mean: '断言；坚称', draw: s => {
      const pound = {0: R(0), 28: R(0), 31: R(-60), 34: R(0), 37: R(-60), 40: R(0), 100: R(0)};
      return GND() + `<g ${s.a(moveIn([[8, 0, -90], [18, 0, 0]]))}><path d="M170 136V50" ${sk(INK, 3)}/><path d="M170 50h40v26h-40z" fill="#d23c2f"/><text x="190" y="68" font-size="16" font-weight="700" text-anchor="middle" fill="#fff">!</text></g>` +
        `<g ${s.a(showAt(18, 26))}><path d="M156 126l-10-6M184 126l10-6M150 128h-10M190 128h10" ${sk(CL.m, 2)}/></g>` +
        kid(100, 128, CL.a, {armR: s.a(pound, shoulder(100, 128, 1))}) +
        `<g ${s.a(pop(28), ORG(80, 36))}>${bubble(80, 36)}<text x="80" y="40" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.a)}>没错！</text></g>` +
        chip(s, 230, 112, 88, '坚持自己说的对', CL.a, 46);
    }},
    available: {dur: 6, hl: [8, 20, 34], end: 60, lit: '拿得到的', mean: '可获得的；有空的', draw: s => {
      const cols = [CL.t, CL.v, CL.g, CL.a, '#3fbf6a', CL.t, CL.v, CL.a, CL.g];
      const c1 = moveIn([[20, 110, 90], [23, 170, 60], [26, 222, 60]]); c1[27] = T(222, 60) + ';opacity:0'; c1[92] = c1[27];
      return GND() + `<rect x="150" y="20" width="90" height="108" rx="4" fill="#d23c2f"/><rect x="158" y="30" width="56" height="68" rx="2" fill="#dcefff"/><rect x="160" y="104" width="52" height="14" rx="2" fill="#3a2e28"/><rect x="220" y="54" width="12" height="14" rx="2" fill="#3a2e28"/><path d="M226 57v8" ${sk('#888', 1.5)}/>` +
        cols.map((c, i) => { const x = 164 + (i % 3) * 16, y = 36 + Math.floor(i / 3) * 20; return i === 4 ? '' : `<rect x="${x}" y="${y}" width="12" height="14" rx="2" ${fl(c)}/>`; }).join('') +
        `<g ${s.a({0: T(), 34: T(), 40: T(0, 54), 92: T(0, 54), 100: T()})}><rect x="180" y="56" width="12" height="14" rx="2" fill="#3fbf6a"/></g>` +
        `<g ${s.a(pop(8), ORG(186, 26))}><rect x="168" y="16" width="36" height="14" rx="4" fill="#3fbf6a"/><text x="186" y="26" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">有货</text></g>` +
        kid(90, 128, CL.t, {aR: [18, -36]}) + `<g ${s.a(c1)}><circle cx="0" cy="0" r="5" ${fs(CL.g, '#a8741a', 1)}/></g>` +
        chip(s, 80, 30, 76, '有货，买得到', CL.t, 46);
    }},
    candidate: {dur: 6, hl: [8, 30], end: 60, lit: '穿白袍的人', mean: '候选人；求职者', draw: s => {
      const xs = [50, 100, 150], cs = [CL.t, CL.v, CL.a];
      return GND() + `<rect x="24" y="122" width="152" height="6" fill="${WOOD}"/>` +
        xs.map((x, i) => kid(x, 122, cs[i]) + `<g ${s.a(showAt(8 + i * 2))}><path d="M${x - 12} 81h24l5 37h-34z" fill="#f7f4ea" style="stroke:#b8b2a2;stroke-width:1.5px"/><path d="M${x - 10} 82l20 30" ${sk(CL.g, 3)}/></g>` +
          `<g ${s.a(pop(30 + i * 3), ORG(x, 46))}><rect x="${x - 12}" y="38" width="24" height="15" rx="4" ${fl(CL.v)}/><text x="${x}" y="49" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">${i + 1}号</text></g>`).join('') +
        `<rect x="216" y="90" width="52" height="38" rx="2" ${fl(CL.m, .5)}/><path d="M230 92h24" ${sk(INK, 2.5)}/><text x="242" y="116" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>投票箱</text>` +
        [40, 44, 48].map((p, i) => { const f = moveIn([[p, 230 + i * 8, 10], [p + 5, 242, 88]]); f[p + 5.5] = T(242, 88) + ';opacity:0'; f[92] = f[p + 5.5]; return `<g ${s.a(f)}><rect x="-6" y="-8" width="12" height="16" rx="1" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/></g>`; }).join('') +
        chip(s, 236, 30, 92, '古罗马竞选穿白袍', CL.v, 50);
    }},
    central: {dur: 6, hl: [8, 40], end: 60, lit: '在正中心的', mean: '中心的；重要的', draw: s => {
      const dart = `<path d="M-26 0H-2" ${sk(INK, 2.5)}/><path d="M0 0l-7-3v6z" fill="${INK}"/><path d="M-26 0l-6-5M-26 0l-6 5" ${sk(CL.a, 2.5)}/>`;
      return GND() + `<circle cx="196" cy="70" r="46" ${fs('#fff', CL.m, 2)}/><circle cx="196" cy="70" r="34" fill="#e2473a"/><circle cx="196" cy="70" r="22" fill="#fff"/><circle cx="196" cy="70" r="11" fill="#e2473a"/>` +
        `<g ${s.a(pop(8), ORG(196, 70))}><circle cx="196" cy="70" r="5" fill="#f6d34a"/></g>` +
        `<circle cx="196" cy="70" r="10" ${sk(CL.g, 3)} ${s.a({0: 'opacity:0;transform:scale(.5)', 22: 'opacity:0;transform:scale(.5)', 23: 'opacity:1;transform:scale(1)', 32: 'opacity:0;transform:scale(4.5)', 100: 'opacity:0'}, ORG(196, 70))}/>` +
        kid(40, 128, CL.t, {aR: [18, -36]}) + `<g ${s.a(moveIn([[14, 62, 90], [22, 194, 70]]))}>${dart}</g>` +
        chip(s, 90, 30, 64, '正中靶心', CL.a, 40);
    }},
    communicate: {dur: 6, hl: [30, 14], end: 60, lit: '让大家共有', mean: '交流；传达', draw: s => {
      const bulb = (x, y) => `<path d="M${x - 7} ${y}a7 7 0 1 1 14 0c0 3.5-2.5 4.5-2.5 8h-9c0-3.5-2.5-4.5-2.5-8z" ${fl(CL.g)}/><path d="M${x - 3.5} ${y + 11}h7" ${sk(CL.k, 1.8)}/>`;
      const ls = [[160, CL.v], [210, CL.a], [260, CL.g]];
      return GND() + kid(60, 128, CL.t, {aR: [16, -40]}) + `<g ${s.a(pop(4), ORG(60, 40))}>${bulb(60, 38)}</g>` +
        `<g ${s.a(showAt(14, 48))}>${[0, 1, 2].map(i => `<path d="M${84 + i * 10} 66q6 10 0 20" ${sk(CL.t, 2.5)} ${s.a({0: 'opacity:.15', 30: 'opacity:1', 60: 'opacity:.15', 100: 'opacity:.15'}, `animation-delay:${i * .2}s`, 1)}/>`).join('')}</g>` +
        ls.map(([x, c], i) => kid(x, 128, c, {k: .85}) + `<g ${s.a(pop(30 + i * 4), ORG(x, 46))}>${bulb(x, 44)}</g>`).join('') +
        chip(s, 150, 140, 84, '想法大家共享', CL.t, 48);
    }},
    discover: {dur: 6, hl: [20, 8], end: 60, lit: '揭开盖子', mean: '发现；发觉', draw: s => {
      return GND() + `<rect x="160" y="104" width="50" height="24" ${fl(CL.m, .35)}/>` +
        `<g ${s.a(showAt(26))}><circle cx="185" cy="88" r="22" fill="#f6d34a" opacity=".35"/></g><rect x="167" y="84" width="36" height="20" rx="2" fill="${WOOD}"/><path d="M167 84q18-14 36 0" fill="#8b5a3a"/><circle cx="178" cy="82" r="4" fill="#f6d34a"/><circle cx="188" cy="80" r="4" fill="#f6d34a"/><circle cx="194" cy="84" r="3.5" fill="#f6d34a"/>` +
        `<g ${s.a({0: 'opacity:0;' + T(0, 0, 'rotate(0deg)'), 3: 'opacity:1;' + T(0, 0, 'rotate(0deg)'), 20: 'opacity:1;' + T(0, 0, 'rotate(0deg)'), 28: 'opacity:1;' + T(-56, -36, 'rotate(-24deg)'), 34: 'opacity:0;' + T(-64, -40, 'rotate(-28deg)'), 100: 'opacity:0;' + T(-64, -40, 'rotate(-28deg)')}, ORG(185, 80))}><path d="M154 106q-4-46 31-46t31 46q-8-6-15 0t-16 0-16 0-15 0z" fill="#8b5a9a"/><path d="M172 66q-6 18-4 38M198 66q6 18 4 38" ${sk('#6b3f7a', 1.5)}/></g>` +
        `<g ${s.a(pop(28), ORG(185, 60))}>${sparkle(166, 62, 6)}${sparkle(206, 58, 5)}${sparkle(186, 48, 4)}</g>` +
        kid(100, 128, CL.t, {aR: [18, -52]}) +
        `<g ${s.a(pop(30), ORG(76, 36))}>${bubble(76, 36)}<text x="76" y="40" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.a)}>哇！</text></g>` +
        chip(s, 236, 24, 76, '发现了宝藏', CL.a, 46);
    }},
    employer: {dur: 6, hl: [10, 44], end: 60, lit: '雇用别人的人', mean: '雇主', draw: s => {
      return GND() + `<g ${s.a(pop(4), ORG(70, 30))}><rect x="40" y="18" width="60" height="24" rx="3" fill="#fff" style="stroke:#d23c2f;stroke-width:2px"/><text x="70" y="35" font-size="11" font-weight="700" text-anchor="middle" fill="#d23c2f">招聘</text></g>` +
        kid(226, 128, '#3d4a5c', {k: 1.1, aL: [-20, -36]}) + `<path d="M226 82l-3 4 3 12 3-12z" fill="#c0392b"/>` +
        `<rect x="176" y="100" width="100" height="8" fill="${WOOD}"/><path d="M184 108v20M268 108v20" ${sk(WOOD, 3)}/><g><rect x="230" y="90" width="34" height="10" rx="1" fill="#2b2b2b"/><text x="247" y="98" font-size="7" font-weight="700" text-anchor="middle" fill="#f6d34a">老板</text></g>` +
        `<g ${s.a(move([[10, 0, 0], [22, 100, 0]]))}>${kid(40, 128, CL.t, {aR: [16, -34], ...walkLegs(s, 40, 128, 10, 22, 4)})}</g>` +
        `<g ${s.a({0: 'opacity:0;' + T(), 26: 'opacity:0;' + T(), 27: 'opacity:1;' + T(), 36: 'opacity:1;' + T(-50, 2), 92: 'opacity:1;' + T(-50, 2), 100: 'opacity:0;' + T(-50, 2)})}><rect x="198" y="82" width="14" height="18" rx="1" fill="#fff" style="stroke:var(--ink3);stroke-width:1.2px"/><path d="M201 88h8M201 92h8M201 96h5" ${sk(CL.m, 1)}/></g>` +
        `<path d="M226 38v14" ${sk(CL.a, 2.5)} ${s.a(showAt(44))}/><path d="M220 46l6 7 6-7" ${sk(CL.a, 2.5)} ${s.a(showAt(44))}/>` + chip(s, 226, 24, 52, '雇主', CL.a, 44);
    }},
    // ---------- 第二十七批 ----------
    exactly: {dur: 6, hl: [10, 46], end: 60, lit: '精确地', mean: '确切地；恰好', draw: s => {
      const piece = 'M0 0h30v10a5 5 0 0 1 0 10v10h-30z';
      return `<rect x="120" y="30" width="150" height="90" rx="3" fill="#9fd0ee"/><path d="M150 30v90M180 30v90M210 30v90M240 30v90M120 60h150M120 90h150" ${sk('#fff', 1.5, .8)}/>` +
        `<path d="${piece}" fill="#3a3a3a" transform="translate(180 60)"/>` +
        `<g ${s.a({0: 'opacity:0;' + T(40, 70, 'rotate(30deg)'), 3: 'opacity:1;' + T(40, 70, 'rotate(30deg)'), 10: 'opacity:1;' + T(40, 70, 'rotate(30deg)'), 22: 'opacity:1;' + T(174, 54, 'rotate(0deg)'), 26: 'opacity:1;' + T(180, 60, 'rotate(0deg)'), 92: 'opacity:1;' + T(180, 60, 'rotate(0deg)'), 100: 'opacity:0;' + T(180, 60, 'rotate(0deg)')})}><path d="${piece}" ${fs(CL.a, '#a83a2a', 1.5)}/></g>` +
        `<g ${s.a(showAt(26, 34))}><path d="M176 54l-6-6M218 54l6-6M176 96l-6 6M218 96l6 6" ${sk(CL.g, 2.5)}/></g>` +
        `<g ${s.a(pop(30), ORG(255, 20))}><circle cx="258" cy="18" r="8" fill="#3fbf6a"/><path d="M254 18l3 3 5-6" ${sk('#fff', 2)}/></g>` +
        chip(s, 66, 30, 64, '严丝合缝', CL.a, 40);
    }},
    observe: {dur: 6, hl: [8, 20], end: 60, lit: '在前面盯着看', mean: '观察；遵守', draw: s => {
      const bird = `<ellipse cx="0" cy="0" rx="8" ry="6" fill="#4a90d0"/><circle cx="6" cy="-5" r="4.5" fill="#4a90d0"/><path d="M10 -5l5 1-5 2z" fill="#f2b632"/><circle cx="7" cy="-6" r="1" fill="#fff"/><path d="M-8 0l-6-3v6z" fill="#2f5d8a"/>`;
      const hop = {0: T(204, 62), 20: T(204, 62), 24: T(214, 48), 28: T(224, 62), 32: T(214, 48), 36: T(204, 62), 40: T(214, 48), 44: T(224, 62), 100: T(204, 62)};
      return GND() + `<path d="M240 128V58" ${sk(WOOD, 8)}/><path d="M240 70H196" ${sk(WOOD, 4)}/><circle cx="252" cy="42" r="26" fill="#3f8f4f"/><circle cx="270" cy="62" r="16" fill="#4fa65c"/>` +
        `<g ${s.a(hop)}>${bird}</g>` +
        `<path d="M116 74L200 44v40z" fill="#f6d34a" opacity=".22" ${s.a(showAt(20))}/>` +
        `<g ${s.a(move([[4, -40, 0], [12, 0, 0]]))}>${kid(96, 128, CL.t, {aL: [8, -52], aR: [16, -52], ...walkLegs(s, 96, 128, 4, 12, 2)})}<rect x="100" y="69" width="9" height="10" rx="2" fill="${INK}"/><rect x="108" y="69" width="9" height="10" rx="2" fill="${INK}"/><circle cx="114" cy="74" r="2.5" fill="#9fd0ee"/></g>` +
        chip(s, 150, 22, 100, '盯着看：跳了 3 下', CL.t, 44);
    }},
    overall: {dur: 6, hl: [8, 40], end: 60, lit: '全部算在一起', mean: '总的；总体上', draw: s => {
      const rows = [['语文', '85'], ['数学', '92'], ['英语', '88'], ['体育', '95']];
      return `<rect x="70" y="10" width="160" height="128" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="150" y="27" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.k)}>成绩单</text>` +
        rows.map(([a, b], i) => `<g ${s.a(showAt(8 + i * 6))}><text x="86" y="${48 + i * 17}" font-size="10" ${fl(CL.k)}>${a}</text><text x="190" y="${48 + i * 17}" font-size="10" font-weight="700" text-anchor="end" ${fl(CL.v)}>${b}</text></g>`).join('') +
        `<path d="M200 36h8v70h-8" ${sk(CL.a, 2.5)} ${DASH} ${s.a(drawP(32, 38))}/><path d="M208 71h8" ${sk(CL.a, 2.5)} ${s.a(showAt(38))}/>` +
        `<g ${s.a(pop(40), ORG(150, 122))}><rect x="96" y="112" width="108" height="20" rx="4" fill="#d23c2f"/><text x="150" y="126" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">总评：优秀</text></g>` +
        chip(s, 262, 72, 52, '总的', CL.a, 44);
    }},
    property: {dur: 6, hl: [10, 44], end: 60, lit: '自己的东西', mean: '财产；性质', draw: s => {
      const posts = []; for (let x = 52; x <= 248; x += 14) posts.push(`M${x} 128v-18`);
      return GND() + `<rect x="110" y="70" width="80" height="58" ${fl(CL.g, .4)}/><path d="M102 70l48-34 48 34z" fill="#d23c2f"/><rect x="140" y="96" width="18" height="32" fill="${WOOD}"/><rect x="118" y="82" width="16" height="14" fill="#bfe1f2"/><rect x="166" y="82" width="16" height="14" fill="#bfe1f2"/>` +
        `<g ${s.a(growX(20, 30), 'transform-origin:0% 50%;transform-box:fill-box')}><path d="${posts.join('')}M48 114h204M48 122h204" ${sk('#fff', 3)}/><path d="${posts.join('')}M48 114h204M48 122h204" ${sk(WOOD, 1.5)}/></g>` +
        `<g ${s.a(pop(10), ORG(62, 86))}><path d="M62 108V92" ${sk(WOOD, 3)}/><rect x="36" y="76" width="52" height="18" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><text x="62" y="89" font-size="10" font-weight="700" text-anchor="middle" fill="#d23c2f">小明家</text></g>` +
        `<g ${s.a(pop(44), ORG(250, 44))}><rect x="226" y="24" width="48" height="40" rx="3" fill="#b8323a"/><text x="250" y="42" font-size="9" font-weight="700" text-anchor="middle" fill="#f6d34a">房产证</text><circle cx="250" cy="54" r="5" ${sk('#f6d34a', 1.5)}/></g>`;
    }},
    response: {dur: 6, hl: [20, 30], end: 60, lit: '回过来的应答', mean: '反应；回答', draw: s => {
      const wave = (d, c, p, dx) => `<path d="${d}" ${sk(c, 3)} ${s.a({0: 'opacity:0;' + T(), [p]: 'opacity:0;' + T(), [p + 1]: 'opacity:1;' + T(), [p + 10]: 'opacity:1;' + T(dx, 0), [p + 11]: 'opacity:0;' + T(dx, 0), 100: 'opacity:0;' + T(dx, 0)})}/>`;
      return GND() + `<path d="M190 128L240 40l26 30 34-38v96z" fill="#9a948c"/><path d="M240 40l-10 18 10-4 6 10" ${sk('#fff', 2, .6)}/>` +
        kid(60, 128, CL.t, {aL: [6, -46], aR: [14, -46]}) +
        `<g ${s.a(pop(6), ORG(66, 36))}>${bubble(66, 36)}<text x="66" y="40" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.t)}>喂——</text></g>` +
        wave('M90 66q8 10 0 20M98 62q12 14 0 28', CL.t, 8, 90) + wave('M196 66q-8 10 0 20M188 62q-12 14 0 28', CL.a, 20, -90) +
        `<g ${s.a(pop(30), ORG(200, 30))}><path d="M178 20h44a5 5 0 0 1 5 5v9a5 5 0 0 1-5 5h-22l-6 6v-6h-16a5 5 0 0 1-5-5v-9a5 5 0 0 1 5-5z" ${fs(CL.p, CL.a, 2)}/><text x="200" y="34" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.a)}>喂～～</text></g>` +
        chip(s, 140, 140, 76, '山谷回应你', CL.a, 44);
    }},
    tourism: {dur: 6, hl: [8, 40], end: 60, lit: '旅游这一行', mean: '旅游业；观光', draw: s => {
      return GND() + `<path d="M150 128l50-70 30 34 30-50 40 86z" fill="#9fc3a0"/><path d="M200 58l-8 12 8-3 6 8M260 42l-8 14 8-4 6 9" ${sk('#fff', 2, .7)}/>` +
        `<rect x="196" y="92" width="50" height="36" fill="#f4e6c8" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M192 92h58l-6-10h-46z" fill="#d23c2f"/><text x="221" y="114" font-size="8" font-weight="700" text-anchor="middle" ${fl(CL.k)}>纪念品</text>` +
        `<g ${s.a(move([[8, -110, 0], [20, 0, 0]]))}><rect x="20" y="96" width="92" height="26" rx="5" fill="#f2b632"/>${[30, 50, 70, 90].map(x => `<rect x="${x}" y="100" width="14" height="10" rx="1" fill="#bfe1f2"/>`).join('')}<circle cx="40" cy="124" r="5" fill="${INK}"/><circle cx="94" cy="124" r="5" fill="${INK}"/></g>` +
        [[0, CL.t], [1, CL.v], [2, CL.a]].map(([i, c]) => `<g ${s.a(moveIn([[22 + i * 3, 0, 0], [32 + i * 3, 20 + i * 6, 0]]))}>${kid(120 + i * 10, 128, c, {k: .5, ...walkLegs(s, 120 + i * 10, 128, 22 + i * 3, 32 + i * 3, 3, .5)})}</g>`).join('') +
        [0, 1, 2].map(i => `<g ${s.a(pop(34 + i * 2), ORG(206 + i * 14, 74))}><circle cx="${206 + i * 14}" cy="74" r="5" ${fs(CL.g, '#a8741a', 1)}/></g>`).join('') +
        `<path d="M16 14v46h80" ${sk(CL.m, 2)}/>` + [0, 1, 2].map(i => `<rect x="${26 + i * 22}" y="${40 - i * 10}" width="14" height="${20 + i * 10}" ${fl(CL.t)} ${s.a(growY(40 + i * 3, 46 + i * 3), FOOT)}/>`).join('') +
        `<text x="56" y="72" font-size="8" font-weight="700" text-anchor="middle" ${fl(CL.m)} ${s.a(showAt(40))}>旅游收入</text>`;
    }},
    unique: {dur: 6, hl: [30, 40], end: 60, lit: '只此一个的', mean: '独特的；唯一的', draw: s => {
      const xs = [40, 70, 100, 130, 160, 190, 220, 250];
      return `<path d="M190 0L162 110h56z" fill="#f6e7a8" opacity=".55" ${s.a(showAt(30))}/><rect x="22" y="104" width="256" height="20" rx="3" fill="#c9b28a"/>` +
        xs.map((x, i) => `<g ${s.a(pop(4 + i * 2), ORG(x, 94))}><ellipse cx="${x}" cy="94" rx="11" ry="14" fill="#fbf6ea" style="stroke:#d8ccb4;stroke-width:1.5px"/></g>`).join('') +
        `<g ${s.a(showAt(30))}><ellipse cx="190" cy="94" rx="11" ry="14" fill="#f6c932" style="stroke:#c9952a;stroke-width:1.5px"/><path d="M184 88q4-4 6 2" ${sk('#fff', 2, .8)}/></g>` +
        `<g ${s.a(pop(34), ORG(190, 70))}>${sparkle(172, 74, 5)}${sparkle(208, 70, 6)}${sparkle(190, 60, 4)}</g>` +
        chip(s, 90, 40, 92, '独一无二的金蛋', CL.a, 46);
    }},
    awareness: {dur: 6, hl: [8, 16, 46], end: 60, lit: '留心到了', mean: '意识；认识', draw: s => {
      const bottle = `<rect x="122" y="86" width="8" height="14" rx="2" fill="#6db7e8"/><rect x="124" y="83" width="4" height="4" fill="#2f5d8a"/>`;
      const b2 = moveIn([[32, 0, 0], [36, 30, -30], [40, 66, 10]]); b2[41] = T(66, 10) + ';opacity:0'; b2[92] = b2[41];
      return GND() + `<g ${s.a(pop(8), ORG(224, 48))}><rect x="186" y="16" width="76" height="64" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><path d="M224 28l12 20h-24z" ${sk('#3fbf6a', 3)}/><path d="M232 34l4-6M218 46h-8M234 48l4 4" ${sk('#3fbf6a', 2)}/><text x="224" y="72" font-size="10" font-weight="700" text-anchor="middle" fill="#3f8f4f">垃圾分类</text></g>` +
        `<rect x="182" y="104" width="26" height="24" rx="2" fill="#3fbf6a"/><rect x="180" y="100" width="30" height="5" rx="2" fill="#2f8f4f"/>` +
        `<g ${s.a(move([[4, -70, 0], [14, 0, 0]]))}>${kid(110, 128, CL.t, {aR: [16, -30], ...walkLegs(s, 110, 128, 4, 14, 3)})}<g ${s.a({0: 'opacity:1', 32: 'opacity:1', 32.5: 'opacity:0', 99: 'opacity:0', 100: 'opacity:1'})}>${bottle}</g></g>` +
        `<g ${s.a(b2)}>${bottle}</g>` +
        `<text x="110" y="56" font-size="18" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(showAt(16, 22))}>!</text>` +
        `<g ${s.a(pop(26), ORG(110, 46))}><path d="M102 46a8 8 0 1 1 16 0c0 4-3 5-3 9h-10c0-4-3-5-3-9z" ${fl(CL.g)}/><path d="M106 58h8" ${sk(CL.k, 2)}/></g>` +
        chip(s, 100, 22, 84, '提高环保意识', CL.t, 46);
    }},
    completely: {dur: 6, hl: [10, 46], end: 60, lit: '完完全全地', mean: '完全地；彻底地', draw: s => {
      const roll = {0: 'opacity:0;' + T(126, 24), 9: 'opacity:0;' + T(126, 24), 10: 'opacity:1;' + T(126, 24), 46: 'opacity:0;' + T(254, 118), 100: 'opacity:0;' + T(254, 118)};
      [0, 1, 2, 3, 4].forEach(i => { roll[10 + i * 7] = 'opacity:1;' + T(126 + i * 32, 24); roll[16 + i * 7] = 'opacity:1;' + T(126 + i * 32, 118); });
      roll[44] = 'opacity:1;' + T(254, 118);
      return GND() + `<rect x="110" y="20" width="160" height="108" fill="#bdb6a8"/><circle cx="140" cy="60" r="10" fill="#8f877a"/><circle cx="220" cy="96" r="14" fill="#8f877a"/><path d="M180 40l12 20-16 4z" fill="#8f877a"/>` +
        [0, 1, 2, 3, 4].map(i => `<rect x="${110 + i * 32}" y="20" width="32" height="108" fill="#6fc2b4" ${s.a(growY(10 + i * 7, 16 + i * 7), 'transform-origin:50% 0%;transform-box:fill-box')}/>`).join('') +
        `<g ${s.a(roll)}><path d="M0 4v30" ${sk(INK, 2.5)}/><rect x="-15" y="-5" width="30" height="10" rx="4" fill="#4fa89a" style="stroke:var(--ink);stroke-width:1.5px"/></g>` +
        `<g ${s.a(pop(46), ORG(190, 74))}>${sparkle(150, 50, 7, '#fff')}${sparkle(236, 80, 6, '#fff')}</g>` +
        kid(60, 128, CL.a, {aR: [16, -48]}) + chip(s, 60, 30, 84, '刷得一点不剩', CL.t, 46);
    }},
    essential: {dur: 6, hl: [8, 40], end: 60, lit: '少了不行的', mean: '必不可少的', draw: s => {
      return GND() + `<g ${s.a({0: R(32), 24: R(32), 34: R(0), 92: R(0), 100: R(32)}, ORG(150, 104))}><path d="M150 104V60" ${sk('#5a8f3a', 3)}/>` +
        `<path d="M150 80q-18-2-22-14q16-2 22 14zM150 70q18-2 22-14q-16-2-22 14zM150 60q-6-12 0-20q6 8 0 20z" fill="#b8a94a" ${s.a({0: 'fill:#b8a94a', 24: 'fill:#b8a94a', 34: 'fill:#3fbf6a', 92: 'fill:#3fbf6a', 100: 'fill:#b8a94a'})}/></g>` +
        `<path d="M132 104h36l-5 24h-26z" fill="${WOOD}"/>` +
        `<g ${s.a({0: R(0), 8: R(0), 12: R(-30), 24: R(-30), 28: R(0), 100: R(0)}, ORG(236, 56))}><path d="M222 46h28v22h-28z" fill="#4a90d0"/><path d="M222 50l-18-6 2 6 16 6" fill="#4a90d0"/><path d="M250 50q10 4 0 14" ${sk('#4a90d0', 3)}/></g>` +
        [0, 1, 2].map(i => `<path d="M0 -5q-4 6-4 8a4 4 0 0 0 8 0q0-2-4-8z" fill="#6db7e8" ${s.a({0: 'opacity:0;' + T(196, 54), [13 + i * 3]: 'opacity:0;' + T(196, 54), [14 + i * 3]: 'opacity:1;' + T(196, 54), [22 + i * 3]: 'opacity:1;' + T(160, 100), [23 + i * 3]: 'opacity:0;' + T(160, 100), 100: 'opacity:0;' + T(160, 100)})}/>`).join('') +
        chip(s, 150, 22, 72, '水必不可少', CL.t, 40);
    }},
    everything: {dur: 6, hl: [8, 40], end: 60, lit: '每一样东西', mean: '一切；每件事', draw: s => {
      const items = [[44, `<rect x="32" y="80" width="24" height="30" rx="2" ${fl(CL.v)}/><path d="M36 80v30" ${sk(CL.p, 1.5)}/>`], [96, `<circle cx="96" cy="96" r="14" fill="#f29a2e"/><path d="M82 96h28M96 82q-8 14 0 28" ${sk('#fff', 1.5)}/>`],
        [150, `<path d="M138 84h24l-3 26h-18z" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M162 90q8 0 6 8t-8 6" ${sk(CL.m, 2)}/>`], [204, `<circle cx="204" cy="96" r="14" fill="#fff" style="stroke:var(--ink);stroke-width:2px"/><path d="M204 96v-9M204 96l6 3" ${sk(INK, 2)}/>`],
        [256, `<path d="M246 110h20l-3-12h-14z" fill="${WOOD}"/><path d="M256 98q-12-8-8-20q8 6 8 20zM256 98q12-8 8-20q-8 6-8 20z" fill="#3fbf6a"/>`]];
      return GND() + `<rect x="20" y="110" width="260" height="5" rx="2" fill="${WOOD}"/>` +
        items.map(([x, art], i) => `<circle cx="${x}" cy="96" r="22" fill="#f6e7a8" opacity=".6" ${s.a(showAt(8 + i * 6))}/>${art}<g ${s.a(pop(10 + i * 6), ORG(x, 66))}><circle cx="${x}" cy="66" r="6" fill="#3fbf6a"/><path d="M${x - 3} 66l2 2 4-4" ${sk('#fff', 1.6)}/></g>`).join('') +
        `<rect x="16" y="54" width="268" height="66" rx="12" ${sk(CL.a, 3)} ${DASH} ${s.a(drawP(40, 48))}/>` + chip(s, 150, 30, 92, '一样不落：全部', CL.a, 44);
    }},
    farmer: {dur: 6, hl: [8, 40], end: 60, lit: '种地的人', mean: '农民；农场主', draw: s => {
      const hoe = {0: R(0), 14: R(0), 36: R(0), 100: R(0)}; for (let i = 1; i < 6; i++) hoe[f1(14 + i * 4)] = R(i % 2 ? -50 : 0);
      return GND() + `<circle cx="34" cy="28" r="12" ${fl(CL.g)}/>` +
        [0, 1, 2, 3].map(r => `<path d="M150 ${98 + r * 10}H290" ${sk('#8b5a3a', 4, .7)}/>` + [0, 1, 2, 3, 4, 5].map(c => { const x = 160 + c * 22 + (r % 2) * 10; return `<g ${s.a(growY(8 + r * 4, 20 + r * 4), FOOT)}><path d="M${x} ${96 + r * 10}v-10" ${sk('#3f8f4f', 2)}/><path d="M${x} ${90 + r * 10}q-6-2-7-7q6 0 7 7zM${x} ${88 + r * 10}q6-2 7-7q-6 0-7 7z" fill="#3fbf6a"/></g>`; }).join('')).join('') +
        kid(90, 128, '#5a7a9a', {aR: [18, -30], armR: s.a(hoe, shoulder(90, 128, 1)), holdR: `<path d="M108 98l14 26" ${sk(WOOD, 3)}/><path d="M118 124l10-2" ${sk('#888', 4)}/>`}) +
        `<ellipse cx="90" cy="66" rx="18" ry="4" fill="#e8c460"/><path d="M80 66q0-12 10-12t10 12z" fill="#e8c460"/><path d="M80 63h20" ${sk('#c9952a', 2)}/>` +
        chip(s, 90, 30, 64, '农民伯伯', CL.t, 40);
    }},
    // ---------- 第二十八批 ----------
    function: {dur: 6, hl: [10, 46], end: 60, lit: '能执行的作用', mean: '功能；运转', draw: s => {
      const tool = (d, ox, oy, from, to, p, lab, lx, ly) => `<g ${s.a({0: R(from), [p]: R(from), [p + 6]: R(to), 92: R(to), 100: R(from)}, ORG(ox, oy))}><path d="${d}" fill="#d8dde3" style="stroke:#8a96a3;stroke-width:1.5px"/></g><text x="${lx}" y="${ly}" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(showAt(p + 6))}>${lab}</text>`;
      return tool('M190 90h52l-12 8h-40z', 192, 94, 180, 0, 10, '小刀', 230, 116) +
        tool('M190 92h44v4h-44zM234 90h6v8h-6z', 192, 94, 180, -45, 18, '螺丝刀', 236, 46) +
        tool('M108 92h-40l8-6zM108 96h-40l8 6z', 108, 94, 180, 0, 26, '剪刀', 70, 116) +
        `<rect x="100" y="84" width="100" height="20" rx="10" fill="#d23c2f"/><path d="M150 88v12M144 94h12" ${sk('#fff', 3)}/><circle cx="108" cy="94" r="2.5" fill="#8a96a3"/><circle cx="192" cy="94" r="2.5" fill="#8a96a3"/>` +
        chip(s, 150, 24, 96, '一把刀，多种功能', CL.a, 46);
    }},
    ignore: {dur: 6, hl: [8, 20], end: 60, lit: '装作不知道', mean: '忽视；不理睬', draw: s => {
      const wave = {0: R(0), 8: R(0), 12: R(-30), 16: R(0), 20: R(-30), 24: R(0), 100: R(0)};
      return GND() + kid(70, 128, CL.t, {noFace: true, aR: [16, -56], armR: s.a(wave, shoulder(70, 128, 1))}) + `<g ${s.a(hideAt(34))}>${face(70, 128)}</g><g ${s.a(showAt(34))}>${face(70, 128, 1, 'sad')}</g>` +
        `<g ${s.a(pop(8), ORG(60, 36))}>${bubble(60, 36)}<text x="60" y="40" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.t)}>嗨！</text></g>` +
        [0, 1].map(i => `<path d="M100 ${70 + i * 8}q6 6 0 12" ${sk(CL.t, 2.5)} ${s.a({0: 'opacity:0;' + T(), [12 + i * 2]: 'opacity:0;' + T(), [13 + i * 2]: 'opacity:1;' + T(), [20 + i * 2]: 'opacity:1;' + T(70, 0), [21 + i * 2]: 'opacity:0;' + T(70, 0), 100: 'opacity:0;' + T(70, 0)})}/>`).join('') +
        `<path d="M168 66l12 12M180 66l-12 12" ${sk('#d23c2f', 3)} ${s.a(showAt(21, 30))}/>` +
        kid(210, 128, CL.v, {aL: [-8, -30], aR: [6, -30]}) + `<rect x="203" y="90" width="11" height="15" rx="2" fill="${INK}"/><path d="M199 70a11 11 0 0 1 22 0" ${sk(INK, 2.5)}/><rect x="196" y="68" width="5" height="9" rx="2" fill="${INK}"/><rect x="219" y="68" width="5" height="9" rx="2" fill="${INK}"/>` +
        chip(s, 214, 36, 64, '装没听见', CL.v, 24) + chip(s, 140, 140, 64, '不理睬', CL.a, 46);
    }},
    limited: {dur: 6, hl: [10, 40], end: 60, lit: '被限制住的', mean: '有限的', draw: s => {
      const cake = x => `<path d="M${x - 11} 96v-10h22v10z" fill="#f2c9a0"/><path d="M${x - 11} 86q11-8 22 0z" fill="#f2a3b3"/><circle cx="${x}" cy="80" r="3" fill="#e2473a"/>`;
      return GND() + `<rect x="150" y="96" width="132" height="6" rx="2" fill="${WOOD}"/><path d="M160 102v26M272 102v26" ${sk(WOOD, 3)}/>` +
        `<g ${s.a(pop(8), ORG(216, 40))}><rect x="180" y="28" width="72" height="24" rx="4" fill="#d23c2f"/><text x="216" y="44" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">限量 3 份</text></g>` +
        [[196, 14], [222, 22], [248, 30]].map(([x, p]) => `<g ${s.a({0: 'opacity:1;' + T(), [p]: 'opacity:1;' + T(), [p + 5]: 'opacity:0;' + T(-50, -6), 96: 'opacity:0;' + T(), 100: 'opacity:1;' + T()})}>${cake(x)}</g>`).join('') +
        ['剩 3', '剩 2', '剩 1', '剩 0'].map((t, i) => `<text x="216" y="70" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.k)} ${s.a(slot([0, 14, 22, 30, 99], i))}>${t}</text>`).join('') +
        `<g ${s.a(pop(36), ORG(222, 88))}><rect x="196" y="78" width="52" height="18" rx="3" fill="none" style="stroke:#d23c2f;stroke-width:2.5px"/><text x="222" y="91" font-size="10" font-weight="700" text-anchor="middle" fill="#d23c2f">售罄</text></g>` +
        [[130, CL.t], [102, CL.v], [74, CL.g]].map(([x, c]) => kid(x, 128, c, {k: .7})).join('') +
        kid(46, 128, CL.a, {k: .7, noFace: true}) + `<g ${s.a(hideAt(38))}>${face(46, 128, .7)}</g><g ${s.a(showAt(38))}>${face(46, 128, .7, 'sad')}</g>` +
        chip(s, 90, 30, 64, '数量有限', CL.a, 46);
    }},
    novel: {dur: 6, hl: [8, 40], end: 60, lit: '讲新鲜事的', mean: '小说；新颖的', draw: s => {
      const pics = [[90, 40, `<path d="M80 50v-14h4v4h4v-4h4v4h4v-4h4v14z" fill="#9a948c"/>`], [150, 30, `<path d="M150 18q8 8 6 22h-12q-2-14 6-22z" fill="#e2473a"/><path d="M146 40l-4 6h16l-4-6" fill="#f2b632"/>`], [210, 40, sparkle(210, 40, 10, CL.g)]];
      return GND() + `<g ${s.a(hideAt(20))}><rect x="120" y="70" width="60" height="48" rx="3" fill="#b8323a"/><path d="M126 70v48" ${sk('#8a2028', 2)}/><text x="152" y="98" font-size="10" font-weight="700" text-anchor="middle" fill="#f6d34a">故事</text></g>` +
        `<g ${s.a(showAt(20))}><path d="M150 80q-30-8-60 0v38q30-8 60 0q30-8 60 0V80q-30-8-60 0z" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><path d="M150 80v38" ${sk(CL.m, 1.5)}/><path d="M100 92q20-5 40 0M100 102q20-5 40 0M160 92q20-5 40 0M160 102q20-5 40 0" ${sk(CL.m, 1.2, .6)}/></g>` +
        pics.map(([x, y, art], i) => `<g ${s.a(moveIn([[26 + i * 4, 150 - x, 90 - y], [34 + i * 4, 0, 0]]))}>${art}</g>`).join('') +
        `<g ${s.a(pop(8), ORG(186, 66))}><path d="M186 52l4 8 9 1-6 6 2 9-9-4-9 4 2-9-6-6 9-1z" fill="#f6d34a"/><text x="186" y="70" font-size="6" font-weight="700" text-anchor="middle" fill="#d23c2f">NEW</text></g>` +
        chip(s, 150, 140, 92, '讲新鲜事的书', CL.v, 46);
    }},
    outside: {dur: 6, hl: [8, 30], end: 60, lit: '在外边', mean: '外面；在…外', draw: s => {
      return `<rect x="150" y="0" width="150" height="128" fill="#dff2e0"/><circle cx="262" cy="30" r="12" ${fl(CL.g)}/>` + GND() +
        `<rect x="18" y="30" width="132" height="98" fill="#efe4d2"/><path d="M18 30h132v50M150 128v-2M18 30v98" ${sk(CL.m, 3)}/><rect x="40" y="50" width="30" height="24" fill="#bfe1f2" style="stroke:var(--ink3);stroke-width:2px"/>` +
        `<rect x="132" y="80" width="18" height="48" fill="${WOOD}" ${s.a({0: 'transform:scaleX(1)', 8: 'transform:scaleX(1)', 12: 'transform:scaleX(.15)', 92: 'transform:scaleX(.15)', 100: 'transform:scaleX(1)'}, 'transform-origin:0% 50%;transform-box:fill-box')}/>` +
        `<g ${s.a(move([[10, 0, 0], [34, 150, 0]]))}>${kid(80, 128, CL.t, {k: .8, aR: [14, -40], ...walkLegs(s, 80, 128, 10, 34, 8, .8)})}</g>` +
        `<g ${s.a({0: T(250, 80), 30: T(250, 80), 40: T(230, 62), 50: T(256, 70), 60: T(240, 58), 100: T(250, 80)})}><path d="M0 0q-8-8-10 0q2 6 10 0q8-8 10 0q-2 6-10 0z" fill="#f2a3b3"/></g>` +
        chip(s, 200, 22, 64, '到外面玩', CL.t, 40);
    }},
    particular: {dur: 6, hl: [10, 18, 26], end: 60, lit: '细到挑剔的', mean: '特别的；挑剔的', draw: s => {
      const shirt = (x, c) => `<path d="M${x - 14} 62l8-6h12l8 6 6 10-8 4v24h-24v-24l-8-4z" fill="${c}"/>`;
      const shake = {0: R(0), 10: R(0), 12: R(-6), 14: R(6), 16: R(0), 18: R(0), 20: R(-6), 22: R(6), 24: R(0), 100: R(0)};
      return GND() + `<path d="M126 52H280" ${sk(CL.m, 2.5)}/>` + shirt(150, '#b8b8b8') + shirt(200, '#6db7e8') + shirt(250, '#e2473a') + star5(250, 76, 6, 2.6, '#f6d34a') +
        `<path d="M142 104l16 12M158 104l-16 12" ${sk('#d23c2f', 3)} ${s.a(showAt(10))}/><path d="M192 104l16 12M208 104l-16 12" ${sk('#d23c2f', 3)} ${s.a(showAt(18))}/>` +
        `<g ${s.a(pop(26), ORG(250, 110))}><circle cx="250" cy="110" r="8" fill="#3fbf6a"/><path d="M246 110l3 3 5-6" ${sk('#fff', 2)}/></g><g ${s.a(pop(28), ORG(250, 50))}>${sparkle(232, 52, 5)}${sparkle(270, 48, 4)}</g>` +
        `<g ${s.a(shake, FOOT)}>${kid(70, 128, CL.v, {aR: [18, -36]})}</g>` + chip(s, 90, 30, 92, '就要这件（挑剔）', CL.v, 40);
    }},
    production: {dur: 6, hl: [8, 40], end: 60, lit: '生产出来的量', mean: '生产；产量', draw: s => {
      const can = x => `<rect x="${x - 6}" y="-16" width="12" height="16" rx="2" fill="#e2473a"/><path d="M${x - 6} -9h12" ${sk('#fff', 2)}/>`;
      return [60, 90, 120].map(y => `<path d="M14 ${y + 2}H200" ${sk(CL.m, 3)}/>`).join('') +
        `<g ${s.a(showAt(8))}>${[60, 90, 120].map((y, r) => `<g transform="translate(0 ${y})"><g ${s.a({0: T(0, 0), 100: T(60, 0)}, 'animation-timing-function:linear', 1 + r * .2)}>${[20, 80, 140].map(can).join('')}</g></g>`).join('')}</g>` +
        [0, 1, 2, 3].map(r => `<g ${s.a(pop(16 + r * 6), ORG(250, 124 - r * 16))}>${[...Array(4 - r)].map((_, c) => `<g transform="translate(0 ${128 - r * 16})">${can(226 + c * 16 + r * 8)}</g>`).join('')}</g>`).join('') +
        `<rect x="214" y="12" width="76" height="26" rx="4" fill="#26324a"/>` + ['0', '500', '1000', '5000'].map((t, i) => `<text x="252" y="30" font-size="12" font-weight="700" text-anchor="middle" fill="#7cf0b0" ${s.a(slot([0, 14, 24, 34, 99], i))}>${t}</text>`).join('') +
        GND() + chip(s, 100, 22, 76, '大批量生产', CL.a, 44);
    }},
    psychology: {dur: 6, hl: [8, 30], end: 60, lit: '研究心理的学问', mean: '心理学；心理', draw: s => {
      return GND() + `<path d="M64 128v-20q-24-10-24-40q0-46 48-48q46 0 52 42l8 18-8 4v12q0 10-14 10h-12v22z" fill="#e8dcc8" style="stroke:var(--ink3);stroke-width:2px"/>` +
        `<g ${s.a(pop(8), ORG(74, 62))}>${heartAt(74, 58, .7, '#e2473a')}</g>` +
        `<g ${s.a(pop(12), ORG(104, 44))}><path d="M94 48a6 6 0 0 1 8-6 7 7 0 0 1 13 3 5 5 0 0 1-1 9h-18a4 4 0 0 1-2-6z" fill="#9fd0ee"/></g>` +
        `<g ${s.a(pop(16), ORG(100, 80))}><g ${s.a({0: R(0), 100: R(360)}, ORG(100, 80) + ';animation-timing-function:linear', 2)}><circle cx="100" cy="80" r="9" ${sk(CL.g, 6)} stroke-dasharray="4 3"/></g><circle cx="100" cy="80" r="3.5" ${fl(CL.g)}/></g>` +
        `<g ${s.a(pop(30), ORG(220, 86))}><rect x="192" y="62" width="56" height="48" rx="3" fill="#7a5ab0"/><path d="M198 62v48" ${sk('#5a3a90', 2)}/><text x="222" y="91" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">心理学</text></g>` +
        `<g ${s.a(moveIn([[34, 0, 0], [44, -110, -20]]))}><circle cx="206" cy="80" r="12" ${fs('#bfe1f2', INK, 3, .4)}/><path d="M215 89l10 10" ${sk(INK, 4.5)}/></g>` +
        chip(s, 220, 30, 92, '研究心里在想啥', CL.v, 46);
    }},
    special: {dur: 6, hl: [8, 40], end: 60, lit: '多看一眼的', mean: '特别的；专门的', draw: s => {
      const fan = [-75, -50, -25, 0, 25, 50, 75].map(a => { const r = a * Math.PI / 180, cx = f1(212 + 34 * Math.sin(r)), cy = f1(96 - 34 * Math.cos(r));
        return `<ellipse cx="${cx}" cy="${cy}" rx="8" ry="18" fill="#3f8f4f" transform="rotate(${a} ${cx} ${cy})"/><circle cx="${f1(212 + 44 * Math.sin(r))}" cy="${f1(96 - 44 * Math.cos(r))}" r="4" fill="#2f5d8a"/><circle cx="${f1(212 + 44 * Math.sin(r))}" cy="${f1(96 - 44 * Math.cos(r))}" r="2" fill="#f6d34a"/>`; }).join('');
      return GND() + `<g ${s.a(pop(20), ORG(212, 104))}>${fan}</g>` +
        `<path d="M206 128v-12M218 128v-12" ${sk('#8a6a3a', 2)}/><ellipse cx="212" cy="106" rx="12" ry="14" fill="#2f6db0"/><path d="M216 94q2-16 6-20" ${sk('#2f6db0', 5)}/><circle cx="223" cy="72" r="5" fill="#2f6db0"/><path d="M227 72l5 1-5 2z" fill="#f2b632"/><path d="M222 66l2-6M224 66l4-5" ${sk('#2f6db0', 1.5)}/>` +
        [[60, CL.t, 24], [104, CL.a, 27]].map(([x, c, p]) => `<g ${s.a(move([[4, -70, 0], [14, 0, 0]]))}>${kid(x, 128, c, {k: .85, ...walkLegs(s, x, 128, 4, 14, 3, .85)})}</g><text x="${x}" y="58" font-size="16" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(pop(p), ORG(x, 52))}>!</text>`).join('') +
        chip(s, 90, 26, 96, '忍不住多看一眼', CL.v, 40);
    }},
    standard: {dur: 6, hl: [8, 18], end: 60, lit: '立着供对照的', mean: '标准；水平', draw: s => {
      return GND() + `<g ${s.a(growY(8, 16), FOOT)}><rect x="146" y="40" width="8" height="88" fill="#f2b632"/>${[50, 70, 90, 110].map(y => `<path d="M146 ${y}h4" ${sk(INK, 1.5)}/>`).join('')}</g>` +
        `<path d="M154 66h40" ${sk('#d23c2f', 3)} ${DASH} ${s.a(drawP(18, 22))}/><text x="196" y="62" font-size="9" font-weight="700" ${fl(CL.a)} ${s.a(showAt(20))}>1.2 m</text>` +
        `<g ${s.a(move([[20, 0, 0], [28, 104, 0], [30, 104, 0], [38, 200, 0]]))}>${kid(66, 128, CL.t, {...walkLegs(s, 66, 128, 20, 38, 6)})}</g>` +
        `<g ${s.a(pop(28), ORG(186, 40))}><circle cx="186" cy="40" r="8" fill="#3fbf6a"/><path d="M182 40l3 3 5-6" ${sk('#fff', 2)}/></g>` +
        `<g ${s.a(move([[36, 0, 0], [44, 120, 0]]))}>${kid(20, 128, CL.v, {k: .7, ...walkLegs(s, 20, 128, 36, 44, 3, .7)})}</g>` +
        `<path d="M120 70l12 12M132 70l-12 12" ${sk('#d23c2f', 3)} ${s.a(showAt(44))}/>` + chip(s, 70, 30, 76, '够到标准线', CL.a, 48);
    }},
    advantage: {dur: 6, hl: [8, 40], end: 60, lit: '站在前面的位置', mean: '优势；好处', draw: s => {
      return `<path d="M0 104H300M0 128H300" ${sk(CL.m, 2, .6)}/><path d="M36 92v40" ${sk('#fff', 3)}/><path d="M36 92v40" ${sk(CL.m, 1.5)} stroke-dasharray="3 3"/>` +
        `<path d="M262 128V70" ${sk(INK, 2)}/><path d="M262 70h22v14h-22z" fill="#2b2b2b"/><path d="M262 70h7v7h-7zM276 70h7v7h-7zM269 77h7v7h-7z" fill="#fff"/>` +
        `<g ${s.a(showAt(8, 14))}><path d="M50 74H84" ${sk(CL.a, 2.5)}/><path d="M78 69l7 5-7 5" ${sk(CL.a, 2.5)}/><text x="66" y="66" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.a)}>领先一步</text></g>` +
        `<g ${s.a(move([[14, 0, 0], [40, 150, 0]]))}>${kid(40, 128, CL.t, {k: .75, ...walkLegs(s, 40, 128, 14, 40, 10, .75)})}</g>` +
        `<g ${s.a(move([[14, 0, 0], [40, 150, 0]]))}>${kid(96, 104, CL.a, {k: .75, ...walkLegs(s, 96, 104, 14, 40, 10, .75)})}</g>` +
        `<g ${s.a(pop(42), ORG(246, 40))}><path d="M236 30h20v8a10 10 0 0 1-20 0z" fill="#f6d34a"/><path d="M243 48h6v6h-6zM238 54h16v4h-16z" fill="#c9952a"/></g>` +
        chip(s, 130, 22, 96, '站在前面 = 优势', CL.a, 46);
    }},
    aspect: {dur: 6, hl: [8, 20], end: 60, lit: '朝某一面看', mean: '方面；外观', draw: s => {
      const eye = (x, y) => `<path d="M${x - 10} ${y}q10-9 20 0q-10 9-20 0z" ${fs(CL.p, CL.k, 1.5)}/><circle cx="${x}" cy="${y}" r="3" ${fl(CL.k)}/>`;
      return GND() + `<rect x="128" y="70" width="44" height="44" fill="#9b7fd0"/><ellipse cx="150" cy="114" rx="22" ry="7" fill="#9b7fd0"/><ellipse cx="150" cy="70" rx="22" ry="7" fill="#c9b6ee"/>` +
        `<g ${s.a(pop(6), ORG(86, 92))}>${eye(86, 92)}</g><g ${s.a(pop(8), ORG(150, 24))}>${eye(150, 24)}</g>` +
        `<path d="M98 92H124" ${sk(CL.t, 2)} stroke-dasharray="3 4" ${s.a(fadeP(8, 14))}/><path d="M150 34V58" ${sk(CL.a, 2)} stroke-dasharray="3 4" ${s.a(fadeP(10, 16))}/>` +
        `<g ${s.a(pop(20), ORG(56, 50))}>${bubble(56, 50)}<rect x="50" y="42" width="12" height="13" ${fl(CL.v)}/></g>` +
        `<g ${s.a(pop(24), ORG(226, 30))}>${bubble(226, 30)}<circle cx="226" cy="28" r="6.5" ${fl(CL.v)}/></g>` +
        `<text x="56" y="76" font-size="8" font-weight="700" text-anchor="middle" ${fl(CL.t)} ${s.a(showAt(22))}>侧面：方的</text><text x="226" y="56" font-size="8" font-weight="700" text-anchor="middle" ${fl(CL.a)} ${s.a(showAt(26))}>顶上：圆的</text>` +
        chip(s, 150, 140, 104, '不同方面看不一样', CL.v, 40);
    }},
    // ---------- 第二十九批 ----------
    anything: {dur: 6, hl: [8, 20], end: 60, lit: '任何东西', mean: '任何事；任何东西', draw: s => {
      const icons = [`<path d="M190 54v-10h20v10z" fill="#f2c9a0"/><path d="M190 44q10-8 20 0z" fill="#f2a3b3"/>`, `<circle cx="200" cy="46" r="10" fill="#f29a2e"/><path d="M190 46h20M200 36q-6 10 0 20" ${sk('#fff', 1.5)}/>`, star5(200, 46, 11, 4.6, CL.g), `<rect x="190" y="36" width="20" height="22" rx="2" ${fl(CL.v)}/><path d="M194 36v22" ${sk(CL.p, 1.5)}/>`];
      const cyc = i => ({0: 'opacity:0', [i * 25 + .1]: 'opacity:0', [i * 25 + 1]: 'opacity:1', [i * 25 + 24]: 'opacity:1', [i * 25 + 25]: 'opacity:0', 100: 'opacity:0'});
      return GND() + `<rect x="170" y="72" width="60" height="56" rx="3" fill="#7a5ab0"/><rect x="166" y="66" width="68" height="10" rx="3" fill="#5a3a90"/><text x="200" y="110" font-size="22" font-weight="700" text-anchor="middle" fill="#f6d34a">?</text>` +
        `<g ${s.a(showAt(20, 44))}>${icons.map((ic, i) => `<g ${s.a(cyc(i), '', .8)}>${ic}</g>`).join('')}</g>` +
        `<g ${s.a(showAt(48))}>${icons[2]}</g>` +
        kid(80, 128, CL.t, {aR: [16, -44]}) + chip(s, 80, 36, 76, '什么都行！', CL.t, 8) + chip(s, 200, 18, 64, '任何东西', CL.v, 50);
    }},
    aware: {dur: 6, hl: [8, 18], end: 60, lit: '留心到了的', mean: '意识到的；知道的', draw: s => {
      return GND() + `<path d="M172 126q-10-2-12-8q8 2 12 4q2-8 8-10q0 8-2 12q8-2 12 2q-8 2-18 0z" fill="#f2d03a"/>` +
        `<path d="M118 70L172 120" ${sk(CL.a, 2)} stroke-dasharray="3 4" ${s.a(showAt(20, 30))}/>` +
        `<g ${s.a(move([[4, 0, 0], [18, 70, 0], [28, 70, 0], [34, 120, -30], [40, 180, 0]]))}>${kid(40, 128, CL.t, {...walkLegs(s, 40, 128, 4, 40, 12)})}</g>` +
        `<text x="110" y="56" font-size="18" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(showAt(18, 30))}>!</text>` +
        chip(s, 90, 26, 84, '意识到有危险', CL.a, 44);
    }},
    competition: {dur: 6, hl: [10, 44], end: 60, lit: '竞争的事', mean: '竞争；比赛', draw: s => {
      const tug = {0: T(), 10: T(), 16: T(-12), 22: T(10), 28: T(-14), 34: T(8), 40: T(-22), 92: T(-22), 100: T()};
      return GND() + `<path d="M150 104V128" ${sk(CL.m, 2)} stroke-dasharray="3 3"/>` +
        `<g ${s.a(pop(8), ORG(150, 28))}><rect x="100" y="16" width="100" height="24" rx="5" fill="#26324a"/><text x="150" y="32" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">绿队 VS 红队</text></g>` +
        `<g ${s.a(tug)}><path d="M30 92H270" ${sk('#c9a26a', 3.5)}/><path d="M150 92v16l-6-4" ${sk('#d23c2f', 3)}/>` +
        [60, 92].map(x => `<g ${s.a({0: R(0), 10: R(0), 14: R(-12), 92: R(-12), 100: R(0)}, FOOT)}>${kid(x, 128, CL.t, {k: .9, aR: [18, -34], aL: [10, -34]})}</g>`).join('') +
        [208, 240].map(x => `<g ${s.a({0: R(0), 10: R(0), 14: R(12), 92: R(12), 100: R(0)}, FOOT)}>${kid(x, 128, CL.a, {k: .9, aL: [-18, -34], aR: [-10, -34]})}</g>`).join('') + `</g>` +
        chip(s, 150, 140, 76, '激烈的比赛', CL.a, 44);
    }},
    customer: {dur: 6, hl: [8, 44], end: 60, lit: '常来光顾的人', mean: '顾客', draw: s => {
      return GND() + `<path d="M188 58h104l-8-14h-88z" fill="#d23c2f"/><path d="M196 58v6M212 58v6M228 58v6M244 58v6M260 58v6M276 58v6" ${sk('#fff', 3)}/>` +
        kid(250, 128, '#8b5a3a', {aL: [-14, -32]}) + `<rect x="190" y="96" width="100" height="32" fill="${WOOD}"/>` +
        `<rect x="20" y="16" width="112" height="54" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="76" y="30" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>集点卡</text>` +
        ['一', '二', '三', '四', '五'].map((d, i) => `<circle cx="${36 + i * 20}" cy="46" r="7" ${sk(CL.m, 1.5)}/><g ${s.a(pop(8 + i * 6), ORG(36 + i * 20, 46))}><circle cx="${36 + i * 20}" cy="46" r="7" fill="#d23c2f"/>${star5(36 + i * 20, 46, 4, 1.7, '#fff')}</g><text x="${36 + i * 20}" y="64" font-size="7" text-anchor="middle" ${fl(CL.m)}>周${d}</text>`).join('') +
        kid(150, 128, CL.t, {aR: [16, -34]}) + chip(s, 250, 36, 64, '老样子？', '#8b5a3a', 36) +
        `<g ${s.a(moveIn([[40, 0, 0], [46, -42, 6]]))}><path d="M206 84h14l-2 12h-10z" fill="#fff" style="stroke:var(--ink3);stroke-width:1.2px"/><path d="M206 86h14" ${sk('#8b5a3a', 3)}/></g>` +
        chip(s, 76, 96, 76, '常来的顾客', CL.t, 48);
    }},
    destination: {dur: 6, hl: [8, 20, 46], end: 60, lit: '注定要去的地方', mean: '目的地；终点', draw: s => {
      const car = `<rect x="-11" y="-7" width="22" height="10" rx="3" fill="#2f5d8a"/><rect x="-6" y="-11" width="12" height="5" rx="2" fill="#2f5d8a"/><circle cx="-6" cy="4" r="2.5" fill="${INK}"/><circle cx="6" cy="4" r="2.5" fill="${INK}"/>`;
      return `<rect x="0" y="0" width="300" height="150" fill="#dff2e0"/><path d="M0 100L300 30M60 0L120 150" ${sk('#fff', 8, .8)}/>` +
        `<path d="M30 120C80 120 70 70 130 76S200 40 250 52" ${sk(CL.v, 3)} stroke-dasharray="6 6" ${s.a(fadeP(8, 14))}/>` +
        `<circle cx="30" cy="120" r="6" ${fl(CL.t)}/><text x="30" y="140" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.t)}>起点</text>` +
        `<g ${s.a(moveIn([[6, 0, -60], [12, 0, 0], [14, 0, -6], [16, 0, 0]]))}><path d="M250 52q-12-14-12-22a12 12 0 0 1 24 0q0 8-12 22z" fill="#d23c2f"/><circle cx="250" cy="30" r="5" fill="#fff"/></g>` +
        `<g ${s.a(moveIn([[20, 30, 116], [24, 70, 106], [28, 100, 84], [32, 130, 74], [36, 170, 62], [40, 210, 50], [44, 246, 50]]))}>${car}</g>` +
        chip(s, 200, 110, 84, '到达目的地', CL.a, 46);
    }},
    investment: {dur: 6, hl: [10, 44], end: 60, lit: '投进去的钱', mean: '投资', draw: s => {
      return GND() + `<rect x="186" y="60" width="94" height="68" ${fl(CL.g, .4)}/><path d="M180 60l53-26 53 26z" fill="#2f5d8a"/><path d="M233 34V14" ${sk(INK, 1.5)}/><path d="M233 14h14v9h-14z" fill="#d23c2f"/><rect x="222" y="96" width="22" height="32" fill="${WOOD}"/><text x="233" y="82" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>学校</text>` +
        `<ellipse cx="60" cy="104" rx="26" ry="18" fill="#f2a3b3"/><circle cx="84" cy="100" r="7" fill="#f2a3b3"/><circle cx="86" cy="100" r="1.5" fill="${INK}"/><path d="M44 118v10M74 118v10" ${sk('#f2a3b3', 5)}/><path d="M54 88h12" ${sk(INK, 2.5)}/>` +
        [0, 1, 2, 3, 4].map(i => { const p = 10 + i * 4, f = moveIn([[p, 60, 86], [p + 4, 150, 36], [p + 8, 233, 100]]); f[p + 8.5] = T(233, 100) + ';opacity:0'; f[92] = f[p + 8.5]; return `<g ${s.a(f)}><circle cx="0" cy="0" r="5.5" ${fs(CL.g, '#a8741a', 1)}/></g>`; }).join('') +
        [0, 1, 2].map(i => `<g ${s.a(moveIn([[40 + i * 3, 0, 0], [50 + i * 3, -60 - i * 24, 0]]))}>${kid(233, 128, [CL.t, CL.v, CL.a][i], {k: .5, ...walkLegs(s, 233, 128, 40 + i * 3, 50 + i * 3, 3, .5)})}<path d="M225 98l8-3 8 3-8 3z" fill="${INK}"/></g>`).join('') +
        chip(s, 100, 30, 108, '投资教育，培养人才', CL.t, 46);
    }},
    lower: {dur: 6, hl: [10, 28], end: 60, lit: '往低处放', mean: '降低；较低的', draw: s => {
      return `<g ${s.a({0: T(), 10: T(), 28: T(0, 20), 92: T(0, 20), 100: T()})}><path d="M150 0V40" ${sk(CL.m, 1.5)}/><path d="M112 50l38-12 38 12v40h-76z" fill="#f6d34a" style="stroke:#c9952a;stroke-width:2px"/><circle cx="150" cy="48" r="3" fill="#fff"/>` +
        ['¥100', '¥80', '¥60'].map((t, i) => `<text x="150" y="78" font-size="18" font-weight="700" text-anchor="middle" fill="${i === 2 ? '#d23c2f' : INK}" ${s.a(slot([0, 16, 28, 99], i))}>${t}</text>`).join('') + `</g>` +
        `<g ${s.a(showAt(10))}><g ${s.a({0: T(), 50: T(0, 10), 100: T()}, '', .8)}><path d="M226 46v40" ${sk('#d23c2f', 4)}/><path d="M214 76l12 14 12-14" ${sk('#d23c2f', 4)}/></g></g>` +
        chip(s, 150, 136, 64, '价格降低', CL.a, 40);
    }},
    occur: {dur: 6, hl: [8, 14], end: 60, lit: '跑到眼前来', mean: '发生；想到', draw: s => {
      const bulb = `<path d="M-8 -14a8 8 0 1 1 16 0c0 4-3 5-3 9h-10c0-4-3-5-3-9z" ${fl(CL.g)}/><path d="M-4 -2h8" ${sk(CL.k, 2)}/><g ${s.a({0: R(-25), 50: R(25), 100: R(-25)}, ORG(0, 0), .35)}><path d="M-3 0l-3 9M3 0l3 9" ${sk(INK, 2)}/></g>`;
      return GND() + kid(70, 128, CL.t, {aR: [10, -46]}) +
        `<path d="M110 112H250" ${sk(CL.a, 2)} stroke-dasharray="4 4" ${s.a(fadeP(8, 12))}/><path d="M116 106l-7 6 7 6" ${sk(CL.a, 2)} ${s.a(fadeP(8, 12))}/>` +
        `<g ${s.a(moveIn([[8, 280, 118], [26, 96, 118], [30, 70, 58]]))}>${bulb}</g>` +
        `<g ${s.a(showAt(30))}><path d="M70 32v-6M54 38l-4-3M86 38l4-3" ${sk(CL.g, 2.5)}/></g>` +
        chip(s, 196, 34, 72, '突然想到了', CL.v, 40);
    }},
    option: {dur: 6, hl: [20, 40], end: 60, lit: '可选的东西', mean: '选择；选项', draw: s => {
      const opts = [['A 苹果', 40, 54], ['B 汽车', 160, 54], ['C 鞋子', 40, 92], ['D 书本', 160, 92]];
      const cur = moveIn([[6, 120, 140], [14, 210, 70], [18, 210, 70], [24, 92, 70], [26, 92, 72], [28, 92, 70]]);
      return `<text x="150" y="32" font-size="12" font-weight="700" text-anchor="middle" ${fl(CL.k)}>哪个是水果？</text>` +
        opts.map(([t, x, y]) => `<rect x="${x}" y="${y}" width="100" height="28" rx="6" ${fs(CL.p, CL.m, 2)}/><text x="${x + 50}" y="${y + 18}" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.k)}>${t}</text>`).join('') +
        `<g ${s.a(showAt(26))}><rect x="40" y="54" width="100" height="28" rx="6" fill="#3fbf6a"/><text x="90" y="72" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">A 苹果</text><circle cx="128" cy="68" r="7" fill="#fff"/><path d="M124.5 68l2.5 2.5 4.5-5" ${sk("#3fbf6a", 2)}/></g>` +
        `<g ${s.a(cur)}><path d="M0 0v18l5-5 4 8 3-1-4-8h7z" fill="#fff" style="stroke:var(--ink);stroke-width:1.5px"/></g>` +
        chip(s, 150, 136, 96, '四个选项选一个', CL.v, 40);
    }},
    period: {dur: 6, hl: [8, 14], end: 60, lit: '绕一圈的路', mean: '时期；周期；句号', draw: s => {
      return `<circle cx="110" cy="76" r="44" ${sk(CL.m, 6, .3)}/><circle cx="110" cy="76" r="44" ${sk(CL.t, 6)} ${DASH} transform="rotate(-90 110 76)" ${s.a(drawP(14, 40))}/>` +
        `<g ${s.a(showAt(8))}><g ${s.a({0: R(0), 14: R(0), 40: R(360), 100: R(360)}, ORG(110, 76))}><circle cx="110" cy="32" r="8" fill="${CL.a}"/></g></g>` +
        `<text x="110" y="82" font-size="14" font-weight="700" text-anchor="middle" ${fl(CL.t)} ${s.a(pop(40), ORG(110, 76))}>一圈</text>` +
        `<g ${s.a(pop(44), ORG(234, 70))}><circle cx="234" cy="78" r="9" ${fl(CL.k)}/><text x="234" y="112" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>句号也叫 period</text></g>` +
        chip(s, 110, 140, 104, '绕一圈 = 一个周期', CL.t, 44);
    }},
    prefer: {dur: 6, hl: [8, 20], end: 60, lit: '先把喜欢的带上', mean: '更喜欢', draw: s => {
      return GND() + `<rect x="100" y="100" width="130" height="6" rx="2" fill="${WOOD}"/><path d="M110 106v22M220 106v22" ${sk(WOOD, 3)}/>` +
        `<g ${s.a({0: T(), 8: T(), 18: T(-40, 0), 92: T(-40, 0), 100: T()})}><path d="M112 82h18l-2 18h-14z" fill="#8fc98a" style="stroke:#3f8f4f;stroke-width:1.5px"/><g ${s.a(pop(20), ORG(121, 70))}>${heartAt(121, 66, .5, '#e2473a')}</g></g>` +
        `<path d="M184 82h20l-2 18h-16z" fill="#8b5a3a"/><path d="M204 86q7 2 4 8" ${sk('#8b5a3a', 2.5)}/><path d="M190 76q-3-4 0-8M197 76q-3-4 0-8" ${sk(CL.m, 1.5)}/>` +
        kid(60, 128, CL.t, {aR: [20, -32]}) +
        `<g ${s.a(pop(30), ORG(156, 40))}><text x="122" y="46" font-size="12" font-weight="700" text-anchor="middle" fill="#3f8f4f">茶</text><text x="152" y="47" font-size="16" font-weight="700" text-anchor="middle" fill="#d23c2f">&gt;</text><text x="190" y="46" font-size="12" font-weight="700" text-anchor="middle" fill="#8b5a3a">咖啡</text></g>` +
        chip(s, 236, 22, 76, '更喜欢喝茶', CL.t, 44);
    }},
    remove: {dur: 6, hl: [18, 10], end: 60, lit: '移开去掉', mean: '去除；移走；脱下', draw: s => {
      const rub = {0: 'opacity:0;' + T(110, 70), 8: 'opacity:0;' + T(110, 70), 10: 'opacity:1;' + T(110, 70), 34: 'opacity:0;' + T(220, 40), 100: 'opacity:0;' + T(220, 40)};
      [0, 1, 2, 3, 4, 5].forEach(i => { rub[f1(12 + i * 3.5)] = 'opacity:1;' + T(i % 2 ? 110 : 170, 64 + i * 3); }); rub[32] = 'opacity:1;' + T(200, 50);
      return `<rect x="60" y="16" width="180" height="116" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/>` + [36, 56, 96, 116].map(y => `<path d="M76 ${y}h148" ${sk(CL.m, 2, .4)}/>`).join('') +
        `<path d="M122 66q10-16 30-8q24-6 26 14q8 12-12 18q-20 10-36-2q-18-6-8-22z" fill="#2b2b2b" ${s.a({0: 'opacity:1', 10: 'opacity:1', 30: 'opacity:0', 92: 'opacity:0', 100: 'opacity:1'})}/>` +
        `<g ${s.a(rub)}><rect x="-14" y="-9" width="28" height="18" rx="3" fill="#f2a3b3"/><rect x="2" y="-9" width="12" height="18" rx="2" fill="#4a90d0"/></g>` +
        [0, 1, 2].map(i => `<circle cx="${130 + i * 18}" cy="92" r="2" fill="#9a948c" ${s.a({0: 'opacity:0;' + T(), [28 + i]: 'opacity:0;' + T(), [29 + i]: 'opacity:1;' + T(), [40 + i]: 'opacity:0;' + T((i - 1) * 8, 46), 100: 'opacity:0'})}/>`).join('') +
        `<g ${s.a(pop(34), ORG(150, 76))}>${sparkle(140, 74, 8)}${sparkle(168, 82, 5)}</g>` + chip(s, 150, 140, 84, '擦掉了 = 去除', CL.a, 40);
    }},
    // ---------- 第三十批 ----------
    reveal: {dur: 6, hl: [20, 8], end: 60, lit: '揭开面纱', mean: '揭示；透露', draw: s => {
      return GND() + `<path d="M140 104l-10 24M200 104l10 24" ${sk(WOOD, 3)}/><rect x="120" y="24" width="100" height="80" fill="#bfe1f2" style="stroke:${WOOD};stroke-width:5px"/>` +
        `<circle cx="196" cy="44" r="9" ${fl(CL.g)}/><path d="M124 100l30-40 22 26 14-14 26 28z" fill="#3f8f4f"/>` +
        `<path d="M114 18h112v86q-10 8-20 0t-18 0-18 0-18 0-18 0-20 0z" fill="#8b5a9a" ${s.a({0: 'transform:scaleY(1)', 8: 'transform:scaleY(1)', 12: 'transform:scaleY(.96)', 16: 'transform:scaleY(1)', 20: 'transform:scaleY(1)', 30: 'transform:scaleY(.08)', 92: 'transform:scaleY(.08)', 100: 'transform:scaleY(1)'}, 'transform-origin:50% 0%;transform-box:fill-box')}/>` +
        `<path d="M226 22Q252 50 246 94" ${sk('#c9a26a', 2)}/>` + kid(260, 128, CL.t, {aL: [-14, -34]}) +
        [40, 70].map((x, i) => kid(x, 128, [CL.v, CL.a][i], {k: .6}) + `<text x="${x}" y="78" font-size="14" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(pop(32 + i * 2), ORG(x, 72))}>!</text>`).join('') +
        chip(s, 56, 30, 64, '揭开面纱', CL.v, 40);
    }},
    user: {dur: 6, hl: [10, 40], end: 60, lit: '使用的人', mean: '用户；使用者', draw: s => {
      const icons = [[136, 40, CL.a], [164, 40, CL.t], [136, 68, CL.g], [164, 68, CL.v], [136, 96, '#3fbf6a'], [164, 96, CL.k]];
      return GND() + `<rect x="116" y="14" width="68" height="118" rx="10" fill="#2b2b2b"/><rect x="122" y="24" width="56" height="94" rx="3" fill="#eef6fb"/>` +
        icons.map(([x, y, c]) => `<rect x="${x - 9}" y="${y - 9}" width="18" height="18" rx="5" ${fl(c)}/>`).join('') +
        `<circle cx="164" cy="40" r="6" ${sk('#fff', 2)} ${s.a({0: 'opacity:0;transform:scale(.5)', 10: 'opacity:0;transform:scale(.5)', 11: 'opacity:1;transform:scale(1)', 16: 'opacity:0;transform:scale(2.4)', 100: 'opacity:0'}, ORG(164, 40))}/>` +
        `<g ${s.a(showAt(18))}><rect x="122" y="24" width="56" height="94" rx="3" fill="#fff"/><circle cx="150" cy="50" r="12" fill="${SKIN}"/><path d="M138 50a12 12 0 0 1 24 0q-6-4-12-3t-12 3z" fill="${HAIR}"/><path d="M134 80q0-14 16-14t16 14z" fill="var(--teal)"/><path d="M132 92h36M132 100h28M132 108h32" ${sk(CL.m, 2, .5)}/></g>` +
        kid(60, 128, CL.t, {aR: [22, -46]}) + chip(s, 236, 40, 64, '用户 +1', CL.t, 40) + chip(s, 236, 100, 96, '使用的人 = 用户', CL.v, 46);
    }},
    vacation: {dur: 6, hl: [10, 40], end: 60, lit: '空出来的日子', mean: '假期；休假', draw: s => {
      return `<rect x="150" y="100" width="150" height="10" fill="#6db7e8"/><rect x="150" y="110" width="150" height="40" fill="#f2dca0"/><circle cx="276" cy="26" r="11" ${fl(CL.g)}/>` + GND(8, 150) +
        `<rect x="20" y="96" width="90" height="6" fill="${WOOD}"/><path d="M28 102v26M102 102v26" ${sk(WOOD, 3)}/><rect x="50" y="74" width="30" height="22" rx="2" fill="#3a3a3a"/><path d="M110 128v-34h18v34M110 112h18" ${sk(CL.m, 3)}/>` +
        `<g ${s.a(pop(10), ORG(64, 40))}><path d="M64 22V30" ${sk(CL.m, 1.5)}/><rect x="40" y="30" width="48" height="20" rx="3" fill="#d23c2f"/><text x="64" y="44" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">休假中</text></g>` +
        `<path d="M232 128V56" ${sk(INK, 2.5)}/><path d="M196 62q36-36 72 0z" fill="#e2473a"/><path d="M208 62q12-24 24-34q12 10 24 34" ${sk('#fff', 2)}/>` +
        `<g ${s.a(moveIn([[16, -140, 0], [32, 0, 0]]))}>${kid(214, 128, CL.t, {aR: [14, -56], ...walkLegs(s, 214, 128, 16, 32, 6)})}<path d="M206 75h7M215 75h7" ${sk(INK, 3)}/></g>` +
        chip(s, 150, 22, 84, '空出来的日子', CL.t, 44);
    }},
    demonstrate: {dur: 6, hl: [8, 18, 44], end: 60, lit: '拿出来给人看', mean: '证明；示范', draw: s => {
      return `<path d="M120 0H300V128H120z" fill="#3a2e28" opacity=".12"/><path d="M120 0q14 60 0 128M300 0q-14 60 0 128" ${sk('#b8323a', 16)}/>` + GND() +
        `<rect x="128" y="112" width="160" height="16" fill="${WOOD}"/>` +
        `<path d="M200 0L164 112h72z" fill="#f6e7a8" opacity=".55" ${s.a(showAt(8))}/>` +
        kid(200, 112, CL.v, {aR: [12, -62]}) +
        `<g ${s.a({0: R(0), 100: R(360)}, ORG(214, 30) + ';animation-timing-function:linear', 3)}><rect x="204" y="20" width="20" height="20" rx="2" fill="#f29a2e"/><path d="M204 27h20M211 20v20" ${sk('#fff', 1.5)}/></g>` +
        [30, 60, 90].map((x, i) => kid(x, 128, [CL.t, CL.a, CL.g][i], {k: .6}) + `<path d="M${x + 4} 92L204 34" ${sk(CL.m, 1.5)} stroke-dasharray="3 4" ${s.a(fadeP(18 + i * 2, 24 + i * 2))}/>`).join('') +
        chip(s, 62, 30, 96, '拿出来给大家看', CL.v, 44);
    }},
    diversity: {dur: 6, hl: [8, 20, 46], end: 60, lit: '各不相同的样子', mean: '多样性', draw: s => {
      const petals = (x, y, n, c, r, rr = 5) => [...Array(n)].map((_, i) => { const a = i * 2 * Math.PI / n; return `<ellipse cx="${f1(x + r * Math.cos(a))}" cy="${f1(y + r * Math.sin(a))}" rx="${rr}" ry="${rr * .7}" fill="${c}" stroke="#c8bca8" stroke-width=".8" transform="rotate(${f1(a * 180 / Math.PI)} ${f1(x + r * Math.cos(a))} ${f1(y + r * Math.sin(a))})"/>`; }).join('');
      const heads = [x => `<path d="M${x - 9} 64q0 14 9 16q9-2 9-16l-5 5-4-7-4 7z" fill="#e2473a"/>`, x => petals(x, 66, 12, '#f6d34a', 9, 6) + `<circle cx="${x}" cy="66" r="6" fill="#8b5a3a"/>`, x => petals(x, 66, 8, '#fff', 8, 5) + `<circle cx="${x}" cy="66" r="4" fill="#f6d34a"/>`,
        x => `<circle cx="${x}" cy="66" r="10" fill="#f2a3b3"/><path d="M${x - 5} 64q5-6 10 0q-5 6-10 0z" fill="#e27a93"/>`, x => `<path d="M${x - 8} 58q8-4 16 0v10q-8 6-16 0z" fill="#6d8ee8"/>`, x => [0, 1, 2, 3].map(i => `<circle cx="${x}" cy="${76 - i * 6}" r="3.5" fill="#9b7fd0"/>`).join('')];
      return GND() + heads.map((h, i) => { const x = 30 + i * 48; return `<g ${s.a(growY(8 + i * 3, 18 + i * 3), FOOT)}><path d="M${x} 128V70" ${sk('#3f8f4f', 3)}/><path d="M${x} 104q-12-2-14-10q12 0 14 10z" fill="#3fbf6a"/></g>` +
        `<g ${s.a({0: 'opacity:0;transform:rotate(-180deg) scale(0)', [20 + i * 3]: 'opacity:0;transform:rotate(-180deg) scale(0)', [26 + i * 3]: 'opacity:1;transform:rotate(0deg) scale(1)', 92: 'opacity:1;transform:rotate(0deg) scale(1)', 100: 'opacity:0;transform:rotate(0deg) scale(1)'}, ORG(x, 68))}>${h(x)}</g>`; }).join('') +
        `<g ${s.a({0: T(20, 40), 30: T(20, 40), 50: T(150, 26), 70: T(260, 40), 100: T(20, 40)})}><path d="M0 0q-8-8-10 0q2 6 10 0q8-8 10 0q-2 6-10 0z" fill="#f2a3b3"/></g>` +
        chip(s, 150, 22, 96, '各不相同 = 多样', CL.v, 46);
    }},
    enhance: {dur: 6, hl: [8, 20], end: 60, lit: '使变高', mean: '提高；增强', draw: s => {
      return GND() + `<g ${s.a(pop(40), ORG(150, 24))}>${sparkle(152, 20, 6)}${sparkle(190, 30, 5)}</g>${star5(172, 22, 11, 4.6, CL.g)}` +
        `<path d="M136 128L164 98M164 128L136 98" ${sk(CL.m, 3)} ${s.a({0: 'transform:scaleY(.01)', 20: 'transform:scaleY(.01)', 34: 'transform:scaleY(1)', 92: 'transform:scaleY(1)', 100: 'transform:scaleY(.01)'}, FOOT)}/>` +
        `<g ${s.a({0: T(), 20: T(), 34: T(0, -30), 92: T(0, -30), 100: T()})}><rect x="126" y="120" width="48" height="8" rx="2" fill="#f2b632"/>${kid(150, 120, CL.t, {aR: [18, -64]})}</g>` +
        `<g ${s.a(showAt(8, 20))}><path d="M96 110V70" ${sk(CL.a, 3)}/><path d="M88 78l8-10 8 10" ${sk(CL.a, 3)}/></g>` +
        `<rect x="236" y="30" width="16" height="90" rx="4" ${fs(CL.p, CL.m, 2)}/><rect x="238" y="32" width="12" height="86" rx="3" fill="#3fbf6a" ${s.a({0: 'transform:scaleY(.3)', 20: 'transform:scaleY(.3)', 34: 'transform:scaleY(1)', 92: 'transform:scaleY(1)', 100: 'transform:scaleY(.3)'}, FOOT)}/><text x="244" y="138" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>能力</text>` +
        chip(s, 66, 30, 84, '使变高 = 提高', CL.a, 40);
    }},
    motivate: {dur: 6, hl: [10, 24], end: 60, lit: '给你动力', mean: '激励；促使', draw: s => {
      return `<path d="M0 128H300" ${sk(CL.m, 2, .5)}/><path d="M0 138H300" ${sk(CL.m, 1, .3)} stroke-dasharray="8 8"/>` +
        kid(44, 128, '#3d4a5c', {aR: [16, -40]}) + `<path d="M60 84l14-6v16l-14-6z" fill="#f2b632"/>` + chip(s, 66, 50, 52, '加油！', '#d23c2f', 10) +
        `<g ${s.a(move([[24, 0, 0], [44, 140, 0]]))}>${kid(120, 128, CL.t, {noFace: true, ...walkLegs(s, 120, 128, 24, 44, 12)})}<g ${s.a(hideAt(22))}>${face(120, 128, 1, 'sad')}<path d="M134 64q-3 5 0 7a3 3 0 0 0 0-7z" fill="#6db7e8"/></g><g ${s.a(showAt(22))}>${face(120, 128)}</g>` +
        `<path d="M98 84h-12M100 96h-16M98 108h-10" ${sk(CL.m, 2)} ${s.a(showAt(26, 42))}/></g>` +
        `<g ${s.a(pop(20), ORG(120, 50))}><path d="M124 36l-10 16h8l-4 14 12-18h-8l4-12z" fill="#f6d34a" style="stroke:#c9952a;stroke-width:1px"/></g>` +
        chip(s, 220, 30, 64, '给你动力', CL.a, 44);
    }},
    owner: {dur: 6, hl: [10, 40], end: 60, lit: '拥有它的人', mean: '主人；物主', draw: s => {
      const dog = `<ellipse cx="240" cy="110" rx="18" ry="10" fill="#c98a4a"/><circle cx="220" cy="100" r="9" fill="#c98a4a"/><path d="M214 94l-4 10 6-2zM224 92l4 10-6-2z" fill="#8b5a3a"/><circle cx="217" cy="99" r="1.5" fill="${INK}"/><circle cx="213" cy="103" r="2" fill="${INK}"/>` +
        `<path d="M228 118v10M236 118v10M246 118v10M254 118v10" ${sk('#c98a4a', 4)}/><path d="M226 104h6" ${sk('#d23c2f', 3)}/><g ${s.a({0: R(-20), 50: R(20), 100: R(-20)}, ORG(256, 106), .4)}><path d="M256 106q10-4 12-14" ${sk('#c98a4a', 4)}/></g>`;
      return GND() + kid(80, 128, CL.t, {aL: [-16, -44], aR: [16, -44]}) +
        `<g ${s.a(move([[10, 0, 0], [26, -112, 0]]))}>${dog}</g>` +
        `<g ${s.a(pop(28), ORG(110, 70))}>${heartAt(110, 66, .8)}</g>` + chip(s, 80, 32, 52, '主人', CL.t, 40);
    }},
    pleasure: {dur: 6, hl: [10, 40], end: 60, lit: '让人高兴的事', mean: '快乐；乐事', draw: s => {
      return GND() + kid(120, 128, CL.t, {noFace: true, aR: [18, -36]}) + `<path d="M112 76q4-3 8 0M120 76q4-3 8 0" ${sk(INK, 1.8)}/><path d="M114 82q6 6 12 0" ${sk(INK, 1.8)}/><circle cx="110" cy="81" r="2.5" fill="#f08f7f" opacity=".7"/><circle cx="130" cy="81" r="2.5" fill="#f08f7f" opacity=".7"/>` +
        `<path d="M132 90l6 18 6-18z" fill="#d9a35b"/><g ${s.a({0: 'transform:scale(1)', 14: 'transform:scale(1)', 36: 'transform:scale(.45)', 92: 'transform:scale(.45)', 100: 'transform:scale(1)'}, ORG(138, 90))}><circle cx="138" cy="84" r="8" fill="#f2a3b3"/><circle cx="138" cy="74" r="7" fill="#fff6c8"/></g>` +
        [0, 1, 2].map(i => `<g ${s.a({0: 'opacity:0;' + T(), [18 + i * 6]: 'opacity:0;' + T(), [20 + i * 6]: 'opacity:1;' + T(), [36 + i * 6]: 'opacity:0;' + T((i - 1) * 18, -40), 100: 'opacity:0;' + T((i - 1) * 18, -40)})}>${heartAt(120, 56, .55, [CL.a, '#f2a3b3', CL.v][i])}</g>`).join('') +
        chip(s, 216, 40, 52, '好快乐', CL.a, 44);
    }},
    psychologist: {dur: 6, hl: [8, 16, 40], end: 60, lit: '研究心理的人', mean: '心理学家', draw: s => {
      return GND() + `<rect x="40" y="100" width="80" height="20" rx="6" fill="#9b7fd0"/><rect x="36" y="88" width="14" height="32" rx="5" fill="#7a5ab0"/><path d="M48 120v8M112 120v8" ${sk('#5a3a90', 3)}/>` +
        kid(84, 120, CL.a, {noFace: true}) + `<g ${s.a(hideAt(34))}>${face(84, 120, 1, 'sad')}</g><g ${s.a(showAt(34))}>${face(84, 120)}</g>` +
        `<g ${s.a({0: 'opacity:0;transform:scale(1)', 3: 'opacity:1;transform:scale(1)', 26: 'opacity:1;transform:scale(1)', 34: 'opacity:0;transform:scale(.3)', 100: 'opacity:0'}, ORG(84, 36))}><path d="M70 40a7 7 0 0 1 10-8 9 9 0 0 1 16 4 6 6 0 0 1-1 12h-22a5 5 0 0 1-3-8z" fill="#7a8494"/><path d="M76 52l-2 5M84 52l-2 5M92 52l-2 5" ${sk('#6db7e8', 2)}/></g>` +
        `<g ${s.a(pop(34), ORG(84, 36))}><circle cx="84" cy="36" r="8" ${fl(CL.g)}/><path d="M84 22v-4M70 36h-4M98 36h4M74 26l-3-3M94 26l3-3" ${sk(CL.g, 2)}/></g>` +
        kid(214, 128, '#3d4a5c', {aL: [-14, -32]}) + `<circle cx="210" cy="76" r="3.8" ${sk(INK, 1.2)}/><circle cx="218" cy="76" r="3.8" ${sk(INK, 1.2)}/><rect x="190" y="90" width="12" height="16" rx="1" fill="#fff" style="stroke:var(--ink3);stroke-width:1.2px"/>` +
        chip(s, 168, 44, 64, '说说看？', CL.t, 8) + chip(s, 130, 70, 40, '……', CL.a, 16) + chip(s, 214, 24, 64, '心理学家', CL.v, 40);
    }},
    recommend: {dur: 6, hl: [8, 18], end: 60, lit: '大力称赞', mean: '推荐；建议', draw: s => {
      return GND() + kid(80, 128, CL.t, {aR: [18, -40]}) + kid(220, 128, CL.a, {aL: [-18, -34]}) +
        `<g ${s.a({0: T(), 34: T(), 42: T(118, 6), 92: T(118, 6), 100: T()})}><rect x="90" y="76" width="22" height="26" rx="2" ${fl(CL.v)}/><path d="M94 76v26" ${sk(CL.p, 1.5)}/></g>` +
        [0, 1, 2, 3, 4].map(i => `<g ${s.a(pop(18 + i * 2), ORG(110 + i * 20, 44))}>${star5(110 + i * 20, 44, 8, 3.4, CL.g)}</g>`).join('') +
        chip(s, 74, 22, 76, '强烈推荐！', CL.t, 8) + chip(s, 150, 140, 96, '大力称赞 = 推荐', CL.a, 46);
    }},
    respond: {dur: 6, hl: [20, 26], end: 60, lit: '给出回音', mean: '回应；作出反应', draw: s => {
      return GND() + kid(236, 128, '#3d4a5c', {k: 1.1, aL: [-18, -40]}) + chip(s, 236, 30, 64, '谁知道？', '#3d4a5c', 8) +
        [50, 92, 134].map((x, i) => (i === 1 ? kid(x, 128, CL.v, {k: .7, aR: [26, -66], armR: s.a(showAt(20))}) + `<path d="M${x + 5.6} 103.5L${x + 9.1} 113.3" stroke="${SKIN}" stroke-width="3.2" stroke-linecap="round" ${s.a(hideAt(20))}/>` : kid(x, 128, [CL.t, CL.v, CL.g][i], {k: .7}))).join('') +
        chip(s, 92, 46, 64, '我知道！', CL.v, 26) +
        `<g ${s.a(pop(36), ORG(196, 56))}><circle cx="196" cy="56" r="8" fill="#3fbf6a"/><path d="M192 56l3 3 5-6" ${sk('#fff', 2)}/></g>` +
        chip(s, 150, 140, 64, '举手回应', CL.a, 44);
    }},
    // ---------- 第三十一批 ----------
    restaurant: {dur: 6, hl: [20, 44], end: 60, lit: '恢复体力的地方', mean: '餐馆；饭店', draw: s => {
      const chop = {0: R(0), 16: R(0), 32: R(0), 100: R(0)}; for (let i = 1; i < 8; i++) chop[f1(16 + i * 2)] = R(i % 2 ? -25 : 0);
      return GND() + `<path d="M20 20h260v16H20z" fill="#d23c2f"/>${[40, 80, 120, 160, 200, 240].map(x => `<path d="M${x} 20h20v16h-20z" fill="#fff"/>`).join('')}<rect x="120" y="38" width="60" height="18" rx="3" fill="#3a2e28"/><text x="150" y="51" font-size="11" font-weight="700" text-anchor="middle" fill="#f6d34a">餐馆</text>` +
        `<rect x="96" y="100" width="100" height="6" rx="2" fill="${WOOD}"/><path d="M104 106v22M188 106v22" ${sk(WOOD, 3)}/>` +
        `<g ${s.a(moveIn([[10, 60, 0], [16, 0, 0]]))}><path d="M126 90h28a14 10 0 0 1-28 0z" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M130 90q10-6 20 0" ${sk('#f2d03a', 2)}/><path d="M136 84q-2-4 0-8M144 84q-2-4 0-8" ${sk(CL.m, 1.5)}/></g>` +
        kid(70, 128, CL.t, {noFace: true, aR: [22, -40], armR: s.a(chop, shoulder(70, 128, 1)), holdR: `<path d="M92 88l14-6M92 90l14-3" ${sk(WOOD, 1.5)}/>`}) +
        `<g ${s.a(hideAt(30))}>${face(70, 128, 1, 'sad')}</g><g ${s.a(showAt(30))}>${face(70, 128)}</g>` +
        `<rect x="48" y="58" width="44" height="9" rx="3" ${fs(CL.p, CL.m, 1.5)}/><rect x="49.5" y="59.5" width="41" height="6" rx="2" fill="#e2473a" ${s.a({0: 'transform:scaleX(.2);fill:#e2473a', 20: 'transform:scaleX(.2);fill:#e2473a', 36: 'transform:scaleX(1);fill:#3fbf6a', 92: 'transform:scaleX(1);fill:#3fbf6a', 100: 'transform:scaleX(.2);fill:#e2473a'}, 'transform-origin:0% 50%;transform-box:fill-box')}/><text x="40" y="66" font-size="8" font-weight="700" text-anchor="end" ${fl(CL.m)}>体力</text>` +
        chip(s, 238, 80, 84, '吃饱恢复体力', CL.t, 44);
    }},
    senior: {dur: 6, hl: [8, 20], end: 60, lit: '更老的', mean: '年长的；高级的', draw: s => {
      return GND() + kid(90, 128, '#8b7a6a', {aR: [14, -28]}) + `<path d="M79 75a11 11 0 0 1 22 0q-5-5-11-3.5t-11 3.5z" fill="#dcdcdc"/><path d="M85 82q5-3 10 0" ${sk('#fff', 2)}/><path d="M104 96v32M104 96q0-6 6-6" ${sk(WOOD, 3)}/>` +
        kid(210, 128, CL.t, {k: .7}) +
        chip(s, 90, 44, 48, '70 岁', '#8b7a6a', 8) + chip(s, 210, 64, 48, '10 岁', CL.t, 12) +
        `<text x="150" y="92" font-size="30" font-weight="700" text-anchor="middle" ${fl(CL.a)} ${s.a(pop(20), ORG(150, 82))}>&gt;</text>` +
        chip(s, 150, 140, 92, '更老的 = 年长的', CL.v, 40);
    }},
    television: {dur: 6, hl: [8, 24], end: 60, lit: '看到远方的画面', mean: '电视', draw: s => {
      return GND() + `<path d="M244 128l10-90 10 90M248 92h12M246 110h16" ${sk(CL.m, 2.5)}/><circle cx="254" cy="34" r="4" fill="#d23c2f"/>` +
        [0, 1, 2].map(i => `<path d="M236 30q-8 10 0 20" ${sk(CL.v, 2.5)} ${s.a({0: 'opacity:0;' + T(), [8 + i * 4]: 'opacity:0;' + T(), [9 + i * 4]: 'opacity:1;' + T(), [20 + i * 4]: 'opacity:0;' + T(-90, 20), 100: 'opacity:0;' + T(-90, 20)})}/>`).join('') +
        `<path d="M96 56l14-12 14 12" ${sk(CL.k, 2)}/><rect x="70" y="56" width="80" height="54" rx="5" fill="#2b2b2b"/><rect x="76" y="62" width="68" height="42" rx="2" fill="#3a3a3a"/><path d="M90 110l-6 18M130 110l6 18" ${sk(CL.k, 3)}/>` +
        `<g ${s.a(showAt(24))}><rect x="76" y="62" width="68" height="42" rx="2" fill="#bfe1f2"/><rect x="76" y="90" width="68" height="14" fill="#f2dca0"/><path d="M90 90l14-20 14 20zM112 90l10-14 10 14z" fill="#d9a35b"/><circle cx="132" cy="70" r="4" fill="#f6d34a"/></g>` +
        kid(196, 128, CL.a, {k: .8}) + chip(s, 110, 140, 92, '看到远方的画面', CL.v, 40);
    }},
    western: {dur: 6, hl: [8, 40], end: 60, lit: '西边的', mean: '西方的；西部的', draw: s => {
      return `<rect x="140" y="0" width="160" height="110" ${fl('#f2a35a', .35)} ${s.a(fadeP(28, 40))}/>` +
        `<g ${s.a(move([[20, 0, 0], [40, -86, 76]]))}><circle cx="256" cy="40" r="12" ${fl(CL.g)}/></g>` +
        `<rect x="140" y="110" width="160" height="40" fill="#9fc3a0"/><path d="M140 110H300" ${sk(CL.m, 2)}/>` +
        `<circle cx="70" cy="72" r="44" ${fs(CL.p, CL.m, 2.5)}/>` + [['N', 70, 38], ['E', 104, 76], ['S', 70, 114], ['W', 36, 76]].map(([t, x, y]) => `<text x="${x}" y="${y}" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.m)}>${t}</text>`).join('') +
        `<g ${s.a(pop(16), ORG(36, 72))}><circle cx="36" cy="72" r="9" fill="#d23c2f"/><text x="36" y="76" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">W</text></g>` +
        `<g ${s.a({0: R(0), 8: R(0), 14: R(-100), 16: R(-90), 92: R(-90), 100: R(0)}, ORG(70, 72))}><path d="M70 72l-5 0 5-26 5 26z" fill="#d23c2f"/><path d="M70 72l-5 0 5 26 5-26z" fill="#9a948c"/></g>` +
        chip(s, 220, 24, 76, '太阳落在西边', CL.a, 44);
    }},
    anyone: {dur: 6, hl: [8, 30], end: 60, lit: '任何一个人', mean: '任何人', draw: s => {
      const xs = [60, 120, 180, 240];
      const cyc = i => ({0: 'opacity:0', [i * 25 + .1]: 'opacity:0', [i * 25 + 1]: 'opacity:1', [i * 25 + 24]: 'opacity:1', [i * 25 + 25]: 'opacity:0', 100: 'opacity:0'});
      const cone = x => `<path d="M${x} 20L${x - 22} 128h44z" fill="#f6e7a8" opacity=".6"/>`;
      return GND() + `<g ${s.a(showAt(8, 28))}>${[0, 2, 1, 3].map((j, i) => `<g ${s.a(cyc(i), '', .9)}>${cone(xs[j])}</g>`).join('')}</g><g ${s.a(showAt(30))}>${cone(180)}</g>` +
        xs.map((x, i) => kid(x, 128, [CL.t, CL.v, CL.g, CL.a][i], {k: .8, aR: i === 2 ? [20, -52] : [11, -17], armR: i === 2 ? s.a(showAt(32)) : ''}) + (i === 2 ? `<path d="M186.4 100L190.4 111.2" stroke="${SKIN}" stroke-width="3.7" stroke-linecap="round" ${s.a(hideAt(32))}/>` : '')).join('') +
        chip(s, 150, 14, 104, '有谁能帮帮我吗？', CL.k, 6) + chip(s, 150, 140, 96, '任何一个人都行', CL.t, 40);
    }},
    citizen: {dur: 6, hl: [8, 24], end: 60, lit: '城里的人', mean: '公民；市民', draw: s => {
      const bs = [[20, 50, 60], [52, 36, 84], [90, 44, 50], [136, 40, 90], [178, 48, 66], [228, 30, 78], [260, 34, 56]];
      return bs.map(([x, w, h], i) => { const ws = []; for (let yy = 128 - h + 8; yy < 118; yy += 12) for (let xx = x + 6; xx < x + w - 8; xx += 10) ws.push(`<rect x="${xx}" y="${yy}" width="5" height="6" fill="#f6e7a8"/>`);
        return `<g ${s.a(growY(8 + i * 2, 16 + i * 2), FOOT)}><rect x="${x}" y="${128 - h}" width="${w}" height="${h}" fill="${['#8fa3b8', '#a6b4c4', '#7f93a8'][i % 3]}"/>${ws.join('')}</g>`; }).join('') + GND() +
        [[0, CL.t, 24, 180], [1, CL.a, 28, 110], [2, CL.v, 32, 60], [3, CL.g, 36, 20]].map(([i, c, p, dx]) => `<g ${s.a(moveIn([[p, 0, 0], [p + 16, dx, 0]]))}>${kid(10 + i * 14, 140, c, {k: .55, ...walkLegs(s, 10 + i * 14, 140, p, p + 16, 6, .55)})}</g>`).join('') +
        chip(s, 150, 18, 96, '城里的人 = 市民', CL.v, 44);
    }},
    debate: {dur: 6, hl: [8, 16], end: 60, lit: '你一拳我一拳', mean: '辩论；争论', draw: s => {
      const clash = p => `<g ${s.a(showAt(p, p + 4))}>${burst(150, 70, 16).replace('<path ', `<path ${sk(CL.g, 3)} `)}</g>`;
      return GND() + kid(70, 128, CL.t, {k: .9, aR: [18, -44]}) + kid(230, 128, CL.a, {k: .9, aL: [-18, -44]}) +
        `<path d="M48 96h44v32H48zM208 96h44v32h-44z" fill="${WOOD}"/><text x="70" y="116" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">正方</text><text x="230" y="116" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">反方</text>` +
        chip(s, 76, 22, 72, '我方认为…', CL.t, 8) + chip(s, 224, 22, 72, '我方反对…', CL.a, 16) + chip(s, 76, 46, 56, '因为…', CL.t, 24) + chip(s, 224, 46, 56, '但是…', CL.a, 32) +
        clash(16) + clash(24) + clash(32) + chip(s, 150, 140, 76, '激烈的辩论', CL.v, 44);
    }},
    dietary: {dur: 6, hl: [8, 40], end: 60, lit: '饮食上的', mean: '饮食的', draw: s => {
      const cx = 150, cy = 74, r = 46;
      const parts = [[0, .4, '#3fbf6a', '蔬菜'], [.4, .7, '#f2d03a', '主食'], [.7, .9, '#e2473a', '肉蛋'], [.9, 1, '#f29a2e', '水果']];
      const pt = t => [f1(cx + r * Math.sin(t * 2 * Math.PI)), f1(cy - r * Math.cos(t * 2 * Math.PI))];
      return `<circle cx="${cx}" cy="${cy}" r="52" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/>` +
        parts.map(([a, b, c, t], i) => { const [x0, y0] = pt(a), [x1, y1] = pt(b), m = (a + b) / 2, lx = f1(cx + 30 * Math.sin(m * 2 * Math.PI)), ly = f1(cy - 30 * Math.cos(m * 2 * Math.PI));
          return `<g ${s.a(pop(8 + i * 5), ORG(cx, cy))}><path d="M${cx} ${cy}L${x0} ${y0}A${r} ${r} 0 ${b - a > .5 ? 1 : 0} 1 ${x1} ${y1}z" fill="${c}" style="stroke:#fff;stroke-width:2px"/><text x="${lx}" y="${f1(+ly + 3)}" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">${t}</text></g>`; }).join('') +
        `<path d="M76 40v60M72 40v14q4 4 8 0V40" ${sk(CL.m, 2)}/><path d="M224 40v60M224 40q8 8 0 24" ${sk(CL.m, 2)}/>` +
        chip(s, 150, 140, 96, '饮食搭配要均衡', CL.t, 40);
    }},
    electronic: {dur: 6, hl: [8, 40], end: 60, lit: '电子的', mean: '电子的', draw: s => {
      return `<circle cx="60" cy="70" r="7" fill="#e2473a"/><ellipse cx="60" cy="70" rx="30" ry="11" ${sk(CL.m, 1.5)}/><ellipse cx="60" cy="70" rx="30" ry="11" ${sk(CL.m, 1.5)} transform="rotate(60 60 70)"/><ellipse cx="60" cy="70" rx="30" ry="11" ${sk(CL.m, 1.5)} transform="rotate(-60 60 70)"/>` +
        [0, 60, -60].map((a, i) => `<g transform="rotate(${a} 60 70)"><g ${s.a({0: T(-30, 0), 25: T(0, 11), 50: T(30, 0), 75: T(0, -11), 100: T(-30, 0)}, 'animation-timing-function:linear', 1.2 + i * .3)}><circle cx="60" cy="70" r="3.5" fill="#4a90d0"/></g></g>`).join('') +
        `<path d="M92 76H150" ${sk(CL.m, 3)}/><g ${s.a(fadeP(14, 18))}><path d="M92 76H150" ${sk('#4a90d0', 3)} stroke-dasharray="3 9" ${s.a({0: 'stroke-dashoffset:0', 100: 'stroke-dashoffset:-48'}, 'animation-timing-function:linear', 1)}/></g>` +
        `<rect x="150" y="56" width="40" height="40" rx="3" fill="#2b2b2b"/>${[62, 72, 82, 92].map(y => `<path d="M146 ${y - 2}h4M190 ${y - 2}h4" ${sk(CL.m, 2)}/>`).join('')}<rect x="158" y="64" width="24" height="24" fill="#3fbf6a" ${s.a(showAt(24))}/>` +
        `<g ${s.a(pop(40), ORG(250, 50))}><rect x="240" y="30" width="22" height="38" rx="4" fill="#2b2b2b"/><rect x="243" y="35" width="16" height="26" fill="#9fd0ee"/></g>` +
        `<g ${s.a(pop(44), ORG(250, 110))}><rect x="230" y="92" width="44" height="28" rx="2" fill="#2b2b2b"/><rect x="234" y="96" width="36" height="20" fill="#9fd0ee"/><path d="M224 122h56" ${sk('#2b2b2b', 4)}/></g>` +
        chip(s, 110, 128, 76, '电子产品', CL.v, 46);
    }},
    establish: {dur: 6, hl: [8, 20, 40], end: 60, lit: '让它稳稳立住', mean: '建立；创办', draw: s => {
      const wob = {0: R(0), 8: R(0), 11: R(-12), 14: R(10), 17: R(-6), 20: R(0), 100: R(0)};
      return GND() + `<rect x="120" y="54" width="110" height="74" fill="#efe4d2" style="stroke:var(--ink3);stroke-width:2px"/><path d="M114 54h122l-8-14h-106z" fill="#2f5d8a"/><rect x="160" y="88" width="30" height="40" fill="${WOOD}"/>` +
        `<path d="M150 104h50" ${sk('#d23c2f', 4)} ${s.a(hideAt(30))}/><g ${s.a(showAt(30))}><path d="M150 104l20 4M200 104l-20 4" ${sk('#d23c2f', 4)}/></g><circle cx="175" cy="104" r="5" fill="#d23c2f" ${s.a(hideAt(30))}/>` +
        `<g ${s.a(moveIn([[24, 60, -40], [30, 0, 0]]))}><path d="M168 96l14 16M182 96l-14 16" ${sk(CL.k, 2.5)}/><circle cx="166" cy="94" r="3" ${sk(CL.k, 2)}/><circle cx="184" cy="94" r="3" ${sk(CL.k, 2)}/></g>` +
        `<g ${s.a(wob, ORG(60, 128))}><path d="M60 128V70" ${sk(WOOD, 4)}/><rect x="26" y="50" width="68" height="24" rx="3" fill="#fff" style="stroke:#d23c2f;stroke-width:2px"/><text x="60" y="66" font-size="10" font-weight="700" text-anchor="middle" fill="#d23c2f">公司成立</text></g>` +
        `<g ${s.a(showAt(20, 26))}><path d="M48 128l-8-6M72 128l8-6" ${sk(CL.m, 2)}/></g>` +
        [0, 1, 2, 3, 4, 5].map(i => `<rect x="${150 + i * 10}" y="70" width="5" height="5" fill="${[CL.a, CL.g, CL.t, CL.v][i % 4]}" ${s.a({0: 'opacity:0;' + T(), 32: 'opacity:0;' + T(), 33: 'opacity:1;' + T(), 46: 'opacity:0;' + T((i - 2.5) * 14, -40, 'rotate(200deg)'), 100: 'opacity:0'})}/>`).join('') +
        chip(s, 232, 22, 92, '稳稳立住 = 建立', CL.a, 44);
    }},
    generation: {dur: 6, hl: [8, 40], end: 60, lit: '同一批出生的人', mean: '一代人；产生', draw: s => {
      const grp = (x, p, k, c, old) => [-18, 0, 18].map(dx => kid(x + dx, 124, c, {k}) + (old ? `<path d="M${f1(x + dx - 11 * k)} ${f1(124 - 53 * k)}a${f1(11 * k)} ${f1(11 * k)} 0 0 1 ${f1(22 * k)} 0z" fill="#dcdcdc"/>` : '')).join('');
      return `<path d="M20 128H280" ${sk(CL.m, 2)}/>` + [[60, '1960'], [150, '1990'], [240, '2020']].map(([x, t]) => `<path d="M${x} 124v8" ${sk(CL.m, 2)}/><text x="${x}" y="144" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>${t}</text>`).join('') +
        `<g ${s.a(pop(8), FOOT)}>${grp(60, 8, .6, '#8b7a6a', true)}</g><g ${s.a(pop(16), FOOT)}>${grp(150, 16, .6, CL.v)}</g><g ${s.a(pop(24), FOOT)}>${grp(240, 24, .45, CL.t)}</g>` +
        `<path d="M90 96H120M180 96H210" ${sk(CL.a, 2)} stroke-dasharray="4 4" ${s.a(fadeP(30, 34))}/>` +
        [60, 150, 240].map((x, i) => `<text x="${x}" y="${i === 2 ? 80 : 70}" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.a)} ${s.a(showAt(34 + i * 2))}>第${['一', '二', '三'][i]}代</text>`).join('') +
        chip(s, 150, 22, 104, '同一时期的一批人', CL.v, 44);
    }},
    judgment: {dur: 6, hl: [10, 40], end: 60, lit: '判断这件事', mean: '判断；判决；看法', draw: s => {
      const tilt = {0: R(0), 10: R(0), 14: R(10), 18: R(-8), 22: R(6), 26: R(-10), 30: R(-10), 92: R(-10), 100: R(0)};
      return GND() + `<path d="M120 128h60M150 128V44" ${sk('#c9952a', 4)}/>` +
        `<g ${s.a(tilt, ORG(150, 44))}><path d="M96 44h108" ${sk('#c9952a', 4)}/><path d="M100 44l-14 30M100 44l14 30M200 44l-14 30M200 44l14 30" ${sk('#c9952a', 1.5)}/><path d="M82 74h36a18 8 0 0 1-36 0zM182 74h36a18 8 0 0 1-36 0z" fill="#e8c460"/>` +
        `<rect x="88" y="62" width="24" height="12" rx="2" ${fl(CL.t)}/><text x="100" y="71" font-size="7" font-weight="700" text-anchor="middle" fill="#fff">证据</text><text x="200" y="72" font-size="12" font-weight="700" text-anchor="middle" ${fl(CL.m)}>?</text></g>` +
        `<rect x="222" y="112" width="30" height="10" rx="2" fill="#6b4428"/>` +
        `<g ${s.a({0: R(0), 28: R(0), 30: R(-40), 32: R(0), 34: R(-40), 36: R(0), 100: R(0)}, ORG(280, 104))}><path d="M280 104L246 104" ${sk(WOOD, 4)}/><rect x="234" y="96" width="14" height="16" rx="3" fill="#8b5a3a"/></g>` +
        `<g ${s.a(showAt(32, 40))}>${burst(240, 112, 12).replace('<path ', `<path ${sk(CL.g, 2.5)} `)}</g>` +
        chip(s, 60, 30, 64, '做出判断', CL.a, 40);
    }},
    // ---------- 第三十二批 ----------
    necessary: {dur: 6, hl: [8, 20, 40], end: 60, lit: '不能让步的', mean: '必要的；必需的', draw: s => {
      const pass = `<rect x="94" y="80" width="14" height="18" rx="2" fill="#b8323a"/><circle cx="101" cy="87" r="3" ${sk('#f6d34a', 1.2)}/>`;
      return GND() + `<rect x="176" y="76" width="8" height="52" fill="#556070"/>` +
        `<g ${s.a({0: R(0), 32: R(0), 36: R(-80), 92: R(-80), 100: R(0)}, ORG(180, 80))}><path d="M180 80H262" ${sk('#d23c2f', 6)}/><path d="M196 80h10M222 80h10M248 80h10" ${sk('#fff', 6)}/></g>` +
        kid(272, 128, '#3d4a5c', {aL: [6, -30], aR: [-6, -30]}) + chip(s, 236, 30, 84, '没护照不让过', '#3d4a5c', 10) +
        `<g ${s.a(pop(32), ORG(272, 56))}><circle cx="272" cy="56" r="7" fill="#3fbf6a"/><path d="M268.5 56l2.5 2.5 4.5-5" ${sk('#fff', 2)}/></g>` +
        `<g ${s.a(move([[38, 0, 0], [52, 130, 0]]))}>${kid(90, 128, CL.t, {aR: [16, -40], ...walkLegs(s, 90, 128, 38, 52, 4)})}<g ${s.a(showAt(24))}>${pass}</g></g>` +
        chip(s, 80, 30, 84, '护照必不可少', CL.t, 46);
    }},
    perfect: {dur: 6, hl: [8, 20], end: 60, lit: '完全做好', mean: '完美的；使完美', draw: s => {
      const wob = []; for (let i = 0; i <= 24; i++) { const a = i / 24 * 2 * Math.PI, r = 28 + 5 * Math.sin(i * 1.9) + 3 * Math.cos(i * 3.3); wob.push(f1(90 + r * Math.cos(a)) + ' ' + f1(70 + r * Math.sin(a))); }
      return `<rect x="30" y="20" width="240" height="104" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/>` +
        `<path d="M${wob.join('L')}" ${sk(CL.m, 3)} stroke-linejoin="round" ${DASH} ${s.a(drawP(8, 18))}/><path d="M78 58l24 24M102 58l-24 24" ${sk('#d23c2f', 3)} ${s.a(showAt(20))}/>` +
        `<circle cx="210" cy="70" r="30" ${sk(CL.t, 3)} ${DASH} transform="rotate(-90 210 70)" ${s.a(drawP(24, 36))}/>` +
        `<g ${s.a(showAt(23, 36))}><g ${s.a({0: R(0), 24: R(0), 36: R(360), 100: R(360)}, ORG(210, 70))}><path d="M210 40l3-8 14-14 5 5-14 14z" fill="${INK}"/></g></g>` +
        `<g ${s.a(pop(40), ORG(244, 104))}><circle cx="244" cy="104" r="14" ${sk('#d23c2f', 2.5)}/><text x="244" y="108" font-size="11" font-weight="700" text-anchor="middle" fill="#d23c2f">100</text></g>` +
        chip(s, 150, 140, 96, '完全做好 = 完美', CL.t, 46);
    }},
    powerful: {dur: 6, hl: [10, 40], end: 60, lit: '充满力量的', mean: '强大的；有权势的', draw: s => {
      return GND() + `<g ${s.a(hideAt(18))}>${kid(150, 128, CL.a, {aL: [-14, -34], aR: [14, -34]})}</g><g ${s.a(showAt(18))}>${kid(150, 128, CL.a, {aL: [-16, -62], aR: [16, -62]})}</g>` +
        `<g ${s.a({0: T(), 10: T(), 20: T(0, -28), 24: T(0, -24), 28: T(0, -28), 92: T(0, -28), 100: T()})}><path d="M92 94H208" ${sk(INK, 4)}/><rect x="90" y="78" width="14" height="32" rx="3" fill="#3a3a3a"/><rect x="196" y="78" width="14" height="32" rx="3" fill="#3a3a3a"/><rect x="104" y="84" width="8" height="20" rx="2" fill="#556070"/><rect x="188" y="84" width="8" height="20" rx="2" fill="#556070"/></g>` +
        [[110, 40, 22], [196, 40, 26], [150, 20, 30]].map(([x, y, p]) => `<g ${s.a(pop(p), ORG(x, y))}><path d="M${x + 4} ${y - 10}l-8 12h6l-3 10 9-13h-6l3-9z" fill="#f6d34a" style="stroke:#c9952a;stroke-width:1px"/></g>`).join('') +
        `<g ${s.a(showAt(20, 30))}><path d="M130 128l-10-6M170 128l10-6" ${sk(CL.m, 2)}/></g>` +
        chip(s, 252, 64, 52, '500 kg', CL.k, 8) + chip(s, 252, 30, 64, '充满力量', CL.a, 40);
    }},
    purpose: {dur: 6, hl: [8, 14], end: 60, lit: '摆在前面的目标', mean: '目的；用途', draw: s => {
      const arrow = `<path d="M-26 0H-2" ${sk(INK, 2.5)}/><path d="M0 0l-7-3v6z" fill="${INK}"/><path d="M-26 0l-5-5M-26 0l-5 5" ${sk(CL.a, 2.5)}/>`;
      return GND() + `<g ${s.a(moveIn([[8, 60, 0], [14, 0, 0]]))}><path d="M230 104l-12 24M250 104l12 24" ${sk(WOOD, 3)}/><circle cx="240" cy="76" r="30" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><circle cx="240" cy="76" r="21" fill="#e2473a"/><circle cx="240" cy="76" r="12" fill="#fff"/><circle cx="240" cy="76" r="5" fill="#e2473a"/></g>` +
        chip(s, 240, 30, 48, '目标', CL.a, 14) +
        kid(60, 128, CL.t, {aR: [20, -40], aL: [6, -36]}) + `<path d="M84 64q16 24 0 48" ${sk(WOOD, 3)}/><path d="M84 64L72 88 84 112" ${sk(CL.m, 1)} ${s.a(hideAt(24))}/>` +
        `<g ${s.a(moveIn([[18, 82, 88], [24, 82, 88], [32, 238, 76]]))}>${arrow}</g>` +
        `<g ${s.a(showAt(32, 40))}>${burst(240, 76, 14).replace('<path ', `<path ${sk(CL.g, 2.5)} `)}</g>` +
        chip(s, 140, 22, 92, '瞄准目标 = 目的', CL.t, 40);
    }},
    record: {dur: 6, hl: [30, 8], end: 60, lit: '录下来再听回来', mean: '记录；录音', draw: s => {
      const wave = []; for (let i = 0; i <= 24; i++) wave.push(f1(164 + i * 4.1) + ' ' + f1(72 + (i % 2 ? -1 : 1) * (6 + 10 * Math.abs(Math.sin(i * .9)))));
      return GND() + kid(60, 128, CL.v, {aR: [12, -50], holdR: `<rect x="70" y="72" width="7" height="12" rx="3" fill="${INK}"/><circle cx="73.5" cy="72" r="5" fill="#556070"/>`}) +
        [0, 1].map(i => `<g ${s.a({0: 'opacity:0;' + T(), [8 + i * 8]: 'opacity:0;' + T(), [10 + i * 8]: 'opacity:1;' + T(), [22 + i * 8]: 'opacity:0;' + T(40, -24), 100: 'opacity:0'})}><ellipse cx="90" cy="70" rx="4" ry="3" ${fl(CL.v)}/><path d="M93.5 69v-11q4 2 5 6" ${sk(CL.v, 1.6)}/></g>`).join('') +
        `<rect x="154" y="40" width="118" height="66" rx="6" fill="#26324a"/><path d="M${wave.join('L')}" ${sk('#7cf0b0', 2)} ${DASH} ${s.a(drawP(8, 28))}/>` +
        `<g ${s.a({0: 'opacity:0', 8: 'opacity:0', 9: 'opacity:1', 13: 'opacity:.2', 17: 'opacity:1', 21: 'opacity:.2', 25: 'opacity:1', 28: 'opacity:0', 100: 'opacity:0'})}><circle cx="166" cy="50" r="4" fill="#e2473a"/><text x="174" y="53" font-size="8" font-weight="700" fill="#e2473a">REC</text></g>` +
        `<g ${s.a(showAt(30))}><path d="M162 46v10l8-5z" fill="#7cf0b0"/></g><path d="M164 46V100" ${sk('#fff', 2)} ${s.a({0: 'opacity:0;' + T(), 30: 'opacity:0;' + T(), 31: 'opacity:1;' + T(), 46: 'opacity:1;' + T(98), 48: 'opacity:0;' + T(98), 100: 'opacity:0'})}/>` +
        [0, 1, 2].map(i => `<path d="M${276 + i * 4} ${62 - i * 4}q${4 + i * 2} ${10 + i * 4} 0 ${20 + i * 8}" ${sk('#7cf0b0', 2)} ${s.a(showAt(32 + i * 2, 46))}/>`).join('') +
        chip(s, 90, 24, 84, '录下来 = 记录', CL.v, 46);
    }},
    remote: {dur: 6, hl: [10, 20], end: 60, lit: '移得远远的', mean: '偏远的；远程的', draw: s => {
      const car = `<rect x="-14" y="-9" width="28" height="12" rx="4" fill="#e2473a"/><rect x="-8" y="-14" width="16" height="6" rx="2" fill="#e2473a"/><circle cx="-8" cy="4" r="3.5" fill="${INK}"/><circle cx="8" cy="4" r="3.5" fill="${INK}"/>`;
      return `<rect x="0" y="70" width="300" height="80" fill="#cfe5c8"/><path d="M90 150L236 70h20L210 150z" fill="#c8c0b0"/>` +
        [[236, 62], [252, 60], [268, 63]].map(([x, y]) => `<path d="M${x - 5} ${y + 6}v-6l5-4 5 4v6z" fill="#d9a35b"/>`).join('') +
        kid(50, 128, CL.t, {aR: [16, -36], holdR: `<rect x="62" y="86" width="9" height="12" rx="2" fill="${INK}"/><path d="M68 86v-8" ${sk(INK, 1.5)}/>`}) +
        [0, 1, 2].map(i => `<path d="M74 72q6-6 12 0" ${sk(CL.v, 2)} ${s.a({0: 'opacity:0;' + T(), [12 + i * 6]: 'opacity:0;' + T(), [13 + i * 6]: 'opacity:1;' + T(), [24 + i * 6]: 'opacity:0;' + T(120, -20), 100: 'opacity:0'})}/>`).join('') +
        `<g ${s.a({0: 'opacity:0;' + T(150, 130, 'scale(1)'), 3: 'opacity:1;' + T(150, 130, 'scale(1)'), 10: 'opacity:1;' + T(150, 130, 'scale(1)'), 34: 'opacity:1;' + T(238, 76, 'scale(.25)'), 92: 'opacity:1;' + T(238, 76, 'scale(.25)'), 100: 'opacity:0;' + T(238, 76, 'scale(.25)')})}>${car}</g>` +
        chip(s, 190, 24, 76, '离得远远的', CL.v, 40);
    }},
    repeat: {dur: 6, hl: [8, 20], end: 60, lit: '一再去做', mean: '重复；复述', draw: s => {
      const tc = (x, y, w, t, c, p, q) => `<g ${s.a(showAt(p, q))}><rect x="${x - w / 2}" y="${y - 9}" width="${w}" height="18" rx="5" ${fl(c)}/><text x="${x}" y="${y + 3.5}" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">${t}</text></g>`;
      const st = [170, 212, 254];
      return GND() + kid(60, 128, '#3d4a5c', {k: 1.1, aR: [18, -46]}) +
        tc(60, 32, 48, 'apple', '#3d4a5c', 8, 18) + st.map((x, i) => tc(x, 64, 40, 'apple', CL.t, 18 + i * 2, 30)).join('') +
        tc(60, 32, 54, 'banana', '#3d4a5c', 32, 42) + st.map((x, i) => tc(x, 64, 46, 'banana', CL.a, 42 + i * 2, 54)).join('') +
        st.map((x, i) => kid(x, 128, [CL.t, CL.v, CL.g][i], {k: .7})).join('') +
        `<g ${s.a(pop(24), ORG(212, 28))}><g ${s.a({0: R(0), 100: R(360)}, ORG(212, 28) + ';animation-timing-function:linear', 2)}><path d="M222 28a10 10 0 1 1-4-8" ${sk(CL.v, 3)}/><path d="M214 16l5 4-5 4" ${sk(CL.v, 3)}/></g></g>` +
        chip(s, 150, 140, 84, '跟我读：重复', CL.v, 48);
    }},
    truth: {dur: 6, hl: [20, 40], end: 60, lit: '真实的情况', mean: '真相；事实', draw: s => {
      return GND() + `<path d="M186 124l8-12 6 10zM202 126l10-8 2 10zM176 126l6-4 4 4z" fill="#6db7e8"/><path d="M196 112q-4-10 2-16" ${sk('#3f8f4f', 2)}/><circle cx="198" cy="94" r="4" fill="#e2473a"/>` +
        kid(110, 128, CL.t, {noFace: true, aL: [-6, -24], aR: [24, -60], armR: s.a(showAt(20))}) + `<path d="M118 93L123 107" stroke="${SKIN}" stroke-width="4.6" stroke-linecap="round" ${s.a(hideAt(20))}/>` +
        `<g ${s.a(hideAt(20))}>${face(110, 128, 1, 'sad')}</g><g ${s.a(showAt(20))}>${face(110, 128)}</g>` +
        kid(250, 128, CL.a, {k: 1.1, noFace: true}) + `<g ${s.a(hideAt(34))}>${face(250, 128, 1.1, 'sad')}</g><g ${s.a(showAt(34))}>${face(250, 128, 1.1)}</g>` +
        chip(s, 110, 34, 76, '是我打碎的', CL.t, 20) + `<g ${s.a(pop(36), ORG(226, 44))}>${heartAt(226, 40, .8)}</g>` +
        chip(s, 150, 140, 64, '说实话', CL.a, 44);
    }},
    wealth: {dur: 6, hl: [8, 20], end: 60, lit: '福气攒起来的', mean: '财富；大量', draw: s => {
      const stack = (x, n, p) => `<g ${s.a(growY(p, p + 8), FOOT)}>${[...Array(n)].map((_, j) => `<ellipse cx="${x}" cy="${124 - j * 6}" rx="12" ry="4" fill="#f2c641" style="stroke:#a8741a;stroke-width:1px"/>`).join('')}</g>`;
      const ingot = (x, y) => `<path d="M${x - 14} ${y}q2-8 6-8q4 4 8 0q4 4 8 0q4 0 6 8q-14 6-28 0z" fill="#f6d34a" style="stroke:#c9952a;stroke-width:1.2px"/>`;
      return GND() + `<g ${s.a(pop(8), ORG(70, 46))}><rect x="56" y="32" width="28" height="28" fill="#d23c2f" transform="rotate(45 70 46)"/><text x="70" y="52" font-size="16" font-weight="700" text-anchor="middle" fill="#f6d34a">福</text></g>` +
        stack(150, 6, 20) + stack(178, 9, 24) + stack(206, 12, 28) + stack(234, 8, 32) +
        `<g ${s.a(pop(36), ORG(190, 46))}>${ingot(176, 50)}${ingot(212, 42)}</g>` + `<g ${s.a(pop(40), ORG(260, 40))}>${sparkle(262, 36, 6)}${sparkle(140, 60, 5)}</g>` +
        chip(s, 70, 96, 84, '福气攒成财富', CL.a, 44);
    }},
    addition: {dur: 6, hl: [8, 40], end: 60, lit: '加上去', mean: '增加；加法；此外', draw: s => {
      const apple = (x, y) => `<circle cx="${x}" cy="${y}" r="10" fill="#e2473a"/><path d="M${x} ${y - 10}q2-5 6-5" ${sk('#3f8f4f', 2)}/>`;
      return [30, 54].map((x, i) => `<g ${s.a(pop(4 + i * 2), ORG(x, 66))}>${apple(x, 66)}</g>`).join('') +
        `<text x="86" y="74" font-size="22" font-weight="700" text-anchor="middle" ${fl(CL.a)} ${s.a(pop(8), ORG(86, 66))}>+</text>` +
        [116, 140, 164].map((x, i) => `<g ${s.a(pop(12 + i * 2), ORG(x, 66))}>${apple(x, 66)}</g>`).join('') +
        `<text x="196" y="74" font-size="22" font-weight="700" text-anchor="middle" ${fl(CL.k)} ${s.a(pop(20), ORG(196, 66))}>=</text>` +
        `<text x="244" y="80" font-size="34" font-weight="700" text-anchor="middle" ${fl(CL.t)} ${s.a(pop(28), ORG(244, 68))}>5</text>` +
        `<text x="150" y="118" font-size="14" font-weight="700" text-anchor="middle" ${fl(CL.m)} ${s.a(showAt(34))}>2 + 3 = 5</text>` +
        chip(s, 150, 140, 84, '加起来 = 加法', CL.a, 44);
    }},
    classical: {dur: 6, hl: [8, 40], end: 60, lit: '经典老派的', mean: '古典的；经典的', draw: s => {
      const note = (x, y, c) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="3" ${fl(c)}/><path d="M${x + 3.5} ${y - 1}v-12q4 2 5 6" ${sk(c, 1.6)}/>`;
      return GND() + `<rect x="50" y="98" width="60" height="30" rx="2" fill="${WOOD}"/>` +
        `<ellipse cx="80" cy="94" rx="24" ry="5" fill="#2b2b2b"/><ellipse cx="80" cy="94" rx="16" ry="3.2" ${sk('#888', 1)} stroke-dasharray="6 6" ${s.a({0: 'stroke-dashoffset:0', 100: 'stroke-dashoffset:-24'}, 'animation-timing-function:linear', .8)}/><ellipse cx="80" cy="94" rx="4" ry="1.2" fill="#d23c2f"/>` +
        `<path d="M86 92q6-20 20-34" ${sk('#c9952a', 3)}/><path d="M100 64l26-30q10 18-2 34z" fill="#e8c460" style="stroke:#c9952a;stroke-width:1.5px"/>` +
        [0, 1, 2].map(i => `<g ${s.a({0: 'opacity:0;' + T(), [8 + i * 8]: 'opacity:0;' + T(), [10 + i * 8]: 'opacity:1;' + T(), [26 + i * 8]: 'opacity:0;' + T(30 + i * 10, -30), 100: 'opacity:0'})}>${note(124, 44, [CL.v, CL.a, CL.t][i])}</g>`).join('') +
        `<g ${s.a(pop(30), ORG(222, 64))}><rect x="188" y="24" width="68" height="78" fill="#fff" style="stroke:#c9952a;stroke-width:4px"/><circle cx="222" cy="54" r="10" fill="${SKIN}"/>` +
        `<circle cx="210" cy="50" r="6" fill="#f4f1e6"/><circle cx="234" cy="50" r="6" fill="#f4f1e6"/><circle cx="210" cy="62" r="5" fill="#f4f1e6"/><circle cx="234" cy="62" r="5" fill="#f4f1e6"/><path d="M212 46a10 10 0 0 1 20 0z" fill="#f4f1e6"/><path d="M204 96q0-20 18-20t18 20z" fill="#2f4f43"/></g>` +
        chip(s, 222, 120, 64, '古典音乐', CL.v, 40);
    }},
    comment: {dur: 6, hl: [8, 20], end: 60, lit: '说出心里的想法', mean: '评论；意见', draw: s => {
      const cm = [['好看！', 80, CL.t], ['学到了', 98, CL.v], ['支持一下', 116, CL.a]];
      return `<rect x="70" y="12" width="84" height="128" rx="10" fill="#2b2b2b"/><rect x="76" y="20" width="72" height="112" rx="3" fill="#fff"/>` +
        `<rect x="76" y="20" width="72" height="44" fill="#9fd0ee"/><g ${s.a(hideAt(8))}><path d="M106 34v16l12-8z" fill="#fff"/></g><g ${s.a(showAt(8))}><path d="M90 60l14-18 10 12 8-8 18 14z" fill="#3f8f4f"/><circle cx="132" cy="30" r="5" fill="#f6d34a"/></g>` +
        cm.map(([t, y, c], i) => `<g ${s.a(moveIn([[20 + i * 6, 0, 10], [24 + i * 6, 0, 0]]))}><circle cx="84" cy="${y}" r="5" fill="${c}"/><rect x="92" y="${y - 7}" width="${t.length * 9 + 8}" height="14" rx="4" fill="#eef2f6"/><text x="96" y="${y + 3.5}" font-size="8" font-weight="700" ${fl(CL.k)}>${t}</text></g>`).join('') +
        kid(230, 128, CL.t, {aR: [12, -34], aL: [-12, -34]}) + `<rect x="222" y="88" width="16" height="12" rx="2" fill="${INK}"/>` +
        chip(s, 226, 30, 96, '说出想法 = 评论', CL.v, 44);
    }},
    // ---------- 第三十三批 ----------
    cultivate: {dur: 6, hl: [8, 40], end: 60, lit: '耕地再养大', mean: '培养；耕种', draw: s => {
      const hoe = {0: R(0), 8: R(0), 18: R(0), 100: R(0)}; for (let i = 1; i < 5; i++) hoe[f1(8 + i * 2.5)] = R(i % 2 ? -50 : 0);
      return GND() + `<path d="M120 128q30-8 60 0z" fill="#8b5a3a"/>` +
        kid(80, 128, '#5a7a9a', {aR: [18, -30], armR: s.a(hoe, shoulder(80, 128, 1)), holdR: `<path d="M98 98l14 26" ${sk(WOOD, 3)}/><path d="M108 124l10-2" ${sk('#888', 4)}/>`}) +
        `<circle cx="150" cy="118" r="3" fill="#6b4428" ${s.a(moveIn([[18, 0, -30], [22, 0, 0]]))}/>` +
        `<g ${s.a(growY(24, 40), FOOT)}><path d="M150 122V64" ${sk('#5a8f3a', 4)}/><path d="M150 100q-18-2-22-14q16-2 22 14zM150 88q18-2 22-14q-16-2-22 14z" fill="#3fbf6a"/></g>` +
        `<g ${s.a(pop(40), ORG(150, 58))}>${[0, 72, 144, 216, 288].map(a => `<circle cx="${f1(150 + 7 * Math.cos(a * Math.PI / 180))}" cy="${f1(58 + 7 * Math.sin(a * Math.PI / 180))}" r="5.5" fill="#f2a3b3"/>`).join('')}<circle cx="150" cy="58" r="4" fill="#f6d34a"/></g>` +
        `<g ${s.a({0: R(0), 24: R(0), 27: R(-30), 34: R(-30), 37: R(0), 100: R(0)}, ORG(236, 56))}><path d="M222 46h28v22h-28z" fill="#4a90d0"/><path d="M222 50l-18-6 2 6 16 6" fill="#4a90d0"/></g>` +
        [0, 1, 2].map(i => `<path d="M0 -5q-4 6-4 8a4 4 0 0 0 8 0q0-2-4-8z" fill="#6db7e8" ${s.a({0: 'opacity:0;' + T(198, 52), [27 + i * 2]: 'opacity:0;' + T(198, 52), [28 + i * 2]: 'opacity:1;' + T(198, 52), [34 + i * 2]: 'opacity:1;' + T(160, 110), [35 + i * 2]: 'opacity:0;' + T(160, 110), 100: 'opacity:0'})}/>`).join('') +
        chip(s, 236, 110, 64, '用心培养', CL.t, 44);
    }},
    forward: {dur: 6, hl: [8, 20], end: 60, lit: '朝前的方向', mean: '向前；转发', draw: s => {
      const env = `<rect x="-11" y="-8" width="22" height="16" rx="2" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M-11 -8l11 9 11-9" ${sk(CL.m, 1.5)}/>`;
      const xs = [50, 150, 250], cs = [CL.t, CL.v, CL.a];
      return GND() + xs.map((x, i) => kid(x, 128, cs[i], {k: .8, aR: [14, -30]}) + `<rect x="${x + 6}" y="96" width="10" height="14" rx="2" fill="${INK}"/>`).join('') +
        [[58, 50, 8], [158, 150, 20]].map(([x, y, p]) => `<g ${s.a(showAt(p))}><path d="M${x + 16} 60H${x + 70}" ${sk(CL.a, 2.5)}/><path d="M${x + 64} 54l7 6-7 6" ${sk(CL.a, 2.5)}/></g>`).join('') +
        `<g ${s.a(moveIn([[6, 60, 60], [8, 60, 60], [18, 150, 60], [20, 150, 60], [30, 250, 60]]))}>${env}</g>` +
        chip(s, 100, 30, 48, '转发', CL.a, 10) + chip(s, 200, 30, 48, '再转发', CL.a, 22) + chip(s, 150, 140, 80, '一路往前传', CL.v, 40);
    }},
    independent: {dur: 6, hl: [8, 14, 40], end: 60, lit: '不靠别人的', mean: '独立的；自主的', draw: s => {
      const bike = `<circle cx="-18" cy="0" r="12" ${sk(INK, 2.5)}/><circle cx="18" cy="0" r="12" ${sk(INK, 2.5)}/><path d="M-18 0L-4 -16H12L18 0M-4 -16L2 0M12 -16l-2-8h8" ${sk('#d23c2f', 3)}/>`;
      return GND() + `<g ${s.a(move([[10, 0, 0], [20, 40, 0], [24, 40, 0]]))}>${kid(30, 128, CL.a, {k: 1.1, aR: [24, -36], ...walkLegs(s, 30, 128, 10, 20, 4, 1.1)})}</g>` +
        `<g ${s.a(move([[10, 0, 0], [48, 150, 0]]))}><g transform="translate(70 116)">${bike}</g>${kid(70, 106, CL.t, {k: .8, aR: [12, -24], aL: [-6, -18]})}</g>` +
        `` +
        `` +
        chip(s, 92, 36, 64, '松手了！', CL.a, 20) + chip(s, 220, 30, 96, '不靠别人 = 独立', CL.t, 40);
    }},
    innovation: {dur: 6, hl: [8, 20, 44], end: 60, lit: '引进新东西', mean: '创新；新发明', draw: s => {
      return GND() + `<g ${s.a(hideAt(30))}><rect x="62" y="80" width="16" height="44" rx="2" fill="#f4f1e6" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M70 80v-6" ${sk(INK, 1.5)}/><path d="M70 74q-6-6 0-14q6 8 0 14z" fill="#f29a2e" ${s.a({0: 'transform:scale(1)', 50: 'transform:scale(.85,1.1)', 100: 'transform:scale(1)'}, ORG(70, 74), .5)}/></g>` +
        `<text x="70" y="140" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>老办法</text>` +
        `<g ${s.a(showAt(8))}><path d="M108 90H180" ${sk(CL.a, 3)}/><path d="M174 84l8 6-8 6" ${sk(CL.a, 3)}/></g>` +
        `<path d="M220 124v-14" ${sk(CL.m, 3)}/><g ${s.a(showAt(20))}><circle cx="220" cy="80" r="28" fill="#f6d34a" opacity=".3"/></g>` +
        `<path d="M208 82a12 12 0 1 1 24 0c0 6-4 8-4 13h-16c0-5-4-7-4-13z" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M208 82a12 12 0 1 1 24 0c0 6-4 8-4 13h-16c0-5-4-7-4-13z" ${fl(CL.g)} ${s.a(showAt(20))}/><path d="M213 99h14M214 104h12" ${sk(CL.m, 2)}/>` +
        `<g ${s.a(pop(26), ORG(254, 54))}><path d="M254 40l4 8 9 1-6 6 2 9-9-4-9 4 2-9-6-6 9-1z" fill="#d23c2f"/><text x="254" y="58" font-size="6" font-weight="700" text-anchor="middle" fill="#fff">NEW</text></g>` +
        chip(s, 150, 24, 76, '推陈出新', CL.a, 44);
    }},
    monitor: {dur: 6, hl: [8, 30], end: 60, lit: '时刻盯着', mean: '监控；显示器', draw: s => {
      const scan = {0: R(20), 8: R(20), 20: R(-10), 32: R(20), 44: R(-10), 56: R(20), 100: R(20)};
      return GND() + `<rect x="20" y="20" width="12" height="20" fill="#556070"/>` +
        `<g ${s.a(scan, ORG(32, 30))}><path d="M32 30L190 100L190 128L60 128z" fill="#f6e7a8" opacity=".35"/><rect x="30" y="22" width="30" height="16" rx="3" fill="#2b2b2b"/><circle cx="56" cy="30" r="5" fill="#4a90d0"/></g>` +
        `<g ${s.a(move([[8, 0, 0], [50, 100, 0]]))}>${kid(80, 128, CL.t, {k: .8, ...walkLegs(s, 80, 128, 8, 50, 12, .8)})}</g>` +
        `<rect x="206" y="24" width="84" height="60" rx="4" fill="#2b2b2b"/><rect x="211" y="29" width="74" height="50" fill="#26324a"/><path d="M248 84v12M232 96h32" ${sk('#2b2b2b', 3)}/>` +
        `<g ${s.a(move([[8, 0, 0], [50, 40, 0]]))}><rect x="218" y="48" width="12" height="22" rx="2" ${sk('#7cf0b0', 1.5)}/><circle cx="224" cy="44" r="4" fill="#7cf0b0"/></g>` +
        `<g ${s.a({0: 'opacity:1', 50: 'opacity:.2', 100: 'opacity:1'}, '', 1)}><circle cx="218" cy="35" r="3" fill="#e2473a"/></g>` +
        chip(s, 248, 112, 92, '时刻盯着 = 监控', CL.v, 30);
    }},
    plastic: {dur: 6, hl: [10, 40], end: 60, lit: '能被塑造的', mean: '塑料；可塑的', draw: s => {
      const st = (p, q, art) => `<g ${s.a({0: 'opacity:0;transform:scale(.6)', [p]: 'opacity:0;transform:scale(.6)', [p + 3]: 'opacity:1;transform:scale(1)', [q]: 'opacity:1;transform:scale(1)', [q + 3]: 'opacity:0;transform:scale(.6)', 100: 'opacity:0'}, ORG(150, 96))}>${art}</g>`;
      return GND() + `<rect x="100" y="114" width="100" height="14" rx="3" fill="#c8c0b0"/>` +
        st(0, 10, `<path d="M128 114q-6-20 10-26q14-8 26 2q14 10 6 24z" fill="#6db7e8"/>`) +
        st(12, 22, `<path d="M142 114V78h-4v-6h24v6h-4v36z" fill="#6db7e8" fill-opacity=".85"/><rect x="144" y="66" width="12" height="6" fill="#2f5d8a"/>`) +
        st(24, 34, `<path d="M134 82h32l-4 32h-24z" fill="#f2a3b3"/>`) +
        st(36, 92, `<ellipse cx="150" cy="104" rx="20" ry="11" fill="#f6d34a"/><circle cx="166" cy="88" r="9" fill="#f6d34a"/><path d="M174 88l7 2-7 3z" fill="#f29a2e"/><circle cx="168" cy="86" r="1.5" fill="${INK}"/>`) +
        `<g ${s.a({0: T(), 10: T(), 12: T(0, 14), 14: T(), 22: T(), 24: T(0, 14), 26: T(), 34: T(), 36: T(0, 14), 38: T(), 100: T()})}><rect x="128" y="20" width="44" height="20" rx="3" fill="#556070"/><path d="M150 40v16" ${sk('#556070', 5)}/></g>` +
        chip(s, 238, 60, 92, '能捏成各种形状', CL.v, 40) + chip(s, 238, 88, 64, '塑料制品', CL.t, 44);
    }},
    profit: {dur: 6, hl: [8, 20], end: 60, lit: '做下去赚到的', mean: '利润；获益', draw: s => {
      return GND() + kid(146, 128, CL.t, {k: .85, aL: [-14, -30]}) + `<rect x="40" y="88" width="90" height="40" fill="#f6d34a"/><path d="M36 88h98l-10-18h-78z" fill="#d23c2f"/><text x="85" y="110" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>柠檬水</text>` +
        [0, 1, 2].map(i => `<g ${s.a(moveIn([[10 + i * 5, 180, 50], [14 + i * 5, 150 + i * 8, 64]]))}><circle cx="0" cy="0" r="5" ${fs(CL.g, '#a8741a', 1)}/></g>`).join('') +
        `<path d="M170 128V30" ${sk(CL.m, 2)}/><path d="M170 128H290" ${sk(CL.m, 2)}/>` +
        `<rect x="186" y="58" width="28" height="70" fill="#4a90d0" ${s.a(growY(20, 28), FOOT)}/><text x="200" y="140" font-size="8" font-weight="700" text-anchor="middle" ${fl(CL.m)}>收入</text>` +
        `<rect x="236" y="88" width="28" height="40" fill="#9a948c" ${s.a(growY(24, 32), FOOT)}/><text x="250" y="140" font-size="8" font-weight="700" text-anchor="middle" ${fl(CL.m)}>成本</text>` +
        `<rect x="186" y="58" width="28" height="30" fill="#3fbf6a" ${s.a(showAt(36))}/><path d="M214 88h22" ${sk(CL.m, 1.5)} stroke-dasharray="3 3" ${s.a(showAt(36))}/>` +
        chip(s, 200, 40, 64, '利润 +30', '#3fbf6a', 40);
    }},
    safety: {dur: 6, hl: [20, 40], end: 60, lit: '安全的状态', mean: '安全', draw: s => {
      return GND() + `<path d="M150 0V20h80" ${sk(CL.m, 3)}/><path d="M200 20h40l-4 10h-32z" fill="#556070"/>` +
        kid(120, 128, CL.t, {aR: [16, -30]}) + `<path d="M108 66a12 11 0 0 1 24 0h4v3h-32v-3z" fill="#f6c932" style="stroke:#c9952a;stroke-width:1px"/>` +
        `<g ${s.a({0: 'opacity:0;' + T(0, 0, 'rotate(0deg)'), 8: 'opacity:0;' + T(0, 0, 'rotate(0deg)'), 9: 'opacity:1;' + T(0, 0, 'rotate(0deg)'), 20: 'opacity:1;' + T(-96, 32, 'rotate(40deg)'), 26: 'opacity:1;' + T(-60, 10, 'rotate(120deg)'), 34: 'opacity:1;' + T(-30, 78, 'rotate(200deg)'), 92: 'opacity:1;' + T(-30, 78, 'rotate(200deg)'), 100: 'opacity:0'})}><rect x="208" y="24" width="20" height="12" rx="1" fill="#c8664a"/></g>` +
        `<g ${s.a(showAt(20, 26))}>${burst(120, 56, 12).replace('<path ', `<path ${sk(CL.g, 2.5)} `)}</g>` + chip(s, 160, 46, 36, '叮！', CL.k, 20) +
        `<g ${s.a(pop(36), ORG(62, 60))}><path d="M62 42l16 6v12c0 10-8 16-16 20-8-4-16-10-16-20V48z" fill="#3fbf6a"/><path d="M55 60l5 5 9-10" ${sk('#fff', 3)}/></g>` +
        chip(s, 236, 100, 84, '戴头盔保安全', CL.t, 40);
    }},
    signal: {dur: 6, hl: [8, 40], end: 60, lit: '发出去的标记', mean: '信号；标志着', draw: s => {
      const car = `<rect x="-16" y="-10" width="32" height="13" rx="4" fill="#2f5d8a"/><rect x="-9" y="-16" width="18" height="7" rx="2" fill="#2f5d8a"/><circle cx="-9" cy="4" r="4" fill="${INK}"/><circle cx="9" cy="4" r="4" fill="${INK}"/>`;
      return GND() + `<path d="M200 128V60" ${sk('#3a3a3a', 5)}/><rect x="186" y="18" width="28" height="64" rx="6" fill="#2b2b2b"/>` +
        `<circle cx="200" cy="34" r="8" fill="#5a2a2a"/><circle cx="200" cy="34" r="8" fill="#e2473a" ${s.a(hideAt(20))}/><circle cx="200" cy="50" r="8" fill="#5a4a2a"/><circle cx="200" cy="66" r="8" fill="#2a4a2a"/><circle cx="200" cy="66" r="8" fill="#3fbf6a" ${s.a(showAt(20))}/>` +
        `<path d="M0 128H300" ${sk(CL.m, 2)}/><path d="M150 128v-6" ${sk('#fff', 3)}/>` +
        `<g ${s.a({0: 'opacity:0;' + T(60, 120), 3: 'opacity:1;' + T(60, 120), 24: 'opacity:1;' + T(60, 120), 44: 'opacity:1;' + T(330, 120), 45: 'opacity:0;' + T(330, 120), 100: 'opacity:0'})}>${car}</g>` +
        chip(s, 100, 30, 52, '红灯停', '#e2473a', 8) + chip(s, 100, 54, 52, '绿灯行', '#3fbf6a', 22) + chip(s, 150, 142, 84, '灯光就是信号', CL.v, 40);
    }},
    suffer: {dur: 6, hl: [10, 20], end: 60, lit: '被压在下面承受', mean: '遭受；受苦', draw: s => {
      return `<g ${s.a(showAt(4))}><path d="M110 30a10 10 0 0 1 14-10 13 13 0 0 1 24 4 9 9 0 0 1-2 18h-34a7 7 0 0 1-2-12z" fill="#7a8494"/></g>` +
        [0, 1, 2, 3].map(i => `<path d="M${118 + i * 8} 44l-3 8" ${sk('#6db7e8', 2)} ${s.a({0: T(0, 0), 100: T(-6, 70)}, `animation-delay:${i * .2}s;animation-timing-function:linear`, .8)}/>`).join('') + GND() +
        `<g ${s.a(move([[10, -30, 0], [50, 50, 0]]))}><g ${s.a({0: R(0), 10: R(0), 14: R(16), 92: R(16), 100: R(0)}, ORG(130, 128))}>${kid(130, 128, CL.t, {noFace: true, aR: [10, -44], aL: [-6, -44], ...walkLegs(s, 130, 128, 10, 50, 10)})}${face(130, 128, 1, 'sad')}` +
        `<path d="M90 96q-10-24 12-30q18-2 20 18q2 14-14 18t-18-6z" fill="#9a7a52"/><path d="M98 70q5-5 9 0" ${sk('#6b5232', 2)}/></g></g>` +
        chip(s, 236, 30, 64, '受苦受累', CL.a, 40);
    }},
    toxic: {dur: 6, hl: [8, 30], end: 60, lit: '有毒的', mean: '有毒的；有害的', draw: s => {
      return GND() + `<rect x="50" y="64" width="50" height="64" rx="6" fill="#556070"/><path d="M50 80h50M50 112h50" ${sk('#3a4250', 3)}/>` +
        `<g ${s.a(pop(8), ORG(75, 96))}><circle cx="75" cy="92" r="9" fill="#fff"/><circle cx="71" cy="91" r="2.5" fill="${INK}"/><circle cx="79" cy="91" r="2.5" fill="${INK}"/><path d="M70 102l10 6M80 102l-10 6" ${sk('#fff', 3)}/></g>` +
        `<path d="M100 120q20 0 30 8H100z" fill="#7cd44a" ${s.a(growX(12, 26), 'transform-origin:0% 50%;transform-box:fill-box')}/><path d="M128 128q40-6 80 0z" fill="#7cd44a" ${s.a(growX(20, 34), 'transform-origin:0% 50%;transform-box:fill-box')}/>` +
        `<g ${s.a({0: R(0), 28: R(0), 40: R(-70), 92: R(-70), 100: R(0)}, ORG(190, 126))}><path d="M190 126V90" ${sk('#5a8f3a', 3)}/><circle cx="190" cy="86" r="7" fill="#f2a3b3" ${s.a({0: 'fill:#f2a3b3', 28: 'fill:#f2a3b3', 40: 'fill:#9a948c', 92: 'fill:#9a948c', 100: 'fill:#f2a3b3'})}/></g>` +
        `<g ${s.a(pop(30), ORG(250, 50))}><path d="M250 26l26 46h-52z" fill="#f6d34a" style="stroke:#2b2b2b;stroke-width:2px"/><text x="250" y="66" font-size="20" font-weight="700" text-anchor="middle" fill="#2b2b2b">!</text></g>` +
        chip(s, 150, 26, 76, '有毒！别碰', '#556070', 40);
    }},
    characteristic: {dur: 6, hl: [10, 40], end: 60, lit: '它特有的', mean: '特征；典型的', draw: s => {
      const spots = [[56, 92], [70, 100], [84, 92], [64, 84], [80, 104]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#b5651d"/>`).join('');
      return GND() + `<ellipse cx="72" cy="96" rx="26" ry="13" fill="#f2c641"/>${spots}<path d="M54 106v22M90 106v22" ${sk('#f2c641', 5)}/><path d="M90 90L104 34" ${sk('#f2c641', 8)}/><ellipse cx="110" cy="32" rx="11" ry="6" fill="#f2c641"/><circle cx="112" cy="30" r="1.5" fill="${INK}"/><path d="M104 26v-6M110 25v-6" ${sk('#b5651d', 2)}/>` +
        `<ellipse cx="97" cy="62" rx="12" ry="34" ${sk(CL.a, 2.5)} stroke-dasharray="4 4" transform="rotate(14 97 62)" ${s.a(fadeP(10, 16))}/>` + chip(s, 140, 52, 52, '长脖子', CL.a, 16) +
        `<ellipse cx="224" cy="100" rx="30" ry="14" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/>${[204, 214, 224, 234, 244].map(x => `<path d="M${x} 88q3 12 0 24" ${sk(INK, 3.5)}/>`).join('')}<path d="M206 112v16M242 112v16" ${sk(INK, 4)}/><path d="M252 94q14-14 22-10l-2 12-12 2z" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M258 88l4 8M264 86l2 8" ${sk(INK, 2)}/>` +
        `<rect x="190" y="82" width="68" height="36" rx="10" ${sk(CL.v, 2.5)} stroke-dasharray="4 4" ${s.a(fadeP(24, 30))}/>` + chip(s, 224, 66, 52, '条纹', CL.v, 30) +
        chip(s, 150, 142, 96, '一眼认出的特点', CL.t, 40);
    }},
    // ---------- 第三十四批 ----------
    clearly: {dur: 6, hl: [10, 44], end: 60, lit: '清清楚楚地', mean: '清楚地；显然', draw: s => {
      const word = (dx, dy, o) => `<text x="${210 + dx}" y="${72 + dy}" font-size="26" font-weight="700" text-anchor="middle" fill="#f4f1e6" fill-opacity="${o}">EXAM</text>`;
      return GND() + `<rect x="140" y="30" width="140" height="64" rx="3" ${fs('#2f4f43', WOOD, 4)}/>` +
        `<g ${s.a(hideAt(20))}>${word(-3, 1, .3)}${word(3, -1, .3)}${word(0, 3, .3)}${word(1, -3, .3)}</g><g ${s.a(showAt(20))}>${word(0, 0, 1)}</g>` +
        kid(80, 128, CL.t, {aR: [12, -50]}) +
        `<g ${s.a(moveIn([[10, 30, -30], [20, 0, 0]]))}><circle cx="76" cy="76" r="4.5" ${sk(INK, 1.5)}/><circle cx="85" cy="76" r="4.5" ${sk(INK, 1.5)}/><path d="M80.5 76h0" ${sk(INK, 1.5)}/></g>` +
        `<text x="96" y="56" font-size="14" font-weight="700" ${fl(CL.m)} ${s.a(showAt(4, 16))}>?</text>` +
        chip(s, 80, 30, 84, '看得清清楚楚', CL.t, 44);
    }},
    conclusion: {dur: 6, hl: [8, 24, 44], end: 60, lit: '合上收尾', mean: '结论；结尾', draw: s => {
      return `<path d="M150 30q-40-8-80 0v90q40-8 80 0q40-8 80 0V30q-40-8-80 0z" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><path d="M150 30v90" ${sk(CL.m, 1.5)}/>` +
        [44, 56, 68, 80, 92].map(y => `<path d="M82 ${y}h56" ${sk(CL.m, 1.5, .5)}/>`).join('') +
        `<g ${s.a(showAt(8))}><text x="190" y="52" font-size="12" font-weight="700" text-anchor="middle" fill="#d23c2f">结论</text><path d="M162 66h56M162 78h56M162 90h40" ${sk(CL.k, 2, .7)}/></g>` +
        `<g ${s.a({0: 'transform:scaleX(0)', 24: 'transform:scaleX(0)', 34: 'transform:scaleX(1)', 92: 'transform:scaleX(1)', 100: 'transform:scaleX(0)'}, 'transform-origin:0% 50%;transform-box:fill-box')}><path d="M150 26h82v98h-82z" fill="#b8323a"/><text x="191" y="80" font-size="16" font-weight="700" text-anchor="middle" fill="#f6d34a">完</text></g>` +
        chip(s, 150, 140, 104, '合上书：得出结论', CL.a, 44);
    }},
    context: {dur: 6, hl: [8, 20], end: 60, lit: '一起的文字', mean: '上下文；背景', draw: s => {
      return `<text x="150" y="80" font-size="22" font-weight="700" text-anchor="middle" ${fl(CL.a)}>bank</text>` +
        `<g ${s.a(showAt(4, 18))}>${chip(s, 90, 40, 48, '银行？', CL.m, 4)}${chip(s, 210, 40, 48, '河岸？', CL.m, 6)}</g>` +
        `<text x="120" y="80" font-size="14" font-weight="700" text-anchor="end" ${fl(CL.k)} ${s.a(showAt(8))}>by the river</text><text x="180" y="80" font-size="14" font-weight="700" ${fl(CL.k)} ${s.a(showAt(12))}>.</text>` +
        `<path d="M14 92H286" ${sk(CL.v, 2)} stroke-dasharray="4 4" ${s.a(fadeP(14, 20))}/>` +
        `<g ${s.a(pop(22), ORG(150, 112))}><rect x="122" y="102" width="56" height="20" rx="6" fill="#3fbf6a"/><text x="150" y="116" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">河岸</text></g>` +
        chip(s, 150, 142, 92, '看上下文定意思', CL.v, 40);
    }},
    dangerous: {dur: 6, hl: [10, 40], end: 60, lit: '有危险的', mean: '危险的', draw: s => {
      return `<path d="M0 128H180V150H0z" fill="#c8b48a"/><path d="M180 128l-6 22" ${sk('#9a8462', 2)}/><path d="M0 128H180" ${sk(CL.m, 2)}/>` +
        `<rect x="0" y="0" width="300" height="150" fill="#e2473a" ${s.a({0: 'opacity:0', 26: 'opacity:0', 28: 'opacity:.18', 31: 'opacity:0', 34: 'opacity:.18', 37: 'opacity:0', 100: 'opacity:0'})}/>` +
        `<g ${s.a(move([[6, 0, 0], [24, 76, 0]]))}><g ${s.a({0: R(0), 24: R(0), 27: R(8), 30: R(-6), 33: R(4), 36: R(0), 100: R(0)}, ORG(60, 128))}>${kid(60, 128, CL.t, {noFace: true, aL: [-18, -46], aR: [18, -46], ...walkLegs(s, 60, 128, 6, 24, 6)})}<g ${s.a(hideAt(24))}>${face(60, 128)}</g><g ${s.a(showAt(24))}>${face(60, 128, 1, 'sad')}</g></g></g>` +
        `<g ${s.a(pop(10), ORG(170, 92))}><path d="M170 70l18 30h-36z" fill="#f6d34a" style="stroke:#2b2b2b;stroke-width:2px"/><text x="170" y="96" font-size="14" font-weight="700" text-anchor="middle" fill="#2b2b2b">!</text><path d="M170 100v28" ${sk(WOOD, 3)}/></g>` +
        chip(s, 236, 40, 76, '危险！停下', '#d23c2f', 40);
    }},
    define: {dur: 6, hl: [8, 16], end: 60, lit: '划清界限', mean: '下定义；界定', draw: s => {
      return `<g ${s.a(pop(4), ORG(110, 74))}><circle cx="110" cy="76" r="18" fill="#e2473a"/><path d="M110 58q2-6 8-6" ${sk('#3f8f4f', 2.5)}/></g>` +
        `<g ${s.a(move([[16, 0, 0], [26, 90, 10]]))}><path d="M150 70q14 28 34 4q-12 10-26-8z" fill="#f2d03a"/></g>` +
        `<ellipse cx="120" cy="76" rx="52" ry="40" ${sk(CL.v, 3)} stroke-dasharray="6 5" ${s.a(fadeP(8, 16))}/>` +
        `<g ${s.a(showAt(30))}><text x="186" y="40" font-size="10" font-weight="700" ${fl(CL.v)}>苹果：</text><text x="186" y="56" font-size="9" ${fl(CL.k)}>一种水果</text><text x="186" y="70" font-size="9" ${fl(CL.k)}>圆圆的、红色</text></g>` +
        `<path d="M242 92l12 12M254 92l-12 12" ${sk('#d23c2f', 2.5)} ${s.a(showAt(28))}/>` +
        chip(s, 150, 140, 96, '划清界限 = 下定义', CL.v, 40);
    }},
    divide: {dur: 6, hl: [8, 22], end: 60, lit: '分成几份', mean: '分开；划分；除', draw: s => {
      const q = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      return q.map(([dx, dy], i) => `<g ${s.a({0: T(), 22: T(), 30: T(dx * 12, dy * 10), 92: T(dx * 12, dy * 10), 100: T()})}><path d="M150 76L${150 + dx * 50} 76A50 40 0 0 ${dx * dy > 0 ? 1 : 0} 150 ${76 + dy * 40}z" fill="#f2c641" style="stroke:#d9a35b;stroke-width:3px"/>` +
        `<circle cx="${150 + dx * 22}" cy="${76 + dy * 16}" r="5" fill="#e2473a"/><circle cx="${150 + dx * 34}" cy="${76 + dy * 8}" r="3.5" fill="#3f8f4f"/></g>`).join('') +
        `<path d="M96 76H204" ${sk(INK, 2)} ${DASH} ${s.a(drawP(8, 14))}/><path d="M150 32V120" ${sk(INK, 2)} ${DASH} ${s.a(drawP(14, 20))}/>` +
        `<g ${s.a(moveIn([[8, 70, 76], [14, 230, 76], [15, 150, 30], [20, 150, 124]]))}><path d="M0 0l8-24 4 2-8 24z" fill="#9a948c"/></g>` +
        `<text x="250" y="80" font-size="14" font-weight="700" text-anchor="middle" ${fl(CL.a)} ${s.a(pop(32), ORG(250, 76))}>1 → 4</text>` +
        chip(s, 150, 142, 76, '一分为四', CL.a, 40);
    }},
    gratitude: {dur: 6, hl: [10, 40], end: 60, lit: '感谢的心情', mean: '感激；感谢', draw: s => {
      return GND() + kid(220, 128, '#3d4a5c', {k: 1.1, aL: [-18, -34], noFace: true}) + face(220, 128, 1.1) +
        `<g ${s.a(move([[6, -40, 0], [20, 60, 0]]))}>${kid(80, 128, CL.t, {aR: [22, -36], ...walkLegs(s, 80, 128, 6, 20, 4)})}<g><path d="M102 92l-4 14M106 92v14M110 92l4 14" ${sk('#3f8f4f', 2)}/><circle cx="98" cy="88" r="5" fill="#f2a3b3"/><circle cx="106" cy="85" r="5" fill="#e2473a"/><circle cx="114" cy="88" r="5" fill="#f6d34a"/></g></g>` +
        chip(s, 140, 40, 64, '谢谢您！', CL.t, 22) +
        [0, 1, 2].map(i => `<g ${s.a({0: 'opacity:0;' + T(), [30 + i * 4]: 'opacity:0;' + T(), [32 + i * 4]: 'opacity:1;' + T(), [48 + i * 4]: 'opacity:0;' + T((i - 1) * 16, -36), 100: 'opacity:0'})}>${heartAt(180, 70, .6, [CL.a, '#f2a3b3', CL.v][i])}</g>`).join('') +
        chip(s, 236, 30, 76, '满满的感激', CL.a, 40);
    }},
    handle: {dur: 6, hl: [10, 30], end: 60, lit: '亲手搞定', mean: '处理；应付；把手', draw: s => {
      const twist = {0: R(0), 14: R(0), 30: R(0), 100: R(0)}; for (let i = 1; i < 6; i++) twist[f1(14 + i * 3)] = R(i % 2 ? -35 : 0);
      return `<path d="M20 60H140v16H20zM156 60H280v16H156z" fill="#9a948c"/><rect x="136" y="54" width="24" height="28" rx="3" fill="#7a746c"/>` +
        [0, 1, 2].map(i => `<path d="M148 82q-4 6-4 8a4 4 0 0 0 8 0q0-2-4-8z" fill="#6db7e8" ${s.a({0: 'opacity:0;' + T(), [i * 9]: 'opacity:0;' + T(), [i * 9 + 1]: 'opacity:1;' + T(), [i * 9 + 8]: 'opacity:0;' + T(0, 44), 100: 'opacity:0'})}/>`).join('') +
        `<g ${s.a(moveIn([[8, -40, 40], [14, 0, 0]]))}><g ${s.a(twist, ORG(148, 68))}><path d="M148 68L196 108" ${sk('#556070', 7)}/><path d="M140 60l8 8 8-8" ${sk('#556070', 6)}/><path d="M196 108q12 6 18 0" ${sk(SKIN, 10)}/></g></g>` +
        `<g ${s.a(pop(32), ORG(148, 36))}><circle cx="148" cy="36" r="10" fill="#3fbf6a"/><path d="M143 36l4 4 7-8" ${sk('#fff', 2.5)}/></g>` +
        chip(s, 150, 140, 96, '亲手搞定 = 处理', CL.t, 40);
    }},
    homework: {dur: 6, hl: [8, 20], end: 60, lit: '在家做的功课', mean: '家庭作业', draw: s => {
      return `<g ${s.a(fadeP(4, 10))}><path d="M30 60L150 14 270 60V128H30z" fill="#efe4d2" style="stroke:var(--ink3);stroke-width:2px"/><rect x="200" y="70" width="44" height="34" fill="#26324a"/><circle cx="230" cy="80" r="5" fill="#f6e7a8"/></g>` +
        `<rect x="80" y="96" width="120" height="6" fill="${WOOD}"/><path d="M90 102v26M190 102v26" ${sk(WOOD, 3)}/>` +
        kid(110, 128, CL.t, {aR: [26, -34]}) + `<rect x="126" y="90" width="34" height="6" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/>` +
        `<path d="M170 96v-30l14-8" ${sk(CL.m, 2.5)}/><path d="M180 52l14 8-6 6z" fill="#f6d34a"/><path d="M186 62l-10 30" ${sk('#f6e7a8', 10, .4)} ${s.a(showAt(8))}/>` +
        `<path d="M130 92h4M136 92h4M142 92h4M148 92h4" ${sk(CL.v, 1.5)} ${DASH} ${s.a(drawP(20, 40))}/>` +
        `<rect x="60" y="84" width="16" height="12" fill="${CL.a}"/><rect x="58" y="76" width="18" height="8" fill="${CL.v}"/>` +
        chip(s, 150, 40, 84, '在家做的功课', CL.t, 44);
    }},
    instruction: {dur: 6, hl: [10, 40], end: 60, lit: '指示的内容', mean: '指示；说明', draw: s => {
      const steps = [[30, '①', `<rect x="40" y="70" width="20" height="4" fill="${WOOD}"/>`], [80, '②', `<rect x="90" y="66" width="20" height="4" fill="${WOOD}"/><path d="M92 70v12M108 70v12" ${sk(WOOD, 3)}/>`], [130, '③', `<rect x="140" y="62" width="20" height="4" fill="${WOOD}"/><path d="M142 66v16M158 66v16M142 50v12" ${sk(WOOD, 3)}/>`]];
      return GND() + `<rect x="20" y="30" width="160" height="70" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="100" y="44" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>组装说明书</text>` +
        steps.map(([x, n, art], i) => `<g ${s.a(showAt(10 + i * 8))}><rect x="${x}" y="50" width="40" height="42" rx="2" ${fs(CL.p, CL.m, 1)}/><text x="${x + 6}" y="60" font-size="8" ${fl(CL.a)}>${n}</text>${art}</g>`).join('') +
        `<g ${s.a(moveIn([[14, 40, -20], [20, 0, 0]]))}><rect x="220" y="106" width="36" height="6" fill="${WOOD}"/></g>` +
        `<g ${s.a(moveIn([[22, 40, -20], [28, 0, 0]]))}><path d="M224 112v16M252 112v16" ${sk(WOOD, 4)}/></g>` +
        `<g ${s.a(moveIn([[30, 40, -20], [36, 0, 0]]))}><path d="M224 106V80" ${sk(WOOD, 4)}/><path d="M224 82h10" ${sk(WOOD, 4)}/></g>` +
        `<g ${s.a(pop(40), ORG(270, 70))}><circle cx="270" cy="70" r="8" fill="#3fbf6a"/><path d="M266 70l3 3 5-6" ${sk('#fff', 2)}/></g>` +
        chip(s, 100, 120, 84, '照着说明书做', CL.v, 42);
    }},
    loneliness: {dur: 6, hl: [10, 40], end: 60, lit: '孤独的感觉', mean: '孤独；寂寞', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" ${fl('#1d2440', .22)}/><circle cx="60" cy="30" r="12" fill="#f6e7a8"/><circle cx="66" cy="26" r="10" ${fl('#1d2440', .22)}/>` + GND() +
        `<rect x="70" y="106" width="60" height="6" fill="${WOOD}"/><path d="M76 112v16M124 112v16" ${sk(WOOD, 3)}/>` +
        kid(100, 128, CL.t, {k: .9, noFace: true, aL: [-8, -24], aR: [8, -24]}) + face(100, 128, .9, 'sad') +
        `<g ${s.a(showAt(10))}>${[220, 244, 268].map((x, i) => kid(x, 128, [CL.a, CL.v, CL.g][i], {k: .55, aL: [-8, -40], aR: [8, -40]})).join('')}</g>` +
        `<g ${s.a(showAt(14))}><text x="244" y="70" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>哈哈哈</text></g>` +
        `<path d="M108 84q-2 5 0 8" ${sk('#6db7e8', 2)} ${s.a(showAt(30))}/>` +
        `<g ${s.a({0: 'opacity:0;' + T(), 20: 'opacity:0;' + T(), 26: 'opacity:.8;' + T(), 50: 'opacity:0;' + T(10, -20), 100: 'opacity:0'})}><path d="M118 70q8-10 16-2" ${sk(CL.m, 1.5)}/><text x="138" y="62" font-size="9" ${fl(CL.m)}>……</text></g>` +
        chip(s, 100, 30, 84, '一个人好孤独', CL.v, 40);
    }},
    operate: {dur: 6, hl: [10, 30], end: 60, lit: '让机器干活', mean: '操作；运转', draw: s => {
      const gear = (x, y, r, dir, c) => `<g ${s.a({0: R(0), 100: R(360 * dir)}, ORG(x, y) + ';animation-timing-function:linear', 2)}><circle cx="${x}" cy="${y}" r="${r}" ${sk(c, 7)} stroke-dasharray="5 4"/><circle cx="${x}" cy="${y}" r="${r - 3}" ${fl(c)}/><circle cx="${x}" cy="${y}" r="3" fill="#fff"/></g>`;
      return GND() + `<rect x="150" y="30" width="130" height="98" rx="4" fill="#d8dde3" style="stroke:var(--ink3);stroke-width:2px"/>` +
        `<g ${s.a(showAt(12))}>${gear(190, 70, 18, 1, '#556070')}${gear(226, 86, 13, -1, '#8a96a3')}${gear(256, 62, 11, 1, '#556070')}</g>` +
        `<g ${s.a(hideAt(12))}><circle cx="190" cy="70" r="18" fill="#556070"/><circle cx="226" cy="86" r="13" fill="#8a96a3"/><circle cx="256" cy="62" r="11" fill="#556070"/></g>` +
        `<circle cx="168" cy="44" r="5" fill="#666"/><circle cx="168" cy="44" r="5" fill="#3fbf6a" ${s.a(showAt(12))}/>` +
        `<rect x="100" y="80" width="30" height="48" rx="3" fill="#556070"/><g ${s.a({0: R(-30), 10: R(-30), 12: R(30), 92: R(30), 100: R(-30)}, ORG(115, 92))}><path d="M115 92V70" ${sk(INK, 3)}/><circle cx="115" cy="68" r="5" fill="#d23c2f"/></g>` +
        kid(66, 128, CL.t, {aR: [34, -50]}) + chip(s, 214, 112, 96, '让机器干活 = 操作', CL.t, 30);
    }},
    // ---------- 第三十五批 ----------
    partner: {dur: 6, hl: [10, 30], end: 60, lit: '各占一份的人', mean: '伙伴；合伙人', draw: s => {
      return GND() + `<g ${s.a(move([[18, 0, 0], [30, 42, 0]]))}>${kid(70, 128, CL.t, {aR: [20, -40], ...walkLegs(s, 70, 128, 18, 30, 3)})}<path d="M108 66q-12-14-20 0q0 10 20 24z" fill="#e2473a" ${s.a(pop(10), ORG(98, 76))}/></g>` +
        `<g ${s.a(move([[18, 0, 0], [30, -42, 0]]))}>${kid(230, 128, CL.a, {aL: [-20, -40], ...walkLegs(s, 230, 128, 18, 30, 3)})}<path d="M192 66q12-14 20 0q0 10-20 24z" fill="#e2473a" ${s.a(pop(12), ORG(202, 76))}/></g>` +
        `<g ${s.a(showAt(30, 40))}>${burst(150, 76, 16).replace('<path ', `<path ${sk(CL.g, 2.5)} `)}</g>` +
        chip(s, 150, 30, 96, '各占一份 = 伙伴', CL.a, 40);
    }},
    previous: {dur: 6, hl: [8, 16, 40], end: 60, lit: '之前走过的', mean: '以前的；先前的', draw: s => {
      return GND() + `<g ${s.a(hideAt(10))}>${kid(40, 128, CL.t, {k: .9})}</g><g ${s.a(showAt(30))}><g opacity=".35">${kid(40, 128, CL.t, {k: .9})}</g></g>` +
        [0, 1, 2, 3, 4, 5].map(i => `<ellipse cx="${66 + i * 26}" cy="${i % 2 ? 132 : 138}" rx="5" ry="3" fill="#9a948c" ${s.a(showAt(12 + i * 3))}/>`).join('') +
        `<g ${s.a(move([[10, 0, 0], [30, 200, 0]]))}>${kid(40, 128, CL.t, {k: .9, ...walkLegs(s, 40, 128, 10, 30, 8, .9)})}</g>` +
        `<path d="M220 66Q140 30 60 70" ${sk(CL.v, 2)} stroke-dasharray="4 4" ${s.a(fadeP(32, 38))}/><path d="M66 62l-7 8 10 2" ${sk(CL.v, 2)} ${s.a(showAt(36))}/>` +
        chip(s, 60, 44, 64, '之前的我', CL.m, 34) + chip(s, 160, 22, 96, '之前的 = 以前的', CL.v, 44);
    }},
    satisfaction: {dur: 6, hl: [8, 18, 44], end: 60, lit: '做得足够好', mean: '满意；满足', draw: s => {
      return GND() + kid(60, 128, '#fff', {aR: [20, -36]}) + `<rect x="48" y="44" width="24" height="14" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M50 87h20v24H50z" fill="none" style="stroke:var(--ink3);stroke-width:1.5px"/>` +
        `<path d="M78 92h24" ${sk(INK, 3)}/><path d="M100 90h18q0 8-9 8t-9-8z" fill="#3a3a3a"/>` + `<g ${s.a(showAt(8, 20))}><path d="M104 88q4-10 8 0q4-8 6 0" fill="#f29a2e"/></g>` +
        `<rect x="150" y="100" width="100" height="6" rx="2" fill="${WOOD}"/><path d="M160 106v22M240 106v22" ${sk(WOOD, 3)}/>` +
        `<g ${s.a(moveIn([[20, -80, -6], [28, 0, 0]]))}><ellipse cx="190" cy="96" rx="18" ry="5" fill="#fff" style="stroke:var(--ink3);stroke-width:1.2px"/><path d="M180 94q10-10 20 0z" fill="#f2c641"/></g>` +
        kid(250, 128, CL.v, {noFace: true}) + `<g ${s.a(hideAt(32))}>${face(250, 128)}</g><g ${s.a(showAt(32))}><path d="M244 76q2-3 4 0M252 76q2-3 4 0" ${sk(INK, 1.8)}/><path d="M244 82q6 6 12 0" ${sk(INK, 1.8)}/></g>` +
        [0, 1, 2, 3, 4].map(i => `<g ${s.a(pop(34 + i * 2), ORG(206 + i * 18, 40))}>${star5(206 + i * 18, 40, 7, 3, CL.g)}</g>`).join('') +
        chip(s, 150, 140, 96, '做得够好 = 满意', CL.a, 44);
    }},
    sector: {dur: 6, hl: [10, 40], end: 60, lit: '切出来的一块', mean: '部门；领域', draw: s => {
      const cx = 120, cy = 76, r = 50, parts = [[0, .3, '#8fc98a', '农业'], [.3, .6, '#9fb3c8', '工业'], [.6, 1, '#f2c9a0', '服务业']];
      const pt = (t, rr = r) => [f1(cx + rr * Math.sin(t * 2 * Math.PI)), f1(cy - rr * Math.cos(t * 2 * Math.PI))];
      return parts.map(([a, b, c, t], i) => { const [x0, y0] = pt(a), [x1, y1] = pt(b), m = (a + b) / 2, [dx, dy] = [Math.sin(m * 2 * Math.PI) * 10, -Math.cos(m * 2 * Math.PI) * 10], [lx, ly] = pt(m, 30);
          return `<g ${s.a({0: T(), 20: T(), 28: T(f1(dx), f1(dy)), 92: T(f1(dx), f1(dy)), 100: T()})}><path d="M${cx} ${cy}L${x0} ${y0}A${r} ${r} 0 ${b - a > .5 ? 1 : 0} 1 ${x1} ${y1}z" fill="${c}" style="stroke:#fff;stroke-width:2px"/><text x="${lx}" y="${f1(+ly + 4)}" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>${t}</text></g>`; }).join('') +
        `<path d="M${cx} ${cy}L${pt(0)[0]} ${pt(0)[1]}M${cx} ${cy}L${pt(.3)[0]} ${pt(.3)[1]}M${cx} ${cy}L${pt(.6)[0]} ${pt(.6)[1]}" ${sk(INK, 2)} ${s.a(showAt(10, 22))}/>` +
        `<g ${s.a(pop(32), ORG(240, 40))}><path d="M226 50h28v-14l-8 6v-6l-8 6v-6l-12 8z" fill="#9fb3c8"/><rect x="246" y="26" width="5" height="10" fill="#9fb3c8"/></g>` +
        `<g ${s.a(pop(36), ORG(240, 80))}><path d="M226 92h28V78h-28z" fill="#f2c9a0"/><path d="M224 78h32l-4-6h-24z" fill="#d23c2f"/></g>` +
        `<g ${s.a(pop(40), ORG(240, 116))}><path d="M228 124l12-18 12 18z" fill="#8fc98a"/><path d="M240 106v18" ${sk('#3f8f4f', 2)}/></g>` +
        chip(s, 120, 140, 96, '切成几块 = 部门', CL.v, 44);
    }},
    status: {dur: 6, hl: [10, 40], end: 60, lit: '站着的位置', mean: '地位；状态', draw: s => {
      return GND() + `<rect x="120" y="80" width="60" height="48" fill="#f6d34a"/><rect x="60" y="98" width="60" height="30" fill="#d8dde3"/><rect x="180" y="110" width="60" height="18" fill="#d9a35b"/>` +
        `<text x="150" y="108" font-size="18" font-weight="700" text-anchor="middle" fill="#fff">1</text><text x="90" y="120" font-size="16" font-weight="700" text-anchor="middle" fill="#fff">2</text><text x="210" y="124" font-size="14" font-weight="700" text-anchor="middle" fill="#fff">3</text>` +
        `<g ${s.a(moveIn([[10, 0, -40], [16, 0, 0]]))}>${kid(150, 80, CL.a, {k: .8, aL: [-14, -50], aR: [14, -50]})}</g>` +
        `<g ${s.a(moveIn([[14, 0, -40], [20, 0, 0]]))}>${kid(90, 98, CL.t, {k: .8})}</g>` +
        `<g ${s.a(moveIn([[18, 0, -40], [24, 0, 0]]))}>${kid(210, 110, CL.v, {k: .8})}</g>` +
        `<g ${s.a(pop(30), ORG(150, 20))}><path d="M138 26l4-12 8 8 8-8 4 12z" fill="#f6d34a" style="stroke:#c9952a;stroke-width:1.2px"/></g>` +
        chip(s, 150, 142, 96, '站的位置 = 地位', CL.a, 40);
    }},
    succeed: {dur: 6, hl: [10, 20], end: 60, lit: '接棒走到底', mean: '成功；接替', draw: s => {
      const baton = `<rect x="-3" y="-8" width="6" height="16" rx="2" fill="#f2b632"/>`;
      return `<path d="M0 128H300" ${sk(CL.m, 2)}/><path d="M262 128V68" ${sk(INK, 2)}/><path d="M262 68h22v14h-22z" fill="#2b2b2b"/><path d="M262 68h7v7h-7zM276 68h7v7h-7zM269 75h7v7h-7z" fill="#fff"/>` +
        `<g ${s.a(move([[4, 0, 0], [16, 90, 0], [22, 90, 0]]))}>${kid(40, 128, CL.t, {aR: [18, -34], ...walkLegs(s, 40, 128, 4, 16, 6)})}</g>` +
        `<g ${s.a(move([[22, 0, 0], [44, 110, 0]]))}>${kid(140, 128, CL.a, {aL: [-18, -34], ...walkLegs(s, 140, 128, 22, 44, 8)})}</g>` +
        `<g ${s.a({0: 'opacity:0;' + T(58, 96), 3: 'opacity:1;' + T(58, 96), 4: 'opacity:1;' + T(58, 96), 16: 'opacity:1;' + T(148, 96), 20: 'opacity:1;' + T(122, 96), 22: 'opacity:1;' + T(122, 96), 44: 'opacity:1;' + T(232, 96), 92: 'opacity:1;' + T(232, 96), 100: 'opacity:0;' + T(232, 96)})}>${baton}</g>` +
        chip(s, 130, 60, 48, '接棒！', CL.a, 18) +
        `<g ${s.a(pop(46), ORG(250, 40))}><path d="M240 30h20v8a10 10 0 0 1-20 0z" fill="#f6d34a"/><path d="M247 48h6v6h-6zM242 54h16v4h-16z" fill="#c9952a"/></g>` +
        chip(s, 150, 22, 84, '冲过终点：成功', CL.t, 48);
    }},
    urban: {dur: 6, hl: [8, 40], end: 60, lit: '城市的', mean: '城市的；都市的', draw: s => {
      const bs = [[170, 30, 70], [204, 36, 96], [244, 28, 60], [274, 24, 80]];
      return `<rect x="0" y="0" width="150" height="128" fill="#dff2e0"/><path d="M0 110q40-14 80 0t70 0V128H0z" fill="#9fc3a0"/><path d="M40 128V98" ${sk(WOOD, 4)}/><circle cx="40" cy="90" r="14" fill="#3f8f4f"/><path d="M100 128v-20h20v20z" fill="#d9a35b"/><path d="M96 108l14-10 14 10z" fill="#b8323a"/>` +
        `<g ${s.a(showAt(8))}><rect x="150" y="0" width="150" height="128" fill="#e8ecf2"/></g>` +
        bs.map(([x, w, h], i) => `<g ${s.a(growY(8 + i * 2, 16 + i * 2), FOOT)}><rect x="${x}" y="${128 - h}" width="${w}" height="${h}" fill="${['#8fa3b8', '#7f93a8', '#a6b4c4', '#8fa3b8'][i]}"/>${[0, 1, 2, 3].map(r => `<rect x="${x + 5}" y="${134 - h + r * 14}" width="6" height="7" fill="#f6e7a8"/><rect x="${x + w - 11}" y="${134 - h + r * 14}" width="6" height="7" fill="#f6e7a8"/>`).join('')}</g>`).join('') + GND() +
        `<g ${s.a(move([[20, 0, 0], [36, 120, 0]]))}>${kid(60, 128, CL.t, {k: .8, aR: [12, -22], ...walkLegs(s, 60, 128, 20, 36, 6, .8)})}<rect x="70" y="104" width="14" height="12" rx="2" fill="#d23c2f"/></g>` +
        `<text x="75" y="20" font-size="10" font-weight="700" text-anchor="middle" fill="#3f8f4f">乡村</text><text x="225" y="20" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(showAt(10))}>城市</text>` +
        chip(s, 225, 140, 64, '城市的', CL.v, 40);
    }},
    widely: {dur: 6, hl: [10, 40], end: 60, lit: '宽广地', mean: '广泛地', draw: s => {
      const dots = []; for (let i = 0; i < 24; i++) { const a = i * 2.4, r = 14 + (i * 37) % 86; dots.push([f1(150 + r * 1.3 * Math.cos(a)), f1(76 + r * .55 * Math.sin(a)), r]); }
      return `<ellipse cx="150" cy="76" rx="140" ry="62" fill="#dff2e0"/>` +
        [0, 1, 2].map(i => `<ellipse cx="150" cy="76" rx="140" ry="62" ${sk(CL.v, 2)} ${s.a({0: 'opacity:0;transform:scale(.05)', [10 + i * 8]: 'opacity:0;transform:scale(.05)', [11 + i * 8]: 'opacity:1;transform:scale(.1)', [30 + i * 8]: 'opacity:0;transform:scale(1)', 100: 'opacity:0'}, ORG(150, 76))}/>`).join('') +
        dots.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#9a948c"/><circle cx="${x}" cy="${y}" r="3.5" fill="#e2473a" ${s.a(showAt(f1(12 + r * .28)))}/>`).join('') +
        `<path d="M144 82l6-20 6 20M146 74h8" ${sk(CL.k, 2)}/><circle cx="150" cy="60" r="3" fill="#d23c2f"/>` +
        chip(s, 150, 140, 64, '传得很广', CL.a, 44);
    }},
    willpower: {dur: 6, hl: [10, 30], end: 60, lit: '意志的力量', mean: '毅力；意志力', draw: s => {
      const push = {0: T(), 100: T()}; for (let i = 0; i < 10; i++) { push[8 + i * 5] = T(); push[f1(10.5 + i * 5)] = T(0, 8); } push[58] = T();
      return GND() + `<g ${s.a(push)}><path d="M60 112L150 104" ${sk(CL.t, 12)}/><circle cx="160" cy="100" r="10" fill="${SKIN}"/><path d="M150 96a10 10 0 0 1 18 0z" fill="${HAIR}"/><path d="M60 112l-10 6M70 111v-2" ${sk(INK, 4)}/><path d="M140 106v20M132 106v20" stroke="${SKIN}" stroke-width="4.5" stroke-linecap="round"/>` +
        `<path d="M165 96q-2 5 0 7" ${sk('#6db7e8', 2)}/></g>` +
        ['10', '50', '100'].map((t, i) => `<text x="100" y="60" font-size="16" font-weight="700" text-anchor="middle" ${fl(CL.t)} ${s.a(slot([0, 20, 40, 99], i))}>${t}</text>`).join('') +
        `<g ${s.a(pop(16), ORG(240, 50))}><circle cx="240" cy="54" r="12" fill="#9b7fd0"/><path d="M232 44l-4-8 8 4M248 44l4-8-8 4" fill="#9b7fd0"/><circle cx="236" cy="52" r="1.5" fill="#fff"/><circle cx="244" cy="52" r="1.5" fill="#fff"/></g>` +
        chip(s, 240, 26, 64, '歇会儿吧', '#7a5ab0', 18) + `<path d="M224 64l12 12M236 64l-12 12" ${sk('#d23c2f', 3)} ${s.a(showAt(30))}/>` +
        `<g ${s.a(pop(32), ORG(110, 92))}><path d="M110 104q-10-8-4-18q2 6 6 6q-2-10 6-16q0 10 6 14q4 8-4 14z" fill="#f29a2e"/></g>` +
        chip(s, 150, 140, 96, '咬牙坚持 = 意志力', CL.t, 44);
    }},
    adapt: {dur: 6, hl: [10, 24], end: 60, lit: '让自己变合适', mean: '适应；改编', draw: s => {
      const col = {0: 'fill:#3fbf6a', 14: 'fill:#3fbf6a', 30: 'fill:#9a6a3a', 92: 'fill:#9a6a3a', 100: 'fill:#3fbf6a'};
      return `<rect x="0" y="0" width="140" height="150" fill="#cfe9c8"/><rect x="140" y="0" width="160" height="150" fill="#ead6bc"/>` +
        `<path d="M0 100q40-20 70-10t70 4" fill="#5fb862"/><path d="M140 96H300" ${sk('#8b5a3a', 10)}/>` +
        `<g ${s.a(move([[10, 0, 0], [30, 140, 0]]))}><path d="M60 86q10-14 30-8q12 6 6 14q-14 6-30 2" ${s.a(col)} fill="#3fbf6a"/><circle cx="92" cy="80" r="4" fill="#fff"/><circle cx="93" cy="80" r="2" fill="${INK}"/><path d="M60 90q-10 4-8 12q6 4 10-2" ${sk('#3a3a3a', 0)} ${s.a(col)} fill="#3fbf6a"/><path d="M70 94v6M86 94v6" ${sk(INK, 2)}/></g>` +
        `<text x="70" y="24" font-size="10" font-weight="700" text-anchor="middle" fill="#3f8f4f">绿叶</text><text x="220" y="24" font-size="10" font-weight="700" text-anchor="middle" fill="#8b5a3a">树枝</text>` +
        chip(s, 220, 130, 96, '变得合适 = 适应', CL.t, 40);
    }},
    advertise: {dur: 6, hl: [8, 18, 40], end: 60, lit: '让目光转过来', mean: '做广告；宣传', draw: s => {
      return GND() + `<path d="M60 128V80M120 128V80" ${sk('#556070', 4)}/><rect x="40" y="24" width="100" height="58" rx="3" fill="#d23c2f"/>` +
        `<g ${s.a({0: 'opacity:1', 8: 'opacity:1', 10: 'opacity:.4', 12: 'opacity:1', 14: 'opacity:.4', 16: 'opacity:1', 100: 'opacity:1'})}><text x="90" y="52" font-size="14" font-weight="700" text-anchor="middle" fill="#f6d34a">新品上市</text><text x="90" y="70" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">限时五折</text></g>` +
        [[170, CL.t], [215, CL.v], [260, CL.a]].map(([x, c], i) => `<g ${s.a({0: 'transform:scaleX(1)', [18 + i * 3]: 'transform:scaleX(1)', [21 + i * 3]: 'transform:scaleX(-1)', 92: 'transform:scaleX(-1)', 100: 'transform:scaleX(1)'}, ORG(x, 100))}>${kid(x, 128, c, {k: .8, aR: [14, -24]})}</g><text x="${x}" y="60" font-size="14" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(pop(22 + i * 3), ORG(x, 54))}>!</text>`).join('') +
        chip(s, 215, 30, 108, '让人转过头来看', CL.v, 40);
    }},
    agriculture: {dur: 6, hl: [8, 20], end: 60, lit: '在田里耕种', mean: '农业', draw: s => {
      return `<rect x="0" y="80" width="300" height="70" fill="#c8a06a"/>` + [90, 104, 118, 132].map(y => `<path d="M0 ${y}H300" ${sk('#a8804a', 2)}/>`).join('') +
        `<g ${s.a(move([[8, -80, 0], [30, 330, 0]]))}><rect x="0" y="62" width="34" height="18" rx="3" fill="#d23c2f"/><rect x="16" y="48" width="18" height="16" rx="2" fill="#d23c2f"/><rect x="19" y="51" width="12" height="9" fill="#bfe1f2"/><circle cx="8" cy="82" r="10" fill="${INK}"/><circle cx="30" cy="84" r="7" fill="${INK}"/><path d="M-4 76h-14v8" ${sk('#556070', 3)}/></g>` +
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => { const x = 20 + i * 32; return `<g ${s.a(growY(14 + i * 2, 36 + i), FOOT)}><path d="M${x} 104V64" ${sk('#d9b13a', 2.5)}/><path d="M${x} 64q-5 8 0 16q5-8 0-16z" fill="#e8c041"/><path d="M${x} 80q-10-2-10-10M${x} 88q10-2 10-10" ${sk('#d9b13a', 2)}/></g>`; }).join('') +
        `<circle cx="266" cy="26" r="12" ${fl(CL.g)}/>` + chip(s, 110, 26, 96, '在田里耕种 = 农业', CL.t, 44);
    }},
    // ---------- 第三十六批 ----------
    atmosphere: {dur: 6, hl: [20, 8], end: 60, lit: '裹着地球的一层气', mean: '大气；气氛', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#1d2440" fill-opacity=".85"/>` + [[30, 20], [260, 30], [60, 120], [250, 120], [200, 14]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.5" fill="#fff"/>`).join('') +
        `<circle cx="150" cy="76" r="62" fill="#9fd0ee" fill-opacity=".45" ${s.a({0: 'transform:scale(.7);opacity:0', 20: 'transform:scale(.7);opacity:0', 32: 'transform:scale(1);opacity:1', 92: 'transform:scale(1);opacity:1', 100: 'transform:scale(.7);opacity:0'}, ORG(150, 76))}/>` +
        `<g ${s.a(pop(8), ORG(150, 76))}><circle cx="150" cy="76" r="44" fill="#3f7fd0"/><path d="M122 56q14-10 24 2t-4 22q-14 6-20-6t0-18zM162 90q14-6 22 6q-4 14-18 10t-4-16zM170 46q10 0 12 8-8 4-12-8z" fill="#5fb862"/></g>` +
        `<text x="236" y="40" font-size="10" font-weight="700" fill="#bfe1f2" ${s.a(showAt(32))}>大气层</text><path d="M232 44l-26 14" ${sk('#bfe1f2', 1.5)} ${s.a(showAt(32))}/>` +
        chip(s, 150, 140, 108, '裹着地球的一层气', CL.v, 40);
    }},
    attempt: {dur: 6, hl: [8, 14], end: 60, lit: '朝着它试试', mean: '尝试；企图', draw: s => {
      const jump = {0: T(), 14: T(), 18: T(0, -20), 22: T(), 28: T(), 32: T(0, -26), 36: T(), 42: T(), 46: T(0, -34), 92: T(0, -34), 100: T()};
      return GND() + `<path d="M210 128V40" ${sk(WOOD, 8)}/><path d="M210 50H150" ${sk(WOOD, 4)}/><circle cx="226" cy="36" r="24" fill="#3f8f4f"/>` +
        `<circle cx="160" cy="58" r="8" fill="#e2473a"/><path d="M160 50v-4" ${sk('#3f8f4f', 2)}/>` +
        `<g ${s.a(jump)}>${kid(150, 128, CL.t, {aR: [8, -64], aL: [-6, -20]})}</g>` +
        ['第 1 次', '第 2 次', '第 3 次'].map((t, i) => `<g ${s.a(showAt(14 + i * 14, 26 + i * 14))}><rect x="38" y="22" width="56" height="20" rx="6" ${fl(CL.v)}/><text x="66" y="36" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">${t}</text></g>`).join('') +
        chip(s, 66, 60, 64, '试着去做', CL.t, 8);
    }},
    bacteria: {dur: 6, hl: [8, 40], end: 60, lit: '显微镜下的小杆子', mean: '细菌', draw: s => {
      const rods = [[192, 56, 20], [222, 72, -30], [206, 96, 60], [236, 50, 80], [180, 84, -10], [240, 98, 30]];
      return GND() + `<path d="M50 128h50M74 128V110l-14-40 10-6 16 40" ${sk(CL.m, 5)}/><rect x="56" y="42" width="14" height="30" rx="3" fill="#556070" transform="rotate(-20 63 57)"/><path d="M70 100h30" ${sk(CL.m, 4)}/>` +
        `<path d="M90 60L160 60" ${sk(CL.m, 1.5)} stroke-dasharray="3 4"/><circle cx="212" cy="76" r="52" fill="#e8f6e0" style="stroke:var(--ink3);stroke-width:3px"/>` +
        rods.map(([x, y, a], i) => `<g ${s.a(pop(8 + i * 2), ORG(x, y))}><g transform="rotate(${a} ${x} ${y})"><g ${s.a({0: 'transform:translateX(0)', 50: 'transform:translateX(4px)', 100: 'transform:translateX(0)'}, '', 1 + i * .15)}><rect x="${x - 10}" y="${y - 4}" width="20" height="8" rx="4" fill="#7cd44a" style="stroke:#3f8f4f;stroke-width:1.2px"/><path d="M${x + 10} ${y}q4 2 6 0" ${sk('#3f8f4f', 1)}/></g></g></g>`).join('') +
        chip(s, 150, 140, 120, '显微镜下的小杆子 = 细菌', CL.t, 40);
    }},
    beautiful: {dur: 6, hl: [10, 40], end: 60, lit: '充满美的', mean: '美丽的；极好的', draw: s => {
      const fl2 = (x, c, p) => `<g ${s.a(pop(p), ORG(x, 104))}><path d="M${x} 128v-20" ${sk('#3f8f4f', 2)}/>${[0, 72, 144, 216, 288].map(a => `<circle cx="${f1(x + 5 * Math.cos(a * Math.PI / 180))}" cy="${f1(104 + 5 * Math.sin(a * Math.PI / 180))}" r="4" fill="${c}"/>`).join('')}<circle cx="${x}" cy="104" r="3" fill="#f6d34a"/></g>`;
      return `<rect x="0" y="0" width="300" height="150" fill="#b8b8b8" ${s.a({0: 'opacity:1', 10: 'opacity:1', 24: 'opacity:0', 92: 'opacity:0', 100: 'opacity:1'})}/>` +
        `<g ${s.a(showAt(14))}><path d="M40 128a110 80 0 0 1 220 0" ${sk('#e2473a', 5)}/><path d="M48 128a102 72 0 0 1 204 0" ${sk('#f6d34a', 5)}/><path d="M56 128a94 64 0 0 1 188 0" ${sk('#3fbf6a', 5)}/><path d="M64 128a86 56 0 0 1 172 0" ${sk('#4a90d0', 5)}/></g>` +
        GND() + [[30, '#e2473a', 20], [70, '#f2a3b3', 23], [110, '#9b7fd0', 26], [190, '#f6d34a', 29], [230, '#e2473a', 32], [270, '#f2a3b3', 35]].map(([x, c, p]) => fl2(x, c, p)).join('') +
        `<g ${s.a({0: T(30, 60), 30: T(30, 60), 50: T(150, 40), 70: T(260, 60), 100: T(30, 60)})}><path d="M0 0q-8-8-10 0q2 6 10 0q8-8 10 0q-2 6-10 0z" fill="#9b7fd0"/></g>` +
        kid(150, 128, CL.t, {aL: [-14, -50], aR: [14, -50]}) + `<g ${s.a(pop(40), ORG(150, 40))}>${sparkle(120, 40, 6)}${sparkle(180, 36, 5)}</g>` +
        chip(s, 150, 22, 52, '美极了', CL.a, 40);
    }},
    drawing: {dur: 6, hl: [10, 40], end: 60, lit: '画出来的东西', mean: '图画；绘画', draw: s => {
      const st = (d, c, p0, p1) => `<path d="${d}" ${sk(c, 3)} ${DASH} ${s.a(drawP(p0, p1))}/>`;
      return GND() + `<path d="M160 128L176 30M240 128L224 30M180 100h40" ${sk(WOOD, 3)}/><rect x="160" y="26" width="80" height="62" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/>` +
        st('M176 76V58l16-12 16 12v18z', '#d23c2f', 10, 18) + st('M188 76v-10h8v10', WOOD, 18, 22) + st('M168 80H232', '#3f8f4f', 22, 26) + `<circle cx="222" cy="40" r="6" ${sk(CL.g, 3)} ${DASH} ${s.a(drawP(26, 32))}/>` +
        `<rect x="156" y="22" width="88" height="70" ${sk('#c9952a', 4)} ${s.a(showAt(40))}/>` +
        kid(110, 128, CL.v, {aR: [26, -44], holdR: `<path d="M136 84l14-14" ${sk(WOOD, 2)}/><path d="M150 70l4-4" ${sk('#d23c2f', 3)}/>`}) +
        `<ellipse cx="80" cy="112" rx="16" ry="8" fill="#f4e6c8"/><circle cx="74" cy="110" r="3" fill="#d23c2f"/><circle cx="82" cy="108" r="3" fill="#4a90d0"/><circle cx="88" cy="112" r="3" fill="#f6d34a"/>` +
        chip(s, 200, 110, 96, '画出来的 = 图画', CL.v, 40);
    }},
    express: {dur: 6, hl: [20, 10], end: 60, lit: '把心里话挤出来', mean: '表达；快递', draw: s => {
      return GND() + kid(70, 128, CL.t, {aR: [16, -40], aL: [-6, -40]}) +
        `<g ${s.a(pop(6), ORG(70, 92))}>${heartAt(70, 90, .9, '#e2473a')}</g>` +
        `<g ${s.a({0: 'transform:scale(1,1)', 10: 'transform:scale(1,1)', 16: 'transform:scale(.6,1)', 20: 'transform:scale(.6,1)', 24: 'transform:scale(1,1)', 100: 'transform:scale(1,1)'}, ORG(70, 92))}><path d="M58 92h24" ${sk(SKIN, 4)} ${s.a(showAt(10, 22))}/></g>` +
        `<path d="M86 74q20-10 40-6" ${sk(CL.a, 2.5)} ${DASH} ${s.a(drawP(20, 26))}/>` +
        chip(s, 180, 64, 96, '谢谢你一直陪我', CL.a, 26) + `<g ${s.a(pop(32), ORG(240, 40))}>${heartAt(240, 36, .6, '#f2a3b3')}</g>` +
        chip(s, 150, 140, 104, '挤出心里话 = 表达', CL.v, 40);
    }},
    famous: {dur: 6, hl: [10, 40], end: 60, lit: '名声在外的', mean: '著名的', draw: s => {
      const mini = (x, y, k = 1) => `<circle cx="${x}" cy="${y}" r="${7 * k}" fill="${SKIN}"/><path d="M${x - 7 * k} ${y}a${7 * k} ${7 * k} 0 0 1 ${14 * k} 0q-4-3-7-2t-7 2z" fill="${HAIR}"/><path d="M${x - 9 * k} ${y + 16 * k}q0-8 9-8t9 8z" fill="var(--teal)"/>`;
      return `<g ${s.a(pop(10), ORG(70, 70))}><rect x="30" y="30" width="80" height="84" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="70" y="46" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>今日头条</text><rect x="40" y="54" width="60" height="34" fill="#eef2f6"/>${mini(70, 68)}<path d="M40 96h60M40 104h44" ${sk(CL.m, 2, .6)}/></g>` +
        `<g ${s.a(pop(18), ORG(170, 56))}><rect x="136" y="30" width="68" height="48" rx="4" fill="#2b2b2b"/><rect x="141" y="35" width="58" height="38" fill="#eef2f6"/>${mini(170, 50)}</g>` +
        `<g ${s.a(pop(26), ORG(250, 70))}><rect x="230" y="34" width="40" height="70" rx="6" fill="#2b2b2b"/><rect x="234" y="42" width="32" height="52" fill="#eef2f6"/>${mini(250, 60, .8)}</g>` +
        `<text x="170" y="98" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.a)} ${s.a(showAt(30))}>小明</text>` +
        chip(s, 150, 136, 104, '到处都是他的名字', CL.a, 40);
    }},
    finance: {dur: 6, hl: [8, 40], end: 60, lit: '把账结清', mean: '财政；金融；资金', draw: s => {
      const rows = [['收入', '+500', '#3fbf6a'], ['房租', '-300', '#e2473a'], ['饭钱', '-200', '#e2473a']];
      return `<rect x="40" y="16" width="150" height="118" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="115" y="32" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.k)}>账本</text>` +
        rows.map(([a, b, c], i) => `<g ${s.a(showAt(8 + i * 8))}><text x="54" y="${54 + i * 18}" font-size="10" ${fl(CL.k)}>${a}</text><text x="176" y="${54 + i * 18}" font-size="10" font-weight="700" text-anchor="end" fill="${c}">${b}</text></g>`).join('') +
        `<path d="M52 106H178" ${sk(CL.k, 1.5)} ${s.a(showAt(32))}/><g ${s.a(showAt(34))}><text x="54" y="122" font-size="10" font-weight="700" ${fl(CL.k)}>结余</text><text x="176" y="122" font-size="11" font-weight="700" text-anchor="end" ${fl(CL.v)}>0</text></g>` +
        `<rect x="214" y="40" width="56" height="74" rx="5" fill="#556070"/><rect x="220" y="46" width="44" height="16" fill="#cfe8c8"/>${[0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${222 + c * 14}" y="${68 + r * 14}" width="10" height="10" rx="2" fill="#d8dde3"/>`).join('')).join('')}` +
        `<g ${s.a(pop(40), ORG(242, 28))}><rect x="210" y="18" width="64" height="20" rx="6" fill="#3fbf6a"/><text x="242" y="32" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">账结清了</text></g>`;
    }},
    intervention: {dur: 6, hl: [20, 12, 40], end: 60, lit: '插进中间来', mean: '干预；介入', draw: s => {
      const shove = {0: T(), 4: T(), 7: T(6, 0), 10: T(), 13: T(6, 0), 16: T(), 100: T()}, shove2 = {0: T(), 4: T(), 7: T(-6, 0), 10: T(), 13: T(-6, 0), 16: T(), 100: T()};
      return GND() + `<g ${s.a({0: T(), 20: T(), 28: T(-24, 0), 92: T(-24, 0), 100: T()})}><g ${s.a(shove)}>${kid(120, 128, CL.t, {aR: [22, -36]})}</g></g>` +
        `<g ${s.a({0: T(), 20: T(), 28: T(24, 0), 92: T(24, 0), 100: T()})}><g ${s.a(shove2)}>${kid(180, 128, CL.a, {aL: [-22, -36]})}</g></g>` +
        `<g ${s.a(showAt(4, 18))}>${burst(150, 80, 12).replace('<path ', `<path ${sk(CL.g, 2.5)} `)}</g>` +
        `<g ${s.a(moveIn([[12, 0, -80], [20, 0, 0]]))}>${kid(150, 128, '#3d4a5c', {k: 1.1, aL: [-26, -40], aR: [26, -40]})}</g>` +
        chip(s, 150, 22, 64, '别吵了！', '#3d4a5c', 22) + chip(s, 150, 140, 96, '插到中间 = 干预', CL.v, 40);
    }},
    livestock: {dur: 6, hl: [10, 40], end: 60, lit: '活的家产', mean: '牲畜；家畜', draw: s => {
      const cow = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="16" ry="9" fill="#fff" style="stroke:var(--ink3);stroke-width:1.2px"/><circle cx="${x - 4}" cy="${y - 2}" r="4" fill="${INK}"/><circle cx="${x - 18}" cy="${y - 6}" r="6" fill="#fff" style="stroke:var(--ink3);stroke-width:1.2px"/><path d="M${x - 10} ${y + 8}v8M${x + 10} ${y + 8}v8" ${sk(INK, 2.5)}/>`;
      const sheep = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="8" fill="#f4f1e6" style="stroke:#c8c0b0;stroke-width:1.5px"/><circle cx="${x - 12}" cy="${y - 4}" r="4" fill="${INK}"/><path d="M${x - 6} ${y + 7}v7M${x + 6} ${y + 7}v7" ${sk(INK, 2)}/>`;
      const pig = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="8" fill="#f2a3b3"/><circle cx="${x - 12}" cy="${y}" r="3" fill="#e27a93"/><path d="M${x - 6} ${y + 7}v6M${x + 6} ${y + 7}v6" ${sk('#e27a93', 2.5)}/>`;
      return `<rect x="0" y="0" width="300" height="150" fill="#dff2e0"/>` + GND() + `<path d="M10 100H200M10 116H200" ${sk(WOOD, 3)}/>${[10, 50, 90, 130, 170, 200].map(x => `<path d="M${x} 92v36" ${sk(WOOD, 4)}/>`).join('')}` +
        [[40, 82, cow], [86, 80, cow], [130, 100, sheep], [160, 96, sheep], [60, 116, pig], [170, 118, pig]].map(([x, y, f], i) => `<g ${s.a(pop(10 + i * 3), ORG(x, y))}>${f(x, y)}</g>`).join('') +
        `<g ${s.a(pop(36), ORG(254, 60))}><rect x="214" y="28" width="80" height="66" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><text x="254" y="44" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>家产清单</text><text x="222" y="62" font-size="9" ${fl(CL.k)}>牛 × 2</text><text x="222" y="76" font-size="9" ${fl(CL.k)}>羊 × 2</text><text x="222" y="90" font-size="9" ${fl(CL.k)}>猪 × 2</text></g>` +
        chip(s, 254, 116, 84, '活的家产', CL.t, 40);
    }},
    object: {dur: 6, hl: [8, 16], end: 60, lit: '冲对面扔东西', mean: '反对；物体', draw: s => {
      return GND() + `<rect x="200" y="24" width="84" height="54" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="242" y="48" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.k)}>周末加课</text><path d="M224 78v50M260 78v50" ${sk(WOOD, 3)}/>` +
        [[60, CL.t, 16], [110, CL.v, 22]].map(([x, c, p]) => kid(x, 128, c, {aR: [16, -56]}) + `<g ${s.a(moveIn([[p, x + 16, 70], [p + 4, 160, 40], [p + 8, 230, 54]]))}><circle cx="0" cy="0" r="5" fill="#f4f1e6" style="stroke:var(--ink3);stroke-width:1px"/></g>`).join('') +
        `<path d="M216 34l52 34M268 34l-52 34" ${sk('#d23c2f', 4)} ${s.a(showAt(32))}/>` +
        chip(s, 84, 30, 52, '反对！', '#d23c2f', 10) + chip(s, 150, 140, 96, '扔过去 = 反对', CL.v, 40);
    }},
    oppose: {dur: 6, hl: [8, 16], end: 60, lit: '放到对立面', mean: '反对', draw: s => {
      return GND() + `<path d="M150 40V128" ${sk(CL.m, 2)} stroke-dasharray="5 5"/>` +
        `<rect x="44" y="24" width="64" height="22" rx="6" fill="#3fbf6a"/><text x="76" y="39" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">赞成</text><rect x="192" y="24" width="64" height="22" rx="6" fill="#e2473a"/><text x="224" y="39" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">反对</text>` +
        [50, 82, 114].map((x, i) => kid(x, 128, [CL.t, CL.v, CL.g][i], {k: .75})).join('') +
        `<g ${s.a({0: 'opacity:0;' + T(-60), 3: 'opacity:1;' + T(-60), 8: 'opacity:1;' + T(-60), 16: 'opacity:1;' + T(0), 28: 'opacity:1;' + T(144, 0), 92: 'opacity:1;' + T(144, 0), 100: 'opacity:0;' + T(144, 0)})}>${kid(80, 128, CL.a, {k: .85, aL: [6, -30], aR: [-6, -30], ...walkLegs(s, 80, 128, 8, 28, 6, .85)})}</g>` +
        chip(s, 224, 64, 72, '我站对面', CL.a, 30) + chip(s, 150, 140, 96, '站到对立面 = 反对', CL.v, 40);
    }},
    // ---------- 第三十七批 ----------
    original: {dur: 6, hl: [10, 40], end: 60, lit: '最初的', mean: '原来的；独创的', draw: s => {
      const pic = (x, y, o) => `<g opacity="${o}"><rect x="${x - 26}" y="${y - 20}" width="52" height="40" fill="#bfe1f2"/><circle cx="${x + 12}" cy="${y - 8}" r="5" fill="#f6d34a"/><path d="M${x - 26} ${y + 20}l18-22 14 14 10-8 14 16z" fill="#3f8f4f"/></g>`;
      return `<g ${s.a(pop(6), ORG(150, 70))}>${pic(150, 70, 1)}<rect x="122" y="48" width="56" height="44" ${sk('#c9952a', 5)}/></g>` +
        [[56, 46, 14], [244, 46, 18], [56, 106, 22], [244, 106, 26]].map(([x, y, p]) => `<g ${s.a(pop(p), ORG(x, y))}>${pic(x, y, .4)}<rect x="${x - 26}" y="${y - 20}" width="52" height="40" ${sk(CL.m, 1.5, .5)}/><text x="${x}" y="${y + 4}" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>复印</text></g>`).join('') +
        `<g ${s.a(pop(34), ORG(178, 96))}><circle cx="178" cy="96" r="13" ${sk('#d23c2f', 2.5)}/><text x="178" y="100" font-size="10" font-weight="700" text-anchor="middle" fill="#d23c2f">原作</text></g>` +
        chip(s, 150, 132, 84, '最初的那一份', CL.a, 40);
    }},
    prioritize: {dur: 6, hl: [10, 24], end: 60, lit: '按优先级排', mean: '优先考虑；排序', draw: s => {
      const items = [['看电影', 0, 1], ['整理房间', 1, 2], ['复习考试', 2, 0]];
      return `<rect x="60" y="14" width="180" height="120" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="150" y="32" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.k)}>今天要做</text>` +
        items.map(([t, from, to]) => { const y0 = 54 + from * 26, y1 = 54 + to * 26, hot = to === 0;
          return `<g ${s.a({0: T(), 14: T(), 24: T(0, y1 - y0), 92: T(0, y1 - y0), 100: T()})}><rect x="76" y="${y0 - 12}" width="148" height="22" rx="5" fill="${hot ? '#ffe6e1' : '#eef2f6'}"/><text x="108" y="${y0 + 3}" font-size="10" font-weight="700" ${fl(CL.k)}>${t}</text>${hot ? `<g ${s.a(pop(10), ORG(90, y0 - 1))}>${star5(90, y0 - 1, 7, 3, '#d23c2f')}</g>` : `<circle cx="90" cy="${y0 - 1}" r="4" ${fl(CL.m, .5)}/>`}</g>`; }).join('') +
        [0, 1, 2].map(i => `<text x="232" y="${57 + i * 26}" font-size="9" font-weight="700" text-anchor="end" ${fl(CL.v)} ${s.a(showAt(26))}>${i + 1}</text>`).join('') +
        chip(s, 150, 142, 84, '要紧的先做', CL.a, 40);
    }},
    revolution: {dur: 6, hl: [8, 14, 40], end: 60, lit: '整个翻转过来', mean: '革命；彻底变革', draw: s => {
      return GND() + `<path d="M150 128V106" ${sk(CL.m, 4)}/>` +
        `<g ${s.a({0: 'transform:scaleX(1)', 14: 'transform:scaleX(1)', 20: 'transform:scaleX(0)', 92: 'transform:scaleX(0)', 100: 'transform:scaleX(1)'}, ORG(150, 66))}><circle cx="150" cy="66" r="40" fill="#9a948c"/><text x="150" y="76" font-size="28" font-weight="700" text-anchor="middle" fill="#fff">旧</text></g>` +
        `<g ${s.a({0: 'transform:scaleX(0)', 20: 'transform:scaleX(0)', 26: 'transform:scaleX(1)', 92: 'transform:scaleX(1)', 100: 'transform:scaleX(0)'}, ORG(150, 66))}><circle cx="150" cy="66" r="40" fill="#d23c2f"/><text x="150" y="76" font-size="28" font-weight="700" text-anchor="middle" fill="#f6d34a">新</text></g>` +
        `<g ${s.a(showAt(8, 20))}><path d="M98 40a60 60 0 0 1 104 0" ${sk(CL.a, 3)}/><path d="M196 30l6 10-12 2" ${sk(CL.a, 3)}/></g>` +
        `<g ${s.a(showAt(26, 36))}>${burst(150, 66, 50).replace('<path ', `<path ${sk(CL.g, 3)} `)}</g>` +
        chip(s, 150, 142, 108, '整个翻转过来 = 革命', CL.a, 40);
    }},
    structure: {dur: 6, hl: [8, 40], end: 60, lit: '搭起来的架子', mean: '结构；建筑物', draw: s => {
      const beams = []; for (let r = 0; r < 4; r++) { const y = 128 - r * 24; beams.push(`M90 ${y}V${y - 24}M150 ${y}V${y - 24}M210 ${y}V${y - 24}M90 ${y - 24}H210M90 ${y}L150 ${y - 24}M150 ${y}L210 ${y - 24}`); }
      return GND() + beams.map((d, r) => `<path d="${d}" ${sk('#d23c2f', 3)} ${DASH} ${s.a(drawP(8 + r * 7, 15 + r * 7))}/>`).join('') +
        `<g ${s.a(moveIn([[30, 70, -40], [36, 0, 0]]))}><path d="M240 32V12h-40" ${sk('#f2b632', 4)}/><path d="M200 12v14" ${sk(INK, 1.5)}/><rect x="190" y="26" width="20" height="6" fill="#d23c2f"/></g>` +
        `<rect x="92" y="34" width="116" height="94" fill="#bfe1f2" fill-opacity=".35" ${s.a(fadeP(40, 46))}/>` +
        chip(s, 150, 142, 104, '搭起来的架子 = 结构', CL.a, 44);
    }},
    valuable: {dur: 6, hl: [10, 40], end: 60, lit: '有价值的', mean: '宝贵的；贵重物品', draw: s => {
      return GND() + `<rect x="120" y="90" width="60" height="38" fill="#6b4428"/><rect x="116" y="40" width="68" height="52" fill="#dff2ff" fill-opacity=".5" style="stroke:#9fb3c8;stroke-width:2px"/>` +
        `<g ${s.a(pop(8), ORG(150, 70))}><path d="M136 64l6-8h16l6 8-14 16z" fill="#6db7e8"/><path d="M136 64h28M142 56l8 24M158 56l-8 24" ${sk('#fff', 1, .7)}/></g>` +
        [0, 1, 2].map(i => `<path d="M60 ${60 + i * 12}H116M184 ${60 + i * 12}H240" ${sk('#e2473a', 1.5)} ${s.a({0: 'opacity:0', 14: 'opacity:0', 16: 'opacity:1', 50: 'opacity:.4', 92: 'opacity:1', 100: 'opacity:0'})}/>`).join('') +
        `<g ${s.a(pop(22), ORG(230, 30))}><path d="M206 20h48l6 10-6 10h-48z" fill="#f6d34a" style="stroke:#c9952a;stroke-width:1.5px"/><text x="230" y="34" font-size="10" font-weight="700" text-anchor="middle" fill="#d23c2f">¥100万</text></g>` +
        `<g ${s.a(pop(30), ORG(150, 50))}>${sparkle(128, 46, 5)}${sparkle(172, 50, 4)}</g>` +
        chip(s, 70, 30, 84, '很值钱 = 宝贵', CL.a, 40);
    }},
    accident: {dur: 6, hl: [8, 14, 40], end: 60, lit: '突然砸下来的', mean: '事故；意外', draw: s => {
      return GND() + `<rect x="180" y="10" width="90" height="118" ${fl(CL.m, .25)}/><rect x="196" y="24" width="30" height="24" fill="#bfe1f2"/><path d="M192 48h38" ${sk(CL.m, 3)}/>` +
        `<g ${s.a({0: 'opacity:1;' + T(0, 0, 'rotate(0deg)'), 8: 'opacity:1;' + T(0, 0, 'rotate(0deg)'), 10: 'opacity:1;' + T(-4, 0, 'rotate(-20deg)'), 20: 'opacity:1;' + T(-40, 70, 'rotate(-90deg)'), 21: 'opacity:0;' + T(-40, 72, 'rotate(-90deg)'), 96: 'opacity:0', 100: 'opacity:1;' + T(0, 0, 'rotate(0deg)')}, ORG(211, 40))}><path d="M202 48l2-12h14l2 12z" fill="#c8664a"/><path d="M211 36q-6-8 0-12q6 4 0 12z" fill="#3fbf6a"/></g>` +
        `<g ${s.a(showAt(20))}><path d="M160 126l6-8 6 8zM174 127l8-6 2 6zM150 127l4-4 4 4z" fill="#c8664a"/><path d="M166 122q-4-6 2-8" ${sk('#3fbf6a', 2)}/></g>` +
        `<g ${s.a(showAt(20, 28))}>${burst(170, 120, 14).replace('<path ', `<path ${sk(CL.g, 2.5)} `)}</g>` +
        `<g ${s.a({0: T(), 20: T(), 23: T(-10, -14), 26: T(-14, 0), 92: T(-14, 0), 100: T()})}>${kid(120, 128, CL.t, {noFace: true, aL: [-16, -50], aR: [16, -50]})}<g ${s.a(hideAt(20))}>${face(120, 128)}</g><g ${s.a(showAt(20))}>${face(120, 128, 1, 'sad')}</g></g>` +
        chip(s, 80, 30, 84, '突然发生 = 事故', CL.a, 40);
    }},
    advocate: {dur: 6, hl: [8, 14, 40], end: 60, lit: '为它大声疾呼', mean: '提倡；拥护者', draw: s => {
      return GND() + `<rect x="30" y="100" width="80" height="28" fill="${WOOD}"/>` + kid(70, 100, CL.a, {aR: [16, -40]}) + `<path d="M86 60l18-8v22l-18-8z" fill="#f2b632"/>` +
        `<g ${s.a(pop(6), ORG(70, 30))}><path d="M30 14h80v22H30z" fill="#3fbf6a"/><text x="70" y="29" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">多运动！</text></g>` +
        [0, 1, 2].map(i => `<path d="M${112 + i * 10} 54q8 10 0 20" ${sk(CL.a, 2.5)} ${s.a({0: 'opacity:.15', 30: 'opacity:1', 60: 'opacity:.15', 100: 'opacity:.15'}, `animation-delay:${i * .2}s`, 1)}/>`).join('') +
        [180, 216, 252].map((x, i) => `<g ${s.a({0: R(0), [20 + i * 3]: R(0), [23 + i * 3]: R(8), [26 + i * 3]: R(0), [29 + i * 3]: R(8), [32 + i * 3]: R(0), 100: R(0)}, FOOT)}>${kid(x, 128, [CL.t, CL.v, CL.g][i], {k: .8})}</g>`).join('') +
        chip(s, 216, 40, 64, '大声提倡', CL.a, 40);
    }},
    appreciate: {dur: 6, hl: [8, 18, 40], end: 60, lit: '看出它的价值', mean: '欣赏；感激', draw: s => {
      return GND() + `<rect x="150" y="20" width="110" height="80" fill="#fff" style="stroke:#c9952a;stroke-width:6px"/><circle cx="230" cy="42" r="8" fill="#f6d34a"/><path d="M156 94l30-36 22 22 16-14 30 28z" fill="#3f8f4f"/><path d="M156 94h98" ${sk('#6db7e8', 6, .7)}/>` +
        `<g ${s.a(pop(18), ORG(205, 20))}>${sparkle(160, 18, 6)}${sparkle(252, 14, 5)}${sparkle(206, 10, 4)}</g>` +
        kid(80, 128, CL.v, {noFace: true, aR: [10, -44]}) + `<g ${s.a(hideAt(22))}>${face(80, 128)}</g><g ${s.a(showAt(22))}>${heartAt(76, 74, .28, '#e2473a')}${heartAt(84, 74, .28, '#e2473a')}<path d="M76 81q4 4 8 0" ${sk(INK, 1.6)}/></g>` +
        `<path d="M96 70L150 60" ${sk(CL.v, 2)} stroke-dasharray="3 4" ${s.a(fadeP(8, 14))}/>` +
        chip(s, 200, 124, 96, '看出价值 = 欣赏', CL.v, 40);
    }},
    assume: {dur: 6, hl: [8, 18], end: 60, lit: '拿来就当真', mean: '假定；承担', draw: s => {
      const dog = `<ellipse cx="226" cy="114" rx="16" ry="9" fill="#c98a4a"/><circle cx="210" cy="104" r="8" fill="#c98a4a"/><path d="M205 98l-3 8 5-2z" fill="#8b5a3a"/><circle cx="208" cy="103" r="1.5" fill="${INK}"/><path d="M218 122v6M234 122v6" ${sk('#c98a4a', 4)}/>`;
      return GND() + `<path d="M120 128v-26h30v26z" fill="#bfe1f2" fill-opacity=".7" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M118 102h34" ${sk(CL.m, 3)}/>` +
        `<g ${s.a(hideAt(6))}><circle cx="130" cy="118" r="4" fill="#d9a35b"/><circle cx="140" cy="120" r="4" fill="#d9a35b"/></g>` + dog +
        `<path d="M272 128v-14l6-8 6 8v14z" fill="#9a948c" ${s.a(showAt(40))}/><text x="294" y="98" font-size="8" text-anchor="end" ${fl(CL.m)} ${s.a(showAt(40))}>其实是猫</text>` +
        kid(70, 128, CL.t, {aR: [24, -40]}) + `<g ${s.a(pop(18), ORG(80, 40))}>${bubble(80, 40)}<circle cx="78" cy="40" r="5" fill="#c98a4a"/><path d="M84 36l4-3" ${sk(INK, 1.5)}/></g>` +
        chip(s, 160, 40, 72, '一定是狗吃的', '#d23c2f', 22) + chip(s, 210, 66, 52, '没证据', CL.m, 30) +
        chip(s, 150, 142, 108, '不加证明就当真 = 假定', CL.v, 44);
    }},
    combine: {dur: 6, hl: [8, 20], end: 60, lit: '两个合成一个', mean: '结合；联合', draw: s => {
      return `<g ${s.a({0: T(), 8: T(), 20: T(50, 0), 92: T(50, 0), 100: T()})}><circle cx="100" cy="72" r="26" fill="#4a90d0" ${s.a(hideAt(20))}/></g>` +
        `<g ${s.a({0: T(), 8: T(), 20: T(-50, 0), 92: T(-50, 0), 100: T()})}><circle cx="200" cy="72" r="26" fill="#f6d34a" ${s.a(hideAt(20))}/></g>` +
        `<circle cx="150" cy="72" r="34" fill="#3fbf6a" ${s.a(pop(19), ORG(150, 72))}/>` +
        `<text x="100" y="124" font-size="11" font-weight="700" text-anchor="middle" fill="#4a90d0" ${s.a(hideAt(18))}>蓝</text><text x="200" y="124" font-size="11" font-weight="700" text-anchor="middle" fill="#c9952a" ${s.a(hideAt(18))}>黄</text>` +
        `<text x="150" y="124" font-size="12" font-weight="700" text-anchor="middle" fill="#3f8f4f" ${s.a(showAt(24))}>蓝 + 黄 = 绿</text>` +
        chip(s, 150, 142, 84, '两个合成一个', CL.t, 40);
    }},
    countryside: {dur: 6, hl: [8, 30], end: 60, lit: '乡村那一带', mean: '乡村；农村', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#e6f4e0"/><path d="M0 100q60-20 120 0t180-6V150H0z" fill="#9fc3a0"/><path d="M0 128q80-14 160 0t140 0" ${sk('#6db7e8', 10)}/>` +
        `<path d="M60 100v-30h40v30z" fill="#f4e6c8"/><path d="M54 70l26-18 26 18z" fill="#b8323a"/><rect x="74" y="82" width="12" height="18" fill="${WOOD}"/>` +
        `<path d="M220 100V50" ${sk('#9a948c', 4)}/><g ${s.a({0: R(0), 100: R(360)}, ORG(220, 50) + ';animation-timing-function:linear', 3)}><path d="M220 50l0-24 6 0zM220 50l24 0 0 6zM220 50l0 24-6 0zM220 50l-24 0 0-6z" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/></g>` +
        [[150, 104, 8], [168, 108, 12]].map(([x, y, p]) => `<g ${s.a(pop(p), ORG(x, y))}><g ${s.a({0: R(0), 50: R(20), 100: R(0)}, ORG(x, y + 6), .8)}><ellipse cx="${x}" cy="${y}" rx="7" ry="6" fill="#fff" style="stroke:#c8c0b0;stroke-width:1px"/><path d="M${x - 7} ${y - 2}l-3 1 3 1" fill="#f2b632"/><path d="M${x - 1} ${y - 6}l2-3 2 3" fill="#e2473a"/></g></g>`).join('') +
        `<circle cx="40" cy="26" r="11" ${fl(CL.g)}/>` + chip(s, 150, 22, 64, '乡下的地方', CL.t, 30);
    }},
    detail: {dur: 6, hl: [8, 18], end: 60, lit: '切成小块细看', mean: '细节；详述', draw: s => {
      const grid = []; for (let i = 1; i < 4; i++) grid.push(`M${30 + i * 30} 30V120M30 ${30 + i * 22.5}H150`);
      return `<rect x="30" y="30" width="120" height="90" fill="#dff2e0" style="stroke:var(--ink3);stroke-width:2px"/><path d="M40 110q30-40 60-20t40-30" ${sk('#6db7e8', 4)}/><rect x="96" y="54" width="12" height="10" fill="#d9a35b"/>` +
        `<path d="${grid.join('')}" ${sk(CL.m, 1.5)} stroke-dasharray="3 3" ${s.a(fadeP(8, 14))}/>` +
        `<rect x="90" y="52.5" width="30" height="22.5" ${sk('#d23c2f', 2.5)} ${s.a(showAt(18))}/>` +
        `<path d="M120 52L180 26M120 75L180 124" ${sk('#d23c2f', 1.5)} stroke-dasharray="3 3" ${s.a(showAt(22))}/>` +
        `<g ${s.a(pop(24), ORG(230, 76))}><rect x="180" y="26" width="100" height="98" fill="#dff2e0" style="stroke:#d23c2f;stroke-width:2.5px"/><path d="M200 104V64h40v40z" fill="#f4e6c8"/><path d="M194 64l26-18 26 18z" fill="#b8323a"/><rect x="214" y="80" width="12" height="24" fill="${WOOD}"/><rect x="204" y="70" width="8" height="8" fill="#bfe1f2"/><rect x="230" y="70" width="8" height="8" fill="#bfe1f2"/><circle cx="262" cy="90" r="6" fill="#3f8f4f"/><path d="M262 96v8" ${sk(WOOD, 2)}/></g>` +
        chip(s, 150, 142, 108, '看清每个小地方 = 细节', CL.v, 40);
    }},
    // ---------- 第三十八批 ----------
    direct: {dur: 6, hl: [8, 16], end: 60, lit: '笔直的', mean: '直接的；直率的', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#dff2e0"/><path d="M40 110C40 40 100 140 140 70S220 20 260 60" ${sk('#c8c0b0', 10)}/>` +
        `<circle cx="40" cy="110" r="8" ${fl(CL.t)}/><text x="40" y="134" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.t)}>家</text><circle cx="260" cy="60" r="8" ${fl(CL.a)}/><text x="260" y="40" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.a)}>学校</text>` +
        `<path d="M48 106L252 64" ${sk(CL.a, 3)} stroke-dasharray="6 5" ${s.a(fadeP(8, 14))}/>` +
        `<g ${s.a(moveIn([[16, 40, 110], [40, 256, 62]]))}><circle cx="0" cy="-4" r="5" fill="${SKIN}"/><rect x="-4" y="1" width="8" height="9" rx="3" ${fl(CL.v)}/></g>` +
        chip(s, 150, 22, 96, '笔直过去 = 直接', CL.a, 40);
    }},
    embrace: {dur: 6, hl: [10, 20], end: 60, lit: '揽入双臂里', mean: '拥抱；欣然接受', draw: s => {
      return GND() + `<g ${s.a(move([[6, -40, 0], [16, 0, 0]]))}>${kid(130, 128, CL.t, {aR: [20, -36], ...walkLegs(s, 130, 128, 6, 16, 3)})}</g>` +
        `<g ${s.a(move([[6, 40, 0], [16, 0, 0]]))}>${kid(170, 128, CL.a, {aL: [-20, -36], ...walkLegs(s, 170, 128, 6, 16, 3)})}</g>` +
        `<path d="M138 94q12 10 24 0" ${sk(SKIN, 4.6)} ${s.a(showAt(20))}/><path d="M162 98q-12 10-24 0" ${sk(SKIN, 4.6)} ${s.a(showAt(22))}/>` +
        [0, 1, 2].map(i => `<g ${s.a({0: 'opacity:0;' + T(), [26 + i * 4]: 'opacity:0;' + T(), [28 + i * 4]: 'opacity:1;' + T(), [44 + i * 4]: 'opacity:0;' + T((i - 1) * 20, -40), 100: 'opacity:0'})}>${heartAt(150, 56, .6, [CL.a, '#f2a3b3', CL.v][i])}</g>`).join('') +
        chip(s, 150, 22, 96, '揽入怀中 = 拥抱', CL.a, 40);
    }},
    expensive: {dur: 6, hl: [10, 30], end: 60, lit: '费用高的', mean: '昂贵的', draw: s => {
      return GND() + `<path d="M184 52l8-6h16l8 6 6 12-10 4v30h-28v-30l-10-4z" fill="#6db7e8"/><path d="M216 54l20-14" ${sk(CL.m, 1.5)}/>` +
        `<g ${s.a(pop(10), ORG(250, 36))}><path d="M226 26h44l6 10-6 10h-44z" fill="#f6d34a" style="stroke:#c9952a;stroke-width:1.5px"/><text x="250" y="40" font-size="10" font-weight="700" text-anchor="middle" fill="#d23c2f">¥99999</text></g>` +
        kid(100, 128, CL.t, {noFace: true, aR: [16, -40]}) + `<g ${s.a(hideAt(20))}>${face(100, 128)}</g><g ${s.a(showAt(20))}><circle cx="96" cy="76" r="3.5" fill="#fff" style="stroke:${INK};stroke-width:1.2px"/><circle cx="104" cy="76" r="3.5" fill="#fff" style="stroke:${INK};stroke-width:1.2px"/><circle cx="96" cy="76" r="1.5" fill="${INK}"/><circle cx="104" cy="76" r="1.5" fill="${INK}"/><ellipse cx="100" cy="84" rx="3" ry="4" fill="${INK}"/></g>` +
        `<g ${s.a(showAt(30))}><rect x="112" y="98" width="20" height="14" rx="3" fill="#8b5a3a"/><path d="M114 104h16" ${sk('#6b4428', 1.5)}/><path d="M122 96q-4-6 2-10M126 96q4-6-2-10" ${sk(CL.m, 1.2)}/></g>` +
        chip(s, 100, 34, 52, '太贵了', '#d23c2f', 22);
    }},
    frequently: {dur: 6, hl: [10, 44], end: 60, lit: '经常地', mean: '经常地；频繁地', draw: s => {
      const skip = new Set([3, 11, 17, 26]);
      return `<rect x="40" y="14" width="160" height="124" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><rect x="40" y="14" width="160" height="18" rx="4" fill="#d23c2f"/><text x="120" y="27" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">健身打卡 · 11 月</text>` +
        [...Array(28)].map((_, i) => { const x = 54 + (i % 7) * 22, y = 44 + Math.floor(i / 7) * 22; return `<rect x="${x - 8}" y="${y - 8}" width="16" height="16" rx="2" ${fl(CL.m, .12)}/>` + (skip.has(i) ? '' : `<g ${s.a(pop(f1(8 + i * 1.2)), ORG(x, y))}><circle cx="${x}" cy="${y}" r="6" fill="#3fbf6a"/><path d="M${x - 3} ${y}l2 2 4-4" ${sk('#fff', 1.5)}/></g>`); }).join('') +
        `<g ${s.a(pop(44), ORG(250, 60))}><text x="250" y="56" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.k)}>本月</text><text x="250" y="80" font-size="22" font-weight="700" text-anchor="middle" fill="#3fbf6a">24 次</text></g>` +
        chip(s, 250, 110, 52, '经常去', CL.t, 46);
    }},
    hospital: {dur: 6, hl: [10, 30], end: 60, lit: '接待客人的地方', mean: '医院', draw: s => {
      const amb = `<rect x="-26" y="-20" width="52" height="24" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M-6 -8h12M0 -14v12" ${sk('#e2473a', 3)}/><rect x="14" y="-16" width="10" height="8" fill="#bfe1f2"/><circle cx="-14" cy="6" r="5" fill="${INK}"/><circle cx="14" cy="6" r="5" fill="${INK}"/><rect x="-6" y="-24" width="12" height="4" fill="#4a90d0"/>`;
      return GND() + `<rect x="150" y="30" width="130" height="98" fill="#f4f1e6" style="stroke:var(--ink3);stroke-width:2px"/><rect x="200" y="94" width="30" height="34" fill="#bfe1f2"/>${[0, 1].map(r => [0, 1, 2].map(c => `<rect x="${162 + c * 40}" y="${44 + r * 24}" width="18" height="14" fill="#bfe1f2"/>`).join('')).join('')}` +
        `<g ${s.a(pop(10), ORG(215, 18))}><rect x="205" y="8" width="20" height="20" rx="3" fill="#fff" style="stroke:#e2473a;stroke-width:2px"/><path d="M215 12v12M209 18h12" ${sk('#e2473a', 3.5)}/></g>` +
        `<g ${s.a({0: 'opacity:0;' + T(-30, 120), 3: 'opacity:1;' + T(-30, 120), 10: 'opacity:1;' + T(-30, 120), 30: 'opacity:1;' + T(110, 120), 92: 'opacity:1;' + T(110, 120), 100: 'opacity:0;' + T(110, 120)})}>${amb}<g ${s.a({0: 'opacity:1', 50: 'opacity:.2', 100: 'opacity:1'}, '', .5)}><rect x="-6" y="-24" width="12" height="4" fill="#e2473a"/></g></g>` +
        chip(s, 70, 30, 96, '照顾病人的地方', CL.a, 40);
    }},
    improvement: {dur: 6, hl: [10, 44], end: 60, lit: '变好的过程', mean: '改进；改善', draw: s => {
      return `<path d="M120 20v108h160" ${sk(CL.m, 2)}/>` + [['一月', 60, 10], ['三月', 75, 18], ['五月', 90, 26]].map(([t, v, p], i) => `<rect x="${140 + i * 46}" y="${128 - v}" width="30" height="${v}" ${fl(CL.t)} ${s.a(growY(p, p + 6), FOOT)}/><text x="${155 + i * 46}" y="${124 - v}" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)} ${s.a(showAt(p + 6))}>${v}</text><text x="${155 + i * 46}" y="140" font-size="8" text-anchor="middle" ${fl(CL.m)}>${t}</text>`).join('') +
        `<path d="M146 66L240 30" ${sk(CL.a, 3)} ${DASH} ${s.a(drawP(34, 42))}/><path d="M230 26l11 3-6 10" ${sk(CL.a, 3)} ${s.a(showAt(41))}/>` +
        GND(8, 116) + kid(60, 128, CL.v, {noFace: true, aR: [14, -56]}) + `<g ${s.a(hideAt(36))}>${face(60, 128)}</g><g ${s.a(showAt(36))}><path d="M54 76q2-3 4 0M62 76q2-3 4 0" ${sk(INK, 1.8)}/><path d="M54 82q6 7 12 0" ${sk(INK, 1.8)}/></g>` +
        chip(s, 60, 30, 92, '越来越好 = 改进', CL.a, 44);
    }},
    initiative: {dur: 6, hl: [10, 40], end: 60, lit: '首先发起的', mean: '主动性；倡议', draw: s => {
      return GND() + [60, 100, 200, 240].map((x, i) => kid(x, 128, [CL.t, CL.v, CL.g, '#8b7a6a'][i], {k: .8})).join('') +
        `<path d="M110 128q40-8 80 0" fill="#9a948c" fill-opacity=".5"/>` +
        `<g ${s.a(move([[10, 0, 0], [18, 0, -10], [22, 0, 0]]))}>${kid(150, 128, CL.a, {aR: [16, -60]})}</g>` + chip(s, 150, 34, 56, '我先来！', CL.a, 12) +
        `<g ${s.a(showAt(24))}><path d="M140 124q10-4 20 0" ${sk('#4a90d0', 3)}/></g>` +
        [[60, 30], [100, 34], [200, 38], [240, 42]].map(([x, p]) => `<g ${s.a(pop(p), ORG(x, 52))}><text x="${x}" y="58" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.t)}>我也来</text></g>`).join('') +
        chip(s, 150, 142, 64, '主动带头', CL.v, 44);
    }},
    maybe: {dur: 6, hl: [10, 20], end: 60, lit: '可能是', mean: '也许；大概', draw: s => {
      return GND() + `<g ${s.a({0: 'opacity:1', 10: 'opacity:1', 14: 'opacity:.2', 18: 'opacity:1', 22: 'opacity:.2', 26: 'opacity:1', 100: 'opacity:1'})}><circle cx="190" cy="40" r="14" ${fl(CL.g)}/></g>` +
        `<g ${s.a({0: T(), 10: T(), 18: T(-18, 0), 26: T(0, 0), 34: T(-18, 0), 42: T(), 100: T()})}><path d="M196 52a10 10 0 0 1 14-10 13 13 0 0 1 24 4 9 9 0 0 1-2 18h-34a7 7 0 0 1-2-12z" fill="#9aa4b4"/></g>` +
        kid(100, 128, CL.t, {aR: [16, -40]}) + `<path d="M116 88V58" ${sk(INK, 2)}/><path d="M96 60q20-16 40 0z" fill="#4a90d0" ${s.a({0: 'transform:scale(.2,1)', 20: 'transform:scale(.2,1)', 26: 'transform:scale(.55,1)', 92: 'transform:scale(.55,1)', 100: 'transform:scale(.2,1)'}, ORG(116, 58))}/>` +
        `<g ${s.a(pop(20), ORG(240, 96))}><rect x="214" y="84" width="52" height="24" rx="5" fill="#26324a"/><text x="240" y="100" font-size="11" font-weight="700" text-anchor="middle" fill="#7cf0b0">降雨 50%</text></g>` +
        chip(s, 92, 30, 84, '也许会下雨吧', CL.v, 30);
    }},
    network: {dur: 6, hl: [8, 20], end: 60, lit: '织成的网', mean: '网络；关系网', draw: s => {
      const cx = 150, cy = 72, spokes = [...Array(8)].map((_, i) => i * Math.PI / 4);
      const sp = []; for (let i = 0; i <= 40; i++) { const a = i * Math.PI / 4 * .5 * 2, r = 8 + i * 1.15; sp.push(f1(cx + r * Math.cos(a)) + ' ' + f1(cy + r * .85 * Math.sin(a))); }
      return spokes.map((a, i) => `<path d="M${cx} ${cy}L${f1(cx + 62 * Math.cos(a))} ${f1(cy + 53 * Math.sin(a))}" ${sk(CL.m, 1.5)} ${DASH} ${s.a(drawP(8 + i, 12 + i))}/>`).join('') +
        `<path d="M${sp.join('L')}" ${sk(CL.m, 1.5)} ${DASH} ${s.a(drawP(20, 44))}/>` +
        `<g ${s.a(moveIn([[6, 150, 10], [12, 150, 72], [20, 150, 72], [44, 196, 90]]))}><circle cx="0" cy="0" r="6" fill="${INK}"/><circle cx="0" cy="-7" r="4" fill="${INK}"/><path d="M-5 -2l-8-5M-5 1l-9 1M-5 4l-8 6M5 -2l8-5M5 1l9 1M5 4l8 6" ${sk(INK, 1.5)}/></g>` +
        `<path d="M150 0V10" ${sk(CL.m, 1)} ${s.a(showAt(6))}/>` +
        chip(s, 150, 140, 64, '织成一张网', CL.v, 44);
    }},
    outcome: {dur: 6, hl: [30, 22], end: 60, lit: '最后出来的东西', mean: '结果；成果', draw: s => {
      return GND() + `<rect x="80" y="40" width="110" height="88" rx="6" fill="#556070"/><rect x="92" y="60" width="86" height="56" rx="4" fill="#3a3a3a"/><rect x="92" y="60" width="86" height="56" rx="4" fill="#f29a2e" fill-opacity=".4" ${s.a(showAt(6, 24))}/>` +
        `<circle cx="100" cy="50" r="4" fill="#d8dde3"/><circle cx="114" cy="50" r="4" fill="#d8dde3"/>` + ['3:00', '1:00', '0:00'].map((t, i) => `<text x="166" y="54" font-size="9" font-weight="700" text-anchor="middle" fill="#7cf0b0" ${s.a(slot([0, 10, 20, 99], i))}>${t}</text>`).join('') +
        `<g ${s.a({0: 'transform:scaleY(1)', 22: 'transform:scaleY(1)', 26: 'transform:scaleY(.1)', 92: 'transform:scaleY(.1)', 100: 'transform:scaleY(1)'}, 'transform-origin:50% 100%;transform-box:fill-box')}><rect x="92" y="60" width="86" height="56" rx="4" fill="#8a96a3" fill-opacity=".8"/><path d="M104 66h62" ${sk('#d8dde3', 3)}/></g>` +
        `<g ${s.a({0: 'opacity:0;' + T(), 24: 'opacity:0;' + T(), 25: 'opacity:1;' + T(), 32: 'opacity:1;' + T(90, 4), 92: 'opacity:1;' + T(90, 4), 100: 'opacity:0'})}><rect x="116" y="86" width="40" height="22" rx="3" fill="#f2c9a0"/><path d="M116 92q20-12 40 0z" fill="#fff"/><circle cx="136" cy="82" r="4" fill="#e2473a"/></g>` +
        `<g ${s.a(pop(34), ORG(226, 60))}>${sparkle(212, 66, 5)}${sparkle(244, 60, 6)}</g>` +
        chip(s, 236, 30, 100, '最后出来的 = 结果', CL.a, 40);
    }},
    pollution: {dur: 6, hl: [10, 40], end: 60, lit: '弄脏了的状态', mean: '污染', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" ${fl('#8a8a8a', .25)} ${s.a(fadeP(10, 30))}/><rect x="0" y="96" width="300" height="54" fill="#6db7e8" ${s.a({0: 'fill:#6db7e8', 10: 'fill:#6db7e8', 34: 'fill:#7a8a5a', 92: 'fill:#7a8a5a', 100: 'fill:#6db7e8'})}/>` +
        `<path d="M0 96h300" ${sk('#4a90d0', 2)}/><path d="M20 96V40h40v56M60 96V60h30v36" fill="#9a948c"/><rect x="66" y="96" width="10" height="20" fill="#6b5e50"/>` +
        `<path d="M76 116q30 6 60 2" ${sk('#3a3a3a', 6, .7)} ${s.a(growX(14, 30), 'transform-origin:0% 50%;transform-box:fill-box')}/>` +
        [[150, 110, 18, `<path d="M-8 -6h14l-2 12h-10z" fill="#e2473a"/>`], [200, 120, 24, `<rect x="-6" y="-4" width="12" height="8" rx="2" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/>`], [250, 112, 30, `<path d="M-4 -8h8v14h-8z" fill="#6db7e8" fill-opacity=".7" style="stroke:#2f5d8a;stroke-width:1px"/>`]].map(([x, y, p, art]) => `<g ${s.a(moveIn([[p, x + 30, y], [p + 20, x, y]]))}>${art}</g>`).join('') +
        `<g ${s.a({0: R(0), 30: R(0), 40: R(180), 92: R(180), 100: R(0)}, ORG(120, 130))}><path d="M110 130q10-8 20 0q-10 8-20 0zM130 130l6-4v8z" fill="#f29a2e"/></g>` +
        chip(s, 200, 40, 76, '河水被污染', '#556070', 40);
    }},
    remain: {dur: 6, hl: [10, 30], end: 60, lit: '留在后面的', mean: '保持；剩下', draw: s => {
      return GND() + `<rect x="100" y="96" width="100" height="6" rx="2" fill="${WOOD}"/><path d="M110 102v26M190 102v26" ${sk(WOOD, 3)}/><path d="M140 96l10-14 10 14z" fill="#f2c9a0"/><path d="M140 96l10-14 10 14" ${sk('#f2a3b3', 2)}/>` +
        [[40, CL.t, 10], [240, CL.v, 16], [212, CL.g, 22]].map(([x, c, p]) => `<g ${s.a(move([[p, 0, 0], [p + 12, x < 150 ? -120 : 120, 0]]))}>${kid(x, 128, c, {k: .8, ...walkLegs(s, x, 128, p, p + 12, 4, .8)})}</g>`).join('') +
        kid(80, 128, CL.a, {k: .9}) +
        `<text x="40" y="56" font-size="9" font-weight="700" ${fl(CL.m)} ${s.a(showAt(10, 22))}>拜拜～</text>` +
        chip(s, 150, 30, 96, '留在后面 = 剩下', CL.a, 30);
    }},
    // ---------- 第三十九批 ----------
    pursuit: {dur: 6, hl: [8, 16], end: 60, lit: '跟着往前去', mean: '追求；消遣', draw: s => {
      return `<path d="M0 150L170 30L300 150z" fill="#9fc3a0"/><path d="M170 30l-20 14 20-4 16 12z" fill="#fff"/><path d="M60 132l40-24 30-26 24-28 14-18" ${sk('#fff', 2)} stroke-dasharray="4 4"/>` +
        `<path d="M170 30V8" ${sk(INK, 2)}/><path d="M170 8h22v12h-22z" fill="#d23c2f"/><text x="181" y="17.5" font-size="7" font-weight="700" text-anchor="middle" fill="#fff">目标</text>` +
        `<g ${s.a(move([[16, 0, 0], [24, 40, -24], [32, 70, -50], [40, 94, -78], [48, 106, -96]]))}>${kid(56, 136, CL.t, {k: .6, aR: [12, -34], ...walkLegs(s, 56, 136, 16, 48, 10, .6)})}</g>` +
        `<g ${s.a(showAt(8))}><path d="M40 120l30-30" ${sk(CL.a, 3)}/><path d="M60 88l12 0 0 12" ${sk(CL.a, 3)}/></g>` +
        chip(s, 70, 24, 84, '一路追求目标', CL.a, 44);
    }},
    satisfy: {dur: 6, hl: [10, 30], end: 60, lit: '使变得足够', mean: '满足；使满意', draw: s => {
      return GND() + kid(90, 128, CL.t, {noFace: true, aR: [18, -36]}) + `<g ${s.a(hideAt(30))}>${face(90, 128, 1, 'sad')}<path d="M84 104q6 4 12 0" ${sk('#9a7a52', 1.5)}/></g><g ${s.a(showAt(30))}>${face(90, 128)}</g>` +
        `<g ${s.a({0: 'opacity:1;transform:scale(1)', 10: 'opacity:1;transform:scale(1)', 30: 'opacity:1;transform:scale(.2)', 31: 'opacity:0', 96: 'opacity:0', 100: 'opacity:1;transform:scale(1)'}, ORG(116, 90))}><path d="M104 88a12 8 0 0 1 24 0z" fill="${BREAD}"/><rect x="104" y="88" width="24" height="4" fill="#8b4a2a"/><rect x="104" y="92" width="24" height="3" fill="#3fbf6a"/><path d="M104 95h24a3 3 0 0 1-3 4h-18a3 3 0 0 1-3-4z" fill="${BREAD}"/></g>` +
        `<rect x="200" y="30" width="20" height="90" rx="6" ${fs(CL.p, CL.m, 2)}/><rect x="202" y="32" width="16" height="86" rx="5" fill="#3fbf6a" ${s.a({0: 'transform:scaleY(.15);fill:#e2473a', 10: 'transform:scaleY(.15);fill:#e2473a', 30: 'transform:scaleY(1);fill:#3fbf6a', 92: 'transform:scaleY(1);fill:#3fbf6a', 100: 'transform:scaleY(.15);fill:#e2473a'}, FOOT)}/><text x="210" y="134" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>饱腹度</text>` +
        chip(s, 90, 30, 64, '满足了！', CL.t, 34);
    }},
    sustainable: {dur: 6, hl: [10, 40], end: 60, lit: '能一直维持的', mean: '可持续的', draw: s => {
      const tree = (x, sc) => `<path d="M${x} 128V${f1(128 - 40 * sc)}" ${sk(WOOD, f1(6 * sc))}/><circle cx="${x}" cy="${f1(128 - 50 * sc)}" r="${f1(20 * sc)}" fill="#3f8f4f"/>`;
      return GND() + `<g ${s.a(hideAt(14))}>${tree(90, 1)}</g><g ${s.a(showAt(14))}><rect x="84" y="118" width="12" height="10" fill="${WOOD}"/></g>` +
        `<g ${s.a(growY(18, 34), FOOT)}>${tree(130, .8)}</g><g ${s.a(growY(24, 40), FOOT)}>${tree(170, .6)}</g>` +
        `<g ${s.a(showAt(10))}><g ${s.a({0: R(0), 100: R(360)}, ORG(240, 70) + ';animation-timing-function:linear', 4)}><path d="M240 40a30 30 0 0 1 28 40" ${sk('#3fbf6a', 4)}/><path d="M262 82l6 -2 1 -7" ${sk('#3fbf6a', 4)}/><path d="M256 96a30 30 0 0 1-44-16" ${sk('#3fbf6a', 4)}/><path d="M214 90l-3-6-6 2" ${sk('#3fbf6a', 4)}/><path d="M212 58a30 30 0 0 1 22-18" ${sk('#3fbf6a', 4)}/><path d="M230 36l6 4-4 6" ${sk('#3fbf6a', 4)}/></g></g>` +
        chip(s, 150, 22, 96, '砍一棵，种两棵', CL.t, 40);
    }},
    technological: {dur: 6, hl: [8, 18, 40], end: 60, lit: '技术上的', mean: '技术的；科技的', draw: s => {
      return GND() + `<g ${s.a(pop(8), ORG(60, 90))}><rect x="40" y="80" width="40" height="30" rx="4" fill="#2b2b2b"/><circle cx="60" cy="95" r="10" ${sk('#888', 2)}/><path d="M42 80q18-14 36 0" ${sk('#2b2b2b', 6)}/></g>` +
        `<path d="M90 96h20M104 90l7 6-7 6" ${sk(CL.a, 2.5)} ${s.a(showAt(14))}/>` +
        `<g ${s.a(pop(18), ORG(150, 90))}><rect x="138" y="70" width="24" height="44" rx="3" fill="#556070"/><rect x="142" y="76" width="16" height="12" fill="#9fd0ee"/><path d="M144 94h12M144 100h12M144 106h12" ${sk('#d8dde3', 2)}/></g>` +
        `<path d="M176 96h20M190 90l7 6-7 6" ${sk(CL.a, 2.5)} ${s.a(showAt(24))}/>` +
        `<g ${s.a(pop(28), ORG(240, 90))}><rect x="222" y="60" width="36" height="62" rx="6" fill="#2b2b2b"/><rect x="226" y="66" width="28" height="48" rx="2" fill="#9fd0ee"/>${[0, 1, 2].map(r => [0, 1].map(c => `<rect x="${230 + c * 12}" y="${70 + r * 14}" width="8" height="8" rx="2" fill="${[CL.a, CL.t, CL.g, CL.v, '#3fbf6a', CL.a][r * 2 + c]}"/>`).join('')).join('')}</g>` +
        `<text x="60" y="136" font-size="8" text-anchor="middle" ${fl(CL.m)}>1950</text><text x="150" y="136" font-size="8" text-anchor="middle" ${fl(CL.m)}>2000</text><text x="240" y="136" font-size="8" text-anchor="middle" ${fl(CL.m)}>2020</text>` +
        chip(s, 150, 30, 76, '技术的进步', CL.v, 40);
    }},
    vision: {dur: 6, hl: [8, 40], end: 60, lit: '看得远', mean: '视力；远见；愿景', draw: s => {
      return GND() + kid(60, 128, CL.t, {aR: [20, -50]}) + `<path d="M70 76l40-14" ${sk('#556070', 8)}/><path d="M108 62l8-3" ${sk('#556070', 11)}/>` +
        `<path d="M118 58L170 30M118 66L170 120" ${sk(CL.g, 1.5)} stroke-dasharray="3 4" ${s.a(fadeP(8, 14))}/>` +
        `<g ${s.a(pop(14), ORG(226, 76))}><circle cx="226" cy="76" r="58" fill="#e8f2ff" style="stroke:var(--ink3);stroke-width:3px"/>` +
        [[196, 40, 18], [218, 30, 14], [238, 52, 16], [256, 44, 12]].map(([x, h, w]) => `<rect x="${x}" y="${116 - h - 20}" width="${w}" height="${h + 20}" fill="#8fa3b8"/>`).join('') +
        `<path d="M180 116h92" ${sk('#3f8f4f', 4)}/><g ${s.a({0: T(), 20: T(), 40: T(0, -30), 92: T(0, -30), 100: T()})}><path d="M206 60q4-10 8 0v12h-8z" fill="#e2473a"/><path d="M206 72l4 6 4-6" fill="#f2b632"/></g></g>` +
        chip(s, 226, 140, 64, '看到未来', CL.v, 40);
    }},
    wedding: {dur: 6, hl: [10, 40], end: 60, lit: '结婚的仪式', mean: '婚礼', draw: s => {
      return GND() + `<path d="M90 128V54q60-44 120 0v74" ${sk('#f2a3b3', 6)}/>${[0, 1, 2, 3, 4, 5, 6].map(i => { const a = Math.PI * (1 - i / 6); return `<circle cx="${f1(150 + 60 * Math.cos(a))}" cy="${f1(54 - 24 * Math.sin(a))}" r="5" fill="${['#fff', '#f2a3b3'][i % 2]}" style="stroke:#e27a93;stroke-width:1px"/>`; }).join('')}` +
        `<g ${s.a(move([[10, -40, 0], [24, 0, 0]]))}>${kid(130, 128, '#2b2b2b', {aR: [12, -30], ...walkLegs(s, 130, 128, 10, 24, 4)})}<path d="M126 88l4 4 4-4" fill="#fff"/></g>` +
        `<g ${s.a(move([[10, 40, 0], [24, 0, 0]]))}>${kid(170, 128, '#fff', {aL: [-12, -30], noFace: false})}<path d="M158 88h24l8 40h-40z" fill="#fff" style="stroke:#e8dcc8;stroke-width:1.5px"/><path d="M160 70q10-14 20 0l6 30q-16 6-32 0z" fill="#fff" fill-opacity=".5"/></g>` +
        [0, 1, 2].map(i => `<g ${s.a({0: 'opacity:0;' + T(), [30 + i * 4]: 'opacity:0;' + T(), [32 + i * 4]: 'opacity:1;' + T(), [48 + i * 4]: 'opacity:0;' + T((i - 1) * 20, -30), 100: 'opacity:0'})}>${heartAt(150, 70, .6, [CL.a, '#f2a3b3', '#e2473a'][i])}</g>`).join('') +
        chip(s, 150, 142, 64, '婚礼', '#e27a93', 40);
    }},
    worldwide: {dur: 6, hl: [8, 40], end: 60, lit: '遍及全世界的', mean: '全世界的', draw: s => {
      const cont = [`M40 40q20-14 44-4t10 30-24 20-30-4-0-42z`, `M70 92q14-4 18 10t-8 28-16-6 6-32z`, `M130 34q18-8 30 2t-4 24-24 0-2-26z`, `M136 72q16-4 22 14t-6 30-18-12 2-32z`, `M180 30q40-10 70 6t0 40-40 6-30-24 0-28z`, `M230 100q14-6 24 4t-6 16-18-20z`];
      const pins = [[66, 52], [80, 110], [146, 46], [148, 92], [214, 50], [242, 108]];
      return `<rect x="10" y="20" width="280" height="118" rx="8" fill="#9fd0ee"/>` + cont.map(d => `<path d="${d}" fill="#8fc98a"/>`).join('') +
        pins.map(([x, y], i) => `<g ${s.a(pop(8 + i * 4), ORG(x, y))}><path d="M${x} ${y}q-7-9-7-14a7 7 0 0 1 14 0q0 5-7 14z" fill="#d23c2f"/><circle cx="${x}" cy="${y - 14}" r="2.5" fill="#fff"/></g>`).join('') +
        chip(s, 150, 14, 76, '风靡全球', CL.a, 40);
    }},
    adopt: {dur: 6, hl: [8, 18], end: 60, lit: '选中拿来', mean: '采用；收养', draw: s => {
      const pup = (x, y, c) => `<ellipse cx="${x}" cy="${y + 4}" rx="10" ry="6" fill="${c}"/><circle cx="${x - 8}" cy="${y - 2}" r="6" fill="${c}"/><circle cx="${x - 10}" cy="${y - 3}" r="1.2" fill="${INK}"/><path d="M${x - 12} ${y - 6}l-2 6 4-2z" fill="#6b4428"/>`;
      return GND() + [[150, '#c98a4a'], [200, '#f2b632'], [250, '#8b8b8b']].map(([x, c], i) => `<rect x="${x - 20}" y="78" width="40" height="40" ${fs('#fff', CL.m, 2)}/>` + (i === 1 ? `<g ${s.a({0: T(), 26: T(), 40: T(-100, 10), 92: T(-100, 10), 100: T()})}>${pup(x, 100, c)}</g>` : pup(x, 100, c)) + `<path d="M${x - 20} 78v40M${x - 10} 78v40M${x} 78v40M${x + 10} 78v40M${x + 20} 78v40" ${sk(CL.m, 1.5)} ${i === 1 ? s.a(hideAt(24)) : ''}/>`).join('') +
        `<g ${s.a(moveIn([[8, 220, 40], [18, 200, 60]]))}><path d="M-2 -10l4 0 0 12 6 0-8 10-8-10 6 0z" fill="#d23c2f"/></g>` +
        kid(70, 128, CL.t, {aR: [20, -30]}) + `<g ${s.a(pop(40), ORG(100, 60))}>${heartAt(100, 56, .7)}</g>` +
        chip(s, 90, 30, 92, '选中带回家 = 收养', CL.t, 40);
    }},
    aging: {dur: 6, hl: [10, 40], end: 60, lit: '变老的过程', mean: '老龄化；老化', draw: s => {
      const rows = [['老年', 10, 40], ['中年', 40, 46], ['青年', 50, 34], ['儿童', 46, 20]];
      return `<path d="M150 18V128" ${sk(CL.m, 2)}/>` + rows.map(([t, a, b], i) => { const y = 28 + i * 24;
          return `<rect x="${150 - a}" y="${y}" width="${a * 2}" height="18" ${fl(i === 0 ? '#9a948c' : CL.t)} ${s.a({0: `transform:scaleX(1)`, 10: 'transform:scaleX(1)', 36: `transform:scaleX(${f1(b / a)})`, 92: `transform:scaleX(${f1(b / a)})`, 100: 'transform:scaleX(1)'}, ORG(150, y + 9))}/><text x="40" y="${y + 13}" font-size="10" font-weight="700" ${fl(CL.k)}>${t}</text>`; }).join('') +
        `<g ${s.a(showAt(36))}><path d="M210 30v-10M204 26l6-6 6 6" ${sk('#d23c2f', 2.5)}/><path d="M220 114v10M214 118l6 6 6-6" ${sk('#4a90d0', 2.5)}/></g>` +
        chip(s, 150, 142, 84, '老人越来越多', '#8b7a6a', 40);
    }},
    agricultural: {dur: 6, hl: [8, 16, 40], end: 60, lit: '农业上的', mean: '农业的', draw: s => {
      return `<rect x="0" y="0" width="300" height="70" fill="#dff2e0"/><rect x="0" y="70" width="300" height="80" fill="#c8a06a"/>` +
        [30, 60, 90, 120].map((x, i) => `<g ${s.a(growY(16 + i * 2, 26 + i * 2), FOOT)}><path d="M${x} 104V74" ${sk('#d9b13a', 2.5)}/><path d="M${x} 74q-5 8 0 16q5-8 0-16z" fill="#e8c041"/></g>`).join('') +
        `<path d="M176 100h96l-8 34h-80z" fill="#b5793a"/><path d="M176 100h96" ${sk('#8b5a3a', 3)}/>` +
        [[190, 92, `<ellipse cx="190" cy="92" rx="6" ry="12" fill="#f2c641"/><path d="M184 98q6-14 0-20" ${sk('#3fbf6a', 2)}/>`, 30], [210, 94, `<circle cx="210" cy="94" r="8" fill="#e2473a"/>`, 33], [230, 92, `<path d="M222 98q8-16 16 0z" fill="#3fbf6a"/>`, 36], [252, 94, `<rect x="244" y="86" width="16" height="14" rx="3" fill="#f4f1e6" style="stroke:#c8c0b0;stroke-width:1px"/><text x="252" y="96" font-size="6" text-anchor="middle" ${fl(CL.k)}>米</text>`, 39]].map(([x, y, art, p]) => `<g ${s.a(moveIn([[p, 0, -40], [p + 4, 0, 0]]))}>${art}</g>`).join('') +
        chip(s, 224, 30, 64, '农产品', CL.t, 44);
    }},
    certainly: {dur: 6, hl: [10, 30], end: 60, lit: '确定地', mean: '当然；无疑', draw: s => {
      return GND() + kid(80, 128, CL.v, {aR: [18, -30]}) + `<rect x="94" y="94" width="20" height="16" rx="2" fill="${WOOD}"/>` + chip(s, 80, 40, 72, '能帮我吗？', CL.v, 8) +
        kid(220, 128, CL.t, {aL: [-18, -46]}) + `<g ${s.a(pop(30), ORG(202, 80))}><rect x="196" y="76" width="12" height="12" rx="3" fill="${SKIN}"/><rect x="198" y="66" width="5" height="12" rx="2.5" fill="${SKIN}"/></g>` +
        chip(s, 226, 40, 56, '当然！', CL.t, 22) + `<g ${s.a(pop(34), ORG(150, 70))}><circle cx="150" cy="70" r="10" fill="#3fbf6a"/><path d="M145 70l3.5 3.5 6.5-7" ${sk('#fff', 2.5)}/></g>` +
        chip(s, 150, 140, 64, '毫无疑问', CL.a, 40);
    }},
    confidence: {dur: 6, hl: [8, 18, 40], end: 60, lit: '完全的信任', mean: '信心；信任', draw: s => {
      const shake = {0: T(), 4: T(-2), 6: T(2), 8: T(-2), 10: T(2), 12: T(-2), 14: T(2), 16: T(), 100: T()};
      return `<rect x="90" y="110" width="120" height="18" fill="${WOOD}"/>` + GND() +
        `<g ${s.a(shake)}><g ${s.a({0: 'transform:scale(1)', 26: 'transform:scale(1)', 32: 'transform:scale(1.12)', 92: 'transform:scale(1.12)', 100: 'transform:scale(1)'}, ORG(150, 110))}>${kid(150, 110, CL.a, {noFace: true, aL: [-16, -52], aR: [16, -52]})}<g ${s.a(hideAt(26))}>${face(150, 110, 1, 'sad')}</g><g ${s.a(showAt(26))}>${face(150, 110)}</g></g></g>` +
        `<g ${s.a(showAt(30))}><circle cx="150" cy="70" r="40" fill="#f6d34a" fill-opacity=".2"/></g>` +
        [[40, CL.t], [260, CL.v]].map(([x, c], i) => kid(x, 128, c, {k: .8, aR: [12, -44], aL: [-12, -44]}) + `<g ${s.a(pop(18 + i * 2), ORG(x, 40))}>${heartAt(x, 36, .5)}</g>`).join('') +
        chip(s, 70, 20, 64, '你能行！', CL.t, 16) + chip(s, 150, 140, 64, '充满信心', CL.a, 40);
    }},
    // ---------- 第四十批 ----------
    depression: {dur: 6, hl: [8, 20, 44], end: 60, lit: '情绪一直被压着', mean: '抑郁；萧条', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" ${fl('#556070', .3)} ${s.a(fadeP(8, 30))}/>` + GND() +
        `<g ${s.a({0: T(), 8: T(), 30: T(0, 26), 92: T(0, 26), 100: T()})}><path d="M96 40a14 14 0 0 1 20-14 18 18 0 0 1 34 6 12 12 0 0 1-2 24h-48a10 10 0 0 1-4-16z" fill="#5a6478"/>${[0, 1, 2, 3].map(i => `<path d="M${108 + i * 10} 58l-3 8" ${sk('#6db7e8', 2)} ${s.a({0: T(0, 0), 100: T(-4, 30)}, `animation-delay:${i * .2}s;animation-timing-function:linear`, .8)}/>`).join('')}</g>` +
        `<g ${s.a({0: R(0), 14: R(0), 26: R(18), 92: R(18), 100: R(0)}, ORG(130, 128))}>${kid(130, 128, '#7a8494', {noFace: true, aL: [-6, -24], aR: [6, -24]})}${face(130, 128, 1, 'sad')}</g>` +
        `<path d="M200 50L230 70L250 66L280 110" ${sk('#9a948c', 3)} ${DASH} ${s.a(drawP(20, 40))}/><path d="M272 100l8 10 2-12" ${sk('#9a948c', 3)} ${s.a(showAt(40))}/><text x="240" y="40" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>心情</text>` +
        chip(s, 150, 142, 104, '一直被压着 = 抑郁', '#556070', 44);
    }},
    editor: {dur: 6, hl: [10, 40], end: 60, lit: '编辑稿子的人', mean: '编辑；编者', draw: s => {
      return `<rect x="110" y="16" width="130" height="118" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="175" y="32" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>稿子</text>` +
        [44, 58, 72, 86, 100, 114].map(y => `<path d="M122 ${y}h106" ${sk(CL.m, 2, .5)}/>`).join('') +
        `<path d="M150 58l20-8" ${sk('#d23c2f', 2.5)} ${DASH} ${s.a(drawP(12, 18))}/><path d="M132 86h40" ${sk('#d23c2f', 2.5)} ${DASH} ${s.a(drawP(20, 26))}/><path d="M196 100q6-10 12 0t12 0" ${sk('#d23c2f', 2)} ${DASH} ${s.a(drawP(28, 34))}/><text x="232" y="60" font-size="9" font-weight="700" fill="#d23c2f" ${s.a(showAt(18))}>改</text>` +
        `<g ${s.a(moveIn([[10, 150, 56], [18, 172, 50], [20, 134, 86], [26, 172, 86], [28, 196, 100], [34, 220, 100]]))}><path d="M0 0l3-8 14-14 5 5-14 14z" fill="#d23c2f"/></g>` +
        GND(8, 104) + kid(60, 128, CL.v, {aR: [26, -40]}) + `<circle cx="56" cy="76" r="3.8" ${sk(INK, 1.2)}/><circle cx="64" cy="76" r="3.8" ${sk(INK, 1.2)}/>` +
        chip(s, 60, 30, 92, '改稿子的人 = 编辑', CL.a, 40);
    }},
    encounter: {dur: 6, hl: [10, 24], end: 60, lit: '迎面撞上', mean: '遭遇；偶遇', draw: s => {
      return GND() + `<rect x="140" y="20" width="20" height="108" fill="#9a948c"/>` +
        `<g ${s.a(move([[6, 0, 0], [22, 70, 0], [26, 62, 0]]))}>${kid(60, 128, CL.t, {noFace: true, ...walkLegs(s, 60, 128, 6, 22, 5)})}<g ${s.a(hideAt(22))}>${face(60, 128)}</g><g ${s.a(showAt(22))}><circle cx="56" cy="76" r="2.5" fill="${INK}"/><circle cx="64" cy="76" r="2.5" fill="${INK}"/><ellipse cx="60" cy="83" rx="2.5" ry="3" fill="${INK}"/></g></g>` +
        `<g ${s.a(move([[6, 0, 0], [22, -70, 0], [26, -62, 0]]))}>${kid(240, 128, CL.a, {noFace: true, ...walkLegs(s, 240, 128, 6, 22, 5)})}<g ${s.a(hideAt(22))}>${face(240, 128)}</g><g ${s.a(showAt(22))}><circle cx="236" cy="76" r="2.5" fill="${INK}"/><circle cx="244" cy="76" r="2.5" fill="${INK}"/><ellipse cx="240" cy="83" rx="2.5" ry="3" fill="${INK}"/></g></g>` +
        `<g ${s.a(showAt(22, 32))}>${burst(150, 70, 14).replace('<path ', `<path ${sk(CL.g, 2.5)} `)}</g>` +
        `<text x="122" y="50" font-size="16" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(pop(24), ORG(122, 44))}>!</text><text x="178" y="50" font-size="16" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(pop(25), ORG(178, 44))}>!</text>` +
        chip(s, 150, 142, 92, '拐角迎面撞上', CL.v, 40);
    }},
    expectation: {dur: 6, hl: [10, 40], end: 60, lit: '期待的东西', mean: '期望；预期', draw: s => {
      return GND() + kid(70, 128, CL.a, {k: 1.1}) + kid(110, 128, '#3d4a5c', {k: 1.1}) + kid(210, 128, CL.t, {k: .8, aR: [14, -30]}) + `<rect x="222" y="98" width="14" height="12" rx="1" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/>` +
        `<g ${s.a(pop(10), ORG(90, 30))}><path d="M54 16h72a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6h-30l-8 8v-8h-34a6 6 0 0 1-6-6V22a6 6 0 0 1 6-6z" ${fs(CL.p, CL.m, 2)}/><path d="M62 20h20v8a10 10 0 0 1-20 0z" fill="#f6d34a"/><path d="M68 36h8v4h-8z" fill="#c9952a"/><text x="90" y="34" font-size="10" font-weight="700" ${fl(CL.a)}>第一名</text></g>` +
        `<path d="M130 70L200 90" ${sk(CL.a, 2)} stroke-dasharray="3 4" ${s.a(fadeP(20, 26))}/>` +
        `<g ${s.a(pop(30), ORG(230, 60))}><text x="230" y="64" font-size="16" font-weight="700" text-anchor="middle" ${fl(CL.m)}>…</text></g>` +
        chip(s, 160, 142, 84, '心里盼着的', CL.a, 40);
    }},
    extent: {dur: 6, hl: [10, 20], end: 60, lit: '伸出去有多远', mean: '程度；范围', draw: s => {
      return GND() + `<rect x="40" y="96" width="30" height="24" rx="4" fill="#f2b632"/><circle cx="55" cy="108" r="6" fill="#c9952a"/>` +
        `<rect x="70" y="102" width="200" height="12" fill="#f6d34a" style="stroke:#c9952a;stroke-width:1px" ${s.a(growX(10, 36), 'transform-origin:0% 50%;transform-box:fill-box')}/>` +
        [0, 1, 2, 3, 4].map(i => `<path d="M${70 + i * 50} 102v6" ${sk(INK, 1.5)} ${s.a(showAt(14 + i * 5))}/><text x="${70 + i * 50}" y="96" font-size="8" text-anchor="middle" ${fl(CL.k)} ${s.a(showAt(14 + i * 5))}>${i * 25}%</text>`).join('') +
        `<path d="M70 70H270" ${sk(CL.a, 2.5)} ${DASH} ${s.a(drawP(10, 36))}/><path d="M262 64l8 6-8 6" ${sk(CL.a, 2.5)} ${s.a(showAt(36))}/>` +
        chip(s, 170, 40, 92, '伸到哪 = 程度', CL.a, 40);
    }},
    generate: {dur: 6, hl: [10, 30], end: 60, lit: '产生出来', mean: '产生；引起', draw: s => {
      return GND() + `<path d="M80 128L86 50h8l6 78z" fill="#e8ecf2" style="stroke:var(--ink3);stroke-width:1.5px"/>` +
        `<g ${s.a({0: R(0), 10: R(0), 100: R(1080)}, ORG(90, 48) + ';animation-timing-function:linear')}><path d="M90 48l-4-34 8 0zM90 48l30 18-4 7zM90 48l-30 18 4 7z" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/></g><circle cx="90" cy="48" r="4" fill="${CL.m}"/>` +
        `<path d="M100 120H210V80" ${sk(CL.m, 2)}/><g ${s.a(fadeP(14, 18))}><path d="M100 120H210V80" ${sk('#f6d34a', 3)} stroke-dasharray="3 9" ${s.a({0: 'stroke-dashoffset:0', 100: 'stroke-dashoffset:-48'}, 'animation-timing-function:linear', 1)}/></g>` +
        `<path d="M200 66a10 10 0 1 1 20 0c0 5-3 6-3 10h-14c0-4-3-5-3-10z" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M200 66a10 10 0 1 1 20 0c0 5-3 6-3 10h-14c0-4-3-5-3-10z" ${fl(CL.g)} ${s.a(showAt(30))}/><g ${s.a(showAt(30))}><path d="M210 44v-6M194 52l-4-3M226 52l4-3" ${sk(CL.g, 2.5)}/></g>` +
        chip(s, 240, 112, 76, '风力发电', CL.t, 34);
    }},
    highly: {dur: 6, hl: [10, 40], end: 60, lit: '高度地', mean: '非常；高度地', draw: s => {
      return `<rect x="200" y="20" width="30" height="100" rx="6" ${fs(CL.p, CL.m, 2)}/>` + [0, 1, 2, 3, 4].map(i => `<rect x="204" y="${100 - i * 19}" width="22" height="15" rx="3" fill="${['#3fbf6a', '#9fd04a', '#f6d34a', '#f29a2e', '#e2473a'][i]}" ${s.a(showAt(10 + i * 5))}/>`).join('') +
        `<text x="215" y="138" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>推荐度</text>` +
        GND(8, 180) + kid(90, 128, CL.t, {aR: [18, -50]}) + `<g ${s.a(pop(20), ORG(116, 64))}><rect x="110" y="64" width="14" height="14" rx="3" fill="${SKIN}"/><rect x="112" y="52" width="6" height="14" rx="3" fill="${SKIN}"/></g>` +
        `<g ${s.a(pop(36), ORG(260, 24))}><text x="262" y="30" font-size="12" font-weight="700" text-anchor="middle" fill="#e2473a">MAX</text></g>` +
        chip(s, 90, 30, 84, '非常非常推荐', CL.a, 40);
    }},
    inequality: {dur: 6, hl: [8, 16, 40], end: 60, lit: '不平等', mean: '不平等；不均', draw: s => {
      const stack = (x, n, p) => [...Array(n)].map((_, j) => `<ellipse cx="${x}" cy="${f1(92 - j * 5)}" rx="11" ry="3.5" fill="#f2c641" style="stroke:#a8741a;stroke-width:1px" ${s.a(pop(p + j), ORG(x, 92 - j * 5))}/>`).join('');
      return GND() + `<path d="M150 128V60" ${sk(CL.m, 4)}/><path d="M140 128h20" ${sk(CL.m, 4)}/>` +
        `<g ${s.a({0: R(0), 20: R(0), 30: R(-16), 92: R(-16), 100: R(0)}, ORG(150, 60))}><path d="M80 60H220" ${sk(CL.m, 3)}/><path d="M80 60v18M220 60v18" ${sk(CL.m, 1.5)}/><path d="M64 96h32M204 96h32" ${sk(CL.m, 3)}/>${stack(80, 10, 8)}${stack(220, 2, 10)}</g>` +
        kid(40, 128, CL.t, {k: .8}) + kid(268, 128, CL.a, {k: .8, noFace: true}) + face(268, 128, .8, 'sad') +
        `<text x="150" y="46" font-size="20" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(pop(32), ORG(150, 40))}>≠</text>` +
        chip(s, 150, 142, 84, '一边多一边少', '#d23c2f', 40);
    }},
    mainly: {dur: 6, hl: [10, 40], end: 60, lit: '主要地', mean: '主要地；大部分', draw: s => {
      return `<text x="40" y="26" font-size="11" font-weight="700" ${fl(CL.k)}>迟到的原因：</text>` +
        `<g ${s.a(pop(10), ORG(110, 54))}><rect x="40" y="38" width="200" height="32" rx="6" fill="#ffe6e1" style="stroke:#d23c2f;stroke-width:2px"/><text x="60" y="59" font-size="13" font-weight="700" fill="#d23c2f">睡过头了</text><text x="226" y="59" font-size="12" font-weight="700" text-anchor="end" fill="#d23c2f">80%</text></g>` +
        `<g ${s.a(pop(16), ORG(100, 86))}><rect x="40" y="78" width="120" height="18" rx="4" fill="#eef2f6"/><text x="50" y="91" font-size="9" ${fl(CL.m)}>堵车</text><text x="152" y="91" font-size="9" text-anchor="end" ${fl(CL.m)}>15%</text></g>` +
        `<g ${s.a(pop(20), ORG(90, 108))}><rect x="40" y="100" width="90" height="16" rx="4" fill="#eef2f6"/><text x="50" y="112" font-size="8" ${fl(CL.m)}>下雨</text><text x="122" y="112" font-size="8" text-anchor="end" ${fl(CL.m)}>5%</text></g>` +
        `<g ${s.a(pop(30), ORG(260, 54))}><circle cx="260" cy="54" r="14" fill="#fff" style="stroke:var(--ink);stroke-width:2px"/><path d="M260 54v-9M260 54l6 4" ${sk(INK, 2)}/><text x="260" y="84" font-size="9" ${fl(CL.m)} text-anchor="middle">Zzz</text></g>` +
        chip(s, 150, 138, 104, '主要是因为睡过头', CL.a, 40);
    }},
    motivation: {dur: 6, hl: [10, 40], end: 60, lit: '动起来的劲', mean: '动机；积极性', draw: s => {
      return GND() + `<rect x="200" y="20" width="80" height="54" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><path d="M220 46l20-16 20 16z" fill="#2f5d8a"/><rect x="224" y="46" width="32" height="20" fill="#9fb3c8"/><text x="240" y="70" font-size="7" font-weight="700" text-anchor="middle" ${fl(CL.k)}>梦想大学</text>` +
        `<rect x="40" y="102" width="70" height="16" rx="6" fill="#9b7fd0"/><path d="M44 118v10M106 118v10" ${sk('#7a5ab0', 3)}/>` +
        `<g ${s.a({0: T(), 16: T(), 24: T(60, 0), 92: T(60, 0), 100: T()})}><g ${s.a({0: R(70), 14: R(70), 20: R(0), 92: R(0), 100: R(70)}, ORG(80, 118))}>${kid(80, 128, CL.t, {noFace: true, aR: [16, -56]})}<g ${s.a(hideAt(16))}>${face(80, 128, 1, 'sad')}</g><g ${s.a(showAt(16))}>${face(80, 128)}</g></g></g>` +
        `<rect x="14" y="30" width="14" height="60" rx="4" ${fs(CL.p, CL.m, 1.5)}/><rect x="16" y="32" width="10" height="56" rx="3" fill="#f29a2e" ${s.a({0: 'transform:scaleY(.1)', 10: 'transform:scaleY(.1)', 20: 'transform:scaleY(1)', 92: 'transform:scaleY(1)', 100: 'transform:scaleY(.1)'}, FOOT)}/><text x="21" y="102" font-size="8" font-weight="700" text-anchor="middle" ${fl(CL.m)}>干劲</text>` +
        chip(s, 160, 22, 92, '有了目标就有动力', CL.a, 40);
    }},
    political: {dur: 6, hl: [10, 40], end: 60, lit: '城邦事务的', mean: '政治的', draw: s => {
      return GND() + `<rect x="80" y="64" width="140" height="64" fill="#e8dcc8"/><path d="M72 64l78-30 78 30z" fill="#cbb89c"/>${[96, 124, 152, 180, 204].map(x => `<rect x="${x}" y="70" width="10" height="58" fill="#f4ede0"/>`).join('')}<path d="M150 34V14" ${sk(INK, 1.5)}/><path d="M150 14h16v10h-16z" fill="#d23c2f"/>` +
        `<g ${s.a(pop(10), ORG(150, 50))}><text x="150" y="58" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>议会</text></g>` +
        `<rect x="246" y="98" width="34" height="30" fill="#4a90d0"/><path d="M254 100h18" ${sk('#fff', 2.5)}/><text x="263" y="118" font-size="7" font-weight="700" text-anchor="middle" fill="#fff">投票</text>` +
        [0, 1, 2].map(i => { const f = moveIn([[20 + i * 6, 40, 70], [26 + i * 6, 263, 96]]); f[26.5 + i * 6] = T(263, 96) + ';opacity:0'; f[92] = f[26.5 + i * 6]; return `<g ${s.a(f)}><rect x="-5" y="-7" width="10" height="14" rx="1" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/></g>`; }).join('') +
        kid(40, 128, CL.t, {k: .8, aR: [14, -40]}) + chip(s, 60, 30, 92, '城邦里的大事', CL.v, 40);
    }},
    practical: {dur: 6, hl: [10, 40], end: 60, lit: '用得上的', mean: '实际的；实用的', draw: s => {
      return [0, 1, 2, 3, 4, 5].map(i => `<path d="M${30 + i * 48} -10l-6 12" ${sk('#6db7e8', 2)} ${s.a({0: T(0, -10), 100: T(-10, 150)}, `animation-delay:${i * .15}s;animation-timing-function:linear`, .9)}/>`).join('') + GND() +
        kid(80, 128, CL.v, {noFace: true, aR: [14, -50]}) + face(80, 128, 1, 'sad') + `<path d="M92 72q4-14 16-10" ${sk('#d23c2f', 2)}/><path d="M104 54l6 6-8 2z" fill="#f2a3b3"/><text x="80" y="40" font-size="8" font-weight="700" text-anchor="middle" ${fl(CL.m)}>好看不实用</text>` +
        kid(220, 128, CL.t, {aL: [-10, -50]}) + `<path d="M210 78V40" ${sk(INK, 2)}/><path d="M180 44q30-30 60 0z" fill="#4a90d0" ${s.a(pop(14), ORG(210, 40))}/>` +
        `<g ${s.a(pop(30), ORG(260, 60))}><circle cx="260" cy="60" r="9" fill="#3fbf6a"/><path d="M256 60l3 3 5-6" ${sk('#fff', 2)}/></g>` +
        chip(s, 220, 142, 92, '用得上 = 实用', CL.t, 40);
    }},
    // ---------- 第四十一批 ----------
    intervene: {dur: 6, hl: [20, 12], end: 60, lit: '来到中间', mean: '干预；介入', draw: s => {
      return `<path d="M30 20V120H280" ${sk(CL.m, 2)}/><text x="40" y="18" font-size="9" font-weight="700" ${fl(CL.m)}>菜价</text>` +
        `<path d="M30 80L60 70L80 30L100 110L120 24L140 116L160 60" ${sk('#e2473a', 3)} ${DASH} ${s.a(drawP(4, 20))}/>` +
        `<path d="M160 60L200 66L240 62L280 64" ${sk('#3fbf6a', 3)} ${DASH} ${s.a(drawP(30, 44))}/>` +
        `<g ${s.a(moveIn([[12, 0, -70], [22, 0, 0]]))}><path d="M170 40q-10-10 0-14h20q10 0 10 10v14h-30z" fill="${SKIN}"/><path d="M172 26v-8M180 26v-10M188 26v-8" ${sk(SKIN, 5)}/><rect x="168" y="48" width="34" height="8" rx="2" fill="#2f5d8a"/><path d="M185 56v-56" ${sk('#2f5d8a', 14)}/></g>` +
        chip(s, 236, 30, 72, '政府出手', '#2f5d8a', 24) + chip(s, 150, 142, 92, '插手稳住局面', CL.v, 44);
    }},
    recognition: {dur: 6, hl: [10, 20, 40], end: 60, lit: '被大家认得', mean: '认可；认出', draw: s => {
      return `<rect x="110" y="104" width="80" height="24" fill="${WOOD}"/>` + GND() + kid(150, 104, CL.a, {aL: [-16, -52], aR: [16, -52]}) +
        `<g ${s.a(moveIn([[10, 0, -40], [18, 0, 0]]))}><path d="M144 62l6 8 6-8" fill="#d23c2f"/><circle cx="150" cy="76" r="7" fill="#f6d34a" style="stroke:#c9952a;stroke-width:1.5px"/>${star5(150, 76, 4.5, 1.8, '#fff')}</g>` +
        [40, 72, 228, 260].map((x, i) => kid(x, 128, [CL.t, CL.v, CL.g, CL.t][i], {k: .7, aL: [-4, -36], aR: [4, -36]}) + `<g ${s.a(showAt(20 + i * 2))}><path d="M${x - 10} 74l-4-4M${x + 10} 74l4-4M${x} 70v-5" ${sk(CL.g, 2)}/></g>`).join('') +
        chip(s, 150, 22, 76, '大家都认可', CL.a, 40);
    }},
    recommendation: {dur: 6, hl: [8, 20, 40], end: 60, lit: '推荐的话', mean: '推荐；建议', draw: s => {
      return GND() + kid(60, 128, '#3d4a5c', {k: 1.05, aR: [20, -36]}) +
        `<g ${s.a({0: T(), 26: T(), 38: T(130, 0), 92: T(130, 0), 100: T()})}><rect x="78" y="82" width="30" height="20" rx="2" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M78 82l15 11 15-11" ${sk(CL.m, 1.2)}/><circle cx="93" cy="96" r="4" fill="#d23c2f"/></g>` +
        `<g ${s.a(pop(8), ORG(90, 40))}><rect x="58" y="20" width="64" height="40" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><text x="90" y="32" font-size="8" font-weight="700" text-anchor="middle" ${fl(CL.k)}>推荐信</text><path d="M64 40h52M64 48h40" ${sk(CL.m, 1.2, .6)}/>${star5(108, 50, 4, 1.8, CL.g)}</g>` +
        kid(240, 128, CL.t, {aL: [-16, -32]}) + `<g ${s.a(pop(42), ORG(240, 48))}><circle cx="240" cy="48" r="9" fill="#3fbf6a"/><path d="M236 48l3 3 5-6" ${sk('#fff', 2)}/></g>` +
        chip(s, 150, 142, 108, '写信推荐你 = 推荐', CL.v, 44);
    }},
    strengthen: {dur: 6, hl: [10, 30], end: 60, lit: '使有力量', mean: '加强；巩固', draw: s => {
      return `<path d="M0 128H90M210 128H300" ${sk(CL.m, 2)}/><path d="M90 128q60 30 120 0" fill="#6db7e8" fill-opacity=".5"/>` +
        `<g ${s.a({0: 'transform:translateY(0)', 8: 'transform:translateY(0)', 10: 'transform:translateY(6px)', 12: 'transform:translateY(0)', 14: 'transform:translateY(6px)', 16: 'transform:translateY(0)', 100: 'transform:translateY(0)'})}><path d="M80 100H220" ${sk(WOOD, 8)}/></g>` +
        `<path d="M90 104L120 128M150 104L120 128M150 104L180 128M210 104L180 128" ${sk('#556070', 4)} ${DASH} ${s.a(drawP(20, 30))}/>` +
        `<path d="M86 96L150 60L214 96" ${sk('#556070', 4)} ${DASH} ${s.a(drawP(26, 34))}/><path d="M118 78v18M150 60v36M182 78v18" ${sk('#556070', 3)} ${DASH} ${s.a(drawP(30, 38))}/>` +
        `<g ${s.a(move([[40, -40, 0], [56, 190, 0]]))}><rect x="40" y="80" width="40" height="16" rx="4" fill="#d23c2f"/><circle cx="50" cy="98" r="4" fill="${INK}"/><circle cx="70" cy="98" r="4" fill="${INK}"/></g>` +
        chip(s, 150, 22, 92, '加固后更结实', CL.t, 40);
    }},
    video: {dur: 6, hl: [8, 40], end: 60, lit: '看的东西', mean: '视频；录像', draw: s => {
      return GND() + `<rect x="80" y="20" width="140" height="90" rx="8" fill="#2b2b2b"/><rect x="88" y="28" width="124" height="68" rx="3" fill="#9fd0ee"/>` +
        `<g ${s.a(hideAt(8))}><circle cx="150" cy="62" r="16" fill="#fff" fill-opacity=".8"/><path d="M145 54v16l12-8z" fill="#d23c2f"/></g>` +
        `<g ${s.a(showAt(8))}><g ${s.a({0: T(-40, 0), 100: T(140, 0)}, 'animation-timing-function:linear', 2)}><path d="M60 80l10-6 10 6-10 6z" fill="#f2a3b3"/><circle cx="58" cy="78" r="3" fill="#f2a3b3"/></g><path d="M88 86q30-14 62-4t62-4V96H88z" fill="#3f8f4f"/></g>` +
        `<rect x="88" y="100" width="124" height="4" rx="2" ${fl(CL.m, .4)}/><rect x="88" y="100" width="124" height="4" rx="2" fill="#e2473a" ${s.a(growX(8, 60), 'transform-origin:0% 50%;transform-box:fill-box')}/>` +
        kid(260, 128, CL.t, {aL: [-10, -30]}) + chip(s, 150, 132, 76, '看的东西', CL.v, 40);
    }},
    ancient: {dur: 6, hl: [8, 30], end: 60, lit: '很久以前的', mean: '古代的；古老的', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#f2dca0" fill-opacity=".5"/>` + GND() +
        `<g ${s.a(pop(8), ORG(110, 100))}><path d="M50 128L110 40L170 128z" fill="#d9b66a"/><path d="M70 98h80M86 74h48" ${sk('#b8954a', 1.5)}/></g>` +
        `<g ${s.a(pop(14), ORG(200, 110))}><path d="M180 128l20-40 20 40z" fill="#c9a65a"/></g>` +
        `<g ${s.a(pop(30), ORG(250, 50))}><rect x="222" y="32" width="56" height="36" fill="#f4e6c8" style="stroke:#b8954a;stroke-width:1.5px"/><path d="M222 32q-6 18 0 36M278 32q6 18 0 36" ${sk('#b8954a', 3)}/><text x="250" y="48" font-size="8" font-weight="700" text-anchor="middle" fill="#8b5a3a">公元前</text><text x="250" y="60" font-size="8" font-weight="700" text-anchor="middle" fill="#8b5a3a">2500 年</text></g>` +
        `<circle cx="40" cy="30" r="12" ${fl(CL.g)}/>` + chip(s, 110, 20, 76, '很久很久以前', '#8b5a3a', 36);
    }},
    appropriate: {dur: 6, hl: [8, 18, 40], end: 60, lit: '合乎自身的', mean: '适当的；合适的', draw: s => {
      const shoe = (x, w, c) => `<path d="M${x - w / 2} 116q0-10 ${w * .4}-10h${w * .2}q${w * .4} 4 ${w * .4} 10z" fill="${c}"/>`;
      return GND() + `<ellipse cx="150" cy="118" rx="12" ry="5" fill="${SKIN}"/><path d="M146 112V60M154 112V60" ${sk(SKIN, 7)}/>` +
        `<g ${s.a(showAt(8, 18))}>${shoe(150, 50, '#9a948c')}<text x="150" y="140" font-size="9" font-weight="700" text-anchor="middle" fill="#d23c2f">太大</text></g>` +
        `<g ${s.a(showAt(20, 30))}>${shoe(150, 18, '#9a948c')}<text x="150" y="140" font-size="9" font-weight="700" text-anchor="middle" fill="#d23c2f">太小</text></g>` +
        `<g ${s.a(showAt(32))}>${shoe(150, 30, '#d23c2f')}<text x="150" y="140" font-size="9" font-weight="700" text-anchor="middle" fill="#3f8f4f">刚刚好</text></g>` +
        `<g ${s.a(pop(34), ORG(190, 90))}><circle cx="190" cy="90" r="9" fill="#3fbf6a"/><path d="M186 90l3 3 5-6" ${sk('#fff', 2)}/></g>` +
        chip(s, 150, 24, 92, '合适自己 = 适当', CL.t, 40);
    }},
    attend: {dur: 6, hl: [8, 20], end: 60, lit: '把身子伸到现场', mean: '出席；照料', draw: s => {
      return GND() + `<rect x="200" y="20" width="90" height="50" rx="3" fill="#2f4f43"/><text x="245" y="50" font-size="11" font-weight="700" text-anchor="middle" fill="#f4f1e6">开会</text>` +
        [[150, CL.v], [190, CL.g], [230, CL.t]].map(([x, c]) => kid(x, 128, c, {k: .7}) + `<rect x="${x - 12}" y="108" width="24" height="5" fill="${WOOD}"/>`).join('') +
        `<g ${s.a(move([[8, -40, 0], [20, 64, 0]]))}>${kid(40, 128, CL.a, {k: .7, aR: [10, -44], ...walkLegs(s, 40, 128, 8, 20, 4, .7)})}</g>` +
        chip(s, 110, 40, 40, '到！', CL.a, 22) + `<g ${s.a(pop(26), ORG(270, 100))}><rect x="252" y="84" width="36" height="34" rx="2" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/><path d="M257 94l3 3 5-5M257 104l3 3 5-5M257 114l3 3 5-5" ${sk('#3fbf6a', 1.5)}/></g>` +
        chip(s, 90, 142, 64, '准时出席', CL.v, 40);
    }},
    consume: {dur: 6, hl: [8, 20], end: 60, lit: '全部拿光', mean: '消耗；消费；吃喝', draw: s => {
      return GND() + `<rect x="160" y="100" width="110" height="6" rx="2" fill="${WOOD}"/><path d="M170 106v22M260 106v22" ${sk(WOOD, 3)}/><ellipse cx="215" cy="98" rx="40" ry="6" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/>` +
        [0, 1, 2, 3].map(i => `<g ${s.a({0: 'opacity:1;' + T(), [10 + i * 8]: 'opacity:1;' + T(), [14 + i * 8]: 'opacity:0;' + T(-90, -14), 96: 'opacity:0;' + T(), 100: 'opacity:1;' + T()})}><path d="M${189 + i * 14} 96v-18h13v18z" fill="#f2c9a0"/><path d="M${189 + i * 14} 78h13" ${sk('#f2a3b3', 4)}/></g>`).join('') +
        kid(110, 128, CL.t, {noFace: true, aR: [20, -40]}) + face(110, 128) + `<path d="M104 82q6 6 12 0" ${sk(INK, 2)}/>` +
        `<g ${s.a(showAt(44))}><text x="215" y="82" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.m)}>空了</text></g>` +
        chip(s, 110, 30, 76, '一口气吃光', CL.a, 44);
    }},
    currently: {dur: 6, hl: [8, 40], end: 60, lit: '当前地', mean: '目前；现在', draw: s => {
      return `<rect x="40" y="30" width="220" height="80" rx="6" fill="#26324a"/>` +
        `<g ${s.a({0: 'opacity:1', 50: 'opacity:.2', 100: 'opacity:1'}, '', 1)}><circle cx="62" cy="50" r="6" fill="#e2473a"/></g><text x="74" y="54" font-size="11" font-weight="700" fill="#e2473a">LIVE</text>` +
        ['12:00', '12:01', '12:02'].map((t, i) => `<text x="150" y="88" font-size="26" font-weight="700" text-anchor="middle" fill="#7cf0b0" ${s.a(slot([0, 20, 40, 99], i))}>${t}</text>`).join('') +
        `<text x="236" y="54" font-size="9" font-weight="700" text-anchor="end" fill="#fff" ${s.a(showAt(8))}>正在进行中</text>` +
        chip(s, 150, 130, 76, '就在现在', CL.a, 40);
    }},
    detrimental: {dur: 6, hl: [8, 18, 30, 44], end: 60, lit: '磨坏了的', mean: '有害的', draw: s => {
      return GND() + `<rect x="100" y="80" width="100" height="48" rx="3" fill="${WOOD}" ${s.a({0: 'transform:scaleY(1)', 18: 'transform:scaleY(1)', 40: 'transform:scaleY(.55)', 92: 'transform:scaleY(.55)', 100: 'transform:scaleY(1)'}, FOOT)}/>` +
        `<g ${s.a({0: T(0, 0), 18: T(0, 0), 40: T(0, 22), 92: T(0, 22), 100: T(0, 0)})}><g ${s.a({0: T(-30, 0), 50: T(30, 0), 100: T(-30, 0)}, '', .5)}><rect x="120" y="66" width="60" height="14" rx="3" fill="#9a948c"/><path d="M124 80h52" ${sk('#6b6b6b', 3)} stroke-dasharray="2 2"/></g></g>` +
        [0, 1, 2, 3, 4].map(i => `<circle cx="${110 + i * 20}" cy="100" r="1.8" fill="#c8a06a" ${s.a({0: 'opacity:0;' + T(), [20 + i * 3]: 'opacity:0;' + T(), [21 + i * 3]: 'opacity:1;' + T(), [30 + i * 3]: 'opacity:0;' + T((i - 2) * 10, 26), 100: 'opacity:0'})}/>`).join('') +
        `<path d="M130 112l10 8 8-10 10 8" ${sk('#6b4428', 2)} ${s.a(showAt(40))}/>` +
        chip(s, 150, 30, 92, '磨坏了 = 有害', '#d23c2f', 44);
    }},
    ecological: {dur: 6, hl: [10, 40], end: 60, lit: '生态上的', mean: '生态的', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#e6f4e0"/>` + GND() + `<circle cx="150" cy="30" r="12" ${fl(CL.g)}/>` +
        `<g ${s.a(pop(10), ORG(70, 100))}><path d="M70 128V92" ${sk('#5a8f3a', 3)}/><path d="M70 108q-12-2-14-12q12 0 14 12zM70 100q12-2 14-12q-12 0-14 12z" fill="#3fbf6a"/></g>` +
        `<g ${s.a(pop(16), ORG(150, 110))}><ellipse cx="150" cy="116" rx="12" ry="8" fill="#e8e0d0"/><circle cx="140" cy="108" r="6" fill="#e8e0d0"/><path d="M137 102l-2-10M142 102l2-10" ${sk('#e8e0d0', 3)}/><circle cx="138" cy="107" r="1.2" fill="${INK}"/></g>` +
        `<g ${s.a(pop(22), ORG(230, 108))}><ellipse cx="230" cy="114" rx="16" ry="9" fill="#e2763a"/><path d="M214 106l-4-10 8 4z" fill="#e2763a"/><circle cx="218" cy="108" r="7" fill="#e2763a"/><path d="M246 114q12-2 14 8" ${sk('#e2763a', 4)}/><circle cx="216" cy="107" r="1.2" fill="${INK}"/></g>` +
        [[150, 42, 78, 88], [84, 100, 132, 108], [164, 110, 210, 108]].map(([a, b, c, d], i) => `<path d="M${a} ${b}L${c} ${d}" ${sk(CL.v, 2)} ${DASH} ${s.a(drawP(26 + i * 4, 32 + i * 4))}/>`).join('') +
        `<path d="M236 96Q190 40 162 34" ${sk(CL.v, 2)} stroke-dasharray="4 4" ${s.a(fadeP(38, 44))}/>` +
        chip(s, 230, 30, 92, '一环扣一环', CL.t, 44);
    }},
    // ---------- 第四十二批 ----------
    eliminate: {dur: 6, hl: [20, 10, 40], end: 60, lit: '赶出门槛外', mean: '消除；淘汰', draw: s => {
      return GND() + `<path d="M200 128V40h60v88" ${fl(CL.m, .2)}/><rect x="196" y="120" width="68" height="8" fill="${WOOD}"/><path d="M200 40h60" ${sk(CL.m, 3)}/>` +
        [[120, CL.t], [150, CL.v], [176, CL.g]].map(([x, c]) => kid(x, 128, c, {k: .7})).join('') +
        `<g ${s.a(move([[10, 0, 0], [20, 0, 0], [38, -250, 0]]))}>${kid(230, 128, '#9a948c', {k: .7, noFace: true, ...walkLegs(s, 230, 128, 20, 38, 8, .7)})}${face(230, 128, .7, 'sad')}</g>` +
        `<g ${s.a(showAt(10, 30))}><path d="M210 50l40 40M250 50l-40 40" ${sk('#d23c2f', 4)}/></g>` +
        chip(s, 230, 22, 64, '淘汰出局', '#d23c2f', 22) + chip(s, 90, 30, 92, '赶出门外 = 消除', CL.v, 40);
    }},
    extreme: {dur: 6, hl: [10, 30], end: 60, lit: '最外边的', mean: '极端的；极度的', draw: s => {
      return `<rect x="0" y="0" width="80" height="150" fill="#bfe1f2"/><rect x="220" y="0" width="80" height="150" fill="#f6c9a0"/>` +
        `<path d="M10 128l14-24 14 24zM40 128l12-20 12 20z" fill="#fff"/><circle cx="260" cy="30" r="16" fill="#f29a2e"/><path d="M236 128q12-10 24 0q12-10 24 0" ${sk('#e2a34a', 3)}/>` +
        `<path d="M90 76H210" ${sk(CL.m, 10)} stroke-linecap="round"/><path d="M90 76H210" ${sk('#fff', 4)} stroke-linecap="round"/>` +
        `<g ${s.a({0: T(), 10: T(), 22: T(-56, 0), 26: T(-56, 0), 38: T(56, 0), 92: T(56, 0), 100: T()})}><circle cx="150" cy="76" r="9" fill="#d23c2f"/></g>` +
        `<text x="40" y="60" font-size="12" font-weight="700" text-anchor="middle" fill="#2f5d8a" ${s.a(showAt(22))}>-50℃</text><text x="260" y="70" font-size="12" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(showAt(38))}>+50℃</text>` +
        chip(s, 150, 30, 84, '最两头 = 极端', CL.a, 40);
    }},
    extremely: {dur: 6, hl: [10, 40], end: 60, lit: '极其地', mean: '极其；非常', draw: s => {
      return GND() + kid(80, 128, CL.t, {noFace: true, aR: [18, -40]}) + `<path d="M98 90q4-14 10-14q2 10-10 14z" fill="#e2473a"/>` +
        `<g ${s.a(hideAt(20))}>${face(80, 128)}</g><g ${s.a(showAt(20))}>${face(80, 128, 1, 'sad')}<path d="M74 84q6 4 12 0" fill="#e2473a"/></g>` +
        `<g ${s.a(showAt(24))}><path d="M66 64q-4-8 0-12M94 64q4-8 0-12" ${sk('#e2473a', 2.5)}/></g>` +
        `<rect x="200" y="20" width="30" height="100" rx="6" ${fs(CL.p, CL.m, 2)}/>` + [0, 1, 2, 3, 4].map(i => `<rect x="204" y="${100 - i * 19}" width="22" height="15" rx="3" fill="${['#f6d34a', '#f2b632', '#f29a2e', '#e2763a', '#e2473a'][i]}" ${s.a(showAt(10 + i * 4))}/>`).join('') +
        `<g ${s.a({0: 'opacity:0;transform:scale(.4)', 30: 'opacity:0;transform:scale(.4)', 32: 'opacity:1;transform:scale(1.2)', 34: 'opacity:1;transform:scale(1)', 92: 'opacity:1', 100: 'opacity:0'}, ORG(215, 12))}>${burst(215, 12, 12).replace('<path ', `<path ${sk('#e2473a', 2.5)} `)}</g>` +
        `<text x="215" y="138" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>辣度</text>` + chip(s, 150, 30, 64, '辣到爆表', '#d23c2f', 40);
    }},
    holiday: {dur: 6, hl: [10, 30], end: 60, lit: '神圣的日子', mean: '假期；节日', draw: s => {
      return GND() + `<rect x="40" y="20" width="110" height="96" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><rect x="40" y="20" width="110" height="18" rx="4" fill="#d23c2f"/><text x="95" y="33" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">十月</text>` +
        [...Array(14)].map((_, i) => { const x = 54 + (i % 7) * 14, y = 52 + Math.floor(i / 7) * 18, red = i < 7; return `<text x="${x}" y="${y}" font-size="9" font-weight="700" text-anchor="middle" fill="${red ? '#d23c2f' : '#9a948c'}" ${red ? s.a(pop(10 + i), ORG(x, y - 3)) : ''}>${i + 1}</text>`; }).join('') +
        `<g ${s.a(showAt(18))}><rect x="48" y="40" width="96" height="16" rx="4" fill="none" style="stroke:#d23c2f;stroke-width:2px"/></g><text x="95" y="96" font-size="11" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(showAt(24))}>放假 7 天</text>` +
        `<g ${s.a(move([[30, 0, 0], [44, 30, 0]]))}>${kid(220, 128, CL.t, {aL: [-14, -56], aR: [14, -56], ...walkLegs(s, 220, 128, 30, 44, 4)})}</g><g ${s.a(pop(34), ORG(240, 40))}>${sparkle(222, 40, 6)}${sparkle(262, 36, 5)}</g>` +
        chip(s, 240, 22, 52, '放假啦', CL.a, 30);
    }},
    ideal: {dur: 6, hl: [10, 40], end: 60, lit: '心中最好的', mean: '理想的；完美的', draw: s => {
      return GND() + kid(70, 128, CL.v, {aR: [10, -46]}) +
        `<circle cx="96" cy="58" r="3" fill="#fff" style="stroke:var(--ink3);stroke-width:1px" ${s.a(showAt(8))}/><circle cx="106" cy="48" r="5" fill="#fff" style="stroke:var(--ink3);stroke-width:1px" ${s.a(showAt(9))}/>` +
        `<g ${s.a(pop(10), ORG(190, 60))}><path d="M126 30a20 20 0 0 1 30-14 26 26 0 0 1 48 2 22 22 0 0 1 30 24 18 18 0 0 1-12 32H134a18 18 0 0 1-8-44z" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/>` +
        `<path d="M160 76V52h40v24z" fill="#f4e6c8"/><path d="M154 52l26-18 26 18z" fill="#d23c2f"/><rect x="174" y="62" width="10" height="14" fill="${WOOD}"/><circle cx="216" cy="66" r="8" fill="#3fbf6a"/><path d="M216 74v6" ${sk(WOOD, 2)}/><circle cx="140" cy="44" r="6" ${fl(CL.g)}/></g>` +
        `<g ${s.a(pop(30), ORG(190, 20))}>${star5(150, 22, 6, 2.6, CL.g)}${star5(232, 20, 5, 2.2, CL.g)}</g>` +
        chip(s, 190, 128, 76, '梦想中的家', CL.v, 40);
    }},
    illness: {dur: 6, hl: [10, 40], end: 60, lit: '生病的状态', mean: '疾病', draw: s => {
      return GND() + `<rect x="60" y="96" width="150" height="16" rx="3" fill="#9fb3c8"/><path d="M64 112v16M206 112v16" ${sk('#6b7a8a', 4)}/><rect x="56" y="76" width="10" height="40" rx="3" fill="#6b7a8a"/>` +
        `<circle cx="84" cy="88" r="11" fill="${SKIN}"/><path d="M73 87a11 11 0 0 1 22 0q-5-4-11-3t-11 3z" fill="${HAIR}"/><path d="M80 92q4-3 8 0" ${sk(INK, 1.5)}/><path d="M79 86h3M86 86h3" ${sk(INK, 1.5)}/>` +
        `<path d="M96 92h110v6H96z" fill="#f4f1e6"/><rect x="74" y="74" width="22" height="7" rx="2" fill="#fff" style="stroke:#9fd0ee;stroke-width:1px"/>` +
        `<g ${s.a(pop(10), ORG(108, 78))}><rect x="104" y="64" width="5" height="18" rx="2" ${fs(CL.p, CL.m, 1)}/><circle cx="106.5" cy="84" r="3" fill="#e2473a"/></g><text x="124" y="70" font-size="10" font-weight="700" fill="#e2473a" ${s.a(showAt(14))}>39℃</text>` +
        `<g ${s.a(pop(26), ORG(240, 100))}><rect x="230" y="96" width="20" height="28" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M234 104h12M240 98v12" ${sk('#e2473a', 2.5)}/></g>` +
        `<g ${s.a(showAt(20))}><path d="M84 66q-4-6 2-10M92 64q2-6 8-6" ${sk('#6db7e8', 2)}/></g>` +
        chip(s, 150, 30, 76, '生病躺床上', CL.a, 40);
    }},
    impossible: {dur: 6, hl: [8, 20], end: 60, lit: '不可能的', mean: '不可能的', draw: s => {
      const push = {0: T(), 10: T(), 13: T(4, 0), 16: T(), 19: T(4, 0), 22: T(), 25: T(4, 0), 28: T(), 100: T()};
      return GND() + `<path d="M150 128L220 36L300 128z" fill="#9a948c"/><path d="M220 36l-14 20 14-6 10 14z" fill="#fff"/>` +
        `<g ${s.a(push)}>${kid(130, 128, CL.t, {noFace: true, aR: [26, -34], aL: [22, -40]})}${face(130, 128, 1, 'sad')}<path d="M138 66q-2 5 0 7" ${sk('#6db7e8', 2)}/></g>` +
        `<g ${s.a(showAt(30))}><circle cx="70" cy="60" r="22" ${sk('#d23c2f', 4)}/><path d="M54 76l32-32" ${sk('#d23c2f', 4)}/></g>` +
        chip(s, 70, 104, 92, '推不动 = 不可能', '#d23c2f', 36);
    }},
    initial: {dur: 6, hl: [8, 16, 40], end: 60, lit: '刚迈进门的', mean: '最初的；开始的', draw: s => {
      return GND() + `<rect x="150" y="40" width="54" height="88" fill="#efe4d2" style="stroke:var(--ink3);stroke-width:2px"/><rect x="156" y="46" width="42" height="82" fill="#3a2e28" ${s.a({0: 'transform:scaleX(1)', 8: 'transform:scaleX(1)', 14: 'transform:scaleX(.15)', 92: 'transform:scaleX(.15)', 100: 'transform:scaleX(1)'}, 'transform-origin:0% 50%;transform-box:fill-box')}/>` +
        `<g ${s.a(move([[16, 0, 0], [30, 60, 0]]))}>${kid(110, 128, CL.t, {...walkLegs(s, 110, 128, 16, 30, 3)})}</g>` +
        `<g ${s.a(pop(30), ORG(176, 124))}><ellipse cx="176" cy="132" rx="10" ry="4" ${fl(CL.a)}/><text x="176" y="146" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.a)}>第一步</text></g>` +
        `<g ${s.a(pop(8), ORG(254, 40))}><rect x="226" y="24" width="56" height="34" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><text x="254" y="46" font-size="14" font-weight="700" text-anchor="middle" ${fl(CL.v)}>Z.M.</text></g><text x="254" y="72" font-size="8" text-anchor="middle" ${fl(CL.m)} ${s.a(showAt(10))}>首字母</text>` +
        chip(s, 70, 30, 76, '最开始的', CL.a, 40);
    }},
    moral: {dur: 6, hl: [8, 40], end: 60, lit: '风俗的规矩', mean: '道德的；寓意', draw: s => {
      return `<rect x="0" y="106" width="300" height="30" fill="#6b6b6b"/>` + [20, 50, 80, 110, 140, 170, 200, 230, 260].map(x => `<rect x="${x}" y="110" width="16" height="22" fill="#fff"/>`).join('') +
        `<g ${s.a(move([[8, 0, 0], [40, 150, 0]]))}>${kid(60, 112, '#8b7a6a', {k: .9, aR: [16, -30], ...walkLegs(s, 60, 112, 8, 40, 8, .9)})}<path d="M76 88v24" ${sk(WOOD, 2.5)}/></g>` +
        `<g ${s.a(move([[8, 0, 0], [40, 150, 0]]))}>${kid(36, 112, CL.t, {k: .8, aR: [12, -26], ...walkLegs(s, 36, 112, 8, 40, 8, .8)})}</g>` +
        `<g ${s.a(pop(42), ORG(200, 50))}>${heartAt(200, 46, .9)}</g>` + chip(s, 150, 26, 92, '扶老人过马路', CL.t, 40);
    }},
    multiple: {dur: 6, hl: [10, 20], end: 60, lit: '好多倍的', mean: '多重的；多样的', draw: s => {
      const apple = (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="#e2473a"/><path d="M${x} ${y - 9}q2-4 5-4" ${sk('#3f8f4f', 2)}/>`;
      return `<g ${s.a(pop(4), ORG(50, 76))}>${apple(50, 76)}</g><text x="86" y="82" font-size="20" font-weight="700" text-anchor="middle" ${fl(CL.a)} ${s.a(pop(10), ORG(86, 76))}>× 6</text>` +
        [...Array(6)].map((_, i) => `<g ${s.a(moveIn([[20 + i * 2, 50, 76], [26 + i * 2, 150 + (i % 3) * 40, 52 + Math.floor(i / 3) * 40]]))}><g transform="translate(-50 -76)">${apple(50, 76)}</g></g>`).join('') +
        chip(s, 150, 132, 76, '一变成好多', CL.a, 40);
    }},
    normal: {dur: 6, hl: [10, 40], end: 60, lit: '合乎标准的', mean: '正常的；标准的', draw: s => {
      return `<rect x="40" y="30" width="220" height="80" rx="6" fill="#26324a"/><path d="M40 70H260" ${sk('#3fbf6a', 1, .4)} stroke-dasharray="4 4"/>` +
        `<path d="M50 70h40l6-20 8 40 8-30 6 10h40l6-20 8 40 8-30 6 10h40" ${sk('#7cf0b0', 2.5)} ${DASH} ${s.a(drawP(10, 36))}/>` +
        `<text x="230" y="48" font-size="11" font-weight="700" text-anchor="end" fill="#7cf0b0" ${s.a(showAt(20))}>心率 72</text>` +
        `<g ${s.a(pop(40), ORG(150, 130))}><rect x="112" y="120" width="76" height="20" rx="6" fill="#3fbf6a"/><text x="150" y="134" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">一切正常</text></g>`;
    }},
    opinion: {dur: 6, hl: [8, 30], end: 60, lit: '心里认为的', mean: '意见；看法', draw: s => {
      return GND() + [[60, CL.t, '好吃！', 10], [150, CL.v, '太甜了', 18], [240, CL.a, '一般般', 26]].map(([x, c, t, p]) => kid(x, 128, c, {k: .9}) + chip(s, x, 44, 56, t, c, p)).join('') +
        `<path d="M150 108l-8-4 8-4 8 4z" fill="#f2c9a0"/>` + chip(s, 150, 142, 96, '各有各的看法', CL.k, 40);
    }},
    // ---------- 第四十三批 ----------
    perceive: {dur: 6, hl: [8, 20], end: 60, lit: '全都收进脑子里', mean: '察觉；认为', draw: s => {
      const cat = `<ellipse cx="110" cy="112" rx="24" ry="14" fill="#8b8b8b"/><circle cx="86" cy="98" r="12" fill="#8b8b8b"/><circle cx="82" cy="96" r="2" fill="#f6d34a"/><circle cx="90" cy="96" r="2" fill="#f6d34a"/><path d="M134 110q16-4 14-22" ${sk('#8b8b8b', 5)}/>`;
      return GND() + cat + `<g ${s.a({0: 'transform:scaleY(.4)', 8: 'transform:scaleY(.4)', 12: 'transform:scaleY(1.1)', 14: 'transform:scaleY(1)', 92: 'transform:scaleY(1)', 100: 'transform:scaleY(.4)'}, 'transform-origin:50% 100%;transform-box:fill-box')}><path d="M76 90l2-14 8 8zM88 84l8-8 2 14z" fill="#8b8b8b"/></g>` +
        `<g ${s.a(moveIn([[6, 30, 0], [14, 0, 0]]))}><ellipse cx="250" cy="122" rx="10" ry="6" fill="#c8c0b0"/><circle cx="242" cy="118" r="5" fill="#c8c0b0"/><path d="M260 122q8 0 10-6" ${sk('#c8c0b0', 2)}/></g>` +
        [0, 1, 2].map(i => `<path d="M${230 - i * 14} ${108 - i * 4}q-6 8 0 16" ${sk(CL.v, 2)} ${s.a({0: 'opacity:0', [8 + i * 3]: 'opacity:0', [10 + i * 3]: 'opacity:1', [24 + i * 3]: 'opacity:0', 100: 'opacity:0'})}/>`).join('') +
        `<text x="86" y="70" font-size="16" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(pop(20), ORG(86, 64))}>!</text>` +
        chip(s, 180, 40, 96, '一点动静都察觉到', CL.v, 36);
    }},
    psychological: {dur: 6, hl: [8, 16, 40], end: 60, lit: '心理上的', mean: '心理的；精神上的', draw: s => {
      return GND() + `<path d="M100 128v-20q-24-10-24-40q0-46 48-48q46 0 52 42l8 18-8 4v12q0 10-14 10h-12v22z" fill="#e8dcc8" style="stroke:var(--ink3);stroke-width:2px"/>` +
        `<g ${s.a(hideAt(30))}><path d="M100 54a8 8 0 0 1 12-8 10 10 0 0 1 18 3 7 7 0 0 1-1 14h-26a6 6 0 0 1-3-9z" fill="#5a6478"/><path d="M114 66l-4 8 6-2-4 8" ${sk('#f6d34a', 2)}/></g>` +
        `<g ${s.a(showAt(30))}><circle cx="118" cy="56" r="10" ${fl(CL.g)}/><path d="M118 40v-4M104 56h-4M132 56h4M108 46l-3-3M128 46l3-3" ${sk(CL.g, 2)}/></g>` +
        `<rect x="190" y="40" width="80" height="60" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><text x="230" y="56" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>心理压力</text>` +
        `<rect x="200" y="66" width="60" height="10" rx="5" ${fs(CL.p, CL.m, 1)}/><rect x="201" y="67" width="58" height="8" rx="4" fill="#e2473a" ${s.a({0: 'transform:scaleX(.9)', 20: 'transform:scaleX(.9)', 34: 'transform:scaleX(.2)', 92: 'transform:scaleX(.2)', 100: 'transform:scaleX(.9)'}, 'transform-origin:0% 50%;transform-box:fill-box')}/>` +
        chip(s, 230, 116, 92, '心里的天气变晴', CL.t, 40);
    }},
    rapid: {dur: 6, hl: [10, 30], end: 60, lit: '一把抓住的快', mean: '迅速的；快的', draw: s => {
      return GND() + `<rect x="120" y="70" width="60" height="6" rx="2" fill="${WOOD}"/><path d="M126 76v52M174 76v52" ${sk(WOOD, 3)}/>` +
        `<g ${s.a({0: 'opacity:1;' + T(0, 0, 'rotate(0deg)'), 10: 'opacity:1;' + T(0, 0, 'rotate(0deg)'), 12: 'opacity:1;' + T(14, 4, 'rotate(30deg)'), 20: 'opacity:1;' + T(30, 34, 'rotate(80deg)'), 24: 'opacity:1;' + T(30, 34, 'rotate(80deg)'), 30: 'opacity:1;' + T(34, 34, 'rotate(0deg)'), 92: 'opacity:1;' + T(34, 34, 'rotate(0deg)'), 100: 'opacity:1;' + T(0, 0, 'rotate(0deg)')}, ORG(170, 62))}><path d="M162 54h16l-2 16h-12z" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/></g>` +
        `<g ${s.a(move([[12, 0, 0], [20, 124, 0]]))}>${kid(70, 128, CL.t, {aR: [24, -28]})}<path d="M88 110h-14M90 98h-18" ${sk(CL.m, 2)} ${s.a(showAt(14, 22))}/></g>` +
        `<text x="236" y="40" font-size="16" font-weight="700" fill="#d23c2f" ${s.a(pop(22), ORG(240, 34))}>0.3 秒</text>` +
        chip(s, 236, 60, 64, '眼疾手快', CL.a, 30);
    }},
    rarely: {dur: 6, hl: [10, 40], end: 60, lit: '稀少地', mean: '很少；难得', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#1d2440" fill-opacity=".85"/>` + [[30, 30], [80, 110], [130, 20], [270, 120], [240, 20]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.5" fill="#fff"/>`).join('') +
        `<g ${s.a(moveIn([[10, 290, 20], [56, 20, 90]]))}><circle cx="0" cy="0" r="7" fill="#bfe1f2"/><path d="M6 -4L50 -30M6 0L54 -20M4 4L46 -10" ${sk('#bfe1f2', 3, .5)}/></g>` +
        ['1910', '1986', '2061'].map((t, i) => `<text x="${70 + i * 80}" y="138" font-size="11" font-weight="700" text-anchor="middle" fill="#f6e7a8" ${s.a(showAt(14 + i * 8))}>${t}</text>`).join('') +
        `<path d="M70 126H230" ${sk('#f6e7a8', 1.5, .6)} stroke-dasharray="3 4"/>` + chip(s, 150, 22, 92, '76 年才来一次', CL.a, 40);
    }},
    regardless: {dur: 6, hl: [20, 8], end: 60, lit: '看都不看', mean: '不管；不顾', draw: s => {
      return GND() + `<path d="M150 128V70" ${sk(WOOD, 3)}/><rect x="122" y="44" width="56" height="28" rx="3" fill="#f6d34a" style="stroke:#2b2b2b;stroke-width:1.5px"/><text x="150" y="62" font-size="10" font-weight="700" text-anchor="middle" fill="#2b2b2b">前方有雨</text>` +
        [0, 1, 2, 3, 4, 5].map(i => `<path d="M${170 + i * 22} 0l-5 12" ${sk('#6db7e8', 2)} ${s.a({0: T(0, -10), 100: T(-10, 150)}, `animation-delay:${i * .15}s;animation-timing-function:linear`, .9)}/>`).join('') +
        `<g ${s.a(move([[8, 0, 0], [48, 220, 0]]))}>${kid(40, 128, CL.t, {aR: [16, -40], aL: [-14, -40], ...walkLegs(s, 40, 128, 8, 48, 12)})}<path d="M28 76l24 0" ${sk(INK, 3)} ${s.a(showAt(8))}/></g>` +
        chip(s, 80, 30, 92, '看都不看，照走', CL.a, 30);
    }},
    regularly: {dur: 6, hl: [8, 40], end: 60, lit: '按规律地', mean: '定期地；经常', draw: s => {
      return ['周一', '周二', '周三'].map((d, i) => { const x = 50 + i * 100, p = 8 + i * 10; return `<rect x="${x - 40}" y="20" width="80" height="110" rx="6" ${fs(CL.p, CL.m, 1.5)}/><text x="${x}" y="36" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>${d}</text>` +
          `<circle cx="${x}" cy="62" r="16" fill="#fff" style="stroke:var(--ink);stroke-width:1.5px"/><path d="M${x} 62v-11M${x} 62l-9 4" ${sk(INK, 2)}/><text x="${x}" y="92" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.v)}>7:00</text>` +
          `<g ${s.a(pop(p), ORG(x, 112))}><path d="M${x - 10} 116l6-12 4 6 6-8 4 14z" fill="#3fbf6a"/><path d="M${x - 14} 118h28" ${sk(WOOD, 4)}/><path d="M${x + 12} 102q4-4 8 0" ${sk('#6db7e8', 2)}/></g>`; }).join('') +
        chip(s, 150, 142, 104, '每天 7 点准时浇花', CL.t, 40);
    }},
    reliable: {dur: 6, hl: [10, 30], end: 60, lit: '能依靠的', mean: '可靠的', draw: s => {
      return GND() + `<g ${s.a({0: R(0), 10: R(0), 22: R(-40), 92: R(-40), 100: R(0)}, ORG(130, 128))}>${kid(130, 128, CL.a, {noFace: true, aL: [-6, -30], aR: [6, -30]})}<path d="M124 76q2-3 4 0M132 76q2-3 4 0" ${sk(INK, 1.8)}/></g>` +
        kid(84, 128, '#3d4a5c', {k: 1.1, aR: [26, -44]}) +
        `<g ${s.a(pop(24), ORG(104, 60))}><circle cx="104" cy="60" r="10" fill="#3fbf6a"/><path d="M99 60l3.5 3.5 6.5-7" ${sk('#fff', 2.5)}/></g>` +
        chip(s, 220, 40, 64, '放心倒吧', '#3d4a5c', 8) + chip(s, 220, 70, 92, '一定接得住 = 可靠', CL.t, 30);
    }},
    smartphone: {dur: 6, hl: [8, 20], end: 60, lit: '聪明的电话', mean: '智能手机', draw: s => {
      const icons = [[132, 48, CL.a, '导航'], [168, 48, CL.t, '支付'], [132, 84, CL.v, '翻译'], [168, 84, CL.g, '相机']];
      return `<rect x="112" y="16" width="76" height="124" rx="10" fill="#2b2b2b"/><rect x="118" y="26" width="64" height="104" rx="3" fill="#eef6fb"/>` +
        `<g ${s.a(pop(8), ORG(150, 22))}><path d="M140 18q-6-10 4-14q6-4 12 2q8-2 8 6q4 6-4 8z" fill="#f2a3b3"/></g>` +
        icons.map(([x, y, c, t], i) => `<g ${s.a(pop(20 + i * 4), ORG(x, y))}><rect x="${x - 13}" y="${y - 13}" width="26" height="26" rx="6" ${fl(c)}/><text x="${x}" y="${y + 4}" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">${t}</text></g>`).join('') +
        kid(56, 128, CL.t, {aR: [22, -40]}) + `<text x="56" y="56" font-size="12" font-weight="700" text-anchor="middle" ${fl(CL.a)} ${s.a(pop(36), ORG(56, 52))}>哇！</text>` +
        chip(s, 246, 60, 80, '会思考的手机', CL.v, 36);
    }},
    universal: {dur: 6, hl: [10, 40], end: 60, lit: '宇宙通用的', mean: '普遍的；全世界的', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#1d2440" fill-opacity=".85"/>` + [[40, 30, 16, '#6db7e8'], [250, 40, 20, '#f29a2e'], [80, 110, 14, '#9b7fd0'], [230, 112, 16, '#3fbf6a']].map(([x, y, r, c], i) => `<g ${s.a(pop(6 + i * 3), ORG(x, y))}><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><g ${s.a(showAt(24 + i * 3))}><circle cx="${x - r / 3}" cy="${y - 2}" r="1.8" fill="#fff"/><circle cx="${x + r / 3}" cy="${y - 2}" r="1.8" fill="#fff"/><path d="M${x - r / 3} ${y + 4}q${r / 3} ${r / 3} ${r * 2 / 3} 0" ${sk('#fff', 1.8)}/></g></g>`).join('') +
        `<g ${s.a(pop(18), ORG(150, 76))}><circle cx="150" cy="76" r="22" fill="#f6d34a"/><circle cx="142" cy="70" r="3" fill="${INK}"/><circle cx="158" cy="70" r="3" fill="${INK}"/><path d="M140 82q10 10 20 0" ${sk(INK, 2.5)}/></g>` +
        chip(s, 150, 132, 104, '笑容到哪儿都通用', CL.a, 40);
    }},
    virtue: {dur: 6, hl: [10, 40], end: 60, lit: '品格的力量', mean: '美德；优点', draw: s => {
      return GND() + `<g ${s.a({0: 'opacity:1;' + T(), 10: 'opacity:1;' + T(), 18: 'opacity:1;' + T(0, -24), 26: 'opacity:1;' + T(56, -24), 30: 'opacity:0;' + T(56, -24), 96: 'opacity:0', 100: 'opacity:1;' + T()})}><rect x="158" y="120" width="18" height="10" rx="2" fill="#8b5a3a"/></g>` +
        `<g ${s.a(move([[10, 0, 0], [24, 50, 0]]))}>${kid(100, 128, CL.t, {aR: [16, -40], ...walkLegs(s, 100, 128, 10, 24, 4)})}</g>` +
        kid(240, 128, '#8b7a6a', {aL: [-14, -32]}) + chip(s, 240, 40, 56, '谢谢你', '#8b7a6a', 30) +
        `<g ${s.a(showAt(34))}><ellipse cx="150" cy="58" rx="12" ry="4" ${sk(CL.g, 3)}/><circle cx="150" cy="96" r="30" fill="#f6d34a" fill-opacity=".2"/></g>` +
        chip(s, 150, 142, 92, '拾金不昧 = 美德', CL.a, 40);
    }},
    visitor: {dur: 6, hl: [10, 40], end: 60, lit: '来参观的人', mean: '游客；访客', draw: s => {
      return GND() + `<rect x="180" y="20" width="110" height="108" fill="#efe4d2" style="stroke:var(--ink3);stroke-width:2px"/><rect x="214" y="76" width="40" height="52" fill="${WOOD}"/><rect x="200" y="30" width="70" height="18" rx="3" fill="#2f5d8a"/><text x="235" y="43" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">科技馆</text>` +
        `<rect x="140" y="96" width="34" height="6" fill="${WOOD}"/><path d="M146 102v26M168 102v26" ${sk(WOOD, 3)}/><rect x="144" y="88" width="26" height="8" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/>` +
        `<path d="M148 92h6M156 92h8" ${sk(CL.v, 1.2)} ${s.a(showAt(24))}/>` +
        [[30, CL.t, 4], [60, CL.v, 8], [90, CL.a, 12]].map(([x, c, p], i) => `<g ${s.a(moveIn([[p, -60, 0], [p + 12, 40 - i * 6, 0]]))}>${kid(x, 128, c, {k: .8, aR: [12, -22], ...walkLegs(s, x, 128, p, p + 12, 4, .8)})}<path d="M${x + 6} 114v-10" ${sk(INK, 1.5)}/><rect x="${x + 2}" y="100" width="8" height="6" rx="1" fill="#d23c2f"/></g>`).join('') +
        chip(s, 80, 30, 84, '访客请登记', CL.v, 24) + chip(s, 236, 140, 84, '来参观的人', CL.a, 40);
    }},
    aesthetic: {dur: 6, hl: [10, 40], end: 60, lit: '对美的感觉', mean: '审美的；美学的', draw: s => {
      return GND() + `<path d="M140 128h40l-6-40h-28z" fill="#9fd0ee" style="stroke:#6db7e8;stroke-width:1.5px"/>` +
        [[-24, 40, '#e2473a', 10], [0, 50, '#f6d34a', 14], [22, 42, '#f2a3b3', 18], [-10, 30, '#9b7fd0', 22], [12, 28, '#e2763a', 26]].map(([dx, h, c, p]) => `<g ${s.a(growY(p, p + 8), FOOT)}><path d="M160 90L${160 + dx} ${90 - h}" ${sk('#3f8f4f', 2)}/><circle cx="${160 + dx}" cy="${90 - h}" r="8" fill="${c}"/></g>`).join('') +
        kid(70, 128, CL.v, {noFace: true, aR: [10, -46]}) + `<g ${s.a(hideAt(34))}>${face(70, 128)}</g><g ${s.a(showAt(34))}>${heartAt(66, 74, .28, '#e2473a')}${heartAt(74, 74, .28, '#e2473a')}<path d="M66 82q4 4 8 0" ${sk(INK, 1.6)}/></g>` +
        `<g ${s.a(pop(36), ORG(160, 30))}>${sparkle(132, 30, 6)}${sparkle(190, 34, 5)}</g>` +
        chip(s, 236, 60, 92, '一眼就觉得美', CL.v, 40);
    }},
    // ---------- 第四十四批 ----------
    agreement: {dur: 6, hl: [10, 40], end: 60, lit: '同意的结果', mean: '协议；同意', draw: s => {
      return GND() + kid(90, 128, '#3d4a5c', {aR: [24, -36]}) + kid(210, 128, CL.t, {aL: [-24, -36]}) +
        `<rect x="128" y="94" width="44" height="6" rx="2" fill="${WOOD}"/><path d="M134 100v28M166 100v28" ${sk(WOOD, 3)}/>` +
        `<g ${s.a(pop(8), ORG(150, 70))}><rect x="130" y="52" width="40" height="40" rx="2" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><text x="150" y="64" font-size="8" font-weight="700" text-anchor="middle" ${fl(CL.k)}>协议</text><path d="M136 70h28M136 76h22" ${sk(CL.m, 1.2, .6)}/></g>` +
        `<path d="M136 86q4-4 8 0t8 0" ${sk(CL.v, 1.5)} ${DASH} ${s.a(drawP(18, 24))}/><path d="M154 86q4-4 8 0" ${sk(CL.a, 1.5)} ${DASH} ${s.a(drawP(26, 30))}/>` +
        `<g ${s.a(showAt(34))}><path d="M114 92q36 12 72 0" ${sk(SKIN, 5)}/></g><g ${s.a(showAt(36, 44))}>${burst(150, 94, 10).replace('<path ', `<path ${sk(CL.g, 2)} `)}</g>` +
        chip(s, 150, 28, 76, '签字握手', CL.a, 40);
    }},
    alleviate: {dur: 6, hl: [8, 18, 40], end: 60, lit: '使变轻', mean: '减轻；缓解', draw: s => {
      const bricks = [0, 1, 2, 3];
      return GND() + `<g ${s.a({0: R(18), 16: R(18), 40: R(0), 92: R(0), 100: R(18)}, ORG(120, 128))}>${kid(120, 128, CL.t, {noFace: true})}<g ${s.a(hideAt(36))}>${face(120, 128, 1, 'sad')}</g><g ${s.a(showAt(36))}>${face(120, 128)}</g>` +
        `<rect x="92" y="82" width="20" height="34" rx="4" fill="#5a7a9a"/>` + bricks.map(i => `<g ${s.a({0: 'opacity:1;' + T(), [16 + i * 6]: 'opacity:1;' + T(), [20 + i * 6]: 'opacity:0;' + T(120 - i * 10, -20 - i * 4), 96: 'opacity:0', 100: 'opacity:1;' + T()})}><rect x="94" y="${74 - i * 9}" width="16" height="8" fill="#c8664a"/></g>`).join('') + `</g>` +
        bricks.map(i => `<rect x="${210 + (i % 2) * 18}" y="${120 - Math.floor(i / 2) * 9}" width="16" height="8" fill="#c8664a" ${s.a(showAt(20 + i * 6))}/>`).join('') +
        chip(s, 150, 30, 88, '肩膀越来越轻', CL.t, 40);
    }},
    alternative: {dur: 6, hl: [10, 30], end: 60, lit: '另一个选择', mean: '选择；替代方案', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#dff2e0"/><path d="M0 96H300" ${sk('#c8c0b0', 18)}/><path d="M100 96Q150 20 220 96" ${sk('#c8c0b0', 14)}/>` +
        `<g ${s.a(pop(10), ORG(160, 96))}><rect x="148" y="84" width="24" height="24" fill="#f2b632"/><path d="M148 84l24 24M172 84l-24 24" ${sk('#2b2b2b', 3)}/></g>` +
        `<path d="M100 96Q150 20 220 96" ${sk(CL.a, 3)} stroke-dasharray="6 5" ${s.a(fadeP(26, 32))}/>` +
        `<g ${s.a(moveIn([[4, 20, 96], [14, 92, 96], [22, 100, 92], [30, 130, 60], [36, 160, 52], [42, 192, 64], [48, 222, 96], [54, 280, 96]]))}><rect x="-12" y="-8" width="24" height="12" rx="3" fill="#2f5d8a"/><circle cx="-6" cy="5" r="3" fill="${INK}"/><circle cx="6" cy="5" r="3" fill="${INK}"/></g>` +
        chip(s, 70, 30, 64, '此路不通', '#d23c2f', 12) + chip(s, 236, 30, 92, '换条路 = 替代方案', CL.a, 30);
    }},
    antibiotic: {dur: 6, hl: [8, 18, 40], end: 60, lit: '对抗细菌的', mean: '抗生素', draw: s => {
      const bug = (x, y, a) => `<g transform="rotate(${a} ${x} ${y})"><rect x="${x - 10}" y="${y - 4}" width="20" height="8" rx="4" fill="#7cd44a" style="stroke:#3f8f4f;stroke-width:1.2px"/></g>`;
      const bugs = [[180, 50, 20], [230, 70, -30], [200, 100, 50], [250, 110, 10], [170, 84, -20]];
      return `<circle cx="210" cy="80" r="62" fill="#e8f6e0" style="stroke:var(--ink3);stroke-width:2px"/>` +
        bugs.map(([x, y, a], i) => `<g ${s.a({0: 'opacity:1;transform:scale(1)', [20 + i * 4]: 'opacity:1;transform:scale(1)', [24 + i * 4]: 'opacity:0;transform:scale(.2)', 96: 'opacity:0', 100: 'opacity:1;transform:scale(1)'}, ORG(x, y))}>${bug(x, y, a)}</g>`).join('') +
        `<g ${s.a(moveIn([[8, 60, 80], [18, 140, 80]]))}><rect x="-14" y="-6" width="28" height="12" rx="6" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><rect x="0" y="-6" width="14" height="12" rx="0" fill="#e2473a"/><path d="M14 -6a6 6 0 0 1 0 12" fill="#e2473a"/></g>` +
        [0, 1, 2].map(i => `<path d="M150 ${70 + i * 10}H${190 + i * 10}" ${sk('#e2473a', 2)} stroke-dasharray="4 4" ${s.a(fadeP(18 + i * 2, 22 + i * 2))}/>`).join('') +
        chip(s, 70, 30, 96, '药片消灭细菌', '#d23c2f', 40);
    }},
    capability: {dur: 6, hl: [8, 16, 40], end: 60, lit: '拿得住做得到', mean: '能力；性能', draw: s => {
      const lift = {0: T(0, 0), 8: T(0, 0), 16: T(0, 60), 20: T(0, 60), 34: T(0, 0), 92: T(0, 0), 100: T(0, 0)};
      return GND() + `<path d="M70 128V20M60 128h20" ${sk('#f2b632', 6)}/><path d="M64 20H210" ${sk('#f2b632', 5)}/><path d="M70 30L90 20M70 50L110 20" ${sk('#f2b632', 2)}/><rect x="150" y="20" width="24" height="6" fill="#556070"/>` +
        `<g ${s.a(lift)}><path d="M162 26V50" ${sk(INK, 1.5)}/><path d="M156 50h12l-6 8z" fill="#556070"/></g>` +
        `<g ${s.a({0: T(), 20: T(), 34: T(0, -60), 92: T(0, -60), 100: T()})}><path d="M162 108v-4" ${sk(INK, 1.5)}/><rect x="146" y="108" width="32" height="20" rx="2" fill="${WOOD}"/><text x="162" y="122" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">500kg</text></g>` +
        `<rect x="236" y="30" width="16" height="90" rx="4" ${fs(CL.p, CL.m, 1.5)}/><rect x="238" y="32" width="12" height="86" rx="3" fill="#3fbf6a" ${s.a(growY(20, 34), FOOT)}/><text x="244" y="134" font-size="8" font-weight="700" text-anchor="middle" ${fl(CL.m)}>能力</text>` +
        chip(s, 110, 140, 92, '吊得起 = 有能力', CL.a, 40);
    }},
    celebrate: {dur: 6, hl: [10, 30], end: 60, lit: '隆重地办', mean: '庆祝', draw: s => {
      return GND() + `<rect x="110" y="96" width="80" height="6" fill="${WOOD}"/><path d="M120 102v26M180 102v26" ${sk(WOOD, 3)}/>` +
        `<g ${s.a(pop(10), ORG(150, 80))}><rect x="128" y="76" width="44" height="20" rx="3" fill="#f2c9a0"/><path d="M128 82q22-8 44 0" ${sk('#f2a3b3', 4)}/>${[136, 150, 164].map(x => `<path d="M${x} 76v-10" ${sk('#9b7fd0', 2)}/><path d="M${x} 66q-3-5 0-8q3 3 0 8z" fill="#f29a2e" ${s.a({0: 'transform:scale(1)', 50: 'transform:scale(1.3,.8)', 100: 'transform:scale(1)'}, ORG(x, 66), .4)}/>`).join('')}</g>` +
        [[50, '#e2473a', 14], [250, '#4a90d0', 18], [80, '#f6d34a', 22]].map(([x, c, p]) => `<g ${s.a(moveIn([[p, 0, 30], [p + 14, 0, 0]]))}><ellipse cx="${x}" cy="40" rx="12" ry="15" fill="${c}"/><path d="M${x} 55q-4 20 2 40" ${sk(CL.m, 1)}/></g>`).join('') +
        [...Array(10)].map((_, i) => `<rect x="${60 + i * 20}" y="20" width="5" height="5" fill="${[CL.a, CL.g, CL.t, CL.v][i % 4]}" ${s.a({0: 'opacity:0;' + T(), [30 + i]: 'opacity:0;' + T(), [31 + i]: 'opacity:1;' + T(), [50 + i]: 'opacity:0;' + T((i % 3 - 1) * 10, 70, 'rotate(200deg)'), 100: 'opacity:0'})}/>`).join('') +
        kid(220, 128, CL.t, {aL: [-14, -56], aR: [14, -56]}) + chip(s, 150, 140, 76, '一起庆祝', CL.a, 30);
    }},
    chronic: {dur: 6, hl: [8, 30], end: 60, lit: '拖了很久的', mean: '慢性的；长期的', draw: s => {
      return GND() + kid(80, 128, CL.t, {noFace: true, aR: [10, -42]}) + face(80, 128, 1, 'sad') +
        [0, 1, 2].map(i => `<text x="104" y="${66 - i * 2}" font-size="9" font-weight="700" ${fl(CL.m)} ${s.a({0: 'opacity:0', [10 + i * 16]: 'opacity:0', [11 + i * 16]: 'opacity:1', [18 + i * 16]: 'opacity:0', 100: 'opacity:0'})}>咳咳</text>`).join('') +
        `<rect x="170" y="28" width="90" height="80" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><rect x="170" y="28" width="90" height="18" rx="4" fill="#d23c2f"/>` +
        ['1 月', '3 月', '6 月', '12 月'].map((t, i) => `<text x="215" y="41" font-size="10" font-weight="700" text-anchor="middle" fill="#fff" ${s.a(slot([0, 12, 22, 32, 99], i))}>${t}</text>`).join('') +
        `<text x="215" y="82" font-size="14" font-weight="700" text-anchor="middle" fill="#e2473a" ${s.a(showAt(30))}>还没好</text>` +
        chip(s, 150, 140, 92, '拖了很久 = 慢性', '#d23c2f', 40);
    }},
    conducive: {dur: 6, hl: [8, 20, 40], end: 60, lit: '往好处引的', mean: '有助于…的', draw: s => {
      return GND() + `<circle cx="250" cy="30" r="14" ${fl(CL.g)}/><path d="M80 128h40l-4-20h-32z" fill="${WOOD}"/>` +
        `<g ${s.a({0: R(-30), 20: R(-30), 40: R(20), 92: R(20), 100: R(-30)}, ORG(100, 108))}><g ${s.a(growY(8, 40), FOOT)}><path d="M100 108V50" ${sk('#5a8f3a', 3)}/><path d="M100 80q-12-2-14-10q12 0 14 10zM100 66q12-2 14-10q-12 0-14 10z" fill="#3fbf6a"/><circle cx="100" cy="48" r="6" fill="#f2a3b3"/></g></g>` +
        [0, 1, 2].map(i => `<path d="M${230 - i * 6} ${44 + i * 8}L${130 + i * 4} ${70 + i * 6}" ${sk(CL.g, 2.5)} ${DASH} ${s.a(drawP(20 + i * 3, 28 + i * 3))}/>`).join('') +
        chip(s, 200, 110, 96, '阳光有助于生长', CL.t, 40);
    }},
    critic: {dur: 6, hl: [10, 40], end: 60, lit: '下判断的人', mean: '评论家；批评者', draw: s => {
      return GND() + `<rect x="150" y="20" width="130" height="70" rx="3" fill="#2b2b2b"/><rect x="156" y="26" width="118" height="58" fill="#9fd0ee"/><path d="M156 84l30-30 20 18 20-16 48 28z" fill="#3f8f4f"/><path d="M230 128V90" ${sk('#2b2b2b', 3)}/>` +
        kid(80, 128, '#3d4a5c', {aR: [18, -36]}) + `<circle cx="76" cy="76" r="3.8" ${sk(INK, 1.2)}/><circle cx="84" cy="76" r="3.8" ${sk(INK, 1.2)}/><rect x="96" y="88" width="16" height="20" rx="1" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/>` +
        `<path d="M99 94h10M99 98h10M99 102h6" ${sk(CL.v, 1)} ${DASH} ${s.a(drawP(10, 26))}/>` +
        `<g ${s.a(pop(30), ORG(80, 36))}><rect x="46" y="22" width="68" height="28" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><text x="80" y="34" font-size="8" font-weight="700" text-anchor="middle" ${fl(CL.k)}>影评</text>${[0, 1, 2, 3, 4].map(i => star5(56 + i * 12, 42, 4, 1.8, i < 3 ? CL.g : '#d8d8d8')).join('')}</g>` +
        chip(s, 214, 112, 96, '下判断的人 = 评论家', CL.v, 40);
    }},
    email: {dur: 6, hl: [8, 20], end: 60, lit: '电子的信', mean: '电子邮件', draw: s => {
      return `<rect x="30" y="50" width="80" height="54" rx="4" fill="#2b2b2b"/><rect x="35" y="55" width="70" height="44" fill="#eef6fb"/><path d="M22 104h96l-6 8H28z" fill="#556070"/>` +
        `<rect x="230" y="40" width="42" height="74" rx="6" fill="#2b2b2b"/><rect x="234" y="48" width="34" height="58" fill="#eef6fb"/>` +
        `<g ${s.a(pop(8), ORG(70, 77))}><text x="70" y="84" font-size="18" font-weight="700" text-anchor="middle" ${fl(CL.v)}>@</text></g>` +
        `<g ${s.a(moveIn([[20, 70, 76], [26, 150, 36], [34, 251, 76]]))}><rect x="-12" y="-8" width="24" height="16" rx="2" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M-12 -8l12 9 12-9" ${sk(CL.m, 1.5)}/></g>` +
        `<path d="M110 70Q150 10 230 70" ${sk(CL.v, 1.5)} stroke-dasharray="4 4" ${s.a(fadeP(20, 26))}/>` +
        `<g ${s.a(pop(36), ORG(266, 46))}><circle cx="266" cy="46" r="7" fill="#e2473a"/><text x="266" y="49.5" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">1</text></g>` +
        chip(s, 150, 134, 84, '网上寄的信', CL.v, 40);
    }},
    failure: {dur: 6, hl: [10, 40], end: 60, lit: '失败这件事', mean: '失败；故障', draw: s => {
      const blocks = [[130, 116], [150, 116], [170, 116], [140, 100], [160, 100], [150, 84]];
      return GND() + blocks.map(([x, y], i) => `<g ${s.a({0: 'opacity:0;' + T(0, -40), [4 + i * 3]: 'opacity:0;' + T(0, -40), [6 + i * 3]: 'opacity:1;' + T(), 26: 'opacity:1;' + T(0, 0, 'rotate(0deg)'), 36: 'opacity:1;' + T((i % 3 - 1) * 40 + 10, 128 - y - 6, `rotate(${(i % 2 ? 1 : -1) * 70}deg)`), 92: 'opacity:1;' + T((i % 3 - 1) * 40 + 10, 128 - y - 6, `rotate(${(i % 2 ? 1 : -1) * 70}deg)`), 100: 'opacity:0'}, ORG(x, y))}><rect x="${x - 10}" y="${y - 8}" width="20" height="16" rx="2" fill="${[CL.a, CL.t, CL.v, CL.g, CL.a, CL.t][i]}"/></g>`).join('') +
        kid(70, 128, CL.t, {noFace: true}) + `<g ${s.a(hideAt(30))}>${face(70, 128)}</g><g ${s.a(showAt(30))}>${face(70, 128, 1, 'sad')}</g>` +
        `<text x="150" y="40" font-size="16" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(pop(30), ORG(150, 34))}>哗啦！</text>` +
        chip(s, 236, 40, 76, '搭塌了 = 失败', '#d23c2f', 40);
    }},
    greatly: {dur: 6, hl: [10, 40], end: 60, lit: '大大地', mean: '大大地；非常', draw: s => {
      return GND() + `<g ${s.a({0: 'transform:scale(.3)', 10: 'transform:scale(.3)', 40: 'transform:scale(1.4)', 92: 'transform:scale(1.4)', 100: 'transform:scale(.3)'}, ORG(150, 128))}><path d="M150 128V90" ${sk(WOOD, 6)}/><circle cx="150" cy="80" r="20" fill="#3f8f4f"/><circle cx="136" cy="90" r="12" fill="#4fa65c"/><circle cx="164" cy="90" r="12" fill="#4fa65c"/></g>` +
        kid(60, 128, CL.t, {k: .8, aR: [10, -44]}) + `<path d="M84 60l40-20" ${sk(CL.a, 2.5)} ${DASH} ${s.a(drawP(30, 40))}/><path d="M116 36l9 4-6 8" ${sk(CL.a, 2.5)} ${s.a(showAt(40))}/>` +
        chip(s, 236, 40, 76, '一下长大好多', CL.t, 40);
    }},
    // ---------- 第四十五批 ----------
    guideline: {dur: 6, hl: [8, 16], end: 60, lit: '引路的线', mean: '指导方针；准则', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#eef2f6"/><path d="M20 128H280" ${sk(CL.m, 2)}/>` +
        `<path d="M20 120H130Q160 120 170 96T220 70H280" ${sk('#f6d34a', 6)} ${DASH} ${s.a(drawP(8, 16))}/>` +
        `<g ${s.a(moveIn([[12, 20, 120], [28, 120, 120], [38, 170, 96], [48, 220, 70], [56, 256, 70]]))}><g transform="translate(-40 -128)">${kid(40, 128, CL.t, {k: .5})}</g></g>` +
        `<g ${s.a(pop(16), ORG(256, 40))}><rect x="230" y="26" width="52" height="26" rx="3" fill="#2f5d8a"/><text x="256" y="43" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">登机口</text></g>` +
        chip(s, 90, 30, 92, '跟着线走 = 准则', CL.a, 40);
    }},
    implement: {dur: 6, hl: [8, 16, 40], end: 60, lit: '把计划填满落地', mean: '实施；执行', draw: s => {
      return GND() + `<rect x="20" y="24" width="100" height="80" rx="3" fill="#2f5d8a"/><text x="70" y="38" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">计划</text><path d="M40 90V60l30-18 30 18v30z" ${sk('#fff', 1.5)} stroke-dasharray="3 3"/>` +
        `<path d="M126 64H160" ${sk(CL.a, 3)} ${s.a(showAt(14))}/><path d="M154 58l8 6-8 6" ${sk(CL.a, 3)} ${s.a(showAt(14))}/>` +
        `<g ${s.a(growY(16, 32), FOOT)}><rect x="186" y="78" width="80" height="50" fill="#f4e6c8"/><rect x="216" y="98" width="20" height="30" fill="${WOOD}"/></g><path d="M180 78l46-30 46 30z" fill="#d23c2f" ${s.a(moveIn([[32, 0, -30], [38, 0, 0]]))}/>` +
        `<g ${s.a(pop(40), ORG(272, 40))}><circle cx="272" cy="40" r="9" fill="#3fbf6a"/><path d="M268 40l3 3 5-6" ${sk('#fff', 2)}/></g>` +
        chip(s, 150, 142, 92, '照计划做出来', CL.t, 40);
    }},
    indeed: {dur: 6, hl: [8, 30], end: 60, lit: '事实上', mean: '的确；实际上', draw: s => {
      const bike = `<circle cx="-18" cy="0" r="12" ${sk(INK, 2.5)}/><circle cx="18" cy="0" r="12" ${sk(INK, 2.5)}/><path d="M-18 0L-4 -16H12L18 0M-4 -16L2 0" ${sk('#d23c2f', 3)}/>`;
      return GND() + [[220, CL.v], [260, CL.g]].map(([x, c]) => kid(x, 128, c, {k: .8}) + `<text x="${x}" y="70" font-size="13" font-weight="700" text-anchor="middle" ${fl(CL.m)} ${s.a(showAt(10, 30))}>?</text>`).join('') +
        chip(s, 60, 30, 84, '我真的会骑！', CL.t, 8) +
        `<g ${s.a(move([[16, 0, 0], [36, 100, 0]]))}><g transform="translate(60 116)">${bike}</g>${kid(60, 106, CL.t, {k: .8, aR: [12, -24], aL: [-6, -18]})}</g>` +
        `<g ${s.a(pop(36), ORG(240, 50))}><circle cx="240" cy="50" r="10" fill="#3fbf6a"/><path d="M235 50l3.5 3.5 6.5-7" ${sk('#fff', 2.5)}/></g>` + chip(s, 240, 30, 64, '的确会！', '#3fbf6a', 38);
    }},
    location: {dur: 6, hl: [8, 40], end: 60, lit: '所在的地方', mean: '位置；地点', draw: s => {
      return `<rect x="96" y="10" width="108" height="130" rx="10" fill="#2b2b2b"/><rect x="102" y="20" width="96" height="110" fill="#e6f4e0"/>` +
        `<path d="M102 60H198M102 100H198M130 20V130M170 20V130" ${sk('#fff', 6)}/><rect x="136" y="66" width="28" height="28" fill="#cfe2c8"/>` +
        `<g ${s.a(pop(8), ORG(150, 80))}><circle cx="150" cy="80" r="6" fill="#4a90d0" style="stroke:#fff;stroke-width:2px"/></g>` +
        `<circle cx="150" cy="80" r="6" ${sk('#4a90d0', 2)} ${s.a({0: 'opacity:0;transform:scale(1)', 10: 'opacity:1;transform:scale(1)', 30: 'opacity:0;transform:scale(3.5)', 31: 'opacity:1;transform:scale(1)', 50: 'opacity:0;transform:scale(3.5)', 100: 'opacity:0'}, ORG(150, 80))}/>` +
        chip(s, 150, 56, 64, '你在这里', '#4a90d0', 30) + chip(s, 250, 80, 76, '当前位置', CL.v, 40);
    }},
    mirror: {dur: 6, hl: [8, 30], end: 60, lit: '照着看的东西', mean: '镜子；反映', draw: s => {
      const wave = {0: R(0), 10: R(0), 14: R(-40), 18: R(0), 22: R(-40), 26: R(0), 100: R(0)}, wave2 = {0: R(0), 10: R(0), 14: R(40), 18: R(0), 22: R(40), 26: R(0), 100: R(0)};
      return GND() + `<rect x="146" y="20" width="10" height="108" fill="${WOOD}"/><rect x="156" y="20" width="110" height="108" fill="#dff2ff" style="stroke:${WOOD};stroke-width:4px"/>` +
        kid(100, 128, CL.t, {aR: [16, -50], armR: s.a(wave, shoulder(100, 128, 1))}) +
        `<g opacity=".6">${kid(212, 128, CL.t, {aL: [-16, -50], armL: s.a(wave2, shoulder(212, 128, -1))})}</g>` +
        `<path d="M170 40l20-14M176 60l26-18" ${sk('#fff', 3, .8)}/>` + chip(s, 210, 140, 84, '镜子里的我', CL.v, 30);
    }},
    musician: {dur: 6, hl: [10, 40], end: 60, lit: '搞音乐的人', mean: '音乐家', draw: s => {
      const strum = {0: R(0), 10: R(0), 100: R(0)}; for (let i = 1; i < 14; i++) strum[f1(10 + i * 3)] = R(i % 2 ? -20 : 0); strum[54] = R(0);
      const note = (x, y, c) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="3" ${fl(c)}/><path d="M${x + 3.5} ${y - 1}v-12q4 2 5 6" ${sk(c, 1.6)}/>`;
      return `<rect x="70" y="110" width="160" height="18" fill="${WOOD}"/>` + GND() + `<path d="M150 0L114 110h72z" fill="#f6e7a8" fill-opacity=".5"/>` +
        kid(150, 110, CL.v, {aL: [-6, -24], aR: [18, -24], armR: s.a(strum, shoulder(150, 110, 1))}) +
        `<ellipse cx="146" cy="92" rx="12" ry="9" fill="#d9a35b"/><circle cx="146" cy="92" r="3" fill="#6b4428"/><path d="M152 88l30-18" ${sk('#8b5a3a', 4)}/>` +
        [0, 1, 2, 3].map(i => `<g ${s.a({0: 'opacity:0;' + T(), [12 + i * 8]: 'opacity:0;' + T(), [14 + i * 8]: 'opacity:1;' + T(), [30 + i * 8]: 'opacity:0;' + T((i % 2 ? 1 : -1) * 40, -50), 100: 'opacity:0'})}>${note(160, 70, [CL.a, CL.t, CL.g, CL.v][i])}</g>`).join('') +
        chip(s, 70, 30, 76, '弹琴的人', CL.v, 40);
    }},
    nearly: {dur: 6, hl: [10, 40], end: 60, lit: '接近了', mean: '几乎；差不多', draw: s => {
      return `<rect x="40" y="60" width="220" height="24" rx="12" ${fs(CL.p, CL.m, 2)}/><rect x="43" y="63" width="214" height="18" rx="9" fill="#3fbf6a" ${s.a({0: 'transform:scaleX(0)', 10: 'transform:scaleX(0)', 36: 'transform:scaleX(.99)', 92: 'transform:scaleX(.99)', 100: 'transform:scaleX(0)'}, 'transform-origin:0% 50%;transform-box:fill-box')}/>` +
        ['0%', '50%', '99%'].map((t, i) => `<text x="150" y="50" font-size="16" font-weight="700" text-anchor="middle" ${fl(CL.k)} ${s.a(slot([0, 20, 36, 99], i))}>${t}</text>`).join('') +
        `<path d="M254 60v24" ${sk('#d23c2f', 2)} stroke-dasharray="2 2"/>` + chip(s, 150, 112, 84, '就差一点点', CL.a, 40);
    }},
    neighbor: {dur: 6, hl: [8, 30], end: 60, lit: '住在近处的人', mean: '邻居', draw: s => {
      return GND() + `<path d="M20 128V70h70v58" ${fl(CL.g, .4)}/><path d="M14 70l41-28 41 28z" fill="#d23c2f"/><path d="M210 128V70h70v58" ${fl(CL.v, .3)}/><path d="M204 70l41-28 41 28z" fill="#2f5d8a"/>` +
        `<path d="M110 128v-24M126 128v-24M142 128v-24M158 128v-24M174 128v-24M190 128v-24M104 110h92M104 120h92" ${sk(WOOD, 2.5)}/>` +
        kid(100, 128, CL.t, {aR: [16, -40]}) + kid(200, 128, CL.a, {aL: [-16, -40]}) +
        `<g ${s.a(moveIn([[20, 0, 0], [30, 80, 0]]))}><rect x="108" y="82" width="20" height="10" rx="2" fill="#f2c9a0"/><path d="M108 84q10-6 20 0" ${sk('#f2a3b3', 3)}/></g>` +
        chip(s, 100, 46, 40, '嗨！', CL.t, 8) + chip(s, 200, 46, 52, '谢谢！', CL.a, 30) + chip(s, 150, 22, 76, '住隔壁的人', CL.v, 40);
    }},
    obvious: {dur: 6, hl: [8, 16, 40], end: 60, lit: '横在路当中的', mean: '明显的', draw: s => {
      return `<rect x="0" y="100" width="300" height="28" fill="#c8c0b0"/>` + GND() +
        `<g ${s.a(pop(8), ORG(150, 80))}><circle cx="150" cy="80" r="34" fill="#e2473a"/><circle cx="138" cy="70" r="8" fill="#fff" fill-opacity=".4"/></g>` +
        [[50, CL.t], [250, CL.v]].map(([x, c], i) => kid(x, 128, c, {aL: i ? [-20, -50] : [-6, -20], aR: i ? [6, -20] : [20, -50]}) + `<text x="${x}" y="56" font-size="16" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(pop(20 + i * 2), ORG(x, 50))}>!</text>`).join('') +
        chip(s, 150, 22, 92, '一眼就看得到', CL.a, 40);
    }},
    perception: {dur: 6, hl: [8, 20, 40], end: 60, lit: '心里接收到的', mean: '感知；看法', draw: s => {
      return GND() + `<g ${s.a(pop(6), ORG(150, 60))}><path d="M130 50q10-20 34-12q16 6 14 24q-2 20-24 22q-18 2-22-12z" fill="#f4f1e6" style="stroke:var(--ink3);stroke-width:2px"/><path d="M130 50l-22-6 18 14z" fill="#f2b632"/><path d="M164 40q8-16 6-30M172 46q14-12 16-26" ${sk('var(--ink3)', 2)}/><circle cx="142" cy="50" r="3" fill="${INK}"/></g>` +
        kid(60, 128, CL.t) + kid(240, 128, CL.a) + chip(s, 60, 48, 64, '是只鸭子', CL.t, 20) + chip(s, 240, 48, 64, '是只兔子', CL.a, 26) +
        chip(s, 150, 142, 104, '同一张图不同看法', CL.v, 40);
    }},
    plateau: {dur: 6, hl: [8, 30], end: 60, lit: '高处的平地', mean: '高原；平台期', draw: s => {
      return `<path d="M0 128L70 50H170L240 128z" fill="#c9a26a"/><path d="M70 50H170" ${sk('#9fc3a0', 6)}/>` + GND() +
        `<g ${s.a(pop(8), ORG(120, 40))}><text x="120" y="42" font-size="10" font-weight="700" text-anchor="middle" fill="#8b5a3a">高原</text></g>` +
        `<path d="M196 20V100H290" ${sk(CL.m, 1.5)}/><path d="M200 96L228 50L276 46" ${sk(CL.a, 2.5)} ${DASH} ${s.a(drawP(30, 44))}/><text x="250" y="40" font-size="8" font-weight="700" text-anchor="middle" ${fl(CL.a)} ${s.a(showAt(42))}>平台期</text>` +
        chip(s, 120, 142, 92, '又高又平的一块', CL.t, 30);
    }},
    proportion: {dur: 6, hl: [8, 20], end: 60, lit: '按份来分', mean: '比例；部分', draw: s => {
      const cup = (x, c, p) => `<g ${s.a(pop(p), ORG(x, 104))}><path d="M${x - 12} 84h24l-3 32h-18z" fill="${c}" style="stroke:var(--ink3);stroke-width:1.5px"/></g>`;
      return GND() + cup(40, '#f29a2e', 8) + `<text x="70" y="108" font-size="16" font-weight="700" text-anchor="middle" ${fl(CL.k)} ${s.a(showAt(10))}>+</text>` + [100, 130, 160].map((x, i) => cup(x, '#bfe1f2', 12 + i * 3)).join('') +
        `<path d="M210 128v-50h50v50z" fill="#fff" fill-opacity=".6" style="stroke:var(--ink3);stroke-width:2px"/><rect x="212" y="80" width="46" height="46" fill="#f6c27a" ${s.a(growY(24, 36), FOOT)}/>` +
        `<text x="150" y="58" font-size="20" font-weight="700" text-anchor="middle" ${fl(CL.a)} ${s.a(pop(30), ORG(150, 52))}>1 : 3</text>` +
        chip(s, 150, 22, 92, '1 份果汁兑 3 份水', CL.t, 40);
    }},
    // ---------- 第四十六批 ----------
    refer: {dur: 6, hl: [20, 10], end: 60, lit: '把话题带回到', mean: '提到；参考；指', draw: s => {
      return GND() + kid(70, 128, CL.t, {aR: [24, -36]}) + chip(s, 70, 36, 76, '这个词啥意思？', CL.t, 6) +
        `<g ${s.a(pop(12), ORG(150, 92))}><path d="M150 80q-26-8-44 0v28q18-8 44 0q26-8 44 0V80q-18-8-44 0z" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><path d="M150 80v28" ${sk(CL.m, 1.5)}/><text x="128" y="96" font-size="9" font-weight="700" text-anchor="middle" fill="#d23c2f">词典</text></g>` +
        `<path d="M168 90h20M168 98h14" ${sk(CL.v, 2)} ${DASH} ${s.a(drawP(22, 30))}/>` +
        `<path d="M190 86Q230 40 240 66" ${sk(CL.a, 2)} stroke-dasharray="4 4" ${s.a(fadeP(28, 34))}/>` + chip(s, 246, 80, 68, '翻回去查', CL.a, 30) +
        chip(s, 150, 142, 96, '回头查 = 参考', CL.v, 40);
    }},
    regarding: {dur: 6, hl: [10, 40], end: 60, lit: '在看…方面', mean: '关于', draw: s => {
      return `<rect x="60" y="14" width="180" height="120" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="74" y="34" font-size="10" ${fl(CL.m)}>收件人：全体同学</text>` +
        `<g ${s.a(pop(10), ORG(150, 52))}><rect x="70" y="42" width="160" height="20" rx="4" fill="#ffe6e1"/><text x="78" y="56" font-size="10" font-weight="700" fill="#d23c2f">关于：春游安排</text></g>` +
        [76, 92, 108].map((y, i) => `<path d="M76 ${y}h${140 - i * 20}" ${sk(CL.m, 2, .5)} ${DASH} ${s.a(drawP(20 + i * 5, 26 + i * 5))}/>`).join('') +
        `<g ${s.a(moveIn([[36, 40, 0], [42, 0, 0]]))}><circle cx="206" cy="52" r="12" ${fs('#bfe1f2', INK, 2, .4)}/><path d="M214 60l8 8" ${sk(INK, 3)}/></g>` +
        chip(s, 150, 142, 92, '说的是哪件事', CL.a, 40);
    }},
    replace: {dur: 6, hl: [10, 30], end: 60, lit: '换个新的放上去', mean: '代替；替换', draw: s => {
      const bulb = (c, o) => `<path d="M-10 0a10 10 0 1 1 20 0c0 5-3 6-3 10h-14c0-4-3-5-3-10z" fill="${c}" fill-opacity="${o}" style="stroke:var(--ink3);stroke-width:1.5px"/><rect x="-6" y="10" width="12" height="6" fill="#9a948c"/>`;
      return `<path d="M150 0V40" ${sk(CL.m, 2)}/><rect x="144" y="40" width="12" height="8" fill="#556070"/>` +
        `<g ${s.a({0: 'opacity:1;' + T(150, 64, 'rotate(180deg)'), 10: 'opacity:1;' + T(150, 64, 'rotate(180deg)'), 20: 'opacity:1;' + T(80, 110, 'rotate(120deg)'), 22: 'opacity:0;' + T(80, 110, 'rotate(120deg)'), 96: 'opacity:0', 100: 'opacity:1;' + T(150, 64, 'rotate(180deg)')})}>${bulb('#9a948c', .5)}<path d="M-4 -6l8 8M4 -6l-8 8" ${sk(INK, 1.5)}/></g>` +
        `<g ${s.a(moveIn([[22, 230, 110, 'rotate(60deg)'], [32, 150, 64, 'rotate(180deg)']]))}>${bulb('#fff', 1)}</g>` +
        `<g ${s.a(showAt(34))}><circle cx="150" cy="72" r="26" fill="#f6d34a" fill-opacity=".35"/><path d="M150 100v6M124 74h-6M176 74h6" ${sk(CL.g, 2.5)}/></g>` + GND() +
        chip(s, 70, 30, 64, '坏的换掉', CL.m, 18) + chip(s, 236, 30, 76, '换上新灯泡', CL.a, 36);
    }},
    resist: {dur: 6, hl: [8, 20], end: 60, lit: '反着站', mean: '抵抗；忍住', draw: s => {
      return GND() + [0, 1, 2, 3].map(i => `<path d="M${300} ${50 + i * 18}H220" ${sk('#9fb3c8', 3)} ${s.a({0: 'opacity:0;' + T(40, 0), 50: 'opacity:1;' + T(0, 0), 100: 'opacity:0;' + T(-60, 0)}, `animation-delay:${i * .2}s`, 1)}/>`).join('') +
        `<g ${s.a(showAt(8))}>${[0, 1, 2].map(i => `<path d="M${30 + i * 20} ${40 + i * 30}l-10 6" ${sk('#d8c8b0', 3)}/>`).join('')}</g>` +
        `<g ${s.a({0: R(0), 8: R(0), 14: R(10), 18: R(16), 92: R(16), 100: R(0)}, ORG(150, 128))}>${kid(150, 128, CL.t, {noFace: true, aR: [20, -40], aL: [-6, -30]})}${face(150, 128, 1, 'sad')}</g>` +
        `<path d="M136 128l-6-4M164 128l6-4" ${sk(CL.m, 2)} ${s.a(showAt(20))}/>` + chip(s, 90, 30, 92, '顶着大风站住', CL.t, 30);
    }},
    sarcasm: {dur: 6, hl: [10, 30], end: 60, lit: '话像刀子割肉', mean: '讽刺；挖苦', draw: s => {
      return GND() + kid(70, 128, '#9b7fd0', {aR: [16, -30]}) + `<path d="M64 82q6-3 12 0" ${sk(INK, 1.8)}/>` + chip(s, 90, 40, 104, '哟，你可真"聪明"', '#7a5ab0', 10) +
        `<g ${s.a(moveIn([[18, 110, 60], [28, 196, 84]]))}><path d="M-14 -3h18l8 3-8 3h-18z" fill="#d8dde3" style="stroke:#8a96a3;stroke-width:1px"/><rect x="-22" y="-3" width="8" height="6" fill="#8b5a3a"/></g>` +
        kid(220, 128, CL.t, {noFace: true}) + `<g ${s.a(hideAt(28))}>${face(220, 128)}</g><g ${s.a(showAt(28))}>${face(220, 128, 1, 'sad')}<path d="M214 66q-2 5 0 8" ${sk('#6db7e8', 2)}/></g>` +
        `<g ${s.a(showAt(28, 36))}>${burst(206, 90, 10).replace('<path ', `<path ${sk('#e2473a', 2)} `)}</g>` +
        chip(s, 150, 142, 92, '话里带刺 = 讽刺', '#7a5ab0', 40);
    }},
    statement: {dur: 6, hl: [10, 40], end: 60, lit: '正式说出来的话', mean: '声明；陈述', draw: s => {
      return GND() + `<rect x="120" y="92" width="60" height="36" fill="${WOOD}"/>` + kid(150, 92, '#3d4a5c', {k: .9}) +
        [[128, '#d23c2f'], [150, '#2b2b2b'], [172, '#4a90d0']].map(([x, c]) => `<path d="M${x} 92l${(150 - x) / 3} -12" ${sk(INK, 1.5)}/><rect x="${x + (150 - x) / 3 - 3}" y="74" width="6" height="8" rx="2" fill="${c}"/>`).join('') +
        `<g ${s.a(pop(10), ORG(150, 18))}><rect x="96" y="6" width="108" height="24" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><text x="150" y="22" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.k)}>官方声明</text></g>` +
        [[40, CL.t], [70, CL.v], [230, CL.g], [260, CL.a]].map(([x, c], i) => kid(x, 128, c, {k: .6, aR: [6, -40]}) + `<g ${s.a({0: 'opacity:0', [20 + i * 4]: 'opacity:0', [21 + i * 4]: 'opacity:1', [23 + i * 4]: 'opacity:0', 100: 'opacity:0'})}>${sparkle(x + 4, 96, 6, '#fff6c8')}</g>`).join('') +
        chip(s, 150, 142, 92, '正式说出来的话', CL.v, 40);
    }},
    statistics: {dur: 6, hl: [8, 30], end: 60, lit: '国家掌握的数字', mean: '统计数据', draw: s => {
      const person = (x, y, c) => `<circle cx="${x}" cy="${y - 8}" r="3" fill="${c}"/><path d="M${x - 4} ${y + 2}q0-7 4-7t4 7z" fill="${c}"/>`;
      return `<path d="M40 20V120H280" ${sk(CL.m, 2)}/>` + [['2000', 3], ['2010', 5], ['2020', 7]].map(([t, n], i) => { const x = 80 + i * 70; return [...Array(n)].map((_, j) => `<g ${s.a(pop(8 + i * 6 + j), ORG(x, 116 - j * 13))}>${person(x, 116 - j * 13, [CL.t, CL.v, CL.a][i])}</g>`).join('') + `<text x="${x}" y="134" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>${t}</text>`; }).join('') +
        `<path d="M80 80L150 54L220 28" ${sk(CL.a, 2.5)} ${DASH} ${s.a(drawP(30, 40))}/>` +
        chip(s, 250, 50, 72, '数据显示', CL.a, 40);
    }},
    wealthy: {dur: 6, hl: [10, 40], end: 60, lit: '有财富的', mean: '富有的', draw: s => {
      return GND() + `<g ${s.a(pop(6), ORG(210, 80))}><rect x="160" y="50" width="110" height="78" fill="#f4e6c8" style="stroke:#c9952a;stroke-width:2px"/><path d="M154 50l61-30 61 30z" fill="#c9952a"/>${[172, 196, 236, 258].map(x => `<rect x="${x - 4}" y="64" width="12" height="16" fill="#bfe1f2"/>`).join('')}<rect x="204" y="94" width="22" height="34" fill="${WOOD}"/></g>` +
        `<g ${s.a(move([[10, -60, 0], [26, 0, 0]]))}><rect x="40" y="104" width="64" height="18" rx="6" fill="#d23c2f"/><path d="M52 104l8-12h28l8 12z" fill="#d23c2f"/><circle cx="56" cy="124" r="6" fill="${INK}"/><circle cx="90" cy="124" r="6" fill="${INK}"/></g>` +
        kid(130, 128, '#2b2b2b', {aR: [16, -30]}) + `<path d="M122 66h16l-2-8h-12z" fill="${INK}"/><path d="M118 66h24" ${sk(INK, 2)}/>` +
        [0, 1, 2].map(i => `<g ${s.a({0: 'opacity:0;' + T(), [30 + i * 4]: 'opacity:0;' + T(), [32 + i * 4]: 'opacity:1;' + T(), [46 + i * 4]: 'opacity:0;' + T((i - 1) * 20, -30), 100: 'opacity:0'})}><circle cx="140" cy="60" r="5" ${fs(CL.g, '#a8741a', 1)}/></g>`).join('') +
        chip(s, 80, 30, 64, '有钱人', '#c9952a', 40);
    }},
    welcome: {dur: 6, hl: [8, 20], end: 60, lit: '来得好', mean: '欢迎；受欢迎的', draw: s => {
      return GND() + `<rect x="190" y="30" width="80" height="98" fill="#efe4d2" style="stroke:var(--ink3);stroke-width:2px"/><rect x="206" y="50" width="48" height="78" fill="#3a2e28"/><rect x="206" y="50" width="48" height="78" fill="${WOOD}" ${s.a({0: 'transform:scaleX(1)', 8: 'transform:scaleX(1)', 14: 'transform:scaleX(.15)', 92: 'transform:scaleX(.15)', 100: 'transform:scaleX(1)'}, 'transform-origin:0% 50%;transform-box:fill-box')}/>` +
        `<rect x="186" y="124" width="88" height="6" rx="2" fill="#d23c2f"/>` +
        `<g ${s.a(showAt(14))}><g ${s.a({0: R(0), 18: R(0), 24: R(25), 30: R(0), 100: R(0)}, ORG(236, 128))}>${kid(236, 128, CL.a, {aL: [-20, -30], aR: [20, -30]})}</g></g>` +
        `<g ${s.a(move([[4, -40, 0], [16, 0, 0]]))}>${kid(110, 128, CL.t, {...walkLegs(s, 110, 128, 4, 16, 3)})}</g>` +
        chip(s, 236, 18, 72, '欢迎光临！', CL.a, 20) + chip(s, 100, 40, 76, '来得正好', CL.t, 34);
    }},
    whatever: {dur: 6, hl: [8, 20], end: 60, lit: '不管什么', mean: '无论什么；随便', draw: s => {
      const weather = [`<circle cx="230" cy="40" r="14" ${fl(CL.g)}/>`, `<path d="M214 46a10 10 0 0 1 14-10 13 13 0 0 1 24 4 9 9 0 0 1-2 18h-34a7 7 0 0 1-2-12z" fill="#9aa4b4"/><path d="M222 62l-3 8M232 62l-3 8M242 62l-3 8" ${sk('#6db7e8', 2)}/>`, `<path d="M214 46a10 10 0 0 1 14-10 13 13 0 0 1 24 4 9 9 0 0 1-2 18h-34a7 7 0 0 1-2-12z" fill="#d8dde3"/><circle cx="222" cy="68" r="2.5" fill="#fff" style="stroke:#9fb3c8;stroke-width:1px"/><circle cx="234" cy="72" r="2.5" fill="#fff" style="stroke:#9fb3c8;stroke-width:1px"/><circle cx="246" cy="68" r="2.5" fill="#fff" style="stroke:#9fb3c8;stroke-width:1px"/>`];
      return GND() + weather.map((w, i) => `<g ${s.a(i === 0 ? {0: 'opacity:1', 18: 'opacity:1', 20: 'opacity:0', 98: 'opacity:0', 100: 'opacity:1'} : {0: 'opacity:0', [18 + (i - 1) * 16]: 'opacity:0', [20 + (i - 1) * 16]: 'opacity:1', [34 + (i - 1) * 16]: 'opacity:1', [36 + (i - 1) * 16]: (i === 2 ? 'opacity:1' : 'opacity:0'), 92: (i === 2 ? 'opacity:1' : 'opacity:0'), 100: 'opacity:0'})}>${w}</g>`).join('') +
        kid(110, 128, CL.t, {aR: [16, -40]}) + `<path d="M104 82q6 6 12 0" ${sk(INK, 1.8)}/>` + chip(s, 110, 40, 64, '无所谓～', CL.t, 8) +
        ['晴', '雨', '雪'].map((t, i) => `<text x="230" y="104" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.m)} ${s.a(slot([0, 19, 35, 99], i))}>${t}天</text>`).join('') +
        chip(s, 160, 142, 104, '不管怎样都开心', CL.v, 40);
    }},
    witness: {dur: 6, hl: [8, 30], end: 60, lit: '知道真相的人', mean: '目击者；见证', draw: s => {
      return GND() + `<path d="M60 128V70" ${sk(WOOD, 8)}/><circle cx="60" cy="58" r="24" fill="#3f8f4f"/>` +
        `<g ${s.a(showAt(4))}>${kid(88, 128, CL.t, {k: .8, aL: [-14, -30]})}</g>` +
        `<g ${s.a(move([[8, 80, 0], [22, 0, 0], [26, 0, 0]]))}><rect x="160" y="104" width="40" height="16" rx="5" fill="#2f5d8a"/><circle cx="168" cy="122" r="5" fill="${INK}"/><circle cx="192" cy="122" r="5" fill="${INK}"/></g>` +
        `<g ${s.a(move([[8, -80, 0], [22, 0, 0], [26, 0, 0]]))}><rect x="204" y="104" width="40" height="16" rx="5" fill="#d23c2f"/><circle cx="212" cy="122" r="5" fill="${INK}"/><circle cx="236" cy="122" r="5" fill="${INK}"/></g>` +
        `<g ${s.a(showAt(22, 32))}>${burst(202, 110, 14).replace('<path ', `<path ${sk(CL.g, 2.5)} `)}</g>` +
        `<path d="M98 84L180 104" ${sk(CL.v, 2)} stroke-dasharray="3 4" ${s.a(fadeP(24, 30))}/>` +
        `<g ${s.a(pop(30), ORG(88, 50))}><path d="M78 50q10-9 20 0q-10 9-20 0z" ${fs(CL.p, CL.k, 1.5)}/><circle cx="88" cy="50" r="3" ${fl(CL.k)}/></g>` +
        chip(s, 200, 40, 92, '我都看见了', CL.v, 36);
    }},
    actor: {dur: 6, hl: [10, 40], end: 60, lit: '表演的人', mean: '演员；参与者', draw: s => {
      return `<path d="M0 0H60V128H0zM240 0H300V128H240z" fill="#b8323a"/>` + `<g ${s.a({0: 'transform:scaleX(1)', 8: 'transform:scaleX(1)', 16: 'transform:scaleX(.2)', 92: 'transform:scaleX(.2)', 100: 'transform:scaleX(1)'}, 'transform-origin:0% 50%;transform-box:fill-box')}><rect x="60" y="0" width="90" height="128" fill="#d23c2f"/></g><g ${s.a({0: 'transform:scaleX(1)', 8: 'transform:scaleX(1)', 16: 'transform:scaleX(.2)', 92: 'transform:scaleX(.2)', 100: 'transform:scaleX(1)'}, 'transform-origin:100% 50%;transform-box:fill-box')}><rect x="150" y="0" width="90" height="128" fill="#d23c2f"/></g>` +
        `<rect x="60" y="118" width="180" height="10" fill="${WOOD}"/>` + GND() +
        `<g ${s.a(showAt(14))}>${kid(150, 118, CL.v, {aL: [-20, -50], aR: [20, -30]})}<path d="M140 74q10-8 20 0q-2 10-10 10t-10-10z" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/><path d="M144 76q2-2 4 0M152 76q2-2 4 0" ${sk(INK, 1.5)}/><path d="M146 80q4 3 8 0" ${sk(INK, 1.5)}/></g>` +
        chip(s, 150, 22, 76, '台上演戏的人', CL.a, 30);
    }},
    // ---------- 第四十七批 ----------
    affordable: {dur: 6, hl: [10, 30], end: 60, lit: '买得起的', mean: '负担得起的；实惠的', draw: s => {
      return GND() + `<path d="M184 52l8-6h16l8 6 6 12-10 4v30h-28v-30l-10-4z" fill="#f2a3b3"/><path d="M216 54l20-14" ${sk(CL.m, 1.5)}/>` +
        `<g ${s.a(pop(10), ORG(250, 36))}><path d="M226 26h44l6 10-6 10h-44z" fill="#f6d34a" style="stroke:#c9952a;stroke-width:1.5px"/><text x="250" y="40" font-size="11" font-weight="700" text-anchor="middle" fill="#3f8f4f">¥39</text></g>` +
        kid(100, 128, CL.t, {aR: [16, -36]}) + `<path d="M94 82q6 6 12 0" ${sk(INK, 1.8)}/>` +
        `<rect x="112" y="92" width="22" height="16" rx="3" fill="#8b5a3a"/>` + [0, 1, 2].map(i => `<g ${s.a(moveIn([[20 + i * 3, 122, 92], [28 + i * 3, 200, 70]]))}><circle cx="0" cy="0" r="5" ${fs(CL.g, '#a8741a', 1)}/></g>`).join('') +
        `<g ${s.a(pop(34), ORG(200, 30))}><circle cx="200" cy="30" r="10" fill="#3fbf6a"/><path d="M195 30l3.5 3.5 6.5-7" ${sk('#fff', 2.5)}/></g>` +
        chip(s, 100, 36, 64, '买得起！', CL.t, 30) + chip(s, 150, 142, 84, '价格实惠', CL.a, 40);
    }},
    analyze: {dur: 6, hl: [8, 20], end: 60, lit: '彻底拆开看', mean: '分析', draw: s => {
      const parts = [[150, 70, 0, 0, `<rect x="130" y="50" width="40" height="40" rx="6" fill="#9fb3c8"/>`], [150, 40, 0, -20, `<rect x="140" y="30" width="20" height="20" rx="4" fill="#d23c2f"/><circle cx="146" cy="40" r="2.5" fill="#fff"/><circle cx="154" cy="40" r="2.5" fill="#fff"/><path d="M150 30v-6" ${sk(INK, 1.5)}/><circle cx="150" cy="23" r="2" fill="#f6d34a"/>`], [124, 70, -60, 0, `<rect x="114" y="62" width="16" height="16" rx="3" fill="#f2b632"/>`], [176, 70, 60, 0, `<rect x="170" y="62" width="16" height="16" rx="3" fill="#f2b632"/>`], [140, 102, -40, 30, `<rect x="134" y="90" width="10" height="24" rx="2" fill="#556070"/>`], [160, 102, 40, 30, `<rect x="156" y="90" width="10" height="24" rx="2" fill="#556070"/>`]];
      return parts.map(([x, y, dx, dy, art]) => `<g ${s.a({0: T(), 8: T(), 20: T(dx, dy), 92: T(dx, dy), 100: T()})}>${art}</g>`).join('') +
        `<g ${s.a(moveIn([[24, 260, 40], [36, 210, 70]]))}><circle cx="0" cy="0" r="14" ${fs('#bfe1f2', INK, 3, .4)}/><path d="M10 10l10 10" ${sk(INK, 4)}/></g>` +
        [['头', 150, 12], ['手', 56, 62], ['手', 244, 62], ['腿', 92, 140], ['腿', 208, 140]].map(([t, x, y], i) => `<text x="${x}" y="${y}" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(showAt(22 + i * 2))}>${t}</text>`).join('') +
        chip(s, 250, 128, 84, '拆开一块块看', CL.a, 40);
    }},
    assess: {dur: 6, hl: [10, 20], end: 60, lit: '坐下来掂量', mean: '评估；评定', draw: s => {
      return GND() + `<rect x="60" y="100" width="40" height="28" fill="${WOOD}"/>` + kid(80, 100, '#3d4a5c', {k: .9, aR: [20, -30]}) + `<circle cx="76" cy="52" r="3.4" ${sk(INK, 1.2)}/><circle cx="84" cy="52" r="3.4" ${sk(INK, 1.2)}/>` +
        `<rect x="104" y="74" width="16" height="20" rx="1" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/>` +
        `<path d="M200 128V60" ${sk(CL.m, 3)}/><g ${s.a({0: R(0), 10: R(0), 16: R(-10), 22: R(6), 28: R(-3), 32: R(0), 100: R(0)}, ORG(200, 60))}><path d="M160 60H240" ${sk(CL.m, 3)}/><path d="M150 80h20M230 80h20" ${sk(CL.m, 3)}/><path d="M160 60l-6 20M160 60l6 20M240 60l-6 20M240 60l6 20" ${sk(CL.m, 1)}/><path d="M154 78l6-8 6 8z" fill="#6db7e8"/><rect x="232" y="72" width="16" height="8" fill="#9a948c"/></g>` +
        `<path d="M107 80h10M107 84h10M107 88h6" ${sk(CL.v, 1)} ${DASH} ${s.a(drawP(26, 34))}/>` +
        `<g ${s.a(pop(36), ORG(150, 30))}><circle cx="150" cy="30" r="14" ${sk('#d23c2f', 2.5)}/><text x="150" y="35" font-size="14" font-weight="700" text-anchor="middle" fill="#d23c2f">A</text></g>` +
        chip(s, 236, 30, 76, '仔细掂一掂', CL.a, 40);
    }},
    beginning: {dur: 6, hl: [8, 40], end: 60, lit: '开始的时候', mean: '开始；起源', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#1d2440" ${s.a({0: 'fill-opacity:.8', 10: 'fill-opacity:.8', 34: 'fill-opacity:0', 92: 'fill-opacity:0', 100: 'fill-opacity:.8'})}/>` +
        `<rect x="0" y="0" width="300" height="150" fill="#f6c27a" ${s.a({0: 'fill-opacity:0', 20: 'fill-opacity:0', 34: 'fill-opacity:.3', 92: 'fill-opacity:.3', 100: 'fill-opacity:0'})}/>` +
        `<g ${s.a({0: T(0, 50), 10: T(0, 50), 34: T(0, 0), 92: T(0, 0), 100: T(0, 50)})}><circle cx="150" cy="96" r="24" fill="#f29a2e"/>${[0, 1, 2, 3, 4].map(i => { const a = Math.PI * (1.05 + i * .225); return `<path d="M${f1(150 + 30 * Math.cos(a))} ${f1(96 + 30 * Math.sin(a))}L${f1(150 + 40 * Math.cos(a))} ${f1(96 + 40 * Math.sin(a))}" ${sk('#f29a2e', 3)}/>`; }).join('')}</g>` +
        `<rect x="0" y="100" width="300" height="50" fill="#5fb862"/>` + chip(s, 150, 130, 92, '新的一天开始了', CL.a, 40);
    }},
    behavioral: {dur: 6, hl: [10, 40], end: 60, lit: '行为上的', mean: '行为的', draw: s => {
      const rows = ['按时刷牙', '主动问好', '收拾书包'];
      return `<rect x="150" y="16" width="130" height="118" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="215" y="32" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>行为表</text>` +
        rows.map((t, i) => `<text x="162" y="${56 + i * 26}" font-size="10" ${fl(CL.k)}>${t}</text><g ${s.a(pop(14 + i * 8), ORG(262, 52 + i * 26))}>${star5(262, 52 + i * 26, 7, 3, CL.g)}</g>`).join('') +
        GND(8, 140) + kid(70, 128, CL.t, {aR: [16, -40]}) +
        `<g ${s.a(showAt(10, 20))}><path d="M86 88l10-4" ${sk('#fff', 4)}/><path d="M96 84l4-2" ${sk('#6db7e8', 3)}/></g>` + chip(s, 70, 40, 52, '你好！', CL.t, 22) +
        chip(s, 215, 142, 84, '做了什么事', CL.v, 40);
    }},
    complain: {dur: 6, hl: [8, 20], end: 60, lit: '捶胸诉苦', mean: '抱怨；投诉', draw: s => {
      const stomp = {0: T(), 20: T(), 22: T(0, -4), 24: T(), 26: T(0, -4), 28: T(), 100: T()};
      return GND() + `<rect x="160" y="88" width="120" height="40" fill="${WOOD}"/>` + kid(230, 88, '#3d4a5c', {k: .8, noFace: true}) + face(230, 88, .8, 'sad') +
        `<path d="M168 82h28a14 8 0 0 1-28 0z" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/><path d="M172 82q10-4 20 0" ${sk('#e2a34a', 2)}/><circle cx="182" cy="78" r="2.5" fill="${INK}" ${s.a(showAt(8))}/>` +
        `<g ${s.a(stomp)}>${kid(110, 128, CL.a, {noFace: true, aL: [-14, -56], aR: [24, -40]})}<path d="M102 74l6 2M118 74l-6 2" ${sk(INK, 2)}/><circle cx="105" cy="78" r="1.8" fill="${INK}"/><circle cx="115" cy="78" r="1.8" fill="${INK}"/><path d="M104 86q6-4 12 0" ${sk(INK, 2)}/></g>` +
        chip(s, 100, 30, 92, '汤里有苍蝇！', '#d23c2f', 20) + chip(s, 236, 40, 52, '投诉', '#d23c2f', 30);
    }},
    conclude: {dur: 6, hl: [8, 24], end: 60, lit: '把讨论关上', mean: '得出结论；结束', draw: s => {
      const clues = [[80, 40, '脚印'], [70, 100, '帽子'], [150, 110, '鞋子']];
      return `<rect x="30" y="16" width="240" height="118" rx="3" fill="#c8a06a"/>` + clues.map(([x, y, t], i) => `<g ${s.a(pop(6 + i * 4), ORG(x, y))}><rect x="${x - 22}" y="${y - 12}" width="44" height="24" fill="#fff"/><circle cx="${x}" cy="${y - 12}" r="3" fill="#d23c2f"/><text x="${x}" y="${y + 4}" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>${t}</text></g>`).join('') +
        `<g ${s.a(pop(18), ORG(220, 64))}><rect x="190" y="36" width="60" height="58" fill="#fff"/><circle cx="220" cy="58" r="10" fill="${SKIN}"/><path d="M210 58a10 10 0 0 1 20 0q-5-3-10-2t-10 2z" fill="${HAIR}"/><path d="M206 90q0-14 14-14t14 14z" fill="#556070"/><circle cx="220" cy="36" r="3" fill="#d23c2f"/></g>` +
        clues.map(([x, y], i) => `<path d="M${x} ${y - 12}L220 36" ${sk('#d23c2f', 1.5)} ${DASH} ${s.a(drawP(24 + i * 3, 30 + i * 3))}/>`).join('') +
        chip(s, 220, 112, 84, '结论：就是他', '#d23c2f', 40);
    }},
    critical: {dur: 6, hl: [10, 30], end: 60, lit: '关键的', mean: '关键的；危急的', draw: s => {
      return GND() + `<path d="M260 128V40" ${sk('#9a948c', 4)}/><rect x="244" y="30" width="36" height="24" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M244 56h24" ${sk('#e2473a', 3)}/><path d="M246 56l4 14h14l4-14" ${sk('#fff', 1.5)}/>` +
        `<rect x="40" y="16" width="70" height="30" rx="4" fill="#2b2b2b"/>` + ['0:03', '0:02', '0:01'].map((t, i) => `<text x="75" y="37" font-size="16" font-weight="700" text-anchor="middle" fill="#e2473a" ${s.a(slot([0, 12, 22, 99], i))}>${t}</text>`).join('') +
        kid(150, 128, CL.t, {aL: [-6, -60], aR: [6, -60]}) +
        `<g ${s.a(moveIn([[22, 150, 60], [28, 210, 20], [34, 256, 58]]))}><circle cx="0" cy="0" r="7" fill="#f29a2e"/><path d="M-7 0h14M0 -7v14" ${sk('#8b4a2a', 1)}/></g>` +
        `<g ${s.a(showAt(34, 46))}>${burst(256, 60, 16).replace('<path ', `<path ${sk(CL.g, 2.5)} `)}</g>` +
        chip(s, 150, 30, 76, '关键一球！', CL.a, 30);
    }},
    distance: {dur: 6, hl: [8, 20], end: 60, lit: '分开站', mean: '距离；远处', draw: s => {
      return GND() + `<g ${s.a({0: T(), 8: T(), 20: T(-40, 0), 92: T(-40, 0), 100: T()})}>${kid(120, 128, CL.t, {...walkLegs(s, 120, 128, 8, 20, 3)})}</g>` +
        `<g ${s.a({0: T(), 8: T(), 20: T(40, 0), 92: T(40, 0), 100: T()})}>${kid(180, 128, CL.a, {...walkLegs(s, 180, 128, 8, 20, 3)})}</g>` +
        `<path d="M86 142H214" ${sk(CL.v, 2)} ${DASH} ${s.a(drawP(22, 30))}/><path d="M92 136l-6 6 6 6M208 136l6 6-6 6" ${sk(CL.v, 2)} ${s.a(showAt(30))}/>` +
        `<text x="150" y="138" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(showAt(30))}>5 米</text>` + chip(s, 150, 30, 92, '分开站 = 距离', CL.a, 34);
    }},
    distinguish: {dur: 6, hl: [8, 16, 40], end: 60, lit: '刺上记号分开', mean: '区分；辨别', draw: s => {
      const cat = (x) => `<ellipse cx="${x}" cy="112" rx="20" ry="12" fill="#8b8b8b"/><circle cx="${x - 18}" cy="98" r="10" fill="#8b8b8b"/><path d="M${x - 26} 90l2-10 6 6zM${x - 16} 88l6-6 2 10z" fill="#8b8b8b"/><circle cx="${x - 21}" cy="97" r="1.5" fill="#f6d34a"/><circle cx="${x - 15}" cy="97" r="1.5" fill="#f6d34a"/><path d="M${x + 20} 110q14-4 12-20" ${sk('#8b8b8b', 4)}/>`;
      return GND() + cat(110) + cat(220) + `<g ${s.a(pop(16), ORG(204, 92))}><path d="M200 92l6-8 6 8-6 6z" fill="#e2473a"/></g>` +
        `<text x="150" y="60" font-size="18" font-weight="700" text-anchor="middle" ${fl(CL.m)} ${s.a(hideAt(16))}>=</text><text x="150" y="60" font-size="18" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(showAt(18))}>≠</text>` +
        chip(s, 110, 30, 52, '大毛', CL.v, 30) + chip(s, 220, 30, 64, '带红点的', '#d23c2f', 34) + chip(s, 150, 142, 92, '做个记号来区分', CL.a, 40);
    }},
    evolve: {dur: 6, hl: [8, 20], end: 60, lit: '慢慢展开', mean: '进化；逐步发展', draw: s => {
      const st = [`<ellipse cx="50" cy="100" rx="8" ry="6" fill="#3a3a3a"/><path d="M58 100q10-6 16 2" ${sk('#3a3a3a', 3)}/>`, `<ellipse cx="120" cy="100" rx="12" ry="8" fill="#5a7a3a"/><path d="M132 100q10-4 14 4" ${sk('#5a7a3a', 3)}/><path d="M112 106l-4 6M126 106l4 6" ${sk('#5a7a3a', 2)}/>`,
        `<ellipse cx="200" cy="98" rx="16" ry="10" fill="#3fbf6a"/><circle cx="192" cy="88" r="4" fill="#fff"/><circle cx="208" cy="88" r="4" fill="#fff"/><circle cx="192" cy="88" r="2" fill="${INK}"/><circle cx="208" cy="88" r="2" fill="${INK}"/><path d="M186 106l-8 8h10M214 106l8 8h-10" ${sk('#3fbf6a', 3)}/>`];
      return `<rect x="0" y="80" width="300" height="70" fill="#9fd0ee" fill-opacity=".5"/>` + st.map((a, i) => `<g ${s.a(pop(8 + i * 10), ORG([50, 120, 200][i], 100))}>${a}</g>`).join('') +
        `<path d="M78 100h20M152 100h22" ${sk(CL.a, 2.5)} ${s.a(showAt(16))}/><path d="M94 96l5 4-5 4M170 96l5 4-5 4" ${sk(CL.a, 2.5)} ${s.a(showAt(16))}/>` +
        ['蝌蚪', '长腿', '青蛙'].map((t, i) => `<text x="${[50, 120, 200][i]}" y="134" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)} ${s.a(showAt(10 + i * 10))}>${t}</text>`).join('') +
        chip(s, 150, 30, 96, '一步步变过来', CL.t, 40);
    }},
    final: {dur: 6, hl: [10, 40], end: 60, lit: '最后的', mean: '最后的；决赛', draw: s => {
      return GND() + `<rect x="90" y="16" width="120" height="40" rx="4" fill="#2b2b2b"/><text x="150" y="32" font-size="9" font-weight="700" text-anchor="middle" fill="#f6d34a">决赛</text>` +
        ['1 : 1', '2 : 1'].map((t, i) => `<text x="150" y="50" font-size="14" font-weight="700" text-anchor="middle" fill="#7cf0b0" ${s.a(slot([0, 30, 99], i))}>${t}</text>`).join('') +
        kid(110, 128, CL.t, {aL: [-14, -56], aR: [14, -56]}) + kid(200, 128, CL.a, {noFace: true}) + face(200, 128, 1, 'sad') +
        `<g ${s.a(moveIn([[32, 0, -40], [38, 0, 0]]))}><path d="M100 36h20v8a10 10 0 0 1-20 0z" fill="#f6d34a"/><path d="M107 54h6v4h-6zM103 58h14v3h-14z" fill="#c9952a"/></g>` +
        chip(s, 150, 142, 84, '最后一场定输赢', CL.a, 40);
    }},
    // ---------- 第四十八批 ----------
    genetic: {dur: 6, hl: [10, 40], end: 60, lit: '基因上的', mean: '基因的；遗传的', draw: s => {
      const helix = []; for (let i = 0; i <= 12; i++) { const y = 20 + i * 8, dx = 14 * Math.sin(i * .9); helix.push([f1(60 + dx), f1(60 - dx), y]); }
      return GND(120, 292) + `<g ${s.a(pop(6), ORG(60, 70))}><path d="M${helix.map(([a, , y]) => a + ' ' + y).join('L')}" ${sk('#4a90d0', 3)}/><path d="M${helix.map(([, b, y]) => b + ' ' + y).join('L')}" ${sk('#e2473a', 3)}/>${helix.map(([a, b, y]) => `<path d="M${a} ${y}H${b}" ${sk(CL.m, 1.5)}/>`).join('')}</g>` +
        kid(180, 128, CL.v, {k: 1.1, noFace: false}) + `<circle cx="172" cy="56" r="5" fill="#d23c2f"/><circle cx="180" cy="52" r="5" fill="#d23c2f"/><circle cx="188" cy="56" r="5" fill="#d23c2f"/>` +
        `<g ${s.a(pop(20), FOOT)}>${kid(250, 128, CL.t, {k: .7})}<circle cx="245" cy="88" r="3.5" fill="#d23c2f"/><circle cx="250" cy="85" r="3.5" fill="#d23c2f"/><circle cx="255" cy="88" r="3.5" fill="#d23c2f"/></g>` +
        `<path d="M196 70Q222 50 244 80" ${sk(CL.a, 2)} stroke-dasharray="4 4" ${s.a(fadeP(26, 32))}/>` + chip(s, 216, 26, 84, '红发传给孩子', CL.a, 34);
    }},
    household: {dur: 6, hl: [10, 30], end: 60, lit: '一屋子的人', mean: '家庭；家用的', draw: s => {
      return `<g ${s.a(pop(6), ORG(150, 80))}><path d="M50 128V60h200v68" fill="#efe4d2" style="stroke:var(--ink3);stroke-width:2px"/><path d="M40 60l110-44 110 44z" fill="#d23c2f"/></g>` + GND() +
        [[90, '#3d4a5c', 1, 10], [130, CL.a, 1, 14], [170, CL.t, .7, 18], [210, CL.v, .6, 22]].map(([x, c, k, p]) => `<g ${s.a(pop(p), FOOT)}>${kid(x, 128, c, {k})}</g>`).join('') +
        `<g ${s.a(showAt(30))}><path d="M98 100l14-10" ${sk(WOOD, 2)}/><path d="M110 88l6 2-2 6z" fill="#f6d34a"/></g>` +
        chip(s, 150, 142, 84, '一家人一起住', CL.a, 34);
    }},
    immune: {dur: 6, hl: [8, 20], end: 60, lit: '免掉了的', mean: '免疫的；不受影响的', draw: s => {
      const virus = `<circle cx="0" cy="0" r="7" fill="#7cd44a"/>${[0, 60, 120, 180, 240, 300].map(a => `<path d="M${f1(7 * Math.cos(a * Math.PI / 180))} ${f1(7 * Math.sin(a * Math.PI / 180))}l${f1(4 * Math.cos(a * Math.PI / 180))} ${f1(4 * Math.sin(a * Math.PI / 180))}" ${sk('#3f8f4f', 2)}/>`).join('')}`;
      return GND() + kid(150, 128, CL.t) + `<ellipse cx="150" cy="86" rx="38" ry="50" fill="#9fd0ee" fill-opacity=".25" ${s.a(pop(14), ORG(150, 86))} style="stroke:#4a90d0;stroke-width:2px"/>` +
        [[20, 40, 0], [280, 50, 1], [30, 120, 2]].map(([x, y, i]) => `<g ${s.a({0: 'opacity:0;' + T(x, y), [10 + i * 8]: 'opacity:0;' + T(x, y), [11 + i * 8]: 'opacity:1;' + T(x, y), [18 + i * 8]: 'opacity:1;' + T(x < 150 ? 110 : 190, 80), [26 + i * 8]: 'opacity:0;' + T(x < 150 ? 40 : 260, y < 80 ? 10 : 140), 100: 'opacity:0'})}>${virus}</g>`).join('') +
        chip(s, 150, 22, 92, '病毒进不来', '#4a90d0', 30);
    }},
    indicate: {dur: 6, hl: [8, 18], end: 60, lit: '指着说', mean: '表明；指出', draw: s => {
      return `<path d="M60 110a90 90 0 0 1 180 0" ${sk('#e8ecf2', 18)}/><path d="M60 110a90 90 0 0 1 60-85" ${sk('#3fbf6a', 18)}/><path d="M120 25a90 90 0 0 1 60 0" ${sk('#f6d34a', 18)}/><path d="M180 25a90 90 0 0 1 60 85" ${sk('#e2473a', 18)}/>` +
        `<g ${s.a({0: R(-80), 8: R(-80), 18: R(60), 22: R(48), 26: R(56), 92: R(56), 100: R(-80)}, ORG(150, 110))}><path d="M150 110V40" ${sk(INK, 4)}/></g><circle cx="150" cy="110" r="8" fill="${INK}"/>` +
        `<text x="150" y="138" font-size="11" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(showAt(24))}>温度太高了</text>` + chip(s, 150, 14, 92, '指针表明情况', CL.v, 34);
    }},
    institute: {dur: 6, hl: [8, 20], end: 60, lit: '建好的机构', mean: '研究所；学院', draw: s => {
      return GND() + `<g ${s.a(growY(8, 20), FOOT)}><rect x="40" y="40" width="130" height="88" fill="#e8ecf2" style="stroke:var(--ink3);stroke-width:2px"/>${[0, 1].map(r => [0, 1, 2, 3].map(c => `<rect x="${52 + c * 30}" y="${52 + r * 26}" width="16" height="14" fill="#9fd0ee"/>`).join('')).join('')}<rect x="92" y="104" width="26" height="24" fill="#556070"/></g>` +
        `<g ${s.a(pop(20), ORG(105, 30))}><rect x="62" y="22" width="86" height="16" rx="3" fill="#2f5d8a"/><text x="105" y="34" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">科学研究所</text></g>` +
        kid(230, 128, '#fff', {aR: [16, -40]}) + `<path d="M220 87h20v24h-20z" fill="none" style="stroke:var(--ink3);stroke-width:1.5px"/>` +
        `<path d="M250 86l8-12-4-6h10l-4 6 8 12z" fill="#9fd0ee" style="stroke:var(--ink3);stroke-width:1.5px"/>` + `<g ${s.a(showAt(30))}><circle cx="258" cy="66" r="3" fill="#7cd44a"/><circle cx="262" cy="58" r="2" fill="#7cd44a"/></g>` +
        chip(s, 236, 30, 76, '做研究的地方', CL.v, 36);
    }},
    manufacturer: {dur: 6, hl: [8, 16, 24, 40], end: 60, lit: '制造东西的人', mean: '制造商；厂商', draw: s => {
      return GND() + `<path d="M20 128V70l30-16v16l30-16v16l30-16v74z" fill="#9a948c"/><rect x="88" y="34" width="12" height="36" fill="#7a6a62"/><text x="64" y="104" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">ABC 厂</text>` +
        [0, 1, 2].map(i => `<g ${s.a(moveIn([[10 + i * 8, 110, 112], [20 + i * 8, 170 + i * 30, 112]]))}><rect x="-10" y="-8" width="20" height="16" rx="2" fill="#f2b632"/><text x="0" y="3" font-size="6" font-weight="700" text-anchor="middle" fill="#fff">ABC</text></g>`).join('') +
        `<path d="M110 120H280" ${sk(CL.m, 3)}/>` + chip(s, 200, 40, 92, 'ABC 厂制造', CL.a, 40);
    }},
    mistake: {dur: 6, hl: [8, 20], end: 60, lit: '拿错了', mean: '错误；弄错', draw: s => {
      const umb = (x, c) => `<path d="M${x} 108V80" ${sk(INK, 2)}/><path d="M${x - 14} 82q14-16 28 0z" fill="${c}"/><path d="M${x} 108q0 4 4 4" ${sk(INK, 2)}/>`;
      return GND() + `<rect x="150" y="104" width="60" height="24" fill="#556070"/>` + umb(166, '#4a90d0') + `<g ${s.a(hideAt(20))}>${umb(194, '#e2473a')}</g>` +
        `<g ${s.a(move([[6, 0, 0], [16, 60, 0], [22, 60, 0], [32, 0, 0]]))}>${kid(90, 128, CL.t, {aR: [20, -40], ...walkLegs(s, 90, 128, 6, 32, 6)})}<g ${s.a(showAt(20))}>${umb(108, '#e2473a')}</g></g>` +
       kid(250, 128, CL.a, {noFace: true}) + `<g ${s.a(hideAt(34))}>${face(250, 128)}</g><g ${s.a(showAt(34))}>${face(250, 128, 1, 'sad')}</g>` +
        chip(s, 250, 40, 64, '那是我的！', CL.a, 34) + chip(s, 100, 40, 64, '拿错了', '#d23c2f', 40);
    }},
    nowadays: {dur: 6, hl: [10, 30], end: 60, lit: '当今这些日子', mean: '如今；现在', draw: s => {
      return GND() + `<path d="M150 20V128" ${sk(CL.m, 2)} stroke-dasharray="4 4"/>` +
        `<g ${s.a(pop(6), ORG(76, 96))}><rect x="40" y="88" width="60" height="22" rx="3" fill="#8b5a3a"/><circle cx="56" cy="114" r="10" ${sk('#6b4428', 3)}/><circle cx="90" cy="114" r="10" ${sk('#6b4428', 3)}/><path d="M100 96h14" ${sk('#6b4428', 3)}/><ellipse cx="124" cy="92" rx="10" ry="7" fill="#c98a4a"/></g><text x="76" y="40" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.m)}>过去</text>` +
        `<g ${s.a(pop(26), ORG(226, 104))}><rect x="190" y="96" width="72" height="20" rx="8" fill="#3fbf6a"/><path d="M200 96l10-12h34l10 12z" fill="#3fbf6a"/><circle cx="206" cy="118" r="7" fill="${INK}"/><circle cx="248" cy="118" r="7" fill="${INK}"/><path d="M226 104l-4 6h6l-4 6" ${sk('#fff', 2)}/></g><text x="226" y="40" font-size="11" font-weight="700" text-anchor="middle" fill="#3f8f4f" ${s.a(showAt(26))}>如今</text>` +
        chip(s, 226, 62, 76, '电动车满街跑', CL.t, 34);
    }},
    official: {dur: 6, hl: [10, 30], end: 60, lit: '公职上的', mean: '官方的；正式的', draw: s => {
      return `<rect x="70" y="16" width="160" height="118" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="150" y="36" font-size="12" font-weight="700" text-anchor="middle" fill="#d23c2f">通知</text>` +
        [52, 66, 80].map(y => `<path d="M86 ${y}h128" ${sk(CL.m, 2, .5)}/>`).join('') +
        `<g ${s.a({0: 'opacity:0;' + T(0, -50), 10: 'opacity:0;' + T(0, -50), 11: 'opacity:1;' + T(0, -50), 24: 'opacity:1;' + T(0, 0), 28: 'opacity:1;' + T(0, -6), 32: 'opacity:0;' + T(0, -40), 100: 'opacity:0'})}><rect x="176" y="70" width="24" height="26" rx="3" fill="#8b5a3a"/><rect x="172" y="96" width="32" height="8" rx="2" fill="#d23c2f"/></g>` +
        `<g ${s.a(showAt(26))}><circle cx="188" cy="112" r="16" ${sk('#d23c2f', 2.5)}/>${star5(188, 112, 6, 2.6, '#d23c2f')}</g>` +
        chip(s, 150, 142, 92, '盖上公章 = 官方', '#d23c2f', 34);
    }},
    perspective: {dur: 6, hl: [8, 16, 40], end: 60, lit: '透过去看', mean: '视角；观点；透视', draw: s => {
      return `<rect x="0" y="0" width="300" height="80" fill="#dff2ff"/><rect x="0" y="80" width="300" height="70" fill="#cfe5c8"/><path d="M110 150L150 80L190 150z" fill="#c8c0b0"/>` +
        [0, 1, 2, 3].map(i => { const y = 140 - i * 16, sc = 1 - i * .22; return `<path d="M${f1(150 - 18 * sc)} ${y}h${f1(36 * sc)}" ${sk('#fff', f1(3 * sc))}/>`; }).join('') +
        `<path d="M0 150L150 80M300 150L150 80M0 80H300" ${sk(CL.a, 1.5)} stroke-dasharray="4 4" ${s.a(fadeP(8, 16))}/><circle cx="150" cy="80" r="4" fill="#d23c2f" ${s.a(pop(16), ORG(150, 80))}/>` +
        [[60, 120, 1], [100, 102, .6], [126, 92, .35]].map(([x, y, k], i) => `<g ${s.a(pop(20 + i * 4), FOOT)}><path d="M${x} ${y}V${f1(y - 40 * k)}" ${sk(WOOD, f1(5 * k))}/><circle cx="${x}" cy="${f1(y - 50 * k)}" r="${f1(16 * k)}" fill="#3f8f4f"/></g>`).join('') +
        chip(s, 236, 30, 96, '近大远小 = 透视', CL.v, 40);
    }},
    phenomenon: {dur: 6, hl: [10, 40], end: 60, lit: '显现出来的东西', mean: '现象', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#9aa4b4" ${s.a({0: 'fill-opacity:.5', 10: 'fill-opacity:.5', 24: 'fill-opacity:0', 92: 'fill-opacity:0', 100: 'fill-opacity:.5'})}/>` +
        `<g ${s.a(hideAt(20))}>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${40 + i * 44} 0l-6 12" ${sk('#6db7e8', 2)} ${s.a({0: T(0, -10), 100: T(-10, 150)}, `animation-delay:${i * .15}s;animation-timing-function:linear`, .9)}/>`).join('')}</g>` +
        `<g ${s.a(showAt(24))}>${['#e2473a', '#f29a2e', '#f6d34a', '#3fbf6a', '#4a90d0', '#9b7fd0'].map((c, i) => `<path d="M${40 + i * 6} 128a${110 - i * 6} ${90 - i * 6} 0 0 1 ${220 - i * 12} 0" ${sk(c, 6)}/>`).join('')}</g>` +
        `<circle cx="256" cy="26" r="12" ${fl(CL.g)} ${s.a(showAt(20))}/>` + GND() + kid(150, 128, CL.t, {aR: [16, -52]}) +
        chip(s, 150, 142, 92, '雨后出现彩虹', CL.a, 40);
    }},
    renewable: {dur: 6, hl: [8, 14, 40], end: 60, lit: '能再变新的', mean: '可再生的', draw: s => {
      return GND() + `<circle cx="50" cy="30" r="14" ${fl(CL.g)}/>` +
        `<g transform="rotate(-20 110 100)"><rect x="80" y="84" width="60" height="34" fill="#2f5d8a"/><path d="M100 84v34M120 84v34M80 101h60" ${sk('#9fd0ee', 1.5)}/></g><path d="M110 118v10" ${sk(CL.m, 3)}/>` +
        `<path d="M64 40L100 82" ${sk(CL.g, 2.5)} ${DASH} ${s.a(drawP(8, 14))}/>` +
        `<rect x="200" y="70" width="40" height="58" rx="4" ${fs(CL.p, CL.m, 2)}/><rect x="212" y="64" width="16" height="6" fill="${CL.m}"/>` +
        `<rect x="204" y="74" width="32" height="50" rx="2" fill="#3fbf6a" ${s.a({0: 'transform:scaleY(.1)', 14: 'transform:scaleY(.1)', 26: 'transform:scaleY(1)', 30: 'transform:scaleY(1)', 38: 'transform:scaleY(.2)', 44: 'transform:scaleY(.2)', 56: 'transform:scaleY(1)', 92: 'transform:scaleY(1)', 100: 'transform:scaleY(.1)'}, FOOT)}/>` +
        `<path d="M140 110H200" ${sk('#f6d34a', 3)} stroke-dasharray="4 6" ${s.a(fadeP(14, 18))}/>` + chip(s, 220, 40, 92, '用完又能充满', CL.t, 40);
    }},
    // ---------- 第四十九批 ----------
    represent: {dur: 6, hl: [10, 24], end: 60, lit: '替别人再呈现', mean: '代表；表示', draw: s => {
      return GND() + [[40, CL.v], [64, CL.g], [88, CL.t], [52, CL.a], [76, '#8b7a6a']].map(([x, c], i) => kid(x, i < 3 ? 128 : 118, c, {k: .6})).join('') +
        `<g ${s.a(move([[10, 0, 0], [22, 80, 0]]))}>${kid(110, 128, CL.a, {k: .9, aR: [18, -50], ...walkLegs(s, 110, 128, 10, 22, 4, .9)})}</g>` +
        kid(250, 128, '#3d4a5c', {k: 1.05}) + chip(s, 190, 40, 92, '我代表大家说', CL.a, 26) +
        `<path d="M100 96Q150 70 176 92" ${sk(CL.v, 1.5)} stroke-dasharray="3 4" ${s.a(fadeP(24, 30))}/>` + chip(s, 70, 30, 76, '班级代表', CL.v, 36);
    }},
    review: {dur: 6, hl: [10, 24], end: 60, lit: '再看一遍', mean: '复习；回顾；评论', draw: s => {
      return GND() + `<rect x="150" y="96" width="120" height="6" fill="${WOOD}"/><path d="M160 102v26M260 102v26" ${sk(WOOD, 3)}/>` +
        `<path d="M210 94q-24-8-44 0V66q20-8 44 0q24-8 44 0v28q-20-8-44 0z" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><path d="M210 66v28" ${sk(CL.m, 1.5)}/>` +
        kid(110, 128, CL.t, {aR: [26, -40]}) +
        `<g ${s.a(pop(24), ORG(210, 40))}><g ${s.a({0: R(0), 100: R(360)}, ORG(210, 40) + ';animation-timing-function:linear', 2)}><path d="M220 40a10 10 0 1 1-4-8" ${sk(CL.v, 3)}/><path d="M212 28l5 4-5 4" ${sk(CL.v, 3)}/></g></g>` +
        ['第 1 遍', '第 2 遍', '第 3 遍'].map((t, i) => `<text x="210" y="86" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(slot([0, 18, 32, 99], i))}>${t}</text>`).join('') +
        chip(s, 110, 30, 76, '再看一遍', CL.v, 40);
    }},
    revolutionary: {dur: 6, hl: [8, 14, 30, 44], end: 60, lit: '彻底翻新的', mean: '革命性的', draw: s => {
      return GND() + `<g ${s.a(hideAt(24))}><circle cx="150" cy="70" r="14" fill="#f4f1e6" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M150 56v-10" ${sk(INK, 2)}/><path d="M150 46q-4-6 0-10q4 4 0 10z" fill="#f29a2e"/></g>` +
        `<g ${s.a(showAt(24))}><path d="M138 66a12 12 0 1 1 24 0c0 6-4 8-4 13h-16c0-5-4-7-4-13z" ${fl(CL.g)}/><path d="M144 84h12M145 89h10" ${sk(CL.m, 2)}/></g>` +
        `<g ${s.a({0: 'opacity:0;transform:scale(.4)', 24: 'opacity:0;transform:scale(.4)', 28: 'opacity:1;transform:scale(1.1)', 32: 'opacity:1;transform:scale(1)', 92: 'opacity:1', 100: 'opacity:0'}, ORG(150, 70))}>${burst(150, 70, 40).replace('<path ', `<path ${sk(CL.g, 3)} `)}</g>` +
        [[50, CL.t], [90, CL.v], [210, CL.a], [250, CL.g]].map(([x, c], i) => kid(x, 128, c, {k: .7, aL: [-10, -40], aR: [10, -40]}) + `<text x="${x}" y="72" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.a)} ${s.a(pop(32 + i * 2), ORG(x, 68))}>哇</text>`).join('') +
        chip(s, 150, 20, 92, '一下改变世界', CL.a, 44);
    }},
    running: {dur: 6, hl: [10, 40], end: 60, lit: '跑着的', mean: '跑步；经营；连续的', draw: s => {
      return `<path d="M0 128H300M0 138H300" ${sk('#e2763a', 2)}/>` + `<g ${s.a({0: T(-40, 0), 100: T(340, 0)}, 'animation-timing-function:linear', 2)}>${kid(0, 128, CL.t, {k: .8, ...walkLegs(s, 0, 128, 0, 100, 16, .8)})}</g>` +
        ['2022', '2023', '2024'].map((t, i) => `<g ${s.a(pop(10 + i * 10), ORG(80 + i * 70, 50))}><circle cx="${80 + i * 70}" cy="52" r="14" fill="#f6d34a" style="stroke:#c9952a;stroke-width:2px"/><path d="M${74 + i * 70} 36l6 4 6-4" ${sk('#d23c2f', 3)}/><text x="${80 + i * 70}" y="56" font-size="8" font-weight="700" text-anchor="middle" fill="#8b5a3a">${t}</text></g>`).join('') +
        chip(s, 150, 20, 92, '连续三年夺冠', CL.a, 40);
    }},
    sacrifice: {dur: 6, hl: [10, 30], end: 60, lit: '为神圣而献出', mean: '牺牲；献出', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#1d2440" ${s.a({0: 'fill-opacity:.7', 10: 'fill-opacity:.7', 20: 'fill-opacity:.35', 92: 'fill-opacity:.35', 100: 'fill-opacity:.7'})}/>` + GND() +
        `<rect x="140" y="60" width="20" height="68" fill="#f4f1e6" style="stroke:var(--ink3);stroke-width:1px" ${s.a({0: 'transform:scaleY(1)', 10: 'transform:scaleY(1)', 50: 'transform:scaleY(.4)', 92: 'transform:scaleY(.4)', 100: 'transform:scaleY(1)'}, FOOT)}/>` +
        `<g ${s.a({0: T(0, 0), 10: T(0, 0), 50: T(0, 41), 92: T(0, 41), 100: T(0, 0)})}><path d="M150 60v-6" ${sk(INK, 1.5)}/><path d="M150 54q-8-10 0-20q8 10 0 20z" fill="#f29a2e" ${s.a({0: 'transform:scale(1)', 50: 'transform:scale(1.2,.85)', 100: 'transform:scale(1)'}, ORG(150, 54), .4)}/><circle cx="150" cy="48" r="40" fill="#f6d34a" fill-opacity=".2"/></g>` +
        [[70, CL.t], [230, CL.v]].map(([x, c]) => kid(x, 128, c, {k: .8})).join('') +
        chip(s, 150, 142, 104, '燃烧自己照亮别人', CL.a, 40);
    }},
    threaten: {dur: 6, hl: [10, 30], end: 60, lit: '使受到威胁', mean: '威胁；危及', draw: s => {
      return GND() + [[100, 110], [140, 116], [180, 110]].map(([x, y], i) => `<g ${s.a({0: T(), 30: T(), 34: T(-4), 38: T(4), 42: T(-4), 46: T(), 100: T()})}><ellipse cx="${x}" cy="${y}" rx="14" ry="10" fill="#fff" style="stroke:#c8c0b0;stroke-width:1.5px"/><circle cx="${x - 14}" cy="${y - 4}" r="5" fill="${INK}"/><path d="M${x - 6} ${y + 8}v8M${x + 6} ${y + 8}v8" ${sk(INK, 2)}/></g>`).join('') +
        `<g ${s.a(moveIn([[10, 60, 0], [26, 0, 0]]))}><path d="M230 128V86q0-20 20-24l6-14 6 14q14 6 14 24v42z" fill="#556070"/><circle cx="246" cy="78" r="2.5" fill="#f6d34a"/><circle cx="260" cy="78" r="2.5" fill="#f6d34a"/><path d="M246 90l4 4 4-4 4 4 4-4" ${sk('#fff', 1.5)}/></g>` +
        `<path d="M0 0H300V40H0z" fill="#3a3f4a" fill-opacity=".3" ${s.a(fadeP(10, 30))}/>` +
        chip(s, 140, 30, 64, '狼来了！', '#d23c2f', 30);
    }},
    ultimately: {dur: 6, hl: [10, 44], end: 60, lit: '最终地', mean: '最终；终究', draw: s => {
      return `<rect x="40" y="16" width="220" height="118" rx="4" fill="#e6f4e0" style="stroke:var(--ink3);stroke-width:2px"/><path d="M40 50h150M80 84h180M40 118h150" ${sk('#5a8f3a', 8)}/>` +
        `<path d="M60 30H230V66H60V102H230V130" ${sk(CL.a, 3)} stroke-dasharray="5 5" ${s.a(fadeP(10, 16))}/>` +
        `<g ${s.a(moveIn([[10, 60, 30], [20, 230, 30], [26, 230, 66], [36, 60, 66], [42, 60, 102], [52, 230, 102]]))}><circle cx="0" cy="0" r="6" fill="#4a90d0"/></g>` +
        `<g ${s.a(pop(52), ORG(230, 116))}><path d="M222 108h16v6a8 8 0 0 1-16 0z" fill="#f6d34a"/></g>` +
        chip(s, 150, 142, 92, '绕了半天最终到了', CL.a, 52);
    }},
    advise: {dur: 6, hl: [10, 20], end: 60, lit: '朝着看给建议', mean: '建议；劝告', draw: s => {
      return GND() + `<path d="M230 40a12 12 0 0 1 18-12 16 16 0 0 1 30 4 11 11 0 0 1-2 22h-42a9 9 0 0 1-4-14z" fill="#9aa4b4"/>` +
        kid(90, 128, CL.t, {aR: [24, -40]}) + `<path d="M114 88V60" ${sk(INK, 2)}/><path d="M96 62q18-16 36 0z" fill="#4a90d0"/>` +
        kid(180, 128, CL.a, {aL: [-14, -30]}) + chip(s, 90, 30, 64, '带把伞吧', CL.t, 10) +
        `<path d="M124 50L226 40" ${sk(CL.v, 1.5)} stroke-dasharray="3 4" ${s.a(fadeP(14, 20))}/>` +
        `<g ${s.a(pop(30), ORG(180, 60))}><circle cx="180" cy="60" r="8" fill="#3fbf6a"/><path d="M176 60l3 3 5-6" ${sk('#fff', 2)}/></g>` + chip(s, 150, 142, 84, '好心提建议', CL.v, 40);
    }},
    analysis: {dur: 6, hl: [10, 30], end: 60, lit: '彻底拆解', mean: '分析', draw: s => {
      return `<rect x="0" y="0" width="300" height="70" fill="#dff2e0"/><rect x="0" y="70" width="300" height="80" fill="#c8a06a"/>` +
        `<path d="M150 70V30" ${sk(WOOD, 6)}/><circle cx="150" cy="26" r="20" fill="#9a948c"/><circle cx="140" cy="20" r="4" fill="#c8c0a0"/><text x="150" y="30" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">枯萎</text>` +
        `<path d="M150 70q-20 20-40 30M150 70q6 24 0 40M150 70q20 20 46 26" ${sk(WOOD, 3)} ${DASH} ${s.a(drawP(10, 24))}/>` +
        `<g ${s.a(moveIn([[24, 260, 120], [32, 196, 100]]))}><circle cx="0" cy="0" r="14" ${fs('#bfe1f2', INK, 3, .4)}/><path d="M10 10l10 10" ${sk(INK, 4)}/></g>` +
        `<g ${s.a(pop(34), ORG(196, 100))}><ellipse cx="196" cy="100" rx="6" ry="3" fill="#e8dcc8"/></g><text x="230" y="82" font-size="9" font-weight="700" fill="#d23c2f" ${s.a(showAt(36))}>根被虫咬了</text>` +
        chip(s, 76, 30, 92, '归根到底是这', CL.a, 40);
    }},
    application: {dur: 6, hl: [10, 30], end: 60, lit: '拿来用的东西', mean: '申请；应用程序', draw: s => {
      return `<rect x="110" y="14" width="80" height="124" rx="10" fill="#2b2b2b"/><rect x="116" y="24" width="68" height="104" rx="3" fill="#eef6fb"/>` +
        `<rect x="124" y="70" width="52" height="8" rx="4" ${fs(CL.p, CL.m, 1)}/><rect x="125" y="71" width="50" height="6" rx="3" fill="#3fbf6a" ${s.a(growX(10, 28), 'transform-origin:0% 50%;transform-box:fill-box')}/><text x="150" y="62" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)} ${s.a(hideAt(30))}>安装中…</text>` +
        `<g ${s.a(pop(30), ORG(150, 54))}><rect x="134" y="38" width="32" height="32" rx="8" fill="#e2473a"/><text x="150" y="59" font-size="12" font-weight="700" text-anchor="middle" fill="#fff">App</text></g>` +
        kid(60, 128, CL.t, {aR: [22, -44]}) + kid(240, 128, CL.a, {aL: [-16, -32]}) + `<rect x="212" y="90" width="16" height="20" rx="1" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/><text x="220" y="104" font-size="6" font-weight="700" text-anchor="middle" ${fl(CL.k)}>申请表</text>` +
        chip(s, 150, 144, 104, '应用程序 / 申请', CL.v, 40);
    }},
    bilingual: {dur: 6, hl: [8, 16, 40], end: 60, lit: '会两种语言的', mean: '双语的', draw: s => {
      return GND() + kid(150, 128, CL.t, {aL: [-18, -40], aR: [18, -40]}) +
        `<g ${s.a(pop(8), ORG(80, 50))}><path d="M48 30h64a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6h-30l14 12-26-12h-22a6 6 0 0 1-6-6V36a6 6 0 0 1 6-6z" ${fs(CL.p, CL.v, 2)}/><text x="80" y="51" font-size="13" font-weight="700" text-anchor="middle" ${fl(CL.v)}>Hello</text></g>` +
        `<g ${s.a(pop(16), ORG(220, 50))}><path d="M188 30h64a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6h-22l-26 12 14-12h-30a6 6 0 0 1-6-6V36a6 6 0 0 1 6-6z" ${fs(CL.p, CL.a, 2)}/><text x="220" y="51" font-size="13" font-weight="700" text-anchor="middle" ${fl(CL.a)}>你好</text></g>` +
        chip(s, 150, 142, 92, '两种语言都会说', CL.t, 40);
    }},
    capacity: {dur: 6, hl: [8, 30], end: 60, lit: '能装下多少', mean: '容量；能力', draw: s => {
      return GND() + `<path d="M120 40v84a4 4 0 0 0 4 4h52a4 4 0 0 0 4-4V40" ${sk(CL.m, 3)}/>` + [0, 1, 2, 3].map(i => `<path d="M180 ${124 - i * 20}h-10" ${sk(CL.m, 1.5)}/><text x="186" y="${127 - i * 20}" font-size="8" ${fl(CL.m)}>${(i + 1) * 100}</text>`).join('') +
        `<path d="M122 44h56" ${sk('#d23c2f', 2)} stroke-dasharray="4 3"/><text x="186" y="47" font-size="8" font-weight="700" fill="#d23c2f">500 ml</text>` +
        `<rect x="123" y="44" width="54" height="81" fill="#6db7e8" fill-opacity=".7" ${s.a({0: 'transform:scaleY(0)', 8: 'transform:scaleY(0)', 30: 'transform:scaleY(1)', 92: 'transform:scaleY(1)', 100: 'transform:scaleY(0)'}, FOOT)}/>` +
        `<path d="M150 10V40" ${sk('#6db7e8', 4)} ${s.a(showAt(8, 28))}/>` + chip(s, 70, 40, 64, '装满了', CL.v, 32) + chip(s, 70, 70, 76, '最多 500 ml', '#d23c2f', 36);
    }},
    // ---------- 第五十批 ----------
    closely: {dur: 6, hl: [10, 30], end: 60, lit: '靠得近近地', mean: '密切地；仔细地', draw: s => {
      return GND() + `<path d="M180 128q10-20 30-20" ${sk('#3fbf6a', 3)}/><ellipse cx="214" cy="108" rx="14" ry="6" fill="#3fbf6a"/>` +
        `<g ${s.a(move([[10, 0, 0], [24, 0, -10]]))}><g ${s.a({0: R(0), 10: R(0), 24: R(20), 92: R(20), 100: R(0)}, ORG(110, 128))}>${kid(110, 128, CL.t, {aR: [26, -36]})}</g></g>` +
        `<g ${s.a(moveIn([[18, 0, -20], [28, 0, 0]]))}><circle cx="212" cy="100" r="18" ${fs('#bfe1f2', INK, 3, .3)}/><path d="M198 114l-10 10" ${sk(INK, 4)}/></g>` +
        `<g ${s.a(pop(30), ORG(212, 100))}><ellipse cx="212" cy="102" rx="5" ry="3" fill="#2b2b2b"/><circle cx="217" cy="101" r="2" fill="#2b2b2b"/><path d="M208 104l-3 3M212 105v4M216 104l3 3" ${sk('#2b2b2b', 1)}/></g>` +
        chip(s, 100, 30, 92, '凑近仔细看', CL.v, 34);
    }},
    commit: {dur: 6, hl: [8, 20], end: 60, lit: '送出自己', mean: '致力于；承诺；犯', draw: s => {
      return GND() + kid(110, 128, CL.t, {aR: [26, -46], aL: [6, -34]}) + kid(190, 128, CL.a, {aL: [-26, -46]}) +
        `<g ${s.a(pop(18), ORG(150, 80))}><path d="M136 82q14-8 28 0" ${sk(SKIN, 5)}/><circle cx="150" cy="78" r="4" fill="${SKIN}"/></g>` +
        `<g ${s.a(pop(8), ORG(110, 98))}>${heartAt(110, 94, .5, '#e2473a')}</g>` +
        chip(s, 150, 30, 92, '我一定做到！', CL.t, 22) + chip(s, 150, 142, 84, '拉钩许承诺', CL.a, 40);
    }},
    compete: {dur: 6, hl: [8, 20], end: 60, lit: '大家一起追', mean: '竞争；比赛', draw: s => {
      return `<path d="M0 128H300M0 104H300" ${sk(CL.m, 2, .6)}/><path d="M262 128V70" ${sk(INK, 2)}/>` +
        `<g ${s.a(pop(8), ORG(262, 54))}><path d="M252 44h20v8a10 10 0 0 1-20 0z" fill="#f6d34a"/><path d="M259 62h6v4h-6zM255 66h14v3h-14z" fill="#c9952a"/></g>` +
        `<g ${s.a(move([[20, 0, 0], [44, 120, 0]]))}>${kid(70, 104, CL.a, {k: .7, ...walkLegs(s, 70, 104, 20, 44, 10, .7)})}</g>` +

        `<g ${s.a(move([[20, 0, 0], [44, 180, 0]]))}>${kid(40, 128, CL.t, {k: .75, ...walkLegs(s, 40, 128, 20, 44, 10, .75)})}</g>` +        chip(s, 120, 30, 92, '都想拿到奖杯', CL.a, 36);
    }},
    corporate: {dur: 6, hl: [10, 40], end: 60, lit: '结成一体的', mean: '公司的；企业的', draw: s => {
      return GND() + `<g ${s.a(growY(6, 16), FOOT)}><rect x="200" y="20" width="70" height="108" fill="#8fa3b8"/>${[0, 1, 2, 3, 4].map(r => [0, 1, 2].map(c => `<rect x="${208 + c * 20}" y="${40 + r * 16}" width="12" height="10" fill="#e8f2ff"/>`).join('')).join('')}</g>` +
        `<g ${s.a(pop(16), ORG(235, 14))}><rect x="214" y="6" width="42" height="14" rx="3" fill="#d23c2f"/><text x="235" y="16" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">XX 集团</text></g>` +
        [40, 70, 100, 130, 160].map((x, i) => `<g ${s.a(moveIn([[18 + i * 3, 0, 20], [24 + i * 3, 0, 0]]))}>${kid(x, 128, '#3d4a5c', {k: .7})}<path d="M${x} 99l-2 3 2 8 2-8z" fill="#d23c2f"/></g>`).join('') +
        `<path d="M30 76Q100 50 170 76" ${sk(CL.v, 2)} stroke-dasharray="4 4" ${s.a(fadeP(38, 44))}/>` + chip(s, 100, 40, 92, '一群人一个团队', CL.v, 40);
    }},
    correlation: {dur: 6, hl: [8, 30], end: 60, lit: '共同的关系', mean: '相关性；关联', draw: s => {
      const pts = [[70, 112], [90, 104], [104, 96], [120, 92], [140, 80], [160, 74], [176, 62], [196, 56], [214, 44], [232, 40]];
      return `<path d="M60 20V120H260" ${sk(CL.m, 2)}/><text x="160" y="138" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>气温 →</text><text x="54" y="16" font-size="9" font-weight="700" ${fl(CL.m)}>冰淇淋销量</text>` +
        pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="4" fill="#4a90d0" ${s.a(pop(8 + i * 2), ORG(x, y))}/>`).join('') +
        `<path d="M64 116L240 36" ${sk(CL.a, 2.5)} ${DASH} ${s.a(drawP(30, 40))}/>` + chip(s, 236, 100, 84, '一起往上走', CL.a, 40);
    }},
    cyberloafing: {dur: 6, hl: [10, 30], end: 60, lit: '网上闲逛', mean: '上班摸鱼', draw: s => {
      return GND() + `<rect x="80" y="96" width="120" height="6" fill="${WOOD}"/><path d="M90 102v26M190 102v26" ${sk(WOOD, 3)}/>` +
        `<rect x="120" y="60" width="56" height="36" rx="3" fill="#2b2b2b"/><rect x="124" y="64" width="48" height="28" fill="#9fd0ee"/><g ${s.a(showAt(10))}><path d="M142 70v16l12-8z" fill="#d23c2f"/></g>` +
        kid(100, 128, CL.t, {noFace: true, aR: [22, -36]}) + `<path d="M94 74q2 3 4 0M102 74q2 3 4 0" ${sk(INK, 1.5)}/><path d="M94 82q6 6 12 0" ${sk(INK, 1.8)}/>` +
        `<g ${s.a(moveIn([[26, 60, 0], [36, 0, 0]]))}>${kid(250, 128, '#3d4a5c', {k: 1.05, noFace: true})}${face(250, 128, 1.05, 'sad')}</g>` +
        `<text x="236" y="58" font-size="16" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(pop(38), ORG(236, 52))}>!</text>` +
        chip(s, 150, 22, 92, '上班偷偷刷视频', CL.a, 30);
    }},
    destroy: {dur: 6, hl: [20, 8], end: 60, lit: '拆掉建好的', mean: '破坏；毁灭', draw: s => {
      const blocks = [[200, 112], [230, 112], [260, 112], [215, 92], [245, 92], [230, 72]];
      return GND() + `<path d="M60 128V10H150" ${sk('#f2b632', 5)}/><g ${s.a({0: R(40), 8: R(40), 18: R(-20), 20: R(-20), 100: R(40)}, ORG(150, 10))}><path d="M150 10V70" ${sk(INK, 1.5)}/><circle cx="150" cy="80" r="12" fill="#3a3a3a"/></g>` +
        blocks.map(([x, y], i) => `<rect x="${x - 14}" y="${y - 10}" width="28" height="20" fill="#c8664a" style="stroke:#f4e6d8;stroke-width:1px" ${s.a({0: T(0, 0, 'rotate(0deg)'), 18: T(0, 0, 'rotate(0deg)'), 30: T(f1((i % 3) * 16 + 10), f1(128 - y - 10), `rotate(${(i % 2 ? 1 : -1) * 60}deg)`), 92: T(f1((i % 3) * 16 + 10), f1(128 - y - 10), `rotate(${(i % 2 ? 1 : -1) * 60}deg)`), 100: T(0, 0, 'rotate(0deg)')}, ORG(x, y))}/>`).join('') +
        `<g ${s.a(showAt(18, 26))}>${burst(196, 96, 16).replace('<path ', `<path ${sk(CL.g, 2.5)} `)}</g>` + chip(s, 230, 30, 76, '砸塌了', '#d23c2f', 30);
    }},
    differ: {dur: 6, hl: [8, 20], end: 60, lit: '带往不同方向', mean: '不同；意见不一', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#dff2e0"/><path d="M0 110H120L300 50M120 110L300 150" ${sk('#9fd0ee', 26)}/>` +
        `<g ${s.a(moveIn([[6, 20, 110], [20, 120, 108], [48, 270, 60]]))}><path d="M-8 0q8-10 16 0q-8 10-16 0z" fill="#e2473a"/></g>` +
        `<g ${s.a(moveIn([[6, 10, 112], [20, 120, 112], [48, 270, 140]]))}><path d="M-8 0q8-10 16 0q-8 10-16 0z" fill="#f2b632"/></g>` +
        `<text x="270" y="40" font-size="9" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(showAt(48))}>东</text><text x="270" y="130" font-size="9" font-weight="700" text-anchor="middle" fill="#c9952a" ${s.a(showAt(48))}>西</text>` +
        chip(s, 90, 30, 92, '一个往东一个往西', CL.v, 40);
    }},
    difficulty: {dur: 6, hl: [10, 30], end: 60, lit: '困难的事', mean: '困难；难题', draw: s => {
      return GND() + `<path d="M150 128L220 30H260V128z" fill="#9a948c"/><path d="M220 30h40" ${sk('#fff', 3)}/>` +
        `<g ${s.a(move([[10, 0, 0], [22, 50, -30], [26, 46, -26], [34, 60, -50], [38, 52, -40], [92, 52, -40]]))}>${kid(150, 128, CL.t, {noFace: true, aL: [10, -56], aR: [22, -52]})}${face(150, 128, 1, 'sad')}<path d="M164 66q-2 5 0 7" ${sk('#6db7e8', 2)}/></g>` +
        `<path d="M200 84l6-6M210 92l6-6" ${sk(CL.m, 2)} ${s.a(showAt(26, 40))}/>` + chip(s, 80, 30, 76, '爬不上去', '#d23c2f', 36);
    }},
    diminish: {dur: 6, hl: [8, 16, 40], end: 60, lit: '越来越 mini', mean: '减少；减弱', draw: s => {
      return `<circle cx="250" cy="30" r="14" ${fl(CL.g)}/>` + GND() +
        `<g ${s.a({0: 'transform:scale(1)', 8: 'transform:scale(1)', 40: 'transform:scale(.3)', 92: 'transform:scale(.3)', 100: 'transform:scale(1)'}, ORG(150, 128))}><rect x="110" y="48" width="80" height="80" rx="8" fill="#bfe1f2" style="stroke:#6db7e8;stroke-width:3px"/><path d="M124 60l20 0M124 70l12 0" ${sk('#fff', 3)}/></g>` +
        `<ellipse cx="150" cy="130" rx="40" ry="4" fill="#6db7e8" fill-opacity=".6" ${s.a(growX(10, 40), ORG(150, 130))}/>` +
        [0, 1, 2].map(i => `<path d="M${130 + i * 20} 132q0 5-3 7" ${sk('#6db7e8', 2)} ${s.a({0: 'opacity:0', [14 + i * 6]: 'opacity:0', [16 + i * 6]: 'opacity:1', [24 + i * 6]: 'opacity:0', 100: 'opacity:0'})}/>`).join('') +
        chip(s, 80, 30, 92, '冰块越化越小', CL.v, 40);
    }},
    elite: {dur: 6, hl: [8, 20], end: 60, lit: '层层选出来的', mean: '精英；精英的', draw: s => {
      return `<path d="M40 110h220l-30-30H70zM70 80h160l-30-30h-100zM100 50h100l-30-30h-40z" fill="#e8ecf2" style="stroke:var(--ink3);stroke-width:1.5px"/>` +
        [...Array(9)].map((_, i) => `<circle cx="${60 + i * 22}" cy="100" r="4" fill="#9a948c" ${s.a(showAt(4))}/>`).join('') +
        [...Array(5)].map((_, i) => `<circle cx="${100 + i * 25}" cy="70" r="4" fill="#4a90d0" ${s.a(pop(12 + i), ORG(100 + i * 25, 70))}/>`).join('') +
        [0, 1].map(i => `<g ${s.a(pop(22 + i * 2), ORG(136 + i * 28, 38))}>${star5(136 + i * 28, 38, 8, 3.4, CL.g)}</g>`).join('') +
        chip(s, 150, 132, 92, '层层选拔的尖子', CL.a, 40);
    }},
    employment: {dur: 6, hl: [10, 40], end: 60, lit: '被雇用的状态', mean: '就业；雇用', draw: s => {
      return GND() + `<rect x="180" y="30" width="110" height="60" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="235" y="46" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>就业率</text>` +
        `<rect x="196" y="56" width="78" height="14" rx="7" ${fs(CL.p, CL.m, 1)}/><rect x="197" y="57" width="76" height="12" rx="6" fill="#3fbf6a" ${s.a({0: 'transform:scaleX(.3)', 10: 'transform:scaleX(.3)', 40: 'transform:scaleX(.92)', 92: 'transform:scaleX(.92)', 100: 'transform:scaleX(.3)'}, 'transform-origin:0% 50%;transform-box:fill-box')}/>` +
        ['30%', '92%'].map((t, i) => `<text x="235" y="84" font-size="11" font-weight="700" text-anchor="middle" fill="#3f8f4f" ${s.a(slot([0, 40, 99], i))}>${t}</text>`).join('') +
        [40, 80, 120, 160].map((x, i) => kid(x, 128, [CL.t, CL.v, CL.a, CL.g][i], {k: .75}) + `<g ${s.a(pop(14 + i * 6), ORG(x + 14, 116))}><rect x="${x + 8}" y="110" width="13" height="10" rx="2" fill="#8b5a3a"/><path d="M${x + 11} 110v-3h7v3" ${sk('#8b5a3a', 1.5)}/></g>`).join('') +
        chip(s, 100, 30, 92, '大家都有工作了', CL.t, 40);
    }},
    // ---------- 第五十一批 ----------
    excessive: {dur: 6, hl: [10, 40], end: 60, lit: '过量的', mean: '过度的；过多的', draw: s => {
      return GND() + kid(80, 128, CL.t, {noFace: true, aR: [16, -36]}) + face(80, 128, 1, 'sad') + `<rect x="94" y="80" width="12" height="18" rx="2" fill="${INK}"/><rect x="96" y="82" width="8" height="12" fill="#9fd0ee"/>` +
        `<path d="M76 70q-2-6 2-8M84 70q2-6-2-8" ${sk('#9fb3c8', 1.5)} ${s.a(showAt(30))}/>` +
        `<rect x="170" y="30" width="24" height="90" rx="5" ${fs(CL.p, CL.m, 2)}/><rect x="172" y="32" width="20" height="86" rx="4" fill="#e2473a" ${s.a({0: 'transform:scaleY(.1)', 10: 'transform:scaleY(.1)', 36: 'transform:scaleY(1)', 92: 'transform:scaleY(1)', 100: 'transform:scaleY(.1)'}, FOOT)}/>` +
        `<path d="M168 52h28" ${sk('#3fbf6a', 2)} stroke-dasharray="3 3"/><text x="202" y="56" font-size="8" font-weight="700" fill="#3f8f4f">建议 2 小时</text>` +
        ['1 小时', '4 小时', '8 小时'].map((t, i) => `<text x="182" y="22" font-size="10" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(slot([0, 18, 30, 99], i))}>${t}</text>`).join('') +
        chip(s, 240, 110, 76, '玩手机过头', '#d23c2f', 40);
    }},
    freedom: {dur: 6, hl: [10, 30], end: 60, lit: '自由的状态', mean: '自由', draw: s => {
      return `<path d="M80 30h60M110 30v6" ${sk(CL.m, 2)}/><path d="M80 36h60v70H80z" ${sk(CL.m, 2)}/><path d="M92 36v70M104 36v70M116 36v70M128 36v70" ${sk(CL.m, 1.5)}/><path d="M78 106h64" ${sk(CL.m, 4)}/>` +
        `<g ${s.a({0: 'transform:scaleX(1)', 10: 'transform:scaleX(1)', 16: 'transform:scaleX(.1)', 92: 'transform:scaleX(.1)', 100: 'transform:scaleX(1)'}, 'transform-origin:100% 50%;transform-box:fill-box')}><rect x="128" y="60" width="12" height="40" fill="#fff" fill-opacity=".01" style="stroke:var(--ink3);stroke-width:2px"/></g>` +
        `<g ${s.a(moveIn([[4, 110, 80], [16, 110, 80], [28, 180, 50], [40, 240, 30], [50, 290, 20]]))}><g ${s.a({0: 'transform:scaleY(1)', 50: 'transform:scaleY(-1)', 100: 'transform:scaleY(1)'}, '', .3)}><path d="M-10 0q10-10 20 0" ${sk('#f6d34a', 3)}/></g><circle cx="0" cy="0" r="5" fill="#f6d34a"/><path d="M5 -1l4 1-4 1z" fill="#f29a2e"/></g>` +
        chip(s, 220, 110, 76, '飞出鸟笼', CL.t, 34);
    }},
    gradually: {dur: 6, hl: [10, 40], end: 60, lit: '一步步地', mean: '逐渐地', draw: s => {
      return GND() + [0, 1, 2, 3, 4].map(i => `<g ${s.a(growY(8 + i * 8, 14 + i * 8), FOOT)}><rect x="${50 + i * 44}" y="${118 - i * 18}" width="30" height="${10 + i * 18}" rx="2" fill="#3fbf6a" fill-opacity="${.4 + i * .12}"/></g><text x="${65 + i * 44}" y="${112 - i * 18}" font-size="8" font-weight="700" text-anchor="middle" ${fl(CL.m)} ${s.a(showAt(14 + i * 8))}>第${i + 1}周</text>`).join('') +
        `<path d="M64 112L240 40" ${sk(CL.a, 2)} stroke-dasharray="4 4" ${s.a(fadeP(46, 50))}/>` + chip(s, 90, 30, 84, '一点点往上长', CL.t, 44);
    }},
    helpful: {dur: 6, hl: [10, 40], end: 60, lit: '充满帮助的', mean: '有帮助的；有用的', draw: s => {
      return GND() + `<g ${s.a({0: R(18), 16: R(18), 26: R(0), 92: R(0), 100: R(18)}, ORG(100, 128))}>${kid(100, 128, '#8b7a6a', {noFace: true, aR: [20, -30]})}<g ${s.a(hideAt(26))}>${face(100, 128, 1, 'sad')}</g><g ${s.a(showAt(26))}>${face(100, 128)}</g></g>` +
        `<g ${s.a({0: T(), 16: T(), 26: T(0, -14), 92: T(0, -14), 100: T()})}><rect x="112" y="94" width="48" height="34" rx="2" fill="${WOOD}"/><path d="M112 104h48" ${sk('#6b4428', 1.5)}/></g>` +
        `<g ${s.a(move([[6, 60, 0], [16, 0, 0]]))}>${kid(176, 128, CL.t, {aL: [-20, -36], ...walkLegs(s, 176, 128, 6, 16, 3)})}</g>` +
        chip(s, 100, 40, 52, '谢谢！', '#8b7a6a', 30) + `<g ${s.a(pop(34), ORG(176, 50))}>${heartAt(176, 46, .7)}</g>` + chip(s, 230, 30, 76, '帮了大忙', CL.t, 40);
    }},
    legal: {dur: 6, hl: [10, 30], end: 60, lit: '法律上的', mean: '合法的；法律的', draw: s => {
      return GND() + `<g ${s.a(pop(6), ORG(80, 80))}><rect x="50" y="50" width="60" height="70" rx="3" fill="#2f5d8a"/><text x="80" y="82" font-size="12" font-weight="700" text-anchor="middle" fill="#f6d34a">法律</text><path d="M58 50v70" ${sk('#1f3d6a', 3)}/></g>` +
        `<rect x="160" y="50" width="100" height="64" rx="5" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="210" y="66" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>驾驶证</text><circle cx="180" cy="90" r="10" fill="${SKIN}"/><path d="M196 84h52M196 94h40M196 104h46" ${sk(CL.m, 1.5, .6)}/>` +
        `<g ${s.a(pop(30), ORG(244, 106))}><circle cx="244" cy="106" r="13" ${sk('#3fbf6a', 2.5)}/><text x="244" y="110" font-size="9" font-weight="700" text-anchor="middle" fill="#3fbf6a">合法</text></g>` +
        `<path d="M112 84Q136 70 158 82" ${sk(CL.v, 2)} stroke-dasharray="4 4" ${s.a(fadeP(16, 22))}/>` + chip(s, 150, 142, 84, '符合法律规定', CL.t, 40);
    }},
    manner: {dur: 6, hl: [10, 40], end: 60, lit: '手上的做法', mean: '方式；礼貌', draw: s => {
      return GND() + `<rect x="100" y="96" width="100" height="6" fill="${WOOD}"/><path d="M110 102v26M190 102v26" ${sk(WOOD, 3)}/><ellipse cx="150" cy="94" rx="20" ry="4" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/>` +
        kid(80, 128, CL.t, {aR: [24, -32]}) + `<path d="M104 96l6-10M108 98l6-10" ${sk('#9a948c', 2)}/>` + `<path d="M72 96h16v14h-16z" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/>` +
        kid(226, 128, '#8b7a6a', {aL: [-14, -30]}) + chip(s, 80, 40, 64, '谢谢阿姨', CL.t, 14) + `<g ${s.a(pop(26), ORG(226, 56))}><circle cx="226" cy="56" r="8" fill="#3fbf6a"/><path d="M222 56l3 3 5-6" ${sk('#fff', 2)}/></g>` +
        chip(s, 150, 142, 76, '有礼貌', CL.a, 40);
    }},
    neuroscience: {dur: 6, hl: [10, 30], end: 60, lit: '研究神经的科学', mean: '神经科学', draw: s => {
      const nodes = [[110, 60], [140, 46], [170, 56], [130, 80], [160, 84], [186, 76], [120, 100], [150, 104]];
      const links = [[0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [2, 5], [3, 6], [4, 7], [6, 7], [1, 4]];
      return `<path d="M90 80q-4-46 60-50q60 0 60 44q0 34-36 42h-50q-30-4-34-36z" fill="#f2c9c0" style="stroke:#d89a90;stroke-width:2px"/>` +
        links.map(([a, b], i) => `<path d="M${nodes[a][0]} ${nodes[a][1]}L${nodes[b][0]} ${nodes[b][1]}" ${sk('#9b7fd0', 1.5)} ${DASH} ${s.a(drawP(10 + i * 2, 14 + i * 2))}/>`).join('') +
        nodes.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="4" fill="#7a5ab0"/><circle cx="${x}" cy="${y}" r="7" fill="#f6d34a" fill-opacity=".6" ${s.a({0: 'opacity:0', [30 + i * 3]: 'opacity:0', [31 + i * 3]: 'opacity:1', [34 + i * 3]: 'opacity:0', 100: 'opacity:0'})}/>`).join('') +
        chip(s, 240, 30, 92, '研究脑里的神经', CL.v, 40) + `<text x="66" y="140" font-size="9" font-weight="700" ${fl(CL.m)}>neuro = 神经</text>`;
    }},
    nutrition: {dur: 6, hl: [10, 40], end: 60, lit: '滋养身体的东西', mean: '营养', draw: s => {
      return GND() + kid(200, 128, CL.t, {k: 1.1}) +
        [[40, 50, '#e2473a', '维生素'], [60, 90, '#f2c641', '蛋白质'], [90, 40, '#3fbf6a', '纤维']].map(([x, y, c, t], i) => `<g ${s.a((f => { f[27 + i * 6] = T(200, 96) + ';opacity:0'; f[92] = f[27 + i * 6]; return f; })(moveIn([[10 + i * 6, x, y], [26 + i * 6, 200, 96]])))}><circle cx="0" cy="0" r="9" fill="${c}"/><text x="0" y="-12" font-size="7" font-weight="700" text-anchor="middle" ${fl(CL.k)}>${t}</text></g>`).join('') +
        `<g ${s.a(showAt(40))}><circle cx="200" cy="90" r="34" fill="#f6d34a" fill-opacity=".2"/></g>` +
        `<g ${s.a(pop(42), ORG(244, 50))}><path d="M238 58v-14M232 50l6-6 6 6" ${sk('#3fbf6a', 3)}/></g>` + chip(s, 100, 130, 92, '吃进身体的养分', CL.t, 40);
    }},
    obesity: {dur: 6, hl: [8, 16, 40], end: 60, lit: '吃多变胖', mean: '肥胖（症）', draw: s => {
      return GND() + `<rect x="120" y="118" width="60" height="10" rx="3" fill="#e8e8e8" style="stroke:var(--ink3);stroke-width:1.5px"/>` +
        `<g ${s.a({0: 'transform:scale(1,1)', 10: 'transform:scale(1,1)', 36: 'transform:scale(1.6,1)', 92: 'transform:scale(1.6,1)', 100: 'transform:scale(1,1)'}, ORG(150, 118))}>${kid(150, 118, CL.a, {noFace: true})}</g>${face(150, 118, 1, 'sad')}` +
        [[60, 90, 8], [80, 70, 14], [70, 50, 20]].map(([x, y, p]) => `<g ${s.a({0: 'opacity:0;' + T(x, y), [p]: 'opacity:0;' + T(x, y), [p + 1]: 'opacity:1;' + T(x, y), [p + 6]: 'opacity:0;' + T(146, 74), 100: 'opacity:0'})}><path d="M-8 4a8 6 0 0 1 16 0z" fill="${BREAD}"/><rect x="-8" y="4" width="16" height="3" fill="#8b4a2a"/></g>`).join('') +
        `<rect x="216" y="30" width="64" height="26" rx="4" fill="#26324a"/>` + ['50 kg', '90 kg'].map((t, i) => `<text x="248" y="48" font-size="12" font-weight="700" text-anchor="middle" fill="${i ? '#e2473a' : '#7cf0b0'}" ${s.a(slot([0, 30, 99], i))}>${t}</text>`).join('') +
        chip(s, 248, 76, 64, '太胖了', '#d23c2f', 40);
    }},
    opposite: {dur: 6, hl: [10, 20, 40], end: 60, lit: '面对面放着的', mean: '相反的；对面的', draw: s => {
      return `<rect x="0" y="66" width="300" height="24" fill="#c8c0b0"/><path d="M0 78H300" ${sk('#fff', 2)} stroke-dasharray="10 8"/>` +
        `<path d="M40 64V30h60v34M30 30l40-18 40 18z" fill="#f4e6c8"/><path d="M30 30l40-18 40 18z" fill="#d23c2f"/><path d="M200 120V92h60v28M190 92l40-18 40 18z" fill="#dff2ff"/><path d="M190 92l40-18 40 18z" fill="#2f5d8a"/>` +
        `<text x="70" y="52" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>超市</text><text x="230" y="112" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>银行</text>` +
        `<path d="M70 68L230 90" ${sk(CL.a, 2.5)} stroke-dasharray="4 4" ${s.a(fadeP(20, 26))}/><path d="M220 82l10 8-12 2" ${sk(CL.a, 2.5)} ${s.a(showAt(26))}/>` +
        chip(s, 150, 134, 92, '就在马路对面', CL.a, 40);
    }},
    organize: {dur: 6, hl: [10, 30], end: 60, lit: '让各部分运转', mean: '组织；安排', draw: s => {
      const chairs = [0, 1, 2, 3, 4, 5];
      return GND() + `<rect x="200" y="30" width="90" height="40" rx="3" fill="#d23c2f"/><text x="245" y="54" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">读书会</text>` +
        chairs.map(i => { const sx = 30 + ((i * 47) % 140), sy = 80 + ((i * 29) % 30), ex = 36 + i * 28, ey = 120;
          return `<g ${s.a({0: T(sx - ex, sy - ey, 'rotate(' + (i * 30 - 60) + 'deg)'), 10: T(sx - ex, sy - ey, 'rotate(' + (i * 30 - 60) + 'deg)'), [16 + i * 3]: T(0, 0, 'rotate(0deg)'), 92: T(0, 0, 'rotate(0deg)'), 100: T(sx - ex, sy - ey, 'rotate(' + (i * 30 - 60) + 'deg)')}, ORG(ex, ey))}><path d="M${ex - 8} ${ey}h16M${ex - 8} ${ey}v-14M${ex - 8} ${ey}v8M${ex + 8} ${ey}v8" ${sk(WOOD, 3)}/></g>`; }).join('') +
        kid(250, 128, CL.t, {aL: [-20, -44]}) + chip(s, 100, 30, 92, '把活动安排好', CL.v, 40);
    }},
    perfectionism: {dur: 6, hl: [8, 14, 22, 40], end: 60, lit: '追求完美的主义', mean: '完美主义', draw: s => {
      return GND() + `<rect x="120" y="96" width="100" height="6" fill="${WOOD}"/><path d="M130 102v26M210 102v26" ${sk(WOOD, 3)}/><rect x="146" y="70" width="40" height="26" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/>` +
        [0, 1, 2].map(i => `<path d="M166 ${83 - 6}a7 6 0 1 1-1 0" ${sk(CL.m, 1.5)} ${s.a({0: 'opacity:0', [8 + i * 10]: 'opacity:0', [10 + i * 10]: 'opacity:1', [16 + i * 10]: 'opacity:1', [18 + i * 10]: 'opacity:0', 100: 'opacity:0'})}/>`).join('') +
        [0, 1, 2, 3].map(i => `<g ${s.a(moveIn([[16 + i * 8, 166, 84], [22 + i * 8, 236 + (i % 2) * 16, 120 - Math.floor(i / 2) * 10]]))}><circle cx="0" cy="0" r="6" fill="#f4f1e6" style="stroke:#c8c0b0;stroke-width:1px"/><path d="M-3 -2l4 3M2 -3l-2 5" ${sk('#c8c0b0', 1)}/></g>`).join('') +
        kid(100, 128, CL.v, {noFace: true, aR: [30, -40]}) + face(100, 128, 1, 'sad') + `<path d="M114 66q-2 5 0 7" ${sk('#6db7e8', 2)}/>` +
        chip(s, 100, 34, 76, '还不够完美', '#7a5ab0', 30) + chip(s, 236, 30, 92, '画了扔，扔了画', CL.a, 40);
    }},
    // ---------- 第五十二批 ----------
    react: {dur: 6, hl: [20, 14], end: 60, lit: '别人动你回一下', mean: '反应；回应', draw: s => {
      return GND() + `<rect x="160" y="96" width="80" height="32" fill="#556070"/><rect x="176" y="84" width="48" height="12" rx="2" fill="#3a3a3a"/><ellipse cx="200" cy="82" rx="20" ry="4" fill="#9a948c"/>` +
        `<g ${s.a(showAt(4))}>${[0, 1, 2].map(i => `<path d="M${190 + i * 10} 76q-4-6 0-12" ${sk('#e2763a', 1.5)}/>`).join('')}</g>` +
        `<g ${s.a({0: T(), 8: T(), 14: T(30, -4), 16: T(30, -4), 20: T(-10, 0), 92: T(-10, 0), 100: T()})}>${kid(120, 128, CL.t, {noFace: true, aR: [36, -46]})}<g ${s.a(hideAt(16))}>${face(120, 128)}</g><g ${s.a(showAt(16))}>${face(120, 128, 1, 'sad')}</g></g>` +
        `<g ${s.a(showAt(15, 26))}>${burst(186, 80, 10).replace('<path ', `<path ${sk('#e2473a', 2)} `)}</g>` +
        chip(s, 110, 36, 48, '烫！', '#d23c2f', 16) + chip(s, 150, 142, 92, '一碰就缩回来', CL.a, 30);
    }},
    reader: {dur: 6, hl: [10, 40], end: 60, lit: '读的人', mean: '读者；读物', draw: s => {
      return GND() + `<rect x="200" y="30" width="90" height="98" fill="${WOOD}" fill-opacity=".5"/>${[0, 1, 2].map(r => [0, 1, 2, 3, 4].map(c => `<rect x="${206 + c * 16}" y="${36 + r * 30}" width="10" height="24" fill="${[CL.a, CL.t, CL.v, CL.g, '#3fbf6a'][(r + c) % 5]}"/>`).join('')).join('')}` +
        `<path d="M80 128v-24h50v24M76 104h58" ${sk('#9b7fd0', 6)}/>` + kid(105, 104, CL.t, {k: .9, aL: [10, -30], aR: [20, -30]}) +
        `<path d="M118 78q-8-4-16 0v14q8-4 16 0q8-4 16 0V78q-8-4-16 0z" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/>` +
        [0, 1].map(i => `<g ${s.a({0: 'opacity:0;' + T(), [12 + i * 16]: 'opacity:0;' + T(), [14 + i * 16]: 'opacity:1;' + T(), [28 + i * 16]: 'opacity:0;' + T(10, -30), 100: 'opacity:0'})}>${heartAt(130, 62, .4, CL.a)}</g>`).join('') +
        chip(s, 100, 30, 64, '爱读书的人', CL.v, 40);
    }},
    reform: {dur: 6, hl: [10, 30], end: 60, lit: '重新塑形', mean: '改革；改造', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#e6f4e0"/>` + `<g ${s.a(hideAt(26))}><path d="M0 110Q40 60 80 110T160 100T240 120T300 90" ${sk('#c8a06a', 10)}/>${[40, 120, 200].map(x => `<circle cx="${x}" cy="${100 + (x % 3) * 4}" r="4" fill="#9a948c"/>`).join('')}</g>` +
        `<g ${s.a(showAt(28))}><path d="M0 104H300" ${sk('#6b6b6b', 22)}/><path d="M0 104H300" ${sk('#fff', 2)} stroke-dasharray="12 10"/></g>` +
        `<g ${s.a(moveIn([[10, 0, 104], [28, 300, 104]]))}><rect x="-20" y="-18" width="40" height="22" rx="3" fill="#f2b632"/><rect x="-26" y="-4" width="10" height="16" fill="#556070"/><circle cx="-10" cy="6" r="6" fill="${INK}"/><circle cx="12" cy="6" r="6" fill="${INK}"/></g>` +
        `<text x="70" y="40" font-size="10" font-weight="700" text-anchor="middle" fill="#8b5a3a" ${s.a(hideAt(26))}>坑坑洼洼的土路</text>` + chip(s, 150, 30, 92, '重新修成大路', CL.t, 34);
    }},
    responsible: {dur: 6, hl: [8, 18, 40], end: 60, lit: '能兑现承诺的', mean: '负责的', draw: s => {
      const dog = `<ellipse cx="0" cy="0" rx="14" ry="8" fill="#c98a4a"/><circle cx="14" cy="-6" r="7" fill="#c98a4a"/><path d="M17 -10l4-4 1 6z" fill="#8b5a3a"/><circle cx="16" cy="-7" r="1.2" fill="${INK}"/><path d="M-8 8v8M8 8v8" ${sk('#c98a4a', 3)}/><path d="M-14 -2q-8-6-6-12" ${sk('#c98a4a', 3)}/>`;
      return GND() + `<g ${s.a(move([[8, -40, 0], [44, 120, 0]]))}>${kid(60, 128, CL.t, {aR: [18, -36], ...walkLegs(s, 60, 128, 8, 44, 10)})}<path d="M78 92Q90 100 100 108" ${sk(CL.a, 1.5)}/><g transform="translate(106 112)">${dog}</g></g>` +
        ['周一', '周二', '周三'].map((d, i) => `<g ${s.a(pop(14 + i * 8), ORG(220 + i * 26, 30))}><rect x="${208 + i * 26}" y="18" width="24" height="24" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/><text x="${220 + i * 26}" y="28" font-size="6" text-anchor="middle" ${fl(CL.m)}>${d}</text><path d="M${215 + i * 26} 34l3 3 5-6" ${sk('#3fbf6a', 2)}/></g>`).join('') +
        chip(s, 100, 30, 84, '天天遛狗不偷懒', CL.t, 40);
    }},
    survive: {dur: 6, hl: [10, 40], end: 60, lit: '超过危险还活着', mean: '幸存；挺过', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#556070" ${s.a({0: 'fill-opacity:.5', 10: 'fill-opacity:.5', 40: 'fill-opacity:0', 92: 'fill-opacity:0', 100: 'fill-opacity:.5'})}/><circle cx="250" cy="30" r="14" ${fl(CL.g)} ${s.a(showAt(40))}/>` +
        `<path d="M0 110q25-20 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0V150H0z" fill="#4a90d0" ${s.a({0: T(0, 0), 25: T(-30, 6), 50: T(0, 0), 75: T(-30, 6), 100: T(0, 0)}, '', 1.5)}/>` +
        `<g ${s.a({0: T(0, 0, 'rotate(0deg)'), 10: T(0, 0, 'rotate(-14deg)'), 16: T(20, -6, 'rotate(14deg)'), 22: T(40, 0, 'rotate(-12deg)'), 28: T(60, -4, 'rotate(10deg)'), 40: T(110, 0, 'rotate(0deg)'), 92: T(110, 0, 'rotate(0deg)'), 100: T(0, 0, 'rotate(0deg)')}, ORG(80, 104))}><path d="M60 100h40l-8 10H68z" fill="${WOOD}"/><path d="M80 100V70" ${sk(INK, 2)}/><path d="M80 72l18 18H80z" fill="#fff"/></g>` +
        `<path d="M230 110l30-20 40 20z" fill="#c8a06a" ${s.a(showAt(36))}/>` + chip(s, 150, 30, 92, '风浪里挺过来了', CL.t, 40);
    }},
    transportation: {dur: 6, hl: [10, 40], end: 60, lit: '运输这件事', mean: '交通；运输', draw: s => {
      return `<path d="M0 128H300" ${sk(CL.m, 2)}/><path d="M0 96H300" ${sk('#6b6b6b', 2)}/><path d="M0 92H300" ${sk('#9a948c', 2)} stroke-dasharray="4 6"/>` +
        `<g ${s.a({0: T(-80, 0), 100: T(380, 0)}, 'animation-timing-function:linear', 3)}><rect x="0" y="104" width="60" height="20" rx="4" fill="#f2b632"/>${[8, 22, 36].map(x => `<rect x="${x}" y="108" width="10" height="7" fill="#bfe1f2"/>`).join('')}<circle cx="12" cy="126" r="4" fill="${INK}"/><circle cx="48" cy="126" r="4" fill="${INK}"/></g>` +
        `<g ${s.a({0: T(380, 0), 100: T(-120, 0)}, 'animation-timing-function:linear', 4)}><rect x="0" y="76" width="90" height="16" rx="6" fill="#d23c2f"/>${[10, 30, 50, 70].map(x => `<rect x="${x}" y="80" width="12" height="6" fill="#fff"/>`).join('')}</g>` +
        `<g ${s.a({0: T(-60, 40), 100: T(360, 0)}, 'animation-timing-function:linear', 5)}><path d="M0 0h30l8-4-8-4H0z" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/><path d="M12 -4l-6-10h6l8 10z" fill="#9fb3c8"/></g>` +
        chip(s, 150, 22, 92, '汽车火车飞机', CL.v, 10);
    }},
    unnecessary: {dur: 6, hl: [10, 30], end: 60, lit: '不需要的', mean: '不必要的', draw: s => {
      return GND() + `<circle cx="250" cy="30" r="14" ${fl(CL.g)}/>` + kid(130, 128, CL.t, {noFace: true, aL: [-10, -40], aR: [16, -40]}) + face(130, 128, 1, 'sad') + `<path d="M144 66q-2 5 0 7" ${sk('#6db7e8', 2)}/>` +
        [[110, '#4a90d0'], [120, '#e2473a'], [150, '#3fbf6a']].map(([x, c], i) => `<g ${s.a(pop(8 + i * 4), ORG(x, 60))}><path d="M${x} 90V62" ${sk(INK, 2)}/><path d="M${x - 14} 64q14-16 28 0z" fill="${c}"/></g>`).join('') +
        `<rect x="160" y="96" width="24" height="28" rx="4" fill="#8b5a3a"/>` + chip(s, 200, 70, 64, '大晴天', '#c9952a', 20) +
        `<path d="M96 40l60 30M156 40l-60 30" ${sk('#d23c2f', 3)} ${s.a(showAt(30))}/>` + chip(s, 130, 142, 92, '带三把伞？多余', '#d23c2f', 34);
    }},
    useful: {dur: 6, hl: [10, 30], end: 60, lit: '充满用处的', mean: '有用的；有益的', draw: s => {
      return GND() + `<path d="M240 128V40" ${sk(WOOD, 8)}/><path d="M240 60H190" ${sk(WOOD, 4)}/><circle cx="252" cy="34" r="26" fill="#3f8f4f"/><circle cx="196" cy="66" r="7" fill="#e2473a" ${s.a({0: 'opacity:1;' + T(), 32: 'opacity:1;' + T(), 38: 'opacity:1;' + T(-40, 30), 92: 'opacity:1;' + T(-40, 30), 100: 'opacity:1;' + T()})}/>` +
        `<g ${s.a(moveIn([[8, -60, 0], [18, 0, 0]]))}><path d="M160 128L190 60M180 128L210 60" ${sk('#c9952a', 4)}/>${[0, 1, 2, 3].map(i => `<path d="M${165 + i * 7} ${116 - i * 16}h20" ${sk('#c9952a', 3)}/>`).join('')}</g>` +
        `<g ${s.a(move([[20, 0, 0], [30, 24, -40]]))}>${kid(150, 128, CL.t, {k: .8, aR: [16, -50]})}</g>` +
        chip(s, 80, 30, 92, '梯子帮你够到', CL.t, 34);
    }},
    variability: {dur: 6, hl: [10, 40], end: 60, lit: '会变的性质', mean: '可变性', draw: s => {
      const pts = [[40, 80], [70, 50], [100, 100], [130, 40], [160, 96], [190, 54], [220, 108], [250, 46], [270, 84]];
      return `<path d="M30 20V120H280" ${sk(CL.m, 2)}/><text x="34" y="16" font-size="9" font-weight="700" ${fl(CL.m)}>气温</text>` +
        `<path d="M${pts.map(p => p.join(' ')).join('L')}" ${sk(CL.a, 3)} ${DASH} ${s.a(drawP(10, 40))}/>` +
        `<path d="M30 40H280M30 108H280" ${sk('#9fb3c8', 1.5)} stroke-dasharray="4 4" ${s.a(fadeP(40, 44))}/>` +
        `<path d="M286 44v60M282 50l4-6 4 6M282 98l4 6 4-6" ${sk(CL.v, 2)} ${s.a(showAt(42))}/>` + chip(s, 150, 138, 92, '忽高忽低变不停', CL.a, 44);
    }},
    vital: {dur: 6, hl: [10, 30], end: 60, lit: '关乎生命的', mean: '至关重要的', draw: s => {
      const stones = [[100, 118], [96, 98], [100, 78], [112, 60], [132, 48], [168, 48], [188, 60], [200, 78], [204, 98], [200, 118]];
      return GND() + stones.map(([x, y], i) => `<rect x="${x - 10}" y="${y - 9}" width="20" height="18" rx="2" fill="#c8c0b0" style="stroke:#9a948c;stroke-width:1px" ${s.a({0: T(0, 0, 'rotate(0deg)'), 30: T(0, 0, 'rotate(0deg)'), 40: T(f1((i < 5 ? -1 : 1) * 10), f1(120 - y), `rotate(${(i % 2 ? 1 : -1) * 40}deg)`), 92: T(f1((i < 5 ? -1 : 1) * 10), f1(120 - y), `rotate(${(i % 2 ? 1 : -1) * 40}deg)`), 100: T(0, 0, 'rotate(0deg)')}, ORG(x, y))}/>`).join('') +
        `<g ${s.a({0: T(), 16: T(), 28: T(60, -30), 92: T(60, -30), 100: T()})}><path d="M140 40h20l-4 18h-12z" fill="#d23c2f" style="stroke:#a82a20;stroke-width:1px"/></g>` +
        `<text x="150" y="30" font-size="9" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(hideAt(16))}>拱顶石</text>` +
        chip(s, 236, 120, 92, '少了它全塌了', '#d23c2f', 40);
    }},
    acquire: {dur: 6, hl: [10, 30], end: 60, lit: '求而得之', mean: '获得；学到', draw: s => {
      return `<rect x="0" y="80" width="300" height="70" fill="#6db7e8" fill-opacity=".5"/>` +
        `<g ${s.a({0: T(0, 0), 10: T(0, 10), 16: T(10, 0), 22: T(20, 10), 28: T(40, 0), 34: T(60, -2), 92: T(60, -2), 100: T(0, 0)})}><g transform="rotate(-70 90 100)">${kid(90, 100, CL.t, {k: .8, aL: [-16, -40], aR: [16, -40]})}</g></g>` +
        [0, 1, 2].map(i => `<path d="M${80 + i * 40} 96q6-6 12 0" ${sk('#fff', 2)} ${s.a({0: 'opacity:0', [12 + i * 6]: 'opacity:0', [14 + i * 6]: 'opacity:1', [22 + i * 6]: 'opacity:0', 100: 'opacity:0'})}/>`).join('') +
        `<g ${s.a(pop(36), ORG(240, 40))}><circle cx="240" cy="40" r="16" fill="#f6d34a" style="stroke:#c9952a;stroke-width:2px"/><text x="240" y="44" font-size="9" font-weight="700" text-anchor="middle" fill="#8b5a3a">会游泳</text></g>` +
        chip(s, 100, 30, 92, '练出一门本事', CL.t, 40);
    }},
    adventure: {dur: 6, hl: [8, 14, 40], end: 60, lit: '迎向未知', mean: '冒险；奇遇', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#dff2e0"/><path d="M150 128q0-90 80-90t70 90z" fill="#5a4a3a"/><path d="M190 128q0-50 40-50t40 50z" fill="#1d1a16"/>` + GND() +
        `<g ${s.a(move([[8, -60, 0], [36, 120, 0]]))}>${kid(80, 128, CL.t, {aR: [18, -46], ...walkLegs(s, 80, 128, 8, 36, 8)})}<path d="M98 82v-14" ${sk(WOOD, 3)}/><path d="M98 68q-5-8 0-14q5 6 0 14z" fill="#f29a2e"/><path d="M72 84h-6v22h6" fill="#c9952a"/></g>` +
        `<g ${s.a(showAt(38))}><circle cx="218" cy="82" r="30" fill="#f6d34a" fill-opacity=".25"/><text x="230" y="110" font-size="14" font-weight="700" text-anchor="middle" fill="#f6d34a">?</text></g>` +
        chip(s, 90, 30, 92, '举着火把进山洞', CL.a, 40);
    }},
    // ---------- 第五十三批 ----------
    association: {dur: 6, hl: [8, 16, 40], end: 60, lit: '伙伴们聚到一起', mean: '协会；联系', draw: s => {
      return GND() + `<rect x="100" y="20" width="100" height="26" rx="4" fill="#2f5d8a"/><text x="150" y="37" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">摄影协会</text>` +
        [[60, CL.t, -60], [110, CL.v, -40], [160, CL.a, 40], [210, CL.g, 60]].map(([x, c, dx], i) => `<g ${s.a(moveIn([[8 + i * 4, dx, 0], [18 + i * 4, 0, 0]]))}>${kid(x, 128, c, {k: .85, aR: [12, -30]})}<rect x="${x + 6}" y="96" width="12" height="9" rx="2" fill="${INK}"/><circle cx="${x + 12}" cy="100" r="2.5" fill="#9fd0ee"/></g>`).join('') +
        `<path d="M40 70Q150 46 230 70" ${sk(CL.a, 2)} stroke-dasharray="4 4" ${s.a(fadeP(34, 40))}/>` + chip(s, 150, 142, 92, '同好聚成一个会', CL.a, 40);
    }},
    autonomous: {dur: 6, hl: [8, 16, 40], end: 60, lit: '自己定规矩的', mean: '自主的；自治的', draw: s => {
      return `<rect x="0" y="96" width="300" height="34" fill="#6b6b6b"/><path d="M0 113H300" ${sk('#fff', 2)} stroke-dasharray="12 10"/>` + GND() +
        `<g ${s.a({0: T(-100), 100: T(340)}, 'animation-timing-function:linear', 4)}><rect x="0" y="94" width="70" height="22" rx="8" fill="#3fbf6a"/><path d="M12 94l10-14h28l12 14z" fill="#3fbf6a"/><path d="M24 92l6-9h12v9z" fill="#bfe1f2"/><circle cx="14" cy="118" r="7" fill="${INK}"/><circle cx="56" cy="118" r="7" fill="${INK}"/><circle cx="40" cy="74" r="4" fill="#e2473a"/><path d="M40 70v-6" ${sk(INK, 1.5)}/></g>` +
        `<g ${s.a(pop(16), ORG(150, 40))}><rect x="104" y="26" width="92" height="26" rx="5" fill="#26324a"/><text x="150" y="43" font-size="10" font-weight="700" text-anchor="middle" fill="#7cf0b0">没人也能开</text></g>` +
        chip(s, 150, 142, 92, '自己做主 = 自主', CL.t, 40);
    }},
    collection: {dur: 6, hl: [10, 40], end: 60, lit: '收集起来的东西', mean: '收藏品；收集', draw: s => {
      return `<rect x="60" y="16" width="180" height="118" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="150" y="32" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>我的邮票册</text>` +
        [...Array(8)].map((_, i) => { const x = 82 + (i % 4) * 40, y = 52 + Math.floor(i / 4) * 42; return `<rect x="${x - 14}" y="${y - 12}" width="28" height="32" fill="#f4f1e6" style="stroke:#c8c0b0;stroke-width:1px;stroke-dasharray:2 2"/><g ${s.a(pop(10 + i * 4), ORG(x, y + 4))}><rect x="${x - 12}" y="${y - 10}" width="24" height="28" fill="${[CL.a, CL.t, CL.v, CL.g][i % 4]}" style="stroke:#fff;stroke-width:2px;stroke-dasharray:3 2"/>${star5(x, y + 4, 5, 2.2, '#fff')}</g>`; }).join('') +
        chip(s, 150, 142, 84, '集满一整本', CL.a, 46);
    }},
    commercial: {dur: 6, hl: [10, 40], end: 60, lit: '做生意的', mean: '商业的；广告', draw: s => {
      return `<rect x="60" y="16" width="180" height="104" rx="6" fill="#2b2b2b"/><rect x="68" y="24" width="164" height="84" fill="#fff6c8"/>` +
        `<g ${s.a(pop(10), ORG(120, 66))}><rect x="104" y="44" width="30" height="50" rx="6" fill="#e2473a"/><rect x="108" y="56" width="22" height="16" fill="#fff"/><text x="119" y="68" font-size="7" font-weight="700" text-anchor="middle" fill="#e2473a">可乐</text></g>` +
        `<g ${s.a(pop(18), ORG(184, 54))}><text x="184" y="58" font-size="14" font-weight="700" text-anchor="middle" fill="#d23c2f">限时特价！</text></g><g ${s.a(pop(24), ORG(184, 82))}><text x="184" y="88" font-size="18" font-weight="700" text-anchor="middle" fill="#2b2b2b">¥3</text></g>` +
        `<rect x="74" y="28" width="22" height="10" rx="2" fill="#f6d34a"/><text x="85" y="36" font-size="6" font-weight="700" text-anchor="middle" fill="#8b5a3a">广告</text><path d="M130 120l-10 14M170 120l10 14" ${sk('#2b2b2b', 3)}/>` +
        chip(s, 150, 142, 92, '电视广告卖货', CL.a, 40);
    }},
    complicated: {dur: 6, hl: [20, 30], end: 60, lit: '被折叠搞乱的', mean: '复杂的', draw: s => {
      const gear = (x, y, r, dir, c, p) => `<g ${s.a(pop(p), ORG(x, y))}><g ${s.a({0: R(0), 100: R(360 * dir)}, ORG(x, y) + ';animation-timing-function:linear', 3)}><circle cx="${x}" cy="${y}" r="${r}" ${sk(c, 6)} stroke-dasharray="4 3"/><circle cx="${x}" cy="${y}" r="${r - 3}" ${fl(c)}/></g></g>`;
      return gear(90, 60, 18, 1, '#556070', 6) + gear(122, 84, 14, -1, '#8a96a3', 9) + gear(154, 56, 16, 1, '#556070', 12) + gear(186, 86, 12, -1, '#8a96a3', 15) + gear(140, 116, 10, 1, '#556070', 18) + gear(214, 56, 14, -1, '#8a96a3', 21) +
        `<path d="M70 120Q110 90 160 130T250 110" ${sk(CL.a, 2)} ${DASH} ${s.a(drawP(20, 34))}/><path d="M240 30Q200 70 230 100" ${sk(CL.v, 2)} ${DASH} ${s.a(drawP(24, 36))}/>` +
        kid(270, 128, CL.t, {noFace: true, aR: [8, -62]}) + face(270, 128, 1, 'sad') + `<text x="252" y="48" font-size="16" font-weight="700" ${fl(CL.v)} ${s.a(pop(34), ORG(256, 42))}>?</text>` +
        chip(s, 100, 22, 92, '一层套一层好乱', CL.a, 40);
    }},
    continent: {dur: 6, hl: [10, 30], end: 60, lit: '连成一整片的地', mean: '大陆；洲', draw: s => {
      const pieces = [[`M90 60q20-20 50-10l10 30-30 20-30-10z`, -50, -20], [`M150 50q30-10 50 10l-10 30-40-10z`, 40, -30], [`M120 100l30-20 30 20-10 30-40 0z`, -20, 40], [`M180 90l30-10 20 30-30 20z`, 50, 30]];
      return `<rect x="0" y="0" width="300" height="150" fill="#9fd0ee"/>` + pieces.map(([d, dx, dy], i) => `<g ${s.a({0: T(dx, dy), 10: T(dx, dy), 30: T(0, 0), 92: T(0, 0), 100: T(dx, dy)})}><path d="${d}" fill="${['#8fc98a', '#9fc36a', '#a8c97a', '#8fb86a'][i]}" style="stroke:#5f8f4f;stroke-width:1.5px"/></g>`).join('') +
        chip(s, 150, 20, 92, '一块块拼成大陆', CL.t, 34);
    }},
    contribution: {dur: 6, hl: [10, 40], end: 60, lit: '贡献出来的', mean: '贡献；捐款', draw: s => {
      return GND() + `<rect x="130" y="80" width="40" height="48" rx="3" fill="#d23c2f"/><path d="M140 84h20" ${sk(INK, 3)}/><text x="150" y="110" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">捐款箱</text>${heartAt(150, 94, .4, '#fff')}` +
        [[60, CL.t], [100, CL.v], [200, CL.a], [240, CL.g]].map(([x, c], i) => kid(x, 128, c, {k: .8, aR: x < 150 ? [14, -30] : [-14, -30], aL: x < 150 ? [-10, -20] : [-14, -30]}) + `<g ${s.a((f => { f[f1(22 + i * 6)] = T(150, 82) + ';opacity:0'; f[92] = f[f1(22 + i * 6)]; return f; })(moveIn([[10 + i * 6, x + (x < 150 ? 12 : -12), 104], [16 + i * 6, x < 150 ? 130 : 170, 70], [21 + i * 6, 150, 82]])))}><circle cx="0" cy="0" r="5" ${fs(CL.g, '#a8741a', 1)}/></g>`).join('') +
        chip(s, 150, 40, 92, '每人出一份力', CL.a, 40);
    }},
    dementia: {dur: 6, hl: [8, 16, 40], end: 60, lit: '心智丢了的病', mean: '痴呆（症）', draw: s => {
      const photos = [[60, 40, '#f2a3b3'], [100, 26, '#9fd0ee'], [140, 40, '#f6d34a']];
      return GND() + kid(100, 128, '#8b7a6a', {noFace: true}) + `<path d="M89 75a11 11 0 0 1 22 0q-5-5-11-3.5t-11 3.5z" fill="#dcdcdc"/>` + face(100, 128, 1, 'sad') +
        photos.map(([x, y, c], i) => `<g ${s.a({0: 'opacity:1', [16 + i * 8]: 'opacity:1', [24 + i * 8]: 'opacity:0', 96: 'opacity:0', 100: 'opacity:1'})}><rect x="${x - 14}" y="${y - 12}" width="28" height="24" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/><rect x="${x - 11}" y="${y - 9}" width="22" height="14" fill="${c}"/></g>`).join('') +
        `<text x="100" y="56" font-size="14" font-weight="700" text-anchor="middle" ${fl(CL.m)} ${s.a(showAt(40))}>?</text>` +
        kid(200, 128, CL.t, {aL: [-40, -40]}) + chip(s, 200, 50, 64, '奶奶，是我', CL.t, 30) + chip(s, 150, 142, 92, '记忆慢慢丢了', '#8b7a6a', 44);
    }},
    disability: {dur: 6, hl: [10, 30], end: 60, lit: '失去某种能力', mean: '残疾；缺陷', draw: s => {
      return `<path d="M0 128H150L240 90H300" ${sk(CL.m, 2)}/><path d="M150 128L240 90V128z" fill="#c8c0b0"/><rect x="240" y="90" width="60" height="38" fill="#efe4d2"/>` +
        `<g ${s.a(move([[10, 0, 0], [26, 70, 0], [44, 150, -38]]))}><g transform="translate(70 0)"><circle cx="0" cy="118" r="10" ${sk(INK, 2.5)}/><circle cx="18" cy="124" r="4" ${sk(INK, 2)}/><path d="M-6 100h20v18M-6 100v-20" ${sk(INK, 2.5)}/></g>${kid(70, 108, CL.t, {k: .8, aR: [10, -20]})}</g>` +
        `<g ${s.a(pop(20), ORG(196, 70))}><rect x="182" y="58" width="28" height="24" rx="3" fill="#2f5d8a"/><circle cx="196" cy="64" r="2.5" fill="#fff"/><path d="M196 67v6l4 4M193 70h6" ${sk('#fff', 1.5)}/></g>` +
        chip(s, 90, 30, 92, '有坡道也能上去', CL.t, 40);
    }},
    discovery: {dur: 6, hl: [10, 40], end: 60, lit: '发现的东西', mean: '发现；新发现', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#1d2440" fill-opacity=".85"/>` + [[30, 20], [80, 40], [130, 18], [250, 60], [270, 20]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.5" fill="#fff"/>`).join('') +
        `<path d="M60 128l30-50 8 4-30 50z" fill="#556070"/><path d="M84 80l60-30" ${sk('#556070', 10)}/><path d="M60 128h40" ${sk(CL.m, 3)}/>` + kid(50, 128, CL.t, {k: .8, aR: [24, -40]}) +
        `<path d="M146 48L220 30" ${sk(CL.g, 1.5)} stroke-dasharray="3 4" ${s.a(fadeP(14, 20))}/>` +
        `<g ${s.a(pop(22), ORG(230, 28))}>${star5(230, 28, 10, 4, '#f6d34a')}<circle cx="230" cy="28" r="16" fill="#f6d34a" fill-opacity=".25"/></g>` +
        chip(s, 230, 60, 72, '新星发现！', CL.a, 30) + chip(s, 150, 142, 92, '找到没见过的', CL.v, 40);
    }},
    dispute: {dur: 6, hl: [8, 20], end: 60, lit: '想法分开了', mean: '争论；争端', draw: s => {
      return GND() + `<g ${s.a({0: T(), 20: T(), 24: T(-6), 28: T(6), 32: T(-6), 36: T(6), 40: T(), 100: T()})}><rect x="140" y="92" width="20" height="16" rx="3" fill="#f2b632"/><path d="M144 92v-6h12v6" ${sk('#c9952a', 2)}/></g>` +
        kid(110, 128, CL.t, {aR: [28, -32]}) + kid(190, 128, CL.a, {aL: [-28, -32]}) +
        chip(s, 90, 40, 64, '是我的！', CL.t, 8) + chip(s, 210, 40, 64, '是我的！', CL.a, 14) +
        `<g ${s.a(showAt(20, 40))}>${burst(150, 70, 12).replace('<path ', `<path ${sk(CL.g, 2.5)} `)}</g>` + chip(s, 150, 142, 92, '各说各的理', CL.v, 40);
    }},
    expand: {dur: 6, hl: [10, 20], end: 60, lit: '向外撑开', mean: '扩大；膨胀', draw: s => {
      return GND() + `<path d="M150 126V100" ${sk(CL.m, 1.5)}/>` + kid(90, 128, CL.t, {aR: [46, -30]}) +
        `<g ${s.a({0: 'transform:scale(.3)', 10: 'transform:scale(.3)', 36: 'transform:scale(1.05)', 92: 'transform:scale(1.05)', 100: 'transform:scale(.3)'}, ORG(150, 100))}><ellipse cx="150" cy="64" rx="34" ry="40" fill="#e2473a"/><path d="M140 40q-6 8-4 18" ${sk('#fff', 3, .6)}/><path d="M146 104h8l-4 -4z" fill="#e2473a"/></g>` +
        [0, 1, 2, 3].map(i => { const a = i * 90 * Math.PI / 180; return `<path d="M${f1(150 + 50 * Math.cos(a))} ${f1(62 + 50 * Math.sin(a))}l${f1(10 * Math.cos(a))} ${f1(10 * Math.sin(a))}" ${sk(CL.a, 2.5)} ${s.a(showAt(30))}/>`; }).join('') +
        chip(s, 236, 30, 76, '越吹越大', CL.a, 36);
    }},
    // ---------- 第五十四批 ----------
    expense: {dur: 6, hl: [10, 30], end: 60, lit: '付出去的钱', mean: '费用；代价', draw: s => {
      const bills = [['房租', '1500', '#2f5d8a'], ['电费', '200', '#f2b632'], ['车费', '300', '#3fbf6a']];
      return `<rect x="150" y="16" width="130" height="118" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="215" y="32" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>本月费用</text>` +
        bills.map(([a, b, c], i) => `<g ${s.a(showAt(10 + i * 6))}><rect x="160" y="${42 + i * 22}" width="8" height="14" fill="${c}"/><text x="174" y="${53 + i * 22}" font-size="10" ${fl(CL.k)}>${a}</text><text x="270" y="${53 + i * 22}" font-size="10" font-weight="700" text-anchor="end" fill="#d23c2f">-${b}</text></g>`).join('') +
        `<path d="M160 110h110" ${sk(CL.k, 1.5)} ${s.a(showAt(30))}/><text x="270" y="126" font-size="11" font-weight="700" text-anchor="end" fill="#d23c2f" ${s.a(showAt(32))}>共 2000</text>` +
        GND(8, 140) + kid(70, 128, CL.t, {noFace: true, aR: [20, -36]}) + face(70, 128, 1, 'sad') + `<rect x="86" y="88" width="20" height="14" rx="3" fill="#8b5a3a"/>` +
        [0, 1, 2].map(i => `<g ${s.a((f => { f[18 + i * 6] = T(150, 50 + i * 22) + ';opacity:0'; f[92] = f[18 + i * 6]; return f; })(moveIn([[10 + i * 6, 96, 90], [17 + i * 6, 150, 50 + i * 22]])))}><circle cx="0" cy="0" r="5" ${fs(CL.g, '#a8741a', 1)}/></g>`).join('') +
        chip(s, 70, 30, 76, '钱都花出去了', '#d23c2f', 36);
    }},
    feedback: {dur: 6, hl: [10, 24], end: 60, lit: '回馈过来的', mean: '反馈；意见', draw: s => {
      return GND() + kid(70, 128, CL.t, {aR: [20, -34]}) + kid(230, 128, '#3d4a5c', {aL: [-20, -34]}) +
        `<g ${s.a(moveIn([[8, 92, 94], [18, 206, 94]]))}><rect x="-8" y="-10" width="16" height="20" rx="1" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/><path d="M-5 -5h10M-5 0h10M-5 5h6" ${sk(CL.m, 1)}/></g>` +
        `<path d="M96 70Q150 40 204 70" ${sk(CL.t, 2)} stroke-dasharray="4 4" ${s.a(fadeP(8, 14))}/><path d="M204 84Q150 114 96 84" ${sk(CL.a, 2)} stroke-dasharray="4 4" ${s.a(fadeP(22, 28))}/>` +
        `<g ${s.a(moveIn([[24, 206, 94], [34, 92, 94]]))}><rect x="-8" y="-10" width="16" height="20" rx="1" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/><path d="M-5 -4l3 3 6-6" ${sk('#3fbf6a', 2)}/><path d="M-5 4h10" ${sk('#d23c2f', 1.5)}/></g>` +
        chip(s, 70, 40, 52, '我的作业', CL.t, 8) + chip(s, 230, 40, 76, '这里写得好', '#3d4a5c', 26) + chip(s, 150, 139, 92, '回过来的意见', CL.v, 40);
    }},
    friendly: {dur: 6, hl: [10, 30], end: 60, lit: '像朋友一样的', mean: '友好的', draw: s => {
      return GND() + kid(90, 128, CL.t, {aR: [24, -30], mood: 'happy'}) + `<g ${s.a(move([[6, 80, 0], [18, 0, 0]]))}><ellipse cx="170" cy="112" rx="18" ry="10" fill="#c98a4a"/><circle cx="150" cy="102" r="9" fill="#c98a4a"/><path d="M144 96l-4 10 6-2zM154 94l4 10-6-2z" fill="#8b5a3a"/><circle cx="147" cy="101" r="1.5" fill="${INK}"/><path d="M144 108q4 3 8 0" ${sk(INK, 1.2)}/><path d="M160 120v8M178 120v8" ${sk('#c98a4a', 4)}/><g ${s.a({0: R(-25), 50: R(25), 100: R(-25)}, ORG(186, 108), .3)}><path d="M186 108q10-4 12-14" ${sk('#c98a4a', 4)}/></g></g>` +
        [0, 1].map(i => `<g ${s.a({0: 'opacity:0;' + T(), [24 + i * 8]: 'opacity:0;' + T(), [26 + i * 8]: 'opacity:1;' + T(), [40 + i * 8]: 'opacity:0;' + T(0, -30), 100: 'opacity:0'})}>${heartAt(126, 66, 1)}</g>`).join('') +
        chip(s, 200, 40, 92, '摇尾巴来打招呼', CL.t, 30);
    }},
    immediate: {dur: 6, hl: [8, 20], end: 60, lit: '没有中间环节的', mean: '立即的；直接的', draw: s => {
      return GND() + `<rect x="60" y="70" width="30" height="40" rx="4" fill="#d8dde3" style="stroke:var(--ink3);stroke-width:1.5px"/><circle cx="75" cy="90" r="8" fill="#e2473a" ${s.a({0: 'transform:scale(1)', 20: 'transform:scale(1)', 22: 'transform:scale(.8)', 24: 'transform:scale(1)', 100: 'transform:scale(1)'}, ORG(75, 90))}/>` +
        `<path d="M90 90H200V50" ${sk(CL.m, 2)}/><path d="M188 40a12 12 0 1 1 24 0c0 6-4 8-4 13h-16c0-5-4-7-4-13z" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M188 40a12 12 0 1 1 24 0c0 6-4 8-4 13h-16c0-5-4-7-4-13z" fill="#f6d34a" ${s.a(showAt(22))}/>` +
        `<g ${s.a(showAt(22))}><path d="M200 18v-6M180 28l-4-3M220 28l4-3" ${sk('#f2b632', 2.5)}/></g>` + kid(40, 128, CL.t, {k: .8, aR: [28, -40]}) +
        chip(s, 240, 90, 64, '0 秒！', '#d23c2f', 24) + chip(s, 150, 139, 92, '一按马上就亮', CL.a, 34);
    }},
    infrastructure: {dur: 6, hl: [8, 20], end: 60, lit: '撑在底下的结构', mean: '基础设施', draw: s => {
      return `<rect x="0" y="0" width="300" height="80" fill="#dff2ff"/><rect x="0" y="80" width="300" height="70" fill="#c8a06a"/>` +
        `<g ${s.a(fadeP(8, 16))}><path d="M0 98H300" ${sk('#4a90d0', 8)}/><path d="M0 116H300" ${sk('#9a948c', 6)}/><path d="M0 132H300" ${sk('#f2b632', 3)} stroke-dasharray="6 4"/></g>` +
        `<text x="30" y="101" font-size="8" font-weight="700" fill="#fff" ${s.a(showAt(14))}>水管</text><text x="30" y="119" font-size="8" font-weight="700" fill="#fff" ${s.a(showAt(14))}>燃气</text><text x="30" y="136" font-size="8" font-weight="700" ${fl(CL.k)} ${s.a(showAt(14))}>电缆</text>` +
        `<g ${s.a(growY(20, 34), FOOT)}><rect x="60" y="30" width="50" height="50" fill="#8fa3b8"/><rect x="130" y="20" width="44" height="60" fill="#a6b4c4"/><rect x="200" y="36" width="60" height="44" fill="#7f93a8"/></g>` +
        `<path d="M0 80H300" ${sk('#6b6b6b', 4)}/>` + chip(s, 150, 14, 104, '地下管线撑起城市', CL.v, 40);
    }},
    medication: {dur: 6, hl: [10, 40], end: 60, lit: '用药治疗', mean: '药物；药物治疗', draw: s => {
      return GND() + `<rect x="60" y="60" width="44" height="60" rx="6" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><rect x="60" y="54" width="44" height="12" rx="3" fill="#e2473a"/><text x="82" y="94" font-size="9" font-weight="700" text-anchor="middle" fill="#e2473a">药</text>` +
        ['早', '中', '晚'].map((t, i) => `<rect x="${124 + i * 44}" y="50" width="40" height="40" rx="6" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><text x="${144 + i * 44}" y="64" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>${t}</text><g ${s.a(pop(10 + i * 10), ORG(144 + i * 44, 78))}><rect x="${136 + i * 44}" y="73" width="16" height="9" rx="4.5" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/><rect x="${144 + i * 44}" y="73" width="8" height="9" fill="#e2473a"/></g>`).join('') +
        kid(272, 128, CL.t, {k: .7, aL: [-10, -30]}) + chip(s, 168, 112, 76, '按时吃药', CL.a, 40);
    }},
    mutual: {dur: 6, hl: [10, 30], end: 60, lit: '互相交换', mean: '相互的；共同的', draw: s => {
      return GND() + kid(70, 128, CL.t, {aR: [22, -34]}) + kid(230, 128, CL.a, {aL: [-22, -34]}) +
        `<g ${s.a(moveIn([[10, 96, 90], [26, 204, 90]]))}><rect x="-10" y="-8" width="20" height="16" fill="#e2473a"/><path d="M0 -8v16M-10 0h20" ${sk('#f6d34a', 2)}/></g>` +
        `<g ${s.a(moveIn([[10, 204, 80], [26, 96, 80]]))}><rect x="-10" y="-8" width="20" height="16" fill="#4a90d0"/><path d="M0 -8v16M-10 0h20" ${sk('#fff', 2)}/></g>` +
        `<path d="M110 56H190M184 50l6 6-6 6M190 64H110M116 58l-6 6 6 6" ${sk(CL.v, 2)} ${s.a(showAt(28))}/>` + chip(s, 150, 30, 76, '互相送礼', CL.a, 30);
    }},
    numerous: {dur: 6, hl: [10, 40], end: 60, lit: '数不清的', mean: '众多的', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#1d2440" fill-opacity=".85"/>` +
        [...Array(40)].map((_, i) => { const x = f1((i * 137.5 + (i * i * 7) % 23) % 284 + 8), y = f1((i * 61.8 + (i * i * 11) % 17) % 96 + 8); return `<circle cx="${x}" cy="${y}" r="${1.5 + (i % 3) * .6}" fill="#fff" ${s.a(showAt(f1(6 + (i % 20) * 1.6)))}/>`; }).join('') +
        `<path d="M0 128H300" ${sk('#556070', 40)}/>` + kid(150, 128, CL.t, {aR: [12, -60]}) +
        ['1, 2, 3…', '100…', '数不清！'].map((t, i) => `<text x="150" y="58" font-size="10" font-weight="700" text-anchor="middle" fill="#f6d34a" ${s.a(slot([0, 20, 36, 99], i))}>${t}</text>`).join('') +
        chip(s, 150, 139, 84, '多得数不过来', CL.a, 40);
    }},
    particle: {dur: 6, hl: [10, 40], end: 60, lit: '极小的一部分', mean: '颗粒；微粒', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#3a2e28" fill-opacity=".55"/><rect x="20" y="14" width="50" height="50" fill="#f6e7a8"/>` +
        `<path d="M20 64L70 14L280 140H130z" fill="#f6e7a8" fill-opacity=".35" ${s.a(showAt(6))}/>` +
        [...Array(18)].map((_, i) => { const h1 = v => v - Math.floor(v), tt = h1(Math.sin(i * 12.9898) * 43758.5) * .8 + .12, uu = h1(Math.sin(i * 78.233) * 12345.6) * .7 + .15, x = f1((20 + 110 * tt) + ((70 + 210 * tt) - (20 + 110 * tt)) * uu), y = f1((64 + 76 * tt) + ((14 + 126 * tt) - (64 + 76 * tt)) * uu); return `<circle cx="${x}" cy="${y}" r="1.6" fill="#fff" ${s.a({0: T(0, 0), 50: T(f1((i % 3 - 1) * 6), -6), 100: T(0, 0)}, `animation-delay:${(i * .13).toFixed(2)}s`, 2)}/>`; }).join('') +
        `<g ${s.a(moveIn([[24, 260, 120], [34, 180, 90]]))}><circle cx="0" cy="0" r="16" ${fs('#bfe1f2', '#fff', 2.5, .25)}/><path d="M12 12l10 10" ${sk('#fff', 3)}/><circle cx="-4" cy="-2" r="3" fill="#fff"/></g>` +
        chip(s, 236, 28, 76, '光里的小灰尘', CL.a, 40);
    }},
    persist: {dur: 6, hl: [10, 40], end: 60, lit: '一直站着不走', mean: '坚持；持续', draw: s => {
      return `<path d="M120 20h60v10h-60z" fill="#9a948c"/>` + [0, 1, 2, 3].map(i => `<path d="M150 36q-4 6-4 8a4 4 0 0 0 8 0q0-2-4-8z" fill="#6db7e8" ${s.a({0: 'opacity:1;' + T(0, 0), 100: 'opacity:1;' + T(0, 70)}, `animation-delay:${i * .25}s;animation-timing-function:linear`, 1)}/>`).join('') +
        `<path d="M100 128v-24h100v24z" fill="#9a948c"/>` + `<path d="M140 104q10 18 20 0z" fill="#3a3a3a" ${s.a({0: 'transform:scaleY(0)', 10: 'transform:scaleY(0)', 40: 'transform:scaleY(1)', 92: 'transform:scaleY(1)', 100: 'transform:scaleY(0)'}, 'transform-origin:50% 0%;transform-box:fill-box')}/>` +
        GND() + ['第 1 天', '第 100 天', '第 1000 天'].map((t, i) => `<text x="240" y="70" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(slot([0, 20, 34, 99], i))}>${t}</text>`).join('') +
        chip(s, 70, 40, 84, '滴水穿石', CL.t, 40);
    }},
    predict: {dur: 6, hl: [8, 20], end: 60, lit: '提前说出来', mean: '预测；预言', draw: s => {
      return GND() + `<rect x="130" y="20" width="150" height="90" rx="4" fill="#2f5d8a"/><path d="M150 40q20-10 40 0t40 10 30-6" ${sk('#fff', 2, .5)}/>` +
        `<g ${s.a(pop(16), ORG(200, 60))}><path d="M186 60a8 8 0 0 1 12-8 11 11 0 0 1 20 3 7 7 0 0 1-1 14h-28a6 6 0 0 1-3-9z" fill="#d8dde3"/><path d="M196 72l-2 6M204 72l-2 6M212 72l-2 6" ${sk('#6db7e8', 2)}/></g>` +
        `<text x="205" y="98" font-size="11" font-weight="700" text-anchor="middle" fill="#fff" ${s.a(showAt(22))}>明天：雨</text>` +
        kid(80, 128, '#3d4a5c', {aR: [40, -60]}) + chip(s, 80, 30, 84, '还没发生先说', CL.t, 8) + chip(s, 205, 134, 92, '天气预报', CL.v, 34);
    }},
    preserve: {dur: 6, hl: [8, 20], end: 60, lit: '提前保住', mean: '保存；保护', draw: s => {
      return GND() + `<path d="M120 128V66q0-8 8-8h44q8 0 8 8v62z" fill="#dff2ff" fill-opacity=".7" style="stroke:var(--ink3);stroke-width:2px"/>` +
        [[136, 110], [160, 112], [148, 90]].map(([x, y], i) => `<g ${s.a(moveIn([[8 + i * 3, -60 + i * 20, -80], [14 + i * 3, 0, 0]]))}><circle cx="${x}" cy="${y}" r="10" fill="#e2473a"/><path d="M${x} ${y - 10}q2-4 5-4" ${sk('#3f8f4f', 2)}/></g>`).join('') +
        `<g ${s.a(moveIn([[20, 0, -40], [24, 0, 0]]))}><rect x="116" y="50" width="68" height="12" rx="3" fill="#d23c2f"/></g>` +
        ['1 月', '6 月', '12 月'].map((t, i) => `<text x="240" y="60" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(slot([0, 40, 56, 99], i))}>${t}</text>`).join('') +
        `<g ${s.a(pop(60), ORG(240, 90))}><circle cx="240" cy="90" r="10" fill="#3fbf6a"/><path d="M235 90l3.5 3.5 6.5-7" ${sk('#fff', 2.5)}/></g>` +
        `<circle cx="62" cy="118" r="10" ${s.a({0: 'fill:#e2473a', 40: 'fill:#e2473a', 70: 'fill:#7a5a3a', 100: 'fill:#7a5a3a'})}/><path d="M62 108q2-4 5-4" ${sk('#3f8f4f', 2)}/>` +
        `<text x="62" y="100" font-size="9" font-weight="700" text-anchor="middle" fill="#7a5a3a" ${s.a(showAt(70))}>放外面坏了</text>` + chip(s, 150, 30, 84, '封起来存着', CL.t, 30);
    }},
    // ---------- 第五十五批 ----------
    propose: {dur: 6, hl: [8, 20], end: 60, lit: '把想法放到前面', mean: '提议；求婚', draw: s => {
      return GND() + `<rect x="120" y="96" width="110" height="6" rx="2" fill="${WOOD}"/><path d="M128 102v26M222 102v26" ${sk(WOOD, 4)}/>` +
        kid(210, 128, CL.a, {k: .85}) + kid(256, 128, '#3d4a5c', {k: .85}) +
        `<g ${s.a(move([[6, 0, 0], [16, 26, 0]]))}>${kid(60, 128, CL.t, {aR: [24, -36]})}</g>` +
        `<g ${s.a(moveIn([[16, 112, 88], [28, 168, 86]]))}><rect x="-16" y="-12" width="32" height="22" rx="2" fill="#fff" style="stroke:var(--ink3);stroke-width:1.2px"/><circle cx="0" cy="-3" r="5" fill="#f6d34a"/><rect x="-2.5" y="2" width="5" height="4" fill="#9a948c"/></g>` +
        chip(s, 86, 34, 64, '我提议…', CL.t, 10) + chip(s, 232, 40, 64, '好主意！', CL.a, 36);
    }},
    radical: {dur: 6, hl: [10, 40], end: 60, lit: '从根上动', mean: '根本的；激进的', draw: s => {
      return `<g ${s.a(move([[10, 0, 0], [30, 0, -60]]))}><path d="M120 96q-4-18-12-30M120 96q0-22 4-34M120 96q8-16 16-28" ${sk('#3f8f4f', 4)}/><path d="M108 96Q100 112 120 140Q140 112 132 96z" fill="#e2473a"/><path d="M120 140v8M114 126l-6 4M126 122l6 4" ${sk('#c9b8a0', 1.5)}/>` +
        `<path d="M122 66L200 -20" ${sk(SKIN, 6)}/><circle cx="122" cy="66" r="7" fill="${SKIN}"/></g>` +
        `<rect x="0" y="92" width="300" height="58" fill="#8b6a48"/><path d="M0 92H300" ${sk('#6b4f34', 2)}/>` +
        `<text x="150" y="86" font-size="11" font-weight="700" ${fl(CL.a)} ${s.a(showAt(34))}>← 根</text>` +
        chip(s, 230, 40, 76, '连根拔起', CL.a, 36) + chip(s, 230, 116, 92, '从根本上改变', CL.v, 46);
    }},
    recycle: {dur: 6, hl: [24, 8], end: 60, lit: '再转一圈', mean: '回收利用', draw: s => {
      const bottle = c => `<path d="M-4 -14h8v4l3 4v18h-14v-18l3-4z" fill="${c}" style="stroke:var(--ink3);stroke-width:1px"/>`;
      const arrow = k => `<g transform="rotate(${k * 120} 150 106)"><path d="M152 94A12 12 0 0 1 161.3 110.1" ${sk('#fff', 2.5)}/><path d="M157.5 109l5 4 1.5-6z" fill="#fff"/></g>`;
      return GND() + kid(50, 128, CL.t, {aR: [22, -40]}) +
        `<g ${s.a((f => { f[22] = T(150, 72) + ';opacity:0'; f[92] = f[22]; return f; })(moveIn([[8, 72, 88], [20, 150, 72]])))}>${bottle('#9a948c')}</g>` +
        `<rect x="128" y="84" width="44" height="44" rx="3" fill="#3fbf6a"/><rect x="124" y="78" width="52" height="7" rx="2" fill="#2f9f55"/>` +
        `<g ${s.a({0: R(0), 22: R(0), 50: R(360), 100: R(360)}, ORG(150, 106))}>${[0, 1, 2].map(arrow).join('')}</g>` +
        `<g ${s.a(moveIn([[50, 176, 112], [62, 240, 114]]))}>${bottle('#6db7e8')}</g>` +
        chip(s, 150, 40, 76, '回收再加工', CL.v, 26) + chip(s, 246, 80, 64, '新瓶子', '#2f9f55', 60);
    }},
    relatively: {dur: 6, hl: [10, 50], end: 60, lit: '相比之下', mean: '相对地；比较', draw: s => {
      return GND() + kid(150, 128, CL.t) +
        `<g ${s.a(showAt(8, 46))}>${kid(90, 128, CL.a, {k: .65})}</g><g ${s.a(showAt(50))}>${kid(220, 128, '#3d4a5c', {k: 1.35})}</g>` +
        `<text x="150" y="40" font-size="13" font-weight="700" text-anchor="middle" ${fl(CL.t)} ${s.a(slot([0, 14, 50, 99], 1))}>和小弟比：算高</text>` +
        `<text x="150" y="40" font-size="13" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(slot([0, 14, 50, 99], 2))}>和大人比：算矮</text>` +
        chip(s, 150, 139, 92, '高矮是比出来的', CL.v, 60);
    }},
    remains: {dur: 6, hl: [10, 30], end: 60, lit: '留下来的东西', mean: '遗迹；剩余物', draw: s => {
      const cols = [[90, 50], [130, 26], [170, 42], [210, 14]];
      return `<rect x="0" y="118" width="300" height="32" fill="#e8d6ae"/>` + GND() +
        `<g ${s.a({0: 'opacity:1', 10: 'opacity:1', 30: 'opacity:0', 94: 'opacity:0', 100: 'opacity:1'})}><path d="M74 58L150 28L226 58z" fill="#d8cdb8" style="stroke:var(--ink3);stroke-width:1.5px"/><rect x="74" y="58" width="152" height="8" fill="#cfc3ab"/>` +
        cols.map(([x, h]) => `<rect x="${x - 8}" y="66" width="16" height="${62 - h}" fill="#e6dccb" style="stroke:var(--ink3);stroke-width:1px"/>`).join('') + `</g>` +
        cols.map(([x, h]) => `<rect x="${x - 8}" y="${128 - h}" width="16" height="${h}" fill="#e6dccb" style="stroke:var(--ink3);stroke-width:1px"/><path d="M${x - 8} ${128 - h}l4-4 4 3 4-5 4 6z" fill="#e6dccb"/>`).join('') +
        `<g ${s.a(showAt(28))}><rect x="236" y="116" width="34" height="12" rx="2" fill="#e6dccb" style="stroke:var(--ink3);stroke-width:1px"/></g>` +
        kid(40, 128, CL.t, {k: .7}) + ['公元 100 年', '2000 年后'].map((t, i) => `<text x="150" y="18" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(slot([0, 24, 99], i))}>${t}</text>`).join('') +
        chip(s, 236, 84, 76, '只剩下这些', CL.a, 36);
    }},
    requirement: {dur: 6, hl: [10, 30], end: 60, lit: '要求的条件', mean: '要求；必要条件', draw: s => {
      const items = ['大学本科', '六级 425 分以上', '会用电脑'];
      return GND(8, 130) + kid(60, 128, CL.t, {aR: [26, -40]}) + `<rect x="80" y="76" width="20" height="14" rx="1" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/>` +
        `<rect x="140" y="16" width="146" height="112" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="213" y="34" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.k)}>招聘要求</text>` +
        items.map((t, i) => `<text x="152" y="${58 + i * 22}" font-size="10" ${fl(CL.k)}>${i + 1}. ${t}</text><g ${s.a(pop(14 + i * 10), ORG(270, 54 + i * 22))}><circle cx="270" cy="${54 + i * 22}" r="7" fill="#3fbf6a"/><path d="M266.5 ${54 + i * 22}l2.5 2.5 4.5-5" ${sk('#fff', 2)}/></g>`).join('') +
        chip(s, 70, 40, 76, '条件都满足', '#2f9f55', 46);
    }},
    simulation: {dur: 6, hl: [10, 40], end: 60, lit: '照着真的做个像的', mean: '模拟；仿真', draw: s => {
      const tilt = {0: R(0), 25: R(-14), 50: R(10), 75: R(-6), 100: R(0)};
      return GND() + `<rect x="110" y="24" width="140" height="80" rx="4" fill="#2a2f3a"/>` +
        `<svg x="114" y="28" width="132" height="72" viewBox="0 0 132 72"><rect width="132" height="72" fill="#9fd3f2"/><g ${s.a(tilt, ORG(66, 36))}><rect x="-80" y="36" width="292" height="90" fill="#6fae5a"/><path d="M-80 36H212" ${sk('#fff', 1)}/></g><path d="M48 36h12M72 36h12M66 30v12" ${sk('#f6d34a', 2.5)}/><text x="6" y="12" font-size="8" font-weight="700" fill="#fff">飞行模拟</text></svg>` +
        `<rect x="176" y="104" width="8" height="16" fill="#555"/><rect x="160" y="120" width="40" height="4" rx="2" fill="#555"/>` +
        kid(64, 128, CL.t, {aR: [26, -28]}) + `<g ${s.a({0: R(0), 25: R(-14), 50: R(10), 75: R(-6), 100: R(0)}, ORG(92, 112))}><path d="M92 112V96" ${sk('#333', 3)}/><circle cx="92" cy="95" r="3.5" fill="#d23c2f"/></g><rect x="84" y="110" width="16" height="6" rx="2" fill="#333"/>` +
        chip(s, 150, 139, 100, '不是真飞，是模拟', CL.v, 30);
    }},
    solitude: {dur: 6, hl: [10, 40], end: 60, lit: '独自一人的状态', mean: '独处', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#fff6dc" fill-opacity=".6"/>` + GND() +
        `<circle cx="262" cy="28" r="14" fill="#f6d34a"/><path d="M60 128V70" ${sk('#8b5a3a', 7)}/><circle cx="60" cy="56" r="30" fill="#6fae5a"/><circle cx="40" cy="70" r="16" fill="#5d9a4a"/>` +
        kid(150, 128, CL.t, {aL: [-14, -30], aR: [14, -30]}) +
        `<path d="M134 94q8-4 16 0q8-4 16 0v16q-8-4-16 0q-8-4-16 0z" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/><path d="M150 94v16" ${sk(CL.m, 1)}/>` +
        `<path d="M150 94q8-4 16 0v16q-8-4-16 0z" fill="#f4f1ea" style="stroke:var(--ink3);stroke-width:1px" ${s.a({0: 'transform:scaleX(1)', 40: 'transform:scaleX(1)', 50: 'transform:scaleX(-1)', 100: 'transform:scaleX(-1)'}, ORG(150, 102))}/>` +
        `<rect x="196" y="116" width="12" height="12" rx="2" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/>` + [0, 1].map(i => `<path d="M${200 + i * 5} 112q-3-4 0-8t0-8" ${sk(CL.m, 1.2)} ${s.a({0: 'opacity:0;' + T(0, 4), 50: 'opacity:.8;' + T(0, 0), 100: 'opacity:0;' + T(0, -6)}, `animation-delay:${i * .6}s`, 2)}/>`).join('') +
        chip(s, 216, 64, 92, '一个人，很自在', CL.t, 24);
    }},
    sufficient: {dur: 6, hl: [10, 40], end: 60, lit: '做到下限之上', mean: '足够的；充分的', draw: s => {
      return GND() + `<g ${s.a({0: R(0), 6: R(0), 10: R(-40), 38: R(-40), 44: R(0), 100: R(0)}, ORG(196, 52))}><path d="M182 30h28v34h-28z" fill="#d8dde3" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M182 34l-10 4 10 4" fill="#d8dde3" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M210 36q10 0 10 12t-10 12" ${sk(CL.m, 3)}/></g>` +
        `<path d="M166 58V126" ${sk('#6db7e8', 4)} ${s.a(showAt(10, 38))}/>` +
        `<rect x="132" y="70" width="40" height="56" fill="#6db7e8" ${s.a(growY(12, 40), FOOT)}/><path d="M130 50V128H174V50" fill="none" style="stroke:var(--ink3);stroke-width:2.5px"/>` +
        `<path d="M124 70H182" ${sk('#d23c2f', 1.5)} stroke-dasharray="4 3"/><text x="120" y="73" font-size="10" font-weight="700" text-anchor="end" fill="#d23c2f">够了</text>` +
        kid(60, 128, CL.t) + chip(s, 80, 40, 64, '刚好够', '#2f9f55', 44);
    }},
    suppose: {dur: 6, hl: [8, 20], end: 60, lit: '先在下面放个前提', mean: '假设；认为', draw: s => {
      const bricks = [['假设：明天下雨', CL.t], ['那么：路会滑', '#5d8fb8'], ['所以：要慢点走', '#8fa8c0']];
      return GND() + bricks.map(([t, c], i) => `<g ${s.a(moveIn([[8 + i * 14, 0, -120], [14 + i * 14, 0, 0]]))}><rect x="120" y="${108 - i * 20}" width="130" height="20" rx="2" fill="${c}" style="stroke:var(--ink3);stroke-width:1px"/><text x="185" y="${122 - i * 20}" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">${t}</text></g>`).join('') +
        `<text x="112" y="122" font-size="9" font-weight="700" text-anchor="end" ${fl(CL.t)} ${s.a(showAt(16))}>前提 →</text>` +
        kid(50, 128, '#3d4a5c', {aR: [30, -44]}) + chip(s, 185, 36, 100, '先假设，再往上推', CL.v, 44);
    }},
    survival: {dur: 6, hl: [10, 40], end: 60, lit: '活下来', mean: '生存；存活', draw: s => {
      const wilt = {0: R(0), 10: R(0), 40: R(115), 92: R(115), 100: R(0)};
      return `<rect x="0" y="0" width="300" height="150" fill="#fbe3b8" fill-opacity=".6"/><rect x="0" y="120" width="300" height="30" fill="#e8c78a"/>` +
        `<g ${s.a({0: 'transform:scale(1)', 50: 'transform:scale(1.12)', 100: 'transform:scale(1)'}, ORG(262, 28), 1.5)}><circle cx="262" cy="28" r="16" fill="#f2b632"/></g>` +
        `<path d="M100 124V104" ${sk('#3f8f4f', 3)}/><g ${s.a(wilt, ORG(100, 104))}><path d="M100 104V84" ${sk('#3f8f4f', 3)}/><g ${s.a({0: 'fill:#e2473a', 10: 'fill:#e2473a', 40: 'fill:#8b6a48', 92: 'fill:#8b6a48', 100: 'fill:#e2473a'})}><circle cx="94" cy="80" r="5"/><circle cx="106" cy="80" r="5"/><circle cx="100" cy="74" r="5"/><circle cx="100" cy="86" r="5"/></g><circle cx="100" cy="80" r="3.5" fill="#f6d34a"/></g>` +
        `<rect x="192" y="66" width="16" height="60" rx="8" fill="#3f8f4f"/><path d="M192 104h-8v-16M208 96h8v-14" ${sk('#3f8f4f', 8)} stroke-linecap="round"/>` +
        `<g ${s.a(pop(44), ORG(200, 64))}><circle cx="200" cy="64" r="5" fill="#f48fb1"/></g>` +
        `<text x="100" y="142" font-size="10" font-weight="700" text-anchor="middle" fill="#8b6a48" ${s.a(showAt(40))}>枯了</text><text x="200" y="142" font-size="10" font-weight="700" text-anchor="middle" fill="#2f9f55" ${s.a(showAt(44))}>活下来</text>` +
        chip(s, 150, 30, 76, '适者生存', CL.a, 50);
    }},
    sustain: {dur: 6, hl: [8, 20], end: 60, lit: '从下面托住', mean: '维持；支撑', draw: s => {
      return `<rect x="0" y="128" width="300" height="22" fill="#6db7e8" fill-opacity=".7"/><rect x="0" y="92" width="44" height="58" fill="#b59a72"/><rect x="256" y="92" width="44" height="58" fill="#b59a72"/>` +
        `<rect x="140" y="96" width="20" height="40" fill="#9a948c" style="stroke:var(--ink3);stroke-width:1px" ${s.a(growY(8, 20), FOOT)}/>` +
        `<rect x="30" y="88" width="240" height="8" rx="2" fill="#8b5a3a"/>` +
        `<g ${s.a(move([[26, -60, 0], [76, 320, 0]]))}><rect x="0" y="62" width="30" height="22" rx="2" fill="#e2473a"/><rect x="30" y="68" width="14" height="16" rx="2" fill="#f2b632"/><circle cx="8" cy="85" r="4" fill="#333"/><circle cx="36" cy="85" r="4" fill="#333"/></g>` +
        chip(s, 150, 30, 76, '柱子托住桥', CL.t, 18) + chip(s, 230, 140, 76, '一直撑得住', CL.v, 60);
    }},
    // ---------- 第五十六批 ----------
    underlying: {dur: 6, hl: [16, 30], end: 60, lit: '躺在下面的', mean: '潜在的；根本的', draw: s => {
      return `<rect x="0" y="60" width="300" height="90" fill="#4a90d0" fill-opacity=".45"/>` +
        `<path d="M118 60L88 108L128 140L204 132L218 94L184 60z" fill="#dff2ff" style="stroke:#9fc6e0;stroke-width:1.5px" ${s.a({0: 'opacity:.12', 16: 'opacity:.12', 32: 'opacity:1', 92: 'opacity:1', 100: 'opacity:.12'})}/>` +
        `<path d="M132 60L150 32L170 60z" fill="#fff" style="stroke:#9fc6e0;stroke-width:1.5px"/><path d="M0 60H300" ${sk('#4a90d0', 2)}/>` +
        `<text x="182" y="44" font-size="10" font-weight="700" ${fl(CL.k)} ${s.a(showAt(6))}>看得见的一点点</text>` +
        `<text x="152" y="104" font-size="11" font-weight="700" text-anchor="middle" fill="#2f5d8a" ${s.a(showAt(34))}>根本原因</text>` +
        chip(s, 248, 112, 92, '大头藏在下面', CL.v, 42);
    }},
    writer: {dur: 6, hl: [8, 40], end: 60, lit: '写字的人', mean: '作家', draw: s => {
      const pen = {0: T(0, 0), 8: T(0, 0)}; [0, 1, 2, 3].forEach(i => { pen[10 + i * 12] = T(0, i * 14); pen[19 + i * 12] = T(52, i * 14); }); pen[60] = T(52, 42); pen[100] = T(0, 0);
      return GND() + `<rect x="190" y="26" width="76" height="72" rx="2" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/>` +
        [0, 1, 2, 3].map(i => `<path d="M200 ${42 + i * 14}h52" ${sk(CL.k, 1.5)} ${DASH} ${s.a(drawP(10 + i * 12, 19 + i * 12))}/>`).join('') +
        kid(150, 128, CL.t, {aR: [34, -42]}) + `<g ${s.a(pen)}><path d="M198 40l6-14 4 2-6 14z" fill="#2f5d8a"/></g>` +
        `<rect x="96" y="98" width="190" height="6" rx="2" fill="${WOOD}"/><path d="M106 104v24M276 104v24" ${sk(WOOD, 4)}/>` +
        `<g ${s.a(pop(62), ORG(60, 70))}><rect x="44" y="52" width="32" height="40" rx="2" fill="#d23c2f"/><path d="M50 62h20M50 68h14" ${sk('#fff', 2)}/></g>` +
        chip(s, 60, 30, 64, '写书的人', CL.v, 64);
    }},
    activate: {dur: 6, hl: [24, 8], end: 60, lit: '让它活起来', mean: '激活；启动', draw: s => {
      const on = (c0, c1) => ({0: 'fill:' + c0, 22: 'fill:' + c0, 26: 'fill:' + c1, 92: 'fill:' + c1, 100: 'fill:' + c0});
      const arm = d => ({0: R(0), 26: R(0), 36: R(d), 92: R(d), 100: R(0)});
      return GND() + `<g ${s.a(arm(130), ORG(166, 74))}><rect x="160" y="72" width="8" height="32" rx="3" fill="#8a96a6"/></g><g ${s.a(arm(-130), ORG(214, 74))}><rect x="212" y="72" width="8" height="32" rx="3" fill="#8a96a6"/></g>` +
        `<rect x="170" y="70" width="40" height="44" rx="4" fill="#9aa8b8"/><rect x="178" y="114" width="8" height="14" fill="#8a96a6"/><rect x="194" y="114" width="8" height="14" fill="#8a96a6"/>` +
        `<rect x="176" y="44" width="28" height="24" rx="4" fill="#9aa8b8"/><path d="M190 44v-8" ${sk('#8a96a6', 2)}/><circle cx="190" cy="34" r="3" ${s.a(on('#666', '#e2473a'))}/>` +
        `<circle cx="184" cy="56" r="3.5" ${s.a(on('#555', '#6fe3ff'))}/><circle cx="196" cy="56" r="3.5" ${s.a(on('#555', '#6fe3ff'))}/>` +
        `<circle cx="190" cy="88" r="5" fill="#e2473a" ${s.a({0: 'transform:scale(1)', 20: 'transform:scale(1)', 22: 'transform:scale(.7)', 25: 'transform:scale(1)', 100: 'transform:scale(1)'}, ORG(190, 88))}/>` +
        `<g ${s.a({0: T(0, 0), 8: T(0, 0), 20: T(18, 0), 30: T(0, 0), 100: T(0, 0)})}>${kid(128, 128, CL.t, {k: .9, aR: [44, -40]})}</g>` +
        `<g ${s.a(showAt(30))}>${sparkle(166, 40, 6)}${sparkle(216, 36, 5)}</g>` +
        ['OFF', 'ON'].map((t, i) => `<text x="250" y="60" font-size="12" font-weight="700" text-anchor="middle" fill="${i ? '#2f9f55' : '#888'}" ${s.a(slot([0, 26, 99], i))}>${t}</text>`).join('') +
        chip(s, 70, 30, 76, '一按就动起来', CL.t, 38);
    }},
    agency: {dur: 6, hl: [20, 40], end: 60, lit: '替人办事的地方', mean: '机构；代理处', draw: s => {
      const plane = (x, y) => `<path d="M${x - 7} ${y}h14M${x + 2} ${y}l-4-5M${x + 2} ${y}l-4 5M${x - 6} ${y}l-2-3M${x - 6} ${y}l-2 3" ${sk('#2f5d8a', 1.5)}/>`;
      return GND() + `<rect x="120" y="20" width="170" height="108" fill="#f4efe6" style="stroke:var(--ink3);stroke-width:1.5px"/><rect x="140" y="26" width="130" height="20" rx="3" fill="#2f5d8a"/><text x="205" y="40" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">旅行社</text>` +
        kid(240, 128, '#3d4a5c', {k: .9, aL: [-26, -38]}) + `<rect x="190" y="96" width="96" height="32" fill="${WOOD}"/>` +
        kid(150, 128, CL.t, {aR: [22, -40]}) +
        `<g ${s.a(moveIn([[16, 212, 88], [30, 174, 88]]))}><rect x="-12" y="-7" width="24" height="14" rx="2" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/>${plane(0, 0)}</g>` +
        chip(s, 60, 40, 92, '帮你订好机票', CL.t, 34) + chip(s, 60, 70, 76, '不用自己跑', CL.v, 46);
    }},
    ancestor: {dur: 6, hl: [8, 20, 40], end: 60, lit: '走在前面的人', mean: '祖先', draw: s => {
      const ppl = [[70, CL.t, .7, '我', 1], [130, '#5d8fb8', .9, '爷爷', .85], [185, '#8a96a6', .9, '太爷爷', .6], [240, '#b8b0a4', .9, '祖先', .4]];
      return GND() + `<g ${s.a(move([[6, 0, 0], [60, 24, 0]]))}>` + ppl.map(([x, c, k, t, o], i) => `<g opacity="${o}">${kid(x, 128, c, Object.assign({k}, walkLegs(s, x, 128, 6, 60, 6, k)))}</g><text x="${x}" y="${128 - 78 * k}" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)} ${s.a(showAt(8 + (3 - i) * 6))}>${t}</text>`).join('') + `</g>` +
        `<path d="M40 28H270M262 22l8 6-8 6" ${sk(CL.v, 2)} ${DASH} ${s.a(drawP(30, 42))}/>` + chip(s, 150, 139, 92, '在我们前面走过', CL.v, 44);
    }},
    annual: {dur: 6, hl: [10, 40], end: 60, lit: '每年的', mean: '每年的；年度的', draw: s => {
      const grow = p => ({0: 'transform:scale(0)', [p]: 'transform:scale(0)', [p + 8]: 'transform:scale(1)', 92: 'transform:scale(1);opacity:1', 100: 'transform:scale(1);opacity:0'});
      const rings = [[10, 6], [19, 22], [28, 38], [37, 54]];
      return GND() + `<rect x="106" y="84" width="88" height="44" fill="#8b5a3a"/><ellipse cx="150" cy="84" rx="44" ry="24" fill="#f0d9a8"/>` +
        rings.slice().reverse().map(([r, p], j) => `<ellipse cx="150" cy="84" rx="${r + 7}" ry="${f1((r + 7) * .55)}" fill="${j % 2 ? '#e8c38a' : '#d9ad6e'}" style="stroke:#a0703a;stroke-width:1.5px" ${s.a(grow(p), ORG(150, 84))}/>`).join('') +
        `<ellipse cx="150" cy="84" rx="44" ry="24" fill="none" style="stroke:#8b5a3a;stroke-width:3px"/>` +
        ['2023', '2024', '2025', '2026'].map((t, i) => `<text x="250" y="60" font-size="14" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(slot([0, 22, 38, 54, 99], i))}>${t}</text>`).join('') +
        `<text x="150" y="44" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)} ${s.a(showAt(10))}>树的年轮</text>` +
        chip(s, 250, 96, 76, '一年长一圈', CL.t, 60);
    }},
    artificial: {dur: 6, hl: [10, 24, 40], end: 60, lit: '人工做出来的', mean: '人造的；人工的', draw: s => {
      return `<rect x="0" y="0" width="300" height="128" fill="#dff2ff"/><circle cx="40" cy="30" r="14" fill="#f6d34a"/>` +
        `<path d="M0 128Q90 50 200 128z" fill="#7fbf6a"/><path d="M0 128Q90 50 200 128z" fill="#fbfdff" style="stroke:#a9c4dc;stroke-width:2px" ${s.a(fadeP(20, 44))}/>` + GND() +
        `<path d="M250 100V128" ${sk('#555', 3)}/><path d="M232 96L262 84L266 94L236 106z" fill="#8a96a6"/>` +
        [...Array(14)].map((_, i) => `<circle cx="234" cy="100" r="${1.6 + (i % 3) * .5}" fill="#fff" style="stroke:#c6d6e4;stroke-width:.5px" ${s.a({0: 'opacity:0;' + T(0, 0), 10: 'opacity:1;' + T(0, 0), 100: 'opacity:0;' + T(-60 - (i * 23) % 110, -24 - (i * 13) % 26)}, `animation-delay:${(i * .09).toFixed(2)}s`, 1.3)}/>`).join('') +
        `<text x="40" y="60" font-size="10" font-weight="700" text-anchor="middle" fill="#a8741a">大晴天</text>` +
        chip(s, 240, 40, 76, '人工造的雪', CL.t, 40);
    }},
    battle: {dur: 6, hl: [10, 30], end: 60, lit: '你来我往地打', mean: '战斗；斗争', draw: s => {
      const hits = [18, 32, 46], swA = {0: R(-40), 10: R(-40)}, swB = {0: R(40), 10: R(40)}, spk = {0: 'opacity:0', 100: 'opacity:0'};
      hits.forEach(p => { swA[p - 4] = R(-60); swA[p] = R(10); swB[p - 4] = R(60); swB[p] = R(-10); spk[p - .5] = 'opacity:0'; spk[p] = 'opacity:1'; spk[p + 4] = 'opacity:0'; });
      swA[56] = R(-40); swB[56] = R(40); swA[100] = R(-40); swB[100] = R(40);
      return GND() + kid(96, 128, CL.t, {aR: [32, -44]}) + kid(204, 128, '#d23c2f', {aL: [-32, -44]}) +
        `<circle cx="80" cy="96" r="10" fill="#c9b8a0" style="stroke:var(--ink3);stroke-width:1.5px"/><circle cx="220" cy="96" r="10" fill="#c9b8a0" style="stroke:var(--ink3);stroke-width:1.5px"/>` +
        `<g ${s.a(swA, ORG(128, 84))}><path d="M128 84L128 46" ${sk('#9aa8b8', 4)}/><path d="M122 80h12" ${sk('#8b5a3a', 3)}/></g>` +
        `<g ${s.a(swB, ORG(172, 84))}><path d="M172 84L172 46" ${sk('#9aa8b8', 4)}/><path d="M166 80h12" ${sk('#8b5a3a', 3)}/></g>` +
        `<g ${s.a(spk)}>${sparkle(150, 52, 9)}</g>` + chip(s, 150, 22, 64, '打起来了', CL.a, 20);
    }},
    childhood: {dur: 6, hl: [10, 30], end: 60, lit: '还是孩子的时期', mean: '童年', draw: s => {
      return GND() + kid(66, 128, '#3d4a5c', {k: 1.2, aR: [24, -50]}) + `<rect x="84" y="66" width="18" height="14" rx="1" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/>` +
        `<g ${s.a(fadeP(10, 20))}><circle cx="118" cy="62" r="3" ${fs(CL.p, CL.m, 1.5)}/><circle cx="130" cy="54" r="5" ${fs(CL.p, CL.m, 1.5)}/><ellipse cx="215" cy="64" rx="74" ry="50" ${fs(CL.p, CL.m, 2)}/>` +
        `<path d="M180 30h70M186 30v60M244 30v60" ${sk(WOOD, 3)}/><g ${s.a({0: R(-22), 50: R(22), 100: R(-22)}, ORG(215, 30), 2)}><path d="M205 30v50M225 30v50" ${sk(CL.m, 1.5)}/><rect x="201" y="80" width="28" height="4" rx="1" fill="${WOOD}"/>${kid(215, 80, CL.a, {k: .62})}</g></g>` +
        chip(s, 215, 132, 76, '小时候的我', CL.t, 30);
    }},
    comparison: {dur: 6, hl: [10, 40], end: 60, lit: '比一比', mean: '比较；对比', draw: s => {
      return `<path d="M120 30V128H280" ${sk(CL.k, 2)}/>` +
        `<rect x="150" y="88" width="36" height="40" fill="#8fa8c0" ${s.a(growY(8, 20), FOOT)}/><rect x="216" y="64" width="36" height="64" fill="${CL.t}" ${s.a(growY(22, 34), FOOT)}/>` +
        `<text x="168" y="142" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>去年</text><text x="234" y="142" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>今年</text>` +
        `<path d="M150 88H252" ${sk('#d23c2f', 1.5)} stroke-dasharray="4 3" ${s.a(showAt(36))}/><path d="M234 86V68M229 74l5-6 5 6" ${sk('#d23c2f', 2)} ${s.a(showAt(40))}/>` +
        `<text x="268" y="58" font-size="12" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(pop(42), ORG(268, 54))}>+60%</text>` +
        GND(8, 110) + kid(60, 128, '#3d4a5c', {aR: [40, -50]}) + chip(s, 60, 30, 92, '一比就看出差别', CL.v, 50);
    }},
    compel: {dur: 6, hl: [10, 20], end: 60, lit: '硬推着走', mean: '强迫；迫使', draw: s => {
      const go = move([[8, 0, 0], [50, 60, 0]]);
      return GND() + `<rect x="246" y="48" width="40" height="80" fill="#dff2ff" style="stroke:var(--ink3);stroke-width:2px"/><rect x="250" y="36" width="32" height="14" rx="2" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/><text x="266" y="47" font-size="9" font-weight="700" text-anchor="middle" fill="#d23c2f">牙医</text>` +
        `<g ${s.a(go)}>${kid(96, 128, '#3d4a5c', {k: 1.25, aR: [36, -48]})}<g transform="rotate(-10 150 128)">${kid(150, 128, CL.t, {k: .8, mood: 'sad', aR: [18, -40], aL: [-18, -40]})}</g>` +
        `<path d="M136 128h-12M140 124h-10" ${sk(CL.m, 1.5)} ${s.a(showAt(12, 50))}/>` + chip(s, 160, 52, 64, '我不去！', CL.a, 12) + `</g>` +
        chip(s, 66, 30, 76, '硬推着去', '#d23c2f', 36);
    }},
    concede: {dur: 6, hl: [10, 20], end: 60, lit: '退让一步', mean: '承认；让步', draw: s => {
      return `<rect x="0" y="108" width="300" height="42" fill="#6db7e8" fill-opacity=".6"/><rect x="0" y="100" width="64" height="50" fill="#7fbf6a"/><rect x="236" y="100" width="64" height="50" fill="#7fbf6a"/><rect x="60" y="100" width="180" height="6" rx="2" fill="#8b5a3a"/>` +
        `<g ${s.a(move([[44, 0, 0], [70, 56, 0]]))}>${kid(120, 100, CL.t, {k: .8})}</g>` +
        `<g ${s.a(move([[22, 0, 0], [36, 70, 0], [44, 86, 8]]))}>${kid(180, 100, CL.a, {k: .8, aR: [22, -30]})}</g>` +
        chip(s, 190, 36, 64, '你先过吧', CL.a, 18) + chip(s, 90, 36, 64, '谢谢！', CL.t, 46) + chip(s, 150, 139, 76, '退一步让路', CL.v, 56);
    }},
    // ---------- 第五十七批 ----------
    consideration: {dur: 6, hl: [10, 40], end: 60, lit: '仔细考虑别人', mean: '考虑；体贴', draw: s => {
      const xs = [20, 40, 60, 80, 100, 180, 200, 220, 240, 260, 280];
      return `<rect x="0" y="0" width="300" height="150" fill="#c9d4de" fill-opacity=".45"/>` + GND() +
        xs.map((x, i) => `<path d="M${x} 0v8" ${sk('#6db7e8', 2)} ${s.a({0: T(0, -10), 100: T(0, 140)}, `animation-delay:${((i * .37) % 1).toFixed(2)}s;animation-timing-function:linear`, .9)}/>`).join('') +
        kid(120, 128, '#8a96a6', {k: .85}) + `<path d="M104 128V98" ${sk(WOOD, 2.5)}/>` + kid(176, 128, CL.t, {aL: [-14, -40]}) +
        `<g ${s.a({0: R(0), 12: R(0), 22: R(-28), 92: R(-28), 100: R(0)}, ORG(162, 88))}><path d="M162 88V46" ${sk('#333', 2)}/><path d="M130 50Q162 22 194 50z" fill="#e2473a"/></g>` +
        `<g ${s.a(showAt(30))}>${[0, 1, 2].map(i => `<path d="M${182 + i * 6} ${70 + i * 4}q2 3 0 5" ${sk('#6db7e8', 1.5)}/>`).join('')}</g>` +
        chip(s, 240, 40, 84, '替别人着想', CL.t, 30);
    }},
    cooperation: {dur: 6, hl: [10, 40], end: 60, lit: '一起干活', mean: '合作', draw: s => {
      const box = {0: T(), 8: T()}; [10, 12, 14, 16, 18, 20].forEach((p, i) => { box[p] = T(i % 2 ? -1.5 : 1.5, -1); }); box[22] = T(); box[42] = T(); box[50] = T(0, -14); box[92] = T(0, -14); box[100] = T();
      return GND() + kid(96, 128, CL.t, {aR: [22, -30]}) +
        `<g ${s.a(move([[28, 140, 0], [40, 0, 0]]))}>${kid(214, 128, CL.a, Object.assign({aL: [-22, -30]}, walkLegs(s, 214, 128, 28, 40, 2)))}</g>` +
        `<g ${s.a(box)}><rect x="114" y="100" width="80" height="26" rx="3" fill="#c98a4a" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M124 106h60" ${sk('#a0703a', 2)}/></g>` +
        chip(s, 56, 30, 64, '抬不动…', CL.m, 10) + chip(s, 200, 30, 116, '两个人一起就抬起来了', CL.t, 50);
    }},
    curiosity: {dur: 6, hl: [10, 40], end: 60, lit: '好奇的心', mean: '好奇心', draw: s => {
      const walk = move([[8, 0, 0], [24, 30, 0]]), head = move([[26, 0, 0], [34, 10, -6]]);
      return GND() + `<rect x="180" y="88" width="70" height="40" fill="#c98a4a" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M180 88l-14-12M250 88l14-12" ${sk('#a0703a', 4)}/>` +
        `<g ${s.a(walk)}><ellipse cx="116" cy="116" rx="20" ry="10" fill="#f2b632"/><path d="M98 112q-16-4-14-22" ${sk('#f2b632', 4)} ${s.a({0: R(0), 50: R(12), 100: R(0)}, ORG(98, 112), 1)}/><path d="M108 124v4M126 124v4" ${sk('#f2b632', 4)}/>` +
        `<g ${s.a(head)}><circle cx="140" cy="102" r="10" fill="#f2b632"/><path d="M132 96l2-10 6 6zM142 92l6-6 2 10z" fill="#f2b632"/><circle cx="143" cy="101" r="1.6" fill="${INK}"/><circle cx="148" cy="101" r="1.6" fill="${INK}"/></g></g>` +
        [['？', 150, 74, 8, 12], ['？', 176, 62, 30, 16]].map(([t, x, y, p, fz]) => `<text x="${x}" y="${y}" font-size="${fz}" font-weight="700" fill="#d23c2f" ${s.a(pop(p), ORG(x, y))}>${t}</text>`).join('') +
        `<g ${s.a(moveIn([[44, 215, 104], [52, 230, 62]]))}><circle cx="0" cy="0" r="9" fill="#f48fb1"/><path d="M-6 -4q6 4 12 0M-6 3q6 4 12 0" ${sk('#d06a90', 1.2)}/></g>` +
        chip(s, 60, 36, 84, '里面是什么？', CL.a, 10);
    }},
    dependent: {dur: 6, hl: [10, 30, 40], end: 60, lit: '靠着别人的', mean: '依赖的；取决于', draw: s => {
      const worm = `<path d="M-6 0q3-4 6 0t6 0" ${sk('#f48fb1', 2.5)}/>`;
      return `<path d="M0 104H200" ${sk('#8b5a3a', 7)}/><path d="M150 104l20-16" ${sk('#8b5a3a', 4)}/>` +
        `<ellipse cx="170" cy="100" rx="26" ry="10" fill="#a0703a"/><circle cx="168" cy="88" r="9" fill="#f6d34a"/><circle cx="165" cy="85" r="1.5" fill="${INK}"/>` +
        `<path d="M176 84l8 2-8 2" fill="#f2b632" ${s.a({0: 'transform:scaleY(1)', 50: 'transform:scaleY(2)', 100: 'transform:scaleY(1)'}, ORG(176, 86), .5)}/>` +
        `<g ${s.a(move([[6, 150, -70], [24, 0, 0], [36, 0, 0], [50, 160, -60]]))}><ellipse cx="210" cy="78" rx="13" ry="8" fill="#8b5a3a"/><circle cx="198" cy="72" r="6" fill="#8b5a3a"/><path d="M192 72l-6 1 6 2z" fill="#f2b632"/><circle cx="197" cy="70" r="1.3" fill="#fff"/>` +
        `<path d="M206 74q8-14 16-8" ${sk('#6b4f34', 3)} ${s.a({0: R(0), 50: R(-30), 100: R(0)}, ORG(208, 76), .3)}/><g ${s.a(hideAt(28))} transform="translate(184 74)">${worm}</g></g>` +
        `<g ${s.a(showAt(28, 40))} transform="translate(184 88)">${worm}</g>` +
        chip(s, 70, 40, 84, '全靠妈妈喂', CL.t, 36) + chip(s, 230, 132, 76, '自己还不会', CL.v, 46);
    }},
    detect: {dur: 6, hl: [36, 20], end: 60, lit: '揭开盖子找到', mean: '发现；探测', draw: s => {
      const walk = move([[6, 0, 0], [28, 80, 0]]);
      return `<g ${s.a(move([[40, 0, 0], [48, 0, -36]]))}><circle cx="200" cy="132" r="7" fill="#f2b632" style="stroke:#a8741a;stroke-width:1.5px"/></g>` +
        `<rect x="0" y="118" width="300" height="32" fill="#e8c78a"/>` + GND() +
        `<g ${s.a(walk)}>${kid(60, 128, CL.t, Object.assign({aR: [22, -38]}, walkLegs(s, 60, 128, 6, 28, 6)))}<path d="M82 90L120 114" ${sk('#555', 2.5)}/><ellipse cx="122" cy="116" rx="10" ry="3.5" fill="#333"/></g>` +
        `<g ${s.a(showAt(28, 46))}>${[0, 1, 2].map(i => `<path d="M${190 - i * 6} ${100 - i * 6}a${14 + i * 8} ${14 + i * 8} 0 0 1 ${20 + i * 12} 0" ${sk('#d23c2f', 1.5)} ${s.a({0: 'opacity:0', [30 + i * 3]: 'opacity:0', [32 + i * 3]: 'opacity:1', [40 + i * 3]: 'opacity:0', 100: 'opacity:0'})}/>`).join('')}</g>` +
        chip(s, 250, 50, 52, '嘀嘀！', '#d23c2f', 28) + chip(s, 150, 30, 76, '探测到了！', CL.t, 50);
    }},
    devote: {dur: 6, hl: [10, 20], end: 60, lit: '全部献出去', mean: '奉献；致力于', draw: s => {
      const melt = {0: 'transform:scaleY(1)', 8: 'transform:scaleY(1)', 80: 'transform:scaleY(.35)', 92: 'transform:scaleY(.35)', 100: 'transform:scaleY(1)'};
      const down = {0: T(0, 0), 8: T(0, 0), 80: T(0, 35), 92: T(0, 35), 100: T(0, 0)};
      return GND() + kid(80, 128, CL.t, {aL: [-6, -38], aR: [14, -38]}) + `<rect x="30" y="104" width="200" height="6" rx="2" fill="${WOOD}"/><path d="M40 110v18M220 110v18" ${sk(WOOD, 4)}/>` +
        `<path d="M78 98q10-5 20 0q10-5 20 0v6H78z" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/>` +
        `<rect x="182" y="50" width="16" height="54" fill="#fff4e0" style="stroke:#e0c8a0;stroke-width:1px" ${s.a(melt, FOOT)}/>` +
        `<g ${s.a(down)}><circle cx="190" cy="46" r="30" fill="#f6d34a" fill-opacity=".22"/><path d="M190 49V44" ${sk('#333', 1.5)}/><path d="M190 30q8 10 0 15q-8-5 0-15z" fill="#f2b632" ${s.a({0: 'transform:scale(1)', 50: 'transform:scale(1.15,.9)', 100: 'transform:scale(1)'}, ORG(190, 45), .4)}/></g>` +
        chip(s, 150, 139, 120, '燃烧自己，照亮别人', CL.a, 40) + chip(s, 260, 30, 52, '奉献', CL.t, 50);
    }},
    direction: {dur: 6, hl: [8, 20, 40], end: 60, lit: '指得直直的', mean: '方向；指导', draw: s => {
      const needle = {0: R(130), 8: R(130), 18: R(-40), 24: R(26), 30: R(-12), 36: R(5), 42: R(0), 92: R(0), 100: R(130)};
      return `<circle cx="100" cy="76" r="40" fill="#fff" style="stroke:var(--ink3);stroke-width:3px"/>` +
        [['北', 100, 48, '#d23c2f'], ['南', 100, 112, CL.k], ['东', 130, 80, CL.k], ['西', 70, 80, CL.k]].map(([t, x, y, c]) => `<text x="${x}" y="${y}" font-size="10" font-weight="700" text-anchor="middle" fill="${c}">${t}</text>`).join('') +
        `<g ${s.a(needle, ORG(100, 76))}><path d="M100 50l6 26h-12z" fill="#e2473a"/><path d="M100 102l6-26h-12z" fill="#9aa8b8"/><circle cx="100" cy="76" r="3" fill="#333"/></g>` +
        GND(170, 292) + `<path d="M232 128V50" ${sk(WOOD, 4)}/><g ${s.a(pop(44), ORG(240, 56))}><path d="M222 46h36l10 10-10 10h-36z" fill="${CL.t}"/><text x="242" y="60" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">往北</text></g>` +
        `<path d="M100 50V22" ${sk('#d23c2f', 2)} stroke-dasharray="3 3" ${s.a(showAt(42))}/>` + chip(s, 100, 139, 76, '找准方向', CL.v, 50);
    }},
    discussion: {dur: 6, hl: [10, 40], end: 60, lit: '大家各说各的看法', mean: '讨论', draw: s => {
      const talk = [[86, 48, 8], [150, 36, 18], [214, 48, 28], [86, 48, 38]];
      return GND() + kid(86, 128, CL.t, {k: .85}) + kid(150, 120, CL.a, {k: .85}) + kid(214, 128, '#3d4a5c', {k: .85}) +
        `<ellipse cx="150" cy="108" rx="80" ry="12" fill="${WOOD}"/><path d="M150 120v8" ${sk(WOOD, 6)}/>` +
        talk.map(([x, y, p], i) => `<g ${s.a(showAt(p, p + 12))}>${bubble(x, y)}<path d="M${x - 9} ${y - 3}h18M${x - 9} ${y + 3}h12" ${sk(CL.m, 1.5)}/></g>`).join('') +
        `<g ${s.a(pop(52), ORG(150, 30))}><circle cx="150" cy="28" r="10" fill="#f6d34a"/><rect x="146" y="38" width="8" height="5" fill="#9aa8b8"/></g>` +
        chip(s, 150, 139, 84, '讨论出办法了', CL.v, 56);
    }},
    diverse: {dur: 6, hl: [8, 20], end: 60, lit: '转向不同方向', mean: '多种多样的', draw: s => {
      const ang = [-90, -30, 30, 90, 150, 210], cs = ['#e2473a', '#f2b632', '#3fbf6a', '#4a90d0', '#8e6bd0', '#f48fb1'];
      const pt = (a, k) => [f1(150 + 110 * k * Math.cos(a * Math.PI / 180)), f1(76 + 56 * k * Math.sin(a * Math.PI / 180))];
      const shape = (i, x, y) => [`<circle cx="${x}" cy="${y}" r="9" fill="${cs[i]}"/>`, `<rect x="${x - 8}" y="${y - 8}" width="16" height="16" fill="${cs[i]}"/>`, `<path d="M${x} ${y - 10}l10 18h-20z" fill="${cs[i]}"/>`, star5(x, y, 11, 5, cs[i]), heartAt(x, y - 2, .9, cs[i]), `<path d="M${x} ${y - 10}l8 10-8 10-8-10z" fill="${cs[i]}"/>`][i];
      return `<circle cx="150" cy="76" r="8" fill="#9aa8b8"/>` + ang.map((a, i) => { const [x0, y0] = pt(a, .16), [x1, y1] = pt(a, .66), [x2, y2] = pt(a, .88); return `<path d="M${x0} ${y0}L${x1} ${y1}" ${sk(cs[i], 2.5)} ${DASH} ${s.a(drawP(8 + i * 3, 20 + i * 3))}/><g ${s.a(pop(26 + i * 3), ORG(x2, y2))}>${shape(i, x2, y2)}</g>`; }).join('') +
        chip(s, 262, 140, 64, '各不相同', CL.v, 50);
    }},
    employ: {dur: 6, hl: [10, 20], end: 60, lit: '拿来用上', mean: '雇用；使用', draw: s => {
      const lift = {0: R(0), 24: R(0), 36: R(-20), 92: R(-20), 100: R(0)};
      return GND() + `<path d="M190 115l-10 13h20z" fill="#9aa8b8"/>` +
        `<g ${s.a(lift, ORG(190, 115))}><path d="M110 98L250 128" ${sk(WOOD, 5)}/><circle cx="238" cy="108" r="17" fill="#8a8a8a"/><path d="M228 102q6-4 12 0" ${sk('#6b6b6b', 2)}/></g>` +
        `<g ${s.a({0: T(), 24: T(), 36: T(0, 8), 92: T(0, 8), 100: T()})}>${kid(96, 128, CL.t, {aR: [16, -26], aL: [10, -24]})}</g>` +
        `<g ${s.a(showAt(38))}>${sparkle(262, 80, 6)}</g>` +
        chip(s, 100, 40, 84, '用上杠杆一撬', CL.t, 14) + chip(s, 230, 40, 84, '石头起来了', '#2f9f55', 40);
    }},
    entrepreneur: {dur: 6, hl: [8, 24, 50], end: 60, lit: '抓住机会的人', mean: '企业家；创业者', draw: s => {
      const jump = {0: T(), 16: T(), 24: T(0, -20), 32: T(), 100: T()};
      const star = {0: T(170, 0) + ';opacity:0', 4: T(170, 0) + ';opacity:0', 6: T(170, 0) + ';opacity:1', 24: T(0, 0), 32: T(0, 18), 92: T(0, 18) + ';opacity:1', 100: T(0, 18) + ';opacity:0'};
      return GND() + `<g ${s.a(jump)}>${kid(120, 128, CL.t, {aR: [10, -70]})}</g>` +
        `<g ${s.a(star)}>${star5(130, 40, 11, 5, '#f2b632')}<text x="130" y="62" font-size="9" font-weight="700" text-anchor="middle" fill="#a8741a">机会</text></g>` +
        `<g ${s.a(growY(40, 50), FOOT)}><rect x="196" y="70" width="84" height="58" fill="#f4efe6" style="stroke:var(--ink3);stroke-width:1.5px"/>` +
        [0, 1, 2, 3, 4, 5].map(i => `<path d="M${192 + i * 16} 60h16v12a8 8 0 0 1-16 0z" fill="${i % 2 ? '#fff' : '#e2473a'}"/>`).join('') +
        `<rect x="226" y="96" width="24" height="32" fill="#8b5a3a"/><text x="238" y="90" font-size="10" font-weight="700" text-anchor="middle" fill="#d23c2f">我的店</text></g>` +
        chip(s, 60, 30, 84, '一把抓住！', CL.a, 26) + chip(s, 120, 139, 100, '抓住机会去创业', CL.v, 54);
    }},
    enzyme: {dur: 6, hl: [10, 30], end: 60, lit: '体内帮着发酵的东西', mean: '酶', draw: s => {
      const cuts = [16, 30, 44], xs = [...Array(8)].map((_, j) => 50 + j * 28);
      const pac = {0: T(10, 0), 8: T(10, 0), 16: T(92, 0), 19: T(92, 0), 30: T(148, 0), 33: T(148, 0), 44: T(204, 0), 47: T(204, 0), 58: T(310, 0), 100: T(310, 0)};
      return [0, 1, 2, 3].map(k => { const p = k < 3 ? cuts[k] : 44, dx = (k - 1.5) * 8, dy = 16 + (k % 2) * 12; return `<g ${s.a(move([[p + 1, 0, 0], [p + 8, dx, dy]]))}><path d="M${xs[k * 2]} 80H${xs[k * 2 + 1]}" ${sk('#c9a06a', 3)}/><circle cx="${xs[k * 2]}" cy="80" r="9" fill="#f0d9a8" style="stroke:#c9a06a;stroke-width:1.5px"/><circle cx="${xs[k * 2 + 1]}" cy="80" r="9" fill="#f0d9a8" style="stroke:#c9a06a;stroke-width:1.5px"/></g>`; }).join('') +
        cuts.map((p, k) => `<path d="M${xs[k * 2 + 1] + 9} 80H${xs[k * 2 + 2] - 9}" ${sk('#c9a06a', 3)} ${s.a(hideAt(p))}/>`).join('') +
        `<g ${s.a(pac)}><g ${s.a({0: 'transform:scaleY(1)', 50: 'transform:scaleY(.3)', 100: 'transform:scaleY(1)'}, ORG(0, 80), .35)}><path d="M0 80L14 70A16 16 0 1 0 14 90z" fill="${CL.a}"/></g><circle cx="-2" cy="72" r="2" fill="#fff"/><text x="-4" y="106" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.a)}>酶</text></g>` +
        `<text x="20" y="40" font-size="10" font-weight="700" ${fl(CL.k)} ${s.a(showAt(4, 30))}>一长串淀粉</text>` +
        chip(s, 150, 30, 92, '切成一小段一小段', CL.t, 50) + chip(s, 236, 132, 84, '体内的小剪刀', CL.v, 56);
    }},
    // ---------- 第五十八批 ----------
    extend: {dur: 6, hl: [20, 30], end: 60, lit: '向外伸出去', mean: '延长；扩大', draw: s => {
      const flag = `<path d="M0 0V-30" ${sk('#555', 2)}/><path d="M0 -30h20l-5 6 5 6H0z" fill="#d23c2f"/>`;
      return `<path d="M30 80H180" ${sk(CL.m, 6)} stroke-linecap="round"/>` + [30, 80, 130, 180].map(x => `<path d="M${x} 74v12" ${sk(CL.m, 2)}/>`).join('') +
        `<path d="M180 80H262" ${sk(CL.t, 6)} ${s.a(growX(20, 34), ORG(180, 80))}/><path d="M262 72l12 8-12 8z" fill="${CL.t}" ${s.a(showAt(32))}/>` +
        `<text x="180" y="102" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>5 日</text><text x="262" y="102" font-size="10" font-weight="700" text-anchor="middle" fill="${CL.t}" ${s.a(showAt(34))}>12 日</text>` +
        `<g ${s.a(move([[20, 180, 74], [34, 262, 74]]))}>${flag}</g><text x="180" y="34" font-size="10" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(showAt(6, 30))}>截止</text>` +
        chip(s, 100, 30, 92, '截止日往后延', CL.t, 40) + chip(s, 220, 132, 76, '多了一周', CL.v, 50);
    }},
    facilitate: {dur: 6, hl: [24, 30], end: 60, lit: '让事情变容易', mean: '促进；使便利', draw: s => {
      const cart = `<rect x="-16" y="-24" width="32" height="18" rx="2" fill="#4a90d0"/><circle cx="-9" cy="-4" r="4" fill="#333"/><circle cx="9" cy="-4" r="4" fill="#333"/>`;
      const pts = [[8, 110, 128], [20, 152, 128], [34, 152, 128], [56, 266, 88, 'rotate(-22deg)'], [92, 266, 88, 'rotate(-22deg)']];
      return `<rect x="170" y="112" width="120" height="16" fill="#c9b8a0"/><rect x="210" y="96" width="80" height="16" fill="#c9b8a0"/><rect x="250" y="80" width="40" height="16" fill="#c9b8a0"/>` +
        `<path d="M170 128L290 80V128z" fill="${WOOD}" fill-opacity=".9" ${s.a(moveIn([[24, 0, 40], [32, 0, 0]]))}/>` + GND() +
        `<g ${s.a(move(pts))}>${cart}</g>` +
        `<g ${s.a(move([[8, 0, 0], [20, 42, 0], [34, 42, 0], [56, 150, -32]]))}>${kid(92, 128, CL.t, {k: .85, aR: [20, -28]})}</g>` +
        chip(s, 150, 30, 64, '上不去…', CL.m, 16) + chip(s, 150, 56, 100, '加个坡就容易了', CL.t, 34);
    }},
    fiction: {dur: 6, hl: [10, 30], end: 60, lit: '捏造出来的', mean: '小说；虚构', draw: s => {
      const rocket = `<path d="M0 -14q7 8 6 20h-12q-1-12 6-20z" fill="#fff" style="stroke:var(--ink3);stroke-width:1.2px"/><circle cx="0" cy="-2" r="2.5" fill="#4a90d0"/><path d="M-6 4l-5 6h5M6 4l5 6h-5" fill="#e2473a"/><path d="M-3 8q3 8 6 0" fill="#f2b632"/>`;
      return GND() + `<circle cx="252" cy="34" r="16" fill="#8e6bd0" ${s.a(pop(8), ORG(252, 34))}/><path d="M232 38q20-10 40-8" ${sk('#c9b8f0', 3)} ${s.a(pop(8), ORG(252, 34))}/>` +
        `<path d="M150 96Q190 70 236 42" ${sk(CL.m, 1.5)} stroke-dasharray="3 4" ${s.a(showAt(30))}/>` +
        `<g ${s.a(moveIn([[14, 150, 92, 'rotate(0deg)'], [34, 232, 46, 'rotate(55deg)']]))}>${rocket}</g>` +
        `<path d="M118 100q16-6 32 0q16-6 32 0v20q-16-6-32 0q-16-6-32 0z" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M150 100v20" ${sk(CL.m, 1)}/>` +
        kid(70, 128, CL.t, {aR: [44, -16]}) + chip(s, 70, 40, 84, '书里编的故事', CL.t, 30) + chip(s, 230, 100, 64, '不是真的', CL.v, 44);
    }},
    following: {dur: 6, hl: [10, 30], end: 60, lit: '跟在后面的', mean: '下列的；追随者', draw: s => {
      const duck = (x, k, c) => `<ellipse cx="${x}" cy="${128 - 9 * k}" rx="${f1(13 * k)}" ry="${f1(9 * k)}" fill="${c}"/><circle cx="${f1(x + 10 * k)}" cy="${f1(128 - 22 * k)}" r="${f1(7 * k)}" fill="${c}"/><path d="M${f1(x + 16 * k)} ${f1(128 - 22 * k)}l${f1(7 * k)} 2-${f1(7 * k)} 2z" fill="#f28a1a"/><circle cx="${f1(x + 12 * k)}" cy="${f1(128 - 24 * k)}" r="1.3" fill="${INK}"/>`;
      return GND() + `<g ${s.a(move([[6, 0, 0], [60, 40, 0]]))}>` +
        `<g ${s.a({0: R(-4), 50: R(4), 100: R(-4)}, ORG(220, 128), .6)}>${duck(220, 1.4, '#f0e6d0')}</g>` +
        [180, 150, 120, 90].map((x, i) => `<g ${s.a(showAt(10 + i * 8))}><g ${s.a({0: R(5), 50: R(-5), 100: R(5)}, ORG(x, 128), .5)}>${duck(x, .8, '#f6d34a')}</g></g>`).join('') + `</g>` +
        chip(s, 150, 40, 104, '一大群跟在后面的', CL.t, 44) + chip(s, 262, 70, 52, '领头', CL.a, 8);
    }},
    frustrate: {dur: 6, hl: [10, 30], end: 60, lit: '白忙一场', mean: '使沮丧；挫败', draw: s => {
      const drop = [[0, 0, -8], [26, 16, 40], [62, 44, 85]];
      return GND() + [0, 1, 2].map(i => `<g ${s.a((f => { const [dx, dy, r] = drop[i]; f[26] = T(0, 0, 'rotate(0deg)') + ';opacity:1'; f[34] = T(dx, dy, `rotate(${r}deg)`) + ';opacity:1'; f[92] = f[34]; f[100] = T(dx, dy, `rotate(${r}deg)`) + ';opacity:0'; return f; })(moveIn([[6 + i * 6, 0, -80, 'rotate(0deg)'], [11 + i * 6, 0, 0, 'rotate(0deg)']])), ORG(155, 118 - i * 20))}><rect x="140" y="${108 - i * 20}" width="30" height="20" fill="${['#e2473a', '#f2b632', '#4a90d0'][i]}" style="stroke:var(--ink3);stroke-width:1px"/></g>`).join('') +
        kid(80, 128, CL.t, {noFace: true}) + `<g ${s.a(hideAt(32))}>${face(80, 128, 1)}</g><g ${s.a(showAt(32))}>${face(80, 128, 1, 'sad')}</g>` +
        `<g ${s.a(showAt(38))}><path d="M64 40a10 10 0 0 1 16-6 12 12 0 0 1 20 6 8 8 0 0 1 0 14H64a7 7 0 0 1 0-14z" fill="#6b7480"/><path d="M72 58l-3 7M84 58l-3 7M96 58l-3 7" ${sk('#6db7e8', 2)}/></g>` +
        chip(s, 220, 40, 64, '又倒了…', '#d23c2f', 36) + chip(s, 220, 66, 64, '好沮丧', CL.v, 46);
    }},
    historical: {dur: 6, hl: [10, 30], end: 60, lit: '与历史有关的', mean: '历史的', draw: s => {
      return `<rect x="60" y="40" width="180" height="70" fill="#f3e3c0" style="stroke:#c9a06a;stroke-width:1.5px" ${s.a(growX(8, 22), ORG(150, 75))}/>` +
        `<g ${s.a(move([[8, 90, 0], [22, 0, 0]]))}><rect x="52" y="36" width="8" height="78" rx="3" fill="#8b5a3a"/></g><g ${s.a(move([[8, -90, 0], [22, 0, 0]]))}><rect x="240" y="36" width="8" height="78" rx="3" fill="#8b5a3a"/></g>` +
        `<g ${s.a(fadeP(22, 30))}>` + [...Array(8)].map((_, i) => `<path d="M${214 - i * 18} 50v8M${214 - i * 18} 64v8M${214 - i * 18} 78v8" ${sk('#5a4632', 2.5)}/>`).join('') + `<rect x="74" y="88" width="14" height="14" fill="#d23c2f"/></g>` +
        `<g ${s.a(moveIn([[34, 230, 120], [46, 170, 70]]))}><circle cx="0" cy="0" r="14" ${fs('#bfe1f2', '#555', 2.5, .3)}/><path d="M10 10l10 10" ${sk('#555', 3)}/></g>` +
        chip(s, 150, 20, 92, '公元 618 年', '#8b5a3a', 30) + chip(s, 150, 134, 92, '历史文献', CL.v, 46);
    }},
    hostility: {dur: 6, hl: [10, 30, 40], end: 60, lit: '敌对的态度', mean: '敌意；敌对', draw: s => {
      const cat = `<path d="M60 124V112M100 124V112M66 124V112M94 124V112" ${sk('#555', 3)}/><path d="M58 114Q80 76 102 114" ${sk('#555', 14)} stroke-linecap="round"/>` +
        `<path d="M60 100l-4-6M70 88l-2-7M80 84v-7M90 88l2-7" ${sk('#555', 2)}/><path d="M58 112q-16-10-10-30" ${sk('#555', 4)}/>` +
        `<circle cx="112" cy="104" r="10" fill="#555"/><path d="M104 98l1-10 6 6zM114 94l6-6 1 10z" fill="#555"/><path d="M110 102l5 2M116 100l5-2" ${sk('#f6d34a', 1.8)}/><path d="M113 110l3-2 3 2" ${sk('#fff', 1.2)}/>`;
      const puff = {0: 'transform:scale(1)', 50: 'transform:scale(1.05,1.08)', 100: 'transform:scale(1)'};
      return GND() + `<g ${s.a(puff, ORG(80, 124), .5)}>${cat}</g><g transform="translate(300 0) scale(-1 1)"><g ${s.a(puff, ORG(80, 124), .5)}>${cat}</g></g>` +
        `<path d="M134 98l8-6 4 8 8-6 4 8 8-6" ${sk('#d23c2f', 2.5)} ${s.a({0: 'opacity:0', 10: 'opacity:0', 12: 'opacity:1', 20: 'opacity:.2', 28: 'opacity:1', 36: 'opacity:.2', 44: 'opacity:1', 92: 'opacity:1', 100: 'opacity:0'})}/>` +
        chip(s, 70, 40, 52, '嘶——', '#555', 8) + chip(s, 230, 40, 52, '嘶——', '#555', 16) + chip(s, 150, 139, 84, '满满的敌意', '#d23c2f', 40);
    }},
    imitate: {dur: 6, hl: [10, 40], end: 60, lit: '照着样子做', mean: '模仿', draw: s => {
      const up1 = {aR: [16, -64]}, up2 = {aL: [-16, -64], aR: [16, -64]}, dad = [{}, up1, up2], son = [{}, up1, up2];
      return GND() + dad.map((o, i) => `<g ${s.a(slot([0, 10, 40, 99], i))}>${kid(100, 128, '#3d4a5c', Object.assign({k: 1.25}, o))}</g>`).join('') +
        son.map((o, i) => `<g ${s.a(slot([0, 18, 48, 99], i))}>${kid(210, 128, CL.t, Object.assign({k: .7}, o))}</g>`).join('') +
        `<path d="M134 70Q160 56 186 70M180 64l6 6-8 2" ${sk(CL.v, 1.8)} ${s.a(showAt(14))}/>` +
        chip(s, 250, 40, 52, '学！', CL.t, 20) + chip(s, 150, 139, 84, '照着样子做', CL.v, 52);
    }},
    immediately: {dur: 6, hl: [10, 30], end: 60, lit: '一…就…', mean: '立即；一…就', draw: s => {
      return GND() + `<path d="M200 128V70l40-28 40 28v58z" fill="#f4efe6" style="stroke:var(--ink3);stroke-width:1.5px"/><rect x="226" y="92" width="22" height="36" fill="#8b5a3a"/>` +
        `<g ${s.a(move([[6, 0, 0], [28, 120, 0]]))}>${kid(70, 128, CL.t, Object.assign({}, walkLegs(s, 70, 128, 6, 28, 6)))}</g>` +
        `<g ${s.a(pop(30), ORG(170, 30))}><path d="M130 30a14 14 0 0 1 22-10 18 18 0 0 1 32 6 12 12 0 0 1 0 22h-52a10 10 0 0 1-2-18z" fill="#6b7480"/></g>` +
        `<g ${s.a(showAt(32))}>` + [140, 156, 172, 188, 204].map((x, i) => `<path d="M${x} 56v8" ${sk('#6db7e8', 2)} ${s.a({0: T(0, 0), 100: T(0, 66)}, `animation-delay:${(i * .17).toFixed(2)}s;animation-timing-function:linear`, .8)}/>`).join('') + `</g>` +
        chip(s, 70, 40, 104, '他一到，就下雨了', CL.a, 36) + chip(s, 80, 70, 52, '马上', CL.t, 30);
    }},
    inspire: {dur: 6, hl: [10, 20], end: 60, lit: '吹进一口气', mean: '激励；启发', draw: s => {
      const hop = {0: T(), 34: T(), 40: T(0, -16), 46: T(), 52: T(0, -10), 58: T(), 100: T()};
      return GND() + kid(80, 128, '#3d4a5c', {k: 1.15, aR: [34, -60]}) +
        [0, 1, 2].map(i => `<path d="M${120} ${66 + i * 10}q20 -8 34 0t34 0" ${sk('#6db7e8', 2.5)} ${DASH} ${s.a(drawP(10 + i * 4, 24 + i * 4))}/>`).join('') +
        `<g ${s.a(hop)}>${kid(220, 128, CL.t, {k: .85})}</g>` +
        `<g ${s.a(pop(32), ORG(220, 36))}><circle cx="220" cy="32" r="10" fill="#f6d34a"/><rect x="216" y="42" width="8" height="5" fill="#9aa8b8"/><path d="M220 14v-5M204 22l-4-3M236 22l4-3" ${sk('#f2b632', 2)}/></g>` +
        chip(s, 140, 30, 84, '给你吹口气', CL.v, 14) + chip(s, 150, 139, 84, '一下有了劲', CL.t, 44);
    }},
    muscle: {dur: 6, hl: [26, 34], end: 60, lit: '皮下的小老鼠', mean: '肌肉', draw: s => {
      const flex = {0: R(0), 10: R(0), 24: R(-80), 92: R(-80), 100: R(0)};
      const bulge = {0: 'transform:scaleY(1)', 10: 'transform:scaleY(1)', 24: 'transform:scaleY(2)', 92: 'transform:scaleY(2)', 100: 'transform:scaleY(1)'};
      return `<path d="M10 90H150" ${sk(SKIN, 28)} stroke-linecap="round"/><ellipse cx="95" cy="80" rx="32" ry="9" fill="${SKIN}" ${s.a(bulge, ORG(95, 86))}/>` +
        `<g ${s.a(flex, ORG(150, 90))}><path d="M150 90H200" ${sk(SKIN, 22)} stroke-linecap="round"/><circle cx="210" cy="90" r="15" fill="${SKIN}"/><path d="M204 82v16M211 82v16" ${sk('#d9a37e', 1.5)}/></g>` +
        `<g ${s.a(showAt(26))}><g ${s.a({0: T(-10, 0), 50: T(10, -2), 100: T(-10, 0)}, '', 1.2)}><ellipse cx="95" cy="72" rx="11" ry="7" fill="#9aa8b8"/><circle cx="104" cy="66" r="4" fill="#9aa8b8"/><circle cx="107" cy="70" r="1.3" fill="${INK}"/><path d="M84 74q-10 2-12-5" ${sk('#9aa8b8', 1.5)}/></g></g>` +
        `<path d="M70 30q25 18 25 32" ${sk(CL.m, 1.5)} stroke-dasharray="3 3" ${s.a(showAt(30))}/>` +
        chip(s, 70, 24, 116, '鼓起来像只小老鼠', CL.a, 30) + chip(s, 230, 132, 64, '肌肉', CL.t, 44);
    }},
    otherwise: {dur: 6, hl: [10, 30], end: 60, lit: '换种情况', mean: '否则；不然', draw: s => {
      return GND() + kid(50, 128, CL.t) + `<circle cx="50" cy="40" r="13" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><path d="M50 32v8l6 4" ${sk(CL.k, 2)}/>` +
        `<path d="M76 84H108Q130 84 150 54H190" ${sk('#3fbf6a', 3)} ${DASH} ${s.a(drawP(8, 20))}/><path d="M108 84Q130 84 150 114H190" ${sk('#d23c2f', 3)} ${DASH} ${s.a(drawP(28, 40))}/>` +
        `<text x="150" y="44" font-size="10" font-weight="700" text-anchor="middle" fill="#2f9f55" ${s.a(showAt(10))}>马上起床</text><text x="150" y="132" font-size="10" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(showAt(30))}>否则</text>` +
        `<g ${s.a(pop(20), ORG(206, 54))}><circle cx="206" cy="54" r="11" fill="#3fbf6a"/><path d="M200 54l4 4 8-8" ${sk('#fff', 2.5)}/></g><text x="222" y="58" font-size="11" font-weight="700" fill="#2f9f55" ${s.a(showAt(22))}>赶上车</text>` +
        `<g ${s.a(pop(40), ORG(206, 114))}><circle cx="206" cy="114" r="11" fill="#d23c2f"/><path d="M201 109l10 10M211 109l-10 10" ${sk('#fff', 2.5)}/></g><text x="222" y="118" font-size="11" font-weight="700" fill="#d23c2f" ${s.a(showAt(42))}>迟到了</text>`;
    }},
    // ---------- 第五十九批 ----------
    passionate: {dur: 6, hl: [10, 20, 30], end: 60, lit: '满怀热情的', mean: '热情的；热衷的', draw: s => {
      const fire = (x, k, c, d, y = 128) => `<g ${s.a({0: 'transform:scale(1,1)', 50: 'transform:scale(1.08,1.15)', 100: 'transform:scale(1,1)'}, ORG(x, y) + `;animation-delay:${d}s`, .5)}><path d="M${x} ${y}q${-16 * k} ${-22 * k} 0 ${-50 * k}q${2 * k} ${16 * k} ${11 * k} ${20 * k}q${6 * k} ${-11 * k} ${2 * k} ${-25 * k}q${16 * k} ${18 * k} ${5 * k} ${55 * k}z" fill="${c}"/></g>`;
      const note = (x, y) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${CL.v}"/><path d="M${x + 3.5} ${y}V${y - 14}l6 3" ${sk(CL.v, 1.8)}/>`;
      return GND() + `<g ${s.a(pop(8), ORG(176, 40))}>${fire(168, .5, '#f2b632', 0, 34)}${fire(184, .55, '#e2473a', .2, 34)}${fire(176, .7, '#f28a1a', .1, 36)}${heartAt(176, 40, 1.4, '#e2473a')}</g>` +
        kid(120, 128, CL.t, {aR: [16, -40], aL: [-14, -44]}) + `<path d="M104 86L148 74" ${sk('#8b5a3a', 3)}/><ellipse cx="124" cy="92" rx="14" ry="10" fill="#c98a4a" transform="rotate(-15 124 92)"/><circle cx="124" cy="92" r="3" fill="#6b4f34"/>` +
        [0, 1, 2].map(i => `<g ${s.a({0: 'opacity:0;' + T(0, 0), 20: 'opacity:1;' + T(8, -10), 100: 'opacity:0;' + T(30, -50)}, `animation-delay:${(i * .5).toFixed(1)}s`, 1.5)}>${note(160, 80)}</g>`).join('') +
        chip(s, 236, 40, 76, '热爱到冒火', '#e2473a', 24) + chip(s, 236, 100, 76, '热衷于弹琴', CL.t, 44);
    }},
    platform: {dur: 6, hl: [10, 24], end: 60, lit: '平平的台子', mean: '平台；站台', draw: s => {
      return `<rect x="0" y="92" width="140" height="58" fill="#c9c4bc"/><path d="M0 92H140" ${sk('#f2b632', 3)}/><path d="M140 140H300" ${sk('#6b6b6b', 3)}/>` +
        `<path d="M40 92V44" ${sk('#555', 3)}/><rect x="16" y="28" width="58" height="18" rx="3" fill="#2f5d8a"/><text x="45" y="41" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">3 号站台</text>` +
        kid(96, 92, CL.t, {k: .8}) +
        `<g ${s.a(move([[8, 220, 0], [28, 0, 0]]))}><rect x="146" y="70" width="160" height="62" rx="10" fill="#e2473a"/>` + [0, 1, 2].map(i => `<rect x="${166 + i * 42}" y="80" width="30" height="20" rx="3" fill="#dff2ff"/>`).join('') + `<circle cx="172" cy="134" r="6" fill="#333"/><circle cx="270" cy="134" r="6" fill="#333"/></g>` +
        `<path d="M10 92H136" ${sk(CL.t, 4)} ${DASH} ${s.a(drawP(32, 42))}/>` + chip(s, 90, 130, 92, '平平的台子', CL.v, 40) + chip(s, 220, 40, 64, '车到站了', CL.a, 28);
    }},
    player: {dur: 6, hl: [10, 30], end: 60, lit: '玩的人', mean: '运动员；参与者', draw: s => {
      const kick = {0: R(0), 12: R(0), 16: R(30), 20: R(-55), 26: R(0), 100: R(0)};
      return GND() + `<path d="M240 128V70H290" ${sk('#fff', 4)} style="stroke:#9aa8b8"/>` + [0, 1, 2, 3].map(i => `<path d="M${248 + i * 12} 72V128M242 ${82 + i * 12}H290" ${sk('#c6d0da', 1)}/>`).join('') +
        kid(90, 128, CL.t, {aL: [-20, -34], legR: s.a(kick, hip(90, 128, 1))}) +
        `<g ${s.a(move([[18, 0, 0], [26, 72, -38], [34, 150, -24], [40, 150, 4]]))}><circle cx="114" cy="122" r="6" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M111 120l3-2 3 2-1 3h-4z" fill="#333"/></g>` +
        chip(s, 262, 50, 52, '进球！', CL.a, 36) + chip(s, 90, 40, 76, '场上的球员', CL.t, 46);
    }},
    recover: {dur: 6, hl: [10, 30], end: 60, lit: '重新盖好伤口', mean: '恢复；康复', draw: s => {
      return GND() + `<g ${s.a({0: T(), 44: T(), 48: T(0, -14), 52: T(), 56: T(0, -8), 60: T(), 100: T()})}>${kid(80, 128, CL.t, {noFace: true})}<g ${s.a(hideAt(40))}>${face(80, 128, 1, 'sad')}<rect x="68" y="58" width="24" height="8" rx="3" fill="#bfe1f2"/></g><g ${s.a(showAt(40))}>${face(80, 128, 1)}</g></g>` +
        `<rect x="170" y="52" width="90" height="22" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><rect x="260" y="58" width="5" height="10" fill="${INK}"/>` +
        `<rect x="173" y="55" width="84" height="16" rx="2" ${s.a({0: 'transform:scaleX(.2);fill:#e2473a', 10: 'transform:scaleX(.2);fill:#e2473a', 40: 'transform:scaleX(1);fill:#3fbf6a', 92: 'transform:scaleX(1);fill:#3fbf6a', 100: 'transform:scaleX(.2);fill:#e2473a'}, ORG(173, 63))}/>` +
        ['39.5 度', '37.2 度', '36.6 度'].map((t, i) => `<text x="215" y="104" font-size="14" font-weight="700" text-anchor="middle" fill="${['#d23c2f', '#f28a1a', '#2f9f55'][i]}" ${s.a(slot([0, 20, 36, 99], i))}>${t}</text>`).join('') +
        chip(s, 150, 30, 64, '病好了！', '#2f9f55', 44);
    }},
    recreate: {dur: 6, hl: [10, 30], end: 60, lit: '再造一遍', mean: '再现；重现', draw: s => {
      const bones = [[90, 90, 140, 72, -60, 34, 40], [140, 72, 200, 62, -10, 52, -20], [200, 62, 220, 40, 30, 70, 70], [150, 74, 150, 120, -100, 4, 90], [185, 68, 185, 120, 60, 10, -90], [222, 36, 240, 40, 40, 82, 20]];
      return GND() + bones.map(([x1, y1, x2, y2, dx, dy, r], i) => { const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2; return `<g ${s.a(move([[8 + i * 2, dx, dy, `rotate(${r}deg)`], [24 + i * 2, 0, 0, 'rotate(0deg)']]), ORG(cx, cy))}><path d="M${x1} ${y1}L${x2} ${y2}" ${sk('#e6dccb', 6)} stroke-linecap="round"/><circle cx="${x1}" cy="${y1}" r="4" fill="#e6dccb"/><circle cx="${x2}" cy="${y2}" r="4" fill="#e6dccb"/></g>`; }).join('') +
        `<path d="M80 92Q120 66 150 70Q190 60 205 58Q214 44 222 32Q238 26 246 38Q238 48 226 48Q218 62 210 72Q200 84 192 86L192 122H180L178 90L160 92L158 122H146L144 90Q120 92 80 92z" fill="#3fbf6a" fill-opacity=".55" ${s.a(fadeP(36, 46))}/><circle cx="234" cy="36" r="2" fill="${INK}" ${s.a(fadeP(36, 46))}/>` +
        chip(s, 70, 30, 104, '把过去重新造出来', CL.t, 48) + chip(s, 70, 54, 64, '化石骨头', '#8b5a3a', 6);
    }},
    regular: {dur: 6, hl: [10, 30], end: 60, lit: '按规矩来的', mean: '有规律的；定期的', draw: s => {
      const days = ['一', '二', '三', '四', '五', '六', '日'];
      return days.map((d, i) => `<rect x="${24 + i * 37}" y="30" width="32" height="40" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><text x="${40 + i * 37}" y="42" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>周${d}</text>` +
        `<g ${s.a(pop(8 + i * 6), ORG(40 + i * 37, 57))}><circle cx="${40 + i * 37}" cy="57" r="8" fill="#3fbf6a"/><path d="M${36 + i * 37} 57l3 3 5-6" ${sk('#fff', 2)}/></g>`).join('') +
        GND() + `<g ${s.a(move([[4, 0, 0], [60, 90, 0]]))}>${kid(50, 128, CL.t, Object.assign({k: .7}, walkLegs(s, 50, 128, 4, 60, 10, .7)))}</g>` +
        `<text x="40" y="20" font-size="10" font-weight="700" ${fl(CL.v)}>每天早上 7 点跑步</text>` + chip(s, 230, 100, 76, '天天如此', CL.t, 52);
    }},
    regulation: {dur: 6, hl: [10, 30], end: 60, lit: '定下的规矩', mean: '规章；规定', draw: s => {
      const rules = ['1. 先淋浴', '2. 不准奔跑', '3. 不准跳水'];
      return `<rect x="120" y="132" width="180" height="18" fill="#6db7e8"/>` + GND() + `<path d="M40 128V90" ${sk('#555', 3)}/><rect x="10" y="14" width="96" height="78" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="58" y="30" font-size="10" font-weight="700" text-anchor="middle" fill="#d23c2f">泳池规定</text>` +
        rules.map((t, i) => `<text x="18" y="${48 + i * 16}" font-size="9" ${fl(CL.k)} ${s.a(showAt(6 + i * 5))}>${t}</text>`).join('') +
        `<path d="M262 128L270 70M290 128L282 70M266 100h20" ${sk(WOOD, 3)}/>` + kid(276, 70, '#d23c2f', {k: .6}) +
        `<g ${s.a(move([[6, 40, 0], [26, 0, 0]]))}>${kid(170, 128, CL.t, Object.assign({k: .8}, walkLegs(s, 170, 128, 6, 26, 6, .8)))}</g>` +
        chip(s, 236, 40, 60, '哔——！', '#d23c2f', 24) + chip(s, 170, 60, 64, '不准跑！', CL.a, 30) + chip(s, 100, 139, 76, '按规定来', CL.v, 48);
    }},
    scholar: {dur: 6, hl: [10, 30], end: 60, lit: '做学问的人', mean: '学者', draw: s => {
      const stack = (x, n, p) => [...Array(n)].map((_, i) => `<g ${s.a(moveIn([[p + i * 3, 0, -60], [p + 4 + i * 3, 0, 0]]))}><rect x="${x}" y="${116 - i * 12}" width="${44 - (i % 2) * 6}" height="12" fill="${['#2f5d8a', '#e2473a', '#3fbf6a', '#f2b632', '#8e6bd0', '#8b5a3a'][i % 6]}" style="stroke:var(--ink3);stroke-width:1px"/></g>`).join('');
      return GND() + stack(20, 6, 8) + stack(236, 7, 14) +
        kid(150, 128, '#3d4a5c', {aR: [20, -30]}) + `<circle cx="146" cy="75" r="4" fill="none" style="stroke:#333;stroke-width:1.5px"/><circle cx="155" cy="75" r="4" fill="none" style="stroke:#333;stroke-width:1.5px"/><path d="M150 75h1" ${sk('#333', 1.5)}/><path d="M142 84q8 12 16 0" fill="#eee"/>` +
        `<rect x="100" y="104" width="110" height="6" rx="2" fill="${WOOD}"/><path d="M110 110v18M200 110v18" ${sk(WOOD, 4)}/><path d="M162 100l14-4 2 6-14 4z" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/>` +
        chip(s, 150, 30, 76, '做学问的人', CL.v, 40);
    }},
    spectrum: {dur: 6, hl: [8, 24], end: 60, lit: '看得见的一整排', mean: '光谱；范围', draw: s => {
      const cs = ['#e2473a', '#f28a1a', '#f6d34a', '#3fbf6a', '#4a90d0', '#3d4ab0', '#8e6bd0'];
      return `<rect x="0" y="0" width="300" height="150" fill="#1d2440"/>` +
        `<path d="M0 72L140 78" ${sk('#fff', 4)} ${DASH} ${s.a(drawP(6, 16))}/>` +
        `<g ${s.a(growX(18, 34), ORG(152, 80))}>` + cs.map((c, i) => `<path d="M152 80L292 ${f1(34 + i * 13)}L292 ${f1(34 + (i + 1) * 13)}z" fill="${c}"/>`).join('') + `</g>` +
        `<path d="M118 102L162 102L140 58z" fill="#dff2ff" fill-opacity=".55" style="stroke:#fff;stroke-width:1.5px"/>` +
        `<text x="40" y="62" font-size="10" font-weight="700" fill="#fff" ${s.a(showAt(8))}>白光</text><text x="140" y="120" font-size="9" font-weight="700" text-anchor="middle" fill="#dff2ff">三棱镜</text>` +
        chip(s, 230, 140, 92, '一整排颜色', CL.v, 38);
    }},
    strongly: {dur: 6, hl: [10, 30], end: 60, lit: '很用力地', mean: '强烈地；坚决地', draw: s => {
      const cs = ['#3fbf6a', '#9bd04a', '#f6d34a', '#f28a1a', '#e2473a'];
      return GND() + kid(70, 128, CL.t, {aR: [14, -62]}) + cs.map((c, i) => `<rect x="${190 + i * 18}" y="${110 - i * 16}" width="14" height="${18 + i * 16}" fill="${c}" ${s.a(showAt(8 + i * 5))}/><rect x="${190 + i * 18}" y="${110 - i * 16}" width="14" height="${18 + i * 16}" fill="none" style="stroke:var(--ink3);stroke-width:1px"/>`).join('') +
        `<text x="130" y="52" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.m)} ${s.a(slot([0, 32, 99], 0))}>我推荐…</text>` +
        `<g ${s.a(slot([0, 32, 99], 1))}><g ${s.a({0: T(0, 0), 25: T(-2, 1), 50: T(2, -1), 75: T(-1, 0), 100: T(0, 0)}, '', .25)}><text x="130" y="56" font-size="18" font-weight="700" text-anchor="middle" fill="#d23c2f">强烈推荐！</text></g></g>` +
        chip(s, 236, 24, 76, '力度拉满', '#d23c2f', 44);
    }},
    suggestion: {dur: 6, hl: [10, 30], end: 60, lit: '提出来的想法', mean: '建议', draw: s => {
      return `<path d="M0 116H150L300 52" ${sk('#d8dde3', 18)} fill="none"/><path d="M150 116L300 140" ${sk('#d8dde3', 18)} fill="none"/>` +
        kid(126, 116, CL.a, {k: .8}) + `<text x="126" y="44" font-size="16" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(pop(6), ORG(126, 40))}>？</text>` +
        kid(60, 116, CL.t, {k: .9, aR: [44, -52]}) +
        `<path d="M156 112L294 54" ${sk(CL.t, 3)} ${DASH} ${s.a(drawP(26, 38))}/>` +
        chip(s, 60, 26, 76, '要不走这条？', CL.t, 20) + chip(s, 230, 128, 64, '给个建议', CL.v, 42);
    }},
    telomere: {dur: 6, hl: [10, 20], end: 60, lit: '末端的那一小段', mean: '端粒', draw: s => {
      const ends = [[130, 40], [170, 112], [170, 40], [130, 112]];
      const shrink = (x, y) => s.a({0: 'transform:scale(1)', 18: 'transform:scale(1)', 22: 'transform:scale(.7)', 36: 'transform:scale(.7)', 40: 'transform:scale(.45)', 54: 'transform:scale(.45)', 58: 'transform:scale(.15)', 92: 'transform:scale(.15)', 100: 'transform:scale(1)'}, ORG(x, y));
      return `<path d="M130 40L170 112M170 40L130 112" ${sk('#8e6bd0', 16)} stroke-linecap="round"/>` + ends.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#f2b632" ${shrink(x, y)}/>`).join('') +
        ['第 1 次分裂', '第 2 次分裂', '第 3 次分裂'].map((t, i) => `<text x="240" y="70" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(slot([0, 20, 38, 56, 99], i + 1))}>${t}</text>`).join('') +
        `<path d="M96 30L124 38" ${sk(CL.m, 1.5)} ${s.a(showAt(6))}/>` + chip(s, 60, 26, 76, '末端保护帽', '#a8741a', 6) +
        chip(s, 240, 110, 92, '越来越短，就衰老', '#d23c2f', 60);
    }},
    // ---------- 第六十批 ----------
    tendency: {dur: 6, hl: [10, 40], end: 60, lit: '往一边倾的样子', mean: '趋势；倾向', draw: s => {
      return GND() + `<rect x="220" y="16" width="70" height="66" fill="#dff2ff" style="stroke:var(--ink3);stroke-width:2px"/><path d="M255 16v66M220 49h70" ${sk(CL.m, 1.5)}/><circle cx="270" cy="32" r="9" fill="#f6d34a"/>` +
        [0, 1, 2].map(i => `<path d="M216 ${40 + i * 12}L170 ${58 + i * 10}" ${sk('#f2b632', 1.5)} stroke-dasharray="4 4" ${s.a(showAt(6))}/>`).join('') +
        `<g ${s.a({0: R(0), 10: R(0), 50: R(28), 92: R(28), 100: R(0)}, ORG(110, 104))}><path d="M110 104V54" ${sk('#3f8f4f', 3)}/><path d="M110 84q-14-4-16-14q12 0 16 14zM110 72q14-4 16-14q-12 0-16 14z" fill="#5d9a4a"/><circle cx="110" cy="48" r="7" fill="#f2b632"/><circle cx="110" cy="48" r="3" fill="#8b5a3a"/></g>` +
        `<path d="M94 104h32l-4 24h-24z" fill="#c9734a"/>` +
        ['第 1 天', '第 5 天', '第 10 天'].map((t, i) => `<text x="40" y="40" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(slot([0, 20, 40, 99], i))}>${t}</text>`).join('') +
        chip(s, 170, 132, 100, '总往有光那边歪', CL.t, 50);
    }},
    tradition: {dur: 6, hl: [10, 24, 40], end: 60, lit: '一代代交下去', mean: '传统；惯例', draw: s => {
      const lan = `<path d="M0 -12v6" ${sk('#a8741a', 1.5)}/><ellipse cx="0" cy="4" rx="9" ry="10" fill="#e2473a"/><rect x="-5" y="-7" width="10" height="3" fill="#f2b632"/><rect x="-5" y="13" width="10" height="3" fill="#f2b632"/><path d="M0 16v6" ${sk('#f2b632', 1.5)}/>`;
      return GND() + kid(60, 128, '#8a96a6', {k: 1.05, aR: [24, -38]}) + kid(150, 128, '#3d4a5c', {k: 1.15, aL: [-20, -36], aR: [20, -36]}) + kid(240, 128, CL.t, {k: .75, aL: [-20, -36]}) +
        [['爷爷', 60, 40], ['爸爸', 150, 30], ['我', 240, 58]].map(([t, x, y]) => `<text x="${x}" y="${y}" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>${t}</text>`).join('') +
        `<g ${s.a(move([[6, 86, 98], [14, 86, 98], [26, 173, 96], [34, 173, 96], [46, 225, 110]]))}>${lan}</g>` +
        chip(s, 150, 139, 92, '一代代传下去', CL.a, 50);
    }},
    transport: {dur: 6, hl: [8, 30], end: 60, lit: '搬到别处去', mean: '运输；交通工具', draw: s => {
      const box = (x, y) => `<rect x="${x}" y="${y}" width="14" height="12" fill="#c98a4a" style="stroke:#a0703a;stroke-width:1px"/>`;
      return GND() + `<rect x="8" y="64" width="60" height="64" fill="#9aa8b8"/><path d="M8 64l15-12v12l15-12v12l15-12v12" fill="#9aa8b8"/><text x="38" y="96" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">工厂</text>` +
        `<rect x="232" y="70" width="60" height="58" fill="#f4efe6" style="stroke:var(--ink3);stroke-width:1.5px"/><rect x="232" y="62" width="60" height="10" fill="#e2473a"/><text x="262" y="96" font-size="10" font-weight="700" text-anchor="middle" fill="#d23c2f">商店</text>` +
        `<g ${s.a(move([[8, 0, 0], [38, 104, 0]]))}><rect x="70" y="94" width="50" height="24" fill="#4a90d0"/><rect x="120" y="100" width="18" height="18" rx="2" fill="#2f5d8a"/><circle cx="84" cy="120" r="6" fill="#333"/><circle cx="126" cy="120" r="6" fill="#333"/>` +
        `<g ${s.a(hideAt(42))}>${box(76, 82)}${box(92, 82)}${box(84, 70)}</g></g>` +
        `<g ${s.a(moveIn([[42, 180, 82], [50, 240, 116]]))}>${box(0, 0)}</g><g ${s.a(moveIn([[44, 196, 82], [52, 256, 116]]))}>${box(0, 0)}</g><g ${s.a(moveIn([[46, 188, 70], [54, 270, 116]]))}>${box(0, 0)}</g>` +
        `<path d="M70 40H230M222 34l8 6-8 6" ${sk(CL.v, 2)} ${DASH} ${s.a(drawP(10, 36))}/>` + chip(s, 150, 24, 92, '从这儿运到那儿', CL.t, 30);
    }},
    traveler: {dur: 6, hl: [10, 40], end: 60, lit: '旅行的人', mean: '旅行者；旅客', draw: s => {
      const stamps = [['北京', 196, 48, -12, '#d23c2f'], ['巴黎', 248, 56, 10, '#2f5d8a'], ['东京', 214, 88, -6, '#3f8f4f']];
      return GND() + `<rect x="170" y="22" width="114" height="92" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="227" y="36" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>护照</text>` +
        stamps.map(([t, x, y, r, c], i) => `<g ${s.a(pop(14 + i * 10), ORG(x, y))}><g transform="rotate(${r} ${x} ${y})"><rect x="${x - 20}" y="${y - 10}" width="40" height="20" rx="4" fill="none" style="stroke:${c};stroke-width:2px"/><text x="${x}" y="${y + 4}" font-size="10" font-weight="700" text-anchor="middle" fill="${c}">${t}</text></g></g>`).join('') +
        `<g ${s.a(move([[6, 0, 0], [60, 80, 0]]))}><rect x="34" y="74" width="16" height="22" rx="3" fill="#8b5a3a"/>${kid(50, 128, CL.t, Object.assign({aR: [18, -26]}, walkLegs(s, 50, 128, 6, 60, 10)))}<path d="M68 102v14" ${sk('#555', 2)}/><rect x="62" y="114" width="16" height="12" rx="2" fill="#e2473a"/></g>` +
        chip(s, 70, 30, 84, '到处走的人', CL.v, 46);
    }},
    truly: {dur: 6, hl: [10, 30], end: 60, lit: '真正地', mean: '真正地；确实', draw: s => {
      return GND() + `<path d="M110 120L124 92H176L190 120z" fill="#f2b632" style="stroke:#a8741a;stroke-width:2px"/><path d="M128 98h40" ${sk('#fff', 2, .6)}/>` +
        `<g ${s.a(moveIn([[6, 250, 50], [18, 160, 90], [26, 140, 96]]))}><circle cx="0" cy="0" r="16" ${fs('#bfe1f2', '#555', 2.5, .3)}/><path d="M11 11l12 12" ${sk('#555', 3)}/></g>` +
        `<text x="150" y="66" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.m)} ${s.a(showAt(8, 28))}>检测中…</text>` +
        `<g ${s.a(pop(30), ORG(150, 60))}><circle cx="150" cy="56" r="11" fill="#3fbf6a"/><path d="M144 56l4 4 8-8" ${sk('#fff', 2.5)}/></g>` +
        `<g ${s.a(showAt(32))}>${sparkle(104, 90, 6)}${sparkle(196, 86, 5)}</g>` + chip(s, 60, 40, 76, '确实是真金', CL.t, 36) + chip(s, 240, 40, 76, '真真正正', CL.v, 46);
    }},
    unexcused: {dur: 6, hl: [10, 30], end: 60, lit: '没被准许的', mean: '无正当理由的', draw: s => {
      return `<rect x="110" y="12" width="176" height="128" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="198" y="32" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>点名册</text>` +
        `<text x="122" y="54" font-size="10" ${fl(CL.k)}>小明</text><g ${s.a(showAt(6))}><path d="M170 50l4 4 8-8" ${sk('#3fbf6a', 2.5)}/><text x="188" y="54" font-size="9" fill="#2f9f55">到</text></g>` +
        `<text x="122" y="78" font-size="10" ${fl(CL.k)}>小红</text><g ${s.a(showAt(14))}><rect x="168" y="68" width="14" height="14" fill="#fff6c8" style="stroke:#c9a06a;stroke-width:1px"/><text x="188" y="78" font-size="9" fill="#a8741a">请假（有假条）</text></g>` +
        `<text x="122" y="102" font-size="10" ${fl(CL.k)}>小刚</text><text x="172" y="102" font-size="10" ${fl(CL.m)} ${s.a(showAt(22))}>— 没来，也没说</text>` +
        `<g ${s.a(pop(32), ORG(236, 124))}><g transform="rotate(-8 236 124)"><rect x="196" y="112" width="80" height="22" rx="3" fill="none" style="stroke:#d23c2f;stroke-width:2.5px"/><text x="236" y="128" font-size="11" font-weight="700" text-anchor="middle" fill="#d23c2f">无故缺勤</text></g></g>` +
        GND(8, 104) + kid(56, 128, '#3d4a5c', {aR: [44, -40]}) + chip(s, 60, 30, 76, '没理由就不来', '#d23c2f', 44);
    }},
    unlike: {dur: 6, hl: [10, 30], end: 60, lit: '不像', mean: '不像；和…不同', draw: s => {
      const jump = {0: T(), 100: T()}; [10, 30, 50, 70].forEach(p => { jump[p] = T(); jump[p + 5] = T(0, -14); jump[p + 10] = T(); });
      return GND() + `<g ${s.a(jump)}>${kid(80, 128, '#d23c2f', {aR: [22, -52]})}<circle cx="104" cy="70" r="8" fill="#f28a1a"/><path d="M96 70h16M104 62v16" ${sk('#a85a1a', 1)}/></g>` +
        kid(220, 128, '#4a90d0', {aL: [-12, -36], aR: [12, -36]}) + `<rect x="208" y="84" width="24" height="16" rx="1" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/><path d="M220 84v16" ${sk(CL.m, 1)}/>` +
        `<g ${s.a(pop(20), ORG(150, 80))}><path d="M136 74h28M136 86h28" ${sk(CL.k, 3)}/><path d="M156 66l-12 28" ${sk('#d23c2f', 3)}/></g>` +
        `<text x="80" y="28" font-size="11" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(showAt(8))}>哥哥：爱运动</text><text x="220" y="40" font-size="11" font-weight="700" text-anchor="middle" fill="#2f5d8a" ${s.a(showAt(14))}>弟弟：爱看书</text>` +
        chip(s, 150, 139, 92, '弟弟不像哥哥', CL.v, 34);
    }},
    vehicle: {dur: 6, hl: [10, 30], end: 60, lit: '载着人走的东西', mean: '车辆；交通工具', draw: s => {
      const bus = move([[6, 200, 0], [22, 0, 0], [40, 0, 0], [60, -280, 0]]);
      return GND() + `<path d="M60 128V70" ${sk('#555', 3)}/><rect x="44" y="56" width="32" height="16" rx="3" fill="#2f5d8a"/><text x="60" y="68" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">车站</text>` +
        `<g ${s.a(hideAt(28))}>${kid(96, 128, CL.t, {k: .8})}${kid(116, 128, CL.a, {k: .75})}</g>` +
        `<g ${s.a(bus)}><rect x="124" y="60" width="150" height="58" rx="8" fill="#f2b632"/><rect x="128" y="70" width="16" height="44" fill="#8b5a3a"/>` +
        [0, 1, 2, 3].map(i => `<rect x="${152 + i * 30}" y="68" width="24" height="20" rx="2" fill="#dff2ff"/>`).join('') +
        `<g ${s.a(showAt(30))}><circle cx="164" cy="80" r="6" fill="${SKIN}"/><circle cx="194" cy="80" r="6" fill="${SKIN}"/><path d="M158 78q6-8 12 0M188 78q6-8 12 0" fill="${HAIR}"/></g>` +
        `<circle cx="150" cy="120" r="8" fill="#333"/><circle cx="246" cy="120" r="8" fill="#333"/></g>` +
        chip(s, 200, 30, 76, '把人载走', CL.t, 42);
    }},
    village: {dur: 6, hl: [10, 30], end: 60, lit: '一片住人的小地方', mean: '村庄', draw: s => {
      const house = (x, c, p) => `<g ${s.a(pop(p), ORG(x, 128))}><rect x="${x - 16}" y="104" width="32" height="24" fill="#f4efe6" style="stroke:var(--ink3);stroke-width:1px"/><path d="M${x - 20} 106L${x} 88L${x + 20} 106z" fill="${c}"/><rect x="${x - 4}" y="114" width="8" height="14" fill="#8b5a3a"/><rect x="${x + 8}" y="90" width="5" height="10" fill="#8b5a3a"/>` +
        [0, 1].map(i => `<path d="M${x + 10} 86q-4-5 0-10t0-10" ${sk('#b8b0a4', 1.5)} ${s.a({0: 'opacity:0;' + T(0, 4), 50: 'opacity:.8;' + T(0, 0), 100: 'opacity:0;' + T(0, -8)}, `animation-delay:${i * .8}s`, 1.6)}/>`).join('') + `</g>`;
      return `<rect x="0" y="0" width="300" height="128" fill="#eaf6e0" fill-opacity=".6"/>` + GND() + `<path d="M150 128V82" ${sk('#8b5a3a', 8)}/><circle cx="150" cy="66" r="26" fill="#5d9a4a"/><circle cx="132" cy="78" r="14" fill="#6fae5a"/>` +
        house(50, '#d23c2f', 6) + house(96, '#2f5d8a', 12) + house(204, '#8b5a3a', 18) + house(252, '#d23c2f', 24) +
        `<g ${s.a(pop(30), ORG(150, 24))}><rect x="118" y="14" width="64" height="20" rx="3" fill="#8b5a3a"/><text x="150" y="28" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">李家村</text></g>` +
        `<g ${s.a({0: R(0), 40: R(0), 50: R(30), 60: R(0), 100: R(0)}, ORG(178, 122), 1.2)}><ellipse cx="176" cy="122" rx="7" ry="5" fill="#fff" style="stroke:#ccc;stroke-width:1px"/><circle cx="182" cy="116" r="3.5" fill="#fff" style="stroke:#ccc;stroke-width:1px"/><path d="M185 116l3 1-3 1z" fill="#f28a1a"/></g>` +
        chip(s, 236, 30, 52, '村庄', CL.t, 40);
    }},
    wisdom: {dur: 6, hl: [10, 30], end: 60, lit: '明智的样子', mean: '智慧', draw: s => {
      return GND(8, 120) + kid(60, 128, CL.t, {aR: [26, -46]}) + `<path d="M150 116H290" ${sk('#8b5a3a', 6)}/>` +
        `<ellipse cx="220" cy="84" rx="24" ry="30" fill="#8b5a3a"/><ellipse cx="220" cy="94" rx="14" ry="18" fill="#d9b48a"/><path d="M200 60l2-10 8 8zM240 60l-2-10-8 8z" fill="#8b5a3a"/>` +
        `<circle cx="211" cy="74" r="9" fill="#fff"/><circle cx="229" cy="74" r="9" fill="#fff"/><g ${s.a({0: 'transform:scaleY(1)', 46: 'transform:scaleY(1)', 48: 'transform:scaleY(.1)', 50: 'transform:scaleY(1)', 100: 'transform:scaleY(1)'}, ORG(220, 74), 3)}><circle cx="211" cy="74" r="4" fill="${INK}"/><circle cx="229" cy="74" r="4" fill="${INK}"/></g>` +
        `<path d="M216 82l4 6 4-6z" fill="#f2b632"/><path d="M210 114v4M230 114v4" ${sk('#f2b632', 2)}/>` +
        [0, 1, 2].map(i => `<g ${s.a((f => { f[24 + i * 4] = T(190, 40 + i * 12) + ';opacity:0'; f[92] = f[24 + i * 4]; return f; })(moveIn([[6 + i * 5, 90, 70 - i * 10], [20 + i * 4, 190, 40 + i * 12]])))}><text x="0" y="0" font-size="14" font-weight="700" fill="#d23c2f">？</text></g>`).join('') +
        `<g ${s.a(pop(36), ORG(266, 40))}><circle cx="266" cy="36" r="10" fill="#f6d34a"/><rect x="262" y="46" width="8" height="5" fill="#9aa8b8"/><path d="M266 18v-5M250 26l-4-3M282 26l4-3" ${sk('#f2b632', 2)}/></g>` +
        chip(s, 150, 139, 100, '什么都想得明白', CL.v, 44);
    }},
    additional: {dur: 6, hl: [10, 36], end: 60, lit: '另外加上的', mean: '额外的；附加的', draw: s => {
      return GND() + `<rect x="40" y="112" width="70" height="16" rx="2" fill="#9aa8b8"/><rect x="112" y="108" width="34" height="16" rx="2" fill="#2a2f3a"/><path d="M110 120h-4" ${sk('#555', 2)}/>` +
        ['0 kg', '25 kg'].map((t, i) => `<text x="129" y="120" font-size="9" font-weight="700" text-anchor="middle" fill="${i ? '#ff6b5a' : '#6fe3ff'}" ${s.a(slot([0, 16, 99], i))}>${t}</text>`).join('') +
        `<g ${s.a(moveIn([[6, -60, 0], [14, 0, 0]]))}><rect x="52" y="58" width="46" height="54" rx="5" fill="#e2473a" style="stroke:#a83228;stroke-width:1.5px"/><path d="M66 58v-8h18v8" ${sk('#333', 3)}/></g>` +
        `<text x="75" y="40" font-size="10" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(showAt(18))}>限重 20 kg</text>` +
        `<rect x="150" y="26" width="132" height="92" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><text x="160" y="48" font-size="10" ${fl(CL.k)}>机票</text><text x="272" y="48" font-size="10" text-anchor="end" ${fl(CL.k)}>800 元</text>` +
        `<g ${s.a(showAt(28))}><text x="160" y="70" font-size="10" font-weight="700" fill="#d23c2f">额外：超重费</text><text x="272" y="70" font-size="10" font-weight="700" text-anchor="end" fill="#d23c2f">+200 元</text></g>` +
        `<path d="M160 84H272" ${sk(CL.k, 1)} ${s.a(showAt(36))}/><text x="272" y="104" font-size="12" font-weight="700" text-anchor="end" ${fl(CL.k)} ${s.a(showAt(38))}>共 1000 元</text>` +
        chip(s, 216, 138, 84, '另外加的钱', CL.a, 44);
    }},
    advertisement: {dur: 6, hl: [10, 30], end: 60, lit: '做出来的广告', mean: '广告', draw: s => {
      return `<rect x="70" y="14" width="170" height="96" rx="6" fill="#2a2f3a"/><rect x="76" y="20" width="158" height="84" fill="#fff6dc"/><path d="M140 110l-10 10h50l-10-10" fill="#555"/>` +
        `<g ${s.a({0: 'transform:scaleX(1)', 25: 'transform:scaleX(.2)', 50: 'transform:scaleX(1)', 75: 'transform:scaleX(.2)', 100: 'transform:scaleX(1)'}, ORG(120, 62), 1.6)}><rect x="108" y="36" width="24" height="44" rx="4" fill="#3d4a5c"/><rect x="111" y="41" width="18" height="32" fill="#6fe3ff"/></g>` +
        `<text x="186" y="58" font-size="13" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a({0: 'opacity:1', 50: 'opacity:.3', 100: 'opacity:1'}, '', .6)}>新品 5 折！</text>` +
        `<rect x="198" y="24" width="32" height="14" rx="3" fill="#000" fill-opacity=".5"/>` + ['广告 15', '广告 10', '广告 5'].map((t, i) => `<text x="214" y="34" font-size="8" font-weight="700" text-anchor="middle" fill="#fff" ${s.a(slot([0, 20, 40, 99], i))}>${t}</text>`).join('') +
        GND() + kid(40, 128, CL.t, {k: .8, noFace: true}) + face(40, 128, .8, 'sad') + `<rect x="10" y="108" width="60" height="20" rx="4" fill="#8e6bd0" fill-opacity=".7"/>` +
        chip(s, 270, 120, 44, '广告', CL.a, 10) + chip(s, 170, 139, 104, '先看完广告才能看剧', CL.v, 40);
    }},
    // ---------- 第六十一批 ----------
    appealing: {dur: 6, hl: [10, 30], end: 60, lit: '吸引人的', mean: '吸引人的；诱人的', draw: s => {
      return GND() + `<rect x="170" y="40" width="120" height="88" fill="#dff2ff" fill-opacity=".6" style="stroke:var(--ink3);stroke-width:2px"/><rect x="170" y="30" width="120" height="12" fill="#f48fb1"/><text x="230" y="40" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">蛋糕店</text>` +
        `<rect x="206" y="106" width="48" height="6" fill="#9aa8b8"/><rect x="210" y="84" width="40" height="22" rx="3" fill="#f6e7c8"/><rect x="214" y="70" width="32" height="16" rx="3" fill="#f48fb1"/><circle cx="230" cy="66" r="5" fill="#e2473a"/>` +
        `<g ${s.a(showAt(30))}>${sparkle(200, 64, 6)}${sparkle(262, 78, 5)}</g>` +
        [0, 1].map(i => `<path d="M206 ${78 + i * 10}q-20-8-40 0t-40 0" ${sk('#c98a4a', 1.5)} ${DASH} ${s.a(drawP(8 + i * 4, 22 + i * 4))}/>`).join('') +
        `<g ${s.a(move([[6, 0, 0], [26, 50, 0]]))}>${kid(60, 128, CL.t, Object.assign({}, walkLegs(s, 60, 128, 6, 26, 4)))}<g ${s.a(pop(30), ORG(60, 50))}>${heartAt(52, 44, .7)}${heartAt(70, 40, .9)}</g></g>` +
        chip(s, 150, 139, 64, '好诱人！', CL.a, 34);
    }},
    appearance: {dur: 6, hl: [10, 30], end: 60, lit: '出现时的样子', mean: '外表；出现', draw: s => {
      const mess = (x, y, k) => `<path d="M${x - 10 * k} ${y}l${-3 * k} ${-8 * k} ${6 * k} ${4 * k} ${2 * k} ${-9 * k} ${5 * k} ${7 * k} ${4 * k} ${-8 * k} ${3 * k} ${8 * k} ${5 * k} ${-5 * k} ${-2 * k} ${9 * k}z" fill="${HAIR}"/>`;
      const tie = (x, y, k) => `<path d="M${x} ${y}l${-4 * k} ${4 * k} ${4 * k} ${16 * k} ${4 * k} ${-16 * k}z" fill="#e2473a"/>`;
      return GND() + `<ellipse cx="214" cy="74" rx="40" ry="52" fill="#e8f4fb" style="stroke:#8b5a3a;stroke-width:5px"/>` +
        kid(110, 128, CL.t, {aR: [22, -60]}) + kid(214, 116, CL.t, {k: .62}) +
        `<g ${s.a(hideAt(28))}>${mess(110, 68, 1)}${mess(214, 85, .62)}</g><g ${s.a(showAt(28))}>${tie(110, 86, 1)}${tie(214, 95, .62)}${sparkle(84, 60, 6)}${sparkle(242, 52, 5)}</g>` +
        `<path d="M132 68l6 10" ${sk('#9aa8b8', 4)} ${s.a({0: R(0), 10: R(0), 15: R(-20), 20: R(10), 25: R(-20), 30: R(0), 100: R(0)}, ORG(132, 70))}/>` +
        chip(s, 60, 30, 76, '收拾好外表', CL.t, 34);
    }},
    automate: {dur: 6, hl: [10, 30], end: 60, lit: '机器自己动', mean: '使自动化', draw: s => {
      const flow = {0: T(0, 0), 100: T(65, 0)};
      return `<rect x="14" y="104" width="266" height="10" rx="5" fill="#555"/>` + [30, 80, 130, 180, 230, 270].map(x => `<circle cx="${x}" cy="109" r="3" fill="#999"/>`).join('') + GND() +
        `<svg x="14" y="40" width="266" height="64" viewBox="14 40 266 64"><g ${s.a(flow, 'animation-timing-function:linear', 1)}>` + [-45, 20, 85, 150, 215].map(x => `<rect x="${x}" y="76" width="16" height="28" rx="3" fill="#6db7e8"/><rect x="${x + 4}" y="70" width="8" height="6" fill="#6db7e8"/>`).join('') + `</g></svg>` +
        `<rect x="120" y="10" width="76" height="14" fill="#8a96a6"/><g ${s.a({0: T(0, 0), 40: T(0, 0), 55: T(0, 26), 70: T(0, 0), 100: T(0, 0)}, '', 1)}><rect x="153" y="24" width="10" height="26" fill="#9aa8b8"/><rect x="146" y="48" width="24" height="8" rx="2" fill="#e2473a"/></g>` +
        `<g ${s.a(showAt(30))}>${kid(262, 128, CL.a, {k: .7, aL: [-14, -36]})}<rect x="242" y="98" width="8" height="8" rx="1" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/></g>` +
        chip(s, 70, 30, 84, '机器自己干活', CL.t, 12) + chip(s, 240, 40, 64, '人在歇着', CL.v, 36);
    }},
    beneficial: {dur: 6, hl: [10, 30], end: 60, lit: '带来好处的', mean: '有益的', draw: s => {
      const xs = [70, 150, 230];
      const bee = move([[6, 20, 30], [14, 70, 70], [20, 70, 70], [28, 150, 70], [34, 150, 70], [42, 230, 70], [48, 230, 70], [60, 300, 30]]);
      return GND() + xs.map((x, i) => `<path d="M${x} 128V86" ${sk('#3f8f4f', 3)}/><path d="M${x} 108q-12-4-14-12q12 0 14 12z" fill="#5d9a4a"/>` +
        `<g ${s.a(hideAt(20 + i * 14))}>${[0, 72, 144, 216, 288].map(a => `<circle cx="${f1(x + 7 * Math.cos(a * Math.PI / 180))}" cy="${f1(80 + 7 * Math.sin(a * Math.PI / 180))}" r="5" fill="#f48fb1"/>`).join('')}<circle cx="${x}" cy="80" r="3.5" fill="#f6d34a"/></g>` +
        `<g ${s.a(pop(22 + i * 14), ORG(x, 82))}><circle cx="${x}" cy="84" r="10" fill="#e2473a"/><path d="M${x} 74q2-4 5-4" ${sk('#3f8f4f', 2)}/></g>`).join('') +
        `<g ${s.a(bee)}><g transform="translate(0 -14)"><ellipse cx="0" cy="0" rx="8" ry="6" fill="#f6d34a"/><path d="M-2 -6v12M3 -5v10" ${sk('#333', 2)}/><g ${s.a({0: 'transform:scaleY(1)', 50: 'transform:scaleY(.3)', 100: 'transform:scaleY(1)'}, ORG(0, -6), .2)}><ellipse cx="-2" cy="-10" rx="5" ry="4" fill="#dff2ff" fill-opacity=".8"/><ellipse cx="4" cy="-10" rx="5" ry="4" fill="#dff2ff" fill-opacity=".8"/></g></g></g>` +
        chip(s, 150, 24, 104, '蜜蜂传粉，结出果子', CL.t, 50);
    }},
    contract: {dur: 6, hl: [10, 30], end: 60, lit: '双方拉到一起签的', mean: '合同；收缩', draw: s => {
      return GND() + kid(50, 128, CL.t, {aR: [44, -30]}) + kid(250, 128, '#3d4a5c', {aL: [-44, -30]}) +
        `<rect x="96" y="14" width="108" height="112" rx="2" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="150" y="32" font-size="12" font-weight="700" text-anchor="middle" ${fl(CL.k)}>合　同</text>` +
        [44, 54, 64, 74].map(y => `<path d="M106 ${y}h88" ${sk(CL.m, 1.2, .6)}/>`).join('') +
        `<text x="106" y="96" font-size="8" ${fl(CL.k)}>甲方：</text><text x="152" y="96" font-size="8" ${fl(CL.k)}>乙方：</text><path d="M104 112h40M150 112h44" ${sk(CL.m, 1)}/>` +
        `<path d="M108 108q4-8 8 0t8 0 8-4 8 2" ${sk('#2f5d8a', 1.8)} ${DASH} ${s.a(drawP(10, 20))}/><path d="M154 108q5-10 10 0t10 0 8-6 10 2" ${sk('#2f5d8a', 1.8)} ${DASH} ${s.a(drawP(24, 34))}/>` +
        `<g ${s.a(pop(40), ORG(180, 102))}><circle cx="180" cy="102" r="13" fill="none" style="stroke:#d23c2f;stroke-width:2.5px"/>${star5(180, 102, 6, 2.5, '#d23c2f')}</g>` +
        chip(s, 150, 139, 92, '双方签好合同', CL.v, 48);
    }},
    convey: {dur: 6, hl: [10, 30], end: 60, lit: '沿路带过去', mean: '传达；运送', draw: s => {
      const bird = `<ellipse cx="0" cy="0" rx="12" ry="7" fill="#fff" style="stroke:#9aa8b8;stroke-width:1px"/><circle cx="11" cy="-5" r="5" fill="#fff" style="stroke:#9aa8b8;stroke-width:1px"/><path d="M15 -5l5 1-5 2z" fill="#f2b632"/><g ${s.a({0: R(0), 50: R(-40), 100: R(0)}, ORG(-2, -4), .3)}><path d="M-2 -4q-6-14-16-12q4 10 16 12z" fill="#e8eef4" style="stroke:#9aa8b8;stroke-width:1px"/></g><rect x="-8" y="5" width="12" height="8" fill="#f6e7a8" style="stroke:#a8741a;stroke-width:1px"/>`;
      return GND() + kid(40, 128, CL.t, {aR: [24, -44]}) + kid(260, 128, CL.a, {aL: [-24, -44]}) +
        `<path d="M66 80Q150 10 236 80" ${sk(CL.m, 1.5)} stroke-dasharray="4 4"/>` +
        `<g ${s.a(move([[8, 70, 80], [22, 116, 44], [34, 186, 44], [46, 230, 80]]))}>${bird}</g>` +
        chip(s, 60, 30, 64, '帮我带话', CL.t, 8) + chip(s, 246, 30, 64, '收到了！', CL.a, 48) + chip(s, 150, 139, 92, '沿着路送过去', CL.v, 30);
    }},
    correct: {dur: 6, hl: [10, 30], end: 60, lit: '把弯的弄直', mean: '正确的；纠正', draw: s => {
      return `<rect x="40" y="14" width="190" height="90" rx="4" fill="#2f4a3a" style="stroke:#8b5a3a;stroke-width:4px"/>` +
        `<text x="120" y="70" font-size="24" font-weight="700" text-anchor="middle" fill="#fff">2 + 2 =</text><text x="186" y="70" font-size="24" font-weight="700" fill="#fff">5</text>` +
        `<path d="M182 46l22 28M204 46l-22 28" ${sk('#e2473a', 3)} ${DASH} ${s.a(drawP(14, 22))}/><text x="196" y="96" font-size="20" font-weight="700" fill="#ff8a7a" ${s.a(showAt(26))}>4</text>` +
        `<path d="M212 88l5 5 10-12" ${sk('#6fe3a0', 3)} ${DASH} ${s.a(drawP(36, 42))}/>` + GND() +
        kid(262, 128, '#3d4a5c', {aL: [-22, -50]}) + `<path d="M240 78l-10 4" ${sk('#e2473a', 3)}/>` +
        chip(s, 100, 128, 76, '把错的改对', CL.a, 44);
    }},
    correlate: {dur: 6, hl: [10, 30], end: 60, lit: '互相联系着', mean: '相关；使相关联', draw: s => {
      const pts = [[60, 108], [76, 100], [92, 104], [110, 88], [128, 84], [146, 74], [164, 70], [184, 56], [204, 50], [224, 40]];
      return `<path d="M46 20V120H260" ${sk(CL.k, 2)}/><path d="M42 26l4-8 4 8M254 116l8 4-8 4" fill="${CL.k}"/>` +
        `<text x="54" y="18" font-size="9" font-weight="700" ${fl(CL.k)}>成绩</text><text x="256" y="136" font-size="9" font-weight="700" text-anchor="end" ${fl(CL.k)}>学习时间</text>` +
        pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="4" fill="${CL.t}" ${s.a(pop(6 + i * 2.6), ORG(x, y))}/>`).join('') +
        `<path d="M54 112L236 36" ${sk('#d23c2f', 2.5)} ${DASH} ${s.a(drawP(34, 46))}/>` +
        chip(s, 120, 34, 104, '一个涨，另一个也涨', CL.v, 48);
    }},
    creation: {dur: 6, hl: [10, 30], end: 60, lit: '创造出来的', mean: '创造；作品', draw: s => {
      return GND() + `<path d="M160 128L172 96M230 128L218 96M195 128V96" ${sk(WOOD, 3)}/><rect x="140" y="18" width="110" height="78" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/>` +
        `<rect x="142" y="20" width="106" height="74" fill="#bfe1f2" ${s.a(fadeP(8, 16))}/><path d="M142 94L176 54L200 78L216 62L248 94z" fill="#5d9a4a" ${s.a(fadeP(18, 26))}/>` +
        `<circle cx="226" cy="38" r="9" fill="#f6d34a" ${s.a(pop(28), ORG(226, 38))}/><path d="M156 40q6-4 12 0M172 32q6-4 12 0" ${sk('#fff', 2)} ${s.a(showAt(32))}/>` +
        `<rect x="138" y="16" width="114" height="82" fill="none" style="stroke:#c9a06a;stroke-width:5px" ${s.a(showAt(40))}/>` +
        kid(80, 128, CL.t, {aR: [40, -54], aL: [-16, -34]}) + `<path d="M120 74l18-8" ${sk('#8b5a3a', 2.5)}/><ellipse cx="62" cy="96" rx="12" ry="8" fill="#f4efe6" style="stroke:var(--ink3);stroke-width:1px"/><circle cx="58" cy="94" r="2" fill="#e2473a"/><circle cx="64" cy="98" r="2" fill="#4a90d0"/>` +
        chip(s, 195, 120, 76, '我的作品', CL.a, 44);
    }},
    crucial: {dur: 6, hl: [10, 30], end: 60, lit: '十字路口上的', mean: '至关重要的', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#cfe6b8" fill-opacity=".6"/><path d="M150 0V150M0 76H300" ${sk('#d8dde3', 30)}/><path d="M150 0V150M0 76H300" ${sk('#fff', 2)} stroke-dasharray="6 6"/>` +
        kid(150, 96, CL.t, {k: .6}) + `<text x="150" y="44" font-size="18" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(pop(24), ORG(150, 40))}>！</text>` +
        [['成功', 240, 46, '#2f9f55', 8], ['悬崖', 60, 46, '#d23c2f', 12], ['迷路', 60, 116, '#888', 16], ['回家', 240, 116, '#2f5d8a', 20]].map(([t, x, y, c, p]) => `<g ${s.a(pop(p), ORG(x, y))}><rect x="${x - 24}" y="${y - 10}" width="48" height="20" rx="3" fill="#fff" style="stroke:${c};stroke-width:2px"/><text x="${x}" y="${y + 4}" font-size="10" font-weight="700" text-anchor="middle" fill="${c}">${t}</text></g>`).join('') +
        chip(s, 150, 139, 120, '这一步选错就完了', '#d23c2f', 34);
    }},
    display: {dur: 6, hl: [8, 20], end: 60, lit: '摊开给人看', mean: '展示；陈列', draw: s => {
      const open = d => ({0: T(0, 0), 8: T(0, 0), 20: T(d, 0), 92: T(d, 0), 100: T(0, 0)});
      return `<rect x="60" y="16" width="180" height="96" fill="#3a2e28"/><path d="M70 60H230M70 100H230" ${sk(WOOD, 4)}/>` +
        `<g ${s.a(fadeP(20, 28))}><path d="M100 16L80 60H120zM150 16L130 60H170zM200 16L180 60H220z" fill="#f6e7a8" fill-opacity=".35"/><path d="M100 60L80 100H120zM200 60L180 100H220z" fill="#f6e7a8" fill-opacity=".25"/></g>` +
        `<path d="M94 58q-6-14 6-20q12 6 6 20z" fill="#4a90d0"/><ellipse cx="150" cy="54" rx="14" ry="6" fill="#f4efe6" style="stroke:#c9a06a;stroke-width:1.5px"/><path d="M190 58v-14h20v14z" fill="#3fbf6a"/><circle cx="100" cy="90" r="9" fill="#f2b632"/><rect x="186" y="82" width="28" height="16" fill="#e2473a"/>` +
        `<svg x="60" y="16" width="180" height="96" viewBox="60 16 180 96"><g ${s.a(open(-90))}><rect x="60" y="16" width="90" height="96" fill="#b02a2a"/><path d="M75 16v96M95 16v96M115 16v96M135 16v96" ${sk('#8a1f1f', 2)}/></g><g ${s.a(open(90))}><rect x="150" y="16" width="90" height="96" fill="#b02a2a"/><path d="M165 16v96M185 16v96M205 16v96M225 16v96" ${sk('#8a1f1f', 2)}/></g></svg>` +
        `<rect x="56" y="10" width="188" height="8" fill="#8b5a3a"/>` + GND() + kid(30, 128, CL.t, {k: .8}) + kid(270, 128, CL.a, {k: .8}) +
        chip(s, 150, 126, 64, '展出中', CL.v, 26) + chip(s, 150, 30, 92, '摊开给大家看', CL.t, 40);
    }},
    dominant: {dur: 6, hl: [10, 30], end: 60, lit: '说了算的', mean: '占优势的；主导的', draw: s => {
      return `<g ${s.a(pop(8), ORG(110, 76))}><path d="M110 76L110 26A50 50 0 1 1 62.4 91.5Z" fill="#e2473a"/></g>` +
        `<g ${s.a(pop(14), ORG(110, 76))}><path d="M110 76L62.4 91.5A50 50 0 0 1 80.6 35.5Z" fill="#4a90d0"/></g><g ${s.a(pop(18), ORG(110, 76))}><path d="M110 76L80.6 35.5A50 50 0 0 1 110 26Z" fill="#f2b632"/></g>` +
        `<text x="128" y="96" font-size="14" font-weight="700" text-anchor="middle" fill="#fff" ${s.a(showAt(12))}>70%</text>` +
        [['A 公司 70%', '#e2473a', 10], ['B 公司 20%', '#4a90d0', 16], ['C 公司 10%', '#f2b632', 20]].map(([t, c, p], i) => `<g ${s.a(showAt(p))}><rect x="190" y="${46 + i * 22}" width="12" height="12" fill="${c}"/><text x="208" y="${56 + i * 22}" font-size="10" font-weight="700" ${fl(CL.k)}>${t}</text></g>`).join('') +
        `<g ${s.a(pop(30), ORG(196, 32))}><path d="M184 38l2-12 6 6 4-9 4 9 6-6 2 12z" fill="#f6d34a" style="stroke:#a8741a;stroke-width:1px"/></g>` +
        chip(s, 150, 139, 92, '占大头，说了算', CL.v, 40);
    }},
    // ---------- 第六十二批 ----------
    dominate: {dur: 6, hl: [10, 30], end: 60, lit: '当主人', mean: '支配；占主导', draw: s => {
      const bunny = x => `<ellipse cx="${x}" cy="120" rx="10" ry="8" fill="#b8b0a4"/><circle cx="${x + 9}" cy="112" r="6" fill="#b8b0a4"/><path d="M${x + 7} 106l-2-10M${x + 12} 106l2-10" ${sk('#b8b0a4', 3)}/><circle cx="${x + 11}" cy="111" r="1" fill="${INK}"/>`;
      return GND() + `<path d="M170 128L190 82Q236 62 282 84L296 128z" fill="#9a948c"/>` +
        `<g ${s.a({0: 'transform:scale(1)', 18: 'transform:scale(1)', 22: 'transform:scale(1.1)', 40: 'transform:scale(1.1)', 44: 'transform:scale(1)', 100: 'transform:scale(1)'}, ORG(236, 74))}><ellipse cx="248" cy="74" rx="24" ry="12" fill="#e8a64a"/><circle cx="224" cy="58" r="20" fill="#a8641a"/><circle cx="222" cy="60" r="12" fill="#f2b632"/><circle cx="218" cy="56" r="1.8" fill="${INK}"/><circle cx="226" cy="56" r="1.8" fill="${INK}"/><path d="M216 64q6 6 12 0" fill="#8b2a2a" ${s.a(showAt(20, 40))}/><path d="M270 70q14-4 14-16" ${sk('#e8a64a', 3)}/></g>` +
        `<g ${s.a(showAt(20, 40))}>${[0, 1, 2].map(i => `<path d="M${200 - i * 10} ${50 - i * 6}a${12 + i * 8} ${12 + i * 8} 0 0 0 0 ${24 + i * 12}" ${sk('#d23c2f', 2)}/>`).join('')}</g>` +
        [40, 80, 120].map((x, i) => `<g ${s.a(move([[22 + i * 2, 0, 0], [38 + i * 2, -60 - i * 20, 0]]))}>${bunny(x)}</g>`).join('') +
        chip(s, 236, 24, 52, '我说了算', '#a8641a', 24) + chip(s, 90, 40, 76, '大家都怕它', CL.v, 42);
    }},
    editorial: {dur: 6, hl: [10, 30], end: 60, lit: '编辑部写的', mean: '社论；编辑的', draw: s => {
      return `<rect x="56" y="10" width="190" height="122" rx="2" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><text x="151" y="30" font-size="14" font-weight="700" text-anchor="middle" ${fl(CL.k)}>每 日 报</text><path d="M64 36H238" ${sk(CL.k, 2)}/>` +
        [0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M156 ${50 + i * 11}h76" ${sk(CL.m, 3, .4)}/>`).join('') + `<rect x="156" y="50" width="76" height="30" fill="#cfd8e3"/>` +
        `<text x="104" y="54" font-size="11" font-weight="700" text-anchor="middle" fill="#d23c2f">社论</text>` + [0, 1, 2, 3, 4, 5].map(i => `<path d="M70 ${64 + i * 10}h${i === 5 ? 40 : 66}" ${sk(CL.k, 2.5, .7)} ${DASH} ${s.a(drawP(8 + i * 3, 12 + i * 3))}/>`).join('') +
        `<rect x="64" y="42" width="80" height="80" rx="2" fill="none" style="stroke:#d23c2f;stroke-width:2.5px" ${s.a(showAt(30))}/>` +
        chip(s, 150, 139, 104, '报社自己的观点', '#d23c2f', 36) + chip(s, 270, 60, 44, '本报', CL.v, 30);
    }},
    efficient: {dur: 6, hl: [10, 30], end: 60, lit: '干活又快又好', mean: '高效的', draw: s => {
      const box = (x, y, p) => `<g ${s.a(pop(p), ORG(x + 8, y + 7))}><rect x="${x}" y="${y}" width="16" height="14" fill="#c98a4a" style="stroke:#a0703a;stroke-width:1px"/></g>`;
      return GND() + `<circle cx="150" cy="30" r="16" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><g ${s.a({0: R(0), 10: R(0), 50: R(360), 100: R(360)}, ORG(150, 30))}><path d="M150 30V18" ${sk(CL.k, 2)}/></g><text x="150" y="60" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>同样 1 小时</text>` +
        kid(40, 128, '#9aa8b8', {k: .85}) + box(64, 114, 22) + box(64, 100, 46) +
        kid(186, 128, CL.t, {k: .85}) + [...Array(8)].map((_, i) => box(208 + (i % 4) * 18, 114 - Math.floor(i / 4) * 14, 12 + i * 5)).join('') +
        `<text x="72" y="90" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.m)} ${s.a(showAt(50))}>2 箱</text><text x="235" y="90" font-size="10" font-weight="700" text-anchor="middle" fill="#2f9f55" ${s.a(showAt(50))}>8 箱</text>` +
        chip(s, 236, 66, 64, '又快又好', CL.t, 54);
    }},
    electricity: {dur: 6, hl: [10, 30], end: 60, lit: '电的东西', mean: '电；电力', draw: s => {
      const wire = 'M66 52Q88 64 110 52Q150 66 190 52Q222 64 248 74';
      return GND() + `<rect x="10" y="60" width="56" height="68" fill="#8a96a6"/><rect x="20" y="36" width="12" height="26" fill="#6b7480"/><path d="M42 74l-6 14h6l-4 14 12-18h-6l4-10z" fill="#f6d34a"/><text x="38" y="120" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">电厂</text>` +
        `<path d="M110 128V50M190 128V50M100 54h20M180 54h20" ${sk(WOOD, 3)}/><path d="${wire}" fill="none" ${sk('#333', 1.5)}/>` +
        `<path d="${wire}" fill="none" ${sk('#f6d34a', 3)} stroke-dasharray="4 14" ${s.a({0: 'stroke-dashoffset:0;opacity:0', 8: 'stroke-dashoffset:0;opacity:1', 92: 'stroke-dashoffset:-180;opacity:1', 100: 'stroke-dashoffset:-200;opacity:0'})}/>` +
        `<path d="M226 128V84l26-20 26 20v44z" fill="#f4efe6" style="stroke:var(--ink3);stroke-width:1.5px"/><rect x="238" y="92" width="16" height="14" fill="#6b7480"/><rect x="238" y="92" width="16" height="14" fill="#f6d34a" ${s.a(showAt(28))}/>` +
        `<g ${s.a(showAt(30))}><circle cx="246" cy="99" r="16" fill="#f6d34a" fill-opacity=".25"/></g>` + chip(s, 150, 22, 76, '电送到家里', CL.t, 34) + chip(s, 260, 46, 44, '亮了', CL.a, 30);
    }},
    emerge: {dur: 6, hl: [24, 10], end: 60, lit: '从水下冒出来', mean: '出现；浮现', draw: s => {
      return `<g ${s.a(move([[8, 0, 56], [30, 0, 0]]))}><ellipse cx="150" cy="78" rx="62" ry="14" fill="#f2b632"/><rect x="136" y="52" width="26" height="18" rx="4" fill="#f2b632"/><path d="M150 52V40h10" ${sk('#555', 2.5)}/>` +
        [0, 1, 2].map(i => `<circle cx="${118 + i * 24}" cy="78" r="4" fill="#dff2ff"/>`).join('') + `</g>` +
        `<rect x="0" y="76" width="300" height="74" fill="#2f74b5" fill-opacity=".75"/><path d="M0 76q15-5 30 0t30 0 30 0 30 0 30 0 30 0 30 0 30 0 30 0 30 0" ${sk('#dff2ff', 2)} fill="none"/>` +
        `<g ${s.a(showAt(28, 46))}>${[[-1, 1], [1, 1], [-1.6, .6], [1.6, .6]].map(([dx, k]) => `<circle cx="${150 + dx * 50}" cy="${70 - k * 14}" r="4" fill="#dff2ff"/>`).join('')}</g>` +
        chip(s, 60, 30, 92, '从水下冒出来', CL.t, 32);
    }},
    emphasize: {dur: 6, hl: [10, 30], end: 60, lit: '加重语气说', mean: '强调', draw: s => {
      return `<rect x="96" y="16" width="180" height="112" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/>` +
        [30, 46, 92, 108].map(y => `<path d="M108 ${y}h150" ${sk(CL.m, 4, .3)}/>`).join('') +
        `<text x="108" y="72" font-size="13" font-weight="700" ${fl(CL.k)}>这一句最重要</text>` +
        `<path d="M106 78h104M106 83h104" ${sk('#d23c2f', 2)} ${DASH} ${s.a(drawP(12, 24))}/>` +
        `<g ${s.a(pop(28), ORG(240, 66))}><circle cx="240" cy="66" r="12" fill="none" style="stroke:#d23c2f;stroke-width:2.5px"/><text x="240" y="71" font-size="14" font-weight="700" text-anchor="middle" fill="#d23c2f">!</text></g>` +
        GND(8, 92) + kid(50, 128, '#3d4a5c', {aR: [48, -46]}) + `<path d="M98 82l8-4" ${sk('#d23c2f', 3)}/>` +
        chip(s, 186, 139, 92, '划重点，强调', '#d23c2f', 38);
    }},
    everywhere: {dur: 6, hl: [10, 40], end: 60, lit: '每个地方', mean: '到处', draw: s => {
      const bike = (x, y) => `<circle cx="${x - 6}" cy="${y}" r="4.5" fill="none" style="stroke:#f2b632;stroke-width:1.8px"/><circle cx="${x + 6}" cy="${y}" r="4.5" fill="none" style="stroke:#f2b632;stroke-width:1.8px"/><path d="M${x - 6} ${y}l4-7h6l2 7M${x - 2} ${y - 7}l-1-3" ${sk('#f2b632', 1.8)}/>`;
      const spots = [[40, 40], [92, 30], [150, 44], [210, 30], [262, 42], [60, 84], [120, 92], [180, 80], [240, 94], [36, 124], [150, 128], [270, 124]];
      return `<rect x="0" y="0" width="300" height="150" fill="#e8ecd8"/><path d="M0 62H300M0 108H300M80 0V150M200 0V150" ${sk('#fff', 10)}/>` +
        [['学校', 40, 20], ['公园', 160, 20], ['商店', 250, 76], ['家', 40, 102]].map(([t, x, y]) => `<text x="${x}" y="${y}" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>${t}</text>`).join('') +
        spots.map(([x, y], i) => `<g ${s.a(pop(6 + i * 3), ORG(x, y))}>${bike(x, y)}</g>`).join('') +
        chip(s, 150, 139, 104, '共享单车到处都有', CL.t, 46);
    }},
    excite: {dur: 6, hl: [10, 30], end: 60, lit: '把情绪叫出来', mean: '使兴奋；激发', draw: s => {
      const poses = [{}, {aL: [-18, -64], aR: [18, -64]}];
      const jump = {0: T(), 24: T()}; [24, 34, 44, 54].forEach(p => { jump[p + 4] = T(0, -18); jump[p + 9] = T(); }); jump[100] = T();
      return GND() + `<rect x="176" y="96" width="60" height="32" fill="#e2473a"/><path d="M206 96v32" ${sk('#f6d34a', 5)}/>` +
        `<g ${s.a({0: T(0, 0), 18: T(0, 0), 24: T(10, -40, 'rotate(20deg)'), 92: T(10, -40, 'rotate(20deg)'), 100: T(0, 0)}, ORG(206, 92))}><rect x="172" y="86" width="68" height="12" fill="#c93a2e"/><path d="M206 86v12" ${sk('#f6d34a', 5)}/></g>` +
        `<g ${s.a(pop(24), ORG(206, 80))}><circle cx="206" cy="78" r="13" fill="#c98a4a"/><circle cx="196" cy="66" r="5" fill="#c98a4a"/><circle cx="216" cy="66" r="5" fill="#c98a4a"/><circle cx="202" cy="76" r="1.5" fill="${INK}"/><circle cx="210" cy="76" r="1.5" fill="${INK}"/></g>` +
        `<g ${s.a(jump)}>` + poses.map((o, i) => `<g ${s.a(slot([0, 24, 99], i))}>${kid(100, 128, CL.t, o)}</g>`).join('') + `</g>` +
        `<path d="M10 30h20l6-12 8 24 6-12h20" ${sk('#d23c2f', 2)} ${DASH} ${s.a(drawP(26, 34))}/>` +
        `<g ${s.a(showAt(28))}>${sparkle(70, 50, 6)}${sparkle(134, 44, 5)}${sparkle(244, 60, 5)}</g>` + chip(s, 150, 22, 92, '兴奋得跳起来', CL.a, 34);
    }},
    explanation: {dur: 6, hl: [10, 30], end: 60, lit: '解释的话', mean: '解释；说明', draw: s => {
      const steps = [['水蒸发', 52], ['变成云', 130], ['落下来', 208]];
      return `<rect x="16" y="10" width="236" height="96" rx="4" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><text x="134" y="30" font-size="11" font-weight="700" text-anchor="middle" fill="#d23c2f">为什么会下雨？</text>` +
        steps.map(([t, x], i) => `<g ${s.a(pop(10 + i * 10), ORG(x, 66))}><rect x="${x - 30}" y="54" width="60" height="24" rx="4" fill="${[CL.t, '#5d8fb8', '#2f5d8a'][i]}"/><text x="${x}" y="70" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">${t}</text></g>` + (i < 2 ? `<path d="M${x + 32} 66h12M${x + 40} 62l4 4-4 4" ${sk(CL.k, 2)} ${s.a(showAt(16 + i * 10))}/>` : '')).join('') +
        GND() + kid(272, 128, CL.a, {k: .8}) + `<g ${s.a(pop(42), ORG(272, 50))}><circle cx="272" cy="46" r="9" fill="#f6d34a"/><rect x="268" y="55" width="8" height="5" fill="#9aa8b8"/></g>` +
        chip(s, 134, 128, 76, '原来如此！', CL.v, 46);
    }},
    expose: {dur: 6, hl: [10, 20], end: 60, lit: '放到外面', mean: '暴露；使接触', draw: s => {
      return `<circle cx="262" cy="30" r="18" fill="#f6d34a"/>` + [0, 1, 2, 3, 4].map(i => `<path d="M${244 - i * 4} ${44 + i * 6}L${200 - i * 6} ${70 + i * 8}" ${sk('#f2b632', 2)} ${s.a({0: 'opacity:.3', 50: 'opacity:1', 100: 'opacity:.3'}, `animation-delay:${i * .15}s`, .8)}/>`).join('') +
        GND() + `<path d="M50 128V70" ${sk('#8b5a3a', 7)}/><circle cx="50" cy="52" r="32" fill="#5d9a4a"/><ellipse cx="52" cy="128" rx="42" ry="5" fill="#000" fill-opacity=".12"/>` +
        `<g ${s.a(move([[8, 0, 0], [24, 110, 0]]))}>${kid(60, 128, CL.t, Object.assign({}, walkLegs(s, 60, 128, 8, 24, 4)))}<g ${s.a(showAt(36))}><circle cx="53" cy="80" r="3" fill="#ff7a6a" fill-opacity=".8"/><circle cx="67" cy="80" r="3" fill="#ff7a6a" fill-opacity=".8"/><path d="M74 68q3 4 0 6" ${sk('#6db7e8', 2)}/></g></g>` +
        chip(s, 150, 22, 92, '走出树荫晒太阳', CL.t, 22) + chip(s, 170, 139, 76, '晒得发红', '#d23c2f', 42);
    }},
    extinction: {dur: 6, hl: [10, 30], end: 60, lit: '全都消失了', mean: '灭绝；消亡', draw: s => {
      const dino = x => `<path d="M${x - 26} 120q16-14 30-12q10-10 14-24q6-4 10 0q-4 6-8 8q-2 14-8 22v6h-5v-6h-12v6h-5v-6q-12 2-16 6z" fill="#5d9a4a"/>`;
      return `<rect x="0" y="0" width="300" height="150" fill="#f6e2c0" fill-opacity=".5"/>` + GND() +
        `<g ${s.a((f => { f[22] = T(0, 0) + ';opacity:0'; f[92] = f[22]; f[100] = f[22]; return f; })(moveIn([[6, 170, -96], [20, 0, 0]])))}><circle cx="150" cy="116" r="10" fill="#8b5a3a"/><path d="M158 110l30-20M160 116l34-14" ${sk('#f28a1a', 4)}/></g>` +
        `<rect x="0" y="0" width="300" height="150" fill="#fff" ${s.a({0: 'opacity:0', 20: 'opacity:0', 22: 'opacity:.9', 28: 'opacity:0', 100: 'opacity:0'})}/>` +
        [70, 150, 230].map((x, i) => `<g ${s.a({0: 'opacity:1', [24 + i * 8]: 'opacity:1', [30 + i * 8]: 'opacity:0', 94: 'opacity:0', 100: 'opacity:1'})}>${dino(x)}</g>`).join('') +
        ['还有 3 只', '还有 2 只', '还有 1 只', '一只不剩'].map((t, i) => `<text x="60" y="30" font-size="11" font-weight="700" text-anchor="middle" fill="${i === 3 ? '#d23c2f' : '#555'}" ${s.a(slot([0, 30, 38, 46, 99], i))}>${t}</text>`).join('') +
        chip(s, 236, 30, 64, '恐龙没了', '#d23c2f', 50);
    }},
    fairly: {dur: 6, hl: [10, 30], end: 60, lit: '相当地', mean: '相当；公平地', draw: s => {
      return `<rect x="40" y="62" width="70" height="14" fill="#cfe9c8"/><rect x="110" y="62" width="80" height="14" fill="#9bd04a"/><rect x="190" y="62" width="70" height="14" fill="#3f8f4f"/>` +
        [['有点', 75], ['相当', 150], ['非常', 225]].map(([t, x]) => `<text x="${x}" y="96" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.k)}>${t}</text>`).join('') +
        `<g ${s.a(move([[8, 0, 0], [26, 110, 0]]))}><path d="M40 60l-7-12h14z" fill="#d23c2f"/></g>` +
        `<text x="150" y="36" font-size="12" font-weight="700" text-anchor="middle" fill="#2f5d8a" ${s.a(showAt(30))}>这题相当容易</text>` +
        chip(s, 150, 126, 92, '相当 = 挺…的', CL.t, 40);
    }},
    // ---------- 第六十三批 ----------
    familiar: {dur: 6, hl: [10, 30], end: 60, lit: '熟得像家人', mean: '熟悉的；常见的', draw: s => {
      return GND() + [130, 170, 250, 280].map(x => kid(x, 128, '#c6c0b6', {k: .75, noFace: true})).join('') + kid(210, 128, '#e2473a', {k: .8}) +
        `<circle cx="210" cy="96" r="30" fill="none" style="stroke:#f2b632;stroke-width:3px" ${s.a(pop(20), ORG(210, 96))}/>` +
        kid(60, 128, CL.t, {aR: [24, -62]}) + `<g ${s.a(pop(28), ORG(118, 48))}>${heartAt(118, 44, .9)}</g>` +
        chip(s, 60, 30, 64, '妈妈！', CL.t, 26) + chip(s, 210, 30, 92, '一眼就认出来', '#a8741a', 36);
    }},
    finally: {dur: 6, hl: [10, 30], end: 60, lit: '到了最后', mean: '最后；终于', draw: s => {
      return `<rect x="30" y="18" width="100" height="62" fill="#dff2ff" style="stroke:var(--ink3);stroke-width:3px"/>` +
        `<rect x="32" y="20" width="96" height="58" fill="#1d2440" ${s.a({0: 'opacity:0', 10: 'opacity:0', 12: 'opacity:1', 20: 'opacity:1', 22: 'opacity:0', 30: 'opacity:0', 32: 'opacity:1', 40: 'opacity:1', 42: 'opacity:0', 100: 'opacity:0'})}/>` +
        `<circle cx="80" cy="46" r="12" fill="#f6d34a" ${s.a({0: 'opacity:1', 10: 'opacity:1', 12: 'opacity:0', 20: 'opacity:0', 22: 'opacity:1', 30: 'opacity:1', 32: 'opacity:0', 40: 'opacity:0', 42: 'opacity:1', 100: 'opacity:1'})}/>` +
        `<path d="M86 38a12 12 0 1 0 6 18a10 10 0 1 1-6-18z" fill="#f6e7a8" ${s.a({0: 'opacity:0', 10: 'opacity:0', 12: 'opacity:1', 20: 'opacity:1', 22: 'opacity:0', 30: 'opacity:0', 32: 'opacity:1', 40: 'opacity:1', 42: 'opacity:0', 100: 'opacity:0'})}/>` +
        ['第 1 天', '第 2 天', '第 3 天'].map((t, i) => `<text x="80" y="96" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(slot([0, 22, 42, 99], i))}>${t}</text>`).join('') +
        GND() + `<rect x="230" y="60" width="50" height="68" fill="#8b5a3a"/><circle cx="270" cy="96" r="2.5" fill="#f2b632"/>` +
        `<g ${s.a({0: T(), 48: T(), 52: T(0, -14), 56: T(), 60: T(0, -10), 64: T(), 100: T()})}>${kid(170, 128, CL.t, {k: .9})}</g>` +
        `<g ${s.a(moveIn([[44, 320, 0], [50, 0, 0]]))}><rect x="198" y="106" width="28" height="22" fill="#c98a4a" style="stroke:#a0703a;stroke-width:1px"/><path d="M198 114h28M212 106v22" ${sk('#a0703a', 1.5)}/></g>` +
        chip(s, 200, 30, 76, '终于到了！', CL.a, 52);
    }},
    funding: {dur: 6, hl: [10, 30], end: 60, lit: '拨下来的钱', mean: '资金；拨款', draw: s => {
      const bag = `<path d="M-10 -6q-6 8 0 16h20q6-8 0-16l-4-6h-12z" fill="#f2b632" style="stroke:#a8741a;stroke-width:1px"/><text x="0" y="7" font-size="8" font-weight="700" text-anchor="middle" fill="#8b5a1a">元</text>`;
      return GND() + `<path d="M10 52L45 34L80 52z" fill="#d8dde3" style="stroke:var(--ink3);stroke-width:1px"/><rect x="14" y="52" width="62" height="76" fill="#eef1f4" style="stroke:var(--ink3);stroke-width:1px"/>` + [24, 40, 56, 66].map(x => `<path d="M${x} 58V124" ${sk('#c6d0da', 4)}/>`).join('') + `<text x="45" y="48" font-size="8" font-weight="700" text-anchor="middle" fill="#d23c2f">政府</text>` +
        `<rect x="210" y="56" width="80" height="72" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><text x="250" y="72" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>实验室</text>` +
        `<path d="M242 82v14l-12 24h40l-12-24V82z" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M234 112l-4 8h40l-4-8z" fill="#3fbf6a" ${s.a(growY(34, 46), FOOT)}/>` +
        `<g ${s.a(showAt(44))}>${[0, 1, 2].map(i => `<circle cx="${244 + i * 6}" cy="${102 - i * 6}" r="2.5" fill="#3fbf6a" fill-opacity=".7"/>`).join('')}</g>` +
        [0, 1, 2].map(i => `<g ${s.a((f => { f[24 + i * 6] = T(220, 110) + ';opacity:0'; f[92] = f[24 + i * 6]; return f; })(moveIn([[8 + i * 6, 86, 110], [22 + i * 6, 220, 110]])))}>${bag}</g>`).join('') +
        chip(s, 150, 30, 64, '政府拨款', '#d23c2f', 10) + chip(s, 150, 60, 92, '研究有钱做了', CL.t, 46);
    }},
    harmful: {dur: 6, hl: [10, 30], end: 60, lit: '带来伤害的', mean: '有害的', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#1d2440"/><path d="M0 128H300" ${sk('#3a4466', 2)}/>` +
        `<path d="M140 88L104 70L104 96z" fill="#6fe3ff" fill-opacity=".25"/>` + kid(100, 128, CL.t, {aR: [36, -40], noFace: true}) + face(100, 128, 1, 'sad') +
        `<rect x="134" y="80" width="12" height="20" rx="2" fill="#6fe3ff"/>` +
        `<g ${s.a(showAt(24))}><path d="M90 74l-4-2M90 76l-5 1M110 74l4-2M110 76l5 1" ${sk('#ff5a4a', 1.5)}/></g>` +
        `<text x="240" y="30" font-size="11" font-weight="700" text-anchor="middle" fill="#f6d34a">凌晨 2 点</text>` +
        `<text x="214" y="64" font-size="9" font-weight="700" fill="#dff2ff">眼睛</text><rect x="214" y="70" width="64" height="10" rx="2" fill="none" style="stroke:#dff2ff;stroke-width:1px"/>` +
        `<rect x="215" y="71" width="62" height="8" rx="1" ${s.a({0: 'transform:scaleX(1);fill:#3fbf6a', 10: 'transform:scaleX(1);fill:#3fbf6a', 44: 'transform:scaleX(.2);fill:#e2473a', 92: 'transform:scaleX(.2);fill:#e2473a', 100: 'transform:scaleX(1);fill:#3fbf6a'}, ORG(215, 75))}/>` +
        chip(s, 236, 110, 84, '对眼睛有害', '#d23c2f', 40);
    }},
    highlight: {dur: 6, hl: [10, 24], end: 60, lit: '打上高光', mean: '强调；突出', draw: s => {
      return `<rect x="40" y="16" width="220" height="112" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/>` +
        [32, 48, 96, 112].map(y => `<path d="M54 ${y}h190" ${sk(CL.m, 4, .3)}/>`).join('') +
        `<rect x="52" y="62" width="150" height="20" fill="#f6e94a" fill-opacity=".8" ${s.a(growX(10, 26), ORG(52, 72))}/>` +
        `<text x="56" y="77" font-size="13" font-weight="700" ${fl(CL.k)}>最精彩的一句</text>` +
        `<g ${s.a(move([[8, 52, 70], [26, 202, 70]]))}><g transform="rotate(-35)"><rect x="-4" y="-34" width="10" height="30" rx="2" fill="#f6d34a" style="stroke:#a8741a;stroke-width:1px"/><path d="M-4 -4h10l-3 6h-4z" fill="#f2b632"/></g></g>` +
        chip(s, 230, 140, 92, '涂亮，最显眼', '#a8741a', 32);
    }},
    inevitable: {dur: 6, hl: [10, 20, 30], end: 60, lit: '躲不开的', mean: '不可避免的', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#c9d4de" fill-opacity=".45"/>` + GND() +
        [...Array(26)].map((_, i) => `<path d="M${(i * 47) % 290 + 5} 0v10" ${sk('#6db7e8', 2)} ${s.a({0: T(0, -12), 100: T(0, 142)}, `animation-delay:${(((i * .618) % 1) * .9).toFixed(2)}s;animation-timing-function:linear`, .9)}/>`).join('') +
        `<g ${s.a(move([[6, 0, 0], [16, 80, 0], [26, -20, 0], [36, 60, 0], [44, 60, 0]]))}>${kid(110, 128, CL.t, Object.assign({noFace: true}, walkLegs(s, 110, 128, 6, 36, 8)))}<g ${s.a(hideAt(40))}>${face(110, 128, 1)}</g><g ${s.a(showAt(40))}>${face(110, 128, 1, 'sad')}<path d="M102 62q2 4 0 6M118 62q2 4 0 6" ${sk('#6db7e8', 2)}/></g></g>` +
        chip(s, 150, 30, 104, '怎么躲都躲不掉', '#2f5d8a', 44);
    }},
    inform: {dur: 6, hl: [10, 24], end: 60, lit: '把消息塑进你脑中', mean: '通知；告知', draw: s => {
      return GND() + kid(80, 128, CL.t, {aR: [26, -40]}) + `<rect x="160" y="16" width="80" height="112" rx="10" fill="#2a2f3a"/><rect x="166" y="26" width="68" height="92" rx="3" fill="#eef4fa"/>` +
        `<svg x="166" y="26" width="68" height="92" viewBox="166 26 68 92"><g ${s.a(move([[10, 0, -40], [16, 0, 0]]))}><rect x="168" y="30" width="64" height="30" rx="4" fill="#fff" style="stroke:#9aa8b8;stroke-width:1px"/><text x="174" y="42" font-size="8" font-weight="700" fill="#d23c2f">通知</text><text x="174" y="54" font-size="8" ${fl(CL.k)}>明天停水</text></g></svg>` +
        `<g ${s.a(showAt(14, 28))}>${[0, 1].map(i => `<path d="M${246 + i * 6} ${30 - i * 4}a${8 + i * 6} ${8 + i * 6} 0 0 1 0 ${16 + i * 12}" ${sk('#f2b632', 2)}/>`).join('')}</g>` +
        chip(s, 60, 30, 76, '告诉你一声', CL.v, 28) + chip(s, 272, 90, 44, '叮！', '#f28a1a', 12);
    }},
    inside: {dur: 6, hl: [10, 24], end: 60, lit: '在里边', mean: '在…里面；内部', draw: s => {
      return GND() + `<g ${s.a(move([[24, 0, 0], [34, 0, -26]]))}><circle cx="150" cy="96" r="13" fill="#9aa8b8"/><path d="M140 88l2-12 7 7zM160 88l-2-12-7 7z" fill="#9aa8b8"/><circle cx="145" cy="95" r="1.8" fill="${INK}"/><circle cx="155" cy="95" r="1.8" fill="${INK}"/><path d="M147 101q3 2 6 0" ${sk(INK, 1)}/></g>` +
        `<rect x="110" y="90" width="80" height="38" fill="#c98a4a" style="stroke:#a0703a;stroke-width:1.5px"/>` +
        `<g ${s.a({0: R(0), 8: R(0), 18: R(-120), 92: R(-120), 100: R(0)}, ORG(110, 90))}><rect x="110" y="84" width="80" height="7" fill="#a0703a"/></g>` +
        `<g ${s.a(showAt(14))}><path d="M230 60Q200 60 180 84M180 84l2-10M180 84l9-4" ${sk(CL.v, 2)}/><text x="240" y="56" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.v)}>里面</text></g>` +
        kid(50, 128, CL.t, {k: .85}) + chip(s, 150, 30, 92, '原来在箱子里', CL.t, 38);
    }},
    internal: {dur: 6, hl: [10, 24], end: 60, lit: '里面的', mean: '内部的；国内的', draw: s => {
      const gear = (x, y, r, c, d) => `<g ${s.a({0: R(0), 100: R(d)}, ORG(x, y) + ';animation-timing-function:linear', 3)}><circle cx="${x}" cy="${y}" r="${r}" fill="none" style="stroke:${c};stroke-width:7px" stroke-dasharray="5 4"/><circle cx="${x}" cy="${y}" r="${r - 4}" fill="${c}"/><circle cx="${x}" cy="${y}" r="3" fill="#fff"/></g>`;
      return `<circle cx="150" cy="74" r="50" fill="#f4efe6" style="stroke:#8b5a3a;stroke-width:5px"/>` +
        gear(132, 62, 18, '#c9a06a', 360) + gear(166, 86, 14, '#9aa8b8', -360) + gear(160, 50, 9, '#e2473a', -360) +
        `<g ${s.a({0: 'opacity:1;' + T(0, 0), 12: 'opacity:1;' + T(0, 0), 24: 'opacity:0;' + T(90, 0), 92: 'opacity:0;' + T(90, 0), 100: 'opacity:1;' + T(0, 0)})}><circle cx="150" cy="74" r="46" fill="#fff"/><path d="M150 74V42M150 74l20 10" ${sk(CL.k, 3)}/>${[0, 90, 180, 270].map(a => `<circle cx="${f1(150 + 38 * Math.cos(a * Math.PI / 180))}" cy="${f1(74 + 38 * Math.sin(a * Math.PI / 180))}" r="2.5" fill="${CL.k}"/>`).join('')}</g>` +
        chip(s, 60, 30, 76, '打开看里面', CL.t, 24) + chip(s, 150, 139, 76, '内部的结构', CL.v, 36);
    }},
    kilometer: {dur: 6, hl: [8, 20], end: 60, lit: '一千米', mean: '千米；公里', draw: s => {
      return `<path d="M30 112H270" ${sk('#9aa8b8', 10)}/><path d="M30 112H270" ${sk('#fff', 1.5)} stroke-dasharray="6 6"/>` +
        `<path d="M30 112H40" ${sk('#e2473a', 10)} ${s.a(showAt(6))}/><text x="35" y="136" font-size="9" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(showAt(6))}>1 米</text>` +
        `<text x="150" y="40" font-size="16" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(pop(16), ORG(150, 34))}>1 米 × 1000</text>` +
        `<path d="M270 112V76" ${sk('#555', 2.5)}/><rect x="244" y="62" width="52" height="16" rx="2" fill="${CL.t}"/><text x="270" y="74" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">1 千米</text>` +
        `<g ${s.a(move([[20, 0, 0], [64, 200, 0]]))}>${kid(40, 107, CL.a, Object.assign({k: .6}, walkLegs(s, 40, 107, 20, 64, 10, .6)))}</g>` +
        chip(s, 150, 70, 92, '跑完 1 公里', CL.t, 60);
    }},
    largely: {dur: 6, hl: [10, 30], end: 60, lit: '很大程度上', mean: '主要地', draw: s => {
      return `<text x="150" y="34" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.k)}>考得好的原因</text>` +
        `<rect x="40" y="56" width="176" height="28" fill="${CL.t}" ${s.a(growX(10, 26), ORG(40, 70))}/><rect x="216" y="56" width="44" height="28" fill="#f2b632" ${s.a(growX(28, 36), ORG(216, 70))}/>` +
        `<text x="128" y="75" font-size="11" font-weight="700" text-anchor="middle" fill="#fff" ${s.a(showAt(24))}>努力 80%</text><text x="238" y="75" font-size="9" font-weight="700" text-anchor="middle" fill="#7a5a10" ${s.a(showAt(34))}>运气</text>` +
        `<path d="M40 92H216" ${sk(CL.t, 2)} ${s.a(showAt(40))}/><path d="M40 88v8M216 88v8" ${sk(CL.t, 2)} ${s.a(showAt(40))}/>` +
        chip(s, 128, 116, 92, '主要靠努力', CL.t, 44);
    }},
    literature: {dur: 6, hl: [10, 30], end: 60, lit: '用文字写成的', mean: '文学；文献', draw: s => {
      const books = [['诗', '#2f5d8a'], ['小说', '#e2473a'], ['戏剧', '#3f8f4f'], ['散文', '#8e6bd0']];
      return GND() + `<rect x="10" y="28" width="70" height="100" fill="#c9a06a"/><path d="M10 62H80M10 96H80" ${sk('#8b5a3a', 3)}/>` +
        books.map(([t, c], i) => `<g ${s.a(pop(6 + i * 4), ORG(22 + (i % 2) * 34, 50 + Math.floor(i / 2) * 34))}><rect x="${14 + (i % 2) * 34}" y="${32 + Math.floor(i / 2) * 34}" width="28" height="28" fill="${c}"/><text x="${28 + (i % 2) * 34}" y="${50 + Math.floor(i / 2) * 34}" font-size="${t.length > 1 ? 8 : 10}" font-weight="700" text-anchor="middle" fill="#fff">${t}</text></g>`).join('') +
        kid(160, 128, CL.t, {aL: [-14, -32], aR: [14, -32]}) + `<path d="M144 96q8-4 16 0q8-4 16 0v14q-8-4-16 0q-8-4-16 0z" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/>` +
        ['月', '风', '花', '雪'].map((t, i) => `<text x="${150 + i * 10}" y="92" font-size="12" font-weight="700" fill="#8e6bd0" ${s.a({0: 'opacity:0;' + T(0, 0), 20: 'opacity:1;' + T(i * 8 - 12, -20), 100: 'opacity:0;' + T(i * 16 - 24, -60)}, `animation-delay:${(i * .4).toFixed(1)}s`, 1.8)}>${t}</text>`).join('') +
        chip(s, 240, 40, 84, '文字的艺术', CL.v, 30) + chip(s, 240, 100, 76, '文学作品', CL.a, 44);
    }},
    // ---------- 第六十四批 ----------
    makeup: {dur: 6, hl: [10, 30], end: 60, lit: '画上去弄好看', mean: '化妆品；组成', draw: s => {
      return `<circle cx="150" cy="72" r="44" fill="${SKIN}"/><path d="M106 70Q106 22 150 24Q194 22 194 70Q186 42 150 40Q114 42 106 70z" fill="${HAIR}"/>` +
        `<circle cx="134" cy="66" r="3.5" fill="${INK}"/><circle cx="166" cy="66" r="3.5" fill="${INK}"/><path d="M142 96q8 4 16 0" ${sk('#b07a5a', 2)}/>` +
        `<g ${s.a(fadeP(16, 26))}><ellipse cx="124" cy="84" rx="9" ry="6" fill="#f48fb1" fill-opacity=".7"/><ellipse cx="176" cy="84" rx="9" ry="6" fill="#f48fb1" fill-opacity=".7"/></g>` +
        `<path d="M140 95q10 8 20 0q-10 3-20 0z" fill="#e2473a" ${s.a(fadeP(34, 40))}/>` +
        `<g ${s.a(move([[6, 130, 40], [14, 0, 0], [24, 0, 0], [30, 130, 40]]))}><path d="M124 84l36 34" ${sk('#8b5a3a', 3)}/><ellipse cx="122" cy="82" rx="6" ry="4" fill="#f48fb1" transform="rotate(45 122 82)"/></g>` +
        `<g ${s.a(moveIn([[28, 90, 30], [36, 0, 0], [44, 0, 0], [50, 90, 30]]))}><rect x="152" y="96" width="8" height="10" fill="#e2473a" transform="rotate(30 156 101)"/><rect x="154" y="104" width="10" height="16" fill="#f2b632" transform="rotate(30 159 112)"/></g>` +
        `<g ${s.a(showAt(42))}>${sparkle(108, 40, 6)}${sparkle(196, 46, 5)}</g>` + chip(s, 60, 30, 64, '化化妆', CL.a, 20) + chip(s, 240, 130, 64, '化妆品', '#e2473a', 46);
    }},
    meanwhile: {dur: 6, hl: [10, 30], end: 60, lit: '在此期间', mean: '与此同时', draw: s => {
      return `<path d="M150 40V128" ${sk(CL.m, 1.5)} stroke-dasharray="4 4"/>` + GND() +
        `<circle cx="150" cy="22" r="14" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><path d="M150 22V13M150 22l6 3" ${sk(CL.k, 2)}/><text x="176" y="26" font-size="10" font-weight="700" ${fl(CL.k)}>7:00</text>` +
        kid(50, 128, '#e2473a', {k: 1.05, aR: [30, -40]}) + `<rect x="80" y="98" width="50" height="30" fill="#9aa8b8"/><path d="M82 92h28" ${sk('#333', 5)}/><path d="M110 92h14" ${sk('#333', 3)}/>` +
        [0, 1, 2].map(i => `<path d="M${88 + i * 8} 86q-3-5 0-10t0-10" ${sk('#b8b0a4', 1.5)} ${s.a({0: 'opacity:0;' + T(0, 4), 50: 'opacity:.8;' + T(0, 0), 100: 'opacity:0;' + T(0, -8)}, `animation-delay:${i * .4}s`, 1.3)}/>`).join('') +
        kid(230, 128, CL.t, {k: .85, aR: [26, -34]}) + `<rect x="194" y="100" width="90" height="6" fill="${WOOD}"/><path d="M204 106v22M274 106v22" ${sk(WOOD, 3)}/><rect x="248" y="94" width="22" height="6" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/>` +
        `<g ${s.a({0: T(0, 0), 25: T(8, 0), 50: T(0, 0), 75: T(8, 0), 100: T(0, 0)}, '', 1)}><path d="M252 94l2-10" ${sk('#2f5d8a', 2)}/></g>` +
        `<text x="75" y="52" font-size="10" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(showAt(8))}>妈妈在做饭</text><text x="225" y="52" font-size="10" font-weight="700" text-anchor="middle" fill="${CL.t}" ${s.a(showAt(16))}>我在写作业</text>` +
        chip(s, 150, 139, 76, '与此同时', CL.v, 28);
    }},
    native: {dur: 6, hl: [10, 30], end: 60, lit: '出生在这里的', mean: '本地的；本国的', draw: s => {
      const bamboo = x => `<path d="M${x} 128V20" ${sk('#5d9a4a', 6)}/>` + [40, 70, 100].map(y => `<path d="M${x - 4} ${y}h8" ${sk('#3f7a3a', 2)}/><path d="M${x} ${y}q12-6 20-2q-10 6-20 2z" fill="#6fae5a"/>`).join('');
      return `<rect x="0" y="0" width="300" height="150" fill="#eaf6e0" fill-opacity=".6"/>` + GND() + bamboo(30) + bamboo(60) + bamboo(250) +
        `<ellipse cx="150" cy="108" rx="34" ry="22" fill="#fff" style="stroke:#ccc;stroke-width:1px"/><circle cx="150" cy="74" r="20" fill="#fff" style="stroke:#ccc;stroke-width:1px"/><circle cx="134" cy="58" r="7" fill="#222"/><circle cx="166" cy="58" r="7" fill="#222"/>` +
        `<ellipse cx="142" cy="72" rx="5" ry="6" fill="#222"/><ellipse cx="158" cy="72" rx="5" ry="6" fill="#222"/><circle cx="142" cy="72" r="1.5" fill="#fff"/><circle cx="158" cy="72" r="1.5" fill="#fff"/><ellipse cx="150" cy="82" rx="3" ry="2" fill="#222"/>` +
        `<path d="M122 104q-10-10 4-22M178 104q10-10-4-22" ${sk('#222', 10)} stroke-linecap="round"/><path d="M126 120h10M164 120h10" ${sk('#222', 10)} stroke-linecap="round"/>` +
        `<g ${s.a({0: R(0), 25: R(-8), 50: R(0), 75: R(-8), 100: R(0)}, ORG(186, 84), 1)}><path d="M180 90L206 40" ${sk('#5d9a4a', 4)}/><path d="M206 40q8-4 14 0" ${sk('#6fae5a', 4)}/></g>` +
        `<g ${s.a(pop(20), ORG(240, 140))}><rect x="208" y="130" width="64" height="18" rx="3" fill="#d23c2f"/><text x="240" y="143" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">原产中国</text></g>` +
        chip(s, 150, 22, 92, '土生土长的', CL.t, 36);
    }},
    ordinary: {dur: 6, hl: [10, 30], end: 60, lit: '照常规来的', mean: '普通的', draw: s => {
      const apple = (x, y, c = '#e2473a') => `<circle cx="${x}" cy="${y}" r="10" fill="${c}"/><path d="M${x} ${y - 10}q2-4 5-4" ${sk('#3f8f4f', 2)}/>`;
      return GND() + `<ellipse cx="130" cy="122" rx="70" ry="7" fill="#c9a06a"/>` + [80, 105, 130, 155, 180].map((x, i) => i === 2 ? `<g ${s.a(move([[10, 0, 0], [20, -50, -40]]))}>${apple(x, 110)}</g>` : apple(x, 110)).join('') +
        kid(46, 128, CL.t, {k: .9, aR: [32, -54]}) +
        `<text x="80" y="40" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.m)} ${s.a(showAt(22))}>一个普通苹果</text>` +
        `<g ${s.a(pop(40), ORG(252, 96))}><circle cx="252" cy="96" r="22" fill="#f6d34a" fill-opacity=".3"/>${apple(252, 96, '#f2b632')}</g><g ${s.a(showAt(42))}>${sparkle(232, 72, 6)}${sparkle(274, 78, 5)}<text x="252" y="138" font-size="9" font-weight="700" text-anchor="middle" fill="#a8741a">这个才不普通</text></g>` +
        chip(s, 220, 30, 76, '跟别的一样', CL.v, 26);
    }},
    overcome: {dur: 6, hl: [10, 30], end: 60, lit: '越过去', mean: '克服；战胜', draw: s => {
      const poses = [{aL: [-10, -50], aR: [12, -56]}, {aL: [-18, -64], aR: [18, -64]}];
      return GND() + `<rect x="140" y="58" width="34" height="70" fill="#9a948c" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M140 82h34M140 106h34M157 58v24M150 82v24M165 106v22" ${sk('#7a746c', 1.5)}/>` +
        `<text x="157" y="52" font-size="11" font-weight="700" text-anchor="middle" fill="#d23c2f">困难</text>` +
        `<g ${s.a(move([[6, 0, 0], [16, 54, 0], [28, 80, -70], [36, 106, -70], [46, 150, 0]]))}>` + poses.map((o, i) => `<g ${s.a(slot([0, 46, 99], i))}>${kid(60, 128, CL.t, o)}</g>`).join('') + `</g>` +
        `<g ${s.a(showAt(48))}>${sparkle(190, 60, 6)}${sparkle(236, 54, 5)}</g>` + chip(s, 230, 30, 64, '翻过去了', CL.t, 48);
    }},
    participate: {dur: 6, hl: [10, 24, 40], end: 60, lit: '拿一份去做', mean: '参加；参与', draw: s => {
      const lean = {0: T(0, 0), 50: T(-3, 0), 100: T(0, 0)};
      return GND() + `<g ${s.a(lean, '', .8)}><path d="M0 92H232" ${sk('#c9a06a', 4)}/>` + [100, 140, 180].map((x, i) => kid(x, 128, ['#e2473a', '#4a90d0', '#3fbf6a'][i], {k: .85, aL: [-14, -36], aR: [10, -36]})).join('') + `</g>` +
        `<g ${s.a(move([[6, 60, 0], [22, 0, 0]]))}>${kid(220, 128, CL.t, Object.assign({k: .85, aL: [-14, -36], aR: [8, -36]}, walkLegs(s, 220, 128, 6, 22, 4, .85)))}</g>` +
        chip(s, 236, 40, 76, '我也参加！', CL.t, 14) + chip(s, 120, 30, 76, '出一份力', CL.v, 36);
    }},
    password: {dur: 6, hl: [10, 30], end: 60, lit: '说对才放行的话', mean: '密码；口令', draw: s => {
      return `<rect x="96" y="12" width="84" height="124" rx="8" fill="#2a2f3a"/><rect x="104" y="20" width="68" height="20" rx="3" fill="#eef4fa"/>` +
        [0, 1, 2, 3].map(i => `<circle cx="${116 + i * 15}" cy="30" r="4" fill="none" style="stroke:#9aa8b8;stroke-width:1.2px"/><circle cx="${116 + i * 15}" cy="30" r="4" fill="${CL.k}" ${s.a(pop(10 + i * 6), ORG(116 + i * 15, 30))}/>`).join('') +
        [...Array(9)].map((_, i) => { const x = 116 + (i % 3) * 22, y = 58 + Math.floor(i / 3) * 24, hit = [1, 5, 3, 8].indexOf(i); return `<circle cx="${x}" cy="${y}" r="8" fill="#4a5262"/>` + (hit >= 0 ? `<circle cx="${x}" cy="${y}" r="8" fill="#6fe3ff" ${s.a({0: 'opacity:0', [9 + hit * 6]: 'opacity:0', [10 + hit * 6]: 'opacity:1', [13 + hit * 6]: 'opacity:0', 100: 'opacity:0'})}/>` : '') + `<text x="${x}" y="${y + 3}" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">${i + 1}</text>`; }).join('') +
        `<g ${s.a(move([[34, 0, 0], [40, 0, -10]]))}><path d="M228 70V58a14 14 0 0 1 28 0v12" ${sk('#555', 5)} fill="none"/></g><rect x="222" y="70" width="40" height="34" rx="4" ${s.a({0: 'fill:#9aa8b8', 34: 'fill:#9aa8b8', 38: 'fill:#3fbf6a', 92: 'fill:#3fbf6a', 100: 'fill:#9aa8b8'})}/>` +
        chip(s, 242, 126, 76, '对了，放行', '#2f9f55', 40) + chip(s, 46, 40, 64, '输密码', CL.v, 8);
    }},
    poverty: {dur: 6, hl: [10, 30], end: 60, lit: '穷的状态', mean: '贫困；贫穷', draw: s => {
      const bag = `<rect x="-14" y="-16" width="28" height="30" rx="4" fill="#f4efe6" style="stroke:#c9a06a;stroke-width:1.5px"/><text x="0" y="4" font-size="9" font-weight="700" text-anchor="middle" fill="#a8741a">米</text>`;
      return GND() + `<path d="M40 128V70h120v58z" fill="#b59a72"/><path d="M30 72L100 40L170 72z" fill="#8a7a62"/><path d="M110 50l14 6-6 8z" fill="#fff"/>` +
        [0, 1, 2].map(i => `<path d="M${200 + i * 10} ${40 + i * 14}h40" ${sk('#b8c6d4', 2)} ${s.a({0: T(0, 0) + ';opacity:0', 30: 'opacity:1', 100: T(-60, 0) + ';opacity:0'}, `animation-delay:${i * .3}s`, 1.5)}/>`).join('') +
        kid(100, 128, '#9a8f80', {k: .8}) + `<rect x="94" y="102" width="8" height="8" fill="#c9b8a0"/>` + `<path d="M120 118q10 10 20 0z" fill="#d8dde3" style="stroke:#9aa8b8;stroke-width:1px"/>` +
        `<text x="130" y="112" font-size="8" font-weight="700" text-anchor="middle" fill="#888" ${s.a(showAt(10))}>空碗</text>` +
        `<g ${s.a(moveIn([[40, 320, 0], [52, 0, 0]]))}><g transform="translate(220 112)">${bag}</g>${kid(260, 128, '#e2473a', {k: .8, aL: [-24, -24]})}</g>` +
        chip(s, 100, 22, 76, '缺吃少穿', '#888', 20) + chip(s, 240, 30, 76, '扶贫：帮一把', '#d23c2f', 54);
    }},
    president: {dur: 6, hl: [10, 30], end: 60, lit: '坐在前面主持的人', mean: '总统；校长', draw: s => {
      const flag = x => `<path d="M${x} 128V30" ${sk('#9aa8b8', 2)}/><path d="M${x} 30h28v18h-28z" fill="#d23c2f"/>${star5(x + 7, 37, 4, 1.6, '#f6d34a')}`;
      return GND() + flag(40) + flag(232) + kid(150, 116, '#2a2f3a', {k: 1.05, aR: [16, -50]}) +
        `<path d="M110 90h80l-6 38h-68z" fill="#8b5a3a"/><circle cx="150" cy="106" r="9" fill="#f2b632"/>${star5(150, 106, 6, 2.5, '#d23c2f')}` +
        `<path d="M166 90V70" ${sk('#333', 2)}/><rect x="163" y="62" width="6" height="10" rx="3" fill="#333"/>` +
        `<g ${s.a(showAt(12))}>${[0, 1].map(i => `<path d="M${180 + i * 8} ${56 - i * 4}a${8 + i * 6} ${8 + i * 6} 0 0 1 0 ${16 + i * 10}" ${sk('#f2b632', 2)}/>`).join('')}</g>` +
        [70, 100, 200, 230, 260].map(x => `<circle cx="${x}" cy="146" r="9" fill="${HAIR}"/>`).join('') +
        chip(s, 70, 70, 76, '总统讲话', CL.a, 20) + chip(s, 240, 80, 76, '主持大局', CL.v, 36);
    }},
    primitive: {dur: 6, hl: [10, 30], end: 60, lit: '最初的', mean: '原始的；简陋的', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#5a4632"/><path d="M0 150V60Q150 -20 300 60V150z" fill="#8b7355"/>` +
        `<path d="M200 50l10-6 14 0 8 6-6 4h-20zM206 54l-2 8M226 54l2 8" ${sk('#d23c2f', 2)} fill="none"/><text x="216" y="74" font-size="8" fill="#e8d6ae">壁画</text>` +
        GND() + kid(90, 128, '#a0703a', {k: .95, aL: [26, -28], aR: [40, -28]}) + `<path d="M76 92l28 10" ${sk('#6b4f34', 6)}/>` +
        `<path d="M116 122h60" ${sk('#6b4f34', 6)}/><g ${s.a({0: R(-6), 25: R(6), 50: R(-6), 75: R(6), 100: R(-6)}, ORG(140, 118), .3)}><path d="M140 118V84" ${sk('#c9a06a', 4)}/></g>` +
        `<g ${s.a(showAt(20, 34))}>${[0, 1].map(i => `<path d="M${136 + i * 8} 112q-3-6 0-12t0-12" ${sk('#ccc', 1.5)}/>`).join('')}</g>` +
        `<g ${s.a(pop(34), ORG(150, 118))}><circle cx="150" cy="108" r="24" fill="#f6d34a" fill-opacity=".3"/><path d="M150 120q-12-12 0-30q2 10 8 12q2-8-2-14q12 14 4 32z" fill="#f28a1a"/><path d="M150 120q-5-6 0-14q5 8 0 14z" fill="#f6d34a"/></g>` +
        chip(s, 150, 22, 92, '钻木取火', '#f28a1a', 38);
    }},
    privilege: {dur: 6, hl: [10, 30], end: 60, lit: '只给个人的法', mean: '特权；荣幸', draw: s => {
      return `<path d="M0 64H300" ${sk('#d8dde3', 4)}/><rect x="0" y="34" width="300" height="28" fill="#c93a3a" fill-opacity=".85"/><rect x="190" y="12" width="90" height="20" rx="3" fill="#f2b632"/><text x="235" y="26" font-size="10" font-weight="700" text-anchor="middle" fill="#7a4a00">贵宾通道</text>` +
        GND() + [60, 90, 120, 150, 180].map(x => kid(x, 128, '#b8b0a4', {k: .7})).join('') + `<text x="120" y="80" font-size="9" font-weight="700" text-anchor="middle" fill="#888">排长队…</text>` +
        `<g ${s.a(move([[6, 0, 0], [40, 230, 0]]))}>${kid(20, 62, '#2a2f3a', Object.assign({k: .6, aR: [14, -20]}, walkLegs(s, 20, 62, 6, 40, 8, .6)))}<rect x="34" y="44" width="10" height="7" rx="1" fill="#f2b632"/></g>` +
        chip(s, 236, 100, 76, '只有他能走', '#a8741a', 30) + chip(s, 236, 124, 52, '特权', '#d23c2f', 44);
    }},
    procedure: {dur: 6, hl: [10, 20, 40], end: 60, lit: '按步骤办事', mean: '程序；手续', draw: s => {
      const steps = ['挂号', '看病', '交费', '拿药'], xs = [42, 112, 182, 252];
      return steps.map((t, i) => `<rect x="${xs[i] - 26}" y="24" width="52" height="26" rx="4" fill="#fff" style="stroke:${CL.t};stroke-width:2px"/><text x="${xs[i]}" y="41" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.t)}>${t}</text>` +
        (i < 3 ? `<path d="M${xs[i] + 28} 37h14M${xs[i] + 38} 33l4 4-4 4" ${sk(CL.m, 2)}/>` : '') + `<g ${s.a(pop(16 + i * 12), ORG(xs[i] + 22, 24))}><circle cx="${xs[i] + 22}" cy="24" r="7" fill="#3fbf6a"/><path d="M${xs[i] + 19} 24l2 2 4-4" ${sk('#fff', 1.8)}/></g>`).join('') +
        GND() + `<g ${s.a(move([[6, 0, 0], [12, 0, 0], [18, 70, 0], [24, 70, 0], [30, 140, 0], [36, 140, 0], [42, 210, 0]]))}>${kid(42, 128, CL.t, Object.assign({k: .85}, walkLegs(s, 42, 128, 6, 42, 8, .85)))}</g>` +
        chip(s, 150, 76, 92, '按程序一步步来', CL.v, 54);
    }},
    // ---------- 第六十五批 ----------
    prosperity: {dur: 6, hl: [10, 30], end: 60, lit: '繁荣的样子', mean: '繁荣；兴旺', draw: s => {
      const bs = [[20, 50, 60, '#8fa3b8'], [76, 40, 90, '#a6b4c4'], [122, 56, 70, '#7f93a8'], [184, 44, 100, '#9aa8b8'], [234, 52, 76, '#8a9cb0']];
      return `<rect x="0" y="0" width="300" height="128" fill="#dff2ff" fill-opacity=".6"/>` + GND() +
        bs.map(([x, w, h, c], i) => `<g ${s.a(growY(6 + i * 4, 18 + i * 4), FOOT)}><rect x="${x}" y="${128 - h}" width="${w}" height="${h}" fill="${c}"/>` +
          [...Array(Math.floor(h / 18))].map((_, r) => [0, 1].map(k => `<rect x="${x + 8 + k * (w / 2 - 4)}" y="${134 - h + r * 18}" width="${w / 2 - 12}" height="8" fill="#f6d34a" ${s.a(showAt(30 + ((i + r + k) % 5) * 2))}/>`).join('')).join('') + `</g>`).join('') +
        `<path d="M200 46L230 36L250 40L284 14" ${sk('#d23c2f', 3)} ${DASH} ${s.a(drawP(36, 46))}/><path d="M276 12l8 2-2 8" ${sk('#d23c2f', 3)} ${s.a(showAt(46))}/>` +
        chip(s, 90, 24, 76, '繁荣兴旺', '#d23c2f', 44);
    }},
    recall: {dur: 6, hl: [24, 10], end: 60, lit: '喊回来', mean: '回忆；召回', draw: s => {
      const car = c => `<rect x="-20" y="-12" width="40" height="12" rx="3" fill="${c}"/><path d="M-12 -12l4-8h14l6 8z" fill="${c}"/><circle cx="-11" cy="1" r="4" fill="#333"/><circle cx="11" cy="1" r="4" fill="#333"/>`;
      return GND() + `<rect x="220" y="64" width="76" height="64" fill="#9aa8b8"/><path d="M220 64l19-14v14l19-14v14l19-14v14" fill="#9aa8b8"/><rect x="236" y="96" width="40" height="32" fill="#555"/><text x="258" y="82" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">工厂</text>` +
        ['#e2473a', '#4a90d0', '#3fbf6a'].map((c, i) => `<g ${s.a((f => { f[36 + i * 6] = T(256, 124) + ';opacity:0'; f[92] = f[36 + i * 6]; return f; })(move([[12 + i * 6, 40 + i * 50, 124], [34 + i * 6, 256, 124]])))}>${car(c)}</g>`).join('') +
        `<g ${s.a(pop(6), ORG(120, 30))}><rect x="70" y="18" width="100" height="24" rx="4" fill="#d23c2f"/><text x="120" y="35" font-size="12" font-weight="700" text-anchor="middle" fill="#fff">召回通知</text></g>` +
        `<path d="M60 70H200M192 64l8 6-8 6" ${sk(CL.v, 2)} ${DASH} ${s.a(drawP(12, 30))}/>` + chip(s, 120, 90, 116, '把卖出去的喊回来', CL.v, 46);
    }},
    solidarity: {dur: 6, hl: [10, 40], end: 60, lit: '抱成坚实的一块', mean: '团结', draw: s => {
      const stick = (x1, x2, y) => `<path d="M${x1} ${y}H${x2}" ${sk('#a0703a', 4)} stroke-linecap="round"/>`;
      return GND() + `<g ${s.a({0: R(0), 12: R(0), 16: R(-28), 92: R(-28), 100: R(0)}, ORG(90, 80))}>${stick(50, 90, 80)}</g><g ${s.a({0: R(0), 12: R(0), 16: R(28), 92: R(28), 100: R(0)}, ORG(90, 80))}>${stick(90, 130, 80)}</g>` +
        `<g ${s.a(showAt(15, 30))}><path d="M86 74l4 6 4-6M86 86l4-6 4 6" ${sk('#d23c2f', 2)}/></g>` +
        `<g ${s.a({0: T(0, 0), 32: T(0, 0), 34: T(0, 2), 36: T(0, -1), 38: T(0, 2), 40: T(0, 0), 100: T(0, 0)})}>` + [...Array(8)].map((_, i) => stick(170, 250, 70 + i * 3)).join('') + `<path d="M190 66v32M230 66v32" ${sk('#e2473a', 3)}/></g>` +
        chip(s, 90, 40, 92, '一根，一折就断', '#888', 14) + chip(s, 210, 40, 84, '一捆，折不断', CL.t, 36) + chip(s, 150, 124, 52, '团结', '#d23c2f', 50);
    }},
    successfully: {dur: 6, hl: [10, 40], end: 60, lit: '成功地', mean: '成功地；顺利地', draw: s => {
      const fly = move([[22, 0, 0, 'scale(1)'], [44, 60, -52, 'scale(.45)']]);
      return `<rect x="0" y="0" width="300" height="150" fill="#dff2ff" fill-opacity=".5"/>` + GND() + `<path d="M120 128V60M180 128V60M120 70h-10M180 70h10" ${sk('#9aa8b8', 4)}/>` +
        `<g ${s.a(fly, ORG(150, 63))}><path d="M150 30q16 18 14 66h-28q-2-48 14-66z" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><circle cx="150" cy="60" r="6" fill="#4a90d0"/><path d="M136 82l-12 18h12M164 82l12 18h-12" fill="#e2473a"/>` +
        `<g ${s.a(showAt(20))}><path d="M140 96q10 26 20 0z" fill="#f28a1a"/><path d="M145 96q5 14 10 0z" fill="#f6d34a"/></g></g>` +
        `<g ${s.a(showAt(22, 50))}>${[100, 130, 170, 200].map((x, i) => `<circle cx="${x}" cy="${122 - (i % 2) * 6}" r="${12 + (i % 2) * 4}" fill="#e8eef4"/>`).join('')}</g>` +
        ['3', '2', '1'].map((t, i) => `<text x="240" y="60" font-size="22" font-weight="700" text-anchor="middle" fill="#d23c2f" ${s.a(slot([0, 8, 16, 22, 99], i))}>${t}</text>`).join('') +
        chip(s, 150, 30, 76, '发射成功！', '#2f9f55', 46) + chip(s, 240, 100, 64, '顺利完成', CL.v, 54);
    }},
    therefore: {dur: 6, hl: [10, 20], end: 60, lit: '因为那个', mean: '因此；所以', draw: s => {
      return GND() + `<path d="M30 40a12 12 0 0 1 20-8 15 15 0 0 1 26 4 10 10 0 0 1 0 20H32a9 9 0 0 1-2-16z" fill="#8a96a6"/>` +
        [36, 50, 64].map((x, i) => `<path d="M${x} 62v8" ${sk('#6db7e8', 2)} ${s.a({0: T(0, 0), 100: T(0, 50)}, `animation-delay:${i * .25}s;animation-timing-function:linear`, .8)}/>`).join('') +
        `<text x="54" y="140" font-size="11" font-weight="700" text-anchor="middle" fill="#2f5d8a">下雨了</text>` +
        `<path d="M100 76H190M182 70l8 6-8 6" ${sk('#d23c2f', 3)} ${DASH} ${s.a(drawP(12, 24))}/><g ${s.a(pop(22), ORG(145, 60))}><rect x="121" y="50" width="48" height="20" rx="4" fill="#d23c2f"/><text x="145" y="64" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">因此</text></g>` +
        kid(240, 128, CL.t, {aR: [8, -40]}) + `<g ${s.a(pop(32), ORG(248, 52))}><path d="M248 88V52" ${sk('#333', 2)}/><path d="M218 56Q248 26 278 56z" fill="#4a90d0"/></g>` +
        `<text x="240" y="142" font-size="11" font-weight="700" text-anchor="middle" fill="${CL.t}" ${s.a(showAt(34))}>带伞</text>` + chip(s, 145, 110, 92, '因为…所以…', CL.v, 44);
    }},
    transform: {dur: 6, hl: [10, 30], end: 60, lit: '彻底变个样', mean: '改变；转变', draw: s => {
      return GND() + `<g ${s.a({0: T(0, 0), 50: T(4, 0), 100: T(0, 0)}, '', 1)}>${[0, 1, 2, 3, 4].map(i => `<circle cx="${40 + i * 9}" cy="${120 - (i === 4 ? 4 : 0)}" r="6" fill="#7fbf4a"/>`).join('')}<circle cx="78" cy="114" r="1.5" fill="${INK}"/></g>` +
        `<path d="M94 110h22M110 104l6 6-6 6" ${sk(CL.m, 2)} ${s.a(showAt(14))}/><path d="M184 110h22M200 104l6 6-6 6" ${sk(CL.m, 2)} ${s.a(showAt(28))}/>` +
        `<path d="M150 40V60" ${sk('#8b5a3a', 2)} ${s.a(showAt(16))}/><g ${s.a(pop(18), ORG(150, 80))}><ellipse cx="150" cy="82" rx="12" ry="24" fill="#c98a4a"/><path d="M140 72q10 4 20 0M140 86q10 4 20 0" ${sk('#a0703a', 1.5)}/></g>` +
        `<g ${s.a(pop(32), ORG(250, 80))}><g ${s.a({0: 'transform:scaleX(1)', 50: 'transform:scaleX(.3)', 100: 'transform:scaleX(1)'}, ORG(250, 80), .5)}><path d="M250 80q-26-30-34-6q4 16 34 6zM250 80q26-30 34-6q-4 16-34 6zM250 82q-20 26-26 6q6-8 26-6zM250 82q20 26 26 6q-6-8-26-6z" fill="#f28a1a" style="stroke:#a85a1a;stroke-width:1px"/></g><path d="M250 66v30" ${sk(INK, 3)}/></g>` +
        `<text x="58" y="140" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>毛毛虫</text><text x="150" y="140" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)} ${s.a(showAt(18))}>茧</text><text x="250" y="140" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)} ${s.a(showAt(32))}>蝴蝶</text>` +
        chip(s, 150, 20, 92, '彻底变了个样', CL.t, 44);
    }},
    underestimate: {dur: 6, hl: [10, 30], end: 60, lit: '估计得不够', mean: '低估', draw: s => {
      const go = move([[20, 0, 0], [24, 0, -8], [50, 110, -8]]);
      return GND() + `<g ${s.a(go)}><path d="M40 112q30-30 64-4q-30 16-64 4z" fill="#5d9a4a"/><path d="M42 112q30-8 60-4" ${sk('#3f7a3a', 1.5)}/>` +
        `<g transform="translate(72 124)"><ellipse cx="-6" cy="0" rx="4" ry="3" fill="${INK}"/><ellipse cx="0" cy="0" rx="3" ry="2.5" fill="${INK}"/><ellipse cx="6" cy="-1" rx="3.5" ry="3" fill="${INK}"/><path d="M-4 2l-2 4M0 2v4M4 2l2 4M6 -4l2-8" ${sk(INK, 1)}/></g></g>` +
        kid(250, 128, CL.a, {k: .85}) + chip(s, 230, 40, 76, '它？不行吧', '#888', 8) +
        `<text x="272" y="62" font-size="18" font-weight="700" fill="#d23c2f" ${s.a(pop(40), ORG(272, 56))}>！</text>` + chip(s, 110, 40, 64, '别小看它', CL.t, 50);
    }},
    visual: {dur: 6, hl: [10, 30], end: 60, lit: '跟看有关的', mean: '视觉的', draw: s => {
      const shapes = [`<circle cx="0" cy="0" r="9" fill="#e2473a"/>`, `<path d="M0 -10l10 18h-20z" fill="#f2b632"/>`, `<rect x="-8" y="-8" width="16" height="16" fill="#3fbf6a"/>`, star5(0, 0, 10, 4.5, '#8e6bd0')];
      return `<ellipse cx="210" cy="76" rx="70" ry="40" fill="#fff" style="stroke:var(--ink3);stroke-width:3px"/><circle cx="210" cy="76" r="26" fill="#4a90d0"/><circle cx="210" cy="76" r="12" fill="${INK}"/><circle cx="216" cy="70" r="4" fill="#fff"/>` +
        `<path d="M140 76q70-50 140 0" fill="#f4efe6" ${s.a({0: 'transform:scaleY(0)', 70: 'transform:scaleY(0)', 73: 'transform:scaleY(1)', 76: 'transform:scaleY(0)', 100: 'transform:scaleY(0)'}, ORG(210, 36))}/>` +
        shapes.map((sh, i) => `<g ${s.a((f => { f[24 + i * 6] = T(210, 76, 'scale(.3)') + ';opacity:0'; f[92] = f[24 + i * 6]; return f; })(moveIn([[6 + i * 6, 30, 30 + i * 28, 'scale(1)'], [22 + i * 6, 210, 76, 'scale(.3)']])))}>${sh}</g>`).join('') +
        chip(s, 70, 140, 92, '用眼睛看到的', CL.t, 40);
    }},
    worried: {dur: 6, hl: [10, 30], end: 60, lit: '心里放不下', mean: '担心的', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#1d2440"/><path d="M60 128V60l60-30 60 30v68z" fill="#3a4466"/><rect x="90" y="66" width="60" height="44" fill="#f6d34a"/>` +
        `<svg x="90" y="66" width="60" height="44" viewBox="90 66 60 44"><g ${s.a(move([[0, 0, 0], [25, 26, 0], [50, 0, 0], [75, 26, 0], [100, 0, 0]]), '', 3)}>${kid(108, 126, '#e2473a', {k: .9})}</g></svg>` +
        `<path d="M120 66v44M90 88h60" ${sk('#3a4466', 2)}/>` +
        ['22:00', '23:00', '24:00'].map((t, i) => `<text x="240" y="40" font-size="14" font-weight="700" text-anchor="middle" fill="#f6d34a" ${s.a(slot([0, 20, 40, 99], i))}>${t}</text>`).join('') +
        `<g ${s.a(pop(26), ORG(220, 80))}><ellipse cx="226" cy="86" rx="40" ry="22" fill="#fff"/><circle cx="182" cy="104" r="4" fill="#fff"/><circle cx="172" cy="112" r="2.5" fill="#fff"/><circle cx="218" cy="82" r="7" fill="${SKIN}"/><path d="M212 80q6-9 12 0" fill="${HAIR}"/><text x="242" y="92" font-size="16" font-weight="700" fill="#d23c2f">？</text></g>` +
        chip(s, 150, 139, 116, '孩子怎么还没回来', CL.a, 34);
    }},
    abundant: {dur: 6, hl: [10, 20, 40], end: 60, lit: '像波浪涌来', mean: '丰富的；大量的', draw: s => {
      const pts = [...Array(16)].map((_, i) => [80 + (i * 37) % 190, 120 - Math.floor(i / 6) * 14]);
      return GND() + `<g transform="rotate(-30 60 54)"><path d="M30 40h60l-8 34H38z" fill="#c98a4a"/><path d="M34 50h52M36 62h48" ${sk('#a0703a', 1.5)}/></g>` +
        pts.map(([x, y], i) => `<g ${s.a(moveIn([[6 + i * 2.4, 84, 46], [16 + i * 2.4, x, y]]))}><circle cx="0" cy="0" r="7" fill="${['#e2473a', '#f2b632', '#3fbf6a'][i % 3]}"/></g>`).join('') +
        `<path d="M90 40q20-14 40 0t40 0" ${sk(CL.v, 2)} fill="none" ${s.a(showAt(10, 50))}/>` +
        chip(s, 200, 30, 116, '多得像波浪涌出来', CL.t, 48);
    }},
    accelerate: {dur: 6, hl: [10, 20], end: 60, lit: '越来越快', mean: '加速；促进', draw: s => {
      const car = move([[6, 0, 0], [20, 20, 0], [32, 70, 0], [42, 150, 0], [50, 260, 0]]);
      return `<path d="M0 128H300" ${sk('#555', 4)}/><path d="M0 138H300" ${sk('#fff', 2)} stroke-dasharray="12 10"/>` +
        `<g ${s.a(car)}><rect x="10" y="104" width="50" height="18" rx="4" fill="#e2473a"/><path d="M20 104l8-12h20l8 12z" fill="#e2473a"/><rect x="30" y="95" width="16" height="9" fill="#dff2ff"/><circle cx="22" cy="124" r="6" fill="#333"/><circle cx="50" cy="124" r="6" fill="#333"/>` +
        [0, 1, 2].map(i => `<path d="M${4 - i * 6} ${108 + i * 6}h${-10 - i * 8}" ${sk(CL.m, 2)} ${s.a(showAt(20 + i * 8))}/>`).join('') + `</g>` +
        `<path d="M100 60a50 50 0 0 1 100 0" ${sk('#d8dde3', 8)} fill="none"/><path d="M100 60a50 50 0 0 1 100 0" ${sk('#e2473a', 8)} fill="none" ${DASH} ${s.a(drawP(6, 50))}/>` +
        `<g ${s.a({0: R(-80), 6: R(-80), 50: R(80), 92: R(80), 100: R(-80)}, ORG(150, 60))}><path d="M150 60V22" ${sk(CL.k, 3)}/></g><circle cx="150" cy="60" r="5" fill="${CL.k}"/>` +
        ['20', '60', '120'].map((t, i) => `<text x="150" y="80" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.k)} ${s.a(slot([0, 20, 38, 99], i))}>${t} km/h</text>`).join('') +
        chip(s, 250, 30, 76, '越开越快', '#d23c2f', 40);
    }},
    accessible: {dur: 6, hl: [10, 30], end: 60, lit: '够得着的', mean: '可获得的', draw: s => {
      return GND() + `<g ${s.a(move([[28, 0, 0], [38, 0, 18]]))}><rect x="110" y="40" width="90" height="6" fill="${WOOD}"/><path d="M114 46l10 10M196 46l-10 10" ${sk(WOOD, 3)}/>` +
        `<g ${s.a((f => { f[42] = T(0, 0); f[50] = T(-34, 26); f[92] = T(-34, 26); return f; })({0: T(0, 0), 100: T(0, 0)}))}><rect x="146" y="20" width="14" height="20" fill="#2f5d8a"/><rect x="162" y="22" width="12" height="18" fill="#e2473a"/></g></g>` +
        kid(130, 128, CL.t, {k: .8, aR: [12, -62]}) + `<path d="M142 74v-20" ${sk(CL.m, 1.5)} stroke-dasharray="2 3" ${s.a(showAt(8, 28))}/>` +
        chip(s, 60, 40, 52, '够不着', '#888', 10) + chip(s, 240, 40, 92, '放低，人人够得着', CL.t, 44);
    }},
    // ---------- 第六十六批 ----------
    active: {dur: 6, hl: [10, 30], end: 60, lit: '爱动的', mean: '积极的；活跃的', draw: s => {
      const hop = {0: T(), 10: T()}; [10, 22, 34, 46].forEach(p => { hop[p + 4] = T(0, -12); hop[p + 8] = T(); }); hop[100] = T();
      return GND() + [70, 150, 230].map(x => `<rect x="${x - 30}" y="92" width="60" height="8" fill="${WOOD}"/>`).join('') + kid(70, 128, '#9aa8b8', {k: .8}) + kid(230, 128, '#9aa8b8', {k: .8}) +
        `<g ${s.a(hop)}>${kid(150, 128, CL.t, {k: .85, aR: [10, -70]})}</g>` +
        chip(s, 200, 30, 52, '我来！', CL.t, 10) + chip(s, 150, 139, 76, '积极主动', CL.a, 40);
    }},
    actual: {dur: 6, hl: [10, 30], end: 60, lit: '真做出来的', mean: '实际的；真实的', draw: s => {
      return `<rect x="20" y="22" width="110" height="92" fill="#2f5d8a"/><path d="M40 98V66l35-26 35 26v32zM62 98V80h18v18" fill="none" ${sk('#fff', 1.5)} stroke-dasharray="4 3" ${s.a(fadeP(6, 22))}/><text x="75" y="110" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">图纸</text>` +
        `<path d="M138 70h20M152 64l6 6-6 6" ${sk(CL.m, 2)} ${s.a(showAt(22))}/>` + GND(160, 292) +
        `<g ${s.a(growY(24, 40), FOOT)}><path d="M180 128V80l46-34 46 34v48z" fill="#f4efe6" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M174 82l52-40 52 40" ${sk('#d23c2f', 5)} fill="none"/><rect x="212" y="98" width="22" height="30" fill="#8b5a3a"/><rect x="190" y="90" width="14" height="12" fill="#dff2ff"/><rect x="246" y="90" width="14" height="12" fill="#dff2ff"/></g>` +
        chip(s, 226, 22, 104, '实际盖出来的样子', CL.t, 44);
    }},
    advanced: {dur: 6, hl: [10, 30], end: 60, lit: '走在前头的', mean: '先进的；高级的', draw: s => {
      return GND() + `<rect x="56" y="52" width="30" height="62" rx="4" fill="#6b7480"/><path d="M80 52V32" ${sk('#555', 3)}/><rect x="61" y="58" width="20" height="12" fill="#a8c4a0"/>` + [0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${61 + c * 7}" y="${76 + r * 10}" width="5" height="6" fill="#d8dde3"/>`).join('')).join('') +
        `<text x="71" y="134" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.m)}>1990 年</text>` +
        `<path d="M108 82H180M172 76l8 6-8 6" ${sk('#d23c2f', 3)} ${DASH} ${s.a(drawP(10, 22))}/>` +
        `<g ${s.a(pop(22), ORG(226, 82))}><rect x="204" y="38" width="44" height="80" rx="7" fill="#2a2f3a"/><rect x="208" y="46" width="36" height="62" rx="2" fill="#dff2ff"/>` +
        ['#e2473a', '#f2b632', '#3fbf6a', '#4a90d0', '#8e6bd0', '#f48fb1'].map((c, i) => `<rect x="${212 + (i % 3) * 11}" y="${52 + Math.floor(i / 3) * 12}" width="8" height="8" rx="2" fill="${c}" ${s.a(pop(28 + i * 2), ORG(216 + (i % 3) * 11, 56 + Math.floor(i / 3) * 12))}/>`).join('') + `</g>` +
        `<text x="226" y="134" font-size="10" font-weight="700" text-anchor="middle" fill="${CL.t}" ${s.a(showAt(22))}>2026 年</text>` + chip(s, 144, 30, 64, '更先进', CL.t, 40);
    }},
    archaeologist: {dur: 6, hl: [10, 20, 40], end: 60, lit: '研究古代的人', mean: '考古学家', draw: s => {
      return `<g ${s.a(move([[30, 0, 0], [44, 0, -26]]))}><path d="M176 108h40l-6 22h-28z" fill="#c9734a"/><path d="M180 112h32" ${sk('#8b4a2a', 2)}/><path d="M184 104h24" ${sk('#c9734a', 5)}/></g>` +
        `<rect x="0" y="104" width="300" height="46" fill="#c9a06a"/><rect x="0" y="124" width="300" height="26" fill="#a8804a"/>` +
        kid(110, 104, '#c9a06a', {k: .9, aR: [56, -8]}) + `<path d="M90 50h40M98 50q12-16 24 0" fill="#d8c08a" ${sk('#a0703a', 2)}/>` +
        `<g ${s.a({0: T(0, 0), 25: T(10, 0), 50: T(0, 0), 75: T(10, 0), 100: T(0, 0)}, '', .6)}><path d="M160 98l14-6" ${sk('#8b5a3a', 3)}/><rect x="172" y="88" width="8" height="8" fill="#f2b632"/></g>` +
        `<g ${s.a(showAt(10, 40))}>${[0, 1, 2].map(i => `<circle cx="${190 + i * 8}" cy="${92 - i * 4}" r="1.6" fill="#a8804a"/>`).join('')}</g>` +
        chip(s, 70, 30, 92, '挖出古代陶罐', '#a8641a', 44) + chip(s, 230, 30, 76, '考古学家', CL.v, 50);
    }},
    arise: {dur: 6, hl: [10, 24], end: 60, lit: '冒出来', mean: '出现；产生', draw: s => {
      return GND() + `<g ${s.a(move([[4, 0, 0], [18, 60, 0]]))}>${kid(50, 128, CL.t, Object.assign({k: .9}, walkLegs(s, 50, 128, 4, 18, 4, .9)))}</g>` +
        `<svg x="0" y="0" width="300" height="128" viewBox="0 0 300 128"><g ${s.a(move([[18, 0, 60], [28, 0, 0]]))}><path d="M210 128V96" ${sk('#555', 3)}/><path d="M210 52l26 44h-52z" fill="#f2b632" style="stroke:#d23c2f;stroke-width:3px"/><text x="210" y="90" font-size="22" font-weight="700" text-anchor="middle" fill="#d23c2f">!</text></g></svg>` +
        `<text x="160" y="56" font-size="16" font-weight="700" fill="#d23c2f" ${s.a(pop(30), ORG(160, 50))}>？</text>` +
        chip(s, 210, 30, 92, '问题冒出来了', '#d23c2f', 32);
    }},
    artifact: {dur: 6, hl: [10, 24], end: 60, lit: '人工做的', mean: '人工制品；文物', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#2a2420"/><path d="M150 0L110 90H190z" fill="#f6e7a8" fill-opacity=".18" ${s.a(fadeP(6, 14))}/>` +
        `<rect x="110" y="104" width="80" height="46" fill="#5a4632"/><rect x="104" y="98" width="92" height="8" fill="#7a6248"/>` +
        `<path d="M122 60h56q0 28-28 32q-28-4-28-32z" fill="#7a8a5a"/><path d="M126 60v-10h8v10M166 60v-10h8v10" ${sk('#6a7a4a', 3)} fill="none"/><path d="M134 90l-4 8M166 90l4 8M150 92v6" ${sk('#6a7a4a', 4)}/><path d="M130 70h40M134 78h32" ${sk('#a8b880', 1.5)}/>` +
        `<rect x="112" y="40" width="76" height="58" fill="#dff2ff" fill-opacity=".12" style="stroke:#dff2ff;stroke-width:1.5px"/>` +
        `<g ${s.a(pop(20), ORG(150, 124))}><rect x="118" y="116" width="64" height="16" rx="2" fill="#f4efe6"/><text x="150" y="128" font-size="9" font-weight="700" text-anchor="middle" fill="#5a4632">商代 青铜鼎</text></g>` +
        chip(s, 240, 40, 76, '古人做的东西', '#a8741a', 30) + chip(s, 240, 70, 52, '文物', '#d23c2f', 42);
    }},
    assistant: {dur: 6, hl: [10, 30], end: 60, lit: '帮忙的人', mean: '助手；助理', draw: s => {
      return GND() + `<rect x="30" y="96" width="70" height="32" fill="#9aa8b8"/><path d="M40 90h40" ${sk('#333', 5)}/>` + [0, 1].map(i => `<path d="M${50 + i * 14} 84q-3-5 0-10t0-10" ${sk('#b8b0a4', 1.5)} ${s.a({0: 'opacity:0;' + T(0, 4), 50: 'opacity:.8;' + T(0, 0), 100: 'opacity:0;' + T(0, -8)}, `animation-delay:${i * .5}s`, 1.4)}/>`).join('') +
        kid(120, 128, '#fff', {aL: [-20, -38], aR: [24, -40]}) + `<path d="M108 60q-6-12 6-12q2-8 12-4q10-4 12 4q12 0 6 12z" fill="#fff" style="stroke:#ccc;stroke-width:1px"/>` +
        kid(230, 128, CL.t, {k: .85, aL: [-22, -36]}) +
        `<g ${s.a(moveIn([[18, 206, 94], [30, 144, 88]]))}><rect x="-6" y="-12" width="12" height="18" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/><rect x="-6" y="-14" width="12" height="5" fill="#9aa8b8"/><text x="0" y="2" font-size="7" font-weight="700" text-anchor="middle" fill="${CL.k}">盐</text></g>` +
        chip(s, 60, 40, 52, '盐！', '#d23c2f', 10) + chip(s, 230, 40, 76, '马上递过去', CL.t, 22) + chip(s, 150, 139, 92, '帮忙的人：助手', CL.v, 44);
    }},
    assumption: {dur: 6, hl: [10, 20, 40], end: 60, lit: '想当然的前提', mean: '假设；设想', draw: s => {
      return GND() + `<ellipse cx="150" cy="128" rx="50" ry="5" fill="#6db7e8" fill-opacity=".6"/>` + kid(80, 128, CL.t, {k: .9}) +
        `<g ${s.a(pop(10), ORG(110, 50))}><ellipse cx="120" cy="44" rx="40" ry="20" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><circle cx="96" cy="70" r="3" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/><text x="120" y="49" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.k)}>下雨了？</text></g>` +
        `<g ${s.a(showAt(32))}><path d="M250 128v-14" ${sk('#555', 3)}/><circle cx="250" cy="112" r="4" fill="#555"/>` + [0, 1, 2].map(i => `<path d="M250 110Q${222 - i * 20} ${70 + i * 6} ${200 - i * 20} 120" ${sk('#6db7e8', 1.8)} stroke-dasharray="3 4" fill="none"/>`).join('') + `</g>` +
        chip(s, 236, 30, 76, '原来是洒水器', CL.v, 40) + chip(s, 120, 139, 92, '想当然的假设', '#d23c2f', 48);
    }},
    behave: {dur: 6, hl: [10, 30], end: 60, lit: '拥有好品行', mean: '表现；守规矩', draw: s => {
      return `<rect x="170" y="16" width="120" height="70" fill="#2f4a3a" style="stroke:#8b5a3a;stroke-width:4px"/><text x="182" y="40" font-size="11" font-weight="700" fill="#fff">表现：</text>` +
        [0, 1, 2].map(i => `<g ${s.a(pop(14 + i * 10), ORG(228 + i * 18, 36))}>${star5(228 + i * 18, 36, 8, 3.5, '#f6d34a')}</g>`).join('') +
        GND() + kid(90, 128, CL.t, {k: .9, aL: [-12, -30], aR: [12, -30]}) + `<rect x="58" y="100" width="64" height="8" fill="${WOOD}"/><path d="M64 108v20M116 108v20" ${sk(WOOD, 3)}/>` +
        kid(250, 128, '#3d4a5c', {aL: [-22, -60]}) + chip(s, 90, 40, 76, '坐得端端正正', CL.t, 8) + chip(s, 230, 110, 64, '真乖！', CL.a, 40);
    }},
    biodiversity: {dur: 6, hl: [10, 30], end: 60, lit: '各种生命都有', mean: '生物多样性', draw: s => {
      const items = [
        [`<ellipse cx="72" cy="40" rx="9" ry="6" fill="#4a90d0"/><circle cx="80" cy="36" r="4" fill="#4a90d0"/><path d="M83 36l4 1-4 2z" fill="#f2b632"/>`, 72, 40],
        [`<path d="M150 50q-14-14-18 0q4 8 18 0zM150 50q14-14 18 0q-4 8-18 0z" fill="#f28a1a"/>`, 150, 50],
        [`<ellipse cx="96" cy="120" rx="10" ry="7" fill="#5d9a4a"/><circle cx="90" cy="113" r="3" fill="#5d9a4a"/><circle cx="102" cy="113" r="3" fill="#5d9a4a"/>`, 96, 118],
        [`<ellipse cx="240" cy="132" rx="10" ry="5" fill="#f28a1a"/><path d="M250 132l6-5v10z" fill="#f28a1a"/>`, 240, 132],
        [`<ellipse cx="190" cy="118" rx="9" ry="7" fill="#fff" style="stroke:#ccc;stroke-width:1px"/><path d="M194 112l1-9M198 113l3-8" ${sk('#ddd', 3)}/>`, 190, 116],
        [`<circle cx="130" cy="120" r="5" fill="#f48fb1"/><circle cx="138" cy="122" r="5" fill="#e2473a"/><path d="M134 126v4" ${sk('#3f8f4f', 2)}/>`, 134, 122]];
      return `<rect x="0" y="0" width="300" height="150" fill="#eaf6e0" fill-opacity=".6"/>` + GND(8, 210) + `<ellipse cx="248" cy="134" rx="46" ry="10" fill="#6db7e8"/><path d="M60 128V60" ${sk('#8b5a3a', 7)}/><circle cx="60" cy="48" r="28" fill="#5d9a4a"/>` +
        items.map(([g, x, y], i) => `<g ${s.a(pop(8 + i * 6), ORG(x, y))}>${g}</g>`).join('') +
        ['1 种', '3 种', '6 种'].map((t, i) => `<text x="250" y="40" font-size="13" font-weight="700" text-anchor="middle" ${fl(CL.v)} ${s.a(slot([0, 20, 38, 99], i))}>${t}</text>`).join('') +
        chip(s, 236, 70, 92, '各种生命都有', CL.t, 46);
    }},
    biological: {dur: 6, hl: [10, 30], end: 60, lit: '跟生命有关的', mean: '生物的', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#1d2440" ${s.a(fadeP(10, 30))}/>` + GND() +
        `<circle cx="240" cy="40" r="22" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><g ${s.a({0: R(150), 10: R(150), 36: R(300), 92: R(300), 100: R(150)}, ORG(240, 40))}><path d="M240 40V24" ${sk(CL.k, 2.5)}/></g><path d="M240 40l-8 4" ${sk(CL.k, 2.5)}/>` +
        ['20:00', '22:00'].map((t, i) => `<text x="240" y="80" font-size="11" font-weight="700" text-anchor="middle" fill="#f6d34a" ${s.a(slot([0, 34, 99], i))}>${t}</text>`).join('') +
        kid(120, 128, CL.t, {noFace: true}) + `<g ${s.a(hideAt(34))}>${face(120, 128, 1)}</g><g ${s.a(showAt(34))}><path d="M113 76h6M123 76h6" ${sk(INK, 2)}/><ellipse cx="120" cy="84" rx="4" ry="5" fill="#8b2a2a"/></g>` +
        `<circle cx="120" cy="104" r="9" fill="#fff" fill-opacity=".85"/><path d="M120 104v-6M120 104l4 2" ${sk(CL.k, 1.5)}/>` +
        `<text x="160" y="56" font-size="14" font-weight="700" fill="#dff2ff" ${s.a(showAt(38))}>Zzz</text>` +
        chip(s, 70, 30, 92, '身体里的钟', CL.t, 16) + chip(s, 240, 112, 76, '生物钟到点了', CL.a, 40);
    }},
    charity: {dur: 6, hl: [10, 30], end: 60, lit: '博爱之心', mean: '慈善；慈善机构', draw: s => {
      return GND() + `<rect x="126" y="70" width="48" height="58" rx="3" fill="#e2473a"/><rect x="138" y="68" width="24" height="4" fill="#333"/>${heartAt(150, 88, 1.2, '#fff')}<text x="150" y="120" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">爱心捐款</text>` +
        [[50, 8], [80, 16], [230, 24]].map(([x, p], i) => kid(x, 128, ['#3d4a5c', CL.t, '#8e6bd0'][i], {k: .8, aR: [i === 2 ? -20 : 20, -40]}) + `<g ${s.a((f => { f[p + 10] = T(150, 66) + ';opacity:0'; f[92] = f[p + 10]; return f; })(moveIn([[p, x + (i === 2 ? -16 : 16), 92], [p + 8, 150, 66]])))}><circle cx="0" cy="0" r="5" fill="#f2b632" style="stroke:#a8741a;stroke-width:1px"/></g>`).join('') +
        `<g ${s.a(pop(44), ORG(150, 40))}>${heartAt(150, 34, 2.2)}</g>` +
        chip(s, 150, 139, 76, '献出爱心', '#d23c2f', 44);
    }},
    // ---------- 第六十七批 ----------
    confident: {dur: 6, hl: [10, 20, 40], end: 60, lit: '相信自己的', mean: '自信的；有把握的', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#2a2440"/><path d="M150 0L100 128H200z" fill="#f6e7a8" fill-opacity=".25" ${s.a(fadeP(4, 12))}/><rect x="40" y="128" width="220" height="22" fill="#8b5a3a"/>` +
        `<g ${s.a({0: 'transform:scale(1)', 14: 'transform:scale(1)', 22: 'transform:scale(1.08)', 92: 'transform:scale(1.08)', 100: 'transform:scale(1)'}, ORG(150, 128))}>${kid(150, 128, CL.t, {aR: [10, -66], aL: [-16, -40]})}<path d="M160 64v-6" ${sk('#333', 2)}/><ellipse cx="160" cy="56" rx="4" ry="5" fill="#333"/></g>` +
        `<g ${s.a(showAt(24))}>${sparkle(110, 50, 7)}${sparkle(194, 40, 6)}${sparkle(206, 90, 5)}</g>` +
        [70, 100, 200, 230].map(x => `<circle cx="${x}" cy="146" r="8" fill="#1a1530"/>`).join('') +
        chip(s, 80, 30, 64, '我能行！', CL.t, 20) + chip(s, 236, 30, 76, '胸有成竹', CL.a, 40);
    }},
    confront: {dur: 6, hl: [10, 24], end: 60, lit: '脸对脸', mean: '面对；对抗', draw: s => {
      return GND() + `<g ${s.a({0: 'transform:scale(1)', 50: 'transform:scale(1.04)', 100: 'transform:scale(1)'}, ORG(230, 128), 1.2)}><path d="M190 128Q186 50 230 40Q274 50 270 128z" fill="#3d3a4a"/><circle cx="216" cy="70" r="5" fill="#e2473a"/><circle cx="244" cy="70" r="5" fill="#e2473a"/><path d="M212 92l6 6 6-6 6 6 6-6 6 6 6-6" ${sk('#fff', 2)} fill="none"/></g>` +
        `<text x="230" y="120" font-size="12" font-weight="700" text-anchor="middle" fill="#fff">困难</text>` +
        `<g ${s.a(move([[8, 0, 0], [26, 60, 0]]))}>${kid(70, 128, CL.t, Object.assign({aR: [24, -36]}, walkLegs(s, 70, 128, 8, 26, 4)))}</g>` +
        `<path d="M156 70l10 4-10 4M162 56l10-2-6 8" ${sk('#d23c2f', 2)} ${s.a(showAt(28))}/>` +
        chip(s, 80, 30, 76, '不躲，迎上去', CL.t, 30) + chip(s, 150, 139, 64, '面对', '#d23c2f', 40);
    }},
    constant: {dur: 6, hl: [10, 30], end: 60, lit: '一直站着不动', mean: '不变的；不断的', draw: s => {
      return `<rect x="20" y="20" width="110" height="80" fill="#dff2ff" style="stroke:var(--ink3);stroke-width:3px"/>` +
        `<g ${s.a(slot([0, 22, 44, 99], 0))}><circle cx="75" cy="56" r="16" fill="#f6d34a"/><text x="75" y="94" font-size="9" font-weight="700" text-anchor="middle" fill="#a8741a">夏天 35 度</text></g>` +
        `<g ${s.a(slot([0, 22, 44, 99], 1))}><path d="M50 50a10 10 0 0 1 16-6 12 12 0 0 1 22 4 8 8 0 0 1 0 16H52a8 8 0 0 1-2-14z" fill="#8a96a6"/><path d="M60 70v8M72 70v8M84 70v8" ${sk('#6db7e8', 2)}/><text x="75" y="94" font-size="9" font-weight="700" text-anchor="middle" fill="#2f5d8a">雨天 18 度</text></g>` +
        `<g ${s.a(slot([0, 22, 44, 99], 2))}>${[0, 1, 2, 3, 4].map(i => `<circle cx="${40 + i * 18}" cy="${44 + (i % 2) * 18}" r="3" fill="#fff" style="stroke:#9fc6e0;stroke-width:1px"/>`).join('')}<text x="75" y="94" font-size="9" font-weight="700" text-anchor="middle" fill="#2f5d8a">冬天 -5 度</text></g>` +
        `<text x="75" y="116" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.m)}>窗外一直在变</text>` +
        `<rect x="196" y="24" width="14" height="80" rx="7" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><rect x="200" y="56" width="6" height="44" fill="#e2473a"/><circle cx="203" cy="108" r="10" fill="#e2473a"/>` +
        `<text x="238" y="66" font-size="16" font-weight="700" text-anchor="middle" fill="#2f9f55">25 度</text><text x="238" y="84" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>屋里</text>` +
        chip(s, 220, 136, 76, '一直不变', CL.t, 40);
    }},
    convince: {dur: 6, hl: [10, 30], end: 60, lit: '用道理征服你', mean: '使信服；说服', draw: s => {
      return GND() + kid(70, 128, CL.t, {aR: [40, -54]}) + `<rect x="98" y="40" width="60" height="44" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/>` + [0, 1, 2].map(i => `<rect x="${108 + i * 16}" y="${74 - i * 12}" width="10" height="${6 + i * 12}" fill="${CL.t}" ${s.a(growY(8 + i * 4, 14 + i * 4), FOOT)}/>`).join('') +
        `<g ${s.a(slot([0, 32, 99], 0))}>${kid(230, 128, '#3d4a5c', {aL: [6, -38], aR: [-6, -38]})}</g><g ${s.a(slot([0, 32, 99], 1))}>${kid(230, 128, '#3d4a5c', {aR: [20, -60]})}</g>` +
        `<g ${s.a(showAt(10, 30))}>${chip(s, 230, 30, 64, '不信…', '#888', 10)}</g>` + chip(s, 230, 30, 76, '你说得对！', '#2f9f55', 36) + chip(s, 150, 139, 64, '被说服了', CL.v, 44);
    }},
    corporation: {dur: 6, hl: [10, 30], end: 60, lit: '结为一体的组织', mean: '大公司；法人', draw: s => {
      const branches = [['北京', 40, 40], ['上海', 40, 110], ['纽约', 260, 40], ['伦敦', 260, 110]];
      return `<rect x="120" y="16" width="60" height="112" fill="#4a5a7a"/>` + [...Array(6)].map((_, r) => [0, 1, 2].map(c => `<rect x="${128 + c * 16}" y="${26 + r * 16}" width="10" height="8" fill="#f6d34a" ${s.a(showAt(6 + ((r + c) % 6) * 3))}/>`).join('')).join('') +
        `<rect x="132" y="8" width="36" height="12" rx="2" fill="#d23c2f"/><text x="150" y="17" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">集团</text>` + GND() +
        branches.map(([t, x, y], i) => `<path d="M${x < 150 ? 120 : 180} ${y < 80 ? 50 : 100}L${x < 150 ? x + 22 : x - 22} ${y}" ${sk(CL.v, 1.5)} ${DASH} ${s.a(drawP(24 + i * 4, 32 + i * 4))}/><g ${s.a(pop(30 + i * 4), ORG(x, y))}><rect x="${x - 22}" y="${y - 10}" width="44" height="20" rx="3" fill="#fff" style="stroke:${CL.v};stroke-width:1.5px"/><text x="${x}" y="${y + 4}" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.v)}>${t}</text></g>`).join('') +
        chip(s, 150, 139, 92, '跨国大公司', CL.t, 50);
    }},
    credit: {dur: 6, hl: [10, 30], end: 60, lit: '被人信任', mean: '信用；赞扬；学分', draw: s => {
      return GND() + `<rect x="170" y="60" width="60" height="68" rx="4" fill="#6b7480"/><rect x="176" y="66" width="48" height="24" rx="2" fill="#a8c4a0"/><text x="200" y="82" font-size="9" font-weight="700" text-anchor="middle" fill="#2a3a2a">刷卡</text>` +
        `<g ${s.a(move([[6, -90, 10], [18, 0, 0], [24, 0, 0], [34, -90, 10]]))}><rect x="186" y="96" width="44" height="28" rx="3" fill="#2f5d8a"/><rect x="190" y="102" width="10" height="8" rx="1" fill="#f2b632"/><text x="214" y="120" font-size="7" font-weight="700" text-anchor="middle" fill="#fff">信用卡</text></g>` +
        `<g ${s.a(pop(26), ORG(200, 78))}><rect x="176" y="66" width="48" height="24" rx="2" fill="#3fbf6a"/><path d="M192 78l5 5 10-10" ${sk('#fff', 2.5)}/></g>` +
        kid(70, 128, CL.t, {aR: [26, -40]}) + `<rect x="250" y="96" width="30" height="32" fill="#c98a4a"/>` +
        chip(s, 110, 30, 116, '银行相信你会还钱', CL.v, 34) + chip(s, 200, 30, 44, '信用', CL.t, 44);
    }},
    deeply: {dur: 6, hl: [10, 30], end: 60, lit: '深深地', mean: '深刻地；非常', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#2a2f3a"/><rect x="40" y="16" width="160" height="90" rx="3" fill="#f6e7c8"/>` +
        `<g ${s.a(fadeP(6, 14))}><circle cx="100" cy="70" r="14" fill="#c98a4a"/><circle cx="140" cy="70" r="12" fill="#e2473a"/>${heartAt(120, 46, 1.3)}</g>` +
        kid(240, 140, CL.t, {k: .9}) + `<g ${s.a({0: 'opacity:0;' + T(0, 0), 20: 'opacity:0;' + T(0, 0), 26: 'opacity:1;' + T(0, 0), 60: 'opacity:1;' + T(0, 24), 61: 'opacity:0;' + T(0, 24), 100: 'opacity:0'})}><path d="M233 86q-2 5 0 8q2-3 0-8zM247 86q-2 5 0 8q2-3 0-8z" fill="#6db7e8"/></g>` +
        [0, 1, 2].map(i => `<circle cx="240" cy="104" r="${8 + i * 8}" fill="none" style="stroke:#f48fb1;stroke-width:1.5px" ${s.a({0: 'opacity:0;transform:scale(.5)', [30 + i * 6]: 'opacity:0;transform:scale(.5)', [36 + i * 6]: 'opacity:1;transform:scale(1)', [48 + i * 6]: 'opacity:0;transform:scale(1.4)', 100: 'opacity:0'}, ORG(240, 104))}/>`).join('') +
        chip(s, 240, 30, 84, '深受感动', '#f48fb1', 30);
    }},
    definitely: {dur: 6, hl: [10, 30], end: 60, lit: '明确地', mean: '肯定；无疑', draw: s => {
      return GND() + kid(80, 128, '#3d4a5c') + `<g ${s.a(pop(6), ORG(120, 50))}>${bubble(120, 48)}<text x="120" y="53" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>去吗？</text></g>` +
        `<g ${s.a({0: T(), 22: T(), 25: T(0, 5), 28: T(), 31: T(0, 5), 34: T(), 100: T()})}>${kid(210, 128, CL.t, {aR: [20, -62]})}</g>` +
        `<g ${s.a(pop(22), ORG(250, 52))}><circle cx="250" cy="50" r="16" fill="#3fbf6a"/><path d="M242 50l6 6 11-12" ${sk('#fff', 3.5)}/></g>` +
        chip(s, 170, 30, 76, '当然去！', CL.t, 24) + chip(s, 150, 139, 84, '肯定、没问题', CL.v, 40);
    }},
    directly: {dur: 6, hl: [10, 30], end: 60, lit: '直接地', mean: '直接地；立即', draw: s => {
      return GND() + kid(40, 128, CL.t, {aR: [24, -40]}) + kid(260, 128, CL.a, {aL: [-24, -40]}) + `<path d="M100 72H200" ${sk(CL.m, 1.5, .5)}/>` + [120, 180].map(x => kid(x, 72, '#c6c0b6', {k: .55})).join('') +
        `<path d="M64 88Q100 20 150 44Q200 20 236 88" ${sk('#9aa8b8', 2)} stroke-dasharray="4 4" fill="none"/><path d="M140 24l20 20M160 24l-20 20" ${sk('#d23c2f', 2.5)} ${s.a(showAt(14))}/>` +
        `<path d="M64 96H236" ${sk(CL.t, 3)} ${DASH} ${s.a(drawP(20, 30))}/>` +
        `<g ${s.a(moveIn([[20, 70, 96], [36, 228, 96]]))}><rect x="-9" y="-6" width="18" height="12" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/><path d="M-9 -6l9 7 9-7" ${sk(CL.m, 1)} fill="none"/></g>` +
        chip(s, 60, 22, 92, '不经过别人', CL.t, 30) + chip(s, 150, 139, 76, '直接交到手', CL.v, 40);
    }},
    dissertation: {dur: 6, hl: [10, 20, 40], end: 60, lit: '把论点一条条插进去', mean: '学位论文', draw: s => {
      return GND() + `<rect x="120" y="30" width="80" height="98" rx="3" fill="#2f5d8a"/><rect x="128" y="38" width="64" height="82" fill="#fff"/>` +
        ['论点一', '论点二', '论点三'].map((t, i) => `<g ${s.a(moveIn([[8 + i * 8, 120, 0], [16 + i * 8, 0, 0]]))}><rect x="132" y="${46 + i * 18}" width="56" height="14" rx="2" fill="${['#e2473a', '#f2b632', '#3fbf6a'][i]}"/><text x="160" y="${56 + i * 18}" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">${t}</text></g>`).join('') +
        `<g ${s.a(pop(40), ORG(160, 108))}><rect x="128" y="100" width="64" height="16" fill="#1d3a5a"/><text x="160" y="111" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">学位论文</text></g>` +
        kid(60, 128, CL.t, {k: .9}) + `<g ${s.a(moveIn([[46, 0, -40], [54, 0, 0]]))}><path d="M44 60l16-8 16 8-16 8z" fill="#2a2f3a"/><path d="M72 62v10" ${sk('#f2b632', 1.5)}/></g>` +
        chip(s, 250, 50, 64, '写了一年', CL.v, 30) + chip(s, 250, 90, 64, '毕业了！', CL.a, 54);
    }},
    engagement: {dur: 6, hl: [10, 30], end: 60, lit: '投入其中', mean: '参与；订婚；约定', draw: s => {
      return GND() + kid(80, 128, '#2a2f3a', {aR: [40, -34]}) + kid(230, 128, '#e2473a', {aL: [-14, -50]}) +
        `<rect x="110" y="88" width="28" height="16" rx="2" fill="#d23c2f"/><g ${s.a({0: R(0), 10: R(0), 20: R(-110), 92: R(-110), 100: R(0)}, ORG(110, 88))}><rect x="110" y="80" width="28" height="9" rx="2" fill="#b02a2a"/></g>` +
        `<g ${s.a(pop(20), ORG(124, 86))}><circle cx="124" cy="86" r="6" fill="none" style="stroke:#f2b632;stroke-width:2.5px"/><path d="M124 78l-3-4h6z" fill="#dff2ff"/></g>` +
        `<g ${s.a(showAt(24))}>${sparkle(108, 70, 5)}${sparkle(142, 66, 6)}</g><g ${s.a(pop(34), ORG(176, 50))}>${heartAt(166, 50, .9)}${heartAt(188, 44, 1.1)}</g>` +
        chip(s, 150, 22, 76, '订婚戒指', '#d23c2f', 30) + chip(s, 150, 139, 92, '愿意嫁给我吗？', CL.v, 12);
    }},
    everyday: {dur: 6, hl: [10, 30], end: 60, lit: '每天都有的', mean: '日常的', draw: s => {
      const items = [['刷牙', `<path d="M-8 6l16-14" ${sk('#4a90d0', 3)}/><rect x="4" y="-14" width="8" height="5" fill="#fff" style="stroke:#9aa8b8;stroke-width:1px"/>`], ['吃饭', `<path d="M-10 -2h20q0 12-10 12t-10-12z" fill="#f4efe6" style="stroke:#c9a06a;stroke-width:1.5px"/><path d="M4 -14l4 10M8 -14l4 10" ${sk('#8b5a3a', 1.5)}/>`], ['坐车', `<rect x="-12" y="-10" width="24" height="16" rx="3" fill="#f2b632"/><circle cx="-6" cy="8" r="3" fill="#333"/><circle cx="6" cy="8" r="3" fill="#333"/>`], ['上课', `<path d="M-12 -8q6-3 12 0q6-3 12 0v14q-6-3-12 0q-6-3-12 0z" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/>`], ['睡觉', `<path d="M4 -10a10 10 0 1 0 6 14a8 8 0 1 1-6-14z" fill="#f6d34a"/>`]];
      return items.map(([t, g], i) => `<g ${s.a(pop(6 + i * 7), ORG(40 + i * 55, 66))}><circle cx="${40 + i * 55}" cy="66" r="22" fill="#fff" style="stroke:${CL.t};stroke-width:2px"/><g transform="translate(${40 + i * 55} 66)">${g}</g><text x="${40 + i * 55}" y="104" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>${t}</text></g>`).join('') +
        `<path d="M20 30H280" ${sk(CL.m, 1.5)} stroke-dasharray="4 4"/><text x="150" y="24" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.m)}>早上 → 晚上</text>` +
        chip(s, 150, 132, 76, '日常生活', CL.v, 44);
    }},
    // ---------- 第六十八批 ----------
    exchange: {dur: 6, hl: [10, 30], end: 60, lit: '拿出去、换回来', mean: '交换；兑换', draw: s => {
      const note = (c, t) => `<rect x="-18" y="-9" width="36" height="18" rx="2" fill="${c}" style="stroke:var(--ink3);stroke-width:1px"/><text x="0" y="4" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">${t}</text>`;
      return GND() + `<rect x="120" y="50" width="70" height="78" fill="#9aa8b8"/><rect x="128" y="58" width="54" height="30" fill="#dff2ff"/><text x="155" y="44" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>兑换处</text>` +
        `<rect x="200" y="30" width="90" height="30" rx="3" fill="#2a2f3a"/><text x="245" y="49" font-size="9" font-weight="700" text-anchor="middle" fill="#f6d34a">1 美元 = 7 元</text>` +
        kid(60, 128, CL.t, {aR: [30, -38]}) +
        `<g ${s.a((f => { f[24] = T(150, 100) + ';opacity:0'; f[92] = f[24]; return f; })(moveIn([[8, 92, 90], [20, 150, 100]])))}>${note('#d23c2f', '700 元')}</g>` +
        `<g ${s.a(moveIn([[30, 150, 100], [42, 92, 90]]))}>${note('#3f8f4f', '100 美元')}</g>` +
        `<path d="M96 70q30-20 50 0" ${sk('#d23c2f', 2)} fill="none" ${s.a(showAt(8, 30))}/><path d="M146 112q-30 20-50 0" ${sk('#3f8f4f', 2)} fill="none" ${s.a(showAt(30))}/>` +
        chip(s, 240, 100, 76, '人民币换美元', CL.v, 44);
    }},
    facility: {dur: 6, hl: [10, 30], end: 60, lit: '方便生活的', mean: '设施；设备', draw: s => {
      const items = [
        [`<rect x="24" y="108" width="40" height="5" fill="${WOOD}"/><path d="M28 113v15M60 113v15M24 100h40" ${sk(WOOD, 3)}/>`, '长椅', 44],
        [`<path d="M86 128V70" ${sk('#555', 3)}/><path d="M80 70h12l-3-8h-6z" fill="#f6d34a"/>`, '路灯', 86],
        [`<path d="M118 128V80h10l30 48" ${sk('#e2473a', 4)} fill="none"/><path d="M118 80v-6h10v6" ${sk('#4a90d0', 3)}/>`, '滑梯', 136],
        [`<rect x="180" y="76" width="40" height="52" fill="#dff2ff" style="stroke:#4a90d0;stroke-width:2px"/><text x="200" y="104" font-size="10" font-weight="700" text-anchor="middle" fill="#2f5d8a">WC</text>`, '厕所', 200],
        [`<rect x="244" y="98" width="20" height="30" fill="#9aa8b8"/><path d="M254 98q0-12 10-12" ${sk('#6db7e8', 2)}/>`, '饮水处', 254]];
      return `<rect x="0" y="0" width="300" height="128" fill="#eaf6e0" fill-opacity=".5"/>` + GND() +
        items.map(([g, t, x], i) => `<g ${s.a(pop(6 + i * 7), ORG(x, 128))}>${g}<text x="${x}" y="142" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>${t}</text></g>`).join('') +
        chip(s, 150, 26, 76, '公园里的设施', CL.t, 44);
    }},
    federal: {dur: 6, hl: [10, 30], end: 60, lit: '结成联盟的', mean: '联邦的', draw: s => {
      const st = [['M40 40h60v40H40z', '#f2b632', 70, 60], ['M100 40h70v30h-70z', '#3fbf6a', 135, 55], ['M170 40h80v50h-80z', '#4a90d0', 210, 65], ['M40 80h80v40H40z', '#e2473a', 80, 100], ['M120 70h50v50h-50z', '#8e6bd0', 145, 95], ['M170 90h80v30h-80z', '#f28a1a', 210, 105]];
      return st.map(([d, c, x, y], i) => `<g ${s.a(moveIn([[6 + i * 4, (x - 150) * .6, (y - 80) * .8], [20 + i * 2, 0, 0]]))}><path d="${d}" fill="${c}" fill-opacity=".75" style="stroke:#fff;stroke-width:2px"/></g>`).join('') +
        `<g ${s.a(pop(34), ORG(145, 80))}>${star5(145, 80, 12, 5, '#fff')}${star5(145, 80, 9, 4, '#d23c2f')}</g>` +
        `<path d="M40 40h210v80H40z" fill="none" style="stroke:var(--ink3);stroke-width:2.5px" ${s.a(showAt(30))}/>` +
        chip(s, 150, 20, 92, '各州结成联盟', CL.t, 30) + chip(s, 150, 138, 92, '联邦政府', '#d23c2f', 44);
    }},
    festival: {dur: 6, hl: [10, 30], end: 60, lit: '节日', mean: '节日；节', draw: s => {
      const lan = x => `<path d="M${x} 20v8" ${sk('#a8741a', 1.5)}/><ellipse cx="${x}" cy="38" rx="10" ry="11" fill="#e2473a"/><rect x="${x - 5}" y="26" width="10" height="3" fill="#f2b632"/><path d="M${x} 49v7" ${sk('#f2b632', 1.5)}/>`;
      const fw = (x, y, p, c) => `<g ${s.a({0: 'opacity:0;transform:scale(.2)', [p]: 'opacity:0;transform:scale(.2)', [p + 4]: 'opacity:1;transform:scale(1)', [p + 14]: 'opacity:0;transform:scale(1.3)', 100: 'opacity:0'}, ORG(x, y))}>${[...Array(8)].map((_, i) => { const a = i * Math.PI / 4; return `<path d="M${x} ${y}L${f1(x + 18 * Math.cos(a))} ${f1(y + 18 * Math.sin(a))}" ${sk(c, 2.5)}/>`; }).join('')}</g>`;
      return `<rect x="0" y="0" width="300" height="150" fill="#2a2440"/><path d="M0 20Q150 34 300 20" ${sk('#a8741a', 1.5)} fill="none"/>` + [50, 110, 170, 230].map(lan).join('') +
        fw(90, 80, 12, '#f6d34a') + fw(200, 70, 22, '#f48fb1') + fw(150, 96, 34, '#6fe3ff') +
        `<rect x="10" y="60" width="20" height="70" fill="#d23c2f"/><rect x="270" y="60" width="20" height="70" fill="#d23c2f"/><text x="20" y="84" font-size="10" font-weight="700" text-anchor="middle" fill="#f6d34a">福</text><text x="280" y="84" font-size="10" font-weight="700" text-anchor="middle" fill="#f6d34a">春</text>` +
        GND(30, 270) + kid(120, 128, CL.t, {k: .8, aR: [18, -50]}) + kid(180, 128, '#e2473a', {k: .8, aL: [-18, -50]}) +
        chip(s, 150, 139, 64, '过春节啦', '#d23c2f', 30);
    }},
    genius: {dur: 6, hl: [10, 30], end: 60, lit: '生来就有的', mean: '天才；天赋', draw: s => {
      const note = (x, y) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${CL.v}"/><path d="M${x + 3.5} ${y}V${y - 14}l6 3" ${sk(CL.v, 1.8)}/>`;
      return GND() + `<rect x="110" y="80" width="120" height="48" fill="#2a2f3a"/><rect x="114" y="84" width="112" height="16" fill="#fff"/>` + [...Array(8)].map((_, i) => `<path d="M${128 + i * 14} 84v16" ${sk('#999', 1)}/>`).join('') + [...Array(5)].map((_, i) => `<rect x="${124 + i * 20}" y="84" width="6" height="10" fill="#222"/>`).join('') +
        `<g ${s.a({0: T(0, 0), 25: T(0, -3), 50: T(0, 0), 75: T(0, -3), 100: T(0, 0)}, '', .4)}>${kid(90, 128, CL.a, {k: .55, aR: [50, -52]})}</g>` +
        [0, 1, 2].map(i => `<g ${s.a({0: 'opacity:0;' + T(0, 0), 20: 'opacity:1;' + T(8, -10), 100: 'opacity:0;' + T(30, -50)}, `animation-delay:${(i * .5).toFixed(1)}s`, 1.5)}>${note(180, 74)}</g>`).join('') +
        `<g ${s.a(pop(20), ORG(56, 40))}>${star5(56, 40, 12, 5, '#f6d34a')}</g>` + chip(s, 70, 70, 64, '才 3 岁', CL.a, 14) + chip(s, 230, 40, 84, '天生的才华', CL.t, 34);
    }},
    horror: {dur: 6, hl: [10, 30], end: 60, lit: '让人发抖的', mean: '恐惧；恐怖', draw: s => {
      const shake = {0: T(), 30: T()}; for (let p = 32; p < 92; p += 2) shake[p] = T(p % 4 ? -2 : 2, 0); shake[92] = T(); shake[100] = T();
      return `<rect x="0" y="0" width="300" height="150" fill="#14121c"/><rect x="150" y="20" width="130" height="86" rx="4" fill="#2a2f3a"/><rect x="156" y="26" width="118" height="74" fill="#1d2440"/>` +
        `<g ${s.a(moveIn([[18, 0, 30], [28, 0, 0]]))}><path d="M196 96Q190 40 215 36Q240 40 234 96l-6-6-6 6-7-6-6 6-7-6z" fill="#e8eef4"/><circle cx="208" cy="58" r="4" fill="#14121c"/><circle cx="222" cy="58" r="4" fill="#14121c"/><ellipse cx="215" cy="72" rx="4" ry="6" fill="#14121c"/></g>` +
        `<path d="M156 26h118v74H156z" fill="#fff" ${s.a({0: 'opacity:0', 27: 'opacity:0', 28: 'opacity:.6', 31: 'opacity:0', 100: 'opacity:0'})}/>` +
        `<g ${s.a(shake)}>${kid(80, 140, CL.t, {noFace: true, aL: [-12, -60], aR: [12, -60]})}${face(80, 140, 1, 'sad')}<path d="M70 82l-4-8M80 80v-9M90 82l4-8" ${sk(HAIR, 2.5)} ${s.a(showAt(30))}/></g>` +
        chip(s, 80, 30, 84, '吓得直发抖', '#d23c2f', 34) + chip(s, 215, 124, 64, '恐怖片', '#555', 10);
    }},
    humanity: {dur: 6, hl: [10, 30], end: 60, lit: '全体人类', mean: '人类；人性', draw: s => {
      const cs = ['#e2473a', '#f2b632', '#3fbf6a', '#4a90d0', '#8e6bd0', '#f48fb1', '#c98a4a', '#2a2f3a'];
      return `<circle cx="150" cy="78" r="40" fill="#4a90d0"/><path d="M124 60q14-10 26 0t18 20q-10 16-24 6t-20-26zM164 92q14-6 18 8q-10 10-18-8z" fill="#5d9a4a"/>` +
        cs.map((c, i) => { const a = -Math.PI / 2 + i * Math.PI / 4, x = f1(150 + 60 * Math.cos(a)), y = f1(78 + 56 * Math.sin(a)); return `<g ${s.a(pop(6 + i * 3), ORG(x, y))}><circle cx="${x}" cy="${f1(y - 8)}" r="6" fill="${SKIN}"/><rect x="${f1(x - 6)}" y="${f1(y - 2)}" width="12" height="12" rx="3" fill="${c}"/></g>`; }).join('') +
        `<circle cx="150" cy="78" r="58" fill="none" style="stroke:#f48fb1;stroke-width:3px" ${DASH} ${s.a(drawP(32, 46))}/>` +
        chip(s, 60, 20, 64, '全人类', CL.t, 44) + chip(s, 246, 140, 76, '手拉着手', '#f48fb1', 48);
    }},
    imagination: {dur: 6, hl: [10, 30], end: 60, lit: '想象出来的本事', mean: '想象力', draw: s => {
      return GND() + kid(60, 128, CL.t, {k: .9}) + `<rect x="84" y="104" width="40" height="24" fill="#c98a4a" style="stroke:#a0703a;stroke-width:1.5px"/><text x="104" y="120" font-size="8" font-weight="700" text-anchor="middle" fill="#6b4f34">纸箱</text>` +
        `<g ${s.a(pop(10), ORG(200, 60))}><ellipse cx="206" cy="62" rx="80" ry="50" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><circle cx="116" cy="90" r="5" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/><circle cx="104" cy="98" r="3" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/></g>` +
        `<g ${s.a(slot([0, 20, 40, 99], 1))}><rect x="186" y="56" width="40" height="24" fill="#c98a4a"/></g>` +
        `<g ${s.a(slot([0, 20, 40, 99], 2))}><g ${s.a({0: T(0, 4), 50: T(0, -4), 100: T(0, 4)}, '', 1)}><path d="M190 80V52q16-16 32 0v28z" fill="#e2473a"/><circle cx="206" cy="60" r="5" fill="#dff2ff"/><path d="M190 80l-8 10h8M222 80l8 10h-8" fill="#f2b632"/><path d="M200 80q6 12 12 0z" fill="#f28a1a"/></g>${[0, 1, 2].map(i => `<circle cx="${160 + i * 70}" cy="${30 + (i % 2) * 40}" r="2" fill="#f6d34a"/>`).join('')}</g>` +
        `<text x="206" y="104" font-size="9" font-weight="700" text-anchor="middle" fill="${CL.v}" ${s.a(showAt(40))}>变成火箭！</text>` + chip(s, 236, 132, 64, '想象力', CL.a, 46);
    }},
    incorporate: {dur: 6, hl: [10, 20, 40], end: 60, lit: '纳入一个整体', mean: '吸收；合并', draw: s => {
      const bits = [[40, 30, '#e2473a'], [260, 34, '#f2b632'], [36, 120, '#3fbf6a'], [264, 116, '#8e6bd0']];
      return `<circle cx="150" cy="76" r="30" fill="${CL.t}" fill-opacity=".85" ${s.a({0: 'transform:scale(1)', 20: 'transform:scale(1)', 44: 'transform:scale(1.4)', 92: 'transform:scale(1.4)', 100: 'transform:scale(1)'}, ORG(150, 76))}/>` +
        bits.map(([x, y, c], i) => `<g ${s.a((f => { f[30 + i * 4] = T(150, 76, 'scale(.4)') + ';opacity:0'; f[92] = f[30 + i * 4]; return f; })(move([[10 + i * 4, x, y, 'scale(1)'], [28 + i * 4, 150, 76, 'scale(.4)']])))}><circle cx="0" cy="0" r="12" fill="${c}"/></g>`).join('') +
        bits.map(([, , c], i) => `<circle cx="${f1(150 + 20 * Math.cos(i * 1.6))}" cy="${f1(76 + 20 * Math.sin(i * 1.6))}" r="6" fill="${c}" ${s.a(showAt(30 + i * 4))}/>`).join('') +
        chip(s, 150, 139, 92, '吸收进来，合成一体', CL.v, 46);
    }},
    infant: {dur: 6, hl: [10, 30], end: 60, lit: '还不会说话的', mean: '婴儿', draw: s => {
      return GND() + `<rect x="80" y="84" width="140" height="44" rx="4" fill="#f4efe6" style="stroke:#c9a06a;stroke-width:2px"/>` + [...Array(8)].map((_, i) => `<path d="M${94 + i * 16} 84v-24" ${sk('#c9a06a', 2)}/>`).join('') + `<path d="M84 60H216" ${sk('#c9a06a', 3)}/>` +
        `<ellipse cx="150" cy="86" rx="26" ry="14" fill="#bfe1f2"/><circle cx="150" cy="70" r="16" fill="${SKIN}"/><circle cx="144" cy="68" r="1.8" fill="${INK}"/><circle cx="156" cy="68" r="1.8" fill="${INK}"/><circle cx="150" cy="77" r="4" fill="#f48fb1"/>` +
        `<g ${s.a({0: R(0), 25: R(-20), 50: R(0), 75: R(20), 100: R(0)}, ORG(178, 76), 1)}><path d="M170 80l14-10" ${sk(SKIN, 5)}/><circle cx="186" cy="68" r="4" fill="#f2b632"/></g>` +
        [['咿…', 120, 40, 10], ['呀…', 180, 34, 24], ['啊？', 150, 22, 38]].map(([t, x, y, p]) => `<g ${s.a(showAt(p, p + 12))}>${bubble(x, y)}<text x="${x}" y="${y + 5}" font-size="10" font-weight="700" text-anchor="middle" ${fl(CL.k)}>${t}</text></g>`).join('') +
        chip(s, 150, 139, 92, '还不会说话', CL.v, 50);
    }},
    insect: {dur: 6, hl: [10, 30], end: 60, lit: '身体切成几节', mean: '昆虫', draw: s => {
      return `<ellipse cx="96" cy="76" rx="18" ry="16" fill="#3d3a4a"/><ellipse cx="140" cy="76" rx="22" ry="18" fill="#4a4658"/><ellipse cx="200" cy="76" rx="38" ry="24" fill="#5a5668"/>` +
        `<circle cx="90" cy="70" r="3" fill="#fff"/><path d="M86 62q-10-20-20-22M94 60q-2-22 8-26" ${sk('#3d3a4a', 2)} fill="none"/>` +
        [126, 140, 154].map((x, i) => `<path d="M${x} 90l${-8 + i * 4} 26M${x} 62l${-8 + i * 4} -22" ${sk('#3d3a4a', 2.5)}/>`).join('') +
        `<path d="M118 48V104M162 48V104" ${sk('#d23c2f', 2.5)} stroke-dasharray="5 4" ${s.a(showAt(14))}/>` +
        [['头', 96, 20], ['胸', 140, 26], ['腹', 200, 32]].map(([t, x, p]) => `<g ${s.a(pop(p), ORG(x, 120))}><rect x="${x - 14}" y="110" width="28" height="18" rx="3" fill="${CL.t}"/><text x="${x}" y="123" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">${t}</text></g>`).join('') +
        chip(s, 236, 22, 92, '一节一节的身体', CL.v, 40) + chip(s, 60, 132, 52, '6 条腿', CL.a, 46);
    }},
    intellectual: {dur: 6, hl: [10, 20, 40], end: 60, lit: '用脑子的', mean: '智力的', draw: s => {
      return GND() + `<g opacity=".45">${kid(70, 128, '#9aa8b8', {aL: [-20, -60], aR: [20, -60]})}<path d="M46 66H94" ${sk('#555', 4)}/><rect x="40" y="58" width="8" height="16" fill="#555"/><rect x="92" y="58" width="8" height="16" fill="#555"/></g><text x="70" y="146" font-size="10" font-weight="700" text-anchor="middle" fill="#888">体力</text>` +
        kid(210, 128, CL.t, {aR: [12, -40]}) + `<g ${s.a(pop(10), ORG(210, 54))}><g transform="translate(0 14)"><path d="M194 44q-8-16 8-22q4-10 16-6q14-4 16 8q10 8 0 18q-6 10-20 6q-16 6-20-4z" fill="#f48fb1"/><path d="M204 30q4 6 0 10M216 26q4 8-2 14M224 34q-4 6 2 10" ${sk('#d0608a', 1.5)} fill="none"/></g></g>` +
        `<g ${s.a(showAt(20))}>${[0, 1, 2].map(i => `<path d="M${190 - i * 6} ${30 - i * 4}l-6-4M${236 + i * 6} ${30 - i * 4}l6-4" ${sk('#f2b632', 2)}/>`).join('')}</g>` +
        `<text x="210" y="146" font-size="10" font-weight="700" text-anchor="middle" fill="${CL.t}" ${s.a(showAt(20))}>脑力</text>` +
        chip(s, 150, 22, 64, '动脑子', CL.t, 30) + chip(s, 140, 80, 64, '知识分子', CL.v, 44);
    }},
    // ---------- 第六十九批 ----------
    intelligent: {dur: 6, hl: [10, 30], end: 60, lit: '会挑会选的', mean: '聪明的；智能的', draw: s => {
      const path = move([[6, 0, 0], [20, 100, 0, 'rotate(0deg)'], [24, 100, 0, 'rotate(-90deg)'], [32, 100, -30, 'rotate(-90deg)'], [36, 100, -30, 'rotate(0deg)'], [52, 200, -30, 'rotate(0deg)']]);
      return `<rect x="0" y="40" width="300" height="110" fill="#f4efe6"/><path d="M0 40H300" ${sk(CL.m, 2)}/>` +
        `<path d="M150 118q6-10 14-4q6 10-4 14q-12 2-10-10z" fill="#e2473a"/><text x="158" y="140" font-size="8" font-weight="700" text-anchor="middle" fill="#d23c2f">袜子</text>` +
        `<g ${s.a(path, ORG(40, 116))}><g transform="translate(40 116)"><circle cx="0" cy="0" r="14" fill="#2a2f3a"/><circle cx="0" cy="0" r="9" fill="#4a5262"/><circle cx="8" cy="-4" r="2.5" fill="#6fe3ff"/></g></g>` +
        `<g ${s.a(showAt(18, 26))}><path d="M154 98l-4-6M162 96v-7M170 98l4-6" ${sk('#f2b632', 2)}/></g>` +
        chip(s, 150, 22, 64, '前面有东西', '#d23c2f', 18) + chip(s, 240, 22, 76, '自己绕开', CL.t, 34) + chip(s, 236, 136, 76, '智能扫地机', CL.v, 50);
    }},
    intend: {dur: 6, hl: [10, 24], end: 60, lit: '心朝目标伸过去', mean: '打算；想要', draw: s => {
      return GND() + `<path d="M150 128Q200 60 300 50V128z" fill="#cfe6b8"/><path d="M230 70V44h50v26z" fill="#f4efe6" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M226 46l29-16 29 16z" fill="#d23c2f"/><text x="255" y="62" font-size="8" font-weight="700" text-anchor="middle" fill="#d23c2f">大学</text>` +
        kid(70, 128, CL.t, {aR: [40, -54]}) + `<path d="M112 74Q170 30 226 56" ${sk(CL.v, 2.5)} fill="none" stroke-dasharray="5 5"/>` +
        `<path d="M112 74Q170 30 226 56" ${sk('#e2473a', 2.5)} fill="none" ${DASH} ${s.a(drawP(10, 30))}/><g ${s.a(pop(30), ORG(226, 56))}>${heartAt(220, 50, .7)}</g>` +
        chip(s, 90, 30, 92, '我打算考这里', CL.t, 20);
    }},
    introduction: {dur: 6, hl: [10, 20, 40], end: 60, lit: '引进来', mean: '介绍；引进；引言', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#2a2440"/><path d="M220 0L180 128H260z" fill="#f6e7a8" fill-opacity=".25" ${s.a(fadeP(14, 22))}/><rect x="0" y="128" width="300" height="22" fill="#8b5a3a"/>` +
        kid(100, 128, '#3d4a5c', {aR: [60, -38]}) +
        `<g ${s.a(move([[6, 100, 0], [18, 0, 0]]))}>${kid(220, 128, CL.a, Object.assign({}, walkLegs(s, 220, 128, 6, 18, 4)))}</g>` +
        `<g ${s.a(pop(24), ORG(220, 40))}><rect x="184" y="28" width="72" height="24" rx="4" fill="#fff"/><text x="220" y="44" font-size="11" font-weight="700" text-anchor="middle" fill="${CL.k}">新同学小红</text></g>` +
        chip(s, 90, 30, 92, '给大家介绍一下', CL.t, 10) + chip(s, 150, 139, 64, '欢迎！', '#f2b632', 40);
    }},
    investor: {dur: 6, hl: [10, 30], end: 60, lit: '投资的人', mean: '投资者', draw: s => {
      const coin = `<circle cx="0" cy="0" r="6" fill="#f2b632" style="stroke:#a8741a;stroke-width:1px"/>`;
      return GND() + kid(60, 128, '#2a2f3a', {aR: [44, -40]}) + `<path d="M140 108h40l-6 20h-28z" fill="#c9734a"/>` +
        [0, 1].map(i => `<g ${s.a((f => { f[18 + i * 6] = T(160, 106) + ';opacity:0'; f[92] = f[18 + i * 6]; return f; })(moveIn([[6 + i * 6, 104, 88], [16 + i * 6, 160, 106]])))}>${coin}</g>`).join('') +
        `<g ${s.a(growY(24, 44), FOOT)}><path d="M160 108V60" ${sk('#3f8f4f', 4)}/><circle cx="160" cy="52" r="24" fill="#5d9a4a"/></g>` +
        [[146, 46], [172, 42], [160, 62]].map(([x, y], i) => `<g ${s.a(pop(44 + i * 3), ORG(x, y))}><g transform="translate(${x} ${y})">${coin}</g></g>`).join('') +
        chip(s, 240, 40, 84, '投钱进去', CL.v, 10) + chip(s, 240, 80, 84, '等它长大', '#2f9f55', 46);
    }},
    leadership: {dur: 6, hl: [10, 30], end: 60, lit: '当领导的本事', mean: '领导能力', draw: s => {
      const crew = [[150, '#e2473a'], [180, '#4a90d0'], [210, '#3fbf6a'], [240, '#8e6bd0']];
      return GND() + crew.map(([x, c], i) => `<g ${s.a(move([[6, [-60, 40, -30, 30][i], [0, 0, 0, 0][i]], [34, 0, 0]]))}>${kid(x, 128, c, {k: .75})}</g>`).join('') +
        [0, 1, 2, 3].map(i => `<text x="${[90, 220, 150, 270][i]}" y="60" font-size="14" font-weight="700" fill="#888" ${s.a(showAt(4, 24))}>？</text>`).join('') +
        `<g ${s.a(move([[14, -60, 0], [26, 0, 0]]))}>${kid(100, 128, CL.t, {aR: [16, -64]})}<path d="M116 64V24" ${sk('#555', 2)}/><path d="M116 24h26l-6 7 6 7h-26z" fill="#d23c2f"/></g>` +
        `<g ${s.a(showAt(36))}>${[0, 1, 2].map(i => star5(200 + i * 20, 40, 7, 3, '#f6d34a')).join('')}</g>` +
        chip(s, 100, 140, 76, '跟我来！', '#d23c2f', 26) + chip(s, 220, 66, 76, '领导能力', CL.t, 40);
    }},
    liberal: {dur: 6, hl: [10, 30], end: 60, lit: '给人自由的', mean: '开明的；自由的', draw: s => {
      return GND() + kid(80, 128, CL.t, {k: .8}) + kid(160, 128, '#3d4a5c', {k: 1.15, aR: [40, -40]}) +
        `<rect x="230" y="50" width="50" height="78" fill="#f4efe6" style="stroke:var(--ink3);stroke-width:1.5px"/><g ${s.a({0: 'transform:scaleX(1)', 22: 'transform:scaleX(1)', 30: 'transform:scaleX(.2)', 92: 'transform:scaleX(.2)', 100: 'transform:scaleX(1)'}, ORG(230, 89))}><rect x="230" y="50" width="50" height="78" fill="#8b5a3a"/><circle cx="272" cy="90" r="2.5" fill="#f2b632"/></g>` +
        `<g ${s.a(showAt(30))}><path d="M240 70l8 8M258 64l2 10M266 80l8 2" ${sk('#f2b632', 2)}/><rect x="244" y="96" width="22" height="18" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/><circle cx="252" cy="104" r="3" fill="#e2473a"/><circle cx="259" cy="107" r="3" fill="#4a90d0"/></g>` +
        `<g ${s.a(pop(6), ORG(80, 40))}>${bubble(80, 40)}<text x="80" y="45" font-size="8" font-weight="700" text-anchor="middle" ${fl(CL.k)}>学画画？</text></g>` +
        chip(s, 170, 30, 64, '去吧！', '#2f9f55', 20) + chip(s, 150, 139, 92, '开明的爸爸', CL.v, 40);
    }},
    maintenance: {dur: 6, hl: [10, 20, 40], end: 60, lit: '用手一直照看', mean: '维护；保养', draw: s => {
      return GND() + `<rect x="40" y="88" width="120" height="30" rx="6" fill="#4a90d0"/><path d="M60 88l14-22h50l16 22z" fill="#4a90d0"/><rect x="82" y="70" width="34" height="16" fill="#dff2ff"/><circle cx="66" cy="120" r="9" fill="#333"/><circle cx="134" cy="120" r="9" fill="#333"/>` +
        `<g ${s.a({0: R(0), 6: R(0), 14: R(-40), 92: R(-40), 100: R(0)}, ORG(160, 88))}><path d="M140 88h22" ${sk('#2f74b5', 4)}/></g>` +
        kid(186, 128, '#f28a1a', {aL: [-22, -34]}) + `<g ${s.a({0: R(0), 25: R(-25), 50: R(0), 75: R(-25), 100: R(0)}, ORG(164, 94), .6)}><path d="M164 94l-12-4" ${sk('#9aa8b8', 4)}/><circle cx="150" cy="89" r="4" fill="none" style="stroke:#9aa8b8;stroke-width:3px"/></g>` +
        `<rect x="216" y="20" width="76" height="70" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/>` + ['换机油', '查轮胎', '洗车'].map((t, i) => `<text x="224" y="${40 + i * 18}" font-size="9" ${fl(CL.k)}>${t}</text><g ${s.a(pop(16 + i * 10), ORG(280, 36 + i * 18))}><path d="M275 ${36 + i * 18}l3 3 6-6" ${sk('#3fbf6a', 2.2)}/></g>`).join('') +
        chip(s, 100, 30, 76, '定期保养', CL.t, 46);
    }},
    massive: {dur: 6, hl: [10, 30], end: 60, lit: '一大块的', mean: '巨大的；大量的', draw: s => {
      return `<rect x="0" y="70" width="300" height="80" fill="#2f74b5" fill-opacity=".7"/>` +
        `<g ${s.a(move([[6, 0, 50], [24, 0, 0]]))}><path d="M30 96Q60 40 170 56Q230 64 250 90Q230 116 160 118Q60 124 30 96z" fill="#3d4a6a"/><path d="M250 90l30-24-6 24 6 24z" fill="#3d4a6a"/><circle cx="70" cy="80" r="3" fill="#fff"/><path d="M50 100q40 14 110 10" ${sk('#8a96b8', 2)} fill="none"/></g>` +
        `<g ${s.a(showAt(24))}><path d="M110 50q-6-16 0-24M110 50q6-16 14-20M110 50q-12-10-16-20" ${sk('#dff2ff', 2)} fill="none"/></g>` +
        `<g ${s.a({0: T(0, 0), 50: T(0, -2), 100: T(0, 0)}, '', 1)}><path d="M218 66h24l-4 6h-16z" fill="#c98a4a"/><path d="M230 66V54l8 6z" fill="#fff"/></g>` +
        `<text x="230" y="48" font-size="8" font-weight="700" text-anchor="middle" fill="#fff" ${s.a(showAt(24))}>小船</text>` + chip(s, 90, 20, 92, '巨大的鲸鱼', CL.t, 30);
    }},
    military: {dur: 6, hl: [10, 30], end: 60, lit: '军事的', mean: '军事的；军队', draw: s => {
      const march = {0: T(0, 0), 100: T(0, 0)}; for (let i = 0; i < 8; i++) march[6 + i * 10] = T(0, i % 2 ? -3 : 0);
      return GND() + `<g ${s.a(march)}>` + [60, 110, 160, 210].map(x => kid(x, 128, '#5d7a3a', {k: .85, aR: [6, -30]}) + `<path d="M${x - 11} ${128 - 62 * .85}q11-12 22 0z" fill="#3f5a2a"/>`).join('') + `</g>` +
        `<path d="M250 128V30" ${sk('#9aa8b8', 2.5)}/><g ${s.a({0: R(0), 50: R(4), 100: R(0)}, ORG(250, 30), 1)}><path d="M250 30h34v20h-34z" fill="#d23c2f"/>${star5(258, 38, 5, 2, '#f6d34a')}</g>` +
        `<text x="135" y="30" font-size="11" font-weight="700" text-anchor="middle" fill="#3f5a2a" ${s.a(showAt(10))}>一！二！一！</text>` +
        chip(s, 135, 139, 76, '军事训练', CL.t, 30);
    }},
    naturally: {dur: 6, hl: [10, 30], end: 60, lit: '自然地', mean: '自然地；当然', draw: s => {
      return GND() + `<path d="M90 128V60" ${sk('#8b5a3a', 8)}/><circle cx="90" cy="48" r="34" fill="#5d9a4a"/>` +
        `<g ${s.a(move([[34, 0, 0], [44, 0, 56]]))}><circle cx="112" cy="64" r="8" ${s.a({0: 'fill:#9bd04a', 10: 'fill:#9bd04a', 30: 'fill:#e2473a', 100: 'fill:#e2473a'})}/></g>` +
        `<circle cx="70" cy="40" r="7" fill="#e2473a"/><circle cx="96" cy="30" r="7" fill="#e2473a"/>` +
        kid(220, 128, CL.t) + `<g ${s.a(pop(46), ORG(240, 50))}>${bubble(240, 50)}<text x="240" y="55" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>当然啦</text></g>` +
        `<text x="160" y="40" font-size="9" font-weight="700" text-anchor="middle" fill="#3f8f4f" ${s.a(showAt(30))}>熟了</text>` +
        chip(s, 150, 139, 92, '熟了自然会掉', CL.v, 44);
    }},
    observation: {dur: 6, hl: [10, 30], end: 60, lit: '仔细看', mean: '观察；观测', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#1d2440"/><circle cx="240" cy="36" r="16" fill="#f6e7a8"/><path d="M0 128Q80 110 160 128z" fill="#2a3a2a"/>` +
        `<path d="M90 98L126 76" ${sk('#9aa8b8', 7)}/><path d="M98 112L104 96M110 112L104 96" ${sk('#9aa8b8', 2)}/>` + kid(70, 128, CL.t, {k: .85, aR: [20, -38]}) +
        `<path d="M126 76L224 40" ${sk('#f6e7a8', 1.5)} stroke-dasharray="3 4" ${s.a(showAt(8))}/>` +
        `<rect x="170" y="70" width="110" height="62" rx="3" fill="#fff"/><text x="178" y="84" font-size="8" font-weight="700" ${fl(CL.k)}>观察记录</text>` +
        [['M0 0a8 8 0 1 1 0 0.1', 0], ['M0 -8a8 8 0 0 1 0 16a4 8 0 0 0 0-16', 1], ['M0 -8a8 8 0 0 1 0 16z', 2]].map(([d, i]) => `<g ${s.a(pop(16 + i * 10), ORG(192 + i * 34, 108))}><circle cx="${192 + i * 34}" cy="108" r="8" fill="#eee" style="stroke:#999;stroke-width:1px"/><path d="M${192 + i * 34} 100a8 8 0 0 1 0 16a${[2, 5, 8][i]} 8 0 0 0 0-16" fill="#f2b632"/></g>`).join('') +
        chip(s, 70, 30, 76, '天天看月亮', CL.t, 10);
    }},
    persuade: {dur: 6, hl: [10, 30], end: 60, lit: '彻底劝服', mean: '说服；劝说', draw: s => {
      const head = {0: R(0), 10: R(0), 13: R(-12), 16: R(12), 19: R(0), 26: R(-12), 29: R(12), 32: R(0), 44: T(0, 0), 47: T(0, 5), 50: T(0, 0), 53: T(0, 5), 56: T(0, 0), 100: R(0)};
      return GND() + kid(90, 128, CL.t, {k: .75, aL: [-14, -40], aR: [14, -40]}) +
        `<g ${s.a(head, ORG(200, 80))}>${kid(200, 128, '#e2473a', {k: 1.1})}</g>` +
        [['求求你', 8], ['我会照顾它', 20], ['就这一次', 32]].map(([t, p], i) => `<g ${s.a(showAt(p, p + 10))}>${chip(s, 90, 40 - (i % 2) * 6, 76, t, CL.t, p)}</g>`).join('') +
        `<g ${s.a(moveIn([[44, 30, 0], [52, 0, 0]]))}><ellipse cx="140" cy="122" rx="12" ry="7" fill="#c98a4a"/><circle cx="130" cy="114" r="6" fill="#c98a4a"/><circle cx="128" cy="113" r="1.2" fill="${INK}"/></g>` +
        chip(s, 236, 40, 64, '好吧…', '#2f9f55', 44) + chip(s, 150, 139, 104, '磨了半天终于说动', CL.v, 52);
    }},
    // ---------- 第七十批 ----------
    productive: {dur: 6, hl: [10, 30], end: 60, lit: '产出多的', mean: '多产的；富有成效的', draw: s => {
      return GND() + `<rect x="200" y="20" width="90" height="76" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><text x="245" y="34" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>今日任务</text>` +
        ['背单词', '写作文', '做听力', '跑步'].map((t, i) => `<text x="208" y="${50 + i * 13}" font-size="8" ${fl(CL.k)}>${t}</text><g ${s.a(pop(10 + i * 8), ORG(280, 47 + i * 13))}><path d="M275 ${47 + i * 13}l3 3 6-6" ${sk('#3fbf6a', 2)}/></g>`).join('') +
        kid(70, 128, CL.t, {aR: [30, -34]}) + `<rect x="80" y="104" width="80" height="6" fill="${WOOD}"/><path d="M88 110v18M152 110v18" ${sk(WOOD, 3)}/>` +
        [0, 1, 2, 3, 4].map(i => `<g ${s.a(moveIn([[10 + i * 7, 0, -40], [14 + i * 7, 0, 0]]))}><rect x="120" y="${98 - i * 6}" width="30" height="6" fill="${['#e2473a', '#f2b632', '#3fbf6a', '#4a90d0', '#8e6bd0'][i]}" style="stroke:#fff;stroke-width:1px"/></g>`).join('') +
        chip(s, 100, 30, 92, '一天干了好多事', CL.t, 46) + chip(s, 245, 116, 64, '真充实', CL.a, 50);
    }},
    properly: {dur: 6, hl: [10, 30], end: 60, lit: '恰当地', mean: '恰当地；正确地', draw: s => {
      return GND() + kid(150, 128, CL.t, {aL: [-14, -54], aR: [14, -54]}) +
        `<g ${s.a({0: R(-30), 12: R(-30), 26: R(0), 92: R(0), 100: R(-30)}, ORG(150, 70))}><path d="M130 70a20 18 0 0 1 40 0z" fill="#e2473a"/><path d="M130 70h40" ${sk('#a82a2a', 3)}/></g>` +
        `<path d="M134 72q16 26 32 0" ${sk('#333', 2)} fill="none" ${s.a(showAt(30))}/>` +
        `<g ${s.a(pop(36), ORG(210, 60))}><circle cx="210" cy="60" r="12" fill="#3fbf6a"/><path d="M204 60l4 4 8-8" ${sk('#fff', 2.5)}/></g>` +
        `<g ${s.a(showAt(6, 24))}><path d="M100 50l-6-6M104 44l-2-8" ${sk('#d23c2f', 2)}/></g>` +
        chip(s, 70, 30, 64, '戴歪了', '#d23c2f', 6) + chip(s, 230, 30, 92, '戴正，扣好带子', CL.t, 30) + chip(s, 150, 139, 92, '正确地戴头盔', CL.v, 44);
    }},
    prospect: {dur: 6, hl: [10, 24], end: 60, lit: '向前看', mean: '前景；可能性', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#fbe3b8" fill-opacity=".6"/><circle cx="240" cy="96" r="30" fill="#f6d34a" ${s.a({0: T(0, 30), 10: T(0, 30), 40: T(0, 0), 92: T(0, 0), 100: T(0, 30)})}/>` +
        `<g ${s.a(showAt(30))}>${[0, 1, 2, 3, 4].map(i => `<path d="M${240 + 40 * Math.cos(Math.PI * (1 + i / 4))} ${96 + 40 * Math.sin(Math.PI * (1 + i / 4))}L${240 + 56 * Math.cos(Math.PI * (1 + i / 4))} ${96 + 56 * Math.sin(Math.PI * (1 + i / 4))}" ${sk('#f2b632', 2.5)}/>`).join('')}</g>` +
        [200, 220, 250, 270].map((x, i) => `<rect x="${x}" y="${100 - i % 2 * 10}" width="16" height="${30 + i % 2 * 10}" fill="#8fa3b8" ${s.a(fadeP(24, 34))}/>`).join('') +
        `<path d="M0 150V110Q60 88 120 104L150 150z" fill="#5d9a4a"/>` + kid(70, 98, CL.t, {k: .8, aR: [24, -36]}) + `<path d="M88 70L106 62" ${sk('#555', 5)}/>` +
        chip(s, 70, 30, 76, '往前看', CL.t, 10) + chip(s, 236, 30, 76, '前景光明', '#d23c2f', 40);
    }},
    protection: {dur: 6, hl: [10, 30], end: 60, lit: '保护', mean: '保护', draw: s => {
      const tree = (x, k) => `<path d="M${x} 128V${f1(128 - 40 * k)}" ${sk('#8b5a3a', 4 * k)}/><circle cx="${x}" cy="${f1(128 - 52 * k)}" r="${f1(18 * k)}" fill="#5d9a4a"/>`;
      return `<rect x="0" y="0" width="300" height="128" fill="#eaf6e0" fill-opacity=".5"/>` + GND() + tree(80, 1.1) + tree(130, .8) + tree(180, 1) +
        `<g ${s.a(growX(8, 24), ORG(50, 120))}><path d="M50 128V100M70 128V100M90 128V100M110 128V100M130 128V100M150 128V100M170 128V100M190 128V100M210 128V100M50 108H210M50 120H210" ${sk('#c9a06a', 3)}/></g>` +
        `<path d="M250 128V70" ${sk('#555', 3)}/><g ${s.a(pop(26), ORG(250, 60))}><rect x="224" y="44" width="52" height="32" rx="3" fill="#2f9f55"/><text x="250" y="58" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">保护区</text><text x="250" y="70" font-size="7" font-weight="700" text-anchor="middle" fill="#fff">禁止砍伐</text></g>` +
        `<g ${s.a(pop(36), ORG(250, 106))}><path d="M240 96l16 18M250 96l-4 6h10z" ${sk('#888', 3)}/><path d="M236 92l28 28M264 92l-28 28" ${sk('#d23c2f', 3)}/></g>` +
        chip(s, 130, 22, 76, '环境保护', CL.t, 44);
    }},
    punish: {dur: 6, hl: [10, 24], end: 60, lit: '惩罚', mean: '惩罚；处罚', draw: s => {
      return GND() + `<g ${s.a((f => { f[13] = T(0, 20) + ';opacity:0'; f[92] = f[13]; f[100] = f[13]; return f; })(move([[6, 0, 0], [12, 0, 20]])))}><path d="M60 92q-12-20 0-30h16q12 10 0 30z" fill="#4a90d0"/></g><g ${s.a(showAt(12))}><path d="M54 120l8-6 6 4 8-8 10 6" ${sk('#4a90d0', 3)} fill="none"/></g>` +
        kid(110, 128, CL.t, {k: .85, noFace: true, aR: [20, -24]}) + `<g ${s.a(hideAt(16))}>${face(110, 128, .85)}</g><g ${s.a(showAt(16))}>${face(110, 128, .85, 'sad')}</g>` +
        kid(230, 128, '#3d4a5c', {k: 1.15, aL: [-26, -50]}) +
        `<g ${s.a(showAt(28))}><path d="M128 108l18-40" ${sk('#a0703a', 3)}/><path d="M146 68l-6-6h14z" fill="#c9a06a"/></g>` +
        `<g ${s.a(pop(26), ORG(190, 40))}><rect x="154" y="26" width="72" height="26" rx="4" fill="#d23c2f"/><text x="190" y="43" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">罚扫地一周</text></g>` +
        chip(s, 70, 30, 52, '啪！', '#4a90d0', 8) + chip(s, 150, 139, 92, '做错事要受罚', CL.v, 42);
    }},
    remarkable: {dur: 6, hl: [10, 30], end: 60, lit: '值得一说的', mean: '显著的；非凡的', draw: s => {
      return `<path d="M40 20V120H270" ${sk(CL.k, 2)}/>` + [['一月', 70, 60], ['二月', 130, 62], ['三月', 190, 66], ['四月', 250, 95]].map(([t, x, v], i) => `<rect x="${x - 14}" y="${120 - v}" width="28" height="${v}" fill="${i === 3 ? '#e2473a' : '#9aa8b8'}" ${s.a(growY(6 + i * 8, 12 + i * 8), FOOT)}/><text x="${x}" y="134" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.k)}>${t}</text><text x="${x}" y="${114 - v}" font-size="9" font-weight="700" text-anchor="middle" fill="${i === 3 ? '#d23c2f' : '#888'}" ${s.a(showAt(12 + i * 8))}>${v}</text>`).join('') +
        `<g ${s.a(showAt(34))}>${sparkle(230, 14, 6)}${sparkle(272, 20, 5)}</g>` +
        chip(s, 120, 24, 116, '这次进步太显著了！', '#d23c2f', 40);
    }},
    remind: {dur: 6, hl: [10, 30], end: 60, lit: '再次进入脑子', mean: '提醒；使想起', draw: s => {
      return GND() + `<rect x="190" y="30" width="70" height="98" rx="4" fill="#dfe6ee" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M190 72H260M250 46v10M250 82v14" ${sk('#9aa8b8', 2)}/>` +
        `<g ${s.a(pop(6), ORG(210, 50))}><rect x="198" y="38" width="32" height="26" fill="#f6e94a" transform="rotate(-6 214 51)"/><text x="214" y="55" font-size="10" font-weight="700" text-anchor="middle" fill="#7a5a10">带伞</text></g>` +
        `<g ${s.a(move([[4, 0, 0], [18, 70, 0]]))}>${kid(80, 128, CL.t, Object.assign({}, walkLegs(s, 80, 128, 4, 18, 4)))}</g>` +
        `<g ${s.a(pop(24), ORG(150, 50))}><circle cx="150" cy="44" r="10" fill="#f6d34a"/><rect x="146" y="54" width="8" height="5" fill="#9aa8b8"/></g>` +
        `<g ${s.a(moveIn([[30, 0, 0], [34, 0, 0]]))}><path d="M174 60V96" ${sk('#333', 2)}/><path d="M156 64Q174 44 192 64z" fill="#4a90d0"/></g>` +
        chip(s, 70, 30, 76, '差点忘了', '#888', 18) + chip(s, 150, 139, 92, '便条提醒了我', CL.v, 36);
    }},
    resolve: {dur: 6, hl: [10, 30], end: 60, lit: '彻底解决', mean: '解决；决心', draw: s => {
      return `<g ${s.a(slot([0, 30, 99], 0))}><path d="M30 76C70 76 90 40 120 60S100 110 140 90S180 40 160 70S200 110 230 76H270" ${sk('#e2473a', 5)} fill="none"/><path d="M120 60q20 20 0 30q-20-10 0-30z" ${sk('#e2473a', 5)} fill="none"/><text x="150" y="124" font-size="11" font-weight="700" text-anchor="middle" fill="#d23c2f">乱成一团的问题</text></g>` +
        `<g ${s.a(slot([0, 30, 99], 1))}><path d="M30 76H270" ${sk('#3fbf6a', 5)}/><text x="150" y="124" font-size="11" font-weight="700" text-anchor="middle" fill="#2f9f55">理顺了</text></g>` +
        `<g ${s.a({0: T(0, 0), 10: T(0, 0), 14: T(-6, 4), 18: T(6, -4), 22: T(-6, 4), 26: T(6, -4), 30: T(0, 0), 100: T(0, 0)})}><circle cx="140" cy="40" r="7" fill="${SKIN}"/><circle cx="168" cy="40" r="7" fill="${SKIN}"/></g>` +
        `<g ${s.a(pop(34), ORG(260, 40))}><circle cx="260" cy="40" r="12" fill="#3fbf6a"/><path d="M254 40l4 4 8-8" ${sk('#fff', 2.5)}/></g>` +
        chip(s, 70, 26, 92, '一点点解开', CL.t, 12) + chip(s, 200, 26, 76, '彻底解决', '#2f9f55', 36);
    }},
    robotic: {dur: 6, hl: [10, 30], end: 60, lit: '机器人的', mean: '机器人的；机械的', draw: s => {
      const arm1 = {0: R(-30), 10: R(-30), 22: R(20), 30: R(20), 44: R(-50), 54: R(-50), 64: R(-30), 100: R(-30)};
      const arm2 = {0: R(40), 10: R(40), 22: R(60), 30: R(60), 44: R(20), 54: R(20), 64: R(40), 100: R(40)};
      return GND() + `<rect x="120" y="112" width="40" height="16" fill="#555"/><g ${s.a(arm1, ORG(140, 112))}><path d="M140 112V62" ${sk('#f2b632', 10)} stroke-linecap="round"/><circle cx="140" cy="112" r="8" fill="#333"/><g ${s.a(arm2, ORG(140, 62))}><path d="M140 62H190" ${sk('#f2b632', 8)} stroke-linecap="round"/><circle cx="140" cy="62" r="6" fill="#333"/><path d="M190 56v14M196 56v14" ${sk('#555', 3)}/></g></g>` +
        `<g ${s.a(move([[24, 0, 0], [30, 0, 0], [44, -110, -40], [54, -110, -40], [60, -110, 0]]))}><rect x="214" y="110" width="18" height="18" fill="#c98a4a"/></g>` +
        
        chip(s, 236, 30, 64, '机械臂', CL.t, 10) + chip(s, 150, 22, 76, '自动抓取', CL.v, 34);
    }},
    salary: {dur: 6, hl: [10, 30], end: 60, lit: '盐钱', mean: '薪水；工资', draw: s => {
      return `<path d="M150 20V130" ${sk(CL.m, 1.5)} stroke-dasharray="4 4"/>` + GND() +
        `<text x="75" y="24" font-size="10" font-weight="700" text-anchor="middle" fill="#a8741a">古罗马</text><text x="225" y="24" font-size="10" font-weight="700" text-anchor="middle" fill="${CL.t}" ${s.a(showAt(30))}>现在</text>` +
        kid(50, 128, '#a83228', {k: .85, aR: [30, -30]}) + `<path d="M38 72q12-12 24 0z" fill="#b8963a"/>` +
        `<g ${s.a(moveIn([[8, 60, 0], [18, 0, 0]]))}><path d="M86 88q-8 12 0 26h20q8-14 0-26l-4-6h-12z" fill="#fff" style="stroke:#c9a06a;stroke-width:1.5px"/><text x="96" y="106" font-size="9" font-weight="700" text-anchor="middle" fill="#888">盐</text></g>` +
        kid(200, 128, CL.t, {k: .85, aR: [30, -34]}) + `<g ${s.a(moveIn([[34, 60, 0], [44, 0, 0]]))}><rect x="230" y="76" width="50" height="32" rx="2" fill="#fff" style="stroke:var(--ink3);stroke-width:1px"/><text x="255" y="88" font-size="7" font-weight="700" text-anchor="middle" ${fl(CL.k)}>工资条</text><text x="255" y="101" font-size="9" font-weight="700" text-anchor="middle" fill="#d23c2f">8000 元</text></g>` +
        chip(s, 150, 139, 104, '工资原来是发盐', CL.v, 46);
    }},
    sophisticated: {dur: 6, hl: [10, 30], end: 60, lit: '充满智慧的', mean: '精密的；复杂的', draw: s => {
      const lines = ['M40 40H100V80H160', 'M40 60H80V110H200', 'M260 40H200V70H160', 'M260 100H220V80H160', 'M100 120V90H140V40H180', 'M60 120V96H120'];
      return `<rect x="20" y="20" width="260" height="112" rx="4" fill="#1f5a3a"/>` +
        lines.map((d, i) => `<path d="${d}" ${sk('#d8c070', 2)} fill="none"/><path d="${d}" ${sk('#fff6a0', 3)} fill="none" ${DASH} ${s.a(drawP(8 + i * 4, 20 + i * 4))}/>`).join('') +
        `<rect x="140" y="56" width="40" height="40" rx="2" fill="#2a2f3a"/><text x="160" y="80" font-size="8" font-weight="700" text-anchor="middle" fill="#9aa8b8">芯片</text>` + [0, 1, 2, 3].map(i => `<path d="M${146 + i * 9} 56v-6M${146 + i * 9} 96v6" ${sk('#ccc', 1.5)}/>`).join('') +
        [[40, 40], [260, 40], [260, 100], [60, 120], [200, 110], [180, 40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#d8c070"/>`).join('') +
        chip(s, 150, 139, 92, '精密又复杂', CL.t, 40) + chip(s, 236, 12, 76, '尖端技术', CL.a, 46);
    }},
    steady: {dur: 6, hl: [10, 30], end: 60, lit: '守得住位置', mean: '稳定的；稳步的', draw: s => {
      return GND() + `<g ${s.a(move([[6, 0, 0], [60, 170, 0]]))}>${kid(50, 128, CL.t, Object.assign({aR: [22, -40]}, walkLegs(s, 50, 128, 6, 60, 10)))}` +
        `<path d="M66 70h16l-2 22h-12z" fill="#dff2ff" fill-opacity=".7" style="stroke:#9aa8b8;stroke-width:1.5px"/><path d="M67 76h14v0l-1 15h-12z" fill="#6db7e8"/></g>` +
        `<path d="M10 40H290" ${sk(CL.m, 1)} stroke-dasharray="3 5"/><text x="150" y="34" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>水面一直平平的</text>` +
        chip(s, 150, 139, 76, '稳稳当当', CL.t, 30) + chip(s, 60, 70, 64, '一滴不洒', CL.a, 50);
    }},
    // ---------- 第七十一批 ----------
    supervisor: {dur: 6, hl: [10, 20, 40], end: 60, lit: '在上面看着的人', mean: '主管；导师', draw: s => {
      return GND() + `<rect x="190" y="60" width="100" height="68" fill="#9aa8b8"/><rect x="200" y="34" width="80" height="28" fill="#c6d0da" style="stroke:var(--ink3);stroke-width:1.5px"/>` +
        kid(240, 66, '#2a2f3a', {k: .7}) + `<circle cx="236" cy="38" r="3" fill="none" style="stroke:#333;stroke-width:1.2px"/><circle cx="244" cy="38" r="3" fill="none" style="stroke:#333;stroke-width:1.2px"/>` +
        [40, 90, 140].map(x => kid(x, 128, CL.t, {k: .75, aR: [16, -28]}) + `<rect x="${x + 6}" y="100" width="26" height="6" fill="${WOOD}"/>`).join('') +
        `<g ${s.a(showAt(14))}>${[50, 100, 150].map(x => `<path d="M230 46L${x} 90" ${sk('#f2b632', 1.2)} stroke-dasharray="3 4"/>`).join('')}</g>` +
        chip(s, 240, 20, 52, '主管', '#2a2f3a', 8) + chip(s, 90, 40, 104, '在上面看着大家', CL.v, 30);
    }},
    technique: {dur: 6, hl: [10, 30], end: 60, lit: '具体的手法', mean: '技巧；技术', draw: s => {
      const chop = {0: T(0, 0), 100: T(0, 0)}; for (let i = 0; i < 8; i++) { chop[8 + i * 6] = T(-i * 6, -14); chop[11 + i * 6] = T(-i * 6, 0); } chop[60] = T(-42, 0);
      return GND() + `<rect x="80" y="100" width="150" height="10" rx="2" fill="#c9a06a"/><rect x="40" y="110" width="220" height="18" fill="${WOOD}"/>` +
        `<rect x="140" y="88" width="70" height="12" rx="6" fill="#f28a1a"/>` +
        [...Array(8)].map((_, i) => `<g ${s.a(showAt(11 + i * 6))}><rect x="${214 + i * 5}" y="${90 + (i % 2) * 2}" width="4" height="10" rx="2" fill="#f2a64a"/></g>`).join('') +
        `<g ${s.a(chop)}><path d="M198 60h20v28h-20z" fill="#d8dde3" style="stroke:#9aa8b8;stroke-width:1px"/><rect x="202" y="44" width="12" height="18" rx="2" fill="#333"/></g>` +
        chip(s, 80, 30, 76, '刀工了得', CL.t, 16) + chip(s, 230, 40, 76, '切得又快又匀', CL.v, 40);
    }},
    transformation: {dur: 6, hl: [10, 30], end: 60, lit: '彻底变样', mean: '转变；改造', draw: s => {
      return GND() + [0, 1, 2, 3, 4].map(i => `<g ${s.a((f => { f[24 + i * 4] = T(170, -20 - i * 8, 'scale(.3)') + ';opacity:0'; f[92] = f[24 + i * 4]; return f; })(move([[10 + i * 4, 0, 0, 'scale(1)'], [24 + i * 4, 170, -20 - i * 8, 'scale(.3)']])))}><rect x="30" y="${108 - i * 10}" width="50" height="10" fill="#f4efe6" style="stroke:#c9a06a;stroke-width:1px"/></g>`).join('') +
        `<text x="55" y="126" font-size="9" font-weight="700" text-anchor="middle" ${fl(CL.m)}>纸质文件</text>` +
        `<rect x="200" y="62" width="70" height="46" rx="3" fill="#2a2f3a"/><rect x="204" y="66" width="62" height="38" fill="#6fe3ff" ${s.a(showAt(26))}/><path d="M190 110h90l-6 8h-78z" fill="#555"/>` +
        `<g ${s.a(showAt(40))}>${[0, 1, 2].map(i => `<rect x="${212 + i * 18}" y="74" width="12" height="16" rx="1" fill="#fff"/>`).join('')}</g>` +
        `<path d="M96 70H180M172 64l8 6-8 6" ${sk(CL.v, 2.5)} ${s.a(showAt(14))}/>` + chip(s, 150, 22, 92, '数字化转型', CL.t, 44);
    }},
    transition: {dur: 6, hl: [10, 20, 40], end: 60, lit: '走到下一阶段', mean: '过渡；转变', draw: s => {
      const poses = [`<path d="M-10 -44l10-6 10 6-10 4z" fill="#2a2f3a"/>`, `<path d="M0 -27l-3 4 3 10 3-10z" fill="#e2473a"/>`];
      return `<rect x="0" y="100" width="90" height="50" fill="#cfe6b8"/><rect x="210" y="100" width="90" height="50" fill="#d8dde3"/><path d="M90 100Q150 80 210 100" ${sk(WOOD, 6)} fill="none"/>` +
        `<text x="45" y="92" font-size="11" font-weight="700" text-anchor="middle" fill="#3f8f4f">学校</text><text x="255" y="92" font-size="11" font-weight="700" text-anchor="middle" fill="#555">职场</text>` +
        `<g ${s.a(move([[6, 0, 0], [30, 90, -16], [54, 180, 0]]))}><g transform="translate(50 100)">${kid(0, 0, CL.t, {k: .7})}<g ${s.a(slot([0, 30, 99], 0))}>${poses[0]}</g><g ${s.a(slot([0, 30, 99], 1))}>${poses[1]}</g></g></g>` +
        chip(s, 150, 30, 104, '从学生到上班族', CL.v, 44);
    }},
    turning: {dur: 6, hl: [10, 30], end: 60, lit: '转弯的地方', mean: '转弯处；岔道', draw: s => {
      const car = move([[6, 0, 0, 'rotate(0deg)'], [24, 110, 0, 'rotate(0deg)'], [34, 150, -20, 'rotate(-45deg)'], [46, 160, -70, 'rotate(-90deg)']]);
      return `<rect x="0" y="0" width="300" height="150" fill="#cfe6b8" fill-opacity=".6"/><path d="M0 116H170Q200 116 200 86V0" ${sk('#9aa8b8', 30)} fill="none"/><path d="M0 116H170Q200 116 200 86V0" ${sk('#fff', 1.5)} fill="none" stroke-dasharray="8 8"/>` +
        `<g ${s.a(car, ORG(40, 116))}><g transform="translate(40 116)"><rect x="-16" y="-8" width="32" height="16" rx="4" fill="#e2473a"/><rect x="2" y="-6" width="8" height="12" fill="#dff2ff"/></g></g>` +
        `<path d="M240 128V70" ${sk('#555', 3)}/><g ${s.a(pop(8), ORG(240, 56))}><path d="M240 40l16 16-16 16-16-16z" fill="#f2b632" style="stroke:#333;stroke-width:1.5px"/><path d="M234 62v-8h8l-3-3M242 54l-3 3" ${sk('#333', 2)} fill="none"/></g>` +
        chip(s, 90, 30, 76, '前方转弯', '#a8741a', 10) + chip(s, 260, 100, 64, '转弯处', CL.t, 40);
    }},
    unable: {dur: 6, hl: [10, 30], end: 60, lit: '不能的', mean: '不能的', draw: s => {
      const shake = {0: T(), 8: T()}; for (let p = 10; p < 44; p += 2) shake[p] = T(p % 4 ? -2 : 2, 0); shake[44] = T(); shake[100] = T();
      return GND() + `<g ${s.a(shake)}>${kid(140, 128, CL.t, {noFace: true, aL: [-14, -28], aR: [14, -28]})}${face(140, 128, 1, 'sad')}<rect x="128" y="94" width="24" height="26" rx="4" fill="#f4efe6" fill-opacity=".8" style="stroke:#9aa8b8;stroke-width:1.5px"/><rect x="126" y="88" width="28" height="8" rx="2" fill="#e2473a"/></g>` +
        `<g ${s.a(showAt(20))}><path d="M162 66q3 4 0 7M118 66q-3 4 0 7" ${sk('#6db7e8', 2)}/></g>` +
        chip(s, 140, 30, 64, '拧不开…', '#888', 20) + chip(s, 236, 100, 64, '做不到', '#d23c2f', 44);
    }},
    unit: {dur: 6, hl: [10, 30], end: 60, lit: '一个一个的', mean: '单位；单元', draw: s => {
      return `<rect x="60" y="40" width="160" height="64" rx="3" fill="#8b5a3a"/>` + [...Array(8)].map((_, i) => { const x = 64 + (i % 4) * 39, y = 44 + Math.floor(i / 4) * 30; return i === 3 ? '' : `<rect x="${x}" y="${y}" width="35" height="26" rx="2" fill="#a0703a"/>`; }).join('') +
        `<g ${s.a(move([[12, 0, 0], [24, 50, -20, 'rotate(15deg)']]), ORG(199, 57))}><rect x="181" y="44" width="35" height="26" rx="2" fill="#a0703a" style="stroke:#6b4f34;stroke-width:1px"/></g>` +
        `<text x="250" y="22" font-size="10" font-weight="700" text-anchor="middle" fill="#8b5a3a" ${s.a(showAt(26))}>1 块</text>` +
        `<text x="140" y="124" font-size="11" font-weight="700" text-anchor="middle" ${fl(CL.k)} ${s.a(showAt(30))}>一共 8 个单位</text>` + chip(s, 60, 22, 92, '一块就是一个单位', CL.t, 34);
    }},
    vulnerable: {dur: 6, hl: [10, 30], end: 60, lit: '容易受伤的', mean: '脆弱的', draw: s => {
      return `<rect x="0" y="0" width="300" height="100" fill="#dff2ff"/><rect x="0" y="100" width="300" height="50" fill="#f2deb0"/><path d="M230 100Q260 94 300 100V150H260z" fill="#4a90d0"/>` +
        `<g ${s.a(move([[6, 0, 0], [60, 80, 0]]))}><ellipse cx="120" cy="120" rx="10" ry="7" fill="#5d9a4a"/><circle cx="131" cy="117" r="4" fill="#7fbf6a"/><path d="M113 126l-3 3M127 126l3 3" ${sk('#7fbf6a', 2)}/></g>` +
        `<g ${s.a(move([[10, 260, -10], [40, 0, 0]]))}><path d="M120 50q10-10 20 0q10-10 20 0" ${sk('#555', 3)} fill="none"/></g>` +
        `<g ${s.a(showAt(36))}><path d="M140 60l-6 34" ${sk('#d23c2f', 1.5)} stroke-dasharray="3 3"/></g>` +
        chip(s, 70, 30, 76, '刚出壳的小龟', CL.t, 10) + chip(s, 236, 40, 76, '很容易受伤', '#d23c2f', 36);
    }},
    wildlife: {dur: 6, hl: [10, 30], end: 60, lit: '野外的生命', mean: '野生动植物', draw: s => {
      return `<rect x="0" y="0" width="300" height="150" fill="#fbe3b8" fill-opacity=".5"/><rect x="0" y="110" width="300" height="40" fill="#d8c07a"/>` +
        `<path d="M250 110V60" ${sk('#8b5a3a', 5)}/><ellipse cx="250" cy="56" rx="34" ry="10" fill="#5d9a4a"/>` +
        `<g ${s.a(pop(8), ORG(70, 110))}><ellipse cx="70" cy="86" rx="28" ry="18" fill="#9aa8b8"/><circle cx="44" cy="80" r="14" fill="#9aa8b8"/><path d="M34 86q-6 14 2 24" ${sk('#9aa8b8', 6)} fill="none"/><path d="M54 104v8M66 104v8M80 104v8M92 104v8" ${sk('#9aa8b8', 7)}/><ellipse cx="50" cy="76" rx="6" ry="9" fill="#8a96a6"/></g>` +
        `<g ${s.a(pop(18), ORG(150, 110))}><path d="M146 46v36" ${sk('#f2b632', 6)}/><ellipse cx="156" cy="90" rx="16" ry="9" fill="#f2b632"/><circle cx="146" cy="42" r="6" fill="#f2b632"/><path d="M146 98v12M166 98v12" ${sk('#f2b632', 4)}/><circle cx="152" cy="88" r="2.5" fill="#a8741a"/><circle cx="160" cy="92" r="2.5" fill="#a8741a"/></g>` +
        `<g ${s.a(pop(28), ORG(210, 110))}><ellipse cx="210" cy="96" rx="16" ry="9" fill="#fff" style="stroke:#333;stroke-width:1px"/><path d="M200 90v12M206 88v14M212 88v14M218 90v12" ${sk('#333', 2)}/><circle cx="196" cy="88" r="5" fill="#fff" style="stroke:#333;stroke-width:1px"/><path d="M202 104v6M218 104v6" ${sk('#333', 3)}/></g>` +
        chip(s, 150, 22, 92, '野生动植物', CL.t, 38) + chip(s, 150, 136, 64, '大草原', '#a8741a', 44);
    }},
    willing: {dur: 6, hl: [10, 30], end: 60, lit: '心里愿意的', mean: '乐意的；自愿的', draw: s => {
      return GND() + kid(220, 128, '#8a96a6', {k: .9}) + `<path d="M244 128V96" ${sk(WOOD, 2.5)}/>` +
        `<g ${s.a(move([[6, -60, 0], [20, 0, 0]]))}>${kid(150, 128, CL.t, Object.assign({aR: [22, -30]}, walkLegs(s, 150, 128, 6, 20, 4)))}</g>` +
        `<g ${s.a(move([[22, 0, 0], [30, -50, -4]]))}><rect x="222" y="98" width="22" height="22" rx="3" fill="#e2473a"/><path d="M227 98q6-8 12 0" ${sk('#a82a2a', 2)} fill="none"/></g>` +
        `<g ${s.a(pop(32), ORG(186, 50))}>${heartAt(186, 44, 1)}</g>` +
        chip(s, 110, 40, 92, '我来帮您拿！', CL.t, 16) + chip(s, 150, 139, 92, '乐意帮忙', CL.a, 40);
    }},
    wireless: {dur: 6, hl: [10, 30], end: 60, lit: '没有线的', mean: '无线的', draw: s => {
      return GND() + `<rect x="120" y="96" width="60" height="22" rx="4" fill="#2a2f3a"/><path d="M134 96V76M166 96V76" ${sk('#2a2f3a', 3)}/><circle cx="136" cy="107" r="2.5" fill="#3fbf6a"/><circle cx="146" cy="107" r="2.5" fill="#3fbf6a"/>` +
        [0, 1, 2].map(i => `<path d="M${150 - 14 - i * 12} ${80 - i * 8}a${14 + i * 12} ${14 + i * 12} 0 0 1 ${28 + i * 24} 0" ${sk('#4a90d0', 3)} fill="none" ${s.a({0: 'opacity:0', [10 + i * 5]: 'opacity:0', [14 + i * 5]: 'opacity:1', 92: 'opacity:1', 100: 'opacity:0'})}/>`).join('') +
        `<rect x="34" y="70" width="24" height="40" rx="4" fill="#3d4a5c"/><rect x="37" y="74" width="18" height="30" fill="#6fe3ff" ${s.a(showAt(30))}/>` +
        `<rect x="236" y="88" width="44" height="28" rx="2" fill="#3d4a5c"/><rect x="240" y="92" width="36" height="20" fill="#6fe3ff" ${s.a(showAt(34))}/><path d="M230 118h56" ${sk('#555', 4)}/>` +
        `<g ${s.a(showAt(6, 22))}><path d="M60 122q40 10 60 -10" ${sk('#333', 2)} fill="none"/></g><g ${s.a(showAt(20, 40))}><path d="M80 108l16 16M96 108l-16 16" ${sk('#d23c2f', 3)}/></g>` +
        chip(s, 150, 30, 92, '不用线也能连', CL.t, 30) + chip(s, 150, 139, 64, '无线网', CL.v, 44);
    }},
    workforce: {dur: 6, hl: [10, 30], end: 60, lit: '工作的力量', mean: '劳动力', draw: s => {
      return GND() + `<rect x="210" y="60" width="86" height="68" fill="#9aa8b8"/><path d="M210 60l21-16v16l21-16v16l21-16v16" fill="#9aa8b8"/><rect x="230" y="96" width="36" height="32" fill="#555"/>` +
        `<g ${s.a(move([[6, -80, 0], [50, 40, 0]]))}>` + [...Array(10)].map((_, i) => kid(20 + (i % 5) * 30 + Math.floor(i / 5) * 15, 128 - Math.floor(i / 5) * 6, ['#f28a1a', '#4a90d0', '#3fbf6a'][i % 3], Object.assign({k: .55}, walkLegs(s, 20 + (i % 5) * 30 + Math.floor(i / 5) * 15, 128 - Math.floor(i / 5) * 6, 6, 50, 8, .55)))).join('') + `</g>` +
        ['100 人', '500 人', '1000 人'].map((t, i) => `<text x="253" y="40" font-size="12" font-weight="700" text-anchor="middle" fill="${CL.t}" ${s.a(slot([0, 20, 38, 99], i))}>${t}</text>`).join('') +
        chip(s, 100, 30, 92, '干活的人力', CL.v, 40);
    }},
    // ---------- 第七十二批 ----------
    absolutely: {dur: 6, hl: [10, 30], end: 60, lit: '绝对地', mean: '完全地；当然', draw: s => {
      return `<rect x="40" y="56" width="220" height="26" rx="13" fill="#e8ecf0" style="stroke:var(--ink3);stroke-width:2px"/><rect x="43" y="59" width="214" height="20" rx="10" fill="#3fbf6a" ${s.a(growX(8, 34), ORG(43, 69))}/>` +
        ['20%', '60%', '100%'].map((t, i) => `<text x="150" y="48" font-size="14" font-weight="700" text-anchor="middle" fill="${i === 2 ? '#2f9f55' : CL.k}" ${s.a(slot([0, 16, 34, 99], i))}>${t}</text>`).join('') +
        `<g ${s.a(pop(38), ORG(150, 112))}><g transform="rotate(-8 150 112)"><rect x="104" y="98" width="92" height="28" rx="4" fill="none" style="stroke:#d23c2f;stroke-width:3px"/><text x="150" y="118" font-size="14" font-weight="700" text-anchor="middle" fill="#d23c2f">绝对没错</text></g></g>` +
        chip(s, 60, 24, 76, '完完全全', CL.t, 30) + chip(s, 246, 24, 64, '当然！', CL.a, 46);
    }},
    accomplish: {dur: 6, hl: [10, 30], end: 60, lit: '完成', mean: '完成；实现', draw: s => {
      const cells = [[80, 30], [130, 30], [180, 30], [80, 70], [130, 70], [180, 70]];
      return `<rect x="76" y="26" width="158" height="88" fill="#f4efe6" style="stroke:var(--ink3);stroke-width:2px"/>` +
        cells.map(([x, y], i) => `<g ${s.a(i === 5 ? moveIn([[30, 80, 30], [40, 0, 0]]) : pop(6 + i * 4), ORG(x + 25, y + 20))}><rect x="${x}" y="${y}" width="50" height="40" fill="${['#e2473a', '#f2b632', '#3fbf6a', '#4a90d0', '#8e6bd0', '#f48fb1'][i]}" style="stroke:#fff;stroke-width:2px"/></g>`).join('') +
        `<g ${s.a(showAt(42))}>${star5(155, 70, 22, 10, '#fff')}${sparkle(70, 30, 7)}${sparkle(244, 100, 6)}</g>` +
        chip(s, 150, 12, 92, '最后一块放好', CL.v, 30) + chip(s, 150, 132, 76, '大功告成', '#d23c2f', 44);
    }},
    adverse: {dur: 6, hl: [10, 20], end: 60, lit: '转过来跟你作对', mean: '不利的', draw: s => {
      return `<rect x="0" y="90" width="300" height="60" fill="#4a90d0" fill-opacity=".7"/>` +
        `<g ${s.a({0: T(0, 0), 10: T(0, 0), 30: T(-30, 0), 50: T(-20, 2), 70: T(-40, 0), 92: T(-40, 0), 100: T(0, 0)})}><path d="M110 94h60l-8 12h-44z" fill="#8b5a3a"/><path d="M140 94V40" ${sk('#555', 2.5)}/><path d="M140 44q-24 20 0 46z" fill="#fff" style="stroke:#9aa8b8;stroke-width:1px" ${s.a({0: 'transform:scaleX(1)', 10: 'transform:scaleX(1)', 20: 'transform:scaleX(-1)', 92: 'transform:scaleX(-1)', 100: 'transform:scaleX(1)'}, ORG(140, 60))}/></g>` +
        [0, 1, 2].map(i => `<g ${s.a({0: 'opacity:0;' + T(0, 0), 10: 'opacity:1;' + T(0, 0), 100: 'opacity:0;' + T(-120, 0)}, `animation-delay:${(i * .3).toFixed(1)}s`, 1)}><path d="M${270} ${40 + i * 18}h-40M238 ${34 + i * 18}l-8 6 8 6" ${sk('#9aa8b8', 2.5)} fill="none"/></g>`).join('') +
        `<path d="M40 70h50M84 64l6 6-6 6" ${sk('#3fbf6a', 2)} fill="none"/><text x="64" y="60" font-size="9" font-weight="700" text-anchor="middle" fill="#2f9f55">想往这边</text>` +
        chip(s, 236, 120, 76, '逆风，不利', '#d23c2f', 20);
    }},
    anticipate: {dur: 6, hl: [10, 20], end: 60, lit: '提前拿到手', mean: '预料；预期', draw: s => {
      return GND() + `<rect x="230" y="50" width="62" height="78" fill="none" style="stroke:#fff;stroke-width:4px"/><rect x="230" y="50" width="62" height="78" fill="none" style="stroke:#9aa8b8;stroke-width:2px"/>` +
        `<g ${s.a(move([[10, 0, 0], [20, 0, -30, 'rotate(-30deg)'], [30, 0, -30, 'rotate(-30deg)'], [40, 0, 0, 'rotate(0deg)']]), ORG(250, 128))}>${kid(250, 128, '#f2b632', {aR: [24, -62], aL: [-6, -40]})}</g>` +
        `<g ${s.a(moveIn([[18, 60, 120], [30, 268, 68]]))}><circle cx="0" cy="0" r="7" fill="#fff" style="stroke:var(--ink3);stroke-width:1.5px"/><path d="M-3 -2l3-2 3 2-1 3h-4z" fill="#333"/></g>` +
        kid(50, 128, CL.t, {k: .8}) + `<path d="M250 40l20 20" ${sk('#d23c2f', 2)} stroke-dasharray="3 3" ${s.a(showAt(8, 20))}/>` +
        chip(s, 150, 30, 92, '提前料到往哪飞', CL.t, 12) + chip(s, 150, 139, 64, '接住了！', '#2f9f55', 32);
    }},
    apartment: {dur: 6, hl: [10, 30], end: 60, lit: '隔开的一套套', mean: '公寓', draw: s => {
      const rooms = [[90, 30, '#fbe3b8'], [150, 30, '#dff2ff'], [90, 66, '#eaf6e0'], [150, 66, '#f8dde6'], [90, 102, '#f4efe6'], [150, 102, '#e8e0f4']];
      return GND() + `<rect x="86" y="26" width="128" height="102" fill="#9aa8b8"/>` +
        rooms.map(([x, y, c], i) => `<g ${s.a(pop(6 + i * 4), ORG(x + 28, y + 16))}><rect x="${x}" y="${y}" width="56" height="32" fill="${c}"/><circle cx="${x + 20}" cy="${y + 14}" r="4" fill="${SKIN}"/><rect x="${x + 16}" y="${y + 18}" width="8" height="10" fill="${['#e2473a', '#4a90d0', '#3fbf6a', '#8e6bd0', '#f2b632', '#2a2f3a'][i]}"/><text x="${x + 42}" y="${y + 12}" font-size="7" font-weight="700" fill="#888">${['601', '602', '401', '402', '201', '202'][i]}</text></g>`).join('') +
        `<path d="M150 26V128M86 62H214M86 98H214" ${sk('#fff', 3)} ${s.a(showAt(4))}/>` +
        chip(s, 50, 30, 64, '隔成一套套', CL.t, 30) + chip(s, 256, 80, 52, '公寓', CL.v, 42);
    }},
    attractive: {dur: 6, hl: [10, 30], end: 60, lit: '把人拉过来的', mean: '有吸引力的', draw: s => {
      const tail = [...Array(9)].map((_, i) => { const a = Math.PI * (1.05 + i * .1); return `<ellipse cx="${f1(150 + 50 * Math.cos(a))}" cy="${f1(100 + 50 * Math.sin(a))}" rx="10" ry="22" fill="#3fbf6a" transform="rotate(${f1(a * 180 / Math.PI + 90)} ${f1(150 + 50 * Math.cos(a))} ${f1(100 + 50 * Math.sin(a))})"/><circle cx="${f1(150 + 56 * Math.cos(a))}" cy="${f1(100 + 56 * Math.sin(a))}" r="5" fill="#4a90d0"/><circle cx="${f1(150 + 56 * Math.cos(a))}" cy="${f1(100 + 56 * Math.sin(a))}" r="2" fill="#f2b632"/>`; }).join('');
      return GND() + `<g ${s.a({0: 'transform:scale(.2)', 8: 'transform:scale(.2)', 20: 'transform:scale(1)', 92: 'transform:scale(1)', 100: 'transform:scale(.2)'}, ORG(150, 100))}>${tail}</g>` +
        `<ellipse cx="150" cy="104" rx="12" ry="18" fill="#2f74b5"/><circle cx="150" cy="80" r="7" fill="#2f74b5"/><path d="M156 80l5 1-5 2z" fill="#f2b632"/><path d="M146 116v12M154 116v12" ${sk('#a8741a', 2)}/>` +
        [[30, 0], [270, 1]].map(([x, i]) => `<g ${s.a(move([[22 + i * 4, 0, 0], [40 + i * 4, i ? -50 : 50, 0]]))}><ellipse cx="${x}" cy="118" rx="9" ry="7" fill="#c9a06a"/><circle cx="${x + (i ? -8 : 8)}" cy="110" r="4" fill="#c9a06a"/></g>`).join('') +
        `<g ${s.a(pop(40), ORG(150, 30))}>${heartAt(130, 26, .8)}${heartAt(170, 22, 1)}</g>` + chip(s, 150, 139, 92, '好看，有吸引力', CL.a, 40);
    }},
    authority: {dur: 6, hl: [10, 30], end: 60, lit: '说了算的人', mean: '权威；当局', draw: s => {
      return `<rect x="0" y="0" width="300" height="128" fill="#cfe6b8" fill-opacity=".6"/>` + GND() +
        kid(70, 128, '#e2473a', {k: .85}) + kid(110, 128, '#4a90d0', {k: .85, aR: [16, -40]}) +
        `<g ${s.a({0: T(), 18: T(), 22: T(0, 0) + ';opacity:1', 100: T()})}>${kid(200, 128, '#2a2f3a', {aR: [20, -66]})}</g>` +
        `<g ${s.a(pop(16), ORG(222, 54))}><rect x="214" y="40" width="16" height="22" rx="2" fill="#e2473a"/></g>` +
        `<g ${s.a(showAt(12, 30))}>${[0, 1].map(i => `<path d="M${180 - i * 8} ${70 - i * 4}a${8 + i * 6} ${8 + i * 6} 0 0 0 0 ${16 + i * 12}" ${sk('#555', 2)}/>`).join('')}</g>` +
        `<text x="90" y="56" font-size="12" font-weight="700" fill="#888" ${s.a(showAt(30))}>…好吧</text>` +
        chip(s, 200, 22, 64, '哔——！', '#555', 10) + chip(s, 150, 139, 76, '裁判说了算', '#d23c2f', 30);
    }},
    belong: {dur: 6, hl: [10, 30], end: 60, lit: '长久待在一起', mean: '属于；适合', draw: s => {
      const pz = 'h18q-4-10 6-10t6 10h18v18q10-4 10 6t-10 6v18h-48z';
      return `<rect x="60" y="20" width="180" height="104" fill="#f4efe6" style="stroke:var(--ink3);stroke-width:2px"/>` +
        [[60, 20, '#4a90d0'], [120, 20, '#3fbf6a'], [180, 20, '#f2b632'], [60, 72, '#e2473a'], [180, 72, '#f48fb1']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="60" height="52" fill="${c}" style="stroke:#fff;stroke-width:2px"/>`).join('') +
        `<rect x="120" y="72" width="60" height="52" fill="#fff" style="stroke:#c9b8a0;stroke-width:2px" stroke-dasharray="4 3"/>` +
        `<g ${s.a(move([[6, 140, 10, 'rotate(30deg)'], [26, 0, 0, 'rotate(0deg)']]), ORG(150, 98))}><rect x="120" y="72" width="60" height="52" fill="#8e6bd0" style="stroke:#fff;stroke-width:2px"/></g>` +
        `<g ${s.a(pop(30), ORG(150, 98))}><circle cx="150" cy="98" r="12" fill="#3fbf6a"/><path d="M144 98l4 4 8-8" ${sk('#fff', 2.5)}/></g>` +
        chip(s, 150, 139, 92, '它就属于这里', CL.t, 34);
    }},
    capable: {dur: 6, hl: [10, 30], end: 60, lit: '拿得下的', mean: '有能力的；能干的', draw: s => {
      const ball = (c, ph) => `<g ${s.a({0: T(-24, 0), 25: T(0, -50), 50: T(24, 0), 75: T(0, 10), 100: T(-24, 0)}, `animation-delay:${ph}s`, 1.2)}><circle cx="150" cy="70" r="7" fill="${c}"/></g>`;
      return GND() + kid(150, 128, CL.t, {aL: [-24, -40], aR: [24, -40]}) + ball('#e2473a', 0) + ball('#f2b632', -.4) + ball('#4a90d0', -.8) +
        `<rect x="40" y="96" width="44" height="32" fill="#c98a4a"/><rect x="40" y="64" width="44" height="32" fill="#c98a4a" ${s.a(showAt(30))}/><rect x="216" y="96" width="44" height="32" fill="#c98a4a" ${s.a(showAt(36))}/>` +
        chip(s, 150, 22, 92, '一个人全拿得下', CL.t, 20) + chip(s, 240, 60, 52, '能干', CL.a, 40);
    }},
    combat: {dur: 6, hl: [10, 20], end: 60, lit: '一起打', mean: '与…斗争；战斗', draw: s => {
      const fire = {0: 'transform:scale(1)', 20: 'transform:scale(1)', 50: 'transform:scale(.15)', 92: 'transform:scale(.15)', 100: 'transform:scale(1)'};
      return GND() + `<rect x="190" y="56" width="90" height="72" fill="#9a8f80"/><rect x="204" y="70" width="22" height="20" fill="#555"/><rect x="244" y="70" width="22" height="20" fill="#555"/>` +
        `<g ${s.a(fire, ORG(235, 70))}><path d="M206 74q-10-24 14-44q0 16 10 18q6-14 0-28q26 20 16 54z" fill="#f28a1a"/><path d="M220 74q-4-12 6-22q2 10 8 10q-2 12-14 12z" fill="#f6d34a"/></g>` +
        kid(70, 128, '#e2473a', {aR: [40, -40]}) + `<path d="M58 66q-10 0-8 6h20q2-6-8-6z" fill="#f2b632"/><path d="M110 88l14-6" ${sk('#555', 5)}/>` +
        `<g ${s.a(showAt(14, 52))}>${[0, 1, 2].map(i => `<path d="M124 82Q170 ${40 + i * 10} 210 ${64 + i * 6}" ${sk('#6db7e8', 3)} fill="none" stroke-dasharray="6 4"/>`).join('')}</g>` +
        chip(s, 100, 30, 76, '跟大火斗', '#d23c2f', 14) + chip(s, 236, 30, 64, '扑灭了', '#2f9f55', 52);
    }},
    competitive: {dur: 6, hl: [10, 30], end: 60, lit: '能跟人比的', mean: '有竞争力的', draw: s => {
      return GND() + [[40, '甲店', '120 元', '#9aa8b8'], [180, '乙店', '80 元', '#3fbf6a']].map(([x, t, p, c], i) => `<rect x="${x}" y="50" width="80" height="78" fill="#f4efe6" style="stroke:var(--ink3);stroke-width:1.5px"/><rect x="${x}" y="40" width="80" height="14" fill="${c}"/><text x="${x + 40}" y="51" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">${t}</text>` +
        `<g ${s.a(pop(8 + i * 8), ORG(x + 40, 80))}><rect x="${x + 14}" y="70" width="52" height="20" rx="3" fill="#fff" style="stroke:${i ? '#d23c2f' : '#888'};stroke-width:2px"/><text x="${x + 40}" y="84" font-size="11" font-weight="700" text-anchor="middle" fill="${i ? '#d23c2f' : '#888'}">${p}</text></g>`).join('') +
        [0, 1, 2].map(i => `<g ${s.a(move([[20 + i * 4, 0, 0], [40 + i * 4, 70 + i * 6, 0]]))}>${kid(130 + i * 8, 128, ['#e2473a', '#4a90d0', '#8e6bd0'][i], {k: .55})}</g>`).join('') +
        chip(s, 220, 22, 104, '价格有竞争力', '#d23c2f', 40);
    }},
    concerning: {dur: 6, hl: [10, 30], end: 60, lit: '涉及到的', mean: '关于', draw: s => {
      return `<rect x="60" y="14" width="180" height="120" rx="3" fill="#fff" style="stroke:var(--ink3);stroke-width:2px"/><rect x="60" y="14" width="180" height="8" fill="#d23c2f"/>` +
        `<rect x="94" y="29" width="25" height="15" fill="#f6e94a" ${s.a(growX(10, 18), ORG(94, 36))}/>` +
        `<text x="150" y="40" font-size="11" font-weight="700" text-anchor="middle" fill="#d23c2f">关于国庆放假的通知</text>` +
        ['1. 放假时间：10 月 1 日起', '2. 共放 7 天', '3. 注意安全'].map((t, i) => `<text x="76" y="${66 + i * 18}" font-size="9" ${fl(CL.k)} ${s.a(showAt(20 + i * 6))}>${t}</text>`).join('') +
        `<path d="M90 36h-24M72 30l-6 6 6 6" ${sk('#a8741a', 2)} fill="none" ${s.a(showAt(18))}/>` +
        chip(s, 40, 70, 52, '关于', '#a8741a', 16) + chip(s, 150, 140, 92, '说的是哪件事', CL.v, 40);
    }},
  };
  // 同一个标签上写了两个 style（颜色 + 动画）时合并成一个，否则浏览器只认第一个
  const mergeStyles = html => html.replace(/<[a-z][^>]*>/gi, tag => {
    const m = tag.match(/ style="[^"]*"/g); if (!m || m.length < 2) return tag;
    const merged = ` style="${m.map(x => x.slice(8, -1).replace(/;$/, '')).join(';')}"`;
    let first = true;
    return tag.replace(/ style="[^"]*"/g, () => first ? (first = false, merged) : '');
  });
  // 场景 HTML：舞台 + 下面的算式（词块按 hl 的时间点一节节亮起，最后亮出「直译 → 词义」）
  function sceneHtml(w){
    const def = SCENES[w.w]; if (!def || !w.parts) return '';
    const s = new Stage(w.w.replace(/[^a-z]/gi, ''), def.dur || 5), svg = mergeStyles(def.draw(s)), n = w.parts.length;
    const lit = p => ({0: 'opacity:.35;transform:none', [p]: 'opacity:.35;transform:none', [p + 3]: 'opacity:1;transform:scale(1.1)', [p + 6]: 'opacity:1;transform:none', 94: 'opacity:1;transform:none', 100: 'opacity:.35;transform:none'});
    const chips = w.parts.map(([seg, m], i) => `<span class="sc-chip r-${role(seg, i, n)}" ${s.a(lit(def.hl[i] != null ? def.hl[i] : def.end))}><b>${esc(seg)}</b>${esc(m)}</span>`).join('<i>+</i>');
    const end = `<span class="sc-end" ${s.a({0: 'opacity:0', [def.end]: 'opacity:0', [def.end + 4]: 'opacity:1', 94: 'opacity:1', 100: 'opacity:0'})}>→ ${esc(def.lit)} → <b>${esc(def.mean || shortMean(w))}</b></span>`;
    return `<div class="scene" style="--d:150ms"><style>${s.css}</style><svg viewBox="0 0 300 150" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svg}</svg><div class="sc-cap">${chips}${end}</div><button class="anim-replay" data-replay="1" title="重新播放">↻ 重播</button></div>`;
  }
  window.CET6_SCENES = {has: w => !!SCENES[w], html: sceneHtml, list: Object.keys(SCENES)};
})();
