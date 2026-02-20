import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { buildApiUrl } from '../lib/api';

interface ProductImage {
  id: number;
  imageUrl: string;
  main: boolean;
}

interface LikedProduct {
  id: number;
  productId: number;
  productTitle: string;
  productPrice: number;
  productStatus: string;
  mainImage?: string;
}

const LikesPage = () => {
  const navigate = useNavigate();
  const [likes, setLikes] = useState<LikedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProductImage = async (productId: number): Promise<string | undefined> => {
    try {
      const response = await fetch(buildApiUrl(`/api/products/${productId}/images`));
      if (response.ok) {
        const images: ProductImage[] = await response.json();
        const mainImage = images.find(img => img.main) || images[0];
        return mainImage ? buildApiUrl(mainImage.imageUrl) : undefined;
      }
    } catch (error) {
      console.error('이미지 조회 실패:', error);
    }
    return undefined;
  };

  useEffect(() => {
    const fetchLikes = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(buildApiUrl('/api/products/me/likes'), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('찜 목록 조회 실패');
        }

        const data = await response.json();
        const likesData = data.content || [];

        // 각 상품의 대표 이미지 가져오기
        const likesWithImages = await Promise.all(
          likesData.map(async (like: LikedProduct) => {
            const mainImage = await fetchProductImage(like.productId);
            return { ...like, mainImage };
          })
        );

        setLikes(likesWithImages);
      } catch (error) {
        console.error('찜 목록 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, [navigate]);

  const handleUnlike = async (productId: number) => {
    const token = localStorage.getItem('accessToken');
    try {
      await fetch(buildApiUrl(`/api/products/${productId}/likes`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setLikes(likes.filter(like => like.productId !== productId));
    } catch (error) {
      console.error('찜 해제 실패:', error);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
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
        <h1 className="text-2xl font-bold mb-6">찜 목록</h1>

        {likes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">찜한 상품이 없습니다.</p>
            <a href="/" className="text-blue-500 hover:underline">상품 둘러보기</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {likes.map((like) => (
              <div
                key={like.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <a href={`/products/${like.productId}`}>
                  <div className="h-40 bg-gray-200 flex items-center justify-center">
                    {like.mainImage ? (
                      <img
                        src={like.mainImage}
                        alt={like.productTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">이미지 없음</span>
                    )}
                  </div>
                </a>
                <div className="p-4">
                  <a
                    href={`/products/${like.productId}`}
                    className="font-semibold hover:text-blue-600 block mb-1"
                  >
                    {like.productTitle}
                  </a>
                  <p className="text-blue-600 font-bold text-lg mb-3">
                    {formatPrice(like.productPrice)}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm px-2 py-1 rounded ${
                      like.productStatus === 'ON_SALE'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {like.productStatus === 'ON_SALE' ? '판매중' : '판매완료'}
                    </span>
                    <button
                      onClick={() => handleUnlike(like.productId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ♥ 찜 해제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LikesPage;
