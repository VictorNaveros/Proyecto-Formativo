// Última telemetría recibida
let telemetriaActual = null;

// Historial
let historialTelemetria = [];

/*
Ejemplo de telemetría enviada por la tarjeta:
{
  "sensores": {
    "distancia_cm": 12.5,
    "nivel_basura": 78,
    "peso_kg": 3.2,
    "tapa_abierta": true,
    "temperatura_c": 28.3
  },
  "estado_robot": "ONLINE"
}
*/

export const registrarTelemetria = (req, res) => {
  const { sensores, estado_robot } = req.body;

  if (!sensores) {
    return res.status(400).json({ message: "El campo 'sensores' es obligatorio" });
  }

  const registro = {
    id: historialTelemetria.length + 1,
    sensores,
    estado_robot: estado_robot || "ONLINE",
    fecha: new Date().toISOString(),
  };

  telemetriaActual = registro;
  historialTelemetria.push(registro);

  // Limitar historial (últimos 100)
  if (historialTelemetria.length > 100) {
    historialTelemetria = historialTelemetria.slice(-100);
  }

  global.__telemetriaActual = registro;

  console.log("📡 Telemetría:", registro);

  return res.status(201).json({ message: "Telemetría registrada", data: registro });
};

export const obtenerTelemetriaActual = (req, res) => {
  if (!telemetriaActual) {
    return res.status(404).json({ message: "Aún no hay telemetría" });
  }

  return res.json(telemetriaActual);
};

export const listarTelemetria = (req, res) => {
  return res.json(historialTelemetria);
};
