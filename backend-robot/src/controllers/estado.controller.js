// Estado manual si el usuario lo fuerza desde el dashboard
let estadoManual = null;

// Forzar estado manual desde comandos
export const establecerEstadoManual = (nuevoEstado) => {
  estadoManual = nuevoEstado;
};

export const obtenerEstado = (req, res) => {
  // Si el usuario lo puso manualmente:
  if (estadoManual) {
    return res.json({
      origen: "MANUAL",
      estado: estadoManual,
      mensaje: "Estado forzado desde el panel"
    });
  }

  const telemetria = global.__telemetriaActual;

  if (!telemetria) {
    return res.json({
      origen: "SISTEMA",
      estado: "DESCONOCIDO",
      mensaje: "Aún no se ha recibido telemetría"
    });
  }

  const fechaUltima = new Date(telemetria.fecha);
  const ahora = new Date();
  const diffSegundos = Math.floor((ahora - fechaUltima) / 1000);

  let estado = telemetria.estado_robot || "ONLINE";
  let mensaje = `Última actualización hace ${diffSegundos} segundos`;

  if (diffSegundos > 60) {
    estado = "OFFLINE";
    mensaje = "No hay telemetría hace más de 60 segundos";
  }

  return res.json({
    origen: "SENSORES",
    estado,
    mensaje,
    ultimaTelemetria: telemetria
  });
};
