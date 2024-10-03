/**
 * Represents a node in the Abstract Syntax Tree (AST).
 */
export interface ASTNode {
  type: string;
}

/**
 * Represents a key-value pair in the AST.
 */
export interface KeyValuePair extends ASTNode {
  type: 'KeyValuePair';
  key: string;
  value: string | ObjectNode;
}

/**
 * Represents an object node in the AST.
 */
export interface ObjectNode extends ASTNode {
  type: 'Object';
  properties: KeyValuePair[];
}

/**
 * Represents the root node of the AST.
 */
export type RootNode = ObjectNode;
