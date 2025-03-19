const http = require('http');
const url = require('url');
const { exec } = require('child_process');
const fetch = require('node-fetch');

const CLIENT_ID = '18139ed8d232450bbf1d655943aa9899';
const REDIRECT_URI = 'http://localhost:3000/callback';
const SCOPES = [
  'user-library-read',
  'user-read-private',
  'user-read-email'
].join(' ');

const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;

// Create a temporary server to receive the callback
const server = http.createServer(async (req, res) => {
  const { query } = url.parse(req.url, true);

  if (query.code) {
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: query.code,
          redirect_uri: REDIRECT_URI
        })
      });

      const data = await response.json();
      
      console.log('\nYour tokens are:');
      console.log('SPOTIFY_USER_ACCESS_TOKEN=' + data.access_token);
      console.log('SPOTIFY_REFRESH_TOKEN=' + data.refresh_token);
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('Tokens received! You can close this window.');
      
      // Close the server after receiving the tokens
      server.close();
    } catch (error) {
      console.error('Error getting tokens:', error);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('Error getting tokens. Check the console for details.');
    }
  } else {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end('No code received');
  }
});

server.listen(3000, () => {
  console.log('Opening browser for Spotify authorization...');
  // Open browser based on OS
  if (process.platform === 'darwin') {
    exec(`open "${authUrl}"`);
  } else if (process.platform === 'win32') {
    exec(`start "${authUrl}"`);
  } else {
    exec(`xdg-open "${authUrl}"`);
  }
}); 