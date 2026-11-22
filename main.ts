import fs from 'node:fs';
const S = '\x01\x12\x42\x05\x07\x0b\x0c\x10\x00\x00\x00\x00\x00\x00\x00\x00\x0a\x0a\x0a\x0a\x0a\x0a\x0a\x06\x0a\x0a\x0a\x06\x0a\x0a\x0a\x00\x0a\x0a\x0a\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x21\x25\x25\x21\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x06\x09\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x05\x05\x02\x05';
const B=[(a,b)=>(a+b)|0,(a,b)=>(a-b)|0,Math.imul,(a,b)=>{if(!b)throw 0;return (a/b)|0},(a,b)=>{if(!b)throw 0;return (a%b)|0},(a,b)=>{if(!b)throw 0;return Math.floor((a>>>0)/(b>>>0))|0},(a,b)=>{if(!b)throw 0;return (a>>>0)%(b>>>0)|0},0,(a,b)=>a&b,(a,b)=>a|b,(a,b)=>a^b,0,(a,b)=>a<<(b&31),(a,b)=>a>>(b&31),(a,b)=>(a>>>(b&31))|0,0,(a,b)=>a===b?1:0,(a,b)=>a<b?1:0,(a,b)=>a>>>0<b>>>0?1:0];
const E=new TextEncoder();
function run(p,q){
 const n=p.length,D=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),O=new Uint8Array(65536);
 let s=0,c=0,o=0,j=0,pc=0,t=0;
 const end=e=>({stdout:O.slice(0,o),exit:e});
 for(;;){
  if(t===1e6)return end(10);
  if(pc<0||pc>=n)return end(9);
  const op=p[pc],v=S.charCodeAt(op);
  if(!v)return end(5);
  const m=(v-1)>>4,a=((v-1)>>2)&3,u=(v-1)&3;
  if(pc+m>=n)return end(9);
  t++;
  const nx=pc+1+m;
  if(s<a)return end(2);
  if(s-a+u>256)return end(3);
  pc=nx;
  try{
   if(op===0)return end(0);
   else if(op===1)D[s++]=(p[nx-1]<<24)>>24;
   else if(op===2)D[s++]=p[nx-4]|p[nx-3]<<8|p[nx-2]<<16|p[nx-1]<<24;
   else if(op===3)s--;
   else if(op===4){D[s]=D[s-1];s++}
   else if(op===5){const w=D[s-1];D[s-1]=D[s-2];D[s-2]=w}
   else if(op===6){D[s]=D[s-2];s++}
   else if(op===7){const w=D[s-3];D[s-3]=D[s-2];D[s-2]=D[s-1];D[s-1]=w}
   else if(op===23)D[s-1]=-D[s-1]|0;
   else if(op===27)D[s-1]=~D[s-1];
   else if(op>=16&&op<=34){const b=D[s-1],x=D[s-2];s-=2;D[s++]=B[op-16](x,b)}
   else if(op>=48&&op<=50){const r=((p[nx-2]|p[nx-1]<<8)<<16)>>16;if(op===48||(op===49?D[--s]===0:D[--s]!==0))pc=nx+r}
   else if(op===51){if(c===64)return end(7);C[c++]=nx;pc=p[nx-2]|p[nx-1]<<8}
   else if(op===52){if(!c)return end(8);pc=C[--c]}
   else if(op===64){const d=D[s-1];if(d<0||d>255)return end(6);D[s-1]=M[d]}
   else if(op===65){const d=D[s-1],x=D[s-2];if(d<0||d>255)return end(6);s-=2;M[d]=x}
   else if(op===80){const y=E.encode(String(D[s-1]));if(o+y.length>65536)return end(11);s--;O.set(y,o);o+=y.length}
   else if(op===81){if(o+1>65536)return end(11);O[o++]=D[--s]&255}
   else if(op===82)D[s++]=j<q.length?q[j++]:-1;
   else if(op===83)return end(D[--s]&255);
  }catch{return end(4)}
 }
}
const I=process.env.MAKEFUN_INPUT_DIR||'/input',O=process.env.MAKEFUN_OUTPUT_DIR||'/output';
for(const id of fs.readdirSync(I).sort()){
 const P=fs.readFileSync(I+'/'+id+'/program.bin');
 let q;try{q=fs.readFileSync(I+'/'+id+'/input.bin')}catch{q=Buffer.alloc(0)}
 const r=run(P,q);
 fs.mkdirSync(O+'/'+id,{recursive:true});
 fs.writeFileSync(O+'/'+id+'/stdout.bin',r.stdout);
 fs.writeFileSync(O+'/'+id+'/exit.txt',String(r.exit));
}
