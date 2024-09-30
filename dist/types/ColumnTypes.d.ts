export type ColumnValue = string | number | boolean | null | ColumnObject | ColumnArray;
export interface ColumnObject {
    [key: string]: ColumnValue;
}
export type ColumnArray = ColumnValue[];
export interface SpecialComment {
    type: 'copyright' | 'license' | 'author';
    content: string;
}
export type SpecialComments = SpecialComment[];
export interface ParsedColumn {
    specialComments: SpecialComments;
    content: ColumnObject;
}
