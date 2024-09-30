"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
const Token_1 = require("./Token");
class Lexer {
    constructor(input) {
        this.input = input;
        this.tokens = [];
        this.currentLine = 0;
        this.currentColumn = 0;
        this.indentStack = [0];
    }
    tokenize() {
        const lines = this.input.split('\n');
        for (let i = 0; i < lines.length; i++) {
            this.currentLine = i;
            this.currentColumn = 0;
            this.tokenizeLine(lines[i]);
        }
        this.tokens.push({ type: Token_1.TokenType.EOF, value: '', line: this.currentLine, column: this.currentColumn });
        return this.tokens;
    }
    tokenizeLine(line) {
        const trimmedLine = line.trimStart();
        const indent = line.length - trimmedLine.length;
        this.handleIndentation(indent);
        if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/!')) {
            this.addToken(Token_1.TokenType.SPECIAL_COMMENT, trimmedLine);
            return;
        }
        if (trimmedLine.startsWith('-')) {
            this.addToken(Token_1.TokenType.LIST_ITEM, '-');
            this.currentColumn += 2; // Skip '- '
            this.tokenizeValue(trimmedLine.slice(2));
        }
        else if (trimmedLine.startsWith('>')) {
            this.addToken(Token_1.TokenType.NESTED_OBJECT, '>');
        }
        else {
            const colonIndex = trimmedLine.indexOf(':');
            if (colonIndex !== -1) {
                this.addToken(Token_1.TokenType.KEY, trimmedLine.slice(0, colonIndex).trim());
                this.addToken(Token_1.TokenType.COLON, ':');
                this.currentColumn = colonIndex + 1;
                const value = trimmedLine.slice(colonIndex + 1).trim();
                if (value) {
                    this.tokenizeValue(value);
                }
            }
        }
        this.addToken(Token_1.TokenType.NEWLINE, '\n');
    }
    handleIndentation(indent) {
        if (indent > this.indentStack[this.indentStack.length - 1]) {
            this.indentStack.push(indent);
            this.addToken(Token_1.TokenType.INDENT, ' '.repeat(indent));
        }
        else if (indent < this.indentStack[this.indentStack.length - 1]) {
            while (indent < this.indentStack[this.indentStack.length - 1]) {
                this.indentStack.pop();
                this.addToken(Token_1.TokenType.DEDENT, '');
            }
        }
        this.currentColumn = indent;
    }
    tokenizeValue(value) {
        if (value === '|' || value === '<') {
            this.addToken(Token_1.TokenType.MULTILINE_START, value);
        }
        else {
            this.addToken(Token_1.TokenType.VALUE, value);
        }
    }
    addToken(type, value) {
        this.tokens.push({
            type,
            value,
            line: this.currentLine,
            column: this.currentColumn
        });
        this.currentColumn += value.length;
    }
}
exports.Lexer = Lexer;
