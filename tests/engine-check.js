// Engine checks for the gas containment lab. Run with: tests/run.sh
// Each check runs the DOM-free particle engine and compares a measured equilibrium with the barometric prediction.
const {Sim,OpenSim,TwoBulb,Tank,OpenBox,SPECIES,R_GAS,G0}=require(process.argv[2]);
let failed=0;
function check(name,got,want,tol){const ok=Math.abs(got-want)<=tol;if(!ok)failed++;
  console.log((ok?'ok   ':'FAIL ')+name+': '+got.toPrecision(4)+' (expected '+want.toPrecision(4)+' ± '+tol.toPrecision(2)+')');}

// 1. Two bulbs, 6 km tall, valve open: top/bottom count ratio vs the exact flask-shape prediction.
{const s=new Sim(TwoBulb);s.S=6000/4.5;s.T=293;s.grav=G0;s.add(500,0,false);s.valveOpen=true;
 const sg=s.sigma(0),dt=Math.min(0.005*s.S/sg,0.05*sg/s.grav),H=R_GAS*293/(SPECIES[0].M*G0),k=s.dzb*s.S/H;
 let b=0,t=0;for(let i=0;i<s.NB;i++){const w=s.binArea[i]*Math.exp(-i*k);if(i<s.vBin)b+=w;else t+=w;}
 let top=0,bot=0,ke=0,n=0;
 for(let f=0;f<120000;f++){s.step(dt);if(f>30000&&f%10===0)for(let i=0;i<s.n;i++){if(s.z[i]>2.25)top++;else bot++;ke+=s.vx[i]**2+s.vz[i]**2;n++;}}
 check('two-bulb 6 km top/bottom ratio',top/bot,t/b,0.012);
 check('two-bulb gas temperature / wall temperature',ke/n/(2*sg*sg),1,0.02);}

// 2. Sealed tank: mean height of the gas vs H − h/(e^(h/H) − 1).
for(const [h,gas] of [[8849,2],[50000,4]]){const s=new Sim(Tank);s.valveOpen=true;s.S=h/4.5;s.T=293;s.grav=G0;s.add(1500,gas,'all');
 const sg=s.sigma(gas),dt=Math.min(0.005*s.S/sg,0.05*sg/s.grav),H=R_GAS*293/(SPECIES[gas].M*G0);
 let zs=0,n=0;for(let f=0;f<30000;f++){s.step(dt);if(f>5000&&f%20===0)for(let i=0;i<s.n;i++){zs+=s.z[i]*s.S;n++;}}
 const want=H-h/(Math.exp(h/H)-1);check('tank '+SPECIES[gas].name+' '+h+' m mean height',zs/n,want,0.015*want);}

// 3. Open column of air with reservoir edges: dot count and temperature hold, inside and outside the walls.
{const geo=Object.assign({},OpenBox,{wallX:0.5,wallZ:4.5}),s=new OpenSim(geo);s.S=8849/4.5;s.T=288;s.grav=G0;
 const sg=s.sigma(1),k=s.S*s.grav/(sg*sg),n0=2600/(2.4*(1-Math.exp(-k*4.5))/k);s.resN0=n0;s.place(2600,1,-1.2,1.2,0,4.5);
 const dt=Math.min(0.005*s.S/sg,0.05*sg/s.grav);let N=0,m=0,lowIn=0,lowOut=0,ke=0,kn=0;
 for(let f=0;f<40000;f++){s.step(dt);if(f>8000&&f%20===0){m++;N+=s.n;for(let i=0;i<s.n;i++){ke+=s.vx[i]**2+s.vz[i]**2;kn++;if(s.z[i]<1.5)(Math.abs(s.x[i])<0.5?lowIn++:lowOut++);}}}
 const th=n0*(1-Math.exp(-k*1.5))/k;
 check('open column dot count',N/m,2600,40);
 check('open column lower-third density inside / law',lowIn/m/1.0/th,1,0.04);
 check('open column lower-third density outside / law',lowOut/m/1.4/th,1,0.04);
 check('open column gas temperature / reservoir temperature',ke/kn/(2*sg*sg),1,0.02);}

// 4. Frequent-collision setup used by the open tank tab: the gas must stay at the reservoir temperature.
{const geo=Object.assign({},OpenBox,{wallX:0.7,wallZ:1.6,cell:0.1}),s=new OpenSim(geo);s.lcol=0.05;s.dcol=0.1;
 s.S=0.3/1.6;s.T=293;s.grav=G0;s.resN0=260;s.place(Math.round(260*2.4*4.5),1,-1.2,1.2,0,4.5);
 const sg=s.sigma(6),sa=s.sigma(1),dt=Math.min(0.03*s.S/sg/8,0.05*sg/s.grav,0.2*s.lcol*s.S/sa);let ke=0,kn=0,N=0,m=0;
 for(let f=0;f<16000;f++){s.step(dt);if(f>5000&&f%20===0){m++;N+=s.n;for(let i=0;i<s.n;i++){ke+=s.vx[i]**2+s.vz[i]**2;kn++;}}}
 check('open tank air temperature / reservoir temperature',ke/kn/(2*sa*sa),1,0.02);
 check('open tank dot count',N/m,2808,60);}

console.log(failed?failed+' check(s) failed':'all checks passed');process.exit(failed?1:0);
