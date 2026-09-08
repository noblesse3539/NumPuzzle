// Browser integration tests. Requires Playwright (or the bundled runtime via NODE_PATH).
const { chromium } = require('playwright');
const { readFileSync, mkdirSync } = require('node:fs');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const server = spawn(process.execPath, ['scripts/serve.mjs', 'prod', '4185'], { stdio: 'ignore' });
const base = 'http://127.0.0.1:4185';
(async () => {
  let browser;
  try {
    for (let i = 0; i < 60; i++) {
      try { if ((await fetch(base)).ok) break; } catch {}
      await new Promise(r => setTimeout(r, 100));
    }
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const hook = `
      window.__test = {
        state: state, update: updateGame, render: function(){render(performance.now());},
        stageBreak: startStageBreak, finishBreak: function(){finishStageBreak(Infinity);},
        end: endRun,
        reset: function(best){state.bestScore=best || 0; initialiseRun(); clearCountdownTimers(); state.phase='running'; elements.countdownLayer.hidden=true; showScreen('game'); measureLayout(); state.waveSpacingCalibrationPending=false; state.stageTarget=1000; state.difficulty=Object.assign({}, state.difficulty, {spawnWaveCount:0,fallDurationSeconds:1000}); state.motionDifficulty=state.difficulty;},
        shot: function(wrong, clutch, otherDanger){
          state.lanes=createLanes(); state.next.current=1; state.next.preview=1;
          var y=clutch ? getGameOverY()-getBlockHeightNormalized()*.2 : .25;
          state.lanes[0].blocks=[createBlock(0,wrong ? 2 : 1,y,null)];
          if(otherDanger) state.lanes[1].blocks=[createBlock(1,2,y,null)];
          handleLaneClick(0);
        },
        dangerous: function(){state.lanes=createLanes(); state.lanes[0].blocks=[createBlock(0,1,getGameOverY()+.01,null)];}
      };
    `;
    let source = readFileSync('dist/prod/app.js', 'utf8');
    source = source.replace('  prepareBgmAssets();\n  applyLanguage();', hook + '\n  prepareBgmAssets();\n  applyLanguage();');
    source = source.replaceAll('window.requestAnimationFrame(frame);', '/* deterministic test clock */');
    await page.route('**/app.js', r => r.fulfill({ contentType: 'text/javascript', body: source }));
    await page.goto(base);
    await page.waitForFunction(() => window.__test);
    const run = fn => page.evaluate(fn);
    const hit = async (wrong=false,clutch=false,other=false) => page.evaluate(([w,c,o]) => {
      __test.shot(w,c,o); for(let i=0;i<20;i++) __test.update(.02); __test.render();
    },[wrong,clutch,other]);
    await run(() => __test.reset(200));
    for(let i=0;i<16;i++) await hit();
    let state = await run(() => FOURCAST.getState());
    assert.equal(state.immersion.charge,16);
    assert.equal(state.score,181); // original combo scoring remains intact
    assert.equal(await run(() => FOURCAST.activateBurst()),true);
    assert.equal(await run(() => FOURCAST.activateBurst()),false);
    const slowed = await run(() => { const before=__test.state.stageElapsed; __test.update(.5); return __test.state.stageElapsed-before; });
    assert.ok(Math.abs(slowed-.2)<1e-9);
    await run(() => { const before=__test.state.immersion.remaining; __test.state.lanes.forEach(l=>l.blocks=[]); __test.update(.5); if(__test.state.immersion.remaining!==before) throw Error('Forced wait consumed burst time'); });
    await hit(); await hit();
    await run(() => { __test.stageBreak(); __test.finishBreak(); __test.state.waveSpacingCalibrationPending=false; __test.state.stageTarget=1000; });
    assert.equal((await run(() => FOURCAST.getState())).immersion.chain,2);
    await hit(); await hit();
    state=await run(() => FOURCAST.getState());
    assert.equal(state.immersion.completed,1);
    assert.equal(state.score,329);
    assert.equal(state.immersion.newBest,true);
    assert.equal(state.immersion.charge,0);
    await run(() => {__test.state.immersion.charge=16; FOURCAST.activateBurst();});
    await hit(true);
    state=await run(() => FOURCAST.getState());
    assert.equal(state.immersion.remaining,0);
    assert.equal(state.combo,0);
    assert.equal(state.immersion.completed,1);
    await run(() => {__test.reset(); __test.state.immersion.charge=16; FOURCAST.activateBurst(); __test.update(6.1);});
    assert.equal((await run(() => FOURCAST.getState())).immersion.completed,0);
    assert.equal((await run(() => FOURCAST.getState())).immersion.remaining,0);
    await run(() => { __test.reset(); __test.state.immersion.charge=16; FOURCAST.activateBurst(); FOURCAST.pause(); __test.render(); });
    assert.equal(await page.locator('#burstButton').isDisabled(),true);
    assert.equal((await run(() => FOURCAST.getState())).immersion.remaining,6);
    await run(() => __test.reset());
    await hit(false,true,true);
    assert.equal((await run(() => FOURCAST.getState())).immersion.clutches,0);
    await hit(false,true,false);
    assert.equal((await run(() => FOURCAST.getState())).immersion.clutches,1);
    await run(() => { __test.reset(); __test.state.immersion.charge=16; FOURCAST.activateBurst(); __test.dangerous(); __test.update(.02); });
    assert.equal((await run(() => FOURCAST.getState())).phase,'game-over');
    assert.equal((await run(() => FOURCAST.getState())).immersion.remaining,0);
    await run(() => __test.reset());
    assert.equal((await run(() => FOURCAST.getState())).immersion.completed,0);
    assert.equal((await run(() => FOURCAST.getState())).immersion.newBest,false);
    // Inspect responsive geometry and both localizations.
    mkdirSync('tmp/immersion', {recursive:true});
    for(const [width,height] of [[390,844],[320,568],[430,932],[1280,900]]) {
      await page.setViewportSize({width,height});
      await run(() => { __test.reset(100); __test.state.immersion.charge=16; FOURCAST.activateBurst(); __test.render(); });
      const geometry = await page.evaluate(() => {
        const b=document.querySelector('#burstButton').getBoundingClientRect();
        const tracks=[...document.querySelectorAll('.lane-track')].map(e=>e.getBoundingClientRect().height);
        return {bottom:b.bottom,width:document.documentElement.scrollWidth,tracks};
      });
      assert.ok(geometry.bottom<=height,JSON.stringify(geometry));
      assert.ok(geometry.width<=width);
      assert.ok(geometry.tracks.every(h=>h>100));
      await page.screenshot({path:'tmp/immersion/burst-'+width+'.png'});
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.setViewportSize({width:390,height:844});
    await run(() => {__test.reset(); __test.state.language='en'; __test.render();});
    await hit();
    assert.equal(await page.locator('.hit-spark').count(),0);
    assert.match(await page.locator('#burstHint').textContent(),/Build charge/);
    // Fresh, unmodified production page: exercise the actual countdown and DOM buttons.
    const live = await browser.newPage({viewport:{width:390,height:844}});
    live.on('pageerror', e => errors.push(e.message));
    await live.goto(base);
    await live.locator('#startButton').click();
    await live.waitForFunction(() => FOURCAST.getState().phase === 'running', null, {timeout:12000});
    for(let i=0;i<16;i++) {
      await live.waitForFunction(() => FOURCAST.getState().phase === 'running' && document.querySelector('.lane-button.is-target-candidate'));
      await live.locator('.lane-button.is-target-candidate').first().click();
      await live.waitForTimeout(340);
    }
    await live.waitForFunction(() => !document.getElementById('burstButton').disabled);
    await live.locator('#burstButton').click();
    for(let i=0;i<4;i++) {
      await live.waitForFunction(() => FOURCAST.getState().phase === 'running' && document.querySelector('.lane-button.is-target-candidate'));
      await live.locator('.lane-button.is-target-candidate').first().click();
      await live.waitForTimeout(340);
    }
    await live.screenshot({path:'tmp/immersion/production-success.png'});
    assert.equal((await live.evaluate(() => FOURCAST.getState())).immersion.completed,1);
    await live.close();
    assert.deepEqual(errors,[]);
    console.log('PASS: charge, original scoring, activation guards, slowdown, stage continuity, four-hit reward, miss, timeout, pause, clutch, record, red line, restart, 4 viewport sizes, English, reduced motion, forced supply wait, production button playthrough.');
  } finally { if(browser) await browser.close(); server.kill(); }
})().catch(e => { console.error(e); process.exitCode=1; });
