import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import ProductGrid from '../components/ProductGrid';
import SectionTitle from '../components/SectionTitle';
import type { ProductCardData } from '../components/ProductCard';
import { buildApiUrl } from '../lib/api';

interface ProductImage {
  id: number;
  imageUrl: string;
  main: boolean;
}

interface ApiProduct {
  id: number;
  title: string;
  price: number;
  productStatus: string;
  categoryId: number;
  categoryName: string;
  sellerNickname: string;
}

interface PageResponse {
  content: ApiProduct[];
  totalPages: number;
  totalElements: number;
  number: number;
}

const timeFilters = ['실시간', '일간', '주간', '월간'] as const;

const fetchProductImage = async (productId: number): Promise<string | undefined> => {
  try {
    const response = await fetch(buildApiUrl(`/api/products/${productId}/images`));
    if (response.ok) {
      const images: ProductImage[] = await response.json();
      const mainImage = images.find(img => img.main) || images[0];
      return mainImage?.imageUrl;
    }
  } catch {
    // ignore
  }
  return undefined;
};

const RankingPage = () => {
  const [timeFilter, setTimeFilter] = useState<typeof timeFilters[number]>('실시간');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [top3, setTop3] = useState<ProductCardData[]>([]);
  const [rest, setRest] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(buildApiUrl('/api/categories'));
        if (response.ok) {
          const data: { id: number; name: string }[] = await response.json();
          setCategories(['전체', ...data.map(c => c.name)]);
        }
      } catch {
        setCategories(['전체']);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const size = showMore ? 50 : 20;
        const params = new URLSearchParams({ page: '0', size: String(size), sort: 'likes_count' });
        const response = await fetch(buildApiUrl(`/api/products?${params}`));
        const data: PageResponse = await response.json();

        const products = await Promise.all(
          data.content.map(async (p) => {
            const mainImage = await fetchProductImage(p.id);
            return { id: p.id, title: p.title, price: p.price, categoryName: p.categoryName, sellerNickname: p.sellerNickname, mainImage };
          })
        );

        setTop3(products.slice(0, 3));
        setRest(products.slice(3));
      } catch (error) {
        console.error('랭킹 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, [showMore]);

  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHeights = ['h-[360px]', 'h-[440px]', 'h-[320px]'];
  const podiumRanks = [2, 1, 3];

  return (
    <Layout>
      <div className="max-w-content mx-auto px-8 py-8">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-[36px] font-extrabold tracking-tightish">랭킹</h1>
          <p className="text-[13px] text-ink-soft mt-1">매시간 갱신 · 최근 1시간 거래 기준</p>
        </div>

        {/* 시간 필터 */}
        <div className="flex gap-2 mb-4">
          {timeFilters.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              className={timeFilter === tf ? 'pill-fill' : 'pill'}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-1 border-b border-line mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`tab ${categoryFilter === cat ? 'tab-active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-ink-faint">로딩 중...</div>
        ) : (
          <>
            {/* 포디움 Top 3 */}
            {top3.length >= 3 && (
              <div className="grid grid-cols-3 gap-5 items-end mb-12">
                {podiumOrder.map((product, i) => (
                  <div key={product.id} className={`${podiumHeights[i]} flex flex-col`}>
                    <div className="flex-1 relative">
                      <ProductCard product={product} rank={podiumRanks[i]} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 나머지 랭킹 */}
            {rest.length > 0 && (
              <section>
                <SectionTitle kicker="RANKING" title="4위 이후" />
                <ProductGrid products={rest} cols={5} withRank />
              </section>
            )}

            {/* 더 보기 */}
            {!showMore && rest.length > 0 && (
              <div className="mt-8 text-center">
                <button onClick={() => setShowMore(true)} className="btn">
                  ↓ 50위까지 더 보기
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default RankingPage;
