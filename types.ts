
export interface Participant {
  companyName: string;
  isWinner: boolean;
  bidRate: number | null;
  awardPrice: number | null;
}

export interface BidItem {
  id: string;
  bidNo: string;
  type: '입찰' | '낙찰';
  openDate: string;
  closeDate: string;
  title: string;
  organization: string;
  region: string;
  basePrice: number;
  awardPrice?: number;
  winner?: string;
  winRate?: number;
  participants: Participant[];
  link: string;
}

export interface FilterState {
  bidType: 'all' | '입찰' | '낙찰';
  startDate: string;
  endDate: string;
  region: string;
  minAmount: string;
  maxAmount: string;
  keyword: string;
}
