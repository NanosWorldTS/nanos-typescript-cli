export class StringBuilder {

  private current: string;

  public constructor() {
    this.current = "";
  }

  public prepend(value: any): StringBuilder {
    this.current = value.toString() + this.current;
    return this;
  }

  public append(value: any): StringBuilder {
    this.current += value.toString();
    return this;
  }

  public newLine() {
    this.current += "\n";
    return this;
  }

  public toString(): string {
    return this.current;
  }
}

export interface DeclarationProvider {
  toString(): string;
}
