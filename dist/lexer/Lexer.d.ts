import { Token } from './Token';
export declare class Lexer {
    private input;
    private tokens;
    private currentLine;
    private currentColumn;
    private indentStack;
    constructor(input: string);
    tokenize(): Token[];
    private tokenizeLine;
    private handleIndentation;
    private tokenizeValue;
    private addToken;
}
