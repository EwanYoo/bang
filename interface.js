'use strict';
let activeView='weather';
const mobileLayout=window.matchMedia('(max-width:700px)');
function setQueryExpanded(expanded){$('queryControls').hidden=!expanded;$('compactControls').hidden=expanded;}
function compactQuery(view=activeView){
 if(view!==activeView)return;
 const period=activeView==='weather'?$('period').value:$('monthA').value+' / '+$('monthB').value;
 $('compactLabel').textContent=sourceName()+' · '+period;
 if(mobileLayout.matches)setQueryExpanded(false);
}
function selectView(view){
 activeView=view;
 for(const button of document.querySelectorAll('[data-view]')){const selected=button.dataset.view===view;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;}
 $('weatherPane').hidden=view!=='weather';$('comparison').hidden=view!=='compare';$('form').hidden=view!=='weather';$('compareForm').hidden=view!=='compare';$('status').hidden=view!=='weather';$('compareStatus').hidden=view!=='compare';$('queryTitle').textContent=view==='weather'?'일별·월별 날씨 조회':'월별 강수량 비교';setQueryExpanded(true);if(view==='compare'&&comparison)drawComparison(comparison.a,comparison.b);if(view==='weather')draw();
}
for(const button of document.querySelectorAll('[data-view]')){
 button.onclick=()=>selectView(button.dataset.view);
 button.onkeydown=event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const view=event.key==='Home'?'weather':event.key==='End'?'compare':activeView==='weather'?'compare':'weather';selectView(view);document.querySelector('[data-view="'+view+'"]').focus();}};
}
$('editQuery').onclick=()=>{setQueryExpanded(true);$('database').focus();};
$('database').addEventListener('change',()=>setQueryExpanded(true));
function adjustLayout(){if(!mobileLayout.matches)setQueryExpanded(true);$('detailPanel').open=!mobileLayout.matches;$('coordinateDisclosure').open=false;}
mobileLayout.addEventListener('change',adjustLayout);
selectView('weather');adjustLayout();
