window.onload = async () => {
  // Setup form event listener
  document.getElementById('reset-password-form').addEventListener('submit', handlePasswordReset);
  
  // Check for reset token in URL (Supabase flow)
  await checkForPasswordResetToken();
};

// Check for password reset token in URL and validate (Supabase Auth)
async function checkForPasswordResetToken() {
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('access_token');
  const type = urlParams.get('type');
  
  // Supabase password recovery flow
  if (type === 'recovery' && accessToken) {
    try {
      // Verify the session with Supabase
      const user = await window.supabaseAuth.getCurrentUser();
      
      if (user && user.email) {
        // Valid recovery session, show the reset form
        document.getElementById('reset-email').value = user.email;
        document.getElementById('email-display').textContent = user.email;
        document.getElementById('reset-password-form').style.display = 'block';
        return;
      }
    } catch (error) {
      console.error('Error verifying recovery token:', error);
    }
  }
  
  // If no valid token, show invalid message
  showInvalidToken();
}

// Handle password reset submission
async function handlePasswordReset(event) {
  event.preventDefault();
  
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
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
  
  if (!window.supabaseAuth || !window.supabaseAuth.updatePassword) {
    showError("Authentication system not initialized. Please refresh the page.");
    return;
  }
  
  showLoading();
  hideError();
  hideSuccess();
  
  try {
    // Use Supabase Auth to update password
    const { data, error } = await window.supabaseAuth.updatePassword(newPassword);
    
    if (error) {
      throw error;
    }
    
    if (data) {
      showSuccess("Password reset successful! You can now sign in with your new password.");
      
      // Hide the form and show success
      document.getElementById('reset-password-form').style.display = 'none';
      
      // Sign out the user (recovery session should be cleared)
      await window.supabaseAuth.signOut();
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        window.location.href = '/login.html?message=password-reset-success';
      }, 3000);
    } else {
      throw new Error("Failed to reset password. Please try again.");
    }
  } catch (error) {
    console.error("Password reset error:", error);
    
    let errorMessage = "Failed to reset password. Please try again or request a new reset link.";
    
    // Handle specific error messages
    if (error.message.includes("Invalid") || error.message.includes("expired")) {
      showInvalidToken();
      return;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    showError(errorMessage);
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