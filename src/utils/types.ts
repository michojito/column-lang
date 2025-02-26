/**
 * Enum representing the different data types in the Column language.
 */
export enum DataType {
  STRING = "STRING",
  NUMBER = "NUMBER",
  BOOLEAN = "BOOL",
  NULL = "NULL",
  DATE = "DATE",
  TIME = "TIME",
  DATETIME = "DATETIME",
  DURATION = "DURATION",
  INT = "INT",
  FLOAT = "FLOAT",
  ARRAY = "ARRAY",
  OBJECT = "OBJECT",
}

/**
 * Interface representing a type annotation in the Column language.
 */
export interface TypeAnnotation {
  type: DataType;
  value: string;
}

/**
 * Detects the data type of a value string.
 * @param value - The value string to detect the type of
 * @returns The detected data type
 */
export function detectType(value: string): DataType {
  // Null values
  if (value === "null" || value === "?" || value === "") {
    return DataType.NULL;
  }

  // Boolean values
  if (
    value === "true" ||
    value === "false" ||
    value === "!!" ||
    value === "!"
  ) {
    return DataType.BOOLEAN;
  }

  // Number values
  if (/^-?\d+$/.test(value)) {
    return DataType.INT;
  }

  if (/^-?\d+\.\d+$/.test(value)) {
    return DataType.FLOAT;
  }

  // Date values (ISO 8601)
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return DataType.DATE;
  }

  // Time values (24-hour format)
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    return DataType.TIME;
  }

  // DateTime values (ISO 8601)
  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(
      value
    )
  ) {
    return DataType.DATETIME;
  }

  // Duration values
  if (/^\d+[hmsd](\d+[hmsd])*$/.test(value)) {
    return DataType.DURATION;
  }

  // Default to string
  return DataType.STRING;
}

/**
 * Converts a string value to its actual type.
 * @param value - The string value to convert
 * @param type - The target data type
 * @returns The converted value
 */
export function convertValue(value: string, type: DataType): any {
  switch (type) {
    case DataType.NULL:
      return null;

    case DataType.BOOLEAN:
      if (value === "true" || value === "!!") return true;
      if (value === "false" || value === "!") return false;
      return Boolean(value);

    case DataType.INT:
      return parseInt(value, 10);

    case DataType.FLOAT:
    case DataType.NUMBER:
      return parseFloat(value);

    case DataType.DATE:
      return new Date(value);

    case DataType.TIME:
      // Convert time string to Date object (today's date with specified time)
      const [hours, minutes, seconds = "0"] = value.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, parseInt(seconds, 10), 0);
      return date;

    case DataType.DATETIME:
      return new Date(value);

    case DataType.DURATION:
      // For duration, we keep it as a string for now
      // A more sophisticated approach would be to parse it into milliseconds or a Duration object
      return value;

    case DataType.ARRAY:
    case DataType.OBJECT:
      // These are handled by the parser directly
      return value;

    case DataType.STRING:
    default:
      return value;
  }
}

/**
 * Parse a type annotation string like {TYPE} and extract the type.
 * @param annotation - The type annotation string
 * @returns The parsed type annotation or null if invalid
 */
export function parseTypeAnnotation(annotation: string): TypeAnnotation | null {
  const match = annotation.match(/^\{([A-Z]+)\}$/);
  if (!match) return null;

  const typeStr = match[1];

  // Validate that the type is one of the known types
  try {
    const type = DataType[typeStr as keyof typeof DataType];
    return { type, value: typeStr };
  } catch (e) {
    return null;
  }
}
