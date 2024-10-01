export interface ASTNode {
  type: string;
}

export interface KeyValuePair extends ASTNode {
  type: 'KeyValuePair';
  key: string;
  value: string | ObjectNode;
}

export interface ObjectNode extends ASTNode {
  type: 'Object';
  properties: KeyValuePair[];
}

export type RootNode = ObjectNode;
