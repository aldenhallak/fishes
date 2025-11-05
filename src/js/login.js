/**
 * Login Page - Supabase Auth
 * 使用Supabase替换原有的Firebase/自定义后端认证
 */

window.onload = () => {
  // Check if user is already logged in
  checkIfAlreadyLoggedIn();
  
  // Setup form event listeners
  document.getElementById('signin-form').addEventListener('submit', handleSignIn);
  document.getElementById('signup-form').addEventListener('submit', handleSignUp);
  document.getElementById('forgot-password-form').addEventListener('submit', handleForgotPassword);
  
  // Check for success messages from redirects
  checkForSuccessMessage();
  
  // Check for email confirmation
  checkEmailConfirmation();
  
  // Load test credentials in development
  loadTestCredentials();
};

// Load test credentials from environment (development only)
async function loadTestCredentials() {
  // Only in development mode (localhost)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return;
  }
  
  // Check for URL parameter to enable test mode
  const urlParams = new URLSearchParams(window.location.search);
  const testMode = urlParams.get('test') === 'true';
  
  if (!testMode) {
    return; // Only load when explicitly requested
  }
  
  try {
    const response = await fetch('/api/config/test-credentials');
    if (response.ok) {
      const { email, password } = await response.json();
      if (email && password) {
        // Pre-fill test credentials
        const emailInput = document.getElementById('signin-email');
        const passwordInput = document.getElementById('signin-password');
        
        if (emailInput) emailInput.value = email;
        if (passwordInput) passwordInput.value = password;
        
        console.log('🧪 Test credentials loaded:', email);
        
        // Add visual indicator
        const form = document.getElementById('signin-form');
        if (form) {
          const testBadge = document.createElement('div');
          testBadge.style.cssText = 'background: #FEF3C7; color: #92400E; padding: 8px 12px; border-radius: 8px; text-align: center; margin-bottom: 10px; font-size: 12px; font-weight: 600;';
          testBadge.textContent = '🧪 TEST MODE - Credentials pre-filled';
          form.insertBefore(testBadge, form.firstChild);
        }
      }
    }
  } catch (error) {
    // Silently fail - test credentials are optional
    console.log('ℹ️ No test credentials available');
  }
}

// Check if user is already logged in
async function checkIfAlreadyLoggedIn() {
  if (!window.supabaseAuth || !window.supabaseAuth.client) {
    console.warn('⚠️ Supabase未初始化');
    return false;
  }
  
  try {
    const user = await window.supabaseAuth.getCurrentUser();
    
    if (user) {
      // User is already logged in, show the "already logged in" section
      showAlreadyLoggedInUI(user);
      return true;
    }
    return false;
  } catch (error) {
    console.error('检查登录状态失败:', error);
    return false;
  }
}

// Show the already logged in UI
function showAlreadyLoggedInUI(user) {
  // Hide all login forms
  document.getElementById('signin-form').style.display = 'none';
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('forgot-password-form').style.display = 'none';
  document.querySelectorAll('.auth-tab-btn').forEach(btn => btn.style.display = 'none');
  
  // Hide Google sign in if exists
  const googleBtn = document.getElementById('g_id_signin');
  if (googleBtn) googleBtn.style.display = 'none';
  
  const divider = document.querySelector('.divider');
  if (divider) divider.style.display = 'none';
  
  // Show the already logged in section
  const alreadyLoggedIn = document.getElementById('already-logged-in');
  const userInfo = document.getElementById('logged-in-user-info');
  
  alreadyLoggedIn.style.display = 'block';
  
  // Get user display name
  const displayName = user.user_metadata?.name || 
                      user.user_metadata?.display_name ||
                      user.email?.split('@')[0] || 
                      'User';
  
  userInfo.textContent = `Welcome back, ${displayName}!`;
}

// Navigate to tanks page
async function goToTanks() {
  try {
    // Try to get user's default tank and redirect directly to it
    if (window.FishTankFavorites) {
      const defaultTank = await window.FishTankFavorites.getDefaultTank();
      if (defaultTank && defaultTank.id) {
        window.location.href = `fishtank-view.html?id=${defaultTank.id}`;
        return;
      }
    }
  } catch (error) {
    console.log('Could not get default tank, redirecting to tanks list:', error);
  }
  
  // Fallback: redirect to tanks list page
  window.location.href = 'fishtanks.html';
}

// Logout and stay on login page
async function logoutAndStay() {
  try {
    if (window.supabaseAuth && window.supabaseAuth.signOut) {
      await window.supabaseAuth.signOut();
    }
    
    // Clear any stored data
    localStorage.removeItem('loginRedirect');
    
    // Reload the page to show login forms again
    window.location.reload();
  } catch (error) {
    console.error('登出失败:', error);
    // Force reload anyway
    window.location.reload();
  }
}

// Get the redirect URL after successful login
function getRedirectUrl() {
  // Check URL parameters first (for immediate redirects)
  const urlParams = new URLSearchParams(window.location.search);
  const redirectParam = urlParams.get('redirect') || urlParams.get('returnUrl');
  
  if (redirectParam) {
    localStorage.removeItem('loginRedirect');
    const decodedUrl = decodeURIComponent(redirectParam);
    return validateRedirectUrl(decodedUrl);
  }
  
  // Check localStorage
  const storedRedirect = localStorage.getItem('loginRedirect');
  if (storedRedirect) {
    localStorage.removeItem('loginRedirect');
    return validateRedirectUrl(storedRedirect);
  }
  
  // Default redirect to index/fishtanks page
  return '/index.html';
}

// Validate and clean up redirect URL for security
function validateRedirectUrl(url) {
  try {
    // If it's a full URL, check if it's on the same origin
    if (url.startsWith('http')) {
      const redirectUrl = new URL(url);
      const currentOrigin = new URL(window.location.href).origin;
      if (redirectUrl.origin === currentOrigin) {
        return redirectUrl.pathname + redirectUrl.search;
      }
      return '/index.html';
    }
    
    // If it's a relative URL, use it as-is (but ensure it starts with /)
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
    
    return url;
  } catch (e) {
    console.warn('Invalid redirect URL:', url);
    return '/index.html';
  }
}

// Handle email/password sign in
async function handleSignIn(event) {
  event.preventDefault();
  
  const email = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;
  
  if (!email || !password) {
    showError("Please enter both email and password.");
    return;
  }
  
  if (!window.supabaseAuth || !window.supabaseAuth.signIn) {
    showError("Authentication system not initialized. Please refresh the page.");
    return;
  }
  
  showLoading();
  hideError();
  
  try {
    const { data, error } = await window.supabaseAuth.signIn(email, password);
    
    if (error) {
      throw error;
    }
    
    if (data && data.user) {
      // Success! Redirect
      const redirectUrl = getRedirectUrl();
      window.location.href = redirectUrl;
    } else {
      throw new Error('Login failed. Please try again.');
    }
  } catch (error) {
    console.error('Sign in error:', error);
    let errorMessage = 'Sign in failed. Please try again.';
    
    if (error.message.includes('Invalid login credentials')) {
      errorMessage = 'Invalid email or password.';
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = 'Please confirm your email address first.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    showError(errorMessage);
  } finally {
    hideLoading();
  }
}

// Handle email/password sign up
async function handleSignUp(event) {
  event.preventDefault();
  
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  
  if (!email || !password) {
    showError("Please fill in all fields.");
    return;
  }
  
  if (password.length < 6) {
    showError("Password must be at least 6 characters long.");
    return;
  }
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError("Please enter a valid email address.");
    return;
  }
  
  if (!window.supabaseAuth || !window.supabaseAuth.signUp) {
    showError("Authentication system not initialized. Please refresh the page.");
    return;
  }
  
  showLoading();
  hideError();
  
  try {
    const { data, error } = await window.supabaseAuth.signUp(email, password);
    
    if (error) {
      throw error;
    }
    
    if (data) {
      // Check if email confirmation is required
      if (data.user && !data.session) {
        showSuccess("Registration successful! Please check your email to confirm your account.");
      } else if (data.user && data.session) {
        // Auto-signed in
        showSuccess("Registration successful! Redirecting...");
        setTimeout(() => {
          const redirectUrl = getRedirectUrl();
          window.location.href = redirectUrl;
        }, 1500);
      } else {
        showSuccess("Registration successful!");
      }
      
      // Clear form
      document.getElementById('signup-form').reset();
    }
  } catch (error) {
    console.error('Sign up error:', error);
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.message.includes('already registered')) {
      errorMessage = 'This email is already registered. Please sign in instead.';
    } else if (error.message.includes('Password')) {
      errorMessage = error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    showError(errorMessage);
  } finally {
    hideLoading();
  }
}

// Handle forgot password request
async function handleForgotPassword(event) {
  event.preventDefault();
  
  const email = document.getElementById('forgot-email').value.trim();
  
  if (!email) {
    showError("Please enter your email address.");
    return;
  }
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError("Please enter a valid email address.");
    return;
  }
  
  if (!window.supabaseAuth || !window.supabaseAuth.resetPasswordForEmail) {
    showError("Authentication system not initialized. Please refresh the page.");
    return;
  }
  
  showLoading();
  hideError();
  hideSuccess();
  
  try {
    const { data, error } = await window.supabaseAuth.resetPasswordForEmail(email);
    
    if (error) {
      throw error;
    }
    
    showSuccess("Password reset email sent! Please check your inbox and spam folder.");
    document.getElementById('forgot-password-form').reset();
  } catch (error) {
    console.error('Forgot password error:', error);
    let errorMessage = 'Failed to send reset email. Please try again.';
    
    if (error.message) {
      errorMessage = error.message;
    }
    
    showError(errorMessage);
  } finally {
    hideLoading();
  }
}

// Check for success messages from URL parameters
function checkForSuccessMessage() {
  const urlParams = new URLSearchParams(window.location.search);
  const message = urlParams.get('message');
  
  if (message === 'password-reset-success') {
    showSuccess("Password reset successful! You can now sign in with your new password.");
    
    // Clear the URL parameter
    const url = new URL(window.location);
    url.searchParams.delete('message');
    window.history.replaceState({}, document.title, url.pathname);
  }
}

// Check for email confirmation
function checkEmailConfirmation() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Supabase redirects with type=signup for email confirmation
  const type = urlParams.get('type');
  const accessToken = urlParams.get('access_token');
  
  if (type === 'signup' && accessToken) {
    showSuccess("Email confirmed successfully! You can now sign in.");
    
    // Clear the URL parameters
    const url = new URL(window.location);
    url.searchParams.delete('type');
    url.searchParams.delete('access_token');
    url.searchParams.delete('refresh_token');
    window.history.replaceState({}, document.title, url.pathname);
  } else if (type === 'recovery' && accessToken) {
    // Password recovery flow - redirect to reset password page
    window.location.href = `/reset-password.html?access_token=${accessToken}`;
  }
}

// UI Helper Functions

function showAuthForm(type) {
  // Update button states
  document.querySelectorAll('.auth-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const targetBtn = document.querySelector(`[onclick="showAuthForm('${type}')"]`);
  if (targetBtn) targetBtn.classList.add('active');
  
  // Show/hide forms
  document.getElementById('signin-form').style.display = type === 'signin' ? 'block' : 'none';
  document.getElementById('signup-form').style.display = type === 'signup' ? 'block' : 'none';
  document.getElementById('forgot-password-form').style.display = 'none';
  
  // Clear form fields
  document.getElementById('signin-form').reset();
  document.getElementById('signup-form').reset();
  document.getElementById('forgot-password-form').reset();
  hideError();
  hideSuccess();
}

function showForgotPasswordForm() {
  // Hide auth tabs and other forms
  document.querySelectorAll('.auth-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show/hide forms
  document.getElementById('signin-form').style.display = 'none';
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('forgot-password-form').style.display = 'block';
  
  // Clear form fields
  document.getElementById('forgot-password-form').reset();
  hideError();
  hideSuccess();
}

function showLoading() {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'block';
}

function hideLoading() {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'none';
}

function showError(message) {
  const errorElement = document.getElementById('error');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

function hideError() {
  const errorElement = document.getElementById('error');
  if (errorElement) {
    errorElement.style.display = 'none';
  }
}

function showSuccess(message) {
  const successElement = document.getElementById('success');
  if (successElement) {
    successElement.textContent = message;
    successElement.style.display = 'block';
  }
}

function hideSuccess() {
  const successElement = document.getElementById('success');
  if (successElement) {
    successElement.style.display = 'none';
  }
}

function showMessage(message) {
  // Create a temporary message element for success notifications
  const messageElement = document.createElement('div');
  messageElement.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #6366F1, #4F46E5);
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    z-index: 1000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    max-width: 300px;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    animation: slideInRight 0.3s ease;
  `;
  messageElement.textContent = message;
  document.body.appendChild(messageElement);
  
  // Remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(messageElement)) {
      messageElement.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(messageElement)) {
          document.body.removeChild(messageElement);
        }
      }, 300);
    }
  }, 5000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
