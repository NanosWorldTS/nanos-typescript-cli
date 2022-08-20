import {Command} from "@oclif/core";
import {Class, Enum, TransformedValue, Value, Function} from "./json-types";
import {DeclarationBuilder} from "./builder";
import {ListrContext} from "listr";
import {Observable, Subscriber} from "rxjs";
import * as fs from "fs";
import {StringBuilder} from "./builder/base";

const fetch = require("node-fetch");
const Listr = require("listr");

export interface TypesGeneratorData {
  output: string;
  skip: boolean;
  bleeding: boolean;
}

export class TypesGenerator {

  private readonly result: {[file: string]: DeclarationBuilder};

  constructor(
    private readonly command: Command,
    private readonly data: TypesGeneratorData
  ) {
    this.result = {};
  }

  async generate() {
    const tasks = new Listr([
      {
        title: "Fetching latest JSON objects",
        task: async (ctx: ListrContext) => {
          ctx["files"] = await this.getLatestJsonObjects();
        }
      },
      {
        title: "Generating declarations",
        task: async (ctx: ListrContext) => {
          return new Observable<string>(subscriber => {
            try {
              for (const {file, data} of ctx["files"]) {
                if (file.startsWith("Enums")) {
                  this.generateEnums(data, subscriber);
                } else {
                  const title = file.split("/")[0];
                  this.generateClass(<Class>data, subscriber, title);
                }
              }

              subscriber.complete();
            } catch (e) {
              console.error(e);
              subscriber.error(e);
            }
          });
        }
      },
      {
        title: "Saving to files",
        task: async () => {
          await this.saveToFile();
        }
      }
    ]);

    try {
      await tasks.run();
    } catch (e) {
      this.command.error(<Error>e);
    }

  }

  private generateClass(c: Class, subscriber: Subscriber<string>, title: string) {
    subscriber.next(title);

    const builder = this.builder(title.replace(/(?:^|\.?)([A-Z])/g, function (x,y){return "_" + y.toLowerCase()}).replace(/^_/, ""));

    if (c.events) {
      builder.events(c.name, c.events);
    }

    builder.class(c.name, c.inheritance, classProvider => {
      classProvider.jsdoc(jsdoc => {
        if (c.description_long || c.description) {
          jsdoc.line(c.description_long || c.description);
        }

        if (c.authority) {
          jsdoc.authority(c.authority);
        }

        if (c.constructor) {
          jsdoc.customCtor(c.name);
        }
      });

      if (c.properties) {
        for (const property of c.properties) {
          const transformed = this.transformValue(property);
          classProvider.prop(transformed.name, transformed.type, jsdoc => {
            jsdoc.line(transformed.description);
          });
        }
      }

      if (c.constructor && c.constructor.map) {
        classProvider.function("constructor", false, ctorProvider => {
          const transformedParams: TransformedValue[] = c.constructor!.map(param => this.transformValue(param));

          ctorProvider.jsdoc(jsdoc => {
            for (const transformedParam of transformedParams) {
              jsdoc.param(transformedParam.name, transformedParam.type, transformedParam.description, transformedParam.isVararg ? undefined : transformedParam.default);
            }
          });

          for (const transformedParam of transformedParams) {
            if (transformedParam.isVararg) {
              ctorProvider.varargs(transformedParam.name, transformedParam.type);
            } else {
              ctorProvider.param(transformedParam.name, transformedParam.type, !!transformedParam.default);
            }
          }

          ctorProvider.disableReturn();
        });
      }

      const generateFunctions = (isStatic: boolean, functions: Function[]) => {
        for (const f of functions) {
          classProvider.function(f.name, isStatic, funcProvider => {
            const transformedParams: TransformedValue[] = !f.parameters ? [] : f.parameters.map(param => this.transformValue(param));
            const transformedReturn: TransformedValue[] = !f.return ? [] : f.return.map(ret => this.transformValue(ret, true));

            funcProvider.jsdoc(jsdoc => {
              if (f.description_long || f.description) {
                jsdoc.line(f.description_long || f.description);
              }

              if (f.authority) {
                jsdoc.authority(f.authority);
              }

              for (const transformedParam of transformedParams) {
                jsdoc.param(transformedParam.name, transformedParam.type, transformedParam.description, transformedParam.isVararg ? undefined : transformedParam.default);
              }

              if (isStatic) {
                jsdoc.noSelf();
              }
            });

            for (const transformedParam of transformedParams) {
              if (transformedParam.isVararg) {
                funcProvider.varargs(transformedParam.name, transformedParam.type);
              } else {
                funcProvider.param(transformedParam.name, transformedParam.type, !!transformedParam.default);
              }
            }

            if (transformedReturn.length === 1) {
              funcProvider.returns(transformedReturn[0].type);
            } else if (transformedReturn.length > 1) {
              funcProvider.returns(`LuaMultiReturn<[${transformedReturn.map(ret => ret.type).join(", ")}]>`);
            }
          });
        }
      }

      if (c.functions) {
        generateFunctions(false, c.functions);
      }

      if (c.static_functions) {
        generateFunctions(true, c.static_functions);
      }
    });
  }

  private generateEnums(enums: Enum, subscriber: Subscriber<string>) {
    subscriber.next("Enums");

    const builder = this.builder("enums");

    for (const enumName in enums) {
      const enumValues = enums[enumName];
      builder.enum(enumName, enumProvider => {
        for (const enumValue of enumValues) {
          enumProvider.value(enumValue.key, enumValue.value, !enumValue.description ? undefined : (jsdoc => {
            jsdoc.line(enumValue.description)
          }));
        }
      });
    }
  }

  private builder(name: string): DeclarationBuilder {
    if (!this.result[name]) {
      this.result[name] = new DeclarationBuilder();
    }
    return this.result[name];
  }

  private transformValue(value: Value, isRet: boolean = false): TransformedValue {
    const description = value.description_long || value.description;
    let defaultValue = !value.default ? undefined : (value.default === "nil" ? "null" : value.default);

    let type = value.type;
    if (isRet) {
      if (value.type.endsWith("?")) {
        defaultValue = "true";
        type = value.type.substring(0, value.type.length - 1) + "|undefined";
      }
    }

    if (type.includes("table")) {
      if (value.table_properties) {
        const table = value.table_properties.map(prop => `${prop.name}: ${prop.type}`).join(", ");
        type = type.replace("table", `({${table}})`);
      } else {
        type = type.replace("table", "any");
      }
    } else if (type.startsWith("function")) {
      type = type.replace("function", "Function");
    } else if (type.startsWith("iterator")) {
      type = type.replace("iterator", "LuaPairsIterable<number, Actor>");
    } else if (type.includes("Path")) {
      type = "string" + (type.endsWith("[]") ? "[]" : "");
    }

    const isVararg = value.name ? value.name.endsWith("...") : false;
    let name = value.name;
    if (isVararg) {
      name = name.substring(0, name.length - 3);
    }

    if (name === "function") {
      name = "func";
    }

    return {
      name,
      type,
      description,
      isVararg,
      default: defaultValue
    };
  }

  private async saveToFile() {
    const fileBuilder = new StringBuilder();
    fileBuilder.append(`// Generated by Nanos TypeScript CLI (c) ${new Date().getFullYear()} NanosWorldTS https://github.com/NanosWorldTS`).newLine().newLine();

    for (const file in this.result) {
      fileBuilder.append(`//region ${file}`).newLine().newLine();

      const content = this.result[file].build();
      fileBuilder.append(content).newLine().newLine();

      fileBuilder.append(`//endregion ${file}`).newLine();
    }

    fileBuilder.newLine().newLine().append(`// Generated by Nanos TypeScript CLI (c) ${new Date().getFullYear()} NanosWorldTS https://github.com/NanosWorldTS`);

    const path = `${this.data.output}/nanosts.d.ts`;
    if (this.data.skip) {
      if (fs.existsSync(path)) {
        return;
      }
    }

    await fs.promises.writeFile(path, fileBuilder.toString());
  }

  private async getLatestJsonObjects(): Promise<({file: string, data: any})[]> {
    const res = await fetch("https://api.github.com/repos/nanos-world/api/git/trees/6d04f16ac621c1fda2b08093bf327e253078a541?recursive=1");
    const tree = <any[]>(await res.json())["tree"];
    const checkPath = (path: string) => path.endsWith(".json") && (this.data.bleeding ? !path.startsWith("Stable/") : path.startsWith("Stable/"));
    const filenames = <string[]>tree.filter(file => file["type"] === "blob" && checkPath(file["path"])).map(file => file["path"]);
    const promises = filenames.map(filename => new Promise<{file: string, data: any}>((resolve, reject) => {
      (async () => {
        try {
          const res = await fetch(`https://raw.githubusercontent.com/nanos-world/api/main/${filename}`);
          const data = await res.json();
          resolve({file: filename.replace("Stable/", ""), data: data});
        } catch (e) {
          reject(e);
        }
      })();
    }));
    return await Promise.all(promises);
  }
}
