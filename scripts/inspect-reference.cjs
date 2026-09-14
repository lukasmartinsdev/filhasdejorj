const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
fs.mkdirSync('docs/reference',{recursive:true});
const browser=await chromium.launch({headless:true,channel:'msedge'});
const page=await browser.newPage();
await page.goto('https://ceod2027.demolayrj.org/#inicio',{waitUntil:'networkidle',timeout:90000});
for(const [width,height] of [[1920,1080],[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]]){
await page.setViewportSize({width,height});
await page.screenshot({path:`docs/reference/ceod-${width}.png`,fullPage:true});
}
const report=await page.evaluate(()=>({title:document.title,text:document.body.innerText,sections:[...document.querySelectorAll('section,header,footer')].map(e=>({tag:e.tagName,id:e.id,classes:e.className,height:e.offsetHeight,text:e.innerText.slice(0,400),background:getComputedStyle(e).backgroundColor})),fonts:[...new Set([...document.querySelectorAll('h1,h2,p,a')].map(e=>getComputedStyle(e).fontFamily))],images:[...document.images].map(e=>({src:e.src,alt:e.alt})),links:[...document.querySelectorAll('a')].map(e=>({text:e.textContent,href:e.href}))}));
fs.writeFileSync('docs/reference/ceod-analysis.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report).slice(0,18000));
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
