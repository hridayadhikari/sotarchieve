/**
 * Cloudinary Upload Helper for SOT Archive
 * 
 * Supports secure unsigned/signed presets or direct uploads to organized SOT folders:
 * - sot-archive/assets/
 * - sot-archive/documents/
 * - sot-archive/projects/
 */

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  thumbnail_url?: string;
}

export async function uploadToCloudinary(
  file: File,
  folder: 'assets' | 'documents' | 'projects' | 'avatars' = 'documents',
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResponse> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'sot_archive_unsigned';

  if (!cloudName) {
    // If not yet configured, create a mock fallback for local testing & development
    console.warn('VITE_CLOUDINARY_CLOUD_NAME is not configured. Simulating upload.');
    return new Promise((resolve) => {
      let percent = 0;
      const interval = setInterval(() => {
        percent += 25;
        if (onProgress) onProgress(percent);
        if (percent >= 100) {
          clearInterval(interval);
          const fakeUrl = URL.createObjectURL(file);
          resolve({
            secure_url: fakeUrl,
            public_id: `sot-archive/${folder}/${Date.now()}_${file.name}`,
            format: file.type.split('/')[1] || 'raw',
            bytes: file.size,
            thumbnail_url: file.type.startsWith('image/') ? fakeUrl : undefined
          });
        }
      }, 100);
    });
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', `sot-archive/${folder}`);

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Failed to upload file to Cloudinary');
  }

  const data = await response.json();
  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    format: data.format,
    bytes: data.bytes,
    thumbnail_url: data.secure_url.includes('/image/upload/') 
      ? data.secure_url.replace('/image/upload/', '/image/upload/c_thumb,w_300,h_300/') 
      : undefined
  };
}
