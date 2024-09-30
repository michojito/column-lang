"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserError = void 0;
class ParserError extends Error {
    constructor(message, line, column) {
        super(`Line ${line}, Column ${column}: ${message}`);
        this.line = line;
        this.column = column;
        this.name = 'ParserError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
    toString() {
        return `${this.name}: ${this.message}`;
    }
    getStackTrace() {
        return this.stack || '';
    }
}
exports.ParserError = ParserError;
