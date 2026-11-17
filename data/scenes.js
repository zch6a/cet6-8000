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
