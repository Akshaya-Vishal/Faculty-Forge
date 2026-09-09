-- ==============================================================================
-- Faculty Forge - Fresh Clean Database Setup (Drop & Recreate)
-- Run this in your Supabase Project -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable Required Extensions
create extension if not exists pgcrypto;

-- 2. Drop Existing Tables (Clean Slate)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_auth_user();

drop table if exists public.review_comments cascade;
drop table if exists public.questions cascade;
drop table if exists public.question_papers cascade;
drop table if exists public.subjects cascade;
drop table if exists public.semesters cascade;
drop table if exists public.years cascade;
drop table if exists public.departments cascade;
drop table if exists public.otp_codes cascade;
drop table if exists public.profiles cascade;

-- ==============================================================================
-- 3. Create Tables
-- ==============================================================================

-- PROFILES (Linked to Supabase Auth)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null default 'faculty' check (role in ('faculty', 'admin')),
  department text default 'Artificial Intelligence & Data Science',
  designation text default 'Faculty Member',
  employee_id text,
  college text default 'Faculty Forge University',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- DEPARTMENTS
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- YEARS
create table public.years (
  id uuid primary key default gen_random_uuid(),
  year_number integer not null unique,
  display_name text not null,
  created_at timestamptz not null default now()
);

-- SEMESTERS
create table public.semesters (
  id uuid primary key default gen_random_uuid(),
  semester_number integer not null unique,
  display_name text not null,
  year_id uuid references public.years(id) on delete set null,
  created_at timestamptz not null default now()
);

-- SUBJECTS / COURSES
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  course_code text,
  name text not null,
  course_name text,
  department text not null default 'Artificial Intelligence & Data Science',
  department_name text default 'Artificial Intelligence & Data Science',
  department_id text default 'ADS',
  department_code text default 'ADS',
  semester integer not null default 1,
  semester_id text,
  year integer not null default 1,
  year_id text,
  credits integer not null default 3,
  regulation text not null default 'KCET 2021',
  total_units integer not null default 5,
  course_outcomes jsonb not null default '[]'::jsonb,
  units jsonb not null default '[]'::jsonb,
  assigned_faculty_id uuid references public.profiles(id) on delete set null,
  assigned_faculty_name text,
  assigned_faculty_email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- QUESTION PAPERS
create table public.question_papers (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  exam_name text not null,
  internal_type text not null default 'Internal 1',
  academic_year text not null default '2024-2025',
  semester text not null default 'Odd',
  department text not null default 'Artificial Intelligence & Data Science',
  subject_id uuid references public.subjects(id) on delete set null,
  course_code text,
  course_name text,
  max_marks integer not null default 50,
  duration_minutes integer not null default 90,
  status text not null default 'Draft' check (status in ('Draft', 'Submitted', 'Under Review', 'Revision Requested', 'Approved', 'Rejected')),
  sections jsonb not null default '[]'::jsonb,
  general_instructions jsonb not null default '[]'::jsonb,
  set_label text not null default 'Set A',
  review_comments jsonb not null default '[]'::jsonb,
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- QUESTIONS
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid references public.question_papers(id) on delete cascade,
  question_paper_id uuid references public.question_papers(id) on delete cascade,
  question_number integer,
  display_order integer default 1,
  text text not null,
  marks integer not null default 2,
  unit integer not null default 1,
  bloom_level text default 'L2',
  course_outcome text default 'CO1',
  created_at timestamptz not null default now()
);

-- REVIEW COMMENTS
create table public.review_comments (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid not null references public.question_papers(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text,
  author_role text,
  section_ref text,
  comment text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

-- OTP CODES
create table public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 4. Create Indexes
-- ==============================================================================
create index idx_profiles_email on public.profiles(email);
create index idx_subjects_dept on public.subjects(department);
create index idx_subjects_code on public.subjects(code);
create index idx_question_papers_faculty on public.question_papers(faculty_id);
create index idx_question_papers_status on public.question_papers(status);
create index idx_otp_codes_email_expires on public.otp_codes(email, expires_at);

-- ==============================================================================
-- 5. Enable Row Level Security (RLS)
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.years enable row level security;
alter table public.semesters enable row level security;
alter table public.subjects enable row level security;
alter table public.question_papers enable row level security;
alter table public.questions enable row level security;
alter table public.review_comments enable row level security;
alter table public.otp_codes enable row level security;

-- Profiles Policies
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Public Read for Catalog Data (Departments, Years, Semesters, Subjects)
create policy "Anyone can view departments"
  on public.departments for select
  using (true);

create policy "Anyone can view years"
  on public.years for select
  using (true);

create policy "Anyone can view semesters"
  on public.semesters for select
  using (true);

create policy "Anyone can view subjects"
  on public.subjects for select
  using (true);

-- Question Papers Policies
create policy "Faculty can create question papers"
  on public.question_papers for insert
  with check (auth.uid() = faculty_id);

create policy "Users can view relevant question papers"
  on public.question_papers for select
  using (auth.uid() = faculty_id or auth.role() = 'authenticated');

create policy "Faculty can update their own question papers"
  on public.question_papers for update
  using (auth.uid() = faculty_id or auth.role() = 'authenticated');

-- Questions Policies
create policy "Authenticated users can manage questions"
  on public.questions for all
  using (auth.role() = 'authenticated');

-- Review Comments Policies
create policy "Authenticated users can view comments"
  on public.review_comments for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can add comments"
  on public.review_comments for insert
  with check (auth.role() = 'authenticated');

-- OTP Policies
create policy "Service role can manage OTP codes"
  on public.otp_codes for all
  using (auth.role() = 'service_role');

create policy "Authenticated users can check their own OTP"
  on public.otp_codes for select
  using (true);

-- ==============================================================================
-- 6. User Signup Auto-Sync Trigger
-- ==============================================================================
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    role,
    department,
    designation,
    employee_id,
    college
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'faculty'),
    coalesce(new.raw_user_meta_data->>'department', 'Artificial Intelligence & Data Science'),
    coalesce(new.raw_user_meta_data->>'designation', 'Faculty Member'),
    coalesce(new.raw_user_meta_data->>'employee_id', 'USER-' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'college', 'Faculty Forge University')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role,
    department = coalesce(excluded.department, profiles.department),
    designation = coalesce(excluded.designation, profiles.designation),
    employee_id = coalesce(excluded.employee_id, profiles.employee_id),
    college = coalesce(excluded.college, profiles.college),
    updated_at = now();

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- ==============================================================================
-- 7. Seed Initial Data
-- ==============================================================================

-- Departments
insert into public.departments (name, code, description) values
  ('Artificial Intelligence & Data Science', 'ADS', 'Department of AI & Data Science'),
  ('Computer Science & Engineering', 'CSE', 'Department of Computer Science & Engineering'),
  ('Information Technology', 'IT', 'Department of Information Technology'),
  ('Electronics & Communication Engineering', 'ECE', 'Department of Electronics & Communication Engineering'),
  ('Mechanical Engineering', 'MECH', 'Department of Mechanical Engineering'),
  ('Civil Engineering', 'CIVIL', 'Department of Civil Engineering')
on conflict (code) do nothing;

-- Academic Years
insert into public.years (year_number, display_name) values
  (1, 'First Year'),
  (2, 'Second Year'),
  (3, 'Third Year'),
  (4, 'Fourth Year')
on conflict (year_number) do nothing;

-- Semesters
insert into public.semesters (semester_number, display_name) values
  (1, 'Semester 1'),
  (2, 'Semester 2'),
  (3, 'Semester 3'),
  (4, 'Semester 4'),
  (5, 'Semester 5'),
  (6, 'Semester 6'),
  (7, 'Semester 7'),
  (8, 'Semester 8')
on conflict (semester_number) do nothing;

-- Sample Curriculum Subjects
insert into public.subjects (code, course_code, name, course_name, department, department_code, year, semester, regulation) values
  ('MA2201', 'MA2201', 'LINEAR ALGEBRA AND BOUNDARY VALUE PROBLEMS', 'LINEAR ALGEBRA AND BOUNDARY VALUE PROBLEMS', 'Artificial Intelligence & Data Science', 'ADS', 2, 3, 'KCET 2021'),
  ('AI2201', 'AI2201', 'ARTIFICIAL INTELLIGENCE', 'ARTIFICIAL INTELLIGENCE', 'Artificial Intelligence & Data Science', 'ADS', 2, 3, 'KCET 2021'),
  ('AI2202', 'AI2202', 'DATA STRUCTURES AND ALGORITHMS', 'DATA STRUCTURES AND ALGORITHMS', 'Artificial Intelligence & Data Science', 'ADS', 2, 3, 'KCET 2021'),
  ('CS2202', 'CS2202', 'OBJECT ORIENTED PROGRAMMING USING JAVA', 'OBJECT ORIENTED PROGRAMMING USING JAVA', 'Artificial Intelligence & Data Science', 'ADS', 2, 3, 'KCET 2021'),
  ('CS2203', 'CS2203', 'SYSTEM SOFTWARE AND OPERATING SYSTEMS', 'SYSTEM SOFTWARE AND OPERATING SYSTEMS', 'Artificial Intelligence & Data Science', 'ADS', 2, 3, 'KCET 2021'),
  ('EC2201', 'EC2201', 'DIGITAL SYSTEM DESIGN AND MICROPROCESSORS', 'DIGITAL SYSTEM DESIGN AND MICROPROCESSORS', 'Artificial Intelligence & Data Science', 'ADS', 2, 3, 'KCET 2021'),
  ('AI2301', 'AI2301', 'BIG DATA TOOLS AND TECHNIQUES', 'BIG DATA TOOLS AND TECHNIQUES', 'Artificial Intelligence & Data Science', 'ADS', 3, 5, 'KCET 2021'),
  ('AI2302', 'AI2302', 'COMPUTER NETWORKS AND SECURITY', 'COMPUTER NETWORKS AND SECURITY', 'Artificial Intelligence & Data Science', 'ADS', 3, 5, 'KCET 2021'),
  ('AI2303', 'AI2303', 'FUNDAMENTALS OF DEEP LEARNING', 'FUNDAMENTALS OF DEEP LEARNING', 'Artificial Intelligence & Data Science', 'ADS', 3, 5, 'KCET 2021'),
  ('CS2301', 'CS2301', 'INTERNET PROGRAMMING', 'INTERNET PROGRAMMING', 'Artificial Intelligence & Data Science', 'ADS', 3, 5, 'KCET 2021'),
  ('AI2401', 'AI2401', 'DATA EXPLORATION AND VISUALIZATION', 'DATA EXPLORATION AND VISUALIZATION', 'Artificial Intelligence & Data Science', 'ADS', 4, 7, 'KCET 2021'),
  ('GE2401', 'GE2401', 'UNIVERSAL HUMAN VALUES AND ETHICS', 'UNIVERSAL HUMAN VALUES AND ETHICS', 'Artificial Intelligence & Data Science', 'ADS', 4, 7, 'KCET 2021'),
  ('CS2401', 'CS2401', 'CLOUD COMPUTING ARCHITECTURES', 'CLOUD COMPUTING ARCHITECTURES', 'Computer Science & Engineering', 'CSE', 4, 7, 'KCET 2021'),
  ('CS2201', 'CS2201', 'DATABASE MANAGEMENT SYSTEMS', 'DATABASE MANAGEMENT SYSTEMS', 'Computer Science & Engineering', 'CSE', 2, 3, 'KCET 2021')
on conflict do nothing;
