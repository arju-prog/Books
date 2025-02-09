const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const bookshelf = document.getElementById('bookshelf');
const savedBookshelf = document.getElementById('savedBookshelf');


navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.dataset.section;

        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        sections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    });
});
searchButton.addEventListener('click', searchBooks);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchBooks();
});

async function searchBooks() {
    const query = searchInput.value.trim();
    if (!query) return;

    try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        bookshelf.innerHTML = '';

        data.docs.slice(0, 12).forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.classList.add('book-card');

            const coverImg = book.cover_i 
                ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                : 'https://via.placeholder.com/150x200?text=No+Cover';
            const bookKey = book.key || (book.title + (book.author_name ? book.author_name[0] : ''));

            bookCard.innerHTML = `
                <img src="${coverImg}" alt="${book.title}">
                <h3>${book.title}</h3>
                <p>Author: ${book.author_name ? book.author_name[0] : 'Unknown'}</p>
                <p>Published: ${book.first_publish_year || 'N/A'}</p>
                <button onclick="saveBook(this, '${bookKey}')">Save</button>
            `;
            bookCard.dataset.bookKey = bookKey;

            if (localStorage.getItem(bookKey)) {
                const savedIndicator = document.createElement('div');
                savedIndicator.classList.add('saved-indicator');
                savedIndicator.textContent = '✓ Saved';
                bookCard.appendChild(savedIndicator);
            }

            bookshelf.appendChild(bookCard);
        });
    } catch (error) {
        console.error('Error fetching books:', error);
        bookshelf.innerHTML = '<p>Error loading books. Please try again.</p>';
    }
}

function saveBook(button, bookKey) {
    
    if (localStorage.getItem(bookKey)) {
        alert('This book is already saved!');
        return;
    }

    const bookCard = button.closest('.book-card');
    const savedBook = bookCard.cloneNode(true);
    const saveButton = savedBook.querySelector('button');
    saveButton.textContent = 'Remove';
    saveButton.onclick = function() { 
        const bookToRemove = this.closest('.book-card');
        localStorage.removeItem(bookToRemove.dataset.bookKey);
        bookToRemove.remove(); 
        
        const originalBook = document.querySelector(`[data-book-key="${bookToRemove.dataset.bookKey}"]`);
        if (originalBook) {
            const indicator = originalBook.querySelector('.saved-indicator');
            if (indicator) indicator.remove();
        }
    };
    const bookDetails = {
        title: savedBook.querySelector('h3').textContent,
        author: savedBook.querySelectorAll('p')[0].textContent,
        publishYear: savedBook.querySelectorAll('p')[1].textContent,
        coverSrc: savedBook.querySelector('img').src
    };
    localStorage.setItem(bookKey, JSON.stringify(bookDetails));

    const savedIndicator = document.createElement('div');
    savedIndicator.classList.add('saved-indicator');
    savedIndicator.textContent = '✓ Saved';
    bookCard.appendChild(savedIndicator);

    savedBookshelf.appendChild(savedBook);
}

function loadSavedBooks() {
    for (let i = 0; i < localStorage.length; i++) {
        const bookKey = localStorage.key(i);
        const bookDetails = JSON.parse(localStorage.getItem(bookKey));

        const savedBook = document.createElement('div');
        savedBook.classList.add('book-card');
        savedBook.dataset.bookKey = bookKey;

        savedBook.innerHTML = `
            <img src="${bookDetails.coverSrc}" alt="${bookDetails.title}">
            <h3>${bookDetails.title}</h3>
            <p>${bookDetails.author}</p>
            <p>${bookDetails.publishYear}</p>
            <button onclick="this.closest('.book-card').remove(); localStorage.removeItem('${bookKey}');">Remove</button>
        `;

        savedBookshelf.appendChild(savedBook);
    }
}

loadSavedBooks();




async function getRandomBooks() {
    
    const subjects = [
        'fantasy', 'science_fiction', 'mystery', 'romance', 
        'historical_fiction', 'classic', 'thriller', 'biography'
    ];
    
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    const booksSection = document.getElementById('books');
    
    try {
        const response = await fetch(`https://openlibrary.org/subjects/${randomSubject}.json?limit=20`);
        const data = await response.json();
        
        const title = booksSection.querySelector('h1');
        booksSection.innerHTML = '';
        booksSection.appendChild(title);
        const refreshButton = document.createElement('button');
        refreshButton.textContent = 'Get New Suggestions';
        refreshButton.classList.add('refresh-button');
        refreshButton.onclick = getRandomBooks;
        booksSection.appendChild(refreshButton);
        const subjectHeading = document.createElement('h2');
        subjectHeading.textContent = `Suggested ${randomSubject.replace('_', ' ')} books`;
        subjectHeading.classList.add('subject-heading');
        booksSection.appendChild(subjectHeading);
        const booksContainer = document.createElement('div');
        booksContainer.classList.add('books-container');
        
        const randomBooks = data.works
            .sort(() => Math.random() - 0.5)
            .slice(0, 6);
            
        randomBooks.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.classList.add('book-card');
            
            const coverImg = book.cover_id 
                ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`
                : 'https://via.placeholder.com/150x200?text=No+Cover';
                
            const bookKey = book.key;
            
            bookCard.innerHTML = `
                <img src="${coverImg}" alt="${book.title}">
                <h3>${book.title}</h3>
                <p>Author: ${book.authors ? book.authors[0].name : 'Unknown'}</p>
                <p>First Published: ${book.first_publish_year || 'N/A'}</p>
                <button onclick="saveBook(this, '${bookKey}')">Save</button>
            `;
            bookCard.dataset.bookKey = bookKey;
            
            if (localStorage.getItem(bookKey)) {
                const savedIndicator = document.createElement('div');
                savedIndicator.classList.add('saved-indicator');
                savedIndicator.textContent = '✓ Saved';
                bookCard.appendChild(savedIndicator);
            }
            
            booksContainer.appendChild(bookCard);
        });
        
        booksSection.appendChild(booksContainer);
        
    } catch (error) {
        console.error('Error fetching random books:', error);
        booksSection.innerHTML = '<h1>My Book Collection</h1><p>Error loading book suggestions. Please try again.</p>';
    }
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.dataset.section;
        
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        sections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
        
        
        if (sectionId === 'books') {
            getRandomBooks();
        }
    });
});

if (document.getElementById('books').classList.contains('active')) {
    getRandomBooks();
}