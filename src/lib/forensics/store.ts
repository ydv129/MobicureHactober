export type Scan={filename:string; score:number; classification:string; time:number}
const KEY="mobicure_scans"
export const saveScan=(s:Omit<Scan,"time">)=>{try{const a=JSON.parse(localStorage.getItem(KEY)||"[]");a.unshift({...s,time:Date.now()});localStorage.setItem(KEY,JSON.stringify(a.slice(0,50)))}catch{}}
export const getScans=():Scan[]=>{try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}}
export const getStats=()=>{const s=getScans();if(!s.length) return {total:0,real:0,fake:0,avg:0};const real=s.filter(x=>x.score>=60).length;const fake=s.length-real;const avg=Math.round(s.reduce((a,b)=>a+b.score,0)/s.length);return {total:s.length,real,fake,avg}}
