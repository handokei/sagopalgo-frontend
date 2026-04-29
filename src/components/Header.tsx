import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-paper sticky top-0 z-50 border-b border-line">
      {/* 유틸리티 바 */}
      <div className="border-b border-line-soft">
        <div className="max-w-content mx-auto px-8 flex items-center justify-between h-8 text-[11px] text-ink-faint">
          <div className="flex gap-4">
            <span>고객센터</span>
          </div>
          <div className="flex gap-4">
            {isLoggedIn ? (
              <>
                <Link to="/mypage" className="hover:text-ink">마이페이지</Link>
                <button onClick={handleLogout} className="hover:text-ink">로그아웃</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-ink">로그인</Link>
                <Link to="/register" className="hover:text-ink">회원가입</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 메인 바: 로고 + 검색 + 아이콘 */}
      <div className="max-w-content mx-auto px-8 flex items-center gap-8 h-14">
        <Link to="/" className="text-[22px] font-bold tracking-tight2 text-ink whitespace-nowrap">
          사고팔고
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색"
            className="w-full pl-4 pr-10 py-2 text-[13px] border border-line rounded-sm bg-paper-muted focus:outline-none focus:border-ink"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink">
            ⌕
          </button>
        </form>

        <nav className="flex items-center gap-5 text-[13px] text-ink whitespace-nowrap">
          {isLoggedIn && (
            <>
              <Link to="/likes" className="hover:text-ink-soft" title="찜">♡</Link>
              <Link to="/cart" className="hover:text-ink-soft" title="장바구니">장바구니</Link>
              <Link to="/my/products" className="hover:text-ink-soft" title="내 상품">내 상품</Link>
            </>
          )}
        </nav>
      </div>

      {/* 카테고리 네비게이션 */}
      <div className="border-t border-line-soft">
        <div className="max-w-content mx-auto px-8 flex items-center gap-6 h-10 text-[13px] font-medium">
          <Link to="/" className="text-ink hover:text-accent">홈</Link>
          <Link to="/products" className="text-ink-soft hover:text-ink">추천</Link>
          <Link to="/products?sort=likes_count" className="text-ink-soft hover:text-ink">랭킹</Link>
          <Link to="/products?sort=latest" className="text-ink-soft hover:text-ink">신상품</Link>
          {isLoggedIn && (
            <Link to="/orders" className="text-ink-soft hover:text-ink">주문내역</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
