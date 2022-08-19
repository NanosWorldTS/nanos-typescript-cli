import {Commentable} from "./base";
import {getMostValuableInheritance} from "../../json-types";

export default class ClassProvider extends Commentable {

  public constructor(name: string, inheritance: string[]) {
    super();

    let extendClass = getMostValuableInheritance(inheritance);
    if (extendClass) {
      extendClass = " extends " + extendClass;
    } else {
      extendClass = "";
    }

    this.builder.append(`declare class ${name}${extendClass} {`).newLine();
  }

  public toString(): string {
    this.builder.append("}").newLine();
    return super.toString();
  }
}
