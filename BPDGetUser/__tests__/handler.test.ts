import { FiscalCode } from "italia-ts-commons/lib/strings";
import {
  BPDToken,
  MyPortalToken,
  SessionToken,
  WalletToken
} from "../../types/token";
import { User } from "../../types/user";
import { BPDGetUserHandler } from "../handler";

const aFiscalCode: FiscalCode = "RSSMRI01A02B123C" as FiscalCode;
const aBPDToken: BPDToken = "bpd-token" as BPDToken;
const aSessionToken: SessionToken = "session-token" as SessionToken;

const aValidUser: User = {
  name: "Mario",
  family_name: "Rossi",
  fiscal_code: aFiscalCode,
  spid_level: "SpidL2",
  created_at: Date.now(),
  bpd_token: aBPDToken,
  session_token: aSessionToken,
  myportal_token: "token" as MyPortalToken,
  wallet_token: "wallet" as WalletToken
};

describe("BPDGetUserHandler", () => {
  it("should succeded with a valid user", async () => {
    const handler = BPDGetUserHandler();
    const response = await handler({} as any, aValidUser);
    expect(response.kind).toEqual("IResponseSuccessJson");
  });

  it("should fail with an invalid user", async () => {
    const anInvalidFiscalCode = "invalid-cf" as FiscalCode;
    const handler = BPDGetUserHandler();
    const response = await handler({} as any, {
      ...aValidUser,
      fiscal_code: anInvalidFiscalCode
    });
    expect(response.kind).toEqual("IResponseErrorValidation");
  });
});
