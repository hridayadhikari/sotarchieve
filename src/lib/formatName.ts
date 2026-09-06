/**
 * Helper utility to derive clean, human-readable full names
 * Never returns a raw email address.
 */

const KNOWN_EMAIL_NAME_MAP: Record<string, string> = {
  'contact@hridayadhikari.in': 'Hriday Adhikari',
  'hriday@streetsoftripura.in': 'Hriday Adhikari',
  'admin@streetsoftripura.in': 'Hriday Adhikari',
  'kaushik@streetsoftripura.in': 'Kaushik Deb',
  'pritam@streetsoftripura.in': 'Pritam Dalal',
  'sajib@streetsoftripura.in': 'Sajib Bhowmik',
  'ruhit@streetsoftripura.in': 'Ruhit Debnath',
  'ritwik@streetsoftripura.in': 'Ritwik Debroy',
  'alaknanda@streetsoftripura.in': 'Alaknanda Tamang',
  'papiya@streetsoftripura.in': 'Papiya Debnath',
  'ayush@streetsoftripura.in': 'Ayush Shil',
  'sushmita@streetsoftripura.in': 'Sushmita Majumder',
  'vibek@streetsoftripura.in': 'Vibek Roy'
};

export function formatDisplayName(
  nameOrProfile?: string | null,
  fallbackEmail?: string | null,
  userMetadata?: Record<string, any>
): string {
  // 1. Check if name is provided and is NOT an email
  if (nameOrProfile && typeof nameOrProfile === 'string') {
    const trimmed = nameOrProfile.trim();
    if (trimmed && !trimmed.includes('@') && trimmed !== 'Member' && trimmed !== 'Team Member') {
      return trimmed;
    }
  }

  // 2. Check metadata
  if (userMetadata) {
    const metaName = userMetadata.full_name || userMetadata.name;
    if (metaName && typeof metaName === 'string' && !metaName.includes('@')) {
      return metaName.trim();
    }
  }

  // 3. Match against known emails (case-insensitive)
  const emailCandidate = (fallbackEmail || (nameOrProfile && nameOrProfile.includes('@') ? nameOrProfile : ''))
    .toLowerCase()
    .trim();

  if (emailCandidate && KNOWN_EMAIL_NAME_MAP[emailCandidate]) {
    return KNOWN_EMAIL_NAME_MAP[emailCandidate];
  }

  // 4. If email contains known name patterns (e.g. hridayadhikari in domain or username)
  if (emailCandidate) {
    if (emailCandidate.includes('hriday')) return 'Hriday Adhikari';
    if (emailCandidate.includes('kaushik')) return 'Kaushik Deb';
    if (emailCandidate.includes('pritam')) return 'Pritam Dalal';
    if (emailCandidate.includes('sajib')) return 'Sajib Bhowmik';
    if (emailCandidate.includes('ruhit')) return 'Ruhit Debnath';
    if (emailCandidate.includes('ritwik')) return 'Ritwik Debroy';
    if (emailCandidate.includes('alaknanda')) return 'Alaknanda Tamang';
    if (emailCandidate.includes('papiya')) return 'Papiya Debnath';
    if (emailCandidate.includes('ayush')) return 'Ayush Shil';
    if (emailCandidate.includes('sushmita')) return 'Sushmita Majumder';
    if (emailCandidate.includes('vibek')) return 'Vibek Roy';

    // Parse email prefix or domain part into readable words: e.g. "john.doe" -> "John Doe"
    const prefix = emailCandidate.split('@')[0];
    if (prefix && prefix !== 'contact' && prefix !== 'admin' && prefix !== 'info' && prefix !== 'support') {
      const parts = prefix.split(/[._\-\+0-9]+/).filter(Boolean);
      if (parts.length > 0) {
        return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
      }
    }

    // If prefix is generic like contact@hridayadhikari.in, check the domain name
    const domainPart = emailCandidate.split('@')[1]?.split('.')[0];
    if (domainPart && domainPart !== 'gmail' && domainPart !== 'yahoo' && domainPart !== 'outlook' && domainPart !== 'streetsoftripura') {
      const parts = domainPart.split(/[._\-\+0-9]+/).filter(Boolean);
      if (parts.length > 0) {
        return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
      }
    }
  }

  return nameOrProfile && !nameOrProfile.includes('@') ? nameOrProfile : 'Team Member';
}
