
import { BidItem } from './types';

export const REGIONS = [
  '전체', '서울', '부산', '대구', '인천', '광주', '대전', '울산', 
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
];

export const BID_TYPES = [
  { value: 'all', label: '전체' },
  { value: '입찰', label: '입찰공고' },
  { value: '낙찰', label: '낙찰결과' }
];

const ORGS = ["조달청", "한국전력공사", "한국수자원공사", "KORAIL", "한국도로공사", "LH공사", "국가철도공단", "경남도청", "진주시청"];
const KEYWORDS = ["통신공사", "네트워크 고도화", "CCTV 설치", "전산 유지보수", "광케이블 가설", "서버 인프라 구축", "스마트시티 인프라"];

export const createSingleBid = (idSuffix: string | number): BidItem => {
  const isAward = Math.random() > 0.4;
  const basePrice = 50000000 + Math.floor(Math.random() * 5000000000);
  const openDate = new Date().toISOString().split('T')[0];
  const region = REGIONS[Math.floor(Math.random() * (REGIONS.length - 1)) + 1];
  const org = ORGS[Math.floor(Math.random() * ORGS.length)];
  const keyword = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
  
  const participants: any[] = Array.from({ length: Math.floor(Math.random() * 5) + 3 }).map((__, pi) => {
    const rate = 85 + Math.random() * 12;
    return {
      companyName: `(주)${['대호', '한울', '세종', '미래', '제이', '현대'][Math.floor(Math.random() * 6)]}정보통신`,
      isWinner: false,
      bidRate: rate,
      awardPrice: Math.round(basePrice * (rate / 100))
    };
  });

  if (isAward) {
    const winnerIdx = Math.floor(Math.random() * participants.length);
    participants[winnerIdx].isWinner = true;
  }

  const winner = participants.find(p => p.isWinner);

  return {
    id: `BID-${Date.now()}-${idSuffix}`,
    bidNo: `20250${Math.floor(Math.random()*9)+1}${String(idSuffix).padStart(5, '0')}-00`,
    type: isAward ? '낙찰' : '입찰',
    openDate,
    closeDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0],
    title: `${region} ${org} ${keyword}`,
    organization: org,
    region,
    basePrice,
    awardPrice: winner?.awardPrice,
    winner: winner?.companyName,
    winRate: winner?.bidRate,
    participants,
    link: 'https://www.g2b.go.kr'
  };
};

export const generateMockData = (count: number = 50): BidItem[] => {
  return Array.from({ length: count }).map((_, i) => createSingleBid(i));
};
