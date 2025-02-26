import { TokenPosition } from "../tokenizer/token";

/**
 * Base error class for all Column language errors.
 */
export class ColumnError extends Error {
  /**
   * Creates a new ColumnError.
   * @param message - Error message
   * @param position - Position in the source where the error occurred
   * @param code - Error code
   */
  constructor(
    message: string,
    public position: TokenPosition,
    public code: string
  ) {
    super(
      `${code} at line ${position.line}, column ${position.column}: ${message}`
    );
    this.name = "ColumnError";
  }
}

/**
 * Error thrown during tokenization.
 */
export class TokenizationError extends ColumnError {
  constructor(message: string, position: TokenPosition) {
    super(message, position, "TOKENIZATION_ERROR");
    this.name = "TokenizationError";
  }
}

/**
 * Error thrown during parsing.
 */
export class ParseError extends ColumnError {
  constructor(message: string, position: TokenPosition) {
    super(message, position, "PARSE_ERROR");
    this.name = "ParseError";
  }
}

/**
 * Error thrown during interpretation.
 */
export class InterpretationError extends ColumnError {
  constructor(message: string, position: TokenPosition) {
    super(message, position, "INTERPRETATION_ERROR");
    this.name = "InterpretationError";
  }
}
