import editorWorker from "monaco-editor-core/esm/vs/editor/editor.worker?worker";
import volarWorker from "./volar.worker?worker";
import * as onigasm from "onigasm";
import onigasmWasm from "onigasm/lib/onigasm.wasm?url";

import type { LanguageService } from "@volar/language-service";
import { editor, languages } from "monaco-editor-core";
import * as volar from "@volar/monaco";
import { CreateData } from "./types";

export function loadOnigasm() {
  return onigasm.loadWASM(onigasmWasm);
}

export function setupMonacoEnv(createData: CreateData) {
  let initialized = false;

  (self as any).MonacoEnvironment ??= {};
  (self as any).MonacoEnvironment.getWorker = (_: any, label: string) => {
    if (label === "volar") {
      return new volarWorker();
    }
    return new editorWorker();
  };

  languages.register({ id: "typescript", extensions: [".ts"] });
  languages.register({ id: "javascript", extensions: [".js"] });
  languages.register({ id: "json", extensions: [".json"] });

  languages.onLanguage("javascript", setup);
  languages.onLanguage("typescript", setup);
  languages.onLanguage("javascriptreact", setup);
  languages.onLanguage("typescriptreact", setup);
  languages.onLanguage("json", setup);

  function setup() {
    if (initialized) {
      return;
    }
    initialized = true;

    const worker = editor.createWebWorker<LanguageService>({
      moduleId: "volarWorker",
      label: "volar",
      createData,
    });
    const languageId = [
      "javascript",
      "typescript",
      "javascriptreact",
      "typescriptreact",
      "json",
    ];
    const getSyncUris = () => editor.getModels().map((model) => model.uri);
    volar.editor.activateMarkers(
      worker,
      languageId,
      "volar",
      getSyncUris,
      editor
    );
    volar.editor.activateAutoInsertion(worker, languageId, getSyncUris, editor);
    volar.languages.registerProvides(
      worker,
      languageId,
      getSyncUris,
      languages
    );
  }
}
