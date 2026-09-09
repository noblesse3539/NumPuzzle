// Final integration suite for the five follow-up rounds. Fixtures and seeded RNG
// are injected only in this browser; production assets remain unmodified.
const { chromium } = require('playwright');
const { readFileSync, writeFileSync, mkdirSync } = require('node:fs');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const server = spawn(process.execPath, ['scripts/serve.mjs', 'prod', '4188'], { stdio: 'ignore' });
const url = 'http://127.0.0.1:4188/';
const results = [];
(async () => {
  let browser;
  try {
    for (let i = 0; i < 60; i++) { try { if ((await fetch(url)).ok) break; } catch {} await new Promise(r => setTimeout(r, 100)); }
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    const hooks = `
      window.__five = {
        state, preview: generateNextPreview, profile: buildStackRushStageProfile,
        draw: function(){measureLayout();render(performance.now());},
        reset: function(){initialiseRun();clearCountdownTimers();state.phase='running';elements.countdownLayer.hidden=true;state.waveSpacingCalibrationPending=false;state.stageTarget=10000;state.difficulty=Object.assign({},state.difficulty,{spawnWaveCount:0,fallDurationSeconds:1000});state.motionDifficulty=state.difficulty;},
        board: function(values,current,preview){clearRenderedStageObjects();state.lanes=createLanes();values.forEach(function(values,i){values.forEach(function(v,j){state.lanes[i].blocks.push(createBlock(i,v,.4-j*getStackRushWavePitchNormalized(),null));});});state.next.current=current;state.next.preview=preview;state.resolve=null;state.pendingInputs=[];state.nextRevision++;},
        step: function(seconds){for(var t=0;t<seconds;t+=.01){if(state.phase==='running')updateGame(.01);}render(performance.now());},
        announce: announceImmersion, render: function(){render(performance.now());},
        reconnect: reconnectBurstTarget
      };
    `;
    let source = readFileSync('dist/prod/app.js', 'utf8');
    source = source.replace('  prepareBgmAssets();\n  applyLanguage();', hooks + '\n  prepareBgmAssets();\n  applyLanguage();')
      .replaceAll('window.requestAnimationFrame(frame);', '/* controlled test clock */');
    await page.route('**/app.js', r => r.fulfill({ contentType: 'text/javascript', body: source }));
    await page.goto(url); await page.waitForFunction(() => window.__five);
    async function test(name, fn) {
      try { await page.evaluate(() => __five.reset()); const evidence = await fn(); results.push({ name, pass: true, evidence }); console.log('PASS', name); }
      catch (error) { results.push({ name, pass: false, error: error.message }); console.log('FAIL', name, error.message); }
    }
    await test('Seeded late-stage previews always retain a playable branch', async () => {
      const result = await page.evaluate(() => {
        let seed = 90609; const original = Math.random;
        Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
        let checks = 0; const failures = [];
        try {
          for (let board = 0; board < 512; board++) {
            const lanes = Array.from({ length: 4 }, () => Array.from({ length: 1 + Math.floor(Math.random() * 4) }, () => 1 + Math.floor(Math.random() * 4)));
            const current = lanes[Math.floor(Math.random() * 4)][0];
            __five.board(lanes, current, 1); __five.state.stage = 11 + board % 40; __five.state.difficulty.safetyCheck = false;
            for (let draw = 0; draw < 25; draw++) {
              const preview = __five.preview();
              const possible = lanes.some((lane, i) => lane[0] === current && lanes.some((other, j) => other[i === j ? 1 : 0] === preview.value));
              if (!possible || preview.source !== 'visible-window') failures.push({ lanes, current, preview });
              checks++;
            }
          }
        } finally { Math.random = original; }
        return { checks, failures: failures.slice(0, 3) };
      });
      assert.deepEqual(result.failures, []); assert.equal(result.checks, 12800); return result;
    });
    await test('Early-stage and Burst previews survive every available correct choice', async () => {
      const result = await page.evaluate(() => {
        let seed = 1604; const original = Math.random; Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
        let checks = 0; const failures = [];
        try {
          for (let board = 0; board < 128; board++) {
            const lanes = Array.from({ length: 4 }, () => [1 + Math.floor(Math.random() * 4), 1 + Math.floor(Math.random() * 4)]);
            const current = lanes[0][0]; __five.board(lanes, current, 1);
            __five.state.difficulty.safetyCheck = board % 2 === 0; __five.state.immersion.remaining = board % 2 ? 6 : 0;
            for (let i = 0; i < 12; i++) {
              const preview = __five.preview();
              if (!lanes.every((lane, j) => lane[0] !== current || lanes.some((other, k) => other[j === k ? 1 : 0] === preview.value))) failures.push({ lanes, current, preview });
              checks++;
            }
          }
        } finally { Math.random = original; }
        return { checks, failures: failures.slice(0, 3) };
      });
      assert.deepEqual(result.failures, []); return result;
    });
    await test('Stage profiles and normalized rows are identical across viewport changes', async () => {
      const baseline = await page.evaluate(() => Array.from({ length: 50 }, (_, i) => __five.profile(i + 1)));
      await page.evaluate(() => { __five.board([[1,2],[2,3],[3,4],[4,1]], 1, 2); __five.draw(); });
      const samples = [];
      for (const [width, height] of [[320,568],[390,844],[430,932],[1280,900],[390,844]]) {
        await page.setViewportSize({ width, height }); await page.evaluate(() => __five.draw());
        const measured = await page.evaluate(() => {
          const block = document.querySelector('.lane-block'); const layer = document.querySelector('.lane-blocks').getBoundingClientRect();
          return { profiles: Array.from({ length: 50 }, (_, i) => __five.profile(i + 1)), y: __five.state.lanes[0].blocks.map(b => b.normalizedY), heightRatio: parseFloat(getComputedStyle(block).height) / layer.height, font: parseFloat(getComputedStyle(block).fontSize) };
        });
        assert.deepEqual(measured.profiles, baseline); assert.deepEqual(measured.y, [.4, .29700000000000004]);
        assert.ok(Math.abs(measured.heightRatio - .1) < .001); assert.ok(measured.font >= 12);
        samples.push({ width, height, heightRatio: measured.heightRatio, stage20: baseline[19].target });
        mkdirSync('tmp/five', { recursive: true }); await page.screenshot({ path: `tmp/five/board-${width}.png` });
      }
      return samples;
    });
    await test('Repeated inputs consume the newly displayed NEXT without a queue', async () => {
      const result = await page.evaluate(() => {
        __five.board([[1,1,1,1,1,1],[],[],[]], 1, 1);
        for (let i = 0; i < 5; i++) FOURCAST.pressLane(0);
        return { cleared: __five.state.stageRemoved, combo: __five.state.combo, pending: __five.state.pendingInputs.length, resolving: Boolean(__five.state.resolve) };
      });
      assert.deepEqual(result, { cleared: 5, combo: 5, pending: 0, resolving: false }); return result;
    });
    await test('Pause prevents new shots and leaves no buffered replay', async () => {
      const result = await page.evaluate(() => {
        __five.board([[1,1,1],[],[],[]], 1, 1); FOURCAST.pressLane(0); FOURCAST.pause(); FOURCAST.pressLane(0);
        return { cleared: __five.state.stageRemoved, pending: __five.state.pendingInputs.length };
      });
      assert.deepEqual(result, { cleared: 1, pending: 0 });
    });
    await test('Burst reconnects a blocked board without granting free points', async () => {
      const start = await page.evaluate(() => {
        __five.board([[2,4],[3,2],[4,2],[2,3]], 1, 4); __five.state.lanes[1].blocks[0].normalizedY = .6; __five.state.immersion.charge = 16;
        const active = FOURCAST.activateBurst(); return { active, current: __five.state.next.current, rescues: __five.state.immersion.rescues, score: __five.state.score, count: __five.state.lanes.reduce((n,l) => n+l.blocks.length,0), repeat: FOURCAST.activateBurst(), notice: document.getElementById('immersionNotice').textContent };
      });
      assert.equal(start.current, 3); assert.equal(start.rescues, 1); assert.equal(start.score, 0); assert.equal(start.count, 8); assert.equal(start.repeat, false); assert.match(start.notice, /연결/);
      const finish = await page.evaluate(() => {
        for (let i = 0; i < 4; i++) { const lane = __five.state.lanes.findIndex(l => l.blocks.filter(b => b.status === 'active').sort((a,b) => b.normalizedY-a.normalizedY)[0]?.value === __five.state.next.current); if (lane < 0) throw Error('Burst lost its path'); FOURCAST.pressLane(lane); __five.step(.35); }
        return { score: __five.state.score, completed: __five.state.immersion.completed };
      });
      assert.equal(finish.completed, 1); assert.equal(finish.score, 143); return { start, finish };
    });
    await test('Burst preserves a legal visible NEXT and blocked uncharged input cannot reconnect', async () => {
      const result = await page.evaluate(() => {
        __five.board([[1,2],[2],[3],[4]], 1, 2); __five.state.immersion.charge = 16; FOURCAST.activateBurst();
        const legal = [__five.state.next.current, __five.state.next.preview, __five.state.immersion.rescues];
        __five.reset(); __five.board([[2],[3],[4],[2]], 1, 2); const rejected = FOURCAST.activateBurst();
        return { legal, rejected, current: __five.state.next.current };
      });
      assert.deepEqual(result, { legal: [1,2,0], rejected: false, current: 1 });
    });
    await test('Repeated lightning notices respect cooldown and do not queue behind records', async () => {
      const result = await page.evaluate(() => {
        const s = __five.state; __five.announce('lightning'); const firstUntil = s.immersion.noticeUntil;
        s.elapsed += 1; __five.announce('lightning'); const suppressed = s.immersion.noticeUntil === firstUntil;
        __five.announce('best'); __five.announce('lightning'); const queued = s.immersion.noticeQueue.length;
        s.elapsed += 8; __five.announce('lightning'); return { suppressed, queued, shownAt: s.immersion.noticeLastShown.lightning, elapsed: s.elapsed };
      });
      assert.equal(result.suppressed, true); assert.equal(result.queued, 0); assert.equal(result.shownAt, result.elapsed); return result;
    });
    await test('Queued rescue feedback expires after the Burst ends', async () => {
      const notice = await page.evaluate(() => {
        const s = __five.state; __five.announce('complete'); __five.announce('rescue'); s.immersion.remaining = 0; s.elapsed += 1.2; __five.render(); return s.immersion.notice;
      });
      assert.notEqual(notice, 'rescue');
    });
    assert.deepEqual(errors, []);
  } finally {
    mkdirSync('tmp/five', { recursive: true }); writeFileSync('tmp/five/results.json', JSON.stringify(results, null, 2));
    if (browser) await browser.close(); server.kill();
  }
  if (results.some(r => !r.pass)) process.exitCode = 1;
})().catch(error => { console.error(error); server.kill(); process.exitCode = 1; });
