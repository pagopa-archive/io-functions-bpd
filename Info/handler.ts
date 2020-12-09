import * as express from "express";
import { wrapRequestHandler } from "io-functions-commons/dist/src/utils/request_middleware";
import {
  IResponseErrorInternal,
  IResponseSuccessJson,
  ResponseSuccessJson
} from "italia-ts-commons/lib/responses";
import * as packageJson from "../package.json";

interface IInfo {
  name: string;
  version: string;
}

type InfoHandler = () => Promise<
  IResponseSuccessJson<IInfo> | IResponseErrorInternal
>;

export function InfoHandler(): InfoHandler {
  return async () =>
    ResponseSuccessJson({
      name: packageJson.name,
      version: packageJson.version
    });
}

export function Info(): express.RequestHandler {
  const handler = InfoHandler();

  return wrapRequestHandler(handler);
}
