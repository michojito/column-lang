import { TokenPosition } from "../tokenizer/token";

export class ColumnError extends Error {
  constructor(
    message: string,
    public position: TokenPosition,
    public code: string
  ) {
    super(`${code} at line ${position.line}, column ${position.column}: ${message}`);
    this.name = 'ColumnError';
  }
}

export class TokenizationError extends ColumnError {
  constructor(message: string, position: TokenPosition) {
    super(message, position, 'TOKENIZATION_ERROR');
    this.name = 'TokenizationError';
  }
}

export class ParseError extends ColumnError {
  constructor(message: string, position: TokenPosition) {
    super(message, position, 'PARSE_ERROR');
    this.name = 'ParseError';
  }
}