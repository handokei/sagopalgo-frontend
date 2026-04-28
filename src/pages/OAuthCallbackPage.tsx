import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../lib/api';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      navigate('/login', { replace: true });
      return;
    }

    fetch(buildApiUrl('/api/auth/token?code=' + code), {
      method: 'POST',
    })
      .then((res) => {
        if (!res.ok) throw new Error('토큰 교환 실패');
        return res.json();
      })
      .then((result) => {
        const data = result.data;
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        navigate('/', { replace: true });
      })
      .catch(() => {
        navigate('/login', { replace: true });
      });
  }, [navigate]);

  return null;
}
