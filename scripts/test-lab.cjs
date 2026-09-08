const {chromium}=require('playwright');
const {spawn}=require('node:child_process');
const {mkdirSync,writeFileSync}=require('node:fs');
const assert=require('node:assert/strict');
const server=spawn(process.execPath,['scripts/serve.mjs','lab','4187'],{stdio:'ignore'});
(async()=>{let browser;const results=[];try{
 for(let i=0;i<60;i++){try{if((await fetch('http://127.0.0.1:4187/')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({headless:true,channel:'chrome'});const page=await browser.newPage({viewport:{width:1280,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4187/');await page.waitForFunction(()=>document.getElementById('gameFrame').contentWindow.FOURCAST);
 const command=async(action,payload={})=>page.evaluate(({action,payload})=>new Promise((resolve,reject)=>{const requestId='test-'+crypto.randomUUID();const timeout=setTimeout(()=>{removeEventListener('message',listener);reject(Error('Lab timeout'));},5000);function listener(e){if(e.data?.requestId!==requestId)return;clearTimeout(timeout);removeEventListener('message',listener);e.data.type==='error'?reject(Error(e.data.payload.message)):resolve(e.data.payload);}addEventListener('message',listener);document.getElementById('gameFrame').contentWindow.postMessage({channel:'fourcast-lab-v1',requestId,action,payload},location.origin);}),{action,payload});
 const prepare=(scenarioId)=>command('prepare-scenario',{scenarioId,stage:11});
 await prepare('safety-release-10-to-11');await command('run-safety-release');await page.waitForTimeout(1200);let s=await command('observe');assert.equal(s.stage,11);assert.equal(s.safetyCheck,false);results.push('Stage 10 → 11');
 await prepare('safety-pulse-stage-11');await command('run-safety-pulse');s=await command('change-safety-pulse');assert.equal(s.safetyCueActive,true);await page.waitForTimeout(1000);s=await command('observe');assert.equal(s.safetyCueActive,false);results.push('Preview change preserves finite safety pulse');
 await prepare('perfect-score');await command('run-perfect');await page.waitForTimeout(1000);s=await command('observe');assert.equal(s.perfectSuccessCount,1);assert.equal(s.score,71);results.push('Perfect two-hit path = 71 points');
 await prepare('perfect-score');await command('run-perfect-single');await page.waitForTimeout(1000);s=await command('observe');assert.equal(s.perfectSuccessCount,1);results.push('Unique valid preview path earns perfect');
 await prepare('perfect-score');await command('run-perfect-invalid');await page.waitForTimeout(1000);s=await command('observe');assert.equal(s.perfectSuccessCount,0);results.push('Invalid path does not earn perfect');
 await prepare('wave-spacing-and-rejoin');await command('run-wave-spacing');await page.waitForTimeout(400);s=await command('observe');assert.ok(Math.abs(s.waveGapRatio-.03)<.015);assert.ok(s.maxOverlapPixels<1);results.push('Wave spacing and penalty reflow');
 await prepare('wave-entry-spacing');await command('run-wave-entry-spacing');await page.waitForTimeout(500);s=await command('observe');assert.ok(s.maxOverlapPixels<1);assert.equal(s.spawnFootprintStable,true);results.push('Wave entry settles without overlap');
 await prepare('red-line-auto-reset');await command('trigger-red-line');await page.waitForTimeout(400);s=await command('observe');assert.equal(s.resetCount,1);assert.equal(s.gameOverVisible,false);results.push('Actual red-line reset');
 assert.deepEqual(errors,[]);console.log('PASS',results);
}finally{mkdirSync('tmp/flow',{recursive:true});writeFileSync('tmp/flow/lab-results.json',JSON.stringify(results,null,2));if(browser)await browser.close();server.kill();}})().catch(e=>{console.error(e);server.kill();process.exitCode=1;});
