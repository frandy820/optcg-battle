// F13 融合探针：真实页面进局 → 公开 API restoreFromSnapshot 构造素材局 →
// 融合按钮亮出/素材金光 → 面板选配方 → 确认 → 融合体上场+墓场+2+演出横幅+无 JS 错误
// 骨架抄 probe-skillfx.mjs（CHROME_BIN + --headless + 独立 user-data-dir + 随机端口 9300+randint）
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(new URL('.', import.meta.url).pathname.replace(/^\//, '').replace(/\//g, '\\'), '..');
const PAGE = 'file:///' + join(ROOT, 'web', 'index.html').replace(/\\/g, '/');
function findChrome() {
  const cands = [
    process.env.CHROME_BIN,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  ].filter((x) => typeof x === 'string' && existsSync(x));
  if (!cands.length) { console.error('chrome not found'); process.exit(2); }
  return cands[0];
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fail = 0;
const check = (name, ok, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? ' | ' + extra : ''}`);
  if (!ok) fail++;
};

const port = 9300 + Math.floor(Math.random() * 500);
const prof = mkdtempSync(join(tmpdir(), 'optcg-fuse-'));
const proc = spawn(findChrome(), [
  '--headless', '--disable-gpu', `--user-data-dir=${prof}`, `--remote-debugging-port=${port}`,
  '--mute-audio', '--no-first-run', '--no-proxy-server', 'about:blank',
], { stdio: 'ignore' });

async function main() {
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    try {
      const list = JSON.parse(execFileSync('curl', ['-s', `http://127.0.0.1:${port}/json/list`], { encoding: 'utf8' }));
      const page = list.find((t) => t.type === 'page');
      if (page) { wsUrl = page.webSocketDebuggerUrl; break; }
    } catch (e) { /* retry */ }
    await sleep(300);
  }
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map();
  ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } });
  const call = (method, params) => new Promise((res) => { const mid = ++id; pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });
  const ev = async (expression) => {
    const r = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) return { __err: r.exceptionDetails.exception?.description || r.exceptionDetails.text };
    return r.result.value;
  };
  const waitFor = async (expr, timeout, step) => {
    for (let i = 0; i < Math.ceil(timeout / (step || 400)); i++) {
      const v = await ev(expr);
      if (v === true) return true;
      await sleep(step || 400);
    }
    return false;
  };

  await call('Page.enable');
  // headless 下 prefers-reduced-motion 可能=reduce（融合横幅/粒子被跳过）——强制开动效
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await call('Page.navigate', { url: PAGE });
  await sleep(3500);
  await ev(`(()=>{const ob=document.getElementById('onboard'); if(ob&&!ob.classList.contains('hidden')){const s=ob.querySelector('.ob-skip'); if(s)s.click();} return 1;})()`);
  await sleep(400);

  // 错误捕获 + 演出观察器（skill-fx 横幅 / summon-fx 登场特效）
  await ev(`(()=>{
    window.__fx = { errs:[], skillNames:[], skillSubs:[], summonFx:0 };
    window.addEventListener('error', e=>window.__fx.errs.push(String(e.message)));
    new MutationObserver(muts=>{ for(const m of muts){ for(const n of m.addedNodes){
      if(n instanceof HTMLElement && n.classList.contains('skill-fx')){
        const nm=n.querySelector('.sk-name'), sb=n.querySelector('.sk-sub');
        window.__fx.skillNames.push(nm?nm.textContent:''); window.__fx.skillSubs.push(sb?sb.textContent:'');
      }}}}).observe(document.body,{childList:true});
    new MutationObserver(muts=>{ for(const m of muts){
      if(m.target.classList && m.target.classList.contains('card') && m.target.classList.contains('summon-fx')) window.__fx.summonFx++;
    }}).observe(document.body,{attributes:true,attributeFilter:['class'],subtree:true});
    return 1;
  })()`);

  // 进局（大厅默认船长直接出航）
  await ev(`document.getElementById('btnStart').click()`);
  const inGame = await waitFor(`(OPTCG_GAME.state() && OPTCG_GAME.state().turn >= 1) === true`, 8000);
  check('进局', inGame === true);

  // 公开 API 构造素材局：红方场上 RED-08、手牌 RED-06、可用贝里 5 → FUSION-RED1（费用 3）可发动
  const restored = await ev(`(()=>{
    const P = OPTCG.POOL;
    const byId = id => P.cards.find(c=>c.id===id);
    const L = P.leaders.find(l=>l.color==='red');
    const LB = P.leaders.find(l=>l.color==='blue');
    const mkUnit = (id)=>Object.assign({}, byId(id), {rest:false, playedTurn:2, dons:0, buffs:[], gears:[]});
    const g = {
      seed: 7, rng: null, turn: 3, active: 0, firstTurn: false, pending: null, onceMark: {},
      fusions: P.cards.filter(c=>c.fusion), fuseUsed: [false,false],
      winner: null, winReason: null, log: [],
      players: [
        { id:0, leader: Object.assign({}, L, {rest:false, attackedTurn:0, dons:0, buffs:[]}), lp: L.life*2000,
          deck: [], hand: [byId('RED-06'), byId('RED-11')], donDeck: 0, // G1a 后 RED-07 已删，垫手牌换 RED-11
          donArea: [0,1,2,3,4].map(i=>({id:i, rest:false, attached:null})),
          board: [mkUnit('RED-08')], stage: null, trash: [] },
        { id:1, leader: Object.assign({}, LB, {rest:false, attackedTurn:0, dons:0, buffs:[]}), lp: LB.life*2000,
          deck: [], hand: [], donDeck: 0, donArea: [], board: [], stage: null, trash: [] },
      ],
    };
    return OPTCG_GAME.restoreFromSnapshot({ g, ctx: null, level: 'normal', ts: Date.now() });
  })()`);
  check('restoreFromSnapshot 构造素材局', restored === true, String(restored).slice(0, 80));

  // ① 素材齐+贝里够：融合按钮亮出；素材卡（手/场）fuse-ready 金光
  const ctaVisible = await ev(`(()=>{const c=document.querySelector('.fuse-cta'); return !!c && !c.classList.contains('hidden');})()`);
  const matGlow = await ev(`JSON.stringify({
    hand: document.querySelectorAll('#myHand .card.fuse-ready').length,
    board: document.querySelectorAll('#myBoard .card.fuse-ready').length,
    handN: document.querySelectorAll('#myHand .card').length,
  })`);
  const mv = JSON.parse(matGlow || '{}');
  check('融合按钮亮出（无配方时隐藏的反面路径）', ctaVisible === true);
  check('素材卡金光（手牌+场上）', mv.hand >= 1 && mv.board >= 1, matGlow);

  // ② 点击按钮 → 面板出配方（素材小图 → 融合体预览 + cost）
  await ev(`document.getElementById('btnFuse').click()`);
  const panelInfo = await ev(`JSON.stringify({
    open: !!document.getElementById('fusePanel'),
    opts: document.querySelectorAll('#fusePanel .fuse-opt').length,
    hasRed1: !!document.querySelector('#fusePanel .fuse-opt[data-fusion-id="FUSION-RED1"]'),
    mats: document.querySelectorAll('#fusePanel .fuse-mat').length,
    goDisabled: (document.querySelector('#fusePanel .fuse-go')||{disabled:true}).disabled,
  })`);
  const pv = JSON.parse(panelInfo || '{}');
  check('融合面板打开且列出可用配方', pv.open === true && pv.opts === 1 && pv.hasRed1 === true && pv.mats === 2, panelInfo);
  check('未选配方时确认钮禁用（防误发）', pv.goDisabled === true);

  // ③ 选中配方 → 确认 → 引擎动作
  await ev(`document.querySelector('#fusePanel .fuse-opt').click()`);
  const goEnabled = await ev(`(document.querySelector('#fusePanel .fuse-go')||{disabled:true}).disabled === false`);
  check('选中配方后确认钮解锁', goEnabled === true);
  await ev(`document.querySelector('#fusePanel .fuse-go').click()`);

  // ④ 融合体上场 + 墓场素材数+2 + 面板收起 + 演出（横幅/登场特效）
  const onBoard = await waitFor(`document.querySelectorAll('#myBoard [data-card-id="FUSION-RED1"]').length >= 1`, 8000);
  check('融合体登场进场上', onBoard === true);
  await sleep(400);
  const after = await ev(`JSON.stringify({
    board: [...document.querySelectorAll('#myBoard .card')].map(c=>c.dataset.cardId),
    grave: (document.getElementById('myGrave')||{textContent:''}).textContent.trim(),
    panelClosed: !document.getElementById('fusePanel'),
    ctaHidden: (document.querySelector('.fuse-cta')||{classList:{contains:()=>false}}).classList.contains('hidden'),
    fx: window.__fx,
    pending: OPTCG_GAME.state().pending,
  })`);
  const av = JSON.parse(after || '{}');
  check('墓场素材数 +2（素材进墓）', /墓\s*2/.test(av.grave || ''), av.grave);
  check('融合后面板收起+按钮隐藏（本回合限 1 次）', av.panelClosed === true && av.ctaHidden === true, JSON.stringify({ p: av.panelClosed, c: av.ctaHidden }));
  check('无响应窗口残留', !av.pending, JSON.stringify(av.pending));
  const names = (av.fx && av.fx.skillNames) || [];
  const subs = (av.fx && av.fx.skillSubs) || [];
  check('skill-fx 横幅：名=融合体名', names.some((n) => n.includes('艾斯') && n.includes('萨博')), JSON.stringify(names));
  check('skill-fx 横幅：副标=融合发动', subs.some((s) => s.includes('融合发动')), JSON.stringify(subs));
  check('融合体 summon-fx 登场特效', (av.fx && av.fx.summonFx) >= 1, `summonFx=${av.fx && av.fx.summonFx}`);
  check('无页面 JS 错误', (av.fx && av.fx.errs.length) === 0, JSON.stringify((av.fx && av.fx.errs) || []).slice(0, 160));

  // ⑤ cardInfoHtml 配方行（悬停信息卡与图鉴放大视图共用真值源）
  const info = await ev(`(()=>{const d=OPTCG.POOL.cards.find(c=>c.id==='FUSION-RED1');
    const h=window.OPTCG_UI.cardInfoHtml(d); return {fuse:h.includes('融合卡'),a:h.includes('艾斯'),b:h.includes('萨博'),cost:h.includes('3')};})()`);
  check('cardInfoHtml 融合卡配方行（素材 A+B，融合费用 N）', info && info.fuse && info.a && info.b && info.cost, JSON.stringify(info));

  // ⑥ 旧存档兼容：F13 前快照缺 fusions/fuseUsed → restoreFromSnapshot 补挂后按钮照常亮出
  const oldRestore = await ev(`(()=>{
    const P = OPTCG.POOL;
    const byId = id => P.cards.find(c=>c.id===id);
    const L = P.leaders.find(l=>l.color==='green');
    const LB = P.leaders.find(l=>l.color==='blue');
    const mkUnit = (id)=>Object.assign({}, byId(id), {rest:false, playedTurn:2, dons:0, buffs:[], gears:[]});
    const g = {
      seed: 9, rng: null, turn: 3, active: 0, firstTurn: false, pending: null, onceMark: {},
      winner: null, winReason: null, log: [],
      players: [
        { id:0, leader: Object.assign({}, L, {rest:false, attackedTurn:0, dons:0, buffs:[]}), lp: L.life*2000,
          deck: [], hand: [byId('GREEN-37')], donDeck: 0, // G1a 后 GREEN-36 已删，素材换保留版 GREEN-37
          donArea: [0,1,2].map(i=>({id:i, rest:false, attached:null})),
          board: [mkUnit('GREEN-12')], stage: null, trash: [] },
        { id:1, leader: Object.assign({}, LB, {rest:false, attackedTurn:0, dons:0, buffs:[]}), lp: LB.life*2000,
          deck: [], hand: [], donDeck: 0, donArea: [], board: [], stage: null, trash: [] },
      ],
    };
    return { ok: OPTCG_GAME.restoreFromSnapshot({ g, ctx: null, level: 'normal', ts: Date.now() }),
      cta: (()=>{const c=document.querySelector('.fuse-cta'); return !!c && !c.classList.contains('hidden');})() };
  })()`);
  check('旧快照（缺 fusions/fuseUsed）恢复不崩且融合可用', oldRestore && oldRestore.ok === true && oldRestore.cta === true, JSON.stringify(oldRestore));
  const errsFinal = await ev(`JSON.stringify(window.__fx.errs)`);
  check('全程无页面 JS 错误', errsFinal === '[]', errsFinal.slice(0, 160));

  ws.close();
}
try { await main(); } finally {
  proc.kill();
  try { rmSync(prof, { recursive: true, force: true }); } catch (e) { /* */ }
}
console.log(fail ? 'FUSE-PROBE-FAIL' : 'FUSE-PROBE-PASS');
process.exit(fail ? 1 : 0);
