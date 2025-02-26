import { InterpretResult } from "../interpreter/interpreter";
import { BaseFormatter, FormatterOptions } from "./formatter";

/**
 * Formatter for JSON output.
 */
export class JsonFormatter extends BaseFormatter {
  /**
   * Formats an interpretation result into JSON.
   * @param result - The result to format
   * @param options - Formatting options
   * @returns The formatted JSON string
   */
  format(result: InterpretResult, options?: FormatterOptions): string {
    const opt = this.getOptions(options);
    const data = opt.includeMeta ? result : result.data;

    return opt.pretty
      ? JSON.stringify(data, null, opt.indent)
      : JSON.stringify(data);
  }
}
