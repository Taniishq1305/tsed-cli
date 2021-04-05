import {CliExeca, CliFs, Command, CommandProvider, ProjectPackageJson, Tasks} from "@tsed/cli-core";
import {Inject} from "@tsed/di";
import {join} from "path";

export interface RunCmdContext {
  production: boolean;
  command: string;
  rawArgs: string[];
}

@Command({
  name: "run",
  description: "Run a project level command",
  args: {
    command: {
      description: "The project command",
      type: String,
      required: true
    }
  },
  options: {
    "-p, --production": {
      type: Boolean,
      defaultValue: false,
      description: "Set production profile to NODE_ENV"
    }
  },
  allowUnknownOption: true
})
export class RunCmd implements CommandProvider {
  @Inject()
  execa: CliExeca;

  @Inject()
  fs: CliFs;

  @Inject()
  projectPackageJson: ProjectPackageJson;

  async $exec(ctx: RunCmdContext): Promise<Tasks> {
    const cmd = ctx.production ? "node" : "ts-node";
    const args = ctx.production ? [] : ["-r", "tsconfig-paths/register"];
    const path = ctx.production ? join(await this.getCompilePath(), "bin/index.js") : "./src/bin/index.ts";
    const env: any = {};

    if (ctx.production) {
      env.NODE_ENV = "production";
    }

    this.execa.runSync(cmd, [...args, path, ctx.command, ...ctx.rawArgs], {
      env,
      stdio: ["inherit"]
    });

    return [];
  }

  protected async getCompilePath() {
    const {dir} = this.projectPackageJson;
    const tsConfigPath = join(dir, "tsconfig.compile.json");

    if (this.fs.exists(tsConfigPath)) {
      const content = JSON.parse(await this.fs.readFile(tsConfigPath, "utf8"));
      return content.compilerOptions.outDir;
    }

    return "./dist";
  }
}
