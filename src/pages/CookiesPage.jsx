import React, { useState } from 'react';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import { saveCookies } from '../services/api';
import { useSession } from '../context/SessionContext';

export default function CookiesPage() {
  const [cookies, setCookies] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user, clearSession } = useSession();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await saveCookies({ cookies });
      setMessage('Cookies saved successfully.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to save cookies.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar user={user} onLogout={clearSession} showAdminLink={user?.role === 'HOD'} />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft sm:p-10">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">LinkedIn Cookies</h1>
            <p className="mt-2 text-sm text-slate-500">Paste the cookies required by the backend extraction job.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Cookies</span>
              <textarea
                value={cookies}
                onChange={(event) => setCookies(event.target.value)}
                rows={10}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                placeholder="Paste LinkedIn cookies here"
              />
            </label>

            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}

            <Button type="submit" disabled={loading}>
              {loading ? <LoadingSpinner label="Saving" /> : 'Save Cookies'}
            </Button>
          </form>
        </section>
      </main>
    </div>
  );
}