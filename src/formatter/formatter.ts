import { InterpretResult } from "../interpreter/interpreter";

/**
 * Interface for formatter options.
 */
export interface FormatterOptions {
  /**
   * Whether to pretty-print the output.
   */
  pretty?: boolean;

  /**
   * The number of spaces to use for indentation.
   */
  indent?: number;

  /**
   * Whether to include metadata in the output.
   */
  includeMeta?: boolean;
}

/**
 * Base interface for formatters.
 */
export interface Formatter {
  /**
   * Formats an interpretation result into a string.
   * @param result - The result to format
   * @param options - Formatting options
   * @returns The formatted string
   */
  format(result: InterpretResult, options?: FormatterOptions): string;
}

/**
 * Base class for formatters.
 */
export abstract class BaseFormatter implements Formatter {
  /**
   * Formats an interpretation result into a string.
   * @param result - The result to format
   * @param options - Formatting options
   * @returns The formatted string
   */
  abstract format(result: InterpretResult, options?: FormatterOptions): string;

  /**
   * Gets the default formatter options.
   * @param overrides - Option overrides
   * @returns The formatter options
   */
  protected getOptions(overrides?: FormatterOptions): FormatterOptions {
    return {
      pretty: true,
      indent: 2,
      includeMeta: false,
      ...overrides,
    };
  }
}
