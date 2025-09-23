# Google OAuth Setup Guide

This guide explains how to set up Google OAuth authentication for the Educational RPG Tutor application.

## Prerequisites

- A Google Cloud Platform (GCP) account
- Access to the Google Cloud Console
- Supabase project with authentication enabled

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application" as the application type
   - Add authorized redirect URIs:
     - For development: `http://localhost:5173/auth/callback`
     - For production: `https://yourdomain.com/auth/callback`
     - **Important**: Also add your Supabase auth callback URL: `https://your-project-id.supabase.co/auth/v1/callback`

## Step 2: Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Enable Google provider:
   - Toggle "Enable sign in with Google"
   - Enter your Google Client ID
   - Enter your Google Client Secret
   - Set the redirect URL to: `https://your-project-id.supabase.co/auth/v1/callback`

## Step 3: Configure Environment Variables

Add the following environment variables to your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google OAuth Configuration (optional - handled by Supabase)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Note**: The Google credentials are primarily used by Supabase. The client-side app doesn't need direct access to the client secret.

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the sign-in page
3. Click "Continue with Google"
4. Complete the OAuth flow
5. You should be redirected to the age collection form for new users

## How It Works

### Authentication Flow

1. **User clicks "Continue with Google"**
   - Triggers `AuthService.signInWithGoogle()`
   - Redirects to Google OAuth consent screen

2. **Google OAuth callback**
   - User is redirected to `/auth/callback`
   - `OAuthCallback` component handles the response
   - Calls `AuthService.handleOAuthCallback()`

3. **Profile creation/verification**
   - For new users: redirects to `/auth/complete-setup`
   - For existing users: redirects to dashboard
   - Age collection is required for new OAuth users

4. **Age collection (new users only)**
   - `OAuthSetup` component collects age information
   - Calls `AuthService.completeOAuthSetup()`
   - Handles parental consent for users under 13

### Key Components

- **`GoogleSignInButton`**: Initiates OAuth flow
- **`OAuthCallback`**: Handles OAuth callback and user creation
- **`OAuthSetup`**: Collects age information for new OAuth users
- **`AuthService.signInWithGoogle()`**: Initiates OAuth flow
- **`AuthService.handleOAuthCallback()`**: Processes OAuth callback
- **`AuthService.completeOAuthSetup()`**: Completes user setup with age info

### Database Integration

OAuth users are created in the same `users` table as email/password users:
- Initial profile created with minimal information
- Age collection required before full access
- Parental consent flow applies to OAuth users under 13
- Same RLS policies and security measures apply

## Security Considerations

1. **Client Secret**: Never expose Google Client Secret in client-side code
2. **Redirect URIs**: Only add trusted domains to authorized redirect URIs
3. **HTTPS**: Always use HTTPS in production for OAuth callbacks
4. **Age Verification**: OAuth users must still complete age verification
5. **Parental Consent**: COPPA compliance applies to all authentication methods

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**
   - Ensure redirect URI in Google Console matches exactly
   - Include both your app URL and Supabase callback URL

2. **"OAuth callback error"**
   - Check Supabase logs for detailed error messages
   - Verify Google credentials in Supabase dashboard

3. **Age collection not working**
   - Check that `/auth/complete-setup` route is properly configured
   - Verify `OAuthSetup` component is imported correctly

4. **Parental consent not triggered**
   - Ensure age < 13 logic is working in `completeOAuthSetup`
   - Check that parental consent email system is configured

### Development vs Production

- **Development**: Use `http://localhost:5173` for redirect URIs
- **Production**: Use your actual domain with HTTPS
- **Supabase**: Always uses HTTPS regardless of environment

## Testing Checklist

- [ ] Google OAuth button appears on sign-in page
- [ ] Clicking button redirects to Google consent screen
- [ ] Successful OAuth redirects to age collection form
- [ ] Age collection form works correctly
- [ ] Users under 13 trigger parental consent flow
- [ ] Users 13+ can access dashboard immediately
- [ ] Existing OAuth users skip age collection
- [ ] Error handling works for failed OAuth attempts

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase OAuth Providers](https://supabase.com/docs/guides/auth/social-login)