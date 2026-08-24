import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Users,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../common/UIComponents';

interface FacultyContact {
  id: string;
  name: string;
  guName: string;
  role: string;
  guRole: string;
  subject: string;
  guSubject: string;
  phone: string;
  email: string;
  officeHours: string;
  guOfficeHours: string;
  avatar: string;
}

export const FacultyLiaisonDirectory: React.FC = () => {
  const { currentSchool } = useAuth();
  const { language, t } = useLanguage();
  const [meetingToast, setMeetingToast] = useState<string | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyContact | null>(null);
  const [consultationNote, setConsultationNote] = useState('');
  const [preferredSlot, setPreferredSlot] = useState('MORNING');

  const faculty: FacultyContact[] = [
    {
      id: '1',
      name: 'Smt. Neetaben R. Patel',
      guName: 'શ્રીમતી નીતાબેન આર. પટેલ',
      role: 'Class Teacher (Grade 10-A)',
      guRole: 'વર્ગ શિક્ષક (ધોરણ ૧૦-અ)',
      subject: 'Mathematics & Science',
      guSubject: 'ગણિત અને વિજ્ઞાન',
      phone: '+91 94280 33412',
      email: 'neeta.patel@adityaschool.edu.in',
      officeHours: 'Mon - Thu 03:00 PM - 04:00 PM',
      guOfficeHours: 'સોમ થી ગુરુ બપોરે ૦૩:૦૦ થી ૦૪:૦૦',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: '2',
      name: 'Shri Kaushikbhai M. Joshi',
      guName: 'શ્રી કૌશિકભાઈ એમ. જોષી',
      role: 'Senior Language Master',
      guRole: 'મુખ્ય ભાષા શિક્ષક',
      subject: 'Gujarati First Language & Sanskrit',
      guSubject: 'ગુજરાતી પ્રથમ ભાષા અને સંસ્કૃત',
      phone: '+91 98242 55671',
      email: 'kaushik.joshi@adityaschool.edu.in',
      officeHours: 'Tue & Fri 03:00 PM - 04:00 PM',
      guOfficeHours: 'મંગળ અને શુક્ર બપોરે ૦૩:૦૦ થી ૦૪:૦૦',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: '3',
      name: 'Shri Bhaveshbhai D. Trivedi',
      guName: 'શ્રી ભાવેશભાઈ ડી. ત્રિવેદી',
      role: 'Head of Science Department',
      guRole: 'વિજ્ઞાન વિભાગ પ્રમુખ',
      subject: 'Physics & Applied Laboratory',
      guSubject: 'ભૌતિક વિજ્ઞાન અને પ્રયોગશાળા',
      phone: '+91 94291 44589',
      email: 'bhavesh.trivedi@adityaschool.edu.in',
      officeHours: 'Wed 02:30 PM - 04:00 PM',
      guOfficeHours: 'બુધવાર બપોરે ૦૨:૩૦ થી ૦૪:૦૦',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: '4',
      name: 'Smt. Alpaben S. Shah',
      guName: 'શ્રીમતી અલ્પાબેન એસ. શાહ',
      role: 'Senior Faculty',
      guRole: 'વરિષ્ઠ શિક્ષિકા',
      subject: 'English & Social Science',
      guSubject: 'અંગ્રેજી અને સામાજિક વિજ્ઞાન',
      phone: '+91 98256 77120',
      email: 'alpa.shah@adityaschool.edu.in',
      officeHours: 'Mon & Thu 03:00 PM - 04:00 PM',
      guOfficeHours: 'સોમ અને ગુરુ બપોરે ૦૩:૦૦ થી ૦૪:૦૦',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    },
  ];

  const handleBookConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFaculty) return;

    const facultyDisplayName = language === 'gu' ? selectedFaculty.guName : selectedFaculty.name;
    const msg =
      language === 'gu'
        ? `${facultyDisplayName} સાથે વાલી પરામર્શ (PTM) વિનંતી સફળતાપૂર્વક મોકલવામાં આવી છે. SMS કન્ફર્મેશન મોકલેલ છે.`
        : `Parent-Teacher Consultation request sent to ${facultyDisplayName}. Confirmation SMS queued to registered mobile.`;

    setMeetingToast(msg);
    setSelectedFaculty(null);
    setConsultationNote('');
    setTimeout(() => setMeetingToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {meetingToast && (
        <div className="p-4 rounded-2xl bg-emerald-700 text-white shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{meetingToast}</span>
          </div>
          <button onClick={() => setMeetingToast(null)} className="text-white/80 hover:text-white ml-2 text-sm">
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Users className="w-5 h-5 text-amber-600" />
          <span>{language === 'gu' ? 'શિક્ષક સંપર્ક ડિરેક્ટરી અને વાલી પરામર્શ મંચ' : 'Faculty Directory & Parent Consultation Desk'}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {language === 'gu'
            ? `${currentSchool.gujarati_name || currentSchool.name} ખાતે ધોરણ ૧૦-અ ના વિષય શિક્ષકો સાથે સીધો સંપર્ક અને ૧-ઓન-૧ પરામર્શ સમય મેળવો.`
            : `Direct communication channels and 1-on-1 parent-teacher consultation booking for Grade 10-A faculty at ${currentSchool.name}.`}
        </p>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faculty.map((f) => (
          <div
            key={f.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={f.avatar}
                    alt={f.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-500/20"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {language === 'gu' ? f.guName : f.name}
                    </h3>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                      {language === 'gu' ? f.guRole : f.role} • {language === 'gu' ? f.guSubject : f.subject}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-mono font-semibold text-slate-800">{f.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-blue-600 font-medium">{f.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    {language === 'gu' ? 'મુલાકાત સમય:' : 'Office Consultation Hours:'}{' '}
                    <strong className="text-slate-700">{language === 'gu' ? f.guOfficeHours : f.officeHours}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedFaculty(f)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{language === 'gu' ? '૧-ઓન-૧ પરામર્શ બુક કરો' : 'Book 1-on-1 Consultation'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedFaculty && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedFaculty(null)}
          title={language === 'gu' ? 'વાલી-શિક્ષક પરામર્શ (PTM) બુકિંગ' : 'Schedule Parent-Teacher Consultation'}
          size="md"
        >
          <form onSubmit={handleBookConsultation} className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center space-x-3">
              <img
                src={selectedFaculty.avatar}
                alt={selectedFaculty.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <div className="text-xs font-bold text-amber-900">
                  {language === 'gu' ? selectedFaculty.guName : selectedFaculty.name}
                </div>
                <div className="text-[11px] text-amber-700">
                  {language === 'gu' ? selectedFaculty.guSubject : selectedFaculty.subject} ({selectedFaculty.phone})
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'gu' ? 'પરામર્શ સ્લોટ પસંદ કરો' : 'Preferred Consultation Time Slot'}
              </label>
              <select
                value={preferredSlot}
                onChange={(e) => setPreferredSlot(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="MORNING">
                  {language === 'gu' ? 'સવારનો સ્લોટ (11:00 AM - 11:30 AM)' : 'Morning Recess Slot (11:00 AM - 11:30 AM)'}
                </option>
                <option value="AFTERNOON">
                  {language === 'gu' ? 'બપોર પછીનો સ્લોટ (03:00 PM - 03:30 PM)' : 'After-School Slot (03:00 PM - 03:30 PM)'}
                </option>
                <option value="SATURDAY">
                  {language === 'gu' ? 'શનિવાર સત્ર (09:00 AM - 10:00 AM)' : 'Saturday PTM Window (09:00 AM - 10:00 AM)'}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'gu' ? 'ચર્ચાનો મુખ્ય વિષય / સંદેશ' : 'Consultation Topic / Student Inquiry'}
              </label>
              <textarea
                required
                rows={3}
                value={consultationNote}
                onChange={(e) => setConsultationNote(e.target.value)}
                placeholder={
                  language === 'gu'
                    ? 'વિદ્યાર્થીની શૈક્ષણિક પ્રગતિ, એકમ કસોટી અથવા વિશેષ સહાય બાબતે ટૂંકી વિગત લખો...'
                    : 'Specify queries regarding Ekam Kasoti progress, classroom performance, or special guidance...'
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedFaculty(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{language === 'gu' ? 'વિનંતી મોકલો' : 'Submit Consultation Request'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
