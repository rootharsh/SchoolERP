import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { erpDb } from '../../services/db';
import { Clock, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export const FacultySchedule: React.FC = () => {
  const { currentSchool, currentUser } = useAuth();

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

  const schedule = [
    { day: 'MONDAY', time: '08:00 - 08:45', subject: 'Mathematics (ગણિત)', class: 'Class 10-A', room: 'Room 204' },
    { day: 'MONDAY', time: '10:35 - 11:25', subject: 'Higher Mathematics (ગણિત - Group A)', class: 'Class 11-Sci', room: 'Lab B-2' },
    { day: 'TUESDAY', time: '08:45 - 09:30', subject: 'Mathematics (ગણિત)', class: 'Class 10-A', room: 'Room 204' },
    { day: 'TUESDAY', time: '11:45 - 12:30', subject: 'Basic Mathematics (ગણિત)', class: 'Class 9-A', room: 'Room 102' },
    { day: 'WEDNESDAY', time: '08:00 - 08:45', subject: 'Higher Mathematics (ગણિત - Group A)', class: 'Class 11-Sci', room: 'Lab B-2' },
    { day: 'WEDNESDAY', time: '10:30 - 11:15', subject: 'Mathematics (ગણિત)', class: 'Class 10-A', room: 'Room 204' },
    { day: 'THURSDAY', time: '08:00 - 08:45', subject: 'Mathematics (ગણિત - દ્વિઘાત સમીકરણ)', class: 'Class 10-A', room: 'Room 204' },
    { day: 'THURSDAY', time: '10:35 - 11:25', subject: 'Higher Mathematics (ગણિત)', class: 'Class 11-Sci', room: 'Lab B-2' },
    { day: 'THURSDAY', time: '12:30 - 01:15', subject: 'Basic Mathematics (ગણિત)', class: 'Class 9-A', room: 'Room 102' },
    { day: 'FRIDAY', time: '09:45 - 10:30', subject: 'GSEB Board Practice & Doubts (ગણિત)', class: 'Class 10-A', room: 'Room 204' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          <span>Faculty Weekly Teaching Schedule</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Allocated lecture periods, laboratory practicals, and room assignments for {currentUser?.full_name || 'Smt. Neetaben R. Patel'}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {days.map((day) => {
          const daySlots = schedule.filter((s) => s.day === day);
          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">{day}</h3>
                <span className="text-[11px] text-slate-400 font-mono">{daySlots.length} Periods</span>
              </div>

              <div className="space-y-2.5">
                {daySlots.map((slot, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                    <span className="font-mono text-[10px] font-bold text-emerald-700 block">
                      {slot.time}
                    </span>
                    <h4 className="font-bold text-slate-900 leading-tight">{slot.subject}</h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="font-semibold text-slate-700">{slot.class}</span>
                      <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {slot.room}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
