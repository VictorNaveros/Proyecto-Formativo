import { Router } from "express";
import {
  registrarTelemetria,
  obtenerTelemetriaActual,
  listarTelemetria
} from "../controllers/telemetria.controller.js";

const router = Router();

router.post("/", registrarTelemetria);        // Guardar telemetría
router.get("/ultima", obtenerTelemetriaActual); // Obtener la última telemetría
router.get("/", listarTelemetria);            // Listar toda la telemetría

export default router;
