import React, { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import { downloadExcel, extractAlumni, getAlumni } from '../services/api';
import { useSession } from '../context/SessionContext';

const alumniColumns = [
  { key: 'name', label: 'Name' },
  { key: 'company', label: 'Company' },
  { key: 'year', label: 'Passout Year' },
];

const normalizeAlumni = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.alumni || payload?.data || payload?.results || [];
};

export default function DashboardPage() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { user, clearSession } = useSession();

  const alumniCount = useMemo(() => alumni.length, [alumni]);

  const loadAlumni = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getAlumni();
      setAlumni(normalizeAlumni(response));
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to load alumni.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlumni();
  }, []);

  const handleExtract = async () => {
    setExtracting(true);
    setError('');
    setMessage('');

    try {
      await extractAlumni();
      const response = await getAlumni();
      setAlumni(normalizeAlumni(response));
      setMessage('Alumni extraction completed successfully.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to extract alumni.');
    } finally {
      setExtracting(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setError('');

    try {
      const blob = await downloadExcel();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'alumni.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to download Excel file.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar user={user} onLogout={clearSession} showAdminLink={user?.role === 'HOD'} />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
                <p className="mt-2 text-sm text-slate-500">
                  Trigger extraction jobs, review alumni data, and export results.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleExtract} disabled={extracting}>
                  {extracting ? <LoadingSpinner label="Extracting" /> : 'Extract Alumni'}
                </Button>
                <Button variant="secondary" onClick={handleDownload} disabled={downloading}>
                  {downloading ? <LoadingSpinner label="Preparing file" /> : 'Download Excel'}
                </Button>
              </div>
            </div>

            {error && <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {message && <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}

            <div className="mt-8">
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
                  <LoadingSpinner label="Loading alumni" />
                </div>
              ) : (
                <Table columns={alumniColumns} emptyState="No alumni records available yet.">
                  {alumni.map((item, index) => (
                    <tr key={item.id || item._id || `${item.name}-${index}`} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name || item.full_name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.company || item.company_name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.passoutYear || item.passout_year || item.year || '-'}</td>
                    </tr>
                  ))}
                </Table>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-900 p-6 text-white shadow-soft">
              <p className="text-sm text-slate-300">Alumni count</p>
              <p className="mt-3 text-4xl font-semibold">{alumniCount}</p>
              <p className="mt-2 text-sm text-slate-300">Records currently available from the backend.</p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-slate-900">Quick notes</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>1. Add cookies before running extraction.</li>
                <li>2. Use the extract action to refresh alumni data.</li>
                <li>3. Download Excel when the table is ready.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}