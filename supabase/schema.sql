-- SOT ARCHIVE: SUPABASE POSTGRESQL DATABASE SCHEMA
-- Brand: Streets of Tripura (SOT)
-- Features: Granular Global & Project RLS, Activity Logs, Knowledge Base, Documents, Meetings, Links, Assets

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE permission_type AS ENUM ('VIEW', 'CREATE', 'EDIT', 'DELETE', 'MANAGE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE resource_type_enum AS ENUM ('global', 'project', 'knowledge', 'meetings', 'documents', 'links', 'assets');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('active', 'planning', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE asset_type AS ENUM ('Logo', 'Photo', 'Poster', 'Branding', 'Other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE link_category AS ENUM ('Canva', 'Google Drive', 'Google Forms', 'Google Docs', 'Social', 'Other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'member',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    status project_status NOT NULL DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    cover_image TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. KNOWLEDGE ARTICLES
CREATE TABLE IF NOT EXISTS public.knowledge_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. MEETINGS TABLE
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    attendees TEXT[] DEFAULT ARRAY[]::TEXT[],
    agenda TEXT,
    discussion TEXT,
    decisions TEXT,
    action_items JSONB DEFAULT '[]'::jsonb, -- Array of { id: string, text: string, completed: boolean, assignee?: string }
    attachments JSONB DEFAULT '[]'::jsonb,  -- Array of { name: string, url: string, type: string }
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    category TEXT NOT NULL DEFAULT 'General',
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. LINKS TABLE
CREATE TABLE IF NOT EXISTS public.links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    category link_category NOT NULL DEFAULT 'Other',
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type asset_type NOT NULL DEFAULT 'Other',
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    cloudinary_url TEXT NOT NULL,
    thumbnail_url TEXT,
    public_id TEXT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission permission_type NOT NULL,
    resource_type resource_type_enum NOT NULL DEFAULT 'global',
    resource_id UUID, -- Nullable for global or points to project_id or specific resource
    granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_perm_resource UNIQUE (user_id, permission, resource_type, resource_id)
);

-- 11. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. INDEXES
CREATE INDEX IF NOT EXISTS idx_knowledge_project ON public.knowledge_articles(project_id);
CREATE INDEX IF NOT EXISTS idx_meetings_project ON public.meetings(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_project ON public.documents(project_id);
CREATE INDEX IF NOT EXISTS idx_links_project ON public.links(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_project ON public.assets(project_id);
CREATE INDEX IF NOT EXISTS idx_permissions_user ON public.permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_fts ON public.knowledge_articles USING gin(to_tsvector('english', title || ' ' || content_markdown));
CREATE INDEX IF NOT EXISTS idx_meetings_fts ON public.meetings USING gin(to_tsvector('english', title || ' ' || coalesce(agenda,'') || ' ' || coalesce(discussion,'') || ' ' || coalesce(decisions,'')));

-- 13. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if user is active admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function: Check if user has permission
CREATE OR REPLACE FUNCTION public.check_user_permission(
  p_permission permission_type,
  p_resource_type resource_type_enum,
  p_resource_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Admin has all permissions
  IF public.is_admin() THEN
    RETURN TRUE;
  END IF;

  -- Check direct permission or global permission for this resource
  RETURN EXISTS (
    SELECT 1 FROM public.permissions
    WHERE user_id = auth.uid()
      AND permission = p_permission
      AND (
        (resource_type = 'global')
        OR (resource_type = p_resource_type AND (resource_id IS NULL OR resource_id = p_resource_id))
        OR (resource_type = 'project' AND resource_id = p_resource_id)
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLICIES:
-- Profiles: All active users can view profiles; only admin can update role/status; users can update own name/avatar
CREATE POLICY "Active users can view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Users can update own profile info" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.is_admin());

-- Projects: All active members can VIEW; only authorized or admins can CREATE/UPDATE/DELETE
CREATE POLICY "Active members can view projects" ON public.projects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authorized can insert projects" ON public.projects
  FOR INSERT TO authenticated WITH CHECK (public.check_user_permission('CREATE', 'project'));

CREATE POLICY "Authorized can update projects" ON public.projects
  FOR UPDATE TO authenticated USING (public.check_user_permission('EDIT', 'project', id));

CREATE POLICY "Authorized can delete projects" ON public.projects
  FOR DELETE TO authenticated USING (public.check_user_permission('DELETE', 'project', id));

-- Knowledge Articles:
CREATE POLICY "Active members can view knowledge" ON public.knowledge_articles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authorized can insert knowledge" ON public.knowledge_articles
  FOR INSERT TO authenticated WITH CHECK (public.check_user_permission('CREATE', 'knowledge', project_id));

CREATE POLICY "Authorized can update knowledge" ON public.knowledge_articles
  FOR UPDATE TO authenticated USING (public.check_user_permission('EDIT', 'knowledge', project_id));

CREATE POLICY "Authorized can delete knowledge" ON public.knowledge_articles
  FOR DELETE TO authenticated USING (public.check_user_permission('DELETE', 'knowledge', project_id));

-- Meetings:
CREATE POLICY "Active members can view meetings" ON public.meetings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authorized can insert meetings" ON public.meetings
  FOR INSERT TO authenticated WITH CHECK (public.check_user_permission('CREATE', 'meetings', project_id));

CREATE POLICY "Authorized can update meetings" ON public.meetings
  FOR UPDATE TO authenticated USING (public.check_user_permission('EDIT', 'meetings', project_id));

CREATE POLICY "Authorized can delete meetings" ON public.meetings
  FOR DELETE TO authenticated USING (public.check_user_permission('DELETE', 'meetings', project_id));

-- Documents:
CREATE POLICY "Active members can view documents" ON public.documents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authorized can insert documents" ON public.documents
  FOR INSERT TO authenticated WITH CHECK (public.check_user_permission('CREATE', 'documents', project_id));

CREATE POLICY "Authorized can update documents" ON public.documents
  FOR UPDATE TO authenticated USING (public.check_user_permission('EDIT', 'documents', project_id));

CREATE POLICY "Authorized can delete documents" ON public.documents
  FOR DELETE TO authenticated USING (public.check_user_permission('DELETE', 'documents', project_id));

-- Links:
CREATE POLICY "Active members can view links" ON public.links
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authorized can insert links" ON public.links
  FOR INSERT TO authenticated WITH CHECK (public.check_user_permission('CREATE', 'links', project_id));

CREATE POLICY "Authorized can update links" ON public.links
  FOR UPDATE TO authenticated USING (public.check_user_permission('EDIT', 'links', project_id));

CREATE POLICY "Authorized can delete links" ON public.links
  FOR DELETE TO authenticated USING (public.check_user_permission('DELETE', 'links', project_id));

-- Assets:
CREATE POLICY "Active members can view assets" ON public.assets
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authorized can manage assets" ON public.assets
  FOR ALL TO authenticated USING (public.check_user_permission('MANAGE', 'assets', project_id));

-- Permissions: Only Admins can view and manage permissions
CREATE POLICY "Admins manage permissions" ON public.permissions
  FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Users can view own permissions" ON public.permissions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Activity Logs:
CREATE POLICY "Active members can view activity" ON public.activity_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert activity" ON public.activity_logs
  FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

-- 14. SUPABASE STORAGE SETUP FOR DOCUMENTS & PDFS (Max 5MB)
-- Insert 'documents' bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  5242880, -- 5MB in bytes (5 * 1024 * 1024)
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown', 'application/octet-stream']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

-- Storage RLS Policies for 'documents' bucket
CREATE POLICY "Public / Authenticated can view documents storage"
  ON storage.objects FOR SELECT
  TO authenticated, anon
  USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can upload documents storage"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Authenticated users can update/delete own documents storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents');

-- 15. AUTO-CONFIRM USER EMAIL ON SIGNUP
-- Automatically verifies created users without requiring manual email link verification
CREATE OR REPLACE FUNCTION public.handle_auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auto_confirm_user();


