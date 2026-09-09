// Final integration suite for the five follow-up rounds. Fixtures and seeded RNG
// are injected only in this browser; production assets remain unmodified.
const { chromium } = require('playwright');
const { readFileSync, writeFileSync, mkdirSync } = require('node:fs');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const server = spawn(process.execPath, ['scripts/serve.mjs', 'prod', '4189'], { stdio: 'ignore' });
const url = 'http://127.0.0.1:4189/';
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
        reconnect: reconnectBurstTarget, update: updateGame, breakStart: startStageBreak, breakUpdate: updateStageBreak, wait: updateSupplyWait, supply: easeEmptyBoardSupply, end: endRun, readPrior: readPreviousBestScore, readBest: readBestScore, readSummary: readLastRunSummary
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
    await test('Log anchors and increasing pressure steps match the approved curve through stage 150',async()=>{
      const rows=await page.evaluate(()=>Array.from({length:150},(_,i)=>__five.profile(i+1)));
      assert.equal(rows[0].fallDurationSeconds,30);
      const a=.4393836814067496;
      for(let stage=5;stage<=150;stage+=5)assert.ok(Math.abs(30/rows[stage-1].fallDurationSeconds-(1+a*Math.log(stage)))<1e-10);
      for(let stage=2;stage<=150;stage++)assert.ok(rows[stage-1].fallDurationSeconds<rows[stage-2].fallDurationSeconds);
      for(const start of [1,5,10,15,65,100]){const end=start===1?5:start+5;let last=0;for(let s=start+1;s<=end;s++){const delta=30/rows[s-1].fallDurationSeconds-30/rows[s-2].fallDurationSeconds;assert.ok(delta>last);last=delta;}}
      const bpm=s=>240*.9/(.103*rows[s-1].fallDurationSeconds);
      assert.ok(bpm(69)<200&&bpm(70)>200);
      return {stage1:rows[0].fallDurationSeconds,stage4Bpm:bpm(4),stage5Bpm:bpm(5),stage69Bpm:bpm(69),stage70Bpm:bpm(70)};
    });
    await test('Crossing 90 seconds does not end a run, but the red line does',async()=>{
      const r=await page.evaluate(()=>{__five.board([[1,1],[2],[3],[4]],1,1);__five.state.roundElapsed=89;__five.update(.01,1.2);const running=__five.state.phase;const elapsed=__five.state.roundElapsed;__five.state.lanes[0].blocks[0].normalizedY=1;__five.update(.01);return {running,elapsed,ended:__five.state.phase,reason:document.getElementById('gameOverScreen').dataset.reason,title:document.getElementById('resultTitle').textContent,limit:FOURCAST.getState().roundDuration};});
      assert.equal(r.running,'running');assert.ok(r.elapsed>90);assert.equal(r.ended,'game-over');assert.equal(r.reason,'red-line');assert.equal(r.title,'게임 오버');assert.equal(r.limit,null);return r;
    });
    await test('Stage transition crosses 90 seconds and pause stops the elapsed clock',async()=>{
      const r=await page.evaluate(()=>{__five.state.roundElapsed=89.9;__five.breakStart();__five.breakUpdate(.2,performance.now(),.2);const phase=__five.state.phase;__five.reset();FOURCAST.pause();__five.update(10);return {phase,pausedElapsed:__five.state.roundElapsed};});
      assert.notEqual(r.phase,'game-over');assert.equal(r.pausedElapsed,0);
    });
    await test('Eight actual button clicks update eight NEXTs without waiting for animation',async()=>{
      const r=await page.evaluate(()=>{__five.board([[1,1,1,1,1,1,1,1,1],[],[],[]],1,1);__five.draw();const before=performance.now();for(let i=0;i<8;i++)document.querySelector('.lane-button').click();return {ms:performance.now()-before,cleared:__five.state.stageRemoved,combo:__five.state.combo,effects:__five.state.shotEffects.length,queued:__five.state.pendingInputs.length};});
      assert.equal(r.cleared,8);assert.equal(r.combo,8);assert.equal(r.queued,0);assert.equal(r.effects,8);return r;
    });
    await test('Wrong then correct input uses the penalty immediately, without duplicate rewards',async()=>{
      const r=await page.evaluate(()=>{__five.board([[2],[],[],[]],1,1);FOURCAST.pressLane(0);const miss={score:__five.state.score,combo:__five.state.combo,count:__five.state.lanes[0].blocks.length};FOURCAST.pressLane(0);const hit={score:__five.state.score,combo:__five.state.combo,count:__five.state.lanes[0].blocks.length};__five.step(.4);return {miss,hit,after:__five.state.score};});
      assert.deepEqual(r.miss,{score:0,combo:0,count:2});assert.deepEqual(r.hit,{score:10,combo:1,count:1});assert.equal(r.after,10);return r;
    });
    await test('Cosmetic shots are bounded, freeze on pause, and clear on stage transition',async()=>{
      const r=await page.evaluate(()=>{for(let i=0;i<20;i++){__five.state.lanes[0].blocks=[];__five.state.next.current=1;__five.state.next.preview=1;FOURCAST.pressLane(0);}const effects=__five.state.shotEffects.length;const age=__five.state.shotEffects[0].age;FOURCAST.pause();__five.update(1);const pausedAge=__five.state.shotEffects[0].age;__five.state.phase='running';__five.breakStart();return {effects,age,pausedAge,left:__five.state.shotEffects.length,projectiles:document.querySelectorAll('.projectile').length};});
      assert.equal(r.effects,12);assert.equal(r.age,r.pausedAge);assert.equal(r.left,0);assert.equal(r.projectiles,0);
    });
    await test('A rapid stage-ending click cannot fire again into the next stage',async()=>{
      const r=await page.evaluate(()=>{__five.board([[1,1],[2],[3],[4]],1,1);__five.state.stageTarget=1;FOURCAST.pressLane(0);FOURCAST.pressLane(0);return {phase:__five.state.phase,score:__five.state.score,pending:__five.state.pendingInputs.length,effects:__five.state.shotEffects.length};});
      assert.equal(r.phase,'stage-break');assert.equal(r.score,10);assert.equal(r.pending,0);assert.equal(r.effects,0);
    });
    await test('Empty-board supply shortens real waiting while danger and budgets remain protected',async()=>{
      const r=await page.evaluate(()=>{const s=__five.state;s.difficulty.spawnWaveCount=2;__five.board([[],[],[],[]],1,2);s.waveTimer=2;s.immersion.remaining=6;__five.supply();const burst=s.waveTimer;__five.board([[2],[2],[2],[2]],1,2);s.lanes[0].blocks[0].normalizedY=.82;s.waveTimer=2;__five.supply();const blocked=s.waveTimer;__five.board([[],[],[],[]],1,2);s.stageSpawnedWaveCount=2;s.waveTimer=2;__five.supply();return {burst,blocked,exhausted:s.waveTimer};});
      assert.ok(Math.abs(r.burst-.048)<1e-8);assert.equal(r.blocked,2);assert.equal(r.exhausted,2);return r;
    });
    await test('Brief empty gaps have no wait notice; sustained branch gaps are classified locally',async()=>{
      const r=await page.evaluate(()=>{const s=__five.state;__five.board([[],[],[],[]],1,2);__five.wait(.3);__five.render();const brief=s.supplyWait.showNotice;__five.board([[2],[3],[4],[2]],1,2);s.elapsed+=1;__five.wait(.7);__five.render();return {brief,reason:s.supplyWait.reason,totals:s.supplyWait.totals,text:document.getElementById('immersionNotice').textContent};});
      assert.equal(r.brief,false);assert.equal(r.reason,'branch');assert.equal(r.totals.empty,.3);assert.equal(r.totals.branch,.7);assert.match(r.text,/맞는 맨 아래/);return r;
    });
    await test('Old scores stay archived while new version and new summaries remain separate',async()=>{
      const r=await page.evaluate(()=>{localStorage.setItem('fourcast-stack-rush-best-score','31881');localStorage.setItem('fourcast-last-run-v1','{"version":1,"score":31881}');localStorage.removeItem('fourcast-pressure-log-v1-best-score');localStorage.removeItem('fourcast-pressure-log-v1-last-run');__five.state.bestScore=0;const before={prior:__five.readPrior(),best:__five.readBest(),summary:__five.readSummary()};__five.board([[1,1],[],[],[]],1,1);FOURCAST.pressLane(0);__five.end('red-line');return {before,after:__five.readBest(),old:localStorage.getItem('fourcast-stack-rush-best-score'),oldSummary:localStorage.getItem('fourcast-last-run-v1'),newSummary:__five.readSummary()};});
      assert.deepEqual(r.before,{prior:31881,best:0,summary:null});assert.equal(r.after,10);assert.equal(r.old,'31881');assert.match(r.oldSummary,/31881/);assert.equal(r.newSummary.ruleset,'pressure-log-v1');assert.equal(r.newSummary.version,2);return r;
    });
    await test('Pause bars and resume control share the center at mobile and desktop sizes',async()=>{
      await page.evaluate(()=>FOURCAST.pause());const samples=[];
      for(const [width,height] of [[320,568],[390,844],[547,880],[1280,900]]){
        await page.setViewportSize({width,height});await page.evaluate(()=>__five.draw());
        const r=await page.evaluate(()=>{const ids=['countdownLayer','countdownCaption','pauseSymbol','resumeButton'];const centers=ids.map(id=>{const e=document.getElementById(id),r=e.getBoundingClientRect();return {id,x:r.x+r.width/2,w:r.width,h:r.height,display:getComputedStyle(e).display};});const icon=document.getElementById('pauseSymbol');return {centers,left:getComputedStyle(icon,'::before').width,right:getComputedStyle(icon,'::after').width,numberHidden:document.getElementById('countdownNumber').hidden};});
        assert.ok(r.centers.every(x=>Math.abs(x.x-r.centers[0].x)<.1));assert.equal(r.left,r.right);assert.equal(r.numberHidden,true);samples.push({width,height,...r});
        mkdirSync('tmp/sprint',{recursive:true});await page.screenshot({path:`tmp/sprint/pause-${width}.png`});
      }return samples;
    });
    assert.deepEqual(errors,[]);
  } finally {
    mkdirSync('tmp/sprint',{recursive:true});writeFileSync('tmp/sprint/results.json',JSON.stringify(results,null,2));
    if(browser)await browser.close();server.kill();
  }
  if(results.some(r=>!r.pass))process.exitCode=1;
})().catch(error=>{console.error(error);server.kill();process.exitCode=1;});
