const books = require('../../public/books.json');

export default async (req, res) => {
  const { book } = req.query;
  const bookData = books.find(b => b.id === parseInt(book));

  if (!bookData) {
    return res.redirect('/404.html');
  }

  // Social media bot detection
  const isBot = /facebookexternalhit|Twitterbot|WhatsApp|LinkedInBot/i.test(
    req.headers['user-agent'] || ''
  );

  if (isBot) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta property="og:title" content="${bookData.title}">
        <meta property="og:image" content="${bookData.cover}">
        <meta property="og:description" content="Free download: ${bookData.title} by ${bookData.author}">
        <meta name="twitter:card" content="summary_large_image">
      </head>
      <body>
        <script>window.location.href="/download.html?bookId=${book}"</script>
      </body>
      </html>
    `);
  }

  // Redirect real users
  res.redirect(`/download.html?bookId=${book}`);
};