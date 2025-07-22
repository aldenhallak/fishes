// Footer utility - shared footer across all pages
// This creates and inserts the footer HTML dynamically

function createFooter() {
    const footer = document.createElement('footer');
    footer.id = 'footer-love';
    footer.style.cssText = 'text-align:center; margin:32px 0 12px 0; color:#888; font-size:1.05em;';
    
    footer.innerHTML = `
        Made with <span style="color:#e25555;">hate</span> by <a href="https://fifteen.games">fifteen.games</a> | 
        <a href="https://github.com/aldenhallak/fishes">Source Code</a> | 
        <a href="https://twitter.com/MCBananaPeelz" title="Follow @MCBananaPeelz on Twitter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
            </svg>
        </a> | 
        <a href="https://instagram.com/verybigandstrong" title="Follow @verybigandstrong on Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
        </a>
    `;
    
    return footer;
}

function createSpecialFooter() {
    // Special footer for fishtank-view.html which has navigation links
    const footer = document.createElement('footer');
    footer.style.cssText = 'text-align:center; margin:32px 0 12px 0; color:#888; font-size:12px;';
    
    footer.innerHTML = `
        <a href="index.html" style="color: #0066cc; text-decoration: underline;">draw</a>
        | <a href="tank.html" style="color: #0066cc; text-decoration: underline;">public tank</a>
        | <a href="rank.html" style="color: #0066cc; text-decoration: underline;">rankings</a>
        | <a href="fishtanks.html" id="my-tanks-link" style="color: #0066cc; text-decoration: underline;">my tanks</a>
        | <a href="login.html" id="auth-link" style="color: #0066cc; text-decoration: underline;">login</a>
        <br><br>
        Made with <span style="color:#e25555;">hate</span> by <a href="https://fifteen.games" style="color: #0066cc; text-decoration: underline;">fifteen.games</a> | 
        <a href="https://github.com/aldenhallak/fishes" style="color: #0066cc; text-decoration: underline;">Source Code</a> | 
        <a href="https://twitter.com/MCBananaPeelz" title="Follow @MCBananaPeelz on Twitter" style="color: #0066cc; text-decoration: underline;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
            </svg>
        </a> | 
        <a href="https://instagram.com/verybigandstrong" title="Follow @verybigandstrong on Instagram" style="color: #0066cc; text-decoration: underline;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
        </a>
    `;
    
    return footer;
}

function insertFooter(special = false) {
    // Remove any existing footer first
    const existingFooter = document.querySelector('#footer-love, footer');
    if (existingFooter) {
        existingFooter.remove();
    }
    
    // Create and insert the appropriate footer
    const footer = special ? createSpecialFooter() : createFooter();
    
    // Insert before the first script tag in the body, or at the end of body if no scripts
    const bodyScripts = document.querySelectorAll('body script');
    if (bodyScripts.length > 0) {
        bodyScripts[0].parentNode.insertBefore(footer, bodyScripts[0]);
    } else {
        document.body.appendChild(footer);
    }
    
    // Debug log to verify insertion
    console.log('Footer inserted:', special ? 'special' : 'regular');
    console.log('Footer element:', footer);
    console.log('Footer parent:', footer.parentNode);
    console.log('Footer in DOM:', document.querySelector('#footer-love, footer'));
}

// Auto-initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing footer...');
    console.log('Body element:', document.body);
    console.log('Body children before footer:', document.body.children.length);
    
    // Check if this is fishtank-view.html based on the page structure or URL
    const isSpecialFooter = document.querySelector('#tank-content') !== null || 
                           window.location.pathname.includes('fishtank-view.html');
    console.log('Footer utility loaded. Special footer:', isSpecialFooter);
    
    insertFooter(isSpecialFooter);
    
    console.log('Body children after footer:', document.body.children.length);
    console.log('Last body child:', document.body.lastElementChild);
});

// Export functions for manual usage if needed
window.footerUtils = {
    insertFooter,
    createFooter,
    createSpecialFooter
};
