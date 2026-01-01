
import React, { useState, useMemo, useEffect, useRef } from 'react';
import DashboardHeader from './components/DashboardHeader';
import Visualizations from './components/Visualizations';
import CalendarView from './components/CalendarView';
import DocumentViewer from './components/DocumentViewer';
import MiniDatePicker from './components/MiniDatePicker';
import { BidItem, FilterState, BidCategory } from './types';
import { generateMockData, createSingleBid, REGIONS, BID_TYPES, CATEGORIES } from './constants';
import { 
  Search, FileText, BarChart3, Mail, RefreshCw, Radio, FileSearch, X, 
  CalendarDays, Send, Smartphone, Zap, Flame, Cpu, Sparkles, 
  MousePointer2, Phone, Printer, AtSign, CheckCircle2, Loader2, Landmark 
} from 'lucide-react';
import { getBidInsights, generateMarketingMessage } from './services/geminiService';

const App: React.FC = () => {
  const [data, setData] = useState<BidItem[]>([]);
  const [logs, setLogs] = useState<string[]>(["[시스템] 실시간 인텔리전스 가동...", "[시스템] 조달청 API 동기화 완료."]);
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
  const [aiInsights, setAiInsights] = useState<string>('시장 데이터를 분석하여 실시간 인사이트를 도출할 수 있습니다.');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isQuotaExhausted, setIsQuotaExhausted] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'analytics' | 'message' | 'calendar'>('list');
  const [generatedMsg, setGeneratedMsg] = useState('');
  const [is3DActive, setIs3DActive] = useState(false); 
  const [isSending, setIsSending] = useState(false);
  const [sendMethod, setSendMethod] = useState<'sms' | 'email' | 'fax'>('sms');
  
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialData = generateMockData(120);
    setData(initialData);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newBid = createSingleBid(Math.floor(Math.random() * 1000), new Date());
      setData(prev => [newBid, ...prev].slice(0, 500));
      setLogs(prev => [...prev, `[NEW] ${newBid.category} ${newBid.type}: ${newBid.title}`].slice(-10));
    }, 15000);
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
      if (filters.keyword.trim()) {
        const searchTerms = filters.keyword.toLowerCase().split(/\s+/).filter(t => t.length > 0);
        const searchableText = `${item.title} ${item.organization} ${item.bidNo}`.toLowerCase();
        const matchesAllTerms = searchTerms.every(term => searchableText.includes(term));
        if (!matchesAllTerms) return false;
      }
      const price = item.awardPrice || item.basePrice;
      if (filters.minAmount) {
        const minVal = parseInt(filters.minAmount, 10) * 10000;
        if (!isNaN(minVal) && price < minVal) return false;
      }
      if (filters.maxAmount) {
        const maxVal = parseInt(filters.maxAmount, 10) * 10000;
        if (!isNaN(maxVal) && price > maxVal) return false;
      }
      return true;
    });
  }, [data, filters]);

  const runAiAnalysis = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    try {
      const insights = await getBidInsights(filteredData);
      setAiInsights(insights);
      setIsQuotaExhausted(false);
    } catch (error: any) {
      if (error.message === 'QUOTA_EXHAUSTED') {
        setIsQuotaExhausted(true);
        setAiInsights(`[정적 분석] ${filteredData.length}건 데이터 기반 시장 경쟁 강도 보통 이상 예측.`);
      }
    } finally {
      setIsAiLoading(false);
    }
  }

  const handleGenerateMsg = async (type: '축하' | '제안') => {
    if (!selectedBid) return;
    setGeneratedMsg('');
    try {
      const msg = await generateMarketingMessage(selectedBid, type);
      setGeneratedMsg(msg || '메시지 생성 실패');
    } catch (error) {
      setGeneratedMsg(`[AI 한도 초과]\n안녕하십니까, (주)진주정보통신입니다.\n귀사의 ${selectedBid.title} 관련하여 협업을 제안드립니다.\n협업 문의: 010-8758-5959`);
    }
  };

  const handleSendAction = () => {
    if (!generatedMsg || isSending) return;
    setIsSending(true);
    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      setLogs(prev => [...prev, `[발송성공] ${sendMethod.toUpperCase()} -> ${selectedBid?.winner || selectedBid?.organization}`].slice(-10));
      alert(`${sendMethod.toUpperCase()} 발송이 완료되었습니다.`);
    }, 1500)
  };

  const getCategoryIcon = (cat: BidCategory) => {
    switch (cat) {
      case '정보통신': return <Cpu size={12} />;
      case '전기': return <Zap size={12} />;
      case '소방': return <Flame size={12} />;
    }
  };

  const getCategoryColor = (cat: BidCategory) => {
    switch (cat) {
      case '정보통신': return 'bg-blue-50 text-blue-600 border-blue-100';
      case '전기': return 'bg-amber-50 text-amber-600 border-amber-100';
      case '소방': return 'bg-rose-50 text-rose-600 border-rose-100';
    }
  };

  return (
    <div className="min-h-screen pb-10 bg-slate-50 font-['Pretendard']">
      <div className={`fixed inset-0 z-[55] transition-all duration-1000 ${is3DActive ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-20 grayscale-[0.5]'}`}>
        <iframe src='https://my.spline.design/nexbotrobotcharacterconcept-NymrKVgiC6rTAJio9uZXjSP4/' frameBorder='0' width='100%' height='100%' style={{ border: 'none' }} title="Spline 3D" loading="lazy" allow="autoplay" />
      </div>

      <div className={`relative z-10 transition-all duration-700 ${is3DActive ? 'blur-2xl opacity-30 scale-95 pointer-events-none' : ''}`}>
        <DashboardHeader filteredDataCount={filteredData.length} />
        
        <main className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm overflow-hidden">
               <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-lg font-black text-[10px] tracking-tighter shrink-0">
                 <Radio size={12} className="animate-pulse text-blue-400" /> LIVE ENGINE
               </div>
               <div className="font-mono text-[11px] text-slate-500 truncate italic font-medium">
                 {logs[logs.length - 1]}
               </div>
            </div>
            
            <div className="lg:w-1/2 flex gap-4">
              <div className={`flex-1 bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm transition-all hover:border-blue-300 group`}>
                <div className={`${isQuotaExhausted ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'} p-2 rounded-xl shrink-0 group-hover:scale-110 transition-transform`}>
                  <Sparkles size={16} />
                </div>
                <div className="text-[11px] font-bold text-slate-600 line-clamp-1 flex-1 leading-snug">
                  {isAiLoading ? "시장 분석 연산 중..." : aiInsights}
                </div>
                <button onClick={runAiAnalysis} disabled={isAiLoading} className="text-[10px] font-black text-blue-600 hover:underline shrink-0 px-2 uppercase tracking-tighter">분석 실행</button>
              </div>
              <button onClick={() => setData(generateMockData(150))} className="p-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 rounded-2xl transition-all shadow-sm active:scale-95 shrink-0">
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-200 mb-6 transition-all hover:shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
               <div className="lg:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">검색 키워드</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input type="text" placeholder="사업명, 기관, 공고번호..." className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all" value={filters.keyword} onChange={e => setFilters({...filters, keyword: e.target.value})} />
                  </div>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">조회 시작일</label>
                  <MiniDatePicker value={filters.startDate} onChange={(date) => setFilters({...filters, startDate: date})} placeholder="시작일 선택" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">조회 종료일</label>
                  <MiniDatePicker value={filters.endDate} onChange={(date) => setFilters({...filters, endDate: date})} placeholder="종료일 선택" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">분야</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-blue-500 font-bold appearance-none cursor-pointer" value={filters.category} onChange={e => setFilters({...filters, category: e.target.value as any})}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">지역</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-blue-500 font-bold appearance-none cursor-pointer" value={filters.region} onChange={e => setFilters({...filters, region: e.target.value})}>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
               </div>
               <div className="flex items-end">
                  <button onClick={() => setFilters({bidType: 'all', category: 'all', startDate: '', endDate: '', region: '전체', minAmount: '', maxAmount: '', keyword: ''})} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[11px] rounded-xl transition-all border border-slate-200 uppercase tracking-tighter">초기화</button>
               </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6 bg-slate-200/50 p-1 rounded-2xl w-fit">
             <TabButton active={activeTab === 'list'} onClick={() => setActiveTab('list')} icon={<FileText size={16} />} label="리스트 피드" />
             <TabButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<CalendarDays size={16} />} label="일정 캘린더" />
             <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart3 size={16} />} label="시장 통계" />
             <TabButton active={activeTab === 'message'} onClick={() => setActiveTab('message')} icon={<Mail size={16} />} label="홍보 자동화" />
          </div>

          <div className="min-h-[500px]">
            {activeTab === 'list' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">분야 / 번호</th>
                        <th className="px-6 py-4">구분</th>
                        <th className="px-6 py-4">공고명 및 수요기관</th>
                        <th className="px-6 py-4 text-right">금액 (만원)</th>
                        <th className="px-6 py-4">낙찰사 연락처</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredData.map(item => (
                        <tr key={item.id} className={`group hover:bg-slate-50/80 transition-all cursor-pointer ${selectedBid?.id === item.id ? 'bg-blue-50/50' : ''}`} onClick={() => setSelectedBid(item)}>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[9px] font-black mb-1 ${getCategoryColor(item.category)}`}>
                              {getCategoryIcon(item.category)} {item.category}
                            </div>
                            <div className="text-[10px] font-mono font-bold text-slate-400 tracking-tighter">{item.bidNo}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${item.type === '낙찰' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-blue-600 text-white border-blue-700'}`}>{item.type}</span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-[13px] font-black text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{item.title}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{item.organization}</p>
                          </td>
                          <td className="px-6 py-4 text-right font-black text-[13px] text-slate-700 font-mono">{(item.basePrice/10000).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            {item.winner ? (
                              <div className="space-y-0.5">
                                <div className="text-[11px] font-black text-slate-800 truncate max-w-[120px]">{item.winner}</div>
                                <div className="text-[9px] font-bold text-slate-400 flex items-center gap-1"><Phone size={10} className="text-blue-400"/> {item.winnerContact?.phone}</div>
                              </div>
                            ) : <span className="text-slate-300 text-[10px] font-bold italic tracking-tighter">수집 대기 중</span>}
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button onClick={(e) => { e.stopPropagation(); setShowDocument(item); }} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                <FileSearch size={18} />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'analytics' && <Visualizations data={filteredData} />}
            {activeTab === 'calendar' && <CalendarView data={filteredData} onSelectBid={setSelectedBid} />}
            
            {activeTab === 'message' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Sender Info Selection Card */}
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
                    {/* Fix: Added missing Landmark import */}
                    <div className="absolute top-0 right-0 p-8 opacity-5"><Landmark size={80}/></div>
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><Smartphone size={20} className="text-blue-600"/> 발송 대상 정보 수집</h3>
                    
                    {selectedBid ? (
                      <div className="space-y-6">
                        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="text-[10px] font-black text-blue-600 mb-1">{selectedBid.organization} 사업</div>
                              <p className="text-sm font-black text-slate-900 leading-snug">{selectedBid.title}</p>
                            </div>
                            <span className="px-2 py-1 bg-white border border-slate-200 text-[9px] font-black rounded-lg">{selectedBid.category}</span>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-3 pt-4 border-t border-slate-200/60">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400 font-bold flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> 대상 업체</span>
                              <span className="font-black text-slate-800">{selectedBid.winner || '입찰 참여사 전체'}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400 font-bold flex items-center gap-2"><Phone size={14} className="text-blue-400"/> 대표 번호</span>
                              <span className="font-mono font-black text-slate-800">{selectedBid.winnerContact?.phone || '055-XXX-XXXX'}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400 font-bold flex items-center gap-2"><AtSign size={14} className="text-purple-400"/> 이메일 주소</span>
                              <span className="font-mono font-black text-slate-800">{selectedBid.winnerContact?.email || 'collecting@email.com'}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400 font-bold flex items-center gap-2"><Printer size={14} className="text-amber-400"/> 팩스 번호</span>
                              <span className="font-mono font-black text-slate-800">{selectedBid.winnerContact?.fax || '055-XXX-XXXX'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">AI 메시지 생성 옵션</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => handleGenerateMsg('축하')} disabled={selectedBid.type !== '낙찰'} className="py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95">축하 인사말 생성</button>
                            <button onClick={() => handleGenerateMsg('제안')} className="py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs shadow-lg shadow-blue-500/20 transition-all active:scale-95">협업 제안서 생성</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-20 text-center text-slate-300 font-bold italic border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center gap-4">
                        <MousePointer2 size={32} className="opacity-30" />
                        리스트에서 대상 사업을 선택해 주세요.
                      </div>
                    )}
                  </div>

                  {/* Sending Channel Selection */}
                  {generatedMsg && (
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">발송 매체 선택 및 실행</h4>
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <button onClick={() => setSendMethod('sms')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${sendMethod === 'sms' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                          <Smartphone size={20} />
                          <span className="text-[11px] font-black">문자(SMS)</span>
                        </button>
                        <button onClick={() => setSendMethod('email')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${sendMethod === 'email' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                          <AtSign size={20} />
                          <span className="text-[11px] font-black">이메일</span>
                        </button>
                        <button onClick={() => setSendMethod('fax')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${sendMethod === 'fax' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                          <Printer size={20} />
                          <span className="text-[11px] font-black">팩스(FAX)</span>
                        </button>
                      </div>
                      <button 
                        onClick={handleSendAction} 
                        disabled={isSending}
                        className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-xl text-sm flex items-center justify-center gap-3 shadow-xl transition-all disabled:opacity-50"
                      >
                        {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        {isSending ? '발송 처리 중...' : `${sendMethod.toUpperCase()} 즉시 발송`}
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-8 flex flex-col min-h-[500px] shadow-2xl relative">
                   <div className="text-emerald-400 font-mono text-[11px] mb-6 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                       AI INTELLIGENT SCRIPT TERMINAL_
                     </div>
                     <span className="opacity-40 text-[9px]">v2.5_ENTERPRISE</span>
                   </div>
                   <div className="flex-1 text-emerald-100/90 font-mono text-[13px] leading-relaxed overflow-y-auto whitespace-pre-wrap custom-scrollbar pr-4">
                     {generatedMsg || "> 분석 대상 대기 중... 대상을 선택하고 [생성] 버튼을 눌러주세요."}
                   </div>
                   {generatedMsg && (
                     <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                        <div className="text-[10px] text-emerald-500/50 font-mono italic">Script analysis complete. Ready for transmission.</div>
                        <button onClick={() => navigator.clipboard.writeText(generatedMsg)} className="text-[10px] font-black text-white/50 hover:text-white transition-colors">COPY TO CLIPBOARD</button>
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <div className="fixed bottom-6 right-6 z-[70] flex flex-col gap-3">
        <button onClick={() => setIs3DActive(!is3DActive)} className={`p-4 rounded-full shadow-2xl transition-all active:scale-90 border border-white/20 backdrop-blur-md ${is3DActive ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'}`}>
          {is3DActive ? <X size={24} /> : <MousePointer2 size={24} />}
        </button>
      </div>

      {selectedBid && activeTab !== 'message' && !is3DActive && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl p-4 flex items-center gap-6 animate-in slide-in-from-bottom-10 z-[65]">
           <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2 mb-1">
               <span className={`px-2 py-0.5 rounded text-[9px] font-black ${getCategoryColor(selectedBid.category)}`}>{selectedBid.category}</span>
               <h4 className="font-black text-slate-900 text-[14px] truncate tracking-tight">{selectedBid.title}</h4>
             </div>
             <p className="text-[10px] text-slate-400 font-bold pl-0.5">{selectedBid.organization} | <span className="text-blue-600 font-mono">{selectedBid.bidNo}</span></p>
           </div>
           <div className="flex gap-2 shrink-0">
              <button onClick={() => setShowDocument(selectedBid)} className="px-4 py-2 text-xs font-black text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all">명세 상세</button>
              <button onClick={() => { setActiveTab('message'); handleGenerateMsg(selectedBid.type === '낙찰' ? '축하' : '제안'); }} className="px-6 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xl shadow-blue-500/20 transition-all">홍보 자동화</button>
              <button onClick={() => setSelectedBid(null)} className="p-2 text-slate-300 hover:text-slate-900 transition-all"><X size={20} /></button>
           </div>
        </div>
      )}

      {showDocument && <DocumentViewer bid={showDocument} onClose={() => setShowDocument(null)} />}
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all whitespace-nowrap text-[11px] font-black ${active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
    {icon}
    {label}
  </button>
);

export default App;
