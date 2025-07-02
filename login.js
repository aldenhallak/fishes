  
  window.onload = () => {
    google.accounts.id.initialize({
      client_id: "571679687712-bhet9jnrul5gm1ijhjk6am28dfrtd88h.apps.googleusercontent.com",
      callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
      document.getElementById("g_id_signin"),
      { theme: "outline", size: "large" }
    );
  };

  async function handleCredentialResponse(response) {
    const res = await fetch(BACKEND_URL + "/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: response.credential })
    });

    if (res.ok) {
      localStorage.setItem("adminToken", await res.text());
      window.location.href = "/moderation.html";
    } else {
      alert("Access denied.");
    }
  }
