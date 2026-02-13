import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  email: string;
  nickname: string;
  createdAt: string;
}

const MyPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:8080/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('사용자 정보 조회 실패');
        }

        const data = await response.json();
        setUser(data);
        setNickname(data.nickname);
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        localStorage.removeItem('accessToken');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleUpdate = async () => {
    const token = localStorage.getItem('accessToken');
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ nickname }),
      });

      if (!response.ok) {
        throw new Error('수정 실패');
      }

      const data = await response.json();
      setUser(data);
      setEditing(false);
      alert('프로필이 수정되었습니다.');
    } catch (error) {
      setError('프로필 수정에 실패했습니다.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
            <a href="/cart" className="text-gray-600 hover:text-blue-600">장바구니</a>
            <a href="/orders" className="text-gray-600 hover:text-blue-600">주문내역</a>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">마이페이지</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">내 정보</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">이메일</label>
              <p className="text-gray-900">{user?.email}</p>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">닉네임</label>
              {editing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setNickname(user?.nickname || '');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-gray-900">{user?.nickname}</p>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-blue-500 hover:underline text-sm"
                  >
                    수정
                  </button>
                </div>
              )}
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">가입일</label>
              <p className="text-gray-900">{user?.createdAt && formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">바로가기</h2>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/orders"
              className="p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <span className="block text-2xl mb-1">📦</span>
              <span className="text-gray-700">주문 내역</span>
            </a>
            <a
              href="/cart"
              className="p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <span className="block text-2xl mb-1">🛒</span>
              <span className="text-gray-700">장바구니</span>
            </a>
            <a
              href="/likes"
              className="p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <span className="block text-2xl mb-1">❤️</span>
              <span className="text-gray-700">찜 목록</span>
            </a>
            <a
              href="/my/products"
              className="p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <span className="block text-2xl mb-1">🏷️</span>
              <span className="text-gray-700">내 상품</span>
            </a>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3 border border-red-500 text-red-500 rounded-md hover:bg-red-50"
        >
          로그아웃
        </button>
      </main>
    </div>
  );
};

export default MyPage;
