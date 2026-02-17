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

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  const fetchCart = async () => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);

    if (!token) {
      setLoading(false);
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
      const items = data.content || [];

      // 각 상품의 이미지 가져오기
      const itemsWithImages = await Promise.all(
        items.map(async (item: CartItem) => {
          const mainImage = await fetchProductImage(item.productId);
          return { ...item, mainImage };
        })
      );

      setCartItems(itemsWithImages);
    } catch (error) {
      console.error('장바구니 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const token = localStorage.getItem('accessToken');
    try {
      await fetch(`http://localhost:8080/api/carts/me/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      setCartItems(cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('수량 변경 실패:', error);
    }
  };

  const removeItem = async (itemId: number) => {
    const token = localStorage.getItem('accessToken');
    try {
      await fetch(`http://localhost:8080/api/carts/me/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0
  );

  const handleOrder = () => {
    if (cartItems.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }
    navigate('/order');
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
        <h1 className="text-2xl font-bold mb-6">장바구니</h1>

        {!isLoggedIn ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">로그인하면 장바구니를 이용할 수 있습니다.</p>
            <a href="/login" className="text-blue-500 hover:underline">로그인하기</a>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">장바구니가 비어있습니다.</p>
            <a href="/" className="text-blue-500 hover:underline">쇼핑하러 가기</a>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-4 flex items-center gap-4 ${
                    index !== cartItems.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                    {item.mainImage ? (
                      <img src={item.mainImage} alt={item.productTitle} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-xs">이미지</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <a
                      href={`/products/${item.productId}`}
                      className="font-semibold hover:text-blue-600"
                    >
                      {item.productTitle}
                    </a>
                    <p className="text-blue-600 font-bold">{formatPrice(item.productPrice)}</p>
                  </div>

                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 border-x">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <p className="w-28 text-right font-bold">
                    {formatPrice(item.productPrice * item.quantity)}
                  </p>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg">총 결제금액</span>
                <span className="text-2xl font-bold text-blue-600">{formatPrice(totalPrice)}</span>
              </div>
              <button
                onClick={handleOrder}
                className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-lg font-semibold"
              >
                주문하기
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
