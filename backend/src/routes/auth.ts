import express, { Router, Request, Response, NextFunction } from "express";
import logger from "../middleware/logger";
import axios from "axios";
import stringifyParams from "../utils/querystring";
import validateToken from "../middleware/validateToken";

const v1authRouter: Router = express.Router();

// v1/oauth/authorize
v1authRouter.get("/authorize", async (req: Request, res: Response) => {
  logger.info(`Accessing ${req.originalUrl} endpoint`);
  /*  #swagger.responses[302] = {
        description: "Redirect user to Keycloak authorization page" 
      }
  */

  logger.info(`User ${req.body.username} requesting token from keycloak`);
  // authenticate with Keycloak server with authorization code flow
  logger.info(`Redirecting user to ${process.env.KEYCLOAK_SERVICE}/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/auth?${stringifyParams}`);
  res.redirect(`${process.env.KEYCLOAK_SERVICE}/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/auth?${stringifyParams}`);
});

// v1/oauth/token
v1authRouter.post("/token", async (req: Request<{}, {}, { code: string }>, res: Response) => {
  logger.info(`Accessing ${req.originalUrl} endpoint`);

  /*  #swagger.responses[200] = {
        description: "Token exchanged successfully" 
      }

       #swagger.responses[400] = {
        description: "Invalid code sent in request" 
      }
  */

  if (req.body.code) {
    try {
      logger.info(`Exchanging authorization code with server: ${process.env.KEYCLOAK_SERVICE}/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`);
      const response = await axios.post(
        `${process.env.KEYCLOAK_SERVICE}/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
        {
          client_id: process.env.KEYCLOAK_CLIENT,
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
          grant_type: "authorization_code",
          redirect_uri: process.env.KEYCLOAK_REDIRECT_URI,
          code: req.body.code,
        },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      if (response.status === 200) {
        res.cookie("ACCESS_TOKEN", response.data.access_token, { httpOnly: true });
        res.cookie("REFRESH_TOKEN", response.data.refresh_token, { httpOnly: true });
        res.send({ access_token: response.data.access_token, refresh_token: response.data.refresh_token });
      }
    } catch (error: any) {
      console.log(error);
      if (error.response.data.error_description === "Code not valid" || error.response.status === 400) {
        logger.error(`${error.response.data.error_description}`);
        res.redirect(`${process.env.KEYCLOAK_SERVICE}/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/auth?${stringifyParams}`);
      } else {
        logger.error(error);
      }
    }
  } else {
    logger.error("No authorization code sent");
    res.redirect(`${process.env.KEYCLOAK_SERVICE}/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/auth?${stringifyParams}`);
  }
});

// v1/oauth/authorize
v1authRouter.post("/authorize", validateToken, async (req: Request<{}, {}, { resource: string; scopes: string[] }>, res: Response, next: NextFunction) => {
  /*  #swagger.responses[200] = {
        description: "user has access to resource" 
      }

      #swagger.responses[403] = {
        description: "user has no access to resource" 
      }
  */
  const resource = req.body.resource;
  const scopes = req.body.scopes;

  try {
    const response = await axios.post(
      `${process.env.KEYCLOAK_SERVICE}/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      {
        grant_type: "urn:ietf:params:oauth:grant-type:uma-ticket",
        audience: process.env.KEYCLOAK_CLIENT,
        permission: `${resource}#${scopes.join(",")}`,
        response_mode: "decision",
      },
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Bearer ${req.cookies["ACCESS_TOKEN"]}` },
      }
    );
    if (response.data.result) {
      logger.info(`User has access to resource: ${resource} with scopes: ${scopes}`);
      res.sendStatus(200);
    } else {
      res.status(403).send("Unauthorized");
    }
  } catch (error: any) {
    logger.error(error);
    if (error.response.data.error === "invalid_resource") res.send("Invalid resource sent in request");
    if (error.response.data.error === "invalid_scope") res.send("Invalid scope sent in request");
    if (error.response.data.error === "access_denied") res.status(403).send(error.response.data.error);
    else res.sendStatus(500);
  }
});

export default v1authRouter;
