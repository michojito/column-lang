import { Token, TokenType, TokenPosition } from "../tokenizer/token";
import { Tokenizer } from "../tokenizer/tokenizer";

/**
 * The Lexer is responsible for processing tokens from the Tokenizer and
 * handling indentation and dedentation tokens, which are crucial for
 * the hierarchical structure of the Column language.
 */
export class Lexer {
  private tokenizer: Tokenizer;
  private tokens: Token[] = [];
  private current: number = 0;
  private indentStack: number[] = [0]; // Start with 0 indentation
  private currentLine: number = 1;
  private currentLineIndent: number = 0;
  private inMultiline: boolean = false;

  /**
   * Creates a new Lexer.
   * @param source - The source code to lex
   */
  constructor(source: string) {
    this.tokenizer = new Tokenizer(source);
  }

  /**
   * Processes the tokens from the tokenizer and adds INDENT and DEDENT tokens.
   * @returns An array of processed tokens
   */
  public lex(): Token[] {
    // First, get all tokens from the tokenizer
    const rawTokens = this.tokenizer.tokenize();

    // Process the raw tokens to add INDENT and DEDENT tokens
    this.processIndentation(rawTokens);

    return this.tokens;
  }

  /**
   * Processes indentation in the raw tokens to generate INDENT and DEDENT tokens.
   * @param rawTokens - The raw tokens from the tokenizer
   */
  private processIndentation(rawTokens: Token[]): void {
    let i = 0;

    while (i < rawTokens.length) {
      const token = rawTokens[i];

      // Handle based on token type
      switch (token.type) {
        case TokenType.NEWLINE:
          // Process newlines
          this.tokens.push(token);

          // Check if the next token is on a new line (not EOF)
          if (
            i + 1 < rawTokens.length &&
            rawTokens[i + 1].position.line > token.position.line
          ) {
            // Calculate indentation level of the next line
            const nextToken = rawTokens[i + 1];
            const indent = this.calculateIndent(nextToken.position.column);

            // Handle changes in indentation
            if (indent > this.indentStack[this.indentStack.length - 1]) {
              // Indentation increased, add INDENT token
              this.tokens.push(
                new Token(
                  TokenType.INDENT,
                  " ".repeat(indent * 2), // Assuming 2 spaces per indent level
                  nextToken.position
                )
              );
              this.indentStack.push(indent);
            } else if (indent < this.indentStack[this.indentStack.length - 1]) {
              // Indentation decreased, add DEDENT tokens
              while (indent < this.indentStack[this.indentStack.length - 1]) {
                this.indentStack.pop();
                this.tokens.push(
                  new Token(TokenType.DEDENT, "", nextToken.position)
                );
              }

              // Verify indentation is valid
              if (indent !== this.indentStack[this.indentStack.length - 1]) {
                throw new Error(
                  `Invalid indentation at line ${nextToken.position.line}`
                );
              }
            }
          }
          break;

        case TokenType.MULTILINE_START:
          // Begin multiline string mode
          this.tokens.push(token);
          this.inMultiline = true;
          break;

        case TokenType.MULTILINE_STRING:
          // Pass multiline string tokens through
          this.tokens.push(token);
          break;

        case TokenType.MULTILINE_END:
          // End multiline string mode
          this.tokens.push(token);
          this.inMultiline = false;
          break;

        default:
          // Pass through all other tokens
          this.tokens.push(token);
          break;
      }

      // Move to next token
      i++;
    }

    // At the end of the file, add any remaining DEDENT tokens
    const lastPosition = rawTokens[rawTokens.length - 1].position;
    while (this.indentStack.length > 1) {
      this.indentStack.pop();
      this.tokens.push(new Token(TokenType.DEDENT, "", lastPosition));
    }
  }

  /**
   * Calculates the indentation level based on column position.
   * @param column - The column position
   * @returns The indentation level
   */
  private calculateIndent(column: number): number {
    // Indentation level is column - 1 divided by 2
    // (assuming 2 spaces per indentation level)
    return Math.max(0, Math.floor((column - 1) / 2));
  }
}
