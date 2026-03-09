'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

type Answer = string | string[];
type Answers = Record<number, Answer>;

interface Question {
  step: number;
  category: string;
  question: string;
  type: 'single' | 'multi';
  maxSelect?: number;
  options: string[];
}

interface Scores {
  overall: number;
  processMat: number;
  dataReady: number;
  implReady: number;
  label: string;
  labelColor: string;
  labelBg: string;
}

interface Opportunity {
  title: string;
  impact: 'High' | 'Medium' | 'Low';
  explanation: string;
}

// ─── Question Data ────────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  {
    step: 1,
    category: 'YOUR BUSINESS',
    question: 'Which best describes your business?',
    type: 'single',
    options: [
      'Local service business',
      'Online store / eCommerce',
      'B2B services / agency',
      'Professional practice',
      'Restaurant / hospitality',
      'Health / wellness',
      'Other',
    ],
  },
  {
    step: 2,
    category: 'YOUR BUSINESS',
    question: 'How many people work in your business?',
    type: 'single',
    options: ['Just me', '2–5', '6–20', '21–50', '50+', 'Not sure'],
  },
  {
    step: 3,
    category: 'YOUR GOALS',
    question: "What's the main outcome you want from AI in the next 90 days?",
    type: 'single',
    options: [
      'Save time on admin',
      'Get more leads / sales',
      'Improve customer support',
      'Reduce mistakes / rework',
      'Better reporting / decisions',
      'Not sure yet',
    ],
  },
  {
    step: 4,
    category: 'YOUR OPERATIONS',
    question: 'Where does work feel most repetitive or manual?',
    type: 'multi',
    maxSelect: 3,
    options: [
      'Email & scheduling',
      'Creating proposals / quotes',
      'Invoicing & follow-ups',
      'Customer support replies',
      'Marketing content',
      'Data entry between tools',
      'Reporting',
      'Not sure',
    ],
  },
  {
    step: 5,
    category: 'YOUR OPERATIONS',
    question: 'How often do you copy-paste between tools or do the same task twice?',
    type: 'single',
    options: ['Daily', 'Weekly', 'Rarely', 'Never', 'Not sure'],
  },
  {
    step: 6,
    category: 'YOUR DATA',
    question: 'How is your business data organized?',
    type: 'single',
    options: [
      'Mostly in one system',
      'Across several tools but organized',
      'Scattered / inconsistent',
      'Mostly paper or not tracked',
      'Not sure',
    ],
  },
  {
    step: 7,
    category: 'YOUR READINESS',
    question: 'How comfortable are you with AI tools today?',
    type: 'single',
    options: [
      'Never used any',
      'Tried ChatGPT or similar',
      'Using AI weekly for work',
      'Built automations or workflows',
      'Using AI in core operations',
      'Not sure',
    ],
  },
  {
    step: 8,
    category: 'YOUR READINESS',
    question: 'If you saw a clear quick win, how soon would you try an AI pilot?',
    type: 'single',
    options: [
      'This month',
      'In 1–3 months',
      'Maybe later',
      'Not ready / skeptical',
      'Not sure',
    ],
  },
];

// ─── Scoring ──────────────────────────────────────────────────────────────────

function calculateScores(answers: Answers): Scores {
  const str = (key: number) => answers[key] as string ?? '';
  const arr = (key: number) => ((answers[key] as string[]) ?? []).filter(v => v !== 'Not sure');

  // Process Maturity
  const q2ScoreMap: Record<string, number> = {
    'Just me': 40, '2–5': 55, '6–20': 65, '21–50': 70, '50+': 60, 'Not sure': 45,
  };
  const q2Score = q2ScoreMap[str(2)] ?? 50;
  const q4Count = arr(4).length;
  const q4Score = Math.max(15, 88 - q4Count * 14);
  const q5ScoreMap: Record<string, number> = {
    'Daily': 18, 'Weekly': 44, 'Rarely': 72, 'Never': 88, 'Not sure': 38,
  };
  const q5Score = q5ScoreMap[str(5)] ?? 38;
  const processMat = Math.round(q2Score * 0.25 + q4Score * 0.35 + q5Score * 0.40);

  // Data Readiness
  const q6ScoreMap: Record<string, number> = {
    'Mostly in one system': 92,
    'Across several tools but organized': 68,
    'Scattered / inconsistent': 32,
    'Mostly paper or not tracked': 12,
    'Not sure': 28,
  };
  const q6Score = q6ScoreMap[str(6)] ?? 35;
  const dataReady = Math.round(q6Score * 0.75 + q2Score * 0.25);

  // Implementation Readiness
  const q7ScoreMap: Record<string, number> = {
    'Never used any': 12,
    'Tried ChatGPT or similar': 32,
    'Using AI weekly for work': 58,
    'Built automations or workflows': 78,
    'Using AI in core operations': 95,
    'Not sure': 22,
  };
  const q7Score = q7ScoreMap[str(7)] ?? 25;
  const q8ScoreMap: Record<string, number> = {
    'This month': 95, 'In 1–3 months': 68, 'Maybe later': 38,
    'Not ready / skeptical': 12, 'Not sure': 32,
  };
  const q8Score = q8ScoreMap[str(8)] ?? 35;
  const q3Score = str(3) === 'Not sure yet' ? 28 : 72;
  const implReady = Math.round(q7Score * 0.45 + q8Score * 0.35 + q3Score * 0.20);

  const clamp = (n: number) => Math.max(8, Math.min(94, n));
  const fp = clamp(processMat);
  const fd = clamp(dataReady);
  const fi = clamp(implReady);
  const fo = clamp(Math.round(fp * 0.30 + fd * 0.30 + fi * 0.40));

  let label: string, labelColor: string, labelBg: string;
  if (fo < 30) {
    label = 'Getting Started'; labelColor = 'text-amber-400'; labelBg = 'bg-amber-500/10 border-amber-500/20';
  } else if (fo < 55) {
    label = 'Building Foundation'; labelColor = 'text-yellow-400'; labelBg = 'bg-yellow-500/10 border-yellow-500/20';
  } else if (fo < 75) {
    label = 'Advancing'; labelColor = 'text-indigo-400'; labelBg = 'bg-indigo-500/10 border-indigo-500/20';
  } else {
    label = 'Leading'; labelColor = 'text-emerald-400'; labelBg = 'bg-emerald-500/10 border-emerald-500/20';
  }

  return { overall: fo, processMat: fp, dataReady: fd, implReady: fi, label, labelColor, labelBg };
}

// ─── Recommendations ──────────────────────────────────────────────────────────

function generateReport(answers: Answers, scores: Scores): {
  opportunities: Opportunity[];
  quickWin: string;
} {
  const str = (key: number) => answers[key] as string ?? '';
  const painAreas = ((answers[4] as string[]) ?? []).filter(v => v !== 'Not sure');
  const businessType = str(1);
  const teamSize = str(2);
  const goal = str(3);
  const frequency = str(5);
  const dataOrg = str(6);
  const aiComfort = str(7);

  const opps: Opportunity[] = [];

  if (painAreas.includes('Email & scheduling')) {
    opps.push({
      title: 'AI Email & Calendar Automation',
      impact: 'High',
      explanation: `You flagged email & scheduling as a major time sink. AI drafting tools and smart scheduling assistants can reclaim 5–10 hours/week${teamSize && teamSize !== 'Just me' ? ' across your team' : ''} — with no custom development required.`,
    });
  }
  if (painAreas.includes('Customer support replies')) {
    opps.push({
      title: 'AI Customer Support Agent',
      impact: 'High',
      explanation: `An AI first-response layer cuts reply time from hours to seconds — directly improving satisfaction${businessType === 'Online store / eCommerce' ? ', reducing cart abandonment, and recovering lost sales' : ' and freeing your team for higher-value work'}.`,
    });
  }
  if (painAreas.includes('Creating proposals / quotes')) {
    opps.push({
      title: 'Automated Proposal Generation',
      impact: 'High',
      explanation: `${businessType === 'B2B services / agency' ? 'For agencies and B2B businesses' : 'For your business type'}, AI-generated proposals compress deal turnaround from days to minutes — directly increasing win rates and pipeline velocity.`,
    });
  }
  if (painAreas.includes('Invoicing & follow-ups')) {
    opps.push({
      title: 'Automated Billing & Follow-ups',
      impact: 'High',
      explanation: `Automating invoicing and payment follow-ups typically recovers 8–15% of receivables faster and eliminates the awkward manual chasing — a direct, measurable cash flow improvement.`,
    });
  }
  if (painAreas.includes('Data entry between tools')) {
    opps.push({
      title: 'Cross-Tool Integration Layer',
      impact: frequency === 'Daily' ? 'High' : 'Medium',
      explanation: `${frequency === 'Daily' ? 'Daily copy-pasting between tools is costing you hours every week.' : 'Manual data syncing between tools adds up fast.'} A no-code integration layer (Zapier, Make, or native APIs) eliminates this entirely — typically in under a day of setup.`,
    });
  }
  if (painAreas.includes('Marketing content')) {
    opps.push({
      title: 'AI Content Production Pipeline',
      impact: 'Medium',
      explanation: `A structured AI content workflow (brief → draft → review) can 3–5× your output without adding headcount — especially valuable for ${businessType === 'Local service business' ? 'maintaining local visibility' : 'consistent brand presence across channels'}.`,
    });
  }
  if (painAreas.includes('Reporting')) {
    opps.push({
      title: 'Automated Reporting Dashboard',
      impact: 'Medium',
      explanation: `Connecting your data sources to an automated reporting layer removes the weekly compilation grind and gives leadership real-time visibility — critical for ${teamSize === '21–50' || teamSize === '50+' ? 'your team scale' : 'making faster decisions'}.`,
    });
  }

  // Goal-driven fill
  if (goal === 'Get more leads / sales' && opps.length < 3) {
    opps.push({
      title: 'AI Lead Qualification & Nurture',
      impact: 'High',
      explanation: `AI can score and prioritize inbound leads automatically, then trigger personalized follow-up sequences — so your team only engages high-intent prospects and every lead gets followed up.`,
    });
  }
  if (goal === 'Better reporting / decisions' && opps.length < 3) {
    opps.push({
      title: 'Business Intelligence Automation',
      impact: 'Medium',
      explanation: `${dataOrg === 'Across several tools but organized' ? 'Your organized data across tools is ready to' : 'Once consolidated, your data can'} feed an AI dashboard that surfaces weekly business insights automatically — no analyst required.`,
    });
  }
  if (goal === 'Reduce mistakes / rework' && opps.length < 3) {
    opps.push({
      title: 'AI-Assisted QA & Process Checks',
      impact: 'Medium',
      explanation: `Adding AI validation steps to your key workflows catches errors at the source before they cascade — reducing rework, protecting quality, and building team confidence in your output.`,
    });
  }

  // Structural fills
  if (opps.length < 3 && scores.dataReady < 45) {
    opps.push({
      title: 'Data Foundation Setup',
      impact: 'High',
      explanation: `Your data is fragmented or untracked — the #1 blocker to scaling AI effectively. Consolidating into a central CRM or data system is the highest-leverage move you can make right now.`,
    });
  }
  if (opps.length < 3) {
    opps.push({
      title: 'AI Tool Stack Assessment',
      impact: 'Medium',
      explanation: `A structured audit comparing your current tools to AI-native alternatives often reveals 20–30% cost savings alongside new capabilities — without disrupting existing workflows.`,
    });
  }

  // Quick win
  const isAIBeginner = aiComfort === 'Never used any' || aiComfort === 'Tried ChatGPT or similar';
  const isAIIntermediate = aiComfort === 'Using AI weekly for work';
  let quickWin: string;
  if (isAIBeginner) {
    const topPain = painAreas[0];
    if (topPain === 'Email & scheduling') {
      quickWin = 'Enable AI email drafting in Gmail (Gemini) or Outlook (Copilot). Use it for your 3 most common email types this week. Zero setup time — just activate and start saving.';
    } else if (topPain === 'Marketing content') {
      quickWin = 'Create one reusable ChatGPT or Claude prompt template for your most common content piece. 30 minutes to set up, hours saved every week from day one.';
    } else if (topPain === 'Customer support replies') {
      quickWin = 'Write your 10 most common support replies using ChatGPT, save them as templates, and use them as your starting point for every reply this week. Instant time savings, no tools to buy.';
    } else {
      quickWin = `Pick ONE task from your pain list — ${topPain || 'your most repetitive daily task'} — and run it through ChatGPT or Claude for one full week. Measure the time saved before committing to any tool or budget.`;
    }
  } else if (isAIIntermediate) {
    quickWin = `You're already using AI regularly — the leverage is in systemizing. Document the prompt chain or workflow behind your best AI use case and turn it into a team SOP this week. Your individual productivity gains multiply across everyone.`;
  } else {
    quickWin = `With your experience level, the highest-leverage move is connecting AI to your revenue pipeline — via API or native integration with your CRM, billing system, or project tool. This shifts AI from ad hoc assistant to active business driver.`;
  }

  return { opportunities: opps.slice(0, 3), quickWin };
}

// ─── SVG: Circular Progress ───────────────────────────────────────────────────

function CircularProgress({ score, label, labelColor }: { score: number; label: string; labelColor: string }) {
  const r = 68;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <defs>
          <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <circle cx="90" cy="90" r={r} fill="none" stroke="#16162a" strokeWidth="12" />
        <circle
          cx="90" cy="90" r={r} fill="none"
          stroke="url(#pg)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform="rotate(-90 90 90)"
        />
        <text x="90" y="84" textAnchor="middle" fill="white" fontSize="34" fontWeight="700" fontFamily="sans-serif">{score}</text>
        <text x="90" y="106" textAnchor="middle" fill="#64748b" fontSize="12" fontFamily="sans-serif">out of 100</text>
      </svg>
      <span className={`text-sm font-bold mt-1 ${labelColor}`}>{label}</span>
    </div>
  );
}

// ─── SVG: Radar Chart ─────────────────────────────────────────────────────────

function RadarChart({ processMat, dataReady, implReady }: { processMat: number; dataReady: number; implReady: number }) {
  const cx = 150, cy = 148, r = 92;
  const cos30 = Math.cos(Math.PI / 6), sin30 = Math.sin(Math.PI / 6);

  function pts(p: number, d: number, i: number) {
    const pf = p / 100, df = d / 100, inf = i / 100;
    return [
      `${cx},${cy - pf * r}`,
      `${cx + df * r * cos30},${cy + df * r * sin30}`,
      `${cx - inf * r * cos30},${cy + inf * r * sin30}`,
    ].join(' ');
  }

  const avg = { p: 52, d: 48, i: 44 };
  const grid = [25, 50, 75, 100];

  return (
    <svg viewBox="0 0 300 285" className="w-full max-w-[280px] mx-auto" overflow="visible">
      {/* Grid */}
      {grid.map(g => (
        <polygon key={g} points={pts(g, g, g)} fill="none" stroke="#1e293b" strokeWidth="1" />
      ))}
      {/* Axis lines */}
      <line x1={cx} y1={cy} x2={cx} y2={cy - r} stroke="#1e293b" strokeWidth="1" />
      <line x1={cx} y1={cy} x2={cx + r * cos30} y2={cy + r * sin30} stroke="#1e293b" strokeWidth="1" />
      <line x1={cx} y1={cy} x2={cx - r * cos30} y2={cy + r * sin30} stroke="#1e293b" strokeWidth="1" />
      {/* Industry average */}
      <polygon points={pts(avg.p, avg.d, avg.i)} fill="rgba(100,116,139,0.1)" stroke="#475569" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* User */}
      <polygon points={pts(processMat, dataReady, implReady)} fill="rgba(99,102,241,0.18)" stroke="#818cf8" strokeWidth="2" />
      {/* Dots */}
      <circle cx={cx} cy={cy - (processMat / 100) * r} r="4.5" fill="#818cf8" />
      <circle cx={cx + (dataReady / 100) * r * cos30} cy={cy + (dataReady / 100) * r * sin30} r="4.5" fill="#818cf8" />
      <circle cx={cx - (implReady / 100) * r * cos30} cy={cy + (implReady / 100) * r * sin30} r="4.5" fill="#818cf8" />
      {/* Labels */}
      <text x={cx} y={cy - r - 16} textAnchor="middle" fill="#94a3b8" fontSize="10.5" fontFamily="sans-serif">Process Maturity</text>
      <text x={cx} y={cy - r - 4} textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="600" fontFamily="sans-serif">{processMat}</text>
      <text x={cx + r * cos30 + 10} y={cy + r * sin30 + 2} textAnchor="start" fill="#94a3b8" fontSize="10.5" fontFamily="sans-serif">Data</text>
      <text x={cx + r * cos30 + 10} y={cy + r * sin30 + 14} textAnchor="start" fill="#94a3b8" fontSize="10.5" fontFamily="sans-serif">Readiness</text>
      <text x={cx + (dataReady / 100) * r * cos30 + 8} y={cy + (dataReady / 100) * r * sin30 - 6} textAnchor="start" fill="#818cf8" fontSize="10" fontWeight="600" fontFamily="sans-serif">{dataReady}</text>
      <text x={cx - r * cos30 - 10} y={cy + r * sin30 + 2} textAnchor="end" fill="#94a3b8" fontSize="10.5" fontFamily="sans-serif">Impl.</text>
      <text x={cx - r * cos30 - 10} y={cy + r * sin30 + 14} textAnchor="end" fill="#94a3b8" fontSize="10.5" fontFamily="sans-serif">Readiness</text>
      <text x={cx - (implReady / 100) * r * cos30 - 8} y={cy + (implReady / 100) * r * sin30 - 6} textAnchor="end" fill="#818cf8" fontSize="10" fontWeight="600" fontFamily="sans-serif">{implReady}</text>
      {/* Legend */}
      <line x1="62" y1="270" x2="76" y2="270" stroke="#475569" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x="80" y="274" fill="#64748b" fontSize="9.5" fontFamily="sans-serif">Industry avg</text>
      <line x1="148" y1="270" x2="162" y2="270" stroke="#818cf8" strokeWidth="2" />
      <text x="166" y="274" fill="#818cf8" fontSize="9.5" fontFamily="sans-serif">Your scores</text>
    </svg>
  );
}

// ─── Question Screen ──────────────────────────────────────────────────────────

function QuestionScreen({
  question,
  currentAnswer,
  onAnswer,
  onNext,
  onBack,
  onSkip,
  animDir,
}: {
  question: Question;
  currentAnswer: Answer | undefined;
  onAnswer: (val: Answer) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  animDir: 'forward' | 'back';
}) {
  const [otherText, setOtherText] = useState('');
  const isSingle = question.type === 'single';
  const selected: string[] = isSingle
    ? (typeof currentAnswer === 'string' ? [currentAnswer] : [])
    : (Array.isArray(currentAnswer) ? currentAnswer : []);

  const otherSelected = selected.includes('Other');

  const canProceed = isSingle
    ? typeof currentAnswer === 'string' && currentAnswer.length > 0
    : Array.isArray(currentAnswer) && (currentAnswer as string[]).length > 0;

  function toggle(option: string) {
    if (isSingle) {
      onAnswer(option);
      if (option !== 'Other') setOtherText('');
      return;
    }
    const cur = Array.isArray(currentAnswer) ? (currentAnswer as string[]) : [];
    if (cur.includes(option)) {
      onAnswer(cur.filter(o => o !== option));
    } else if (cur.length < (question.maxSelect ?? 99)) {
      onAnswer([...cur, option]);
    }
  }

  return (
    <div className={animDir === 'forward' ? 'anim-forward' : 'anim-back'}>
      <p className="text-[11px] font-bold tracking-[0.2em] text-indigo-400 uppercase mb-4">
        {question.category}
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-2">
        {question.question}
      </h2>
      {question.type === 'multi' ? (
        <p className="text-sm text-slate-500 mb-7">
          Select up to {question.maxSelect} that apply
          {selected.length > 0 ? ` · ${selected.length} selected` : ''}
        </p>
      ) : (
        <div className="mb-7" />
      )}

      <div className="flex flex-wrap gap-2.5">
        {question.options.map(option => {
          const isSelected = selected.includes(option);
          const isAtMax = !isSingle && selected.length >= (question.maxSelect ?? 99) && !isSelected;
          return (
            <button
              key={option}
              onClick={() => toggle(option)}
              disabled={isAtMax}
              className={`
                px-5 py-3 rounded-full border text-sm font-medium transition-all duration-150
                ${isSelected
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]'
                  : isAtMax
                    ? 'border-white/5 text-slate-600 cursor-not-allowed bg-transparent'
                    : 'border-white/[0.08] text-slate-300 hover:border-indigo-500/40 hover:text-white bg-white/[0.02] hover:bg-white/[0.05]'
                }
              `}
            >
              {option}
            </button>
          );
        })}
      </div>

      {otherSelected && (
        <div className="mt-4">
          <input
            type="text"
            value={otherText}
            onChange={e => setOtherText(e.target.value)}
            placeholder="Tell us more (optional)"
            autoFocus
            className="w-full max-w-sm rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
      )}

      <div className="mt-10 flex items-center gap-5">
        {question.step > 1 && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Back
          </button>
        )}
        <button
          onClick={onSkip}
          className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
        >
          Skip
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`
            ml-auto flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-all
            ${canProceed
              ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 shadow-lg shadow-indigo-500/20 active:scale-100'
              : 'bg-white/5 text-slate-600 cursor-not-allowed'
            }
          `}
        >
          {question.step === QUESTIONS.length ? 'See My Results' : 'Continue'}
          {canProceed && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Results Screen ───────────────────────────────────────────────────────────

function ResultsScreen({
  scores,
  opportunities,
  quickWin,
}: {
  scores: Scores;
  opportunities: Opportunity[];
  quickWin: string;
}) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const industryAvg = 48;

  const impactStyle = (impact: Opportunity['impact']) =>
    impact === 'High'
      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      : impact === 'Medium'
        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20';

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="px-6 py-5 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Audit<span className="text-indigo-400">IQ</span>
        </Link>
        <Link href="/audit" className="text-sm text-slate-500 hover:text-white transition-colors">
          ← Retake audit
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 space-y-6 anim-fadeup">
        {/* Header */}
        <div className="text-center pt-2 pb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Your AI Readiness Results
          </h1>
          <p className="text-slate-400 text-base">
            Based on your answers — here&apos;s where you stand and exactly what to do next.
          </p>
        </div>

        {/* Score + Radar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Circular */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 flex flex-col items-center">
            <p className="text-[11px] font-bold tracking-[0.18em] text-slate-500 uppercase mb-5">
              Overall AI Readiness
            </p>
            <CircularProgress score={scores.overall} label={scores.label} labelColor={scores.labelColor} />
            <div className="mt-6 w-full space-y-3">
              {[
                { label: 'Process Maturity', value: scores.processMat },
                { label: 'Data Readiness', value: scores.dataReady },
                { label: 'Implementation Readiness', value: scores.implReady },
              ].map(dim => (
                <div key={dim.label} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-36 shrink-0">{dim.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.05]">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500"
                      style={{ width: `${dim.value}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-400 w-7 text-right">{dim.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Radar */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 flex flex-col items-center">
            <p className="text-[11px] font-bold tracking-[0.18em] text-slate-500 uppercase mb-5">
              3-Dimension Analysis
            </p>
            <RadarChart processMat={scores.processMat} dataReady={scores.dataReady} implReady={scores.implReady} />
          </div>
        </div>

        {/* Benchmark bar */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <p className="text-sm font-semibold text-white mb-4">Industry Benchmark Comparison</p>
          <div className="space-y-3">
            {[
              { label: 'Your Score', value: scores.overall, color: 'from-indigo-600 to-violet-500', textColor: 'text-white' },
              { label: 'Industry Avg', value: industryAvg, color: 'from-slate-600 to-slate-500', textColor: 'text-slate-400' },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-4">
                <span className="text-xs text-slate-500 w-24 shrink-0">{row.label}</span>
                <div className="flex-1 h-2.5 rounded-full bg-white/[0.04]">
                  <div
                    className={`h-2.5 rounded-full bg-gradient-to-r ${row.color} transition-all duration-700`}
                    style={{ width: `${row.value}%` }}
                  />
                </div>
                <span className={`text-sm font-bold w-8 text-right ${row.textColor}`}>{row.value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-3">
            {scores.overall > industryAvg
              ? `You're ${scores.overall - industryAvg} points above the industry average — strong foundation to build on.`
              : `You're ${industryAvg - scores.overall} points below the industry average — significant upside available quickly.`}
          </p>
        </div>

        {/* Quick Win */}
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.05] p-6">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="text-xl">⚡</span>
            <p className="text-xs font-bold tracking-[0.18em] text-indigo-400 uppercase">Your #1 Quick Win</p>
          </div>
          <p className="text-white leading-relaxed">{quickWin}</p>
        </div>

        {/* Top 3 Opportunities */}
        <div>
          <h2 className="text-lg font-bold text-white mb-3">Top 3 AI Opportunities</h2>
          <div className="space-y-3">
            {opportunities.map((opp, i) => (
              <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-bold text-indigo-400">
                      {i + 1}
                    </span>
                    <h3 className="font-semibold text-white text-sm sm:text-base">{opp.title}</h3>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${impactStyle(opp.impact)}`}>
                    {opp.impact} Impact
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed pl-8">{opp.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Maturity level callout */}
        <div className={`rounded-2xl border ${scores.labelBg} p-5 flex items-center gap-4`}>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Your maturity level</p>
            <p className={`text-lg font-bold ${scores.labelColor}`}>{scores.label}</p>
          </div>
          <div className="h-10 w-px bg-white/5" />
          <p className="text-sm text-slate-400 leading-relaxed">
            {scores.label === 'Getting Started' && 'You have high upside potential. Focus on one quick win first — results compound fast.'}
            {scores.label === 'Building Foundation' && 'You\'re aware of the opportunity. The next step is picking a workflow to automate this month.'}
            {scores.label === 'Advancing' && 'You\'re ahead of most businesses. The focus now is connecting AI to your revenue pipeline directly.'}
            {scores.label === 'Leading' && 'You\'re operating at the frontier. Look for AI-to-AI integrations and autonomous workflows to extend your lead.'}
          </p>
        </div>

        {/* Email capture */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 text-center">
          {submitted ? (
            <div className="py-2">
              <p className="text-emerald-400 font-semibold text-lg mb-1">Report sent!</p>
              <p className="text-sm text-slate-500">Check your inbox for your full AI readiness report.</p>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold text-white mb-1.5">Save Your Full Report</h3>
              <p className="text-sm text-slate-400 mb-5">
                Get a PDF of your results with detailed, step-by-step recommendations emailed to you.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 max-w-sm mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 rounded-full bg-white/[0.04] border border-white/[0.08] px-5 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
                />
                <button
                  onClick={() => { if (email.includes('@')) setSubmitted(true); }}
                  className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  Send Report
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-3">Optional · No spam · Unsubscribe any time</p>
            </>
          )}
        </div>

        {/* Paid tier CTA */}
        <div className="text-center pb-4">
          <button className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/[0.04] px-8 py-4 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/10 transition-all hover:scale-105">
            Get Detailed Implementation Plan
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </button>
          <p className="text-xs text-slate-600 mt-2">30-day AI roadmap · Step-by-step playbook · Coming soon</p>
        </div>
      </div>
    </main>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AuditPage() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResults, setShowResults] = useState(false);
  const [animDir, setAnimDir] = useState<'forward' | 'back'>('forward');
  const [animKey, setAnimKey] = useState(0);

  const question = QUESTIONS[step - 1];

  function goNext() {
    if (step === QUESTIONS.length) {
      setShowResults(true);
      return;
    }
    setAnimDir('forward');
    setAnimKey(k => k + 1);
    setStep(s => s + 1);
  }

  function goBack() {
    if (step === 1) return;
    setAnimDir('back');
    setAnimKey(k => k + 1);
    setStep(s => s - 1);
  }

  function goSkip() {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[step];
      return next;
    });
    if (step === QUESTIONS.length) {
      setShowResults(true);
      return;
    }
    setAnimDir('forward');
    setAnimKey(k => k + 1);
    setStep(s => s + 1);
  }

  function handleAnswer(val: Answer) {
    setAnswers(prev => ({ ...prev, [step]: val }));
  }

  if (showResults) {
    const scores = calculateScores(answers);
    const { opportunities, quickWin } = generateReport(answers, scores);
    return <ResultsScreen scores={scores} opportunities={opportunities} quickWin={quickWin} />;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-2xl mx-auto w-full">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Audit<span className="text-indigo-400">IQ</span>
        </Link>
        <span className="text-sm font-medium text-slate-500">
          Step <span className="text-white">{step}</span> of {QUESTIONS.length}
        </span>
      </nav>

      {/* Thin progress line */}
      <div className="max-w-2xl mx-auto w-full px-6">
        <div className="h-px w-full bg-white/[0.04]">
          <div
            className="h-px bg-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${(step / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question area */}
      <section className="flex-1 flex flex-col justify-center px-6 py-12 max-w-2xl mx-auto w-full">
        <div key={animKey}>
          <QuestionScreen
            question={question}
            currentAnswer={answers[step]}
            onAnswer={handleAnswer}
            onNext={goNext}
            onBack={goBack}
            onSkip={goSkip}
            animDir={animDir}
          />
        </div>
      </section>
    </main>
  );
}
