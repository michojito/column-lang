"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    TokenType[TokenType["KEY"] = 0] = "KEY";
    TokenType[TokenType["COLON"] = 1] = "COLON";
    TokenType[TokenType["VALUE"] = 2] = "VALUE";
    TokenType[TokenType["INDENT"] = 3] = "INDENT";
    TokenType[TokenType["DEDENT"] = 4] = "DEDENT";
    TokenType[TokenType["NEWLINE"] = 5] = "NEWLINE";
    TokenType[TokenType["LIST_ITEM"] = 6] = "LIST_ITEM";
    TokenType[TokenType["NESTED_OBJECT"] = 7] = "NESTED_OBJECT";
    TokenType[TokenType["MULTILINE_START"] = 8] = "MULTILINE_START";
    TokenType[TokenType["SPECIAL_COMMENT"] = 9] = "SPECIAL_COMMENT";
    TokenType[TokenType["EOF"] = 10] = "EOF";
})(TokenType || (exports.TokenType = TokenType = {}));
