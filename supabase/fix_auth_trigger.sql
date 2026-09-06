-- ==============================================================================
-- SOT ARCHIVE: MINIMAL FIX FOR AUTH USER CREATION
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. Correct the handle_new_user() trigger function:
--    - Set explicit search_path = public, auth (prevents search_path hijacking & schema resolution errors)
--    - Use safe role casting (avoids invalid enum cast error if user_metadata is empty/custom)
--    - Wrap in EXCEPTION block so Auth user creation is NEVER blocked
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
    -- Log warning and allow auth user creation to complete successfully
    RAISE WARNING 'handle_new_user error: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 2. Re-bind the trigger cleanly on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Explicitly grant permissions to supabase_auth_admin & service_role
GRANT USAGE ON SCHEMA public TO supabase_auth_admin, service_role, postgres;
GRANT ALL ON TABLE public.profiles TO supabase_auth_admin, service_role, postgres;
