import React from 'react';
import { FeeTransaction, School } from '../../types/erp';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../common/UIComponents';
import { Printer, CheckCircle2, ShieldCheck, Landmark, Receipt, FileText, QrCode } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: FeeTransaction | null;
  school: School;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  school,
}) => {
  const { language, t } = useLanguage();
  if (!transaction) return null;

  const totalAmount = transaction.total_amount ?? transaction.amount_due ?? 0;
  const paidAmount = transaction.paid_amount ?? transaction.amount_paid ?? 0;
  const balance = transaction.balance ?? Math.max(0, totalAmount - paidAmount);
  const receiptNum = transaction.receipt_no || transaction.receipt_number || 'REC-2026-001';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'gu' ? 'શાળા ફી પહોંચ / રસીદ (Fee Receipt)' : 'Official School Fee Receipt'}
      subtitle={`Receipt No: ${receiptNum}`}
      maxWidth="2xl"
    >
      {/* Quick Print Action Bar (Hidden during print) */}
      <div className="mb-4 bg-slate-900 text-white p-3.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md border border-slate-700 no-print">
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-100 flex items-center space-x-1.5">
              <span>{language === 'gu' ? 'સત્તાવાર ફી પહોંચ તૈયાર છે' : 'Official Fee Receipt Ready'}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono">
                {transaction.status || 'PAID'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {language === 'gu'
                ? 'બ્રાઉઝર પ્રિન્ટ ડાયલોગ દ્વારા સીધું પ્રિન્ટ કરો (Ctrl+P / ⌘+P)'
                : 'Click Print Receipt to generate an official tax/audit compliant slip.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all hover:scale-105 cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'gu' ? 'પહોંચ પ્રિન્ટ કરો' : 'Print Receipt'}</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document Canvas */}
      <div
        id="printable-receipt"
        className="bg-white text-slate-900 p-6 rounded-xl border border-slate-300 shadow-xs printable-document print:p-0 print:border-0"
      >
        {/* Receipt Header */}
        <div className="border-b-2 border-slate-900 pb-4 text-center institutional-header">
          <p className="text-[11px] font-bold text-amber-800 uppercase tracking-widest">
            {school.is_self_financed ? 'સ્વ-નિર્ભર ખાનગી શાળા (Self-Financed Private School)' : 'Private Recognized School'}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-serif uppercase mt-0.5">
            {school.gujarati_name ? school.gujarati_name : school.name}
          </h2>
          <p className="text-xs text-slate-700 mt-0.5">{school.address}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-600 mt-1">
            <span>GSEB Index: <strong className="text-slate-900">{school.gseb_index || '64.082'}</strong></span>
            <span>•</span>
            <span>UDISE+: <strong className="text-slate-900">{school.udiseCode || '24090104512'}</strong></span>
            <span>•</span>
            <span>Phone: {school.phone}</span>
          </div>
          <div className="mt-2 inline-block px-3 py-0.5 bg-slate-900 text-white rounded text-xs font-bold uppercase tracking-wider">
            {language === 'gu' ? 'સત્તાવાર ફી પહોંચ • સત્ર ૨૦૨૬-૨૭' : 'OFFICIAL FEE RECEIPT • SESSION 2026-27'}
          </div>
        </div>

        {/* Receipt Meta & Student Info */}
        <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-200 text-xs">
          <div>
            <p className="text-slate-500 uppercase text-[10px] font-bold">
              {language === 'gu' ? 'વિદ્યાર્થીની વિગત' : 'Student Details'}
            </p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{transaction.student_name}</p>
            <p className="text-slate-700 mt-0.5">{t('gr_no', 'G.R. No')}: <strong className="font-mono text-blue-900">{transaction.gr_number}</strong></p>
            <p className="text-slate-700">{t('standard', 'Class')}: <strong className="text-slate-900">{transaction.class_name}</strong></p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 uppercase text-[10px] font-bold">
              {language === 'gu' ? 'પહોંચ વિગત' : 'Receipt Details'}
            </p>
            <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">{receiptNum}</p>
            <p className="text-slate-700 mt-0.5">{language === 'gu' ? 'તારીખ:' : 'Date:'} {transaction.paid_at ? new Date(transaction.paid_at).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}</p>
            <p className="text-slate-700">{language === 'gu' ? 'ચુકવણી પદ્ધતિ:' : 'Payment Mode:'} <strong className="text-emerald-700">{transaction.payment_mode || 'UPI / CASH'}</strong></p>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="py-3 border-b border-slate-200">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-300">
                <th className="text-left py-2.5 px-3">ક્રમ (No.)</th>
                <th className="text-left py-2.5 px-3">{language === 'gu' ? 'ફી ની વિગત' : 'Fee Head / Description'}</th>
                <th className="text-right py-2.5 px-3">{language === 'gu' ? 'રકમ (₹)' : 'Amount (₹ INR)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transaction.fee_breakdown?.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 text-slate-800">
                  <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-medium">{item.head}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold">₹{item.amount.toLocaleString('en-IN')}</td>
                </tr>
              )) || (
                <tr className="text-slate-800">
                  <td className="py-2.5 px-3 text-slate-500">1</td>
                  <td className="py-2.5 px-3 font-medium">સત્ર ટ્યુશન ફી &amp; લેબ/કોમ્પ્યુટર ચાર્જ (Tuition Fee &amp; Lab Charges)</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold">₹{totalAmount.toLocaleString('en-IN')}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 font-semibold text-slate-800 bg-slate-50">
                <td colSpan={2} className="py-2.5 px-3 text-right">{language === 'gu' ? 'કુલ નિર્ધારિત ફી:' : 'Total Assessed:'}</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold">₹{totalAmount.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="text-emerald-700 font-bold bg-emerald-50/80 border-t border-emerald-200">
                <td colSpan={2} className="py-2.5 px-3 text-right">{language === 'gu' ? 'મેળવેલ રકમ (Received):' : 'Amount Received:'}</td>
                <td className="py-2.5 px-3 text-right font-mono text-sm">₹{paidAmount.toLocaleString('en-IN')}</td>
              </tr>
              {balance > 0 && (
                <tr className="text-rose-600 font-bold bg-rose-50/50 border-t border-rose-200">
                  <td colSpan={2} className="py-2.5 px-3 text-right">{language === 'gu' ? 'બાકી રકમ (Balance Due):' : 'Balance Due:'}</td>
                  <td className="py-2.5 px-3 text-right font-mono">₹{balance.toLocaleString('en-IN')}</td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>

        {/* Footer & Signature */}
        <div className="pt-6 flex justify-between items-end text-xs text-slate-600 signature-block">
          <div>
            <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'gu' ? 'કમ્પ્યુટર જનરેટેડ સત્તાવાર પહોંચ' : 'Computer Generated Official Receipt'}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {language === 'gu' ? 'એકવાર ભરેલી ફી પરત મળશે નહીં.' : 'Fees once paid will not be refunded.'}
            </p>
          </div>
          <div className="text-center">
            <div className="w-36 border-b border-slate-400 mb-1 mx-auto" />
            <span className="font-semibold text-slate-800">
              {language === 'gu' ? 'હિસાબ અધિકારી / કેશિયર' : 'Accounts Officer / Cashier'}
            </span>
            <div className="text-[10px] text-slate-500">
              {language === 'gu' && school.gujarati_name ? school.gujarati_name.split(' (')[0] : school.name}
            </div>
          </div>
        </div>

        {/* Printable Footer Credit */}
        <div className="mt-6 pt-2 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between font-mono">
          <span>Official Fee Voucher • ClassSec Gujarat School ERP</span>
          <span>Made with ❤️ by Harsh Ravaliya</span>
        </div>
      </div>

      {/* Modal Bottom Actions */}
      <div className="mt-4 flex justify-end space-x-3 no-print">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          {t('close', 'Close')}
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold inline-flex items-center space-x-1.5 cursor-pointer shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>{t('print', 'Print Receipt')}</span>
        </button>
      </div>
    </Modal>
  );
};

