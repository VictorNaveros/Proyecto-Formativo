const API_BASE = "http://localhost:5000/api";

// -----------------------------
// Protección de acceso (solo admin logueado)
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const userStr = localStorage.getItem("user");

  if (!userStr) {
    window.location.href = "/pages/login.html";
    return;
  }

  try {
    const user = JSON.parse(userStr);
    console.log("👤 Usuario logueado:", user.username || user.email || user.id);
  } catch (e) {
    console.error("Error leyendo el usuario de localStorage:", e);
    localStorage.removeItem("user");
    window.location.href = "/pages/login.html";
    return;
  }

  // Si todo bien, cargamos datos
  cargarEstado();
  cargarTelemetria();
  cargarEventos();

  // Actualizar estado y sensores cada 3 segundos
  setInterval(() => {
    cargarEstado();
    cargarTelemetria();
  }, 3000);
});

// Cerrar sesión
document.getElementById("logout")?.addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "/pages/login.html";
});

// -----------------------------
// Utilidades
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

// -----------------------------
// Estado del robot
// -----------------------------

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

// -----------------------------
// Telemetría (IR + ultrasónico)
// -----------------------------

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

    // 1) Botellas detectadas (IR)
    document.getElementById("sensor-botellas").textContent =
      sensores.botellas_total ?? "—";

    // 2) Distancia del ultrasónico (solo para referencia/depuración)
    if (sensores.distancia_cm != null) {
      document.getElementById("sensor-distancia").textContent =
        sensores.distancia_cm + " cm";
    } else {
      document.getElementById("sensor-distancia").textContent = "—";
    }

    // 3) Nivel de llenado (%) - o usamos sensores.nivel_basura, o lo calculamos
    let nivel = sensores.nivel_basura;

    if (
      (nivel == null || isNaN(nivel)) &&
      typeof sensores.distancia_cm === "number"
    ) {
      const d = sensores.distancia_cm;

      // Estos valores son EJEMPLO. Deben ajustarse con pruebas reales.
      const dMax = 40; // distancia cuando el contenedor está VACÍO
      const dMin = 5;  // distancia cuando está LLENO

      let porcentaje = ((dMax - d) / (dMax - dMin)) * 100;
      porcentaje = Math.max(0, Math.min(100, Math.round(porcentaje)));

      nivel = porcentaje;
    }

    document.getElementById("sensor-nivel").textContent =
      nivel != null && !isNaN(nivel) ? `${nivel}%` : "—";
  } catch (err) {
    console.error("Error cargando telemetría:", err);
    document.getElementById("sensores-fecha").textContent =
      "Error al obtener telemetría.";
  }
}

// -----------------------------
// Eventos (incluye la cámara como “sensor inteligente”)
// -----------------------------

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

// -----------------------------
// Comandos al robot
// -----------------------------

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
