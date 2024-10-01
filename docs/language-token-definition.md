# Column Language Token Definitions

1. KEY (★★★★★)
   Definition: Represents the name of a property in a key-value pair.
   Format:
   - Can contain alphanumeric characters, underscores, hyphens, and spaces.
   - Can start with underscores or hyphens.
   - If it contains special characters (including colons), it must be enclosed in double quotes.
   Usage:
   - Simple key: `name: John Doe`
   - Key with space: `"first name": John`
   - Key with special characters: `"email@address": john@example.com`
   - Key starting with underscore: `_hidden: value`
   - Key starting with hyphen: `-special: value`
   Considerations:
   - Empty key: `"": value` (not valid)
   - Only whitespace key: `"   ": value` (not valid)
   - Quoted key with no special characters: `"normal_key": value` (valid, quotes are optional)
   - Hyphen with space is treated as a list item, not a key: `- item: value`

2. COLON (★★★★★)
  Definition: Separates a key from its value.
  Format: Always a single colon character (:)/
  Usage: `key: value`
  Considerations:
  - Multiple colons: `key:: value` (invalid)
  - Colon at start of line: `: value` (invalid, requires a key)
  - Colon at end of line: `key:` (valid, implies an empty value)

3. VALUE (★★★★★)
    Definition: Represents the value in a key-value pair.
    Format:
    - Can be a simple value (string, number, boolean, null) or a complex value (nested object, list).
    - Starts after the colon and continues until the end of the line for simple values.
    - Complex values are represented on new lines with increased indentation.
    - Optional type annotation can be used: `{TYPE}`
    Usage:
    - Simple string: `name: John Doe`
    - Number: `age: 30`
    - Boolean:
      - True: `is_active: true` or `is_active: !!`
      - False: `is_active: false` or `is_active: !`
    - Null: `spouse: null` or `spouse: ?`
    - Nested object:
      ```
      person:
        name: John Doe
        age: 30
      ```
    - List:
      ```
      fruits:
        - apple
        - banana
      ```
    - With type annotation: `date: {DATE} 2023-01-01`
    Considerations:
    - Empty value: `key:` or `key: `
    - Value with colon: `time: 12:30` (valid, colon is part of the value)
    - Value with hash: `color: #FF0000` (valid, hash is part of the value)
    - Values starting with special characters: Quotes are recommended, e.g., `special: "@value"`

4. INDENT (★★★★★)
    Definition: Represents an increase in indentation level.
    Format:
    - Always 2 spaces per level.
    - Tabs are converted to spaces (1 tab = 2 spaces).
    - Inconsistent indentation is rounded to the nearest even number of spaces.
    Usage:
    ```
    parent:
      child: value
        grandchild: value
    ```
    Edge cases:
    - Odd number of spaces: Rounded to nearest even number
      ```
      key:
      value  // 1 space, treated as no indent
        value // 3 spaces, treated as 1 indent level
          value // 5 spaces, treated as 2 indent levels
      ```
    - Mixed tabs and spaces: Tabs are converted to spaces (1 tab = 2 spaces)

5. DEDENT (★★★★★)
    Definition: Represents a decrease in indentation level.
    Format: Virtual token, not present in the actual text.
    Usage: Inferred when indentation decreases or returns to a previous level.
    Edge cases:
    - Multiple dedents at once:
      ```
      level1:
        level2:
          level3: value
      back_to_level1: value
      ```
      (Two DEDENT tokens would be generated after `level3: value`)

6. NEWLINE (★★★★★)
    Definition: Represents the end of a line.
    Format: Can be \n (Unix) or \r\n (Windows)
    Usage: Implicit at the end of each line.
    Edge cases:
    - Empty lines: Generate a NEWLINE token
    - Last line of file: May or may not have a final NEWLINE

7. LIST_ITEM (★★★★★)
    Definition: Represents an item in a list.
    Format: Starts with a hyphen (-) followed by a space.
    Usage:
    ```
    fruits:
      - apple
      - banana
    ```
    Edge cases:
    - Empty list item: `- ` (valid, represents an empty string)
    - Nested list:
      ```
      - item1
      - item2:
          - subitem1
          - subitem2
      ```
    - List item with colon: `- key: value` (creates a nested structure)

8. MULTILINE_START (★★★★★)
    Definition: Indicates the start of a multiline string.
    Format: Either '|' (preserve newlines) or '<' (fold newlines)
    Usage:
    ```
    description: |
      This is a multi-line
      description that preserves
      line breaks.
    ```
    Edge cases:
    - No content after marker:
      ```
      description: |
      next_key: value
      ```
    - Marker with trailing spaces: `description: | ` (spaces should be ignored)

9. MULTILINE_STRING (★★★★★)
    Definition: Represents the content of a multiline string.
    Format: All lines following MULTILINE_START until a change in indentation or EOF.
    Usage: (continuation of MULTILINE_START example)
    Edge cases:
    - Empty lines within multiline string: Should be preserved
    - Lines with only whitespace: Should be preserved
    - Indented lines within multiline string: Indentation should be preserved
    - Fold newlines: All lines are joined into a single MULTILINE_STRING and the spaces trimmed

10. MULTILINE_END (★★★★★)
    Definition: Indicates the end of a multiline string.
    Format: Virtual token, not present in the actual text.
    Usage: Inferred when indentation changes or EOF is reached after a multiline string.
    Edge cases:
    - Immediate end:
      ```
      key: |
      next_key: value
      ```
    - End at EOF: No explicit MULTILINE_END token needed

11. NOTICE (★★★★★)
    Definition: Represents a special comment for copyright or license information.
    Format: Starts with '/!' followed by the notice text.
    Usage: `/! Copyright 2023 Example Corp.`
    Edge cases:
    - Multiple notice lines: Each line should start with '/!'
    - Notice placement: Must be at the start of the file. Only comments, namespace, and section declarations can be placed before the notice.
    - Notice duplication: Will be duplicated in every file generated by a section.

12. COMMENT (★★★★★)
    Definition: Represents a regular comment.
    Format: Starts with '//' and continues until the end of the line.
    Usage: `// This is a comment`
    Edge cases:
    - Empty comment: `//` (valid)
    - Comment after value: `key: value // comment` (valid, not part of the value)

13. TODO_COMMENT (★★★★★)
    Definition: Represents a TODO or important message.
    Format: Starts with '/=>' and continues until the end of the line.
    Usage: `/=> TODO: Implement this feature`
    Edge cases:
    - TODO in the middle of a value: Not recognized, treated as part of the value

14. NAMESPACE_DECLARATION (★★★★★)
    Definition: Declares a namespace.
    Format: Starts with '@-' followed by the namespace name.
    Usage: `@- common`
    Edge cases:
    - Empty namespace: `@-` (invalid, should raise an error)
    - Namespace with spaces: `@- my namespace` (valid, but not recommended, it will be slugified)
    - Multiple namespaces: Not allowed in a single file

15. SECTION_DECLARATION (★★★★★)
    Definition: Declares a section.
    Format: Starts with '@/' followed by the section name.
    Usage: `@/ config`
    Edge cases:
    - Empty section: `@/` (invalid, should raise an error)
    - Section with spaces: `@/ my section` (valid, but not recommended, it will be slugified)
    - Nested sections: Not allowed

16. ENV_VAR (★★★★★)
    Definition: Represents an environment variable.
    Format: Starts with '$_' followed by uppercase letters, numbers, or underscores.
    Usage: `api_key: $_API_KEY || default_value`
    Edge cases:
    - Invalid characters: `$_api-key` (invalid, should raise an error)
    - Empty variable: `$_` (invalid, should raise an error)
    - Lowercase letters: `$_api_key` (invalid, should raise an error)
    - Default value: Use `||` to specify a default value (optional)

17. RAW_CONTENT (★★★★★)
    Definition: Represents raw content that should not be parsed.
    Format: Enclosed in backticks (``).
    Usage: ```regex: `\d+\.\d+` ```
    Edge cases:
    - Empty raw content: ``` `` ``` (valid, represents an empty string)
    - Nested backticks: ``` ``nested ` backtick`` ``` (inner backtick treated as content)
    - Multiline raw content:
      ```
      content: `
        This is
        multiline
        raw content
      `
      ```
    - Escaping backticks: ``` `This contains a \` backtick` ```
    - Preserving indentation: Raw content preserves all content, including indentation
    - Should be declared like a multiline (MULTILINE_START -> RAW_CONTENT -> MULTILINE_END)

18. EOF (★★★★★)
    Definition: Represents the end of the file.
    Format: Virtual token, not present in the actual text.
    Usage: Automatically added by the lexer at the end of input.
    Edge cases:
    - Empty file: EOF would be the only token
    - File ending with incomplete construct (e.g., unterminated multiline string):
      Should still generate EOF token, but parser should handle the incomplete construct

Additional Notes:
1. Data Types: Optional type annotations can be used, e.g., `{DATE}`, `{STRING}`. These are not required but will affect the parsing of the value (Type checking).
2. File Extension: .col is used for Column files.
3. Escaping Special Characters: Use `\` to escape special characters, e.g., `key\:with\:colons: value`
