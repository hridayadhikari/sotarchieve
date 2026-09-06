-- ==============================================================================
-- SOT ARCHIVE: RLS POLICY FIX SCRIPT
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/hruwicozilxusowagoiv/sql
-- ==============================================================================

-- 1. ASSETS
DROP POLICY IF EXISTS "Active members can view assets" ON public.assets;
DROP POLICY IF EXISTS "Authorized can manage assets" ON public.assets;
DROP POLICY IF EXISTS "Allow manage assets" ON public.assets;
DROP POLICY IF EXISTS "Allow all read assets" ON public.assets;
DROP POLICY IF EXISTS "Allow all insert assets" ON public.assets;
DROP POLICY IF EXISTS "Allow all update assets" ON public.assets;
DROP POLICY IF EXISTS "Allow all delete assets" ON public.assets;

CREATE POLICY "Allow all read assets" ON public.assets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert assets" ON public.assets FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update assets" ON public.assets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete assets" ON public.assets FOR DELETE TO anon, authenticated USING (true);

-- 2. ACTIVITY LOGS
DROP POLICY IF EXISTS "Active members can view activity" ON public.activity_logs;
DROP POLICY IF EXISTS "Authenticated can insert activity" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow insert activity" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow all read activity" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow all insert activity" ON public.activity_logs;

CREATE POLICY "Allow all read activity" ON public.activity_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert activity" ON public.activity_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 3. PROJECTS
DROP POLICY IF EXISTS "Active members can view projects" ON public.projects;
DROP POLICY IF EXISTS "Authorized can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Authorized can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authorized can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Allow all read projects" ON public.projects;
DROP POLICY IF EXISTS "Allow all insert projects" ON public.projects;
DROP POLICY IF EXISTS "Allow all update projects" ON public.projects;
DROP POLICY IF EXISTS "Allow all delete projects" ON public.projects;

CREATE POLICY "Allow all read projects" ON public.projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert projects" ON public.projects FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update projects" ON public.projects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete projects" ON public.projects FOR DELETE TO anon, authenticated USING (true);

-- 4. KNOWLEDGE ARTICLES
DROP POLICY IF EXISTS "Active members can view knowledge" ON public.knowledge_articles;
DROP POLICY IF EXISTS "Authorized can insert knowledge" ON public.knowledge_articles;
DROP POLICY IF EXISTS "Authorized can update knowledge" ON public.knowledge_articles;
DROP POLICY IF EXISTS "Authorized can delete knowledge" ON public.knowledge_articles;
DROP POLICY IF EXISTS "Allow all read knowledge" ON public.knowledge_articles;
DROP POLICY IF EXISTS "Allow all insert knowledge" ON public.knowledge_articles;
DROP POLICY IF EXISTS "Allow all update knowledge" ON public.knowledge_articles;
DROP POLICY IF EXISTS "Allow all delete knowledge" ON public.knowledge_articles;

CREATE POLICY "Allow all read knowledge" ON public.knowledge_articles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert knowledge" ON public.knowledge_articles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update knowledge" ON public.knowledge_articles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete knowledge" ON public.knowledge_articles FOR DELETE TO anon, authenticated USING (true);

-- 5. MEETINGS
DROP POLICY IF EXISTS "Active members can view meetings" ON public.meetings;
DROP POLICY IF EXISTS "Authorized can insert meetings" ON public.meetings;
DROP POLICY IF EXISTS "Authorized can update meetings" ON public.meetings;
DROP POLICY IF EXISTS "Authorized can delete meetings" ON public.meetings;
DROP POLICY IF EXISTS "Allow all read meetings" ON public.meetings;
DROP POLICY IF EXISTS "Allow all insert meetings" ON public.meetings;
DROP POLICY IF EXISTS "Allow all update meetings" ON public.meetings;
DROP POLICY IF EXISTS "Allow all delete meetings" ON public.meetings;

CREATE POLICY "Allow all read meetings" ON public.meetings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert meetings" ON public.meetings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update meetings" ON public.meetings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete meetings" ON public.meetings FOR DELETE TO anon, authenticated USING (true);

-- 6. DOCUMENTS
DROP POLICY IF EXISTS "Active members can view documents" ON public.documents;
DROP POLICY IF EXISTS "Authorized can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Authorized can update documents" ON public.documents;
DROP POLICY IF EXISTS "Authorized can delete documents" ON public.documents;
DROP POLICY IF EXISTS "Allow all read documents" ON public.documents;
DROP POLICY IF EXISTS "Allow all insert documents" ON public.documents;
DROP POLICY IF EXISTS "Allow all update documents" ON public.documents;
DROP POLICY IF EXISTS "Allow all delete documents" ON public.documents;

CREATE POLICY "Allow all read documents" ON public.documents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert documents" ON public.documents FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update documents" ON public.documents FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete documents" ON public.documents FOR DELETE TO anon, authenticated USING (true);

-- 7. LINKS
DROP POLICY IF EXISTS "Active members can view links" ON public.links;
DROP POLICY IF EXISTS "Authorized can insert links" ON public.links;
DROP POLICY IF EXISTS "Authorized can update links" ON public.links;
DROP POLICY IF EXISTS "Authorized can delete links" ON public.links;
DROP POLICY IF EXISTS "Allow all read links" ON public.links;
DROP POLICY IF EXISTS "Allow all insert links" ON public.links;
DROP POLICY IF EXISTS "Allow all update links" ON public.links;
DROP POLICY IF EXISTS "Allow all delete links" ON public.links;

CREATE POLICY "Allow all read links" ON public.links FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert links" ON public.links FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update links" ON public.links FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete links" ON public.links FOR DELETE TO anon, authenticated USING (true);

-- 8. PROFILES
DROP POLICY IF EXISTS "Active users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile info" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all update profiles" ON public.profiles;

CREATE POLICY "Allow all read profiles" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert profiles" ON public.profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update profiles" ON public.profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- 9. PERMISSIONS
DROP POLICY IF EXISTS "Admins manage permissions" ON public.permissions;
DROP POLICY IF EXISTS "Users can view own permissions" ON public.permissions;
DROP POLICY IF EXISTS "Allow all read permissions" ON public.permissions;
DROP POLICY IF EXISTS "Allow all insert permissions" ON public.permissions;
DROP POLICY IF EXISTS "Allow all update permissions" ON public.permissions;
DROP POLICY IF EXISTS "Allow all delete permissions" ON public.permissions;

CREATE POLICY "Allow all read permissions" ON public.permissions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert permissions" ON public.permissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update permissions" ON public.permissions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete permissions" ON public.permissions FOR DELETE TO anon, authenticated USING (true);
