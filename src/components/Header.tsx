import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-blue-600">사고팔고</a>

        <nav className="flex items-center space-x-6">
          {isLoggedIn ? (
            <>
              <a href="/my/products" className="text-gray-600 hover:text-blue-600">내 상품</a>
              <a href="/likes" className="text-gray-600 hover:text-blue-600">찜</a>
              <a href="/cart" className="text-gray-600 hover:text-blue-600">장바구니</a>
              <a href="/orders" className="text-gray-600 hover:text-blue-600">주문내역</a>
              <a href="/mypage" className="text-gray-600 hover:text-blue-600">마이페이지</a>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-500"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="text-gray-600 hover:text-blue-600">로그인</a>
              <a href="/register" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                회원가입
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
