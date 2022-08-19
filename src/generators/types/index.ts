import {Command} from "@oclif/core";
import {Class, Enum} from "./json-types";
import * as fs from "fs";
import {DeclarationBuilder} from "./builder";
import  {ListrContext} from "listr";
import {Observable, Subscriber} from "rxjs";

const fetch = require("node-fetch");
const Listr = require("listr");

export interface TypesGeneratorData {
  output: string;
  skip: boolean;
  bleeding: boolean;
}

/*
  Some notes:
  - table which has no table_props needs to be transformed to any
  - table[] which has no table_props needs to be transformed to any[]


 */

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
      });
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

  private async saveToFile() {
    for (const file in this.result) {
      const path = `${this.data.output}/${file}.d.ts`;
      if (this.data.skip) {
        if (fs.existsSync(path)) {
          continue;
        }
      }

      const content = this.result[file].build();
      await fs.promises.writeFile(path, content);
    }
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
