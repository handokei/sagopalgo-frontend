import { useState } from 'react';
import { Link } from 'react-router-dom';
import { buildApiUrl } from '../lib/api';

const socialProviders = [
  { id: 'google', label: 'Google 계정으로 로그인', color: 'border-line hover:bg-paper-warm' },
  { id: 'kakao', label: 'Kakao 계정으로 로그인', color: 'bg-[#FEE500] border-[#FEE500] text-[#191919] hover:bg-[#F5DC00]' },
  { id: 'naver', label: 'Naver 계정으로 로그인', color: 'bg-[#03C75A] border-[#03C75A] text-paper hover:bg-[#02b351]' },
];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl('/api/users/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || '로그인 실패');
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      window.location.href = '/';
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError(err instanceof Error ? err.message : '이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    window.location.href = buildApiUrl(`/oauth2/authorization/${provider}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper-warm">
      <div className="bg-paper border border-line p-8 w-full max-w-md">
        <h1 className="text-[24px] font-bold text-center tracking-tightish mb-6">사고팔고</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] text-ink-soft mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-[14px] border border-line rounded-sm focus:outline-none focus:border-ink"
              placeholder="example@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] text-ink-soft mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-[14px] border border-line rounded-sm focus:outline-none focus:border-ink"
              placeholder="비밀번호 입력"
              required
            />
          </div>

          {error && <p className="text-[12px] text-accent">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 text-[14px] disabled:opacity-40"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 구분선 */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 border-t border-line" />
          <span className="text-[12px] text-ink-faint">또는</span>
          <div className="flex-1 border-t border-line" />
        </div>

        {/* 소셜 로그인 */}
        <div className="space-y-2">
          {socialProviders.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleSocialLogin(provider.id)}
              className={`w-full py-2.5 text-[13px] font-medium border rounded-sm transition-colors ${provider.color}`}
            >
              {provider.label}
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-[13px] text-ink-faint">
          계정이 없으신가요?{' '}
          <Link to="/register" className="text-ink hover:underline">회원가입</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
