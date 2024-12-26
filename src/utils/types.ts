export enum DataType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOL',
  NULL = 'NULL',
  DATE = 'DATE',
  TIME = 'TIME',
  DATETIME = 'DATETIME',
  DURATION = 'DURATION',
  INT = 'INT',
  FLOAT = 'FLOAT',
  ARRAY = 'ARRAY',
  OBJECT = 'OBJECT'
}

export interface TypeAnnotation {
  type: DataType;
  value: string;
}