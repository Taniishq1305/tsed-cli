import {RuntimesModule} from "@tsed/cli";
import {Module, OnAdd, ProjectPackageJson} from "@tsed/cli-core";
import {Inject} from "@tsed/di";

import {JestGenerateHook} from "./hooks/JestGenerateHook.js";
import {JestInitHook} from "./hooks/JestInitHook.js";

@Module({
  imports: [JestInitHook, JestGenerateHook]
})
export class CliPluginJestModule {
  @Inject()
  runtimes: RuntimesModule;

  @Inject()
  packageJson: ProjectPackageJson;

  @OnAdd("@tsed/cli-plugin-jest")
  install() {
    this.addScripts();
    this.addDevDependencies();
  }

  addScripts() {
    const runtime = this.runtimes.get();

    this.packageJson.addScripts({
      test: `${runtime.run("test:lint")} && ${runtime.run("test:coverage")} `,
      "test:unit": "cross-env NODE_ENV=test jest",
      "test:coverage": `${runtime.run("test:unit")} `
    });
  }

  addDevDependencies() {
    this.packageJson.addDevDependencies({
      "@types/jest": "latest",
      jest: "latest",
      "ts-jest": "latest"
    });
  }
}
