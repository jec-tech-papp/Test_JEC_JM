import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export function LoginPage() {
  const { t } = useTranslation();
  const { login, isDemo } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/library');
    } catch {
      setError(t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-leaf-50 to-soil-50 px-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Leaf className="mx-auto h-12 w-12 text-leaf-600" />
          <h1 className="mt-3 text-3xl font-bold text-leaf-800">{t('app.name')}</h1>
          <p className="text-soil-500">{t('app.tagline')}</p>
        </div>

        {isDemo && (
          <div className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
            {t('auth.demoMode')}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-leaf-200 bg-white p-6 shadow-lg"
        >
          <h2 className="mb-4 text-xl font-semibold">{t('auth.login')}</h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('auth.email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-leaf-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('auth.password')}</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-leaf-200 px-3 py-2"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-leaf-600 py-2.5 font-medium text-white hover:bg-leaf-700 disabled:opacity-50"
          >
            {loading ? t('common.loading') : t('auth.loginButton')}
          </button>

          <p className="mt-4 text-center text-sm text-soil-500">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="font-medium text-leaf-600 hover:underline">
              {t('auth.register')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
