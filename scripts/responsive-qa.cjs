const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage({reducedMotion:'reduce'});const errors=[];const checks=[];
 page.on('pageerror',e=>errors.push(e.message));fs.mkdirSync('docs/qa',{recursive:true});
 for(const path of ['/','/historia']){
  await page.goto(`http://127.0.0.1:5173${path}`,{waitUntil:'networkidle'});
  for(const width of [320,360,390,430,600,650,651,768,850,1024,1050,1051,1200,1201,1250,1251,1280,1366,1440,1920,2560]){
   await page.setViewportSize({width,height:width<700?844:900});
   await page.evaluate(async()=>{await document.fonts.ready;for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))});
   const check=await page.evaluate(()=>{
    const badText=[];const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
     const n=walker.currentNode,el=n.parentElement;if(!n.textContent.trim()||!el||el.closest('script,style,.gallery-track,.skip-link,.hero-decoration,dialog'))continue;
     if(!el.getClientRects().length)continue;const range=document.createRange();range.selectNodeContents(n);
     for(const r of range.getClientRects())if(r.width&&(r.left < -1||r.right > innerWidth+1)){badText.push(n.textContent.slice(0,70));break}
    }
    const history=document.querySelector('.history');const issues=[];
    if(history){const b=history.getBoundingClientRect(),parent=history.parentElement.getBoundingClientRect();if(b.top<parent.top-.5)issues.push('History extends above parent');for(const el of history.querySelectorAll('img,figcaption,.history-copy,.button')){const r=el.getBoundingClientRect();if(r.left<b.left||r.right>b.right+.5||r.top<b.top||r.bottom>b.bottom+.5)issues.push(`Outside history: ${el.className||el.tagName}`)}const image=history.querySelector('img');if(getComputedStyle(image).objectFit!=='contain')issues.push('Portrait cropped');}
    const header=document.querySelector('.header-inner');const headerBad=[...header.children].filter(el=>el.getClientRects().length&&el.getBoundingClientRect().right>innerWidth+1).map(el=>el.className);
    return {path:location.pathname,width:innerWidth,pageWidth:document.documentElement.scrollWidth,badText:[...new Set(badText)],historyIssues:issues,headerBad,broken:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)};
   });checks.push(check);
   if([320,650,1201,1440,2560].includes(width)){await page.screenshot({path:`docs/qa/${path==='/'?'home':'history'}-responsive-${width}.png`,fullPage:true});if(path==='/')await page.locator('.history').screenshot({path:`docs/qa/history-card-${width}.png`});}
  }
 }
 await page.setViewportSize({width:1440,height:900});await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await page.locator('.history .button').click();await page.waitForURL('**/historia');if(!await page.getByRole('heading',{name:'Um Bethel, muitas histórias.'}).count())throw Error('History navigation failed');await page.getByRole('link',{name:'Bethels do Rio',exact:true}).click();await page.getByRole('button',{name:'Falar com a equipe',exact:true}).click();if(!await page.getByRole('dialog').isVisible())throw Error('History contact failed');await page.keyboard.press('Escape');await page.getByRole('link',{name:'Voltar ao início'}).click();await page.waitForURL('**/#historia');
 // Short landscape viewport: menus must remain scrollable and history reachable.
 await page.setViewportSize({width:844,height:390});await page.getByRole('button',{name:'Abrir menu',exact:true}).click();await page.getByRole('navigation',{name:'Menu principal'}).getByRole('link',{name:'História',exact:true}).click();await page.waitForURL('**/historia');
 fs.writeFileSync('docs/qa/responsive-report.json',JSON.stringify({checks,errors},null,2));
 const failures=checks.filter(c=>c.pageWidth>c.width+1||c.badText.length||c.historyIssues.length||c.broken.length||c.headerBad.length);console.log(JSON.stringify({viewports:checks.length,failures,errors,historyNavigation:'passed'}));await browser.close();if(failures.length||errors.length)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
