import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Info,
  Users,
  Building,
  Filter,
  ChevronLeft,
  ChevronRight,
  Flame,
  CloudRain,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface DayAttendanceRecord {
  day: number;
  dateStr: string;
  dayOfWeek: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  rate: number;
  present: number;
  total: number;
  staffPresent: number;
  totalStaff: number;
  isHoliday?: boolean;
  holidayName?: string;
  isLowTurnout?: boolean;
  reason?: string;
  weatherWarning?: boolean;
}

export const AttendanceHeatmap: React.FC = () => {
  const { language } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState<'August 2026' | 'July 2026' | 'June 2026'>('August 2026');
  const [selectedCampus, setSelectedCampus] = useState<string>('school-sharda-rajkot');
  const [selectedDay, setSelectedDay] = useState<DayAttendanceRecord | null>(null);

  // Month data definition for August 2026 (1st Aug was Saturday in 2026)
  // Let's generate a full 31-day model with realistic school events and low turnout days
  const augustData: DayAttendanceRecord[] = [
    { day: 1, dateStr: '2026-08-01', dayOfWeek: 'Sat', rate: 94.2, present: 1205, total: 1280, staffPresent: 71, totalStaff: 72 },
    { day: 2, dateStr: '2026-08-02', dayOfWeek: 'Sun', rate: 0, present: 0, total: 1280, staffPresent: 0, totalStaff: 72, isHoliday: true, holidayName: 'Sunday Weekly Off' },
    { day: 3, dateStr: '2026-08-03', dayOfWeek: 'Mon', rate: 96.8, present: 1239, total: 1280, staffPresent: 72, totalStaff: 72 },
    { day: 4, dateStr: '2026-08-04', dayOfWeek: 'Tue', rate: 97.4, present: 1247, total: 1280, staffPresent: 72, totalStaff: 72 },
    { day: 5, dateStr: '2026-08-05', dayOfWeek: 'Wed', rate: 98.9, present: 1266, total: 1280, staffPresent: 72, totalStaff: 72, reason: 'Annual Science Fair (100% participation target)' },
    { day: 6, dateStr: '2026-08-06', dayOfWeek: 'Thu', rate: 96.1, present: 1230, total: 1280, staffPresent: 70, totalStaff: 72 },
    { day: 7, dateStr: '2026-08-07', dayOfWeek: 'Fri', rate: 95.5, present: 1222, total: 1280, staffPresent: 71, totalStaff: 72 },
    { day: 8, dateStr: '2026-08-08', dayOfWeek: 'Sat', rate: 93.8, present: 1200, total: 1280, staffPresent: 69, totalStaff: 72 },
    { day: 9, dateStr: '2026-08-09', dayOfWeek: 'Sun', rate: 0, present: 0, total: 1280, staffPresent: 0, totalStaff: 72, isHoliday: true, holidayName: 'Sunday Weekly Off' },
    { day: 10, dateStr: '2026-08-10', dayOfWeek: 'Mon', rate: 96.2, present: 1231, total: 1280, staffPresent: 72, totalStaff: 72 },
    { day: 11, dateStr: '2026-08-11', dayOfWeek: 'Tue', rate: 95.8, present: 1226, total: 1280, staffPresent: 71, totalStaff: 72 },
    // Low Turnout Day 1: Heavy Monsoon Inundation Alert
    { day: 12, dateStr: '2026-08-12', dayOfWeek: 'Wed', rate: 82.5, present: 1056, total: 1280, staffPresent: 64, totalStaff: 72, isLowTurnout: true, weatherWarning: true, reason: 'Severe waterlogging in Saurashtra Ring Road & Aji Dam catchments. 224 students unable to commute via school buses.' },
    // Low Turnout Day 2: Post-Rainfall recovery
    { day: 13, dateStr: '2026-08-13', dayOfWeek: 'Thu', rate: 84.1, present: 1076, total: 1280, staffPresent: 66, totalStaff: 72, isLowTurnout: true, weatherWarning: true, reason: 'Rural transport routes partially suspended; online hybrid lecture link broadcasted.' },
    { day: 14, dateStr: '2026-08-14', dayOfWeek: 'Fri', rate: 94.7, present: 1212, total: 1280, staffPresent: 70, totalStaff: 72 },
    { day: 15, dateStr: '2026-08-15', dayOfWeek: 'Sat', rate: 99.2, present: 1270, total: 1280, staffPresent: 72, totalStaff: 72, reason: 'Independence Day Flag Hoisting & Patriotic Cultural Gala' },
    { day: 16, dateStr: '2026-08-16', dayOfWeek: 'Sun', rate: 0, present: 0, total: 1280, staffPresent: 0, totalStaff: 72, isHoliday: true, holidayName: 'Sunday Weekly Off' },
    { day: 17, dateStr: '2026-08-17', dayOfWeek: 'Mon', rate: 96.5, present: 1235, total: 1280, staffPresent: 72, totalStaff: 72 },
    { day: 18, dateStr: '2026-08-18', dayOfWeek: 'Tue', rate: 97.1, present: 1243, total: 1280, staffPresent: 72, totalStaff: 72 },
    { day: 19, dateStr: '2026-08-19', dayOfWeek: 'Wed', rate: 96.0, present: 1229, total: 1280, staffPresent: 71, totalStaff: 72 },
    { day: 20, dateStr: '2026-08-20', dayOfWeek: 'Thu', rate: 96.4, present: 1234, total: 1280, staffPresent: 70, totalStaff: 72 },
    { day: 21, dateStr: '2026-08-21', dayOfWeek: 'Fri', rate: 96.8, present: 1239, total: 1280, staffPresent: 71, totalStaff: 72, reason: 'Today (Live Biometric Ingress)' },
    { day: 22, dateStr: '2026-08-22', dayOfWeek: 'Sat', rate: 93.0, present: 1190, total: 1280, staffPresent: 69, totalStaff: 72 },
    { day: 23, dateStr: '2026-08-23', dayOfWeek: 'Sun', rate: 0, present: 0, total: 1280, staffPresent: 0, totalStaff: 72, isHoliday: true, holidayName: 'Sunday Weekly Off' },
    { day: 24, dateStr: '2026-08-24', dayOfWeek: 'Mon', rate: 95.8, present: 1226, total: 1280, staffPresent: 72, totalStaff: 72 },
    { day: 25, dateStr: '2026-08-25', dayOfWeek: 'Tue', rate: 96.3, present: 1233, total: 1280, staffPresent: 72, totalStaff: 72 },
    { day: 26, dateStr: '2026-08-26', dayOfWeek: 'Wed', rate: 95.9, present: 1227, total: 1280, staffPresent: 71, totalStaff: 72 },
    { day: 27, dateStr: '2026-08-27', dayOfWeek: 'Thu', rate: 96.7, present: 1238, total: 1280, staffPresent: 72, totalStaff: 72 },
    { day: 28, dateStr: '2026-08-28', dayOfWeek: 'Fri', rate: 94.0, present: 1203, total: 1280, staffPresent: 70, totalStaff: 72 },
    { day: 29, dateStr: '2026-08-29', dayOfWeek: 'Sat', rate: 92.5, present: 1184, total: 1280, staffPresent: 68, totalStaff: 72 },
    { day: 30, dateStr: '2026-08-30', dayOfWeek: 'Sun', rate: 0, present: 0, total: 1280, staffPresent: 0, totalStaff: 72, isHoliday: true, holidayName: 'Sunday Weekly Off' },
    { day: 31, dateStr: '2026-08-31', dayOfWeek: 'Mon', rate: 96.1, present: 1230, total: 1280, staffPresent: 72, totalStaff: 72 },
  ];

  // Helper color map based on turnout percentage
  const getCellColor = (record: DayAttendanceRecord) => {
    if (record.isHoliday) {
      return 'bg-slate-100 border-slate-200 text-slate-400';
    }
    if (record.rate >= 96) {
      return 'bg-emerald-600 border-emerald-700 text-white shadow-xs';
    }
    if (record.rate >= 92) {
      return 'bg-emerald-500 border-emerald-600 text-white';
    }
    if (record.rate >= 88) {
      return 'bg-amber-400 border-amber-500 text-amber-950 font-bold';
    }
    // Low Turnout alert
    return 'bg-rose-500 border-rose-600 text-white animate-pulse shadow-sm';
  };

  const lowTurnoutDays = augustData.filter((d) => d.isLowTurnout);
  const activeDays = augustData.filter((d) => !d.isHoliday);
  const avgMonthlyRate = (activeDays.reduce((acc, d) => acc + d.rate, 0) / activeDays.length).toFixed(1);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'gu' ? 'શાળા-વ્યાપી દૈનિક હાજરી હીટમેપ (Heatmap)' : 'School-Wide Attendance Heatmap'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Trustee Executive Board
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {language === 'gu'
                  ? 'માસિક હાજરી પેટર્ન અને ઓછા મતદાન (Low Turnout) વાળા દિવસોનું સચોટ વિશ્લેષણ.'
                  : 'Institutional attendance frequency matrix highlighting high-impact low turnout anomalies.'}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="school-sharda-rajkot">Aditya International, Rajkot (રાજકોટ)</option>
            <option value="school-tapovan-mehsana">Girnar Vidyamandir, Junagadh (જૂનાગઢ)</option>
            <option value="school-gyanmanjari-bhavnagar">Saraswati Global, Keshod (કેશોદ)</option>
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value as any)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="August 2026">August 2026 (ઓગસ્ટ ૨૦૨૬)</option>
            <option value="July 2026">July 2026 (જુલાઈ ૨૦૨૬)</option>
            <option value="June 2026">June 2026 (જૂન ૨૦૨૬)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200/80">
          <div className="text-[11px] font-bold text-purple-800 uppercase tracking-wider flex items-center justify-between">
            <span>{language === 'gu' ? 'માસિક સરેરાશ' : 'Monthly Average'}</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-950 mt-1">{avgMonthlyRate}%</div>
          <p className="text-[11px] text-purple-700 font-medium mt-0.5">Campus Target: &gt;95.0%</p>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80">
          <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center justify-between">
            <span>{language === 'gu' ? 'ઓછી હાજરીના દિવસો' : 'Low Turnout Days'}</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-950 mt-1">{lowTurnoutDays.length} {language === 'gu' ? 'દિવસ' : 'Days'}</div>
          <p className="text-[11px] text-rose-700 font-medium mt-0.5">Aug 12 (82.5%) &amp; Aug 13 (84.1%)</p>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
            <span>{language === 'gu' ? 'સર્વોચ્ચ હાજરી' : 'Peak Attendance'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-950 mt-1">99.2%</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">15 Aug (Independence Gala)</p>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/80">
          <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center justify-between">
            <span>{language === 'gu' ? 'સ્ટાફ ઉપસ્થિતિ' : 'Staff Presence'}</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black font-mono text-blue-950 mt-1">98.4%</div>
          <p className="text-[11px] text-blue-700 font-medium mt-0.5">71 / 72 Faculty Avg</p>
        </div>
      </div>

      {/* Main Heatmap Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {selectedMonth} • Attendance Density Calendar
          </span>
          {/* Legend */}
          <div className="flex items-center space-x-2 text-[10px] font-medium text-slate-600 flex-wrap">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block" />
              <span>&ge; 96% Optimal</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
              <span>92-95% Normal</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" />
              <span>88-91% Moderate</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" />
              <span className="font-bold text-rose-700">&lt; 88% Low Turnout Alert</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-300 inline-block" />
              <span>Holiday / Sun</span>
            </span>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div className="text-rose-400">Sun</div>
        </div>

        {/* 7-column Calendar Grid (Aug 2026 starts on Saturday, so 5 empty filler days Mon-Fri) */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Empty spacer blocks for Mon-Fri before Aug 1st */}
          <div className="h-14 sm:h-18 rounded-xl bg-slate-50/50 border border-dashed border-slate-200" />
          <div className="h-14 sm:h-18 rounded-xl bg-slate-50/50 border border-dashed border-slate-200" />
          <div className="h-14 sm:h-18 rounded-xl bg-slate-50/50 border border-dashed border-slate-200" />
          <div className="h-14 sm:h-18 rounded-xl bg-slate-50/50 border border-dashed border-slate-200" />
          <div className="h-14 sm:h-18 rounded-xl bg-slate-50/50 border border-dashed border-slate-200" />

          {/* Days 1 through 31 */}
          {augustData.map((record) => {
            const isSelected = selectedDay?.day === record.day;
            return (
              <button
                key={record.day}
                onClick={() => setSelectedDay(record)}
                className={`h-14 sm:h-18 rounded-xl p-1.5 sm:p-2 border flex flex-col justify-between text-left transition-all cursor-pointer relative group ${getCellColor(
                  record
                )} ${
                  isSelected
                    ? 'ring-3 ring-purple-600 ring-offset-2 scale-105 z-10 shadow-lg'
                    : 'hover:scale-102 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>{record.day}</span>
                  {record.weatherWarning && (
                    <CloudRain className="w-3 h-3 text-white animate-bounce" />
                  )}
                  {record.isLowTurnout && !record.weatherWarning && (
                    <AlertTriangle className="w-3 h-3 text-white" />
                  )}
                </div>

                <div className="text-right">
                  {record.isHoliday ? (
                    <span className="text-[10px] font-medium opacity-80 block truncate">Off</span>
                  ) : (
                    <>
                      <div className="text-xs sm:text-sm font-black font-mono leading-none">
                        {record.rate}%
                      </div>
                      <span className="text-[9px] opacity-85 hidden sm:inline block leading-tight">
                        {record.present} std
                      </span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Diagnostic Drill-Down Drawer / Card */}
      {selectedDay && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl space-y-3 border border-slate-700 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-bold">
                {selectedDay.dateStr} ({selectedDay.dayOfWeek}) • Detailed Turnout Breakdown
              </h4>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer px-2 py-0.5 rounded bg-slate-800"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Biometrics</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {selectedDay.isHoliday ? 'Holiday' : `${selectedDay.present} / ${selectedDay.total}`}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {selectedDay.isHoliday ? 'Campus Closed' : `${selectedDay.rate}% Attendance Realized`}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Staff Presence</span>
              <div className="text-xl font-bold font-mono text-blue-400 mt-1">
                {selectedDay.isHoliday ? 'Holiday' : `${selectedDay.staffPresent} / ${selectedDay.totalStaff}`}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">Faculty Ingress Gate Synchronized</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Turnout Status</span>
              <div className="text-xl font-bold font-mono mt-1">
                {selectedDay.isHoliday ? (
                  <span className="text-slate-300">{selectedDay.holidayName}</span>
                ) : selectedDay.isLowTurnout ? (
                  <span className="text-rose-400 flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    Low Turnout Anomaly
                  </span>
                ) : (
                  <span className="text-emerald-400">Normal / Healthy</span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {selectedDay.isLowTurnout ? 'Requires follow-up note' : 'Compliant with trust threshold'}
              </p>
            </div>
          </div>

          {selectedDay.reason && (
            <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800 text-xs flex items-start space-x-2 text-purple-200">
              <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Trustee Context &amp; Incident Notes:</span>
                <p className="mt-0.5 text-purple-200/90 leading-relaxed">{selectedDay.reason}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Low Turnout Root-Cause Summary List for Trustees */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h4 className="text-xs font-bold text-slate-900">
              {language === 'gu'
                ? 'ઓછા મતદાનવાળા દિવસોનું મૂળ-કારણ વિશ્લેષણ (Low Turnout Root-Cause Log)'
                : 'Flagged Low Turnout Days & Remedial Action Log'}
            </h4>
          </div>
          <span className="text-[11px] font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            {lowTurnoutDays.length} Occurrences
          </span>
        </div>

        <div className="space-y-2">
          {lowTurnoutDays.map((d) => (
            <div
              key={d.day}
              className="p-3 rounded-xl bg-white border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs hover:border-rose-300 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 text-rose-800 flex flex-col items-center justify-center font-bold shrink-0">
                  <span className="text-xs leading-none">{d.day}</span>
                  <span className="text-[9px] uppercase leading-none mt-0.5 font-mono">Aug</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{d.dateStr} ({d.dayOfWeek})</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      {d.rate}% Turnout (224 Absent)
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">{d.reason}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-[11px] font-medium text-slate-500 font-mono">Action: Hybrid LMS Activated</span>
                <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                  Resolved
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
