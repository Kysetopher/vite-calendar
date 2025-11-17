import express from 'express';
import fetch from 'node-fetch';
import cookie from 'cookie';

const API_BASE_URL =
  process.env.VITE_API_BASE_URL ||
  process.env.API_BASE_URL ||
  'http://localhost:8000';

const app = express();
app.use(express.json());

function setTokenCookies(res: express.Response, data: any) {
  if (data?.access_token) {
    res.cookie('auth_token', data.access_token, {
      httpOnly: false,
      sameSite: 'lax',
    });
  }
  if (data?.refresh_token) {
    res.cookie('refresh_token', data.refresh_token, {
      httpOnly: false,
      sameSite: 'lax',
    });
  }
}

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query as { code?: string };
  if (!code) {
    return res.status(400).send('Missing code');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    setTokenCookies(res, data);
    res.redirect('/');
  } catch (err) {
    console.error('OAuth callback error', err);
    res.status(500).send('OAuth callback failed');
  }
});

app.post('/auth/refresh', async (req, res) => {
  const cookies = cookie.parse(req.headers.cookie || '');
  const refreshToken = cookies['refresh_token'];
  if (!refreshToken) {
    return res.status(400).send('Missing refresh token');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    setTokenCookies(res, data);
    res.json({ ok: true });
  } catch (err) {
    console.error('Refresh error', err);
    res.status(500).send('Token refresh failed');
  }
});

export default app;
