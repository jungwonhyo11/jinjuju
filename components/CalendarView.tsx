
import React, { useState } from 'react';
import { BidItem, BidCategory } from '../types';
import { ChevronLeft, ChevronRight, Zap, Flame, Cpu, Clock, CheckCircle, PlusCircle } from 'lucide-react';

interface Props {
  data: BidItem[];
  onSelectBid: (bid: BidItem) => void;
}

const CalendarView: React.FC<Props> = ({ data, onSelectBid }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  
  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // 입찰공고일(Open) 또는 마감일(Close)에 해당하는 항목 모두 수집
    return data.filter(item => {
      return item.openDate === dateStr || item.closeDate === dateStr;
    }).map(item => ({
      ...item,
      eventType: item.closeDate === dateStr ? '마감' : '시작',
      isClosing: item.closeDate === dateStr && item.type === '입찰'
    }));
  };

  const getCategoryColor = (cat: BidCategory) => {
    switch (cat) {
      case '정보통신': return 'bg-blue-50 text-blue-700 border-blue-200';
      case '전기': return 'bg-amber-50 text-amber-700 border-amber-200';
      case '소방': return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  const getCategoryIcon = (cat: BidCategory) => {
    switch (cat) {
      case '정보통신': return <Cpu size={10} />;
      case '전기': return <Zap size={10} />;
      case '소방': return <Flame size={10} />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg"><PlusCircle size={24} /></div>
          <div>
            <h3 className="font-black text-slate-800 text-2xl tracking-tight">
              {year}년 {month + 1}월 스마트 비즈니스 캘린더
            </h3>
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400"><div className="w-2 h-2 bg-blue-500 rounded-full" /> 공고시작</span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400"><div className="w-2 h-2 bg-rose-500 rounded-full" /> 입찰마감</span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400"><div className="w-2 h-2 bg-emerald-500 rounded-full" /> 낙찰결과</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={prevMonth} className="p-3 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all active:scale-95 shadow-sm">
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-6 text-sm font-black text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm">오늘</button>
          <button onClick={nextMonth} className="p-3 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all active:scale-95 shadow-sm">
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'].map((day, idx) => (
          <div key={day} className={`py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-slate-400'}`}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[minmax(140px,auto)]">
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="border-r border-b border-slate-50 bg-slate-50/20"></div>;
          
          const events = getEventsForDate(day);
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
          const isWeekend = idx % 7 === 0 || idx % 7 === 6;

          return (
            <div key={day} className={`border-r border-b border-slate-100 p-3 min-h-[140px] overflow-hidden transition-all hover:bg-slate-50 group ${isToday ? 'bg-blue-50/10' : ''}`}>
              <div className="flex justify-between items-center mb-3">
                <span className={`text-sm font-black h-8 w-8 flex items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${isToday ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : isWeekend ? (idx % 7 === 0 ? 'text-red-500' : 'text-blue-500') : 'text-slate-900'}`}>
                  {day}
                </span>
                {events.length > 0 && (
                  <div className="flex -space-x-1">
                    {Array.from(new Set(events.map(e => e.category))).map(cat => (
                       <div key={cat} className={`w-2 h-2 rounded-full border border-white ${cat === '정보통신' ? 'bg-blue-500' : cat === '전기' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                {events.map(ev => (
                  <div 
                    key={`${ev.id}-${ev.eventType}`} 
                    onClick={() => onSelectBid(ev)}
                    className={`group/item relative text-[10px] p-2 rounded-xl border cursor-pointer transition-all hover:translate-x-1 shadow-sm leading-tight ${getCategoryColor(ev.category)}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="shrink-0">{getCategoryIcon(ev.category)}</div>
                      <span className="font-black truncate block">{ev.title.split(' ').slice(-1)}</span>
                    </div>
                    <div className="flex items-center justify-between font-bold">
                      <span className={`px-1 rounded ${ev.eventType === '마감' ? 'bg-rose-500 text-white' : (ev.type === '낙찰' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white')}`}>
                        {ev.type === '낙찰' ? '낙찰' : ev.eventType}
                      </span>
                      {ev.isClosing && <Clock size={10} className="text-rose-600 animate-pulse" />}
                    </div>
                    {/* Tooltip on hover */}
                    <div className="hidden group-hover/item:block absolute bottom-full left-0 mb-2 w-48 bg-slate-900 text-white p-3 rounded-xl text-[10px] z-10 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                       <p className="font-black mb-1">{ev.title}</p>
                       <p className="opacity-70">{ev.organization}</p>
                       <p className="mt-2 text-blue-400">금액: {(ev.basePrice/10000).toLocaleString()}만원</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
