'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = params.get('token');
    const refresh = params.get('refresh');
    if (token && refresh) {
      localStorage.setItem('accessToken', token);
      authApi.me().then((user) => {
        setAuth(user, token, refresh);
        router.push('/dashboard');
      }).catch(() => router.push('/login'));
    } else {
      router.push('/login');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">⟳</div>
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
}
