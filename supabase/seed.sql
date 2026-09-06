-- ==============================================================================
-- SOT ARCHIVE: SUPABASE INITIAL SEED DATA SCRIPT
-- Source: Official Streets of Tripura Website (https://streetsoftripura.in/)
-- Includes:
-- 1. Automatic profile provisioning trigger for Auth users
-- 2. Initial Organization Knowledge Articles (About, Our Team, Our Advisory)
-- 3. Initial Team & Advisory profiles
-- 4. Initial Projects & Resources
-- ==============================================================================

-- 1. Helper trigger to automatically create or link a profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_role public.user_role;
  v_role_text TEXT;
BEGIN
  v_role_text := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'member'));
  
  IF v_role_text = 'admin' THEN
    v_role := 'admin'::public.user_role;
  ELSE
    v_role := 'member'::public.user_role;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, 'member'), '@', 1)),
    v_role,
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = CASE 
      WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' 
      THEN EXCLUDED.full_name 
      ELSE public.profiles.full_name 
    END,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user error: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

GRANT USAGE ON SCHEMA public TO supabase_auth_admin, service_role, postgres;
GRANT ALL ON TABLE public.profiles TO supabase_auth_admin, service_role, postgres;

-- ==============================================================================
-- 2. ORGANIZATION KNOWLEDGE BASE ARTICLES
-- Category: Organization
-- Source: https://streetsoftripura.in/
-- ==============================================================================

INSERT INTO public.knowledge_articles (id, title, category, project_id, tags, content_markdown)
VALUES
  (
    '00000000-0000-0000-0000-000000000101',
    'About Streets of Tripura',
    'Organization',
    NULL,
    ARRAY['Organization', 'About', 'Mission', 'Foundational'],
    '# About Streets of Tripura

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
*Source: [https://streetsoftripura.in/](https://streetsoftripura.in/)*'
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'Our Team',
    'Organization',
    NULL,
    ARRAY['Organization', 'Team Structure', 'Leadership'],
    '# Streets of Tripura — Core Team Structure

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
*Source: [https://streetsoftripura.in/](https://streetsoftripura.in/)*'
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    'Our Advisory',
    'Organization',
    NULL,
    ARRAY['Organization', 'Advisory', 'Mentors'],
    '# Streets of Tripura — Advisory Board

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
*Source: [https://streetsoftripura.in/](https://streetsoftripura.in/)*'
  )
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  content_markdown = EXCLUDED.content_markdown,
  tags = EXCLUDED.tags,
  updated_at = NOW();

-- ==============================================================================
-- 3. SEED INITIAL PROJECTS
-- ==============================================================================
INSERT INTO public.projects (id, name, description, status, start_date, end_date, cover_image)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'LENS 5.0', 'Streets of Tripura flagship annual photography & visual exhibition in Agartala.', 'active', '2026-08-01', '2026-11-30', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'),
  ('00000000-0000-0000-0000-000000000002', 'Tripura Heritage Docuseries', 'Archival video and photo documentation of indigenous crafts, architecture, and folk heritage.', 'planning', '2026-10-01', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 4. SEED INITIAL OFFICIAL LINKS
-- ==============================================================================
INSERT INTO public.links (id, title, description, url, category, project_id)
VALUES 
  (
    '00000000-0000-0000-0000-000000000030',
    'Streets of Tripura Official Website',
    'Main public portal of Streets of Tripura community.',
    'https://streetsoftripura.in/',
    'Social',
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000031',
    '@streetsoftripura Official Instagram Handle',
    'Primary public broadcasting and visual storytelling channel.',
    'https://instagram.com/streetsoftripura',
    'Social',
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000032',
    'LENS 5.0 Official Sponsorship Pitch Deck',
    'Master Canva presentation deck for brand sponsors & exhibition catalogue layout.',
    'https://www.canva.com/design/example-sot-pitch',
    'Canva',
    '00000000-0000-0000-0000-000000000001'
  )
ON CONFLICT (id) DO NOTHING;
