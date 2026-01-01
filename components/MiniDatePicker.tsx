
import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

const MiniDatePicker: React.FC<Props> = ({ value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(value || new Date()));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const days = [];
  const startDay = firstDayOfMonth(year, month);
  const totalDays = daysInMonth(year, month);

  // 6주(42일) 고정 그리드 생성
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);
  while (days.length < 42) days.push(null);

  const handleDateClick = (day: number) => {
    const selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(selectedDate);
    setIsOpen(false);
  };

  const changeMonth = (offset: number) => {
    setViewDate(new Date(year, month + offset, 1));
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full bg-white/80 border border-slate-200 rounded-2xl p-4 text-sm cursor-pointer hover:border-blue-400 transition-all shadow-sm group"
      >
        <CalendarIcon size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
        <span className={value ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'}>
          {value || placeholder}
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-3 z-[100] bg-white border border-slate-200 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] p-6 w-[320px] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
            <span className="text-base font-black text-slate-900 tracking-tight">{year}년 {month + 1}월</span>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
              <ChevronRight size={20} className="text-slate-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-3 text-center">
            {['일', '월', '화', '수', '목', '금', '토'].map((d, idx) => (
              <div key={d} className={`text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-slate-400'}`}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} className="h-9" />;
              
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = value === dateStr;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`
                    text-xs h-9 flex items-center justify-center rounded-xl transition-all font-bold
                    ${isSelected 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-400/40' 
                      : isToday 
                        ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                        : 'hover:bg-slate-100 text-slate-600'}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniDatePicker;
