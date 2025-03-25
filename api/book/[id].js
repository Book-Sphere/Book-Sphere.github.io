const books = require('../../public/books.json');

export default async function handler(req, res) {
  const { id } = req.query;
  const book = books.find(b => b.id === parseInt(id));

  if (!book) {
    return res.status(404).send('Book not found');
  }

  // Check for social media bots
  const isBot = /facebookexternalhit|Twitterbot|WhatsApp|LinkedInBot|Slackbot/i.test(
    req.headers['user-agent'] || ''
  );

  if (isBot) {
    // Return rich social media preview
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

  // Redirect normal users
  res.redirect(302, `/download.html?bookId=${id}`);
}