import { Router } from "express";
import { obtenerEstado } from "../controllers/estado.controller.js";

const router = Router();

router.get("/", obtenerEstado);

export default router;
