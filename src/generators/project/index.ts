import {Command} from "@oclif/core";

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

  }
}
