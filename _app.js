const {
  useState,
  useEffect
} = React;

// ─── design tokens ───────────────────────────────────────────────────────────
const C = {
  ink7: '#141413',
  ink6: '#2c2b28',
  ink5: '#525048',
  ink4: '#8f8d88',
  ink3: '#c9c7c2',
  ink2: '#e8e7e4',
  ink1: '#f5f5f4',
  ink0: '#ffffff',
  accent: '#b87333',
  accentLight: '#f5ede3'
};

// ─── static data ─────────────────────────────────────────────────────────────
const CHIPS = [{
  shape: 'T',
  name: 'T型',
  tag: '専門 × 幅広知識',
  desc: '専門軸を持ちながら幅広く動く'
}, {
  shape: 'I',
  name: 'I型',
  tag: '深いスペシャリスト',
  desc: '一点を徹底的に掘り下げる'
}, {
  shape: 'π',
  name: 'π型',
  tag: '複数専門 × 統合力',
  desc: '2つの専門軸を掛け合わせる'
}, {
  shape: 'H',
  name: 'H型',
  tag: '橋渡しの才能',
  desc: '領域間をつなぐ調整力'
}, {
  shape: '━',
  name: '━型',
  tag: '広域マネジメント',
  desc: '幅広い視野で統率する'
}];
const QUESTIONS = [{
  id: 'q1',
  page: 0,
  title: '仕事でやりがいを感じる瞬間は？',
  opts: ['専門分野を深く突き詰められたとき', '異なる領域の知識をつないで課題を解いたとき', 'チームの橋渡しをして全体が前進したとき', '幅広い領域を俯瞰してマネジメントできたとき']
}, {
  id: 'q2',
  page: 0,
  title: '3年後にありたい姿は？',
  opts: ['第一人者と認められる専門家', '複数領域をまたぐπ型人材', '専門を軸に幅広く動くT型人材', '組織を率いるマネージャー']
}, {
  id: 'q3',
  page: 1,
  title: '自分に合う学習スタイルは？',
  opts: ['一つのテーマをとことん掘り下げる', '関連領域を横断的に学ぶ', '実務を通して手を動かして学ぶ', '人との対話から学び、深める']
}, {
  id: 'q4',
  page: 1,
  title: 'チームで自然と担うポジションは？',
  opts: ['専門を担う実務の中核', '領域間をつなぐ調整役', '全体を見渡す推進役', '新しい領域を開拓する役']
}];
const TM = {
  q1: ['I', 'T', 'H', '━'],
  q2: ['I', 'π', 'T', '━'],
  q3: ['I', 'π', 'T', 'H'],
  q4: ['I', 'H', '━', 'π']
};
const SCORES_BY_TYPE = {
  'T': [{
    name: '専門深度',
    v: 82
  }, {
    name: '横断力',
    v: 74
  }, {
    name: '学習力',
    v: 78
  }, {
    name: '実行力',
    v: 60
  }, {
    name: '発信力',
    v: 45
  }],
  'I': [{
    name: '専門深度',
    v: 95
  }, {
    name: '横断力',
    v: 38
  }, {
    name: '学習力',
    v: 86
  }, {
    name: '実行力',
    v: 68
  }, {
    name: '発信力',
    v: 50
  }],
  'π': [{
    name: '専門深度',
    v: 80
  }, {
    name: '横断力',
    v: 88
  }, {
    name: '学習力',
    v: 82
  }, {
    name: '実行力',
    v: 62
  }, {
    name: '発信力',
    v: 58
  }],
  'H': [{
    name: '専門深度',
    v: 55
  }, {
    name: '横断力',
    v: 84
  }, {
    name: '学習力',
    v: 68
  }, {
    name: '実行力',
    v: 76
  }, {
    name: '発信力',
    v: 82
  }],
  '━': [{
    name: '専門深度',
    v: 62
  }, {
    name: '横断力',
    v: 78
  }, {
    name: '学習力',
    v: 58
  }, {
    name: '実行力',
    v: 90
  }, {
    name: '発信力',
    v: 70
  }]
};
const TYPE_RESULTS = {
  'T': {
    label: 'T型キャリア',
    title: 'あなたは「T型」タイプ',
    desc: '一つの専門性を軸に、幅広い知識を掛け合わせて価値を生むタイプ。PMへの転職と相性の良いキャリアタイプです。',
    keywords: ['応用力', '専門×幅広', 'PM適性◎']
  },
  'I': {
    label: 'I型キャリア',
    title: 'あなたは「I型」タイプ',
    desc: '一つの領域を深く掘り下げ、圧倒的な専門深度で勝負するタイプ。特定領域の第一人者を目指しましょう。',
    keywords: ['専門深度', '一点突破', '第一人者']
  },
  'π': {
    label: 'π型キャリア',
    title: 'あなたは「π型」タイプ',
    desc: '2つの専門軸を統合して独自の価値を生み出すタイプ。掛け合わせの強みでPMキャリアも十分狙えます。',
    keywords: ['2軸統合', '掛け合わせ', '独自価値']
  },
  'H': {
    label: 'H型キャリア',
    title: 'あなたは「H型」タイプ',
    desc: '組織やチームをつなぐ橋渡し力が強みのタイプ。調整力とコミュニケーション力でPMとして活躍できます。',
    keywords: ['橋渡し力', '調整力', '共感力']
  },
  '━': {
    label: '━型キャリア',
    title: 'あなたは「━型」タイプ',
    desc: '幅広い視野で組織を率いる統率力が強みのタイプ。マネジメントを軸にキャリアを積み上げましょう。',
    keywords: ['統率力', '俯瞰思考', '組織牽引']
  }
};
const TYPE_MATCHES = {
  'T': {
    'T': 91,
    'π': 68,
    'H': 52,
    'I': 45,
    '━': 38
  },
  'I': {
    'I': 91,
    'T': 72,
    'π': 58,
    'H': 45,
    '━': 38
  },
  'π': {
    'π': 91,
    'T': 75,
    'I': 60,
    'H': 50,
    '━': 42
  },
  'H': {
    'H': 91,
    'π': 68,
    'T': 62,
    '━': 52,
    'I': 38
  },
  '━': {
    '━': 91,
    'H': 72,
    'π': 65,
    'T': 52,
    'I': 38
  }
};
const ALL_TYPES = [{
  name: 'T型',
  tag: '専門 × 幅広知識',
  desc: '専門軸を持ちながら隣接領域を広げ、応用力で価値を生む。PMへの転職と最相性◎',
  key: 'T'
}, {
  name: 'π型',
  tag: '複数専門 × 統合力',
  desc: '2軸の専門を掛け合わせ、独自の視点と統合力で突破する。',
  key: 'π'
}, {
  name: 'H型',
  tag: '橋渡しの才能',
  desc: '組織・チームを横断してつなぐコミュニケーション力に長ける。',
  key: 'H'
}, {
  name: 'I型',
  tag: '深いスペシャリスト',
  desc: '一点を徹底的に掘り下げ、専門深度で圧倒的な価値を生む。',
  key: 'I'
}, {
  name: '━型',
  tag: '広域マネジメント',
  desc: '幅広い視野と俯瞰力で組織・事業を率いるリーダー型。',
  key: '━'
}];
const MILESTONES = [{
  name: '自己分析・キャリアタイプ診断',
  status: '完了',
  progress: 100,
  period: '2025.09',
  tasks: [{
    label: '価値観の棚卸し',
    state: 'done'
  }, {
    label: 'キャリアタイプ診断',
    state: 'done'
  }, {
    label: '強み・弱みの整理',
    state: 'done'
  }]
}, {
  name: '業界知識・人脈形成',
  status: '完了',
  progress: 100,
  period: '2025.10 – 2025.12',
  tasks: [{
    label: '業界研究レポート作成',
    state: 'done'
  }, {
    label: '勉強会・イベント参加 ×3',
    state: 'done'
  }, {
    label: 'メンター獲得',
    state: 'done'
  }]
}, {
  name: '資格取得・スキル証明',
  status: '進行中',
  progress: 45,
  period: '2026.01 – 2026.06',
  tasks: [{
    label: 'AWS SAA 認定取得',
    state: 'done'
  }, {
    label: 'PMP 試験対策',
    state: 'current'
  }, {
    label: 'TOEIC 800点',
    state: 'todo'
  }]
}, {
  name: '転職活動・書類／面接',
  status: '未着手',
  progress: 0,
  period: '2026.07 – 2026.09',
  tasks: [{
    label: '職務経歴書・レジュメ作成',
    state: 'todo'
  }, {
    label: 'ポートフォリオ整備',
    state: 'todo'
  }, {
    label: '模擬面接 ×5',
    state: 'todo'
  }]
}, {
  name: 'PM転職・内定獲得',
  status: '未着手',
  progress: 0,
  period: '2026.10 –',
  tasks: [{
    label: '企業エントリー',
    state: 'todo'
  }, {
    label: '選考・面接',
    state: 'todo'
  }, {
    label: '内定獲得・意思決定',
    state: 'todo'
  }]
}];
const TIMELINE = [{
  name: '自己分析・キャリアタイプ診断',
  status: '完了'
}, {
  name: '業界知識・人脈形成',
  status: '完了'
}, {
  name: '資格取得・スキル証明',
  status: '進行中'
}, {
  name: '転職活動・書類／面接',
  status: '未着手'
}, {
  name: 'PM転職・内定獲得',
  status: '未着手'
}];
const ROADMAP_STEPS = [{
  step: '01',
  title: '資格取得でスキルを可視化',
  desc: 'AWS認定・PM関連資格を取得し、専門性を客観的に証明する。'
}, {
  step: '02',
  title: '業界知識と転職の準備',
  desc: '志望業界を絞り込み、職務経歴書とポートフォリオを整える。'
}, {
  step: '03',
  title: 'PM内定を獲得',
  desc: '面接対策を重ね、目標ポジションでの内定獲得を目指す。'
}];
const HEAT = [{
  subject: 'AWS',
  cells: [2, 3, 1, 0, 2, 3]
}, {
  subject: '英語',
  cells: [1, 1, 2, 2, 1, 0]
}, {
  subject: 'PM',
  cells: [0, 2, 3, 1, 2, 1]
}];
const LOGS = [{
  date: '06 / 19',
  subject: 'AWS',
  topic: 'VPC・ネットワーク設計',
  hours: '2.5h'
}, {
  date: '06 / 18',
  subject: 'PM',
  topic: 'アジャイル開発の基礎',
  hours: '1.5h'
}, {
  date: '06 / 17',
  subject: '英語',
  topic: 'ビジネス英会話 ロールプレイ',
  hours: '1.0h'
}, {
  date: '06 / 16',
  subject: 'AWS',
  topic: 'IAM・セキュリティ設計',
  hours: '2.0h'
}, {
  date: '06 / 15',
  subject: 'PM',
  topic: '要件定義の進め方',
  hours: '1.5h'
}, {
  date: '06 / 14',
  subject: 'AWS',
  topic: 'EC2・オートスケーリング',
  hours: '2.0h'
}, {
  date: '06 / 12',
  subject: '英語',
  topic: '技術ドキュメント読解',
  hours: '1.0h'
}];
const EVENTS = [{
  date: '06 / 25',
  wd: '水',
  label: 'AWS SAA 模擬試験',
  subject: 'AWS'
}, {
  date: '06 / 28',
  wd: '土',
  label: 'PM勉強会 #12 登壇',
  subject: 'PM'
}, {
  date: '07 / 02',
  wd: '木',
  label: 'メンター面談',
  subject: '面談'
}, {
  date: '07 / 10',
  wd: '金',
  label: '職務経歴書ドラフト締切',
  subject: '転職'
}];
const HOURS_BY_DAY = {
  2: 2,
  4: 1.5,
  5: 3,
  8: 2,
  9: 1,
  11: 2.5,
  12: 3,
  15: 1.5,
  16: 2,
  18: 1,
  19: 2.5,
  21: 3,
  23: 2,
  24: 1.5,
  26: 2.5
};
const WEEK = [{
  d: '月',
  h: 2.5
}, {
  d: '火',
  h: 3
}, {
  d: '水',
  h: 1.5
}, {
  d: '木',
  h: 0
}, {
  d: '金',
  h: 2
}, {
  d: '土',
  h: 3
}, {
  d: '日',
  h: 1.5
}];
const SUBJ_TOTALS = [{
  name: 'AWS',
  h: 64
}, {
  name: 'PM',
  h: 46
}, {
  name: '英語',
  h: 32
}];

// ─── utility helpers ──────────────────────────────────────────────────────────
function mono(extra = {}) {
  return {
    fontFamily: "'Roboto Mono',monospace",
    ...extra
  };
}
function daysUntil(year, month, day) {
  return Math.max(0, Math.ceil((new Date(year, month - 1, day) - new Date()) / 86400000));
}
function calcResultType(answers) {
  const scores = {
    T: 0,
    I: 0,
    'π': 0,
    H: 0,
    '━': 0
  };
  Object.entries(answers).forEach(([qid, idx]) => {
    const t = TM[qid]?.[idx];
    if (t && scores.hasOwnProperty(t)) scores[t]++;
  });
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

// ─── TopBar ──────────────────────────────────────────────────────────────────
function TopBar() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 52,
      background: C.ink7,
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 11,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 13,
      height: 13,
      border: `1.5px solid ${C.ink0}`,
      borderRadius: 99,
      display: 'inline-block'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.ink0,
      fontSize: 13,
      letterSpacing: '.24em',
      fontWeight: 500
    }
  }, "COMPASS"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.ink5,
      fontSize: 11,
      letterSpacing: '.05em'
    }
  }, "キャリアプラン"));
}

// ─── Phase 1: Welcome ─────────────────────────────────────────────────────────
function PhaseWelcome({
  onStart
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "phase",
    style: {
      maxWidth: 560,
      margin: '0 auto',
      padding: '56px 24px 72px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 9,
      marginBottom: 40
    }
  }, [true, false, false, false].map((on, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 7,
      height: 7,
      borderRadius: 99,
      background: on ? C.ink7 : C.ink0,
      border: on ? 'none' : `0.5px solid ${C.ink3}`
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(),
      fontSize: 11,
      letterSpacing: '.16em',
      color: C.ink4,
      marginBottom: 14
    }
  }, "STEP 1 ／ キャリアタイプ診断"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30,
      lineHeight: 1.45,
      fontWeight: 700,
      color: C.ink7,
      margin: '0 0 16px'
    }
  }, "5分で、あなたの", /*#__PURE__*/React.createElement("br", null), "キャリアタイプを診断"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      lineHeight: 1.9,
      color: C.ink5,
      margin: '0 0 28px'
    }
  }, "4つの質問に答えるだけ。あなたの強みのかたちを見極め、目標に向けた最適なロードマップを提案します。"), /*#__PURE__*/React.createElement("div", {
    className: "welcome-steps",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      margin: '0 0 36px',
      border: `0.5px solid ${C.ink2}`,
      borderRadius: 4,
      overflow: 'hidden',
      background: C.ink0
    }
  }, [{
    n: '01',
    title: '4問に答える',
    sub: 'やりがい・ビジョン・\n学習スタイル'
  }, {
    n: '02',
    title: 'タイプ判定',
    sub: '5分類から\nあなたの型を特定'
  }, {
    n: '03',
    title: 'ロードマップ',
    sub: '目標への\n最適ルートを提案'
  }].map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: '18px 16px',
      textAlign: 'center',
      borderRight: i < 2 ? `0.5px solid ${C.ink2}` : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(),
      fontSize: 11,
      color: C.accent,
      marginBottom: 9
    }
  }, s.n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: C.ink7,
      marginBottom: 5
    }
  }, s.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.ink4,
      lineHeight: 1.65,
      whiteSpace: 'pre-line'
    }
  }, s.sub)))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(),
      fontSize: 10,
      letterSpacing: '.14em',
      color: C.ink4,
      marginBottom: 14
    }
  }, "診断タイプ ／ 5 TYPES"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginBottom: 40
    }
  }, CHIPS.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.name,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '13px 18px',
      background: C.ink0,
      border: `0.5px solid ${C.ink2}`,
      borderRadius: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(),
      fontSize: 18,
      fontWeight: 700,
      color: C.ink7,
      flexShrink: 0,
      width: 22,
      textAlign: 'center',
      lineHeight: 1
    }
  }, c.shape), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: C.ink6
    }
  }, c.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.ink4,
      marginTop: 2
    }
  }, c.desc)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.ink3,
      whiteSpace: 'nowrap'
    }
  }, c.tag)))), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: onStart,
    style: {
      width: '100%',
      padding: 17,
      background: C.ink7,
      color: C.ink0,
      border: 'none',
      borderRadius: 3,
      fontSize: 14.5,
      fontWeight: 500,
      letterSpacing: '.06em'
    }
  }, "診断をはじめる"));
}

// ─── Phase 2: Q&A ────────────────────────────────────────────────────────────
function PhaseQa({
  answers,
  onAnswer,
  onBack,
  onFinish
}) {
  const [page, setPage] = useState(0);
  const pageQs = QUESTIONS.filter(q => q.page === page);
  const canAdvance = pageQs.every(q => answers[q.id] !== undefined);
  const answered = QUESTIONS.filter(q => answers[q.id] !== undefined).length;
  const progressPct = answered / 4 * 100 + '%';
  function advance() {
    if (!canAdvance) return;
    if (page === 0) {
      setPage(1);
      window.scrollTo(0, 0);
    } else {
      onFinish();
    }
  }
  function goBack() {
    if (page === 1) {
      setPage(0);
      window.scrollTo(0, 0);
    } else onBack();
  }
  const optBase = {
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    width: '100%',
    textAlign: 'left',
    padding: '17px 18px',
    background: C.ink0,
    border: `0.5px solid ${C.ink3}`,
    borderRadius: 3,
    fontSize: 14,
    lineHeight: 1.5,
    color: C.ink6,
    transition: 'background .15s,border-color .15s,color .15s'
  };
  const optSel = {
    ...optBase,
    background: C.ink7,
    border: `0.5px solid ${C.ink7}`,
    color: C.ink0
  };
  const labBase = {
    ...mono(),
    fontSize: 11,
    flexShrink: 0,
    width: 24,
    height: 24,
    borderRadius: 99,
    border: `0.5px solid ${C.ink3}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: C.ink4
  };
  const labSel = {
    ...labBase,
    border: '0.5px solid rgba(255,255,255,.6)',
    color: C.ink0
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "phase",
    style: {
      maxWidth: 580,
      margin: '0 auto',
      padding: '36px 24px 72px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: goBack,
    style: {
      background: 'none',
      border: 'none',
      fontSize: 12,
      color: C.ink4,
      padding: '0 0 22px',
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, "← もどる"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 11
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(),
      fontSize: 11,
      letterSpacing: '.14em',
      color: C.ink4
    }
  }, "STEP 2 ／ 診断 Q&A"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      alignItems: 'center'
    }
  }, ['q1', 'q2', 'q3', 'q4'].map(qid => /*#__PURE__*/React.createElement("span", {
    key: qid,
    style: {
      width: 8,
      height: 8,
      borderRadius: 99,
      background: answers[qid] !== undefined ? C.ink7 : C.ink0,
      border: answers[qid] !== undefined ? 'none' : `0.5px solid ${C.ink3}`
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      background: C.ink2,
      borderRadius: 99,
      overflow: 'hidden',
      marginBottom: 46
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      background: C.ink7,
      borderRadius: 99,
      width: progressPct,
      transition: 'width .45s ease'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 40
    }
  }, pageQs.map((q, pi) => /*#__PURE__*/React.createElement("div", {
    key: q.id
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(),
      fontSize: 10,
      color: C.ink4,
      letterSpacing: '.12em',
      marginBottom: 8
    }
  }, "Q", page * 2 + pi + 1, " / 4"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: C.ink7,
      marginBottom: 18,
      lineHeight: 1.55
    }
  }, q.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, q.opts.map((text, idx) => {
    const sel = answers[q.id] === idx;
    return /*#__PURE__*/React.createElement("button", {
      key: idx,
      className: `btn-option${sel ? ' selected' : ''}`,
      onClick: () => onAnswer(q.id, idx),
      style: sel ? optSel : optBase
    }, /*#__PURE__*/React.createElement("span", {
      style: sel ? labSel : labBase
    }, String.fromCharCode(65 + idx)), /*#__PURE__*/React.createElement("span", null, text));
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 36
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: canAdvance ? 'btn-primary' : '',
    onClick: advance,
    style: canAdvance ? {
      width: '100%',
      padding: 16,
      background: C.ink7,
      color: C.ink0,
      border: 'none',
      borderRadius: 3,
      fontSize: 14.5,
      fontWeight: 500,
      letterSpacing: '.06em'
    } : {
      width: '100%',
      padding: 16,
      background: C.ink1,
      color: C.ink3,
      border: `0.5px solid ${C.ink2}`,
      borderRadius: 3,
      fontSize: 14.5,
      cursor: 'default'
    }
  }, page === 0 ? '次のページへ' : '診断結果を見る'), !canAdvance && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 11,
      color: C.ink3,
      marginTop: 12
    }
  }, "すべての質問に答えると進めます")));
}

// ─── Radar chart ─────────────────────────────────────────────────────────────
function RadarChart({
  type
}) {
  const scores = SCORES_BY_TYPE[type] || SCORES_BY_TYPE['T'];
  const cx = 90,
    cy = 90,
    R = 56;
  const ang = i => (-90 + i * 72) * Math.PI / 180;
  const pt = (i, f) => [+(cx + R * f * Math.cos(ang(i))).toFixed(1), +(cy + R * f * Math.sin(ang(i))).toFixed(1)];
  const ringStr = f => scores.map((_, i) => pt(i, f).join(',')).join(' ');
  const dataStr = scores.map((s, i) => pt(i, s.v / 100).join(',')).join(' ');
  const labels = scores.map((s, i) => {
    const [x, y] = pt(i, 1.35);
    return {
      x,
      y,
      name: s.name,
      anchor: x < cx - 3 ? 'end' : x > cx + 3 ? 'start' : 'middle'
    };
  });
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 180 180",
    width: 186,
    height: 186
  }, [0.25, 0.5, 0.75, 1].map(f => /*#__PURE__*/React.createElement("polygon", {
    key: f,
    points: ringStr(f),
    fill: "none",
    stroke: C.ink2,
    strokeWidth: "0.5"
  })), scores.map((_, i) => {
    const [x, y] = pt(i, 1);
    return /*#__PURE__*/React.createElement("line", {
      key: i,
      x1: cx,
      y1: cy,
      x2: x,
      y2: y,
      stroke: C.ink2,
      strokeWidth: "0.5"
    });
  }), /*#__PURE__*/React.createElement("polygon", {
    points: dataStr,
    fill: "rgba(20,20,19,0.07)",
    stroke: C.ink7,
    strokeWidth: "1.2",
    strokeLinejoin: "round"
  }), labels.map(l => /*#__PURE__*/React.createElement("text", {
    key: l.name,
    x: l.x,
    y: l.y,
    textAnchor: l.anchor,
    fontSize: "8.5",
    fill: C.ink5,
    dominantBaseline: "middle",
    fontFamily: "Noto Sans JP"
  }, l.name)));
}

// ─── Phase 3: Result ─────────────────────────────────────────────────────────
function PhaseResult({
  answers,
  onDashboard,
  onRestart,
  onBack
}) {
  const resultType = calcResultType(answers);
  const info = TYPE_RESULTS[resultType] || TYPE_RESULTS['T'];
  const matches = TYPE_MATCHES[resultType] || TYPE_MATCHES['T'];
  const scores = SCORES_BY_TYPE[resultType] || SCORES_BY_TYPE['T'];

  // sort type cards: mine first, then descending by match
  const typeCards = ALL_TYPES.map(t => ({
    ...t,
    mine: t.key === resultType,
    matchVal: matches[t.key] || 0
  })).sort((a, b) => b.matchVal - a.matchVal);
  return /*#__PURE__*/React.createElement("div", {
    className: "phase",
    style: {
      maxWidth: 780,
      margin: '0 auto',
      padding: '48px 24px 80px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      background: 'none',
      border: 'none',
      fontSize: 12,
      color: C.ink4,
      padding: '0 0 22px',
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, "← もどる"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 46
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(),
      fontSize: 11,
      letterSpacing: '.16em',
      color: C.ink4,
      marginBottom: 16
    }
  }, "STEP 3 ／ 診断結果"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 11,
      padding: '8px 20px',
      background: C.ink7,
      borderRadius: 99,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(),
      fontSize: 12,
      color: C.ink4
    }
  }, "RESULT"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: C.ink0,
      fontWeight: 500
    }
  }, info.label)), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30,
      fontWeight: 700,
      color: C.ink7,
      margin: '0 0 14px'
    }
  }, info.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      lineHeight: 1.9,
      color: C.ink5,
      maxWidth: 480,
      margin: '0 auto'
    }
  }, info.desc), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginTop: 22
    }
  }, info.keywords.map(kw => /*#__PURE__*/React.createElement("span", {
    key: kw,
    style: {
      fontSize: 12,
      padding: '6px 18px',
      borderRadius: 99,
      border: `0.5px solid ${C.ink7}`,
      color: C.ink7,
      fontWeight: 500
    }
  }, kw)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginBottom: 48
    }
  }, typeCards.map(t => {
    const mine = t.mine;
    return /*#__PURE__*/React.createElement("div", {
      key: t.key,
      style: {
        background: mine ? C.ink7 : C.ink0,
        border: `0.5px solid ${mine ? C.ink7 : C.ink2}`,
        borderRadius: 4,
        padding: '18px 22px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20,
        fontWeight: 700,
        flexShrink: 0,
        color: mine ? C.ink0 : C.ink6
      }
    }, t.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        padding: '3px 9px',
        borderRadius: 99,
        flexShrink: 0,
        background: mine ? 'rgba(255,255,255,.1)' : C.ink1,
        border: mine ? 'none' : `0.5px solid ${C.ink2}`,
        color: mine ? C.ink3 : C.ink4
      }
    }, t.tag), mine && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: C.accent,
        background: C.accentLight,
        padding: '3px 9px',
        borderRadius: 99,
        whiteSpace: 'nowrap'
      }
    }, "あなたのタイプ"), /*#__PURE__*/React.createElement("span", {
      style: {
        ...mono(),
        fontWeight: 500,
        marginLeft: 'auto',
        fontSize: mine ? 18 : 14,
        color: mine ? C.ink0 : C.ink4
      }
    }, t.matchVal, "%")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        lineHeight: 1.75,
        color: mine ? C.ink3 : C.ink5
      }
    }, t.desc), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 4,
        background: '#f0efec',
        borderRadius: 99,
        overflow: 'hidden',
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        borderRadius: 99,
        width: `${t.matchVal}%`,
        background: mine ? 'rgba(255,255,255,.5)' : C.ink3
      }
    })));
  })), /*#__PURE__*/React.createElement("div", {
    className: "result-radar",
    style: {
      display: 'grid',
      gridTemplateColumns: '210px 1fr',
      gap: 36,
      alignItems: 'center',
      background: C.ink0,
      border: `0.5px solid ${C.ink2}`,
      borderRadius: 4,
      padding: '30px',
      marginBottom: 50
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(RadarChart, {
    type: resultType
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 15
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(),
      fontSize: 10,
      letterSpacing: '.12em',
      color: C.ink4,
      marginBottom: 2
    }
  }, "ABILITY SCORE"), scores.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.name
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: C.ink6
    }
  }, s.name), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(),
      fontSize: 12,
      color: C.ink7
    }
  }, s.v)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 5,
      background: '#f0efec',
      borderRadius: 99,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      background: C.ink7,
      borderRadius: 99,
      width: `${s.v}%`
    }
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 44
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(),
      fontSize: 10,
      letterSpacing: '.12em',
      color: C.ink4,
      marginBottom: 16
    }
  }, "推奨ロードマップ ／ ROADMAP"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, ROADMAP_STEPS.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.step,
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'flex-start',
      background: C.ink0,
      border: `0.5px solid ${C.ink2}`,
      borderRadius: 4,
      padding: '20px 24px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(),
      fontSize: 13,
      color: C.accent,
      flexShrink: 0,
      paddingTop: 2
    }
  }, "STEP ", r.step), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: C.ink7,
      marginBottom: 6
    }
  }, r.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      lineHeight: 1.75,
      color: C.ink5
    }
  }, r.desc)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: onDashboard,
    style: {
      width: '100%',
      padding: 17,
      background: C.ink7,
      color: C.ink0,
      border: 'none',
      borderRadius: 3,
      fontSize: 14.5,
      fontWeight: 500,
      letterSpacing: '.06em'
    }
  }, "ダッシュボードへ進む"), /*#__PURE__*/React.createElement("button", {
    className: "btn-secondary",
    onClick: onRestart,
    style: {
      width: '100%',
      padding: 13,
      background: 'none',
      color: C.ink4,
      border: `0.5px solid ${C.ink3}`,
      borderRadius: 3,
      fontSize: 13
    }
  }, "もう一度診断する")));
}

// ─── Dashboard helpers ────────────────────────────────────────────────────────
const TASK_DOT = {
  done: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: 99,
    background: C.ink7,
    flexShrink: 0
  },
  current: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: 99,
    background: C.ink0,
    border: `1.5px solid ${C.accent}`,
    flexShrink: 0
  },
  todo: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: 99,
    background: C.ink0,
    border: `0.5px solid ${C.ink3}`,
    flexShrink: 0
  }
};
const TASK_TEXT = {
  done: {
    fontSize: 13,
    color: C.ink3,
    textDecoration: 'line-through'
  },
  current: {
    fontSize: 13,
    color: C.accent,
    fontWeight: 500
  },
  todo: {
    fontSize: 13,
    color: C.ink4
  }
};

// ─── Tab: Dashboard ───────────────────────────────────────────────────────────
function TabDashboard({
  resultType,
  completedTasks,
  onToggleTask
}) {
  const [selectedLayer, setSelectedLayer] = useState(null);
  const totalTasks = MILESTONES.reduce((a, m) => a + m.tasks.length, 0);
  const doneTasks = MILESTONES.reduce((sum, m, mi) => sum + m.tasks.reduce((s, t, ti) => {
    const k = `${mi}-${ti}`;
    const done = completedTasks.hasOwnProperty(k) ? completedTasks[k] : t.state === 'done';
    return s + (done ? 1 : 0);
  }, 0), 0);
  const overallPct = Math.round(doneTasks / totalTasks * 100);

  // pyramid (reversed: top layer first)
  const PLW = ['100%', '85%', '70%', '52%', '36%'];
  const PLBG = ['#c9c7c2', '#888780', '#525048', '#2c2b28', '#141413'];
  const PLTC = ['#2c2b28', '#fff', '#fff', '#fff', '#fff'];
  const PLPAD = [24, 22, 20, 18, 16];
  const HC = ['#eeede9', '#d3d1cc', '#8f8d88', '#2c2b28'];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "kpi-grid",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 12,
      marginBottom: 24
    }
  }, [{
    label: '全体進捗',
    main: overallPct,
    unit: '%',
    sub: `${doneTasks} / ${totalTasks} タスク完了`,
    hasBar: true
  }, {
    label: '累計学習',
    main: '142',
    unit: 'h',
    sub: '先週比 +9.5h'
  }, {
    label: '残タスク',
    main: totalTasks - doneTasks,
    unit: '件',
    sub: '進行中・未着手タスク'
  }, {
    label: '連続学習',
    main: '12',
    unit: '日',
    sub: '自己ベスト更新中'
  }].map(k => /*#__PURE__*/React.createElement("div", {
    key: k.label,
    style: {
      background: C.ink0,
      border: `0.5px solid ${C.ink2}`,
      borderRadius: 4,
      padding: '18px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 11
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.ink4,
      letterSpacing: '.03em'
    }
  }, k.label), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(),
      color: C.ink7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 30,
      fontWeight: 500
    }
  }, k.main), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      marginLeft: 1
    }
  }, k.unit)), k.hasBar && /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      background: '#f0efec',
      borderRadius: 99,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${overallPct}%`,
      background: C.ink7,
      borderRadius: 99
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: k.hasBar ? C.ink4 : C.ink3
    }
  }, k.sub)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.ink0,
      border: `0.5px solid ${C.ink2}`,
      borderRadius: 4,
      padding: '30px 28px',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: C.ink7
    }
  }, "マイルストーン・ピラミッド"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.ink4
    }
  }, "▲ ビジョン（最終目標）— クリックで詳細")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 7,
      margin: '22px 0 12px'
    }
  }, [...MILESTONES].reverse().map((m, ri) => {
    const i = 4 - ri;
    const sel = selectedLayer === i;
    const border = m.status === '進行中' ? `1.5px solid ${C.accent}` : sel ? '1px solid rgba(255,255,255,.35)' : '0.5px solid transparent';
    return /*#__PURE__*/React.createElement("div", {
      key: m.name,
      style: {
        width: PLW[i]
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "pyramid-layer",
      onClick: () => setSelectedLayer(sel ? null : i),
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: `13px ${PLPAD[i]}px`,
        background: PLBG[i],
        borderRadius: 3,
        cursor: 'pointer',
        border
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        fontWeight: 500,
        color: PLTC[i],
        whiteSpace: 'nowrap'
      }
    }, m.name), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        whiteSpace: 'nowrap',
        fontSize: 10,
        padding: '2px 9px',
        borderRadius: 99,
        ...(m.status === '進行中' ? {
          background: C.accentLight,
          color: C.accent,
          fontWeight: 500
        } : m.status === '完了' ? {
          border: `0.5px solid ${i === 0 ? '#8f8d88' : 'rgba(255,255,255,.45)'}`,
          color: i === 0 ? C.ink5 : C.ink0
        } : {
          border: '0.5px solid rgba(255,255,255,.22)',
          color: C.ink4
        })
      }
    }, m.status), /*#__PURE__*/React.createElement("span", {
      style: {
        ...mono(),
        fontSize: 11,
        color: m.progress === 100 ? i === 0 ? C.ink5 : '#e8e7e4' : m.progress > 0 ? C.accentLight : C.ink4
      }
    }, m.progress, "%"))), sel && /*#__PURE__*/React.createElement("div", {
      className: "pyramid-detail",
      style: {
        background: C.ink1,
        borderLeft: `0.5px solid ${C.ink2}`,
        borderRight: `0.5px solid ${C.ink2}`,
        borderBottom: `0.5px solid ${C.ink2}`,
        borderRadius: '0 0 4px 4px',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...mono(),
        fontSize: 11,
        color: C.ink4
      }
    }, m.period), m.tasks.map((t, ti) => {
      const key = `${i}-${ti}`;
      const toggled = completedTasks[key];
      const effDone = toggled !== undefined ? toggled : t.state === 'done';
      const dispState = effDone ? 'done' : t.state === 'current' ? 'current' : 'todo';
      return /*#__PURE__*/React.createElement("div", {
        key: ti,
        className: "task-row",
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          cursor: 'pointer'
        },
        onClick: () => onToggleTask(key, !effDone)
      }, /*#__PURE__*/React.createElement("span", {
        style: TASK_DOT[dispState]
      }), /*#__PURE__*/React.createElement("span", {
        style: TASK_TEXT[dispState]
      }, t.label));
    })));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 11,
      color: C.ink4,
      marginTop: 8
    }
  }, "▼ 基盤 ＝ 土台（積み上げの出発点）")), /*#__PURE__*/React.createElement("div", {
    className: "two-col",
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.ink0,
      border: `0.5px solid ${C.ink2}`,
      borderRadius: 4,
      padding: 26
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: C.ink7,
      marginBottom: 22
    }
  }, "マイルストーン進捗"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, TIMELINE.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: t.name,
    style: {
      display: 'flex',
      gap: 15,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      flexShrink: 0,
      paddingTop: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 11,
      height: 11,
      borderRadius: 99,
      flexShrink: 0,
      display: 'inline-block',
      background: t.status === '完了' ? C.ink7 : C.ink0,
      border: t.status === '完了' ? `0.5px solid ${C.ink7}` : t.status === '進行中' ? `1.5px solid ${C.accent}` : `0.5px solid ${C.ink3}`
    }
  }), i < TIMELINE.length - 1 && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 0.5,
      flex: 1,
      minHeight: 30,
      background: C.ink2,
      display: 'block'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 20,
      marginTop: -3
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: t.status === '未着手' ? C.ink4 : C.ink6,
      fontWeight: t.status === '未着手' ? 400 : 500,
      lineHeight: 1.5
    }
  }, t.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      marginTop: 7,
      whiteSpace: 'nowrap',
      fontSize: 10.5,
      padding: '2px 9px',
      borderRadius: 99,
      ...(t.status === '完了' ? {
        border: `0.5px solid ${C.ink3}`,
        color: C.ink4
      } : t.status === '進行中' ? {
        background: C.accentLight,
        color: C.accent,
        fontWeight: 500
      } : {
        border: `0.5px solid ${C.ink2}`,
        color: C.ink3
      })
    }
  }, t.status)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.ink0,
      border: `0.5px solid ${C.ink2}`,
      borderRadius: 4,
      padding: 26
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: C.ink7
    }
  }, "今週の学習"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: C.ink4,
      marginRight: 1
    }
  }, "少"), ['#eeede9', '#d3d1cc', '#8f8d88', '#2c2b28'].map((bg, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 11,
      height: 11,
      borderRadius: 2,
      background: bg,
      display: 'inline-block',
      border: i === 0 ? `0.5px solid ${C.ink2}` : 'none'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: C.ink4,
      marginLeft: 1
    }
  }, "多"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '42px repeat(6,1fr)',
      gap: 6,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", null), ['月', '火', '水', '木', '金', '土'].map(d => /*#__PURE__*/React.createElement("span", {
    key: d,
    style: {
      textAlign: 'center',
      fontSize: 10,
      color: C.ink4
    }
  }, d))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, HEAT.map(row => /*#__PURE__*/React.createElement("div", {
    key: row.subject,
    style: {
      display: 'grid',
      gridTemplateColumns: '42px repeat(6,1fr)',
      gap: 6,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.ink5
    }
  }, row.subject), row.cells.map((v, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      height: 28,
      borderRadius: 3,
      border: `0.5px solid #efeeeb`,
      background: HC[v],
      display: 'block'
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.ink4,
      marginTop: 18,
      lineHeight: 1.7
    }
  }, "継続日数 ", /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(),
      color: C.ink7
    }
  }, "12"), " 日。今週は資格学習に重点を置いています。"))));
}

// ─── Tab: Roadmap ─────────────────────────────────────────────────────────────
function TabRoadmap({
  completedTasks,
  onToggleTask
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: C.ink7,
      marginBottom: 5
    }
  }, "PMへの転職ロードマップ"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.ink4
    }
  }, "基盤から頂点へ積み上げる5段階のマイルストーン")), /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(),
      fontSize: 11,
      color: C.ink4
    }
  }, "目標日：2027年4月15日")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, MILESTONES.map((m, mi) => {
    const active = m.status === '進行中';
    const done = m.status === '完了';
    const cardStyle = {
      flex: 1,
      marginBottom: 14,
      background: active ? C.ink0 : done ? '#fafaf9' : C.ink0,
      border: active ? `0.5px solid ${C.accent}` : `0.5px solid ${C.ink2}`,
      borderRadius: 4,
      padding: '22px 24px'
    };
    const miDone = m.tasks.reduce((s, t, ti) => {
      const k = `${mi}-${ti}`;
      return s + ((completedTasks.hasOwnProperty(k) ? completedTasks[k] : t.state === 'done') ? 1 : 0);
    }, 0);
    const progPct = Math.round(miDone / m.tasks.length * 100);
    return /*#__PURE__*/React.createElement("div", {
      key: m.name,
      style: {
        display: 'flex',
        gap: 20,
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexShrink: 0,
        paddingTop: 24,
        width: 13
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 11,
        height: 11,
        borderRadius: 99,
        display: 'inline-block',
        flexShrink: 0,
        background: done ? C.ink7 : C.ink0,
        border: done ? `0.5px solid ${C.ink7}` : active ? `1.5px solid ${C.accent}` : `0.5px solid ${C.ink3}`
      }
    }), mi < MILESTONES.length - 1 && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 0.5,
        flex: 1,
        minHeight: 52,
        background: C.ink2,
        display: 'block'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: cardStyle
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        ...mono(),
        fontSize: 11,
        color: C.ink4,
        marginBottom: 6
      }
    }, String(mi + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 700,
        color: m.status === '未着手' ? C.ink4 : C.ink7
      }
    }, m.name)), /*#__PURE__*/React.createElement("span", {
      style: {
        whiteSpace: 'nowrap',
        fontSize: 10.5,
        padding: '2px 9px',
        borderRadius: 99,
        flexShrink: 0,
        ...(active ? {
          background: C.accentLight,
          color: C.accent,
          fontWeight: 500
        } : done ? {
          border: `0.5px solid ${C.ink3}`,
          color: C.ink4
        } : {
          border: `0.5px solid ${C.ink2}`,
          color: C.ink3
        })
      }
    }, m.status)), /*#__PURE__*/React.createElement("div", {
      style: {
        ...mono(),
        fontSize: 11,
        color: C.ink4,
        marginBottom: 14
      }
    }, m.period), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 4,
        background: '#f0efec',
        borderRadius: 99,
        overflow: 'hidden',
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        background: C.ink7,
        borderRadius: 99,
        width: `${progPct}%`,
        transition: 'width .3s ease'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, m.tasks.map((t, ti) => {
      const key = `${mi}-${ti}`;
      const toggled = completedTasks[key];
      const effDone = toggled !== undefined ? toggled : t.state === 'done';
      const dispState = effDone ? 'done' : t.state === 'current' ? 'current' : 'todo';
      return /*#__PURE__*/React.createElement("div", {
        key: ti,
        className: "task-row",
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer'
        },
        onClick: () => onToggleTask(key, !effDone)
      }, /*#__PURE__*/React.createElement("span", {
        style: TASK_DOT[dispState]
      }), /*#__PURE__*/React.createElement("span", {
        style: TASK_TEXT[dispState]
      }, t.label));
    }))));
  })));
}

// ─── Tab: Calendar ────────────────────────────────────────────────────────────
function TabCalendar() {
  const first = new Date(2026, 5, 1).getDay();
  const dim = 30;
  const _now = new Date();
  const todayD = _now.getFullYear() === 2026 && _now.getMonth() === 5 ? _now.getDate() : -1;
  const maxH = Math.max(...Object.values(HOURS_BY_DAY));
  const studyDayCount = Object.keys(HOURS_BY_DAY).length;
  const hoursTotal = +Object.values(HOURS_BY_DAY).reduce((a, b) => a + b, 0).toFixed(1);
  const calCells = [];
  for (let i = 0; i < first; i++) calCells.push({
    empty: true
  });
  for (let d = 1; d <= dim; d++) {
    const h = HOURS_BY_DAY[d] || 0;
    const alpha = h > 0 ? 0.11 + h / maxH * 0.58 : 0;
    const bg = h > 0 ? `rgba(20,20,19,${alpha.toFixed(2)})` : 'transparent';
    const tc = alpha > 0.42 ? C.ink0 : C.ink5;
    const border = d === todayD ? `1.5px solid ${C.ink7}` : `0.5px solid #f0efec`;
    calCells.push({
      d,
      h,
      bg,
      tc,
      border
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "cal-layout",
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 264px',
      gap: 20,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.ink0,
      border: `0.5px solid ${C.ink2}`,
      borderRadius: 4,
      padding: '26px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-stats",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 10,
      marginBottom: 26
    }
  }, [{
    val: `${studyDayCount}日`,
    label: '学習日数',
    sub: '/ 30日'
  }, {
    val: `${hoursTotal}h`,
    label: '合計時間',
    sub: '今月累計'
  }, {
    val: `${(hoursTotal / studyDayCount).toFixed(1)}h`,
    label: '日平均',
    sub: '/ 学習日'
  }].map(s => /*#__PURE__*/React.createElement("div", {
    key: s.label,
    style: {
      border: `0.5px solid ${C.ink2}`,
      borderRadius: 4,
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(),
      fontSize: 22,
      fontWeight: 500,
      color: C.ink7,
      marginBottom: 4
    }
  }, s.val), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.ink4
    }
  }, s.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: C.ink3,
      marginTop: 2
    }
  }, s.sub)))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: C.ink7,
      marginBottom: 13
    }
  }, "2026年 6月"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      gap: 5,
      marginBottom: 5
    }
  }, ['日', '月', '火', '水', '木', '金', '土'].map(w => /*#__PURE__*/React.createElement("span", {
    key: w,
    style: {
      textAlign: 'center',
      fontSize: 10,
      color: C.ink4
    }
  }, w))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      gap: 5
    }
  }, calCells.map((c, i) => c.empty ? /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      aspectRatio: '1',
      border: `0.5px solid transparent`,
      borderRadius: 3
    }
  }) : /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      aspectRatio: '1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      borderRadius: 3,
      ...mono(),
      fontSize: 11,
      color: c.tc,
      background: c.bg,
      border: c.border
    }
  }, /*#__PURE__*/React.createElement("span", null, c.d), c.h > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      opacity: .8
    }
  }, c.h, "h")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginTop: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, ['#eeede9', 'rgba(20,20,19,.35)', 'rgba(20,20,19,.56)', '#141413'].map((bg, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 11,
      height: 11,
      borderRadius: 2,
      background: bg,
      display: 'inline-block',
      border: i === 0 ? `0.5px solid ${C.ink2}` : 'none'
    }
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.ink4
    }
  }, "学習時間（少 → 多）"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      marginLeft: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: 99,
      border: `1.5px solid ${C.ink7}`,
      display: 'inline-block'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.ink5
    }
  }, todayD > 0 ? `今日 (6/${todayD})` : '今日')))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.ink0,
      border: `0.5px solid ${C.ink2}`,
      borderRadius: 4,
      padding: '22px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: C.ink7,
      marginBottom: 18
    }
  }, "今後の予定"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, EVENTS.map(e => /*#__PURE__*/React.createElement("div", {
    key: e.date,
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flexShrink: 0,
      textAlign: 'center',
      padding: '7px 9px',
      background: C.ink1,
      border: `0.5px solid ${C.ink2}`,
      borderRadius: 3,
      minWidth: 50
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(),
      fontSize: 11.5,
      color: C.ink7,
      whiteSpace: 'nowrap'
    }
  }, e.date), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: C.ink4,
      marginTop: 2
    }
  }, e.wd)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.ink6,
      lineHeight: 1.5,
      marginBottom: 6
    }
  }, e.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      padding: '2px 9px',
      borderRadius: 3,
      background: C.ink1,
      border: `0.5px solid ${C.ink2}`,
      color: C.ink5,
      whiteSpace: 'nowrap'
    }
  }, e.subject)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.ink0,
      border: `0.5px solid ${C.ink2}`,
      borderRadius: 4,
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: C.ink7,
      marginBottom: 12
    }
  }, "月次まとめ"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, [{
    l: 'ベストの連続学習',
    v: '12日',
    mono: true
  }, {
    l: '最長学習（1日）',
    v: '3.0h',
    mono: true
  }, {
    l: '最多学習科目',
    v: 'AWS',
    mono: false
  }, {
    l: '前月比',
    v: '+18%',
    mono: true
  }].map(r => /*#__PURE__*/React.createElement("div", {
    key: r.l,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.ink4
    }
  }, r.l), /*#__PURE__*/React.createElement("span", {
    style: r.mono ? {
      ...mono(),
      color: C.ink7
    } : {
      color: C.ink6
    }
  }, r.v)))))));
}

// ─── Tab: Learning Log ────────────────────────────────────────────────────────
function TabLog() {
  const maxH = Math.max(...WEEK.map(w => w.h), 0.1);
  const subjTotal = SUBJ_TOTALS.reduce((a, s) => a + s.h, 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "log-stats",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 12
    }
  }, [{
    label: '累計学習',
    val: '142h'
  }, {
    label: '学習日数',
    val: '48日'
  }, {
    label: '連続学習',
    val: '12日'
  }, {
    label: '週平均',
    val: '13.5h'
  }].map(s => /*#__PURE__*/React.createElement("div", {
    key: s.label,
    style: {
      background: C.ink0,
      border: `0.5px solid ${C.ink2}`,
      borderRadius: 4,
      padding: '18px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.ink4,
      marginBottom: 9
    }
  }, s.label), /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(),
      fontSize: 28,
      fontWeight: 500,
      color: C.ink7
    }
  }, s.val)))), /*#__PURE__*/React.createElement("div", {
    className: "log-charts",
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.ink0,
      border: `0.5px solid ${C.ink2}`,
      borderRadius: 4,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: C.ink7,
      marginBottom: 4
    }
  }, "今週の学習時間"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.ink4,
      marginBottom: 20
    }
  }, "Mon – Sun（6/15 – 6/21）"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-end',
      borderBottom: `0.5px solid ${C.ink2}`,
      paddingBottom: 1
    }
  }, WEEK.map(w => {
    const barH = w.h > 0 ? Math.max(5, Math.round(w.h / maxH * 74)) : 4;
    const today = w.d === '日';
    return /*#__PURE__*/React.createElement("div", {
      key: w.d,
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...mono(),
        fontSize: 10,
        color: w.h > 0 ? C.ink7 : '#e8e7e4'
      }
    }, w.h > 0 ? `${w.h}h` : ''), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 28,
        borderRadius: '3px 3px 0 0',
        height: barH,
        background: today && w.h > 0 ? C.ink7 : w.h > 0 ? C.ink3 : '#eeede9'
      }
    }));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 7
    }
  }, WEEK.map(w => /*#__PURE__*/React.createElement("span", {
    key: w.d,
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 11,
      color: w.d === '日' ? C.ink7 : C.ink4,
      fontWeight: w.d === '日' ? 700 : 400
    }
  }, w.d))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      marginTop: 16,
      paddingTop: 14,
      borderTop: `0.5px solid #f0efec`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.ink4
    }
  }, "週計"), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(),
      fontSize: 16,
      color: C.ink7
    }
  }, "13.5h"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.ink4,
      marginLeft: 8
    }
  }, "先週比"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.ink5
    }
  }, "+2.0h"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.ink0,
      border: `0.5px solid ${C.ink2}`,
      borderRadius: 4,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: C.ink7,
      marginBottom: 4
    }
  }, "科目別累計"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.ink4,
      marginBottom: 22
    }
  }, "全142h の内訳"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, SUBJ_TOTALS.map(s => {
    const pct = Math.round(s.h / subjTotal * 100);
    return /*#__PURE__*/React.createElement("div", {
      key: s.name
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        color: C.ink6,
        fontWeight: 500
      }
    }, s.name), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...mono(),
        fontSize: 16,
        color: C.ink7,
        fontWeight: 500
      }
    }, s.h, "h"), /*#__PURE__*/React.createElement("span", {
      style: {
        ...mono(),
        fontSize: 11,
        color: C.ink4
      }
    }, pct, "%"))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 6,
        background: '#f0efec',
        borderRadius: 99,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        background: C.ink7,
        borderRadius: 99,
        width: `${pct}%`
      }
    })));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.ink0,
      border: `0.5px solid ${C.ink2}`,
      borderRadius: 4,
      padding: '24px 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: C.ink7
    }
  }, "学習ログ"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.ink4
    }
  }, "直近7件")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, LOGS.map(l => /*#__PURE__*/React.createElement("div", {
    key: l.date + l.topic,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      padding: '14px 0',
      borderBottom: `0.5px solid #f0efec`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(),
      fontSize: 12,
      color: C.ink4,
      flexShrink: 0,
      width: 52
    }
  }, l.date), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.ink6,
      background: C.ink1,
      border: `0.5px solid #d3d1cc`,
      borderRadius: 3,
      padding: '3px 9px',
      flexShrink: 0,
      whiteSpace: 'nowrap'
    }
  }, l.subject), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: C.ink6,
      flex: 1
    }
  }, l.topic), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono(),
      fontSize: 13,
      color: C.ink7,
      flexShrink: 0
    }
  }, l.hours))))));
}

// ─── Phase 4: Dashboard ───────────────────────────────────────────────────────
function PhaseDashboard({
  resultType,
  completedTasks,
  onToggleTask,
  onRestart
}) {
  const [tab, setTab] = useState('dashboard');
  const days = daysUntil(2027, 4, 15);
  const typeName = resultType + '型キャリア';
  const TABS = [{
    key: 'dashboard',
    label: 'ダッシュボード'
  }, {
    key: 'roadmap',
    label: 'ロードマップ'
  }, {
    key: 'calendar',
    label: 'カレンダー'
  }, {
    key: 'log',
    label: '学習記録'
  }];
  const tabBase = {
    padding: '12px 2px',
    fontSize: 13.5,
    background: 'none',
    border: 'none',
    marginBottom: -0.5,
    transition: 'color .15s'
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "phase",
    style: {
      maxWidth: 1080,
      margin: '0 auto',
      padding: '36px 24px 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: 24,
      marginBottom: 28,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      letterSpacing: '.06em',
      color: C.ink0,
      background: C.ink7,
      padding: '4px 11px',
      borderRadius: 3
    }
  }, typeName), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.ink4
    }
  }, "田中 優一 さん"), /*#__PURE__*/React.createElement("button", {
    onClick: onRestart,
    style: {
      background: 'none',
      border: `0.5px solid ${C.ink3}`,
      borderRadius: 3,
      fontSize: 11,
      color: C.ink4,
      padding: '3px 10px',
      marginLeft: 4
    }
  }, "再診断")), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 26,
      fontWeight: 700,
      color: C.ink7,
      letterSpacing: '.01em'
    }
  }, "目標：PMへの転職")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.ink4,
      marginBottom: 3
    }
  }, "目標達成まで"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono(),
      color: C.ink7,
      lineHeight: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 46,
      fontWeight: 500
    }
  }, days), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      marginLeft: 5
    }
  }, "日")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.ink4,
      marginTop: 5
    }
  }, "2027年4月15日"))), /*#__PURE__*/React.createElement("div", {
    className: "tab-nav",
    style: {
      display: 'flex',
      gap: 30,
      borderBottom: `0.5px solid ${C.ink3}`,
      marginBottom: 32
    }
  }, TABS.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.key,
    className: "tab-btn",
    onClick: () => setTab(t.key),
    style: {
      ...tabBase,
      fontWeight: tab === t.key ? 500 : 400,
      color: tab === t.key ? C.ink7 : C.ink4,
      borderBottom: tab === t.key ? `1.5px solid ${C.ink7}` : '1.5px solid transparent'
    }
  }, t.label))), /*#__PURE__*/React.createElement("div", {
    key: tab,
    className: "tab-content"
  }, tab === 'dashboard' && /*#__PURE__*/React.createElement(TabDashboard, {
    resultType: resultType,
    completedTasks: completedTasks,
    onToggleTask: onToggleTask
  }), tab === 'roadmap' && /*#__PURE__*/React.createElement(TabRoadmap, {
    completedTasks: completedTasks,
    onToggleTask: onToggleTask
  }), tab === 'calendar' && /*#__PURE__*/React.createElement(TabCalendar, null), tab === 'log' && /*#__PURE__*/React.createElement(TabLog, null)));
}

// ─── App root ─────────────────────────────────────────────────────────────────
function App() {
  const [phase, setPhase] = useState('welcome');
  const [answers, setAnswers] = useState({});
  const [completedTasks, setCompletedTasks] = useState({});

  // persist to localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('compass-state') || '{}');
      if (saved.phase) {
        setPhase(saved.phase);
        setAnswers(saved.answers || {});
        setCompletedTasks(saved.completedTasks || {});
      }
    } catch (e) {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('compass-state', JSON.stringify({
        phase,
        answers,
        completedTasks
      }));
    } catch (e) {}
  }, [phase, answers, completedTasks]);
  function go(p) {
    setPhase(p);
    window.scrollTo(0, 0);
  }
  function handleAnswer(qId, idx) {
    setAnswers(prev => ({
      ...prev,
      [qId]: idx
    }));
  }
  function handleToggleTask(key, val) {
    setCompletedTasks(prev => ({
      ...prev,
      [key]: val
    }));
  }
  function handleRestart() {
    try {
      localStorage.removeItem('compass-state');
    } catch (e) {}
    setPhase('welcome');
    setAnswers({});
    setCompletedTasks({});
    window.scrollTo(0, 0);
  }
  const resultType = calcResultType(answers);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f5f5f4'
    }
  }, /*#__PURE__*/React.createElement(TopBar, null), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1
    }
  }, phase === 'welcome' && /*#__PURE__*/React.createElement(PhaseWelcome, {
    onStart: () => go('qa')
  }), phase === 'qa' && /*#__PURE__*/React.createElement(PhaseQa, {
    answers: answers,
    onAnswer: handleAnswer,
    onBack: () => go('welcome'),
    onFinish: () => go('result')
  }), phase === 'result' && /*#__PURE__*/React.createElement(PhaseResult, {
    answers: answers,
    onDashboard: () => go('dashboard'),
    onRestart: handleRestart,
    onBack: () => go('qa')
  }), phase === 'dashboard' && /*#__PURE__*/React.createElement(PhaseDashboard, {
    resultType: resultType,
    completedTasks: completedTasks,
    onToggleTask: handleToggleTask,
    onRestart: handleRestart
  })));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));