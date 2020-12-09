/**
 * An Express middleware that checks if source IP falls into a CIDR range.
 */

import * as express from "express";
import { isLeft } from "fp-ts/lib/Either";
import { CIDR, IPString } from "italia-ts-commons/lib/strings";
import * as rangeCheck from "range_check";
import * as requestIp from "request-ip";

export const withCheckIp = (range: readonly CIDR[]) => (
  handler: express.RequestHandler
): express.RequestHandler => {
  return (request, response, _) => {
    const clientIp = requestIp.getClientIp(request);
    const errorOrIPString = IPString.decode(clientIp);

    if (isLeft(errorOrIPString)) {
      response.status(400).send("Bad request");
    } else {
      const IP = errorOrIPString.value;
      // tslint:disable-next-line: readonly-array
      if (!rangeCheck.inRange(IP, range as CIDR[])) {
        response.status(401).send("Unauthorized");
      } else {
        handler(request, response, _);
      }
    }
  };
};
