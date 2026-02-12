import type { FileSystem } from '@streak-os/core';

/**
 * In-memory FileSystem implementation for testing and demo purposes.
 * Data is stored in memory and will be lost on app restart.
 */
export class InMemoryFileSystem implements FileSystem {
  private files: Map<string, string> = new Map();

  async readFile(path: string): Promise<string | null> {
    return this.files.get(path) ?? null;
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
  }

  async exists(path: string): Promise<boolean> {
    return this.files.has(path);
  }

  async deleteFile(path: string): Promise<void> {
    this.files.delete(path);
  }

  /**
   * Get all stored files (for debugging).
   */
  getAllFiles(): Map<string, string> {
    return new Map(this.files);
  }

  /**
   * Clear all files (for testing).
   */
  clear(): void {
    this.files.clear();
  }
}
