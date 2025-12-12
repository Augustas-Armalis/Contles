# Contles Waitlist

A simple waitlist signup form integrated with MailerLite.

## Current Setup

The form is currently configured to use the **direct MailerLite API** approach, which works immediately but exposes your API key in the browser (security risk).

## MailerLite Configuration

- **Group ID**: `173612830070670438`
- **API Key**: Configured in `index.html` (currently exposed - see security note below)

## Security Warning ⚠️

**The current implementation exposes your MailerLite API key in client-side JavaScript.** This means:
- Anyone can view your API key in the browser
- Malicious users could abuse your API key
- This is **NOT recommended for production**

## Recommended: Secure Serverless Function Setup

For production, use the included serverless function to keep your API key secure.

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy your project**:
   ```bash
   vercel
   ```

3. **Set Environment Variables** in Vercel Dashboard:
   - Go to your project settings → Environment Variables
   - Add:
     - `MAILERLITE_API_KEY` = your MailerLite API key
     - `MAILERLITE_GROUP_ID` = `173612830070670438`

4. **Update `index.html`**:
   - Set `USE_SERVERLESS_FUNCTION = true`
   - Update `SERVERLESS_FUNCTION_URL` to your Vercel deployment URL (e.g., `https://your-project.vercel.app/api/subscribe`)

### Option 2: Deploy to Netlify

1. **Create `netlify/functions/subscribe.js`** (similar to `api/subscribe.js`)

2. **Deploy to Netlify** and set environment variables in the Netlify dashboard

### Option 3: Use Direct API (Current - Not Recommended)

The form currently works with the direct API approach. To use it:
- Keep `USE_SERVERLESS_FUNCTION = false` in `index.html`
- The API key is already configured

**Note**: This is fine for testing, but switch to the serverless function for production.

## Testing

1. Open `index.html` in a browser
2. Fill in name and email
3. Submit the form
4. Check your MailerLite dashboard to verify the subscriber was added to the group

## Files

- `index.html` - Main waitlist form
- `api/subscribe.js` - Serverless function for secure API calls (Vercel)
- `vercel.json` - Vercel configuration

