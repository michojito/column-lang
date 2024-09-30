import { ColumnObject } from '../types/ColumnTypes';
export declare class Interpreter {
    private data;
    constructor(parsedData: ColumnObject);
    toJSON(): string;
    toYAML(): string;
    toXML(): string;
}
