
import React, { useState } from 'react';
import { BidItem, BidCategory } from '../types';
import { ChevronLeft, ChevronRight, Zap, Flame, Cpu, Clock, CheckCircle } from 'lucide-react';

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
  
  // 6주(42일) 분량의 그리드를 항상 생성하여 날짜가 잘리는 현상을 방지
  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null); // 이전 달 빈 공간
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push(i); // 현재 달 날짜
  }
  // 마지막 주 빈 공간 채우기 (총 42개 유지)
  while (days.length < 42) {
    days.push(null);
  }

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return data.filter(item => {
      return item.openDate === dateStr || item.closeDate === dateStr;
    }).map(item => ({
      ...item,
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
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden relative z-10">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-xl">
        <div>
          <h3 className="font-black text-slate-900 text-2xl tracking-tighter">
            {year}년 {month + 1}월 입찰·낙찰 일정 리포트
          </h3>
          <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Global G2B Sync Schedule</p>
        </div>
        <div className="flex gap-3">
          <button onClick={prevMonth} className="p-3 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-all active:scale-90 bg-white">
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-6 text-xs font-black text-slate-500 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all bg-white">오늘</button>
          <button onClick={nextMonth} className="p-3 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-all active:scale-90 bg-white">
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
          <div key={day} className={`py-4 text-center text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-slate-400'}`}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[160px]">
        {days.map((day, idx) => {
          if (day === null) {
            return (
              <div key={`empty-${idx}`} className="border-r border-b border-slate-50 bg-slate-50/20 last:border-r-0"></div>
            );
          }
          
          const events = getEventsForDate(day);
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
          const isWeekend = idx % 7 === 0 || idx % 7 === 6;

          return (
            <div key={day} className={`border-r border-b border-slate-100 p-3 overflow-y-auto custom-scrollbar transition-all hover:bg-slate-50/80 last:border-r-0 ${isToday ? 'bg-blue-50/30' : ''}`}>
              <div className="flex justify-between items-center mb-3">
                <span className={`text-xs font-black h-7 w-7 flex items-center justify-center rounded-xl ${isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-400/40' : isWeekend ? (idx % 7 === 0 ? 'text-red-500' : 'text-blue-500') : 'text-slate-500'}`}>
                  {day}
                </span>
                {events.length > 0 && (
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">{events.length} LOGS</span>
                )}
              </div>
              <div className="space-y-1.5">
                {events.map(ev => (
                  <div 
                    key={ev.id} 
                    onClick={() => onSelectBid(ev)}
                    className={`group relative text-[9px] p-2 rounded-xl border cursor-pointer transition-all hover:translate-x-1 shadow-sm leading-tight ${getCategoryColor(ev.category)}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {getCategoryIcon(ev.category)}
                      <span className="font-black truncate w-full">{ev.title.split(' ').slice(-1)}</span>
                    </div>
                    <div className="flex items-center justify-between font-bold opacity-70">
                      <span className="scale-90 origin-left">{ev.type}</span>
                      {ev.isClosing ? <Clock size={10} className="text-red-500 animate-pulse" /> : (ev.type === '낙찰' ? <CheckCircle size={10} className="text-emerald-500" /> : null)}
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
