import { establecerEstadoManual } from "./estado.controller.js";

let comandos = [];

/*
Ejemplo:
{
  "comando": "PAUSAR"   // o REANUDAR, ABRIR_BOCA_MANUAL, CERRAR_BOCA, etc.
}
*/

export const enviarComando = (req, res) => {
  const { comando } = req.body;

  if (!comando) {
    return res.status(400).json({ message: "El campo 'comando' es obligatorio" });
  }

  const nuevoComando = {
    id: comandos.length + 1,
    comando,
    fecha: new Date().toISOString(),
  };

  comandos.push(nuevoComando);

  // Algunos comandos cambian el estado manual del robot
  if (["PAUSAR", "REANUDAR", "ERROR", "LLENO"].includes(comando)) {
    establecerEstadoManual(comando);
  }

  console.log("📤 Comando enviado:", nuevoComando);

  return res.status(201).json({
    message: "Comando registrado",
    data: nuevoComando
  });
};
