import * as yaml from 'js-yaml';
import * as xml2js from 'xml2js';
import { ColumnObject } from '../types/ColumnTypes';

export class Interpreter {
  private data: ColumnObject;

  constructor() {
    this.data = {};
  }

  setData(data: ColumnObject) {
    this.data = data;
  }

  toJSON(): string {
    return JSON.stringify(this.data, null, 2);
  }

  toYAML(): string {
    return yaml.dump(this.data);
  }

  toXML(): string {
    const builder = new xml2js.Builder({
      rootName: 'root',
      headless: true,
      renderOpts: { pretty: true, indent: '  ', newline: '\n' }
    });
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + builder.buildObject(this.convertForXml(this.data));
  }

  private convertForXml(obj: ColumnObject): ColumnObject {
    const result: ColumnObject = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = this.convertForXml(value as ColumnObject);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  export(format: string): string {
    switch (format.toLowerCase()) {
      case 'json':
        return this.toJSON();
      case 'yaml':
        return this.toYAML();
      case 'xml':
        return this.toXML();
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
}
