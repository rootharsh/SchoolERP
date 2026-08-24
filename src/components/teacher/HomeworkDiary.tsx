import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Homework, HomeworkSubmission } from '../../types/erp';
import { erpDb } from '../../services/db';
import { Badge, Modal } from '../common/UIComponents';
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Paperclip,
  Award,
  Users,
  Search,
} from 'lucide-react';

export const HomeworkDiary: React.FC = () => {
  const { currentSchool, currentUser, refreshData } = useAuth();

  const classes = erpDb.getClasses(currentSchool.id);
  const [selectedClassId, setSelectedClassId] = useState('class-10-a');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [gradingHomework, setGradingHomework] = useState<Homework | null>(null);

  // Create Assignment Form
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [description, setDescription] = useState('');
  const [submissionDeadline, setSubmissionDeadline] = useState('2026-08-25');
  const [attachmentName, setAttachmentName] = useState('');

  const homeworkList = erpDb.getHomework(currentSchool.id, selectedClassId) || [];

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const currentClass = classes.find((c) => c.id === selectedClassId);

    erpDb.createHomework(currentSchool.id, {
      class_id: selectedClassId,
      class_name: currentClass ? currentClass.name : 'Grade 10-A',
      teacher_id: currentUser?.id || 'staff-neeta',
      teacher_name: currentUser?.full_name || 'Smt. Neetaben R. Patel',
      subject,
      title,
      description,
      submission_deadline: submissionDeadline,
      attachments_url: attachmentName || undefined,
    });

    erpDb.logAudit({
      school_id: currentSchool.id,
      user_id: currentUser?.id || 'usr-teacher-neeta',
      user_name: currentUser?.full_name || 'Smt. Neetaben R. Patel',
      user_role: 'TEACHER',
      action: 'ASSIGN_HOMEWORK',
      resource_type: 'HOMEWORK',
      details: `Assigned homework "${title}" to ${selectedClassId} (Due: ${submissionDeadline})`,
      ip_address: '192.168.1.1',
    });

    setIsCreateModalOpen(false);
    setTitle('');
    setDescription('');
    setAttachmentName('');
    refreshData();
  };

  const handleGradeSubmission = (subId: string, grade: string, feedback: string) => {
    erpDb.gradeHomeworkSubmission(subId, grade, feedback);
    refreshData();
  };

  const submissions = gradingHomework ? erpDb.getHomeworkSubmissions(gradingHomework.id) : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Homework Diary &amp; Digital Grading Desk</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign curriculum homework, review student uploaded artifacts, and dispatch graded evaluations.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center space-x-1.5 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Assignment</span>
        </button>
      </div>

      {/* Class Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center space-x-3 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
          Division:
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

      {/* Homework Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {homeworkList.map((hw) => {
          const subs = erpDb.getHomeworkSubmissions(hw.id) || [];
          const submittedCount = (subs || []).filter((s) => s.status === 'SUBMITTED' || s.status === 'GRADED').length;
          return (
            <div
              key={hw.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    {hw.subject}
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-600 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Due: {hw.submission_deadline}</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{hw.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{hw.description}</p>

                {hw.attachments_url && (
                  <div className="inline-flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    <span>{hw.attachments_url}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-500 font-semibold">Submissions: </span>
                  <span className="font-bold text-emerald-700">{submittedCount} Submitted</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setGradingHomework(hw)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Grading Desk</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {homeworkList.length === 0 && (
          <div className="col-span-2 py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            No homework assignments currently posted for this division.
          </div>
        )}
      </div>

      {/* Create Homework Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Assign Class Homework"
        subtitle={`Publishing to Grade 10-A`}
        maxWidth="lg"
      >
        <form onSubmit={handleCreateHomework} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assignment Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 4: Quadratic Equations & Roots Problem Set"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Computer Science">Computer Science</option>
                <option value="English">English</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Submission Deadline</label>
              <input
                type="date"
                value={submissionDeadline}
                onChange={(e) => setSubmissionDeadline(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Detailed Instructions *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="List specific textbook problem numbers, diagrams required, and submission rules..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Optional Worksheet Attachment</label>
            <input
              type="text"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              placeholder="e.g. Math_Worksheet_Ch4.pdf"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/30"
            >
              Post Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* Grading Desk Modal */}
      {gradingHomework && (
        <Modal
          isOpen={!!gradingHomework}
          onClose={() => setGradingHomework(null)}
          title="Digital Grading Desk"
          subtitle={`${gradingHomework.title} • ${gradingHomework.subject}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-700 block mb-1">Student Submissions Register</span>
              <p className="text-slate-500 text-[11px]">
                Grade submitted student assignments and provide constructive feedback.
              </p>
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {submissions.map((sub) => (
                <div key={sub.id} className="py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-xs">{sub.student_name}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        Submitted: {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <Badge variant={sub.status === 'GRADED' ? 'success' : 'warning'} size="sm">
                      {sub.status}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-28">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase">
                        Grade Awarded
                      </label>
                      <input
                        type="text"
                        defaultValue={sub.grade || 'A+'}
                        id={`marks-${sub.id}`}
                        className="w-full px-2 py-1 border border-slate-300 rounded font-mono font-bold"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase">
                        Teacher Feedback
                      </label>
                      <input
                        type="text"
                        defaultValue={sub.feedback || 'Excellent work on proof derivations!'}
                        id={`feedback-${sub.id}`}
                        className="w-full px-2 py-1 border border-slate-300 rounded"
                      />
                    </div>
                    <div className="pt-3">
                      <button
                        onClick={() => {
                          const mInput = document.getElementById(`marks-${sub.id}`) as HTMLInputElement;
                          const fInput = document.getElementById(`feedback-${sub.id}`) as HTMLInputElement;
                          handleGradeSubmission(sub.id, mInput?.value || 'A', fInput?.value || '');
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
                      >
                        Grade
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setGradingHomework(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
