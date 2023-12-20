import {CliPlatformTest} from "@tsed/cli-testing";
import {CliExeca} from "../../services";
import {BunManager} from "./BunManager";

async function getManagerFixture() {
  const cliExeca = {
    runSync: jest.fn(),
    run: jest.fn()
  };
  const manager = await CliPlatformTest.invoke<BunManager>(BunManager, [
    {
      token: CliExeca,
      use: cliExeca
    }
  ]);
  return {cliExeca, manager};
}

describe("BunManager", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  describe("add()", () => {
    it("should add dependencies", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.add(["deps"], {});

      expect(cliExeca.run).toHaveBeenCalledWith("bun", ["add", "deps"], {});
    });
  });
  describe("addDev()", () => {
    it("should add dependencies", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.addDev(["deps"], {});

      expect(cliExeca.run).toHaveBeenCalledWith("bun", ["add", "-d", "deps"], {});
    });
  });
  describe("install()", () => {
    it("should run the install cmd", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.install({});

      expect(cliExeca.run).toHaveBeenCalledWith("bun", ["install"], {});
    });
  });
  describe("runScript()", () => {
    it("should run script", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.runScript("name", {});

      expect(cliExeca.run).toHaveBeenCalledWith("bun", ["run", "name"], {});
    });
  });
});
