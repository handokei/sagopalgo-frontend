export interface TodaysPickHotspot {
  id: number;
  label: string;
  price: string;
  image: string;
}

export interface TodaysPick {
  date: string;
  curator: string;
  title: string;
  subtitle: string;
  heroImage: string;
  hotspots: TodaysPickHotspot[];
}

export const mockTodaysPick: TodaysPick = {
  date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
  curator: '@stylist_mina',
  title: '오늘의 한 벌',
  subtitle: '봄 햇살 아래, 자연스럽게 힘을 빼는 무드. 오버사이즈 린넨 셔츠에 와이드 슬랙스, 캔버스 토트로 완성하는 이지 룩.',
  heroImage: '/lookbook/hero.jpg',
  hotspots: [
    { id: 1, label: '오버사이즈 린넨 셔츠', price: '₩69,000', image: '/lookbook/item-1.jpg' },
    { id: 2, label: '와이드 코튼 슬랙스', price: '₩89,000', image: '/lookbook/item-2.jpg' },
    { id: 3, label: '캔버스 토트백', price: '₩45,000', image: '/lookbook/item-3.jpg' },
    { id: 4, label: '레더 샌들', price: '₩120,000', image: '/lookbook/item-4.jpg' },
  ],
};
