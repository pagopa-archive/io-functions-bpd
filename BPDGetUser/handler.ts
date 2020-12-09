import * as express from "express";

import { Context } from "@azure/functions";
import { ContextMiddleware } from "io-functions-commons/dist/src/utils/middlewares/context_middleware";
import {
  withRequestMiddlewares,
  wrapRequestHandler
} from "io-functions-commons/dist/src/utils/request_middleware";
import { readableReport } from "italia-ts-commons/lib/reporters";
import {
  IResponse,
  IResponseErrorValidation,
  IResponseSuccessJson,
  ResponseErrorValidation,
  ResponseSuccessJson
} from "italia-ts-commons/lib/responses";
import { FederatedUser as BPDUser } from "../generated/definitions/FederatedUser";
import { User } from "../types/user";
import { RequiredExpressUserMiddleware } from "../utils/middleware/required_express_user";

type IHttpHandler = (
  context: Context,
  user: User
) => Promise<IResponseSuccessJson<BPDUser> | IResponseErrorValidation>;

export function BPDGetUserHandler(): IHttpHandler {
  return async (_, user) => {
    return BPDUser.decode({
      family_name: user.family_name,
      fiscal_code: user.fiscal_code,
      name: user.name
    }).fold<IResponseSuccessJson<BPDUser> | IResponseErrorValidation>(
      err => ResponseErrorValidation("Invalid user", readableReport(err)),
      bpdUser => ResponseSuccessJson(bpdUser)
    );
  };
}

export declare type RequestHandler<R> = (
  request: express.Request
) => Promise<IResponse<R>>;

export function BPDGetUser(): express.RequestHandler {
  const handler = BPDGetUserHandler();

  const middlewaresWrap = withRequestMiddlewares(
    ContextMiddleware(),
    RequiredExpressUserMiddleware(User)
  );

  return wrapRequestHandler(middlewaresWrap(handler));
}
