import {CliPlatformTest} from "@tsed/cli-testing";
import {PackageManagersModule} from "./PackageManagersModule";
import {YarnManager} from "./supports/YarnManager";
import {NpmManager} from "./supports/NpmManager";
import {CliFs} from "../services";
import {PNpmManager} from "./supports/PNpmManager";
import {YarnBerryManager} from "./supports/YarnBerryManager";
import {BunManager} from "./supports/BunManager";

async function getModuleFixture() {
  const yarnManager = {
    name: "yarn",
    has() {
      return true;
    },
    add: jest.fn().mockReturnValue({
      pipe: jest.fn()
    }),
    addDev: jest.fn().mockReturnValue({
      pipe: jest.fn()
    }),
    install: jest.fn().mockReturnValue({
      pipe: jest.fn()
    }),
    init: jest.fn(),
    runScript: jest.fn().mockReturnValue({
      pipe: jest.fn()
    })
  };

  const npmManager = {
    name: "npm",
    has() {
      return true;
    },
    add: jest.fn(),
    addDev: jest.fn(),
    install: jest.fn(),
    runScript: jest.fn()
  };

  const cliFs = {
    exists: jest.fn().mockReturnValue(true),
    writeFileSync: jest.fn(),
    readJsonSync: jest.fn().mockReturnValue({
      scripts: {},
      dependencies: {},
      devDependencies: {}
    })
  };

  const module = await CliPlatformTest.invoke<PackageManagersModule>(PackageManagersModule, [
    {
      token: CliFs,
      use: cliFs
    },
    {
      token: YarnManager,
      use: yarnManager
    },
    {
      token: NpmManager,
      use: npmManager
    },
    {
      token: PNpmManager,
      use: {
        has() {
          return false;
        }
      }
    },
    {
      token: BunManager,
      use: {
        has() {
          return false;
        }
      }
    },
    {
      token: YarnBerryManager,
      use: {
        has() {
          return false;
        }
      }
    }
  ]);

  return {
    module,
    cliFs,
    yarnManager,
    npmManager
  };
}

describe("PackageManagersModule", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  describe("list()", () => {
    it("should return the list of package managers", async () => {
      const {module} = await getModuleFixture();

      const result = module.list();

      expect(result).toEqual(["npm", "yarn"]);
    });
  });

  describe("get()", () => {
    it("should return the package manager (default)", async () => {
      const module = await CliPlatformTest.invoke<PackageManagersModule>(PackageManagersModule);

      const result = module.get();

      expect(result?.name).toEqual("yarn");
    });
    it("should return the package manager (npm)", async () => {
      const module = await CliPlatformTest.invoke<PackageManagersModule>(PackageManagersModule);

      const result = module.get("npm");

      expect(result?.name).toEqual("npm");
    });
    it("should return the package manager (yarn)", async () => {
      const module = await CliPlatformTest.invoke<PackageManagersModule>(PackageManagersModule);

      const result = module.get("yarn");

      expect(result?.name).toEqual("yarn");
    });
    it("should return the package manager (yarn-berry unknown)", async () => {
      const module = await CliPlatformTest.invoke<PackageManagersModule>(PackageManagersModule);

      const result = module.get("yarn-berry");

      expect(result?.name).toEqual("npm");
    });
  });

  describe("init()", () => {
    it("should init a project", async () => {
      const {module, yarnManager, cliFs} = await getModuleFixture();

      module.init({});

      expect(yarnManager.init).toHaveBeenCalledWith({
        cwd: "./tmp",
        env: {
          ...process.env,
          GH_TOKEN: undefined
        },
        packageManager: "yarn"
      });
      expect(cliFs.writeFileSync).toHaveBeenCalledWith("tmp/package.json", expect.any(String), {encoding: "utf8"});
    });
  });

  describe("install()", () => {
    it("should install dependencies", async () => {
      const {module, yarnManager} = await getModuleFixture();

      const result = await module.install({});

      for (const item of result) {
        await item.task();
      }

      expect(yarnManager.install).toHaveBeenCalledWith({
        cwd: "./tmp",
        env: {
          ...process.env
        },
        packageManager: "yarn"
      });
    });
  });

  describe("runScript()", () => {
    it("should run script", async () => {
      const {module, yarnManager} = await getModuleFixture();

      await module.runScript("name", {});

      expect(yarnManager.runScript).toHaveBeenCalledWith("name", {
        cwd: "./tmp"
      });
    });
  });
});
