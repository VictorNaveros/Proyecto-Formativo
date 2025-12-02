let eventos = [];

/*
Ejemplo de evento:
{
  "tipo": "DETECCION",
  "detalle": "Botella detectada",
  "accion": "ABRIR_BOCA",
  "nivel_confianza": 0.92
}
*/

export const registrarEvento = (req, res) => {
  const { tipo, detalle, accion, nivel_confianza } = req.body;

  const nuevoEvento = {
    id: eventos.length + 1,
    tipo: tipo || "EVENTO",
    detalle: detalle || "",
    accion: accion || "",
    nivel_confianza: nivel_confianza ?? null,
    fecha: new Date().toISOString(),
  };

  eventos.push(nuevoEvento);

  // Limitar historial
  if (eventos.length > 200) {
    eventos = eventos.slice(-150);
  }

  console.log("📥 Evento:", nuevoEvento);

  return res.status(201).json({ message: "Evento registrado", evento: nuevoEvento });
};

export const listarEventos = (req, res) => {
  return res.json(eventos.slice(-50));
};
