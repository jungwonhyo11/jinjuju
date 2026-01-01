
import React, { useState } from 'react';
import { BidItem, Participant } from '../types';
import { 
  X, Download, Printer, FileText, Info, Settings, ShieldCheck, 
  Cpu, Calendar, User, MapPin, Scale, Landmark, Users, 
  TrendingUp, Phone, Mail, Hash, CheckCircle2, AlertCircle
} from 'lucide-react';

interface Props {
  bid: BidItem;
  onClose: () => void;
}

const DocumentViewer: React.FC<Props> = ({ bid, onClose }) => {
  const [activeTab, setActiveTab] = useState<'notice' | 'specs' | 'results'>('notice');

  const getSpecTitle = () => {
    switch (bid.category) {
      case '전기': return "전기설비 공사 표준 시방서";
      case '소방': return "소방시설 설치 및 정비 시방서";
      default: return "정보통신공사 세부 기술 시방서";
    }
  };

  const estimatedPrice = Math.round(bid.basePrice * 0.9);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-6xl h-[95vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Top Action Bar */}
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${bid.category === '전기' ? 'bg-amber-500' : bid.category === '소방' ? 'bg-rose-500' : 'bg-blue-600'}`}>
              <Landmark size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-widest">{bid.category}</span>
                <h3 className="font-black text-slate-900 text-xl tracking-tight">G2B 전자조달 시스템 문서 뷰어</h3>
              </div>
              <p className="text-xs text-slate-400 font-mono">공고번호: {bid.bidNo} | 발주기관: {bid.organization}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden sm:flex items-center gap-2 text-xs font-black text-slate-600 px-5 py-2.5 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all">
              <Printer size={14} /> 인쇄하기
            </button>
            <button className="flex items-center gap-2 text-xs font-black text-white bg-slate-900 px-6 py-2.5 hover:bg-black rounded-xl shadow-xl transition-all">
              <Download size={14} /> 공식 문서 PDF 다운로드
            </button>
            <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-xl ml-4 transition-all">
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-50/50 px-8 border-b border-slate-100">
          {[
            { id: 'notice', label: '공고문 원본', icon: <FileText size={16} /> },
            { id: 'specs', label: '과업내용서/시방서', icon: <Settings size={16} /> },
            { id: 'results', label: bid.type === '낙찰' ? '개찰 결과/참여사' : '입찰 조건/일정', icon: bid.type === '낙찰' ? <Users size={16} /> : <Calendar size={16} /> }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-8 py-5 text-sm font-black flex items-center gap-2 transition-all relative ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-10 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {activeTab === 'notice' && (
              <div className="bg-white shadow-xl border border-slate-200 p-12 md:p-20 font-serif rounded-sm relative min-h-full overflow-hidden">
                {/* Official Stamp Watermark - Increased Opacity for better visibility */}
                <div className="absolute top-20 right-20 opacity-20 pointer-events-none select-none rotate-12 text-slate-300">
                  <Landmark size={240} />
                </div>

                <div className="text-center mb-16 space-y-2">
                  <h1 className="text-4xl font-black underline underline-offset-[12px] decoration-slate-300 tracking-[0.5em] text-slate-900">시설공사 입찰공고</h1>
                  <p className="font-sans text-xs font-bold text-slate-400 uppercase tracking-widest pt-4">National Electronic Procurement Notice</p>
                </div>

                <div className="space-y-12 font-sans text-slate-800">
                  <section>
                    <h4 className="font-black text-xl mb-6 border-b-2 border-slate-900 pb-2">1. 입찰에 부치는 사항</h4>
                    <div className="grid grid-cols-[140px_1fr] gap-y-4 gap-x-6">
                      <dt className="text-slate-400 font-bold">가. 공 고 명</dt>
                      <dd className="font-black text-lg text-slate-900">{bid.title}</dd>
                      
                      <dt className="text-slate-400 font-bold">나. 공고번호</dt>
                      <dd className="font-mono font-bold text-blue-600">{bid.bidNo}</dd>

                      <dt className="text-slate-400 font-bold">다. 공사현장</dt>
                      <dd className="font-bold">{bid.region} 내 지정 장소</dd>

                      <dt className="text-slate-400 font-bold">라. 공사기한</dt>
                      <dd className="font-bold underline">착공일로부터 120일 이내 (동절기 제외)</dd>

                      <dt className="text-slate-400 font-bold">마. 추정가격</dt>
                      <dd className="font-mono font-black text-slate-900">￦{estimatedPrice.toLocaleString()} (부가세 별도)</dd>

                      <dt className="text-slate-400 font-bold">바. 기초금액</dt>
                      <dd className="font-mono font-black text-blue-700">￦{bid.basePrice.toLocaleString()} (부가세 포함)</dd>
                    </div>
                  </section>

                  <section>
                    <h4 className="font-black text-xl mb-6 border-b-2 border-slate-900 pb-2">2. 입찰 및 계약방식</h4>
                    <div className="space-y-3 font-medium">
                      <p>가. 본 입찰은 <span className="font-black">전자입찰, 총액입찰, 일반경쟁</span> 방식입니다.</p>
                      <p>나. <span className="font-black">지역제한({bid.region})</span> 대상 공사입니다.</p>
                      <p>다. 적격심사 대상이며, 낙찰자 결정은 <span className="font-black">적격심사기준</span>에 따릅니다.</p>
                      <p>라. 청렴계약제가 적용되는 공사입니다.</p>
                    </div>
                  </section>

                  <section>
                    <h4 className="font-black text-xl mb-6 border-b-2 border-slate-900 pb-2">3. 입찰 참가 자격</h4>
                    <div className="space-y-4 pl-4 border-l-4 border-slate-100">
                      <div className="flex gap-4">
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-1" />
                        <p>「지방자치단체를 당사자로 하는 계약에 관한 법률 시행령」 제13조의 요건을 갖춘 자</p>
                      </div>
                      <div className="flex gap-4">
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-1" />
                        <p className="font-bold">공고일 전일부터 입찰일까지 본점 소재지가 <span className="bg-yellow-100 px-1 underline">{bid.region}</span> 내에 있는 업체</p>
                      </div>
                      <div className="flex gap-4">
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-1" />
                        <p className="font-black text-blue-700">「{bid.category}공사업」 면허를 등록한 업체</p>
                      </div>
                    </div>
                  </section>

                  <div className="pt-20 text-center space-y-12 relative">
                    {/* Background Central Watermark - Visible but not obstructive */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none select-none overflow-hidden">
                      <span className="text-9xl font-black text-slate-200 rotate-12">{bid.organization.slice(0, 2)}</span>
                    </div>

                    <p className="text-2xl font-black relative z-10">{new Date(bid.openDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <div className="relative inline-block z-10">
                      <h2 className="text-4xl font-black tracking-[1em] text-slate-900 pl-[1em]">{bid.organization} 장</h2>
                      {/* Red Seal - Increased Opacity for clarity */}
                      <div className="absolute top-1/2 -right-12 -translate-y-1/2 w-24 h-24 border-4 border-red-600/60 rounded-full flex items-center justify-center font-black text-red-600/70 text-xl border-double -rotate-12 bg-white/10 backdrop-blur-[2px]">
                        계약인
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-6">
                <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Settings size={28}/></div>
                    <h3 className="text-2xl font-black text-slate-900">{getSpecTitle()}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="font-black text-slate-400 text-xs uppercase tracking-widest border-b border-slate-100 pb-2">과업 범위 및 기술 요건</h4>
                      <ul className="space-y-4">
                        {bid.specDetails?.map((spec, i) => (
                          <li key={i} className="flex gap-3 text-slate-700 font-medium">
                            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center shrink-0 font-black">{i+1}</span>
                            {spec}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-6">
                      <h4 className="font-black text-slate-400 text-xs uppercase tracking-widest border-b border-slate-100 pb-2">필수 투입 자재 (KS 표준)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {bid.equipmentList?.map((eq, i) => (
                          <div key={i} className="p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 border border-slate-100 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                            {eq}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-25"><Cpu size={120}/></div>
                  <h4 className="text-blue-400 font-black text-xs uppercase tracking-widest mb-4">Project Overview</h4>
                  <p className="text-xl font-bold leading-relaxed relative z-10">{bid.projectScope}</p>
                </div>
              </div>
            )}

            {activeTab === 'results' && (
              <div className="space-y-8">
                {bid.type === '낙찰' ? (
                  <>
                    {/* Winner Detail Card */}
                    <div className="bg-emerald-600 p-8 md:p-12 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 opacity-30"><ShieldCheck size={140} /></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest">Final Winner</span>
                          <h3 className="text-4xl font-black tracking-tight">{bid.winner}</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/20">
                          <div>
                            <p className="text-emerald-200 text-xs font-black uppercase mb-2">낙찰 금액</p>
                            <p className="text-2xl font-black font-mono">₩{bid.awardPrice?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-emerald-200 text-xs font-black uppercase mb-2">낙찰률 (투찰률)</p>
                            <p className="text-2xl font-black font-mono">{bid.winRate?.toFixed(4)}%</p>
                          </div>
                          <div>
                            <p className="text-emerald-200 text-xs font-black uppercase mb-2">업체 연락처</p>
                            <div className="space-y-1">
                              <p className="text-sm font-bold flex items-center gap-2"><Phone size={14}/> {bid.winnerContact?.phone}</p>
                              <p className="text-sm font-bold flex items-center gap-2"><Mail size={14}/> {bid.winnerContact?.email}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Participant List Table */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                        <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                          <TrendingUp size={20} className="text-blue-600" /> 개찰 현황 및 투찰 업체 리스트
                        </h4>
                        <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">Total {bid.participants.length} Participants</span>
                      </div>
                      <table className="w-full">
                        <thead className="bg-slate-50/50">
                          <tr>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">순위</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">업체명</th>
                            <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">투찰금액</th>
                            <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">투찰률</th>
                            <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">결과</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {bid.participants.sort((a, b) => (a.bidRate || 0) - (b.bidRate || 0)).map((p, idx) => (
                            <tr key={idx} className={`${p.isWinner ? 'bg-emerald-50/50' : ''} hover:bg-slate-50 transition-colors`}>
                              <td className="px-8 py-5 font-black text-slate-400 text-sm">#{idx + 1}</td>
                              <td className="px-8 py-5 font-bold text-slate-900">{p.companyName}</td>
                              <td className="px-8 py-5 text-right font-mono font-bold text-slate-700">￦{p.awardPrice?.toLocaleString()}</td>
                              <td className="px-8 py-5 text-right font-mono font-black text-blue-600">{p.bidRate?.toFixed(4)}%</td>
                              <td className="px-8 py-5">
                                <div className="flex justify-center">
                                  {p.isWinner ? (
                                    <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg shadow-lg shadow-emerald-500/20">낙찰</span>
                                  ) : (
                                    <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-black rounded-lg">탈락</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                      <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Calendar size={20} className="text-blue-600" /> 세부 진행 일정
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                          <span className="font-bold text-slate-500 text-sm">입찰서 제출 시작</span>
                          <span className="font-black text-slate-900">{bid.openDate} 09:00</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                          <span className="font-bold text-rose-500 text-sm">입찰서 제출 마감</span>
                          <span className="font-black text-rose-600">{bid.closeDate} 10:00</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                          <span className="font-bold text-blue-500 text-sm">개찰 일시</span>
                          <span className="font-black text-blue-600">{bid.closeDate} 11:00</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                      <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <AlertCircle size={20} className="text-amber-500" /> 투찰 시 유의사항
                      </h4>
                      <ul className="space-y-4 text-sm font-medium text-slate-600">
                        <li className="flex gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></div>
                          입찰금액이 예산금액을 초과할 경우 무효 처리됩니다.
                        </li>
                        <li className="flex gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></div>
                          지정된 자격증(면허) 사본을 반드시 시스템에 첨부해야 합니다.
                        </li>
                        <li className="flex gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></div>
                          지역제한 위반 시 낙찰 대상에서 제외되며 부정당업자 제재를 받을 수 있습니다.
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
