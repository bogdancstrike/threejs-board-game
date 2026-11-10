import { chromium } from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:960,height:720},deviceScaleFactor:1});page.setDefaultTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await mkdir('artifacts/map-previews',{recursive:true});await page.goto('http://localhost:7777/scripts/preview-stage.html');await page.waitForFunction(()=>window.renderMap);
for(const id of await page.evaluate(()=>window.mapIds)){const info=await page.evaluate(async id=>window.renderMap(id),id);await page.screenshot({path:`artifacts/map-previews/${id}.png`});console.log(id,JSON.stringify(info));}
console.log('Preview errors:',JSON.stringify(errors));await browser.close();
