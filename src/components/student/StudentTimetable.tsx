import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { erpDb } from '../../services/db';
import { Clock, MapPin, UserCheck, Calendar } from 'lucide-react';

export const StudentTimetable: React.FC = () => {
  const { currentSchool } = useAuth();
  const classId = 'class-10-a';
  const slots = erpDb.getTimetable(currentSchool.id, classId) || [];

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Clock className="w-5 h-5 text-sky-600" />
          <span>My Class Timetable • Grade 10-A</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Weekly timetable schedule, class periods, faculty instructors, and assigned classrooms.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {days.map((day) => {
          const daySlots = (slots || []).filter((s) => s.day_of_week === day);
          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">{day}</h3>
                <span className="text-[11px] text-slate-400 font-mono">{daySlots.length} Periods</span>
              </div>

              <div className="space-y-2.5">
                {daySlots.map((slot) => (
                  <div key={slot.id} className="p-3 rounded-xl bg-sky-50/50 border border-sky-200/70 space-y-1 text-xs">
                    <span className="font-mono text-[10px] font-bold text-sky-700 block">
                      {slot.start_time} - {slot.end_time}
                    </span>
                    <h4 className="font-bold text-slate-900 leading-tight">{slot.subject}</h4>
                    <div className="flex items-center space-x-1 text-[11px] text-slate-600 pt-1">
                      <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{slot.teacher_name}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-mono">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{slot.room}</span>
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
