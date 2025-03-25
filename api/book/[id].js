const books = require('../../public/books.json');

export default async function handler(req, res) {
  const { id } = req.query;
  const book = books.find(b => b.id === parseInt(id));

  if (!book) {
    return res.status(404).send('Book not found');
  }

  // Enhanced bot detection
  const isBot = /facebookexternalhit|Twitterbot|WhatsApp|LinkedInBot|Slackbot|Discordbot|TelegramBot/i.test(
    req.headers['user-agent'] || ''
  );

  if (isBot) {
    res.setHeader('Content-Type', 'text/html');
    return res.send(`
      <!DOCTYPE html>
      <html prefix="og: https://ogp.me/ns#">
      <head>
        <title>${book.title} | BookSphere</title>
        <meta property="og:title" content="${book.title}">
        <meta property="og:description" content="Download ${book.title} by ${book.author} for free">
        <meta property="og:image" content="${book.cover}">
        <meta property="og:url" content="https://book-sphere-eight.vercel.app/book/${id}">
        <meta property="og:type" content="book">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:site" content="@booksphere">
      </head>
      <body>
        <script>window.location.href="/download.html?bookId=${id}"</script>
      </body>
      </html>
    `);
  }

  res.redirect(302, `/download.html?bookId=${id}`);
}