import {Store} from "@tsed/core";
import type {TokenProvider} from "@tsed/di";

import {CommandStoreKeys} from "../domains/CommandStoreKeys.js";
import type {CommandMetadata} from "../interfaces/CommandMetadata.js";
import type {CommandParameters} from "../interfaces/CommandParameters.js";

export function getCommandMetadata(token: TokenProvider): CommandMetadata {
  const {
    name,
    alias,
    args = {},
    allowUnknownOption,
    description,
    options = {},
    enableFeatures,
    disableReadUpPkg,
    bindLogger = true,
    ...opts
  } = Store.from(token)?.get(CommandStoreKeys.COMMAND) as CommandParameters;

  return {
    name,
    alias,
    args,
    description,
    options,
    allowUnknownOption: !!allowUnknownOption,
    enableFeatures: enableFeatures || [],
    disableReadUpPkg: !!disableReadUpPkg,
    bindLogger,
    ...opts
  };
}
