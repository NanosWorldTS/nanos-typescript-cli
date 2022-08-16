import {Command} from "@oclif/core";

export interface TypesGeneratorData {
  output: string;
  skip: boolean;
  bleeding: boolean;
}

export class TypesGenerator {

  constructor(
    private readonly command: Command,
    private readonly data: TypesGeneratorData
  ) {}

  async generate() {

  }
}
