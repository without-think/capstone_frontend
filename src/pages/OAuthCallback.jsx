import { useEffect } from 'react';

const OAuthCallback = ({ onSuccess }) => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('jwt_token', token);
    }

    onSuccess();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F4]">
      <p className="text-stone-500 text-lg">로그인 중...</p>
    </div>
  );
};

export default OAuthCallback;
