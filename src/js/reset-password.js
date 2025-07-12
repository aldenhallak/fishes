window.onload = () => {
  // Setup form event listener
  document.getElementById('reset-password-form').addEventListener('submit', handlePasswordReset);
  
  // Check for reset token in URL
  checkForPasswordResetToken();
};

// Check for password reset token in URL and validate
function checkForPasswordResetToken() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const email = urlParams.get('email');
  
  if (!token || !email) {
    showInvalidToken();
    return;
  }
  
  // Decode email if it was encoded
  const decodedEmail = decodeURIComponent(email);
  
  // Store token and email in hidden fields
  document.getElementById('reset-token').value = token;
  document.getElementById('reset-email').value = decodedEmail;
  document.getElementById('email-display').textContent = decodedEmail;
  
  // Show the reset form
  document.getElementById('reset-password-form').style.display = 'block';
}

// Handle password reset submission
async function handlePasswordReset(event) {
  event.preventDefault();
  
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const token = document.getElementById('reset-token').value;
  const email = document.getElementById('reset-email').value;
  
  if (!newPassword || !confirmPassword) {
    showError("Please fill in both password fields.");
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showError("Passwords do not match.");
    return;
  }
  
  if (newPassword.length < 6) {
    showError("Password must be at least 6 characters long.");
    return;
  }
  
  showLoading();
  hideError();
  hideSuccess();
  
  try {
    const response = await fetch(BACKEND_URL + "/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email, 
        token, 
        newPassword 
      })
    });
    
    if (response.ok) {
      showSuccess("Password reset successful! You can now sign in with your new password.");
      
      // Hide the form and show success
      document.getElementById('reset-password-form').style.display = 'none';
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        window.location.href = '/login.html?message=password-reset-success';
      }, 3000);
      
    } else {
      const errorResponse = await response.json().catch(() => ({}));
      
      // If token is invalid/expired, show invalid token message
      if (response.status === 400 || response.status === 401) {
        showInvalidToken();
      } else {
        throw new Error(errorResponse.error || "Failed to reset password.");
      }
    }
  } catch (error) {
    console.error("Password reset error:", error);
    showError(error.message || "Failed to reset password. Please try again or request a new reset link.");
  } finally {
    hideLoading();
  }
}

// Show invalid token message
function showInvalidToken() {
  document.getElementById('reset-password-form').style.display = 'none';
  document.getElementById('invalid-token').style.display = 'block';
}

// UI Helper Functions
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