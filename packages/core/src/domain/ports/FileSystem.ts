/**
 * File system abstraction for cross-platform storage.
 * Implementations can use Node.js fs, Tauri FS API, or other backends.
 */
export interface FileSystem {
  /**
   * Read file contents as text.
   * Returns null if file doesn't exist.
   */
  readFile(path: string): Promise<string | null>;

  /**
   * Write text content to a file.
   * Creates parent directories if needed.
   */
  writeFile(path: string, content: string): Promise<void>;

  /**
   * Check if a file exists.
   */
  exists(path: string): Promise<boolean>;

  /**
   * Delete a file.
   */
  deleteFile(path: string): Promise<void>;
}
