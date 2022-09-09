import {Command, Flags} from "@oclif/core";
import {ProjectData, ProjectGenerator, ProjectType, ScriptFolder} from "../generators/project";
const inquirer = require("inquirer");

export class ProjectCommand extends Command {

  static description = "Creates a new Nanos TypeScript project";
  static args = [
    {name: "name", description: "Name of the project", required: true}
  ];
  static flags = {
    author: Flags.string({description: "Author of the project", char: "a"}),
    version: Flags.string({description: "Version of the project", char: "v", default: "1.0.0"}),
    type: Flags.string({description: "Type of the project", char: "t"}),
    scriptFolders: Flags.string({description: "Script folders of the project", char: "s"}),
    lazy: Flags.boolean({description: "Enable lazy compiling which auto-generates bridge scripts for the dist folder", char: "l", default: true}),
  };

  async run() {
    const data = await this.getRequiredData();
    if (!data) {
      return;
    }

    const generator = new ProjectGenerator(this, data);
    await generator.generate();
  }

  private async getRequiredData(): Promise<ProjectData|null> {
    const {args, flags} = await this.parse(ProjectCommand);
    const name = <string>args.name;

    if (flags.author) {
      if (!flags.type || !flags.version) {
        this.error("You must specify the type and version of the project when using CLI args instead of prompting wizard!");
        return null;
      }

      const author = <string>flags.author.toString();
      if (!author || author.trim().length <= 0) {
        this.error("You must specify the author of the project!");
        return null;
      }

      const version = <string>flags.version.toString();
      if (!version || version.trim().length <= 0) {
        this.error("You must specify the version of the project!");
        return null;
      }

      const type = <ProjectType>flags.type.toString();
      if (type !== "script" && type !== "game-mode" && type !== "loading-screen") {
        this.error("Invalid type of project!");
        return null;
      }

      const scriptFolders = <ScriptFolder[]>(<string>flags.scriptFolders?.toString()||"").split(",");
      const lazy = <boolean>flags.lazy;
      return {name, author, version, type, scriptFolders, lazy};

    } else {

      const {author} = (await inquirer.prompt([{
        name: 'author',
        message: 'enter name of author',
        type: 'input'
      }]));
      if (!author || author.trim().length <= 0) {
        this.error("You must specify the author of the project!");
        return null;
      }

      const {version} = await inquirer.prompt([{
        name: 'version',
        message: 'enter version',
        type: 'input',
        default: '1.0.0'
      }]);
      if (!version || version.trim().length <= 0) {
        this.error("You must specify the version of the project!");
        return null;
      }

      const {type} = await inquirer.prompt([{
        name: 'type',
        message: 'select a type',
        type: 'list',
        choices: [{name: "script"}, {name: "game-mode"}, {name: "loading-screen"}]
      }]);

      const scriptFolders = <ScriptFolder[]>(await inquirer.prompt([{
        name: 'script folders',
        message: 'select script folders, which will be created',
        type: 'checkbox',
        choices: [{name: "server"}, {name: "client"}, {name: "shared"}]
      }]))["script folders"];

      const {lazy} = await inquirer.prompt([{
        name: 'lazy',
        message: 'enable lazy loading',
        type: 'confirm',
        default: true
      }]);

      return {name, author, version, type, scriptFolders, lazy};
    }
  }
}
