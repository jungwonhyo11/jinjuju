
import React, { useState, useMemo, useEffect, useRef } from 'react';
import DashboardHeader from './components/DashboardHeader';
import Visualizations from './components/Visualizations';
import CalendarView from './components/CalendarView';
import DocumentViewer from './components/DocumentViewer';
import MiniDatePicker from './components/MiniDatePicker';
import { BidItem, FilterState, BidCategory } from './types';
import { generateMockData, createSingleBid, REGIONS, BID_TYPES, CATEGORIES } from './constants';
import { Search, Filter, Plus, FileText, BarChart3, Mail, RefreshCw, Radio, FileSearch, X, CalendarDays, Send, Smartphone, Printer, AtSign, Zap, Flame, Cpu } from 'lucide-react';
import { getBidInsights, generateMarketingMessage } from './services/geminiService';

const App: React.FC = () => {
  const [data, setData] = useState<BidItem[]>([]);
  const [logs, setLogs] = useState<string[]>(["[시스템] 실시간 엔진 가동 시작...", "[시스템] 조달청 데이터 동기화 완료."]);
  const [filters, setFilters] = useState<FilterState>({
    bidType: 'all',
    category: 'all',
    startDate: '',
    endDate: '',
    region: '전체',
    minAmount: '',
    maxAmount: '',
    keyword: ''
  });
  const [selectedBid, setSelectedBid] = useState<BidItem | null>(null);
  const [showDocument, setShowDocument] = useState<BidItem | null>(null);
  const [aiInsights, setAiInsights] = useState<string>('실시간 데이터를 수집 중입니다. 분석 실행 버튼을 누르면 AI 리포트를 생성합니다.');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'analytics' | 'message' | 'calendar'>('list');
  const [generatedMsg, setGeneratedMsg] = useState('');
  const [isSending, setIsSending] = useState<'none' | 'email' | 'fax' | 'sms'>('none');
  
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialData = generateMockData(80);
    setData(initialData);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newBid = createSingleBid(Math.floor(Math.random() * 1000), new Date());
      setData(prev => [newBid, ...prev].slice(0, 300));
      setLogs(prev => [...prev, `[NEW] ${newBid.category} ${newBid.type}: ${newBid.title}`].slice(-10));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.startDate && item.openDate < filters.startDate) return false;
      if (filters.endDate && item.openDate > filters.endDate) return false;
      if (filters.bidType !== 'all' && item.type !== filters.bidType) return false;
      if (filters.category !== 'all' && item.category !== filters.category) return false;
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
    setGeneratedMsg('');
    const msg = await generateMarketingMessage(selectedBid, type);
    setGeneratedMsg(msg || '메시지 생성 실패');
  };

  const simulateSend = (type: 'email' | 'fax' | 'sms') => {
    if (!selectedBid || !generatedMsg) return;
    setIsSending(type);
    setTimeout(() => {
      setIsSending('none');
      const target = selectedBid.winner || selectedBid.organization;
      setLogs(prev => [...prev, `[SUCCESS] ${type.toUpperCase()} 전송 완료: ${target}`].slice(-10));
      alert(`${type.toUpperCase()} 발송이 성공적으로 완료되었습니다.`);
    }, 2000);
  };

  const getCategoryIcon = (cat: BidCategory) => {
    switch (cat) {
      case '정보통신': return <Cpu size={14} />;
      case '전기': return <Zap size={14} />;
      case '소방': return <Flame size={14} />;
    }
  };

  const getCategoryColor = (cat: BidCategory) => {
    switch (cat) {
      case '정보통신': return 'bg-blue-100 text-blue-700 border-blue-200';
      case '전기': return 'bg-amber-100 text-amber-700 border-amber-200';
      case '소방': return 'bg-rose-100 text-rose-700 border-rose-200';
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Status bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 bg-slate-900 rounded-xl p-4 border border-slate-700 shadow-lg flex items-center gap-4 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-1 bg-red-600/20 text-red-500 rounded-full animate-pulse border border-red-500/30">
              <Radio size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400">LIVE FEED</span>
            </div>
            <div className="flex-1 font-mono text-xs text-slate-400 truncate italic">
              {logs[logs.length - 1]}
            </div>
          </div>
          <div className="lg:w-48">
            <button onClick={() => setData(generateMockData(80))} className="w-full h-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all shadow-sm active:scale-95 text-xs font-black">
              <RefreshCw size={14} /> 데이터 동기화
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-slate-800">
              <Filter size={18} className="text-blue-600" />
              <h2 className="font-bold">데이터 상세 검색 및 분야 설정</h2>
            </div>
            <span className="text-[11px] font-bold text-slate-400 px-2 py-1 bg-slate-100 rounded">검색된 데이터: {filteredData.length}건</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><CalendarDays size={12} /> 검색 시작일</label>
                <MiniDatePicker value={filters.startDate} onChange={(date) => setFilters({...filters, startDate: date})} placeholder="날짜 선택" />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><CalendarDays size={12} /> 검색 종료일</label>
                <MiniDatePicker value={filters.endDate} onChange={(date) => setFilters({...filters, endDate: date})} placeholder="날짜 선택" />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">사업 분야</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={filters.category} onChange={e => setFilters({...filters, category: e.target.value as any})}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">지역</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={filters.region} onChange={e => setFilters({...filters, region: e.target.value})}>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
             </div>
             <div className="lg:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">키워드 검색</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="공고명, 기관명, 공사내용 등..." className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={filters.keyword} onChange={e => setFilters({...filters, keyword: e.target.value})} />
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">공고 구분</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={filters.bidType} onChange={e => setFilters({...filters, bidType: e.target.value as any})}>
                  {BID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
             </div>
             <div className="flex items-end gap-2">
                <button onClick={runAiAnalysis} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4 py-3 rounded-lg shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2">
                  AI 분석
                </button>
                <button onClick={() => setFilters({bidType: 'all', category: 'all', startDate: '', endDate: '', region: '전체', minAmount: '', maxAmount: '', keyword: ''})} className="bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs px-4 py-3 rounded-lg transition-all">초기화</button>
             </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-blue-50 border-2 border-blue-100 p-5 rounded-2xl mb-8">
          <div className="flex items-center gap-3 mb-3">
             <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md"><BarChart3 size={16} /></div>
             <h3 className="font-black text-blue-900 text-sm">진주정보통신 AI 인사이트</h3>
          </div>
          <div className="text-blue-800 text-sm leading-relaxed font-medium bg-white/50 p-4 rounded-xl border border-blue-200/50">
            {isAiLoading ? '데이터를 분석 중입니다...' : aiInsights}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-6 overflow-x-auto custom-scrollbar sticky top-0 bg-slate-50/90 backdrop-blur-md z-40">
           <TabButton active={activeTab === 'list'} onClick={() => setActiveTab('list')} icon={<FileText size={18} />} label="전체 데이터" count={filteredData.length} />
           <TabButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<CalendarDays size={18} />} label="일정 캘린더" />
           <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart3 size={18} />} label="분야별 통계" />
           <TabButton active={activeTab === 'message'} onClick={() => setActiveTab('message')} icon={<Mail size={18} />} label="AI 자동 마케팅" />
        </div>

        {/* Content Views */}
        {activeTab === 'calendar' && <CalendarView data={filteredData} onSelectBid={setSelectedBid} />}
        {activeTab === 'analytics' && <Visualizations data={filteredData} />}
        
        {activeTab === 'list' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">분야 / 번호</th>
                    <th className="px-6 py-4">구분</th>
                    <th className="px-6 py-4">공고일 / 사업명 / 발주처</th>
                    <th className="px-6 py-4 text-right">금액 (만원)</th>
                    <th className="px-6 py-4">낙찰업체 정보</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map(item => (
                    <tr key={item.id} className={`group hover:bg-blue-50/40 transition-colors cursor-pointer ${selectedBid?.id === item.id ? 'bg-blue-50' : ''}`} onClick={() => setSelectedBid(item)}>
                      <td className="px-6 py-5">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-black mb-1 w-fit ${getCategoryColor(item.category)}`}>
                          {getCategoryIcon(item.category)}
                          {item.category}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{item.bidNo}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${item.type === '낙찰' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{item.type}</span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[10px] font-bold text-blue-500 mb-1">{item.openDate}</p>
                        <p className="text-sm font-bold text-slate-800 truncate max-w-xs">{item.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{item.organization}</p>
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-sm text-slate-900">{(item.basePrice/10000).toLocaleString()}</td>
                      <td className="px-6 py-5">
                        {item.type === '낙찰' ? (
                          <div className="text-xs">
                            <p className="font-bold text-blue-700">{item.winner}</p>
                            <p className="text-[10px] text-slate-400">{item.winnerContact?.phone}</p>
                          </div>
                        ) : <span className="text-slate-300 text-xs italic">입찰 진행 중</span>}
                      </td>
                      <td className="px-6 py-5 text-right">
                         <button onClick={(e) => { e.stopPropagation(); setShowDocument(item); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-blue-100 transition-all">
                            <FileSearch size={18} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length === 0 && (
                <div className="py-20 text-center text-slate-400 italic">검색 조건에 맞는 공고가 없습니다.</div>
              )}
            </div>
          </div>
        )}

        {/* Marketing View */}
        {activeTab === 'message' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="space-y-6">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Smartphone size={18} className="text-blue-600" /> 홍보 대상 및 채널 선택
                  </h3>
                  {selectedBid ? (
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl mb-8">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black mb-2 w-fit ${getCategoryColor(selectedBid.category)}`}>
                            {getCategoryIcon(selectedBid.category)} {selectedBid.category}
                          </div>
                          <p className="font-black text-slate-800 text-lg">{selectedBid.type === '낙찰' ? selectedBid.winner : selectedBid.organization}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${selectedBid.type === '낙찰' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{selectedBid.type}</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-xs font-bold text-slate-500">
                        <p className="flex items-center gap-2"><Smartphone size={14} /> {selectedBid.winnerContact?.phone || '정보없음'}</p>
                        <p className="flex items-center gap-2"><AtSign size={14} /> {selectedBid.winnerContact?.email || '정보없음'}</p>
                        <p className="flex items-center gap-2"><Printer size={14} /> {selectedBid.winnerContact?.fax || '정보없음'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-20 text-center border-4 border-dashed border-slate-50 rounded-2xl text-slate-300 font-black italic mb-8">공고를 선택해주세요</div>
                  )}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button onClick={() => handleGenerateMsg('축하')} disabled={!selectedBid || selectedBid.type !== '낙찰'} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-100 transition-all">축하 메시지 생성</button>
                    <button onClick={() => handleGenerateMsg('제안')} disabled={!selectedBid} className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-100 transition-all">협력 제안서 생성</button>
                  </div>
                  
                  <div className="space-y-3 pt-6 border-t border-slate-100">
                    <div className="grid grid-cols-3 gap-3">
                      <button onClick={() => simulateSend('sms')} disabled={!generatedMsg || isSending !== 'none'} className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group">
                        <Smartphone className="text-slate-400 group-hover:text-blue-600" />
                        <span className="text-[10px] font-black text-slate-600">문자 발송</span>
                      </button>
                      <button onClick={() => simulateSend('email')} disabled={!generatedMsg || isSending !== 'none'} className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group">
                        <AtSign className="text-slate-400 group-hover:text-blue-600" />
                        <span className="text-[10px] font-black text-slate-600">이메일 발송</span>
                      </button>
                      <button onClick={() => simulateSend('fax')} disabled={!generatedMsg || isSending !== 'none'} className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group">
                        <Printer className="text-slate-400 group-hover:text-blue-600" />
                        <span className="text-[10px] font-black text-slate-600">팩스 전송</span>
                      </button>
                    </div>
                  </div>
                </div>
             </div>

             <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-black flex items-center gap-2 italic">
                    <Send size={16} className="text-emerald-500 animate-pulse" /> AI MARKETING SCRIPT
                  </h3>
                  {isSending !== 'none' && <span className="text-[10px] bg-emerald-500 text-white px-3 py-1 rounded-full font-black animate-bounce">{isSending.toUpperCase()} 전송 중...</span>}
                </div>
                <div className="flex-1 bg-slate-800/80 text-emerald-400 p-8 rounded-2xl font-mono text-sm leading-relaxed border border-slate-700/50 overflow-y-auto custom-scrollbar">
                   {generatedMsg || '> 대상을 선택하고 메시지 생성 버튼을 누르세요...'}
                </div>
             </div>
          </div>
        )}
      </main>

      {showDocument && <DocumentViewer bid={showDocument} onClose={() => setShowDocument(null)} />}

      {/* Bottom Panel */}
      {selectedBid && activeTab !== 'message' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl p-6 flex flex-col md:flex-row gap-8 items-center animate-in slide-in-from-bottom-10 z-50">
           <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${getCategoryColor(selectedBid.category)}`}>
                  {getCategoryIcon(selectedBid.category)} {selectedBid.category}
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${selectedBid.type === '낙찰' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}>{selectedBid.type}</span>
                <h4 className="font-black text-slate-900 text-lg truncate">{selectedBid.title}</h4>
              </div>
              <p className="text-xs text-slate-400 font-bold">{selectedBid.organization} • {selectedBid.bidNo}</p>
           </div>
           <div className="flex gap-2">
              <button onClick={() => setShowDocument(selectedBid)} className="px-6 py-3 bg-white text-slate-600 font-black rounded-xl hover:bg-slate-50 border border-slate-200 transition-all flex items-center gap-2">
                <FileSearch size={16} /> 공고/시방서
              </button>
              <button onClick={() => { setActiveTab('message'); handleGenerateMsg(selectedBid.type === '낙찰' ? '축하' : '제안'); }} className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                자동 홍보 발송
              </button>
              <button onClick={() => setSelectedBid(null)} className="p-3 text-slate-300 hover:text-slate-500 transition-colors"><X size={20} /></button>
           </div>
        </div>
      )}
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count?: number }> = ({ active, onClick, icon, label, count }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-8 py-5 border-b-2 transition-all whitespace-nowrap relative ${active ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
    {icon}
    <span className="font-black text-sm">{label}</span>
    {count !== undefined && <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ml-1 ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>{count}</span>}
  </button>
);

export default App;
