export default function OnboardingRolePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-kpugi-paper p-6">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-kpugi-border text-center shadow-sm">
        <h2 className="font-display text-2xl font-bold mb-2">Choose Your Account Role</h2>
        <p className="text-kpugi-slate text-sm mb-6">Are you looking to run ad campaigns or earn payouts as a creator?</p>
        <div className="space-y-4">
          <button className="btn btn-primary w-full">I am an Advertiser / Brand</button>
          <button className="btn btn-outline w-full">I am a Creator</button>
        </div>
      </div>
    </div>
  );
}
