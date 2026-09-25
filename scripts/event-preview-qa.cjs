const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
const origin=process.env.QA_BASE_URL||'http://127.0.0.1:5173';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});const page=await browser.newPage({reducedMotion:'reduce'});const errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));fs.mkdirSync('docs/qa',{recursive:true});
 for(const path of ['/','/evento']){
  await page.goto(origin+path,{waitUntil:'networkidle'});
  if(await page.locator('#patrocinadores').innerText().then(s=>/demolay/i.test(s)))throw Error('DeMolay Brasil still visible');
  for(const width of [320,390,650,768,1024,1100,1201,1440,1920]){
   await page.setViewportSize({width,height:900});await page.evaluate(async()=>{await document.fonts.ready;for(const img of document.images)img.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))});
   const result=await page.evaluate(()=>{
    const groups=[...document.querySelectorAll('.sponsor-group')];const rows=new Set(groups.map(g=>Math.round(g.getBoundingClientRect().top)));
    const links=[...document.querySelectorAll('.event-banner-actions a,.reception-actions a')];
    const outside=links.filter(a=>{const r=a.getBoundingClientRect();return r.left<0||r.right>innerWidth}).map(a=>a.textContent);
    return {path:location.pathname,width:innerWidth,pageWidth:document.documentElement.scrollWidth,sponsorRows:rows.size,groups:groups.length,outside,broken:[...document.querySelectorAll('#patrocinadores img')].filter(i=>!i.naturalWidth).length};
   });checks.push(result);
   if([390,1440].includes(width)){await page.locator('#patrocinadores').screenshot({path:`docs/qa/sponsors-${path==='/'?'home':'event'}-${width}.png`});await page.locator(path==='/'?'#evento':'.reception-hero').screenshot({path:`docs/qa/updated-banner-${path==='/'?'home':'event'}-${width}.png`});}
  }
  await page.setViewportSize({width:1440,height:900});await page.locator(path==='/'?'.event-banner-actions':'.reception-actions').getByRole('link',{name:'Acompanhar inscrição',exact:true}).click();await page.waitForURL('**/acompanhamento');await page.locator('.demo-strip').waitFor({state:'visible'});
 }
 await page.goto(origin+'/',{waitUntil:'networkidle'});await page.locator('.header-actions').getByRole('link',{name:'Inscrições',exact:true}).click();await page.waitForURL('**/inscricao');if(new URL(page.url()).origin!==new URL(origin).origin)throw Error('Signup left the site');await page.locator('.demo-strip').waitFor({state:'visible'});
 const failures=checks.filter(x=>x.pageWidth>x.width||x.sponsorRows>2||x.outside.length||x.broken);fs.writeFileSync('docs/qa/event-preview-report.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks:checks.length,failures,errors,internalSignup:'passed',tracking:'passed'}));await browser.close();if(failures.length||errors.length)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
