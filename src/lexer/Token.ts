export enum TokenType {
  KEY,
  COLON,
  VALUE,
  INDENT,
  DEDENT,
  NEWLINE,
  LIST_ITEM,
  NESTED_OBJECT,
  MULTILINE_START,
  SPECIAL_COMMENT,
  EOF
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}
