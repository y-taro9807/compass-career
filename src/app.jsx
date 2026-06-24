/* @jsxRuntime classic */
const { useState, useEffect, useMemo, useRef } = React;

// ═══════════════════════════════════════════════════════════════════════════
// design tokens
// ═══════════════════════════════════════════════════════════════════════════
const C = {
  ink7:'#141413', ink6:'#2c2b28', ink5:'#525048', ink4:'#8f8d88',
  ink3:'#c9c7c2', ink2:'#e8e7e4', ink1:'#f5f5f4', ink0:'#ffffff',
  accent:'#b87333', accentLight:'#f5ede3', danger:'#9a3b3b',
};
function mono(extra = {}) { return { fontFamily:"'Roboto Mono',monospace", ...extra }; }

// ═══════════════════════════════════════════════════════════════════════════
// helpers
// ═══════════════════════════════════════════════════════════════════════════
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad2 = n => String(n).padStart(2, '0');
function ymd(d) { return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
function todayISO() { return ymd(new Date()); }
function parseISO(s) { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); }
function fmtLogDate(iso) { const d = parseISO(iso); return `${pad2(d.getMonth()+1)} / ${pad2(d.getDate())}`; }
function fmtFull(iso) { const d = parseISO(iso); return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`; }
const WD_JP = ['日','月','火','水','木','金','土'];
function weekdayJP(iso) { return WD_JP[parseISO(iso).getDay()]; }
function daysUntil(iso) {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((parseISO(iso) - startOfDay(new Date())) / 86400000));
}
function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function mondayOf(d) { const x = startOfDay(d); const wd = (x.getDay()+6)%7; x.setDate(x.getDate()-wd); return x; }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }
const round1 = n => Math.round(n*10)/10;

// ═══════════════════════════════════════════════════════════════════════════
// diagnosis fixed data
// ═══════════════════════════════════════════════════════════════════════════
const CHIPS = [
  {shape:'T',name:'T型',tag:'専門 × 幅広知識',   desc:'専門軸を持ちながら幅広く動く'},
  {shape:'I',name:'I型',tag:'深いスペシャリスト', desc:'一点を徹底的に掘り下げる'},
  {shape:'π',name:'π型',tag:'複数専門 × 統合力',desc:'2つの専門軸を掛け合わせる'},
  {shape:'H',name:'H型',tag:'橋渡しの才能',       desc:'領域間をつなぐ調整力'},
  {shape:'━',name:'━型',tag:'広域マネジメント',  desc:'幅広い視野で統率する'},
];
const QUESTIONS = [
  {id:'q1',page:0,title:'仕事でやりがいを感じる瞬間は？',opts:['専門分野を深く突き詰められたとき','異なる領域の知識をつないで課題を解いたとき','チームの橋渡しをして全体が前進したとき','幅広い領域を俯瞰してマネジメントできたとき']},
  {id:'q2',page:0,title:'3年後にありたい姿は？',opts:['第一人者と認められる専門家','複数領域をまたぐπ型人材','専門を軸に幅広く動くT型人材','組織を率いるマネージャー']},
  {id:'q3',page:1,title:'自分に合う学習スタイルは？',opts:['一つのテーマをとことん掘り下げる','関連領域を横断的に学ぶ','実務を通して手を動かして学ぶ','人との対話から学び、深める']},
  {id:'q4',page:1,title:'チームで自然と担うポジションは？',opts:['専門を担う実務の中核','領域間をつなぐ調整役','全体を見渡す推進役','新しい領域を開拓する役']},
];
const TM = {q1:['I','T','H','━'],q2:['I','π','T','━'],q3:['I','π','T','H'],q4:['I','H','━','π']};
const SCORES_BY_TYPE = {
  'T':[{name:'専門深度',v:82},{name:'横断力',v:74},{name:'学習力',v:78},{name:'実行力',v:60},{name:'発信力',v:45}],
  'I':[{name:'専門深度',v:95},{name:'横断力',v:38},{name:'学習力',v:86},{name:'実行力',v:68},{name:'発信力',v:50}],
  'π':[{name:'専門深度',v:80},{name:'横断力',v:88},{name:'学習力',v:82},{name:'実行力',v:62},{name:'発信力',v:58}],
  'H':[{name:'専門深度',v:55},{name:'横断力',v:84},{name:'学習力',v:68},{name:'実行力',v:76},{name:'発信力',v:82}],
  '━':[{name:'専門深度',v:62},{name:'横断力',v:78},{name:'学習力',v:58},{name:'実行力',v:90},{name:'発信力',v:70}],
};
const TYPE_RESULTS = {
  'T':{label:'T型キャリア',title:'あなたは「T型」タイプ',desc:'一つの専門性を軸に、幅広い知識を掛け合わせて価値を生むタイプ。PMへの転職と相性の良いキャリアタイプです。',keywords:['応用力','専門×幅広','PM適性◎']},
  'I':{label:'I型キャリア',title:'あなたは「I型」タイプ',desc:'一つの領域を深く掘り下げ、圧倒的な専門深度で勝負するタイプ。特定領域の第一人者を目指しましょう。',keywords:['専門深度','一点突破','第一人者']},
  'π':{label:'π型キャリア',title:'あなたは「π型」タイプ',desc:'2つの専門軸を統合して独自の価値を生み出すタイプ。掛け合わせの強みでPMキャリアも十分狙えます。',keywords:['2軸統合','掛け合わせ','独自価値']},
  'H':{label:'H型キャリア',title:'あなたは「H型」タイプ',desc:'組織やチームをつなぐ橋渡し力が強みのタイプ。調整力とコミュニケーション力でPMとして活躍できます。',keywords:['橋渡し力','調整力','共感力']},
  '━':{label:'━型キャリア',title:'あなたは「━型」タイプ',desc:'幅広い視野で組織を率いる統率力が強みのタイプ。マネジメントを軸にキャリアを積み上げましょう。',keywords:['統率力','俯瞰思考','組織牽引']},
};
const TYPE_MATCHES = {
  'T':{'T':91,'π':68,'H':52,'I':45,'━':38},
  'I':{'I':91,'T':72,'π':58,'H':45,'━':38},
  'π':{'π':91,'T':75,'I':60,'H':50,'━':42},
  'H':{'H':91,'π':68,'T':62,'━':52,'I':38},
  '━':{'━':91,'H':72,'π':65,'T':52,'I':38},
};
const ALL_TYPES = [
  {name:'T型',tag:'専門 × 幅広知識',  desc:'専門軸を持ちながら隣接領域を広げ、応用力で価値を生む。PMへの転職と最相性◎',key:'T'},
  {name:'π型',tag:'複数専門 × 統合力',desc:'2軸の専門を掛け合わせ、独自の視点と統合力で突破する。',key:'π'},
  {name:'H型',tag:'橋渡しの才能',      desc:'組織・チームを横断してつなぐコミュニケーション力に長ける。',key:'H'},
  {name:'I型',tag:'深いスペシャリスト',desc:'一点を徹底的に掘り下げ、専門深度で圧倒的な価値を生む。',key:'I'},
  {name:'━型',tag:'広域マネジメント', desc:'幅広い視野と俯瞰力で組織・事業を率いるリーダー型。',key:'━'},
];
const ROADMAP_STEPS = [
  {step:'01',title:'資格取得でスキルを可視化',desc:'AWS認定・PM関連資格を取得し、専門性を客観的に証明する。'},
  {step:'02',title:'業界知識と転職の準備',   desc:'志望業界を絞り込み、職務経歴書とポートフォリオを整える。'},
  {step:'03',title:'PM内定を獲得',            desc:'面接対策を重ね、目標ポジションでの内定獲得を目指す。'},
];
function calcResultType(answers) {
  const scores = {T:0,I:0,'π':0,H:0,'━':0};
  Object.entries(answers).forEach(([qid, idx]) => {
    const t = TM[qid] && TM[qid][idx];
    if (t && scores.hasOwnProperty(t)) scores[t]++;
  });
  return Object.entries(scores).sort((a,b) => b[1]-a[1])[0][0];
}

// ═══════════════════════════════════════════════════════════════════════════
// career templates — field → specialty → recommended roadmap
// ═══════════════════════════════════════════════════════════════════════════
const GENERIC_MILESTONES = [
  { name:'現状把握とゴール設定', tasks:[] },
  { name:'基礎を固める',         tasks:[] },
  { name:'実践・スキルを証明する', tasks:[] },
  { name:'応用・成果を積み上げる', tasks:[] },
  { name:'目標を達成する',         tasks:[] },
];

const CAREER_TEMPLATES = [
  { id:'it', name:'情報系 / IT', specialties:[
    { id:'data', name:'データマネジメント', goal:'データベーススペシャリスト合格', milestones:[
      { name:'IT・SQLの基礎', tasks:['基本情報技術者 取得','SQL基礎（SELECT・JOIN・集計）','リレーショナルDBの仕組みを理解'] },
      { name:'設計スキルの習得', tasks:['正規化とER図','論理・物理設計','インデックス／トランザクション'] },
      { name:'応用情報の取得', tasks:['応用情報技術者 取得','データベース分野を重点学習'] },
      { name:'専門資格（DBスペシャリスト）', tasks:['午前II 過去問演習','午後I 記述対策','午後II 事例対策'] },
      { name:'実務・成果づくり', tasks:['データ基盤設計の演習','分析用データマート構築','学習成果をポートフォリオ化'] },
    ]},
    { id:'infra', name:'インフラ / クラウド', goal:'AWS認定 + ネットワークスペシャリスト', milestones:[
      { name:'ネットワーク基礎', tasks:['基本情報技術者 取得','TCP/IP・OSI参照モデル','Linux基礎コマンド'] },
      { name:'クラウド入門', tasks:['AWS Cloud Practitioner 取得','VPC／EC2／S3の理解','IAMとセキュリティ基礎'] },
      { name:'クラウド設計', tasks:['AWS SAA 取得','可用性・スケーリング設計','IaC（Terraform）入門'] },
      { name:'ネットワーク専門', tasks:['応用情報技術者 取得','ネットワークスペシャリスト 午後対策'] },
      { name:'実務・成果づくり', tasks:['3層Webアプリの構築','監視・運用設計','ポートフォリオ公開'] },
    ]},
    { id:'security', name:'セキュリティ', goal:'情報処理安全確保支援士 合格', milestones:[
      { name:'基礎', tasks:['基本情報技術者 取得','暗号・認証の基礎','ネットワークの基礎'] },
      { name:'応用', tasks:['応用情報技術者 取得','脆弱性とインシデント対応','セキュアコーディング'] },
      { name:'専門知識', tasks:['支援士 午前II 対策','リスクマネジメント','関連法規の理解'] },
      { name:'記述対策', tasks:['午後I 事例演習','午後II 長文対策','過去問 ×5年分'] },
      { name:'実務・成果づくり', tasks:['脆弱性診断の演習','セキュリティ設計レビュー','CTFに参加'] },
    ]},
    { id:'dev', name:'ソフトウェア開発', goal:'応用情報技術者 + 実務スキル', milestones:[
      { name:'プログラミング基礎', tasks:['言語の基礎（変数〜関数）','Git／GitHub','基本情報技術者 取得'] },
      { name:'アルゴリズム・設計', tasks:['データ構造とアルゴリズム','オブジェクト指向設計','テストの基礎'] },
      { name:'応用情報の取得', tasks:['応用情報技術者 取得','システム設計の理解'] },
      { name:'実践開発', tasks:['Webアプリを1本作る','REST API設計','CI/CD入門'] },
      { name:'成果・発信', tasks:['ポートフォリオ公開','技術記事を書く','OSSにコントリビュート'] },
    ]},
    { id:'pm', name:'PM / マネジメント', goal:'プロジェクトマネージャ試験 / PMP', milestones:[
      { name:'基礎知識', tasks:['応用情報技術者 取得','PMBOKの基礎','アジャイル／スクラム基礎'] },
      { name:'実務経験', tasks:['小規模プロジェクトのリード','課題・リスク管理','ステークホルダー調整'] },
      { name:'専門資格', tasks:['プロジェクトマネージャ 午前II','午後I 事例対策'] },
      { name:'論述対策', tasks:['午後II 論文対策','PMP 受験準備'] },
      { name:'成果づくり', tasks:['プロジェクト完遂の実績化','振り返り・改善','チームマネジメント'] },
    ]},
  ]},
  { id:'biz', name:'ビジネス系', specialties:[
    { id:'account', name:'会計・財務', goal:'日商簿記1級 合格', milestones:[
      { name:'簿記入門', tasks:['簿記3級 取得','仕訳の基礎','試算表・精算表'] },
      { name:'商業簿記', tasks:['簿記2級（商業）取得','連結会計の基礎'] },
      { name:'工業簿記', tasks:['簿記2級（工業）取得','原価計算'] },
      { name:'上位資格', tasks:['簿記1級 商業簿記・会計学','簿記1級 工業簿記・原価計算'] },
      { name:'実務応用', tasks:['財務諸表分析','管理会計の実践'] },
    ]},
    { id:'marketing', name:'マーケティング', goal:'マーケティング実務 + 検定2級', milestones:[
      { name:'基礎', tasks:['マーケの基本概念','4P／STP','マーケティング検定3級'] },
      { name:'デジタル', tasks:['Web解析（GA4）基礎','SEO／広告運用入門','マーケティング検定2級'] },
      { name:'実践', tasks:['SNS運用の実務','コンテンツ企画','A/Bテスト'] },
      { name:'データ活用', tasks:['データ分析基礎','顧客分析（RFM）','ダッシュボード作成'] },
      { name:'成果づくり', tasks:['施策の成果をまとめる','ケーススタディ作成'] },
    ]},
  ]},
  { id:'lang', name:'語学', specialties:[
    { id:'english', name:'英語', goal:'TOEIC 900 / ビジネス英語', milestones:[
      { name:'基礎固め', tasks:['文法の総復習','単語帳を1冊完了','TOEIC 600達成'] },
      { name:'リスニング強化', tasks:['シャドーイング習慣化','Part3／4対策','TOEIC 730達成'] },
      { name:'リーディング強化', tasks:['長文速読','Part5／7対策','多読100万語'] },
      { name:'スコアアップ', tasks:['模試 ×5','弱点補強','TOEIC 860達成'] },
      { name:'実践', tasks:['ビジネス英会話','英語で発信','TOEIC 900達成'] },
    ]},
  ]},
  { id:'other', name:'その他・自分で設定', specialties:[
    { id:'custom', name:'自分で設定する', goal:'', milestones: GENERIC_MILESTONES },
  ]},
];
const ROLES = ['学生','社会人 1〜3年目','中堅（4年目〜）','マネージャー／管理職','転職を目指している','その他'];

function findField(id) { return CAREER_TEMPLATES.find(f => f.id === id); }
function findSpecialty(fieldId, specId) { const f = findField(fieldId); return f && f.specialties.find(s => s.id === specId); }
function specLabel(fieldId, specId) { const f = findField(fieldId), s = findSpecialty(fieldId, specId); return f && s ? `${f.name} / ${s.name}` : ''; }
function instantiateMilestones(tmplMs) {
  return (tmplMs || []).map(m => ({ id:uid(), name:m.name, period:'', tasks:(m.tasks||[]).map(label => ({ id:uid(), label, done:false })) }));
}

// ═══════════════════════════════════════════════════════════════════════════
// storage + seed
// ═══════════════════════════════════════════════════════════════════════════
const STORE_KEY = 'compass-v2';
const SCHEMA_VERSION = 2;

function makeSeed() {
  const today = new Date();
  return {
    version: SCHEMA_VERSION,
    profile: { name: '', field: '', specialty: '', role: '' },
    onboarded: false,
    setupStep: 'welcome',
    appliedTemplate: null,
    diagnosis: { answers: {}, resultType: null },
    goal: { title: '', targetDate: ymd(addDays(today, 300)) },
    subjects: [],
    milestones: instantiateMilestones(GENERIC_MILESTONES),
    logs: [],
    events: [],
  };
}
function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && s.version === SCHEMA_VERSION) return s;
  } catch (e) {}
  return null;
}
function saveState(s) { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {} }

// ═══════════════════════════════════════════════════════════════════════════
// derived stats
// ═══════════════════════════════════════════════════════════════════════════
function computeStats(state) {
  const { logs, subjects, milestones } = state;
  const dateSet = new Set(logs.map(l => l.date));
  const totalHours = round1(logs.reduce((a,l) => a + (+l.hours || 0), 0));
  const studyDays = dateSet.size;

  // streak (today, with one-day grace if today not yet logged)
  let streak = 0;
  let cur = startOfDay(new Date());
  if (!dateSet.has(ymd(cur))) cur = addDays(cur, -1);
  while (dateSet.has(ymd(cur))) { streak++; cur = addDays(cur, -1); }

  // subject totals
  const bySubj = {};
  logs.forEach(l => { bySubj[l.subjectId] = (bySubj[l.subjectId]||0) + (+l.hours||0); });
  const subjectTotals = subjects
    .map(s => ({ id:s.id, name:s.name, h: round1(bySubj[s.id]||0) }))
    .filter(s => s.h > 0)
    .sort((a,b) => b.h - a.h);

  // hours by date map (for calendar)
  const hoursByDate = {};
  logs.forEach(l => { hoursByDate[l.date] = round1((hoursByDate[l.date]||0) + (+l.hours||0)); });

  // this week (Mon–Sun)
  const monday = mondayOf(new Date());
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(monday, i);
    week.push({ d: WD_JP[d.getDay()], iso: ymd(d), h: round1(hoursByDate[ymd(d)] || 0) });
  }
  const weekTotal = round1(week.reduce((a,w) => a + w.h, 0));
  // last week
  const lastMon = addDays(monday, -7);
  let lastWeekTotal = 0;
  for (let i = 0; i < 7; i++) lastWeekTotal += hoursByDate[ymd(addDays(lastMon, i))] || 0;
  lastWeekTotal = round1(lastWeekTotal);

  // weekly average across weeks that have data
  const weekSums = {};
  logs.forEach(l => { const k = ymd(mondayOf(parseISO(l.date))); weekSums[k] = (weekSums[k]||0) + (+l.hours||0); });
  const weekKeys = Object.keys(weekSums);
  const weekAvg = weekKeys.length ? round1(weekKeys.reduce((a,k)=>a+weekSums[k],0) / weekKeys.length) : 0;

  // milestone progress + status
  const ms = milestones.map(m => {
    const total = m.tasks.length;
    const done = m.tasks.filter(t => t.done).length;
    const pct = total ? Math.round(done/total*100) : 0;
    return { ...m, total, done, pct };
  });
  let currentAssigned = false;
  ms.forEach(m => {
    if (m.pct === 100) m.status = '完了';
    else if (!currentAssigned) { m.status = '進行中'; currentAssigned = true; }
    else m.status = '未着手';
  });
  const totalTasks = ms.reduce((a,m) => a + m.total, 0);
  const doneTasks  = ms.reduce((a,m) => a + m.done, 0);
  const overallPct = totalTasks ? Math.round(doneTasks/totalTasks*100) : 0;

  return {
    totalHours, studyDays, streak, subjectTotals, hoursByDate,
    week, weekTotal, lastWeekTotal, weekAvg,
    milestones: ms, totalTasks, doneTasks, overallPct,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// generic UI primitives
// ═══════════════════════════════════════════════════════════════════════════
function Btn({ variant='secondary', children, style, ...rest }) {
  const base = { padding:'10px 18px', borderRadius:3, fontSize:13.5, fontWeight:500, letterSpacing:'.04em', transition:'background .15s,border-color .15s,opacity .15s' };
  const styles = {
    primary:   { ...base, background:C.ink7, color:C.ink0, border:'none' },
    secondary: { ...base, background:C.ink0, color:C.ink6, border:`0.5px solid ${C.ink3}` },
    ghost:     { ...base, background:'none', color:C.ink4, border:'none' },
    danger:    { ...base, background:'none', color:C.danger, border:`0.5px solid ${C.danger}` },
  };
  const cls = variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : variant === 'danger' ? 'btn-danger' : 'btn-ghost';
  return <button className={cls} style={{ ...styles[variant], ...style }} {...rest}>{children}</button>;
}

function IconBtn({ label, onClick, danger }) {
  return (
    <button className="icon-btn" onClick={onClick} title={label}
      style={{ background:'none', border:`0.5px solid ${C.ink2}`, borderRadius:3, padding:'4px 9px', fontSize:11, color:danger?C.danger:C.ink5 }}>
      {label}
    </button>
  );
}

function Modal({ title, onClose, children, footer, wide }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(20,20,19,.42)', display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'7vh 16px 16px', zIndex:50, overflowY:'auto' }}>
      <div className="modal-card" onClick={e => e.stopPropagation()}
        style={{ background:C.ink0, borderRadius:6, width:'100%', maxWidth:wide?620:460, boxShadow:'0 12px 40px rgba(0,0,0,.16)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', borderBottom:`0.5px solid ${C.ink2}` }}>
          <span style={{ fontSize:15, fontWeight:700, color:C.ink7 }}>{title}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:18, color:C.ink4, lineHeight:1, padding:4 }}>×</button>
        </div>
        <div style={{ padding:'22px' }}>{children}</div>
        {footer && <div style={{ display:'flex', justifyContent:'flex-end', gap:10, padding:'16px 22px', borderTop:`0.5px solid ${C.ink2}` }}>{footer}</div>}
      </div>
    </div>
  );
}

const fieldLabel = { display:'block', fontSize:11, color:C.ink4, marginBottom:7, letterSpacing:'.03em' };
const inputStyle = { width:'100%', padding:'10px 12px', fontSize:14, color:C.ink7, background:C.ink0, border:`0.5px solid ${C.ink3}`, borderRadius:3, fontFamily:'inherit' };
function Field({ label, children }) {
  return <label style={{ display:'block', marginBottom:16 }}><span style={fieldLabel}>{label}</span>{children}</label>;
}

function ConfirmDialog({ title, message, confirmLabel='削除する', onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}
      footer={<><Btn variant="ghost" onClick={onClose}>キャンセル</Btn><Btn variant="danger" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Btn></>}>
      <p style={{ fontSize:13.5, lineHeight:1.8, color:C.ink5 }}>{message}</p>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TopBar
// ═══════════════════════════════════════════════════════════════════════════
function TopBar() {
  return (
    <div style={{ height:52, background:C.ink7, display:'flex', alignItems:'center', padding:'0 24px', gap:11, flexShrink:0 }}>
      <span style={{ width:13, height:13, border:`1.5px solid ${C.ink0}`, borderRadius:99, display:'inline-block' }}/>
      <span style={{ color:C.ink0, fontSize:13, letterSpacing:'.24em', fontWeight:500 }}>COMPASS</span>
      <span style={{ color:C.ink5, fontSize:11, letterSpacing:'.05em' }}>キャリアプラン</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Onboarding — Welcome
// ═══════════════════════════════════════════════════════════════════════════
function PhaseWelcome({ onStart, onSkip }) {
  return (
    <div className="phase" style={{ maxWidth:560, margin:'0 auto', padding:'56px 24px 72px' }}>
      <StepDots active={1}/>
      <div style={mono({ fontSize:11, letterSpacing:'.16em', color:C.ink4, marginBottom:14 })}>STEP 1 ／ キャリアタイプ診断</div>
      <h1 style={{ fontSize:30, lineHeight:1.45, fontWeight:700, color:C.ink7, margin:'0 0 16px' }}>5分で、あなたの<br/>キャリアタイプを診断</h1>
      <p style={{ fontSize:14, lineHeight:1.9, color:C.ink5, margin:'0 0 28px' }}>4つの質問に答えるだけ。あなたの強みのかたちを見極め、目標に向けた最適なロードマップを提案します。</p>
      <div className="welcome-steps" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', margin:'0 0 36px', border:`0.5px solid ${C.ink2}`, borderRadius:4, overflow:'hidden', background:C.ink0 }}>
        {[
          {n:'01',title:'4問に答える',sub:'やりがい・ビジョン・\n学習スタイル'},
          {n:'02',title:'タイプ判定',sub:'5分類から\nあなたの型を特定'},
          {n:'03',title:'目標と計画',sub:'目標・段階・タスクを\n設定して運用開始'},
        ].map((s,i) => (
          <div key={i} style={{ padding:'18px 16px', textAlign:'center', borderRight:i<2?`0.5px solid ${C.ink2}`:'none' }}>
            <div style={mono({ fontSize:11, color:C.accent, marginBottom:9 })}>{s.n}</div>
            <div style={{ fontSize:12.5, fontWeight:700, color:C.ink7, marginBottom:5 }}>{s.title}</div>
            <div style={{ fontSize:11, color:C.ink4, lineHeight:1.65, whiteSpace:'pre-line' }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={mono({ fontSize:10, letterSpacing:'.14em', color:C.ink4, marginBottom:14 })}>診断タイプ ／ 5 TYPES</div>
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:36 }}>
        {CHIPS.map(c => (
          <div key={c.name} style={{ display:'flex', alignItems:'center', gap:16, padding:'13px 18px', background:C.ink0, border:`0.5px solid ${C.ink2}`, borderRadius:3 }}>
            <span style={mono({ fontSize:18, fontWeight:700, color:C.ink7, flexShrink:0, width:22, textAlign:'center', lineHeight:1 })}>{c.shape}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.ink6 }}>{c.name}</div>
              <div style={{ fontSize:11, color:C.ink4, marginTop:2 }}>{c.desc}</div>
            </div>
            <span style={{ fontSize:11, color:C.ink3, whiteSpace:'nowrap' }}>{c.tag}</span>
          </div>
        ))}
      </div>
      <Btn variant="primary" onClick={onStart} style={{ width:'100%', padding:17, fontSize:14.5 }}>診断をはじめる</Btn>
      <button onClick={onSkip} style={{ display:'block', width:'100%', marginTop:14, background:'none', border:'none', fontSize:12.5, color:C.ink4 }}>診断をスキップして使う →</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Onboarding — Q&A
// ═══════════════════════════════════════════════════════════════════════════
function PhaseQa({ answers, onAnswer, onBack, onFinish }) {
  const [page, setPage] = useState(0);
  const pageQs = QUESTIONS.filter(q => q.page === page);
  const canAdvance = pageQs.every(q => answers[q.id] !== undefined);
  const answered = QUESTIONS.filter(q => answers[q.id] !== undefined).length;
  const progressPct = (answered / 4 * 100) + '%';

  function advance() {
    if (!canAdvance) return;
    if (page === 0) { setPage(1); window.scrollTo(0,0); }
    else onFinish();
  }
  function goBack() { if (page === 1) { setPage(0); window.scrollTo(0,0); } else onBack(); }

  const optBase = { display:'flex', alignItems:'center', gap:13, width:'100%', textAlign:'left', padding:'17px 18px', background:C.ink0, border:`0.5px solid ${C.ink3}`, borderRadius:3, fontSize:14, lineHeight:1.5, color:C.ink6, transition:'background .15s,border-color .15s,color .15s' };
  const optSel  = { ...optBase, background:C.ink7, border:`0.5px solid ${C.ink7}`, color:C.ink0 };
  const labBase = mono({ fontSize:11, flexShrink:0, width:24, height:24, borderRadius:99, border:`0.5px solid ${C.ink3}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.ink4 });
  const labSel  = { ...labBase, border:'0.5px solid rgba(255,255,255,.6)', color:C.ink0 };

  return (
    <div className="phase" style={{ maxWidth:580, margin:'0 auto', padding:'36px 24px 72px' }}>
      <button onClick={goBack} style={{ background:'none', border:'none', fontSize:12, color:C.ink4, padding:'0 0 22px', display:'flex', alignItems:'center', gap:5 }}>← もどる</button>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:11 }}>
        <span style={mono({ fontSize:11, letterSpacing:'.14em', color:C.ink4 })}>STEP 2 ／ 診断 Q&amp;A</span>
        <div style={{ display:'flex', gap:7, alignItems:'center' }}>
          {['q1','q2','q3','q4'].map(qid => (
            <span key={qid} style={{ width:8, height:8, borderRadius:99, background:answers[qid]!==undefined?C.ink7:C.ink0, border:answers[qid]!==undefined?'none':`0.5px solid ${C.ink3}` }}/>
          ))}
        </div>
      </div>
      <div style={{ height:4, background:C.ink2, borderRadius:99, overflow:'hidden', marginBottom:46 }}>
        <div style={{ height:'100%', background:C.ink7, borderRadius:99, width:progressPct, transition:'width .45s ease' }}/>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:40 }}>
        {pageQs.map((q, pi) => (
          <div key={q.id}>
            <div style={mono({ fontSize:10, color:C.ink4, letterSpacing:'.12em', marginBottom:8 })}>Q{page*2+pi+1} / 4</div>
            <div style={{ fontSize:17, fontWeight:700, color:C.ink7, marginBottom:18, lineHeight:1.55 }}>{q.title}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {q.opts.map((text, idx) => {
                const sel = answers[q.id] === idx;
                return (
                  <button key={idx} className={`btn-option${sel?' selected':''}`} onClick={() => onAnswer(q.id, idx)} style={sel ? optSel : optBase}>
                    <span style={sel ? labSel : labBase}>{String.fromCharCode(65+idx)}</span>
                    <span>{text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:36 }}>
        <button className={canAdvance ? 'btn-primary' : ''} onClick={advance}
          style={canAdvance
            ? { width:'100%', padding:16, background:C.ink7, color:C.ink0, border:'none', borderRadius:3, fontSize:14.5, fontWeight:500, letterSpacing:'.06em' }
            : { width:'100%', padding:16, background:C.ink1, color:C.ink3, border:`0.5px solid ${C.ink2}`, borderRadius:3, fontSize:14.5, cursor:'default' }}>
          {page === 0 ? '次のページへ' : '診断結果を見る'}
        </button>
        {!canAdvance && <div style={{ textAlign:'center', fontSize:11, color:C.ink3, marginTop:12 }}>すべての質問に答えると進めます</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Radar chart
// ═══════════════════════════════════════════════════════════════════════════
function RadarChart({ type }) {
  const scores = SCORES_BY_TYPE[type] || SCORES_BY_TYPE['T'];
  const cx = 90, cy = 90, R = 56;
  const ang = i => (-90 + i * 72) * Math.PI / 180;
  const pt = (i, f) => [+(cx + R * f * Math.cos(ang(i))).toFixed(1), +(cy + R * f * Math.sin(ang(i))).toFixed(1)];
  const ringStr = f => scores.map((_,i) => pt(i,f).join(',')).join(' ');
  const dataStr = scores.map((s,i) => pt(i, s.v/100).join(',')).join(' ');
  const labels = scores.map((s,i) => { const [x,y] = pt(i,1.35); return { x,y,name:s.name, anchor:x<cx-3?'end':x>cx+3?'start':'middle' }; });
  return (
    <svg viewBox="0 0 180 180" width={186} height={186}>
      {[0.25,0.5,0.75,1].map(f => <polygon key={f} points={ringStr(f)} fill="none" stroke={C.ink2} strokeWidth="0.5"/>)}
      {scores.map((_,i) => { const [x,y] = pt(i,1); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={C.ink2} strokeWidth="0.5"/>; })}
      <polygon points={dataStr} fill="rgba(20,20,19,0.07)" stroke={C.ink7} strokeWidth="1.2" strokeLinejoin="round"/>
      {labels.map(l => <text key={l.name} x={l.x} y={l.y} textAnchor={l.anchor} fontSize="8.5" fill={C.ink5} dominantBaseline="middle" fontFamily="Noto Sans JP">{l.name}</text>)}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Onboarding — Result
// ═══════════════════════════════════════════════════════════════════════════
function PhaseResult({ answers, onNext, onRestart, onBack }) {
  const resultType = calcResultType(answers);
  const info = TYPE_RESULTS[resultType] || TYPE_RESULTS['T'];
  const matches = TYPE_MATCHES[resultType] || TYPE_MATCHES['T'];
  const scores = SCORES_BY_TYPE[resultType] || SCORES_BY_TYPE['T'];
  const typeCards = ALL_TYPES.map(t => ({ ...t, mine:t.key===resultType, matchVal:(matches[t.key]||0) })).sort((a,b) => b.matchVal - a.matchVal);
  return (
    <div className="phase" style={{ maxWidth:780, margin:'0 auto', padding:'48px 24px 80px' }}>
      <button onClick={onBack} style={{ background:'none', border:'none', fontSize:12, color:C.ink4, padding:'0 0 22px', display:'flex', alignItems:'center', gap:5 }}>← もどる</button>
      <StepDots active={1}/>
      <div style={{ textAlign:'center', marginBottom:46 }}>
        <div style={mono({ fontSize:11, letterSpacing:'.16em', color:C.ink4, marginBottom:16 })}>STEP 1 ／ 診断結果</div>
        <div style={{ display:'inline-flex', alignItems:'center', gap:11, padding:'8px 20px', background:C.ink7, borderRadius:99, marginBottom:20 }}>
          <span style={mono({ fontSize:12, color:C.ink4 })}>RESULT</span>
          <span style={{ fontSize:14, color:C.ink0, fontWeight:500 }}>{info.label}</span>
        </div>
        <h1 style={{ fontSize:30, fontWeight:700, color:C.ink7, margin:'0 0 14px' }}>{info.title}</h1>
        <p style={{ fontSize:14, lineHeight:1.9, color:C.ink5, maxWidth:480, margin:'0 auto' }}>{info.desc}</p>
        <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', marginTop:22 }}>
          {info.keywords.map(kw => <span key={kw} style={{ fontSize:12, padding:'6px 18px', borderRadius:99, border:`0.5px solid ${C.ink7}`, color:C.ink7, fontWeight:500 }}>{kw}</span>)}
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:48 }}>
        {typeCards.map(t => {
          const mine = t.mine;
          return (
            <div key={t.key} style={{ background:mine?C.ink7:C.ink0, border:`0.5px solid ${mine?C.ink7:C.ink2}`, borderRadius:4, padding:'18px 22px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                <span style={{ fontSize:20, fontWeight:700, flexShrink:0, color:mine?C.ink0:C.ink6 }}>{t.name}</span>
                <span style={{ fontSize:11, padding:'3px 9px', borderRadius:99, flexShrink:0, background:mine?'rgba(255,255,255,.1)':C.ink1, border:mine?'none':`0.5px solid ${C.ink2}`, color:mine?C.ink3:C.ink4 }}>{t.tag}</span>
                {mine && <span style={{ fontSize:10, color:C.accent, background:C.accentLight, padding:'3px 9px', borderRadius:99, whiteSpace:'nowrap' }}>あなたのタイプ</span>}
                <span style={mono({ fontWeight:500, marginLeft:'auto', fontSize:mine?18:14, color:mine?C.ink0:C.ink4 })}>{t.matchVal}%</span>
              </div>
              <div style={{ fontSize:12.5, lineHeight:1.75, color:mine?C.ink3:C.ink5 }}>{t.desc}</div>
              <div style={{ height:4, background:'#f0efec', borderRadius:99, overflow:'hidden', marginTop:10 }}>
                <div style={{ height:'100%', borderRadius:99, width:`${t.matchVal}%`, background:mine?'rgba(255,255,255,.5)':C.ink3 }}/>
              </div>
            </div>
          );
        })}
      </div>
      <div className="result-radar" style={{ display:'grid', gridTemplateColumns:'210px 1fr', gap:36, alignItems:'center', background:C.ink0, border:`0.5px solid ${C.ink2}`, borderRadius:4, padding:'30px', marginBottom:50 }}>
        <div style={{ display:'flex', justifyContent:'center' }}><RadarChart type={resultType}/></div>
        <div style={{ display:'flex', flexDirection:'column', gap:15 }}>
          <div style={mono({ fontSize:10, letterSpacing:'.12em', color:C.ink4, marginBottom:2 })}>ABILITY SCORE</div>
          {scores.map(s => (
            <div key={s.name}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:13, color:C.ink6 }}>{s.name}</span>
                <span style={mono({ fontSize:12, color:C.ink7 })}>{s.v}</span>
              </div>
              <div style={{ height:5, background:'#f0efec', borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', background:C.ink7, borderRadius:99, width:`${s.v}%` }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginBottom:44 }}>
        <div style={mono({ fontSize:10, letterSpacing:'.12em', color:C.ink4, marginBottom:16 })}>推奨ロードマップ ／ ROADMAP</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {ROADMAP_STEPS.map(r => (
            <div key={r.step} style={{ display:'flex', gap:20, alignItems:'flex-start', background:C.ink0, border:`0.5px solid ${C.ink2}`, borderRadius:4, padding:'20px 24px' }}>
              <span style={mono({ fontSize:13, color:C.accent, flexShrink:0, paddingTop:2 })}>STEP {r.step}</span>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:C.ink7, marginBottom:6 }}>{r.title}</div>
                <div style={{ fontSize:13, lineHeight:1.75, color:C.ink5 }}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <Btn variant="primary" onClick={onNext} style={{ width:'100%', padding:17, fontSize:14.5 }}>次へ：プロフィール設定</Btn>
        <button className="btn-secondary" onClick={onRestart} style={{ width:'100%', padding:13, background:'none', color:C.ink4, border:`0.5px solid ${C.ink3}`, borderRadius:3, fontSize:13 }}>もう一度診断する</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// task dot/text styles
// ═══════════════════════════════════════════════════════════════════════════
const TASK_DOT = {
  done:   { display:'inline-block', width:8, height:8, borderRadius:99, background:C.ink7, flexShrink:0 },
  current:{ display:'inline-block', width:8, height:8, borderRadius:99, background:C.ink0, border:`1.5px solid ${C.accent}`, flexShrink:0 },
  todo:   { display:'inline-block', width:8, height:8, borderRadius:99, background:C.ink0, border:`0.5px solid ${C.ink3}`, flexShrink:0 },
};
const TASK_TEXT = {
  done:   { fontSize:13, color:C.ink3, textDecoration:'line-through' },
  current:{ fontSize:13, color:C.accent, fontWeight:500 },
  todo:   { fontSize:13, color:C.ink4 },
};
function statusBadge(status, onDark, baseIdx) {
  if (status === '進行中') return { background:C.accentLight, color:C.accent, fontWeight:500 };
  if (status === '完了')   return { border:`0.5px solid ${onDark?'rgba(255,255,255,.45)':C.ink3}`, color:onDark?C.ink0:C.ink4 };
  return { border:`0.5px solid ${onDark?'rgba(255,255,255,.22)':C.ink2}`, color:onDark?C.ink4:C.ink3 };
}

// ═══════════════════════════════════════════════════════════════════════════
// Dashboard tab
// ═══════════════════════════════════════════════════════════════════════════
function TabDashboard({ state, stats, onToggleTask }) {
  const [selectedLayer, setSelectedLayer] = useState(null);
  const ms = stats.milestones;
  const n = ms.length;

  // pyramid geometry (variable layer count)
  const widthAt = i => { // i: 0=base ... n-1=apex
    if (n <= 1) return '100%';
    const w = 100 - (100 - 36) * (i / (n - 1));
    return w.toFixed(0) + '%';
  };
  const shade = i => {
    // base lightest → apex darkest
    const cols = ['#c9c7c2','#a8a6a0','#888780','#525048','#2c2b28','#141413'];
    if (n === 1) return cols[5];
    const idx = Math.round(i / (n - 1) * (cols.length - 1));
    return cols[idx];
  };

  // heatmap: this week, per subject × weekday (Mon–Sun)
  const monday = mondayOf(new Date());
  const weekDates = []; for (let i=0;i<6;i++) weekDates.push(ymd(addDays(monday,i)));
  const subjForHeat = state.subjects.slice(0, 3);
  const heatMax = 3;
  const HC = ['#eeede9','#d3d1cc','#8f8d88','#2c2b28'];
  const lvl = h => h <= 0 ? 0 : h < 1.5 ? 1 : h < 3 ? 2 : 3;
  function subjHoursOn(subjId, iso) {
    return state.logs.filter(l => l.subjectId === subjId && l.date === iso).reduce((a,l)=>a+(+l.hours||0),0);
  }

  const KPI = [
    { label:'全体進捗', main:stats.overallPct, unit:'%', sub:`${stats.doneTasks} / ${stats.totalTasks} タスク完了`, hasBar:true },
    { label:'累計学習', main:stats.totalHours, unit:'h', sub:`先週 ${stats.lastWeekTotal}h → 今週 ${stats.weekTotal}h` },
    { label:'残タスク', main:stats.totalTasks-stats.doneTasks, unit:'件', sub:'進行中・未着手タスク' },
    { label:'連続学習', main:stats.streak, unit:'日', sub:stats.streak>0?'継続中':'今日から再開しよう' },
  ];

  return (
    <>
      <div className="kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
        {KPI.map(k => (
          <div key={k.label} style={{ background:C.ink0, border:`0.5px solid ${C.ink2}`, borderRadius:4, padding:'18px 18px', display:'flex', flexDirection:'column', gap:11 }}>
            <span style={{ fontSize:11, color:C.ink4, letterSpacing:'.03em' }}>{k.label}</span>
            <span style={mono({ color:C.ink7 })}>
              <span style={{ fontSize:30, fontWeight:500 }}>{k.main}</span>
              <span style={{ fontSize:14, marginLeft:1 }}>{k.unit}</span>
            </span>
            {k.hasBar && <div style={{ height:4, background:'#f0efec', borderRadius:99, overflow:'hidden' }}><div style={{ height:'100%', width:`${stats.overallPct}%`, background:C.ink7, borderRadius:99 }}/></div>}
            <span style={{ fontSize:11, color:k.hasBar?C.ink4:C.ink3 }}>{k.sub}</span>
          </div>
        ))}
      </div>

      {/* Pyramid */}
      <div style={{ background:C.ink0, border:`0.5px solid ${C.ink2}`, borderRadius:4, padding:'30px 28px', marginBottom:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:4 }}>
          <span style={{ fontSize:13, fontWeight:700, color:C.ink7 }}>マイルストーン・ピラミッド</span>
          <span style={{ fontSize:11, color:C.ink4 }}>▲ ビジョン（最終目標）— クリックで詳細</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:7, margin:'22px 0 12px' }}>
          {ms.slice().reverse().map((m, ri) => {
            const i = n - 1 - ri; // 0=base
            const onDark = i >= Math.ceil(n/2);
            const tc = onDark ? '#fff' : C.ink6;
            const sel = selectedLayer === m.id;
            const border = m.status==='進行中' ? `1.5px solid ${C.accent}` : sel ? '1px solid rgba(255,255,255,.35)' : '0.5px solid transparent';
            return (
              <div key={m.id} style={{ width:widthAt(i) }}>
                <div className="pyramid-layer" onClick={() => setSelectedLayer(sel ? null : m.id)}
                  style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:`13px 18px`, background:shade(i), borderRadius:3, cursor:'pointer', border }}>
                  <span style={{ fontSize:12.5, fontWeight:500, color:tc, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.name}</span>
                  <span style={{ display:'flex', alignItems:'center', gap:9, flexShrink:0 }}>
                    <span style={{ whiteSpace:'nowrap', fontSize:10, padding:'2px 9px', borderRadius:99, ...statusBadge(m.status, onDark, i) }}>{m.status}</span>
                    <span style={mono({ fontSize:11, color:m.pct===100?(onDark?'#e8e7e4':C.ink5):m.pct>0?(onDark?C.accentLight:C.accent):(onDark?C.ink4:C.ink3) })}>{m.pct}%</span>
                  </span>
                </div>
                {sel && (
                  <div className="pyramid-detail" style={{ background:C.ink1, borderLeft:`0.5px solid ${C.ink2}`, borderRight:`0.5px solid ${C.ink2}`, borderBottom:`0.5px solid ${C.ink2}`, borderRadius:'0 0 4px 4px', padding:'16px 18px', display:'flex', flexDirection:'column', gap:10 }}>
                    <div style={mono({ fontSize:11, color:C.ink4 })}>{m.period}</div>
                    {m.tasks.map(t => {
                      const ds = t.done ? 'done' : (m.status==='進行中' ? 'current' : 'todo');
                      return (
                        <div key={t.id} className="task-row" style={{ display:'flex', alignItems:'center', gap:11, cursor:'pointer' }} onClick={() => onToggleTask(m.id, t.id)}>
                          <span style={TASK_DOT[ds]}/>
                          <span style={TASK_TEXT[ds]}>{t.label}</span>
                        </div>
                      );
                    })}
                    {m.tasks.length===0 && <div style={{ fontSize:12, color:C.ink3 }}>タスクはまだありません（ロードマップタブで追加）</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ textAlign:'center', fontSize:11, color:C.ink4, marginTop:8 }}>▼ 基盤 ＝ 土台（積み上げの出発点）</div>
      </div>

      <div className="two-col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        {/* timeline */}
        <div style={{ background:C.ink0, border:`0.5px solid ${C.ink2}`, borderRadius:4, padding:26 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.ink7, marginBottom:22 }}>マイルストーン進捗</div>
          <div style={{ display:'flex', flexDirection:'column' }}>
            {ms.map((t,i) => (
              <div key={t.id} style={{ display:'flex', gap:15, alignItems:'flex-start' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0, paddingTop:2 }}>
                  <span style={{ width:11, height:11, borderRadius:99, flexShrink:0, display:'inline-block', background:t.status==='完了'?C.ink7:C.ink0, border:t.status==='完了'?`0.5px solid ${C.ink7}`:t.status==='進行中'?`1.5px solid ${C.accent}`:`0.5px solid ${C.ink3}` }}/>
                  {i<ms.length-1 && <span style={{ width:0.5, flex:1, minHeight:30, background:C.ink2, display:'block' }}/>}
                </div>
                <div style={{ paddingBottom:20, marginTop:-3 }}>
                  <div style={{ fontSize:13, color:t.status==='未着手'?C.ink4:C.ink6, fontWeight:t.status==='未着手'?400:500, lineHeight:1.5 }}>{t.name}</div>
                  <span style={{ display:'inline-block', marginTop:7, whiteSpace:'nowrap', fontSize:10.5, padding:'2px 9px', borderRadius:99, ...statusBadge(t.status, false, i) }}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* heatmap */}
        <div style={{ background:C.ink0, border:`0.5px solid ${C.ink2}`, borderRadius:4, padding:26 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
            <span style={{ fontSize:13, fontWeight:700, color:C.ink7 }}>今週の学習</span>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ fontSize:10, color:C.ink4, marginRight:1 }}>少</span>
              {HC.map((bg,i) => <span key={i} style={{ width:11, height:11, borderRadius:2, background:bg, display:'inline-block', border:i===0?`0.5px solid ${C.ink2}`:'none' }}/>)}
              <span style={{ fontSize:10, color:C.ink4, marginLeft:1 }}>多</span>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'42px repeat(6,1fr)', gap:6, marginBottom:6 }}>
            <span/>
            {['月','火','水','木','金','土'].map(d => <span key={d} style={{ textAlign:'center', fontSize:10, color:C.ink4 }}>{d}</span>)}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {subjForHeat.length===0 && <div style={{ fontSize:12, color:C.ink3 }}>科目がありません</div>}
            {subjForHeat.map(s => (
              <div key={s.id} style={{ display:'grid', gridTemplateColumns:'42px repeat(6,1fr)', gap:6, alignItems:'center' }}>
                <span style={{ fontSize:11, color:C.ink5, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.name}</span>
                {weekDates.map(iso => <span key={iso} style={{ height:28, borderRadius:3, border:`0.5px solid #efeeeb`, background:HC[lvl(subjHoursOn(s.id, iso))], display:'block' }}/>)}
              </div>
            ))}
          </div>
          <div style={{ fontSize:11, color:C.ink4, marginTop:18, lineHeight:1.7 }}>
            継続日数 <span style={mono({ color:C.ink7 })}>{stats.streak}</span> 日。今週の合計 <span style={mono({ color:C.ink7 })}>{stats.weekTotal}</span> h。
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Roadmap tab (milestone + task CRUD)
// ═══════════════════════════════════════════════════════════════════════════
function TabRoadmap({ state, stats, dispatch }) {
  const [editing, setEditing] = useState(null); // {milestone} or {new:true}
  const [confirm, setConfirm] = useState(null);
  const [taskEdit, setTaskEdit] = useState(null); // {msId, task} | {msId, new:true}
  const ms = stats.milestones;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:700, color:C.ink7, marginBottom:5 }}>{state.goal.title} ロードマップ</div>
          <div style={{ fontSize:12, color:C.ink4 }}>基盤から頂点へ積み上げる{ms.length}段階のマイルストーン</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={mono({ fontSize:11, color:C.ink4 })}>目標日：{fmtFull(state.goal.targetDate)}</div>
          <Btn variant="primary" onClick={() => setEditing({ new:true })} style={{ padding:'9px 16px', fontSize:12.5 }}>＋ マイルストーン</Btn>
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column' }}>
        {ms.map((m,i) => {
          const active = m.status==='進行中', done = m.status==='完了';
          return (
            <div key={m.id} style={{ display:'flex', gap:20, alignItems:'flex-start' }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0, paddingTop:24, width:13 }}>
                <span style={{ width:11, height:11, borderRadius:99, display:'inline-block', flexShrink:0, background:done?C.ink7:C.ink0, border:done?`0.5px solid ${C.ink7}`:active?`1.5px solid ${C.accent}`:`0.5px solid ${C.ink3}` }}/>
                {i<ms.length-1 && <span style={{ width:0.5, flex:1, minHeight:52, background:C.ink2, display:'block' }}/>}
              </div>
              <div style={{ flex:1, marginBottom:14, background:done?'#fafaf9':C.ink0, border:active?`0.5px solid ${C.accent}`:`0.5px solid ${C.ink2}`, borderRadius:4, padding:'22px 24px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:6 }}>
                  <div style={{ flex:1 }}>
                    <div style={mono({ fontSize:11, color:C.ink4, marginBottom:6 })}>{pad2(i+1)}</div>
                    <div style={{ fontSize:15, fontWeight:700, color:m.status==='未着手'?C.ink4:C.ink7 }}>{m.name}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                    <span style={{ whiteSpace:'nowrap', fontSize:10.5, padding:'2px 9px', borderRadius:99, ...statusBadge(m.status, false, i) }}>{m.status}</span>
                    <IconBtn label="編集" onClick={() => setEditing({ milestone:m })}/>
                    <IconBtn label="削除" danger onClick={() => setConfirm({ type:'ms', id:m.id, name:m.name })}/>
                  </div>
                </div>
                <div style={mono({ fontSize:11, color:C.ink4, marginBottom:14 })}>{m.period}</div>
                <div style={{ height:4, background:'#f0efec', borderRadius:99, overflow:'hidden', marginBottom:18 }}>
                  <div style={{ height:'100%', background:C.ink7, borderRadius:99, width:`${m.pct}%`, transition:'width .3s ease' }}/>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {m.tasks.map(t => {
                    const ds = t.done ? 'done' : (active ? 'current' : 'todo');
                    return (
                      <div key={t.id} className="task-row" style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <span onClick={() => dispatch({ type:'toggleTask', msId:m.id, taskId:t.id })} style={{ ...TASK_DOT[ds], cursor:'pointer' }}/>
                        <span onClick={() => dispatch({ type:'toggleTask', msId:m.id, taskId:t.id })} style={{ ...TASK_TEXT[ds], cursor:'pointer', flex:1 }}>{t.label}</span>
                        <button onClick={() => setTaskEdit({ msId:m.id, task:t })} style={{ background:'none', border:'none', fontSize:11, color:C.ink4 }}>編集</button>
                        <button onClick={() => dispatch({ type:'delTask', msId:m.id, taskId:t.id })} style={{ background:'none', border:'none', fontSize:11, color:C.ink4 }}>×</button>
                      </div>
                    );
                  })}
                  <button onClick={() => setTaskEdit({ msId:m.id, new:true })} style={{ alignSelf:'flex-start', marginTop:4, background:'none', border:`0.5px dashed ${C.ink3}`, borderRadius:3, fontSize:12, color:C.ink4, padding:'6px 12px' }}>＋ タスクを追加</button>
                </div>
              </div>
            </div>
          );
        })}
        {ms.length===0 && <div style={{ fontSize:13, color:C.ink4, padding:'40px 0', textAlign:'center' }}>マイルストーンがありません。「＋ マイルストーン」から追加してください。</div>}
      </div>

      {editing && <MilestoneModal milestone={editing.milestone} onClose={() => setEditing(null)} onSave={(data) => { dispatch(editing.new ? { type:'addMs', data } : { type:'editMs', id:editing.milestone.id, data }); setEditing(null); }}/>}
      {taskEdit && <TaskModal task={taskEdit.task} onClose={() => setTaskEdit(null)} onSave={(label) => { dispatch(taskEdit.new ? { type:'addTask', msId:taskEdit.msId, label } : { type:'editTask', msId:taskEdit.msId, taskId:taskEdit.task.id, label }); setTaskEdit(null); }}/>}
      {confirm && <ConfirmDialog title="マイルストーンを削除" message={`「${confirm.name}」を削除します。含まれるタスクもすべて削除されます。`} onConfirm={() => dispatch({ type:'delMs', id:confirm.id })} onClose={() => setConfirm(null)}/>}
    </div>
  );
}

function MilestoneModal({ milestone, onClose, onSave }) {
  const [name, setName] = useState(milestone?.name || '');
  const [period, setPeriod] = useState(milestone?.period || '');
  const valid = name.trim().length > 0;
  return (
    <Modal title={milestone ? 'マイルストーンを編集' : 'マイルストーンを追加'} onClose={onClose}
      footer={<><Btn variant="ghost" onClick={onClose}>キャンセル</Btn><Btn variant="primary" disabled={!valid} style={{ opacity:valid?1:.4 }} onClick={() => valid && onSave({ name:name.trim(), period:period.trim() })}>保存</Btn></>}>
      <Field label="名称"><input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="例：資格取得・スキル証明" autoFocus/></Field>
      <Field label="期間・フェーズ（任意）"><input style={inputStyle} value={period} onChange={e => setPeriod(e.target.value)} placeholder="例：2026.01 – 2026.06"/></Field>
    </Modal>
  );
}

function TaskModal({ task, onClose, onSave }) {
  const [label, setLabel] = useState(task?.label || '');
  const valid = label.trim().length > 0;
  return (
    <Modal title={task ? 'タスクを編集' : 'タスクを追加'} onClose={onClose}
      footer={<><Btn variant="ghost" onClick={onClose}>キャンセル</Btn><Btn variant="primary" disabled={!valid} style={{ opacity:valid?1:.4 }} onClick={() => valid && onSave(label.trim())}>保存</Btn></>}>
      <Field label="タスク名"><input style={inputStyle} value={label} onChange={e => setLabel(e.target.value)} placeholder="例：PMP 試験対策" autoFocus/></Field>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Calendar tab
// ═══════════════════════════════════════════════════════════════════════════
function TabCalendar({ state, stats, dispatch }) {
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() }); // m: 0-indexed
  const [logModal, setLogModal] = useState(null); // {date}
  const [eventModal, setEventModal] = useState(null); // {event} | {new:true}
  const [confirm, setConfirm] = useState(null);

  const first = new Date(view.y, view.m, 1).getDay();
  const dim = new Date(view.y, view.m+1, 0).getDate();
  const monthHours = []; for (let d=1; d<=dim; d++) { const iso = `${view.y}-${pad2(view.m+1)}-${pad2(d)}`; monthHours.push(stats.hoursByDate[iso]||0); }
  const maxH = Math.max(0.1, ...monthHours);
  const studyDayCount = monthHours.filter(h => h>0).length;
  const hoursTotal = round1(monthHours.reduce((a,b)=>a+b,0));
  const todayIso = todayISO();

  const cells = [];
  for (let i=0;i<first;i++) cells.push({ empty:true });
  for (let d=1; d<=dim; d++) {
    const iso = `${view.y}-${pad2(view.m+1)}-${pad2(d)}`;
    const h = stats.hoursByDate[iso]||0;
    const alpha = h>0 ? 0.11 + (h/maxH)*0.58 : 0;
    cells.push({ d, iso, h, bg: h>0?`rgba(20,20,19,${alpha.toFixed(2)})`:'transparent', tc: alpha>0.42?C.ink0:C.ink5, isToday: iso===todayIso });
  }

  function shift(delta) { let m = view.m + delta, y = view.y; if (m<0){m=11;y--;} if (m>11){m=0;y++;} setView({ y, m }); }

  const upcoming = state.events.filter(e => e.date >= todayIso).sort((a,b) => a.date.localeCompare(b.date));
  const subjName = id => { const s = state.subjects.find(x=>x.id===id); return s ? s.name : null; };

  return (
    <div className="cal-layout" style={{ display:'grid', gridTemplateColumns:'1fr 264px', gap:20, alignItems:'flex-start' }}>
      <div style={{ background:C.ink0, border:`0.5px solid ${C.ink2}`, borderRadius:4, padding:'26px 24px' }}>
        <div className="cal-stats" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:26 }}>
          {[
            { val:`${studyDayCount}日`, label:'学習日数', sub:`/ ${dim}日` },
            { val:`${hoursTotal}h`, label:'合計時間', sub:'今月累計' },
            { val:`${studyDayCount?round1(hoursTotal/studyDayCount):0}h`, label:'日平均', sub:'/ 学習日' },
          ].map(s => (
            <div key={s.label} style={{ border:`0.5px solid ${C.ink2}`, borderRadius:4, padding:'14px 16px' }}>
              <div style={mono({ fontSize:22, fontWeight:500, color:C.ink7, marginBottom:4 })}>{s.val}</div>
              <div style={{ fontSize:11, color:C.ink4 }}>{s.label}</div>
              <div style={{ fontSize:10, color:C.ink3, marginTop:2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:13 }}>
          <button onClick={() => shift(-1)} style={{ background:'none', border:`0.5px solid ${C.ink2}`, borderRadius:3, padding:'4px 11px', fontSize:13, color:C.ink5 }}>‹</button>
          <div style={{ fontSize:13, fontWeight:700, color:C.ink7 }}>{view.y}年 {view.m+1}月</div>
          <button onClick={() => shift(1)} style={{ background:'none', border:`0.5px solid ${C.ink2}`, borderRadius:3, padding:'4px 11px', fontSize:13, color:C.ink5 }}>›</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:5, marginBottom:5 }}>
          {WD_JP.map(w => <span key={w} style={{ textAlign:'center', fontSize:10, color:C.ink4 }}>{w}</span>)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:5 }}>
          {cells.map((c,i) => c.empty
            ? <div key={i} style={{ aspectRatio:'1', border:'0.5px solid transparent', borderRadius:3 }}/>
            : <div key={i} className="cal-day" onClick={() => setLogModal({ date:c.iso })}
                style={{ aspectRatio:'1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, borderRadius:3, ...mono({ fontSize:11 }), color:c.tc, background:c.bg, border:c.isToday?`1.5px solid ${C.ink7}`:`0.5px solid #f0efec`, cursor:'pointer' }}>
                <span>{c.d}</span>
                {c.h>0 && <span style={{ fontSize:9, opacity:.8 }}>{c.h}h</span>}
              </div>
          )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:16, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            {['#eeede9','rgba(20,20,19,.35)','rgba(20,20,19,.56)','#141413'].map((bg,i) => <span key={i} style={{ width:11, height:11, borderRadius:2, background:bg, display:'inline-block', border:i===0?`0.5px solid ${C.ink2}`:'none' }}/>)}
          </div>
          <span style={{ fontSize:11, color:C.ink4 }}>学習時間（少 → 多）</span>
          <span style={{ fontSize:11, color:C.ink4, marginLeft:'auto' }}>日付クリックで記録を追加</span>
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ background:C.ink0, border:`0.5px solid ${C.ink2}`, borderRadius:4, padding:'22px 20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <span style={{ fontSize:13, fontWeight:700, color:C.ink7 }}>今後の予定</span>
            <button onClick={() => setEventModal({ new:true })} style={{ background:'none', border:`0.5px solid ${C.ink3}`, borderRadius:3, fontSize:11, color:C.ink5, padding:'3px 9px' }}>＋ 追加</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {upcoming.length===0 && <div style={{ fontSize:12, color:C.ink3 }}>予定はありません</div>}
            {upcoming.map(e => (
              <div key={e.id} className="event-row" style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                <div style={{ flexShrink:0, textAlign:'center', padding:'7px 9px', background:C.ink1, border:`0.5px solid ${C.ink2}`, borderRadius:3, minWidth:50 }}>
                  <div style={mono({ fontSize:11.5, color:C.ink7, whiteSpace:'nowrap' })}>{fmtLogDate(e.date)}</div>
                  <div style={{ fontSize:10, color:C.ink4, marginTop:2 }}>{weekdayJP(e.date)}</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color:C.ink6, lineHeight:1.5, marginBottom:6 }}>{e.label}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {subjName(e.subjectId) && <span style={{ fontSize:10, padding:'2px 9px', borderRadius:3, background:C.ink1, border:`0.5px solid ${C.ink2}`, color:C.ink5, whiteSpace:'nowrap' }}>{subjName(e.subjectId)}</span>}
                    <button onClick={() => setEventModal({ event:e })} style={{ background:'none', border:'none', fontSize:11, color:C.ink4 }}>編集</button>
                    <button onClick={() => setConfirm({ id:e.id, label:e.label })} style={{ background:'none', border:'none', fontSize:11, color:C.ink4 }}>削除</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:C.ink0, border:`0.5px solid ${C.ink2}`, borderRadius:4, padding:20 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.ink7, marginBottom:12 }}>サマリー</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { l:'連続学習', v:`${stats.streak}日`, mono:true },
              { l:'累計学習', v:`${stats.totalHours}h`, mono:true },
              { l:'週平均', v:`${stats.weekAvg}h`, mono:true },
              { l:'最多学習科目', v:stats.subjectTotals[0]?stats.subjectTotals[0].name:'—', mono:false },
            ].map(r => (
              <div key={r.l} style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                <span style={{ color:C.ink4 }}>{r.l}</span>
                <span style={r.mono?mono({ color:C.ink7 }):{ color:C.ink6 }}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {logModal && <LogModal state={state} fixedDate={logModal.date} onClose={() => setLogModal(null)} onSave={(data) => { dispatch({ type:'addLog', data }); setLogModal(null); }}/>}
      {eventModal && <EventModal state={state} event={eventModal.event} onClose={() => setEventModal(null)} onSave={(data) => { dispatch(eventModal.new ? { type:'addEvent', data } : { type:'editEvent', id:eventModal.event.id, data }); setEventModal(null); }}/>}
      {confirm && <ConfirmDialog title="予定を削除" message={`「${confirm.label}」を削除しますか？`} onConfirm={() => dispatch({ type:'delEvent', id:confirm.id })} onClose={() => setConfirm(null)}/>}
    </div>
  );
}

function EventModal({ state, event, onClose, onSave }) {
  const [date, setDate] = useState(event?.date || todayISO());
  const [label, setLabel] = useState(event?.label || '');
  const [subjectId, setSubjectId] = useState(event?.subjectId || '');
  const valid = label.trim() && date;
  return (
    <Modal title={event ? '予定を編集' : '予定を追加'} onClose={onClose}
      footer={<><Btn variant="ghost" onClick={onClose}>キャンセル</Btn><Btn variant="primary" disabled={!valid} style={{ opacity:valid?1:.4 }} onClick={() => valid && onSave({ date, label:label.trim(), subjectId:subjectId||null })}>保存</Btn></>}>
      <Field label="日付"><input type="date" style={inputStyle} value={date} onChange={e => setDate(e.target.value)}/></Field>
      <Field label="内容"><input style={inputStyle} value={label} onChange={e => setLabel(e.target.value)} placeholder="例：AWS SAA 模擬試験" autoFocus/></Field>
      <Field label="関連科目（任意）">
        <select style={inputStyle} value={subjectId} onChange={e => setSubjectId(e.target.value)}>
          <option value="">なし</option>
          {state.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </Field>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Learning log tab
// ═══════════════════════════════════════════════════════════════════════════
function TabLog({ state, stats, dispatch }) {
  const [logModal, setLogModal] = useState(null); // {log} | {new:true}
  const [confirm, setConfirm] = useState(null);
  const [subjMgr, setSubjMgr] = useState(false);

  const maxH = Math.max(0.1, ...stats.week.map(w=>w.h));
  const subjTotal = stats.subjectTotals.reduce((a,s)=>a+s.h,0) || 1;
  const todayIso = todayISO();
  const sortedLogs = state.logs.slice().sort((a,b) => b.date.localeCompare(a.date));
  const subjName = id => { const s = state.subjects.find(x=>x.id===id); return s ? s.name : '—'; };

  const STATS = [
    { label:'累計学習', val:`${stats.totalHours}h` },
    { label:'学習日数', val:`${stats.studyDays}日` },
    { label:'連続学習', val:`${stats.streak}日` },
    { label:'週平均', val:`${stats.weekAvg}h` },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div style={{ fontSize:15, fontWeight:700, color:C.ink7 }}>学習記録</div>
        <div style={{ display:'flex', gap:10 }}>
          <Btn variant="secondary" onClick={() => setSubjMgr(true)} style={{ padding:'9px 16px', fontSize:12.5 }}>科目を管理</Btn>
          <Btn variant="primary" onClick={() => setLogModal({ new:true })} style={{ padding:'9px 16px', fontSize:12.5 }}>＋ 記録を追加</Btn>
        </div>
      </div>

      <div className="log-stats" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background:C.ink0, border:`0.5px solid ${C.ink2}`, borderRadius:4, padding:'18px 20px' }}>
            <div style={{ fontSize:11, color:C.ink4, marginBottom:9 }}>{s.label}</div>
            <div style={mono({ fontSize:28, fontWeight:500, color:C.ink7 })}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="log-charts" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={{ background:C.ink0, border:`0.5px solid ${C.ink2}`, borderRadius:4, padding:24 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.ink7, marginBottom:4 }}>今週の学習時間</div>
          <div style={{ fontSize:11, color:C.ink4, marginBottom:20 }}>月 – 日</div>
          <div style={{ display:'flex', gap:10, alignItems:'flex-end', borderBottom:`0.5px solid ${C.ink2}`, paddingBottom:1 }}>
            {stats.week.map(w => {
              const barH = w.h>0 ? Math.max(5, Math.round((w.h/maxH)*74)) : 4;
              const today = w.iso===todayIso;
              return (
                <div key={w.iso} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <span style={mono({ fontSize:10, color:w.h>0?C.ink7:'#e8e7e4' })}>{w.h>0?`${w.h}h`:''}</span>
                  <div style={{ width:28, borderRadius:'3px 3px 0 0', height:barH, background:today&&w.h>0?C.ink7:w.h>0?C.ink3:'#eeede9' }}/>
                </div>
              );
            })}
          </div>
          <div style={{ display:'flex', gap:10, marginTop:7 }}>
            {stats.week.map(w => <span key={w.iso} style={{ flex:1, textAlign:'center', fontSize:11, color:w.iso===todayIso?C.ink7:C.ink4, fontWeight:w.iso===todayIso?700:400 }}>{w.d}</span>)}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginTop:16, paddingTop:14, borderTop:'0.5px solid #f0efec' }}>
            <span style={{ fontSize:12, color:C.ink4 }}>週計</span>
            <span style={mono({ fontSize:16, color:C.ink7 })}>{stats.weekTotal}h</span>
            <span style={{ fontSize:11, color:C.ink4, marginLeft:8 }}>先週比</span>
            <span style={{ fontSize:12, color:C.ink5 }}>{stats.weekTotal-stats.lastWeekTotal>=0?'+':''}{round1(stats.weekTotal-stats.lastWeekTotal)}h</span>
          </div>
        </div>

        <div style={{ background:C.ink0, border:`0.5px solid ${C.ink2}`, borderRadius:4, padding:24 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.ink7, marginBottom:4 }}>科目別累計</div>
          <div style={{ fontSize:11, color:C.ink4, marginBottom:22 }}>全{stats.totalHours}h の内訳</div>
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {stats.subjectTotals.length===0 && <div style={{ fontSize:12, color:C.ink3 }}>まだ記録がありません</div>}
            {stats.subjectTotals.map(s => {
              const pct = Math.round(s.h/subjTotal*100);
              return (
                <div key={s.id}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8 }}>
                    <span style={{ fontSize:14, color:C.ink6, fontWeight:500 }}>{s.name}</span>
                    <span style={{ display:'flex', alignItems:'baseline', gap:5 }}>
                      <span style={mono({ fontSize:16, color:C.ink7, fontWeight:500 })}>{s.h}h</span>
                      <span style={mono({ fontSize:11, color:C.ink4 })}>{pct}%</span>
                    </span>
                  </div>
                  <div style={{ height:6, background:'#f0efec', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:'100%', background:C.ink7, borderRadius:99, width:`${pct}%` }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ background:C.ink0, border:`0.5px solid ${C.ink2}`, borderRadius:4, padding:'24px 28px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.ink7 }}>学習ログ</div>
          <div style={{ fontSize:11, color:C.ink4 }}>全{sortedLogs.length}件</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column' }}>
          {sortedLogs.length===0 && <div style={{ fontSize:13, color:C.ink4, padding:'24px 0', textAlign:'center' }}>記録がありません。「＋ 記録を追加」から登録してください。</div>}
          {sortedLogs.map(l => (
            <div key={l.id} className="log-row" style={{ display:'flex', alignItems:'center', gap:18, padding:'14px 0', borderBottom:'0.5px solid #f0efec' }}>
              <span style={mono({ fontSize:12, color:C.ink4, flexShrink:0, width:52 })}>{fmtLogDate(l.date)}</span>
              <span style={{ fontSize:11, color:C.ink6, background:C.ink1, border:'0.5px solid #d3d1cc', borderRadius:3, padding:'3px 9px', flexShrink:0, whiteSpace:'nowrap' }}>{subjName(l.subjectId)}</span>
              <span style={{ fontSize:13.5, color:C.ink6, flex:1 }}>{l.topic}</span>
              <span style={mono({ fontSize:13, color:C.ink7, flexShrink:0 })}>{l.hours}h</span>
              <button onClick={() => setLogModal({ log:l })} style={{ background:'none', border:'none', fontSize:11, color:C.ink4, flexShrink:0 }}>編集</button>
              <button onClick={() => setConfirm({ id:l.id, topic:l.topic })} style={{ background:'none', border:'none', fontSize:11, color:C.ink4, flexShrink:0 }}>削除</button>
            </div>
          ))}
        </div>
      </div>

      {logModal && <LogModal state={state} log={logModal.log} onClose={() => setLogModal(null)} onSave={(data) => { dispatch(logModal.new||logModal.date ? { type:'addLog', data } : { type:'editLog', id:logModal.log.id, data }); setLogModal(null); }}/>}
      {confirm && <ConfirmDialog title="記録を削除" message={`「${confirm.topic}」を削除しますか？`} onConfirm={() => dispatch({ type:'delLog', id:confirm.id })} onClose={() => setConfirm(null)}/>}
      {subjMgr && <SubjectManager state={state} dispatch={dispatch} onClose={() => setSubjMgr(false)}/>}
    </div>
  );
}

function LogModal({ state, log, fixedDate, onClose, onSave }) {
  const [date, setDate] = useState(log?.date || fixedDate || todayISO());
  const [subjectId, setSubjectId] = useState(log?.subjectId || (state.subjects[0] && state.subjects[0].id) || '');
  const [topic, setTopic] = useState(log?.topic || '');
  const [hours, setHours] = useState(log ? String(log.hours) : '1.0');
  const hoursNum = parseFloat(hours);
  const valid = date && subjectId && topic.trim() && hoursNum > 0;
  return (
    <Modal title={log ? '記録を編集' : '学習記録を追加'} onClose={onClose}
      footer={<><Btn variant="ghost" onClick={onClose}>キャンセル</Btn><Btn variant="primary" disabled={!valid} style={{ opacity:valid?1:.4 }} onClick={() => valid && onSave({ date, subjectId, topic:topic.trim(), hours:round1(hoursNum) })}>保存</Btn></>}>
      {state.subjects.length===0
        ? <p style={{ fontSize:13, color:C.ink5, lineHeight:1.8 }}>先に「科目を管理」から科目を1つ以上追加してください。</p>
        : <>
            <Field label="日付"><input type="date" style={inputStyle} value={date} onChange={e => setDate(e.target.value)}/></Field>
            <Field label="科目">
              <select style={inputStyle} value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                {state.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="学習内容"><input style={inputStyle} value={topic} onChange={e => setTopic(e.target.value)} placeholder="例：VPC・ネットワーク設計" autoFocus/></Field>
            <Field label="学習時間（h）"><input type="number" step="0.5" min="0" style={inputStyle} value={hours} onChange={e => setHours(e.target.value)}/></Field>
          </>}
    </Modal>
  );
}

function SubjectManager({ state, dispatch, onClose }) {
  const [name, setName] = useState('');
  const usedCount = id => state.logs.filter(l => l.subjectId===id).length;
  return (
    <Modal title="科目を管理" onClose={onClose} footer={<Btn variant="primary" onClick={onClose}>閉じる</Btn>}>
      <div style={{ display:'flex', gap:8, marginBottom:18 }}>
        <input style={{ ...inputStyle, flex:1 }} value={name} onChange={e => setName(e.target.value)} placeholder="新しい科目名" onKeyDown={e => { if(e.key==='Enter'&&name.trim()){ dispatch({ type:'addSubject', name:name.trim() }); setName(''); } }}/>
        <Btn variant="primary" disabled={!name.trim()} style={{ opacity:name.trim()?1:.4 }} onClick={() => { if(name.trim()){ dispatch({ type:'addSubject', name:name.trim() }); setName(''); } }}>追加</Btn>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {state.subjects.length===0 && <div style={{ fontSize:12, color:C.ink3 }}>科目がありません</div>}
        {state.subjects.map(s => (
          <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', border:`0.5px solid ${C.ink2}`, borderRadius:3 }}>
            <input defaultValue={s.name} onBlur={e => { const v=e.target.value.trim(); if(v&&v!==s.name) dispatch({ type:'renameSubject', id:s.id, name:v }); }} style={{ flex:1, border:'none', fontSize:13.5, color:C.ink6, background:'none', fontFamily:'inherit' }}/>
            <span style={{ fontSize:11, color:C.ink4 }}>{usedCount(s.id)}件</span>
            <button onClick={() => dispatch({ type:'delSubject', id:s.id })} style={{ background:'none', border:'none', fontSize:12, color:C.ink4 }} title="削除">×</button>
          </div>
        ))}
      </div>
      <p style={{ fontSize:11, color:C.ink3, marginTop:14, lineHeight:1.7 }}>科目を削除すると、その科目の学習記録も削除されます。名称は直接編集できます。</p>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Settings tab
// ═══════════════════════════════════════════════════════════════════════════
function TabSettings({ state, dispatch, onRestart, onWipe }) {
  const [name, setName] = useState(state.profile.name);
  const [field, setField] = useState(state.profile.field || '');
  const [spec, setSpec] = useState(state.profile.specialty || '');
  const [role, setRole] = useState(state.profile.role || '');
  const [goalTitle, setGoalTitle] = useState(state.goal.title);
  const [goalDate, setGoalDate] = useState(state.goal.targetDate);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const fileRef = useRef(null);
  const fieldObj = findField(field);

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `compass-backup-${todayISO()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }
  function importData(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data && data.version === SCHEMA_VERSION && Array.isArray(data.milestones)) {
          dispatch({ type:'replaceAll', data });
          alert('データを読み込みました。');
        } else alert('対応していないファイル形式です。');
      } catch (err) { alert('ファイルを読み込めませんでした。'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const card = { background:C.ink0, border:`0.5px solid ${C.ink2}`, borderRadius:4, padding:'24px 26px', marginBottom:18 };
  const cardTitle = { fontSize:13, fontWeight:700, color:C.ink7, marginBottom:18 };

  return (
    <div style={{ maxWidth:620 }}>
      <div style={card}>
        <div style={cardTitle}>プロフィール</div>
        <Field label="表示名">
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="例：田中 優一" onBlur={() => dispatch({ type:'setProfile', profile:{ name } })}/>
        </Field>
        <Field label="分野">
          <select style={inputStyle} value={field} onChange={e => { const f=e.target.value; setField(f); setSpec(''); dispatch({ type:'setProfile', profile:{ field:f, specialty:'' } }); }}>
            <option value="">未設定</option>
            {CAREER_TEMPLATES.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </Field>
        {fieldObj && (
          <Field label="領域">
            <select style={inputStyle} value={spec} onChange={e => { const s=e.target.value; setSpec(s); dispatch({ type:'setProfile', profile:{ specialty:s } }); }}>
              <option value="">未設定</option>
              {fieldObj.specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
        )}
        <Field label="現在の立場 / 役割（任意）">
          <select style={inputStyle} value={role} onChange={e => { setRole(e.target.value); dispatch({ type:'setProfile', profile:{ role:e.target.value } }); }}>
            <option value="">未設定</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <div style={{ fontSize:11, color:C.ink3, lineHeight:1.7 }}>分野・領域は、おすすめロードマップの基準や（将来の）キャリア共有のために使われます。ここで変更しても既存のマイルストーンは保持されます。</div>
      </div>

      <div style={card}>
        <div style={cardTitle}>目標</div>
        <Field label="目標タイトル"><input style={inputStyle} value={goalTitle} onChange={e => setGoalTitle(e.target.value)} onBlur={() => dispatch({ type:'setGoal', goal:{ title:goalTitle.trim()||'目標', targetDate:goalDate } })}/></Field>
        <Field label="目標日"><input type="date" style={inputStyle} value={goalDate} onChange={e => { setGoalDate(e.target.value); dispatch({ type:'setGoal', goal:{ title:goalTitle.trim()||'目標', targetDate:e.target.value } }); }}/></Field>
        <div style={{ fontSize:11, color:C.ink4 }}>達成まであと <span style={mono({ color:C.ink7 })}>{daysUntil(goalDate)}</span> 日</div>
      </div>

      <div style={card}>
        <div style={cardTitle}>データ管理</div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:14, flexWrap:'wrap' }}>
            <div><div style={{ fontSize:13, color:C.ink6, marginBottom:3 }}>バックアップを書き出す</div><div style={{ fontSize:11, color:C.ink4 }}>全データをJSONファイルで保存（端末移行用）</div></div>
            <Btn variant="secondary" onClick={exportData}>エクスポート</Btn>
          </div>
          <div style={{ height:0.5, background:C.ink2 }}/>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:14, flexWrap:'wrap' }}>
            <div><div style={{ fontSize:13, color:C.ink6, marginBottom:3 }}>バックアップを読み込む</div><div style={{ fontSize:11, color:C.ink4 }}>現在のデータを上書きします</div></div>
            <Btn variant="secondary" onClick={() => fileRef.current && fileRef.current.click()}>インポート</Btn>
            <input ref={fileRef} type="file" accept="application/json" onChange={importData} style={{ display:'none' }}/>
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={cardTitle}>診断</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:14, flexWrap:'wrap' }}>
          <div><div style={{ fontSize:13, color:C.ink6, marginBottom:3 }}>キャリアタイプを再診断</div><div style={{ fontSize:11, color:C.ink4 }}>学習記録や目標はそのまま保持されます</div></div>
          <Btn variant="secondary" onClick={onRestart}>再診断する</Btn>
        </div>
      </div>

      <div style={{ ...card, borderColor:'rgba(154,59,59,.3)' }}>
        <div style={{ ...cardTitle, color:C.danger }}>すべてのデータを削除</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:14, flexWrap:'wrap' }}>
          <div style={{ fontSize:12, color:C.ink5, lineHeight:1.7 }}>このブラウザに保存されたCompassのデータをすべて消去し、初期状態に戻します。元に戻せません。</div>
          <Btn variant="danger" onClick={() => setConfirmWipe(true)} style={{ flexShrink:0 }}>全消去</Btn>
        </div>
      </div>

      {confirmWipe && <ConfirmDialog title="すべてのデータを削除" message="本当にすべてのデータを削除しますか？この操作は元に戻せません。バックアップが必要な場合は先にエクスポートしてください。" confirmLabel="すべて削除する" onConfirm={onWipe} onClose={() => setConfirmWipe(false)}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Setup wizard — shared step indicator
// ═══════════════════════════════════════════════════════════════════════════
const SETUP_LABELS = ['診断','プロフィール','マイルストーン','ロードマップ'];
function StepDots({ active }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:30, flexWrap:'wrap' }}>
      {SETUP_LABELS.map((l,i) => {
        const n = i+1, on = n===active, done = n<active;
        return (
          <div key={l} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={mono({ width:18, height:18, borderRadius:99, fontSize:9.5, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:on?C.ink7:done?C.ink4:C.ink0, color:(on||done)?C.ink0:C.ink3, border:(on||done)?'none':`0.5px solid ${C.ink3}` })}>{done?'✓':n}</span>
            <span style={{ fontSize:11, color:on?C.ink7:C.ink4, fontWeight:on?700:400, whiteSpace:'nowrap' }}>{l}</span>
            {i<3 && <span style={{ width:14, height:0.5, background:C.ink2 }}/>}
          </div>
        );
      })}
    </div>
  );
}
function backBtn(onBack) {
  return <button onClick={onBack} style={{ background:'none', border:'none', fontSize:12, color:C.ink4, padding:'0 0 20px', display:'flex', alignItems:'center', gap:5 }}>← もどる</button>;
}

// ═══════════════════════════════════════════════════════════════════════════
// Setup — Step 2: Profile
// ═══════════════════════════════════════════════════════════════════════════
function SetupProfile({ state, dispatch, onNext, onBack }) {
  const [name, setName] = useState(state.profile.name || '');
  const [field, setField] = useState(state.profile.field || '');
  const [spec, setSpec] = useState(state.profile.specialty || '');
  const [role, setRole] = useState(state.profile.role || '');
  const [title, setTitle] = useState(state.goal.title || '');
  const [date, setDate] = useState(state.goal.targetDate || todayISO());
  const [goalTouched, setGoalTouched] = useState(!!state.goal.title);

  const fieldObj = findField(field);
  const valid = field && spec && title.trim() && date;

  function pickField(fid) { setField(fid); setSpec(''); }
  function pickSpec(sid) {
    setSpec(sid);
    const s = findSpecialty(field, sid);
    if (s && !goalTouched) setTitle(s.goal);
  }
  function next() {
    if (!valid) return;
    dispatch({ type:'setProfile', profile:{ name, field, specialty:spec, role } });
    dispatch({ type:'setGoal', goal:{ title:title.trim(), targetDate:date } });
    if (`${field}/${spec}` !== state.appliedTemplate) dispatch({ type:'applyTemplate', fieldId:field, specId:spec });
    onNext();
  }

  const chip = (selected) => ({
    padding:'9px 15px', borderRadius:99, fontSize:12.5, cursor:'pointer', whiteSpace:'nowrap',
    background:selected?C.ink7:C.ink0, color:selected?C.ink0:C.ink6,
    border:`0.5px solid ${selected?C.ink7:C.ink3}`, transition:'background .15s,border-color .15s,color .15s',
  });

  return (
    <div className="phase" style={{ maxWidth:560, margin:'0 auto', padding:'48px 24px 72px' }}>
      {backBtn(onBack)}
      <StepDots active={2}/>
      <div style={mono({ fontSize:11, letterSpacing:'.16em', color:C.ink4, marginBottom:14 })}>STEP 2 ／ プロフィール</div>
      <h1 style={{ fontSize:28, lineHeight:1.45, fontWeight:700, color:C.ink7, margin:'0 0 14px' }}>あなたと目標を<br/>教えてください</h1>
      <p style={{ fontSize:14, lineHeight:1.9, color:C.ink5, margin:'0 0 32px' }}>分野と領域を選ぶと、その道のおすすめロードマップ（マイルストーンとタスク）を次のステップに自動で用意します。あとから自由に編集できます。</p>

      <div style={{ background:C.ink0, border:`0.5px solid ${C.ink2}`, borderRadius:4, padding:'26px 24px', marginBottom:32 }}>
        <Field label="表示名（任意）"><input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="例：田中 優一"/></Field>

        <div style={{ marginBottom:16 }}>
          <span style={fieldLabel}>分野</span>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {CAREER_TEMPLATES.map(f => <button key={f.id} className="chip" style={chip(field===f.id)} onClick={() => pickField(f.id)}>{f.name}</button>)}
          </div>
        </div>

        {fieldObj && (
          <div style={{ marginBottom:16 }}>
            <span style={fieldLabel}>領域</span>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {fieldObj.specialties.map(s => <button key={s.id} className="chip" style={chip(spec===s.id)} onClick={() => pickSpec(s.id)}>{s.name}</button>)}
            </div>
          </div>
        )}

        <Field label="現在の立場 / 役割（任意）">
          <select style={inputStyle} value={role} onChange={e => setRole(e.target.value)}>
            <option value="">選択しない</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>

        <Field label="達成したい目標">
          <input style={inputStyle} value={title} onChange={e => { setTitle(e.target.value); setGoalTouched(true); }} placeholder="例：データベーススペシャリスト合格 / TOEIC 900点"/>
        </Field>
        <label style={{ display:'block' }}>
          <span style={fieldLabel}>目標日</span>
          <input type="date" style={inputStyle} value={date} onChange={e => setDate(e.target.value)}/>
        </label>
        {valid && <div style={{ fontSize:11, color:C.ink4, marginTop:14 }}>達成まであと <span style={mono({ color:C.ink7 })}>{daysUntil(date)}</span> 日</div>}
      </div>

      {!field && <div style={{ fontSize:11.5, color:C.ink4, textAlign:'center', marginBottom:14 }}>まず分野と領域を選んでください</div>}
      <Btn variant="primary" disabled={!valid} style={{ width:'100%', padding:16, fontSize:14.5, opacity:valid?1:.4 }} onClick={next}>次へ：マイルストーン設定</Btn>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Setup — Step 3: Milestones
// ═══════════════════════════════════════════════════════════════════════════
function SetupMilestones({ state, dispatch, onNext, onBack }) {
  const [edit, setEdit] = useState(null);   // {milestone} | {new:true}
  const [confirm, setConfirm] = useState(null);
  const [reapply, setReapply] = useState(false);
  const ms = state.milestones;
  const valid = ms.length > 0;
  const tmplName = specLabel(state.profile.field, state.profile.specialty);
  return (
    <div className="phase" style={{ maxWidth:620, margin:'0 auto', padding:'48px 24px 72px' }}>
      {backBtn(onBack)}
      <StepDots active={3}/>
      <div style={mono({ fontSize:11, letterSpacing:'.16em', color:C.ink4, marginBottom:14 })}>STEP 3 ／ マイルストーン設定</div>
      <h1 style={{ fontSize:28, lineHeight:1.45, fontWeight:700, color:C.ink7, margin:'0 0 14px' }}>目標までの段階を<br/>決めましょう</h1>
      <p style={{ fontSize:14, lineHeight:1.9, color:C.ink5, margin:'0 0 24px' }}>
        「{state.goal.title || '目標'}」を達成するまでの大きな段階を、<strong style={{ color:C.ink6 }}>基盤（上）から頂点（下）</strong>の順に並べます。自由に編集・並べ替え・追加できます。
      </p>

      {tmplName && (
        <div style={{ display:'flex', alignItems:'center', gap:12, background:C.accentLight, border:`0.5px solid ${C.accent}33`, borderRadius:4, padding:'12px 16px', marginBottom:24 }}>
          <span style={{ fontSize:12, color:C.ink6, flex:1, lineHeight:1.6 }}><strong style={{ color:C.accent }}>{tmplName}</strong> のおすすめ構成です。</span>
          <button onClick={() => setReapply(true)} style={{ background:C.ink0, border:`0.5px solid ${C.ink3}`, borderRadius:3, fontSize:11.5, color:C.ink5, padding:'6px 12px', whiteSpace:'nowrap' }}>おすすめを再適用</button>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:18 }}>
        {ms.map((m,i) => (
          <div key={m.id} style={{ display:'flex', alignItems:'center', gap:14, background:C.ink0, border:`0.5px solid ${C.ink2}`, borderRadius:4, padding:'16px 18px' }}>
            <span style={mono({ fontSize:13, color:C.ink4, flexShrink:0, width:22 })}>{pad2(i+1)}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.ink7 }}>{m.name}</div>
              {m.period && <div style={mono({ fontSize:11, color:C.ink4, marginTop:3 })}>{m.period}</div>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
              <button className="icon-btn" onClick={() => dispatch({ type:'moveMs', id:m.id, dir:'up' })} disabled={i===0} style={{ background:'none', border:`0.5px solid ${C.ink2}`, borderRadius:3, padding:'4px 8px', fontSize:11, color:i===0?C.ink3:C.ink5, opacity:i===0?.4:1 }}>↑</button>
              <button className="icon-btn" onClick={() => dispatch({ type:'moveMs', id:m.id, dir:'down' })} disabled={i===ms.length-1} style={{ background:'none', border:`0.5px solid ${C.ink2}`, borderRadius:3, padding:'4px 8px', fontSize:11, color:i===ms.length-1?C.ink3:C.ink5, opacity:i===ms.length-1?.4:1 }}>↓</button>
              <IconBtn label="編集" onClick={() => setEdit({ milestone:m })}/>
              <IconBtn label="削除" danger onClick={() => setConfirm({ id:m.id, name:m.name })}/>
            </div>
          </div>
        ))}
        {ms.length===0 && <div style={{ fontSize:13, color:C.ink4, padding:'24px 0', textAlign:'center' }}>段階がありません。下のボタンから追加してください。</div>}
      </div>

      <button onClick={() => setEdit({ new:true })} style={{ width:'100%', background:'none', border:`0.5px dashed ${C.ink3}`, borderRadius:4, fontSize:13, color:C.ink5, padding:'13px', marginBottom:34 }}>＋ 段階を追加</button>

      <div style={{ display:'flex', gap:10 }}>
        <Btn variant="secondary" onClick={onBack} style={{ flex:'0 0 auto', padding:'16px 22px' }}>戻る</Btn>
        <Btn variant="primary" disabled={!valid} style={{ flex:1, padding:16, fontSize:14.5, opacity:valid?1:.4 }} onClick={() => valid && onNext()}>次へ：ロードマップ設定</Btn>
      </div>

      {edit && <MilestoneModal milestone={edit.milestone} onClose={() => setEdit(null)} onSave={(data) => { dispatch(edit.new ? { type:'addMs', data } : { type:'editMs', id:edit.milestone.id, data }); setEdit(null); }}/>}
      {confirm && <ConfirmDialog title="段階を削除" message={`「${confirm.name}」を削除しますか？`} onConfirm={() => dispatch({ type:'delMs', id:confirm.id })} onClose={() => setConfirm(null)}/>}
      {reapply && <ConfirmDialog title="おすすめを再適用" message={`「${tmplName}」のおすすめマイルストーンとタスクで、現在の内容を置き換えます。編集した内容は失われます。よろしいですか？`} confirmLabel="再適用する" onConfirm={() => dispatch({ type:'applyTemplate', fieldId:state.profile.field, specId:state.profile.specialty })} onClose={() => setReapply(false)}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Setup — Step 4: Roadmap (tasks per milestone)
// ═══════════════════════════════════════════════════════════════════════════
function SetupRoadmap({ state, dispatch, onComplete, onBack }) {
  const [taskEdit, setTaskEdit] = useState(null); // {msId, task} | {msId, new:true}
  const ms = state.milestones;
  const totalTasks = ms.reduce((a,m) => a + m.tasks.length, 0);
  return (
    <div className="phase" style={{ maxWidth:680, margin:'0 auto', padding:'48px 24px 72px' }}>
      {backBtn(onBack)}
      <StepDots active={4}/>
      <div style={mono({ fontSize:11, letterSpacing:'.16em', color:C.ink4, marginBottom:14 })}>STEP 4 ／ ロードマップ設定</div>
      <h1 style={{ fontSize:28, lineHeight:1.45, fontWeight:700, color:C.ink7, margin:'0 0 14px' }}>各段階にタスクを<br/>追加しましょう</h1>
      <p style={{ fontSize:14, lineHeight:1.9, color:C.ink5, margin:'0 0 28px' }}>段階ごとに、具体的にやることを書き出します。タスクはあとからいつでも追加・編集できます。空のままでも始められます。</p>

      <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:34 }}>
        {ms.map((m,i) => (
          <div key={m.id} style={{ background:C.ink0, border:`0.5px solid ${C.ink2}`, borderRadius:4, padding:'20px 22px' }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:14 }}>
              <span style={mono({ fontSize:12, color:C.ink4 })}>{pad2(i+1)}</span>
              <span style={{ fontSize:14.5, fontWeight:700, color:C.ink7 }}>{m.name}</span>
              <span style={{ fontSize:11, color:C.ink4, marginLeft:'auto' }}>{m.tasks.length}件</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {m.tasks.map(t => (
                <div key={t.id} className="task-row" style={{ display:'flex', alignItems:'center', gap:11 }}>
                  <span style={TASK_DOT.todo}/>
                  <span style={{ ...TASK_TEXT.todo, flex:1 }}>{t.label}</span>
                  <button onClick={() => setTaskEdit({ msId:m.id, task:t })} style={{ background:'none', border:'none', fontSize:11, color:C.ink4 }}>編集</button>
                  <button onClick={() => dispatch({ type:'delTask', msId:m.id, taskId:t.id })} style={{ background:'none', border:'none', fontSize:11, color:C.ink4 }}>×</button>
                </div>
              ))}
            </div>
            <button onClick={() => setTaskEdit({ msId:m.id, new:true })} style={{ alignSelf:'flex-start', marginTop:m.tasks.length?12:0, background:'none', border:`0.5px dashed ${C.ink3}`, borderRadius:3, fontSize:12, color:C.ink4, padding:'7px 13px' }}>＋ タスクを追加</button>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <Btn variant="secondary" onClick={onBack} style={{ flex:'0 0 auto', padding:'16px 22px' }}>戻る</Btn>
        <Btn variant="primary" style={{ flex:1, padding:16, fontSize:14.5 }} onClick={onComplete}>完了して始める{totalTasks>0?`（${totalTasks}タスク）`:''}</Btn>
      </div>

      {taskEdit && <TaskModal task={taskEdit.task} onClose={() => setTaskEdit(null)} onSave={(label) => { dispatch(taskEdit.new ? { type:'addTask', msId:taskEdit.msId, label } : { type:'editTask', msId:taskEdit.msId, taskId:taskEdit.task.id, label }); setTaskEdit(null); }}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Dashboard shell
// ═══════════════════════════════════════════════════════════════════════════
function Dashboard({ state, stats, dispatch, onRestart, onWipe }) {
  const [tab, setTab] = useState('dashboard');
  const days = daysUntil(state.goal.targetDate);
  const typeName = (state.diagnosis.resultType || 'T') + '型キャリア';
  const TABS = [
    { key:'dashboard', label:'ダッシュボード' },
    { key:'roadmap',   label:'ロードマップ' },
    { key:'calendar',  label:'カレンダー' },
    { key:'log',       label:'学習記録' },
    { key:'settings',  label:'設定' },
  ];
  const tabBase = { padding:'12px 2px', fontSize:13.5, background:'none', border:'none', marginBottom:-0.5, transition:'color .15s' };

  return (
    <div className="phase" style={{ maxWidth:1080, margin:'0 auto', padding:'36px 24px 80px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:24, marginBottom:28, flexWrap:'wrap' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:13, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, letterSpacing:'.06em', color:C.ink0, background:C.ink7, padding:'4px 11px', borderRadius:3 }}>{typeName}</span>
            {specLabel(state.profile.field, state.profile.specialty) && <span style={{ fontSize:11, color:C.ink5, background:C.ink1, border:`0.5px solid ${C.ink2}`, padding:'4px 10px', borderRadius:3 }}>{specLabel(state.profile.field, state.profile.specialty)}</span>}
            {state.profile.name && <span style={{ fontSize:12, color:C.ink4 }}>{state.profile.name} さん</span>}
          </div>
          <h1 style={{ fontSize:26, fontWeight:700, color:C.ink7, letterSpacing:'.01em' }}>目標：{state.goal.title}</h1>
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <div style={{ fontSize:11, color:C.ink4, marginBottom:3 }}>目標達成まで</div>
          <div style={mono({ color:C.ink7, lineHeight:1 })}>
            <span style={{ fontSize:46, fontWeight:500 }}>{days}</span>
            <span style={{ fontSize:15, marginLeft:5 }}>日</span>
          </div>
          <div style={{ fontSize:11, color:C.ink4, marginTop:5 }}>{fmtFull(state.goal.targetDate)}</div>
        </div>
      </div>

      <div className="tab-nav" style={{ display:'flex', gap:30, borderBottom:`0.5px solid ${C.ink3}`, marginBottom:32, overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t.key} className="tab-btn" onClick={() => setTab(t.key)}
            style={{ ...tabBase, fontWeight:tab===t.key?500:400, color:tab===t.key?C.ink7:C.ink4, borderBottom:tab===t.key?`1.5px solid ${C.ink7}`:'1.5px solid transparent', whiteSpace:'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div key={tab} className="tab-content">
        {tab==='dashboard' && <TabDashboard state={state} stats={stats} onToggleTask={(msId,taskId) => dispatch({ type:'toggleTask', msId, taskId })}/>}
        {tab==='roadmap'   && <TabRoadmap state={state} stats={stats} dispatch={dispatch}/>}
        {tab==='calendar'  && <TabCalendar state={state} stats={stats} dispatch={dispatch}/>}
        {tab==='log'       && <TabLog state={state} stats={stats} dispatch={dispatch}/>}
        {tab==='settings'  && <TabSettings state={state} dispatch={dispatch} onRestart={onRestart} onWipe={onWipe}/>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// reducer
// ═══════════════════════════════════════════════════════════════════════════
function reducer(state, action) {
  switch (action.type) {
    case 'answer':
      return { ...state, diagnosis: { ...state.diagnosis, answers: { ...state.diagnosis.answers, [action.qid]: action.idx } } };
    case 'finishDiagnosis':
      return { ...state, diagnosis: { ...state.diagnosis, resultType: calcResultType(state.diagnosis.answers) } };
    case 'completeOnboarding':
      return { ...state, onboarded: true, setupStep: 'welcome', diagnosis: { ...state.diagnosis, resultType: state.diagnosis.resultType || calcResultType(state.diagnosis.answers) } };
    case 'setSetupStep':
      return { ...state, setupStep: action.step };
    case 'skipDiagnosis':
      return { ...state, setupStep: 'profile', diagnosis: { answers:{}, resultType: state.diagnosis.resultType || 'T' } };
    case 'restartDiagnosis':
      return { ...state, onboarded: false, setupStep: 'welcome', diagnosis: { answers:{}, resultType:null } };
    case 'moveMs': {
      const idx = state.milestones.findIndex(m => m.id === action.id);
      const ni = idx + (action.dir === 'up' ? -1 : 1);
      if (idx < 0 || ni < 0 || ni >= state.milestones.length) return state;
      const arr = state.milestones.slice();
      const [it] = arr.splice(idx, 1);
      arr.splice(ni, 0, it);
      return { ...state, milestones: arr };
    }
    case 'setProfile':
      return { ...state, profile: { ...state.profile, ...action.profile } };
    case 'applyTemplate': {
      const spec = findSpecialty(action.fieldId, action.specId);
      if (!spec) return state;
      return { ...state, milestones: instantiateMilestones(spec.milestones), appliedTemplate: `${action.fieldId}/${action.specId}` };
    }
    case 'setGoal':
      return { ...state, goal: action.goal };
    case 'toggleTask':
      return { ...state, milestones: state.milestones.map(m => m.id!==action.msId ? m : { ...m, tasks: m.tasks.map(t => t.id!==action.taskId ? t : { ...t, done: !t.done }) }) };
    case 'addMs':
      return { ...state, milestones: [...state.milestones, { id:uid(), name:action.data.name, period:action.data.period, tasks:[] }] };
    case 'editMs':
      return { ...state, milestones: state.milestones.map(m => m.id!==action.id ? m : { ...m, name:action.data.name, period:action.data.period }) };
    case 'delMs':
      return { ...state, milestones: state.milestones.filter(m => m.id!==action.id) };
    case 'addTask':
      return { ...state, milestones: state.milestones.map(m => m.id!==action.msId ? m : { ...m, tasks:[...m.tasks, { id:uid(), label:action.label, done:false }] }) };
    case 'editTask':
      return { ...state, milestones: state.milestones.map(m => m.id!==action.msId ? m : { ...m, tasks: m.tasks.map(t => t.id!==action.taskId ? t : { ...t, label:action.label }) }) };
    case 'delTask':
      return { ...state, milestones: state.milestones.map(m => m.id!==action.msId ? m : { ...m, tasks: m.tasks.filter(t => t.id!==action.taskId) }) };
    case 'addSubject':
      return { ...state, subjects: [...state.subjects, { id:uid(), name:action.name }] };
    case 'renameSubject':
      return { ...state, subjects: state.subjects.map(s => s.id!==action.id ? s : { ...s, name:action.name }) };
    case 'delSubject':
      return { ...state, subjects: state.subjects.filter(s => s.id!==action.id), logs: state.logs.filter(l => l.subjectId!==action.id) };
    case 'addLog':
      return { ...state, logs: [...state.logs, { id:uid(), ...action.data }] };
    case 'editLog':
      return { ...state, logs: state.logs.map(l => l.id!==action.id ? l : { ...l, ...action.data }) };
    case 'delLog':
      return { ...state, logs: state.logs.filter(l => l.id!==action.id) };
    case 'addEvent':
      return { ...state, events: [...state.events, { id:uid(), ...action.data }] };
    case 'editEvent':
      return { ...state, events: state.events.map(e => e.id!==action.id ? e : { ...e, ...action.data }) };
    case 'delEvent':
      return { ...state, events: state.events.filter(e => e.id!==action.id) };
    case 'replaceAll':
      return action.data;
    default:
      return state;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// App root
// ═══════════════════════════════════════════════════════════════════════════
function App() {
  const [state, setState] = useState(() => loadState() || makeSeed());
  const dispatch = action => setState(prev => reducer(prev, action));

  useEffect(() => { saveState(state); }, [state]);

  const stats = useMemo(() => computeStats(state), [state]);

  const step = state.setupStep || 'welcome';
  function setStep(s) { dispatch({ type:'setSetupStep', step:s }); window.scrollTo(0,0); }
  function handleWipe() { setState(makeSeed()); window.scrollTo(0,0); }
  function handleRestart() { dispatch({ type:'restartDiagnosis' }); window.scrollTo(0,0); }

  let body;
  if (!state.onboarded) {
    if (step === 'qa')
      body = <PhaseQa answers={state.diagnosis.answers} onAnswer={(qid,idx) => dispatch({ type:'answer', qid, idx })} onBack={() => setStep('welcome')} onFinish={() => { dispatch({ type:'finishDiagnosis' }); setStep('result'); }}/>;
    else if (step === 'result')
      body = <PhaseResult answers={state.diagnosis.answers} onNext={() => setStep('profile')} onRestart={() => { dispatch({ type:'restartDiagnosis' }); window.scrollTo(0,0); }} onBack={() => setStep('qa')}/>;
    else if (step === 'profile')
      body = <SetupProfile state={state} dispatch={dispatch} onNext={() => setStep('milestones')} onBack={() => setStep('result')}/>;
    else if (step === 'milestones')
      body = <SetupMilestones state={state} dispatch={dispatch} onNext={() => setStep('roadmap')} onBack={() => setStep('profile')}/>;
    else if (step === 'roadmap')
      body = <SetupRoadmap state={state} dispatch={dispatch} onComplete={() => { dispatch({ type:'completeOnboarding' }); window.scrollTo(0,0); }} onBack={() => setStep('milestones')}/>;
    else
      body = <PhaseWelcome onStart={() => setStep('qa')} onSkip={() => { dispatch({ type:'skipDiagnosis' }); window.scrollTo(0,0); }}/>;
  } else {
    body = <Dashboard state={state} stats={stats} dispatch={dispatch} onRestart={handleRestart} onWipe={handleWipe}/>;
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'#f5f5f4' }}>
      <TopBar/>
      <main style={{ flex:1 }}>{body}</main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
