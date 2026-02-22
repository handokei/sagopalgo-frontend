import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { buildApiUrl } from '../lib/api';

interface Product {
  id: number;
  title: string;
  contents: string;
  price: number;
  stock: number;
  productStatus: string;
  categoryId: number;
  categoryName: string;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  sellerNickname: string;
  createdAt: string;
}

interface ProductImage {
  id: number;
  imageUrl: string;
  originalFileName: string;
  sortOrder: number;
  main: boolean;
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(buildApiUrl(`/api/products/${id}`), {
          headers,
        });

        if (!response.ok) {
          throw new Error('상품을 찾을 수 없습니다.');
        }

        const data = await response.json();
        setProduct(data);

        // 이미지 조회
        const imagesResponse = await fetch(buildApiUrl(`/api/products/${id}/images`));
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          setImages(imagesData);
        }

        // 찜 여부 확인
        if (token) {
          checkLikeStatus(token);
        }
      } catch (err) {
        setError('상품을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const checkLikeStatus = async (token: string) => {
    try {
      const response = await fetch(buildApiUrl(`/api/products/${id}/likes/check`), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
      }
    } catch (err) {
      console.error('찜 상태 확인 실패:', err);
    }
  };

  const handleToggleLike = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    setLikeLoading(true);

    try {
      const response = await fetch(buildApiUrl(`/api/products/${id}/likes`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
      }
    } catch (err) {
      console.error('찜 토글 실패:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(buildApiUrl('/api/carts/me/items'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product?.id,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error('장바구니 추가 실패');
      }

      alert('장바구니에 추가되었습니다.');
    } catch (err) {
      alert('장바구니 추가에 실패했습니다.');
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const formatDate = (dateString: string | number[]) => {
    if (Array.isArray(dateString)) {
      // LocalDateTime array format: [year, month, day, hour, minute, second]
      const [year, month, day] = dateString;
      return `${year}. ${month}. ${day}.`;
    }
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <span>로딩 중...</span>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-red-500 mb-4">{error || '상품을 찾을 수 없습니다.'}</p>
          <a href="/" className="text-blue-500 hover:underline">홈으로 돌아가기</a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            {/* 이미지 영역 */}
            <div className="md:w-1/2">
              {images.length > 0 ? (
                <div>
                  <div className="h-96 bg-gray-100">
                    <img
                      src={buildApiUrl(images[selectedImageIndex].imageUrl)}
                      alt={product.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 p-4 overflow-x-auto">
                      {images.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                            selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={buildApiUrl(image.imageUrl)}
                            alt={`${product.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xl">상품 이미지</span>
                </div>
              )}
            </div>

            <div className="md:w-1/2 p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                    {product.categoryName}
                  </span>
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
                    product.productStatus === 'ON_SALE'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {product.productStatus === 'ON_SALE' ? '판매중' : '판매완료'}
                  </span>
                </div>
                <button
                  onClick={handleToggleLike}
                  disabled={likeLoading}
                  className={`text-2xl transition-colors ${
                    isLiked ? 'text-red-500' : 'text-gray-300 hover:text-red-300'
                  }`}
                >
                  {isLiked ? '♥' : '♡'}
                </button>
              </div>

              <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
              <div className="flex items-center gap-3 mb-6">
                <p className="text-3xl font-bold text-blue-600">{formatPrice(product.price)}</p>
                {product.stockStatus === 'LOW_STOCK' && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-600 text-sm font-semibold rounded">
                    품절 임박
                  </span>
                )}
                {product.stockStatus === 'OUT_OF_STOCK' && (
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded">
                    품절
                  </span>
                )}
              </div>

              <div className="border-t border-b py-4 mb-6 space-y-2 text-gray-600">
                <p>판매자: {product.sellerNickname}</p>
                <p>등록일: {formatDate(product.createdAt)}</p>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <label className="text-gray-700">수량:</label>
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.productStatus !== 'ON_SALE' || product.stockStatus === 'OUT_OF_STOCK'}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {product.stockStatus === 'OUT_OF_STOCK' ? '품절' : '장바구니 담기'}
                </button>
                <button
                  disabled={product.productStatus !== 'ON_SALE' || product.stockStatus === 'OUT_OF_STOCK'}
                  className="flex-1 py-3 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  {product.stockStatus === 'OUT_OF_STOCK' ? '품절' : '바로 구매'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-8 border-t">
            <h2 className="text-xl font-bold mb-4">상품 설명</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{product.contents}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
