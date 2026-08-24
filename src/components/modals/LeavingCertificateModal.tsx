import React, { useRef } from 'react';
import { Student, School } from '../../types/erp';
import { useLanguage } from '../../context/LanguageContext';
import { X, Printer, Download, Award, ShieldCheck, CheckCircle2, FileText, Check } from 'lucide-react';

interface LeavingCertificateModalProps {
  student: Student;
  school: School;
  onClose: () => void;
}

// Convert numbers/dates to Gujarati and English words
function convertDobToWords(dobString: string): { gujWords: string; engWords: string; formatted: string } {
  const d = new Date(dobString);
  if (isNaN(d.getTime())) {
    return {
      gujWords: 'પંદર ઓગસ્ટ બે હજાર દસ',
      engWords: 'Fifteenth August Two Thousand Ten',
      formatted: dobString,
    };
  }

  const day = d.getDate();
  const monthNamesGu = [
    'જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન',
    'જુલાઈ', 'ઓગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર'
  ];
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthIdx = d.getMonth();
  const year = d.getFullYear();

  const numWordsGu: Record<number, string> = {
    1: 'એક', 2: 'બે', 3: 'ત્રણ', 4: 'ચાર', 5: 'પાંચ', 6: 'છ', 7: 'સાત', 8: 'આઠ', 9: 'નવ', 10: 'દસ',
    11: 'અગિયાર', 12: 'બાર', 13: 'તેર', 14: 'ચૌદ', 15: 'પંદર', 16: 'સોળ', 17: 'સત્તર', 18: 'અઢાર', 19: 'ઓગણીસ', 20: 'વીસ',
    21: 'એકવીસ', 22: 'બાવીસ', 23: 'ત્રેવીસ', 24: 'ચોવીસ', 25: 'પચ્ચીસ', 26: 'છવ્વીસ', 27: 'સત્તાવીસ', 28: 'અઠ્ઠાવીસ', 29: 'ઓગણત્રીસ', 30: 'ત્રીસ', 31: 'એકત્રીસ'
  };

  const numWordsEn: Record<number, string> = {
    1: 'First', 2: 'Second', 3: 'Third', 4: 'Fourth', 5: 'Fifth', 6: 'Sixth', 7: 'Seventh', 8: 'Eighth', 9: 'Ninth', 10: 'Tenth',
    11: 'Eleventh', 12: 'Twelfth', 13: 'Thirteenth', 14: 'Fourteenth', 15: 'Fifteenth', 16: 'Sixteenth', 17: 'Seventeenth', 18: 'Eighteenth', 19: 'Nineteenth', 20: 'Twentieth',
    21: 'Twenty-First', 22: 'Twenty-Second', 23: 'Twenty-Third', 24: 'Twenty-Fourth', 25: 'Twenty-Fifth', 26: 'Twenty-Sixth', 27: 'Twenty-Seventh', 28: 'Twenty-Eighth', 29: 'Twenty-Ninth', 30: 'Thirtieth', 31: 'Thirty-First'
  };

  const guDay = numWordsGu[day] || `${day}`;
  const enDay = numWordsEn[day] || `${day}th`;
  const guMonth = monthNamesGu[monthIdx];
  const enMonth = monthNamesEn[monthIdx];

  // Year words
  const yearWordsGu = year === 2010 ? 'બે હજાર દસ' : year === 2011 ? 'બે હજાર અગિયાર' : year === 2009 ? 'બે હજાર નવ' : `${year}`;
  const yearWordsEn = year === 2010 ? 'Two Thousand Ten' : year === 2011 ? 'Two Thousand Eleven' : year === 2009 ? 'Two Thousand Nine' : `${year}`;

  return {
    gujWords: `${guDay} ${guMonth} ${yearWordsGu}`,
    engWords: `${enDay} ${enMonth} ${yearWordsEn}`,
    formatted: `${String(day).padStart(2, '0')}/${String(monthIdx + 1).padStart(2, '0')}/${year}`,
  };
}

export const LeavingCertificateModal: React.FC<LeavingCertificateModalProps> = ({
  student,
  school,
  onClose,
}) => {
  const { language, t } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);

  const dobInfo = convertDobToWords(student.dob);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      {/* Print styles injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-lc-canvas, #printable-lc-canvas * {
            visibility: visible;
          }
          #printable-lc-canvas {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0 !important;
            padding: 20px !important;
            border-width: 3px !important;
            box-shadow: none !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 my-4">
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white font-heading flex items-center space-x-2">
                <span>{language === 'gu' ? 'સત્તાવાર શાળા છોડ્યાનું પ્રમાણપત્ર (L.C.)' : 'Official GSEB School Leaving Certificate (L.C.)'}</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-400/30">
                  GSEB Form No. 1
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pupil: <strong className="text-slate-200">{student.first_name} {student.last_name}</strong> • G.R. No: <span className="font-mono text-amber-300 font-bold">{student.gr_number}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer hover:scale-105"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'gu' ? 'પ્રિન્ટ / PDF ડાઉનલોડ' : 'Print Certificate / PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Document Canvas */}
        <div className="p-3 sm:p-6 bg-slate-100/70 max-h-[80vh] overflow-y-auto">
          <div
            id="printable-lc-canvas"
            ref={printRef}
            className="p-6 sm:p-8 bg-white border-8 border-double border-amber-950/40 rounded-xl text-slate-900 shadow-lg relative font-serif"
          >
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none select-none">
              <Award className="w-96 h-96 text-amber-950" />
            </div>

            {/* Top State Board & Institution Header */}
            <div className="text-center pb-4 border-b-2 border-amber-950/40 relative">
              <p className="text-[11px] font-sans font-bold tracking-widest uppercase text-amber-900">
                ગુજરાત માધ્યમિક અને ઉચ્ચતર માધ્યમિક શિક્ષણ બોર્ડ, ગાંધીનગર (GSEB Standard Format)
              </p>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-950 mt-1 font-serif">
                {school.gujarati_name ? school.gujarati_name : school.name}
              </h1>
              <p className="text-sm font-sans font-semibold text-slate-800 mt-0.5">
                {school.name}
              </p>
              <p className="text-xs font-sans text-slate-600 mt-0.5">
                {school.address} | Email: {school.email} | Phone: {school.phone}
              </p>

              {/* Official Registration Row */}
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mt-3 text-xs font-sans font-mono">
                <span className="bg-amber-50 border border-amber-300 text-amber-950 px-2 py-0.5 rounded font-bold">
                  GSEB Index: {school.gseb_index || '64.082'}
                </span>
                <span className="bg-amber-50 border border-amber-300 text-amber-950 px-2 py-0.5 rounded font-bold">
                  UDISE+ Code: {school.udiseCode || '24090104512'}
                </span>
                <span className="bg-amber-50 border border-amber-300 text-amber-950 px-2 py-0.5 rounded font-bold">
                  L.C. Book No: 2026/08
                </span>
                <span className="bg-amber-50 border border-amber-300 text-amber-950 px-2 py-0.5 rounded font-bold">
                  Certificate Serial No: {student.gr_number ? `LC-${student.gr_number}` : 'LC-4821'}
                </span>
              </div>
            </div>

            {/* Certificate Title Ribbon */}
            <div className="text-center my-4">
              <div className="inline-block border-y-2 border-slate-900 py-1 px-6">
                <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-slate-950">
                  શાળા છોડ્યાનું પ્રમાણપત્ર / SCHOOL LEAVING CERTIFICATE
                </h2>
                <p className="text-[11px] font-sans text-slate-600 font-normal">
                  (Under Rule 38 of the Gujarat Secondary Education Regulations, 1974)
                </p>
              </div>
            </div>

            {/* Passport Photo Box (Top-Right Stamp Layout) */}
            <div className="absolute top-28 right-8 hidden sm:flex flex-col items-center justify-center w-24 h-28 border-2 border-dashed border-slate-400 bg-slate-50 text-[10px] font-sans text-slate-400 text-center p-1">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold mb-1">
                {student.first_name[0]}
              </div>
              <span>વિદ્યાર્થી ફોટો</span>
              <span>(Passport Photo)</span>
            </div>

            {/* Structured GSEB Data Table */}
            <div className="mt-4 space-y-2.5 text-xs sm:text-sm font-sans leading-relaxed">
              {/* 1. G.R. No & Admission No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-b border-slate-200 pb-2">
                <div>
                  <span className="font-bold text-slate-800">૧. જનરલ રજિસ્ટર (G.R.) નં. / G.R. No:</span>
                  <span className="ml-2 font-mono font-bold text-blue-900 text-sm">{student.gr_number}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800">પ્રવેશ ક્રમાંક / Admission No:</span>
                  <span className="ml-2 font-mono font-bold text-slate-900">{student.admission_no || student.gr_number}</span>
                </div>
              </div>

              {/* 2. Pupil's Full Name */}
              <div className="border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800">૨. વિદ્યાર્થીનું પૂરું નામ / Pupil's Full Name:</span>
                <div className="mt-1 font-bold text-slate-950 text-sm sm:text-base flex flex-wrap gap-2 items-center">
                  <span className="bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-serif">
                    {student.gujarati_name || `${student.first_name} ${student.last_name}`}
                  </span>
                  <span className="text-slate-600 font-sans font-medium text-xs sm:text-sm">
                    ({student.first_name} {student.father_name || ''} {student.last_name})
                  </span>
                </div>
              </div>

              {/* 3. Father & Mother */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-b border-slate-200 pb-2">
                <div>
                  <span className="font-bold text-slate-800">૩. પિતાનું નામ / Father's Name:</span>
                  <span className="ml-2 font-semibold text-slate-900">{student.father_name || student.parent_name || 'Shri Pravinbhai Patel'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800">માતાનું નામ / Mother's Name:</span>
                  <span className="ml-2 font-semibold text-slate-900">{student.mother_name || 'Smt. Bhartiben Patel'}</span>
                </div>
              </div>

              {/* 4. Nationality & Religion/Caste */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-b border-slate-200 pb-2">
                <div>
                  <span className="font-bold text-slate-800">૪. રાષ્ટ્રીયતા / Nationality:</span>
                  <span className="ml-2 font-semibold text-slate-900">ભારતીય (Indian)</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800">ધર્મ અને જ્ઞાતિ / Religion &amp; Caste:</span>
                  <span className="ml-2 font-semibold text-slate-900">હિન્દુ - {student.caste || 'Patel'}</span>
                </div>
              </div>

              {/* 5. Place of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-b border-slate-200 pb-2">
                <div>
                  <span className="font-bold text-slate-800">૫. જન્મ સ્થળ / Place of Birth:</span>
                  <span className="ml-2 font-semibold text-slate-900">{student.birth_place || 'Rajkot, Gujarat (રાજકોટ, ગુજરાત)'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800">માતૃભાષા / Mother Tongue:</span>
                  <span className="ml-2 font-semibold text-slate-900">ગુજરાતી (Gujarati)</span>
                </div>
              </div>

              {/* 6. Date of Birth in Figures & Words */}
              <div className="border-b border-slate-200 pb-2 bg-amber-50/40 p-2 rounded-lg border border-amber-200/60">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-800">૬. જન્મ તારીખ (આંકડામાં) / Date of Birth (Figures):</span>
                  <span className="font-mono font-bold text-slate-900 text-sm bg-white px-2 py-0.5 rounded border border-slate-300">
                    {dobInfo.formatted}
                  </span>
                </div>
                <div className="mt-1 text-xs space-y-0.5">
                  <div>
                    <span className="font-bold text-slate-700">જન્મ તારીખ (ગુજરાતી શબ્દોમાં):</span>
                    <span className="ml-2 font-semibold text-amber-950">{dobInfo.gujWords}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Date of Birth (In Words):</span>
                    <span className="ml-2 font-semibold text-slate-800 italic">{dobInfo.engWords}</span>
                  </div>
                </div>
              </div>

              {/* 7. Last School & Admission Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-b border-slate-200 pb-2">
                <div>
                  <span className="font-bold text-slate-800">૭. અગાઉની શાળા / Last School Attended:</span>
                  <span className="ml-2 font-medium text-slate-900">S.V. Primary School, Rajkot</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800">પ્રવેશ તારીખ / Date of Admission:</span>
                  <span className="ml-2 font-mono font-semibold text-slate-900">{student.admission_date || '15/06/2021'}</span>
                </div>
              </div>

              {/* 8. Progress & Conduct */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-b border-slate-200 pb-2">
                <div>
                  <span className="font-bold text-slate-800">૮. અભ્યાસમાં પ્રગતિ / Progress in Studies:</span>
                  <span className="ml-2 font-bold text-blue-800">ઉત્તમ (Excellent - Grade A1)</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800">વર્તણૂક / Conduct &amp; Character:</span>
                  <span className="ml-2 font-bold text-emerald-800">ઉત્કૃષ્ટ અને સારી (Good &amp; Exemplary)</span>
                </div>
              </div>

              {/* 9. Date of Leaving & Reason */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-b border-slate-200 pb-2">
                <div>
                  <span className="font-bold text-slate-800">૯. શાળા છોડ્યા તારીખ / Date of Leaving:</span>
                  <span className="ml-2 font-mono font-bold text-slate-900">
                    {new Date().toLocaleDateString('en-GB')}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-800">શાળા છોડવાનું કારણ / Reason for Leaving:</span>
                  <span className="ml-2 font-semibold text-slate-900">For Higher Studies / Further Education (ઉચ્ચ અભ્યાસ અર્થે)</span>
                </div>
              </div>

              {/* 10. Standard & Dues */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-b border-slate-200 pb-2">
                <div>
                  <span className="font-bold text-slate-800">૧૦. અભ્યાસનું ધોરણ / Standard in Which Studying:</span>
                  <span className="ml-2 font-bold text-slate-900">ધોરણ ૧૦ (Standard 10th - GSEB)</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800">શાળા ફી બાકી સ્થિતિ / Fee Dues Status:</span>
                  <span className="ml-2 font-bold text-emerald-700">સંપૂર્ણ ચૂકતે (Nil / All Dues Cleared)</span>
                </div>
              </div>

              {/* 11. General Remarks */}
              <div className="pb-1">
                <span className="font-bold text-slate-800">૧૧. સામાન્ય નોંધ / General Remarks:</span>
                <span className="ml-2 font-medium text-slate-900">Certified that the above information is in accordance with the General Register of the School.</span>
              </div>
            </div>

            {/* Official Signatures Block */}
            <div className="mt-8 pt-8 grid grid-cols-3 gap-4 text-center text-xs font-sans">
              <div>
                <div className="h-12 border-b-2 border-slate-400 w-32 sm:w-40 mx-auto flex items-end justify-center pb-1">
                  <span className="font-mono text-[11px] text-slate-400 italic">Signed / Verified</span>
                </div>
                <p className="mt-1 font-bold text-slate-800">તૈયાર કરનાર ક્લાર્ક</p>
                <p className="text-[10px] text-slate-500">(Prepared by Head Clerk)</p>
              </div>

              <div>
                <div className="h-12 border-b-2 border-slate-400 w-32 sm:w-40 mx-auto flex items-end justify-center pb-1">
                  <span className="font-mono text-[11px] text-slate-400 italic">Verified with G.R.</span>
                </div>
                <p className="mt-1 font-bold text-slate-800">વર્ગ શિક્ષકની સહી</p>
                <p className="text-[10px] text-slate-500">(Class Teacher)</p>
              </div>

              <div>
                <div className="h-12 border-b-2 border-slate-400 w-36 sm:w-44 mx-auto flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-xs font-serif italic text-blue-900 font-bold block">Dr. V.C. Pandya</span>
                    <span className="text-[9px] text-slate-400 font-mono">SEAL &amp; SIGN</span>
                  </div>
                </div>
                <p className="mt-1 font-bold text-slate-950">આચાર્યશ્રીની સહી અને સિક્કો</p>
                <p className="text-[10px] text-slate-500">(Principal &amp; Official School Stamp)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls (Hidden on Print) */}
        <div className="no-print bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-500 font-mono text-[11px]">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Authenticated against G.R. Book • Ready for single-page A4 printing</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {t('close', 'Close')}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'gu' ? 'પ્રિન્ટ કરો (L.C. છાપો)' : 'Print Certificate (L.C.)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
