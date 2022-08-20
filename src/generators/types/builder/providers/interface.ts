import {Commentable} from "./base";
import FunctionProvider from "./function";

export default class InterfaceProvider extends Commentable {

  public constructor(name: string) {
    super();

    this.builder.append(`declare interface ${name} {`).newLine();
  }

  public function(name: string, isStatic: boolean, cb: (provider: FunctionProvider) => void): InterfaceProvider {
    const provider = new FunctionProvider(name, isStatic, "");
    cb(provider);
    this.builder.append(provider.toString());
    return this;
  }

  public toString(): string {
    this.builder.append("}").newLine();
    return super.toString();
  }
}
