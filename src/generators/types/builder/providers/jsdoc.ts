import {DeclarationProvider, StringBuilder} from "../base";
import {Authority, toLongAuthority} from "../../json-types";

export default class JsDocProvider implements DeclarationProvider {

  private readonly builder: StringBuilder;
  private hasLines: boolean = false;

  public constructor(private readonly withIntent: boolean = false) {
    this.builder = new StringBuilder();
    this.builder.append(this.intent() + "/**").newLine();
  }

  public line(value: string = ""): JsDocProvider {
    this.hasLines = true;
    this.builder.append(this.intent() + " * " + value).newLine();
    return this;
  }

  public param(name: string, type: string, description: string, value?: string): JsDocProvider {
    this.line(`@param ${name} {@link ${type}} ${description}. ${value ? " Defaults to " + value : ""}`);
    return this;
  }

  public noSelf(b: boolean = true): JsDocProvider {
    if (!b) return this;
    return this.line("@noSelf");
  }

  public customCtor(name: string, b: boolean = true): JsDocProvider {
    if (!b) return this;
    return this.line("@customConstructor " + name);
  }

  public remarks(value: string): JsDocProvider {
    return this.line("@remarks " + value);
  }

  public authority(authoriy: Authority): JsDocProvider {
    return this.remarks("<i>Authority</i>: " + toLongAuthority(authoriy));
  }

  public toString(): string {
    if (!this.hasLines) return "";
    this.builder.append(this.intent() + " */").newLine();
    return this.builder.toString();
  }

  private intent(): string {
    return this.withIntent ? "  " : "";
  }
}
