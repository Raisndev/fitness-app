import { useAuthStore } from '@/store/authStore';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInWithApple,
  signOut,
  resetPassword,
} from '@/services/supabase/auth';

export function useAuth() {
  const { user, session, profile, loading, initialized } = useAuthStore();

  return {
    user,
    session,
    profile,
    loading,
    initialized,
    isAuthenticated: !!session,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    signOut,
    resetPassword,
  };
}
