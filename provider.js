let provider='era5';
function sourceName(){return provider==='kma'?'기상청 산청 ASOS 289 관측':'Open-Meteo ECMWF ERA5 재분석';}
function sourceCSV(){return provider==='kma'?'기상청 산청 ASOS 289 (시간자료 집계)':'Open-Meteo ECMWF ERA5 과거 재분석';}
function providerLatest(){const d=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Seoul'}));d.setDate(d.getDate()-(provider==='kma'?1:7));return localISO(d);}
function sourceDescription(){return provider==='kma'?'산청 ASOS 관측소(289)의 실제 관측 자료입니다. 석대마을 현장 관측값이 아닙니다. 시간자료를 일·월 단위로 집계합니다. 기상청 강수량 공란은 해당 시각 강수 기록 없음으로 0mm 처리하고, 오류값·누락 시각은 결측으로 표시합니다. 전일까지 조회 가능하며 제공 지연·누락이 있을 수 있습니다.':'Open-Meteo ECMWF ERA5 과거 재분석 자료입니다. 방목리카페 위치 좌표(35.3249° N, 127.9225° E)에서 약 25km 격자 자료를 조회하며 현장 관측값과 차이가 있을 수 있습니다. 최근 자료 제공 지연을 고려해 7일 전까지 조회합니다.';}
async function fetchWeatherSource(start,end){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),35000);try{let url;if(provider==='kma')url='https://bang-kma-api-20261014.voidbn.chatgpt.site/weather?'+new URLSearchParams({start,end});else url='https://archive-api.open-meteo.com/v1/archive?'+new URLSearchParams({latitude:'35.3249',longitude:'127.9225',start_date:start,end_date:nextWeatherDay(end),hourly:'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m',models:'era5',timezone:'Asia/Seoul',wind_speed_unit:'ms'});const res=await fetch(url,{signal:controller.signal});const data=await res.json();if(!res.ok)throw Error(data.error||'자료 조회 실패 ('+res.status+')');if(provider!=='kma')return data;const map=new Map(data.items.map(r=>[r.time,r])),h={time:[],temperature_2m:[],relative_humidity_2m:[],precipitation:[],wind_speed_10m:[],wind_direction_10m:[]};for(let t=Date.parse(start+'T00:00:00+09:00'),last=Date.parse(end+'T23:00:00+09:00');t<=last;t+=3600000){const label=new Date(t+9*3600000).toISOString().slice(0,16),r=map.get(label);h.time.push(label);for(const[k,v]of [['temperature_2m','temp'],['relative_humidity_2m','humidity'],['precipitation','rain'],['wind_speed_10m','wind'],['wind_direction_10m','dir']])h[k].push(r?.[v]??null);}return {hourly:h,station:289,boundary:data.items.find(r=>r.time===nextWeatherDay(end)+'T00:00')?.rain??null};}finally{clearTimeout(timer);}}
function setupProvider(){const select=$('database');function refresh(){latest=providerLatest();$('period').max=mode==='monthly'?latest.slice(0,7):latest;if($('period').value>$('period').max)$('period').value=$('period').max;$('monthA').max=$('monthB').max=latest.slice(0,7);$('databaseNote').textContent=sourceDescription();$('latLabel').textContent=provider==='kma'?'산청 관측소 289 · 석대마을과 다른 위치':'방목리카페 · 35.3249° N, 127.9225° E';$('apiHint').textContent=provider==='kma'?'기상청 관측 · 전일까지 조회':'ERA5 재분석 · 7일 전까지 조회';$('range').textContent=sourceName();updateWeekday();}
select.onchange=()=>{if(busy||comparing){select.value=provider;return;}provider=select.value;clear();resetComparison();refresh();$('status').textContent='데이터 출처를 변경했습니다. 기간을 선택하고 조회하세요.';$('compareStatus').textContent='선택한 데이터 출처로 두 월을 비교하세요.';};refresh();}

function nextWeatherDay(day){return new Date(Date.parse(day+'T00:00:00Z')+86400000).toISOString().slice(0,10);}
async function fetchWeatherRange(start,end){
 const data=await fetchWeatherSource(start,end),source=data.hourly;
 if(!source?.time?.length)return data;
 const rainByTime=new Map(source.time.map((t,i)=>[t,source.precipitation[i]]));
 if(provider==='kma')rainByTime.set(nextWeatherDay(end)+'T00:00',data.boundary);
 const indices=source.time.map((t,i)=>t.slice(0,10)>=start&&t.slice(0,10)<=end?i:-1).filter(i=>i>=0),hourly={};
 for(const [key,values]of Object.entries(source))hourly[key]=indices.map(i=>values[i]);
 hourly.precipitation=indices.map(i=>{const next=new Date(Date.parse(source.time[i]+'+09:00')+3600000+9*3600000).toISOString().slice(0,16);return rainByTime.get(next)??null;});
 return {...data,hourly};
}
