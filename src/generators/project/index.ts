import {Command} from "@oclif/core";
import * as fs from "fs";
import * as p from "path";
import {Observable} from "rxjs";
import {TypesGenerator} from "../types";

const Listr = require("listr");
const {exec} = require("child_process");

export type ProjectType = "script"|"game-mode"|"loading-screen"|"library";
export type ScriptFolder = "server"|"client"|"shared";

export interface ProjectData {
  name: string;
  author: string;
  version: string;
  type: ProjectType;
  scriptFolders: ScriptFolder[];
  lazy: boolean;
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

                if (this.data.lazy) {
                  subscriber.next("Lazy scripts");
                  const createLazyScript = async (name: string) => {
                    await fs.promises.mkdir(p.join(path, name), { recursive: true });
                    const filePath = p.join(path, name, "Index.lua");
                    await fs.promises.writeFile(filePath, `Package.Require(\"../dist/${name}/Index.lua\")`);
                  };

                  if (this.data.scriptFolders.includes("server")) {
                    await createLazyScript("Server");
                  }

                  if (this.data.scriptFolders.includes("shared")) {
                    await createLazyScript("Shared");
                  }

                  if (this.data.scriptFolders.includes("client")) {
                    await createLazyScript("Client");
                  }
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
    const packageJson: any = {
      private: true,
      scripts: {
        build: `tstl${(this.data.lazy ? '' : ' && shx cp Package.toml dist/Package.toml')}`,
        "update-types": "nanosts generate -o=./@types",
      },
      devDependencies: {
        "typescript": "^4.6.4",
        "typescript-to-lua": "^1.4.4",
        "ts-node": "^10.9.1",
        "nanosts-imports-transpiler": "^0.0.2"
      }
    };

    if (!this.data.lazy) {
      packageJson.devDependencies["shx"] = "^0.3.4";
    }

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
          "@typescript-to-lua/language-extensions"
        ],
        typeRoots: [
          "./node_modules/@types", "./@types"
        ],
        strict: true
      },
      tstl: {
        luaTarget: "universal",
        luaLibImport: "inline",
        noImplicitSelf: true,
        luaPlugins: [
          {name: "nanosts-imports-transpiler"}
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
}
