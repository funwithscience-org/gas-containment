// Measure the model's interdiffusion coefficient for a heavy tracer in air, in the open-tank collision setup.
// Run: tests/run.sh diffusion   (prints D_model and the constant C_MODEL = c·n used by the open-tank clock)
const {OpenSim,OpenBox,SPECIES,G0}=require(process.argv[2]);
function D(gas,nAir,T){
  const geo=Object.assign({},OpenBox,{wallX:0.7,wallZ:0,cell:0.1}),s=new OpenSim(geo);s.lcol=0.05;s.dcol=0.1;s.side='wall';s.top='wall';
  const S=0.3/1.6;s.S=S;s.T=T;s.grav=1e-9;s.resN0=0;
  s.place(Math.round(nAir*2.4*4.5),1,-1.2,1.2,0,4.5);const n0=s.n;s.place(400,gas,-0.25,0.25,2.0,2.5);
  const sg=s.sigma(gas),sa=s.sigma(1),dt=Math.min(0.03*S/sg/8,0.2*s.lcol*S/sa);
  for(let f=0;f<400;f++)s.step(dt);                      // let velocities relax
  const x0=[],z0=[];for(let i=0;i<s.n;i++)if(s.sp[i]===gas){x0.push(s.x[i]);z0.push(s.z[i]);}
  const pts=[];let t=0;
  for(let f=1;f<=6000;f++){s.step(dt);t+=dt;if(f%500===0){let m=0,k=0;for(let i=0;i<s.n;i++)if(s.sp[i]===gas){m+=(s.x[i]-x0[k])**2+(s.z[i]-z0[k])**2;k++;}pts.push([t,m/k]);}}
  // slope of MSD (2D: MSD = 4 D t), least squares through the later points
  const P=pts.slice(2);const mt=P.reduce((a,p)=>a+p[0],0)/P.length,mm=P.reduce((a,p)=>a+p[1],0)/P.length;
  const sl=P.reduce((a,p)=>a+(p[0]-mt)*(p[1]-mm),0)/P.reduce((a,p)=>a+(p[0]-mt)**2,0);
  const Du=sl/4;return {Dm:Du*S*S,c:Du*S/sg,rmsEnd:Math.sqrt(pts[pts.length-1][1])};
}
for(const [g,n,T] of [[6,260,293],[6,260,293],[5,260,293],[5,260,293],[6,130,293],[6,260,500]]){const r=D(g,n,T);
  console.log(SPECIES[g].key,'nAir',n,'T',T,' D_model =',r.Dm.toExponential(3),'m²/s   c = D/(σ·S) =',r.c.toFixed(4),'  c·n =',(r.c*n).toFixed(2),' rms spread',r.rmsEnd.toFixed(2),'u');}
