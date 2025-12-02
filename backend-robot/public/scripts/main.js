const API_BASE = "http://localhost:5000/api";

function formatearFecha(isoStr) {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleString();
}

// =========================
//  ESTADO DEL ROBOT
// =========================
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

async function cargarEstado() {
  try {
    const resp = await fetch(`${API_BASE}/estado`);
    const data = await resp.json();

    document.getElementById("estado-origen").textContent =
      "Origen: " + (data.origen || "—");
    document.getElementById("estado-mensaje").textContent =
      data.mensaje || "—";

    pintarEstado(data.estado);
  } catch (err) {
    document.getElementById("estado-mensaje").textContent =
      "Error con el servidor.";
    pintarEstado("ERROR");
  }
}

// =========================
//  TELEMETRÍA
// =========================
async function cargarTelemetria() {
  try {
    const resp = await fetch(`${API_BASE}/telemetria/ultima`);
    if (!resp.ok) {
      document.getElementById("sensores-fecha").textContent =
        "Sin telemetría aún";
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

    document.getElementById("sensor-tapa").textContent =
      sensores.tapa_abierta === true
        ? "Abierta"
        : sensores.tapa_abierta === false
        ? "Cerrada"
        : "—";
  } catch (err) {
    document.getElementById("sensores-fecha").textContent =
      "Error cargando telemetría.";
  }
}

// =========================
//  EVENTOS
// =========================
async function cargarEventos() {
  try {
    const resp = await fetch(`${API_BASE}/eventos`);
    const data = await resp.json();

    const tbody = document.getElementById("tabla-eventos");

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="py-3 text-center text-gray-400">Sin eventos</td></tr>';
      return;
    }

    tbody.innerHTML = "";

    data.reverse().forEach((ev) => {
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
    console.error("Error eventos:", err);
  }
}

// =========================
//  MANDAR COMANDOS
// =========================
async function enviarComando(comando) {
  try {
    const resp = await fetch(`${API_BASE}/comandos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comando }),
    });

    const data = await resp.json();
    document.getElementById("comando-respuesta").textContent =
      "Respuesta: " + (data.message || "Comando enviado.");

    cargarEstado();
  } catch (err) {
    document.getElementById("comando-respuesta").textContent =
      "Error al enviar comando.";
  }
}

// =========================
//  REFRESCO AUTOMÁTICO
// =========================
cargarEstado();
cargarTelemetria();
cargarEventos();

setInterval(() => {
  cargarEstado();
  cargarTelemetria();
}, 3000);
