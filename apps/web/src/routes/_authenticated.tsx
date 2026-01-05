import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    // We check the session directly from the authClient
    const session = await authClient.getSession();
    
    if (!session.data) {
      throw redirect({
        to: '/login',
        search: {
          // Store the original destination to redirect back after login
          redirect: location.href,
        },
      });
    }
  },
  component: () => <Outlet />,
});
