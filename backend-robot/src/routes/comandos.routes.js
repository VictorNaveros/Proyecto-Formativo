import { Router } from "express";
import { enviarComando } from "../controllers/comandos.controller.js";

const router = Router();

router.post("/", enviarComando);

export default router;
