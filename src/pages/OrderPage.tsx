import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

interface ProductImage {
  id: number;
  imageUrl: string;
  main: boolean;
}

interface CartItem {
  id: number;
  productId: number;
  productTitle: string;
  productPrice: number;
  quantity: number;
  mainImage?: string;
}

const OrderPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

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

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:8080/api/carts/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('장바구니 조회 실패');
        }

        const data = await response.json();
        if (!data.content || data.content.length === 0) {
          alert('장바구니가 비어있습니다.');
          navigate('/cart');
          return;
        }

        // 각 상품의 이미지 가져오기
        const itemsWithImages = await Promise.all(
          data.content.map(async (item: CartItem) => {
            const mainImage = await fetchProductImage(item.productId);
            return { ...item, mainImage };
          })
        );

        setCartItems(itemsWithImages);
      } catch (error) {
        console.error('장바구니 조회 실패:', error);
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0
  );

  const handleSubmitOrder = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!name.trim() || !phoneNumber.trim() || !address.trim()) {
      alert('배송 정보를 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          name,
          phoneNumber,
          address,
        }),
      });

      if (!response.ok) {
        throw new Error('주문 실패');
      }

      alert('주문이 완료되었습니다.');
      navigate('/orders');
    } catch (error) {
      alert('주문에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">주문하기</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="font-semibold">주문 상품</h2>
          </div>
          {cartItems.map((item, index) => (
            <div
              key={item.id}
              className={`p-4 flex items-center gap-4 ${
                index !== cartItems.length - 1 ? 'border-b' : ''
              }`}
            >
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                {item.mainImage ? (
                  <img src={item.mainImage} alt={item.productTitle} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs">이미지</span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{item.productTitle}</p>
                <p className="text-sm text-gray-500">수량: {item.quantity}개</p>
              </div>
              <p className="font-bold">{formatPrice(item.productPrice * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="font-semibold mb-4">배송 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">수령인</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="수령인 이름을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">배송지 주소</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="배송지 주소를 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="font-semibold mb-4">결제 정보</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">상품 금액</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">배송비</span>
              <span>무료</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>총 결제금액</span>
                <span className="text-blue-600">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/cart')}
            className="flex-1 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmitOrder}
            disabled={submitting}
            className="flex-1 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {submitting ? '처리 중...' : '결제하기'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default OrderPage;
