
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

const PROJECT_DESCS: Record<BidCategory, string> = {
  '정보통신': "본 사업은 발주처 내 노후화된 네트워크 스위치 및 전송 장비를 교체하여 초고속 정보통신망의 안정성을 확보하고, 지능형 관제 시스템을 도입하여 디지털 재난 대응 역량을 강화하는 것을 목적으로 합니다.",
  '전기': "사업지 내 고압 수변전 설비의 안정적 운영을 위해 노후 변압기 및 배전반을 교체하고, 에너지 절감을 위한 지능형 LED 조명 시스템과 태양광 발전 연동 인터페이스를 구축하는 공사입니다.",
  '소방': "화재 예방 및 신속한 대응을 위해 건축물 내 소방 펌프, 수신기 등 핵심 설비를 정비하고, 법적 기준에 부합하는 스프링클러 헤드 증설 및 지능형 화재 감지 센서 네트워크를 구성하는 공사입니다."
};

const SPECS_MAP: Record<BidCategory, string[]> = {
  '정보통신': [
    "IEEE 802.3 규격 준수 및 고가용성(HA) 구성 필수",
    "CAT.6A 이상의 차폐 케이블 사용 및 링크 통합 테스트 시행",
    "기존 전산망과 무중단 전환 시나리오 수립 및 사전 검증",
    "네트워크 보안 관제 시스템(NMS) 연동 및 트래픽 분석 툴 설치"
  ],
  '전기': [
    "KS C 4306 규격 변압기 및 저압 배전반 표준 공법 준수",
    "접지 저항 측정 및 전기 안전 공사 검사 합격 필수",
    "절연 전선 및 난연 등급 케이블 사용 (LS전선 동등 이상)",
    "비상 발전기 연동 및 정전 시 자동 절환 스위치(ATS) 테스트"
  ],
  '소방': [
    "소방시설 설치 및 관리에 관한 법률 제12조 준수",
    "내화/내열 배선 공법 적용 및 화재 수신기 연동 정밀 점검",
    "스프링클러 헤드 살수 장애 여부 확인 및 수압 테스트 보고서 제출",
    "시각 경보기 및 비상 방송 시스템 음압 측정 및 최적화"
  ]
};

const EQUIPMENTS_MAP: Record<BidCategory, string[]> = {
  '정보통신': ["24포트 PoE L2 스위치", "SFP 광 모듈 (10G)", "랙 마운트형 NVR", "실내외용 지능형 IP 카메라", "광섬유 접속함체"],
  '전기': ["몰드형 변압기 (500kVA)", "디지털 복합 계전기", "고효율 LED 가로등기구", "메인 배선용 차단기 (MCCB)", "전력 제어용 PLC"],
  '소방': ["R형 복합식 수신기", "프리액션 밸브", "지상형 옥외 소화전", "광전식 연기 감지기", "대형 엔진 펌프 (10HP)"]
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
    projectScope: PROJECT_DESCS[category],
    specDetails: SPECS_MAP[category],
    equipmentList: EQUIPMENTS_MAP[category].sort(() => 0.5 - Math.random())
  };
};

export const generateMockData = (count: number = 50): BidItem[] => {
  return Array.from({ length: count }).map((_, i) => createSingleBid(i));
};
