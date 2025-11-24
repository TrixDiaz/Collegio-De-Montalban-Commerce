# 🔐 Google OAuth Configuration Guide

This guide will help you set up Google OAuth authentication for your application.

## 📋 Prerequisites

1. A Google Cloud Platform (GCP) account
2. A GCP project created
3. OAuth consent screen configured
4. OAuth 2.0 Client ID credentials created

## 🚀 Step-by-Step Setup

### 1. Create OAuth 2.0 Credentials in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen first
6. Select **Web application** as the application type
7. Give it a name (e.g., "Tile Depot Commerce OAuth")

### 2. Configure Authorized JavaScript Origins

**For Production:**

```
https://tile-depot-commerce.vercel.app
```

**For Local Development (optional):**

```
http://localhost:3000
```

> **Note:** Authorized JavaScript origins are the domains from which your frontend application makes OAuth requests. This should be your frontend domain.

### 3. Configure Authorized Redirect URIs

**⚠️ CRITICAL:** The redirect URI must match exactly what your backend uses. Based on your backend route configuration:

**For Production:**

```
https://your-backend-domain.com/api/v1/oauth/google/callback
```

**For Local Development (optional):**

```
http://localhost:5000/api/v1/oauth/google/callback
```

> **Important:**
>
> - Replace `your-backend-domain.com` with your actual backend deployment URL
> - The path `/api/v1/oauth/google/callback` is fixed and must match exactly
> - Do NOT include a trailing slash
> - The URI is case-sensitive

### 4. Example Configuration

If your backend is deployed at `https://api.tile-depot-commerce.com`, your configuration should be:

**Authorized JavaScript Origins:**

```
https://tile-depot-commerce.vercel.app
```

**Authorized Redirect URIs:**

```
https://api.tile-depot-commerce.com/api/v1/oauth/google/callback
```

### 5. Get Your Credentials

After creating the OAuth client:

1. Copy the **Client ID** (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
2. Copy the **Client Secret** (looks like: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)

### 6. Set Environment Variables

Add these to your backend `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Backend URL (required for OAuth redirects)
BACKEND_URL=https://your-backend-domain.com

# Frontend URL (required for redirecting after OAuth)
FRONTEND_URL=https://tile-depot-commerce.vercel.app
```

## 🔍 How to Determine Your Redirect URI

The redirect URI is constructed as follows:

```
{BACKEND_URL}/api/v1/oauth/google/callback
```

Where:

- `{BACKEND_URL}` is your backend deployment URL (e.g., `https://api.tile-depot-commerce.com`)
- `/api/v1/oauth/google/callback` is the fixed callback route path

### Finding Your Backend URL

1. **Check your deployment platform:**

   - Railway: Check your service URL in the dashboard
   - Render: Check your web service URL
   - Heroku: Check your app URL
   - Vercel: Check your API deployment URL
   - Other platforms: Check your service/deployment URL

2. **Verify the route:**

   - Your backend route is mounted at `/api/v1/oauth` (see `backend/server.js`)
   - The Google callback route is `/google/callback` (see `backend/routes/oauth-routes.js`)
   - Full path: `/api/v1/oauth/google/callback`

3. **Test the endpoint:**
   - Visit: `https://your-backend-domain.com/api/v1/oauth/google`
   - This should redirect you to Google's OAuth consent screen
   - After authorization, Google will redirect to: `https://your-backend-domain.com/api/v1/oauth/google/callback`

## ✅ Verification Checklist

Before testing, ensure:

- [ ] OAuth consent screen is configured
- [ ] OAuth 2.0 Client ID is created
- [ ] Authorized JavaScript origins include your frontend URL
- [ ] Authorized redirect URI matches: `{BACKEND_URL}/api/v1/oauth/google/callback`
- [ ] `GOOGLE_CLIENT_ID` is set in backend environment variables
- [ ] `GOOGLE_CLIENT_SECRET` is set in backend environment variables
- [ ] `BACKEND_URL` is set in backend environment variables
- [ ] `FRONTEND_URL` is set in backend environment variables
- [ ] Backend is deployed and accessible
- [ ] Frontend is configured to use the correct backend URL

## 🧪 Testing the OAuth Flow

1. **Test the initiation endpoint:**

   ```
   GET https://your-backend-domain.com/api/v1/oauth/google
   ```

   This should redirect to Google's OAuth consent screen.

2. **After authorization:**

   - Google redirects to: `https://your-backend-domain.com/api/v1/oauth/google/callback?code=...`
   - Backend exchanges the code for tokens
   - Backend redirects to frontend with tokens: `https://tile-depot-commerce.vercel.app/?token=...&refresh=...&oauth=success`

3. **Common Errors:**

   **Error: "redirect_uri_mismatch"**

   - **Cause:** The redirect URI in Google Console doesn't match what the backend is sending
   - **Solution:** Verify the redirect URI in Google Console matches exactly: `{BACKEND_URL}/api/v1/oauth/google/callback`

   **Error: "invalid_client"**

   - **Cause:** Client ID or Client Secret is incorrect
   - **Solution:** Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in your environment variables

   **Error: "access_denied"**

   - **Cause:** User denied permission or OAuth consent screen not configured
   - **Solution:** Configure the OAuth consent screen in Google Cloud Console

## 📝 Quick Reference

### Google Console Configuration Summary

| Setting                           | Value                                                          |
| --------------------------------- | -------------------------------------------------------------- |
| **Application Type**              | Web application                                                |
| **Authorized JavaScript Origins** | `https://tile-depot-commerce.vercel.app`                       |
| **Authorized Redirect URIs**      | `https://your-backend-domain.com/api/v1/oauth/google/callback` |

### Backend Environment Variables

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
BACKEND_URL=https://your-backend-domain.com
FRONTEND_URL=https://tile-depot-commerce.vercel.app
```

### Frontend Environment Variables

```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

## 🔗 Related Files

- Backend OAuth Controller: `backend/controllers/oauth-controller.js`
- Backend OAuth Routes: `backend/routes/oauth-routes.js`
- Backend Server Configuration: `backend/server.js`
- Frontend Login Form: `frontend/src/components/forms/login-form.tsx`
- Frontend API Service: `frontend/src/services/api.ts`

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

---

**Last Updated:** Based on current backend route configuration (`/api/v1/oauth/google/callback`)
