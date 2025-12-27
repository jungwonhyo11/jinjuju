
import React, { useState, useMemo, useEffect, useRef } from 'react';
import DashboardHeader from './components/DashboardHeader';
import Visualizations from './components/Visualizations';
import { BidItem, FilterState } from './types';
import { generateMockData, createSingleBid, REGIONS, BID_TYPES } from './constants';
import { Search, Filter, Download, Plus, FileText, ChevronRight, BarChart3, Mail, RefreshCw, Radio } from 'lucide-react';
import { getBidInsights, generateMarketingMessage } from './services/geminiService';

const App: React.FC = () => {
  const [data, setData] = useState<BidItem[]>([]);
  const [logs, setLogs] = useState<string[]>(["[시스템] 실시간 엔진 가동 시작...", "[시스템] 조달청 데이터 동기화 완료."]);
  const [filters, setFilters] = useState<FilterState>({
    bidType: 'all',
    startDate: '',
    endDate: '',
    region: '전체',
    minAmount: '',
    maxAmount: '',
    keyword: ''
  });
  const [selectedBid, setSelectedBid] = useState<BidItem | null>(null);
  const [aiInsights, setAiInsights] = useState<string>('실시간 데이터를 수집 중입니다. 분석 실행 버튼을 누르면 AI 리포트를 생성합니다.');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'analytics' | 'message'>('list');
  const [generatedMsg, setGeneratedMsg] = useState('');
  
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initial Data
  useEffect(() => {
    const initialData = generateMockData(40);
    setData(initialData);
  }, []);

  // Real-time Simulation Engine
  useEffect(() => {
    const interval = setInterval(() => {
      const newBid = createSingleBid(Math.floor(Math.random() * 1000));
      setData(prev => [newBid, ...prev].slice(0, 300)); // Keep last 300
      setLogs(prev => [...prev, `[NEW] ${newBid.type}: ${newBid.title} (${(newBid.basePrice/100000000).toFixed(1)}억)`].slice(-10));
    }, 8000); // Add new every 8 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.bidType !== 'all' && item.type !== filters.bidType) return false;
      if (filters.region !== '전체' && item.region !== filters.region) return false;
      if (filters.keyword && !item.title.toLowerCase().includes(filters.keyword.toLowerCase()) && !item.organization.toLowerCase().includes(filters.keyword.toLowerCase())) return false;
      
      const price = item.awardPrice || item.basePrice;
      if (filters.minAmount && price < parseInt(filters.minAmount) * 10000) return false;
      if (filters.maxAmount && price > parseInt(filters.maxAmount) * 10000) return false;
      
      return true;
    });
  }, [data, filters]);

  const runAiAnalysis = async () => {
    setIsAiLoading(true);
    const insights = await getBidInsights(filteredData);
    setAiInsights(insights || '분석 결과가 없습니다.');
    setIsAiLoading(false);
  };

  const handleGenerateMsg = async (type: '축하' | '제안') => {
    if (!selectedBid) return;
    setGeneratedMsg('AI가 메시지를 작성 중입니다...');
    const msg = await generateMarketingMessage(selectedBid, type);
    setGeneratedMsg(msg || '메시지 생성 실패');
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Real-time Status & Quick Logs */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 bg-slate-900 rounded-xl p-4 border border-slate-700 shadow-lg flex items-center gap-4 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-1 bg-red-600/20 text-red-500 rounded-full animate-pulse border border-red-500/30">
              <Radio size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">LIVE</span>
            </div>
            <div className="flex-1 font-mono text-xs text-slate-400 truncate">
              {logs[logs.length - 1]}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              TOTAL_RECORDS: {data.length}
            </div>
          </div>
          
          <div className="lg:w-48 flex items-center gap-2">
            <button 
              onClick={() => setData(generateMockData(50))}
              className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 py-3 rounded-xl transition-all shadow-sm active:scale-95 text-sm font-bold"
            >
              <RefreshCw size={16} /> 강제 새로고침
            </button>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div className="flex items-center gap-2 mb-6 text-slate-800">
            <Filter size={20} className="text-blue-600" />
            <h2 className="font-bold">입찰 데이터 정밀 필터</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">공고 구분</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={filters.bidType}
                onChange={e => setFilters({...filters, bidType: e.target.value as any})}
              >
                {BID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">지역</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={filters.region}
                onChange={e => setFilters({...filters, region: e.target.value})}
              >
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">키워드 (공고명/발주처)</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="예: 통신공사, 조달청, CCTV..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={filters.keyword}
                  onChange={e => setFilters({...filters, keyword: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">최소 금액 (만원)</label>
              <input 
                type="number" 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={filters.minAmount}
                onChange={e => setFilters({...filters, minAmount: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">최대 금액 (만원)</label>
              <input 
                type="number" 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={filters.maxAmount}
                onChange={e => setFilters({...filters, maxAmount: e.target.value})}
              />
            </div>

            <div className="lg:col-span-2 flex items-end gap-2">
              <button 
                onClick={runAiAnalysis}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors h-[42px] shadow-lg shadow-blue-200"
              >
                <Plus size={20} />
                AI 데이터 분석 실행
              </button>
              <button 
                onClick={() => setFilters({bidType: 'all', startDate: '', endDate: '', region: '전체', minAmount: '', maxAmount: '', keyword: ''})}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-lg transition-colors h-[42px]"
              >
                초기화
              </button>
            </div>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
                <BarChart3 size={20} />
             </div>
             <div>
               <h3 className="font-bold text-slate-900">AI 경영 인사이트 리포트</h3>
               <p className="text-[11px] text-slate-400">Gemini 3.0 Flash 기반 실시간 분석</p>
             </div>
          </div>
          <div className="text-slate-700 text-sm leading-relaxed p-4 bg-slate-50 rounded-xl border border-slate-100 min-h-[60px]">
            {isAiLoading ? (
              <div className="flex items-center gap-3">
                <RefreshCw size={18} className="animate-spin text-blue-600" />
                <span className="font-medium">빅데이터 분석 모델을 가동 중입니다...</span>
              </div>
            ) : aiInsights}
          </div>
        </div>

        {/* Tabs Control */}
        <div className="flex border-b border-slate-200 mb-6 overflow-x-auto custom-scrollbar sticky top-0 bg-slate-50/90 backdrop-blur-md z-10">
           <TabButton active={activeTab === 'list'} onClick={() => setActiveTab('list')} icon={<FileText size={18} />} label="전체 데이터" count={filteredData.length} />
           <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart3 size={18} />} label="통계 시각화" />
           <TabButton active={activeTab === 'message'} onClick={() => setActiveTab('message')} icon={<Mail size={18} />} label="AI 자동 영업" />
        </div>

        {/* Dynamic Content */}
        {activeTab === 'analytics' && <Visualizations data={filteredData} />}

        {activeTab === 'list' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
               <h3 className="font-bold text-slate-800">입찰 및 낙찰 현황 실시간 리스트</h3>
               <button className="text-slate-500 hover:text-blue-600 flex items-center gap-2 text-sm font-semibold transition-colors">
                 <Download size={16} /> 데이터 내보내기
               </button>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                    <th className="px-6 py-4">공고번호</th>
                    <th className="px-6 py-4">구분</th>
                    <th className="px-6 py-4">공고명</th>
                    <th className="px-6 py-4">발주기관</th>
                    <th className="px-6 py-4 text-right">기초금액 (만원)</th>
                    <th className="px-6 py-4">마감/일자</th>
                    <th className="px-6 py-4">낙찰업체 (낙찰율)</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((item, idx) => (
                    <tr 
                      key={item.id} 
                      className={`group hover:bg-blue-50/40 transition-all cursor-pointer ${selectedBid?.id === item.id ? 'bg-blue-50' : ''} ${idx < 1 && 'animate-in fade-in slide-in-from-left-4 duration-500'}`}
                      onClick={() => setSelectedBid(item)}
                    >
                      <td className="px-6 py-5 text-xs text-slate-400 font-mono">{item.bidNo}</td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-tight ${item.type === '낙찰' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-blue-700 transition-colors">{item.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.region} • 통신공사</p>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600 font-medium">{item.organization}</td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-900 text-right">
                        {(Math.round((item.basePrice) / 10000)).toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-xs text-slate-500 font-medium whitespace-nowrap">{item.closeDate}</td>
                      <td className="px-6 py-5">
                        {item.type === '낙찰' ? (
                          <div className="space-y-0.5">
                            <p className="text-sm text-blue-700 font-bold">{item.winner}</p>
                            <p className="text-[10px] text-emerald-600 font-bold">{item.winRate?.toFixed(3)}%</p>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs italic">진행 중</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <ChevronRight size={18} className={`text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all ${selectedBid?.id === item.id ? 'rotate-90 text-blue-500' : ''}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length === 0 && (
                <div className="py-32 flex flex-col items-center justify-center text-slate-400 gap-4">
                  <div className="bg-slate-100 p-6 rounded-full">
                    <Search size={40} className="text-slate-300" />
                  </div>
                  <p className="font-medium">검색 조건에 맞는 데이터가 없습니다.</p>
                  <button onClick={() => setFilters({bidType: 'all', startDate: '', endDate: '', region: '전체', minAmount: '', maxAmount: '', keyword: ''})} className="text-blue-600 font-bold text-sm hover:underline">필터 초기화</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'message' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Mail size={18} className="text-blue-600" /> 커뮤니케이션 대상 선택
               </h3>
               {selectedBid ? (
                 <div className="p-5 bg-blue-50 rounded-xl border border-blue-100 mb-6">
                    <p className="text-[10px] font-black text-blue-400 mb-1 uppercase tracking-widest">SELECTED CONTRACT</p>
                    <p className="font-bold text-slate-800 mb-2">{selectedBid.title}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">발주처</p>
                        <p className="text-sm font-medium">{selectedBid.organization}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">낙찰사</p>
                        <p className="text-sm font-bold text-blue-600">{selectedBid.winner || '입찰 중'}</p>
                      </div>
                    </div>
                 </div>
               ) : (
                 <div className="p-16 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 mb-6 bg-slate-50/50">
                    <FileText size={32} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-medium">데이터 목록 탭에서 분석할 공고를 선택하세요.</p>
                 </div>
               )}
               
               <div className="space-y-3">
                 <button 
                  onClick={() => handleGenerateMsg('축하')}
                  disabled={!selectedBid || selectedBid.type !== '낙찰'}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                 >
                   🎉 낙찰 축하 및 협력 제안 메시지 생성
                 </button>
                 <button 
                   onClick={() => handleGenerateMsg('제안')}
                   disabled={!selectedBid}
                   className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                 >
                   💼 발주처 대상 사업 수행 제안서 메시지
                 </button>
               </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-white flex items-center gap-2">
                   <Radio size={16} className="text-emerald-500" /> AI 생성 영업 스크립트
                 </h3>
                 <span className="text-[10px] text-slate-500 font-mono">MODEL: GEMINI-3.0</span>
               </div>
               <div className="bg-slate-800/50 text-emerald-400 p-6 rounded-xl font-mono text-sm min-h-[300px] whitespace-pre-wrap leading-relaxed border border-slate-700 shadow-inner overflow-y-auto max-h-[400px] custom-scrollbar">
                  {generatedMsg ? (
                    <div className="animate-in fade-in duration-700">
                      {generatedMsg}
                    </div>
                  ) : '> 대상을 선택하고 위 버튼을 클릭하여 AI 영업 전략을 생성하세요...'}
               </div>
               {generatedMsg && (
                 <div className="flex gap-2 mt-4">
                   <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedMsg);
                      alert('복사되었습니다.');
                    }}
                    className="flex-1 bg-white hover:bg-slate-50 text-slate-900 font-bold py-3 rounded-xl transition-all active:scale-95"
                   >
                     텍스트 복사하기
                   </button>
                 </div>
               )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Detail Panel */}
      {selectedBid && activeTab === 'list' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 flex flex-col md:flex-row gap-8 items-start md:items-center animate-in slide-in-from-bottom-8 duration-300 z-50">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${selectedBid.type === '낙찰' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}>{selectedBid.type}</span>
              <h4 className="font-bold text-slate-900 text-lg truncate">{selectedBid.title}</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-slate-400 mb-0.5">발주처</p>
                <p className="font-bold text-slate-800">{selectedBid.organization}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-0.5">금액 (원)</p>
                <p className="font-bold text-slate-800">{selectedBid.basePrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-0.5">마감일</p>
                <p className="font-bold text-slate-800">{selectedBid.closeDate}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-0.5">입찰 번호</p>
                <p className="font-bold text-blue-600">{selectedBid.bidNo}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <button 
              onClick={() => { setActiveTab('message'); handleGenerateMsg('제안'); }}
              className="flex-1 md:flex-none px-8 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
             >
               AI 자동 영업
             </button>
             <button 
              onClick={() => setSelectedBid(null)}
              className="px-6 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-all"
             >
               닫기
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count?: number }> = ({ active, onClick, icon, label, count }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-8 py-5 border-b-2 transition-all whitespace-nowrap relative ${active ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
  >
    {icon}
    <span className="font-bold text-sm tracking-tight">{label}</span>
    {count !== undefined && <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ml-1 ${active ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>{count}</span>}
    {active && <div className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>}
  </button>
);

export default App;
