import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Button from './Button';

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

export default function Navbar({ user, onLogout, showAdminLink = false }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <Link to="/dashboard" className="text-lg font-semibold tracking-tight text-slate-900">
            Alumni Dashboard
          </Link>
          <p className="text-sm text-slate-500">Manage extraction, downloads, and user access</p>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/cookies" className={navLinkClass}>
            Cookies
          </NavLink>
          {showAdminLink && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </nav>
      </div>

      <div className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-3 text-sm text-slate-600 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div>
            <span className="font-medium text-slate-900">Email:</span> {user?.email || 'Unknown'}
          </div>
          <div>
            <span className="font-medium text-slate-900">Department:</span> {user?.department || 'Unknown'}
          </div>
          <div>
            <span className="font-medium text-slate-900">Role:</span> {user?.role || 'Unknown'}
          </div>
        </div>
      </div>
    </header>
  );
}