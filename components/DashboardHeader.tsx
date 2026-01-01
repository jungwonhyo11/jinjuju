
import React from 'react';

interface Props {
  filteredDataCount?: number;
}

const DashboardHeader: React.FC<Props> = ({ filteredDataCount = 0 }) => {
  return (
    <header className="bg-white/80 backdrop-blur-xl text-slate-900 px-8 py-5 border-b border-slate-200 shadow-sm relative z-20 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-xl rotate-3">진</div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
               <h1 className="text-xl font-black tracking-tighter text-slate-900">진주정보통신</h1>
               <div className="h-4 w-[2px] bg-blue-600 opacity-30"></div>
               <span className="text-sm font-black text-blue-600 tracking-tight uppercase">Intelligence</span>
            </div>
            <p className="text-slate-400 text-[10px] font-bold tracking-tight uppercase opacity-60">G2B Market Analysis & AI Communication Hub</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
          <MetricCard label="필터링" value={filteredDataCount.toString()} unit="건" trend="LIVE" />
          <MetricCard label="낙찰 성공률" value="94.2" unit="%" />
          <MetricCard label="예측 규모" value="12.4" unit="억" />
          <MetricCard label="엔진" value="ACTIVE" color="text-emerald-500" />
        </div>
      </div>
    </header>
  );
};

const MetricCard: React.FC<{ label: string; value: string; unit?: string; trend?: string; color?: string }> = ({ label, value, unit, trend, color }) => (
  <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl transition-all hover:bg-white hover:shadow-sm">
    <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider mb-1 opacity-70">{label}</p>
    <div className="flex items-baseline gap-1">
      <span className={`text-sm font-black tracking-tight ${color || 'text-slate-800'}`}>{value}</span>
      {unit && <span className="text-[10px] font-bold text-slate-300">{unit}</span>}
      {trend && <span className="text-[9px] font-black ml-1 text-blue-500 animate-pulse">{trend}</span>}
    </div>
  </div>
);

export default DashboardHeader;
