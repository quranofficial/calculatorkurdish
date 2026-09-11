const $=id=>document.getElementById(id);
const KEY='calculatorKurdishWebsiteV1';
const state=JSON.parse(localStorage.getItem(KEY)||'{}');
state.profile=state.profile||{};
state.food=state.food||{};
state.steps=state.steps||{};
state.stepOffset=0; state.foodOffset=0;

function save(){localStorage.setItem(KEY,JSON.stringify({...state,stepOffset:undefined,foodOffset:undefined}))}
function dateKey(offset=0){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+offset);return d.toISOString().slice(0,10)}
function dateLabel(offset){const k=dateKey(offset);if(offset===0)return k+' (ئەمڕۆ)';if(offset===-1)return k+' (دوێنێ)';return k}

const endpointInput = $('aiEndpointInput');
const saveEndpointBtn = $('saveEndpoint');

if (endpointInput) {
  endpointInput.value =
    localStorage.getItem('AI_ENDPOINT') ||
    'https://calculatorkurdish-ai.ismahilismahil0.workers.dev/api/analyze-food';
}

if (saveEndpointBtn) {
  saveEndpointBtn.onclick = () => {
    const url = endpointInput.value.trim();

    if (!url) {
      alert('تکایە Endpoint بنووسە');
      return;
    }

    localStorage.setItem('AI_ENDPOINT', url);

    alert('Endpoint بە سەرکەوتوویی خەزن کرا ✅');

    location.reload();
  };
}

function loadProfile(){
  const p=state.profile;
  ['age','height','weight'].forEach(k=>{if(p[k]!==undefined)$(k).value=p[k]});
  if(p.gender) $('gender').value=p.gender;
  if(p.activity) $('activity').value=p.activity;
  if(p.goal!==undefined) $('goal').value=p.goal;
  if(p.target){$('targetCard').classList.remove('hidden');$('targetHeader').textContent='کالۆری پێویستی ڕۆژانەت: '+Math.round(p.target)+' kcal';$('calorieResult').textContent='کالۆری پێویستی ڕۆژانە بەپێی ئامانجەکەت:\\n'+Math.round(p.target)+' kcal/ڕۆژانە\\n\\n💡 (کالۆری جێگیربوونی کێش: '+Math.round(p.tdee)+' kcal)'}
}
function updateSteps(){
  const k=dateKey(state.stepOffset), n=Number(state.steps[k]||0), w=Number(state.profile.weight||70);
  $('stepDate').textContent=dateLabel(state.stepOffset);
  $('stepCount').textContent=n.toLocaleString('en-US');
  $('stepCalories').textContent='کالۆری سوتێنراو: '+(n*w*0.0005).toFixed(1)+' kcal';
}
function updateFood(){
  const k=dateKey(state.foodOffset), data=state.food[k]||{total:0,items:[]}, target=Number(state.profile.target||0);
  $('foodDate').textContent=dateLabel(state.foodOffset);
  const remaining=Math.max(0,target-data.total);
  $('foodSummary').textContent='کۆی خواردنی خوراو: '+data.total+' kcal\\nئامانجی ڕۆژانە: '+Math.round(target)+' kcal\\nماوە بۆ گەیشتن پێی: '+Math.round(remaining)+' kcal';
  $('foodLog').textContent=data.items.length?data.items.map(x=>'• '+x.name+' ('+x.cal+' kcal)').join('\\n'):'هیچ خواردنێک تۆمار نەکراوە.';
}
$('calorieForm').addEventListener('submit',e=>{
 e.preventDefault();
 const age=Number($('age').value),height=Number($('height').value),weight=Number($('weight').value);
 const gender=$('gender').value, activity=Number($('activity').value), goal=Number($('goal').value);
 if(!age||!height||!weight)return;
 const bmr=gender==='male'?(10*weight+6.25*height-5*age+5):(10*weight+6.25*height-5*age-161);
 const tdee=bmr*activity,target=tdee+goal;
 state.profile={age,height,weight,gender,activity,goal,bmr,tdee,target};save();
 $('calorieResult').textContent='کالۆری پێویستی ڕۆژانە بەپێی ئامانجەکەت:\\n'+Math.round(target)+' kcal/ڕۆژانە\\n\\n💡 (کالۆری جێگیربوونی کێش: '+Math.round(tdee)+' kcal)';
 $('targetCard').classList.remove('hidden');$('targetHeader').textContent='کالۆری پێویستی ڕۆژانەت: '+Math.round(target)+' kcal';updateFood();updateSteps();
});
$('addSteps').onclick=()=>{
 const n=Number($('manualSteps').value); if(!n||n<1)return;
 const k=dateKey(state.stepOffset);state.steps[k]=Number(state.steps[k]||0)+Math.floor(n);$('manualSteps').value='';save();updateSteps();
};
$('prevStep').onclick=()=>{state.stepOffset--;updateSteps()};
$('nextStep').onclick=()=>{if(state.stepOffset<0){state.stepOffset++;updateSteps()}else alert('ئەمە ڕۆژی ئەمڕۆیە!')};
$('addFood').onclick=()=>{
 const name=$('foodName').value.trim(),cal=Math.floor(Number($('foodCalories').value));
 if(!name||!cal||cal<1){alert('تکایە ناوی خواردن و کالۆریەکە بە دروستی بنووسە');return}
 const k=dateKey(state.foodOffset),d=state.food[k]||{total:0,items:[]};d.total+=cal;d.items.push({name,cal});state.food[k]=d;
 $('foodName').value='';$('foodCalories').value='';save();updateFood();
};
$('prevFood').onclick=()=>{state.foodOffset--;updateFood()};
$('nextFood').onclick=()=>{if(state.foodOffset<0){state.foodOffset++;updateFood()}else alert('ئەمە ڕۆژی ئەمڕۆیە!')};

function setPreview(file){
 if(!file)return; const r=new FileReader();r.onload=e=>{$('foodPreview').src=e.target.result;$('aiResult').textContent='وێنەکە ئامادەیە بۆ شیکاری.'};r.readAsDataURL(file);
}
$('cameraInput').onchange=e=>setPreview(e.target.files[0]);
$('galleryInput').onchange=e=>setPreview(e.target.files[0]);
const AI_ENDPOINT =
  'https://calculatorkurdish-ai.ismahilismahil0.workers.dev/api/analyze-food';

async function analyzeFoodWithBackend(file){
  if(!file){ $('aiResult').textContent='تکایە سەرەتا وێنەی خواردن هەڵبژێرە.'; return; }
  $('aiResult').textContent='⏳ وێنەکە دەنێردرێت بۆ AI...';
  const fd=new FormData(); fd.append('image',file);
  try{
    const res=await fetch(AI_ENDPOINT,{method:'POST',body:fd});
    if(!res.ok) throw new Error('HTTP '+res.status);
    const data=await res.json();
    const name=data.food_name || data.name || 'خواردن';
    const kcal=data.calories ?? data.kcal ?? '—';
    const confidence=data.confidence!=null ? '\\nدڵنیایی: '+Math.round(Number(data.confidence)*100)+'%' : '';
    $('aiResult').textContent='🍽️ '+name+'\\n🔥 کالۆری: '+kcal+' kcal'+confidence;
    if(Number(kcal)>0){
      const k=dateKey(state.foodOffset),d=state.food[k]||{total:0,items:[]};
      d.total+=Math.round(Number(kcal)); d.items.push({name,cal:Math.round(Number(kcal))});
      state.food[k]=d; save(); updateFood();
    }
  }catch(err){
    $('aiResult').textContent='⚠️ AI بە backend ـەکە پەیوەندی نەکرا.\\nEndpoint: '+AI_ENDPOINT+'\\n\\nئەگەر backend ـت داناوە، endpoint ـەکە لە localStorage ـدا ڕێکبخە.';
  }
}
$('analyzeFood').onclick=async()=>{
  const file=$('cameraInput').files[0] || $('galleryInput').files[0];
  if(!file){ $('aiResult').textContent='تکایە سەرەتا وێنەی خواردن هەڵبژێرە.'; return; }
  // First try the configured backend. If it is unavailable, keep the UI usable.
  try {
    await analyzeFoodWithBackend(file);
  } catch(e) {
    $('aiResult').textContent='وێنەکە هەڵبژێردرا. بۆ ناسینەوەی خواردن بە AI ـی ڕاستەقینە، Backend پێویستە.';
  }
};

document.querySelectorAll('.bottom-nav [data-page]').forEach(btn=>btn.onclick=()=>{
 document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));$(btn.dataset.page).classList.remove('hidden');
 document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
});
$('resetData').onclick=()=>{
 if(confirm('هەموو داتاکانی Website بسڕێتەوە؟')){localStorage.removeItem(KEY);location.reload()}
};
loadProfile();updateSteps();updateFood();
