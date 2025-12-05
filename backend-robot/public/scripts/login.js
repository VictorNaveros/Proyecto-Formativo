document.getElementById("login-form")?.addEventListener("submit", function (e) {
  e.preventDefault();  // Evitar que el formulario se envíe de manera tradicional

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Validar las credenciales (en un entorno real, esto se haría con el backend)
  if (username === "admin" && password === "admin123") {
    // Si las credenciales son correctas, guardamos un token ficticio en localStorage
    localStorage.setItem("auth_token", "admin-token");

    // Redirigir al panel de administración
    window.location.href = "admin-dashboard.html";
  } else {
    // Si las credenciales son incorrectas, mostrar mensaje de error
    document.getElementById("error-message").textContent = "Credenciales incorrectas";
  }
});
