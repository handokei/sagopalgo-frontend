import { useState } from 'react';
import { Link } from 'react-router-dom';
import { buildApiUrl } from '../lib/api';

const socialProviders = [
  { id: 'google', label: 'Google 계정으로 시작', color: 'border-line hover:bg-paper-warm' },
  { id: 'kakao', label: 'Kakao 계정으로 시작', color: 'bg-[#FEE500] border-[#FEE500] text-[#191919] hover:bg-[#F5DC00]' },
  { id: 'naver', label: 'Naver 계정으로 시작', color: 'bg-[#03C75A] border-[#03C75A] text-paper hover:bg-[#02b351]' },
];

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [smsMessage, setSmsMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!phoneNumber.match(/^01[0-9]{8,9}$/)) {
      setSmsMessage('올바른 전화번호를 입력해주세요. (예: 01012345678)');
      return;
    }

    try {
      const response = await fetch(buildApiUrl('/api/sms/send'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || '인증번호 발송 실패');
      }

      setIsCodeSent(true);
      setSmsMessage('인증번호가 발송되었습니다.');
    } catch (err) {
      setSmsMessage(err instanceof Error ? err.message : '인증번호 발송에 실패했습니다.');
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setSmsMessage('인증번호를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(buildApiUrl('/api/sms/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code: verificationCode }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || '인증 실패');
      }

      setIsVerified(true);
      setSmsMessage('인증이 완료되었습니다.');
    } catch (err) {
      setSmsMessage(err instanceof Error ? err.message : '인증에 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!isVerified) {
      setError('전화번호 인증을 완료해주세요.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(buildApiUrl('/api/users/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword, name, nickname, phoneNumber, userRole: 'ROLE_USER' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || '회원가입 실패');
      }

      window.location.href = '/login';
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
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
        <h1 className="text-[24px] font-bold text-center tracking-tightish mb-6">회원가입</h1>

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
            <label className="block text-[13px] text-ink-soft mb-1">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-[14px] border border-line rounded-sm focus:outline-none focus:border-ink"
              placeholder="이름 (2~10글자)"
              minLength={2}
              maxLength={10}
              required
            />
          </div>

          <div>
            <label className="block text-[13px] text-ink-soft mb-1">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2 text-[14px] border border-line rounded-sm focus:outline-none focus:border-ink"
              placeholder="닉네임 (2~10글자)"
              minLength={2}
              maxLength={10}
              required
            />
          </div>

          {/* 전화번호 + SMS 인증 */}
          <div>
            <label className="block text-[13px] text-ink-soft mb-1">전화번호</label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                className="flex-1 px-3 py-2 text-[14px] border border-line rounded-sm focus:outline-none focus:border-ink disabled:bg-paper-muted"
                placeholder="01012345678"
                maxLength={11}
                disabled={isVerified}
                required
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={isVerified || !phoneNumber}
                className="btn text-[12px] px-3 py-2 whitespace-nowrap disabled:opacity-40"
              >
                {isCodeSent ? '재발송' : '인증번호 발송'}
              </button>
            </div>
          </div>

          {isCodeSent && !isVerified && (
            <div>
              <label className="block text-[13px] text-ink-soft mb-1">인증번호</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="flex-1 px-3 py-2 text-[14px] border border-line rounded-sm focus:outline-none focus:border-ink"
                  placeholder="인증번호 입력"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  className="btn text-[12px] px-3 py-2 whitespace-nowrap"
                >
                  확인
                </button>
              </div>
            </div>
          )}

          {smsMessage && (
            <p className={`text-[12px] ${isVerified ? 'text-green-600' : 'text-ink-soft'}`}>
              {smsMessage}
            </p>
          )}

          <div>
            <label className="block text-[13px] text-ink-soft mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-[14px] border border-line rounded-sm focus:outline-none focus:border-ink"
              placeholder="8글자 이상, 대소문자/숫자/특수문자 포함"
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="block text-[13px] text-ink-soft mb-1">비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-[14px] border border-line rounded-sm focus:outline-none focus:border-ink"
              placeholder="비밀번호 다시 입력"
              required
            />
          </div>

          {error && <p className="text-[12px] text-accent">{error}</p>}

          <button
            type="submit"
            disabled={!isVerified || loading}
            className="btn-primary w-full py-2.5 text-[14px] disabled:opacity-40"
          >
            {loading ? '가입 중...' : '회원가입'}
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
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-ink hover:underline">로그인</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
