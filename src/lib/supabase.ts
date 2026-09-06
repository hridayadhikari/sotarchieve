import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'
);

export const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit per file

export interface StorageUploadResult {
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
}

export async function uploadToSupabaseStorage(
  file: File,
  bucket: string = 'documents'
): Promise<StorageUploadResult> {
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 5 MB limit.`);
  }

  if (!isConfigured) {
    console.warn('Supabase not configured. Using local object URL fallback.');
    return {
      file_url: URL.createObjectURL(file),
      file_name: file.name,
      file_size: file.size,
      file_type: file.type || 'application/octet-stream'
    };
  }

  // Create unique file path: timestamp_sanitizedName
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${Date.now()}_${cleanName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream'
    });

  if (error) {
    throw new Error(error.message || 'Failed to upload document to Supabase Storage');
  }

  const { data: publicData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    file_url: publicData.publicUrl,
    file_name: file.name,
    file_size: file.size,
    file_type: file.type || 'application/octet-stream'
  };
}

