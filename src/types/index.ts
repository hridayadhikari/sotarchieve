export type UserRole = 'admin' | 'member';

export type PermissionType = 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE' | 'MANAGE';

export type ResourceType = 'global' | 'project' | 'knowledge' | 'meetings' | 'documents' | 'links' | 'assets';

export type ProjectStatus = 'active' | 'planning' | 'archived';

export type AssetType = 'Logo' | 'Photo' | 'Poster' | 'Branding' | 'Other';

export type LinkCategory = 'Canva' | 'Google Drive' | 'Google Forms' | 'Google Docs' | 'Social' | 'Other';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  name?: string;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  user_id: string;
  permission: PermissionType;
  resource_type: ResourceType;
  resource_id?: string | null;
  granted_by?: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  cover_image?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content_markdown: string;
  category: string;
  project_id?: string | null;
  tags?: string[];
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  // Join fields
  project?: Project;
  author?: Profile;
}

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  assignee?: string;
}

export interface MeetingAttachment {
  name: string;
  url: string;
  type: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  project_id?: string | null;
  attendees: string[];
  agenda?: string;
  discussion?: string;
  decisions?: string;
  action_items: ActionItem[];
  attachments: MeetingAttachment[];
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  project?: Project;
}

export interface DocumentResource {
  id: string;
  title: string;
  description?: string;
  project_id?: string | null;
  category: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  project?: Project;
}

export interface LinkResource {
  id: string;
  title: string;
  description?: string;
  url: string;
  category: LinkCategory;
  project_id?: string | null;
  added_by?: string;
  created_at: string;
  updated_at: string;
  project?: Project;
}

export interface AssetResource {
  id: string;
  name: string;
  type: AssetType;
  project_id?: string | null;
  cloudinary_url: string;
  thumbnail_url?: string;
  public_id?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  project?: Project;
}

export interface ActivityLog {
  id: string;
  actor_id?: string;
  actor?: Profile;
  action: string;
  target_type: string;
  target_id?: string;
  details?: Record<string, any>;
  created_at: string;
}
