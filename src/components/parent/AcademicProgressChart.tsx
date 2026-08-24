import React, { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import {
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  BarChart2,
  LineChart as LineChartIcon,
  CheckCircle2,
  Target,
  ArrowUpRight,
} from 'lucide-react';

interface AcademicProgressChartProps {
  studentName?: string;
  className?: string;
}

export const AcademicProgressChart: React.FC<AcademicProgressChartProps> = ({
  studentName = 'Harsh Patel (હર્ષ પટેલ)',
  className = 'Class 10th-A (ધોરણ ૧૦-અ)',
}) => {
  const { language } = useLanguage();
  const [activeView, setActiveView] = useState<'trends' | 'comparison' | 'subjectBreakdown'>('trends');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  // Academic Exam Cycles Progression Data
  const progressData = [
    {
      exam: language === 'gu' ? 'એકમ કસોટી-૧ (જુલાઈ)' : 'Unit Test 1 (Jul)',
      cycle: 'UT-1',
      date: '15 Jul 2026',
      Mathematics: 88,
      Science: 84,
      English: 86,
      Gujarati: 92,
      SocialScience: 80,
      Computer: 94,
      aggregate: 87.3,
      classAverage: 74.2,
      gsebBenchmark: 70.0,
    },
    {
      exam: language === 'gu' ? 'પ્રથમ સત્ર પરીક્ષા (ઓગસ્ટ)' : 'Term 1 Midterm (Aug)',
      cycle: 'Midterm',
      date: '20 Aug 2026',
      Mathematics: 96,
      Science: 92,
      English: 91,
      Gujarati: 95,
      SocialScience: 89,
      Computer: 98,
      aggregate: 93.5,
      classAverage: 78.4,
      gsebBenchmark: 70.0,
    },
    {
      exam: language === 'gu' ? 'એકમ કસોટી-૨ (ઓક્ટોબર - અપેક્ષિત)' : 'Unit Test 2 (Oct - Target)',
      cycle: 'UT-2',
      date: '12 Oct 2026',
      Mathematics: 98,
      Science: 95,
      English: 93,
      Gujarati: 96,
      SocialScience: 92,
      Computer: 99,
      aggregate: 95.5,
      classAverage: 80.1,
      gsebBenchmark: 70.0,
    },
    {
      exam: language === 'gu' ? 'પ્રિલિમ પરીક્ષા (જાન્યુઆરી)' : 'Preliminary Mock (Jan)',
      cycle: 'Prelim',
      date: '18 Jan 2027',
      Mathematics: 99,
      Science: 96,
      English: 94,
      Gujarati: 98,
      SocialScience: 95,
      Computer: 100,
      aggregate: 97.0,
      classAverage: 82.5,
      gsebBenchmark: 70.0,
    },
  ];

  // Subject performance details
  const subjectMeta = [
    { key: 'Mathematics', name: language === 'gu' ? 'ગણિત (Maths)' : 'Mathematics', color: '#3b82f6', current: 96, growth: '+8.0%' },
    { key: 'Science', name: language === 'gu' ? 'વિજ્ઞાન (Science)' : 'Science & Tech', color: '#10b981', current: 92, growth: '+8.0%' },
    { key: 'English', name: language === 'gu' ? 'અંગ્રેજી (English)' : 'English FL', color: '#f59e0b', current: 91, growth: '+5.0%' },
    { key: 'Gujarati', name: language === 'gu' ? 'ગુજરાતી (Gujarati)' : 'Gujarati FL', color: '#8b5cf6', current: 95, growth: '+3.0%' },
    { key: 'SocialScience', name: language === 'gu' ? 'સામાજિક વિજ્ઞાન (SS)' : 'Social Science', color: '#ec4899', current: 89, growth: '+9.0%' },
    { key: 'Computer', name: language === 'gu' ? 'કમ્પ્યુટર (Computer)' : 'Computer Studies', color: '#06b6d4', current: 98, growth: '+4.0%' },
  ];

  // Comparison Bar Data for Term 1 vs Class Average
  const subjectComparisonData = subjectMeta.map((s) => ({
    subject: s.name,
    studentScore: s.current,
    classAverage: s.key === 'Mathematics' ? 76 : s.key === 'Science' ? 74 : s.key === 'English' ? 79 : s.key === 'Gujarati' ? 82 : s.key === 'SocialScience' ? 75 : 81,
    topScore: 100,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 text-xs font-mono">
          <div className="font-bold text-slate-200 border-b border-slate-700 pb-1.5 mb-2 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-emerald-400 font-sans font-semibold">GSEB Accredited</span>
          </div>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between space-x-4">
                <span className="flex items-center space-x-1.5" style={{ color: entry.color }}>
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                  <span className="font-sans text-slate-300 font-medium">{entry.name}:</span>
                </span>
                <span className="font-bold font-mono text-white text-sm">
                  {entry.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'gu' ? 'શૈક્ષણિક પ્રગતિ અને વિષયવાર ગુણ વલણ' : 'Academic Progress & Subject Mark Trends'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'gu'
                  ? `${studentName} • ${className} • એકમ કસોટી અને સત્ર પરીક્ષા પ્રગતિ વિશ્લેષણ`
                  : `Longitudinal performance trajectory for ${studentName} across GSEB evaluation cycles.`}
              </p>
            </div>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold self-start md:self-auto">
          <button
            onClick={() => setActiveView('trends')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeView === 'trends'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            <span>{language === 'gu' ? 'પ્રગતિ ગ્રાફ' : 'Trend Trajectory'}</span>
          </button>
          <button
            onClick={() => setActiveView('comparison')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeView === 'comparison'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>{language === 'gu' ? 'વર્ગ તુલના' : 'Class Benchmark'}</span>
          </button>
        </div>
      </div>

      {/* Quick Trend Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
            <span>{language === 'gu' ? 'એગ્રીગેટ પ્રગતિ' : 'Aggregate Gain'}</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-950 mt-1">+6.2%</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">87.3% → 93.5% (Ekam Kasoti)</p>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80">
          <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center justify-between">
            <span>{language === 'gu' ? 'સર્વોચ્ચ વિષય' : 'Highest Subject'}</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black font-mono text-blue-950 mt-1">98%</div>
          <p className="text-[11px] text-blue-700 font-medium mt-0.5">{language === 'gu' ? 'કમ્પ્યુટર અને ગણિત' : 'Computer & Maths (A1)'}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/80">
          <div className="text-[11px] font-bold text-purple-800 uppercase tracking-wider flex items-center justify-between">
            <span>{language === 'gu' ? 'વર્ગ સરેરાશથી આગળ' : 'Above Class Avg'}</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-950 mt-1">+15.1%</div>
          <p className="text-[11px] text-purple-700 font-medium mt-0.5">Student 93.5% vs Avg 78.4%</p>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80">
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
            <span>{language === 'gu' ? 'GSEB લક્ષ્યાંક' : 'GSEB Target'}</span>
            <Target className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-950 mt-1">95.0%+</div>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">District Merit Rank #1</p>
        </div>
      </div>

      {/* Subject Filter Pills (When in Trend View) */}
      {activeView === 'trends' && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setSelectedSubject('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border ${
              selectedSubject === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {language === 'gu' ? 'તમામ વિષયો (All Subjects)' : 'All Subjects Combined'}
          </button>
          {subjectMeta.map((s) => (
            <button
              key={s.key}
              onClick={() => setSelectedSubject(s.key)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border flex items-center space-x-1.5 ${
                selectedSubject === s.key
                  ? 'text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              style={{
                backgroundColor: selectedSubject === s.key ? s.color : undefined,
                borderColor: selectedSubject === s.key ? s.color : undefined,
              }}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: selectedSubject === s.key ? '#ffffff' : s.color }}
              />
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Recharts Canvas Section */}
      <div className="h-72 sm:h-80 w-full pt-2">
        {activeView === 'trends' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={progressData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAggregate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorSelected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="cycle"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                domain={[60, 100]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />

              {/* Reference Benchmarks */}
              <ReferenceLine
                y={70}
                label={{ value: 'GSEB Benchmark (70%)', fill: '#94a3b8', fontSize: 10, position: 'insideBottomRight' }}
                stroke="#94a3b8"
                strokeDasharray="4 4"
              />
              <ReferenceLine
                y={90}
                label={{ value: 'A1 Grade (91%+)', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }}
                stroke="#10b981"
                strokeDasharray="3 3"
                strokeOpacity={0.6}
              />

              {/* Show aggregate trend or selected subject */}
              {selectedSubject === 'ALL' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="aggregate"
                    name={language === 'gu' ? 'કુલ એગ્રીગેટ (%)' : 'Aggregate Marks (%)'}
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAggregate)"
                    activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="classAverage"
                    name={language === 'gu' ? 'વર્ગ સરેરાશ' : 'Class Average'}
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: '#94a3b8' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Mathematics"
                    name="Maths"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Science"
                    name="Science"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Gujarati"
                    name="Gujarati"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </>
              ) : (
                <>
                  <Area
                    type="monotone"
                    dataKey={selectedSubject}
                    name={subjectMeta.find((s) => s.key === selectedSubject)?.name || selectedSubject}
                    stroke={subjectMeta.find((s) => s.key === selectedSubject)?.color || '#3b82f6'}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSelected)"
                    activeDot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="classAverage"
                    name={language === 'gu' ? 'વર્ગ સરેરાશ' : 'Class Average'}
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: '#94a3b8' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="aggregate"
                    name={language === 'gu' ? 'કુલ એગ્રીગેટ' : 'Total Aggregate'}
                    stroke="#10b981"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={{ r: 3 }}
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectComparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="subject"
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar
                dataKey="studentScore"
                name={language === 'gu' ? 'વિદ્યાર્થીના ગુણ (%)' : "Student's Score (%)"}
                fill="#10b981"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="classAverage"
                name={language === 'gu' ? 'વર્ગ સરેરાશ (%)' : 'Class Average (%)'}
                fill="#94a3b8"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Teacher Diagnostic Observation & Recommendation Note */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-slate-900">
              {language === 'gu' ? 'શિક્ષક અભિપ્રાય અને પ્રગતિ ચકાસણી:' : 'Class Teacher Diagnostic Feedback:'}
            </span>
            <p className="text-slate-600 mt-0.5 leading-relaxed">
              {language === 'gu'
                ? 'હર્ષે ગણિત અને વિજ્ઞાનમાં ઉત્કૃષ્ટ સુધારો દર્શાવ્યો છે (+8%). સામાજિક વિજ્ઞાનમાં નકશા પૂર્તિ અને મહત્વના ઐતિહાસિક તારીખોનું થોડું વધુ પુનરાવર્તન જરૂરી છે.'
                : 'Harsh has shown exemplary growth in Mathematics and Science (+8%). Strong conceptual reasoning and problem formulation noticed across Midterm tests.'}
            </p>
          </div>
        </div>
        <div className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-100 px-3 py-1.5 rounded-lg shrink-0 text-center">
          Grade: A1 (Distinction)
        </div>
      </div>
    </div>
  );
};
