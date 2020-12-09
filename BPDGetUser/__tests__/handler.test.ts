import { CIDR } from "italia-ts-commons/lib/strings";
import { BPDGetUser } from "../handler";
import { Response, Request } from "express";

const authorizedIp = "1.1.1.1";

const mockStatus = jest.fn().mockImplementation(() => ({
  send: jest.fn()
}));
const mockRes = ({
  status: mockStatus,
  send: jest.fn()
} as unknown) as Response;

const mockReq = ({
  headers: {
    "x-forwarded-for": authorizedIp
  }
} as unknown) as Request;

describe("BPDGetUser", () => {
  it("should return a string when the query parameter is provided", async () => {
    const expectedRange = "1.2.3.4" as CIDR;
    const httpHandler = BPDGetUser([expectedRange]);
    httpHandler(mockReq, mockRes, () => {});
    expect(mockRes.status).toBeCalledWith(401);
  });
});
