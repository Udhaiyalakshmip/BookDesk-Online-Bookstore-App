// script.js - BookDesk Platform with PDF Viewer & All Functionalities

document.addEventListener('DOMContentLoaded', function() {
    // ==================== BOOK DATA CONFIGURATION ====================
    const books = {
        'Atomic Habits': {
            title: 'Atomic Habits by James Clear',
            author: 'James Clear',
            pdfPath: '../PDFs/Atomic-Habits-by-James-Clear.pdf',
            description: 'Tiny changes, remarkable results. Build good habits.',
            cover: './images/atomic.jpg'
        },
        'The Psychology of Money': {
            title: 'The Psychology of Money by Morgan Housel',
            author: 'Morgan Housel',
            pdfPath: '../PDFs/the-psychology-of-money-by-morgan-housel.pdf',
            description: 'Timeless lessons on wealth and happiness.',
            cover: './images/money.jpg'
        },
        '1984': {
            title: '1984 by George Orwell',
            author: 'George Orwell',
            pdfPath: '../PDFs/George-Orwell-1984.pdf',
            description: 'A dystopian classic and cautionary tale.',
            cover: './images/1984.webp'
        },
        'Sapiens': {
            title: 'Sapiens by Yuval Noah Harari',
            author: 'Yuval Noah Harari',
            pdfPath: '../PDFs/Sapiens-A-Brief-History-of-Humankind.pdf',
            description: 'A brief history of humankind.',
            cover: './images/sapiens.webp'
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
            pdfModal.addEventListener('click', function(e) {
                if (e.target === pdfModal) {
                    closePdfViewer();
                }
            });
        }
        
        // Keyboard shortcuts for PDF viewer
        document.addEventListener('keydown', function(e) {
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
        
        mobileToggle.addEventListener('click', function(e) {
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
        document.addEventListener('click', function(e) {
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

    // ==================== BOOK BUTTONS & PDF FUNCTIONALITY ====================
    function initializeBookButtons() {
        const borrowButtons = document.querySelectorAll('.book-card .btn.primary.small');
        
        borrowButtons.forEach((button, index) => {
            button.addEventListener('click', function(e) {
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
        
        // Show loading
        if (pdfLoading) {
            pdfLoading.style.display = 'flex';
        }
        if (pdfCanvas) {
            pdfCanvas.style.display = 'none';
        }
        
        // Load PDF
        loadPdf(book.pdfPath);
        
        // Update UI controls
        updatePdfControls();
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
    }

    function loadPdf(url) {
        // Check if PDF.js is loaded
        if (typeof pdfjsLib === 'undefined') {
            console.error('PDF.js library not loaded');
            if (pdfLoading) {
                pdfLoading.innerHTML = `
                    <div style="color: #e74c3c; margin-bottom: 1rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem;"></i>
                    </div>
                    <p style="color: #e74c3c; font-weight: 600;">PDF Viewer Error</p>
                    <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">
                        PDF library not loaded. Please check your internet connection.
                    </p>
                `;
            }
            return;
        }
        
        // Configure PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        // Load PDF document
        const loadingTask = pdfjsLib.getDocument({
            url: url,
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
            cMapPacked: true
        });
        
        loadingTask.promise.then(
            function(pdfDoc) {
                pdfViewer.pdfDoc = pdfDoc;
                if (pageCountElement) {
                    pageCountElement.textContent = pdfDoc.numPages;
                }
                
                // Render first page
                renderPage(pdfViewer.pageNum);
                
                // Hide loading
                if (pdfLoading) {
                    pdfLoading.style.display = 'none';
                }
                if (pdfCanvas) {
                    pdfCanvas.style.display = 'block';
                }
            },
            function(error) {
                console.error('Error loading PDF:', error);
                if (pdfLoading) {
                    pdfLoading.innerHTML = `
                        <div style="color: #e74c3c; margin-bottom: 1rem;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem;"></i>
                        </div>
                        <p style="color: #e74c3c; font-weight: 600;">Failed to load PDF</p>
                        <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">
                            ${error.message || 'PDF file cannot be loaded'}
                        </p>
                        <button onclick="downloadCurrentPdf()" class="btn primary" style="margin-top: 1rem;">
                            <i class="fas fa-download"></i> Try Download Instead
                        </button>
                    `;
                }
            }
        );
    }

    function renderPage(num) {
        if (!pdfViewer.pdfDoc || !pdfViewer.canvas) return;
        
        pdfViewer.pageRendering = true;
        
        pdfViewer.pdfDoc.getPage(num).then(function(page) {
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
            
            renderTask.promise.then(function() {
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
        
        pdfViewer.pdfDoc.getPage(pdfViewer.pageNum).then(function(page) {
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
        
        pdfViewer.pdfDoc.getPage(pdfViewer.pageNum).then(function(page) {
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
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px)';
                this.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
            });
        });
        
        // Add hover effects to feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px)';
                this.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
            });
        });
    }

    // ==================== SMOOTH SCROLL ====================
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
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
    function setupSearch() {
        const searchForm = document.querySelector('.search-form');
        const searchInput = searchForm ? searchForm.querySelector('input[type="search"]') : null;
        
        if (searchForm && searchInput) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const query = searchInput.value.trim();
                
                if (query) {
                    showNotification(`Searching for: "${query}"`, 'info');
                    // In a real implementation, this would filter books
                    searchInput.value = '';
                }
            });
        }
    }

    // ==================== INITIALIZE ALL FEATURES ====================
    init();
    setupSearch();

    // Make essential functions available globally
    window.downloadCurrentPdf = downloadCurrentPdf;
    window.openPdfViewer = openPdfViewer;
    window.closePdfViewer = closePdfViewer;
});