import * as express from "express";

import { Context } from "@azure/functions";
import { ContextMiddleware } from "io-functions-commons/dist/src/utils/middlewares/context_middleware";
import {
  withRequestMiddlewares,
  wrapRequestHandler
} from "io-functions-commons/dist/src/utils/request_middleware";
import {
  IResponseErrorNotFound,
  IResponseSuccessJson,
  ResponseSuccessJson
} from "italia-ts-commons/lib/responses";

type IHttpHandler = (
  context: Context
) => Promise<
  | IResponseSuccessJson<{
      headers: any;
    }>
  | IResponseErrorNotFound
>;

export function HttpHandler(): IHttpHandler {
  return async (ctx) => {
    return ResponseSuccessJson({
      headers: ctx.req?.headers
    });
  };
}

export function HttpCtrl(): express.RequestHandler {
  const handler = HttpHandler();

  const middlewaresWrap = withRequestMiddlewares(
    ContextMiddleware()
  );

  return wrapRequestHandler(middlewaresWrap(handler));
}
