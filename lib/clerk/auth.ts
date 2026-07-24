import { auth, currentUser } from '@clerk/nextjs/server';

export async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  return { userId, user };
}
