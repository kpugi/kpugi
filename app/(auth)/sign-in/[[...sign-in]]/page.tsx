import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-kpugi-paper p-4">
      <SignIn />
    </div>
  );
}
