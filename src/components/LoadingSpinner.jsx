import React from 'react';

export default function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="inline-flex items-center gap-3 text-sm text-slate-600">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      <span>{label}</span>
    </div>
  );
}