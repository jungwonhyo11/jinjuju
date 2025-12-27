
import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Search, Filter, FileText, BarChart3, Mail, RefreshCw, Radio, 
  FileSearch, X, CalendarDays, Send, Smartphone, Printer, AtSign, 
  Zap, Flame, Cpu, Clock, CheckCircle, PlusCircle, ChevronLeft, 
  ChevronRight, Download, Info, Settings, AlertCircle, ShieldCheck, 
  CheckSquare, BookOpen, UserCheck, ShieldAlert, Scale
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

// --- TYPES ---
type BidCategory = '정보통신' | '전기' | '소방';

interface Participant {
  companyName: string;
  isWinner: boolean;
  bidRate: number | null;
  awardPrice: number | null;
  phone?: string;
  email?: string;
  fax?: string;
}

interface BidItem {
  id: string;
  bidNo: string;
  type: '입찰' | '낙찰';
  category: BidCategory;
  openDate: string;
  closeDate: string;
  title: string;
  organization: string;
  region: string;
  basePrice: number;
  awardPrice?: number;
  winner?: string;
  winnerContact?: {
    phone: string;
    email: string;
    fax: string;
  };
  winRate?: number;
  participants: Participant[];
  link: string;
  documentUrl?: string;
  projectScope?: string;
  specDetails?: string[];
  equipmentList?: string[];
}

// --- CONSTANTS & MOCK DATA ---
const REGIONS = ['전체', '서울', '부산', '대구', '인천', '광주', '대전', '울산', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
const BID_TYPES = [{ value: 'all', label: '전체' }, { value: '입찰', label: '입찰공고' }, { value: '낙찰', label: '낙찰결과' }];
const CATEGORIES = [{ value: 'all', label: '전체 분야' }, { value: '정보통신', label: '정보통신' }, { value: '전기', label: '전기공사' }, { value: '소방', label: '소방공사' }];
const ORGS = ["조달청", "한국전력공사", "한국수자원공사", "KORAIL", "한국도로공사", "LH공사", "국가철도공단", "경남도청", "진주시청", "한국토지주택공사"];

const KEYWORDS_MAP: Record<BidCategory, string[]> = {
  '정보통신': ["통신공사", "네트워크 고도화", "CCTV 설치", "전산 유지보수", "광케이블 가설", "서버 인프라 구축"],
  '전기': ["전기공사", "변전설비 보수", "LED 조명 교체", "태양광 발전설비", "배전반 설치", "가로등 유지보수"],
  '소방': ["소방시설 보수", "스프링클러 설치", "화재감지기 교체", "소방정밀점검", "소방펌프 수리", "제연설비 공사"]
};

const PROJECT_DESCS: Record<BidCategory, string> = {
  '정보통신': "본 사업은 발주처 내 노후화된 네트워크 장비를 교체하여 초고속 통신망의 안정성을 확보하고, 지능형 관제 시스템을 도입하여 디지털 재난 대응 역량을 강화하는 것을 목적으로 합니다.",
  '전기': "사업지 내 노후 변압기 및 배전반을 교체하고, 에너지 절감을 위한 지능형 LED 조명 시스템과 태양광 발전 연동 인터페이스를 구축하는 공사입니다.",
  '소방': "화재 예방 및 신속 대응을 위해 소방 펌프, 수신기 등 핵심 설비를 정비하고, 법적 기준에 부합하는 스프링클러 헤드 및 화재 감지 센서 네트워크를 구성하는 공사입니다."
};

const createSingleBid = (idSuffix: string | number, specificDate?: Date): BidItem => {
  const categories: BidCategory[] = ['정보통신', '전기', '소방'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const isAward = Math.random() > 0.4;
  const basePrice = 30000000 + Math.floor(Math.random() * 4000000000);
  const today = new Date();
  const date = specificDate || new Date(today.getFullYear(), today.getMonth(), Math.floor(Math.random() * 28) + 1);
  const openDate = date.toISOString().split('T')[0];
  const closeDate = new Date(date.getTime() + 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0];
  const region = REGIONS[Math.floor(Math.random() * (REGIONS.length - 1)) + 1];
  const org = ORGS[Math.floor(Math.random() * ORGS.length)];
  const keyword = KEYWORDS_MAP[category][Math.floor(Math.random() * KEYWORDS_MAP[category].length)];

  const participants: Participant[] = Array.from({ length: Math.floor(Math.random() * 5) + 3 }).map((_, i) => ({
    companyName: `(주)${['태양', '진주', '한울', '세종', '미래'][i % 5]}${category.slice(0, 2)}`,
    isWinner: false,
    bidRate: 87 + Math.random() * 10,
    awardPrice: 0,
    phone: `010-${Math.floor(1000+Math.random()*9000)}-${Math.floor(1000+Math.random()*9000)}`,
    email: `contact${i}@biz.co.kr`
  }));

  if (isAward) {
    const winnerIdx = Math.floor(Math.random() * participants.length);
    participants[winnerIdx].isWinner = true;
    participants[winnerIdx].awardPrice = Math.round(basePrice * (participants[winnerIdx].bidRate! / 100));
  }

  const winner = participants.find(p => p.isWinner);

  return {
    id: `BID-${Date.now()}-${idSuffix}`,
    bidNo: `20250${Math.floor(Math.random()*9)+1}${idSuffix}-00`,
    type: isAward ? '낙찰' : '입찰',
    category,
    openDate,
    closeDate,
    title: `${region} ${org} ${keyword}`,
    organization: org,
    region,
    basePrice,
    awardPrice: winner?.awardPrice,
    winner: winner?.companyName,
    winnerContact: winner ? { phone: winner.phone!, email: winner.email!, fax: '055-758-0000' } : undefined,
    winRate: winner?.bidRate || undefined,
    participants,
    link: '#',
    projectScope: PROJECT_DESCS[category],
    specDetails: ["국가 표준(KS) 규격 준수", "사전 현장 설명회 참여 필수", "하자 보수 보증 기간 2년 확보", "설계서 및 시방서 의거 정밀 시공"],
    equipmentList: category === '정보통신' ? ["L3 스위치 (주요 제조사)", "Cat.6A 케이블 (LS전선 등)", "NMS 보안 서버", "CCTV 돔 카메라"] : ["몰드 변압기", "고효율 LED 등기구", "디지털 배전반", "비상 발전기 제어반"]
  };
};

// --- GEMINI SERVICE ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const runAiAnalysis = async (bids: BidItem[]) => {
  if (!process.env.API_KEY) return "API 키가 설정되지 않아 분석을 수행할 수 없습니다.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `다음 입찰 데이터의 트렌드를 분석하고 전략을 제안해줘: ${JSON.stringify(bids.slice(0, 5))}`,
    });
    return response.text;
  } catch (e) { return "AI 분석 데이터를 불러올 수 없습니다."; }
};

// --- COMPONENTS ---

const DocumentViewer: React.FC<{ bid: BidItem; onClose: () => void }> = ({ bid, onClose }) => {
  const [activeTab, setActiveTab] = useState<'notice' | 'specs' | 'overview'>('notice');

  const handleDownload = () => {
    const content = `
=========================================
[${bid.category}] ${bid.title} - 상세 명세서
=========================================
공고번호: ${bid.bidNo}
발주기관: ${bid.organization}
금액: ${bid.basePrice.toLocaleString()}원
지역: ${bid.region}
공고일: ${bid.openDate}
마감일: ${bid.closeDate}

[공사 개요]
${bid.projectScope}

[기술 요구 사항]
${bid.specDetails?.map((s, i) => `${i + 1}. ${s}`).join('\n')}

[주요 자재 리스트]
${bid.equipmentList?.join(', ')}

-----------------------------------------
본 문서는 진주정보통신 입찰마스터에서 생성되었습니다.
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bid.bidNo}_${bid.title.replace(/\s/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl h-[94vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl text-white shadow-lg ${bid.category === '전기' ? 'bg-amber-500' : bid.category === '소방' ? 'bg-rose-500' : 'bg-blue-600'}`}>
              <FileText size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-widest">{bid.category}</span>
                 <h3 className="font-black text-slate-900 text-xl">입찰 공고문 및 상세 명세 확인</h3>
              </div>
              <p className="text-xs text-slate-400 font-mono">관리번호: {bid.bidNo} | 발주기관: {bid.organization}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="hidden md:flex items-center gap-2 text-xs font-black text-slate-600 px-5 py-3 hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all">
              <Printer size={16} /> 인쇄하기
            </button>
            <button onClick={handleDownload} className="flex items-center gap-2 text-xs font-black text-white bg-slate-900 px-6 py-3 hover:bg-black rounded-2xl shadow-xl transition-all">
              <Download size={16} /> 문서 다운로드
            </button>
            <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-2xl ml-2 transition-all">
              <X size={32} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white px-6 border-b border-slate-100">
          {[
            { id: 'notice', label: '공고문 원본', icon: <BookOpen size={16} /> },
            { id: 'specs', label: '기술 시방서', icon: <Settings size={16} /> },
            { id: 'overview', label: '공사 개요', icon: <Info size={16} /> }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-8 py-5 text-sm font-black flex items-center gap-2 transition-all relative ${activeTab === tab.id ? 'text-blue-600 bg-blue-50/30' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-100/50 p-6 md:p-12 custom-scrollbar flex justify-center">
          {activeTab === 'notice' && (
            <div className="bg-white w-full max-w-[840px] shadow-xl border border-slate-200 p-16 md:p-24 font-serif relative min-h-full">
              {/* Official Seal Watermark */}
              <div className="absolute top-20 right-20 w-32 h-32 border-8 border-red-500/10 rounded-full flex items-center justify-center -rotate-12 select-none pointer-events-none">
                 <span className="text-red-500/15 font-black text-sm uppercase text-center leading-tight">ORIGINAL<br/>CERTIFIED</span>
              </div>
               
              <div className="flex justify-between items-start mb-20 border-b-2 border-slate-900 pb-10">
                <div className="text-4xl font-black tracking-tighter text-slate-900">{bid.organization}</div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Notice ID</div>
                  <div className="text-xl font-bold text-slate-900">{bid.bidNo}</div>
                </div>
              </div>

              <div className="text-center mb-20">
                <h1 className="text-5xl font-bold underline underline-offset-[16px] decoration-slate-200">입 찰 공 고 (안)</h1>
              </div>

              <div className="space-y-12 text-slate-800 leading-relaxed text-lg">
                <section>
                  <h4 className="font-black text-2xl mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-slate-900 rounded-full"></div>
                    1. 입찰에 부치는 사항
                  </h4>
                  <div className="space-y-5 pl-8 border-l-4 border-slate-100">
                    <div className="grid grid-cols-[160px_1fr] gap-6">
                      <span className="font-bold text-slate-400">가. 사 업 명 :</span><span className="font-black text-xl">{bid.title}</span>
                      <span className="font-bold text-slate-400">나. 수요기관 :</span><span>{bid.organization}</span>
                      <span className="font-bold text-slate-400">다. 예산금액 :</span><span className="text-blue-700 font-black">금 {bid.basePrice.toLocaleString()}원 (VAT 포함)</span>
                      <span className="font-bold text-slate-400">라. 공사기간 :</span><span>착공 후 120일 이내</span>
                      <span className="font-bold text-slate-400">마. 공사지역 :</span><span>{bid.region} 일원</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="font-black text-2xl mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-slate-900 rounded-full"></div>
                    2. 입찰 참가 자격
                  </h4>
                  <div className="space-y-6 pl-8">
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center shrink-0 mt-1"><UserCheck size={14} /></div>
                      <p>국가종합전자조달시스템 입찰참가자격등록규정에 의하여 반드시 <span className="font-bold underline">나라장터(G2B)에 등록한 업체</span>여야 합니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center shrink-0 mt-1"><ShieldAlert size={14} /></div>
                      <p><span className="font-black underline">「{bid.category}공사업법」</span>에 따른 해당 면허를 등록한 업체로서, 공고일 전일 기준 주된 영업소가 <span className="font-black text-blue-600">{bid.region}</span> 내에 위치해야 합니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center shrink-0 mt-1"><Scale size={14} /></div>
                      <p>공동계약(공동이행방식)은 허용하지 않으며, 단독 입찰만이 가능합니다.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="font-black text-2xl mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-slate-900 rounded-full"></div>
                    3. 입찰 및 개찰 일시
                  </h4>
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">입찰서 접수 개시</p>
                        <p className="text-xl font-black text-slate-900">{bid.openDate} 10:00</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">입찰서 접수 마감</p>
                        <p className="text-xl font-black text-red-600">{bid.closeDate} 10:00</p>
                      </div>
                      <div className="md:col-span-2 pt-4 border-t border-slate-200">
                        <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">개찰 일시 및 장소</p>
                        <p className="text-xl font-black text-blue-600">{bid.closeDate} 11:00 (국가종합전자조달시스템 입찰 집행관 PC)</p>
                      </div>
                    </div>
                  </div>
                </section>

                {bid.type === '낙찰' && (
                  <div className="bg-emerald-50 border-2 border-emerald-200 p-12 rounded-[2.5rem] mt-20 shadow-xl shadow-emerald-100/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5"><ShieldCheck size={200} /></div>
                    <h4 className="text-emerald-900 font-black text-3xl mb-10 flex items-center gap-4">
                       <ShieldCheck size={40} className="text-emerald-600" /> 최종 낙찰 결정 통보
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-8 bg-white rounded-3xl border border-emerald-100 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">최종 낙찰 업체</p>
                        <p className="text-3xl text-emerald-800 font-black tracking-tight">{bid.winner}</p>
                      </div>
                      <div className="p-8 bg-white rounded-3xl border border-emerald-100 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">투찰율 / 낙찰율</p>
                        <p className="text-3xl text-emerald-800 font-black tracking-tight">{bid.winRate?.toFixed(4)}%</p>
                      </div>
                      <div className="md:col-span-2 p-8 bg-emerald-600 text-white rounded-3xl shadow-lg">
                        <p className="text-xs font-bold opacity-60 mb-2 uppercase tracking-widest">최종 낙찰 금액 (부가가치세 포함)</p>
                        <p className="text-4xl font-black tracking-tighter">금 {bid.awardPrice?.toLocaleString()}원</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-40 text-center border-t-2 border-slate-100 pt-20">
                <p className="text-3xl font-black mb-16 tracking-[0.2em]">{bid.openDate.replace(/-/g, '. ')}</p>
                <div className="relative inline-block">
                   <p className="text-5xl font-black tracking-[0.8em] pl-[0.8em]">{bid.organization} 장</p>
                   <div className="absolute -top-10 -right-24 w-32 h-32 border-4 border-red-600/30 rounded-full flex items-center justify-center">
                     <span className="text-red-600/30 font-black text-xl">직인</span>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="bg-white w-full max-w-[840px] shadow-xl border border-slate-200 p-16 min-h-full rounded-[2.5rem]">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-10 mb-16">
                <div className="flex items-center gap-5">
                  <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-xl"><Settings size={32} /></div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{bid.category}공사 기술 시방서</h2>
                </div>
                <span className="text-[10px] font-black text-slate-400 border border-slate-200 px-4 py-2 rounded-full uppercase tracking-[0.2em]">TS-VER 3.0</span>
              </div>
              
              <div className="space-y-20">
                <section>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="bg-slate-900 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">01</div>
                    <h4 className="text-3xl font-black text-slate-800 tracking-tight">시공 및 기술 요구 사항</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {bid.specDetails?.map((spec, i) => (
                      <div key={i} className="flex gap-6 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-blue-200 hover:bg-white transition-all group">
                        <div className="shrink-0 mt-1"><CheckSquare size={28} className="text-blue-500 group-hover:scale-110 transition-transform" /></div>
                        <div>
                          <p className="text-[11px] font-black text-blue-600 mb-2 uppercase tracking-widest">Requirement Code S-0{i+1}</p>
                          <p className="text-xl font-bold text-slate-700 leading-relaxed">{spec}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="bg-slate-900 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">02</div>
                    <h4 className="text-3xl font-black text-slate-800 tracking-tight">주요 승인 자재 리스트</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {bid.equipmentList?.map((eq, i) => (
                      <div key={i} className="group p-8 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-blue-600 hover:shadow-2xl transition-all flex items-center justify-between">
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 font-black group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">{i+1}</div>
                           <div>
                             <p className="font-black text-slate-800 text-xl tracking-tight">{eq}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">KS Standard Approved</p>
                           </div>
                        </div>
                        <Cpu size={28} className="text-slate-100 group-hover:text-blue-200 transition-colors" />
                      </div>
                    ))}
                  </div>
                </section>

                <div className="p-10 bg-amber-50 border-2 border-amber-100 rounded-[2.5rem] flex gap-8 shadow-inner">
                  <AlertCircle className="text-amber-500 shrink-0" size={40} />
                  <div>
                    <h5 className="font-black text-amber-900 text-xl mb-3">유의사항 및 벌칙 규정</h5>
                    <p className="text-slate-700 leading-relaxed font-medium text-lg">
                      모든 공사는 발주처가 지정한 감독관의 현장 검측 후 다음 공정을 진행해야 하며, 임의 시공 시 해당 구간의 재시공을 명할 수 있습니다. 
                      준공 기한 내 미완료 시 지체상금(1,000분의 0.5)을 부과하며 준공 후 무상 하자 보수는 <span className="underline font-bold">2년간</span> 지속되어야 합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="bg-white w-full max-w-[840px] shadow-xl border border-slate-200 p-16 min-h-full rounded-[2.5rem]">
              <div className="flex items-center gap-5 mb-20">
                 <div className="bg-slate-100 p-4 rounded-3xl text-slate-900"><Info size={32} /></div>
                 <h2 className="text-4xl font-black text-slate-900 tracking-tighter">사업 추진 세부 개요</h2>
              </div>
              
              <div className="space-y-20">
                <div className="p-12 bg-gradient-to-br from-slate-900 to-blue-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700"><Cpu size={260} /></div>
                  <div className="relative z-10">
                    <div className="bg-blue-500/20 w-fit px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.3em] mb-8 border border-blue-500/30">Business Executive Summary</div>
                    <p className="text-3xl font-bold leading-[1.6] italic tracking-tight">"{bid.projectScope}"</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <OverviewCard label="사업 대상 지역" value={bid.region} icon={<div className="w-3 h-3 bg-blue-500 rounded-full" />} />
                  <OverviewCard label="예상 공사 기간" value="착공 후 120일" icon={<div className="w-3 h-3 bg-emerald-500 rounded-full" />} />
                  <OverviewCard label="입찰 방식" value="제한 경쟁 입찰" icon={<div className="w-3 h-3 bg-amber-500 rounded-full" />} />
                </div>

                <div className="space-y-10 pt-10 border-t border-slate-100">
                   <h4 className="text-3xl font-black text-slate-800 flex items-center gap-4">
                     <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                     기대 효과 및 추진 성과
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {[
                       { t: "안정성 확보", d: "노후 설비 전면 교체를 통한 통신 인프라 무중단 운영 실현" },
                       { t: "품질 고도화", d: "최신 KS 규격 자재 도입으로 설비 유지보수 효율 30% 향상" },
                       { t: "재난 관리", d: "실시간 장애 감지 시스템 연동으로 선제적 재난 대응 체계 구축" },
                       { t: "시민 편의", d: "공공 서비스 인프라 안정화에 따른 사용자 만족도 제고" }
                     ].map((item, i) => (
                       <div key={i} className="p-8 bg-white border border-slate-100 rounded-[2rem] hover:shadow-2xl transition-all border-l-8 border-l-blue-100">
                         <p className="font-black text-blue-600 text-xl mb-3">{item.t}</p>
                         <p className="text-base font-bold text-slate-500 leading-relaxed">{item.d}</p>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OverviewCard: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm hover:translate-y-[-8px] transition-transform">
    <div className="flex items-center gap-3 mb-5">
      {icon}
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
    </div>
    <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
  </div>
);

const CalendarView: React.FC<{ data: BidItem[]; onSelectBid: (bid: BidItem) => void }> = ({ data, onSelectBid }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = [];
  const startDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  const getEvents = (day: number) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return data.filter(b => b.openDate === dStr || b.closeDate === dStr).map(b => ({
      ...b,
      isClosing: b.closeDate === dStr
    }));
  };

  return (
    <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden mb-12">
      <div className="p-10 border-b flex justify-between items-center bg-white">
        <div>
          <h3 className="text-2xl font-black tracking-tight">{year}년 {month + 1}월 입찰/낙찰 캘린더</h3>
          <p className="text-xs text-slate-400 font-bold mt-1">공고 시작일 및 마감일 통합 일정표</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-3 border rounded-2xl hover:bg-slate-50 transition-all"><ChevronLeft size={24} /></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-6 border rounded-2xl font-black text-xs hover:bg-slate-50 transition-all">오늘</button>
          <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-3 border rounded-2xl hover:bg-slate-50 transition-all"><ChevronRight size={24} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 bg-slate-50/50 border-b">
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <div key={d} className={`p-5 text-center text-xs font-black uppercase tracking-[0.3em] ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-400'}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 auto-rows-[160px]">
        {days.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} className="bg-slate-50/20 border-r border-b"></div>;
          const events = getEvents(day);
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

          return (
            <div key={day} className={`p-3 border-r border-b hover:bg-slate-50/80 transition-all overflow-hidden relative group ${isToday ? 'bg-blue-50/30' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                 <span className={`text-sm font-black w-8 h-8 flex items-center justify-center rounded-xl ${isToday ? 'bg-blue-600 text-white shadow-lg' : idx % 7 === 0 ? 'text-red-500' : idx % 7 === 6 ? 'text-blue-500' : 'text-slate-900'}`}>{day}</span>
              </div>
              <div className="space-y-1.5 h-[100px] overflow-y-auto scrollbar-hide">
                {events.map(ev => (
                  <div 
                    key={`${ev.id}-${ev.isClosing}`} 
                    onClick={() => onSelectBid(ev)} 
                    className={`text-[9px] p-2 rounded-xl border truncate cursor-pointer font-black transition-all hover:translate-x-1 shadow-sm ${ev.isClosing ? 'bg-rose-50 text-rose-700 border-rose-200' : (ev.type === '낙찰' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200')}`}
                  >
                    <span className="opacity-60 mr-1">{ev.isClosing ? '마감' : '시작'}</span>
                    {ev.title.split(' ').pop()}
                  </div>
                ))}
              </div>
              {/* Event Tooltip on Hover */}
              {events.length > 3 && (
                 <div className="absolute bottom-1 right-1 bg-slate-900 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">+{events.length - 3}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App: React.FC = () => {
  const [data, setData] = useState<BidItem[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'calendar' | 'analytics'>('list');
  const [selectedBid, setSelectedBid] = useState<BidItem | null>(null);
  const [showDoc, setShowDoc] = useState<BidItem | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState('데이터 수집 중...');

  useEffect(() => {
    const mock = Array.from({ length: 120 }).map((_, i) => createSingleBid(i));
    setData(mock);
    if (process.env.API_KEY) {
      runAiAnalysis(mock).then(setAiAnalysis);
    } else {
      setAiAnalysis("공고 분석을 위해 API 키가 필요합니다.");
    }
  }, []);

  const getMetric = (type: string) => {
    if (type === 'new') return data.filter(b => b.openDate.includes('2025-03')).length + '건';
    if (type === 'rate') return '94.2%';
    if (type === 'total') return '28.4억';
    return '중간';
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="bg-slate-900 text-white pt-12 pb-24 px-8 rounded-b-[4rem] shadow-2xl mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
          <div className="flex items-center gap-8">
            <div className="bg-blue-600 w-20 h-20 rounded-[2rem] flex items-center justify-center font-black text-4xl shadow-2xl shadow-blue-500/20">진</div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter mb-2">진주정보통신 입찰·낙찰 마스터</h1>
              <p className="text-slate-400 text-lg font-bold tracking-tight">통신·전기·소방 공사 실시간 비즈니스 인텔리전스</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full md:w-auto">
            <MetricCard label="3월 신규 공고" value={getMetric('new')} />
            <MetricCard label="낙찰 진행률" value={getMetric('rate')} />
            <MetricCard label="당월 수주 합계" value={getMetric('total')} isSuccess />
            <MetricCard label="입찰 경쟁 강도" value="높음" isWarning />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 -mt-16 relative z-20">
        {/* AI Insight Bar */}
        <div className="bg-blue-600 p-1 rounded-[2.5rem] shadow-2xl shadow-blue-500/20 mb-12">
          <div className="bg-white rounded-[2.3rem] p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-lg shrink-0"><BarChart3 size={24} /></div>
            <div className="flex-1">
              <h4 className="font-black text-slate-900 text-xl mb-1 flex items-center gap-2">
                AI 전략 브리핑 
                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase">Realtime Analysis</span>
              </h4>
              <p className="text-base text-slate-600 font-medium leading-relaxed italic">"{aiAnalysis}"</p>
            </div>
            <button onClick={() => runAiAnalysis(data).then(setAiAnalysis)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-black transition-all shrink-0">새로고침</button>
          </div>
        </div>

        <div className="flex border-b mb-12 overflow-x-auto whitespace-nowrap scrollbar-hide gap-4">
          {[
            { id: 'list', label: '실시간 데이터 리스트', icon: <FileText size={20} /> },
            { id: 'calendar', label: '공고 일정 캘린더', icon: <CalendarDays size={20} /> },
            { id: 'analytics', label: '통계 및 시각화 리포트', icon: <BarChart3 size={20} /> }
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`px-12 py-6 font-black text-lg transition-all border-b-4 flex items-center gap-3 ${activeTab === t.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'list' && (
          <div className="bg-white rounded-[3rem] border shadow-sm overflow-hidden mb-12">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b">
                  <tr>
                    <th className="px-10 py-7">분야 / 상태</th>
                    <th className="px-10 py-7">공고 번호 및 세부 사업명</th>
                    <th className="px-10 py-7 text-right">기초 금액(만원)</th>
                    <th className="px-10 py-7">낙찰사 / 투찰율</th>
                    <th className="px-10 py-7"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.slice(0, 20).map(b => (
                    <tr key={b.id} className="hover:bg-blue-50/30 cursor-pointer group transition-colors" onClick={() => setSelectedBid(b)}>
                      <td className="px-10 py-8">
                        <div className={`px-3 py-1 rounded-lg text-[10px] font-black mb-2 w-fit ${b.category === '전기' ? 'bg-amber-100 text-amber-700' : b.category === '소방' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>{b.category}</div>
                        <div className={`text-[10px] font-black uppercase tracking-widest ${b.type === '낙찰' ? 'text-emerald-500' : 'text-blue-500'}`}>{b.type}</div>
                      </td>
                      <td className="px-10 py-8">
                        <p className="text-[10px] font-bold text-slate-400 mb-1">{b.bidNo}</p>
                        <p className="font-black text-slate-800 text-lg group-hover:text-blue-600 transition-colors tracking-tight">{b.title}</p>
                        <p className="text-xs text-slate-400 mt-1 font-bold">{b.organization} | <span className="text-blue-500">{b.openDate}</span></p>
                      </td>
                      <td className="px-10 py-8 text-right font-black text-xl text-slate-900">{(b.basePrice/10000).toLocaleString()}</td>
                      <td className="px-10 py-8">
                        {b.type === '낙찰' ? (
                          <>
                            <p className="text-base font-black text-slate-700 tracking-tight">{b.winner}</p>
                            <p className="text-[10px] text-emerald-600 font-black mt-1">투찰율: {b.winRate?.toFixed(3)}%</p>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-300 text-xs font-black italic">
                             <Clock size={14} className="animate-pulse" /> 진행 중 (D-{(new Date(b.closeDate).getTime() - new Date().getTime()) / (1000*60*60*24) > 0 ? Math.ceil((new Date(b.closeDate).getTime() - new Date().getTime()) / (1000*60*60*24)) : 0})
                          </div>
                        )}
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button onClick={(e) => { e.stopPropagation(); setShowDoc(b); }} className="p-4 text-slate-300 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-2xl border-2 border-transparent hover:border-blue-100 transition-all shadow-sm"><FileSearch size={24} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && <CalendarView data={data} onSelectBid={(b) => { setSelectedBid(b); setShowDoc(b); }} />}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-12 rounded-[3rem] border shadow-sm">
              <h4 className="text-2xl font-black mb-10 flex items-center gap-3"><div className="w-2 h-6 bg-blue-600 rounded-full" /> 지역별 입찰 공고 분포 (Top 10)</h4>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={REGIONS.slice(1, 11).map(r => ({ name: r, value: data.filter(b => b.region === r).length }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    {/* Fixed XAxis fontBold error by using fontWeight="bold" */}
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} fontWeight="bold" />
                    {/* Fixed YAxis fontBold error by using fontWeight="bold" */}
                    <YAxis fontSize={12} tickLine={false} axisLine={false} fontWeight="bold" />
                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-12 rounded-[3rem] border shadow-sm">
               <h4 className="text-2xl font-black mb-10 flex items-center gap-3"><div className="w-2 h-6 bg-emerald-600 rounded-full" /> 사업 분야별 데이터 비율</h4>
               <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={['정보통신', '전기', '소방'].map(c => ({ name: c, value: data.filter(b => b.category === c).length }))} 
                      dataKey="value" 
                      nameKey="name" 
                      innerRadius={80} 
                      outerRadius={140} 
                      paddingAngle={8}
                      stroke="none"
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Legend verticalAlign="bottom" align="center" iconType="circle" />
                    <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
               </div>
            </div>
          </div>
        )}
      </main>

      {showDoc && <DocumentViewer bid={showDoc} onClose={() => setShowDoc(null)} />}

      {selectedBid && !showDoc && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-8 flex items-center justify-between z-50 animate-in slide-in-from-bottom-20 duration-500">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ${selectedBid.category === '전기' ? 'bg-amber-500' : selectedBid.category === '소방' ? 'bg-rose-500' : 'bg-blue-600'}`}>
               <FileText size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-black bg-white/10 text-white/60 px-2 py-0.5 rounded uppercase tracking-widest">{selectedBid.category}</span>
                <h4 className="font-black text-white text-2xl truncate max-w-xl">{selectedBid.title}</h4>
              </div>
              <p className="text-sm text-slate-400 font-bold">{selectedBid.organization} | <span className="text-blue-400">{selectedBid.bidNo}</span></p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setShowDoc(selectedBid)} className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-base hover:bg-slate-100 transition-all flex items-center gap-3 shadow-xl">
              <BookOpen size={20} /> 공고/시방서 확인
            </button>
            <button onClick={() => setSelectedBid(null)} className="p-4 text-white/30 hover:text-white transition-colors"><X size={32} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string; isSuccess?: boolean; isWarning?: boolean }> = ({ label, value, isSuccess, isWarning }) => (
  <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-lg group hover:bg-white/10 transition-all">
    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">{label}</p>
    <p className={`text-3xl font-black tracking-tighter ${isSuccess ? 'text-emerald-400' : isWarning ? 'text-amber-400' : 'text-white'}`}>{value}</p>
  </div>
);

// --- MOUNT ---
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
