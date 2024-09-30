import { ColumnObject } from '../types/ColumnTypes';

let yaml: any;
let xml2js: any;

try {
  yaml = require('js-yaml');
} catch (e) {
  console.warn('js-yaml module not found. YAML output will not be available.');
}

try {
  xml2js = require('xml2js');
} catch (e) {
  console.warn('xml2js module not found. XML output will not be available.');
}

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
    if (!yaml) {
      throw new Error('YAML output is not available. Please install js-yaml module.');
    }
    return yaml.dump(this.data);
  }

  toXML(): string {
    if (!xml2js) {
      throw new Error('XML output is not available. Please install xml2js module.');
    }
    const builder = new xml2js.Builder({
      rootName: 'root',
      headless: true,
      renderOpts: { pretty: true, indent: '  ', newline: '\n' }
    });
    const xmlString = builder.buildObject(this.data);
    // Remove the root tag and adjust indentation
    const adjustedXml = xmlString
      .replace(/<root>\s*/, '')
      .replace(/\s*<\/root>/, '')
      .split('\n')
      .map((line: string) => line.replace(/^  /, ''))
      .join('\n')
      .trim(); // Add trim() to remove any leading/trailing whitespace
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + adjustedXml;
  }

  private convertForXml(obj: ColumnObject): ColumnObject {
    const result: ColumnObject = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          result[key] = value.map(item =>
            typeof item === 'object' ? this.convertForXml(item as ColumnObject) : item
          );
        } else {
          // For nested objects, we don't need an additional wrapper
          result[key] = this.convertForXml(value as ColumnObject);
        }
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
