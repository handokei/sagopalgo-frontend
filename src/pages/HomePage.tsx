import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProductGrid from '../components/ProductGrid';
import SectionTitle from '../components/SectionTitle';
import type { ProductCardData } from '../components/ProductCard';
import { buildApiUrl } from '../lib/api';
import { mockTodaysPick } from '../lib/mock';

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
  categoryName: string;
  sellerNickname: string;
}

interface PageResponse {
  content: ApiProduct[];
  totalPages: number;
  totalElements: number;
  number: number;
}

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

const fetchProducts = async (sort: string, size: number): Promise<ProductCardData[]> => {
  try {
    const params = new URLSearchParams({ page: '0', size: String(size), sort });
    const response = await fetch(buildApiUrl(`/api/products?${params}`));
    if (!response.ok) return [];
    const data: PageResponse = await response.json();

    return await Promise.all(
      data.content.map(async (p) => {
        const mainImage = await fetchProductImage(p.id);
        return {
          id: p.id,
          title: p.title,
          price: p.price,
          categoryName: p.categoryName,
          sellerNickname: p.sellerNickname,
          mainImage,
        };
      })
    );
  } catch {
    return [];
  }
};

const HomePage = () => {
  const [forYou, setForYou] = useState<ProductCardData[]>([]);
  const [ranking, setRanking] = useState<ProductCardData[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const pick = mockTodaysPick;

  useEffect(() => {
    const load = async () => {
      const [fy, rk, na] = await Promise.all([
        fetchProducts('popular', 8),
        fetchProducts('likes_count', 5),
        fetchProducts('latest', 5),
      ]);
      setForYou(fy);
      setRanking(rk);
      setNewArrivals(na);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <Layout>
      {/* Hero: Today's Pick */}
      <section className="bg-paper">
        <div className="max-w-content mx-auto px-8 py-10 grid grid-cols-[1fr_1.3fr] gap-10" style={{ minHeight: 480 }}>
          {/* 왼쪽: 텍스트 */}
          <div className="flex flex-col justify-center">
            <span className="text-[11px] font-mono tracking-[0.08em] uppercase text-ink-soft mb-3">
              TODAY'S PICK &middot; {pick.date}
            </span>
            <h1 className="text-[52px] font-black tracking-tight2 leading-[1.05] mb-4">
              {pick.title}
            </h1>
            <p className="text-[15px] text-ink-soft leading-relaxed mb-6 max-w-md">
              {pick.subtitle}
            </p>
            <p className="text-[12px] text-ink-faint mb-6">
              curated by <span className="text-ink">{pick.curator}</span>
            </p>
            <div className="flex gap-3">
              <button className="btn-primary">전체 룩 보기</button>
              <button className="btn">♡ 저장</button>
            </div>
          </div>

          {/* 오른쪽: 이미지 + 핫스팟 */}
          <div className="relative rounded-sm overflow-hidden" style={{ aspectRatio: '1 / 1.1' }}>
            <img
              src={pick.heroImage}
              alt={pick.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {pick.hotspots.map((hs) => (
              <div
                key={hs.id}
                className="absolute flex items-center gap-2 group cursor-pointer"
                style={{ top: hs.top, left: hs.left }}
              >
                <span className="w-6 h-6 flex items-center justify-center bg-ink text-paper text-[11px] font-mono font-bold rounded-full ring-2 ring-paper">
                  {hs.id}
                </span>
                <span className="hidden group-hover:flex items-center gap-1.5 bg-paper border border-line px-2 py-1 text-[11px] font-mono whitespace-nowrap shadow-sm">
                  {hs.label} &middot; {hs.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="text-center py-20 text-ink-faint">로딩 중...</div>
      ) : (
        <div className="max-w-content mx-auto px-8">
          {/* IN THIS LOOK */}
          <section className="py-8">
            <SectionTitle kicker="LOOK" title="이 룩의 아이템" />
            <div className="grid grid-cols-4 gap-5">
              {pick.hotspots.map((hs) => (
                <div key={hs.id} className="block">
                  <div className="aspect-[1/1.18] rounded-sm mb-2 overflow-hidden">
                    <img
                      src={hs.image}
                      alt={hs.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[13px] text-ink leading-snug mb-1">{hs.label}</p>
                  <p className="text-[14px] font-bold text-ink">{hs.price}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FOR YOU */}
          {forYou.length > 0 && (
            <section className="py-8">
              <SectionTitle kicker="PICK" title="추천 상품" moreTo="/products?sort=popular" />
              <ProductGrid products={forYou} cols={4} />
            </section>
          )}

          {/* LIVE 랭킹 */}
          {ranking.length > 0 && (
            <section className="py-8">
              <SectionTitle kicker="LIVE" title="실시간 랭킹" moreTo="/products?sort=likes_count" />
              <ProductGrid products={ranking} cols={5} withRank />
            </section>
          )}

          {/* JUST IN */}
          {newArrivals.length > 0 && (
            <section className="py-8">
              <SectionTitle kicker="NEW" title="새로 올라온 상품" moreTo="/products?sort=latest" />
              <ProductGrid products={newArrivals} cols={5} />
            </section>
          )}
        </div>
      )}
    </Layout>
  );
};

export default HomePage;
