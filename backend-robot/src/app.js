import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import estadoRoutes from "./routes/estado.routes.js";
import eventosRoutes from "./routes/eventos.routes.js";
import comandosRoutes from "./routes/comandos.routes.js";
import telemetriaRoutes from "./routes/telemetria.routes.js";

const app = express();

// Necesario para usar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());

// 🧩 Servir frontend estático (public/index.html)
app.use(express.static(path.join(__dirname, "../public")));

// Rutas API
app.use("/api/estado", estadoRoutes);
app.use("/api/eventos", eventosRoutes);
app.use("/api/comandos", comandosRoutes);
app.use("/api/telemetria", telemetriaRoutes);

export default app;
