import { InterpretResult } from "../interpreter/interpreter";
import { BaseFormatter, FormatterOptions } from "./formatter";
import * as xml2js from "xml2js";

/**
 * Formatter for XML output.
 */
export class XmlFormatter extends BaseFormatter {
  /**
   * Formats an interpretation result into XML.
   * @param result - The result to format
   * @param options - Formatting options
   * @returns The formatted XML string
   */
  format(result: InterpretResult, options?: FormatterOptions): string {
    const opt = this.getOptions(options);
    const data = opt.includeMeta ? result : result.data;

    // Create a root element to contain the data
    const rootName = this.getRootElementName(data);
    const xmlObj = { [rootName]: this.prepareForXml(data) };

    const builder = new xml2js.Builder({
      rootName,
      headless: false, // Include XML declaration
      renderOpts: {
        pretty: opt.pretty,
        indent: " ".repeat(opt.indent || 2),
        newline: "\n",
      },
      xmldec: {
        version: "1.0",
        encoding: "UTF-8",
        standalone: false,
      },
    });

    // Build the XML and adjust the XML declaration to match expected format
    let xml = builder.buildObject(xmlObj);

    // Fix XML declaration format to match test expectations
    xml = xml.replace(
      /\?xml version="1.0" encoding="UTF-8" standalone="no"\?/,
      '?xml version="1.0" encoding="UTF-8"?'
    );

    return xml;
  }

  /**
   * Prepares a JavaScript object for XML conversion.
   * @param data - The data to prepare
   * @returns The prepared data
   */
  private prepareForXml(data: any): any {
    if (data === null || data === undefined) {
      return "";
    }

    if (
      typeof data === "string" ||
      typeof data === "number" ||
      typeof data === "boolean"
    ) {
      return data.toString();
    }

    if (Array.isArray(data)) {
      return {
        item: data.map((item) => this.prepareForXml(item)),
      };
    }

    if (typeof data === "object") {
      // Special case: if this is a result object with data and meta
      if ("data" in data && "meta" in data) {
        // Extract meta into the same level
        const { data: actualData, meta } = data;
        const result: Record<string, any> = {};

        // Add data
        result.data = this.prepareForXml(actualData);

        // Extract and add meta properties directly
        if (meta && typeof meta === "object") {
          for (const [key, value] of Object.entries(meta)) {
            const safeKey = this.sanitizeXmlKey(key);
            result[safeKey] = this.prepareForXml(value);
          }
        }

        return result;
      }

      // Normal object processing
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        const safeKey = this.sanitizeXmlKey(key);
        result[safeKey] = this.prepareForXml(value);
      }

      return result;
    }

    return data;
  }

  /**
   * Gets the root element name for the XML document.
   * @param data - The data being formatted
   * @returns The root element name
   */
  private getRootElementName(data: any): string {
    // If we have metadata, check for a namespace name
    if (data && typeof data === "object" && "meta" in data && data.meta) {
      const { meta } = data;

      if (meta.namespace) {
        // Convert namespace to a valid XML element name
        return this.sanitizeXmlKey(meta.namespace);
      }
    }

    // Default root element name
    return "root";
  }

  /**
   * Sanitizes a key for use as an XML element name.
   * @param key - The key to sanitize
   * @returns The sanitized key
   */
  private sanitizeXmlKey(key: string): string {
    // XML element names must start with a letter or underscore and can contain
    // letters, digits, hyphens, underscores, and periods

    // Replace invalid characters with underscores
    let safeKey = key.replace(/[^a-zA-Z0-9_.-]/g, "_");

    // Ensure it starts with a letter or underscore
    if (!/^[a-zA-Z_]/.test(safeKey)) {
      safeKey = "_" + safeKey;
    }

    return safeKey;
  }
}
