// Fetch books from books.json
async function fetchBooks() {
    try {
        const response = await fetch('books.json');
        if (!response.ok) {
            throw new Error('Failed to fetch books.');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching books:', error);
        alert('Failed to load books. Please try again later.');
        return [];
    }
}

// Display books on page load
document.addEventListener('DOMContentLoaded', async () => {
    const books = await fetchBooks();
    if (books.length === 0) return; // Exit if no books are found

    const bestsellers = books.slice(0, 12); // Example: Use the first 12 books as bestsellers
    displayBooks(books, 'featured-books');
    displayBooks(bestsellers, 'bestseller-books');
    updateCategories();
    setupSearch();
    setupMenuToggle();
    displayBooksWithPagination(); // Initialize pagination
});

// Display books in a section
function displayBooks(bookList, sectionId) {
    const booksElement = document.getElementById(sectionId);
    if (!booksElement) {
        console.error(`Element with ID '${sectionId}' not found.`);
        return;
    }

    booksElement.innerHTML = ''; // Clear existing content

    bookList.forEach(book => {
        const bookCard = createBookCard(book);
        booksElement.appendChild(bookCard);
    });
}

// Create a book card element
function createBookCard(book) {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';

    bookCard.innerHTML = `
        <div class="book-cover">
            <div class="download-cover-btn" title="Download Cover" onclick="downloadCover('${book.cover}', '${book.title}')">
                ⬇️
            </div>
            <div class="book-cover-image" style="background-image: url('${book.cover}')"></div>
        </div>
        <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">by ${book.author}</p>
            <button class="download-btn" onclick="redirectToDownloadPage(${book.id})">Download</button>
            <div class="button-container">
                <button class="read-online-btn" onclick="loadPdf('${book.downloadLink}')">Read Online</button>
                <button class="share-btn" onclick="shareBook(${book.id})">➦</button>
            </div>
        </div>
    `;

    return bookCard;
}

// Redirect to the download page
function redirectToDownloadPage(bookId) {
    window.location.href = `download.html?bookId=${bookId}`;
}

// Share the download page link
function shareBook(bookId) {
    // Generate the download page link dynamically
    const downloadPageLink = `${window.location.origin}/download.html?bookId=${bookId}`;

    if (navigator.share) {
        // Use the Web Share API if available
        navigator.share({
            title: 'Check out this book!',
            url: downloadPageLink,
        })
        .then(() => console.log('Shared successfully'))
        .catch((error) => {
            console.error('Error sharing:', error);
            alert('Failed to share the link. Please try again.');
        });
    } else {
        // Fallback: Copy link to clipboard
        navigator.clipboard.writeText(downloadPageLink)
            .then(() => alert('Link copied to clipboard!'))
            .catch(() => alert('Failed to copy link.'));
    }
}

// Load and render the PDF
let pdfCurrentPage = 1; // Changed from currentPage
let pdfDoc = null;

function renderPage(pageNum) {
    pdfDoc.getPage(pageNum).then((page) => {
        const canvas = document.getElementById('pdf-canvas');
        if (!canvas) {
            console.error('PDF canvas element not found.');
            return;
        }

        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 1.5 });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };
        page.render(renderContext);

        // Update page number
        const pageNumElement = document.getElementById('page-num');
        const pageCountElement = document.getElementById('page-count');
        if (pageNumElement && pageCountElement) {
            pageNumElement.textContent = pageNum;
            pageCountElement.textContent = pdfDoc.numPages;
        }
    }).catch((error) => {
        console.error('Error rendering page:', error);
        alert('Failed to render the PDF page. Please try again.');
    });
}

function loadPdf(pdfUrl) {
    // Reset pdfCurrentPage to 1 when loading a new PDF
    pdfCurrentPage = 1;

    pdfjsLib.getDocument(pdfUrl).promise.then((pdf) => {
        pdfDoc = pdf;
        renderPage(pdfCurrentPage);

        // Show the PDF viewer
        const pdfViewer = document.getElementById('pdf-viewer');
        if (pdfViewer) {
            pdfViewer.style.display = 'block';
        }
    }).catch((error) => {
        console.error('Error loading PDF:', error);
        alert('Failed to load the PDF. Please try again.');
    });
}

// Event listeners for PDF pagination
document.getElementById('prev-page')?.addEventListener('click', () => {
    if (pdfCurrentPage > 1) {
        pdfCurrentPage--;
        renderPage(pdfCurrentPage);
    }
});

document.getElementById('next-page')?.addEventListener('click', () => {
    if (pdfDoc && pdfCurrentPage < pdfDoc.numPages) {
        pdfCurrentPage++;
        renderPage(pdfCurrentPage);
    }
});


// Copy link (optional, if needed elsewhere)
function copyLink(link) {
    navigator.clipboard.writeText(link)
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => alert('Failed to copy link.'));
}

// Download book cover
function downloadCover(coverUrl, title) {
    fetch(coverUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to download cover.');
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title}.jpg`;
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch((error) => {
            console.error('Error downloading cover:', error);
            alert('Failed to download the cover. Please try again.');
        });
}

// Handle category filtering
function updateCategories() {
    const categories = document.querySelectorAll('.category');
    if (!categories) return;

    categories.forEach(category => {
        category.addEventListener('click', async () => {
            // Remove active class from all categories
            categories.forEach(cat => cat.classList.remove('active'));

            // Add active class to clicked category
            category.classList.add('active');

            const selectedCategory = category.textContent;
            const books = await fetchBooks();
            filterBooksByCategory(selectedCategory, books);
        });
    });
}

// Filter books by category
function filterBooksByCategory(category, books) {
    const filteredBooks = category === 'All Books'
        ? books
        : books.filter(book => book.category === category);

    const filteredBestsellers = category === 'All Books'
        ? books.slice(0, 12)
        : books.filter(book => book.category === category).slice(0, 12);

    displayBooks(filteredBooks, 'featured-books');
    displayBooks(filteredBestsellers, 'bestseller-books');
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchMessage = document.getElementById('search-message');

    if (!searchInput || !searchButton || !searchMessage) return;

    const performSearch = async () => {
        const query = searchInput.value.trim().toLowerCase();
        const books = await fetchBooks();

        if (query) {
            const filteredBooks = books.filter(book =>
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query) ||
                book.id.toString().includes(query) // Search by ID
            );

            const filteredBestsellers = books.filter(book =>
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query) ||
                book.id.toString().includes(query) // Search by ID
            ).slice(0, 12);

            displayBooks(filteredBooks, 'featured-books');
            displayBooks(filteredBestsellers, 'bestseller-books');

            // Show a message if no results are found
            if (filteredBooks.length === 0) {
                searchMessage.textContent = 'No books found matching your search.';
            } else {
                searchMessage.textContent = `Found ${filteredBooks.length} book(s) matching your search.`;
            }
        } else {
            displayBooks(books, 'featured-books');
            displayBooks(books.slice(0, 12), 'bestseller-books');
            searchMessage.textContent = ''; // Clear the message
        }
    };

    // Search on button click
    searchButton.addEventListener('click', performSearch);

    // Search on Enter key press
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
}

// Setup mobile menu toggle
function setupMenuToggle() {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Pagination
let currentPage = 1;
const booksPerPage = 12; // Number of books to display per page

async function displayBooksWithPagination() {
    const books = await fetchBooks();
    if (books.length === 0) return; // Exit if no books are found

    const totalPages = Math.ceil(books.length / booksPerPage);

    // Display books for the current page
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const booksToDisplay = books.slice(startIndex, endIndex);

    displayBooks(booksToDisplay, 'featured-books');

    // Update pagination buttons
    updatePaginationButtons(totalPages);
}

function updatePaginationButtons(totalPages) {
    const pageNumbers = document.getElementById('page-numbers');
    if (!pageNumbers) return;

    pageNumbers.innerHTML = '';

    if (totalPages === 0) return; // No pages to display

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', () => {
            currentPage = i;
            displayBooksWithPagination();
        });

        if (i === currentPage) {
            button.classList.add('active');
        }

        pageNumbers.appendChild(button);
    }

    // Enable/disable Previous and Next buttons
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    if (prevButton && nextButton) {
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayBooksWithPagination();
            }
        });

        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayBooksWithPagination();
            }
        });
    }
}

// Setup contact form
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !message) {
            alert('Please fill out all fields.');
            return;
        }

        const mailtoLink = `mailto:books.era786@gmail.com?subject=Contact%20Form%20Submission&body=Name:%20${encodeURIComponent(name)}%0AEmail:%20${encodeURIComponent(email)}%0AMessage:%20${encodeURIComponent(message)}`;
        window.location.href = mailtoLink;
    });
}

// Function to toggle between light and dark themes
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    if (!themeToggle) return;

    // Check user's preferred theme from localStorage
    let savedTheme;
    try {
        savedTheme = localStorage.getItem('theme');
    } catch (error) {
        console.error('Error accessing localStorage:', error);
    }

    if (savedTheme) {
        body.classList.add(savedTheme);
        updateThemeIcon(savedTheme);
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        const isDarkTheme = body.classList.contains('dark-theme');
        try {
            localStorage.setItem('theme', isDarkTheme ? 'dark-theme' : 'light-theme');
        } catch (error) {
            console.error('Error saving theme to localStorage:', error);
        }
        updateThemeIcon(isDarkTheme ? 'dark-theme' : 'light-theme');
    });
}

// Function to update the theme icon
function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark-theme' ? '☀️' : '🌙';
    }
}

// Call the function on page load
document.addEventListener('DOMContentLoaded', () => {
    setupThemeToggle();
    setupContactForm();
});