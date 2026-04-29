import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { buildApiUrl } from '../lib/api';

interface User {
  id: number;
  email: string;
  nickname: string;
  createdAt: string;
}

const menuItems = [
  { label: '주문/배송', to: '/orders' },
  { label: '찜한 상품', to: '/likes' },
  { label: '내 상품', to: '/my/products' },
  { label: '장바구니', to: '/cart' },
];

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
      if (!token) { navigate('/login'); return; }

      try {
        const response = await fetch(buildApiUrl('/api/users/me'), {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        setUser(data);
        setNickname(data.nickname);
      } catch {
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
      const response = await fetch(buildApiUrl('/api/users/me'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nickname }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setUser(data);
      setEditing(false);
      alert('프로필이 수정되었습니다.');
    } catch {
      setError('프로필 수정에 실패했습니다.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  if (loading) {
    return <Layout><div className="flex items-center justify-center py-20 text-ink-faint">로딩 중...</div></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-content mx-auto px-8 py-8">
        <div className="grid grid-cols-[280px_1fr] gap-10">
          {/* 사이드바 */}
          <aside>
            {/* 프로필 */}
            <div className="mb-6 pb-6 border-b border-line">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-full bg-paper-warm border border-line flex items-center justify-center text-[18px] text-ink-faint">
                  {user?.nickname?.charAt(0) ?? '?'}
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-ink">{user?.nickname} 님</p>
                  <p className="text-[12px] text-ink-faint">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* 메뉴 */}
            <nav className="space-y-0.5">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block py-2.5 px-2 text-[14px] text-ink-soft hover:text-ink hover:bg-paper-warm rounded-sm"
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-line my-2" />
              <Link
                to="/products/create"
                className="block py-2.5 px-2 text-[14px] text-ink-soft hover:text-ink hover:bg-paper-warm rounded-sm"
              >
                상품 등록
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2.5 px-2 text-[14px] text-ink-faint hover:text-ink hover:bg-paper-warm rounded-sm"
              >
                로그아웃
              </button>
            </nav>
          </aside>

          {/* 메인 콘텐츠 */}
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tightish mb-8">마이페이지</h1>

            {/* 회원 정보 */}
            <section className="border border-line bg-paper p-6 mb-8">
              <h2 className="text-[16px] font-semibold mb-4">회원 정보</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="w-20 text-[13px] text-ink-soft">이메일</span>
                  <span className="text-[14px]">{user?.email}</span>
                </div>

                <div className="flex items-center">
                  <span className="w-20 text-[13px] text-ink-soft">닉네임</span>
                  {editing ? (
                    <div className="flex gap-2 flex-1">
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-[14px] border border-line rounded-sm focus:outline-none focus:border-ink"
                      />
                      <button onClick={handleUpdate} className="btn-primary text-[12px] py-1.5 px-3">저장</button>
                      <button
                        onClick={() => { setEditing(false); setNickname(user?.nickname || ''); }}
                        className="btn text-[12px] py-1.5 px-3"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-[14px]">{user?.nickname}</span>
                      <button onClick={() => setEditing(true)} className="text-[12px] text-ink-faint hover:text-ink underline">
                        수정
                      </button>
                    </div>
                  )}
                </div>
                {error && <p className="text-[12px] text-accent ml-20">{error}</p>}

                <div className="flex items-center">
                  <span className="w-20 text-[13px] text-ink-soft">가입일</span>
                  <span className="text-[14px]">
                    {user?.createdAt && new Date(user.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </section>

            {/* 바로가기 */}
            <section>
              <h2 className="text-[16px] font-semibold mb-4">바로가기</h2>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: '주문내역', to: '/orders', icon: '주문' },
                  { label: '장바구니', to: '/cart', icon: '카트' },
                  { label: '찜 목록', to: '/likes', icon: '찜' },
                  { label: '내 상품', to: '/my/products', icon: '상품' },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="border border-line p-4 text-center hover:bg-paper-warm transition-colors"
                  >
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-paper-warm border border-line flex items-center justify-center text-[11px] font-mono text-ink-soft">
                      {item.icon}
                    </div>
                    <span className="text-[13px] text-ink">{item.label}</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyPage;
