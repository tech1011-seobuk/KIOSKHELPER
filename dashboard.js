/* Dashboard uses existing read-only records; it does not infer abandonment or actual support contacts. */
const HelperDashboard = (() => {
  const DAY = 86400000, KST = 9 * 3600000;
  const outcomes = ['solved', 'unresolved', 'escalate', 'as', 'info'];
  const labels = {solved:'해결 확인', unresolved:'미해결 응답', escalate:'채널톡 문의 안내', as:'A/S 안내', info:'안내 확인 완료', pending:'진행 중·결과 미응답'};
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pct = (n, d) => d ? Math.round(n / d * 1000) / 10 : null;
  const rate = value => value === null ? '—' : value.toLocaleString('ko-KR') + '%';
  const num = n => Number(n || 0).toLocaleString('ko-KR');
  const dayKey = time => new Date(time + KST).toISOString().slice(0, 10);
  const sid = value => value === 'PRT-13' ? 'PRT-7' : value;
  const groupKey = e => JSON.stringify([e.brand || '', e.device || '', sid(e.symptom_id) || '']);
  const emptyCounts = () => ({solved:0, unresolved:0, escalate:0, as:0, info:0, pending:0});
  function metadata(e) { try { const m=JSON.parse(e.detail); return m?.v === 2 && typeof m.attempt === 'string' && m.attempt.length > 0 && m.attempt.length < 100 ? m : null; } catch { return null; } }
  function isViewing(p) { return p?.role === 'demo' || (p?.role !== 'admin' && /@(?:viewers|demos|admins)\.kioskhelper\.invalid$/i.test(p?.email || '')); }
  function model(events, profiles, options = {}, now = Date.now()) {
    const days = ['7','30','90','all'].includes(String(options.days)) ? String(options.days) : '30';
    const since = days === 'all' ? -Infinity : now - Number(days) * DAY;
    const people = new Map(profiles.map(p => [p.id,p]));
    const includeAdmin = options.audience === 'all';
    const allowed = e => {
      const p=people.get(e.user_id);
      return !isViewing(p) && (includeAdmin || (p && p.role !== 'admin'));
    };
    const all = events.filter(e => e.user_id && allowed(e) && Number.isFinite(Date.parse(e.created_at)) && Date.parse(e.created_at) <= now)
      .map(e => ({...e, time:Date.parse(e.created_at), symptom_id:sid(e.symptom_id)})).sort((a,b) => a.time-b.time || String(a.id||'').localeCompare(String(b.id||''),undefined,{numeric:true}));
    const matches = e => (!options.brand || e.brand === options.brand) && (!options.device || e.device === options.device);
    const period = all.filter(e => e.time >= since && matches(e));
    const clicks = period.filter(e => ['device_click','symptom_click'].includes(e.event_type));
    const starts = new Map();
    for(const e of all) {
      const meta=metadata(e); if(!meta)continue;
      const key=JSON.stringify([e.user_id,meta.attempt]);
      if(e.event_type==='symptom_click' && !starts.has(key))starts.set(key,{...e, attempt:meta.attempt, outcome:null, end:null, support:false});
      const a=starts.get(key); if(!a || a.brand!==e.brand || a.symptom_id!==e.symptom_id)continue;
      if(e.event_type==='symptom_outcome' && outcomes.includes(e.outcome)){a.outcome=e.outcome;a.end=e.time;}
      if(e.event_type==='support_click')a.support=true;
    }
    const attempts=[...starts.values()].filter(a=>a.time>=since&&matches(a));
    const counts=emptyCounts();for(const a of attempts)counts[a.outcome||'pending']++;
    const decided=counts.solved+counts.unresolved+counts.escalate+counts.as, answered=decided+counts.info;
    const stats=new Map();
    const entry=e=>{const key=groupKey(e);if(!stats.has(key))stats.set(key,{key,brand:e.brand,device:e.device,symptom_id:e.symptom_id,clicks:0,started:0,feedback:0,...emptyCounts()});return stats.get(key);};
    for(const e of period){if(e.event_type==='symptom_click'&&e.symptom_id)entry(e).clicks++;if(e.event_type==='feedback'&&e.feedback&&e.symptom_id)entry(e).feedback++;}
    for(const a of attempts){const s=entry(a);s.started++;s[a.outcome||'pending']++;}
    const symptoms=[...stats.values()].map(s=>({...s,decided:s.solved+s.unresolved+s.escalate+s.as,rate:pct(s.solved,s.solved+s.unresolved+s.escalate+s.as),contactRate:pct(s.escalate,s.solved+s.unresolved+s.escalate+s.as)})).sort((a,b)=>b.clicks-a.clicks||a.key.localeCompare(b.key));
    const priorities=symptoms.filter(s=>s.decided>=10&&s.escalate>0).sort((a,b)=>b.contactRate-a.contactRate||b.escalate-a.escalate).slice(0,3);
    const feedback=period.filter(e=>e.event_type==='feedback'&&String(e.feedback||'').trim()).reverse();
    const legacy=period.filter(e=>e.event_type==='symptom_outcome'&&outcomes.includes(e.outcome)&&!metadata(e));
    const legacyStats=new Map();
    for(const e of legacy){const key=groupKey(e);if(!legacyStats.has(key))legacyStats.set(key,{...e,...emptyCounts(),total:0});const s=legacyStats.get(key);s[e.outcome]++;s.total++;}
    const userRows=new Map(),branchRows=new Map(),devices=new Map(),brands=new Map();
    for(const e of clicks){
      userRows.set(e.user_id,(userRows.get(e.user_id)||0)+1);
      const branch=String(e.branch_name||'').trim();if(branch)branchRows.set(branch,(branchRows.get(branch)||0)+1);
      if(e.event_type==='device_click'){const key=JSON.stringify([e.brand||'',e.device||'미분류']);devices.set(key,(devices.get(key)||0)+1);}
      brands.set(e.brand||'미분류',(brands.get(e.brand||'미분류')||0)+1);
    }
    const activeUsers=new Set(period.filter(e=>['device_click','symptom_click','symptom_outcome'].includes(e.event_type)).map(e=>e.user_id));
    const durations=attempts.filter(a=>a.outcome==='solved'&&a.end>=a.time&&a.end-a.time<=3600000).map(a=>a.end-a.time).sort((a,b)=>a-b);
    const median=durations.length?(durations[Math.floor((durations.length-1)/2)]+durations[Math.floor(durations.length/2)])/2:null;
    const currentDay=Math.floor((now+KST)/DAY)*DAY-KST;
    const dailyLength=days==='7'?7:14;
    const daily=Array.from({length:dailyLength},(_,i)=>({day:dayKey(currentDay-(dailyLength-1-i)*DAY),count:0}));
    const dailyMap=new Map(daily.map(d=>[d.day,d]));const hours=Array(24).fill(0);
    for(const e of clicks){if(dailyMap.has(dayKey(e.time)))dailyMap.get(dayKey(e.time)).count++;hours[new Date(e.time+KST).getUTCHours()]++;}
    const recent=attempts.filter(a=>['escalate','as'].includes(a.outcome)).sort((a,b)=>b.end-a.end);
    const inactive=profiles.filter(p=>!isViewing(p)&&(includeAdmin||p.role!=='admin')&&!activeUsers.has(p.id));
    const unknownBranch=clicks.filter(e=>!String(e.branch_name||'').trim()).length;
    return {days,since,now,period,clicks,attempts,counts,decided,answered,rate:pct(counts.solved,decided),responseRate:pct(answered,attempts.length),symptoms,priorities,feedback,legacy,legacyStats:[...legacyStats.values()],userRows,branchRows,devices,brands,people,activeUsers,median,durationCount:durations.length,daily,hours,recent,inactive,unknownBranch,support:attempts.filter(a=>a.support).length,unpairedStarts:period.filter(e=>e.event_type==='symptom_click'&&!metadata(e)).length};
  }
  const sorted = map => [...map].sort((a,b)=>b[1]-a[1]);
  const brandLabel = b => b==='photoism'?'포토이즘':b==='snapism'?'스내피즘':b||'미분류';
  const stamp = t => new Date(t).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});
  const duration = ms => ms===null?'—':ms<60000?Math.round(ms/1000)+'초':Math.round(ms/6000)/10+'분';
  const blank = (text='선택한 조건의 기록이 아직 없어요.') => '<p class="db-empty">'+text+'</p>';
  const table = (headers,rows,empty) => rows.length?'<div class="db-table-wrap" role="region" aria-label="'+esc(headers[0])+' 상세 표" tabindex="0"><table class="db-table"><thead><tr>'+headers.map(h=>'<th scope="col">'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(cells=>'<tr>'+cells.map((c,i)=>'<td data-label="'+esc(headers[i])+'">'+c+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>':blank(empty);
  const panel = (title,note,content,extra='') => '<section class="db-panel '+extra+'"><div class="db-panel-title"><h2>'+title+'</h2>'+(note?'<p class="db-muted">'+note+'</p>':'')+'</div>'+content+'</section>';
  function bars(rows) {
    if(!rows.length)return blank();const max=Math.max(...rows.map(x=>x[1]),1);
    return '<div class="db-bars">'+rows.map(([label,n])=>'<div><div class="db-bar-label"><span>'+esc(label)+'</span><b>'+num(n)+'회</b></div><div class="db-track" aria-hidden="true"><span style="width:'+n/max*100+'%"></span></div></div>').join('')+'</div>';
  }
  function mount(area, events, profiles, actions) {
    let options={days:'30',brand:'',device:'',audience:'members'}, tab='overview', chosen=null;
    const root=document.createElement('section');root.className='admin-screen db-dashboard';root.id='balancedDashboard';area.replaceChildren(root);
    const title=e=>actions.label(e.symptom_id)||e.symptom_id||'기타 안내';
    const symptomCell=e=>'<strong>'+esc(title(e))+'</strong><span class="db-sub">'+esc(brandLabel(e.brand)+' · '+(e.device||'장비 미기록'))+'</span>';
    function draw(focusId) {
      const m=model(events,profiles,options), subtitle=options.audience==='all'?'관리자 활동 포함':'매장 이용 기준 · 관리자 활동 제외';
      const defs='<details class="db-defs"><summary>집계 기준과 확인할 수 있는 범위</summary><ul><li>조치 시작·결과: 동일한 진행 기록은 마지막 결과 한 건만 집계합니다. 선택 기간에 시작한 조치 기준입니다.</li><li>해결 확인 비율 = 해결 확인 ÷ (해결 확인 + 미해결 응답 + 채널톡 문의 안내 + A/S 안내). 안내 확인 완료와 미응답은 제외합니다.</li><li>결과 응답률 = 결과를 선택한 조치 ÷ 조치 시작. 안내 확인 완료를 포함합니다. 미응답을 실패나 이탈로 단정하지 않습니다.</li><li>채널톡 문의 안내는 안내 화면에 도달한 기록입니다. CMS 문의 이동은 버튼 클릭이며, 실제 상담 접수 여부는 확인하지 못합니다.</li><li>장비·증상 클릭수에는 반복 클릭이 포함됩니다. 지점은 활동 당시 기록된 지점명으로 묶습니다.</li><li>과거 기록 '+num(m.legacy.length)+'건은 중복 진행을 구분할 수 없어 별도로 표시합니다. 시간대는 한국 시간 기준입니다.</li><li>단계별 머문 시간·검색 실패·사진 부족 여부는 현재 기록만으로 확인할 수 없습니다. 스내피즘의 일부 기존 안내는 조치 결과 기록이 없어 브랜드 간 해결률을 단순 비교할 수 없습니다.</li></ul></details>';
      const controls='<div class="db-filters"><label>기간<select id="dbPeriod">'+[['7','최근 7일'],['30','최근 30일'],['90','최근 90일'],['all','전체 기간']].map(([v,l])=>'<option value="'+v+'"'+(options.days===v?' selected':'')+'>'+l+'</option>').join('')+'</select></label><label>브랜드<select id="dbBrand"><option value="">전체 브랜드</option><option value="photoism"'+(options.brand==='photoism'?' selected':'')+'>포토이즘</option><option value="snapism"'+(options.brand==='snapism'?' selected':'')+'>스내피즘</option></select></label><label>장비<select id="dbDevice"><option value="">전체 장비</option>'+[...new Set(events.filter(e=>e.device&&(!options.brand||e.brand===options.brand)).map(e=>e.device))].sort().map(d=>'<option value="'+esc(d)+'"'+(options.device===d?' selected':'')+'>'+esc(d)+'</option>').join('')+'</select></label><label>이용자<select id="dbAudience"><option value="members"'+(options.audience==='members'?' selected':'')+'>매장 이용만</option><option value="all"'+(options.audience==='all'?' selected':'')+'>관리자 포함</option></select></label></div>';
      const stat=(label,value,note)=>'<article class="db-stat"><span>'+label+'</span><strong>'+value+'</strong><small>'+note+'</small></article>';
      const summaries='<div class="db-stats">'+stat('이용 매장',num(m.branchRows.size)+'<em>곳</em>','활동 계정 '+num(m.activeUsers.size)+'개 · 지점 미기록 클릭 '+num(m.unknownBranch)+'회')+stat('조치 시작',num(m.attempts.length)+'<em>건</em>','중복 진행 구분이 가능한 기록 기준')+stat('해결 확인 비율',rate(m.rate),'해결 '+num(m.counts.solved)+' / 결과 확인 '+num(m.decided)+'건')+stat('결과 응답률',rate(m.responseRate),'결과 응답 '+num(m.answered)+' / 시작 '+num(m.attempts.length)+'건')+'</div>';
      let overview='';
      const priorityCards=m.priorities.length?m.priorities.map(s=>'<button type="button" class="db-priority" data-detail="'+esc(s.key)+'"><span class="db-chip">문의 안내 비중 확인</span><strong>'+esc(title(s))+'</strong><span>'+esc(brandLabel(s.brand)+' · '+s.device)+'</span><b>'+rate(s.contactRate)+'</b><small>결과 '+num(s.decided)+'건 중 '+num(s.escalate)+'건 · 근거 보기 →</small></button>').join(''):'<div class="db-priority-empty"><strong>아직 보완 순위를 판단할 기록이 부족해요.</strong><p>증상별 결과가 10건 이상 쌓이면 채널톡 문의 안내 비율과 실제 의견을 함께 살펴볼 수 있어요.</p><button type="button" data-tab-link="feedback">사용자 의견 '+num(m.feedback.length)+'건 확인 →</button></div>';
      overview+=panel('먼저 살펴볼 안내','채널톡 문의 안내 비율 순 · 증상별 결과 10건 이상 · 매뉴얼 부족을 확정하는 지표는 아닙니다.','<div class="db-priorities">'+priorityCards+'</div>','db-priority-panel');
      const total=m.attempts.length;
      const resultMarkup=(total?'<div class="db-outcome-strip" role="img" aria-label="'+esc(Object.entries(m.counts).map(([k,n])=>labels[k]+' '+n+'건').join(', '))+'">'+Object.entries(m.counts).filter(([,n])=>n>0).map(([k,n])=>'<span class="db-mark-'+k+'" style="width:'+n/total*100+'%"></span>').join('')+'</div>':'')+'<div class="db-results">'+Object.entries(m.counts).map(([k,n])=>'<div><span><i class="db-mark-'+k+'" aria-hidden="true"></i>'+labels[k]+'</span><b>'+num(n)+'건</b></div>').join('')+'</div><div class="db-note">안내 확인 완료는 설정·교체 안내를 확인한 결과이며, 문제 해결 확인과 구분합니다.</div>';
      const popular=bars(m.symptoms.slice(0,5).map(s=>[title(s)+' · '+brandLabel(s.brand),s.clicks]));
      overview+='<div class="db-grid">'+panel('조치가 어떻게 끝났나요?','진행별 마지막 결과 기준',resultMarkup)+panel('많이 찾는 증상 TOP 5','반복 조회 포함 · 실제 고장 발생 건수와 다릅니다.',popular)+'</div>';
      const dailyMax=Math.max(...m.daily.map(x=>x.count),1);
      const trend='<div class="db-trend" role="img" aria-label="선택 기간 중 최근 '+m.daily.length+'일의 클릭수">'+m.daily.map((d,i)=>'<div title="'+d.day+' · '+d.count+'회"><span class="db-trend-num">'+(d.count?num(d.count):'')+'</span><div class="db-trend-space"><span style="height:'+d.count/dailyMax*100+'%"></span></div><small>'+((i%3===0||i===m.daily.length-1)?d.day.slice(5).replace('-','/'):'')+'</small></div>').join('')+'</div>';
      overview+='<div class="db-grid">'+panel('기간별 이용 추이','최근 '+m.daily.length+'일 · 장비·증상 클릭 기준 · 오늘은 현재까지',trend)+panel('브랜드별 이용','선택 기간의 장비·증상 클릭수',bars(sorted(m.brands).map(([b,n])=>[brandLabel(b),n])))+'</div>';
      const symptomRows=m.symptoms.map(s=>[symptomCell(s),num(s.clicks),num(s.started),num(s.solved),num(s.unresolved),num(s.escalate),num(s.as),num(s.info),num(s.pending),rate(s.rate),'<button type="button" data-detail="'+esc(s.key)+'">상세</button>']);
      let symptoms=panel('증상별 이용 · 해결 결과','클릭수는 반복 조회 포함 · 조치 결과는 진행별 마지막 결과 한 건',table(['증상','클릭','시작','해결 확인','미해결 응답','채널톡 문의 안내','A/S 안내','안내 확인 완료','진행·미응답','해결 비율','상세'],symptomRows));
      symptoms+='<div class="db-grid">'+panel('장비별 클릭수','기존 부위·섹터별 활동',bars(sorted(m.devices).map(([k,n])=>{const [b,d]=JSON.parse(k);return [brandLabel(b)+' · '+d,n];})))+panel('해결 확인까지 걸린 시간','실제 작업 시간과 다를 수 있습니다.','<div class="db-time-value">'+duration(m.median)+'</div><p class="db-muted">중앙값 · 1시간 이내 해결 확인 '+num(m.durationCount)+'건 기준</p><div class="db-note">조치 시작부터 해결 응답까지의 시간입니다. 휴대폰을 내려놓은 시간도 포함될 수 있어요.</div>')+'</div>';
      const legacyRows=m.legacyStats.map(s=>[symptomCell(s),num(s.total),num(s.solved),num(s.unresolved),num(s.escalate),num(s.as),num(s.info),rate(pct(s.solved,s.solved+s.unresolved+s.escalate+s.as))]);
      symptoms+=panel('과거 결과 기록','진행 번호가 없는 이전 기록입니다. 중복 선택이 포함될 수 있으며 위의 조치 수와 합산하지 않습니다.',table(['증상','결과 기록','해결 확인','미해결 응답','채널톡 문의 안내','A/S 안내','안내 확인 완료','해결 비율'],legacyRows));
      const recentList=m.recent.length?m.recent.slice(0,20).map(e=>'<article class="db-message"><div><strong>'+esc(title(e))+'</strong><span class="db-chip">'+labels[e.outcome]+'</span></div><p>'+esc(e.branch_name||'지점 미기록')+' · '+esc(m.people.get(e.user_id)?.display_name||'계정명 없음')+'</p><small>'+stamp(e.end)+'</small></article>').join(''):blank('최근 조치 기록에서 문의·A/S 안내 결과가 없어요.');
      const feedbackList=m.feedback.length?m.feedback.slice(0,50).map(e=>'<article class="db-message"><div><strong>'+esc(title(e))+'</strong><small>'+stamp(e.time)+'</small></div><p class="db-message-body">'+esc(e.feedback)+'</p><small>'+esc(brandLabel(e.brand)+' · '+(e.device||'장비 미기록')+' · '+(e.branch_name||'지점 미기록'))+'</small></article>').join(''):blank('아직 남겨진 의견이 없어요. 의견이 없다는 것이 불편함이 없다는 뜻은 아닙니다.');
      const feedback=panel('의견함','의견 남기기로 접수된 제안과 관리자 답변을 확인합니다.','<button type="button" id="dbSuggestionInboxBtn">접수된 의견 전체 보기 →</button>')+panel('조치 과정에서 남긴 의견',num(m.feedback.length)+'건 · 최근 50건 표시 · 원문을 확인하고 보완할 내용을 판단하세요.',feedbackList)+panel('최근 채널톡 문의·A/S 안내','새 방식의 조치 기록 · 마지막 결과 기준 최근 20건 · 실제 상담·수리 접수와 다릅니다.','<div class="db-note">CMS로 이동해 문의하기 버튼을 누른 조치: '+num(m.support)+'건 · 실제 채널톡 상담 접수 건수와 다릅니다.</div>'+recentList);
      const userTable=table(['계정','현재 등록 지점','장비·증상 클릭'],sorted(m.userRows).map(([id,n])=>{const p=m.people.get(id);return [esc(p?.display_name||p?.email||'계정 정보 없음')+(p?.role==='admin'?'<span class="db-sub">관리자</span>':''),esc(p?.branch_name||'미등록'),num(n)];}));
      const hours=bars(m.hours.map((n,h)=>[String(h).padStart(2,'0')+'시',n]).filter(([,n])=>n>0));
      const stores= '<div class="db-grid">'+panel('지점별 활동','활동 당시 지점명 기준 · 지점 미기록 클릭 '+num(m.unknownBranch)+'회',bars(sorted(m.branchRows)))+panel('시간대별 이용','한국 시간 · 장비·증상 클릭수',hours)+'</div>'+panel('매장 계정별 활동','선택 기간·브랜드·장비 조건 기준',userTable)+panel('선택 조건에서 활동이 없는 계정','전체 계정 중 현재 필터에 해당하는 활동이 없는 계정입니다. 미사용 사유는 확인되지 않습니다.',m.inactive.length?'<div class="db-chips">'+m.inactive.map(p=>'<span class="db-chip">'+esc(p.display_name||p.email||'이름 없음')+'</span>').join('')+'</div>':blank('선택 조건에서 모든 대상 계정의 이용 기록이 있어요.'));
      const panes={overview,symptoms,feedback,stores};
      root.innerHTML='<header class="db-header"><div><span class="db-eyebrow">PHOTOISM HELPER · 운영 현황</span><h1>대시보드</h1><p>이용 흐름을 살펴보고, 다음에 보완할 안내를 찾아보세요.</p></div><div class="db-actions"><button id="cmsApprovalsBtn" type="button">회원 가입 승인</button><button id="accountCreateBtn" type="button">계정 추가</button><button id="dbNoticesBtn" type="button">공지 관리</button><button id="dbSuggestionsBtn" type="button">의견함</button><button id="csvExportBtn" type="button">기록 내보내기</button></div></header>'+controls+'<p class="db-scope" role="status">'+esc(subtitle)+' · '+num(m.period.length)+'개 활동 기록 · '+stamp(m.now)+' 기준</p>'+summaries+'<div class="db-tabs" role="tablist" aria-label="대시보드 항목">'+[['overview','전체 현황'],['symptoms','증상·조치 결과'],['feedback','의견·보완'],['stores','매장 활동']].map(([id,l])=>'<button type="button" role="tab" id="dbTab-'+id+'" aria-selected="'+(tab===id)+'" aria-controls="dbPane-'+id+'" data-tab="'+id+'">'+l+'</button>').join('')+'</div>'+Object.entries(panes).map(([id,html])=>'<div id="dbPane-'+id+'" role="tabpanel" aria-labelledby="dbTab-'+id+'"'+(id===tab?'':' hidden')+'>'+html+'</div>').join('')+defs+'<div class="db-drawer-host"></div>';
      const setTab=id=>{if(!panes[id])return;tab=id;root.querySelectorAll('[role=tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===tab)));root.querySelectorAll('[role=tabpanel]').forEach(p=>p.hidden=p.id!=='dbPane-'+tab);root.querySelector('#dbTab-'+tab).focus({preventScroll:true});};
      root.querySelectorAll('[data-tab]').forEach(b=>{b.onclick=()=>setTab(b.dataset.tab);b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const ids=Object.keys(panes),i=ids.indexOf(tab);setTab(e.key==='Home'?ids[0]:e.key==='End'?ids.at(-1):ids[(i+(e.key==='ArrowRight'?1:ids.length-1))%ids.length]);};});
      root.querySelectorAll('[data-tab-link]').forEach(b=>b.onclick=()=>setTab(b.dataset.tabLink));
      const filter=(id,key)=>{root.querySelector('#'+id).onchange=e=>{options[key]=e.target.value;if(key==='brand')options.device='';chosen=null;draw(id);};};
      filter('dbPeriod','days');filter('dbBrand','brand');filter('dbDevice','device');filter('dbAudience','audience');
      root.querySelector('#cmsApprovalsBtn').onclick=actions.approvals;root.querySelector('#accountCreateBtn').onclick=actions.accounts;
      root.querySelector('#dbNoticesBtn').onclick=actions.notices;root.querySelector('#dbSuggestionsBtn').onclick=actions.suggestions;root.querySelector('#dbSuggestionInboxBtn').onclick=actions.suggestions;
      root.querySelector('#csvExportBtn').onclick=()=>actions.export(m.period,Object.fromEntries(profiles.map(p=>[p.id,p.display_name||p.email||''])));
      root.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>openDetail(m,b.dataset.detail,b));
      if(focusId)root.querySelector('#'+focusId)?.focus({preventScroll:true});
    }
    function openDetail(m,key,trigger){
      const s=m.symptoms.find(s=>s.key===key);if(!s)return;chosen=key;
      const relevant=m.feedback.filter(e=>groupKey(e)===key);
      const dialog=document.createElement('dialog');dialog.className='db-dialog';dialog.setAttribute('aria-labelledby','dbDetailTitle');
      dialog.innerHTML='<div class="db-dialog-head"><div><span class="db-eyebrow">'+esc(brandLabel(s.brand)+' · '+s.device)+'</span><h2 id="dbDetailTitle">'+esc(title(s))+'</h2></div><button type="button" data-close aria-label="상세 닫기">닫기</button></div><p>조치 시작 '+num(s.started)+'건 · 결과 확인 '+num(s.decided)+'건</p><div class="db-results">'+Object.keys(labels).map(k=>'<div><span>'+labels[k]+'</span><b>'+num(s[k])+'건</b></div>').join('')+'</div><div class="db-note">'+(s.decided<10?'결과가 10건 미만이라 보완 순위에는 포함하지 않습니다.':'채널톡 문의 안내 비율 '+rate(s.contactRate)+'입니다. 사진·설명이 부족하다고 확정하는 수치는 아닙니다.')+' A/S 안내와 미응답은 각각 별도로 해석합니다.</div><h3>이 안내에 남긴 의견</h3>'+(relevant.length?relevant.slice(0,10).map(e=>'<div class="db-message"><p class="db-message-body">'+esc(e.feedback)+'</p><small>'+stamp(e.time)+'</small></div>').join(''):blank('등록된 의견이 없어요.'));
      root.querySelector('.db-drawer-host').replaceChildren(dialog);dialog.addEventListener('close',()=>{chosen=null;dialog.remove();if(trigger.isConnected)trigger.focus({preventScroll:true});});dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.showModal();
    }
    draw();
    return {model:()=>model(events,profiles,options)};
  }
  return {model,mount,esc,metadata};
})();
