import * as cdn from "@volar/cdn";
import { createLanguageHost, createLanguageService, createServiceEnvironment } from "@volar/monaco/worker";
import type * as monaco from "monaco-editor-core";
// @ts-expect-error
import * as worker from "monaco-editor-core/esm/vs/editor/editor.worker";
import * as ts from "typescript";
import createTsService from "volar-service-typescript";
import type { CreateData } from "./types";

self.onmessage = () => {
  worker.initialize((ctx: monaco.worker.IWorkerContext<FileSystem>, data: CreateData) => {

    const env = createServiceEnvironment();
    cdn.decorateServiceEnvironment(env, cdn.createGitHubUriResolver(/* /workspace */ data.rootPath, data.owner, data.repo, data.branch), cdn.createGitHubFs(data.owner, data.repo, data.branch));
    cdn.decorateServiceEnvironment(env, cdn.createJsDelivrUriResolver('/node_modules'), cdn.createJsDelivrFs());

    return createLanguageService(
      { typescript: ts as any },
      env,
      { services: { typescript: createTsService() } },
      createLanguageHost(ctx.getMirrorModels, env, data.rootPath, data.compilerOptions),
    );
  });
};
