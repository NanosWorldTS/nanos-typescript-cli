import {DeclarationProvider, StringBuilder} from "../base";
import JsDocProvider from "./jsdoc";

export abstract class Commentable implements DeclarationProvider {

  protected readonly builder: StringBuilder;
  private readonly jsdocProvider: JsDocProvider;

  protected constructor() {
    this.builder = new StringBuilder();
    this.jsdocProvider = new JsDocProvider();
  }

  public jsdoc(cb: (jsdoc: JsDocProvider) => void): Commentable {
    cb(this.jsdocProvider);
    return this;
  }

  public toString(): string {
    this.builder.prepend(this.jsdocProvider.toString());
    return this.builder.toString();
  }
}
