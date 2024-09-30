import { Token } from '../lexer/Token';
import { ColumnObject } from '../types/ColumnTypes';
export declare class Parser {
    private tokens;
    private currentTokenIndex;
    private specialComments;
    constructor(tokens: Token[]);
    parse(): ColumnObject;
    private parseSpecialComments;
    private parseObject;
    private parseValue;
    private parseSimpleValue;
    private parseNestedObject;
    private parseList;
    private parseMultilineString;
    private parseValueString;
    private consume;
    private check;
    private advance;
    private isAtEnd;
    private peek;
    private previous;
    getSpecialComments(): string[];
}
