import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  Bookmark,
  Search,
  Printer,
  Download,
  Share2,
  List,
  CheckCircle2,
  Highlighter,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export interface BookData {
  id: string;
  title: string;
  author: string;
  subject: string;
  category: 'Textbook' | 'Reference' | 'Exam Bank' | 'Lab Manual';
  pages: number;
  format: string;
  downloadUrl?: string;
  rating: number;
}

interface Chapter {
  id: number;
  title: string;
  gujaratiTitle?: string;
  pages: string;
  sections: {
    heading: string;
    content: string[];
    formula?: string;
    keyPoints?: string[];
  }[];
}

const SAMPLE_BOOK_CONTENT: Record<string, Chapter[]> = {
  '1': [
    {
      id: 1,
      title: 'Chapter 1: Limits, Continuity & Differential Calculus',
      gujaratiTitle: 'પ્રકરણ ૧: લક્ષ, સાતત્ય અને વિકલન ગણિત',
      pages: '1 - 48',
      sections: [
        {
          heading: '1.1 Intuitive Definition of Limit and Epsilon-Delta Rigor',
          content: [
            'Calculus is built upon the fundamental concept of limit. As a variable approaches a specific real number c, the function f(x) approaches a limiting value L.',
            'Let f(x) be defined on an open interval containing c (except possibly at c itself). We say that the limit of f(x) as x approaches c is L, denoted by lim_{x→c} f(x) = L, if for every ε > 0 there exists a δ > 0 such that |f(x) - L| < ε whenever 0 < |x - c| < δ.',
          ],
          formula: 'lim_{x \\to c} \\frac{f(x) - f(c)}{x - c} = f\'(c)',
          keyPoints: [
            'Standard limits: lim_{x→0} (sin x)/x = 1 (where x is in radians)',
            'L\'Hôpital\'s Rule applies to indeterminate forms 0/0 and ∞/∞',
            'Continuous functions guarantee that lim_{x→c} f(x) = f(c)',
          ],
        },
        {
          heading: '1.2 Fundamental Derivative Rules & Chain Rule',
          content: [
            'The derivative measures the instantaneous rate of change of a quantity. For composite functions (f ∘ g)(x), differentiation follows the Chain Rule: d/dx [f(g(x))] = f\'(g(x)) · g\'(x).',
            'In Gujarat State GSEB examinations, mastering logarithmic differentiation is vital for functions of the form y = [u(x)]^{v(x)}.',
          ],
          formula: '\\frac{d}{dx}[u \\cdot v] = u \\frac{dv}{dx} + v \\frac{du}{dx}',
          keyPoints: [
            'Product Rule & Quotient Rule application in trigonometric functions',
            'Derivatives of Inverse Trigonometric Functions: d/dx(arcsin x) = 1/√(1-x²)',
            'Mean Value Theorem (Lagrange & Rolle) geometric interpretation',
          ],
        },
      ],
    },
    {
      id: 2,
      title: 'Chapter 2: Definite Integrals & Applications to Area',
      gujaratiTitle: 'પ્રકરણ ૨: નિયત સંકલન અને ક્ષેત્રફળના ઉપયોગો',
      pages: '49 - 95',
      sections: [
        {
          heading: '2.1 Fundamental Theorem of Calculus',
          content: [
            'The Fundamental Theorem of Calculus bridges differential and integral calculus, proving that integration is the inverse process of differentiation.',
            'If f is continuous on [a, b] and F is any antiderivative of f on [a, b], then ∫_a^b f(x) dx = F(b) - F(a).',
          ],
          formula: '\\int_{a}^{b} f(x) dx = F(b) - F(a)',
          keyPoints: [
            'Properties of Definite Integrals: ∫_a^b f(x) dx = ∫_a^b f(a + b - x) dx',
            'Area bounded between curves y = f(x) and y = g(x) from a to b',
            'Symmetry principles for odd and even functions over [-a, a]',
          ],
        },
      ],
    },
  ],
  '2': [
    {
      id: 1,
      title: 'Chapter 1: Rotational Mechanics & Angular Momentum',
      gujaratiTitle: 'પ્રકરણ ૧: ચાકગતિ અને કોણીય વેગમાન',
      pages: '1 - 62',
      sections: [
        {
          heading: '1.1 Moment of Inertia and Parallel Axis Theorem',
          content: [
            'Moment of inertia (I) is the rotational analog of mass. It quantifies an object\'s resistance to changes in its rotational motion about a fixed axis of rotation.',
            'For a continuous mass distribution, I = ∫ r² dm. The Parallel Axis Theorem states that I = I_cm + M d², where I_cm is the moment of inertia about the center of mass axis.',
          ],
          formula: 'I = I_{cm} + M d^2 \\quad ; \\quad \\vec{L} = I \\vec{\\omega}',
          keyPoints: [
            'Conservation of Angular Momentum when net external torque Στ = 0',
            'Kinetic energy of rolling without slipping: E_k = (1/2) M v_cm² + (1/2) I_cm ω²',
            'GSEB practical exam experiment: Flywheel moment of inertia determination',
          ],
        },
      ],
    },
  ],
  '4': [
    {
      id: 1,
      title: 'Unit 1: GSEB Class 10 Board Solved Mathematics Papers',
      gujaratiTitle: 'એકમ ૧: ધોરણ ૧૦ બોર્ડ ગણિત સોલ્વ કરેલા પેપર્સ (૨૦૨૦-૨૦૨૫)',
      pages: '1 - 70',
      sections: [
        {
          heading: 'Standard Mathematics March 2024 (Section A & B Solutions)',
          content: [
            'Q.1 Find the discriminant of the quadratic equation 2x² - 4x + 3 = 0 and hence determine the nature of roots.',
            'Solution: Standard form ax² + bx + c = 0. Here a = 2, b = -4, c = 3. Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8 < 0. Since D < 0, the equation has no real roots (two distinct complex roots).',
            'Q.2 The n-th term of an Arithmetic Progression is given by an = 3 + 4n. Find the common difference and the sum of first 15 terms.',
            'Solution: a1 = 3 + 4(1) = 7, a2 = 3 + 4(2) = 11. Common difference d = 11 - 7 = 4. Sum S_15 = (15/2)[2(7) + (15-1)(4)] = (15/2)[14 + 56] = (15/2)(70) = 525.',
          ],
          formula: 'S_n = \\frac{n}{2}[2a + (n-1)d] \\quad ; \\quad D = b^2 - 4ac',
          keyPoints: [
            'Weightage: Quadratic Equations (6 Marks), Arithmetic Progression (8 Marks)',
            'Step marking criteria strictly followed per GSEB Gandhinagar board rubric',
            'Theorem 6.1 (Basic Proportionality Theorem) proof included in Section D',
          ],
        },
      ],
    },
  ],
  '5': [
    {
      id: 1,
      title: 'Module 1: Python Programming, Data Structures & Machine Learning',
      gujaratiTitle: 'મોડ્યુલ ૧: પાયથન પ્રોગ્રામિંગ, ડેટા સ્ટ્રક્ચર અને AI સિદ્ધાંતો',
      pages: '1 - 85',
      sections: [
        {
          heading: '1.1 Object-Oriented Programming and Asynchronous Patterns',
          content: [
            'Python provides rich support for Object-Oriented Programming (OOP) including class inheritance, encapsulation, polymorphism, and decorators.',
            'Using NumPy and Pandas for data manipulation enables high-performance vector calculations required in modern machine learning pipelines.',
          ],
          formula: 'f(x) = \\frac{1}{1 + e^{-z}} \\quad (\\text{Sigmoid Activation Function})',
          keyPoints: [
            'List Comprehensions and Generator expressions for memory optimization',
            'Supervised vs Unsupervised learning algorithms overview',
            'TensorFlow / PyTorch gradient descent optimization principles',
          ],
        },
      ],
    },
  ],
};

interface DigitalBookReaderModalProps {
  book: BookData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalBookReaderModal: React.FC<DigitalBookReaderModalProps> = ({
  book,
  isOpen,
  onClose,
}) => {
  const { currentSchool } = useAuth();
  const { language } = useLanguage();

  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [readingTheme, setReadingTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [bookmarkedChapters, setBookmarkedChapters] = useState<number[]>([]);
  const [searchInBook, setSearchInBook] = useState('');
  const [highlightedMode, setHighlightedMode] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  if (!isOpen || !book) return null;

  const bookChapters = SAMPLE_BOOK_CONTENT[book.id] || [
    {
      id: 1,
      title: `Chapter 1: Fundamentals of ${book.subject}`,
      gujaratiTitle: `પ્રકરણ ૧: ${book.subject} ના મૂળભૂત સિદ્ધાંતો`,
      pages: '1 - 35',
      sections: [
        {
          heading: '1.1 Key Principles & Syllabus Overview',
          content: [
            `Welcome to the digital study edition of "${book.title}" by ${book.author}. This syllabus aligns strictly with the Gujarat Secondary and Higher Secondary Education Board (GSEB) guidelines.`,
            'Students are advised to review the theoretical concepts thoroughly, complete the exercise problems at the end of each topic, and practice standard board-pattern question sets.',
          ],
          formula: '\\sum_{i=1}^{n} X_i = \\text{Total Academic Preparedness}',
          keyPoints: [
            'Includes solved examples and model answer papers',
            'Verified reference material for board examinations',
            'Digital copy authorized for institutional student portal use',
          ],
        },
        {
          heading: '1.2 Model Practice Problems',
          content: [
            'Work through these conceptual problems to test your understanding before attempting the end-of-term evaluations.',
            'Consult your subject faculty during tutorial periods for detailed doubt resolution.',
          ],
        },
      ],
    },
  ];

  const activeChapter = bookChapters[currentChapterIdx] || bookChapters[0];

  const toggleBookmark = (id: number) => {
    if (bookmarkedChapters.includes(id)) {
      setBookmarkedChapters(bookmarkedChapters.filter((c) => c !== id));
    } else {
      setBookmarkedChapters([...bookmarkedChapters, id]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopyToast(language === 'gu' ? 'ઈ-બુક લિંક કોપી થઈ ગઈ!' : 'E-Book link copied to clipboard!');
    setTimeout(() => setCopyToast(null), 3000);
  };

  const getThemeClass = () => {
    switch (readingTheme) {
      case 'sepia':
        return 'bg-[#fbf0d9] text-[#433422] border-[#e8d5b5]';
      case 'dark':
        return 'bg-slate-900 text-slate-100 border-slate-800';
      default:
        return 'bg-white text-slate-900 border-slate-200';
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-sm leading-relaxed';
      case 'lg':
        return 'text-lg leading-loose';
      case 'xl':
        return 'text-xl leading-loose';
      default:
        return 'text-base leading-relaxed';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-6xl h-[94vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border ${getThemeClass()} transition-colors duration-200`}
      >
        {/* Reader Top Bar */}
        <div className="px-4 py-3 border-b flex items-center justify-between gap-2 shrink-0 bg-opacity-90 backdrop-blur-xs">
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle Table of Contents"
            >
              <List className="w-4 h-4" />
            </button>
            <div className="truncate">
              <h2 className="text-sm font-bold truncate">{book.title}</h2>
              <p className="text-[11px] opacity-70 truncate">
                {book.author} • {book.category} • {currentSchool.name}
              </p>
            </div>
          </div>

          {/* Reader Controls Toolbar */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Font Size Adjust */}
            <div className="flex items-center bg-slate-200/50 dark:bg-slate-800/80 rounded-xl p-0.5">
              <button
                onClick={() => setFontSize(fontSize === 'xl' ? 'lg' : fontSize === 'lg' ? 'base' : 'sm')}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer"
                title="Decrease font size"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono font-bold px-1.5 uppercase">{fontSize}</span>
              <button
                onClick={() => setFontSize(fontSize === 'sm' ? 'base' : fontSize === 'base' ? 'lg' : 'xl')}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer"
                title="Increase font size"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center bg-slate-200/50 dark:bg-slate-800/80 rounded-xl p-0.5">
              <button
                onClick={() => setReadingTheme('light')}
                className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  readingTheme === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'opacity-70'
                }`}
                title="Light Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReadingTheme('sepia')}
                className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  readingTheme === 'sepia' ? 'bg-[#e8d5b5] text-[#433422] shadow-xs' : 'opacity-70'
                }`}
                title="Sepia Warm Mode"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReadingTheme('dark')}
                className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  readingTheme === 'dark' ? 'bg-slate-700 text-white shadow-xs' : 'opacity-70'
                }`}
                title="Dark Night Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bookmark button */}
            <button
              onClick={() => toggleBookmark(activeChapter.id)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                bookmarkedChapters.includes(activeChapter.id)
                  ? 'text-amber-500 bg-amber-500/10'
                  : 'hover:bg-slate-200/50 dark:hover:bg-slate-800'
              }`}
              title={bookmarkedChapters.includes(activeChapter.id) ? 'Bookmarked' : 'Bookmark this chapter'}
            >
              <Bookmark
                className={`w-4 h-4 ${bookmarkedChapters.includes(activeChapter.id) ? 'fill-amber-500' : ''}`}
              />
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Print Reader Content"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Share E-Book"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-200/60 hover:bg-rose-600 hover:text-white dark:bg-slate-800 dark:hover:bg-rose-600 transition-colors cursor-pointer ml-1"
              title="Close Reader"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Copy Toast Alert */}
        {copyToast && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center space-x-2 animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>{copyToast}</span>
          </div>
        )}

        {/* Reader Body (Sidebar + Content) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Table of Contents Sidebar */}
          {isSidebarOpen && (
            <div className="w-64 sm:w-72 border-r p-4 overflow-y-auto shrink-0 bg-black/5 dark:bg-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider opacity-70">
                <span>{language === 'gu' ? 'અનુક્રમણિકા (Chapters)' : 'Table of Contents'}</span>
                <span>{bookChapters.length} {language === 'gu' ? 'પ્રકરણો' : 'Units'}</span>
              </div>

              {/* Search Inside */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={language === 'gu' ? 'પ્રકરણમાં શોધો...' : 'Search inside book...'}
                  value={searchInBook}
                  onChange={(e) => setSearchInBook(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg border text-xs bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Search className="w-3.5 h-3.5 absolute left-2 top-2 opacity-50" />
              </div>

              <div className="space-y-1.5 pt-1">
                {bookChapters.map((ch, idx) => {
                  const isSelected = idx === currentChapterIdx;
                  const isBookmarked = bookmarkedChapters.includes(ch.id);

                  return (
                    <button
                      key={ch.id}
                      onClick={() => setCurrentChapterIdx(idx)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all flex items-start justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'hover:bg-slate-200/60 dark:hover:bg-slate-800/60 opacity-90'
                      }`}
                    >
                      <div className="space-y-0.5 pr-2">
                        <div className="font-bold leading-snug">
                          {language === 'gu' && ch.gujaratiTitle ? ch.gujaratiTitle : ch.title}
                        </div>
                        <div className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'opacity-60'}`}>
                          Pages: {ch.pages}
                        </div>
                      </div>
                      {isBookmarked && (
                        <Bookmark className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'fill-white text-white' : 'fill-amber-500 text-amber-500'}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Institutional Attribution Card */}
              <div className="p-3 rounded-xl border border-indigo-200/50 bg-indigo-50/50 dark:bg-indigo-950/20 text-[11px] space-y-1 mt-6">
                <div className="font-bold text-indigo-900 dark:text-indigo-200">
                  GSEB Board Authorized Resource
                </div>
                <p className="opacity-75 text-[10px] leading-relaxed">
                  Verified curriculum reader for {currentSchool.name}. Self-study & classroom revision edition.
                </p>
              </div>
            </div>
          )}

          {/* Main Book Content View */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8">
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Chapter Header */}
              <div className="border-b pb-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  <span>{book.subject} • {book.category}</span>
                  <span>Pages {activeChapter.pages}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {language === 'gu' && activeChapter.gujaratiTitle ? activeChapter.gujaratiTitle : activeChapter.title}
                </h1>
                <p className="text-xs opacity-70">
                  Gujarat State Board Secondary & Higher Secondary Education Curriculum
                </p>
              </div>

              {/* Chapter Sections */}
              {activeChapter.sections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-4">
                  <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
                    <span>{section.heading}</span>
                  </h2>

                  <div className={`space-y-3 opacity-90 font-serif ${getFontSizeClass()}`}>
                    {section.content.map((p, pIdx) => (
                      <p key={pIdx} className="leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>

                  {/* Highlighted Formula / Equation Block */}
                  {section.formula && (
                    <div className="p-4 rounded-xl border border-indigo-200/70 bg-indigo-50/40 dark:bg-slate-800/80 my-4 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                        Core Mathematical & Theoretical Principle
                      </div>
                      <div className="font-mono text-base sm:text-lg font-bold text-indigo-950 dark:text-indigo-100 py-1">
                        {section.formula}
                      </div>
                    </div>
                  )}

                  {/* GSEB Exam Key Points */}
                  {section.keyPoints && section.keyPoints.length > 0 && (
                    <div className="p-4 rounded-xl border bg-black/5 dark:bg-white/5 space-y-2 mt-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>GSEB Exam Quick Revision Points (મુખ્ય મુદ્દાઓ)</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-xs opacity-85">
                        {section.keyPoints.map((kp, kIdx) => (
                          <li key={kIdx} className="leading-relaxed">
                            {kp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reader Footer Navigation */}
        <div className="px-4 py-3 border-t flex items-center justify-between gap-4 shrink-0 bg-opacity-90 backdrop-blur-xs">
          <button
            disabled={currentChapterIdx === 0}
            onClick={() => setCurrentChapterIdx(Math.max(0, currentChapterIdx - 1))}
            className="px-3.5 py-1.5 rounded-xl border font-bold text-xs flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{language === 'gu' ? 'પાછળનું પ્રકરણ' : 'Previous Unit'}</span>
          </button>

          <div className="text-xs font-mono font-bold opacity-75">
            {language === 'gu' ? 'પ્રકરણ' : 'Unit'} {currentChapterIdx + 1} / {bookChapters.length}
          </div>

          <button
            disabled={currentChapterIdx === bookChapters.length - 1}
            onClick={() => setCurrentChapterIdx(Math.min(bookChapters.length - 1, currentChapterIdx + 1))}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs"
          >
            <span>{language === 'gu' ? 'આગળનું પ્રકરણ' : 'Next Unit'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
