import fs from "fs";
import path from "path";
import { Tokenizer } from "./tokenizer/tokenizer";
import { Parser } from "./parser/parser";
import {
  Interpreter,
  InterpretOptions,
  InterpretResult,
} from "./interpreter/interpreter";
import { FormatterOptions } from "./formatter/formatter";
import { JsonFormatter } from "./formatter/json-formatter";
import { YamlFormatter } from "./formatter/yaml-formatter";
import { XmlFormatter } from "./formatter/xml-formatter";
import { ColumnError } from "./utils/errors";

/**
 * Output format options.
 */
export type OutputFormat = "json" | "yaml" | "xml";

/**
 * Options for parsing Column files.
 */
export interface ParseOptions extends InterpretOptions, FormatterOptions {
  /**
   * The output format.
   */
  format?: OutputFormat;
}

/**
 * Interface for parse results.
 */
export interface ParseResult {
  /**
   * The parsed data.
   */
  data: any;

  /**
   * The formatted output string.
   */
  output: string;

  /**
   * Metadata from the parsing process.
   */
  meta?: {
    notices: string[];
    namespace?: string;
    todos?: string[];
  };
}

/**
 * Parses a Column string.
 * @param content - The Column string to parse
 * @param options - Parse options
 * @returns The parse result
 */
export function parseString(
  content: string,
  options: ParseOptions = {}
): ParseResult {
  try {
    // Step 1: Tokenize
    const tokenizer = new Tokenizer(content);
    const tokens = tokenizer.tokenize();

    // Step 2: Parse
    const parser = new Parser(tokens);
    const ast = parser.parse();

    // Step 3: Interpret
    const interpreter = new Interpreter({
      env: options.env,
      includeMeta: options.includeMeta,
    });
    const result = interpreter.interpret(ast);

    // Step 4: Format
    const output = formatResult(result, options);

    return {
      data: result.data,
      output,
      meta: result.meta,
    };
  } catch (error) {
    if (error instanceof ColumnError) {
      throw error;
    }

    throw new Error(`Failed to parse Column string: ${error}`);
  }
}

/**
 * Parses a Column file.
 * @param filePath - The path to the Column file
 * @param options - Parse options
 * @returns The parse result
 */
export function parseFile(
  filePath: string,
  options: ParseOptions = {}
): ParseResult {
  try {
    const fullPath = path.resolve(filePath);
    const content = fs.readFileSync(fullPath, "utf-8");
    return parseString(content, options);
  } catch (error) {
    if (error instanceof ColumnError) {
      throw error;
    }

    throw new Error(`Failed to parse Column file: ${error}`);
  }
}

/**
 * Formats an interpretation result.
 * @param result - The result to format
 * @param options - Formatting options
 * @returns The formatted string
 */
function formatResult(
  result: InterpretResult,
  options: ParseOptions = {}
): string {
  const format = options.format || "json";

  switch (format) {
    case "json":
      return new JsonFormatter().format(result, options);

    case "yaml":
      return new YamlFormatter().format(result, options);

    case "xml":
      return new XmlFormatter().format(result, options);

    default:
      throw new Error(`Unsupported output format: ${format}`);
  }
}

// Export all components
export * from "./tokenizer/token";
export * from "./tokenizer/tokenizer";
export * from "./parser/ast";
export * from "./parser/parser";
export * from "./interpreter/interpreter";
export * from "./formatter/formatter";
export * from "./formatter/json-formatter";
export * from "./formatter/yaml-formatter";
export * from "./formatter/xml-formatter";
export * from "./utils/errors";
export * from "./utils/types";
