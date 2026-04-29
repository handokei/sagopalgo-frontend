import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { buildApiUrl } from '../lib/api';
import { krw } from '../lib/format';

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
  const [activeTab, setActiveTab] = useState('detail');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(buildApiUrl(`/api/products/${id}`), { headers });
        if (!response.ok) throw new Error('상품을 찾을 수 없습니다.');
        const data = await response.json();
        setProduct(data);

        const imagesResponse = await fetch(buildApiUrl(`/api/products/${id}/images`));
        if (imagesResponse.ok) setImages(await imagesResponse.json());

        if (token) checkLikeStatus(token);
      } catch {
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
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
      }
    } catch {
      // ignore
    }
  };

  const handleToggleLike = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { navigate('/login'); return; }
    setLikeLoading(true);
    try {
      const response = await fetch(buildApiUrl(`/api/products/${id}/likes`), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
      }
    } catch {
      // ignore
    } finally {
      setLikeLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { navigate('/login'); return; }
    try {
      const response = await fetch(buildApiUrl('/api/carts/me/items'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ productId: product?.id, quantity }),
      });
      if (!response.ok) throw new Error();
      alert('장바구니에 추가되었습니다.');
    } catch {
      alert('장바구니 추가에 실패했습니다.');
    }
  };

  const isOutOfStock = product?.stockStatus === 'OUT_OF_STOCK' || product?.productStatus !== 'ON_SALE';
  const tabs = [
    { key: 'detail', label: '상세 정보' },
    { key: 'review', label: '리뷰' },
    { key: 'qna', label: 'Q&A' },
    { key: 'return', label: '반품/교환' },
  ];

  if (loading) {
    return <Layout><div className="flex items-center justify-center py-20 text-ink-faint">로딩 중...</div></Layout>;
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-ink-soft mb-4">{error || '상품을 찾을 수 없습니다.'}</p>
          <Link to="/" className="text-[13px] text-ink-soft hover:text-ink underline">홈으로 돌아가기</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-content mx-auto px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-ink-faint mb-6">
          <Link to="/" className="hover:text-ink">홈</Link>
          <span>›</span>
          <Link to="/products" className="hover:text-ink">{product.categoryName}</Link>
          <span>›</span>
          <span className="text-ink">{product.title}</span>
        </div>

        {/* 메인: 이미지 + 상품 정보 */}
        <div className="grid grid-cols-[1.2fr_1fr] gap-10 mb-12">
          {/* 이미지 갤러리 */}
          <div>
            <div className="aspect-square bg-paper-warm border border-line overflow-hidden mb-2">
              {images.length > 0 ? (
                <img
                  src={buildApiUrl(images[selectedImageIndex].imageUrl)}
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="img-ph w-full h-full flex items-center justify-center">
                  <span className="text-[11px] font-mono text-ink-faint">상품 이미지</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square border overflow-hidden ${
                      selectedImageIndex === index ? 'border-ink border-2' : 'border-line hover:border-ink-soft'
                    }`}
                  >
                    <img src={buildApiUrl(image.imageUrl)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 상품 정보 */}
          <div>
            <p className="text-[11px] font-mono tracking-[0.08em] uppercase text-ink-soft mb-2">
              {product.sellerNickname}
            </p>
            <h1 className="text-[28px] font-bold tracking-tightish mb-3">{product.title}</h1>

            {/* 가격 */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-[24px] font-bold text-ink">{krw(product.price)}</span>
              {product.stockStatus === 'LOW_STOCK' && (
                <span className="text-[12px] text-accent font-medium">품절 임박</span>
              )}
              {product.stockStatus === 'OUT_OF_STOCK' && (
                <span className="text-[12px] text-ink-faint font-medium">품절</span>
              )}
            </div>

            <div className="border-t border-line my-5" />

            {/* 수량 */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[13px] text-ink-soft w-12">수량</span>
              <div className="inline-flex items-center border border-line rounded-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-[13px] hover:bg-paper-warm"
                >
                  −
                </button>
                <span className="w-10 h-8 flex items-center justify-center text-[13px] font-medium border-x border-line">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-[13px] hover:bg-paper-warm"
                >
                  +
                </button>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleToggleLike}
                disabled={likeLoading}
                className={`btn flex-1 ${isLiked ? 'text-accent border-accent' : ''}`}
              >
                {isLiked ? '♥ 찜' : '♡ 찜'}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn flex-[2] disabled:opacity-40"
              >
                {isOutOfStock ? '품절' : '장바구니'}
              </button>
              <button
                disabled={isOutOfStock}
                className="btn-primary flex-[2] disabled:opacity-40"
              >
                {isOutOfStock ? '품절' : '바로 구매'}
              </button>
            </div>

            {/* 배송 정보 */}
            <div className="bg-paper-muted border border-line p-4 text-[13px] text-ink-soft">
              <p className="font-medium text-ink mb-2">배송 / 반품</p>
              <ul className="space-y-1">
                <li>· 무료배송</li>
                <li>· 평균 1.8일 도착</li>
                <li>· 30일 무료 반품</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-line mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`tab ${activeTab === t.key ? 'tab-active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="min-h-[320px] mb-12">
          {activeTab === 'detail' && (
            <div className="text-[14px] text-ink leading-relaxed whitespace-pre-wrap">
              {product.contents}
            </div>
          )}
          {activeTab === 'review' && (
            <div className="text-center py-16 text-ink-faint">리뷰가 없습니다.</div>
          )}
          {activeTab === 'qna' && (
            <div className="text-center py-16 text-ink-faint">Q&A가 없습니다.</div>
          )}
          {activeTab === 'return' && (
            <div className="text-[14px] text-ink-soft leading-relaxed">
              <p className="mb-2">· 상품 수령 후 30일 이내 무료 반품 가능</p>
              <p className="mb-2">· 고객 변심 반품 시 왕복 배송비 부담</p>
              <p>· 상품 하자 시 전액 환불</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
