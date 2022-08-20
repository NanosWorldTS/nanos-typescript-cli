import {Commentable} from "./base";

export default class FunctionProvider extends Commentable {

  private _returns: string = ": void";
  private _varargs: string = "";
  private readonly _params: {name: string, type: string, isNullable: boolean}[] = [];

  private _hasNullables: boolean = false;

  public constructor(name: string, isStatic: boolean) {
    super(true);

    this.builder.append(`  public${isStatic ? ' static' : ''} ${name}(`);
  }

  public disableReturn(): FunctionProvider {
    this._returns = "";
    return this;
  }

  public returns(type: string): FunctionProvider {
    this._returns = ": " + type;
    return this;
  }

  public param(name: string, type: string, isNullable: boolean = false): FunctionProvider {
    let nullable = isNullable;
    if (nullable) {
      this._hasNullables = true;
    }

    if (!nullable && this._hasNullables) {
      nullable = true;
    }

    this._params.push({name, type, isNullable: nullable});
    return this;
  }

  public varargs(name: string, type: string): FunctionProvider {
    this._varargs = `...${name}: ${this._varargs}[]`;
    return this;
  }

  public toString(): string {
    const params = this._params.map(p => `${p.name}${p.isNullable ? '?' : ''}: ${p.type}`);
    if (this._varargs.trim().length > 0) {
      params.push(this._varargs);
    }

    this.builder.append(params.join(", "));
    this.builder.append(`)${this._returns};`).newLine();
    return '\n' + super.toString();
  }
}
