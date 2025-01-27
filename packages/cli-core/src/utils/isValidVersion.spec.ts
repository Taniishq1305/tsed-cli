import {isValidVersion} from "./isValidVersion.js";

describe("isValidVersion", () => {
  it("should validate version", () => {
    expect(isValidVersion(">=3.0.1")).toEqual(true);
    expect(isValidVersion("3.0.1")).toEqual(true);
    expect(isValidVersion(">3.0.1")).toEqual(true);
    expect(isValidVersion("<3.0.1")).toEqual(true);
    expect(isValidVersion("~3.0.1")).toEqual(true);
    expect(isValidVersion("latest")).toEqual(false);
  });
});
