import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TimetableSlot, DayOfWeek } from '../../types/erp';
import { erpDb } from '../../services/db';
import { Badge, Modal } from '../common/UIComponents';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Layers,
  MapPin,
  UserCheck,
} from 'lucide-react';

export const TimetableBuilder: React.FC = () => {
  const { currentSchool, currentUser, refreshData } = useAuth();

  const classes = erpDb.getClasses(currentSchool.id);
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'class-10-a');
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Add Slot Form State
  const [subject, setSubject] = useState('Physics Practicals');
  const [teacherId, setTeacherId] = useState('stf-robert');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('MONDAY');
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('09:20');
  const [room, setRoom] = useState('Room 302');

  const staffList = erpDb.getStaff(currentSchool.id);
  const slots = erpDb.getTimetable(currentSchool.id, selectedClassId);

  const days: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

  const periods = [
    { period: 1, time: '08:30 - 09:20', start: '08:30' },
    { period: 2, time: '09:25 - 10:15', start: '09:25' },
    { period: 3, time: '10:35 - 11:25', start: '10:35' },
    { period: 4, time: '11:30 - 12:20', start: '11:30' },
    { period: 5, time: '01:10 - 02:00', start: '01:10' },
    { period: 6, time: '02:05 - 02:55', start: '02:05' },
  ];

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    const teacher = staffList.find((s) => s.id === teacherId);
    const teacherName = teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Teacher';

    const result = erpDb.addTimetableSlot(currentSchool.id, {
      class_id: selectedClassId,
      teacher_id: teacherId,
      teacher_name: teacherName,
      subject,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      room,
    });

    if (result.conflict) {
      setConflictError(result.conflict);
      return;
    }

    erpDb.logAudit({
      school_id: currentSchool.id,
      user_id: currentUser?.id || 'usr-principal',
      user_name: currentUser?.full_name || 'Principal',
      user_role: 'PRINCIPAL',
      action: 'UPDATE_TIMETABLE',
      resource_type: 'TIMETABLES',
      details: `Scheduled ${subject} for ${selectedClassId} with ${teacherName} on ${dayOfWeek} (${startTime}-${endTime})`,
      ip_address: '192.168.1.1',
    });

    setIsAddSlotModalOpen(false);
    refreshData();
  };

  const handleDeleteSlot = (slotId: string) => {
    if (window.confirm('Remove this timetable slot?')) {
      erpDb.deleteTimetableSlot(slotId);
      refreshData();
    }
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Master Class Timetable Builder</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive weekly curriculum scheduler with automated teacher double-booking collision prevention.
          </p>
        </div>

        <button
          onClick={() => {
            setConflictError(null);
            setIsAddSlotModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center space-x-1.5 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Timetable Period</span>
        </button>
      </div>

      {/* Class Selector Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center space-x-3 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
          Target Class:
        </span>
        {classes.map((cls) => (
          <button
            key={cls.id}
            onClick={() => setSelectedClassId(cls.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedClassId === cls.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cls.name}
          </button>
        ))}
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{selectedClass?.name}</h3>
            <p className="text-xs text-slate-500">
              Class Teacher: <strong>{selectedClass?.class_teacher_name || 'Assigned'}</strong> • {selectedClass?.room_number}
            </p>
          </div>
          <span className="text-[11px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md">
            Conflict Guard: ACTIVE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <th className="py-3 px-4 w-28 border-r border-slate-200">Day / Period</th>
                {periods.map((p) => (
                  <th key={p.period} className="py-3 px-3 text-center border-r border-slate-200 min-w-[150px]">
                    <div>Period {p.period}</div>
                    <div className="text-[10px] font-mono text-slate-400 font-normal">{p.time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {days.map((day) => (
                <tr key={day} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200 bg-slate-50">
                    {day}
                  </td>
                  {periods.map((p) => {
                    const slot = slots.find(
                      (s) => s.day_of_week === day && s.start_time === p.start
                    );
                    return (
                      <td key={p.period} className="p-2 border-r border-slate-200 align-top">
                        {slot ? (
                          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 hover:border-blue-300 transition-colors space-y-1 relative group">
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              title="Delete Period"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <h4 className="font-bold text-slate-900 text-xs leading-tight pr-4">
                              {slot.subject}
                            </h4>
                            <div className="flex items-center space-x-1 text-[11px] text-blue-700 font-medium">
                              <UserCheck className="w-3 h-3 shrink-0" />
                              <span className="truncate">{slot.teacher_name}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-mono">
                              <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                              <span>{slot.room}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-16 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:border-slate-300 transition-colors">
                            <span className="text-[11px] font-mono text-slate-300">Free Slot</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Slot Modal */}
      <Modal
        isOpen={isAddSlotModalOpen}
        onClose={() => setIsAddSlotModalOpen(false)}
        title="Schedule Class Period"
        subtitle={`Adding slot to ${selectedClass?.name}`}
        maxWidth="lg"
      >
        <form onSubmit={handleAddSlot} className="space-y-4 text-xs">
          {conflictError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{conflictError}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics (ગણિત) / Science & Technology"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Teacher *</label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {staffList.map((stf) => (
                  <option key={stf.id} value={stf.id}>
                    {stf.first_name} {stf.last_name} ({stf.department.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Day of the Week</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="08:30"
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="09:20"
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Room / Lab</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Room 302"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddSlotModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/30"
            >
              Save to Timetable
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
