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
  private indentStack: number[] = [0]; // Start with 0 indentation
  private currentLine: number = 1;
  private currentLineIndent: number = 0;
  private inMultiline: boolean = false;
  private multilineContent: Token[] = [];

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
    this.processTokens(rawTokens);

    return this.tokens;
  }

  /**
   * Processes the raw tokens to generate INDENT, DEDENT, and handle multiline strings.
   * @param rawTokens - The raw tokens from the tokenizer
   */
  private processTokens(rawTokens: Token[]): void {
    let i = 0;
    let currentIndent = 0;
    let lastLineNumber = 1;
    let inMultilineMode = false;
    let multilineStartToken: Token | null = null;

    while (i < rawTokens.length) {
      const token = rawTokens[i];

      // Track line changes and handle indentation
      if (token.position.line > lastLineNumber) {
        lastLineNumber = token.position.line;

        // Calculate the indentation level for this line
        currentIndent = this.calculateIndent(token.position.column - 1);

        // Add INDENT/DEDENT tokens if not in multiline mode
        if (!inMultilineMode) {
          if (currentIndent > this.indentStack[this.indentStack.length - 1]) {
            // Indentation increased
            this.tokens.push(
              new Token(TokenType.INDENT, "  ".repeat(currentIndent), {
                line: token.position.line,
                column: 1,
                index: token.position.index - token.position.column + 1,
              })
            );
            this.indentStack.push(currentIndent);
          } else if (
            currentIndent < this.indentStack[this.indentStack.length - 1]
          ) {
            // Indentation decreased
            while (
              currentIndent < this.indentStack[this.indentStack.length - 1]
            ) {
              this.indentStack.pop();
              this.tokens.push(
                new Token(TokenType.DEDENT, "", {
                  line: token.position.line,
                  column: 1,
                  index: token.position.index - token.position.column + 1,
                })
              );
            }
          }
        }
      }

      // Handle token based on type
      switch (token.type) {
        case TokenType.MULTILINE_START:
          // Start multiline mode
          inMultilineMode = true;
          multilineStartToken = token;
          this.tokens.push(token);

          // Look ahead for the content
          let j = i + 1;
          const multilineEndPosition = { ...token.position };

          // Skip newline after multiline marker if present
          if (j < rawTokens.length && rawTokens[j].type === TokenType.NEWLINE) {
            this.tokens.push(rawTokens[j]);
            j++;
          }

          // Convert subsequent tokens into MULTILINE_STRING tokens
          while (j < rawTokens.length) {
            const nextToken = rawTokens[j];

            // If we encounter a token that's at a lower indentation level, we're done
            if (nextToken.position.line > lastLineNumber) {
              const nextIndent = this.calculateIndent(
                nextToken.position.column - 1
              );
              if (nextIndent < currentIndent) {
                break;
              }
            }

            // If we encounter a token that's not a continuation of the multiline, we're done
            if (
              nextToken.type === TokenType.KEY ||
              nextToken.type === TokenType.LIST_ITEM ||
              nextToken.type === TokenType.SECTION_DECLARATION ||
              nextToken.type === TokenType.NAMESPACE_DECLARATION
            ) {
              break;
            }

            // Add content as MULTILINE_STRING token if it's a meaningful token
            if (
              nextToken.type === TokenType.VALUE ||
              nextToken.type === TokenType.KEY ||
              nextToken.type === TokenType.COLON
            ) {
              this.tokens.push(
                new Token(
                  TokenType.MULTILINE_STRING,
                  nextToken.value,
                  nextToken.position
                )
              );
              multilineEndPosition.line = nextToken.position.line;
              multilineEndPosition.column =
                nextToken.position.column + nextToken.value.length;
              multilineEndPosition.index =
                nextToken.position.index + nextToken.value.length;
            } else if (nextToken.type === TokenType.NEWLINE) {
              this.tokens.push(nextToken);
            }

            j++;
          }

          // Add the MULTILINE_END token
          this.tokens.push(
            new Token(TokenType.MULTILINE_END, "", multilineEndPosition)
          );

          inMultilineMode = false;
          i = j - 1; // Resume processing from the last examined token
          break;

        case TokenType.NEWLINE:
          this.tokens.push(token);
          break;

        case TokenType.LIST_ITEM:
          this.tokens.push(token);

          // Check if there's a value after the list item
          if (
            i + 1 < rawTokens.length &&
            rawTokens[i + 1].type === TokenType.KEY
          ) {
            // This is a list item with a key-value pair
            // The KEY and subsequent tokens will be handled in the next iteration
          } else if (i + 1 < rawTokens.length) {
            // This is a list item with a value
            const valueToken = rawTokens[i + 1];
            if (valueToken.type !== TokenType.NEWLINE) {
              // Convert the token to a VALUE token
              this.tokens.push(
                new Token(
                  TokenType.VALUE,
                  valueToken.value,
                  valueToken.position
                )
              );
              i++; // Skip the value token as we've processed it
            }
          }
          break;

        default:
          // Pass through all other tokens
          this.tokens.push(token);
          break;
      }

      i++;
    }

    // Add any remaining DEDENT tokens at the end of the file
    while (this.indentStack.length > 1) {
      this.indentStack.pop();
      this.tokens.push(
        new Token(TokenType.DEDENT, "", {
          line: lastLineNumber + 1,
          column: 1,
          index: rawTokens[rawTokens.length - 1].position.index + 1,
        })
      );
    }
  }

  /**
   * Calculates the indentation level based on spaces.
   * @param spaces - The number of spaces at the beginning of the line
   * @returns The indentation level
   */
  private calculateIndent(spaces: number): number {
    // Each indentation level is 2 spaces
    return Math.floor(spaces / 2);
  }
}
