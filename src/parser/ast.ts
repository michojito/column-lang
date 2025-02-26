import { TokenPosition } from "../tokenizer/token";

/**
 * Base interface for all AST nodes
 */
export interface ASTNode {
  type: string;
  position: TokenPosition;
}

/**
 * Represents a document in the Column language
 */
export interface DocumentNode extends ASTNode {
  type: "Document";
  notices: NoticeNode[];
  namespace?: NamespaceDeclarationNode;
  sections: SectionDeclarationNode[];
  children: ASTNode[];
}

/**
 * Represents a key-value pair
 */
export interface KeyValueNode extends ASTNode {
  type: "KeyValue";
  key: string;
  value: ValueNode | null;
  children?: ASTNode[]; // For nested key-values
}

/**
 * Base interface for value nodes
 */
export interface ValueNode extends ASTNode {
  type: "Value";
  valueType:
    | "string"
    | "number"
    | "boolean"
    | "null"
    | "date"
    | "time"
    | "complex";
  value: any;
}

/**
 * Represents a list (array)
 */
export interface ListNode extends ASTNode {
  type: "List";
  items: ASTNode[];
}

/**
 * Represents a list item
 */
export interface ListItemNode extends ASTNode {
  type: "ListItem";
  value: ValueNode | KeyValueNode;
}

/**
 * Represents a multiline string
 */
export interface MultilineStringNode extends ASTNode {
  type: "MultilineString";
  format: "|" | "<" | "|+" | "`"; // | = preserve newlines, < = fold newlines, |+ = preserve with indentation, ` = raw
  content: string;
}

/**
 * Represents a comment
 */
export interface CommentNode extends ASTNode {
  type: "Comment";
  content: string;
}

/**
 * Represents a TODO comment
 */
export interface TodoCommentNode extends ASTNode {
  type: "TodoComment";
  content: string;
}

/**
 * Represents a notice comment (copyright/license)
 */
export interface NoticeNode extends ASTNode {
  type: "Notice";
  content: string;
}

/**
 * Represents a namespace declaration
 */
export interface NamespaceDeclarationNode extends ASTNode {
  type: "NamespaceDeclaration";
  name: string;
}

/**
 * Represents a section declaration
 */
export interface SectionDeclarationNode extends ASTNode {
  type: "SectionDeclaration";
  name: string;
  children: ASTNode[];
}

/**
 * Represents an environment variable reference
 */
export interface EnvVarNode extends ASTNode {
  type: "EnvVar";
  name: string;
  defaultValue?: string;
}

/**
 * Represents raw content (enclosed in backticks)
 */
export interface RawContentNode extends ASTNode {
  type: "RawContent";
  content: string;
}

/**
 * Type annotation for values
 */
export interface TypeAnnotationNode extends ASTNode {
  type: "TypeAnnotation";
  annotationType: string; // STRING, NUMBER, BOOL, etc.
  value: ValueNode;
}

/**
 * Creates a document node
 */
export function createDocument(
  position: TokenPosition,
  children: ASTNode[] = [],
  notices: NoticeNode[] = [],
  namespace?: NamespaceDeclarationNode,
  sections: SectionDeclarationNode[] = []
): DocumentNode {
  return {
    type: "Document",
    position,
    children,
    notices,
    namespace,
    sections,
  };
}

/**
 * Creates a key-value node
 */
export function createKeyValue(
  position: TokenPosition,
  key: string,
  value: ValueNode | null,
  children?: ASTNode[]
): KeyValueNode {
  return {
    type: "KeyValue",
    position,
    key,
    value,
    children,
  };
}

/**
 * Creates a value node
 */
export function createValue(
  position: TokenPosition,
  value: any,
  valueType:
    | "string"
    | "number"
    | "boolean"
    | "null"
    | "date"
    | "time"
    | "complex" = "string"
): ValueNode {
  return {
    type: "Value",
    position,
    value,
    valueType,
  };
}

/**
 * Creates a list node
 */
export function createList(
  position: TokenPosition,
  items: ASTNode[] = []
): ListNode {
  return {
    type: "List",
    position,
    items,
  };
}

/**
 * Creates a list item node
 */
export function createListItem(
  position: TokenPosition,
  value: ValueNode | KeyValueNode
): ListItemNode {
  return {
    type: "ListItem",
    position,
    value,
  };
}

/**
 * Creates a multiline string node
 */
export function createMultilineString(
  position: TokenPosition,
  content: string,
  format: "|" | "<" | "|+" | "`" = "|"
): MultilineStringNode {
  return {
    type: "MultilineString",
    position,
    content,
    format,
  };
}

/**
 * Creates a comment node
 */
export function createComment(
  position: TokenPosition,
  content: string
): CommentNode {
  return {
    type: "Comment",
    position,
    content,
  };
}

/**
 * Creates a TODO comment node
 */
export function createTodoComment(
  position: TokenPosition,
  content: string
): TodoCommentNode {
  return {
    type: "TodoComment",
    position,
    content,
  };
}

/**
 * Creates a notice node
 */
export function createNotice(
  position: TokenPosition,
  content: string
): NoticeNode {
  return {
    type: "Notice",
    position,
    content,
  };
}

/**
 * Creates a namespace declaration node
 */
export function createNamespaceDeclaration(
  position: TokenPosition,
  name: string
): NamespaceDeclarationNode {
  return {
    type: "NamespaceDeclaration",
    position,
    name,
  };
}

/**
 * Creates a section declaration node
 */
export function createSectionDeclaration(
  position: TokenPosition,
  name: string,
  children: ASTNode[] = []
): SectionDeclarationNode {
  return {
    type: "SectionDeclaration",
    position,
    name,
    children,
  };
}

/**
 * Creates an environment variable reference node
 */
export function createEnvVar(
  position: TokenPosition,
  name: string,
  defaultValue?: string
): EnvVarNode {
  return {
    type: "EnvVar",
    position,
    name,
    defaultValue,
  };
}

/**
 * Creates a raw content node
 */
export function createRawContent(
  position: TokenPosition,
  content: string
): RawContentNode {
  return {
    type: "RawContent",
    position,
    content,
  };
}

/**
 * Creates a type annotation node
 */
export function createTypeAnnotation(
  position: TokenPosition,
  annotationType: string,
  value: ValueNode
): TypeAnnotationNode {
  return {
    type: "TypeAnnotation",
    position,
    annotationType,
    value,
  };
}
