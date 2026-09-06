import { Profile, Permission, PermissionType, ResourceType } from '../types';

/**
 * Centralized Permission Engine for SOT Archive
 * 
 * Rules:
 * 1. Admin has access to everything
 * 2. Inactive members have no permissions
 * 3. Default for active member is VIEW on standard resources
 * 4. Project-specific permissions override or extend global permissions
 */
export function can(
  profile: Profile | null,
  userPermissions: Permission[],
  requiredPermission: PermissionType,
  resourceType: ResourceType,
  resourceId?: string | null
): boolean {
  if (!profile || !profile.is_active) {
    return false;
  }

  // 1. Admin always has full access
  if (profile.role === 'admin') {
    return true;
  }

  // 2. Default is VIEW only for all authenticated active members
  if (requiredPermission === 'VIEW') {
    return true;
  }

  // 3. Check for specific permissions
  // Priority: Specific resource override -> Project level -> Global resource level -> Global
  return userPermissions.some(perm => {
    // Exact permission match or MANAGE covers EDIT/CREATE/DELETE
    const permMatches = perm.permission === requiredPermission || 
      (perm.permission === 'MANAGE' && ['EDIT', 'CREATE', 'DELETE'].includes(requiredPermission));

    if (!permMatches) return false;

    // Check scope:
    // A. Global scope wildcard
    if (perm.resource_type === 'global') {
      return true;
    }

    // B. Resource type match (e.g. all 'documents' or all 'meetings')
    if (perm.resource_type === resourceType && (!perm.resource_id || perm.resource_id === resourceId)) {
      return true;
    }

    // C. Project-level match when resource belongs to project
    if (perm.resource_type === 'project' && perm.resource_id === resourceId) {
      return true;
    }

    return false;
  });
}

export function formatRole(role: string): string {
  return role === 'admin' ? 'Administrator' : 'Team Member';
}
