
import React from 'react';

const DashboardHeader: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white p-6 rounded-b-2xl shadow-xl border-b border-blue-700/50 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-xl shadow-inner">
             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">진</div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">진주정보통신 입찰·낙찰 마스터</h1>
            <p className="text-blue-200 text-sm mt-1">공공기관 통신·전기·네트워크 공사 실시간 데이터 분석 엔진</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
          <MetricCard label="오늘의 신규 공고" value="12건" trend="+2" />
          <MetricCard label="낙찰 진행률" value="94.2%" trend="+0.5%" />
          <MetricCard label="총 수주액 (당월)" value="12.4억" trend="+15%" />
          <MetricCard label="경쟁 강도" value="중간" color="text-yellow-400" />
        </div>
      </div>
    </header>
  );
};

const MetricCard: React.FC<{ label: string; value: string; trend?: string; color?: string }> = ({ label, value, trend, color }) => (
  <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-xl">
    <p className="text-white/60 text-xs font-medium mb-1">{label}</p>
    <div className="flex items-baseline gap-2">
      <span className={`text-lg font-bold ${color || 'text-white'}`}>{value}</span>
      {trend && <span className="text-[10px] text-emerald-400 font-bold">{trend}</span>}
    </div>
  </div>
);

export default DashboardHeader;
