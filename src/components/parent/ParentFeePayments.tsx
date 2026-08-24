import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FeeTransaction } from '../../types/erp';
import { erpDb } from '../../services/db';
import { Modal } from '../common/UIComponents';
import { ReceiptModal } from '../modals/ReceiptModal';
import {
  IndianRupee,
  Printer,
  CheckCircle2,
  Landmark,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

export const ParentFeePayments: React.FC = () => {
  const { currentSchool, currentUser, refreshData } = useAuth();
  const { language, t } = useLanguage();

  const [selectedTx, setSelectedTx] = useState<FeeTransaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payingTx, setPayingTx] = useState<FeeTransaction | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<string | null>(null);

  const transactions = erpDb.getFeeTransactions(currentSchool.id, 'PARENT', currentUser?.id || '');

  const totalAssessed = transactions.reduce((s, t) => s + (t.total_amount ?? t.amount_due ?? 0), 0);
  const totalPaid = transactions.reduce((s, t) => s + (t.paid_amount ?? t.amount_paid ?? 0), 0);
  const totalDue = Math.max(0, totalAssessed - totalPaid);

  const handleOpenPay = (tx: FeeTransaction) => {
    const total = tx.total_amount ?? tx.amount_due ?? 0;
    const paid = tx.paid_amount ?? tx.amount_paid ?? 0;
    const balance = tx.balance ?? Math.max(0, total - paid);
    setPayingTx(tx);
    setPayAmount(balance);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmOnlinePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingTx || payAmount <= 0) return;

    const updated = erpDb.recordFeePayment(
      payingTx.id,
      payAmount,
      'UPI',
      'Instant online payment processed by parent portal (UPI / NetBanking)'
    );

    if (updated) {
      setIsPaymentModalOpen(false);
      setPaymentSuccessToast(
        language === 'gu'
          ? `₹${payAmount.toLocaleString('en-IN')} ની ઓનલાઇન ફી સફળતાપૂર્વક ચૂકવાઈ ગઈ છે! પહોંચ જનરેટ થઈ ગઈ છે.`
          : `Payment of ₹${payAmount.toLocaleString('en-IN')} successful! Official receipt generated.`
      );
      setTimeout(() => setPaymentSuccessToast(null), 4000);
      refreshData();
      setSelectedTx(updated);
      setIsReceiptModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {paymentSuccessToast && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{paymentSuccessToast}</span>
          </div>
          <button onClick={() => setPaymentSuccessToast(null)} className="text-white/80 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <IndianRupee className="w-5 h-5 text-emerald-600" />
          <span>{language === 'gu' ? 'શાળા ફી ચુકવણી અને સત્તાવાર પહોંચ' : 'Fee Invoices, Online Payments & Receipts'}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {language === 'gu'
            ? 'સત્ર ફી, ઓનલાઇન UPI ચુકવણી અને કમ્પ્યુટરાઇઝ્ડ પહોંચ ડાઉનલોડ કરો.'
            : `View tuition fee breakdown, pay dues via UPI / NetBanking, and print receipts for ${currentSchool.name}.`}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">{language === 'gu' ? 'કુલ નિર્ધારિત ફી' : 'Total Assessment'}</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">₹{totalAssessed.toLocaleString('en-IN')}</div>
          <div className="text-xs text-slate-500 mt-1">{t('academic_year', 'Session 2026-27')}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">{language === 'gu' ? 'ભરેલ ફી રકમ' : 'Total Amount Paid'}</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">₹{totalPaid.toLocaleString('en-IN')}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            {language === 'gu' ? 'ઓનલાઇન / UPI પહોંચ' : 'Direct deposit / UPI'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">{language === 'gu' ? 'બાકી રકમ' : 'Outstanding Balance'}</div>
          <div className={`text-2xl font-bold mt-1 ${totalDue > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            ₹{totalDue.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {totalDue > 0 ? (language === 'gu' ? 'ઓનલાઇન ભરો' : 'Due for Term') : (language === 'gu' ? 'કોઈ બાકી નથી' : 'Zero dues')}
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {language === 'gu' ? 'વિદ્યાર્થી ફી ખાતાવહી' : 'Student Fee Account Ledger'}
          </h3>
          <span className="text-[11px] font-mono text-emerald-700 font-bold">
            {language === 'gu' ? 'સુરક્ષિત પેમેન્ટ પોર્ટલ' : 'Secured Portal'}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {transactions.map((tx) => {
            const total = tx.total_amount ?? tx.amount_due ?? 0;
            const paid = tx.paid_amount ?? tx.amount_paid ?? 0;
            const balance = tx.balance ?? Math.max(0, total - paid);
            const receiptNum = tx.receipt_no || tx.receipt_number || 'REC-2026-PENDING';

            return (
              <div key={tx.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{receiptNum}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        tx.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : tx.status === 'PARTIAL'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {tx.status === 'PAID' ? (language === 'gu' ? 'ભરપાઈ' : 'PAID') : (language === 'gu' ? 'બાકી' : tx.status)}
                    </span>
                  </div>
                  <p className="text-slate-600">
                    {language === 'gu' ? 'સત્ર:' : 'Term:'} <strong>{tx.term || '1st Term Tuition'}</strong> • {language === 'gu' ? 'મુદત:' : 'Due Date:'} {tx.due_date || tx.paid_date}
                  </p>
                  <div className="flex items-center space-x-3 text-slate-500 font-mono text-[11px]">
                    <span>G.R.: {tx.gr_number}</span>
                    <span>•</span>
                    <span>{tx.student_name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-500">{language === 'gu' ? 'કુલ ફી રકમ' : 'Assessed Amount'}</div>
                    <div className="font-mono font-bold text-slate-900 text-base">₹{total.toLocaleString('en-IN')}</div>
                    {balance > 0 ? (
                      <div className="text-[11px] font-bold text-rose-600">
                        {language === 'gu' ? 'બાકી: ' : 'Balance: '}₹{balance.toLocaleString('en-IN')}
                      </div>
                    ) : (
                      <div className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1 justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{language === 'gu' ? 'પૂર્ણ ચૂકતે' : 'Paid in Full'}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {balance > 0 && (
                      <button
                        onClick={() => handleOpenPay(tx)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        {language === 'gu' ? 'ઓનલાઇન ભરો' : 'Pay Online'}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedTx(tx);
                        setIsReceiptModalOpen(true);
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{language === 'gu' ? 'પહોંચ' : 'Receipt'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Online Pay Modal */}
      {isPaymentModalOpen && payingTx && (
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title={language === 'gu' ? 'ઓનલાઇન ફી ચુકવણી (UPI / NetBanking)' : 'Online Fee Payment'}
          subtitle={`${payingTx.student_name} (${payingTx.gr_number})`}
          maxWidth="md"
        >
          {(() => {
            const total = payingTx.total_amount ?? payingTx.amount_due ?? 0;
            const paid = payingTx.paid_amount ?? payingTx.amount_paid ?? 0;
            const balance = payingTx.balance ?? Math.max(0, total - paid);

            return (
              <form onSubmit={handleConfirmOnlinePayment} className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-emerald-900 block">{language === 'gu' ? 'ચૂકવવાપાત્ર રકમ' : 'Amount to Pay'}</span>
                    <span className="text-[11px] text-emerald-700">0% Gateway Convenience Fee</span>
                  </div>
                  <span className="font-mono font-bold text-xl text-emerald-900">
                    ₹{balance.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <span className="font-bold text-slate-800 block">{language === 'gu' ? 'ચુકવણી વિકલ્પ પસંદ કરો:' : 'Select Payment Option:'}</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-white border border-emerald-500 rounded-lg flex items-center space-x-2 font-bold text-emerald-800">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>Google Pay / PhonePe (UPI)</span>
                    </div>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center space-x-2 text-slate-700">
                      <Landmark className="w-4 h-4 text-slate-500" />
                      <span>NetBanking / Debit Card</span>
                    </div>
                  </div>
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
                    {language === 'gu' ? 'હમણાં ચૂકવો (Pay Now)' : 'Authorize & Pay Now'}
                  </button>
                </div>
              </form>
            );
          })()}
        </Modal>
      )}

      {/* Receipt Modal */}
      {selectedTx && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          transaction={selectedTx}
          school={currentSchool}
        />
      )}
    </div>
  );
};
