// /api/book/[id].js
import books from '../../books.json';

export default function handler(req, res) {
    const { id } = req.query;
    const book = books.find(b => b.id == id);

    if (!book) {
        return res.status(404).send('Book not found');
    }

    // Check if request is from a social media bot
    const userAgent = req.headers['user-agent'] || '';
    const isBot = userAgent.includes('facebookexternalhit') ||
        userAgent.includes('Twitterbot') ||
        userAgent.includes('WhatsApp') ||
        userAgent.includes('Slackbot');

    if (isBot) {
        // Return HTML with meta tags for bots
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
        <script>
          window.location.href = "/download.html?bookId=${id}";
        </script>
      </body>
      </html>
    `);
    } else {
        // Redirect normal users
        res.redirect(`/download.html?bookId=${id}`);
    }
}