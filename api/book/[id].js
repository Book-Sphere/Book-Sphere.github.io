// /api/book/[id].js
const books = require('../../books.json');

export default function handler(req, res) {
  const { id } = req.query;
  
  // Convert id to number since books.json uses numeric IDs
  const bookId = parseInt(id);
  const book = books.find(b => b.id === bookId);

  if (!book) {
    console.error(`Book not found for ID: ${id}`);
    return res.status(404).send('Book not found');
  }

  // Check if request is from a social media bot
  const userAgent = req.headers['user-agent'] || '';
  const isBot = userAgent.includes('facebookexternalhit') || 
                userAgent.includes('Twitterbot') || 
                userIncludes('WhatsApp') || 
                userAgent.includes('Slackbot');

  const htmlResponse = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta property="og:title" content="${book.title} | BookSphere">
      <meta property="og:description" content="Free download: ${book.title} by ${book.author}">
      <meta property="og:image" content="${book.cover}">
      <meta property="og:url" content="https://book-sphere-eight.vercel.app/book/${id}">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${book.title} | BookSphere">
      <meta name="twitter:description" content="Free download: ${book.title} by ${book.author}">
      <meta name="twitter:image" content="${book.cover}">
      <title>${book.title} | BookSphere</title>
    </head>
    <body>
      <script>
        window.location.href = "/download.html?bookId=${id}";
      </script>
    </body>
    </html>
  `;

  if (isBot) {
    res.setHeader('Content-Type', 'text/html');
    return res.send(htmlResponse);
  } else {
    res.redirect(302, `/download.html?bookId=${id}`);
  }
}