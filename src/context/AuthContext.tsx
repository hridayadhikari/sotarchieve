import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, Permission, PermissionType, ResourceType } from '../types';
import { supabase, isConfigured } from '../lib/supabase';
import { can as evalCan } from '../lib/permissions';
import { formatDisplayName } from '../lib/formatName';

interface AuthContextType {
  user: Profile | null;
  permissions: Permission[];
  setPermissions: React.Dispatch<React.SetStateAction<Permission[]>>;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: PermissionType, resourceType: ResourceType, resourceId?: string | null) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync profile & permissions from Supabase
  const loadSupabaseUserProfile = async (authUser: { id: string; email?: string; user_metadata?: any }) => {
    try {
      // 1. Check profile by user ID
      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      // 2. If not found by ID, query by email
      if (!profile && authUser.email) {
        const { data: profileByEmail } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', authUser.email.trim())
          .maybeSingle();
        if (profileByEmail) {
          profile = profileByEmail;
        }
      }

      if (profile) {
        if (!profile.is_active) {
          await supabase.auth.signOut();
          setUser(null);
          setPermissions([]);
          throw new Error('Your SOT account is inactive. Please contact an administrator.');
        }

        const cleanFullName = formatDisplayName(
          profile.full_name || profile.name,
          profile.email || authUser.email,
          authUser.user_metadata
        );

        const normalizedProfile: Profile = {
          ...profile,
          full_name: cleanFullName,
          name: cleanFullName
        };

        setUser(normalizedProfile);

        // Fetch user permissions
        const { data: userPerms } = await supabase
          .from('permissions')
          .select('*')
          .eq('user_id', profile.id);

        setPermissions(userPerms || []);
      } else {
        // Auto-provision profile row for new Supabase user
        const cleanName = formatDisplayName(
          authUser.user_metadata?.full_name || authUser.user_metadata?.name,
          authUser.email,
          authUser.user_metadata
        );

        const newProfile: Profile = {
          id: authUser.id,
          email: authUser.email || '',
          full_name: cleanName,
          name: cleanName,
          role: (authUser.user_metadata?.role as any) || 'member',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await supabase.from('profiles').upsert([newProfile]);
        setUser(newProfile);
        setPermissions([]);
      }
    } catch (err: any) {
      console.error('Error loading Supabase profile:', err);
      throw err;
    }
  };

  useEffect(() => {
    async function initializeAuth() {
      if (!isConfigured) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadSupabaseUserProfile(session.user);
        } else {
          setUser(null);
          setPermissions([]);
        }
      } catch (err) {
        console.error('Error initializing Supabase Auth:', err);
        setUser(null);
        setPermissions([]);
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();

    if (isConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await loadSupabaseUserProfile(session.user).catch(() => {});
        } else {
          setUser(null);
          setPermissions([]);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const login = async (email: string, password?: string) => {
    if (!isConfigured) {
      throw new Error('Supabase credentials are not configured in your .env file.');
    }

    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        throw new Error(error.message || 'Invalid email or password.');
      }

      if (!data.user) {
        throw new Error('User account not found in Supabase.');
      }

      await loadSupabaseUserProfile(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    setUser(null);
    setPermissions([]);
  };

  const checkCan = (
    permission: PermissionType,
    resourceType: ResourceType,
    resourceId?: string | null
  ) => {
    return evalCan(user, permissions, permission, resourceType, resourceId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        setPermissions,
        isLoading,
        login,
        logout,
        can: checkCan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

