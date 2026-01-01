
import { BidItem, BidCategory } from './types';

export const REGIONS = [
  '전체', '서울', '부산', '대구', '인천', '광주', '대전', '울산', 
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
];

export const BID_TYPES = [
  { value: 'all', label: '전체' },
  { value: '입찰', label: '입찰공고' },
  { value: '낙찰', label: '낙찰결과' }
];

export const CATEGORIES: { value: string; label: string }[] = [
  { value: 'all', label: '전체 분야' },
  { value: '정보통신', label: '정보통신' },
  { value: '전기', label: '전기공사' },
  { value: '소방', label: '소방공사' }
];

const ORGS = ["조달청", "한국전력공사", "한국수자원공사", "KORAIL", "한국도로공사", "LH공사", "국가철도공단", "경남도청", "진주시청", "한국토지주택공사"];

const KEYWORDS_MAP: Record<BidCategory, string[]> = {
  '정보통신': ["통신공사", "네트워크 고도화", "CCTV 설치", "전산 유지보수", "광케이블 가설", "서버 인프라 구축", "스마트시티 인프라"],
  '전기': ["전기공사", "변전설비 보수", "LED 조명 교체", "태양광 발전설비", "배전반 설치", "가로등 유지보수", "전기차 충전기 구축"],
  '소방': ["소방시설 보수", "스프링클러 설치", "화재감지기 교체", "소방정밀점검", "소방펌프 수리", "제연설비 공사", "피난기구 보급"]
};

const PROJECT_DESCS = [
  "본 사업은 지역 내 시설물의 안정적 운영을 위한 노후 장비 교체 및 시스템 고도화를 목적으로 함.",
  "재난 상황 및 긴급 사태 발생 시 실시간 대응 체계 구축을 위한 필수 인프라 조성 공사임.",
  "공공 서비스의 효율성 증대와 시민 안전 확보를 최우선으로 하는 국가 지표 사업임."
];

const EQUIPMENTS_MAP: Record<BidCategory, string[]> = {
  '정보통신': ["Cat.6 LAN 케이블", "L2/L3 스위치", "네트워크 랙", "OTDR 측정기", "광융착접속기"],
  '전기': ["절연전선", "누전차단기", "변압기", "LED 등기구", "케이블 트레이", "접지봉"],
  '소방': ["스프링클러 헤드", "소화전함", "화재수신기", "감지기", "완강기", "방화셔터 제어기"]
};

export const createSingleBid = (idSuffix: string | number, specificDate?: Date): BidItem => {
  const isAward = Math.random() > 0.4;
  const categories: BidCategory[] = ['정보통신', '전기', '소방'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  
  const basePrice = 30000000 + Math.floor(Math.random() * 4000000000);
  
  const today = new Date();
  const date = specificDate || new Date(today.getFullYear(), today.getMonth(), Math.floor(Math.random() * 28) + 1);
  const openDate = date.toISOString().split('T')[0];
  
  const region = REGIONS[Math.floor(Math.random() * (REGIONS.length - 1)) + 1];
  const org = ORGS[Math.floor(Math.random() * ORGS.length)];
  const keyword = KEYWORDS_MAP[category][Math.floor(Math.random() * KEYWORDS_MAP[category].length)];
  
  const participants: any[] = Array.from({ length: Math.floor(Math.random() * 6) + 2 }).map((__, pi) => {
    const rate = 86 + Math.random() * 11;
    return {
      companyName: `(주)${['진주', '한울', '세종', '미래', '금강', '태양', '성광'][Math.floor(Math.random() * 7)]}${category.slice(0, 2)}`,
      isWinner: false,
      bidRate: rate,
      awardPrice: Math.round(basePrice * (rate / 100)),
      phone: `010-${Math.floor(1000+Math.random()*9000)}-${Math.floor(1000+Math.random()*9000)}`,
      email: `biz@${category === '정보통신' ? 'it' : category === '전기' ? 'elec' : 'fire'}-${pi}.co.kr`,
      fax: `055-${Math.floor(700+Math.random()*200)}-${Math.floor(1000+Math.random()*9000)}`
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
    category,
    openDate,
    closeDate: new Date(date.getTime() + 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0],
    title: `${region} ${org} ${keyword}`,
    organization: org,
    region,
    basePrice,
    awardPrice: winner?.awardPrice,
    winner: winner?.companyName,
    winnerContact: winner ? {
      phone: winner.phone,
      email: winner.email,
      fax: winner.fax
    } : undefined,
    winRate: winner?.bidRate,
    participants,
    link: 'https://www.g2b.go.kr',
    documentUrl: `https://example.com/docs/${idSuffix}.pdf`,
    projectScope: PROJECT_DESCS[Math.floor(Math.random() * PROJECT_DESCS.length)],
    specDetails: [
      `${category} 관련 법령 및 국가표준(KS) 준수`,
      "설계도서 및 시방서에 근거한 정밀 시공",
      "안전관리 계획 수립 및 무재해 공정 이행"
    ],
    equipmentList: EQUIPMENTS_MAP[category].sort(() => 0.5 - Math.random()).slice(0, 4)
  };
};

export const generateMockData = (count: number = 50): BidItem[] => {
  return Array.from({ length: count }).map((_, i) => createSingleBid(i));
};
