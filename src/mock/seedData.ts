import { Profile, Project, KnowledgeArticle, Meeting, DocumentResource, LinkResource, AssetResource, Permission } from '../types';

export const mockProfileAdmin: Profile = {
  id: 'usr-admin-01',
  email: 'admin@streetsoftripura.in',
  full_name: 'Hriday Adhikari',
  role: 'admin',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const initialTeamProfiles: Profile[] = [
  { id: 'usr-sot-01', email: 'kaushik@streetsoftripura.in', full_name: 'Kaushik Deb', role: 'admin', is_active: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'usr-sot-02', email: 'pritam@streetsoftripura.in', full_name: 'Pritam Dalal', role: 'member', is_active: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'usr-sot-03', email: 'sajib@streetsoftripura.in', full_name: 'Sajib Bhowmik', role: 'member', is_active: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'usr-sot-04', email: 'ruhit@streetsoftripura.in', full_name: 'Ruhit Debnath', role: 'admin', is_active: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'usr-sot-05', email: 'hriday@streetsoftripura.in', full_name: 'Hriday Adhikari', role: 'admin', is_active: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'usr-sot-06', email: 'ritwik@streetsoftripura.in', full_name: 'Ritwik Debroy', role: 'member', is_active: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'usr-sot-07', email: 'alaknanda@streetsoftripura.in', full_name: 'Alaknanda Tamang', role: 'member', is_active: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'usr-sot-08', email: 'papiya@streetsoftripura.in', full_name: 'Papiya Debnath', role: 'member', is_active: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'usr-sot-09', email: 'ayush@streetsoftripura.in', full_name: 'Ayush Shil', role: 'member', is_active: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'usr-sot-10', email: 'sushmita@streetsoftripura.in', full_name: 'Sushmita Majumder', role: 'member', is_active: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'usr-sot-11', email: 'vibek@streetsoftripura.in', full_name: 'Vibek Roy', role: 'member', is_active: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }
];

export const mockProfileMember = initialTeamProfiles[1];
export const mockProfileViewer = initialTeamProfiles[6];

export const initialProjects: Project[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'LENS 5.0',
    description: 'Streets of Tripura flagship annual photography & visual exhibition in Agartala.',
    status: 'active',
    start_date: '2026-08-01',
    end_date: '2026-11-30',
    cover_image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-09-01T15:30:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Tripura Heritage Docuseries',
    description: 'Archival video and photo documentation of indigenous crafts, architecture, and folk heritage.',
    status: 'planning',
    start_date: '2026-10-01',
    created_at: '2026-08-15T12:00:00Z',
    updated_at: '2026-08-20T09:00:00Z'
  }
];

export const initialKnowledge: KnowledgeArticle[] = [
  {
    id: '00000000-0000-0000-0000-000000000101',
    title: 'About Streets of Tripura',
    category: 'Organization',
    project_id: null,
    tags: ['Organization', 'About', 'Mission'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    content_markdown: `# About Streets of Tripura

**Tagline**: *Connecting photographers and sharing stories from the streets.*

## Mission & Philosophy
Streets of Tripura is a photography community and movement dedicated to showcasing the essence of Tripura through photography. It provides a platform for budding and professional photographers and focuses on the hidden narratives of life, culture, and emotions that define Tripura.

## Core Initiatives & Activities
The organization conducts:
- **Exhibitions**: Curated visual galleries highlighting stories and frames from across the state.
- **Workshops**: Skill development, technical calibration, and artistic guidance.
- **Competitions**: Providing exposure and recognition for emerging talents.
- **Collaborations**: Partnering with regional artists, cultural entities, and media.
- **Photowalks**: Collective explorations capturing the daily life, heritage, and landscapes of Tripura.

---
*Source: [https://streetsoftripura.in/](https://streetsoftripura.in/)*`
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    title: 'Our Team',
    category: 'Organization',
    project_id: null,
    tags: ['Organization', 'Team Structure', 'Leadership'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    content_markdown: `# Streets of Tripura — Core Team Structure

This document records the official core leadership and executive team of Streets of Tripura.

### Executive Leadership
1. **Kaushik Deb**
   - **Role**: President
   - **Specialization**: Landscape, Travel & Street Photographer

2. **Pritam Dalal**
   - **Role**: Vice-President
   - **Specialization**: Landscape & Street Photographer

3. **Sajib Bhowmik**
   - **Role**: Secretary
   - **Specialization**: Landscape Photographer & Cinematographer

4. **Ruhit Debnath**
   - **Role**: Technical Head & Treasurer
   - **Specialization**: Street Photographer

### Department Heads & Executives
5. **Hriday Adhikari**
   - **Role**: Creative Head
   - **Specialization**: Landscape, Travel & Street Photographer

6. **Ritwik Debroy**
   - **Role**: Social Media Head
   - **Specialization**: Travel & Street Photographer

7. **Alaknanda Tamang**
   - **Role**: Event Management Head
   - **Specialization**: Travel & Street Photographer

8. **Papiya Debnath**
   - **Role**: PR Head
   - **Specialization**: Landscape & Street Photographer

9. **Ayush Shil**
   - **Role**: Creative Executive
   - **Specialization**: Landscape & Street Photographer

10. **Sushmita Majumder**
    - **Role**: Technical Executive
    - **Specialization**: Graphic Designer

11. **Vibek Roy**
    - **Role**: Executive Member
    - **Specialization**: Landscape & Street Photographer

---
*Source: [https://streetsoftripura.in/](https://streetsoftripura.in/)*`
  },
  {
    id: '00000000-0000-0000-0000-000000000103',
    title: 'Our Advisory',
    category: 'Organization',
    project_id: null,
    tags: ['Organization', 'Advisory', 'Mentors'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    content_markdown: `# Streets of Tripura — Advisory Board

The advisory panel brings seasoned guidance, artistic mentorship, and strategic direction to Streets of Tripura initiatives.

### Advisory Members
1. **Ratnadwip Saha**
   - **Type**: Advisor
   - **Specialization**: Street, Travel & Culture, Landscape, Wildlife Photographer

2. **Prasenjit Debnath**
   - **Type**: Advisor
   - **Specialization**: Filmmaker & Photographer

3. **Md. Yousof Alam**
   - **Type**: Advisor
   - **Specialization**: Street, Documentary & Landscape Photographer

---
*Source: [https://streetsoftripura.in/](https://streetsoftripura.in/)*`
  }
];

export const initialMeetings: Meeting[] = [
  {
    id: 'meet-lens5-01',
    title: 'LENS 5.0 Core Planning & Venue Finalization',
    date: '2026-09-05',
    project_id: '00000000-0000-0000-0000-000000000001',
    attendees: ['Hriday Adhikari', 'Kaushik Deb', 'Pritam Dalal', 'Ruhit Debnath'],
    agenda: '1. Nazrul Kalakshetra exhibition hall availability\n2. Sponsorship deck feedback\n3. Print vendor quotes for 60 archival prints',
    discussion: 'We reviewed 3 venue options in Agartala. Nazrul Kalakshetra has confirmed open dates for the second week of November. Pitch deck updated.',
    decisions: 'Finalized Nazrul Kalakshetra as the venue. Budget cap for print framing set at ₹45,000.',
    action_items: [
      { id: 'act-1', text: 'Sign booking agreement with Nazrul Kalakshetra authority', completed: false, assignee: 'Kaushik' },
      { id: 'act-2', text: 'Send proposal to 4 local banking & telecom sponsors', completed: true, assignee: 'Papiya' },
      { id: 'act-3', text: 'Curate top 80 shortlisted photo submissions', completed: false, assignee: 'Hriday' }
    ],
    attachments: [],
    created_at: '2026-09-05T14:00:00Z',
    updated_at: '2026-09-05T14:30:00Z'
  }
];

export const initialLinks: LinkResource[] = [
  {
    id: '00000000-0000-0000-0000-000000000030',
    title: 'Streets of Tripura Official Website',
    description: 'Main public portal of Streets of Tripura community.',
    url: 'https://streetsoftripura.in/',
    category: 'Social',
    project_id: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000031',
    title: '@streetsoftripura Official Instagram Handle',
    description: 'Primary public broadcasting and visual storytelling channel.',
    url: 'https://instagram.com/streetsoftripura',
    category: 'Social',
    project_id: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000032',
    title: 'LENS 5.0 Official Sponsorship Pitch Deck',
    description: 'Master Canva presentation deck for brand sponsors & exhibition catalogue layout.',
    url: 'https://www.canva.com/design/example-sot-pitch',
    category: 'Canva',
    project_id: '00000000-0000-0000-0000-000000000001',
    created_at: '2026-08-20T11:00:00Z',
    updated_at: '2026-08-20T11:00:00Z'
  }
];

export const initialDocuments: DocumentResource[] = [];
export const initialAssets: AssetResource[] = [];
export const initialPermissions: Permission[] = [];
