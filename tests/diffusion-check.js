// Measures the model's interdiffusion constants used by the real-time clocks (C_BR on the two-bulb tab, C_MODEL on the
// open-tank tab) from the spread of tracer dots in air, in a box large enough that its walls do not matter.
// Run: tests/run.sh diffusion   (takes a few minutes). Prints c·n, which is the constant.
// Bromine-in-air diffusion in the model, measured in a large box so walls and noise do not matter.
const {OpenSim,OpenBox,SPECIES}=require(process.argv[2]);
function dBromine(nAir,dcol,lcol,STEPS){
  const geo=Object.assign({},OpenBox,{xmin:-3,xmax:3,zmax:9,wallX:0.7,wallZ:0,cell:0.06,width(z){return 6;}}),s=new OpenSim(geo,45000);s.lcol=lcol;s.dcol=dcol;s.side='wall';s.top='wall';
  const S=0.3/4.5;s.S=S;s.T=293;s.grav=1e-9;s.resN0=0;
  s.place(Math.round(nAir*6*9),1,-3,3,0,9);s.place(3000,0,-0.1,0.1,4.4,4.6);
  const sg=s.sigma(0),sa=s.sigma(1),dt=Math.min(0.03*S/sg/8,0.2*lcol*S/sa);
  for(let f=0;f<60;f++)s.step(dt);
  const x0=[],z0=[];for(let i=0;i<s.n;i++)if(s.sp[i]===0){x0.push(s.x[i]);z0.push(s.z[i]);}
  const pts=[];let t=0;
  for(let f=1;f<=STEPS;f++){s.step(dt);t+=dt;if(f%(STEPS/12)===0){let m=0,k=0;for(let i=0;i<s.n;i++)if(s.sp[i]===0){m+=(s.x[i]-x0[k])**2+(s.z[i]-z0[k])**2;k++;}pts.push([t,m/k]);}}
  const P=pts.slice(3),mt=P.reduce((a,p)=>a+p[0],0)/P.length,mm=P.reduce((a,p)=>a+p[1],0)/P.length;
  const sl=P.reduce((a,p)=>a+(p[0]-mt)*(p[1]-mm),0)/P.reduce((a,p)=>a+(p[0]-mt)**2,0),Du=sl/4;
  return {c:Du*S/sg,rms:Math.sqrt(pts[pts.length-1][1])};
}
for(const [n,d,l,st] of [[683,0.05,0.085,2400],[420,0.05,0.085,1800]]){const t0=Date.now(),r=dBromine(n,d,l,st);
  console.log('bromine in air, two-bulb settings: n',n,' c·n =',(r.c*n).toFixed(1),' rms',r.rms.toFixed(2),'u ',((Date.now()-t0)/1000).toFixed(0)+'s');}
// Open-tank settings. Tracers are dilute (8% of the dots, spread evenly) so they collide with air, not with each other;
// only tracers that start in the middle of the box are followed, so the walls do not matter. A dense blob of tracers
// reads about 30% low. The page's constants (SF6 4.0, CO2 2.5) also match the half-emptying time of the tank itself
// against a numerical solution of the diffusion equation on the same shape.
function dHeavy(gas,nAir,STEPS){
  const geo=Object.assign({},OpenBox,{xmin:-3,xmax:3,zmax:9,wallX:0.7,wallZ:0,cell:0.1,width(z){return 6;}}),s=new OpenSim(geo,20000);s.lcol=0.05;s.dcol=0.1;s.side='wall';s.top='wall';
  const S=0.3/1.6;s.S=S;s.T=293;s.grav=1e-9;s.resN0=0;
  s.place(Math.round(nAir*54*0.92),1,-3,3,0,9);s.place(Math.round(nAir*54*0.08),gas,-3,3,0,9);
  const sg=s.sigma(gas),sa=s.sigma(1),dt=Math.min(0.03*S/sg/8,0.2*s.lcol*S/sa);
  for(let f=0;f<200;f++)s.step(dt);
  // dots are never removed here, so indices are stable
  const id=[],x0=[],z0=[];for(let i=0;i<s.n;i++)if(s.sp[i]===gas&&Math.abs(s.x[i])<1.5&&s.z[i]>2.25&&s.z[i]<6.75){id.push(i);x0.push(s.x[i]);z0.push(s.z[i]);}
  const pts=[];let t=0;
  for(let f=1;f<=STEPS;f++){s.step(dt);t+=dt;if(f%(STEPS/12)===0){let m=0;for(let k=0;k<id.length;k++)m+=(s.x[id[k]]-x0[k])**2+(s.z[id[k]]-z0[k])**2;pts.push([t,m/id.length]);}}
  const P=pts.slice(3),mt=P.reduce((a,p)=>a+p[0],0)/P.length,mm=P.reduce((a,p)=>a+p[1],0)/P.length;
  const sl=P.reduce((a,p)=>a+(p[0]-mt)*(p[1]-mm),0)/P.reduce((a,p)=>a+(p[0]-mt)**2,0),Du=sl/4;
  return {c:Du*S/sg,rms:Math.sqrt(pts[pts.length-1][1])};
}
for(const [g,n,st] of [[6,260,4800],[6,260,4800],[5,260,4800]]){const r=dHeavy(g,n,st);console.log(SPECIES[g].key,'in air, open-tank settings: n',n,' c·n =',(r.c*n).toFixed(2),' rms',r.rms.toFixed(2),'u');}
