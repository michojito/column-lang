export declare class LexerError extends Error {
    line: number;
    column: number;
    constructor(message: string, line: number, column: number);
    toString(): string;
    getStackTrace(): string;
}
