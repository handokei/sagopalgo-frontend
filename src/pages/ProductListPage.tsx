import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import type { ProductCardData } from '../components/ProductCard';
import { buildApiUrl } from '../lib/api';

interface ProductImage {
  id: number;
  imageUrl: string;
  main: boolean;
}

interface Category {
  id: number;
  name: string;
}

interface ApiProduct {
  id: number;
  title: string;
  price: number;
  productStatus: string;
  categoryId: number;
  categoryName: string;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  sellerNickname: string;
}

interface PageResponse {
  content: ApiProduct[];
  totalPages: number;
  totalElements: number;
  number: number;
}

const sortOptions = [
  { value: '', label: '추천순' },
  { value: 'latest', label: '신상품순' },
  { value: 'popular', label: '인기순' },
  { value: 'price_asc', label: '낮은가격순' },
  { value: 'price_desc', label: '높은가격순' },
  { value: 'likes_count', label: '좋아요순' },
];

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

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '');
  const [categoryId, setCategoryId] = useState<number | ''>(
    searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : ''
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [sort, setSort] = useState(searchParams.get('sort') ?? '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(buildApiUrl('/api/categories'));
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('카테고리 로딩 실패:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const urlKeyword = searchParams.get('keyword') ?? '';
    const urlSort = searchParams.get('sort') ?? '';
    const urlCategoryId = searchParams.get('categoryId');
    if (urlKeyword !== keyword) setKeyword(urlKeyword);
    if (urlSort !== sort) setSort(urlSort);
    if (urlCategoryId && Number(urlCategoryId) !== categoryId) setCategoryId(Number(urlCategoryId));
    if (!urlCategoryId && categoryId !== '') setCategoryId('');
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', '16');
      if (keyword) params.append('keyword', keyword);
      if (categoryId) params.append('categoryId', categoryId.toString());
      if (sort) params.append('sort', sort);

      const response = await fetch(buildApiUrl(`/api/products?${params}`));
      const data: PageResponse = await response.json();

      const productsWithImages = await Promise.all(
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

      setProducts(productsWithImages);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error('상품 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, categoryId, sort, keyword]);

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(0);
    const params = new URLSearchParams(searchParams);
    if (newSort) params.set('sort', newSort);
    else params.delete('sort');
    setSearchParams(params);
  };

  const handleCategoryChange = (catId: number | '') => {
    setCategoryId(catId);
    setPage(0);
    const params = new URLSearchParams(searchParams);
    if (catId) params.set('categoryId', catId.toString());
    else params.delete('categoryId');
    setSearchParams(params);
  };

  const handleKeywordClear = () => {
    setKeyword('');
    setPage(0);
    const params = new URLSearchParams(searchParams);
    params.delete('keyword');
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    const params = new URLSearchParams(searchParams);
    if (keyword) params.set('keyword', keyword);
    else params.delete('keyword');
    setSearchParams(params);
  };

  const selectedCategory = categories.find(c => c.id === categoryId);

  // 페이지네이션 번호 생성
  const pageNumbers: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(0);
    if (page > 2) pageNumbers.push('...');
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) {
      pageNumbers.push(i);
    }
    if (page < totalPages - 3) pageNumbers.push('...');
    pageNumbers.push(totalPages - 1);
  }

  return (
    <Layout>
      <div className="max-w-content mx-auto px-8 py-8">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[12px] text-ink-faint mb-3">
            <a href="/" className="hover:text-ink">홈</a>
            <span>›</span>
            <span className="text-ink">{selectedCategory?.name ?? '전체 상품'}</span>
          </div>
          <h1 className="text-[32px] font-extrabold tracking-tightish">
            {keyword ? `"${keyword}" 검색 결과` : selectedCategory?.name ?? '전체 상품'}
          </h1>
          <p className="text-[13px] text-ink-soft mt-1">
            {totalElements.toLocaleString()}개 상품
          </p>
        </div>

        <div className="flex gap-8">
          {/* 사이드바 필터 */}
          <aside className="w-[220px] shrink-0">
            <h3 className="text-[14px] font-semibold mb-4 pb-2 border-b border-line">필터</h3>

            {/* 카테고리 필터 */}
            <div className="mb-6">
              <h4 className="text-[13px] font-medium mb-2">카테고리</h4>
              <ul className="space-y-1.5">
                <li>
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`text-[13px] w-full text-left py-0.5 ${categoryId === '' ? 'text-ink font-semibold' : 'text-ink-soft hover:text-ink'}`}
                  >
                    전체
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`text-[13px] w-full text-left py-0.5 ${categoryId === cat.id ? 'text-ink font-semibold' : 'text-ink-soft hover:text-ink'}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 검색 */}
            <div className="mb-6 pt-4 border-t border-line">
              <h4 className="text-[13px] font-medium mb-2">검색</h4>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="검색어 입력..."
                  className="w-full px-3 py-2 text-[13px] border border-line rounded-sm bg-paper focus:outline-none focus:border-ink"
                />
              </form>
            </div>
          </aside>

          {/* 메인 콘텐츠 */}
          <div className="flex-1 min-w-0">
            {/* 정렬 + 활성 필터 */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex gap-1.5 flex-wrap">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSortChange(opt.value)}
                    className={sort === opt.value ? 'pill-fill' : 'pill'}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 활성 필터 태그 */}
            {(keyword || categoryId) && (
              <div className="flex items-center gap-2 mb-4 text-[12px]">
                {keyword && (
                  <button onClick={handleKeywordClear} className="pill">
                    {keyword} ✕
                  </button>
                )}
                {selectedCategory && (
                  <button onClick={() => handleCategoryChange('')} className="pill">
                    {selectedCategory.name} ✕
                  </button>
                )}
                <button
                  onClick={() => {
                    handleCategoryChange('');
                    handleKeywordClear();
                  }}
                  className="text-ink-faint hover:text-ink ml-1"
                >
                  전체 해제
                </button>
              </div>
            )}

            {/* 상품 그리드 */}
            {loading ? (
              <div className="text-center py-20 text-ink-faint">로딩 중...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-ink-faint">상품이 없습니다.</div>
            ) : (
              <div className="grid grid-cols-4 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-1">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="w-8 h-8 flex items-center justify-center text-[13px] border border-line rounded-sm disabled:opacity-30 hover:bg-paper-warm"
                >
                  ‹
                </button>
                {pageNumbers.map((p, i) =>
                  p === '...' ? (
                    <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-[13px] text-ink-faint">
                      ···
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center text-[13px] border rounded-sm ${
                        page === p
                          ? 'bg-ink text-paper border-ink font-semibold'
                          : 'border-line hover:bg-paper-warm'
                      }`}
                    >
                      {p + 1}
                    </button>
                  )
                )}
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="w-8 h-8 flex items-center justify-center text-[13px] border border-line rounded-sm disabled:opacity-30 hover:bg-paper-warm"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductListPage;
