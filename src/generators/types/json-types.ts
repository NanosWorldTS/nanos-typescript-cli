export type Authority = "both"|"server"|"client";

export function toLongAuthority(authority: Authority): string {
  switch (authority) {
    case "both":
      return "This can be used on both the <b><u>Server</u></b> and <b><u>Client</u></b>";
    case "server":
      return "This can be used only on the <b><u>Server</u></b>";
    case "client":
      return "This can be used only on the <b><u>Client</u></b>";
  }
}

export function getMostValuableInheritance(inheritances: string[]): string|null {
  if (inheritances.includes("Pickable")) {
    return "Pickable";
  }
  if (inheritances.includes("Paintable")) {
    return "Paintable";
  }
  if (inheritances.includes("Actor")) {
    return "Actor";
  }
  return inheritances.length > 0 ? inheritances[0] : null;
}

export interface Enum {
  [name: string]: ({
    key: string;
    value: string;
    description: string;
  })[];
}

export interface Document {
  name: string;
  description: string;
  description_long?: string;
}

export interface AuthorityOwned extends Document {
  authority?: Authority;
}

export interface Class extends AuthorityOwned {
  constructor?: Value[];
  properties: Value[];
  functions: Function[];
  static_functions: Function[];
  events: Event[];
  inheritance?: string[];
  operators?: Operator[];
}

export interface Function extends AuthorityOwned {
  parameters: Value[];
  return: Value[];
}

export interface Value extends Document {
  type: string;
  default: string;
  table_properties?: TableProp[];
}

export interface Event extends AuthorityOwned {
  arguments: Value[];
}

export interface TableProp {
  name: string;
  type: string;
}

export interface Operator {
  name: string;
  operator: string;
  lhs: string;
  rhs: string;
  return: string;
  description?: string;
}

export interface TransformedValue {
  type: string;
  name: string;
  default?: string;
  isVararg: boolean;
  description: string;
}
