  
  window.onload = () => {
    // Setup form event listeners
    document.getElementById('signin-form').addEventListener('submit', handleSignIn);
    document.getElementById('signup-form').addEventListener('submit', handleSignUp);
    
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
  };

  // Google OAuth handler
  async function handleGoogleCredentialResponse(response) {
    showLoading();
    hideError();
    
    try {
      const res = await fetch(BACKEND_URL + "/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential })
      });

      if (res.ok) {
        const authResponse = await res.json();
        localStorage.setItem("userToken", authResponse.token);
        localStorage.setItem("userData", JSON.stringify(authResponse.user));
        
        // Check if user has admin privileges and show notification
        if (authResponse.user && authResponse.user.isAdmin) {
          showMessage("Welcome! You have admin privileges. You can access the moderation panel from the main app.");
        }
        
        window.location.href = "/index.html"; // Redirect to main app
      } else {
        const errorResponse = await res.json().catch(() => ({}));
        throw new Error(errorResponse.error || "Authentication failed.");
      }
    } catch (error) {
      console.error('Google authentication error:', error);
      showError(error.message || "Authentication failed. Please try again.");
    } finally {
      hideLoading();
    }
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
    
    showLoading();
    hideError();
    
    try {
      const res = await fetch(BACKEND_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const authResponse = await res.json();
        localStorage.setItem("userToken", authResponse.token);
        localStorage.setItem("userData", JSON.stringify(authResponse.user));
        
        // Check if user has admin privileges and show notification
        if (authResponse.user && authResponse.user.isAdmin) {
          showMessage("Welcome! You have admin privileges. You can access the moderation panel from the main app.");
        }
        
        window.location.href = "/index.html"; // Redirect to main app
      } else {
        const errorResponse = await res.json().catch(() => ({}));
        throw new Error(errorResponse.error || "Login failed.");
      }
    } catch (error) {
      console.error('Sign in error:', error);
      showError(error.message || "Sign in failed. Please try again.");
    } finally {
      hideLoading();
    }
  }

  // Handle email/password sign up
  async function handleSignUp(event) {
    event.preventDefault();
    
    const displayName = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    if (!displayName || !email || !password) {
      showError("Please fill in all fields.");
      return;
    }
    
    if (password.length < 6) {
      showError("Password must be at least 6 characters long.");
      return;
    }
    
    showLoading();
    hideError();
    
    try {
      const res = await fetch(BACKEND_URL + "/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password })
      });

      if (res.ok) {
        const authResponse = await res.json();
        localStorage.setItem("userToken", authResponse.token);
        localStorage.setItem("userData", JSON.stringify(authResponse.user));
        
        // Check if user has admin privileges and show notification
        if (authResponse.user && authResponse.user.isAdmin) {
          showMessage("Welcome! You have admin privileges. You can access the moderation panel from the main app.");
        }
        
        window.location.href = "/index.html"; // Redirect to main app
      } else {
        const errorResponse = await res.json().catch(() => ({}));
        throw new Error(errorResponse.error || "Registration failed.");
      }
    } catch (error) {
      console.error('Sign up error:', error);
      showError(error.message || "Registration failed. Please try again.");
    } finally {
      hideLoading();
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
    
    // Clear form fields
    document.getElementById('signin-form').reset();
    document.getElementById('signup-form').reset();
    hideError();
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

  function showMessage(message) {
    // Create a temporary message element for success notifications
    const messageElement = document.createElement('div');
    messageElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 1000;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
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
