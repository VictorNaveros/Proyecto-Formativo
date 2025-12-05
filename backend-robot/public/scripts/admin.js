const API_BASE = "http://localhost:5000/api";

// -----------------------------
// Funcionalidad para la página Administrativa
// -----------------------------

document.addEventListener("DOMContentLoaded", () => {
  // Verificar si el usuario está autenticado al cargar la página
  const token = localStorage.getItem("auth_token");

  // Si no hay token, redirigir a login
  if (!token) {
    window.location.href = "../pages/login.html";
  } else {
    // Si está autenticado, cargar datos del robot
    cargarEstado();
    cargarTelemetria();
    cargarEventos();

    // Solo activar la actualización cada 3 segundos en la página de administración
    setInterval(() => {
      cargarEstado();
      cargarTelemetria();
    }, 3000);
  }
});

// Función para cerrar sesión
document.getElementById("logout")?.addEventListener("click", () => {
  localStorage.removeItem("auth_token"); // Eliminar token
  window.location.href = "../pages/login.html"; // Redirigir al login
});

// -----------------------------
// Funciones para manejar la información y estado del robot
// -----------------------------

function formatearFecha(isoStr) {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  return d.toLocaleString();
}

// Cambiar color del estado del robot
function pintarEstado(estado) {
  const pill = document.getElementById("estado-pill");
  const upper = (estado || "DESCONOCIDO").toUpperCase();
  pill.textContent = upper;
  pill.className =
    "px-3 py-1 rounded-full text-xs font-semibold transition";

  if (upper === "ONLINE" || upper === "REANUDAR") {
    pill.classList.add("bg-green-100", "text-green-700");
  } else if (upper === "OFFLINE") {
    pill.classList.add("bg-gray-200", "text-gray-700");
  } else if (upper === "PAUSAR" || upper === "PAUSADO") {
    pill.classList.add("bg-yellow-100", "text-yellow-700");
  } else if (upper === "ERROR" || upper === "LLENO") {
    pill.classList.add("bg-red-100", "text-red-700");
  } else {
    pill.classList.add("bg-gray-200", "text-gray-700");
  }
}

// Cargar el estado del robot
async function cargarEstado() {
  try {
    const resp = await fetch(`${API_BASE}/estado`);
    const data = await resp.json();

    document.getElementById("estado-origen").textContent =
      "Origen: " + (data.origen || "—");
    document.getElementById("estado-mensaje").textContent =
      data.mensaje || "—";
    pintarEstado(data.estado);

    document.getElementById("last-update").textContent =
      "Última actualización: " + new Date().toLocaleTimeString();
  } catch (err) {
    console.error("Error cargando estado:", err);
    document.getElementById("estado-mensaje").textContent =
      "Error al obtener estado del servidor.";
    pintarEstado("ERROR");
  }
}

// Cargar la telemetría del robot
async function cargarTelemetria() {
  try {
    const resp = await fetch(`${API_BASE}/telemetria/ultima`);
    if (!resp.ok) {
      document.getElementById("sensores-fecha").textContent =
        "Sin telemetría aún.";
      return;
    }

    const data = await resp.json();
    const sensores = data.sensores || {};

    document.getElementById("sensores-fecha").textContent =
      "Última telemetría: " + formatearFecha(data.fecha);

    document.getElementById("sensor-distancia").textContent =
      sensores.distancia_cm ?? "—";
    document.getElementById("sensor-nivel").textContent =
      sensores.nivel_basura ?? "—";
    document.getElementById("sensor-peso").textContent =
      sensores.peso_kg ?? "—";
    document.getElementById("sensor-temp").textContent =
      sensores.temperatura_c ?? "—";

    const tapaText =
      sensores.tapa_abierta === true
        ? "Abierta"
        : sensores.tapa_abierta === false
        ? "Cerrada"
        : "—";
    document.getElementById("sensor-tapa").textContent = tapaText;
  } catch (err) {
    console.error("Error cargando telemetría:", err);
    document.getElementById("sensores-fecha").textContent =
      "Error al obtener telemetría.";
  }
}

// Cargar eventos recientes
async function cargarEventos() {
  try {
    const resp = await fetch(`${API_BASE}/eventos`);
    const data = await resp.json();
    const tbody = document.getElementById("tabla-eventos");

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="py-3 text-center text-gray-400">Sin eventos aún</td></tr>';
      return;
    }

    tbody.innerHTML = "";
    data
      .slice()
      .reverse()
      .forEach((ev) => {
        const tr = document.createElement("tr");
        tr.className = "border-b last:border-0";

        tr.innerHTML = `
          <td class="py-2 pr-2">${formatearFecha(ev.fecha)}</td>
          <td class="py-2 pr-2">${ev.tipo || "—"}</td>
          <td class="py-2 pr-2">${ev.accion || "—"}</td>
          <td class="py-2 pr-2">${ev.detalle || "—"}</td>
          <td class="py-2 pr-2">${ev.nivel_confianza ?? "—"}</td>
        `;

        tbody.appendChild(tr);
      });
  } catch (err) {
    console.error("Error cargando eventos:", err);
  }
}

// Enviar comando al robot
async function enviarComando(comando) {
  try {
    const resp = await fetch(`${API_BASE}/comandos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comando }),
    });

    const data = await resp.json();
    document.getElementById("comando-respuesta").textContent =
      "Respuesta: " + (data.message || "Comando enviado.");

    // Actualizar estado después de enviar comando
    cargarEstado();
  } catch (err) {
    console.error("Error enviando comando:", err);
    document.getElementById("comando-respuesta").textContent =
      "Error al enviar comando.";
  }
}
