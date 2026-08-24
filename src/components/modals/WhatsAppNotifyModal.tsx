import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Student } from '../../types/erp';
import { erpDb } from '../../services/db';
import {
  X,
  MessageCircle,
  Cake,
  Calendar,
  Bell,
  Send,
  CheckCircle2,
  Copy,
  Users,
  AlertTriangle,
  UserCheck,
  CreditCard,
  Sparkles,
  PhoneCall,
  ExternalLink,
  Edit3,
  Check,
  ShieldCheck,
} from 'lucide-react';

export type WhatsAppMessageType = 'LEAVE' | 'BIRTHDAY' | 'ANNOUNCEMENT' | 'FEE_REMINDER' | 'EXAM';
export type EmojiStyleMode = 'SAFE_EMOJI' | 'PLAIN_TEXT';

interface WhatsAppNotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: WhatsAppMessageType;
  initialStudent?: Student | null;
  initialNoticeTitle?: string;
  initialNoticeContent?: string;
  initialNoticeAudience?: string;
  initialFeeAmount?: string;
  initialFeeTerm?: string;
}

// Utility to clean any invisible variation selectors (\uFE0F, \uFE0E) that cause  diamond question marks
export const sanitizeWhatsAppText = (text: string): string => {
  return text
    .replace(/[\uFE00-\uFE0F]/g, '') // remove variation selectors
    .replace(/✍/g, '📜')
    .replace(/⚠️/g, '🚨')
    .replace(/⏱/g, '⏰')
    .trim();
};

export const WhatsAppNotifyModal: React.FC<WhatsAppNotifyModalProps> = ({
  isOpen,
  onClose,
  initialType = 'LEAVE',
  initialStudent = null,
  initialNoticeTitle = '',
  initialNoticeContent = '',
  initialNoticeAudience = 'All Parents',
  initialFeeAmount = '14,500',
  initialFeeTerm = 'Term 1 (Academic Session 2026-27)',
}) => {
  const { currentSchool, currentUser, currentRole } = useAuth();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<WhatsAppMessageType>(initialType);
  const [emojiStyle, setEmojiStyle] = useState<EmojiStyleMode>('SAFE_EMOJI');
  const [isManualEdit, setIsManualEdit] = useState(false);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudent?.id || 'std-harsh'
  );
  const [targetPhone, setTargetPhone] = useState<string>(
    initialStudent?.parent_phone || '+91 98250 12345'
  );

  // Leave & Absence state
  const [leaveStatusType, setLeaveStatusType] = useState<'ABSENT_TODAY' | 'LEAVE_APPROVED' | 'LEAVE_REQUESTED' | 'HALF_DAY'>('ABSENT_TODAY');
  const [leaveDate, setLeaveDate] = useState('2026-08-20');
  const [leaveReason, setLeaveReason] = useState('Medical rest / Illness');

  // Birthday state
  const [birthdayWishLanguage, setBirthdayWishLanguage] = useState<'gu' | 'en'>(language === 'gu' ? 'gu' : 'en');
  const [birthdayCustomBlessing, setBirthdayCustomBlessing] = useState(
    'May you achieve glorious academic success, good health, and bright wisdom in the upcoming GSEB examinations.'
  );

  // Announcement state
  const [announcementTitle, setAnnouncementTitle] = useState(initialNoticeTitle || 'Important School Holiday & Term Examination Schedule');
  const [announcementBody, setAnnouncementBody] = useState(
    initialNoticeContent ||
      'Dear Parents,\nThis is to notify that the school will remain closed tomorrow on account of festive holiday. Term 1 Midterm examinations will commence from next Monday. Please review the detailed timetable.'
  );
  const [announcementAudience, setAnnouncementAudience] = useState(initialNoticeAudience || 'All Parents & Students');

  // Fee Reminder state
  const [feeTerm, setFeeTerm] = useState(initialFeeTerm);
  const [feeAmount, setFeeAmount] = useState(initialFeeAmount);
  const [feeDueDate, setFeeDueDate] = useState('2026-08-30');

  const [customEditableText, setCustomEditableText] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);

  const allStudents = erpDb.getStudents(currentSchool.id, 'PRINCIPAL', currentUser?.id || '');
  const activeStudent = allStudents.find((s) => s.id === selectedStudentId) || allStudents[0] || initialStudent;

  // Upcoming / Today Birthdays
  const studentsWithBirthdays = allStudents.slice(0, 5).map((s, idx) => ({
    ...s,
    displayDob: idx === 0 ? 'Today (આજે) 🎂' : `August ${21 + idx}`,
    isToday: idx === 0,
  }));

  const handleSelectStudent = (sId: string) => {
    setSelectedStudentId(sId);
    const found = allStudents.find((s) => s.id === sId);
    if (found && found.parent_phone) {
      setTargetPhone(found.parent_phone);
    }
  };

  // Generate Bulletproof Message Content (Clean Single-Codepoint Emojis or Plain Text)
  const generateMessageText = (): string => {
    const schoolName = language === 'gu' && currentSchool.gujarati_name ? currentSchool.gujarati_name : currentSchool.name;
    const stdName = activeStudent ? (language === 'gu' && activeStudent.gujarati_name ? activeStudent.gujarati_name : `${activeStudent.first_name} ${activeStudent.last_name}`) : 'Student';
    const rollNo = activeStudent?.roll_no || 1;
    const grNo = activeStudent?.gr_number || 'GR-4890';
    const parentName = activeStudent?.father_name ? `Shri ${activeStudent.father_name}` : 'Respected Parent';
    const isPlain = emojiStyle === 'PLAIN_TEXT';

    if (activeTab === 'LEAVE') {
      if (leaveStatusType === 'ABSENT_TODAY') {
        if (isPlain) {
          return `*${schoolName.toUpperCase()}*\nGSEB Index: ${currentSchool.gseb_index || '64.082'}\n\n[વિદ્યાર્થી દૈનિક ગેરહાજરી સૂચના]\n\nઆદરણીય વાલીશ્રી (${parentName}),\nઆપના પાલ્ય *${stdName}* (રોલ નં: ${rollNo}, જી.આર. નં: ${grNo}) આજે તારીખ *${leaveDate}* ના રોજ શાળામાં *ગેરહાજર* નોંધાયેલ છે.\n\nજો આપ દ્વારા કોઈ રજા પત્ર મોકલાવેલ ન હોય, તો કૃપા કરીને વર્ગ શિક્ષક અથવા શાળા કાર્યાલયનો તાત્કાલિક સંપર્ક કરવો.\n\nહેલ્પલાઇન: ${currentSchool.phone}\n*આચાર્યશ્રી / વર્ગ શિક્ષક*\n_${schoolName}_`;
        }
        return `🏫 *${schoolName}*\n📌 *GSEB Index:* ${currentSchool.gseb_index || '64.082'}\n\n🚨 *વિદ્યાર્થી દૈનિક ગેરહાજરી સૂચના (Absence Alert)*\n\nઆદરણીય વાલીશ્રી (${parentName}),\nઆપના પાલ્ય *${stdName}* (રોલ નં: ${rollNo}, જી.આર. નં: ${grNo}) આજે તારીખ *${leaveDate}* ના રોજ શાળામાં *ગેરહાજર* નોંધાયેલ છે.\n\nજો આપ દ્વારા કોઈ રજા પત્ર મોકલાવેલ ન હોય, તો કૃપા કરીને વર્ગ શિક્ષક અથવા શાળા કાર્યાલયનો તાત્કાલિક સંપર્ક કરવો.\n\n📞 હેલ્પલાઇન: ${currentSchool.phone}\n📜 *આચાર્યશ્રી / વર્ગ શિક્ષક*\n_${schoolName}_`;
      } else if (leaveStatusType === 'LEAVE_APPROVED') {
        if (isPlain) {
          return `*${schoolName.toUpperCase()}*\n\n[રજા અરજી મંજૂરી પત્ર]\n\nનમસ્તે વાલીશ્રી,\nઆપના પાલ્ય *${stdName}* (ધોરણ ૧૦, રોલ નં: ${rollNo}) ની તારીખ *${leaveDate}* ની રજાની અરજી (${leaveReason}) શાળા તંત્ર દ્વારા *મંજૂર* કરવામાં આવી છે.\n\nઆપના બાળકના સ્વાસ્થ્ય અને અભ્યાસની સુખાકારી માટે શુભેચ્છાઓ.\n\n*આચાર્યશ્રી*\n_${schoolName}_`;
        }
        return `🏫 *${schoolName}*\n\n✅ *રજા અરજી મંજૂરી પત્ર (Leave Approved)*\n\nનમસ્તે વાલીશ્રી,\nઆપના પાલ્ય *${stdName}* (ધોરણ ૧૦, રોલ નં: ${rollNo}) ની તારીખ *${leaveDate}* ની રજાની અરજી (${leaveReason}) શાળા તંત્ર દ્વારા *મંજૂર* કરવામાં આવી છે.\n\nઆપના બાળકના સ્વાસ્થ્ય અને અભ્યાસની સુખાકારી માટે શુભેચ્છાઓ.\n\n📜 *આચાર્યશ્રી*\n_${schoolName}_`;
      } else if (leaveStatusType === 'HALF_DAY') {
        if (isPlain) {
          return `*${schoolName.toUpperCase()}*\n\n[અર્ધ દિવસ રજા નોંધ - ગેટ પાસ]\n\nઆદરણીય વાલીશ્રી,\nવિદ્યાર્થી *${stdName}* ને તારીખ *${leaveDate}* ના રોજ વિનંતી અનુસાર અર્ધ દિવસ રજા (ગેટ પાસ) આપવામાં આવેલ છે.\n\n*કાર્યાલય અધિક્ષક*\n_${schoolName}_`;
        }
        return `🏫 *${schoolName}*\n\n⏰ *અર્ધ દિવસ રજા નોંધ (Half-Day Gate Pass)*\n\nઆદરણીય વાલીશ્રી,\nવિદ્યાર્થી *${stdName}* ને તારીખ *${leaveDate}* ના રોજ વિનંતી અનુસાર અર્ધ દિવસ રજા (ગેટ પાસ) આપવામાં આવેલ છે.\n\n📜 *કાર્યાલય અધિક્ષક*\n_${schoolName}_`;
      } else {
        return `*${schoolName}*\n\n[વિદ્યાર્થી રજા અરજી નોંધ]\n\nવિદ્યાર્થીનું નામ: *${stdName}*\nરોલ નં: ${rollNo}\nતારીખ: ${leaveDate}\nકારણ: ${leaveReason}\n\nઆભાર,\n_${schoolName}_`;
      }
    }

    if (activeTab === 'BIRTHDAY') {
      if (birthdayWishLanguage === 'gu') {
        if (isPlain) {
          return `*જન્મદિવસની હાર્દિક શુભેચ્છાઓ!*\n\nશાળા પરિવાર: *${schoolName}*\n\nપ્રિય વિદ્યાર્થી *${stdName}*,\nઆજના આપના શુભ જન્મદિવસે શાળા સંચાલક મંડળ, આચાર્યશ્રી તથા સમગ્ર શિક્ષકગણ તરફથી આપને દીર્ઘાયુ, ઉત્તમ સ્વાસ્થ્ય અને તેજસ્વી કારકિર્દી માટે અંતઃકરણપૂર્વક શુભકામનાઓ!\n\n*શુભાશિષ:* ${birthdayCustomBlessing}\n\nસર્વદા પ્રસન્ન રહો અને ગુજરાત બોર્ડ પરીક્ષામાં ઉચ્ચ પરિણામ પ્રાપ્ત કરો.\n\n*સ્નેહાશિષ સહ,*\n*આચાર્યશ્રી અને શિક્ષક પરિવાર*\n_${schoolName}_`;
        }
        return `🎉🎂 *જન્મદિવસની હાર્દિક શુભેચ્છાઓ!* 🎂🎉\n\nશાળા પરિવાર: *${schoolName}*\n\nપ્રિય વિદ્યાર્થી *${stdName}*,\nઆજના આપના શુભ જન્મદિવસે શાળા સંચાલક મંડળ, આચાર્યશ્રી તથા સમગ્ર શિક્ષકગણ તરફથી આપને દીર્ઘાયુ, ઉત્તમ સ્વાસ્થ્ય અને તેજસ્વી કારકિર્દી માટે અંતઃકરણપૂર્વક શુભકામનાઓ!\n\n✨ *શુભાશિષ:* ${birthdayCustomBlessing}\n\nસર્વદા પ્રસન્ન રહો અને ગુજરાત બોર્ડ પરીક્ષામાં ઉચ્ચ પરિણામ પ્રાપ્ત કરો.\n\n💐 *સ્નેહાશિષ સહ,*\n*આચાર્યશ્રી અને શિક્ષક પરિવાર*\n_${schoolName}_`;
      } else {
        if (isPlain) {
          return `*HAPPY BIRTHDAY WISHES!*\n\nFrom: *${schoolName}*\n\nDear Student *${stdName}* (Roll #${rollNo}),\nOn behalf of the Management, Principal, and all Teachers, we wish you a joyous and blessed Birthday!\n\n*Blessings:* ${birthdayCustomBlessing}\n\nMay this year bring immense knowledge, success, and high honors in your academics!\n\nWarm Regards,\n*Principal & Faculty Team*\n_${schoolName}_`;
        }
        return `🎉🎂 *HAPPY BIRTHDAY WISHES!* 🎂🎉\n\nFrom: *${schoolName}*\n\nDear Student *${stdName}* (Roll #${rollNo}),\nOn behalf of the Management, Principal, and all Teachers, we wish you a joyous and blessed Birthday!\n\n🌟 *Blessings:* ${birthdayCustomBlessing}\n\nMay this year bring immense knowledge, success, and high honors in your academics!\n\nWarm Regards,\n*Principal & Faculty Team*\n_${schoolName}_`;
      }
    }

    if (activeTab === 'ANNOUNCEMENT') {
      if (isPlain) {
        return `[સત્તાવાર શાળા પરિપત્ર / નોટિસ]\n*${schoolName}*\nતારીખ: ${new Date().toLocaleDateString()}\nશ્રોતાઓ: ${announcementAudience}\n\n*વિષય: ${announcementTitle}*\n\n${announcementBody}\n\nકૃપા કરીને આ નોંધની ગંભીર નોંધ લેવી અને સમયસર સહકાર આપવો.\n\nસંપર્ક: ${currentSchool.phone} | ${currentSchool.email}\n*આચાર્યશ્રીની કચેરી*\n_${schoolName}_`;
      }
      return `📢 *સત્તાવાર શાળા પરિપત્ર / નોટિસ (Official Circular)*\n🏫 *${schoolName}*\n📅 *તારીખ:* ${new Date().toLocaleDateString()}\n👥 *શ્રોતાઓ:* ${announcementAudience}\n\n📌 *વિષય: ${announcementTitle}*\n\n${announcementBody}\n\nકૃપા કરીને આ નોંધની ગંભીર નોંધ લેવી અને સમયસર સહકાર આપવો.\n\n📞 સંપર્ક: ${currentSchool.phone} | ${currentSchool.email}\n📜 *આચાર્યશ્રીની કચેરી*\n_${schoolName}_`;
    }

    if (activeTab === 'FEE_REMINDER') {
      if (isPlain) {
        return `[શાળા ફી ચુકવણી સ્મરણપત્ર]\n*${schoolName}*\n\nઆદરણીય વાલીશ્રી (${parentName}),\nઆપના પાલ્ય *${stdName}* (જી.આર. નં: ${grNo}, રોલ નં: ${rollNo}) ની ${feeTerm} ની બાકી રહેલ ફીની રકમ *₹${feeAmount}* ભરવાની છેલ્લી તારીખ *${feeDueDate}* છે.\n\nશાળા ફી કાઉન્ટર પર રોકડ/ચેક અથવા પોર્ટલ દ્વારા ઓનલાઇન UPI/QR કોડથી જમા કરાવી રસીદ મેળવી લેવી.\n\nહેલ્પલાઇન: ${currentSchool.phone}\n*નાણાકીય વિભાગ*\n_${schoolName}_`;
      }
      return `💰 *શાળા ફી ચુકવણી સ્મરણપત્ર (Fee Reminder Notice)*\n🏫 *${schoolName}*\n\nઆદરણીય વાલીશ્રી (${parentName}),\nઆપના પાલ્ય *${stdName}* (જી.આર. નં: ${grNo}, રોલ નં: ${rollNo}) ની ${feeTerm} ની બાકી રહેલ ફીની રકમ *₹${feeAmount}* ભરવાની છેલ્લી તારીખ *${feeDueDate}* છે.\n\nશાળા ફી કાઉન્ટર પર રોકડ/ચેક અથવા પોર્ટલ દ્વારા ઓનલાઇન UPI/QR કોડથી જમા કરાવી રસીદ મેળવી લેવી.\n\n📞 હેલ્પલાઇન: ${currentSchool.phone}\n📜 *નાણાકીય વિભાગ*\n_${schoolName}_`;
    }

    return `🏫 *${schoolName} Notification*\n\nDear Parents,\nPlease review student updates on the portal.\n\nRegards,\n${schoolName}`;
  };

  const generatedText = generateMessageText();
  const currentMessageText = isManualEdit ? customEditableText : generatedText;

  // Keep manual text in sync when switching template if not edited
  useEffect(() => {
    if (!isManualEdit) {
      setCustomEditableText(generatedText);
    }
  }, [generatedText, isManualEdit]);

  if (!isOpen) return null;

  const handleSendWhatsApp = () => {
    // Format phone number (strip whitespace, +, etc)
    const cleanedPhone = targetPhone.replace(/[^0-9]/g, '');
    const cleanText = sanitizeWhatsAppText(currentMessageText);
    const encodedText = encodeURIComponent(cleanText);

    let url = '';
    if (cleanedPhone && cleanedPhone.length >= 10) {
      const fullPhone = cleanedPhone.startsWith('91') && cleanedPhone.length > 10 ? cleanedPhone : `91${cleanedPhone}`;
      url = `https://wa.me/${fullPhone}?text=${encodedText}`;
    } else {
      url = `https://wa.me/?text=${encodedText}`;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyMessage = () => {
    const cleanText = sanitizeWhatsAppText(currentMessageText);
    navigator.clipboard?.writeText?.(cleanText);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[94vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center space-x-2">
                <span>{language === 'gu' ? 'વોટ્સએપ સૂચના અને પ્રસારણ કેન્દ્ર' : 'WhatsApp Notification & Broadcast Hub'}</span>
                <span className="text-[10px] bg-emerald-900/60 font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1 border border-emerald-400/40">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  <span>100% Zero-Glitch Unicode</span>
                </span>
              </h2>
              <p className="text-xs text-emerald-100 opacity-90">
                {language === 'gu'
                  ? 'ગેરહાજરી, જન્મદિવસની શુભેચ્છાઓ અને શાળા પરિપત્રો ૧-ક્લિકમાં વાલીના વોટ્સએપ પર મોકલો.'
                  : 'Send real-time Absence alerts, Birthday wishes, Circulars, and Fee notes directly to WhatsApp.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation & Mode Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-2.5 bg-slate-50 border-b border-slate-200 gap-2 shrink-0">
          <div className="flex items-center overflow-x-auto gap-2">
            {[
              { id: 'LEAVE', label: language === 'gu' ? 'રજા / ગેરહાજરી સૂચના' : 'Leave & Absence Alert', icon: AlertTriangle, color: 'text-rose-600' },
              { id: 'BIRTHDAY', label: language === 'gu' ? 'જન્મદિવસની શુભેચ્છાઓ 🎂' : 'Birthday Wishes 🎂', icon: Cake, color: 'text-amber-600' },
              { id: 'ANNOUNCEMENT', label: language === 'gu' ? 'શાળા પરિપત્ર / નોટિસ 📢' : 'Notice / Announcement 📢', icon: Bell, color: 'text-indigo-600' },
              { id: 'FEE_REMINDER', label: language === 'gu' ? 'ફી સ્મરણપત્ર 💰' : 'Fee Reminder 💰', icon: CreditCard, color: 'text-emerald-600' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as WhatsAppMessageType);
                    setIsManualEdit(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Emoji Style Toggle: Safe Universal vs Plain Text */}
          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setEmojiStyle('SAFE_EMOJI');
                setIsManualEdit(false);
              }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
                emojiStyle === 'SAFE_EMOJI'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Uses tested single-codepoint emojis that never show  diamond question marks"
            >
              <span>✨ {language === 'gu' ? 'સુરક્ષિત ઇમોજી' : 'Safe Emoji'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmojiStyle('PLAIN_TEXT');
                setIsManualEdit(false);
              }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
                emojiStyle === 'PLAIN_TEXT'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="100% Plain Text with no emojis at all"
            >
              <span>📄 {language === 'gu' ? 'શુદ્ધ લખાણ (No Emojis)' : 'Plain Text'}</span>
            </button>
          </div>
        </div>

        {/* Main Body Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form Panel */}
          <div className="lg:col-span-6 space-y-4">
            {/* Student Selector (For Leave, Birthday, Fee) */}
            {(activeTab === 'LEAVE' || activeTab === 'BIRTHDAY' || activeTab === 'FEE_REMINDER') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    {language === 'gu' ? 'વિદ્યાર્થી પસંદ કરો:' : 'Target Student:'}
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {allStudents.length} {language === 'gu' ? 'વિદ્યાર્થીઓ' : 'Registered'}
                  </span>
                </div>

                <select
                  value={selectedStudentId}
                  onChange={(e) => handleSelectStudent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {allStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      #{st.roll_no} - {st.gujarati_name || `${st.first_name} ${st.last_name}`} ({st.gr_number}) • {st.parent_phone}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* TAB 1: LEAVE & ABSENCE CONFIG */}
            {activeTab === 'LEAVE' && (
              <div className="space-y-3.5 p-4 rounded-2xl border border-rose-100 bg-rose-50/40">
                <div className="text-xs font-bold text-rose-900 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{language === 'gu' ? 'ગેરહાજરી / રજા સંદેશનો પ્રકાર' : 'Absence / Leave Notification Type'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ABSENT_TODAY', label: language === 'gu' ? 'આજે ગેરહાજર (Absence)' : 'Absent Today' },
                    { id: 'LEAVE_APPROVED', label: language === 'gu' ? 'રજા મંજૂર (Approved)' : 'Leave Approved' },
                    { id: 'HALF_DAY', label: language === 'gu' ? 'અર્ધ દિવસ (Gate Pass)' : 'Half-Day Gate Pass' },
                    { id: 'LEAVE_REQUESTED', label: language === 'gu' ? 'રજા નોંધ (Leave Note)' : 'Leave Note Sent' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setLeaveStatusType(t.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer ${
                        leaveStatusType === t.id
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {language === 'gu' ? 'તારીખ' : 'Date'}
                    </label>
                    <input
                      type="date"
                      value={leaveDate}
                      onChange={(e) => setLeaveDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {language === 'gu' ? 'કારણ / નોંધ' : 'Reason / Note'}
                    </label>
                    <input
                      type="text"
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      placeholder="e.g. Sickness / Family Event"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BIRTHDAY CONFIG */}
            {activeTab === 'BIRTHDAY' && (
              <div className="space-y-3.5 p-4 rounded-2xl border border-amber-200 bg-amber-50/50">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                    <Cake className="w-4 h-4 text-amber-600" />
                    <span>{language === 'gu' ? 'આજના જન્મદિવસ (Celebrations)' : 'Active Birthday Stars'}</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-amber-200">
                    <button
                      type="button"
                      onClick={() => setBirthdayWishLanguage('gu')}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                        birthdayWishLanguage === 'gu' ? 'bg-amber-500 text-white' : 'text-slate-600'
                      }`}
                    >
                      ગુજરાતી
                    </button>
                    <button
                      type="button"
                      onClick={() => setBirthdayWishLanguage('en')}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                        birthdayWishLanguage === 'en' ? 'bg-amber-500 text-white' : 'text-slate-600'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-600">
                    {language === 'gu' ? 'ત્વરિત પસંદગી (આજના અને આગામી જન્મદિવસો):' : 'Upcoming Student Birthdays:'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {studentsWithBirthdays.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleSelectStudent(st.id)}
                        className={`p-2 rounded-xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                          selectedStudentId === st.id
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="truncate">
                          <div className="font-bold text-xs truncate">
                            {st.gujarati_name || `${st.first_name} ${st.last_name}`}
                          </div>
                          <div className="text-[10px] opacity-80">{st.displayDob}</div>
                        </div>
                        <Cake className="w-3.5 h-3.5 shrink-0 ml-1 opacity-90" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {language === 'gu' ? 'વિશેષ આશીર્વાદ / સંદેશ' : 'Custom Blessing / Note'}
                  </label>
                  <textarea
                    rows={2}
                    value={birthdayCustomBlessing}
                    onChange={(e) => setBirthdayCustomBlessing(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: ANNOUNCEMENT CONFIG */}
            {activeTab === 'ANNOUNCEMENT' && (
              <div className="space-y-3 p-4 rounded-2xl border border-indigo-100 bg-indigo-50/40">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'gu' ? 'પરિપત્ર શીર્ષક' : 'Notice Headline'}
                  </label>
                  <input
                    type="text"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'gu' ? 'લક્ષિત શ્રોતાઓ' : 'Target Audience'}
                  </label>
                  <input
                    type="text"
                    value={announcementAudience}
                    onChange={(e) => setAnnouncementAudience(e.target.value)}
                    placeholder="All Parents, Class 10 Students..."
                    className="w-full px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'gu' ? 'પરિપત્રની મુખ્ય વિગતો' : 'Circular Content Details'}
                  </label>
                  <textarea
                    rows={4}
                    value={announcementBody}
                    onChange={(e) => setAnnouncementBody(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: FEE REMINDER CONFIG */}
            {activeTab === 'FEE_REMINDER' && (
              <div className="space-y-3 p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {language === 'gu' ? 'સત્ર (Term)' : 'Academic Term'}
                    </label>
                    <input
                      type="text"
                      value={feeTerm}
                      onChange={(e) => setFeeTerm(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {language === 'gu' ? 'બાકી રકમ (₹)' : 'Due Amount (₹)'}
                    </label>
                    <input
                      type="text"
                      value={feeAmount}
                      onChange={(e) => setFeeAmount(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold font-mono bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {language === 'gu' ? 'છેલ્લી તારીખ (Due Date)' : 'Payment Deadline'}
                  </label>
                  <input
                    type="date"
                    value={feeDueDate}
                    onChange={(e) => setFeeDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Target Phone Number Input */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'gu' ? 'વાલીનો વોટ્સએપ મોબાઈલ નંબર:' : 'Parent WhatsApp Mobile Number:'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="+91 98250 12345"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <PhoneCall className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Right Live WhatsApp Message Preview & Direct Edit */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-inner space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-200">
                    {language === 'gu' ? 'વોટ્સએપ લાઈવ પ્રિવ્યુ' : 'Live WhatsApp Chat Preview'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsManualEdit(!isManualEdit)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                      isManualEdit
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                    title="Click to manually edit the message text before sending"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isManualEdit ? (language === 'gu' ? 'ટેક્સ્ટ એડિટિંગ સક્રિય' : 'Editing') : (language === 'gu' ? 'એડિટ કરો' : 'Edit Text')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedToast ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>
              </div>

              {/* Chat Bubble / Live Editable Box */}
              {isManualEdit ? (
                <div>
                  <textarea
                    rows={12}
                    value={customEditableText}
                    onChange={(e) => setCustomEditableText(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-[#075E54]/30 border border-[#128C7E]/60 text-emerald-50 font-sans text-xs sm:text-[13px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <div className="text-[11px] text-emerald-400/80 mt-1 flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>{language === 'gu' ? 'આપ મેસેજમાં સીધા ફેરફારો કરી શકો છો.' : 'Directly edit message text above before sending.'}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#075E54]/20 border border-[#128C7E]/40 text-emerald-100 font-sans text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap rounded-tr-none shadow-md">
                  {currentMessageText}
                </div>
              )}
            </div>

            {/* Quick Actions & Instant Send Button */}
            <div className="pt-4 border-t border-slate-800 space-y-2.5">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-slate-950" />
                <span>
                  {language === 'gu'
                    ? 'વોટ્સએપ પર સીધો મેસેજ મોકલો (Open WhatsApp)'
                    : 'Dispatch Message via WhatsApp'}
                </span>
                <ExternalLink className="w-4 h-4 ml-1" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'gu' ? '૧૦૦% શુદ્ધ યુનિકોડ - કોઈ એરર નહિ' : 'Sanitized for Windows & Mobile WhatsApp'}</span>
                </span>
                <span>{targetPhone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
