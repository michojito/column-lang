# Column Language

Column is a human-readable configuration language designed for simplicity, readability, and ease of use. It aims to provide a balance between the simplicity of INI files and the expressiveness of YAML or JSON.

## Features

- Hierarchical structure using indentation
- Support for various data types (strings, numbers, booleans, null, lists, and nested objects)
- Multiline string support
- Comments and special notices
- Environment variable substitution
- Namespaces for splitting configurations across files
- Sections for multiple configurations within a single file
- Multiple output formats (JSON, YAML, XML)

## Installation

```bash
npm install column-lang
```

## Usage

### Basic Example

```typescript
import { parseString, parseFile } from "column-lang";

// Parse from string
const columnContent = `
name: "My Project"
version: 1.0
settings:
  debug: true
  database:
    host: $_DB_HOST || localhost
    port: 5432
`;

const result = parseString(columnContent, {
  format: "json",
  pretty: true,
  env: {
    DB_HOST: "db.example.com",
  },
});

console.log(result.output);
// {
//   "name": "My Project",
//   "version": 1,
//   "settings": {
//     "debug": true,
//     "database": {
//       "host": "db.example.com",
//       "port": 5432
//     }
//   }
// }

// Parse from file
const fileResult = parseFile("config.col", {
  format: "yaml",
  pretty: true,
});

console.log(fileResult.output);
```

### API Reference

#### `parseString(content: string, options?: ParseOptions): ParseResult`

Parses a Column string.

- `content`: The Column string to parse
- `options`: Parse options (optional)
  - `format`: Output format ('json', 'yaml', or 'xml')
  - `pretty`: Whether to pretty-print the output (default: true)
  - `indent`: Number of spaces for indentation (default: 2)
  - `includeMeta`: Whether to include metadata in the output (default: false)
  - `env`: Environment variables to use for substitution

#### `parseFile(filePath: string, options?: ParseOptions): ParseResult`

Parses a Column file.

- `filePath`: The path to the Column file
- `options`: Same as for `parseString`

## Column Language Syntax

### Key-Value Pairs

```column
key: value
```

### Nested Objects

```column
person:
  name: John Doe
  age: 30
  address:
    street: 123 Main St
    city: Anytown
```

### Lists

```column
fruits:
  - apple
  - banana
  - orange
```

### Multiline Strings

Preserve newlines using `|`:

```column
description: |
  This is a multi-line description
  that preserves line breaks
    and indentation.
```

Fold newlines using `<`:

```column
note: <
  This is a long note
  that will be folded
  into a single line.
```

### Comments

```column
// This is a regular comment
key: value // This is an inline comment

/=> TODO: This is a TODO comment

/! Copyright 2023 Example Corp.
/! License: MIT
```

### Environment Variables

```column
api_key: $_API_KEY || default_value
```

### Namespaces

```column
@- common
shared_key: shared_value
```

### Sections

```column
@/ development
env: development
debug: true

@/ production
env: production
debug: false
```

## License

MIT
