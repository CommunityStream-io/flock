/**
 * Flock Documentation Site JavaScript
 * Interactive functionality for navigation, TOC, and responsive features
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileNavigation();
    initTableOfContents();
    initSmoothScrolling();
    initCodeBlocks();
    initSearchFunctionality();
    initThemeToggle();
    initProgressIndicator();
    initTooltips();
});

/**
 * Mobile Navigation Toggle
 */
function initMobileNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Update ARIA attributes
            const isOpen = navMenu.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isOpen);
            
            // Animate hamburger icon
            const spans = navToggle.querySelectorAll('span');
            spans.forEach((span, index) => {
                if (isOpen) {
                    if (index === 0) span.style.transform = 'rotate(45deg) translate(6px, 6px)';
                    if (index === 1) span.style.opacity = '0';
                    if (index === 2) span.style.transform = 'rotate(-45deg) translate(6px, -6px)';
                } else {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                }
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                
                // Reset hamburger icon
                const spans = navToggle.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                });
            }
        });
    }
}

/**
 * Dynamic Table of Contents Generation
 */
function initTableOfContents() {
    const tocContainer = document.getElementById('toc-container');
    const tocToggle = document.getElementById('toc-toggle');
    const tocNav = document.getElementById('toc');
    
    if (!tocContainer || !tocToggle || !tocNav) return;
    
    // Generate TOC from headings
    const headings = document.querySelectorAll('.page-content h1, .page-content h2, .page-content h3, .page-content h4');
    
    if (headings.length === 0) {
        tocContainer.style.display = 'none';
        return;
    }
    
    let tocHTML = '<ul>';
    let currentLevel = 1;
    
    headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        const id = heading.id || `heading-${index}`;
        const text = heading.textContent.trim();
        
        // Add ID if not present
        if (!heading.id) {
            heading.id = id;
        }
        
        // Adjust nesting based on heading level
        if (level > currentLevel) {
            for (let i = currentLevel; i < level; i++) {
                tocHTML += '<ul>';
            }
        } else if (level < currentLevel) {
            for (let i = level; i < currentLevel; i++) {
                tocHTML += '</ul>';
            }
        }
        
        tocHTML += `<li><a href="#${id}" class="toc-link" data-level="${level}">${text}</a></li>`;
        currentLevel = level;
    });
    
    // Close any remaining open lists
    for (let i = 1; i < currentLevel; i++) {
        tocHTML += '</ul>';
    }
    tocHTML += '</ul>';
    
    tocNav.innerHTML = tocHTML;
    
    // TOC toggle functionality
    tocToggle.addEventListener('click', function() {
        tocNav.classList.toggle('active');
    });
    
    // Close TOC when clicking outside
    document.addEventListener('click', function(event) {
        if (!tocContainer.contains(event.target)) {
            tocNav.classList.remove('active');
        }
    });
    
    // Highlight current section in TOC
    const tocLinks = tocNav.querySelectorAll('.toc-link');
    
    function updateActiveTocLink() {
        let activeHeading = null;
        const scrollPosition = window.scrollY + 100; // Offset for better UX
        
        headings.forEach(heading => {
            if (heading.offsetTop <= scrollPosition) {
                activeHeading = heading;
            }
        });
        
        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (activeHeading && link.getAttribute('href') === `#${activeHeading.id}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Update active TOC link on scroll
    window.addEventListener('scroll', debounce(updateActiveTocLink, 100));
    updateActiveTocLink(); // Initial call
}

/**
 * Smooth Scrolling for Anchor Links
 */
function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80; // Account for fixed header
                const elementPosition = targetElement.offsetTop;
                const offsetPosition = elementPosition - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without triggering scroll
                history.pushState(null, null, targetId);
            }
        });
    });
}

/**
 * Enhanced Code Block Functionality
 */
function initCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach((block, index) => {
        const pre = block.parentElement;
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        
        // Create header with language and copy button
        const header = document.createElement('div');
        header.className = 'code-block-header';
        
        // Detect language (assume it's in a class like 'language-typescript')
        const languageMatch = block.className.match(/language-(\w+)/);
        const language = languageMatch ? languageMatch[1] : 'text';
        
        const languageLabel = document.createElement('span');
        languageLabel.className = 'code-language';
        languageLabel.textContent = language.toUpperCase();
        
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
        copyButton.setAttribute('aria-label', 'Copy code to clipboard');
        
        header.appendChild(languageLabel);
        header.appendChild(copyButton);
        
        // Wrap the pre element
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(header);
        wrapper.appendChild(pre);
        
        // Copy functionality
        copyButton.addEventListener('click', async function() {
            try {
                await navigator.clipboard.writeText(block.textContent);
                this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                this.classList.add('copied');
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    this.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy code:', err);
                this.innerHTML = '<i class="fas fa-times"></i> Failed';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
            }
        });
        
        // Add line numbers if the code block is large
        const lines = block.textContent.split('\n');
        if (lines.length > 5) {
            pre.classList.add('with-line-numbers');
            
            const lineNumbers = document.createElement('div');
            lineNumbers.className = 'line-numbers';
            
            for (let i = 1; i <= lines.length; i++) {
                const lineNumber = document.createElement('span');
                lineNumber.textContent = i;
                lineNumbers.appendChild(lineNumber);
            }
            
            wrapper.appendChild(lineNumbers);
        }
    });
}

/**
 * Basic Search Functionality
 */
function initSearchFunctionality() {
    // Create search overlay
    const searchOverlay = document.createElement('div');
    searchOverlay.className = 'search-overlay';
    searchOverlay.innerHTML = `
        <div class="search-container">
            <div class="search-header">
                <input type="text" id="search-input" placeholder="Search documentation..." autocomplete="off">
                <button id="search-close" aria-label="Close search">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="search-results" id="search-results">
                <p class="search-instructions">Start typing to search the documentation...</p>
            </div>
        </div>
    `;
    document.body.appendChild(searchOverlay);
    
    // Search trigger (Ctrl/Cmd + K)
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearch();
        }
        
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            closeSearch();
        }
    });
    
    // Search close button
    document.getElementById('search-close').addEventListener('click', closeSearch);
    
    // Close search when clicking outside
    searchOverlay.addEventListener('click', function(e) {
        if (e.target === searchOverlay) {
            closeSearch();
        }
    });
    
    // Simple search implementation
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    searchInput.addEventListener('input', debounce(function() {
        const query = this.value.trim();
        
        if (query.length < 2) {
            searchResults.innerHTML = '<p class="search-instructions">Type at least 2 characters to search...</p>';
            return;
        }
        
        performSearch(query);
    }, 300));
    
    function openSearch() {
        searchOverlay.classList.add('active');
        searchInput.focus();
    }
    
    function closeSearch() {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '<p class="search-instructions">Start typing to search the documentation...</p>';
    }
    
    function performSearch(query) {
        // Simple text-based search (in a real implementation, you'd use a proper search engine)
        const allContent = document.querySelectorAll('.page-content h1, .page-content h2, .page-content h3, .page-content p');
        const results = [];
        
        allContent.forEach(element => {
            const text = element.textContent.toLowerCase();
            if (text.includes(query.toLowerCase())) {
                const heading = element.closest('.page-content').querySelector('h1');
                const pageTitle = heading ? heading.textContent : 'Unknown Page';
                
                results.push({
                    title: pageTitle,
                    element: element.tagName,
                    text: element.textContent.substring(0, 150) + (element.textContent.length > 150 ? '...' : ''),
                    url: window.location.pathname + '#' + (element.id || '')
                });
            }
        });
        
        displaySearchResults(results, query);
    }
    
    function displaySearchResults(results, query) {
        if (results.length === 0) {
            searchResults.innerHTML = '<p class="no-results">No results found for "' + escapeHtml(query) + '"</p>';
            return;
        }
        
        let html = `<p class="search-info">Found ${results.length} result${results.length > 1 ? 's' : ''} for "${escapeHtml(query)}"</p>`;
        html += '<div class="search-results-list">';
        
        results.forEach(result => {
            html += `
                <div class="search-result">
                    <h4><a href="${result.url}" onclick="closeSearch()">${escapeHtml(result.title)}</a></h4>
                    <p>${highlightSearchTerm(escapeHtml(result.text), query)}</p>
                    <span class="result-type">${result.element}</span>
                </div>
            `;
        });
        
        html += '</div>';
        searchResults.innerHTML = html;
    }
    
    function highlightSearchTerm(text, term) {
        const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
}

/**
 * Theme Toggle Functionality
 */
function initThemeToggle() {
    // Create theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.setAttribute('aria-label', 'Toggle dark mode');
    themeToggle.title = 'Toggle theme';
    
    // Add to navigation
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        const navItem = document.createElement('div');
        navItem.className = 'nav-item';
        navItem.appendChild(themeToggle);
        navMenu.appendChild(navItem);
    }
    
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Toggle theme
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            themeToggle.title = 'Switch to light mode';
        } else {
            icon.className = 'fas fa-moon';
            themeToggle.title = 'Switch to dark mode';
        }
    }
}

/**
 * Reading Progress Indicator
 */
function initProgressIndicator() {
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    document.body.appendChild(progressBar);
    
    function updateProgress() {
        const article = document.querySelector('.page-content');
        if (!article) return;
        
        const articleTop = article.offsetTop;
        const articleHeight = article.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollTop = window.scrollY;
        
        const articleStart = articleTop - windowHeight / 2;
        const articleEnd = articleTop + articleHeight - windowHeight / 2;
        const progress = Math.max(0, Math.min(100, ((scrollTop - articleStart) / (articleEnd - articleStart)) * 100));
        
        progressBar.style.width = progress + '%';
    }
    
    window.addEventListener('scroll', debounce(updateProgress, 10));
    updateProgress();
}

/**
 * Tooltip Functionality for Tool Links and Status Badges
 */
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[title]');
    
    tooltipElements.forEach(element => {
        let tooltip = null;
        
        element.addEventListener('mouseenter', function() {
            const title = this.getAttribute('title');
            if (!title) return;
            
            // Remove title to prevent default tooltip
            this.removeAttribute('title');
            this.setAttribute('data-original-title', title);
            
            // Create tooltip
            tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = title;
            document.body.appendChild(tooltip);
            
            // Position tooltip
            const rect = this.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            tooltip.style.left = (rect.left + rect.width / 2 - tooltipRect.width / 2) + 'px';
            tooltip.style.top = (rect.top - tooltipRect.height - 8) + 'px';
            
            // Show tooltip
            setTimeout(() => tooltip.classList.add('visible'), 10);
        });
        
        element.addEventListener('mouseleave', function() {
            if (tooltip) {
                tooltip.remove();
                tooltip = null;
            }
            
            // Restore original title
            const originalTitle = this.getAttribute('data-original-title');
            if (originalTitle) {
                this.setAttribute('title', originalTitle);
                this.removeAttribute('data-original-title');
            }
        });
    });
}

/**
 * Utility Functions
 */

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Make functions available globally for inline event handlers
window.closeSearch = function() {
    document.querySelector('.search-overlay').classList.remove('active');
};

// Analytics and performance tracking
window.addEventListener('load', function() {
    // Track page load time
    const loadTime = performance.now();
    console.log(`Page loaded in ${Math.round(loadTime)}ms`);
    
    // Track user interactions (if analytics is needed)
    document.addEventListener('click', function(e) {
        if (e.target.matches('a[href^="#"]')) {
            // Track internal link clicks
            console.log('Internal link clicked:', e.target.getAttribute('href'));
        } else if (e.target.matches('a[href^="http"]')) {
            // Track external link clicks
            console.log('External link clicked:', e.target.href);
        }
    });
});