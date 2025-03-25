const books = require('../../books.json');

export default async function handler(req, res) {
  try {
    const { id } = req.query;
    const bookId = parseInt(id);
    const book = books.find(b => b.id === bookId);

    if (!book) {
      return res.status(404).send('Book not found');
    }

    const isBot = /facebookexternalhit|Twitterbot|WhatsApp|Slackbot/i.test(req.headers['user-agent'] || '');

    if (isBot) {
      res.setHeader('Content-Type', 'text/html');
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta property="og:title" content="${book.title} | BookSphere">
          <meta property="og:description" content="Free download: ${book.title} by ${book.author}">
          <meta property="og:image" content="${book.cover}">
          <meta property="og:url" content="https://book-sphere-eight.vercel.app/book/${id}">
          <meta name="twitter:card" content="summary_large_image">
          <title>${book.title} | BookSphere</title>
        </head>
        <body>
          <script>window.location.href="/download.html?bookId=${id}"</script>
        </body>
        </html>
      `);
    }

    res.redirect(302, `/download.html?bookId=${id}`);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error');
  }
}