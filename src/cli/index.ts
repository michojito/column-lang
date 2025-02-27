#!/usr/bin/env node

import { program } from "commander";
import fs from "fs";
import path from "path";
import { parseFile, parseString, ParseOptions } from "../index";
import chalk from "chalk";

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"), "utf-8")
);

// Define the CLI program
program
  .name("column-lang")
  .description("Command-line tool for the Column language")
  .version(packageJson.version);

// Add command to convert a Column file to JSON/YAML/XML
program
  .command("convert <file>")
  .description("Convert a Column file to JSON, YAML, or XML")
  .option("-f, --format <format>", "Output format (json, yaml, xml)", "json")
  .option("-o, --output <file>", "Output file")
  .option("-p, --pretty", "Pretty-print the output", true)
  .option("-i, --indent <spaces>", "Number of spaces for indentation", "2")
  .option("-m, --include-meta", "Include metadata in the output", false)
  .action((file, options) => {
    try {
      const parseOptions: ParseOptions = {
        format: options.format as "json" | "yaml" | "xml",
        pretty: options.pretty,
        indent: parseInt(options.indent, 10),
        includeMeta: options.includeMeta,
      };

      // Parse the file
      const result = parseFile(file, parseOptions);

      // Output the result
      if (options.output) {
        fs.writeFileSync(options.output, result.output);
        console.log(chalk.green(`Successfully converted to ${options.output}`));
      } else {
        console.log(result.output);
      }
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Add command to validate a Column file
program
  .command("validate <file>")
  .description("Validate a Column file")
  .action((file) => {
    try {
      // Try to parse the file
      parseFile(file);
      console.log(chalk.green(`${file} is a valid Column file`));
    } catch (error: any) {
      console.error(chalk.red(`Validation error: ${error.message}`));
      process.exit(1);
    }
  });

// Add command to show the structure of a Column file
program
  .command("structure <file>")
  .description("Show the structure of a Column file")
  .option("-d, --depth <level>", "Maximum depth to display", "Infinity")
  .action((file, options) => {
    try {
      const result = parseFile(file);

      const depth =
        options.depth === "Infinity" ? Infinity : parseInt(options.depth, 10);

      printStructure(result.data, 0, depth);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

/**
 * Prints the structure of an object with indentation.
 * @param obj - The object to print
 * @param level - The current indentation level
 * @param maxDepth - The maximum depth to display
 */
function printStructure(
  obj: any,
  level: number = 0,
  maxDepth: number = Infinity
): void {
  if (level > maxDepth) return;

  const indent = "  ".repeat(level);

  if (Array.isArray(obj)) {
    console.log(`${indent}${chalk.yellow("Array")} [${obj.length} items]`);
    if (level < maxDepth) {
      obj.forEach((item, index) => {
        if (index < 10 || index === obj.length - 1) {
          console.log(`${indent}  ${chalk.blue(`[${index}]`)}`);
          printStructure(item, level + 2, maxDepth);
        } else if (index === 10) {
          console.log(`${indent}  ${chalk.gray("...")}`);
        }
      });
    }
  } else if (obj !== null && typeof obj === "object") {
    console.log(`${indent}${chalk.yellow("Object")}`);
    if (level < maxDepth) {
      Object.entries(obj).forEach(([key, value]) => {
        console.log(`${indent}  ${chalk.green(key)}`);
        printStructure(value, level + 2, maxDepth);
      });
    }
  } else {
    let valueStr = String(obj);
    if (typeof obj === "string") {
      valueStr = `"${valueStr}"`;
    }

    if (valueStr.length > 100) {
      valueStr = valueStr.substring(0, 97) + "...";
    }

    console.log(`${indent}${chalk.cyan(valueStr)}`);
  }
}

// Execute the program
program.parse(process.argv);

// Display help if no command provided
if (!process.argv.slice(2).length) {
  program.help();
}
