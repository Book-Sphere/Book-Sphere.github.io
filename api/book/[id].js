// /api/book/[id].js

// Import books data directly (no relative path)
const books = [
    {
      "id": 1,
      "title": "12 Rules for Life | Self Help | English Books | Motivation",
      "author": "Jordan B Peterson",
      "cover": "https://scontent.flhe2-4.fna.fbcdn.net/v/t39.30808-6/486079976_122119696736752079_5333698289877567754_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=aa7b47&_nc_eui2=AeF5YcQD86N4p5_pAyRbrbzy11LSE3kQ0JnXUtITeRDQmd4CMxa3OHycH-epYM_sVL2Qjsald3FmQnUHqrsU0nyp&_nc_ohc=lKTN4-pvtt0Q7kNvgE_UEkT&_nc_zt=23&_nc_ht=scontent.flhe2-4.fna&_nc_gid=CQZkE2IUPr0ABWvOtgWhBw&oh=00_AYEkVqVtVXT8kg78kCMcQkf6yZPphue3CoIPbDJqyKD7JQ&oe=67E5ED65",
      "downloadLink": "https://drive.google.com/file/d/1zUs2kaPJWdoU_WTLg-oH-Uc7z-jK08Gs/view?usp=sharing",
      "embedLink": "https://drive.google.com/file/d/1zUs2kaPJWdoU_WTLg-oH-Uc7z-jK08Gs/preview",
      "categories": ["English", "Self Help"],
      "featured": true
    },
    {
      "id": 2,
      "title": "Do It Today | Self Help | English Books | Motivation",
      "author": "Darius Foroux",
      "cover": "https://scontent.flhe2-2.fna.fbcdn.net/v/t39.30808-6/485751937_122119696634752079_1339846241157609416_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=aa7b47&_nc_eui2=AeGT8jSUH23KdZj8iykO9mSo3Y-aUQNNXHTdj5pRA01cdGaguIQFKCqM8evTHonHMi9sds9KvYW_v07rohI1jB1b&_nc_ohc=JgGvtjLOUU0Q7kNvgG4wGOK&_nc_zt=23&_nc_ht=scontent.flhe2-2.fna&_nc_gid=WhThZ1_9Wsiwgn9JLT8FLg&oh=00_AYGQulwadV1gQFYuCWP2GuVmHiog9y26xSiMURAEOtE_cA&oe=67E60867",
      "downloadLink": "https://drive.google.com/file/d/1K58uWKwkWLZoyXJ7636yb7vJxVHpNjhv/view?usp=sharing",
      "embedLink": "https://drive.google.com/file/d/1K58uWKwkWLZoyXJ7636yb7vJxVHpNjhv/preview",
      "categories": ["English", "Self Help"],
      "featured": true
    }
    // Add other books from your books.json here
  ];
  
  export default function handler(req, res) {
    const { id } = req.query;
    
    // Debugging logs
    console.log(`Request received for book ID: ${id}`);
    console.log(`Available book IDs: ${books.map(b => b.id).join(', ')}`);
    
    // Convert id to number since books.json uses numeric IDs
    const bookId = parseInt(id);
    const book = books.find(b => b.id === bookId);
  
    if (!book) {
      console.error(`Book not found for ID: ${id}`);
      return res.status(404).send(`
        <html>
          <head><title>Book Not Found</title></head>
          <body>
            <h1>Book not found</h1>
            <p>We couldn't find a book with ID: ${id}</p>
            <p>Available book IDs: ${books.map(b => b.id).join(', ')}</p>
            <a href="/">Return to homepage</a>
          </body>
        </html>
      `);
    }
  
    // Check if request is from a social media bot
    const userAgent = req.headers['user-agent'] || '';
    const isBot = /facebookexternalhit|Twitterbot|WhatsApp|Slackbot/i.test(userAgent);
  
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