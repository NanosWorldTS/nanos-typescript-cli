import {Commentable} from "./base";
import JsDocProvider from "./jsdoc";

export default class EnumProvider extends Commentable {

  public constructor(name: string) {
    super();
    this.builder.append(`declare const enum ${name} {`).newLine();
  }

  public value(name: string, value: string, docCb?: (jsdoc: JsDocProvider) => void): EnumProvider {
    if (docCb) {
      const jsdoc = new JsDocProvider(true);
      docCb(jsdoc);
      this.builder.append(`${jsdoc.toString()}`);
    }
    this.builder.append(`  ${name} = ${value},`).newLine();
    return this;
  }

  public toString(): string {
    this.builder.append("}").newLine();
    return super.toString();
  }
}
