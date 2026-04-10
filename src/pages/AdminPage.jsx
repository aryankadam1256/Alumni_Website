import React, { useEffect, useState } from 'react';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import { blockUser, getUsers } from '../services/api';
import { useSession } from '../context/SessionContext';

const userColumns = [
  { key: 'name', label: 'Name' },
  { key: 'department', label: 'Department' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
];

const normalizeUsers = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.users || payload?.data || payload?.results || [];
};

const isBlockedUser = (user) => Boolean(user.blocked || user.isBlocked || user.status === 'Blocked');

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mutatingUserId, setMutatingUserId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { user, clearSession } = useSession();

  const loadUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getUsers();
      setUsers(normalizeUsers(response));
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleUser = async (targetUser) => {
    const userId = targetUser.id || targetUser._id || targetUser.userId;
    setMutatingUserId(userId);
    setError('');
    setMessage('');

    try {
      await blockUser({ userId, blocked: !isBlockedUser(targetUser) });
      await loadUsers();
      setMessage('User status updated.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to update user.');
    } finally {
      setMutatingUserId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar user={user} onLogout={clearSession} showAdminLink={user?.role === 'HOD'} />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">Admin panel</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Manage system users</h1>
              <p className="mt-2 text-sm text-slate-500">Only HOD users can access this page.</p>
            </div>
            <Button variant="secondary" onClick={loadUsers} disabled={loading}>
              Refresh Users
            </Button>
          </div>

          {error && <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          {message && <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}

          <div className="mt-8">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
                <LoadingSpinner label="Loading users" />
              </div>
            ) : (
              <Table columns={userColumns} emptyState="No users available.">
                {users.map((targetUser, index) => {
                  const userId = targetUser.id || targetUser._id || targetUser.userId || index;
                  const blocked = isBlockedUser(targetUser);

                  return (
                    <tr key={userId} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{targetUser.name || targetUser.email || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{targetUser.department || targetUser.dept || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            blocked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {blocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button
                          variant={blocked ? 'secondary' : 'danger'}
                          className="min-w-28"
                          onClick={() => handleToggleUser(targetUser)}
                          disabled={mutatingUserId === userId}
                        >
                          {mutatingUserId === userId ? <LoadingSpinner label="Updating" /> : blocked ? 'Unblock' : 'Block'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </Table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}