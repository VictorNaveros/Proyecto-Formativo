document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("error-message");

  errorMsg.textContent = ""; // Limpia errores previos

  // Validación básica en frontend
  if (!username || !password) {
    errorMsg.textContent = "Debes ingresar usuario y contraseña.";
    return;
  }

  try {
    const resp = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await resp.json();
    console.log("Respuesta login:", resp.status, data);

    if (!resp.ok) {
      errorMsg.textContent = data.message || "Credenciales incorrectas.";
      return;
    }

    // Guardar sesión (por ahora solo los datos del usuario)
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirigir al dashboard
    window.location.href = "/pages/dashboard.html";
  } catch (err) {
    console.error("Error de conexión:", err);
    errorMsg.textContent = "No se pudo conectar con el servidor.";
  }
});
