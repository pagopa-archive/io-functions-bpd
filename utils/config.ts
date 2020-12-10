/**
 * Config module
 *
 * Single point of access for the application confguration. Handles validation on required environment variables.
 * The configuration is evaluate eagerly at the first access to the module. The module exposes convenient methods to access such value.
 */

import * as t from "io-ts";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { CIDR, NonEmptyString } from "italia-ts-commons/lib/strings";

export const RedisParams = t.intersection([
  t.interface({
    REDIS_URL: NonEmptyString
  }),
  t.partial({
    REDIS_PASSWORD: NonEmptyString,
    REDIS_PORT: NonEmptyString
  })
]);
export type RedisParams = t.TypeOf<typeof RedisParams>;

// global app configuration
export type IConfig = t.TypeOf<typeof IConfig>;
export const IConfig = t.intersection([
  t.interface({
    AzureWebJobsStorage: NonEmptyString,
    QueueStorageConnection: NonEmptyString,
    isProduction: t.boolean
  }),
  RedisParams
]);

// No need to re-evaluate this object for each call
const errorOrConfig: t.Validation<IConfig> = IConfig.decode({
  ...process.env,
  isProduction: process.env.NODE_ENV === "production"
});

/**
 * Read the application configuration and check for invalid values.
 * Configuration is eagerly evalued when the application starts.
 *
 * @returns either the configuration values or a list of validation errors
 */
export function getConfig(): t.Validation<IConfig> {
  return errorOrConfig;
}

/**
 * Read the application configuration and check for invalid values.
 * If the application is not valid, raises an exception.
 *
 * @returns the configuration values
 * @throws validation errors found while parsing the application configuration
 */
export function getConfigOrThrow(): IConfig {
  return errorOrConfig.getOrElseL(errors => {
    throw new Error(`Invalid configuration: ${readableReport(errors)}`);
  });
}
