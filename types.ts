
export interface Participant {
  companyName: string;
  isWinner: boolean;
  bidRate: number | null;
  awardPrice: number | null;
  phone?: string;
  email?: string;
  fax?: string;
}

export type BidCategory = '정보통신' | '전기' | '소방';

export interface BidItem {
  id: string;
  bidNo: string;
  type: '입찰' | '낙찰';
  category: BidCategory; // 추가: 사업 분야
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

export interface FilterState {
  bidType: 'all' | '입찰' | '낙찰';
  category: 'all' | BidCategory; // 추가: 분야 필터
  startDate: string;
  endDate: string;
  region: string;
  minAmount: string;
  maxAmount: string;
  keyword: string;
}
