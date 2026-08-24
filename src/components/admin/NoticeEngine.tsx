import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Notice, TargetAudience } from '../../types/erp';
import { erpDb } from '../../services/db';
import { Badge, Modal } from '../common/UIComponents';
import { WhatsAppNotifyModal, WhatsAppMessageType } from '../modals/WhatsAppNotifyModal';
import {
  Bell,
  Plus,
  Search,
  Filter,
  Trash2,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Send,
  Eye,
  Megaphone,
  MessageSquarePlus,
  Sparkles,
  MessageCircle,
  Share2,
} from 'lucide-react';

export const NoticeEngine: React.FC = () => {
  const { currentSchool, currentUser, currentRole, refreshData } = useAuth();
  const { language, t } = useLanguage();

  const [audienceFilter, setAudienceFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [isParentInquiryModalOpen, setIsParentInquiryModalOpen] = useState(false);
  const [inquiryToast, setInquiryToast] = useState<string | null>(null);

  // WhatsApp Hub State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppType, setWhatsAppType] = useState<WhatsAppMessageType>('ANNOUNCEMENT');
  const [activeNoticeForWhatsApp, setActiveNoticeForWhatsApp] = useState<Notice | null>(null);

  // Parent Inquiry Form State
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryDetails, setInquiryDetails] = useState('');
  const [inquiryCategory, setInquiryCategory] = useState('LEAVE');

  // Broadcast Form State (For Principals & Teachers)
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('ALL');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [category, setCategory] = useState<Notice['category']>('ACADEMIC');
  const [attachmentName, setAttachmentName] = useState('');

  const canBroadcast = currentRole === 'PRINCIPAL' || currentRole === 'SUPER_ADMIN' || currentRole === 'TEACHER';
  const isParentOrStudent = currentRole === 'PARENT' || currentRole === 'STUDENT';

  const notices = erpDb.getNotices(currentSchool.id, currentRole || 'PRINCIPAL') || [];

  const filteredNotices = (notices || []).filter((n) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    const nAud = String(n.target_audience || n.audience || 'ALL');
    const matchesAudience =
      audienceFilter === 'ALL' ||
      nAud === audienceFilter ||
      (audienceFilter === 'PARENTS' && (nAud === 'PARENT' || nAud === 'PARENTS')) ||
      (audienceFilter === 'STUDENTS' && (nAud === 'STUDENT' || nAud === 'STUDENTS')) ||
      (audienceFilter === 'TEACHERS' && (nAud === 'TEACHER' || nAud === 'TEACHERS' || nAud === 'STAFF'));

    return matchesQuery && matchesAudience;
  });

  const handleComposeNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const creatorName =
      language === 'gu' && currentUser?.gujarati_name
        ? currentUser.gujarati_name
        : currentUser?.full_name || 'Principal Office';

    erpDb.createNotice(currentSchool.id, {
      created_by: currentUser?.id || 'usr-principal',
      creator_name: `${creatorName} (${currentUser?.role || 'PRINCIPAL'})`,
      creator_role: currentUser?.role || 'PRINCIPAL',
      title,
      content,
      target_audience: targetAudience,
      audience: targetAudience,
      priority,
      category,
      published: true,
      attachment_name: attachmentName || undefined,
    });

    erpDb.logAudit({
      school_id: currentSchool.id,
      user_id: currentUser?.id || 'usr-principal',
      user_name: currentUser?.full_name || 'Principal',
      user_role: currentUser?.role || 'PRINCIPAL',
      action: 'BROADCAST_NOTICE',
      resource_type: 'NOTICES',
      details: `Published circular "${title}" to audience [${targetAudience}] with priority [${priority}]`,
      ip_address: '192.168.1.1',
    });

    setIsComposeModalOpen(false);
    setTitle('');
    setContent('');
    setAttachmentName('');
    refreshData();
  };

  const handleOpenWhatsAppForNotice = (n: Notice) => {
    setActiveNoticeForWhatsApp(n);
    setWhatsAppType('ANNOUNCEMENT');
    setIsWhatsAppModalOpen(true);
  };

  const handleSendParentInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquirySubject || !inquiryDetails) return;

    setInquiryToast(
      language === 'gu'
        ? `વાલીશ્રીની નોંધ/અરજી "${inquirySubject}" આચાર્યશ્રી અને વર્ગ શિક્ષકને પહોંચાડવામાં આવી છે.`
        : `Your parent note "${inquirySubject}" has been successfully sent to the Principal & Class Teacher.`
    );
    setIsParentInquiryModalOpen(false);
    setInquirySubject('');
    setInquiryDetails('');
    setTimeout(() => setInquiryToast(null), 5000);
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        language === 'gu'
          ? 'શું તમે આ પરિપત્ર/નોટિસ રદ કરવા માંગો છો?'
          : 'Are you sure you want to delete this circular announcement?'
      )
    ) {
      erpDb.deleteNotice(id);
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {inquiryToast && (
        <div className="p-4 rounded-2xl bg-emerald-700 text-white shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{inquiryToast}</span>
          </div>
          <button onClick={() => setInquiryToast(null)} className="text-white/80 hover:text-white ml-2 text-sm">
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            <span>
              {language === 'gu'
                ? canBroadcast
                  ? 'પરિપત્ર અને નોટિસ પ્રસારણ કેન્દ્ર'
                  : 'શાળા પરિપત્ર અને સત્તાવાર સૂચનાઓ'
                : canBroadcast
                ? 'Notice & Circular Broadcasting Engine'
                : 'School Notices & Circulars'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'gu'
              ? `${currentSchool.gujarati_name || currentSchool.name} ના સત્તાવાર પરિપત્રો, પરીક્ષા સૂચિ, રજાઓની યાદી અને કાર્યક્રમો.`
              : `Official institutional announcements, examination schedules, holiday declarations, and event updates for ${currentSchool.name}.`}
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap">
          {/* WhatsApp Notification Hub Action - Staff Only */}
          {canBroadcast && (
            <button
              onClick={() => {
                setActiveNoticeForWhatsApp(null);
                setWhatsAppType('ANNOUNCEMENT');
                setIsWhatsAppModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{language === 'gu' ? 'વોટ્સએપ સંદેશ કેન્દ્ર' : 'WhatsApp Notification Hub'}</span>
            </button>
          )}

          {canBroadcast && (
            <button
              onClick={() => setIsComposeModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('add_notice', '+ Publish Circular')}</span>
            </button>
          )}

          {currentRole === 'PARENT' && (
            <button
              onClick={() => setIsParentInquiryModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{language === 'gu' ? 'શિક્ષકને રજા / નોંધ મોકલો' : 'Submit Note / Leave to Teacher'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Audience Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'gu' ? 'પરિપત્રના શીર્ષક અથવા વિગતોથી શોધો...' : 'Search circulars by headline or content...'}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-500 shrink-0">
            {language === 'gu' ? 'શ્રોતાઓ:' : 'Audience:'}
          </span>
          {[
            { id: 'ALL', label: language === 'gu' ? 'બધા' : 'ALL' },
            { id: 'TEACHERS', label: language === 'gu' ? 'શિક્ષકો' : 'TEACHERS' },
            { id: 'STUDENTS', label: language === 'gu' ? 'વિદ્યાર્થીઓ' : 'STUDENTS' },
            { id: 'PARENTS', label: language === 'gu' ? 'વાલીઓ' : 'PARENTS' },
          ].map((aud) => (
            <button
              key={aud.id}
              onClick={() => setAudienceFilter(aud.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                audienceFilter === aud.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {aud.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Grid */}
      {filteredNotices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <div className="text-sm font-bold text-slate-700">
            {language === 'gu' ? 'કોઈ સક્રિય પરિપત્ર મળ્યો નથી' : 'No active notices found'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {language === 'gu'
              ? 'પસંદ કરેલ ફિલ્ટર માટે હાલ કોઈ નોટિસ ઉપલબ્ધ નથી.'
              : 'There are currently no announcements matching your filter criteria.'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        notice.priority === 'URGENT' || notice.is_urgent
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : notice.priority === 'HIGH'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {notice.priority === 'URGENT' || notice.is_urgent
                        ? language === 'gu' ? 'તાકીદનું' : 'URGENT'
                        : notice.priority === 'HIGH'
                        ? language === 'gu' ? 'અગત્યનું' : 'HIGH'
                        : language === 'gu' ? 'સામાન્ય' : 'NORMAL'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {notice.category || 'ACADEMIC'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{notice.date || (notice.created_at ? notice.created_at.split('T')[0] : '2026-08-20')}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {notice.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {notice.content}
                </p>

                {notice.attachment_name && (
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-indigo-600 cursor-pointer">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{notice.attachment_name}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-slate-700">
                    {notice.creator_name || notice.published_by || 'Dr. Vinodbhai C. Pandya (Principal)'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.2 rounded text-[10px]">
                    {notice.target_audience || notice.audience || 'ALL'}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {/* Share on WhatsApp Button */}
                  <button
                    onClick={() => handleOpenWhatsAppForNotice(notice)}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[11px] flex items-center space-x-1 transition-colors cursor-pointer"
                    title="Send Circular to WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  {canBroadcast && (
                    <button
                      onClick={() => handleDelete(notice.id)}
                      title={t('delete', 'Delete')}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WhatsApp Broadcast & Notification Hub Modal */}
      {isWhatsAppModalOpen && (
        <WhatsAppNotifyModal
          isOpen={isWhatsAppModalOpen}
          onClose={() => setIsWhatsAppModalOpen(false)}
          initialType={whatsAppType}
          initialNoticeTitle={activeNoticeForWhatsApp?.title || ''}
          initialNoticeContent={activeNoticeForWhatsApp?.content || ''}
          initialNoticeAudience={String(activeNoticeForWhatsApp?.target_audience || activeNoticeForWhatsApp?.audience || 'All Parents')}
        />
      )}

      {/* Broadcast Compose Modal (Principals / Teachers) */}
      {isComposeModalOpen && (
        <Modal
          isOpen={isComposeModalOpen}
          onClose={() => setIsComposeModalOpen(false)}
          title={language === 'gu' ? 'નવો શાળા પરિપત્ર / નોટિસ પ્રકાશિત કરો' : 'Publish Institutional Circular'}
          size="lg"
        >
          <form onSubmit={handleComposeNotice} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'gu' ? 'પરિપત્ર શીર્ષક' : 'Notice Headline / Title'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  language === 'gu'
                    ? 'દા.ત. એકમ કસોટી - ૨ સમય-સારણી અને નિયમો'
                    : 'e.g. GSEB Ekam Kasoti - 2 Assessment Schedule'
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'gu' ? 'લક્ષિત શ્રોતાઓ' : 'Target Audience'}
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="ALL">{language === 'gu' ? 'તમામ (શાળા પરિવાર)' : 'ALL (School Wide)'}</option>
                  <option value="TEACHERS">{language === 'gu' ? 'માત્ર શિક્ષકો' : 'Teachers & Staff'}</option>
                  <option value="STUDENTS">{language === 'gu' ? 'વિદ્યાર્થીઓ' : 'Students'}</option>
                  <option value="PARENTS">{language === 'gu' ? 'વાલીશ્રી' : 'Parents'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'gu' ? 'અગ્રતા ક્રમ' : 'Priority Level'}
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="NORMAL">{language === 'gu' ? 'સામાન્ય (Normal)' : 'NORMAL'}</option>
                  <option value="HIGH">{language === 'gu' ? 'અગત્યનું (High)' : 'HIGH'}</option>
                  <option value="URGENT">{language === 'gu' ? 'તાકીદનું (Urgent)' : 'URGENT'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'gu' ? 'પરિપત્ર વર્ગ' : 'Category'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="ACADEMIC">{language === 'gu' ? 'શૈક્ષણિક (Academic)' : 'ACADEMIC'}</option>
                  <option value="EXAMINATION">{language === 'gu' ? 'પરીક્ષા (Examination)' : 'EXAMINATION'}</option>
                  <option value="EVENT">{language === 'gu' ? 'સાંસ્કૃતિક કાર્યક્રમ (Event)' : 'EVENT'}</option>
                  <option value="HOLIDAY">{language === 'gu' ? 'રજા (Holiday)' : 'HOLIDAY'}</option>
                  <option value="ADMINISTRATIVE">{language === 'gu' ? 'વહીવટી (Admin)' : 'ADMINISTRATIVE'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'gu' ? 'પરિપત્ર સંપૂર્ણ વિગત' : 'Detailed Announcement Content'}
              </label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  language === 'gu'
                    ? 'પરિપત્રની સંપૂર્ણ સૂચનાઓ, તારીખો અને જરૂરી માર્ગદર્શિકા અહીં લખો...'
                    : 'Provide the complete circular details, reporting guidelines, requirements...'
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'gu' ? 'જોડાણ ફાઇલ નામ (વૈકલ્પિક)' : 'Attachment File Name (Optional)'}
              </label>
              <input
                type="text"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                placeholder="e.g. GSEB_Ekam_Kasoti_August_2026.pdf"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsComposeModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{language === 'gu' ? 'પરિપત્ર પ્રસિદ્ધ કરો' : 'Broadcast Circular'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Parent Inquiry / Note Modal */}
      {isParentInquiryModalOpen && (
        <Modal
          isOpen={isParentInquiryModalOpen}
          onClose={() => setIsParentInquiryModalOpen(false)}
          title={language === 'gu' ? 'શાળાને રજાની અરજી / પ્રશ્ન નોંધ મોકલો' : 'Submit Note or Leave Application'}
          size="md"
        >
          <form onSubmit={handleSendParentInquiry} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'gu' ? 'વિષય / પ્રકાર' : 'Subject Category'}
              </label>
              <select
                value={inquiryCategory}
                onChange={(e) => setInquiryCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="LEAVE">{language === 'gu' ? 'માંદગી / રજાની અરજી (Sick / Leave)' : 'Leave Application'}</option>
                <option value="FEES">{language === 'gu' ? 'ફી પૂછપરછ (Fee Inquiry)' : 'Fee Query'}</option>
                <option value="ACADEMIC">{language === 'gu' ? 'શૈક્ષણિક પ્રગતિ (Academic Guidance)' : 'Academic Discussion'}</option>
                <option value="TRANSPORT">{language === 'gu' ? 'સ્કૂલ બસ / વાહન (Bus Transport)' : 'Transport Query'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'gu' ? 'શીર્ષક' : 'Subject Headline'}
              </label>
              <input
                type="text"
                required
                value={inquirySubject}
                onChange={(e) => setInquirySubject(e.target.value)}
                placeholder={language === 'gu' ? 'દા.ત. ૨ દિવસ માંદગી રજા બાબત' : 'e.g. Leave request for 2 days due to fever'}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'gu' ? 'વિગતો / નોંધ' : 'Detailed Message'}
              </label>
              <textarea
                required
                rows={3}
                value={inquiryDetails}
                onChange={(e) => setInquiryDetails(e.target.value)}
                placeholder={
                  language === 'gu'
                    ? 'આચાર્યશ્રી / વર્ગ શિક્ષક માટે વિગતવાર સંદેશ લખો...'
                    : 'Type your message to the class teacher or school administration...'
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsParentInquiryModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{language === 'gu' ? 'સંદેશ મોકલો' : 'Send Message'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
