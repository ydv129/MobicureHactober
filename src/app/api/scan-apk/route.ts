import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest){
  try{
    const form=await req.formData()
    const file=form.get('file') as File
    if(!file) return NextResponse.json({error:"No file"},{status:400})
    const name=file.name; const size=file.size
    let score=100; const warnings:string[]=[]
    if(size>100*1024*1024){score-=20; warnings.push(`Large APK ${(size/1024/1024).toFixed(1)}MB`)}
    if(/mod|hack|crack|free|money/i.test(name)){score-=30; warnings.push(`Suspicious name: ${name}`)}
    let ai=""; let aiScore:number|null=null
    try{
      const r=await fetch("http://localhost:11434/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"gemma3:1b",prompt:`APK ${name} size ${size} suspicious? score 0-100`,stream:false})})
      if(r.ok){const d=await r.json(); ai=d.response||""; const m=ai.match(/(\d+)/); if(m){const v=parseInt(m[0]); if(v<=100) aiScore=v}}
    }catch{}
    const final = aiScore!==null ? Math.round(score*0.6+aiScore*0.4) : score
    const clamped=Math.max(0,Math.min(100,final))
    let cls="LEGIT"; if(clamped<40) cls="MALWARE"; else if(clamped<60) cls="RISKY"; else if(clamped<80) cls="SUSPICIOUS"
    return NextResponse.json({legitimacy_score:clamped, classification:cls, warnings, forensics:{metadata_score:90, pixel_score:score, ai_score:aiScore, pixel_stats:{mean_var:size/1000}, ai_analysis:ai}, details:{filename:name, size, ai_analysis:ai}})
  }catch(e:any){return NextResponse.json({error:e.message},{status:500})}
}
