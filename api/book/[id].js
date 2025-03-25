// Using direct book data (no file system access)
const books = [
    {
    "id": 1,
    "title": "12 Rules for Life | Self Help | English Books | Motivation",
    "author": "Jordan B Peterson",
    "cover": "https://scontent.flhe2-4.fna.fbcdn.net/v/t39.30808-6/486079976_122119696736752079_5333698289877567754_n.jpg",
    "downloadLink": "https://drive.google.com/file/d/1zUs2kaPJWdoU_WTLg-oH-Uc7z-jK08Gs/view",
    "categories": ["English", "Self Help"],
    "featured": true
    },
    {
    "id": 2,
    "title": "Do It Today | Self Help | English Books | Motivation",
    "author": "Darius Foroux",
    "cover": "https://scontent.flhe2-2.fna.fbcdn.net/v/t39.30808-6/485751937_122119696634752079_1339846241157609416_n.jpg",
    "downloadLink": "https://drive.google.com/file/d/1K58uWKwkWLZoyXJ7636yb7vJxVHpNjhv/view",
    "categories": ["English", "Self Help"],
    "featured": true
    }
];

export default async function handler(req, res) {
    try {
    const { id } = req.query;
    const bookId = parseInt(id);
    const book = books.find(b => b.id === bookId);

    if (!book) {
        return res.status(404).send(`
        <html>
            <body>
            <h1>Book not found</h1>
            <p>Available book IDs: ${books.map(b => b.id).join(', ')}</p>
            <a href="/">Return home</a>
            </body>
        </html>
        `);
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