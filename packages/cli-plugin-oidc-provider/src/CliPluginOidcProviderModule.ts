import {inject, Module, OnAdd, ProjectPackageJson} from "@tsed/cli-core";

import {OidcProviderInitHook} from "./hooks/OidcProviderInitHook.js";

@Module({
  imports: [OidcProviderInitHook]
})
export class CliPluginOidcProviderModule {
  protected packageJson = inject(ProjectPackageJson);

  @OnAdd("@tsed/cli-plugin-oidc-provider")
  install() {
    this.packageJson.addDependencies({
      "oidc-provider": "latest",
      "@tsed/oidc-provider": "latest",
      "@tsed/jwks": "latest",
      "@tsed/adapters": "latest",
      bcrypt: "latest"
    });
    this.packageJson.addDevDependencies({
      "@types/oidc-provider": "latest"
    });
  }
}
