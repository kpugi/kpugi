import React from 'react';

export function SubmissionForm() {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-xs font-semibold mb-1">Post Live URL</label>
        <input type="url" className="input input-bordered w-full text-sm" placeholder="https://instagram.com/p/..." />
      </div>
    </form>
  );
}
