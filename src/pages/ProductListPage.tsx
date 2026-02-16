import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

interface Product {
  id: number;
  title: string;
  price: number;
  productStatus: string;
  productCategory: string;
  sellerNickname: string;
}

interface PageResponse {
  content: Product[];
  totalPages: number;
  totalElements: number;
  number: number;
}

const ProductListPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: '', label: '전체' },
    { value: 'ELECTRONICS', label: '전자기기' },
    { value: 'FASHION', label: '패션' },
    { value: 'HOME', label: '홈/리빙' },
    { value: 'SPORTS', label: '스포츠' },
    { value: 'BOOKS', label: '도서' },
    { value: 'ETC', label: '기타' },
  ];

  const sortOptions = [
    { value: '', label: '정렬' },
    { value: 'latest', label: '최신순' },
    { value: 'price_asc', label: '가격 낮은순' },
    { value: 'price_desc', label: '가격 높은순' },
    { value: 'popular', label: '인기순' },
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', '12');
      if (keyword) params.append('keyword', keyword);
      if (category) params.append('productCategory', category);
      if (sort) params.append('sort', sort);

      const response = await fetch(`http://localhost:8080/api/products?${params}`);
      const data: PageResponse = await response.json();

      setProducts(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('상품 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, category, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <form onSubmit={handleSearch} className="mb-6 flex gap-4 flex-wrap">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="상품 검색..."
            className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            검색
          </button>
        </form>

        {loading ? (
          <div className="text-center py-20">로딩 중...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-500">상품이 없습니다.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <a
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">이미지</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 truncate">{product.title}</h3>
                  <p className="text-blue-600 font-bold text-xl mb-2">{formatPrice(product.price)}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{product.sellerNickname}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {product.productStatus === 'ON_SALE' ? '판매중' : '판매완료'}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              이전
            </button>
            <span className="px-4 py-2">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductListPage;
