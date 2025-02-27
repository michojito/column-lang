import {
  ASTNode,
  DocumentNode,
  KeyValueNode,
  ValueNode,
  ListNode,
  ListItemNode,
  MultilineStringNode,
  CommentNode,
  TodoCommentNode,
  NoticeNode,
  NamespaceDeclarationNode,
  SectionDeclarationNode,
  EnvVarNode,
  RawContentNode,
} from "../parser/ast";
import { InterpretationError } from "../utils/errors";

/**
 * Interface for interpretation options.
 */
export interface InterpretOptions {
  env?: Record<string, string | undefined>;
  includeMeta?: boolean;
}

/**
 * Interface for interpretation result.
 */
export interface InterpretResult {
  data: any;
  meta?: {
    notices: string[];
    namespace?: string;
    todos?: string[];
  };
}

/**
 * Responsible for interpreting the AST and converting it to a JavaScript object.
 */
export class Interpreter {
  private options: InterpretOptions;

  /**
   * Creates a new Interpreter.
   * @param options - Interpretation options
   */
  constructor(options: InterpretOptions = {}) {
    this.options = {
      env: process.env,
      includeMeta: false,
      ...options,
    };
  }

  /**
   * Interprets an AST and returns the resulting data structure.
   * @param ast - The AST to interpret
   * @returns The interpreted data structure
   */
  public interpret(ast: DocumentNode): InterpretResult {
    const data = this.interpretNode(ast);
    const result: InterpretResult = { data };

    // Include metadata if requested
    if (this.options.includeMeta) {
      result.meta = {
        notices: ast.notices.map((notice) => notice.content),
      };

      if (ast.namespace) {
        result.meta.namespace = ast.namespace.name;
      }

      // Extract TODO comments
      const todos: string[] = [];
      this.collectTodos(ast, todos);
      if (todos.length > 0) {
        result.meta.todos = todos;
      }
    }

    return result;
  }

  /**
   * Interprets a single node in the AST.
   * @param node - The node to interpret
   * @returns The interpreted value
   */
  private interpretNode(node: ASTNode): any {
    switch (node.type) {
      case "Document":
        return this.interpretDocument(node as DocumentNode);

      case "KeyValue":
        return this.interpretKeyValue(node as KeyValueNode);

      case "Value":
        return this.interpretValue(node as ValueNode);

      case "List":
        return this.interpretList(node as ListNode);

      case "ListItem":
        return this.interpretListItem(node as ListItemNode);

      case "MultilineString":
        return this.interpretMultilineString(node as MultilineStringNode);

      case "EnvVar":
        return this.interpretEnvVar(node as EnvVarNode);

      case "RawContent":
        return this.interpretRawContent(node as RawContentNode);

      case "SectionDeclaration":
        return this.interpretSectionDeclaration(node as SectionDeclarationNode);

      default:
        throw new InterpretationError(
          `Unsupported node type: ${node.type}`,
          node.position
        );
    }
  }

  /**
   * Interprets a document node.
   * @param node - The document node to interpret
   * @returns The interpreted document
   */
  private interpretDocument(node: DocumentNode): any {
    // If we have sections, each section becomes a separate object
    if (node.sections.length > 0) {
      const result: Record<string, any> = {};

      for (const section of node.sections) {
        result[section.name] = this.interpretSectionDeclaration(section);
      }

      return result;
    }

    // Otherwise, we interpret the document's children
    const result: Record<string, any> = {};

    for (const child of node.children) {
      if (child.type === "KeyValue") {
        const { key, value } = this.interpretKeyValue(child as KeyValueNode);
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Interprets a key-value node.
   * @param node - The key-value node to interpret
   * @returns The interpreted key-value pair
   */
  private interpretKeyValue(node: KeyValueNode): { key: string; value: any } {
    const key = node.key;
    let value: any = null;

    if (node.value) {
      value = this.interpretValue(node.value);
    }

    // Handle nested structure
    if (node.children && node.children.length > 0) {
      // If we have a value but also children, the value is ignored in favor of the nested structure
      const nestedValue: Record<string, any> = {};

      for (const child of node.children) {
        if (child.type === "KeyValue") {
          const { key: childKey, value: childValue } = this.interpretKeyValue(
            child as KeyValueNode
          );
          nestedValue[childKey] = childValue;
        } else if (child.type === "ListItem") {
          // If the first child is a list item, this is actually a list
          if (!Array.isArray(value)) {
            value = [];
          }
          value.push(this.interpretListItem(child as ListItemNode));
        }
      }

      // If we have a nested structure, use it as the value
      if (Object.keys(nestedValue).length > 0) {
        value = nestedValue;
      }
    }

    return { key, value };
  }

  /**
   * Interprets a value node.
   * @param node - The value node to interpret
   * @returns The interpreted value
   */
  private interpretValue(node: ValueNode): any {
    // Handle complex types
    if (node.valueType === "complex") {
      if (typeof node.value === "object" && node.value !== null) {
        if (node.value.type === "MultilineString") {
          return this.interpretMultilineString(
            node.value as MultilineStringNode
          );
        } else if (node.value.type === "EnvVar") {
          return this.interpretEnvVar(node.value as EnvVarNode);
        } else if (node.value.type === "RawContent") {
          return this.interpretRawContent(node.value as RawContentNode);
        }
      }
    }

    // Simple types
    return node.value;
  }

  /**
   * Interprets a list node.
   * @param node - The list node to interpret
   * @returns The interpreted list
   */
  private interpretList(node: ListNode): any[] {
    return node.items.map((item) => this.interpretNode(item));
  }

  /**
   * Interprets a list item node.
   * @param node - The list item node to interpret
   * @returns The interpreted list item
   */
  private interpretListItem(node: ListItemNode): any {
    return this.interpretNode(node.value);
  }

  /**
   * Interprets a multiline string node.
   * @param node - The multiline string node to interpret
   * @returns The interpreted multiline string
   */
  private interpretMultilineString(node: MultilineStringNode): string {
    switch (node.format) {
      case "|": // Preserve newlines
        return node.content;

      case "<": // Fold newlines
        return node.content.replace(/\n\s*/g, " ").trim();

      case "|+": // Preserve newlines and indentation
        // This preserves relative indentation but removes the common leading whitespace
        const lines = node.content.split("\n");

        // Find the minimum indentation
        let minIndent = Infinity;
        for (const line of lines) {
          if (line.trim().length === 0) continue; // Skip empty lines
          const indent = line.match(/^(\s*)/)?.[1].length || 0;
          minIndent = Math.min(minIndent, indent);
        }

        // Remove the common indentation
        if (minIndent < Infinity) {
          return lines
            .map((line) => {
              if (line.trim().length === 0) return line;
              return line.substring(minIndent);
            })
            .join("\n");
        }

        return node.content;

      case "`": // Raw content
        return node.content;

      default:
        return node.content;
    }
  }

  /**
   * Interprets an environment variable reference.
   * @param node - The environment variable node to interpret
   * @returns The interpreted environment variable value
   */
  private interpretEnvVar(node: EnvVarNode): string {
    const envValue = this.options.env?.[node.name];

    if (envValue !== undefined) {
      return envValue;
    }

    if (node.defaultValue !== undefined) {
      return node.defaultValue;
    }

    // Empty string if no value and no default
    return "";
  }

  /**
   * Interprets a raw content node.
   * @param node - The raw content node to interpret
   * @returns The raw content
   */
  private interpretRawContent(node: RawContentNode): string {
    return node.content;
  }

  /**
   * Interprets a section declaration node.
   * @param node - The section declaration node to interpret
   * @returns The interpreted section
   */
  private interpretSectionDeclaration(node: SectionDeclarationNode): any {
    const result: Record<string, any> = {};

    for (const child of node.children) {
      if (child.type === "KeyValue") {
        const { key, value } = this.interpretKeyValue(child as KeyValueNode);
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Collects TODO comments from an AST.
   * @param node - The node to collect TODOs from
   * @param todos - Array to collect TODOs into
   */
  private collectTodos(node: ASTNode, todos: string[]): void {
    if (node.type === "TodoComment") {
      todos.push((node as TodoCommentNode).content);
    }

    // Recursively collect TODOs from children
    if (node.type === "Document") {
      const doc = node as DocumentNode;
      for (const child of doc.children) {
        this.collectTodos(child, todos);
      }
      for (const section of doc.sections) {
        this.collectTodos(section, todos);
      }
    } else if (node.type === "SectionDeclaration") {
      const section = node as SectionDeclarationNode;
      for (const child of section.children) {
        this.collectTodos(child, todos);
      }
    } else if (node.type === "KeyValue") {
      const kv = node as KeyValueNode;
      if (kv.children) {
        for (const child of kv.children) {
          this.collectTodos(child, todos);
        }
      }
    }
  }
}
