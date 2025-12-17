// script.js - BookDesk Platform with PDF Viewer & All Functionalities

document.addEventListener('DOMContentLoaded', function () {
    // Auth State Management
    function checkAuthState() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) return;

        // Desktop Index
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const profileLink = document.querySelector('.profile-link-desktop');

        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (profileLink) profileLink.style.display = 'inline-block';

        // Mobile Index
        const mobileProfile = document.querySelector('.mobile-profile-icon');
        if (mobileProfile) mobileProfile.style.display = 'block';
    }
    checkAuthState();

    // ==================== BOOK DATA CONFIGURATION ====================
    const books = {
        'Atomic Habits': {
            title: 'Atomic Habits by James Clear',
            author: 'James Clear',
            pdfPath: 'PDFs/Atomic-Habits-by-James-Clear.pdf',
            description: 'Tiny changes, remarkable results. Build good habits.',
            cover: './images/atomic.jpg'
        },
        'The Psychology of Money': {
            title: 'The Psychology of Money by Morgan Housel',
            author: 'Morgan Housel',
            pdfPath: 'PDFs/the-psychology-of-money-by-morgan-housel.pdf',
            description: 'Timeless lessons on wealth and happiness.',
            cover: './images/money.jpg'
        },
        '1984': {
            title: '1984 by George Orwell',
            author: 'George Orwell',
            pdfPath: 'PDFs/George-Orwell-1984.pdf',
            description: 'A dystopian classic and cautionary tale.',
            cover: './images/1984.webp'
        },
        'Sapiens': {
            title: 'Sapiens by Yuval Noah Harari',
            author: 'Yuval Noah Harari',
            pdfPath: 'PDFs/Sapiens-A-Brief-History-of-Humankind.pdf',
            description: 'A brief history of humankind.',
            cover: './images/sapiens.webp'
        },
        'The Diary of a Young Girl': {
            title: 'The Diary of a Young Girl by Anne Frank',
            author: 'Anne Frank',
            pdfPath: 'PDFs/3_The Diary of a Young Girl.pdf',
            description: 'The diary of a teenage girl hiding from the Nazis.',
            cover: './images/The Diary of a Young Girl.jpg'
        },
        'Quiet': {
            title: 'Quiet by Susan Cain',
            author: 'Susan Cain',
            pdfPath: 'PDFs/Quiet.pdf',
            description: 'The Power of Introverts in a World That Can\'t Stop Talking.',
            cover: './images/Quiet.png'
        },
        'The Four Agreements': {
            title: 'The Four Agreements by Don Miguel Ruiz',
            author: 'Don Miguel Ruiz',
            pdfPath: 'PDFs/The-four-agreements.pdf',
            description: 'A Practical Guide to Personal Freedom.',
            cover: './images/The-four-agreements.jpg'
        },
        'The Lean Startup': {
            title: 'The Lean Startup by Eric Ries',
            author: 'Eric Ries',
            pdfPath: 'PDFs/Eric Ries - The Lean Startup.pdf',
            description: 'How Today\'s Entrepreneurs Use Continuous Innovation.',
            cover: './images/Eric Ries - The Lean Startup.png'
        },
        'Thinking, Fast and Slow': {
            title: 'Thinking, Fast and Slow by Daniel Kahneman',
            author: 'Daniel Kahneman',
            pdfPath: 'PDFs/Thinking, Fast and Slow by Daniel Kahneman (z-lib.org).pdf',
            description: 'The major thoughts on how we make choices.',
            cover: './images/Thinking, Fast and Slow.webp'
        },
        'Deep Work': {
            title: 'Deep Work by Cal Newport',
            author: 'Cal Newport',
            pdfPath: 'PDFs/Deep Work PDF.pdf',
            description: 'Rules for focused success in a distracted world.',
            cover: './images/Deep Work.webp'
        },
        'Silappadikaram': {
            title: 'Silappadikaram by Ilango Adigal',
            author: 'Ilango Adigal',
            pdfPath: 'PDFs/Silappadikaram.pdf',
            description: 'The Tale of an Anklet. An ancient Tamil epic.',
            cover: './images/Silappadikaram.webp'
        },
        'The Bhagavad Gita': {
            title: 'The Bhagavad Gita by Vyasa',
            author: 'Vyasa',
            pdfPath: 'PDFs/The Bhagavad Gita.pdf',
            description: 'The Song of God. A timeless spiritual classic.',
            cover: './images/The Bhagavad Gita.jpg'
        }
    };

    // ==================== PDF VIEWER STATE ====================
    let pdfViewer = {
        pdfDoc: null,
        pageNum: 1,
        pageRendering: false,
        pageNumPending: null,
        scale: 1.0,
        currentBook: null,
        canvas: null,
        ctx: null
    };

    // ==================== DOM ELEMENTS ====================
    // Core elements
    const yearElement = document.getElementById('year');
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const body = document.body;

    // PDF Viewer elements
    const pdfModal = document.getElementById('pdfModal');
    const pdfCanvas = document.getElementById('pdfCanvas');
    const pageNumElement = document.getElementById('pageNum');
    const pageCountElement = document.getElementById('pageCount');
    const zoomLevelElement = document.getElementById('zoomLevel');
    const pdfTitleElement = document.getElementById('pdfTitle');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const closePdfBtn = document.getElementById('closePdfBtn');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const fitWidthBtn = document.getElementById('fitWidth');
    const fitPageBtn = document.getElementById('fitPage');
    const pdfLoading = document.getElementById('pdfLoading');

    // Authentication buttons
    const loginBtn = document.querySelector('.auth-buttons .btn.primary');
    const signupBtn = document.querySelector('.auth-buttons .btn.secondary');
    const getStartedBtn = document.querySelector('.hero-cta .btn.primary.large');
    const learnMoreBtn = document.querySelector('.hero-cta .btn.secondary.large');

    // ==================== INITIALIZATION ====================
    function init() {
        // Set current year in footer
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }

        // Initialize PDF viewer canvas
        if (pdfCanvas) {
            pdfViewer.canvas = pdfCanvas;
            pdfViewer.ctx = pdfCanvas.getContext('2d');
        }

        // Set up all event listeners
        setupEventListeners();

        // Initialize book buttons
        initializeBookButtons();

        // Add hover effects to book cards
        addBookHoverEffects();

        // Setup smooth scroll
        setupSmoothScroll();

        // Setup authentication buttons
        setupAuthButtons();
    }

    // ==================== EVENT LISTENER SETUP ====================
    function setupEventListeners() {
        // Mobile menu functionality
        setupMobileMenu();

        // PDF Viewer controls (only if elements exist)
        if (closePdfBtn) closePdfBtn.addEventListener('click', closePdfViewer);
        if (downloadPdfBtn) downloadPdfBtn.addEventListener('click', downloadCurrentPdf);
        if (prevPageBtn) prevPageBtn.addEventListener('click', onPrevPage);
        if (nextPageBtn) nextPageBtn.addEventListener('click', onNextPage);
        if (zoomInBtn) zoomInBtn.addEventListener('click', () => zoomPdf(0.2));
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => zoomPdf(-0.2));
        if (fitWidthBtn) fitWidthBtn.addEventListener('click', fitToWidth);
        if (fitPageBtn) fitPageBtn.addEventListener('click', fitToPage);

        // PDF Modal interactions
        if (pdfModal) {
            // Close modal on outside click
            pdfModal.addEventListener('click', function (e) {
                if (e.target === pdfModal) {
                    closePdfViewer();
                }
            });
        }

        // Keyboard shortcuts for PDF viewer
        document.addEventListener('keydown', function (e) {
            // Escape key to close PDF viewer
            if (e.key === 'Escape' && pdfModal && pdfModal.style.display === 'block') {
                closePdfViewer();
            }
            // Arrow keys for navigation
            if (e.key === 'ArrowLeft' && pdfModal && pdfModal.style.display === 'block') {
                onPrevPage();
            }
            if (e.key === 'ArrowRight' && pdfModal && pdfModal.style.display === 'block') {
                onNextPage();
            }
            // Plus/Minus for zoom
            if (e.key === '+' && pdfModal && pdfModal.style.display === 'block') {
                zoomPdf(0.2);
            }
            if (e.key === '-' && pdfModal && pdfModal.style.display === 'block') {
                zoomPdf(-0.2);
            }
        });

        // Authentication and CTA buttons
        setupAuthButtonListeners();
    }

    // ==================== MOBILE MENU FUNCTIONALITY ====================
    function setupMobileMenu() {
        if (!mobileToggle || !navMenu) return;

        mobileToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !expanded);
            navMenu.classList.toggle('open');

            // Toggle icon
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (navMenu.classList.contains('open') &&
                !navMenu.contains(e.target) &&
                !mobileToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Close menu on link click (for mobile)
        document.querySelectorAll('.nav a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    function closeMobileMenu() {
        if (!navMenu || !mobileToggle) return;

        navMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
            icon.classList.replace('fa-times', 'fa-bars');
        }
    }

    // Payment Functionality
    window.handleBuy = function (price, title) {
        if (confirm(`Do you want to purchase "${title}" for ₹${price}?`)) {
            // Mock payment flow
            const btn = event.target;
            const originalText = btn.textContent;

            btn.textContent = 'Processing...';
            btn.disabled = true;

            setTimeout(() => {
                alert(`Payment of ₹${price} Successful! \n\nThank you for purchasing "${title}".`);
                btn.textContent = 'Purchased';
                btn.style.background = '#27ae60';

                // Optional: Enable download or open PDF after purchase
                // For now just show success
            }, 1500);
        }
    };



    // Favourites Logic
    window.toggleFavourite = function (btn, title, cover) {
        btn.classList.toggle('active');
        let favs = JSON.parse(localStorage.getItem('bookDeskFavs') || '[]');

        if (btn.classList.contains('active')) {
            // Add
            if (!favs.find(b => b.title === title)) {
                favs.push({ title, cover });

                // Show floating notification
                const note = document.createElement('div');
                note.textContent = '❤️ Added to Favourites';
                note.style.cssText = `
                    position: fixed; bottom: 20px; right: 20px;
                    background: #2c3e50; color: white; padding: 10px 20px;
                    border-radius: 5px; z-index: 1000; animation: fadeOut 2s forwards;
                `;
                document.body.appendChild(note);
                setTimeout(() => note.remove(), 2000);
            }
        } else {
            // Remove
            favs = favs.filter(b => b.title !== title);
        }

        localStorage.setItem('bookDeskFavs', JSON.stringify(favs));
    };

    function initFavourites() {
        const bookCards = document.querySelectorAll('.book-card');
        const favs = JSON.parse(localStorage.getItem('bookDeskFavs') || '[]');

        bookCards.forEach(card => {
            if (card.querySelector('.fav-btn')) return;

            const titleEl = card.querySelector('h3');
            const imgEl = card.querySelector('img');

            if (titleEl && imgEl) {
                const title = titleEl.textContent;
                const cover = imgEl.getAttribute('src');
                const isFav = favs.find(b => b.title === title);

                // Get book-info container to place btn next to "Borrow"
                const bookInfo = card.querySelector('.book-info');

                const btn = document.createElement('button');
                btn.className = `fav-btn ${isFav ? 'active' : ''}`;
                btn.innerHTML = '<i class="fas fa-heart"></i>';
                btn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavourite(btn, title, cover);
                };

                // Append to card (absolute positioning will place it top-left)
                card.appendChild(btn);
            }
        });
    }

    // ==================== BOOK BUTTONS & PDF FUNCTIONALITY ====================
    function initializeBookButtons() {
        initFavourites(); // Initialize hearts

        const borrowButtons = document.querySelectorAll('.book-card .btn.primary.small');

        borrowButtons.forEach((button, index) => {
            button.addEventListener('click', function (e) {
                e.preventDefault();

                // Get book title from the card
                const bookCard = this.closest('.book-card');
                const titleElement = bookCard.querySelector('h3');
                const bookTitle = titleElement ? titleElement.textContent.trim() : '';

                // Find matching book
                let selectedBook = null;
                for (const key in books) {
                    if (bookTitle.includes(key)) {
                        selectedBook = books[key];
                        break;
                    }
                }

                // Fallback by index
                if (!selectedBook) {
                    const bookKeys = Object.keys(books);
                    if (bookKeys[index]) {
                        selectedBook = books[bookKeys[index]];
                    }
                }

                if (selectedBook) {
                    openPdfViewer(selectedBook);
                } else {
                    showNotification('Book PDF not found. Please try again later.', 'error');
                }
            });
        });
    }

    // ==================== PDF VIEWER FUNCTIONS ====================
    function openPdfViewer(book) {
        if (!pdfModal || !pdfTitleElement) return;

        pdfViewer.currentBook = book;
        pdfTitleElement.textContent = book.title;
        pdfModal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Reset viewer state
        pdfViewer.pageNum = 1;
        pdfViewer.scale = 1.0;

        // Check if running on file protocol or if previous load failed
        const isLocalFile = window.location.protocol === 'file:';

        // Show loading
        if (pdfLoading) {
            pdfLoading.style.display = 'flex';
        }
        if (pdfCanvas) {
            pdfCanvas.style.display = 'none';
        }

        // If local file, skip PDF.js and use iframe directly
        if (isLocalFile) {
            loadPdfIframe(book.pdfPath);
        } else {
            // Load PDF with PDF.js
            loadPdf(book.pdfPath);
        }

        // Update UI controls
        updatePdfControls();
    }

    function loadPdfIframe(url) {
        // Hide canvas and controls that don't apply to iframe
        if (pdfCanvas) pdfCanvas.style.display = 'none';
        if (pdfLoading) pdfLoading.style.display = 'none';

        // Hide PDF.js controls
        const controls = document.querySelector('.pdf-controls');
        if (controls) controls.style.display = 'none';

        // Check if iframe already exists
        let iframe = document.getElementById('pdfIframe');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'pdfIframe';
            iframe.style.width = '100%';
            iframe.style.height = 'calc(100% - 60px)'; // Adjust for header
            iframe.style.border = 'none';
            iframe.style.borderRadius = 'var(--radius)';

            const modalBody = document.querySelector('.pdf-modal-body');
            if (modalBody) {
                // Clear body to remove canvas specific elements if needed or just append
                modalBody.appendChild(iframe);
            }
        } else {
            iframe.style.display = 'block';
        }

        iframe.src = url;
    }

    function closePdfViewer() {
        if (!pdfModal) return;

        pdfModal.style.display = 'none';
        document.body.style.overflow = 'auto';

        // Clean up PDF
        if (pdfViewer.pdfDoc) {
            pdfViewer.pdfDoc.destroy();
            pdfViewer.pdfDoc = null;
        }

        // Hide/Reset Iframe
        const iframe = document.getElementById('pdfIframe');
        if (iframe) {
            iframe.src = '';
            iframe.style.display = 'none';
        }

        // Restore controls visibility for next time
        const controls = document.querySelector('.pdf-controls');
        if (controls) controls.style.display = 'flex';
    }

    function loadPdf(url) {
        // Check if PDF.js is loaded
        if (typeof pdfjsLib === 'undefined') {
            handlePdfError('PDF library not loaded.');
            return;
        }

        const loadingTask = pdfjsLib.getDocument(url);

        loadingTask.promise.then(function (pdfDoc_) {
            pdfViewer.pdfDoc = pdfDoc_;

            if (pageCountElement) {
                pageCountElement.textContent = pdfViewer.pdfDoc.numPages;
            }

            if (pdfLoading) {
                pdfLoading.style.display = 'none';
            }
            if (pdfCanvas) {
                pdfCanvas.style.display = 'block';
            }

            // Initial render
            renderPage(pdfViewer.pageNum);

            // Re-enable/Update controls
            updatePdfControls();
        }).catch(function (error) {
            console.error('Error loading PDF:', error);

            // Handle specific errors or generic fallback
            let errorMessage = 'Unable to load PDF.';

            // Check for file protocol limitations (CORS) or 404
            if (window.location.protocol === 'file:') {
                errorMessage = 'Browser security prevents loading PDFs directly from local files.';
            } else if (error.name === 'MissingPDFException') {
                errorMessage = 'PDF file not found.';
            }

            handlePdfError(errorMessage, url);
        });
    }

    function handlePdfError(msg, url = null) {
        if (pdfLoading) {
            let html = `
                <div style="text-align: center; padding: 2rem;">
                    <div style="color: #e74c3c; margin-bottom: 1rem;">
                        <i class="fas fa-exclamation-circle" style="font-size: 3rem;"></i>
                    </div>
                    <h3 style="color: var(--dark); margin-bottom: 0.5rem;">Oops!</h3>
                    <p style="color: #666; margin-bottom: 1.5rem;">${msg}</p>
            `;

            if (url) {
                html += `
                    <a href="${url}" target="_blank" class="btn primary small" style="display: inline-block;">
                        <i class="fas fa-external-link-alt"></i> Open PDF in New Tab
                    </a>
                `;
            }

            html += `</div>`;
            pdfLoading.innerHTML = html;
        }
    }



    function renderPage(num) {
        if (!pdfViewer.pdfDoc || !pdfViewer.canvas) return;

        pdfViewer.pageRendering = true;

        pdfViewer.pdfDoc.getPage(num).then(function (page) {
            const viewport = page.getViewport({ scale: pdfViewer.scale });

            // Prepare canvas
            const canvas = pdfViewer.canvas;
            const outputScale = window.devicePixelRatio || 1;

            canvas.width = Math.floor(viewport.width * outputScale);
            canvas.height = Math.floor(viewport.height * outputScale);

            const transform = outputScale !== 1
                ? [outputScale, 0, 0, outputScale, 0, 0]
                : null;

            // Render PDF page
            const renderContext = {
                canvasContext: pdfViewer.ctx,
                transform: transform,
                viewport: viewport
            };

            const renderTask = page.render(renderContext);

            renderTask.promise.then(function () {
                pdfViewer.pageRendering = false;
                if (pageNumElement) {
                    pageNumElement.textContent = num;
                }
                if (zoomLevelElement) {
                    zoomLevelElement.textContent = Math.round(pdfViewer.scale * 100) + '%';
                }
                updatePdfControls();

                if (pdfViewer.pageNumPending !== null) {
                    renderPage(pdfViewer.pageNumPending);
                    pdfViewer.pageNumPending = null;
                }
            });
        });
    }

    function queueRenderPage(num) {
        if (pdfViewer.pageRendering) {
            pdfViewer.pageNumPending = num;
        } else {
            renderPage(num);
        }
    }

    function onPrevPage() {
        if (pdfViewer.pageNum <= 1) return;
        pdfViewer.pageNum--;
        queueRenderPage(pdfViewer.pageNum);
    }

    function onNextPage() {
        if (!pdfViewer.pdfDoc || pdfViewer.pageNum >= pdfViewer.pdfDoc.numPages) return;
        pdfViewer.pageNum++;
        queueRenderPage(pdfViewer.pageNum);
    }

    function zoomPdf(delta) {
        pdfViewer.scale = Math.max(0.5, Math.min(3, pdfViewer.scale + delta));
        queueRenderPage(pdfViewer.pageNum);
    }

    function fitToWidth() {
        if (!pdfViewer.pdfDoc) return;

        const container = document.querySelector('.pdf-viewer-container');
        if (!container) return;

        pdfViewer.pdfDoc.getPage(pdfViewer.pageNum).then(function (page) {
            const containerWidth = container.clientWidth - 40;
            const viewport = page.getViewport({ scale: 1 });
            pdfViewer.scale = containerWidth / viewport.width;
            queueRenderPage(pdfViewer.pageNum);
        });
    }

    function fitToPage() {
        if (!pdfViewer.pdfDoc) return;

        const container = document.querySelector('.pdf-viewer-container');
        if (!container) return;

        pdfViewer.pdfDoc.getPage(pdfViewer.pageNum).then(function (page) {
            const containerWidth = container.clientWidth - 40;
            const containerHeight = container.clientHeight - 100;
            const viewport = page.getViewport({ scale: 1 });

            const widthScale = containerWidth / viewport.width;
            const heightScale = containerHeight / viewport.height;
            pdfViewer.scale = Math.min(widthScale, heightScale);
            queueRenderPage(pdfViewer.pageNum);
        });
    }

    function updatePdfControls() {
        if (prevPageBtn) prevPageBtn.disabled = pdfViewer.pageNum <= 1;
        if (nextPageBtn) nextPageBtn.disabled = !pdfViewer.pdfDoc || pdfViewer.pageNum >= pdfViewer.pdfDoc.numPages;
        if (zoomOutBtn) zoomOutBtn.disabled = pdfViewer.scale <= 0.5;
        if (zoomInBtn) zoomInBtn.disabled = pdfViewer.scale >= 3;
    }

    // ==================== DOWNLOAD FUNCTIONALITY ====================
    function downloadCurrentPdf() {
        if (!pdfViewer.currentBook) {
            showNotification('No book selected for download.', 'error');
            return;
        }

        const link = document.createElement('a');
        link.href = pdfViewer.currentBook.pdfPath;
        link.download = pdfViewer.currentBook.title.replace(/[<>:"/\\|?*]/g, '_') + '.pdf';
        link.target = '_blank';

        // Show download notification
        showNotification(`Downloading "${pdfViewer.currentBook.title}"...`, 'success');

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // ==================== NOTIFICATION SYSTEM ====================
    function showNotification(message, type = 'info') {
        const colors = {
            success: '#06D6A0',
            error: '#e74c3c',
            info: '#3498db'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 3000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;

        const icon = type === 'success' ? 'fa-check' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle';
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);

        // Add CSS animations if not already present
        addNotificationAnimations();
    }

    function addNotificationAnimations() {
        if (!document.querySelector('#notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ==================== AUTHENTICATION & CTA BUTTONS ====================
    function setupAuthButtons() {
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                showNotification('Login functionality coming soon! You can view and download books without login.', 'info');
            });
        }

        if (signupBtn) {
            signupBtn.addEventListener('click', () => {
                showNotification('Signup functionality coming soon! Try downloading books using the "Borrow Now" buttons.', 'info');
            });
        }
    }

    function setupAuthButtonListeners() {
        // Get Started button in hero section
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => {
                showNotification('Welcome to BookDesk! Start exploring books and sharing with fellow students.', 'success');
                // Scroll to books section
                const booksSection = document.querySelector('.latest-books');
                if (booksSection) {
                    booksSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Learn More button
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => {
                const featuresSection = document.querySelector('.features');
                if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Footer Request Invite button
        const requestInviteBtn = document.querySelector('.footer-cta .btn.primary');
        if (requestInviteBtn) {
            requestInviteBtn.addEventListener('click', () => {
                showNotification('Thank you for your interest! We\'ll contact you soon about BookDesk access.', 'success');
            });
        }
    }

    // ==================== UI ENHANCEMENTS ====================
    function addBookHoverEffects() {
        const bookCards = document.querySelectorAll('.book-card');
        bookCards.forEach(card => {
            card.addEventListener('mouseenter', function () {
                this.style.transform = 'translateY(-10px)';
                this.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
            });

            card.addEventListener('mouseleave', function () {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
            });
        });

        // Add hover effects to feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', function () {
                this.style.transform = 'translateY(-8px)';
                this.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
            });

            card.addEventListener('mouseleave', function () {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
            });
        });
    }

    // ==================== UTILITIES ====================
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ==================== BACK TO TOP ====================
    function setupBackToTop() {
        const btn = document.createElement('button');
        btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        btn.className = 'back-to-top';
        btn.setAttribute('aria-label', 'Back to top');
        btn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--primary);
            color: white;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            opacity: 0;
            transition: opacity 0.3s, transform 0.3s;
            pointer-events: none;
            z-index: 999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
        `;
        document.body.appendChild(btn);

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'all';
                btn.style.transform = 'translateY(0)';
            } else {
                btn.style.opacity = '0';
                btn.style.pointerEvents = 'none';
                btn.style.transform = 'translateY(10px)';
            }
        });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Add hover effect
        btn.addEventListener('mouseenter', () => {
            btn.style.background = 'var(--secondary)';
            btn.style.transform = 'scale(1.1)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'var(--primary)';
            btn.style.transform = 'scale(1)';
        });
    }
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#home') return;

                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Close mobile menu if open
                    closeMobileMenu();
                }
            });
        });
    }

    // ==================== SEARCH FUNCTIONALITY ====================
    // ==================== SEARCH FUNCTIONALITY ====================
    function setupSearch() {
        const searchForm = document.querySelector('.search-form');
        const searchInput = searchForm ? searchForm.querySelector('input[type="search"]') : null;

        // Handle URL search parameters on load
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');

        if (searchQuery && searchInput) {
            searchInput.value = searchQuery;
            performSearch(searchQuery);
        }

        if (searchForm && searchInput) {
            searchForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const query = searchInput.value.trim();

                if (query) {
                    performSearch(query);
                }
            });
        }
    }

    function performSearch(query) {
        const bookCards = document.querySelectorAll('.book-card');
        const booksSection = document.querySelector('.latest-books');

        // If we are on a page with books (like index.html)
        if (bookCards.length > 0) {
            let foundCount = 0;
            const lowerQuery = query.toLowerCase();

            bookCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const author = card.querySelector('.author').textContent.toLowerCase();
                const description = card.querySelector('p').textContent.toLowerCase();

                if (title.includes(lowerQuery) || author.includes(lowerQuery) || description.includes(lowerQuery)) {
                    card.style.display = 'flex';
                    foundCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            if (foundCount > 0) {
                showNotification(`Found ${foundCount} book${foundCount === 1 ? '' : 's'} matching "${query}"`, 'success');
                if (booksSection) {
                    booksSection.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                showNotification(`No books found matching "${query}"`, 'info');
            }
        } else {
            // We are on another page (e.g. about.html), redirect to index.html with search query
            window.location.href = `index.html?search=${encodeURIComponent(query)}`;
        }
    }

    // ==================== INITIALIZE ALL FEATURES ====================
    init();
    setupSearch();
    setupBackToTop();

    // Make essential functions available globally
    window.downloadCurrentPdf = downloadCurrentPdf;
    window.openPdfViewer = openPdfViewer;
    window.closePdfViewer = closePdfViewer;
});