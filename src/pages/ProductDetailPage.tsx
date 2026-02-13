import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  title: string;
  contents: string;
  price: number;
  stock: number;
  productStatus: string;
  productCategory: string;
  sellerNickname: string;
  createdAt: string;
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`http://localhost:8080/api/products/${id}`, {
          headers,
        });

        if (!response.ok) {
          throw new Error('상품을 찾을 수 없습니다.');
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError('상품을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/carts/me/items', {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span>로딩 중...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error || '상품을 찾을 수 없습니다.'}</p>
        <a href="/" className="text-blue-500 hover:underline">홈으로 돌아가기</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-blue-600">사고팔고</a>
          <div className="space-x-4">
            <a href="/login" className="text-gray-600 hover:text-blue-600">로그인</a>
            <a href="/register" className="text-gray-600 hover:text-blue-600">회원가입</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 h-96 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-xl">상품 이미지</span>
            </div>

            <div className="md:w-1/2 p-8">
              <div className="mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                  {product.productCategory}
                </span>
                <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
                  product.productStatus === 'ON_SALE'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {product.productStatus === 'ON_SALE' ? '판매중' : '판매완료'}
                </span>
              </div>

              <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
              <p className="text-3xl font-bold text-blue-600 mb-6">{formatPrice(product.price)}</p>

              <div className="border-t border-b py-4 mb-6 space-y-2 text-gray-600">
                <p>판매자: {product.sellerNickname}</p>
                <p>재고: {product.stock}개</p>
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
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.productStatus !== 'ON_SALE'}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  장바구니 담기
                </button>
                <button
                  disabled={product.productStatus !== 'ON_SALE'}
                  className="flex-1 py-3 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  바로 구매
                </button>
              </div>
            </div>
          </div>

          <div className="p-8 border-t">
            <h2 className="text-xl font-bold mb-4">상품 설명</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{product.contents}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetailPage;
