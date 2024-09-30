"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LexerError = void 0;
class LexerError extends Error {
    constructor(message, line, column) {
        super(`Line ${line}, Column ${column}: ${message}`);
        this.line = line;
        this.column = column;
        this.name = 'LexerError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
    toString() {
        return `${this.name}: ${this.message}`;
    }
    getStackTrace() {
        return this.stack || '';
    }
}
exports.LexerError = LexerError;
