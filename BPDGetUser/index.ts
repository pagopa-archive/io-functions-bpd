import * as express from "express";
import * as winston from "winston";

import { Context } from "@azure/functions";
import { secureExpressApp } from "io-functions-commons/dist/src/utils/express";
import { AzureContextTransport } from "io-functions-commons/dist/src/utils/logging";
import { setAppContext } from "io-functions-commons/dist/src/utils/middlewares/context_middleware";
import createAzureFunctionHandler from "io-functions-express/dist/src/createAzureFunctionsHandler";

import * as passport from "passport";
import { getConfigOrThrow } from "../utils/config";
import {
  createClusterRedisClient,
  createSimpleRedisClient
} from "../utils/redis";
import SessionStorage from "../utils/sessionStorage";
import bearerBPDTokenStrategy from "../utils/strategy";
import { BPDGetUser } from "./handler";

//
//  CosmosDB initialization
//

const config = getConfigOrThrow();

// tslint:disable-next-line: no-let
let logger: Context["log"] | undefined;
const contextTransport = new AzureContextTransport(() => logger, {
  level: "debug"
});
winston.add(contextTransport);

const REDIS_CLIENT = !config.isProduction
  ? createSimpleRedisClient(config.REDIS_URL)
  : createClusterRedisClient(
      config.REDIS_URL,
      config.REDIS_PASSWORD,
      config.REDIS_PORT
    );
const sessionStorage = new SessionStorage(REDIS_CLIENT);

// Setup Express
const app = express();
secureExpressApp(app);

passport.use("bearer.bpd", bearerBPDTokenStrategy(sessionStorage));
const bpdBearerAuth = passport.authenticate("bearer.bpd", {
  session: false
});

// Add express route
app.get("/v1/user", bpdBearerAuth, BPDGetUser(config.allowBPDIPSourceRange));

const azureFunctionHandler = createAzureFunctionHandler(app);

// Binds the express app to an Azure Function handler
function httpStart(context: Context): void {
  logger = context.log;
  setAppContext(app, context);
  azureFunctionHandler(context);
}

export default httpStart;
