# Column Language

Column is a human-readable configuration language designed for simplicity, readability, and ease of use. It aims to provide a balance between the simplicity of INI files and the expressiveness of YAML or JSON.

## Features

- Hierarchical structure using indentation
- Support for various data types
- Multiline string support
- Comments and special notices
- Environment variable substitution
- Namespaces and sections support
- Multiple output formats (JSON, YAML, XML)

## Installation

```bash
npm install column-lang
```

## Usage

```typescript
import { parse } from 'column-lang';

const config = parse('path/to/config.col');
```

## Documentation

See the `docs` directory for detailed documentation.

## License

MIT
