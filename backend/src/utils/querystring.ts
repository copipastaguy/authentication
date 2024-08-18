const queryString = require("query-string");
import dotenv from "dotenv";
dotenv.config();

const stringifyParams = queryString.stringify({
  client_id: process.env.KEYCLOAK_CLIENT,
  response_type: "code",
  redirect_uri: process.env.KEYCLOAK_REDIRECT_URI,
  scope: "openid",
});

export default stringifyParams;
