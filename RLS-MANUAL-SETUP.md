# Manual RLS Policy Setup for Chef-do-Cotidiano

Since the MCP server is in read-only mode, you need to manually apply the Row Level Security (RLS) policies through the Supabase dashboard.

## Steps to Apply RLS Policies

1. **Access Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Navigate to your project: https://supabase.com/dashboard/project/fojzlhvcpkbfswufvakq

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query" to create a new SQL script

3. **Apply the Complete RLS Script**
   - Copy the entire content from `enhanced-rls-policies.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute all policies at once

## What the RLS Policies Do

### Tables with RLS Enabled
- `profiles` - User profile data
- `recipes` - Recipe content and metadata
- `categories` - Recipe categories
- `courses` - Online course content
- `blog_posts` - Blog articles
- `settings` - Application configuration

### Key Security Rules
- **Public Read Access**: Published recipes, categories, courses, and blog posts are readable by everyone
- **Author Access**: Users can only edit their own content (recipes, courses, blog posts)
- **Admin Access**: Admin and super_admin roles can manage all content
- **Profile Security**: Users can only view/edit their own profiles
- **Settings Security**: Only admins can manage application settings

### Authentication-Based Filtering
All policies use `auth.uid()` to ensure users can only access their own data or public content. The `hasPermission` function checks role hierarchy:
- `user` < `chef` < `admin` < `super_admin`

## Verification

After applying the policies, test that:
1. Non-authenticated users can view published content but not edit anything
2. Regular users can create/edit their own recipes but not others'
3. Admins can manage all content
4. Settings are only accessible to admins

## Troubleshooting

If you encounter errors:
1. Make sure all tables exist before applying policies
2. Check that the `profiles` table has the correct role column
3. Verify that the `hasPermission` function is created properly
4. Apply policies one table at a time if the full script fails

The policies are designed to work with the existing authentication system and role hierarchy defined in the application.
