import * as monaco from "monaco-editor-core";
import { loadGrammars, loadTheme } from "monaco-volar";
import { createSys, findTsConfig, parseTsConfig } from "./utils";
import { loadOnigasm, setupMonacoEnv } from "./env";
import { computed } from "@vue/reactivity";
import { useBrowserLocation } from "@vueuse/core";
import * as cdn from "@volar/cdn";

const baseUrl = '/github-monaco';
const owner = location.pathname.substring(baseUrl.length).split('/')[1];
const repo = location.pathname.substring(baseUrl.length).split('/')[2];
const branch = location.pathname.substring(baseUrl.length).split('/')[3];
const rootPath = '/workspace';
const _location = useBrowserLocation();
const fileName = computed(() => rootPath + '/' + _location.value.pathname!.substring(baseUrl.length).split('/').slice(4).join('/'));

(async () => {

  const uriResolver = cdn.createGitHubUriResolver(rootPath, owner, repo, branch);
  const fs = cdn.createGitHubFs(owner, repo, branch);
  const sys = createSys(uriResolver, fs);
  const tsconfig = await findTsConfig(fileName.value.substring(0, fileName.value.lastIndexOf('/')), sys);
  const parsed = tsconfig ? await parseTsConfig(tsconfig, sys) : undefined;

  setupMonacoEnv({
    owner,
    repo,
    branch,
    rootPath,
    compilerOptions: parsed?.options ?? {},
  });

  const [, theme] = await Promise.all([loadOnigasm(), loadTheme(monaco.editor)]);
  const uri = uriResolver.fileNameToUri(fileName.value)!;
  const text = await fs.readFile(uri);
  const model = monaco.editor.createModel(
    text!,
    'typescript',
    monaco.Uri.parse(uri)
  );
  const element = document.getElementById("app")!;
  const editorInstance = monaco.editor.create(element, {
    theme: theme.light,
    model,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    minimap: {
      enabled: false,
    },
    inlineSuggest: {
      enabled: false,
    },
    "semanticHighlighting.enabled": true,
  });

  // Trigger automatic acquisition of @types/node, this model passes to worker via getSyncUris
  // For more advanced use cases, you can read package.json to generate this content
  monaco.editor.createModel(
    `/// <reference types="@types/node" />`,
    'typescript',
    monaco.Uri.file('/env.d.ts')
  );

  // Support for semantic highlighting
  const t = (editorInstance as any)._themeService._theme;
  t.getTokenStyleMetadata = (
    type: string,
    modifiers: string[],
    _language: string
  ) => {
    const _readonly = modifiers.includes("readonly");
    switch (type) {
      case "function":
      case "method":
        return { foreground: 12 };
      case "class":
        return { foreground: 11 };
      case "variable":
      case "property":
        return { foreground: _readonly ? 21 : 9 };
      default:
        return { foreground: 0 };
    }
  };

  loadGrammars(monaco, editorInstance);
})();
