# Authentication Troubleshooting Guide

## Current Issues
1. **Login doesn't redirect to dashboard**
2. **Dashboard redirects to login even when logged in**
3. **Email confirmation gives 404 error**

## Step-by-Step Debugging

### Step 1: Check Environment Variables
Make sure your `.env.local` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2: Test Basic Authentication
1. Start your dev server: `npm run dev`
2. Go to: `http://localhost:3000/debug-auth`
3. Check the auth state in the debug panel
4. Try the test login/logout buttons

### Step 3: Check Browser Console
1. Open browser dev tools (F12)
2. Go to Console tab
3. Look for any errors when:
   - Loading the page
   - Trying to login
   - Navigating to dashboard

### Step 4: Check Network Tab
1. Open Network tab in dev tools
2. Try logging in
3. Look for failed requests to Supabase
4. Check if cookies are being set

### Step 5: Check Supabase Configuration
In your Supabase dashboard:

1. **Authentication > Settings**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: 
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/dashboard`

2. **Authentication > URL Configuration**:
   - Additional Redirect URLs should include your callback

### Step 6: Test Authentication Flow

#### Manual Test:
1. Go to `/debug-auth`
2. Click "Clear All Storage"
3. Go to `/auth/signup`
4. Create a new account
5. Check email for confirmation
6. Click confirmation link
7. Try logging in at `/auth/login`

#### Check Each Step:
- ✅ Signup works
- ✅ Email confirmation works
- ✅ Login works
- ✅ Redirect to dashboard works
- ✅ Dashboard loads without redirect

### Step 7: Common Fixes

#### Fix 1: Clear Browser Storage
```javascript
// Run in browser console
localStorage.clear()
sessionStorage.clear()
// Reload page
location.reload()
```

#### Fix 2: Check Middleware Logs
Look in your terminal for middleware logs:
```
Middleware - Path: /dashboard User: user@example.com
```

#### Fix 3: Force Page Reload After Login
The login page now uses `window.location.href` instead of `router.push()` to ensure middleware picks up the new session.

#### Fix 4: Verify Cookie Settings
Check if auth cookies are being set:
1. Open dev tools > Application > Cookies
2. Look for Supabase auth cookies
3. They should have proper domain and path settings

### Step 8: Test Different Scenarios

#### Scenario 1: Fresh Login
1. Clear all storage
2. Go to login page
3. Enter credentials
4. Should redirect to dashboard

#### Scenario 2: Page Refresh
1. Login successfully
2. Refresh the dashboard page
3. Should stay on dashboard (not redirect to login)

#### Scenario 3: Direct Dashboard Access
1. Login successfully
2. Open new tab
3. Go directly to `/dashboard`
4. Should load dashboard (not redirect to login)

### Step 9: Debug Middleware
The middleware now includes console logs. Check your terminal for:
```
Middleware - Path: /dashboard User: user@example.com
Redirecting authenticated user to dashboard
Redirecting unauthenticated user to login
```

### Step 10: Check Database
In Supabase dashboard:
1. Go to Table Editor
2. Check the `users` table
3. Verify your user record exists
4. Check the `auth.users` table in SQL Editor:
```sql
SELECT * FROM auth.users WHERE email = 'your-email@example.com';
```

## Common Solutions

### Solution 1: Session Not Persisting
**Problem**: User gets logged out on page refresh
**Fix**: Check if cookies are being blocked or cleared

### Solution 2: Middleware Not Working
**Problem**: Middleware doesn't detect authenticated user
**Fix**: Ensure environment variables are correct and server is restarted

### Solution 3: Redirect Loop
**Problem**: Constant redirects between login and dashboard
**Fix**: Check middleware logic and authentication state

### Solution 4: Email Confirmation 404
**Problem**: Email confirmation links don't work
**Fix**: Verify callback route exists and Supabase redirect URLs are correct

## Testing Commands

```bash
# Install dependencies (skip problematic ones)
npm install --omit=optional

# Start development server
npm run dev

# Check if auth is working
curl -X POST http://localhost:3000/api/auth/test
```

## Quick Fixes to Try

1. **Restart Development Server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Clear Browser Data**
   - Clear cookies for localhost
   - Clear localStorage
   - Hard refresh (Ctrl+Shift+R)

3. **Check Supabase Status**
   - Go to Supabase dashboard
   - Check if project is active
   - Verify API keys are correct

4. **Test with Different Browser**
   - Try incognito/private mode
   - Test with different browser

## Still Having Issues?

If authentication still doesn't work:

1. Check the `/debug-auth` page for detailed state
2. Look at browser console errors
3. Check Supabase logs in dashboard
4. Verify all environment variables
5. Test with the `/test-auth` page

The most common issue is that the session isn't being properly maintained between client and server. The middleware updates should fix this by properly handling cookies and forcing page reloads after authentication.
