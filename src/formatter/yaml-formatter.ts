import { InterpretResult } from "../interpreter/interpreter";
import { BaseFormatter, FormatterOptions } from "./formatter";
import * as yaml from "yaml";

/**
 * Formatter for YAML output.
 */
export class YamlFormatter extends BaseFormatter {
  /**
   * Formats an interpretation result into YAML.
   * @param result - The result to format
   * @param options - Formatting options
   * @returns The formatted YAML string
   */
  format(result: InterpretResult, options?: FormatterOptions): string {
    const opt = this.getOptions(options);
    const data = opt.includeMeta ? result : result.data;

    return yaml.stringify(data, {
      indent: opt.indent,

      // YAML-specific options
      lineWidth: 0, // No maximum line width
      // Handle multiline strings and keep them formatted nicely
      simpleKeys: false, // Allow complex keys
      sortMapEntries: false, // Don't sort map entries
    });
  }
}
