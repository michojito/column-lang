export declare enum TokenType {
    KEY = 0,
    COLON = 1,
    VALUE = 2,
    INDENT = 3,
    DEDENT = 4,
    NEWLINE = 5,
    LIST_ITEM = 6,
    NESTED_OBJECT = 7,
    MULTILINE_START = 8,
    SPECIAL_COMMENT = 9,
    EOF = 10
}
export interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
}
