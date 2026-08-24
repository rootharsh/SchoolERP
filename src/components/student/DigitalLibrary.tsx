import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Library,
  BookOpen,
  Download,
  Search,
  CheckCircle2,
  FileText,
  Star,
  ExternalLink,
} from 'lucide-react';
import { DigitalBookReaderModal, BookData } from '../modals/DigitalBookReaderModal';

interface BookItem extends BookData {}

export const DigitalLibrary: React.FC = () => {
  const { currentSchool } = useAuth();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [readingBook, setReadingBook] = useState<BookItem | null>(null);

  const books: BookItem[] = [
    { id: '1', title: 'Mathematics & Analytic Geometry (Grade 10-12)', author: 'Dr. R. K. Patel & Dr. M. G. Joshi', subject: 'Mathematics', category: 'Textbook', pages: 840, format: 'PDF (24 MB)', rating: 4.9 },
    { id: '2', title: 'Principles of Modern Physics & Mechanics', author: 'Prof. Bhaveshbhai D. Trivedi (HOD Physics)', subject: 'Physics', category: 'Textbook', pages: 960, format: 'PDF (38 MB)', rating: 4.8 },
    { id: '3', title: 'Advanced Organic Chemistry & Science Lab Manual', author: 'Dr. H. N. Rawal & GSEB Science Council', subject: 'Chemistry', category: 'Lab Manual', pages: 180, format: 'PDF (12 MB)', rating: 4.7 },
    { id: '4', title: 'Grade 10 Board Solved Question Bank (2020-2026)', author: 'GSEB State Academic Council (Gandhinagar)', subject: 'General', category: 'Exam Bank', pages: 320, format: 'PDF (18 MB)', rating: 5.0 },
    { id: '5', title: 'Computer Science: Python, Algorithms & AI Fundamentals', author: 'Prof. Snehal V. Dave, MCA', subject: 'Computer Science', category: 'Reference', pages: 450, format: 'PDF (15 MB)', rating: 4.9 },
    { id: '6', title: 'English Literature, Grammar & Communication', author: 'Saurashtra University Academic Press', subject: 'English', category: 'Reference', pages: 290, format: 'PDF (9 MB)', rating: 4.6 },
  ];

  const handleReadOnline = (book: BookItem) => {
    setReadingBook(book);
  };

  const filteredBooks = books.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesQ = b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.subject.toLowerCase().includes(q);
    const matchesCat = selectedCategory === 'ALL' || b.category === selectedCategory;
    return matchesQ && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Library className="w-5 h-5 text-indigo-600" />
          <span>{language === 'gu' ? 'શાળા ડિજિટલ ઈ-લાયબ્રેરી અને સંદર્ભ ગ્રંથાલય' : 'Institutional Digital Resource Library'}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {language === 'gu'
            ? `${currentSchool.gujarati_name || currentSchool.name} ના વિદ્યાર્થીઓ માટે પ્રમાણિત પાઠ્યપુસ્તકો, સોલ્વ કરેલા પેપર્સ અને સંદર્ભ ગ્રંથો.`
            : `Access curated textbooks, verified solved question banks, and reference manuals for ${currentSchool.name}.`}
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'gu' ? 'પુસ્તકનું શીર્ષક, લેખક અથવા વિષયથી શોધો...' : 'Search e-books by title, author, or subject...'}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto">
          {['ALL', 'Textbook', 'Reference', 'Exam Bank', 'Lab Manual'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {book.category}
                </span>
                <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{book.rating}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">{book.title}</h3>
              <p className="text-xs text-slate-500 font-medium">{language === 'gu' ? 'લેખક:' : 'Author:'} {book.author}</p>
              <div className="text-[11px] text-slate-400 flex items-center space-x-3 pt-1">
                <span>{book.pages} {language === 'gu' ? 'પાના' : 'Pages'}</span>
                <span>•</span>
                <span>{book.format}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">{book.subject}</span>
              <button
                onClick={() => handleReadOnline(book)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{language === 'gu' ? 'ઓનલાઇન વાંચો' : 'Read Online'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Digital Book Reader Modal */}
      {readingBook && (
        <DigitalBookReaderModal
          book={readingBook}
          isOpen={!!readingBook}
          onClose={() => setReadingBook(null)}
        />
      )}
    </div>
  );
};
