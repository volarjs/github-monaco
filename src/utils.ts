import type { FileSystem } from "@volar/language-service";
import { createSys as _createSys } from "@volar/typescript";
import { UriResolver, decorateServiceEnvironment } from "@volar/cdn";
import { createServiceEnvironment } from "@volar/monaco/worker";
import * as ts from "typescript";

export function createSys(uriResolver: UriResolver, fs: FileSystem) {
  const env = createServiceEnvironment();
  decorateServiceEnvironment(env, uriResolver, fs);
  return _createSys(ts as any, env);
}

export async function findTsConfig(dirName: string, sys: ReturnType<typeof createSys>) {

  let sysVersion: number | undefined;
  let tsconfig: string | undefined;

  while (await sys.sync() !== sysVersion) {
    sysVersion = sys.version;
    tsconfig = ts.findConfigFile(dirName, sys.fileExists);
  }

  return tsconfig;
}

export async function parseTsConfig(tsconfig: string, sys: ReturnType<typeof createSys>) {

  let sysVersion: number | undefined;
  let configFile: ts.TsConfigSourceFile;
  let parsed: ts.ParsedCommandLine;

  while (await sys.sync() !== sysVersion) {
    sysVersion = sys.version;
    try {
      configFile = ts.readJsonConfigFile(tsconfig, sys.readFile);
      parsed = ts.parseJsonSourceFileConfigFileContent(configFile, sys, tsconfig.substring(0, tsconfig.lastIndexOf('/')), {}, tsconfig);
    } catch { }
  }

  return parsed!;
}
