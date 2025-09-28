# Quick Setup Guide - Fix Authentication Issues

## Step 1: Install Dependencies (Skip Canvas)

Run this command to install without the problematic canvas package:

```bash
npm install --omit=optional
```

Or manually install the core dependencies:

```bash
npm install next@14.1.0 react@^18.2.0 react-dom@^18.2.0 @supabase/supabase-js@^2.39.0 @supabase/ssr@^0.1.0 tailwindcss@^3.4.0 typescript@^5.3.0 @types/node@^20.11.0 @types/react@^18.2.0 @types/react-dom@^18.2.0
```

## Step 2: Set Up Environment Variables

Create `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Configure Supabase Authentication

In your Supabase dashboard:

1. Go to **Authentication > Settings**
2. Add these URLs to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`

3. Set **Site URL** to: `http://localhost:3000`

## Step 4: Test Authentication

1. Start the development server:
```bash
npm run dev
```

2. Visit: `http://localhost:3000/test-auth`

3. Try the following:
   - Sign up with email/password
   - Check your email for confirmation link
   - Click the confirmation link
   - Try logging in

## Step 5: Fix Common Issues

### Issue 1: 404 on Email Confirmation

**Problem**: Email confirmation links give 404 error
**Solution**: The auth callback route should handle this. Make sure:
- `/auth/callback` route exists
- Supabase redirect URLs are configured correctly

### Issue 2: Login Doesn't Redirect to Dashboard

**Problem**: After login, user stays on login page
**Solution**: Check middleware and authentication state:
- Middleware should redirect authenticated users
- Login page should check auth state and redirect

### Issue 3: TypeScript Errors

**Problem**: JSX element errors
**Solution**: These are due to missing dependencies. Install core packages first:

```bash
npm install @types/react @types/react-dom
```

## Step 6: Debug Authentication Flow

Use the test page at `/test-auth` to debug:

1. Check if Supabase connection works
2. Test signup/login flow
3. Verify session persistence
4. Check redirect URLs

## Step 7: Manual Testing Steps

1. **Sign Up**:
   - Go to `/auth/signup`
   - Enter email/password
   - Check email for confirmation
   - Click confirmation link

2. **Sign In**:
   - Go to `/auth/login`
   - Enter credentials
   - Should redirect to `/dashboard`

3. **Google OAuth**:
   - Click "Continue with Google"
   - Should redirect to Google
   - After authorization, should return to dashboard

## Troubleshooting

### If email confirmation gives 404:
- Check Supabase redirect URLs
- Verify auth callback route exists
- Check environment variables

### If login doesn't redirect:
- Check middleware configuration
- Verify authentication state
- Check browser console for errors

### If dependencies fail to install:
- Remove `node_modules` and `package-lock.json`
- Install core packages first
- Skip optional dependencies

## Next Steps

Once authentication is working:
1. Test the dashboard page
2. Try creating an audit
3. Test the billing flow
4. Deploy to Vercel

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs
3. Verify environment variables
4. Test with the `/test-auth` page
