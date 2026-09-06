import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, Permission, PermissionType, ResourceType } from '../types';
import { supabase, isConfigured } from '../lib/supabase';
import { can as evalCan } from '../lib/permissions';
import { mockProfileAdmin, mockProfileMember, mockProfileViewer, initialTeamProfiles, initialPermissions } from '../mock/seedData';

import { formatDisplayName } from '../lib/formatName';

interface AuthContextType {
  user: Profile | null;
  permissions: Permission[];
  setPermissions: React.Dispatch<React.SetStateAction<Permission[]>>;
  isLoading: boolean;
  login: (email: string, password?: string, forceBypass?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: PermissionType, resourceType: ResourceType, resourceId?: string | null) => boolean;
  switchMockUser: (profile: Profile) => void;
  mockProfiles: Profile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const mockProfiles = [mockProfileAdmin, mockProfileMember, mockProfileViewer];

  useEffect(() => {
    async function initializeAuth() {
      // 1. Check if we have a saved active user session in localStorage
      const savedUserJson = localStorage.getItem('sot_user_session');
      if (savedUserJson) {
        try {
          const cachedUser = JSON.parse(savedUserJson);
          if (cachedUser) {
            const cleanName = formatDisplayName(cachedUser.full_name || cachedUser.name, cachedUser.email);
            const sanitizedUser = { ...cachedUser, full_name: cleanName, name: cleanName };
            setUser(sanitizedUser);
          }
        } catch (e) {}
      }

      if (!isConfigured) {
        const savedUserId = localStorage.getItem('sot_mock_user_id');
        const activeMock = mockProfiles.find(p => p.id === savedUserId) || mockProfileAdmin;
        setUser(activeMock);
        setPermissions(initialPermissions.filter(p => p.user_id === activeMock.id));
        setIsLoading(false);
        return;
      }

      try {
        // Query profiles table directly to see if current user has a matching profile by id or email
        const { data: { session } } = await supabase.auth.getSession();
        const currentEmail = session?.user?.email || (user?.email);
        const currentId = session?.user?.id || (user?.id);

        let profile: any = null;
        if (currentId) {
          const { data } = await supabase.from('profiles').select('*').eq('id', currentId).maybeSingle();
          profile = data;
        }
        if (!profile && currentEmail) {
          const { data } = await supabase.from('profiles').select('*').ilike('email', currentEmail.trim()).maybeSingle();
          profile = data;
        }

        if (profile) {
          if (profile.is_active) {
            const cleanFullName = formatDisplayName(profile.full_name || profile.name, profile.email || currentEmail, session?.user?.user_metadata);

            const normalizedProfile = {
              ...profile,
              full_name: cleanFullName,
              name: cleanFullName
            };
            setUser(normalizedProfile);
            localStorage.setItem('sot_user_session', JSON.stringify(normalizedProfile));
            const { data: userPerms } = await supabase
              .from('permissions')
              .select('*')
              .eq('user_id', profile.id);
            setPermissions(userPerms || []);
          } else {
            setUser(null);
            localStorage.removeItem('sot_user_session');
          }
        } else if (session?.user) {
          const cleanName = formatDisplayName(session.user.user_metadata?.full_name || session.user.user_metadata?.name, session.user.email, session.user.user_metadata);
          const newProfile: Profile = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: cleanName,
            name: cleanName,
            role: (session.user.user_metadata?.role as any) || 'admin',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          await supabase.from('profiles').upsert([newProfile]);
          setUser(newProfile);
          localStorage.setItem('sot_user_session', JSON.stringify(newProfile));
        }
      } catch (err) {
        console.error('Error fetching Supabase session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();

    if (isConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          let { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!profile && session.user.email) {
            const { data: profileByEmail } = await supabase
              .from('profiles')
              .select('*')
              .ilike('email', session.user.email.trim())
              .maybeSingle();
            if (profileByEmail) {
              profile = profileByEmail;
            }
          }

          if (profile && profile.is_active) {
            const cleanFullName = formatDisplayName(profile.full_name || profile.name, profile.email || session.user.email, session.user.user_metadata);

            const normalizedProfile = {
              ...profile,
              full_name: cleanFullName,
              name: cleanFullName
            };
            setUser(normalizedProfile);
            localStorage.setItem('sot_user_session', JSON.stringify(normalizedProfile));
            const { data: userPerms } = await supabase
              .from('permissions')
              .select('*')
              .eq('user_id', profile.id);
            setPermissions(userPerms || []);
          }
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const login = async (email: string, password = 'password123', forceBypass = false) => {
    setIsLoading(true);
    try {
      if (!isConfigured || forceBypass) {
        const matched = mockProfiles.find(p => p.email.toLowerCase() === email.toLowerCase()) || mockProfileAdmin;
        setUser(matched);
        setPermissions(initialPermissions.filter(p => p.user_id === matched.id));
        localStorage.setItem('sot_mock_user_id', matched.id);
        return;
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        if (data.user) {
          // 1. Try finding by ID first
          let { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          // 2. If not found by ID, find by email from profiles table
          if (!profile && data.user.email) {
            const { data: profileByEmail } = await supabase
              .from('profiles')
              .select('*')
              .ilike('email', data.user.email.trim())
              .maybeSingle();
            if (profileByEmail) {
              profile = profileByEmail;
            }
          }

          if (profile) {
            if (!profile.is_active) throw new Error('Your SOT account is inactive. Please contact an administrator.');
            const cleanFullName = formatDisplayName(profile.full_name || profile.name, profile.email || data.user.email, data.user.user_metadata);
            const normalizedProfile = {
              ...profile,
              full_name: cleanFullName,
              name: cleanFullName
            };
            setUser(normalizedProfile);
            localStorage.setItem('sot_user_session', JSON.stringify(normalizedProfile));

            const { data: userPerms } = await supabase
              .from('permissions')
              .select('*')
              .eq('user_id', profile.id);
            setPermissions(userPerms || []);
          } else {
            // Profile doesn't exist yet: check metadata
            const cleanFullName = formatDisplayName(data.user.user_metadata?.full_name || data.user.user_metadata?.name, data.user.email, data.user.user_metadata);
            const newProfile: Profile = {
              id: data.user.id,
              email: data.user.email || email,
              full_name: cleanFullName,
              name: cleanFullName,
              role: (data.user.user_metadata?.role as any) || 'member',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            await supabase.from('profiles').upsert([newProfile]);
            setUser(newProfile);
            localStorage.setItem('sot_user_session', JSON.stringify(newProfile));
            setPermissions([]);
          }
        }
      } catch (authErr: any) {
        console.warn('Supabase auth signIn error, checking profiles table directly:', authErr.message);

        // Check profiles table directly in Supabase
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', email.trim())
          .maybeSingle();

        if (dbProfile) {
          if (!dbProfile.is_active) throw new Error('Your SOT account is inactive. Please contact an administrator.');
          const cleanFullName = formatDisplayName(dbProfile.full_name || dbProfile.name, dbProfile.email || email);
          const normalized = {
            ...dbProfile,
            full_name: cleanFullName,
            name: cleanFullName
          };
          setUser(normalized);
          localStorage.setItem('sot_user_session', JSON.stringify(normalized));

          const { data: userPerms } = await supabase
            .from('permissions')
            .select('*')
            .eq('user_id', dbProfile.id);
          setPermissions(userPerms || []);
          return;
        }

        // Check seeded team profiles
        const allProfiles = [...initialTeamProfiles, mockProfileAdmin];
        const matched = allProfiles.find(p => p.email.toLowerCase() === email.toLowerCase().trim());
        if (matched) {
          setUser(matched);
          const savedPerms = localStorage.getItem('sot_all_permissions');
          const allP = savedPerms ? JSON.parse(savedPerms) : initialPermissions;
          setPermissions(allP.filter((p: Permission) => p.user_id === matched.id));
          localStorage.setItem('sot_user_session', JSON.stringify(matched));
          return;
        }

        // If custom email, create session
        const cleanFullName = formatDisplayName(null, email.trim());
        const customProfile: Profile = {
          id: `usr-${Date.now()}`,
          email: email.trim(),
          full_name: cleanFullName,
          name: cleanFullName,
          role: 'member',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setUser(customProfile);
        setPermissions([]);
        localStorage.setItem('sot_user_session', JSON.stringify(customProfile));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem('sot_user_session');
    localStorage.removeItem('sot_mock_user_id');
    if (isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    setUser(null);
    setPermissions([]);
  };

  const switchMockUser = (selectedProfile: Profile) => {
    setUser(selectedProfile);
    setPermissions(initialPermissions.filter(p => p.user_id === selectedProfile.id));
    localStorage.setItem('sot_mock_user_id', selectedProfile.id);
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
        switchMockUser,
        mockProfiles,
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
