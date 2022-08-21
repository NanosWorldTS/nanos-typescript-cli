import {Command} from "@oclif/core";
import * as fs from "fs";
import * as p from "path";
import {Observable} from "rxjs";
import {TypesGenerator} from "../types";

const Listr = require("listr");
const {exec} = require("child_process");

export type ProjectType = "script"|"game-mode"|"loading-screen";
export type ScriptFolder = "server"|"client"|"shared";

export interface ProjectData {
  name: string;
  author: string;
  version: string;
  type: ProjectType;
  scriptFolders: ScriptFolder[];
}

export class ProjectGenerator {

  constructor(
    private readonly command: Command,
    private readonly data: ProjectData
  ) {}

  async generate() {
    const path = p.resolve("./" + this.data.name);

    const tasks = new Listr([
      {
        title: "Creating project structure",
        task: () => {
          return new Observable<string>(subscriber => {
            try {
              (async () => {
                subscriber.next("@types");
                await fs.promises.mkdir(p.join(path, "@types"), { recursive: true });
                await fs.promises.mkdir(p.join(path, "transpilers"), { recursive: true });

                const createPath = async (dir: string) => {
                  await fs.promises.mkdir(p.join(path, "src", dir), { recursive: true });
                  const filePath = p.join(path, "src", dir, "Index.ts");
                  const fd = await fs.promises.open(filePath, "w");
                  await fd.close();
                };

                if (this.data.scriptFolders.includes("server")) {
                  subscriber.next("Server folder");
                  await createPath("Server");
                }

                if (this.data.scriptFolders.includes("shared")) {
                  subscriber.next("Shared folder");
                  await createPath("Shared");
                }

                if (this.data.scriptFolders.includes("client")) {
                  subscriber.next("Client folder");
                  await createPath("Client");
                }

                subscriber.complete();
              })();
            } catch (e) {
              subscriber.error(e);
            }
          });
        }
      },
      {
        title: "Creating tsconfig.json",
        task: async () => {
          await this.createTsConfig(path);
        }
      },
      {
        title: "Creating Package.toml",
        task: async () => {
          await this.createPackageToml(path);
        }
      },
      {
        title: "Creating package.json",
        task: async () => {
          await this.createPackageJson(path);
        }
      },
      {
        title: "Creating .gitignore",
        task: async () => {
          await this.createGitIgnore(path);
        }
      },
      {
        title: "Creating transpilers",
        task: async () => {
          await this.createImportsTranspiler(path);
        }
      }
    ]);

    try {
      await tasks.run();
      this.command.log("Project Structure created! Preparing workspace...");

      const generator = new TypesGenerator(this.command, {output: p.join(path, "@types"), skip: false, bleeding: true});
      await generator.generate();

      this.command.log("Workspace prepared! Installing dependencies...");
      await exec("npm install", {cwd: path});

      this.command.log("Project ready! Run 'npm run build' to compile your project.");
    } catch (e) {
      this.command.error(<Error>e);
    }
  }

  private async createGitIgnore(path: string) {
    const gitignore = [
      ".idea/",
      ".vs/",
      "dist/",
      "node_modules/",
      "@types/",
    ];
    await fs.promises.writeFile(p.join(path, ".gitignore"), gitignore.join("\n"));
  }

  private async createPackageJson(path: string) {
    const packageJson = {
      private: true,
      scripts: {
        build: "tstl && shx cp Package.toml dist/Package.toml",
        "update-types": "nanosts generate -o=./@types",
      },
      devDependencies: {
        "shx": "^0.3.4",
        "typescript": "^4.6.4",
        "typescript-to-lua": "^1.4.4",
        "ts-node": "^10.9.1"
      }
    };
    await fs.promises.writeFile(p.join(path, "package.json"), JSON.stringify(packageJson, null, 2));
  }

  private async createPackageToml(path: string) {
    const lines = [
      "[package]",
      "    name = \"" + this.data.name + "\"",
      "    author = \"" + this.data.author + "\"",
      "    version = \"" + this.data.version + "\"",
      "    image = \"\"",
      "    type = \"" + this.data.type + "\"",
      "    force_no_map_script = false",
      "    auto_cleanup = true",
      "    packages_requirements = []",
      "    assets_requirements = []"
    ];
    await fs.promises.writeFile(p.join(path, "Package.toml"), lines.join("\n"));
  }

  private async createTsConfig(path: string) {
    const tsconfig = {
      compilerOptions: {
        target: "esnext",
        lib: ["esnext"],
        moduleResolution: "node",
        outDir: "./dist",
        baseUrl: "./",
        paths: {
          "*": ["@types/*"]
        },
        types: [
          "typescript-to-lua/language-extensions"
        ],
        typeRoots: [
          "./node_modules/@types", "./@types"
        ],
        strict: true
      },
      tstl: {
        luaTarget: "universal",
        luaLibImport: "inline",
        luaPlugins: [
          {name: "./transpilers/imports.ts"}
        ]
      },
      include: [
        "src/**/*"
      ],
      exclude: [
        "dist/**/*",
        "node_modules/**/*",
      ]
    };
    await fs.promises.writeFile(p.join(path, "tsconfig.json"), JSON.stringify(tsconfig, null, 2));
  }

  private async createImportsTranspiler(path: string) {
    const code =
`
import * as ts from "typescript";
import * as tstl from "typescript-to-lua";
//@ts-ignore
console.log("Imports transpiller starting");

let importMapsCount = 0;

const plugin: tstl.Plugin = {
    visitors: {
        [ts.SyntaxKind.ImportDeclaration]: (node) => {
            // Find the name of the package
            const identifier = (node.moduleSpecifier as any).text; // Any => They hack the types so I hack the types too
            if (identifier.toLowerCase().includes("nanosts")) {
                return [];
            }

            ++importMapsCount;
            const importMapName = "____importmap_"+importMapsCount;
            // TODO: Handle default imports ( import test from "./test")
            // TODO: Handle external Lua package with type definitions

            const targetModulePath = identifier + ".lua";

            // List all the imports done
            const namedBindings = (node.importClause?.namedBindings as any).elements
            const importedVariables = namedBindings?.map((chNode) => chNode.getText());

            // Create LUA AST Nodes
            const packageRequireAssignToImportMap = tstl.createVariableDeclarationStatement(tstl.createIdentifier(importMapName), tstl.createIdentifier(\`Package.Require("\${targetModulePath}")\`))
            const finalNamedImportsVariables = importedVariables.map((varName) => {
                return tstl.createVariableDeclarationStatement(tstl.createIdentifier(varName), tstl.createIdentifier(importMapName + "." + varName))
            })
            return [packageRequireAssignToImportMap, ...finalNamedImportsVariables];
        },
    }
}
//@ts-ignore
console.log("Imports transpiller done");

export default plugin;`;

    await fs.promises.writeFile(p.join(path, "transpilers", "imports.ts"), code);
  }
}
