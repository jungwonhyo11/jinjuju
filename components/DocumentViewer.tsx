
import React, { useState } from 'react';
import { BidItem } from '../types';
import { X, Download, Printer, FileText, Info, BookOpen, Settings, AlertCircle, ShieldCheck, Cpu, CheckSquare } from 'lucide-react';

interface Props {
  bid: BidItem;
  onClose: () => void;
}

const DocumentViewer: React.FC<Props> = ({ bid, onClose }) => {
  const [activeTab, setActiveTab] = useState<'notice' | 'specs' | 'overview'>('notice');

  const getSpecTitle = () => {
    switch (bid.category) {
      case '전기': return "전기설비 공사 표준 시방서";
      case '소방': return "소방시설 설치 및 정비 시방서";
      default: return "정보통신공사 세부 기술 시방서";
    }
  };

  const handleDownload = () => {
    const content = `
[${bid.category}] ${bid.title}
공고번호: ${bid.bidNo}
수요기관: ${bid.organization}
금액: ${bid.basePrice.toLocaleString()}원
상태: ${bid.type}

[공사개요]
${bid.projectScope}

[기술 시방]
${bid.specDetails?.map((s, i) => `${i + 1}. ${s}`).join('\n')}

[주요 자재]
${bid.equipmentList?.join(', ')}

본 문서는 진주정보통신 입찰마스터에서 생성된 공식 리포트입니다.
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${bid.bidNo}_상세정보.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('문서가 생성되어 다운로드되었습니다.');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl h-[94vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl text-white shadow-lg ${bid.category === '전기' ? 'bg-amber-500' : bid.category === '소방' ? 'bg-rose-500' : 'bg-blue-600'}`}>
              <FileText size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-widest">{bid.category}</span>
                 <h3 className="font-black text-slate-900 text-lg">전자공고 상세 명세</h3>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{bid.bidNo} | 발주기관: {bid.organization}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="hidden md:flex items-center gap-2 text-xs font-black text-slate-600 px-5 py-2.5 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all">
              <Printer size={14} /> 인쇄
            </button>
            <button onClick={handleDownload} className="flex items-center gap-2 text-xs font-black text-white bg-blue-600 px-6 py-2.5 hover:bg-blue-700 rounded-xl shadow-xl transition-all">
              <Download size={14} /> 문서 다운로드
            </button>
            <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-xl ml-2 transition-all">
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white px-6 border-b border-slate-100">
          {[
            { id: 'notice', label: '공고문(Original)', icon: <FileText size={16} /> },
            { id: 'specs', label: '시방서/자재', icon: <Settings size={16} /> },
            { id: 'overview', label: '사업개요/범위', icon: <Info size={16} /> }
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
        <div className="flex-1 overflow-y-auto bg-slate-100/50 p-6 md:p-12 custom-scrollbar flex justify-center">
          {activeTab === 'notice' && (
            <div className="bg-white w-full max-w-[840px] shadow-xl border border-slate-200 p-12 md:p-20 font-serif relative min-h-full">
               <div className="absolute top-10 right-10 w-28 h-28 border-8 border-slate-200 rounded-full flex items-center justify-center -rotate-12 select-none pointer-events-none">
                 <span className="text-slate-200 font-black text-xs uppercase text-center leading-tight">OFFICIAL<br/>NOTICE</span>
               </div>
               
               <div className="flex justify-between items-start mb-20 border-b-2 border-slate-900 pb-8">
                <div className="text-4xl font-black tracking-tighter text-slate-900">{bid.organization}</div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Notice Number</div>
                  <div className="text-lg font-bold text-slate-900">{bid.bidNo}</div>
                </div>
              </div>

              <div className="text-center mb-20">
                <h1 className="text-5xl font-bold underline underline-offset-[16px] decoration-slate-200">입 찰 공 고 (안)</h1>
              </div>

              <div className="space-y-12 text-slate-800 leading-relaxed text-lg">
                <div>
                  <h4 className="font-black text-xl mb-6 flex items-center gap-2">1. 입찰에 부치는 사항</h4>
                  <div className="space-y-4 pl-6 border-l-4 border-slate-200">
                    <div className="grid grid-cols-[140px_1fr] gap-4">
                      <span className="font-bold text-slate-400">가. 사 업 명 :</span><span className="font-black">{bid.title}</span>
                      <span className="font-bold text-slate-400">나. 수요기관 :</span><span>{bid.organization}</span>
                      <span className="font-bold text-slate-400">다. 예산금액 :</span><span className="text-blue-700 font-black">금 {bid.basePrice.toLocaleString()}원 (VAT 포함)</span>
                      <span className="font-bold text-slate-400">라. 공사지역 :</span><span>{bid.region} 전역</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-xl mb-6 flex items-center gap-2">2. 입찰 참가 자격</h4>
                  <ul className="list-decimal pl-10 space-y-4 font-medium text-slate-700">
                    <li>국가종합전자조달시스템 입찰참가자격등록규정에 의하여 반드시 G2B에 등록한 업체여야 합니다.</li>
                    <li><span className="font-bold underline">「${bid.category}공사업법」</span>에 따른 해당 면허를 등록한 업체로서 공고일 전일 기준 본사 소재지가 <span className="font-bold text-blue-600">${bid.region}</span>인 업체여야 합니다.</li>
                    <li>본 사업은 중소기업 제품 구매촉진 및 판로지원에 관한 법률에 따른 제한경쟁 입찰입니다.</li>
                  </ul>
                </div>

                {bid.type === '낙찰' && (
                  <div className="bg-emerald-50 border-2 border-emerald-200 p-10 rounded-3xl mt-16 shadow-lg shadow-emerald-100/50">
                    <h4 className="text-emerald-900 font-black text-2xl mb-8 flex items-center gap-3">
                       <ShieldCheck size={32} className="text-emerald-600" /> 최종 개찰 및 낙찰 결과
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold">
                      <div className="p-6 bg-white rounded-2xl border border-emerald-100">
                        <p className="text-xs text-slate-400 mb-1">낙찰 대상자</p>
                        <p className="text-2xl text-emerald-700">{bid.winner}</p>
                      </div>
                      <div className="p-6 bg-white rounded-2xl border border-emerald-100">
                        <p className="text-xs text-slate-400 mb-1">투찰 율 (낙찰 율)</p>
                        <p className="text-2xl text-emerald-700">{bid.winRate?.toFixed(4)}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-32 text-center border-t-2 border-slate-100 pt-16">
                <p className="text-2xl font-black mb-12 tracking-widest">{bid.openDate.replace(/-/g, '. ')}</p>
                <div className="relative inline-block">
                   <p className="text-4xl font-black tracking-[0.6em]">{bid.organization} 장</p>
                   <div className="absolute -top-6 -right-16 w-20 h-20 border-4 border-red-600/30 rounded-full flex items-center justify-center">
                     <span className="text-red-600/30 font-black text-sm">인</span>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="bg-white w-full max-w-[840px] shadow-xl border border-slate-200 p-12 min-h-full rounded-3xl">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-8 mb-12">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg"><Settings size={24} /></div>
                  <h2 className="text-3xl font-black text-slate-900">{getSpecTitle()}</h2>
                </div>
                <span className="text-xs font-black text-slate-400 border border-slate-200 px-3 py-1 rounded-full uppercase tracking-widest">TS-V2.5</span>
              </div>
              
              <div className="space-y-16">
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-slate-900 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm">01</div>
                    <h4 className="text-2xl font-black text-slate-800 tracking-tight">핵심 기술 요구 사항</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {bid.specDetails?.map((spec, i) => (
                      <div key={i} className="flex gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-white transition-all group">
                        <div className="shrink-0 mt-1"><CheckSquare size={20} className="text-blue-500 group-hover:scale-110 transition-transform" /></div>
                        <div>
                          <p className="text-sm font-black text-blue-600 mb-1 uppercase tracking-wider">Requirement 0{i+1}</p>
                          <p className="text-lg font-bold text-slate-700 leading-relaxed">{spec}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-slate-900 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm">02</div>
                    <h4 className="text-2xl font-black text-slate-800 tracking-tight">주요 자재 및 소요 부품</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {bid.equipmentList?.map((eq, i) => (
                      <div key={i} className="group p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600 font-black group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">{i+1}</div>
                           <div>
                             <p className="font-black text-slate-800 text-lg">{eq}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Standard Compliant</p>
                           </div>
                        </div>
                        <Cpu size={24} className="text-slate-100 group-hover:text-blue-100 transition-colors" />
                      </div>
                    ))}
                  </div>
                </section>

                <div className="p-8 bg-amber-50 border border-amber-100 rounded-3xl flex gap-6 shadow-inner">
                  <AlertCircle className="text-amber-500 shrink-0" size={32} />
                  <div>
                    <h5 className="font-black text-amber-900 text-lg mb-2">시공사 준수사항 (필독)</h5>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      모든 공정은 발주처 승인 감독관의 임회 하에 진행되어야 하며, 일일 작업 일지 및 공정 사진첩을 작성하여 주간 단위로 보고해야 합니다. 
                      공사 완료 후 2년간 무상 하자 보수를 원칙으로 하며, 기술 지원 확약서를 제출해야 합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="bg-white w-full max-w-[840px] shadow-xl border border-slate-200 p-12 min-h-full rounded-3xl">
              <div className="flex items-center gap-4 mb-16">
                 <div className="bg-slate-100 p-3 rounded-2xl text-slate-900"><Info size={28} /></div>
                 <h2 className="text-3xl font-black text-slate-900">사업 추진 로드맵 및 개요</h2>
              </div>
              
              <div className="space-y-16">
                <div className="p-10 bg-gradient-to-br from-slate-900 to-blue-900 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700"><Cpu size={200} /></div>
                  <div className="relative z-10">
                    <div className="bg-blue-500/20 w-fit px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-blue-500/30">Executive Summary</div>
                    <p className="text-2xl font-bold leading-[1.6] italic">"{bid.projectScope}"</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <OverviewCard label="사업 대상 지역" value={bid.region} icon={<div className="w-2 h-2 bg-blue-500 rounded-full" />} />
                  <OverviewCard label="예상 공사 기간" value="착공 후 120일" icon={<div className="w-2 h-2 bg-emerald-500 rounded-full" />} />
                  <OverviewCard label="계약 체결 방식" value="제한 경쟁 입찰" icon={<div className="w-2 h-2 bg-amber-500 rounded-full" />} />
                </div>

                <div className="space-y-8 pt-8 border-t border-slate-100">
                   <h4 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                     <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                     기대 효과 (ROI Analysis)
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {[
                       { t: "안정성 강화", d: "노후 설비 전면 교체를 통한 장애 발생율 90% 감소" },
                       { t: "운영 효율화", d: "지능형 제어 시스템 도입으로 유지비용 연간 1.2억 절감" },
                       { t: "재난 대응", d: "골든타임 내 화재/장애 감지 및 자동 알림 시스템 완비" },
                       { t: "시민 만족", d: "공공 서비스 인프라 품질 향상에 따른 민원 해소" }
                     ].map((item, i) => (
                       <div key={i} className="p-6 bg-white border border-slate-100 rounded-2xl hover:shadow-lg transition-all">
                         <p className="font-black text-blue-600 mb-2">{item.t}</p>
                         <p className="text-sm font-bold text-slate-500 leading-relaxed">{item.d}</p>
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
  <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-transform">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
    <p className="text-xl font-black text-slate-900">{value}</p>
  </div>
);

export default DocumentViewer;
