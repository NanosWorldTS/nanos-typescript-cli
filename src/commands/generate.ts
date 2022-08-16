import {Command, Flags} from "@oclif/core";
import * as fs from "fs";
import {TypesGenerator} from "../generators/types";

export class GenerateCommand extends Command {

  static description = "Generates Nanos TypeScript declarations from the Docs JSON API";
  static flags = {
    bleeding: Flags.boolean({description: "Use the bleeding edge version instead of the stable version", char: "b", default: false}),
    skip: Flags.boolean({description: "Whether to skip existing files or not", char: "s", default: false}),
    output: Flags.string({required: true, description: "Output directory for the generated files", char: "o"}),
  };

  async run() {
    const {flags} = await this.parse(GenerateCommand);
    const output = flags.output;
    const bleeding = flags.bleeding;
    const skip = flags.skip;

    await fs.promises.mkdir(output, {recursive: true});

    const generator = new TypesGenerator(this, {output, skip, bleeding});
    await generator.generate();
  }
}
