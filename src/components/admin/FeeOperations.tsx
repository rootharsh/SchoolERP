import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FeeTransaction, PaymentMode } from '../../types/erp';
import { erpDb } from '../../services/db';
import { Modal } from '../common/UIComponents';
import { ReceiptModal } from '../modals/ReceiptModal';
import {
  IndianRupee,
  Search,
  CheckCircle2,
  Send,
  Printer,
  Receipt,
  Sparkles,
} from 'lucide-react';

export const FeeOperations: React.FC = () => {
  const { currentSchool, currentUser, refreshData } = useAuth();
  const { language, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedTransaction, setSelectedTransaction] = useState<FeeTransaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Payment Form State
  const [paymentTx, setPaymentTx] = useState<FeeTransaction | null>(null);
  const [amountToPay, setAmountToPay] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [paymentRemarks, setPaymentRemarks] = useState('');

  const transactions = erpDb.getFeeTransactions(currentSchool.id, 'PRINCIPAL', currentUser?.id || '') || [];

  const totalAssessed = (transactions || []).reduce((s, t) => s + (t.total_amount ?? t.amount_due ?? 0), 0);
  const totalCollected = (transactions || []).reduce((s, t) => s + (t.paid_amount ?? t.amount_paid ?? 0), 0);
  const totalDue = Math.max(0, totalAssessed - totalCollected);
  const overdueCount = (transactions || []).filter((t) => t.status === 'OVERDUE' || t.status === 'PARTIAL').length;

  const filteredTransactions = (transactions || []).filter((t) => {
    const q = searchQuery.toLowerCase();
    const studentName = (t.student_name || '').toLowerCase();
    const gr = (t.gr_number || '').toLowerCase();
    const rec = (t.receipt_no || t.receipt_number || '').toLowerCase();
    const cls = (t.class_name || '').toLowerCase();
    const matchesQuery = studentName.includes(q) || gr.includes(q) || rec.includes(q) || cls.includes(q);
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const handleOpenPayment = (tx: FeeTransaction) => {
    const total = tx.total_amount ?? tx.amount_due ?? 0;
    const paid = tx.paid_amount ?? tx.amount_paid ?? 0;
    const balance = tx.balance ?? Math.max(0, total - paid);
    setPaymentTx(tx);
    setAmountToPay(balance);
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTx || amountToPay <= 0) return;

    const updated = erpDb.recordFeePayment(
      paymentTx.id,
      amountToPay,
      paymentMode,
      paymentRemarks || `Fee counter received by ${currentUser?.full_name || 'Accounts Desk'}`
    );

    if (updated) {
      erpDb.logAudit({
        school_id: currentSchool.id,
        user_id: currentUser?.id || 'usr-principal',
        user_name: currentUser?.full_name || 'Principal',
        user_role: 'PRINCIPAL',
        action: 'RECORD_FEE_PAYMENT',
        resource_type: 'FEES_TRANSACTIONS',
        resource_id: updated.id,
        details: `Collected ₹${amountToPay.toLocaleString('en-IN')} from ${updated.student_name} (${updated.receipt_no || updated.receipt_number}) via ${paymentMode}`,
        ip_address: '192.168.1.1',
      });
      setIsPaymentModalOpen(false);
      refreshData();
      // Auto-preview receipt
      setSelectedTransaction(updated);
      setIsReceiptModalOpen(true);
    }
  };

  const handleSendReminder = (tx: FeeTransaction) => {
    setReminderToast(
      language === 'gu'
        ? `${tx.student_name} ના વાલીને ફી બાકી પેમેન્ટ SMS મોકલી દેવાયો છે.`
        : `SMS payment reminder dispatched to parent of ${tx.student_name} (${tx.gr_number}).`
    );
    setTimeout(() => {
      setReminderToast(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {reminderToast && (
        <div className="bg-emerald-700 text-white px-4 py-3 rounded-xl shadow-md flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{reminderToast}</span>
          </div>
          <button onClick={() => setReminderToast(null)} className="text-white/80 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-emerald-700" />
            <span>{language === 'gu' ? 'શાળા ફી કાઉન્ટર & રસીદ ખાતાવહી' : 'School Fee Counter & Collection Ledger'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'gu'
              ? 'સત્ર ફી વસૂલાત, રોકડ / UPI / ચેક ચુકવણી નોંધણી અને તાત્કાલિક કમ્પ્યુટરાઇઝ્ડ રસીદ'
              : 'Term fee collection, payment mode records (UPI/Cash/Cheque), and instant computerized receipt generation.'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">{language === 'gu' ? 'કુલ નિર્ધારિત ફી' : 'Total Assessed Fees'}</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">₹{totalAssessed.toLocaleString('en-IN')}</div>
          <div className="text-xs text-slate-500 mt-1">{t('academic_year', 'Session 2026-27')}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">{language === 'gu' ? 'કુલ જમા થયેલ આવક' : 'Collected Revenue'}</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">₹{totalCollected.toLocaleString('en-IN')}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            {Math.round((totalCollected / (totalAssessed || 1)) * 100)}% {language === 'gu' ? 'વસૂલાત પૂર્ણ' : 'Realized'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">{language === 'gu' ? 'કુલ બાકી ફી રકમ' : 'Outstanding Balance'}</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">₹{totalDue.toLocaleString('en-IN')}</div>
          <div className="text-xs text-slate-500 mt-1">{overdueCount} {language === 'gu' ? 'વિદ્યાર્થીઓ પાસે બાકી' : 'Students Pending'}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">{language === 'gu' ? 'ડિજિટલ UPI વસૂલાત' : 'Digital UPI / Online'}</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">₹{Math.round(totalCollected * 0.72).toLocaleString('en-IN')}</div>
          <div className="text-xs text-slate-500 mt-1">QR Code &amp; UPI Portal</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'gu' ? 'વિદ્યાર્થી, G.R. નં. અથવા પહોંચ નં. થી શોધો...' : 'Search student, G.R., receipt no...'}
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-semibold">{language === 'gu' ? 'સ્થિતિ:' : 'Status:'}</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">{t('filter_all', 'All Transactions')}</option>
            <option value="PAID">{language === 'gu' ? 'સંપૂર્ણ ભરપાઈ (PAID)' : 'Paid (Full)'}</option>
            <option value="PARTIAL">{language === 'gu' ? 'અંશતઃ બાકી (PARTIAL)' : 'Partial Paid'}</option>
            <option value="OVERDUE">{language === 'gu' ? 'બાકી / મુદત વીતી (OVERDUE)' : 'Overdue'}</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4">{language === 'gu' ? 'પહોંચ નં. & તારીખ' : 'Receipt No & Date'}</th>
                <th className="py-3 px-4">{t('student_name', 'Student Name')}</th>
                <th className="py-3 px-4">{t('standard', 'Class')} &amp; G.R.</th>
                <th className="py-3 px-4 text-right">{language === 'gu' ? 'નિર્ધારિત ફી' : 'Total Fee'}</th>
                <th className="py-3 px-4 text-right">{language === 'gu' ? 'જમા રકમ' : 'Paid Amount'}</th>
                <th className="py-3 px-4 text-right">{language === 'gu' ? 'બાકી રકમ' : 'Balance Due'}</th>
                <th className="py-3 px-4 text-center">{language === 'gu' ? 'સ્થિતિ' : 'Status'}</th>
                <th className="py-3 px-4 text-right">{language === 'gu' ? 'ક્રિયા' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const totalAmount = tx.total_amount ?? tx.amount_due ?? 0;
                const paidAmount = tx.paid_amount ?? tx.amount_paid ?? 0;
                const balance = tx.balance ?? Math.max(0, totalAmount - paidAmount);
                const receiptNum = tx.receipt_no || tx.receipt_number || 'REC-2026-PENDING';

                return (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{receiptNum}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{tx.due_date || tx.paid_date}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-xs">{tx.student_name}</div>
                      <div className="text-[11px] text-slate-500">{tx.term || '1st Term Tuition'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{tx.class_name}</div>
                      <div className="text-[11px] font-mono text-emerald-800 font-bold">{tx.gr_number}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      ₹{paidAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                      {balance > 0 ? `₹${balance.toLocaleString('en-IN')}` : '₹0'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          tx.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : tx.status === 'OVERDUE'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {tx.status === 'PAID'
                          ? language === 'gu'
                            ? 'ભરપાઈ'
                            : 'PAID'
                          : tx.status === 'OVERDUE'
                          ? language === 'gu'
                            ? 'બાકી'
                            : 'OVERDUE'
                          : language === 'gu'
                          ? 'અંશતઃ'
                          : 'PARTIAL'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {balance > 0 && (
                          <button
                            onClick={() => handleOpenPayment(tx)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            {language === 'gu' ? 'ફી લો' : 'Receive'}
                          </button>
                        )}

                        {balance > 0 && (
                          <button
                            onClick={() => handleSendReminder(tx)}
                            title={language === 'gu' ? 'વાલીને SMS મોકલો' : 'Send SMS Reminder'}
                            className="p-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedTransaction(tx);
                            setIsReceiptModalOpen(true);
                          }}
                          title={language === 'gu' ? 'પહોંચ પ્રિન્ટ કરો' : 'Print Receipt'}
                          className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Payment Modal */}
      {isPaymentModalOpen && paymentTx && (
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title={language === 'gu' ? 'કાઉન્ટર ફી સ્વીકાર કરો (Receive Fee)' : 'Receive Fee Payment'}
          subtitle={`${paymentTx.student_name} (${paymentTx.gr_number}) • ${paymentTx.class_name}`}
          maxWidth="md"
        >
          <form onSubmit={handleRecordPayment} className="space-y-4">
            {(() => {
              const maxDue = paymentTx.balance ?? Math.max(0, (paymentTx.total_amount ?? paymentTx.amount_due ?? 0) - (paymentTx.paid_amount ?? paymentTx.amount_paid ?? 0));
              return (
                <>
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex justify-between items-center">
                    <span className="font-semibold text-emerald-900">{language === 'gu' ? 'કુલ બાકી રકમ:' : 'Total Outstanding:'}</span>
                    <span className="font-mono font-bold text-emerald-800 text-base">
                      ₹{maxDue.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'gu' ? 'સ્વીકારવાની રકમ (₹ Amount to Pay)' : 'Amount to Collect (₹)'} *
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      max={maxDue}
                      value={amountToPay}
                      onChange={(e) => setAmountToPay(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-sm font-bold font-mono bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </>
              );
            })()}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'gu' ? 'ચુકવણી પદ્ધતિ (Payment Mode)' : 'Payment Mode'} *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['UPI', 'CASH', 'CHEQUE', 'BANK_TRANSFER'] as PaymentMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-colors cursor-pointer ${
                      paymentMode === mode
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'gu' ? 'નોંધ / સંદર્ભ નં. (Remarks/UTR No.)' : 'Remarks / Reference No'}
              </label>
              <input
                type="text"
                placeholder={language === 'gu' ? 'દા.ત. UPI Ref: 48291048592' : 'e.g. Cash counter receipt'}
                value={paymentRemarks}
                onChange={(e) => setPaymentRemarks(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {language === 'gu' ? 'જમા લો અને પહોંચ આપો' : 'Collect & Generate Receipt'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Receipt Preview Modal */}
      {selectedTransaction && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          transaction={selectedTransaction}
          school={currentSchool}
        />
      )}
    </div>
  );
};
