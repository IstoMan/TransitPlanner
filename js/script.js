const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
const ll=(la,lo)=>[+((lo-73.72)/0.28*800).toFixed(1),+((18.64-la)/0.20*600).toFixed(1)];
const P=[['Pimpri',18.6298,73.7997,1],['Hinjawadi',18.5912,73.738,0],['Deccan',18.5163,73.8404,1],['Warje',18.483,73.803,0],['Kothrud',18.5069,73.8057,1],['Shivajinagar',18.5308,73.8475,1],['Pune Station',18.5289,73.8744,1],['Swargate',18.5018,73.8636,1],['Katraj',18.4575,73.8677,0],['Viman Nagar',18.5679,73.9143,1],['Kharadi',18.5515,73.94,0],['Wagholi',18.58,73.98,0],['Hadapsar',18.5089,73.9259,0],['Undri',18.456,73.907,0]].map(([n,la,lo,m])=>{const[x,y]=ll(la,lo);return{n,la,lo,x,y,m}});
const DATA={"A":{"Pimpri":{"M":[36,72.0,11,34.8,5],"A":[55,55.0,10,32.4,9],"E":[40,120.0,11,30.4,9]},"Hinjawadi":{"M":[85,170.0,17,36.1,4],"A":[126,126.0,15,33.9,7],"E":[88,264.0,17,34.2,7]},"Deccan":{"M":[19,38.0,10,38.2,8],"A":[20,20.0,10,31.6,14],"E":[19,57.0,8,34.7,15]},"Warje":{"M":[69,138.0,12,30.7,9],"A":[114,114.0,12,27.0,21],"E":[79,237.0,12,26.4,17]},"Kothrud":{"M":[71,142.0,12,30.0,11],"A":[138,138.0,12,25.1,21],"E":[80,240.0,12,24.9,22]},"Shivajinagar":{"M":[272,544.0,49,32.6,7],"A":[408,408.0,42,28.9,15],"E":[304,912.0,50,26.9,18]},"Pune Station":{"M":[227,454.0,56,31.9,7],"A":[362,362.0,53,28.2,13],"E":[238,714.0,56,27.8,15]},"Swargate":{"M":[112,224.0,34,33.6,6],"A":[179,179.0,27,29.0,16],"E":[122,366.0,37,28.9,16]},"Katraj":{"M":[186,372.0,22,33.3,7],"A":[257,257.0,20,28.5,14],"E":[216,648.0,20,28.6,16]},"Viman Nagar":{"M":[3,6.0,2,27.7,12],"A":[7,7.0,2,27.4,16],"E":[3,9.0,2,28.5,0]},"Kharadi":{"M":[15,30.0,4,30.1,8],"A":[23,23.0,4,26.6,20],"E":[18,54.0,4,22.2,25]},"Wagholi":{"M":[7,14.0,1,29.1,4],"A":[7,7.0,2,28.9,2],"E":[7,21.0,2,26.4,6]},"Hadapsar":{"M":[149,298.0,28,36.2,4],"A":[241,241.0,25,30.7,13],"E":[148,444.0,27,31.6,11]},"Undri":{"M":[1,2.0,1,36.8,0],"A":[2,2.0,1,28.6,11],"E":[1,3.0,1,28.3,0]}},"PR":{"Pimpri|Hinjawadi":[["379"],{"A":39.6,"E":26.6}],"Pimpri|Pune Station":[["311","332"],{"M":25.4,"A":28.0,"E":23.1}],"Hinjawadi|Shivajinagar":[["100"],{"M":40.1,"A":33.9,"E":33.3}],"Hinjawadi|Pune Station":[["115P","333"],{"M":36.4,"A":34.1,"E":34.4}],"Hinjawadi|Swargate":[["88"],{"M":24.9,"A":33.9,"E":27.8}],"Hinjawadi|Katraj":[["103","43"],{"M":34.4,"A":32.3,"E":32.4}],"Hinjawadi|Hadapsar":[["208"],{"M":34.1,"A":30.9,"E":34.9}],"Warje|Viman Nagar":[["161"],{"M":21.9,"A":28.0,"E":32.9}],"Warje|Kharadi":[["237"],{"M":33.6,"A":27.2,"E":22.5}],"Warje|Hadapsar":[["202","64"],{"M":29.7,"A":23.5,"E":23.5}],"Kothrud|Pune Station":[["94","144"],{"M":24.9,"A":22.3,"E":20.0}],"Kothrud|Katraj":[["103"],{"M":32.5,"A":24.0,"E":24.9}],"Kothrud|Hadapsar":[["VJR3","197"],{"M":28.2,"A":22.4,"E":23.3}],"Shivajinagar|Pune Station":[["151"],{"M":39.9,"E":39.9}],"Shivajinagar|Katraj":[["2","28","26","27"],{"M":30.5,"A":24.6,"E":21.3}],"Shivajinagar|Kharadi":[["234"],{"M":29.6,"A":25.0,"E":19.9}],"Shivajinagar|Hadapsar":[["175"],{"M":31.6,"A":28.5,"E":10.9}],"Pune Station|Swargate":[["5","3"],{"M":26.7,"A":19.0,"E":16.6}],"Pune Station|Viman Nagar":[["166"],{"M":32.5,"A":26.8,"E":25.0}],"Pune Station|Kharadi":[["163"],{"M":31.8,"A":28.2,"E":28.8}],"Pune Station|Hadapsar":[["203"],{"M":39.5,"E":39.7}],"Swargate|Katraj":[["2"],{"M":39.9,"E":39.9}],"Swargate|Hadapsar":[["301","207"],{"M":39.6,"A":34.0,"E":39.7}],"Swargate|Undri":[["194"],{"E":28.3}],"Katraj|Kharadi":[["235"],{"M":32.6,"A":25.6,"E":22.2}],"Katraj|Hadapsar":[["291","188","301A"],{"M":35.1,"A":31.9,"E":33.8}],"Wagholi|Hadapsar":[["185"],{"M":29.1,"A":28.7,"E":25.4}],"Hadapsar|Undri":[["192"],{"M":36.8,"A":28.6}]},"G":{"trips":5114,"speed":30.8,"ser":{"t":[540,550,840,850,860,870,880,890,1080,1090],"sp":[33.6,34.0,29.9,29.7,29.6,29.8,30.0,31.4,29.0,30.2],"hv":[6.3,6.3,13.4,14.0,13.8,14.2,12.8,11.5,15.3,13.0],"tr":[1169,1189,1185,1175,1158,1181,1185,1150,1324,1326]}}};
const A=DATA.A,PR=DATA.PR,G=DATA.G,SAMPLE_THRESHOLD=40,SHORT_KM=8;
const nm=n=>{const p=P.find(q=>q.n===n);return p.x+','+p.y};
const S=a=>a.map(([la,lo])=>ll(la,lo).join(',')).join(' ');
let pax=1,live=true,sel=0,opts=[],cur=null;
const fmt=m=>{m=((Math.round(m)%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
const inr=n=>Math.round(n).toLocaleString('en-IN');
const hav=(a,b)=>{const r=Math.PI/180,dl=(b.la-a.la)*r,dn=(b.lo-a.lo)*r,h=Math.sin(dl/2)**2+Math.cos(a.la*r)*Math.cos(b.la*r)*Math.sin(dn/2)**2;return 12742*Math.asin(Math.sqrt(h))};
P.forEach((p,i)=>{['from','to'].forEach(id=>{const o=document.createElement('option');o.value=i;o.textContent=p.n+(p.m?' (metro nearby)':'');$(id).appendChild(o)});const o=document.createElement('option');o.value=p.n;$('pl').appendChild(o)});
$('from').value=11;$('to').value=7;

// ---------- map ----------
const pl2=(a,w,c)=>`<polyline points="${S(a)}" stroke="${c}" stroke-width="${w}"/>`;
const RV=[[[18.44,73.765],[18.48,73.8],[18.5,73.82],[18.5155,73.8455],[18.534,73.865],[18.542,73.89],[18.538,73.92],[18.55,73.95],[18.56,74]],[[18.61,73.76],[18.58,73.795],[18.562,73.818],[18.545,73.85],[18.534,73.865]]];
$('river').innerHTML=RV.map(a=>pl2(a,17,'var(--road)')).join('')+RV.map(a=>pl2(a,12,'var(--river)')).join('');
const RD=[['Hinjawadi','Kothrud','Deccan','Shivajinagar','Pune Station','Hadapsar','Undri'],['Pimpri','Hinjawadi'],['Katraj','Swargate','Pune Station','Viman Nagar','Kharadi','Wagholi'],['Kothrud','Shivajinagar'],['Hadapsar','Kharadi'],['Warje','Kothrud'],['Swargate','Hadapsar'],['Pimpri','Shivajinagar']];
const rl=(w,c)=>RD.map(l=>`<polyline points="${l.map(nm).join(' ')}" stroke="${c}" stroke-width="${w}"/>`).join('');
$('roads').innerHTML=rl(13,'var(--redge)')+rl(9,'var(--road)');
const PUR=[[18.6298,73.7997],[18.6035,73.8266],[18.5757,73.8392],[18.558,73.8337],[18.5308,73.8475],[18.5282,73.8568],[18.5159,73.8546],[18.5018,73.8636]];
const AQ=[[18.5069,73.8057],[18.5122,73.8285],[18.5163,73.8404],[18.5282,73.8568],[18.5289,73.8744],[18.537,73.88],[18.544,73.887],[18.547,73.903],[18.551,73.913]];
$('purple').setAttribute('points',S(PUR));$('aqua').setAttribute('points',S(AQ));
$('stn').innerHTML=PUR.concat(AQ).map(([la,lo])=>{const[x,y]=ll(la,lo);return `<circle cx="${x}" cy="${y}" r="3" fill="var(--panel)" stroke="var(--ink)" stroke-width="1.5"/>`}).join('');
P.forEach(p=>{const g=document.createElementNS(NS,'g');g.style.cursor='pointer';
 g.innerHTML=`<circle cx="${p.x}" cy="${p.y}" r="${p.m?7:5}" fill="${p.m?'var(--panel)':'var(--mute)'}" stroke="${p.m?'var(--metro)':'var(--panel)'}" stroke-width="3"/><text class="lbl" x="${p.x+10}" y="${p.y+4}">${p.n}</text>`;
 g.onclick=()=>{$('to').value=P.indexOf(p);calc()};$('places').appendChild(g)});

// ---------- logic ----------
const WIN={M:[540,570,555,'09:00–09:30'],A:[840,900,870,'14:00–15:00'],E:[1080,1100,1090,'18:00–18:20']};
const wOf=t=>{let b=null,bd=1e9;for(const k in WIN){const d=Math.abs(t-WIN[k][2]);if(d<bd){bd=d;b=k}}return bd<=180?b:null};
const avg=x=>x.reduce((s,v)=>s+v,0)/x.length;
const randomSource=seed=>()=>{let x=seed+=0x6D2B79F5;x=Math.imul(x^x>>>15,x|1);x^=x+Math.imul(x^x>>>7,x|61);return((x^x>>>14)>>>0)/4294967296};
const trainingRows=P.flatMap(p=>Object.keys(WIN).map(w=>({window:w,x:[WIN[w][2]/1440,p.la,p.lo],y:A[p.n][w][3]})));
const squaredError=samples=>{let sum=0,squares=0;samples.forEach(s=>{sum+=s.y;squares+=s.y*s.y});return squares-sum*sum/samples.length};
function trainTree(samples,rand,depth=0){
  const mean=avg(samples.map(s=>s.y)),leaf={value:mean};
  if(depth>=5||samples.length<4)return leaf;
  const feature=Math.floor(rand()*3),values=Array.from(new Set(samples.map(s=>s.x[feature]))).sort((a,b)=>a-b);
  let best=null,bestLoss=Infinity;
  for(let i=0;i<values.length-1;i++){
    const threshold=(values[i]+values[i+1])/2,left=[],right=[];
    samples.forEach(s=>(s.x[feature]<=threshold?left:right).push(s));
    if(left.length<2||right.length<2)continue;
    const loss=squaredError(left)+squaredError(right);
    if(loss<bestLoss){bestLoss=loss;best={feature,threshold,left,right}}
  }
  if(!best)return leaf;
  return{feature:best.feature,threshold:best.threshold,left:trainTree(best.left,rand,depth+1),right:trainTree(best.right,rand,depth+1)};
}
const TREE_COUNT=32;
const trainForest=(rows,seedBase=8421)=>Array.from({length:TREE_COUNT},(_,treeIndex)=>{
  const rand=randomSource(seedBase+treeIndex),bootstrap=rows.map(()=>rows[Math.floor(rand()*rows.length)]);
  return trainTree(bootstrap,rand);
});
const forest=trainForest(trainingRows);
function predictTree(tree,x){return Object.prototype.hasOwnProperty.call(tree,'value')?tree.value:predictTree(x[tree.feature]<=tree.threshold?tree.left:tree.right,x)}
const predictForest=(trees,x)=>avg(trees.map(tree=>predictTree(tree,x)));
const validation=(()=>{
  const errors=[],baselineErrors=[],windows=Object.keys(WIN);
  windows.forEach((heldWindow,foldIndex)=>{
    const train=trainingRows.filter(row=>row.window!==heldWindow);
    const test=trainingRows.filter(row=>row.window===heldWindow);
    const foldForest=trainForest(train,20000+foldIndex*TREE_COUNT),baseline=avg(train.map(row=>row.y));
    test.forEach(row=>{
      errors.push(predictForest(foldForest,row.x)-row.y);
      baselineErrors.push(baseline-row.y);
    });
  });
  const summarize=values=>({mae:avg(values.map(error=>Math.abs(error))),rmse:Math.sqrt(avg(values.map(error=>error*error)))});
  return{samples:errors.length,folds:windows.length,forest:summarize(errors),baseline:summarize(baselineErrors)};
})();
const predictSpeed=(a,b,t)=>predictForest(forest,[t/1440,(a.la+b.la)/2,(a.lo+b.lo)/2]);
const nowT=()=>{const d=new Date();return d.getHours()*60+d.getMinutes()};
const curT=()=>live?nowT():(v=>+v[0]*60+ +v[1])($('time').value.split(':'));
const svc=(p,w)=>w?A[p.n][w][1]:0;
const sparse=(p,t)=>svc(p,wOf(t))<SAMPLE_THRESHOLD;
function count(el,to,dur=700){const from=+el.dataset.v||0,t0=performance.now();el.dataset.v=to;const f=n=>{const k=Math.min(1,(n-t0)/dur);el.textContent=inr(from+(to-from)*k);if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)}

function calc(){
  const a=P[+$('from').value],b=P[+$('to').value],t=curT(),w=wOf(t);
  const modelSpeed=predictSpeed(a,b,t);
  $('rfSpeed').textContent=modelSpeed.toFixed(1);
  $('rfDetails').textContent=`${a.n} to ${b.n} · ${fmt(t)} · trained on ${trainingRows.length} bundled area/window samples`;
  const nSparse=P.filter(p=>sparse(p,t)).length;$('nb').textContent=nSparse;count($('k2'),nSparse);
  const sp=w?avg(G.ser.sp.filter((_,i)=>G.ser.t[i]>=WIN[w][0]-1&&G.ser.t[i]<=WIN[w][1])):G.speed;
  $('k3').textContent=sp.toFixed(1);$('k3d').textContent=w?'Window '+WIN[w][3]:'All sample windows';
  $('wl').textContent=w?`Historical sample window ${WIN[w][3]} · not live arrivals`:`No historical sample near ${fmt(t)}`;
  const mx=Math.max(...P.map(p=>svc(p,w)),1);
  $('bars').innerHTML=P.slice().sort((x,y)=>svc(y,w)-svc(x,w)).map(p=>`<div class="bar"><span>${p.n}</span><i class="${sparse(p,t)?'d':''}" style="width:${Math.max(3,svc(p,w)/mx*100)}%"></i><b>${Math.round(svc(p,w))}</b></div>`).join('');
  $('zones').innerHTML=$('tz').classList.contains('on')?P.filter(p=>sparse(p,t)).map(p=>`<circle cx="${p.x}" cy="${p.y}" r="26" fill="#f5b83e" fill-opacity=".22" stroke="#e8a317" stroke-width="2" stroke-dasharray="5 4"/>`).join(''):'';
  if(a===b){$('banner').innerHTML='<div class="banner"><h4>Choose two different places</h4><p>Select a different destination to compare travel options.</p></div>';$('opts').innerHTML='';$('fare').innerHTML='';$('route').setAttribute('opacity',0);$('veh').style.display='none';$('pins').innerHTML='';cur=null;return}

  const km=hav(a,b)*1.3,short=km<=SHORT_KM,peak=w==='M'||w==='E';
  const key=PR[a.n+'|'+b.n]||PR[b.n+'|'+a.n];
  const direct=key&&w&&key[1][w]?key:null;
  const busSp=direct?key[1][w]:modelSpeed;
  const head=w?Math.min(20,Math.max(3,(WIN[w][1]-WIN[w][0])/Math.max(1,svc(a,w))/2)):10;
  const busT=km/busSp*60+head+10+(direct?0:10);
  const o=[];
  o.push({name:'Bus',ic:'B',col:'var(--bus)',t:busT,fare:(8+1.5*km)*pax,
    note:direct?`Historical route sample: ${direct[0].join(', ')} · ~${busSp.toFixed(0)} km/h`:'No direct route in the samples; a transfer is assumed',
    sub:`Includes ~${Math.round(head)} min wait and ~10 min walking${direct?'':' plus a transfer'}`});
  if(a.m&&b.m){o.push({name:'Metro',ic:'M',col:'var(--metro)',t:km*0.95/32*60+6+12,fare:Math.min(35,Math.max(10,Math.round(km*1.8)))*pax,metro:1,
    note:'Both places are near a metro station · ~32 km/h average',sub:'Includes ~6 min wait and ~12 min to reach and enter stations'})}
  else o.push({name:'Metro',ic:'M',col:'var(--metro)',t:null,fare:null,metro:1,note:'Not available for this pair',sub:'Both places need a metro station nearby'});
  const cabs=Math.ceil(pax/4),autos=Math.ceil(pax/3),surge=peak?1.15:1;
  o.push({name:'Cab',ic:'C',col:'var(--cab)',t:km/(sp*1.25)*60+5,fare:(60+15*km)*surge*cabs,ride:1,
    note:`${cabs} cab${cabs>1?'s':''} for ${pax} passenger${pax>1?'s':''} · door to door`,sub:`Typical city rate${peak?' with a peak-hour uplift':''}; not a provider quote`});
  o.push({name:'Auto',ic:'A',col:'var(--auto)',t:km/(sp*1.1)*60+4,fare:(30+17*Math.max(0,km-1.5))*autos,ride:1,
    note:`${autos} auto${autos>1?'s':''} for ${pax} passenger${pax>1?'s':''} · door to door`,sub:'Typical meter-style estimate; not a provider quote'});
  const best=Math.min(...o.filter(x=>x.t!=null).map(x=>x.t));
  o.forEach(x=>x.fast=short&&x.t!=null&&x.t===best);
  opts=o;cur={a,b,km};
  const ok=o.filter(x=>x.t!=null).sort((x,y)=>x.t-y.t)[0];
  sel=Math.max(0,o.indexOf(ok));
  $('banner').innerHTML=`<div class="banner"><h4>${km.toFixed(1)} km by road (estimated) · ${short?'short trip':'longer trip'}</h4><p>${short?`Fastest option is marked below for trips up to ${SHORT_KM} km.`:`Over ${SHORT_KM} km, traffic and transfers make times vary widely, so no option is marked fastest.`}</p><p>${direct?`Bus speed from the historical route sample (${busSp.toFixed(1)} km/h).`:`Bus speed estimated by the random forest (${busSp.toFixed(1)} km/h).`}</p></div>`;
  draw();
}
const money=n=>n==null?'—':'₹'+inr(n);
function draw(){
  if(!cur)return;const{a,b}=cur,o=opts[sel];
  $('opts').innerHTML=opts.map((x,i)=>`<button class="opt ${i===sel?'sel':''}" style="--c:${x.col}" data-i="${i}" type="button"><span class="ic">${x.ic}</span><span><strong>${x.name}${x.fast?'<span class="tag">Fastest</span>':''}</strong><small>${x.note}</small><small>${x.sub}</small></span><span class="mins">${x.t==null?'—':Math.round(x.t)}<span>${x.t==null?'n/a':'min · '+money(x.fare)}</span></span></button>`).join('');
  document.querySelectorAll('.opt').forEach(el=>el.onclick=()=>{sel=+el.dataset.i;draw()});
  let extra='';
  if(o.metro&&o.t!=null)extra='<a class="cta" href="https://punemetrorail.org/fare_chart.aspx" target="_blank" rel="noopener noreferrer">Check official fare</a><a class="cta sec" href="https://www.punemetrorail.org/download/Maha-Metros-Pune-Metro-Mobile-App-For-Seamless-Travel-And-Contactless-Ticketing.pdf" target="_blank" rel="noopener noreferrer">Maha Metro app information</a>';
  if(o.ride)extra='<small>Booking isn’t connected here. Use your preferred cab or auto app to get a live quote.</small>';
  $('fare').innerHTML=o.t==null?`<small>Selected · ${o.name}</small><div class="big">Unavailable</div><small>${o.note}</small>`:`<small>Selected · ${o.name} · estimated total for ${pax} passenger${pax>1?'s':''}</small><div class="big">${money(o.fare)} · ${Math.round(o.t)} min</div><small>Indicative estimate. Actual fares and times will differ.</small>${extra}`;
  const rp=$('route');rp.setAttribute('d',`M${a.x} ${a.y}L${b.x} ${b.y}`);rp.setAttribute('stroke',o.col);rp.setAttribute('opacity',o.t==null?0:.9);
  $('pins').innerHTML=[a,b].map((p,i)=>`<circle cx="${p.x}" cy="${p.y}" r="9" fill="${i?'#f08a00':'#16a34a'}" stroke="#fff" stroke-width="3"/>`).join('');
  $('veh').style.display=o.t==null?'none':'';vp=0;
}
let vp=0,last=0;
function loop(ts){const dt=(ts-last)/1000;last=ts;const rp=$('route');
 if(cur&&rp.getAttribute('opacity')>0){vp=(vp+dt*.18)%1;const pt=rp.getPointAtLength(vp*rp.getTotalLength());$('veh').setAttribute('cx',pt.x);$('veh').setAttribute('cy',pt.y)}
 requestAnimationFrame(loop)}
requestAnimationFrame(t=>{last=t;loop(t)});

// ---------- chart ----------
const fm=m=>fmt(m),TL=G.ser.t.map(fm),N=TL.length-1;
const DS={'Median speed (km/h)':G.ser.sp,'Heavy congestion (%)':G.ser.hv,'Bus trips running':G.ser.tr};
let tab='Median speed (km/h)';
$('tabs').innerHTML=Object.keys(DS).map(k=>`<button data-k="${k}" type="button" class="${k===tab?'on':''}">${k}</button>`).join('');
const W=700,H=200,L=44,B=26,cx=i=>L+i*(W-L-10)/N,mxv=()=>Math.ceil(Math.max(...DS[tab])*1.25/10)*10,cy=v=>H-B-v/mxv()*(H-B-12);
function chart(){const pts=DS[tab].map((v,i)=>[cx(i),cy(v)]);let p=`M${pts[0]}`;
 for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],m=(a[0]+b[0])/2;p+=`C${m},${a[1]} ${m},${b[1]} ${b[0]},${b[1]}`}
 $('ch').innerHTML=[.25,.5,.75,1].map(f=>{const v=mxv()*f;return `<line x1="${L}" x2="${W-10}" y1="${cy(v)}" y2="${cy(v)}" stroke="var(--line)"/><text x="4" y="${cy(v)+4}">${Math.round(v)}</text>`}).join('')+TL.map((s,i)=>`<text x="${cx(i)}" y="${H-6}" text-anchor="middle">${s}</text>`).join('')+`<path d="${p}L${cx(N)},${H-B}L${cx(0)},${H-B}Z" fill="var(--accs)" opacity=".7"/><path d="${p}" fill="none" stroke="var(--acc)" stroke-width="2"/><line id="cl" y1="8" y2="${H-B}" stroke="var(--mute)" stroke-dasharray="3 3" opacity="0"/><circle id="cc" r="5" fill="var(--acc)" stroke="#fff" stroke-width="2" opacity="0"/>`}
$('ch').onmousemove=e=>{const r=$('ch').getBoundingClientRect(),i=Math.max(0,Math.min(N,Math.round(((e.clientX-r.left)/r.width*W-L)/((W-L-10)/N)))),x=cx(i),y=cy(DS[tab][i]);
 $('cl').setAttribute('x1',x);$('cl').setAttribute('x2',x);$('cl').setAttribute('opacity',1);$('cc').setAttribute('cx',x);$('cc').setAttribute('cy',y);$('cc').setAttribute('opacity',1);
 const t=$('tip');t.style.display='';t.textContent=DS[tab][i];t.style.left=x/W*100+'%';t.style.top=y/H*100+'%'};
$('ch').onmouseleave=()=>{$('tip').style.display='none';$('cl').setAttribute('opacity',0);$('cc').setAttribute('opacity',0)};
$('tabs').onclick=e=>{const k=e.target.dataset.k;if(!k)return;tab=k;document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.k===k));chart()};
chart();

// ---------- controls ----------
['from','to'].forEach(id=>$(id).onchange=calc);
$('swap').onclick=()=>{const f=$('from').value;$('from').value=$('to').value;$('to').value=f;calc()};
$('plus').onclick=()=>{pax=Math.min(24,pax+1);$('pax').textContent=pax;calc()};
$('minus').onclick=()=>{pax=Math.max(1,pax-1);$('pax').textContent=pax;calc()};
$('time').onchange=()=>{live=false;calc()};
$('nowbtn').onclick=()=>{live=true;$('time').value=fmt(nowT());calc()};
$('tz').onclick=()=>{$('tz').classList.toggle('on');$('tz').setAttribute('aria-pressed',String($('tz').classList.contains('on')));calc()};
function showToast(m){const t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(showToast.k);showToast.k=setTimeout(()=>t.classList.remove('show'),2600)}
const searchPlace=()=>{const q=$('search').value.trim().toLowerCase();if(!q)return;const p=P.find(x=>x.n.toLowerCase()===q)||P.find(x=>x.n.toLowerCase().startsWith(q));if(!p){showToast('No matching place found. Choose a Pune area from the suggestions.');return}$('to').value=P.indexOf(p);location.hash='plan';showPage();calc();$('plan').scrollIntoView({behavior:'smooth',block:'start'});showToast(`Destination set to ${p.n}.`)};
$('search').addEventListener('change',searchPlace);$('search').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();searchPlace()}});
$('menuToggle').onclick=()=>{const o=$('side').classList.toggle('open');$('menuToggle').setAttribute('aria-expanded',String(o))};
$('theme').onclick=()=>{const d=document.documentElement,dark=d.dataset.theme?d.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;d.dataset.theme=dark?'light':'dark';showToast(`Switched to ${dark?'light':'dark'} theme.`)};
function showPage(){const target=document.getElementById(location.hash.slice(1));const page=target&&target.closest('.page')||$('plan');document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p===page));document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('on',a.hash===(location.hash||'#plan')));if(location.hash&&target)requestAnimationFrame(()=>target.scrollIntoView({behavior:'smooth',block:'start'}))}
window.addEventListener('hashchange',showPage);
document.querySelectorAll('#nav a').forEach(a=>a.onclick=()=>{$('side').classList.remove('open');$('menuToggle').setAttribute('aria-expanded','false')});
showPage();
$('time').value=fmt(nowT());
let lastMin=-1;setInterval(()=>{if(live){const m=nowT();$('time').value=fmt(m);if(m!==lastMin){lastMin=m;calc()}}},1000);
(()=>{document.querySelectorAll('.wx').forEach(wx=>{const r=+wx.dataset.rain,k=r>=60?'stormy':r>=30?'rainy':'fair';wx.classList.add(k);wx.querySelector('small').textContent='Weather · Pune · '+(k==='stormy'?'Rain likely':k==='rainy'?'Rain possible':'Pleasant')});document.querySelectorAll('.wx .days div').forEach(d=>{if(+d.dataset.r>=30)d.classList.add('wet')})})();
$('cvSamples').textContent=String(validation.samples);
$('cvFolds').textContent=String(validation.folds);
$('cvMae').textContent=validation.forest.mae.toFixed(1)+' km/h';
$('cvRmse').textContent=validation.forest.rmse.toFixed(1)+' km/h';
$('baselineMae').textContent=validation.baseline.mae.toFixed(1)+' km/h';
$('baselineRmse').textContent=validation.baseline.rmse.toFixed(1)+' km/h';
count($('k1'),G.trips);calc();
