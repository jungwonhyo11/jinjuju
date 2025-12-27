
import { GoogleGenAI, Type } from "@google/genai";
import { BidItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getBidInsights = async (bids: BidItem[]) => {
  if (!process.env.API_KEY) return "API Key가 설정되지 않았습니다.";
  
  const bidSummary = bids.slice(0, 10).map(b => ({
    title: b.title,
    price: b.basePrice,
    type: b.type,
    winner: b.winner
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `다음은 최근 통신공사 입찰 데이터입니다. 진주정보통신 경영진에게 보고할 수 있는 3문장 요약 분석과 향후 전략 1가지를 제안해주세요.\n\n${JSON.stringify(bidSummary)}`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI 분석을 불러오는 중 오류가 발생했습니다.";
  }
};

export const generateMarketingMessage = async (bid: BidItem, targetType: '축하' | '제안') => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        공고명: ${bid.title}
        발주처: ${bid.organization}
        낙찰업체: ${bid.winner || 'N/A'}
        
        이 정보를 바탕으로 (주)진주정보통신의 전문성을 강조한 ${targetType} 메시지를 200자 내외로 작성해줘. 
        진주정보통신은 경남 진주에 위치한 통신·네트워크 공사 전문 업체야.
      `,
    });
    return response.text;
  } catch (error) {
    return "메시지 생성 중 오류가 발생했습니다.";
  }
};
