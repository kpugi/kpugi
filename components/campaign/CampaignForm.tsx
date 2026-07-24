import React from 'react';

export function CampaignForm() {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-xs font-semibold mb-1">Campaign Title</label>
        <input type="text" className="input input-bordered w-full text-sm" placeholder="Enter campaign title..." />
      </div>
    </form>
  );
}
