  
  window.onload = () => {
    // Setup form event listeners
    document.getElementById('signin-form').addEventListener('submit', handleSignIn);
    document.getElementById('signup-form').addEventListener('submit', handleSignUp);
    document.getElementById('forgot-password-form').addEventListener('submit', handleForgotPassword);
    
    // Initialize Google Sign-In
    google.accounts.id.initialize({
      client_id: "571679687712-bhet9jnrul5gm1ijhjk6am28dfrtd88h.apps.googleusercontent.com",
      callback: handleGoogleCredentialResponse
    });
    
    // Render Google Sign-In button
    google.accounts.id.renderButton(
      document.getElementById("g_id_signin"),
      { theme: "outline", size: "large" }
    );

    // Check for success messages from redirects
    checkForSuccessMessage();
  };

  // Helper function to handle successful authentication
  function handleAuthSuccess(authResponse) {
    localStorage.setItem("userToken", authResponse.token);
    localStorage.setItem("userData", JSON.stringify(authResponse.user));
    
    // Check if user has admin privileges and show notification
    if (authResponse.user && authResponse.user.isAdmin) {
      showMessage("Welcome! You have admin privileges. You can access the moderation panel from the main app.");
    }
    
    window.location.href = "/fishtanks.html";
  }

  // Helper function to handle API errors
  async function handleApiError(response, defaultMessage) {
    const errorResponse = await response.json().catch(() => ({}));
    throw new Error(errorResponse.error || defaultMessage);
  }

  // Helper function to execute authentication requests
  async function executeAuthRequest(requestPromise, errorContext, defaultErrorMessage) {
    showLoading();
    hideError();
    
    try {
      const response = await requestPromise;
      
      if (response.ok) {
        const authResponse = await response.json();
        handleAuthSuccess(authResponse);
      } else {
        await handleApiError(response, defaultErrorMessage);
      }
    } catch (error) {
      console.error(`${errorContext} error:`, error);
      showError(error.message || `${defaultErrorMessage} Please try again.`);
    } finally {
      hideLoading();
    }
  }

  // Google OAuth handler
  async function handleGoogleCredentialResponse(response) {
    const requestPromise = fetch(BACKEND_URL + "/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: response.credential })
    });
    
    await executeAuthRequest(requestPromise, "Google authentication", "Authentication failed.");
  }

  // Handle email/password sign in
  async function handleSignIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    
    if (!email || !password) {
      showError("Please enter both email and password.");
      return;
    }
    
    const requestPromise = fetch(BACKEND_URL + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    
    await executeAuthRequest(requestPromise, "Sign in", "Sign in failed.");
  }

  // Handle email/password sign up
  async function handleSignUp(event) {
    event.preventDefault();
    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const userId = localStorage.getItem('userId') || null; // Optional userId for existing users
    const artistName = localStorage.getItem('artistName') || 'Anonymous'; // Optional artist name for existing users
    
    if (!email || !password) {
      showError("Please fill in all fields.");
      return;
    }
    
    if (password.length < 6) {
      showError("Password must be at least 6 characters long.");
      return;
    }
    
    const requestPromise = fetch(BACKEND_URL + "/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({displayName: artistName, email, password, userId })
    });
    
    await executeAuthRequest(requestPromise, "Sign up", "Registration failed.");
  }

  // Handle forgot password request
  async function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgot-email').value;
    
    if (!email) {
      showError("Please enter your email address.");
      return;
    }
    
    showLoading();
    hideError();
    hideSuccess();
    
    try {
      const response = await fetch(BACKEND_URL + "/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        showSuccess("Password reset email sent! Please check your inbox and spam folder.");
        document.getElementById('forgot-password-form').reset();
      } else {
        const errorResponse = await response.json().catch(() => ({}));
        throw new Error(errorResponse.error || "Failed to send reset email.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      showError(error.message || "Failed to send reset email. Please try again.");
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

  // UI Helper Functions

  function showAuthForm(type) {
    // Update button states
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[onclick="showAuthForm('${type}')"]`).classList.add('active');
    
    // Show/hide forms
    document.getElementById('signin-form').style.display = type === 'signin' ? 'flex' : 'none';
    document.getElementById('signup-form').style.display = type === 'signup' ? 'flex' : 'none';
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
    document.getElementById('forgot-password-form').style.display = 'flex';
    
    // Clear form fields
    document.getElementById('forgot-password-form').reset();
    hideError();
    hideSuccess();
  }

  function showLoading() {
    document.getElementById('loading').style.display = 'block';
  }

  function hideLoading() {
    document.getElementById('loading').style.display = 'none';
  }

  function showError(message) {
    const errorElement = document.getElementById('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }

  function hideError() {
    document.getElementById('error').style.display = 'none';
  }

  function showSuccess(message) {
    const successElement = document.getElementById('success');
    successElement.textContent = message;
    successElement.style.display = 'block';
  }

  function hideSuccess() {
    document.getElementById('success').style.display = 'none';
  }

  function showMessage(message) {
    // Create a temporary message element for success notifications
    const messageElement = document.createElement('div');
    messageElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #c0c0c0;
      color: #008000;
      padding: 8px 12px;
      border: 2px outset #808080;
      z-index: 1000;
      font-family: "MS Sans Serif", sans-serif;
      font-size: 11px;
      max-width: 300px;
    `;
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(messageElement)) {
        document.body.removeChild(messageElement);
      }
    }, 5000);
  }
