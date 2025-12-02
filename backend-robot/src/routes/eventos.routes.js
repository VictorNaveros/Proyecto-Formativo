import { Router } from "express";
import { registrarEvento, listarEventos } from "../controllers/eventos.controller.js";

const router = Router();

router.post("/", registrarEvento);
router.get("/", listarEventos);

export default router;
