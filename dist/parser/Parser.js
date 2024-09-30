"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const ParserError_1 = require("../errors/ParserError");
const Token_1 = require("../lexer/Token");
class Parser {
    constructor(tokens) {
        this.currentTokenIndex = 0;
        this.specialComments = [];
        this.tokens = tokens;
    }
    parse() {
        this.parseSpecialComments();
        return this.parseObject();
    }
    parseSpecialComments() {
        while (this.peek().type === Token_1.TokenType.SPECIAL_COMMENT) {
            const token = this.consume(Token_1.TokenType.SPECIAL_COMMENT);
            this.specialComments.push(token.value.slice(2).trim());
        }
    }
    parseObject() {
        const obj = {};
        while (!this.isAtEnd() && this.peek().type !== Token_1.TokenType.DEDENT) {
            const keyToken = this.consume(Token_1.TokenType.KEY);
            this.consume(Token_1.TokenType.COLON);
            obj[keyToken.value] = this.parseValue();
        }
        return obj;
    }
    parseValue() {
        const token = this.peek();
        switch (token.type) {
            case Token_1.TokenType.VALUE:
                return this.parseSimpleValue();
            case Token_1.TokenType.NESTED_OBJECT:
                return this.parseNestedObject();
            case Token_1.TokenType.LIST_ITEM:
                return this.parseList();
            case Token_1.TokenType.MULTILINE_START:
                return this.parseMultilineString();
            default:
                throw new ParserError_1.ParserError(`Unexpected token: ${token.value}`, token.line, token.column);
        }
    }
    parseSimpleValue() {
        const token = this.consume(Token_1.TokenType.VALUE);
        return this.parseValueString(token.value);
    }
    parseNestedObject() {
        this.consume(Token_1.TokenType.NESTED_OBJECT);
        this.consume(Token_1.TokenType.NEWLINE);
        this.consume(Token_1.TokenType.INDENT);
        const obj = this.parseObject();
        this.consume(Token_1.TokenType.DEDENT);
        return obj;
    }
    parseList() {
        const list = [];
        while (this.peek().type === Token_1.TokenType.LIST_ITEM) {
            this.consume(Token_1.TokenType.LIST_ITEM);
            list.push(this.parseValue());
        }
        return list;
    }
    parseMultilineString() {
        const startToken = this.consume(Token_1.TokenType.MULTILINE_START);
        const preserveNewlines = startToken.value === '|';
        let result = '';
        while (this.peek().type === Token_1.TokenType.VALUE) {
            const lineToken = this.consume(Token_1.TokenType.VALUE);
            if (result) {
                result += preserveNewlines ? '\n' : ' ';
            }
            result += lineToken.value;
        }
        return result.trim();
    }
    parseValueString(value) {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        if (value === 'null' || value === '?')
            return null;
        if (value.startsWith('$_')) {
            const envVar = process.env[value.slice(2)];
            return envVar !== undefined ? envVar : '';
        }
        if (value.startsWith('`') && value.endsWith('`')) {
            return value.slice(1, -1);
        }
        if (!isNaN(Number(value)))
            return Number(value);
        if (value.startsWith('[') && value.endsWith(']')) {
            return value.slice(1, -1).split(',').map(item => this.parseValueString(item.trim()));
        }
        return value;
    }
    consume(type) {
        if (this.check(type)) {
            return this.advance();
        }
        const token = this.peek();
        throw new ParserError_1.ParserError(`Expected ${type}, but found ${token.type}`, token.line, token.column);
    }
    check(type) {
        if (this.isAtEnd())
            return false;
        return this.peek().type === type;
    }
    advance() {
        if (!this.isAtEnd())
            this.currentTokenIndex++;
        return this.previous();
    }
    isAtEnd() {
        return this.peek().type === Token_1.TokenType.EOF;
    }
    peek() {
        return this.tokens[this.currentTokenIndex];
    }
    previous() {
        return this.tokens[this.currentTokenIndex - 1];
    }
    getSpecialComments() {
        return this.specialComments;
    }
}
exports.Parser = Parser;
