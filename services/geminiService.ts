
import { GoogleGenAI } from "@google/genai";
import { BidItem } from "../types";

// Note: process.env.API_KEY is handled externally.
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callAiWithRetry = async (prompt: string, maxRetries = 3) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let delay = 3000;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          temperature: 0.8,
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      return response.text;
    } catch (error: any) {
      const errorStr = String(error).toLowerCase();
      const message = (error?.message || '').toLowerCase();
      const status = error?.status;
      
      const isQuotaExhausted = 
        status === 429 || 
        errorStr.includes('429') || 
        errorStr.includes('quota') ||
        errorStr.includes('resource_exhausted') ||
        errorStr.includes('limit');

      if (isQuotaExhausted) {
        if (message.includes('exceeded') || message.includes('daily') || message.includes('check your plan')) {
           throw new Error('QUOTA_EXHAUSTED');
        }

        if (i < maxRetries - 1) {
          const jitter = Math.random() * 1000;
          await sleep(delay + jitter);
          delay *= 2;
          continue;
        }
      }
      throw error;
    }
  }
};

export const getBidInsights = async (bids: BidItem[]) => {
  if (bids.length === 0) return "분석할 데이터가 없습니다.";
  
  const bidSummary = bids.slice(0, 5).map(b => ({
    title: b.title,
    price: b.basePrice,
    type: b.type
  }));

  const prompt = `당신은 (주)진주정보통신의 수석 비즈니스 컨설턴트입니다. 다음 입찰 데이터를 분석하여 경영진이 즉시 참고할 수 있는 전략적 통찰 한 줄을 한국어로 작성해주세요:\n${JSON.stringify(bidSummary)}`;
  
  try {
    return await callAiWithRetry(prompt);
  } catch (error: any) {
    if (error.message === 'QUOTA_EXHAUSTED') throw error;
    return "분석 엔진이 일시적으로 응답하지 않습니다.";
  }
};

export const generateMarketingMessage = async (bid: BidItem, targetType: '축하' | '제안') => {
  const categoryContext = {
    '정보통신': '지능형 CCTV 통합 보안 솔루션, AI 기반 장애 예측 네트워크 시스템, 초고속 광대역 망 고도화 및 데이터센터 인프라 최적화 기술',
    '전기': '에너지 효율 극대화 스마트 배전 솔루션, 고압 수변전 설비 정밀 진단 및 시공, 신재생 에너지 연계 마이크로그리드 시스템 구축 역량',
    '소방': 'IoT 연동 실시간 화재 감지 및 자동 진압 시스템, 무결점 소방 방재 통합 관제 솔루션, 강화된 소방법규를 상회하는 최고 수준의 내화 공법'
  }[bid.category] || '스마트 시티 구현을 위한 종합 엔지니어링 및 융복합 시설물 관리 솔루션';

  const prompt = `
당신은 대한민국 ICT 및 시설 공사 분야의 선두주자인 '(주)진주정보통신'의 전략영업 부사장입니다. 
단순한 축하를 넘어, 상대 업체가 '이 업체와 함께하면 사업의 리스크가 줄고 수익이 극대화되겠다'는 확신을 가질 수 있도록 매우 구체적이고 알찬 비즈니스 협력 제안서를 작성하십시오.

[분석 데이터]
- 프로젝트: ${bid.title}
- 발주처: ${bid.organization}
- 사업분야: ${bid.category} (핵심 기술: ${categoryContext})
- 수신 업체: ${bid.winner || '귀사'}

[메시지 작성 지침 - 다음 4가지 핵심 요소를 상세히 포함할 것]

1. [격조 높은 축하와 사업 가치 분석]: 
   - '${bid.winner || '귀사'}'가 확보한 '${bid.title}' 수주의 쾌거를 진심으로 축하하며, 해당 사업이 발주처('${bid.organization}')의 핵심 과제임을 인지하고 있음을 보여주세요.
   - 업계 전문가로서 해당 프로젝트가 갖는 기술적 난이도와 중요성을 높이 평가하여 상대의 자부심을 고취시키십시오.

2. [차별화된 기술 솔루션 제시]:
   - (주)진주정보통신이 보유한 '${categoryContext}'를 프로젝트 현장에 어떻게 접목할 수 있는지 구체적인 시나리오를 제시하세요. 
   - 예: "AI 기반의 사전 장애 탐지 시스템을 통해 유지보수 비용을 획기적으로 절감할 수 있는 솔루션을 제안드립니다."

3. [파트너사가 얻게 될 3대 실질 이익]:
   - [원가 경쟁력]: 효율적인 자재 수급 네트워크와 전문 인력 직접 투입을 통한 시공 단가 최적화.
   - [무결점 품질]: 국가 표준 이상의 시공 품질과 철저한 준공 검사 지원으로 발주처 신뢰도 확보.
   - [행정 및 설계 지원]: 까다로운 인허가 절차 및 설계 변경 상황에 대한 전문가 그룹의 실시간 대응.

4. [전략적 파트너십 제안 및 마무리]:
   - 단순 하도급 관계가 아닌, 프로젝트 성공을 위한 '공동 운명체'로서의 상생 모델을 제안하십시오.
   - 상세한 협력 방안(기술 자료 공유, 현장 실사 동행 등)을 논의하기 위한 티타임 또는 미팅을 정중히 요청하십시오.

[작성 형식]
- 분량: 공백 포함 600자 ~ 900자 내외의 충실한 내용. (내용이 빈약하지 않도록 할 것)
- 어조: 신뢰와 권위가 느껴지는 최고급 비즈니스 경어체.
- 하단 필수 포함: "(주)진주정보통신 전략영업본부 | 문의: 010-8758-5959"
`;

  return await callAiWithRetry(prompt);
};
