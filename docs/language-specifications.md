# Column Language Specification v1.0

## 1. Introduction

Column is a human-readable configuration language designed for simplicity, readability, and ease of use. It aims to provide a balance between the simplicity of INI files and the expressiveness of YAML or JSON. Column is particularly well-suited for configuration files, data exchange, and storing structured data in a format that's easy for both humans to read and machines to parse.

Key features:
- Hierarchical structure using indentation
- Support for various data types including strings, numbers, booleans, null, lists, and nested objects
- Multiline string support
- Comments and special notices
- Environment variable substitution
- Namespaces for splitting configurations across files
- Sections for multiple configurations within a single file

## 2. File Format

- File Extension: .col
- Encoding: UTF-8
- Line Endings: Supports both Unix (\n) and Windows (\r\n) line endings
- Maximum Line Length: While there's no strict limit, it's recommended to keep lines under 120 characters for readability
- Case Sensitivity: Keys and values are case-sensitive
- Whitespace: Significant for indentation, ignored otherwise except in raw content

## 3. Basic Structure

- Each line typically represents a key-value pair or a structural element
- Indentation is crucial in Column as it defines the structure of nested objects
- Each indentation level consists of exactly 2 spaces
- Tabs are automatically converted to 2 spaces
- Inconsistent indentation (e.g., 3 spaces) is rounded to the nearest valid indentation level

Example:
```column
key1: value1
key2: value2
  nested_key1: nested_value1
  nested_key2: nested_value2
key3: value3
```

## 4. Key-Value Pairs

Keys:
- Should start with a letter, number, underscore, or hyphen
- Can contain alphanumeric characters, underscores, hyphens, and spaces
- Must be enclosed in double quotes if they contain special characters or spaces
- Cannot be empty or consist only of whitespace

Values:
- Can be simple (strings, numbers, booleans, null) or complex (nested objects, lists)
- Simple values are represented on the same line as the key
- Complex values are represented on new lines with increased indentation

Example:
```column
key: value
"key with space": value
"key:with:colons": value
```

## 5. Data Types

### 5.1 Simple Types

- Strings: Unquoted unless they contain special characters or spaces
  Example: `name: John Doe` or `quote: "Hello, world!"`

- Numbers: Integers and floating-point numbers
  Example: `age: 30` or `price: 19.99`

- Booleans: Represented as `true`/`false` or `!!`/`!`
  Example: `is_active: true` or `is_enabled: !!`

- Null: Represented as `null` or `?`
  Example: `spouse: null` or `partner: ?`

- Dates: Represented as strings in ISO 8601 format
  Example: `date: 2023-05-20`

- Times: Represented as strings in 24-hour format
  Example: `time: 14:30:00`

- Durations: Represented as strings
  Example: `duration: 2h30m`

### 5.2 Complex Types

#### Nested Objects
```column
person:
  name: John Doe
  age: 30
  address:
    street: 123 Main St
    city: Anytown
```

#### Lists
```column
fruits:
  - apple
  - banana
  - orange
```

### 5.3 Optional Type Annotations

Type annotations are used for additional type checking and are enclosed
in curly braces before the value:

```column
date: {DATE} 2023-01-01
name: {STRING} John Doe
age: {INT} 30
price: {FLOAT} 19.99
items: {ARRAY}
  - item1
  - item2
settings: {OBJECT}
  key1: value1
  key2: value2
```

Supported type annotations: STRING, NUMBER, BOOL, NULL, DATE, TIME, DATETIME,
DURATION, INT, FLOAT, ARRAY, OBJECT

Type checking is implemented as a warning system rather than strict enforcement.
When a value doesn't match its type annotation, the interpreter issues a warning
but continues processing.

## 6. Multiline Strings

### 6.1 Preserved Newlines (|)
Preserves all whitespace, including line breaks.

```column
description: |
  This is a multi-line description
  that preserves line breaks
    and indentation.
```

### 6.2 Folded Newlines (<)
Folds newlines into spaces, trims leading and trailing whitespace on each line.

```column
note: <
  This is a long note
  that will be folded
  into a single line.
```

### 6.3 Preserved Newlines and Indentation (|+)
Preserves newlines and indentation relative to the first line.

```column
code: |+
  function example() {
    console.log("Hello, world!");
  }
```

### 6.4 Raw Content (`)
Preserves all characters and special characters, including whitespace and indentation.

```column
regex: `\d+\.\d+`

raw_content: `
  This is raw content
    that preserves all characters
  and special characters.
`
```

## 7. Comments

Comments cannot be placed within multiline strings or raw content.

### 7.1 Regular Comments
Start with '//' and continue until the end of the line.

```column
// This is a regular comment
key: value // This is an inline comment
```

### 7.2 TODO Comments
Start with '/=>' and continue until the end of the line.

```column
/=> TODO: Implement this feature
```
Represents a TODO or important message. They are displayed in the console (blue color) and can be used for tracking tasks or reminders.

### 7.3 Notices (Copyright/License/Version)
Start with '/!' and must be placed at the top of the file.

```column
/! Copyright 2023 Example Corp.
/! License: MIT
```

## 8. Environment Variables

Environment variables are denoted by '$_' prefix and can have default values.

```column
api_key: $_API_KEY || default_value
```

Resolution:
1. If the environment variable is set, its value is used
2. If not set and a default value is provided, the default value is used
3. If not set and no default value, an empty string is used and a warning is logged

## 9. Namespaces and Sections

A file can use either namespaces or sections, but not both.

### 9.1 Namespace Declaration
Used to split configuration across multiple files.

```column
@- common
shared_key: shared_value
```

- Multiple files can share the same namespace
- Files with the same namespace are merged during interpretation
- Must be at the top of the file, after any notices or comments

### 9.2 Section Declaration
Used to define multiple configurations within a single file.

```column
@/ development
env: development
debug: true

@/ production
env: production
debug: false
```

- Each section results in a separate output file
- Must be at the top of their respective parts in the file

## 10. Escaping Special Characters

Use '\' to escape special characters:

```column
key\:with\:colons: value
```

## 11. File Organization and Resolution

- Namespace files: `<name>.col`
- Section files: `<name>.col` (contains multiple sections)
- Environment-specific files: `<name>.<env>.col` (e.g., `config.dev.col`, `config.prod.col`)
- Base configuration file: `<name>.col` (no specific environment extension)

File resolution:
1. Search current directory
2. Search child directories
3. Search directory of the main configuration file

For conflicts between environment-specific files, a simple override rule is used:
values in more specific environment files override those in less specific ones.
The base configuration file (`<name>.col`) is overridden by environment-specific files.

Merging rules:
- Simple types: Later values override earlier ones
- Objects: Merged recursively, with later values overriding earlier ones
- Lists: Replaced entirely by the later list

## 12. Output Generation

- Default output format: JSON
- Other supported formats: YAML, XML
- Namespace files: Merged into a single output
- Section files: Generate multiple outputs, one per section

Circular references are not allowed in Column configurations. If a circular
reference is detected, the interpreter raises an error.

## 13. Environment-Specific Configurations

Use file extensions to denote environment-specific configs: `<name>.<env>.col`
The appropriate file is selected based on the current environment setting.

## 14. Validation

- Missing namespaces are reported
- Invalid references or syntax errors result in clear error messages
- Type annotation violations are reported as warnings but do not stop parsing

## 15. Structural Rules

- Use either namespace declarations or section declarations, not both
- Notices must be at the start of the file
- Indentation defines nested structures
- Lists are denoted by '-' followed by a space


## 20. Versioning

The Column language version can be specified in the notice section at the top of the file:

```column
/! Column-Version: 1.0
/! Copyright 2023 Example Corp.
/! License: MIT
```

This version information helps in maintaining compatibility and understanding the
features available in a particular Column file. It is not required but can be
useful for documentation purposes or conflict resolution.

## 16. Error Handling

- Clear error messages for invalid syntax
- Inconsistent indentation is rounded to the nearest valid level
- Unrecognized or invalid constructs result in parsing errors

Standardized error reporting format:
```
[ERROR/WARNING] <File>:<Line>:<Column> - <Message>
```
Errors are displayed in red, warnings in yellow.

## 18. Limitations

- No support for inline lists or nested inline structures
- No built-in date or duration types (use strings and type annotations)
- No support for including other Column files
- No built-in templating or variable substitution (except environment variables)
- No schema validation support within the language itself

## 17. Best Practices

- Use meaningful and descriptive keys
- Maintain consistent indentation
- Use comments to explain complex configurations
- Avoid mixing tabs and spaces for indentation
- Use type annotations for additional type checking
- Keep key and value lengths reasonable to avoid potential performance issues

## 19. Implementation Considerations

- Lexer: Handle token generation based on defined token types
- Parser: Construct hierarchical representation of the configuration
- Interpreter: Handle type annotations, environment variable substitution, and output to various formats
