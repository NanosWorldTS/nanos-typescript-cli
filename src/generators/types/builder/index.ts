import {StringBuilder} from "./base";
import EnumProvider from "./providers/enum";
import {Event} from "../json-types";
import JsDocProvider from "./providers/jsdoc";
import ClassProvider from "./providers/class";
import InterfaceProvider from "./providers/interface";

export class DeclarationBuilder {

  private readonly builder: StringBuilder;

  public constructor() {
    this.builder = new StringBuilder();
  }

  public enum(name: string, cb: (enumProvider: EnumProvider) => void): DeclarationBuilder {
    const enumProvider = new EnumProvider(name);
    cb(enumProvider);
    this.builder.append(enumProvider.toString()).newLine();
    return this;
  }

  public interface(name: string, cb: (interfaceProvider: InterfaceProvider) => void): DeclarationBuilder {
    const interfaceProvider = new InterfaceProvider(name);
    cb(interfaceProvider);
    this.builder.append(interfaceProvider.toString()).newLine();
    return this;
  }

  public var(name: string, type: string): DeclarationBuilder {
    this.builder.append(`declare var ${name}: ${type};`).newLine();
    return this;
  }

  public const(name: string, type: string): DeclarationBuilder {
    this.builder.append(`declare const ${name}: ${type};`).newLine();
    return this;
  }

  public class(name: string, inheritance: string[]|undefined, cb: (classProvider: ClassProvider) => void): DeclarationBuilder {
    const classProvider = new ClassProvider(name, inheritance || []);
    cb(classProvider);
    this.builder.append(classProvider.toString()).newLine();
    return this;
  }

  public events(typeName: string, events: Event[], inheritance: string|undefined) {
    const eventTypesUnion: string[] = ["string"];
    if (inheritance) {
      eventTypesUnion.push(inheritance + "Event");
    }

    events.forEach(event => {
      const eventName = `${typeName}Event_${event.name}`;
      eventTypesUnion.push(eventName);

      const jsdoc = new JsDocProvider();
      if (event.description) {
        jsdoc.line(event.description);
      }

      if (event.authority) {
        jsdoc.authority(event.authority);
      }

      if (event.arguments) {
        event.arguments.forEach(argument => {
          const argDesc = argument.description_long || argument.description;
          jsdoc.param(argument.name, argument.type, argDesc, argument.default);
        });
      }

      this.builder.append(jsdoc.toString());
      this.builder.append(`type ${eventName} = "${event.name}";`).newLine().newLine();
    });

    this.builder.append(`export type ${typeName}Event = ${eventTypesUnion.join(" | ")};`).newLine().newLine();
  }

  public build(): string {
    return this.builder.toString();
  }
}
