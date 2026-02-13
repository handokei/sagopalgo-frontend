import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LikedProduct {
  id: number;
  productId: number;
  productTitle: string;
  productPrice: number;
  productStatus: string;
}

const LikesPage = () => {
  const navigate = useNavigate();
  const [likes, setLikes] = useState<LikedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikes = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:8080/api/likes', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('찜 목록 조회 실패');
        }

        const data = await response.json();
        setLikes(data.content || []);
      } catch (error) {
        console.error('찜 목록 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, [navigate]);

  const handleUnlike = async (likeId: number) => {
    const token = localStorage.getItem('accessToken');
    try {
      await fetch(`http://localhost:8080/api/likes/${likeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setLikes(likes.filter(like => like.id !== likeId));
    } catch (error) {
      console.error('찜 해제 실패:', error);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span>로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-blue-600">사고팔고</a>
          <div className="space-x-4">
            <a href="/" className="text-gray-600 hover:text-blue-600">홈</a>
            <a href="/mypage" className="text-gray-600 hover:text-blue-600">마이페이지</a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
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
                    <span className="text-gray-400">이미지</span>
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
                      onClick={() => handleUnlike(like.id)}
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
      </main>
    </div>
  );
};

export default LikesPage;
