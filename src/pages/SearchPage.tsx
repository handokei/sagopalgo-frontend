import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
  sellerNickname: string;
}

interface PageResponse {
  content: ApiProduct[];
  totalPages: number;
  totalElements: number;
  number: number;
}

const sortOptions = [
  { value: '', label: '관련도순' },
  { value: 'popular', label: '판매많은순' },
  { value: 'latest', label: '신상품순' },
  { value: 'price_asc', label: '낮은가격순' },
  { value: 'price_desc', label: '높은가격순' },
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

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [inputValue, setInputValue] = useState(query);
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [sort, setSort] = useState(searchParams.get('sort') ?? '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(buildApiUrl('/api/categories'));
        if (response.ok) setCategories(await response.json());
      } catch {
        // ignore
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const newQuery = searchParams.get('q') ?? '';
    if (newQuery !== inputValue) setInputValue(newQuery);
  }, [searchParams]);

  useEffect(() => {
    if (!query) return;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), size: '12', keyword: query });
        if (categoryId) params.append('categoryId', categoryId.toString());
        if (sort) params.append('sort', sort);

        const response = await fetch(buildApiUrl(`/api/products?${params}`));
        const data: PageResponse = await response.json();

        const productsWithImages = await Promise.all(
          data.content.map(async (p) => {
            const mainImage = await fetchProductImage(p.id);
            return { id: p.id, title: p.title, price: p.price, categoryName: p.categoryName, sellerNickname: p.sellerNickname, mainImage };
          })
        );

        setProducts(productsWithImages);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } catch (error) {
        console.error('검색 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [query, page, categoryId, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setPage(0);
    const params = new URLSearchParams(searchParams);
    params.set('q', inputValue.trim());
    setSearchParams(params);
  };

  const handleClear = () => {
    setInputValue('');
    setProducts([]);
    setTotalElements(0);
    const params = new URLSearchParams(searchParams);
    params.delete('q');
    setSearchParams(params);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(0);
  };

  const handleCategoryFilter = (catId: number | '') => {
    setCategoryId(catId);
    setPage(0);
  };

  // 페이지네이션 번호
  const pageNumbers: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(0);
    if (page > 2) pageNumbers.push('...');
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) pageNumbers.push(i);
    if (page < totalPages - 3) pageNumbers.push('...');
    pageNumbers.push(totalPages - 1);
  }

  return (
    <Layout>
      <div className="max-w-content mx-auto px-8 py-8">
        {/* 검색 입력 */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="검색어를 입력하세요"
              className="w-full pl-4 pr-20 py-3 text-[16px] border border-line rounded-sm bg-paper focus:outline-none focus:border-ink"
            />
            {inputValue && (
              <button type="button" onClick={handleClear} className="absolute right-12 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink text-[16px]">
                ✕
              </button>
            )}
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink text-[18px]">
              ⌕
            </button>
          </form>
          {query && (
            <p className="text-[13px] text-ink-soft mt-2">
              {totalElements.toLocaleString()}건
            </p>
          )}
        </div>

        {!query ? (
          <div className="text-center py-20 text-ink-faint">검색어를 입력해주세요.</div>
        ) : (
          <div className="flex gap-8">
            {/* 사이드바 필터 */}
            <aside className="w-[220px] shrink-0">
              <h3 className="text-[14px] font-semibold mb-4 pb-2 border-b border-line">필터</h3>
              <div className="mb-6">
                <h4 className="text-[13px] font-medium mb-2">카테고리</h4>
                <ul className="space-y-1.5">
                  <li>
                    <button
                      onClick={() => handleCategoryFilter('')}
                      className={`text-[13px] w-full text-left py-0.5 ${categoryId === '' ? 'text-ink font-semibold' : 'text-ink-soft hover:text-ink'}`}
                    >
                      전체
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => handleCategoryFilter(cat.id)}
                        className={`text-[13px] w-full text-left py-0.5 ${categoryId === cat.id ? 'text-ink font-semibold' : 'text-ink-soft hover:text-ink'}`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* 메인 */}
            <div className="flex-1 min-w-0">
              {/* 정렬 */}
              <div className="flex gap-1.5 mb-5">
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

              {loading ? (
                <div className="text-center py-20 text-ink-faint">로딩 중...</div>
              ) : products.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-ink-faint mb-2">"{query}"에 대한 검색 결과가 없습니다.</p>
                  <Link to="/products" className="text-[13px] text-ink-soft hover:text-ink underline">전체 상품 보기</Link>
                </div>
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
                      <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-[13px] text-ink-faint">···</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 flex items-center justify-center text-[13px] border rounded-sm ${
                          page === p ? 'bg-ink text-paper border-ink font-semibold' : 'border-line hover:bg-paper-warm'
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
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
