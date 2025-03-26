// Get book ID from URL
const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get("id");

// Fetch book data from JSON
fetch("books.json")
    .then(response => response.json())
    .then(books => {
        const book = books.find(b => b.id === bookId);
        if (book) {
            // Update page content
            document.getElementById("bookTitle").textContent = book.title;
            document.getElementById("bookCover").src = book.cover;

            // Update Open Graph meta tags for social media preview
            document.querySelector('meta[property="og:title"]').setAttribute("content", book.title);
            document.querySelector('meta[property="og:description"]').setAttribute("content", `Read "${book.title}" online for free.`);
            document.querySelector('meta[property="og:image"]').setAttribute("content", book.cover);
            document.querySelector('meta[property="og:url"]').setAttribute("content", window.location.href);
        }
    })
    .catch(error => console.error("Error loading book data:", error));
