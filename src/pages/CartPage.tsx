import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { buildApiUrl } from '../lib/api';
import { krw } from '../lib/format';

interface CartItem {
  id: number;
  productId: number;
  productTitle: string;
  productPrice: number;
  quantity: number;
  mainImage?: string;
}

interface ProductImage {
  id: number;
  imageUrl: string;
  main: boolean;
}

const fetchItemImage = async (productId: number): Promise<string | undefined> => {
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

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!localStorage.getItem('accessToken');

  const fetchCart = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoading(false); return; }

    try {
      const response = await fetch(buildApiUrl('/api/carts/me'), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      const items: CartItem[] = data.content || [];

      const itemsWithImages = await Promise.all(
        items.map(async (item) => {
          const mainImage = await fetchItemImage(item.productId);
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

  useEffect(() => { fetchCart(); }, []);

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const token = localStorage.getItem('accessToken');
    try {
      await fetch(buildApiUrl(`/api/carts/me/items/${itemId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      setCartItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
    } catch (error) {
      console.error('수량 변경 실패:', error);
    }
  };

  const removeItem = async (itemId: number) => {
    const token = localStorage.getItem('accessToken');
    try {
      await fetch(buildApiUrl(`/api/carts/me/items/${itemId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);

  const handleOrder = () => {
    if (cartItems.length === 0) { alert('장바구니가 비어있습니다.'); return; }
    navigate('/order');
  };

  if (loading) {
    return <Layout><div className="flex items-center justify-center py-20 text-ink-faint">로딩 중...</div></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-content mx-auto px-8 py-8">
        <h1 className="text-[28px] font-extrabold tracking-tightish mb-2">장바구니</h1>

        {/* 진행 단계 */}
        <div className="flex items-center gap-2 text-[12px] text-ink-faint mb-8">
          <span className="text-ink font-semibold">① 장바구니</span>
          <span>——</span>
          <span>② 주문/결제</span>
          <span>——</span>
          <span>③ 완료</span>
        </div>

        {!isLoggedIn ? (
          <div className="text-center py-20">
            <p className="text-ink-faint mb-4">로그인하면 장바구니를 이용할 수 있습니다.</p>
            <Link to="/login" className="btn-primary">로그인하기</Link>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-ink-faint mb-4">장바구니가 비어있습니다.</p>
            <Link to="/" className="btn">쇼핑하러 가기</Link>
          </div>
        ) : (
          <div className="grid grid-cols-[1.6fr_1fr] gap-8 items-start">
            {/* 장바구니 아이템 */}
            <div>
              <div className="flex items-center justify-between text-[13px] mb-3 pb-3 border-b border-line">
                <span className="text-ink-soft">전체 ({cartItems.length})</span>
                <button
                  onClick={() => {
                    if (confirm('전체 삭제하시겠습니까?')) {
                      cartItems.forEach(item => removeItem(item.id));
                    }
                  }}
                  className="text-ink-faint hover:text-ink"
                >
                  전체삭제
                </button>
              </div>

              <div className="space-y-0">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 border-b border-line-soft">
                    {/* 이미지 */}
                    <Link to={`/products/${item.productId}`} className="w-[100px] h-[100px] shrink-0">
                      {item.mainImage ? (
                        <img src={buildApiUrl(item.mainImage)} alt="" className="w-full h-full object-cover border border-line" />
                      ) : (
                        <div className="img-ph w-full h-full flex items-center justify-center">
                          <span className="text-[10px] font-mono text-ink-faint">img</span>
                        </div>
                      )}
                    </Link>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.productId}`} className="text-[14px] font-medium text-ink hover:underline line-clamp-1">
                        {item.productTitle}
                      </Link>
                      <p className="text-[15px] font-bold text-ink mt-1">{krw(item.productPrice)}</p>

                      {/* 수량 */}
                      <div className="inline-flex items-center border border-line rounded-sm mt-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-[12px] hover:bg-paper-warm"
                        >
                          −
                        </button>
                        <span className="w-8 h-7 flex items-center justify-center text-[12px] font-medium border-x border-line">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-[12px] hover:bg-paper-warm"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* 소계 + 삭제 */}
                    <div className="flex flex-col items-end justify-between">
                      <button onClick={() => removeItem(item.id)} className="text-[12px] text-ink-faint hover:text-ink">
                        ✕
                      </button>
                      <p className="text-[14px] font-bold">{krw(item.productPrice * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 주문 요약 사이드바 */}
            <div className="sticky top-28 border border-line bg-paper p-6">
              <h3 className="text-[16px] font-semibold mb-4">주문 요약</h3>
              <div className="space-y-2 text-[13px] mb-4 pb-4 border-b border-line">
                <div className="flex justify-between">
                  <span className="text-ink-soft">상품 금액</span>
                  <span>{krw(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft">배송비</span>
                  <span>무료</span>
                </div>
              </div>
              <div className="flex justify-between text-[16px] font-bold mb-6">
                <span>합계</span>
                <span>{krw(totalPrice)}</span>
              </div>
              <button onClick={handleOrder} className="btn-primary w-full py-3 text-[14px]">
                주문하기 ({cartItems.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
