import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express, Response, Request } from "express";
import v1authRouter from "./routes/auth";
dotenv.config({ path: ".env.local" });

import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../docs/swagger.json";
import logger from "./middleware/logger";

const app: Express = express();

app.use(bodyParser.json());
app.use(cors({ origin: ["http://localhost:3000"], credentials: true, optionsSuccessStatus: 200 }));
app.use(cookieParser());

// API DOCS
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/v1/oauth", v1authRouter);

app.listen(process.env.PORT, () => {
  logger.info(`Server is running at http://localhost:${process.env.PORT}`);
});
