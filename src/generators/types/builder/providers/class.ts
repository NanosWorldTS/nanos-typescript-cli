import {Commentable} from "./base";
import {getMostValuableInheritance} from "../../json-types";
import FunctionProvider from "./function";
import JsDocProvider from "./jsdoc";
import {StringBuilder} from "../base";

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

  public prop(name: string, type: string, cb?: (provider: JsDocProvider) => void) {
    const builder = new StringBuilder();
    builder.append(`  public ${name}: ${type};`).newLine();
    if (cb) {
      const provider = new JsDocProvider(true);
      cb(provider);
      builder.prepend(provider.toString());
    }
    this.builder.append(builder.toString());
    return this;
  }

  public function(name: string, isStatic: boolean, cb: (provider: FunctionProvider) => void): ClassProvider {
    const provider = new FunctionProvider(name, isStatic);
    cb(provider);
    this.builder.append(provider.toString());
    return this;
  }

  public toString(): string {
    this.builder.append("}").newLine();
    return super.toString();
  }
}
