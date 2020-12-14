import {
  Either,
  isLeft,
  left,
  parseJSON,
  right,
  toError
} from "fp-ts/lib/Either";
import { none, Option, some } from "fp-ts/lib/Option";
import { errorsToReadableMessages } from "italia-ts-commons/lib/reporters";
import * as redis from "redis";
import {
  BPDToken,
  MyPortalToken,
  SessionToken,
  WalletToken
} from "../types/token";
import { User } from "../types/user";

const sessionKeyPrefix = "SESSION-";
const bpdTokenPrefix = "BPD-";
export const sessionNotFoundError = new Error("Session not found");

export default class SessionStorage {
  constructor(private readonly redisClient: redis.RedisClient) {}
  public async getByBPDToken(
    token: BPDToken
  ): Promise<Either<Error, Option<User>>> {
    const errorOrSession = await this.loadSessionByToken(bpdTokenPrefix, token);

    if (isLeft(errorOrSession)) {
      if (errorOrSession.value === sessionNotFoundError) {
        return right(none);
      }
      return left(errorOrSession.value);
    }

    const user = errorOrSession.value;

    return right(some(user));
  }

  private parseUser(value: string): Either<Error, User> {
    return parseJSON<Error>(value, toError).chain(data => {
      return User.decode(data).mapLeft(err => {
        return new Error(errorsToReadableMessages(err).join("/"));
      });
    });
  }

  /**
   * Return a Session for this token.
   */
  private async loadSessionBySessionToken(
    token: SessionToken
  ): Promise<Either<Error, User>> {
    return new Promise(resolve => {
      this.redisClient.get(`${sessionKeyPrefix}${token}`, (err, value) => {
        if (err) {
          // Client returns an error.
          return resolve(left<Error, User>(err));
        }

        if (value === null) {
          return resolve(left<Error, User>(sessionNotFoundError));
        }
        const errorOrDeserializedUser = this.parseUser(value);
        return resolve(errorOrDeserializedUser);
      });
    });
  }

  private loadSessionByToken(
    prefix: string,
    token: WalletToken | MyPortalToken | BPDToken
  ): Promise<Either<Error, User>> {
    return new Promise(resolve => {
      this.redisClient.get(`${prefix}${token}`, (err, value) => {
        if (err) {
          // Client returns an error.
          return resolve(left<Error, User>(err));
        }

        if (value === null) {
          return resolve(left<Error, User>(sessionNotFoundError));
        }

        this.loadSessionBySessionToken(value as SessionToken).then(
          (errorOrSession: Either<Error, User>) => {
            errorOrSession.fold(
              error => resolve(left<Error, User>(error)),
              session => {
                resolve(right<Error, User>(session));
              }
            );
          },
          error => {
            resolve(left<Error, User>(error));
          }
        );
      });
    });
  }
}
