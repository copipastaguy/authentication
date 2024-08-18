import axios from "axios";
import { NextFunction, Request, Response } from "express";
import logger from "./logger";

const validateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await axios.post(
      `${process.env.KEYCLOAK_SERVICE}/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token/introspect`,
      {
        token: req.cookies["ACCESS_TOKEN"],
        client_id: process.env.KEYCLOAK_CLIENT,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    if (response.data.active) {
      logger.info(`user: ${response.data.username} token verified to be active`);
      next();
      //   res.send("Active token");
    } else {
      //   res.send("Inactive token");
      logger.info("Inactive token, requires refresh");
      next();
    }
  } catch (error: any) {
    if (error.response.status === 401) {
      logger.error("Unauthorized user, token expired");
    }
    logger.error(error.response.data);
    res.send("Unauthorized user");
  }
};

export default validateToken;
