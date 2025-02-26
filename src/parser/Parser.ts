import { Token, TokenType, TokenPosition } from "../tokenizer/token";
import { ParseError } from "../utils/errors";
import {
  ASTNode,
  DocumentNode,
  KeyValueNode,
  ValueNode,
  ListNode,
  ListItemNode,
  MultilineStringNode,
  CommentNode,
  TodoCommentNode,
  NoticeNode,
  NamespaceDeclarationNode,
  SectionDeclarationNode,
  EnvVarNode,
  RawContentNode,
  TypeAnnotationNode,
  createDocument,
  createKeyValue,
  createValue,
  createList,
  createListItem,
  createMultilineString,
  createComment,
  createTodoComment,
  createNotice,
  createNamespaceDeclaration,
  createSectionDeclaration,
  createEnvVar,
  createRawContent,
  createTypeAnnotation,
} from "./ast";
import {
  DataType,
  detectType,
  convertValue,
  parseTypeAnnotation,
  TypeAnnotation,
} from "../utils/types";

/**
 * Responsible for parsing tokens into an AST.
 */
export class Parser {
  private tokens: Token[];
  private current: number = 0;
  private indentStack: number[] = [0]; // Start with 0 indentation

  /**
   * Creates a new Parser.
   * @param tokens - The tokens to parse
   */
  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  /**
   * Gets the current token.
   */
  private get currentToken(): Token {
    return this.tokens[this.current];
  }

  /**
   * Gets the next token without consuming it.
   * @param offset - The offset from the current position
   */
  private peekToken(offset: number = 1): Token {
    return (
      this.tokens[this.current + offset] || this.tokens[this.tokens.length - 1]
    );
  }

  /**
   * Advances to the next token.
   * @returns The previous token
   */
  private advance(): Token {
    const token = this.currentToken;
    this.current++;
    return token;
  }

  /**
   * Checks if the current token is of the specified type.
   * @param type - The token type to check for
   * @returns True if the current token is of the specified type
   */
  private check(type: TokenType): boolean {
    if (this.isAtEnd()) {
      return false;
    }
    return this.currentToken.type === type;
  }

  /**
   * Consumes the current token if it's of the specified type.
   * @param type - The token type to match
   * @param message - The error message if the token doesn't match
   * @returns The consumed token
   */
  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }

    throw new ParseError(
      `${message}. Found ${this.currentToken.type} instead.`,
      this.currentToken.position
    );
  }

  /**
   * Checks if we've reached the end of the tokens.
   */
  private isAtEnd(): boolean {
    return (
      this.current >= this.tokens.length ||
      this.currentToken.type === TokenType.EOF
    );
  }

  /**
   * Calculates the current indentation level.
   * @param line - The line to check
   * @returns The indentation level (number of spaces / 2)
   */
  private calculateIndent(line: string): number {
    const match = line.match(/^(\s*)/);
    const spaces = match ? match[1].length : 0;
    return Math.floor(spaces / 2); // Each indentation level is 2 spaces
  }

  /**
   * Parses a top-level document.
   * @returns The parsed document node
   */
  public parse(): DocumentNode {
    const docPosition: TokenPosition = this.currentToken.position;
    const nodes: ASTNode[] = [];
    const notices: NoticeNode[] = [];
    let namespace: NamespaceDeclarationNode | undefined;
    const sections: SectionDeclarationNode[] = [];

    // Parse notices, they must come first
    while (this.check(TokenType.NOTICE)) {
      const notice = this.parseNotice();
      notices.push(notice);
    }

    // Check for namespace or section declaration
    if (this.check(TokenType.NAMESPACE_DECLARATION)) {
      namespace = this.parseNamespaceDeclaration();
    } else if (this.check(TokenType.SECTION_DECLARATION)) {
      // Parse sections and their content
      while (this.check(TokenType.SECTION_DECLARATION)) {
        const section = this.parseSectionDeclaration();
        sections.push(section);
      }
    }

    // Parse the rest of the document
    while (!this.isAtEnd()) {
      if (this.check(TokenType.NEWLINE)) {
        this.advance(); // Skip empty lines
        continue;
      }

      if (this.check(TokenType.COMMENT) || this.check(TokenType.TODO_COMMENT)) {
        const comment = this.parseComment();
        nodes.push(comment);
        continue;
      }

      const node = this.parseStatement();
      if (node) {
        nodes.push(node);
      }
    }

    return createDocument(docPosition, nodes, notices, namespace, sections);
  }

  /**
   * Parses a statement (key-value pair, list, etc.)
   * @returns The parsed node
   */
  private parseStatement(): ASTNode | null {
    if (this.check(TokenType.KEY)) {
      return this.parseKeyValue();
    }

    if (this.check(TokenType.LIST_ITEM)) {
      return this.parseListItem();
    }

    if (this.check(TokenType.COMMENT) || this.check(TokenType.TODO_COMMENT)) {
      return this.parseComment();
    }

    if (this.check(TokenType.NOTICE)) {
      return this.parseNotice();
    }

    if (this.check(TokenType.EOF)) {
      return null;
    }

    throw new ParseError(
      `Unexpected token: ${this.currentToken.type}`,
      this.currentToken.position
    );
  }

  /**
   * Parses a key-value pair.
   * @returns The parsed key-value node
   */
  private parseKeyValue(): KeyValueNode {
    const keyToken = this.consume(TokenType.KEY, "Expected key");
    this.consume(TokenType.COLON, "Expected ':' after key");

    let value: ValueNode | null = null;

    // Check if there's a value after the colon
    if (this.check(TokenType.VALUE)) {
      const valueToken = this.advance();

      // Check for type annotation
      const typeAnnotation = this.parseTypeAnnotationIfPresent(
        valueToken.value
      );

      if (typeAnnotation) {
        // Extract the actual value after the type annotation
        const actualValue = valueToken.value
          .substring(typeAnnotation.value.length + 2)
          .trim(); // +2 for {}

        // Create the value with the detected type
        const detectedType = detectType(actualValue);
        const convertedValue = convertValue(actualValue, typeAnnotation.type);

        value = createValue(
          valueToken.position,
          convertedValue,
          detectedType === DataType.NULL
            ? "null"
            : detectedType === DataType.BOOLEAN
            ? "boolean"
            : detectedType === DataType.INT || detectedType === DataType.FLOAT
            ? "number"
            : detectedType === DataType.DATE ||
              detectedType === DataType.TIME ||
              detectedType === DataType.DATETIME
            ? "date"
            : "string"
        );
      } else {
        // No type annotation, detect the type automatically
        const detectedType = detectType(valueToken.value);
        const convertedValue = convertValue(valueToken.value, detectedType);

        value = createValue(
          valueToken.position,
          convertedValue,
          detectedType === DataType.NULL
            ? "null"
            : detectedType === DataType.BOOLEAN
            ? "boolean"
            : detectedType === DataType.INT || detectedType === DataType.FLOAT
            ? "number"
            : detectedType === DataType.DATE ||
              detectedType === DataType.TIME ||
              detectedType === DataType.DATETIME
            ? "date"
            : "string"
        );
      }
    } else if (this.check(TokenType.MULTILINE_START)) {
      const multilineStart = this.advance();
      const format = multilineStart.value as "|" | "<" | "|+" | "`";

      // Collect the multiline content
      let content = "";

      while (this.check(TokenType.MULTILINE_STRING)) {
        const lineToken = this.advance();
        content += lineToken.value;

        // Add a newline unless it's the last line
        if (this.check(TokenType.MULTILINE_STRING)) {
          content += "\n";
        }
      }

      // Ensure we have a MULTILINE_END token
      this.consume(TokenType.MULTILINE_END, "Expected end of multiline string");

      const multilineNode = createMultilineString(
        multilineStart.position,
        content,
        format
      );
      value = createValue(multilineStart.position, multilineNode, "complex");
    } else if (this.check(TokenType.RAW_CONTENT)) {
      const rawToken = this.advance();
      const rawNode = createRawContent(rawToken.position, rawToken.value);
      value = createValue(rawToken.position, rawNode, "complex");
    } else if (this.check(TokenType.ENV_VAR)) {
      const envVarToken = this.advance();
      const parts = envVarToken.value.split("||").map((part) => part.trim());

      const name = parts[0].substring(2); // Remove the $_ prefix
      const defaultValue = parts.length > 1 ? parts[1] : undefined;

      const envVarNode = createEnvVar(envVarToken.position, name, defaultValue);
      value = createValue(envVarToken.position, envVarNode, "complex");
    }

    // Check for a potential nested structure (looking for indent after the newline)
    const node = createKeyValue(keyToken.position, keyToken.value, value);

    // Consume the newline after the key-value pair
    if (this.check(TokenType.NEWLINE)) {
      this.advance();

      // Check for indentation indicating nested structure
      if (this.check(TokenType.INDENT)) {
        const indent = this.advance();

        // Parse the nested children
        const children: ASTNode[] = [];

        while (this.check(TokenType.KEY) || this.check(TokenType.LIST_ITEM)) {
          const child = this.parseStatement();
          if (child) {
            children.push(child);
          }

          // If we have a dedent token, we're done with this level
          if (this.check(TokenType.DEDENT)) {
            this.advance();
            break;
          }
        }

        node.children = children;
      }
    }

    return node;
  }

  /**
   * Parses a list item.
   * @returns The parsed list item node
   */
  private parseListItem(): ListItemNode {
    const itemToken = this.consume(TokenType.LIST_ITEM, "Expected list item");

    // Check what follows the list item marker
    let itemValue: ValueNode | KeyValueNode;

    if (this.check(TokenType.KEY)) {
      // This is a key-value pair list item
      itemValue = this.parseKeyValue();
    } else if (this.check(TokenType.VALUE)) {
      // This is a simple value list item
      const valueToken = this.advance();
      const detectedType = detectType(valueToken.value);
      const convertedValue = convertValue(valueToken.value, detectedType);

      itemValue = createValue(
        valueToken.position,
        convertedValue,
        detectedType === DataType.NULL
          ? "null"
          : detectedType === DataType.BOOLEAN
          ? "boolean"
          : detectedType === DataType.INT || detectedType === DataType.FLOAT
          ? "number"
          : detectedType === DataType.DATE ||
            detectedType === DataType.TIME ||
            detectedType === DataType.DATETIME
          ? "date"
          : "string"
      );
    } else {
      throw new ParseError(
        `Expected value after list item marker`,
        this.currentToken.position
      );
    }

    return createListItem(itemToken.position, itemValue);
  }

  /**
   * Parses a comment.
   * @returns The parsed comment node
   */
  private parseComment(): CommentNode | TodoCommentNode {
    if (this.check(TokenType.COMMENT)) {
      const commentToken = this.advance();
      return createComment(
        commentToken.position,
        commentToken.value.substring(2).trim()
      ); // Remove the // prefix
    } else if (this.check(TokenType.TODO_COMMENT)) {
      const todoToken = this.advance();
      return createTodoComment(
        todoToken.position,
        todoToken.value.substring(3).trim()
      ); // Remove the /=> prefix
    }

    throw new ParseError(
      `Expected comment, found ${this.currentToken.type}`,
      this.currentToken.position
    );
  }

  /**
   * Parses a notice comment.
   * @returns The parsed notice node
   */
  private parseNotice(): NoticeNode {
    const noticeToken = this.consume(TokenType.NOTICE, "Expected notice");
    return createNotice(
      noticeToken.position,
      noticeToken.value.substring(2).trim()
    ); // Remove the /! prefix
  }

  /**
   * Parses a namespace declaration.
   * @returns The parsed namespace declaration node
   */
  private parseNamespaceDeclaration(): NamespaceDeclarationNode {
    const namespaceToken = this.consume(
      TokenType.NAMESPACE_DECLARATION,
      "Expected namespace declaration"
    );
    const name = namespaceToken.value.substring(2).trim(); // Remove the @- prefix
    return createNamespaceDeclaration(namespaceToken.position, name);
  }

  /**
   * Parses a section declaration.
   * @returns The parsed section declaration node
   */
  private parseSectionDeclaration(): SectionDeclarationNode {
    const sectionToken = this.consume(
      TokenType.SECTION_DECLARATION,
      "Expected section declaration"
    );
    const name = sectionToken.value.substring(2).trim(); // Remove the @/ prefix

    // Consume the newline after the section declaration
    if (this.check(TokenType.NEWLINE)) {
      this.advance();
    }

    // Parse the section's content
    const children: ASTNode[] = [];

    while (!this.isAtEnd() && !this.check(TokenType.SECTION_DECLARATION)) {
      if (this.check(TokenType.NEWLINE)) {
        this.advance(); // Skip empty lines
        continue;
      }

      const node = this.parseStatement();
      if (node) {
        children.push(node);
      }
    }

    return createSectionDeclaration(sectionToken.position, name, children);
  }

  /**
   * Parses a type annotation if present.
   * @param value - The value string potentially containing a type annotation
   * @returns The parsed type annotation or null if not present
   */
  private parseTypeAnnotationIfPresent(value: string): TypeAnnotation | null {
    // Check if the value starts with a type annotation pattern {TYPE}
    const match = value.match(/^\s*\{([A-Z]+)\}/);
    if (!match) return null;

    const typeStr = match[1];

    try {
      const type = DataType[typeStr as keyof typeof DataType];
      return { type, value: typeStr };
    } catch (e) {
      return null;
    }
  }
}
