import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, KnowledgeArticle, Meeting, DocumentResource, LinkResource, AssetResource, ActivityLog, Permission, Profile } from '../types';
import { initialProjects, initialKnowledge, initialMeetings, initialDocuments, initialLinks, initialAssets, initialPermissions, mockProfileAdmin, mockProfileMember, mockProfileViewer } from '../mock/seedData';
import { useAuth } from './AuthContext';
import { supabase, isConfigured } from '../lib/supabase';
import { formatDisplayName } from '../lib/formatName';

const isUUID = (str?: string | null): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

interface DataContextType {
  projects: Project[];
  knowledge: KnowledgeArticle[];
  meetings: Meeting[];
  documents: DocumentResource[];
  links: LinkResource[];
  assets: AssetResource[];
  activityLogs: ActivityLog[];
  profiles: Profile[];
  permissions: Permission[];
  
  // Create / Update actions with automated activity logging
  addProject: (p: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProject: (id: string, p: Partial<Project>) => Promise<void>;
  
  addKnowledge: (k: Omit<KnowledgeArticle, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateKnowledge: (id: string, k: Partial<KnowledgeArticle>) => Promise<void>;
  deleteKnowledge: (id: string) => Promise<void>;
  
  addMeeting: (m: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateMeeting: (id: string, m: Partial<Meeting>) => Promise<void>;
  toggleActionItem: (meetingId: string, actionItemId: string) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  
  addDocument: (d: Omit<DocumentResource, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  
  addLink: (l: Omit<LinkResource, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  
  addAsset: (a: Omit<AssetResource, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;

  grantPermission: (userId: string, permission: Permission['permission'], resourceType: Permission['resource_type'], resourceId?: string | null) => Promise<void>;
  revokePermission: (permissionId: string) => Promise<void>;
  toggleMemberActive: (userId: string) => Promise<void>;
  createMember: (fullName: string, email: string, role: 'admin' | 'member', password?: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [knowledge, setKnowledge] = useState<KnowledgeArticle[]>(initialKnowledge);
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [documents, setDocuments] = useState<DocumentResource[]>(initialDocuments);
  const [links, setLinks] = useState<LinkResource[]>(initialLinks);
  const [assets, setAssets] = useState<AssetResource[]>(initialAssets);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Fetch from Supabase when online, else fallback gracefully
  const fetchData = async () => {
    if (!isConfigured) {
      const savedProjects = localStorage.getItem('sot_projects');
      if (savedProjects) setProjects(JSON.parse(savedProjects));

      const savedKnowledge = localStorage.getItem('sot_knowledge');
      if (savedKnowledge) setKnowledge(JSON.parse(savedKnowledge));

      const savedMeetings = localStorage.getItem('sot_meetings');
      if (savedMeetings) setMeetings(JSON.parse(savedMeetings));

      const savedDocs = localStorage.getItem('sot_documents');
      if (savedDocs) setDocuments(JSON.parse(savedDocs));

      const savedLinks = localStorage.getItem('sot_links');
      if (savedLinks) setLinks(JSON.parse(savedLinks));

      const savedAssets = localStorage.getItem('sot_assets');
      if (savedAssets) setAssets(JSON.parse(savedAssets));

      const savedLogs = localStorage.getItem('sot_activity_logs');
      if (savedLogs) setActivityLogs(JSON.parse(savedLogs));
      return;
    }

    try {
      const [
        pRes,
        kRes,
        mRes,
        dRes,
        lRes,
        aRes,
        prRes,
        permRes,
        actRes
      ] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('knowledge_articles').select('*').order('created_at', { ascending: false }),
        supabase.from('meetings').select('*').order('date', { ascending: false }),
        supabase.from('documents').select('*').order('created_at', { ascending: false }),
        supabase.from('links').select('*').order('created_at', { ascending: false }),
        supabase.from('assets').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: true }),
        supabase.from('permissions').select('*'),
        supabase.from('activity_logs').select('*, actor:profiles(*)').order('created_at', { ascending: false }).limit(30)
      ]);

      if (pRes.error) console.error('[Supabase Fetch Error: projects]', pRes.error);
      if (kRes.error) console.error('[Supabase Fetch Error: knowledge_articles]', kRes.error);
      if (mRes.error) console.error('[Supabase Fetch Error: meetings]', mRes.error);
      if (dRes.error) console.error('[Supabase Fetch Error: documents]', dRes.error);
      if (lRes.error) console.error('[Supabase Fetch Error: links]', lRes.error);
      if (aRes.error) console.error('[Supabase Fetch Error: assets]', aRes.error);
      if (prRes.error) console.error('[Supabase Fetch Error: profiles]', prRes.error);
      if (permRes.error) console.error('[Supabase Fetch Error: permissions]', permRes.error);
      if (actRes.error) console.error('[Supabase Fetch Error: activity_logs]', actRes.error);

      if (pRes.data && pRes.data.length > 0) setProjects(pRes.data);
      if (kRes.data && kRes.data.length > 0) setKnowledge(kRes.data);
      if (mRes.data && mRes.data.length > 0) setMeetings(mRes.data);
      if (dRes.data && dRes.data.length > 0) setDocuments(dRes.data);
      if (lRes.data && lRes.data.length > 0) setLinks(lRes.data);
      if (aRes.data && aRes.data.length > 0) setAssets(aRes.data);
      if (prRes.data && prRes.data.length > 0) {
        const normalized = prRes.data.map((p: any) => {
          const cleanName = formatDisplayName(p.full_name || p.name, p.email);
          return {
            ...p,
            full_name: cleanName,
            name: cleanName
          };
        });
        setProfiles(normalized);
      }
      if (permRes.data && permRes.data.length > 0) setPermissions(permRes.data);
      if (actRes.data && actRes.data.length > 0) setActivityLogs(actRes.data);
    } catch (err) {
      console.warn('Supabase fetch error, fallback active:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const logActivity = async (action: string, targetType: string, targetId?: string, details?: Record<string, any>) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      actor_id: user?.id,
      actor: user || undefined,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      created_at: new Date().toISOString()
    };
    
    setActivityLogs(prev => [newLog, ...prev]);

    if (isConfigured && user) {
      try {
        const { error } = await supabase.from('activity_logs').insert([{
          actor_id: isUUID(user.id) ? user.id : null,
          action,
          target_type: targetType,
          target_id: isUUID(targetId) ? targetId : null,
          details
        }]);
        if (error) {
          console.warn('[Supabase Activity Log Note]:', error.message);
        }
      } catch (err) {
        console.warn('[Supabase Activity Log Ex]:', err);
      }
    } else {
      localStorage.setItem('sot_activity_logs', JSON.stringify([newLog, ...activityLogs]));
    }
  };

  const addProject = async (p: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    if (isConfigured && user) {
      const { data, error } = await supabase.from('projects').insert([{
        ...p,
        created_by: isUUID(user.id) ? user.id : null
      }]).select().single();
      if (error) {
        console.error('[Supabase Insert Error: projects]', error);
      } else if (data) {
        setProjects(prev => [data, ...prev]);
        logActivity('CREATED', 'Project', data.id, { name: data.name });
        return;
      }
    }
    const newP: Project = {
      ...p,
      id: `proj-${Date.now()}`,
      created_by: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updated = [newP, ...projects];
    setProjects(updated);
    localStorage.setItem('sot_projects', JSON.stringify(updated));
    logActivity('CREATED', 'Project', newP.id, { name: newP.name });
  };

  const updateProject = async (id: string, p: Partial<Project>) => {
    if (isConfigured && isUUID(id)) {
      const { error } = await supabase.from('projects').update(p).eq('id', id);
      if (error) console.error('[Supabase Update Error: projects]', error);
    }
    const updated = projects.map(item => item.id === id ? { ...item, ...p, updated_at: new Date().toISOString() } : item);
    setProjects(updated);
    localStorage.setItem('sot_projects', JSON.stringify(updated));
    logActivity('UPDATED', 'Project', id, { ...p });
  };

  const addKnowledge = async (k: Omit<KnowledgeArticle, 'id' | 'created_at' | 'updated_at'>) => {
    if (isConfigured && user) {
      const { data, error } = await supabase.from('knowledge_articles').insert([{
        ...k,
        project_id: isUUID(k.project_id) ? k.project_id : null,
        created_by: isUUID(user.id) ? user.id : null,
        updated_by: isUUID(user.id) ? user.id : null
      }]).select().single();
      if (error) {
        console.error('[Supabase Insert Error: knowledge_articles]', error);
      } else if (data) {
        setKnowledge(prev => [data, ...prev]);
        logActivity('CREATED', 'Knowledge Article', data.id, { title: data.title });
        return;
      }
    }
    const newK: KnowledgeArticle = {
      ...k,
      id: `kb-${Date.now()}`,
      created_by: user?.id,
      updated_by: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updated = [newK, ...knowledge];
    setKnowledge(updated);
    localStorage.setItem('sot_knowledge', JSON.stringify(updated));
    logActivity('CREATED', 'Knowledge Article', newK.id, { title: newK.title });
  };

  const updateKnowledge = async (id: string, k: Partial<KnowledgeArticle>) => {
    if (isConfigured && isUUID(id) && user) {
      const { error } = await supabase.from('knowledge_articles').update({
        ...k,
        project_id: isUUID(k.project_id) ? k.project_id : null,
        updated_by: isUUID(user.id) ? user.id : null,
        updated_at: new Date().toISOString()
      }).eq('id', id);
      if (error) console.error('[Supabase Update Error: knowledge_articles]', error);
    }
    const updated = knowledge.map(item => item.id === id ? { ...item, ...k, updated_by: user?.id, updated_at: new Date().toISOString() } : item);
    setKnowledge(updated);
    localStorage.setItem('sot_knowledge', JSON.stringify(updated));
    logActivity('UPDATED', 'Knowledge Article', id, { ...k });
  };

  const deleteKnowledge = async (id: string) => {
    const target = knowledge.find(k => k.id === id);
    if (isConfigured && isUUID(id)) {
      const { error } = await supabase.from('knowledge_articles').delete().eq('id', id);
      if (error) console.error('[Supabase Delete Error: knowledge_articles]', error);
    }
    const updated = knowledge.filter(k => k.id !== id);
    setKnowledge(updated);
    localStorage.setItem('sot_knowledge', JSON.stringify(updated));
    logActivity('DELETED', 'Knowledge Article', id, { title: target?.title });
  };

  const addMeeting = async (m: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>) => {
    if (isConfigured && user) {
      const { data, error } = await supabase.from('meetings').insert([{
        ...m,
        project_id: isUUID(m.project_id) ? m.project_id : null,
        created_by: isUUID(user.id) ? user.id : null,
        updated_by: isUUID(user.id) ? user.id : null
      }]).select().single();
      if (error) {
        console.error('[Supabase Insert Error: meetings]', error);
      } else if (data) {
        setMeetings(prev => [data, ...prev]);
        logActivity('CREATED', 'Meeting Minutes', data.id, { title: data.title, date: data.date });
        return;
      }
    }
    const newM: Meeting = {
      ...m,
      id: `meet-${Date.now()}`,
      created_by: user?.id,
      updated_by: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updated = [newM, ...meetings];
    setMeetings(updated);
    localStorage.setItem('sot_meetings', JSON.stringify(updated));
    logActivity('CREATED', 'Meeting Minutes', newM.id, { title: newM.title, date: newM.date });
  };

  const updateMeeting = async (id: string, m: Partial<Meeting>) => {
    if (isConfigured && isUUID(id) && user) {
      const { error } = await supabase.from('meetings').update({
        ...m,
        project_id: isUUID(m.project_id) ? m.project_id : null,
        updated_by: isUUID(user.id) ? user.id : null,
        updated_at: new Date().toISOString()
      }).eq('id', id);
      if (error) console.error('[Supabase Update Error: meetings]', error);
    }
    const updated = meetings.map(item => item.id === id ? { ...item, ...m, updated_by: user?.id, updated_at: new Date().toISOString() } : item);
    setMeetings(updated);
    localStorage.setItem('sot_meetings', JSON.stringify(updated));
    logActivity('UPDATED', 'Meeting Minutes', id, { ...m });
  };

  const toggleActionItem = async (meetingId: string, actionItemId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;

    const updatedActions = meeting.action_items.map(act => 
      act.id === actionItemId ? { ...act, completed: !act.completed } : act
    );

    if (isConfigured && isUUID(meetingId)) {
      const { error } = await supabase.from('meetings').update({ action_items: updatedActions }).eq('id', meetingId);
      if (error) console.error('[Supabase Update Error: meetings action_items]', error);
    }

    const updated = meetings.map(m => m.id === meetingId ? { ...m, action_items: updatedActions } : m);
    setMeetings(updated);
    localStorage.setItem('sot_meetings', JSON.stringify(updated));
  };

  const deleteMeeting = async (id: string) => {
    const target = meetings.find(m => m.id === id);
    if (isConfigured && isUUID(id)) {
      const { error } = await supabase.from('meetings').delete().eq('id', id);
      if (error) console.error('[Supabase Delete Error: meetings]', error);
    }
    const updated = meetings.filter(m => m.id !== id);
    setMeetings(updated);
    localStorage.setItem('sot_meetings', JSON.stringify(updated));
    logActivity('DELETED', 'Meeting Minutes', id, { title: target?.title });
  };

  const addDocument = async (d: Omit<DocumentResource, 'id' | 'created_at' | 'updated_at'>) => {
    if (isConfigured && user) {
      const { data, error } = await supabase.from('documents').insert([{
        ...d,
        project_id: isUUID(d.project_id) ? d.project_id : null,
        uploaded_by: isUUID(user.id) ? user.id : null
      }]).select().single();
      if (error) {
        console.error('[Supabase Insert Error: documents]', error);
      } else if (data) {
        setDocuments(prev => [data, ...prev]);
        logActivity('UPLOADED', 'Document', data.id, { title: data.title, type: data.file_type });
        return;
      }
    }
    const newDoc: DocumentResource = {
      ...d,
      id: `doc-${Date.now()}`,
      uploaded_by: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    localStorage.setItem('sot_documents', JSON.stringify(updated));
    logActivity('UPLOADED', 'Document', newDoc.id, { title: newDoc.title, type: newDoc.file_type });
  };

  const deleteDocument = async (id: string) => {
    const target = documents.find(d => d.id === id);
    if (isConfigured && isUUID(id)) {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) console.error('[Supabase Delete Error: documents]', error);
    }
    const updated = documents.filter(d => d.id !== id);
    setDocuments(updated);
    localStorage.setItem('sot_documents', JSON.stringify(updated));
    logActivity('DELETED', 'Document', id, { title: target?.title });
  };

  const addLink = async (l: Omit<LinkResource, 'id' | 'created_at' | 'updated_at'>) => {
    if (isConfigured && user) {
      const { data, error } = await supabase.from('links').insert([{
        ...l,
        project_id: isUUID(l.project_id) ? l.project_id : null,
        added_by: isUUID(user.id) ? user.id : null
      }]).select().single();
      if (error) {
        console.error('[Supabase Insert Error: links]', error);
      } else if (data) {
        setLinks(prev => [data, ...prev]);
        logActivity('CREATED', 'Link', data.id, { title: data.title, category: data.category });
        return;
      }
    }
    const newLink: LinkResource = {
      ...l,
      id: `link-${Date.now()}`,
      added_by: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updated = [newLink, ...links];
    setLinks(updated);
    localStorage.setItem('sot_links', JSON.stringify(updated));
    logActivity('CREATED', 'Link', newLink.id, { title: newLink.title, category: newLink.category });
  };

  const deleteLink = async (id: string) => {
    const target = links.find(l => l.id === id);
    if (isConfigured && isUUID(id)) {
      const { error } = await supabase.from('links').delete().eq('id', id);
      if (error) console.error('[Supabase Delete Error: links]', error);
    }
    const updated = links.filter(l => l.id !== id);
    setLinks(updated);
    localStorage.setItem('sot_links', JSON.stringify(updated));
    logActivity('DELETED', 'Link', id, { title: target?.title });
  };

  const addAsset = async (a: Omit<AssetResource, 'id' | 'created_at' | 'updated_at'>) => {
    if (isConfigured && user) {
      const { data, error } = await supabase.from('assets').insert([{
        ...a,
        project_id: isUUID(a.project_id) ? a.project_id : null,
        uploaded_by: isUUID(user.id) ? user.id : null
      }]).select().single();
      if (error) {
        console.error('[Supabase Insert Error: assets]', error);
      } else if (data) {
        setAssets(prev => [data, ...prev]);
        logActivity('UPLOADED', 'Asset', data.id, { name: data.name, type: data.type });
        return;
      }
    }
    const newAsset: AssetResource = {
      ...a,
      id: `asset-${Date.now()}`,
      uploaded_by: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updated = [newAsset, ...assets];
    setAssets(updated);
    localStorage.setItem('sot_assets', JSON.stringify(updated));
    logActivity('UPLOADED', 'Asset', newAsset.id, { name: newAsset.name, type: newAsset.type });
  };

  const deleteAsset = async (id: string) => {
    const target = assets.find(a => a.id === id);
    if (isConfigured && isUUID(id)) {
      const { error } = await supabase.from('assets').delete().eq('id', id);
      if (error) console.error('[Supabase Delete Error: assets]', error);
    }
    const updated = assets.filter(a => a.id !== id);
    setAssets(updated);
    localStorage.setItem('sot_assets', JSON.stringify(updated));
    logActivity('DELETED', 'Asset', id, { name: target?.name });
  };

  const grantPermission = async (userId: string, permission: Permission['permission'], resourceType: Permission['resource_type'], resourceId?: string | null) => {
    const targetMember = profiles.find(p => p.id === userId);
    if (isConfigured && user) {
      const { data } = await supabase.from('permissions').insert([{
        user_id: userId,
        permission,
        resource_type: resourceType,
        resource_id: resourceId || null,
        granted_by: user.id
      }]).select().single();
      if (data) {
        setPermissions(prev => [...prev, data]);
        logActivity('PERMISSION_CHANGED', 'Permission', data.id, {
          member: targetMember?.full_name,
          permission,
          resourceType,
          resourceId
        });
        return;
      }
    }
    const newPerm: Permission = {
      id: `perm-${Date.now()}`,
      user_id: userId,
      permission,
      resource_type: resourceType,
      resource_id: resourceId || null,
      granted_by: user?.id,
      created_at: new Date().toISOString()
    };
    const updated = [...permissions, newPerm];
    setPermissions(updated);
    localStorage.setItem('sot_all_permissions', JSON.stringify(updated));
    logActivity('PERMISSION_CHANGED', 'Permission', newPerm.id, {
      member: targetMember?.full_name,
      permission,
      resourceType,
      resourceId
    });
  };

  const revokePermission = async (permissionId: string) => {
    const perm = permissions.find(p => p.id === permissionId);
    const targetMember = profiles.find(p => p.id === perm?.user_id);
    if (isConfigured) {
      await supabase.from('permissions').delete().eq('id', permissionId);
    }
    const updated = permissions.filter(p => p.id !== permissionId);
    setPermissions(updated);
    localStorage.setItem('sot_all_permissions', JSON.stringify(updated));
    logActivity('PERMISSION_CHANGED', 'Permission', permissionId, {
      description: `Revoked ${perm?.permission} permission from ${targetMember?.full_name}`
    });
  };

  const toggleMemberActive = async (userId: string) => {
    const target = profiles.find(p => p.id === userId);
    const newStatus = !target?.is_active;
    if (isConfigured) {
      await supabase.from('profiles').update({ is_active: newStatus }).eq('id', userId);
    }
    const updated = profiles.map(p => {
      if (p.id !== userId) return p;
      logActivity(newStatus ? 'MEMBER_RESTORED' : 'MEMBER_DISABLED', 'Member', userId, { name: p.full_name });
      return { ...p, is_active: newStatus };
    });
    setProfiles(updated);
    localStorage.setItem('sot_profiles', JSON.stringify(updated));
  };

  const createMember = async (fullName: string, email: string, role: 'admin' | 'member', password = 'password123') => {
    if (isConfigured) {
      try {
        // 1. Sign up user through Supabase Auth (or trigger provisioning)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: role
            }
          }
        });

        if (authError) {
          console.warn('Supabase Auth signUp note:', authError.message);
        }

        const userId = authData?.user?.id;
        
        // 2. Ensure profile entry exists in public.profiles table
        const profilePayload: any = {
          email: email.trim(),
          full_name: fullName.trim(),
          role: role,
          is_active: true
        };
        if (userId) {
          profilePayload.id = userId;
        }

        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .upsert([profilePayload])
          .select()
          .single();

        if (profileData) {
          setProfiles(prev => {
            const exists = prev.find(p => p.id === profileData.id || p.email.toLowerCase() === email.toLowerCase());
            if (exists) return prev.map(p => p.id === profileData.id ? profileData : p);
            return [...prev, profileData];
          });
          logActivity('MEMBER_CREATED', 'Member', profileData.id, { name: fullName, email, role });
          return;
        }
      } catch (err) {
        console.error('Error creating member with Supabase:', err);
      }
    }

    const newMember: Profile = {
      id: `usr-${Date.now()}`,
      full_name: fullName.trim(),
      email: email.trim(),
      role,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updated = [...profiles, newMember];
    setProfiles(updated);
    localStorage.setItem('sot_profiles', JSON.stringify(updated));
    logActivity('MEMBER_CREATED', 'Member', newMember.id, { name: fullName, email, role });
  };

  return (
    <DataContext.Provider
      value={{
        projects,
        knowledge,
        meetings,
        documents,
        links,
        assets,
        activityLogs,
        profiles,
        permissions,
        addProject,
        updateProject,
        addKnowledge,
        updateKnowledge,
        deleteKnowledge,
        addMeeting,
        updateMeeting,
        toggleActionItem,
        deleteMeeting,
        addDocument,
        deleteDocument,
        addLink,
        deleteLink,
        addAsset,
        deleteAsset,
        grantPermission,
        revokePermission,
        toggleMemberActive,
        createMember
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
