// ====== Core Functions ====== //
async function fetchBooks() {
    try {
        const response = await fetch('books.json');
        if (!response.ok) throw new Error('Failed to fetch books');
        return await response.json();
    } catch (error) {
        console.error('Error loading books:', error);
        return [];
    }
}

// ====== Book Display Logic ====== //
function displayBooks(bookList, sectionId) {
    const booksElement = document.getElementById(sectionId);
    if (!booksElement) return;
    booksElement.innerHTML = '';

    bookList.forEach(book => {
        const bookCard = createBookCard(book);
        booksElement.appendChild(bookCard);
    });
}

function createBookCard(book) {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';

    // Sanitize inputs
    const sanitize = (str) => str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const title = sanitize(book.title);
    const author = sanitize(book.author);

    bookCard.innerHTML = `
        <div class="book-cover">
            <div class="download-cover-btn" title="Download Cover" 
                onclick="downloadCover('${book.cover}', '${title}')">⬇️</div>
            <div class="book-cover-image" style="background-image: url('${book.cover}')" 
                onclick="redirectToDownloadPage(${book.id})"></div>
        </div>
        <div class="book-info">
            <h3 class="book-title">${title}</h3>
            <p class="book-author">by ${author}</p>
            <div class="button-container">
                <button class="download-btn" onclick="redirectToDownloadPage(${book.id})">Download</button>
                <button class="share-btn" onclick="shareBook(${book.id}, '${title}', '${book.cover}')">➥</button>
                <button class="read-online-btn" onclick="redirectToReadingPage(${book.id})">Read online</button>
            </div>
        </div>
    `;
    return bookCard;
}

// ====== Navigation & Sharing ====== //
function redirectToDownloadPage(bookId) {
    window.open(`download.html?bookId=${bookId}`, '_blank');
}

function redirectToReadingPage(bookId) {
    window.open(`read.html?bookId=${bookId}`, '_blank');
}

// FIXED SHARE FUNCTION
function shareBook(bookId, title, cover) {
    // Ensure bookId is a number
    const numericId = typeof bookId === 'string' ? parseInt(bookId) : bookId;
    const shareUrl = `https://book-sphere-eight.vercel.app/book/${numericId}`;
    
    if (navigator.share) {
        navigator.share({
            title: `Check out "${title}" on BookSphere`,
            text: `Download "${title}" for free`,
            url: shareUrl
        }).catch(err => console.log('Share failed:', err));
    } else {
        navigator.clipboard.writeText(shareUrl)
            .then(() => alert('Link copied to clipboard!'))
            .catch(() => alert('Failed to copy link.'));
    }
}

// ====== Utilities ====== //
function downloadCover(coverUrl, title) {
    fetch(coverUrl)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title}.jpg`;
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(() => alert('Failed to download cover.'));
}

// ====== Categories & Search ====== //
function updateCategories() {
    const categories = document.querySelectorAll('.category');
    categories.forEach(category => {
        category.addEventListener('click', async () => {
            categories.forEach(cat => cat.classList.remove('active'));
            category.classList.add('active');
            const books = await fetchBooks();
            filterBooksByCategory(category.textContent, books);
        });
    });
}

function filterBooksByCategory(category, books) {
    const filteredBooks = category === 'All Books' 
        ? books 
        : books.filter(book => book.categories.includes(category));
    
    const filteredBestsellers = filteredBooks.slice(0, 20);
    displayBooks(filteredBooks, 'featured-books');
    displayBooks(filteredBestsellers, 'bestseller-books');
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchMessage = document.getElementById('search-message');

    const performSearch = async () => {
        const query = searchInput.value.trim().toLowerCase();
        const books = await fetchBooks();
        
        if (query) {
            const filteredBooks = books.filter(book =>
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query)
            );
            displayBooks(filteredBooks, 'featured-books');
            displayBooks(filteredBooks.slice(0, 20), 'bestseller-books');
            searchMessage.textContent = filteredBooks.length 
                ? `Found ${filteredBooks.length} book(s)` 
                : 'No books found';
        } else {
            displayBooks(books, 'featured-books');
            displayBooks(books.slice(0, 20), 'bestseller-books');
            searchMessage.textContent = '';
        }
    };

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keydown', (e) => e.key === 'Enter' && performSearch());
}

// ====== Pagination ====== //
let currentPage = 1;
const booksPerPage = 30;

async function displayBooksWithPagination() {
    const books = await fetchBooks();
    const totalPages = Math.ceil(books.length / booksPerPage);
    const startIndex = (currentPage - 1) * booksPerPage;
    const paginatedBooks = books.slice(startIndex, startIndex + booksPerPage);
    
    displayBooks(paginatedBooks, 'featured-books');
    updatePaginationButtons(totalPages);
    scrollToTop();
}

function updatePaginationButtons(totalPages) {
    const pageNumbers = document.getElementById('page-numbers');
    if (!pageNumbers) return;
    pageNumbers.innerHTML = '';

    // Previous Button
    const prevButton = document.getElementById('prev-page');
    if (prevButton) {
        prevButton.disabled = currentPage === 1;
        prevButton.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                displayBooksWithPagination();
            }
        };
    }

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        if (i === currentPage) button.classList.add('active');
        button.addEventListener('click', () => {
            currentPage = i;
            displayBooksWithPagination();
        });
        pageNumbers.appendChild(button);
    }

    // Next Button
    const nextButton = document.getElementById('next-page');
    if (nextButton) {
        nextButton.disabled = currentPage === totalPages;
        nextButton.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayBooksWithPagination();
            }
        };
    }
}

// ====== Slider ====== //
let sliderInterval;

async function displayFeaturedBooksInSlider() {
    const books = await fetchBooks();
    const slider = document.getElementById('book-slider');
    if (!slider) return;

    slider.innerHTML = '';
    books.filter(book => book.featured).forEach(book => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.innerHTML = `<img src="${book.cover}" alt="${book.title}" data-book-id="${book.id}">`;
        slider.appendChild(slide);
    });

    // Add click events to slides
    document.querySelectorAll('.slide img').forEach(img => {
        img.addEventListener('click', (e) => {
            const bookId = e.target.getAttribute('data-book-id');
            redirectToDownloadPage(bookId);
        });
    });

    // Initialize auto-scroll
    if (sliderInterval) clearInterval(sliderInterval);
    autoScrollSlider();
}

function autoScrollSlider() {
    const slider = document.querySelector('.slider');
    if (!slider) return;

    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;

    const slideWidth = slides[0].offsetWidth;
    let currentIndex = 1;
    slider.style.transform = `translateX(${-slideWidth}px)`;

    sliderInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % slides.length;
        slider.style.transition = 'transform 0.5s ease-in-out';
        slider.style.transform = `translateX(${-currentIndex * slideWidth}px)`;

        if (currentIndex === slides.length - 1) {
            setTimeout(() => {
                slider.style.transition = 'none';
                slider.style.transform = `translateX(${-slideWidth}px)`;
                currentIndex = 1;
            }, 500);
        }
    }, 2000);
}

// ====== Scroll Management ====== //
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function setupScrollButtons() {
    const backToTop = document.getElementById('back-to-top');
    const backToBottom = document.getElementById('back-to-bottom');
    
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
        });
        backToTop.addEventListener('click', scrollToTop);
    }
    
    if (backToBottom) {
        window.addEventListener('scroll', () => {
            const scrolledToBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100;
            backToBottom.style.display = scrolledToBottom ? 'none' : 'block';
        });
        backToBottom.addEventListener('click', () => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });
    }
}

// ====== Theme Toggle ====== //
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const body = document.body;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        body.classList.add(savedTheme);
        themeToggle.textContent = savedTheme === 'dark-theme' ? '☀️' : '🌙';
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        const isDark = body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark-theme' : 'light-theme');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
    });
}

// ====== Initialize Everything ====== //
document.addEventListener('DOMContentLoaded', async () => {
    const books = await fetchBooks();
    displayBooks(books, 'featured-books');
    displayBooks(books.slice(0, 20), 'bestseller-books');
    displayBooksWithPagination();
    displayFeaturedBooksInSlider();
    
    updateCategories();
    setupSearch();
    setupThemeToggle();
    setupMenuToggle();
    setupContactForm();
    setupScrollButtons();
});

// Helper Functions
function setupMenuToggle() {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }
}

function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = encodeURIComponent(document.getElementById('name').value);
            const email = encodeURIComponent(document.getElementById('email').value);
            const message = encodeURIComponent(document.getElementById('message').value);
            window.location.href = `mailto:books.era786@gmail.com?subject=Contact%20Form&body=Name:%20${name}%0AEmail:%20${email}%0AMessage:%20${message}`;
        });
    }
}