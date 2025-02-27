import { Parser } from "../src/parser/parser";
import { Tokenizer } from "../src/tokenizer/tokenizer";
import { Lexer } from "../src/lexer/Lexer";
import {
  ASTNode,
  DocumentNode,
  KeyValueNode,
  ValueNode,
  MultilineStringNode,
} from "../src/parser/ast";

describe("Parser", () => {
  function parseContent(content: string): DocumentNode {
    const lexer = new Lexer(content);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    return parser.parse();
  }

  it("should parse basic key-value pairs", () => {
    const content = `
name: "My Project"
version: 1.0
is_active: true
description: Simple project
`;

    const ast = parseContent(content);

    // Check document structure
    expect(ast.type).toBe("Document");
    expect(ast.children.length).toBe(4);

    // Check individual key-value pairs
    const keyValues = ast.children.filter(
      (node) => node.type === "KeyValue"
    ) as KeyValueNode[];

    // Name should be a string
    const nameNode = keyValues.find((kv) => kv.key === "name");
    expect(nameNode).toBeDefined();
    expect(nameNode!.value).toBeDefined();
    expect(nameNode!.value!.valueType).toBe("string");
    expect(nameNode!.value!.value).toBe("My Project");

    // Version should be a number
    const versionNode = keyValues.find((kv) => kv.key === "version");
    expect(versionNode).toBeDefined();
    expect(versionNode!.value).toBeDefined();
    expect(versionNode!.value!.valueType).toBe("number");
    expect(versionNode!.value!.value).toBe(1.0);

    // is_active should be a boolean
    const isActiveNode = keyValues.find((kv) => kv.key === "is_active");
    expect(isActiveNode).toBeDefined();
    expect(isActiveNode!.value).toBeDefined();
    expect(isActiveNode!.value!.valueType).toBe("boolean");
    expect(isActiveNode!.value!.value).toBe(true);

    // description should be a string
    const descNode = keyValues.find((kv) => kv.key === "description");
    expect(descNode).toBeDefined();
    expect(descNode!.value).toBeDefined();
    expect(descNode!.value!.valueType).toBe("string");
    expect(descNode!.value!.value).toBe("Simple project");
  });

  it("should parse nested structures", () => {
    const content = `
project:
  name: "Nested Example"
  settings:
    debug: true
    timeout: 30
    database:
      host: localhost
      port: 5432
`;

    const ast = parseContent(content);

    // Check top-level structure
    expect(ast.type).toBe("Document");
    expect(ast.children.length).toBe(1);

    // Get the top-level key-value pair
    const projectNode = ast.children[0] as KeyValueNode;
    expect(projectNode.type).toBe("KeyValue");
    expect(projectNode.key).toBe("project");
    expect(projectNode.children).toBeDefined();
    expect(projectNode.children!.length).toBe(2);

    // Check first-level nesting
    const projectChildren = projectNode.children!;
    const nameNode = projectChildren.find(
      (node) =>
        node.type === "KeyValue" && (node as KeyValueNode).key === "name"
    ) as KeyValueNode;
    const settingsNode = projectChildren.find(
      (node) =>
        node.type === "KeyValue" && (node as KeyValueNode).key === "settings"
    ) as KeyValueNode;

    expect(nameNode).toBeDefined();
    expect(nameNode.value!.value).toBe("Nested Example");

    expect(settingsNode).toBeDefined();
    expect(settingsNode.children).toBeDefined();
    expect(settingsNode.children!.length).toBe(3);

    // Check second-level nesting
    const settingsChildren = settingsNode.children!;
    const debugNode = settingsChildren.find(
      (node) =>
        node.type === "KeyValue" && (node as KeyValueNode).key === "debug"
    ) as KeyValueNode;
    const databaseNode = settingsChildren.find(
      (node) =>
        node.type === "KeyValue" && (node as KeyValueNode).key === "database"
    ) as KeyValueNode;

    expect(debugNode).toBeDefined();
    expect(debugNode.value!.value).toBe(true);

    expect(databaseNode).toBeDefined();
    expect(databaseNode.children).toBeDefined();
    expect(databaseNode.children!.length).toBe(2);

    // Check third-level nesting
    const databaseChildren = databaseNode.children!;
    const hostNode = databaseChildren.find(
      (node) =>
        node.type === "KeyValue" && (node as KeyValueNode).key === "host"
    ) as KeyValueNode;

    expect(hostNode).toBeDefined();
    expect(hostNode.value!.value).toBe("localhost");
  });

  it("should parse lists", () => {
    const content = `
fruits:
  - apple
  - banana
  - orange
`;

    const ast = parseContent(content);

    // Check document structure
    expect(ast.type).toBe("Document");
    expect(ast.children.length).toBe(1);

    // Check fruits node
    const fruitsNode = ast.children[0] as KeyValueNode;
    expect(fruitsNode.type).toBe("KeyValue");
    expect(fruitsNode.key).toBe("fruits");
    expect(fruitsNode.children).toBeDefined();
    expect(fruitsNode.children!.length).toBe(3);

    // Check list items
    const listItems = fruitsNode.children!;
    expect(listItems[0].type).toBe("ListItem");
    expect(listItems[1].type).toBe("ListItem");
    expect(listItems[2].type).toBe("ListItem");

    // Check values of list items
    const fruitValues = listItems.map((item) => {
      const listItem = item as any; // Simplify for test
      return listItem.value.value;
    });

    expect(fruitValues).toContain("apple");
    expect(fruitValues).toContain("banana");
    expect(fruitValues).toContain("orange");
  });

  it("should parse multiline strings", () => {
    const content = `
description: |
  This is a multiline description
  that preserves line breaks
    and indentation.
`;

    const ast = parseContent(content);

    // Check document structure
    expect(ast.type).toBe("Document");
    expect(ast.children.length).toBe(1);

    // Check description node
    const descNode = ast.children[0] as KeyValueNode;
    expect(descNode.type).toBe("KeyValue");
    expect(descNode.key).toBe("description");
    expect(descNode.value).toBeDefined();
    expect(descNode.value!.valueType).toBe("complex");

    // Check multiline string
    const multiline = descNode.value!.value as MultilineStringNode;
    expect(multiline.type).toBe("MultilineString");
    expect(multiline.format).toBe("|");
    expect(multiline.content).toContain("This is a multiline description");
    expect(multiline.content).toContain("that preserves line breaks");
    expect(multiline.content).toContain("  and indentation.");
  });

  it("should parse comments and notices", () => {
    const content = `
/! Copyright 2023 Example Corp.
// This is a comment
key: value // This is an inline comment
/=> TODO: Implement this feature
`;

    const ast = parseContent(content);

    // Check notices
    expect(ast.notices.length).toBe(1);
    expect(ast.notices[0].content).toContain("Copyright 2023");

    // Other comments should be included in children
    const comments = ast.children.filter(
      (node) => node.type === "Comment" || node.type === "TodoComment"
    );

    expect(comments.length).toBeGreaterThanOrEqual(1);
    expect(
      comments.some((comment) =>
        (comment as any).content.includes("This is a comment")
      )
    ).toBe(true);

    // Check TODO comment
    const todoComments = ast.children.filter(
      (node) => node.type === "TodoComment"
    );
    expect(todoComments.length).toBe(1);
    expect((todoComments[0] as any).content).toContain(
      "Implement this feature"
    );

    // Check key-value pair
    const keyValueNodes = ast.children.filter(
      (node) => node.type === "KeyValue"
    );
    expect(keyValueNodes.length).toBe(1);
    expect((keyValueNodes[0] as KeyValueNode).key).toBe("key");
    expect((keyValueNodes[0] as KeyValueNode).value!.value).toBe("value");
  });

  it("should parse namespace and section declarations", () => {
    const content = `
@- common
shared_key: shared_value

@/ development
env: development
debug: true
`;

    const ast = parseContent(content);

    // Check namespace
    expect(ast.namespace).toBeDefined();
    expect(ast.namespace!.name).toBe("common");

    // Check for shared_key in children
    const sharedKeyNode = ast.children.find(
      (node) =>
        node.type === "KeyValue" && (node as KeyValueNode).key === "shared_key"
    ) as KeyValueNode;

    expect(sharedKeyNode).toBeDefined();
    expect(sharedKeyNode.value!.value).toBe("shared_value");

    // Check section
    expect(ast.sections.length).toBe(1);
    expect(ast.sections[0].name).toBe("development");

    // Check section children
    const sectionChildren = ast.sections[0].children;
    const envNode = sectionChildren.find(
      (node) => node.type === "KeyValue" && (node as KeyValueNode).key === "env"
    ) as KeyValueNode;
    const debugNode = sectionChildren.find(
      (node) =>
        node.type === "KeyValue" && (node as KeyValueNode).key === "debug"
    ) as KeyValueNode;

    expect(envNode).toBeDefined();
    expect(envNode.value!.value).toBe("development");

    expect(debugNode).toBeDefined();
    expect(debugNode.value!.value).toBe(true);
  });
});
