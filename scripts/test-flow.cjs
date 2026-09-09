// Integration coverage for the ten immersion iterations. Fixture hooks are served
// only by this test's request interceptor and are never written to production.
const { chromium } = require('playwright');
const { readFileSync, writeFileSync, mkdirSync } = require('node:fs');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const server = spawn(process.execPath, ['scripts/serve.mjs','prod','4186'], {stdio:'ignore'});
const url='http://127.0.0.1:4186/';
const results=[];
(async()=>{
 let browser;
 try {
  for(let n=0;n<60;n++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({headless:true,channel:'chrome'});
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const hook=`
    window.__flowTest={state:state,
      reset:function(){
        clearCountdownTimers(); state.score=0;state.bestScore=0;state.immersion.recordDirty=false;
        localStorage.removeItem(BEST_SCORE_STORAGE_KEY);localStorage.removeItem(LAST_RUN_STORAGE_KEY);
        state.learningStep=0;saveLearningStep(0);initialiseRun();clearCountdownTimers();
        state.phase='running';elements.countdownLayer.hidden=true;state.waveSpacingCalibrationPending=false;
        state.stageTarget=10000;state.difficulty=Object.assign({},state.difficulty,{spawnWaveCount:0,fallDurationSeconds:1000});state.motionDifficulty=state.difficulty;
        render(performance.now());measureLayout();
      },
      board:function(values,current,preview,y){state.lanes=createLanes();clearRenderedStageObjects();
        values.forEach(function(lane,i){lane.forEach(function(value,j){state.lanes[i].blocks.push(createBlock(i,value,(y||.35)-j*getStackRushWavePitchNormalized(),null));});});
        state.next.current=current;state.next.preview=preview;state.resolve=null;state.pendingInputs=[];render(performance.now());},
      hit:function(lane){handleLaneClick(lane);for(var i=0;i<20;i++){if(state.phase==='running')updateGame(.02);}render(performance.now());},
      step:function(dt){if(state.phase==='running')updateGame(dt);render(performance.now());},
      render:function(){render(performance.now());},
      notice:announceImmersion, preview:generateNextPreview, supply:easeEmptyBoardSupply,
      pause:pauseForExternal, resumeExternal:tryResumeAfterExternalPause,
      stageBreak:startStageBreak, finishBreak:function(){finishStageBreak(Infinity);},
      finishCountdown:finishCountdown, stopCountdown:clearCountdownTimers,
      audio:effectsEngine, prime:primeEffectsAudio, sound:playTouchFeedback, preference:setEffectPreference,
      bgmStart:async function(){state.bgmEnabled=true;await prepareWebAudioBuffer();bgmEngine.backend='web-audio';await startWebAudioPlayback(false);},
      readSummary:readLastRunSummary, checkpoint:checkpointRunScore, end:endRun
    };
  `;
  let source=readFileSync('dist/prod/app.js','utf8');
  source=source.replace('  prepareBgmAssets();\n  applyLanguage();',hook+'\n  prepareBgmAssets();\n  applyLanguage();').replaceAll('window.requestAnimationFrame(frame);','/* controlled test clock */');
  await page.route('**/app.js',r=>r.fulfill({contentType:'text/javascript',body:source}));
  await page.goto(url);await page.waitForFunction(()=>window.__flowTest);
  async function test(name,fn){try{await page.evaluate(()=>__flowTest.reset());await fn();results.push({name,pass:true});console.log('PASS',name);}catch(e){results.push({name,pass:false,error:e.message});console.log('FAIL',name,e.message);}}
  await test('NEXT remains visible after every matching choice',async()=>{
    const values=await page.evaluate(()=>{__flowTest.board([[1,2],[1,2],[3],[4]],1,2);__flowTest.state.difficulty.safetyCheck=true;return Array.from({length:100},()=>__flowTest.preview()).map(x=>[x.value,x.source]);});
    assert.ok(values.every(([v,s])=>[1,3,4].includes(v)&&s==='visible-window'));
  });
  await test('Safe supply advances scheduled timer but never danger or budget',async()=>{
    const checks=await page.evaluate(()=>{const s=__flowTest.state;s.difficulty.spawnWaveCount=2;s.futureWaves[0].values=[1,1,1,1];__flowTest.board([[2],[],[],[]],1,2,.1);s.waveTimer=5;__flowTest.supply();const safe=s.waveTimer;__flowTest.board([[2],[],[],[]],1,2,.8);s.waveTimer=5;__flowTest.supply();const danger=s.waveTimer;__flowTest.board([[],[],[],[]],1,2);s.stageSpawnedWaveCount=2;s.waveTimer=5;__flowTest.supply();return {safe,danger,budget:s.waveTimer};});
    assert.deepEqual(checks,{safe:.2,danger:5,budget:5});
  });
  await test('Burst recovery slows board and retains original score',async()=>{
    const value=await page.evaluate(()=>{const s=__flowTest.state;s.immersion.charge=16;FOURCAST.activateBurst();for(let i=0;i<4;i++){__flowTest.board([[1,1],[],[],[]],1,1);__flowTest.hit(0);}const before=s.stageElapsed;__flowTest.step(.5);return {score:s.score,delta:s.stageElapsed-before,completed:s.immersion.completed};});
    assert.equal(value.score,143);assert.equal(value.completed,1);assert.ok(Math.abs(value.delta-.325)<1e-6);
  });
  await test('Blocked Burst reports absence without promising supply and board keeps moving',async()=>{
    const value=await page.evaluate(()=>{const s=__flowTest.state;__flowTest.board([[2],[3],[4],[2]],1,2,.3);s.immersion.remaining=5;s.immersion.noticeUntil=0;s.difficulty.spawnWaveCount=0;const before=s.stageElapsed;__flowTest.step(.7);return {remaining:s.immersion.remaining,delta:s.stageElapsed-before,hint:document.getElementById('burstHint').textContent,notice:document.getElementById('immersionNotice').textContent};});
    assert.equal(value.remaining,5);assert.ok(Math.abs(value.delta-.28)<1e-6);assert.match(value.hint,/일치하는 블록 없음/);assert.match(value.notice,/맞는 맨 아래 블록이 없어요/);
  });
  await test('Lightning has bounded effects and resets on miss',async()=>{
    const outcome=await page.evaluate(()=>{for(let i=0;i<4;i++){__flowTest.board([[1,1],[],[],[]],1,1);__flowTest.hit(0);}const count=__flowTest.state.immersion.lightningCount;__flowTest.board([[2],[],[],[]],1,1);__flowTest.hit(0);return {count,hits:__flowTest.state.immersion.fastHits.length,lines:document.querySelectorAll('.lightning-trace').length};});
    assert.equal(outcome.count,1);assert.equal(outcome.hits,0);assert.ok(outcome.lines<=1);await page.waitForTimeout(600);assert.equal(await page.locator('.lightning-trace').count(),0);
  });
  await test('Important notifications queue and stale ready events expire',async()=>{
    const output=await page.evaluate(()=>{const s=__flowTest.state;__flowTest.notice('complete');__flowTest.notice('best');__flowTest.notice('ready');const first=s.immersion.notice;s.elapsed+=1.9;__flowTest.render();const next=s.immersion.notice;s.elapsed+=5;__flowTest.render();return {first,next,queue:s.immersion.noticeQueue.length};});
    assert.deepEqual(output,{first:'complete',next:'best',queue:0});
  });
  await test('Manual pause preserves Burst and discards queued taps',async()=>{
    const output=await page.evaluate(()=>{const s=__flowTest.state;s.immersion.charge=16;FOURCAST.activateBurst();s.pendingInputs=[1,2];FOURCAST.pause();__flowTest.resumeExternal();return {phase:s.phase,remaining:s.immersion.remaining,inputs:s.pendingInputs.length};});
    assert.deepEqual(output,{phase:'auto-paused',remaining:6,inputs:0});
    await page.locator('#resumeButton').click();await page.waitForTimeout(3400);assert.equal(await page.evaluate(()=>FOURCAST.getState().phase),'running');
    assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('lane-button')),true);
  });
  await test('Stage-break pause resumes both break and BGM',async()=>{
    await page.evaluate(async()=>{await __flowTest.bgmStart();__flowTest.stageBreak();FOURCAST.pause();});
    await page.locator('#resumeButton').click();await page.waitForTimeout(3400);
    assert.equal(await page.evaluate(()=>FOURCAST.getState().phase),'stage-break');
    await page.evaluate(()=>__flowTest.finishBreak());await page.waitForTimeout(150);
    assert.equal(await page.evaluate(()=>FOURCAST.getState().bgmPlayback),'playing');
  });
  await test('Keyboard lane and burst bindings use gameplay entry points',async()=>{
    await page.evaluate(()=>{__flowTest.board([[1],[2],[3],[4]],1,2);});await page.keyboard.press('Digit1');await page.evaluate(()=>{for(let i=0;i<20;i++)__flowTest.step(.02);});assert.equal(await page.evaluate(()=>FOURCAST.getState().score),10);
    await page.evaluate(()=>{__flowTest.state.immersion.charge=16;});await page.keyboard.press('b');assert.equal(await page.evaluate(()=>FOURCAST.getState().immersion.remaining),6);
    await page.keyboard.press('p');assert.equal(await page.evaluate(()=>FOURCAST.getState().phase),'auto-paused');
  });
  await test('Effect settings persist and voices stop on pause',async()=>{
    await page.evaluate(()=>{__flowTest.preference('sfx',true);__flowTest.prime();});await page.waitForTimeout(100);
    const sample=await page.evaluate(()=>{__flowTest.state.combo=30;for(let i=0;i<20;i++)__flowTest.sound('hit',1);return {voices:__flowTest.audio.voices.length,context:__flowTest.audio.context.state};});
    assert.equal(sample.context,'running');assert.ok(sample.voices>0&&sample.voices<=12);
    await page.evaluate(()=>FOURCAST.pause());await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>__flowTest.audio.voices.length),0);
    assert.equal(await page.evaluate(()=>__flowTest.audio.context.state),'suspended');
    await page.evaluate(()=>{__flowTest.preference('comboSound',false);__flowTest.preference('haptic',false);__flowTest.preference('sfx',false);});
    assert.equal(await page.evaluate(()=>localStorage.getItem('fourcast-sfx-enabled')),'false');
  });
  await test('Learning steps advance, then reset from help',async()=>{
    for(let i=0;i<8;i++)await page.evaluate(()=>{__flowTest.board([[1,1],[],[],[]],1,1);__flowTest.hit(0);});
    assert.equal(await page.evaluate(()=>__flowTest.state.learningStep),2);
    await page.evaluate(()=>{__flowTest.state.immersion.charge=16;FOURCAST.activateBurst();});for(let i=0;i<4;i++)await page.evaluate(()=>{__flowTest.board([[1,1],[],[],[]],1,1);__flowTest.hit(0);});
    assert.equal(await page.evaluate(()=>localStorage.getItem('fourcast-learning-step')),'3');
  });
  await test('Record checkpoint, last-run summary and external newer record survive',async()=>{
    const outcome=await page.evaluate(()=>{__flowTest.board([[1],[],[],[]],1,1);__flowTest.hit(0);__flowTest.checkpoint(true);const first=localStorage.getItem('fourcast-pressure-log-v1-best-score');localStorage.setItem('fourcast-pressure-log-v1-best-score','900');__flowTest.board([[1],[],[],[]],1,1);__flowTest.hit(0);__flowTest.end('red-line');return {first,best:localStorage.getItem('fourcast-pressure-log-v1-best-score'),summary:__flowTest.readSummary()};});
    assert.equal(outcome.first,'10');assert.equal(outcome.best,'900');assert.equal(outcome.summary.score,21);
    await page.evaluate(()=>localStorage.setItem('fourcast-pressure-log-v1-last-run','{"version":1,"score":-1}'));assert.equal(await page.evaluate(()=>__flowTest.readSummary()),null);
  });
  mkdirSync('tmp/flow',{recursive:true});
  await test('Mobile and English controls, dialogs and hit regions fit',async()=>{
    for(const [width,height] of [[320,568],[390,844],[430,932],[1280,900]]){
      await page.setViewportSize({width,height});await page.evaluate(()=>__flowTest.render());
      const r=await page.evaluate(()=>{const rect=id=>{const b=document.getElementById(id).getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height,right:b.right,bottom:b.bottom};};return {pause:rect('pauseButton'),music:rect('musicButton'),next:rect('currentNext'),burst:rect('burstButton'),width:document.documentElement.scrollWidth};});
      assert.ok(r.burst.bottom<=height&&r.width<=width);assert.ok(r.pause.w>=44&&r.music.w>=44);
      if(width===320)assert.ok(Math.abs(r.pause.right-r.music.right)<2,'Stacked header buttons must align');
      await page.screenshot({path:`tmp/flow/game-${width}.png`});
    }
  });
  await test('Settings localization, tips reset and modal scrolling work',async()=>{
    await page.setViewportSize({width:320,height:568});
    await page.evaluate(()=>__flowTest.end('red-line'));
    await page.locator('#mainMenuButton').click();await page.locator('#settingsButton').click();
    await page.locator('#languageSelect').click();await page.locator('#languageOptionEn').click();
    assert.equal(await page.locator('#pauseButton').getAttribute('aria-label'),'Pause');
    await page.locator('#sfxToggle').uncheck();assert.equal(await page.evaluate(()=>localStorage.getItem('fourcast-sfx-enabled')),'false');
    await page.locator('#settingsDoneButton').scrollIntoViewIfNeeded();
    const volumeGap=await page.evaluate(()=>document.getElementById('bgmVolume').getBoundingClientRect().top-document.getElementById('bgmVolumeValue').getBoundingClientRect().bottom);
    assert.ok(volumeGap>=0,'Volume value must not overlap slider');
    await page.screenshot({path:'tmp/flow/settings-320.png'});await page.locator('#settingsDoneButton').click();
    await page.locator('#helpButton').click();await page.locator('#resetTipsButton').click();
    assert.equal(await page.evaluate(()=>localStorage.getItem('fourcast-learning-step')),'0');
    await page.screenshot({path:'tmp/flow/home-320.png'});
  });
  await test('Blocked local storage does not prevent real countdown and gameplay',async()=>{
    const isolated=await browser.newPage({viewport:{width:390,height:844}});
    isolated.on('pageerror',e=>errors.push(e.message));
    await isolated.addInitScript(()=>{Storage.prototype.getItem=function(){throw new DOMException('Blocked','SecurityError');};Storage.prototype.setItem=function(){throw new DOMException('Blocked','SecurityError');};});
    await isolated.goto(url);await isolated.locator('#startButton').click();
    await isolated.waitForFunction(()=>FOURCAST.getState().phase==='running',null,{timeout:12000});
    await isolated.locator('.lane-button.is-target-candidate').first().click();
    await isolated.waitForFunction(()=>FOURCAST.getState().score>0);await isolated.close();
  });
  assert.deepEqual(errors,[]);
 }finally{
  mkdirSync('tmp/flow',{recursive:true});writeFileSync('tmp/flow/results.json',JSON.stringify(results,null,2));
  if(browser)await browser.close();server.kill();
 }
 if(results.some(r=>!r.pass))process.exitCode=1;
})().catch(e=>{console.error(e);server.kill();process.exitCode=1;});
