import { parseString, parseFile } from "../src";

// Sample Column content
const columnContent = `/! Copyright 2023 Example Corp.
/! License: MIT

@- common

// Basic configuration example
name: "My Project"
version: 1.0
settings:
  debug: true
  environment: development
  database:
    host: $_DB_HOST || localhost
    port: 5432
    credentials:
      username: admin
      password: 

dependencies:
  - name: typescript
    version: ^5.0.0
  - name: jest
    version: ^29.0.0

description: |
  This is a multiline description
  that preserves line breaks
    and indentation.

/=> TODO: Add more settings
`;

// Parse from string
console.log("Parsing from string...");
const result = parseString(columnContent, {
  format: "json",
  pretty: true,
  includeMeta: true,
  env: {
    DB_HOST: "db.example.com",
  },
});

console.log("Result:", result.output);
console.log("Metadata:", result.meta);

// You can also parse from file
// console.log('Parsing from file...');
// const fileResult = parseFile('path/to/your/file.col', {
//   format: 'yaml',
//   pretty: true
// });
//
// console.log('File result:', fileResult.output);
