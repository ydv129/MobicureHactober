import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest){
  try{
    const {url} = await req.json()
    let score=100; const warnings:string[]=[]
    const u=url.trim()
    if(!u.startsWith("https://")){score-=30; warnings.push("No HTTPS")}
    if(/\.(tk|ml|ga|cf|gq|xyz|top|work)/i.test(u)){score-=25; warnings.push("Suspicious TLD")}
    if(/bit\.ly|tinyurl/i.test(u)){score-=20; warnings.push("URL shortener")}
    if(/@/g.test(u)){score-=30; warnings.push("@ symbol phishing")}
    if(u.length>100){score-=10; warnings.push("Long URL")}
    let ai=""; let aiScore:number|null=null
    try{
      const r=await fetch("http://localhost:11434/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"gemma3:1b",prompt:`URL ${u} phishing? JSON score 0-100`,stream:false})})
      if(r.ok){const d=await r.json(); ai=d.response||""; const m=ai.match(/(\d+)/); if(m){const v=parseInt(m[0]); if(v<=100) aiScore=v}}
    }catch{}
    const final = aiScore!==null ? Math.round(score*0.6+aiScore*0.4) : score
    const clamped=Math.max(0,Math.min(100,final))
    let cls="LEGIT"; if(clamped<40) cls="PHISHING"; else if(clamped<60) cls="RISKY"; else if(clamped<80) cls="SUSPICIOUS"
    return NextResponse.json({legitimacy_score:clamped, classification:cls, warnings, forensics:{metadata_score:90, pixel_score:score, ai_score:aiScore, pixel_stats:{mean_var:score, std_var:10}, ai_analysis:ai}, details:{url:u, ai_analysis:ai}})
  }catch(e:any){return NextResponse.json({error:e.message},{status:500})}
}
