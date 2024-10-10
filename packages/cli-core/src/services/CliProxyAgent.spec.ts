import "../index.js";

// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";
import tunnel from "tunnel";

import {CliConfiguration} from "./CliConfiguration.js";
import {CliExeca} from "./CliExeca.js";
import {CliProxyAgent} from "./CliProxyAgent.js";

vi.mock("tunnel");

describe("CliPlugins", () => {
  beforeEach(() =>
    CliPlatformTest.create({
      name: "tsed"
    })
  );
  afterEach(CliPlatformTest.reset);

  describe("resolveProxySettings()", () => {
    describe("from env", () => {
      it("should get proxy url from env (HTTP_PROXY)", async () => {
        const settings = CliPlatformTest.get(CliConfiguration);

        settings.set("proxy", {
          url: "http://login:password@host:3000"
        });

        const cliProxyAgent = await CliPlatformTest.invoke<CliProxyAgent>(CliProxyAgent, []);

        await cliProxyAgent.resolveProxySettings();

        expect(cliProxyAgent.proxySettings.value).toEqual({url: "http://login:password@host:3000"});
      });

      it("should get proxy url from env (HTTP_PROXY -2)", async () => {
        const settings = CliPlatformTest.get(CliConfiguration);

        settings.set("proxy", {
          strictSsl: false,
          url: "https://login:password@host:3000"
        });

        const cliProxyAgent = await CliPlatformTest.invoke<CliProxyAgent>(CliProxyAgent, []);

        await cliProxyAgent.resolveProxySettings();

        expect(cliProxyAgent.proxySettings.value).toEqual({strictSsl: false, url: "https://login:password@host:3000"});
      });
    });
    describe("from npm config", () => {
      it("should get proxy url from (proxy)", async () => {
        const cliExeca = {
          getAsync: vi.fn().mockImplementation((p: string, args: string[]) => {
            if (args.includes("proxy")) {
              return Promise.resolve("https://login:password@host:3000");
            }

            if (args.includes("strict-ssl")) {
              return Promise.resolve("false");
            }

            return Promise.resolve("null");
          })
        };

        const cliProxyAgent = await CliPlatformTest.invoke<CliProxyAgent>(CliProxyAgent, [
          {
            token: CliExeca,
            use: cliExeca
          }
        ]);

        // @ts-ignore
        cliProxyAgent.proxySettings.value.url = undefined;

        await cliProxyAgent.resolveProxySettings();

        expect(cliProxyAgent.proxySettings.value).toEqual({
          url: "https://login:password@host:3000",
          strictSsl: false
        });
      });
      it("should get proxy url from (http-proxy)", async () => {
        const cliExeca = {
          getAsync: vi.fn().mockImplementation((p: string, args: string[]) => {
            if (args.includes("http-proxy")) {
              return Promise.resolve("https://login:password@host:3000");
            }

            if (args.includes("strict-ssl")) {
              return Promise.resolve("true");
            }

            return Promise.resolve("null");
          })
        };

        const cliProxyAgent = await CliPlatformTest.invoke<CliProxyAgent>(CliProxyAgent, [
          {
            token: CliExeca,
            use: cliExeca
          }
        ]);

        // @ts-ignore
        cliProxyAgent.proxySettings.value.url = undefined;

        await cliProxyAgent.resolveProxySettings();

        expect(cliProxyAgent.proxySettings.value).toEqual({
          url: "https://login:password@host:3000",
          strictSsl: true
        });
      });
      it("should get proxy url from (https-proxy)", async () => {
        const cliExeca = {
          getAsync: vi.fn().mockImplementation((p: string, args: string[]) => {
            if (args.includes("https-proxy")) {
              return Promise.resolve("https://login:password@host:3000");
            }

            if (args.includes("strict-ssl")) {
              return Promise.resolve("true");
            }

            return Promise.resolve("null");
          })
        };

        const cliProxyAgent = await CliPlatformTest.invoke<CliProxyAgent>(CliProxyAgent, [
          {
            token: CliExeca,
            use: cliExeca
          }
        ]);

        // @ts-ignore
        cliProxyAgent.proxySettings.value.url = undefined;

        await cliProxyAgent.resolveProxySettings();

        expect(cliProxyAgent.proxySettings.value).toEqual({
          url: "https://login:password@host:3000",
          strictSsl: true
        });
      });
      it("should get proxy url from (https-proxy) without credentials", async () => {
        const cliExeca = {
          getAsync: vi.fn().mockImplementation((p: string, args: string[]) => {
            if (args.includes("https-proxy")) {
              return Promise.resolve("https://host:3000");
            }

            if (args.includes("strict-ssl")) {
              return Promise.resolve("true");
            }

            return Promise.resolve("null");
          })
        };

        const cliProxyAgent = await CliPlatformTest.invoke<CliProxyAgent>(CliProxyAgent, [
          {
            token: CliExeca,
            use: cliExeca
          }
        ]);

        // @ts-ignore
        cliProxyAgent.proxySettings.value.url = undefined;

        await cliProxyAgent.resolveProxySettings();

        expect(cliProxyAgent.proxySettings.value).toEqual({
          url: "https://host:3000",
          strictSsl: true
        });
      });
    });
  });

  describe("get()", () => {
    it("should fetch data through a proxy (http to http)", async () => {
      const settings = CliPlatformTest.get(CliConfiguration);

      settings.set("proxy", {
        url: "http://login:password@host:3000",
        strictSsl: false
      });

      const cliProxyAgent = await CliPlatformTest.invoke<CliProxyAgent>(CliProxyAgent, []);

      await cliProxyAgent.get("http");

      expect(tunnel.httpOverHttp).toHaveBeenCalledWith({
        proxy: {
          host: "host",
          port: 3000,
          proxyAuth: "login:password",
          rejectUnauthorized: false
        }
      });
    });
    it("should fetch data through a proxy (http to https)", async () => {
      const settings = CliPlatformTest.get(CliConfiguration);

      settings.set("proxy", {
        url: "https://login:password@host:3000",
        strictSsl: false
      });

      const cliProxyAgent = await CliPlatformTest.invoke<CliProxyAgent>(CliProxyAgent, []);

      await cliProxyAgent.get("http");

      expect(tunnel.httpOverHttps).toHaveBeenCalledWith({
        proxy: {
          host: "host",
          port: 3000,
          proxyAuth: "login:password",
          rejectUnauthorized: false
        }
      });
    });
    it("should fetch data through a proxy (https to https)", async () => {
      const settings = CliPlatformTest.get(CliConfiguration);

      settings.set("proxy", {
        url: "https://login:password@host:3000",
        strictSsl: false
      });

      const cliProxyAgent = await CliPlatformTest.invoke<CliProxyAgent>(CliProxyAgent, []);

      await cliProxyAgent.get("https");

      expect(tunnel.httpsOverHttps).toHaveBeenCalledWith({
        proxy: {
          host: "host",
          port: 3000,
          proxyAuth: "login:password",
          rejectUnauthorized: false
        }
      });
    });
    it("should fetch data through a proxy (https to http)", async () => {
      const settings = CliPlatformTest.get(CliConfiguration);

      settings.set("proxy", {
        url: "http://login:password@host:3000",
        strictSsl: true
      });

      const cliProxyAgent = await CliPlatformTest.invoke<CliProxyAgent>(CliProxyAgent, []);

      await cliProxyAgent.get("https");

      expect(tunnel.httpsOverHttp).toHaveBeenCalledWith({
        proxy: {
          host: "host",
          port: 3000,
          proxyAuth: "login:password",
          rejectUnauthorized: true
        }
      });
    });
  });
});
