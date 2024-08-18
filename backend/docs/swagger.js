const options = {
  openapi: "OpenAPI 3",
  language: "en-US",
  disableLogs: false,
  autoHeaders: false,
  autoQuery: false,
  autoBody: false,
};
const generateSwagger = require("swagger-autogen")();

const swaggerDocument = {
  info: {
    version: "1.0.0",
    title: "Authentication APIs",
    description: "API for managing authentication calls",
  },
  host: "localhost:4000",
  basePath: "/",
  schemes: ["http"],
  consumes: ["application/json"],
  produces: ["application/json"],
  securityDefinitions: {
    oauth2: {
      type: "oauth2",
      flow: "authorization",
      authorizationUrl: "http://localhost:4000/oauth/authorize",
      scopes: {
        openid: "openid scope for client",
      },
    },
  },
  definitions: {
    User: {
      $username: "admin",
      $password: "admin",
    },
    authenticationResponse: {
      code: 200,
      message: "Success",
    },
    RedirectResponse: {
      code: 302,
      message: "Redirected",
    },
    "errorResponse.400": {
      code: 400,
      message: "The request was malformed or invalid. Please check the request parameters.",
    },
    "errorResponse.401": {
      code: 401,
      message: "Authentication failed or user lacks proper authorization.",
    },
    "errorResponse.403": {
      code: 403,
      message: "You do not have permission to access this resource.",
    },
    "errorResponse.404": {
      code: 404,
      message: "The requested resource could not be found on the server.",
    },
    "errorResponse.500": {
      code: 500,
      message: "An unexpected error occurred on the server. Please try again later.",
    },
  },
};
const outputFile = "./docs/swagger.json";
const apiRouteFile = ["./src/app.ts"];
generateSwagger(outputFile, apiRouteFile, swaggerDocument);
