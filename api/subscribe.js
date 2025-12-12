// Vercel Serverless Function for MailerLite API
// This keeps your API key secure on the server side

export default async function handler(req, res) {
  // Basic CORS (needed if your static site is hosted on a different domain,
  // e.g. GitHub Pages, while this function runs on Vercel).
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get credentials from environment variables (set in Vercel dashboard)
  const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
  const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID;

  if (!MAILERLITE_API_KEY || !MAILERLITE_GROUP_ID) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { email, name } = req.body;

  // Validate input
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        fields: {
          name: name
        },
        groups: [MAILERLITE_GROUP_ID]
      })
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true, data });
    } else {
      // If subscriber already exists, treat as success
      if (data.message && data.message.includes('already exists')) {
        return res.status(200).json({ success: true, message: 'Already subscribed' });
      }
      return res.status(response.status).json({ error: data.message || 'Failed to subscribe' });
    }
  } catch (error) {
    console.error('MailerLite API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

