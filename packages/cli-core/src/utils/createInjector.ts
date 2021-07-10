import {DIConfigurationOptions, DILogger, GlobalProviders, InjectorService} from "@tsed/di";
import {$log} from "@tsed/logger";
import {CliConfiguration} from "../services/CliConfiguration";
import {ProjectPackageJson} from "../services/ProjectPackageJson";

function createConfiguration(injector: InjectorService): CliConfiguration & TsED.Configuration {
  const provider = GlobalProviders.get(CliConfiguration)!.clone();

  provider.instance = injector.invoke<CliConfiguration>(provider.useClass);
  injector.addProvider(CliConfiguration, provider);

  return provider.instance as any;
}

function createProjectPackageJson(injector: InjectorService): DILogger {
  const provider = GlobalProviders.get(ProjectPackageJson)!.clone();
  injector.addProvider(ProjectPackageJson, provider);

  provider.instance = injector.invoke<ProjectPackageJson>(provider);

  return provider.instance as any;
}

export function createInjector(settings: Partial<DIConfigurationOptions> = {}) {
  const injector = new InjectorService();
  injector.settings = createConfiguration(injector);
  injector.logger = $log;

  $log.appenders
    .set("stdout", {
      type: "stdout",
      layout: {
        type: "pattern",
        pattern: "[%d{hh:mm:ss}] %j%n"
      },
      level: ["info", "debug"]
    })
    .set("stderr", {
      type: "stderr",
      layout: {
        type: "pattern",
        pattern: "[%d{hh:mm:ss}][%p] %j%n"
      },
      level: ["trace", "fatal", "error", "warn"]
    });

  createProjectPackageJson(injector);

  injector.settings.set(settings);

  /* istanbul ignore next */
  if (injector.settings.env === "test") {
    injector.logger.stop();
  }

  return injector;
}
