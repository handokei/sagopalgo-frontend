import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

interface ProductImage {
  id: number;
  imageUrl: string;
  main: boolean;
}

interface Product {
  id: number;
  title: string;
  price: number;
  productStatus: string;
  productCategory: string;
  sellerNickname: string;
  mainImage?: string;
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
    { value: 'T_SHIRT', label: '티셔츠' },
    { value: 'HOODIE', label: '후드' },
    { value: 'OUTER', label: '아우터' },
    { value: 'PANTS', label: '바지' },
    { value: 'SHOES', label: '신발' },
  ];

  const sortOptions = [
    { value: '', label: '정렬' },
    { value: 'latest', label: '최신순' },
    { value: 'price_asc', label: '가격 낮은순' },
    { value: 'price_desc', label: '가격 높은순' },
    { value: 'popular', label: '인기순' },
  ];

  const fetchProductImage = async (productId: number): Promise<string | undefined> => {
    try {
      const response = await fetch(`http://localhost:8080/api/products/${productId}/images`);
      if (response.ok) {
        const images: ProductImage[] = await response.json();
        const mainImage = images.find(img => img.main) || images[0];
        return mainImage ? `http://localhost:8080${mainImage.imageUrl}` : undefined;
      }
    } catch (error) {
      console.error('이미지 조회 실패:', error);
    }
    return undefined;
  };

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

      // 각 상품의 대표 이미지 가져오기
      const productsWithImages = await Promise.all(
        data.content.map(async (product) => {
          const mainImage = await fetchProductImage(product.id);
          return { ...product, mainImage };
        })
      );

      setProducts(productsWithImages);
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

  const getCategoryLabel = (categoryValue: string) => {
    const cat = categories.find(c => c.value === categoryValue);
    return cat ? cat.label : categoryValue;
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
                  {product.mainImage ? (
                    <img
                      src={product.mainImage}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">이미지 없음</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-xs text-blue-500 mb-1">{getCategoryLabel(product.productCategory)}</div>
                  <h3 className="font-semibold text-lg mb-1 truncate">{product.title}</h3>
                  <p className="text-blue-600 font-bold text-xl mb-2">{formatPrice(product.price)}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{product.sellerNickname}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.productStatus === 'ON_SALE'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
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
