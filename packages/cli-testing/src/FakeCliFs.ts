import * as fs from "fs";
import {PathLike} from "fs";
import {EnsureOptions, WriteFileOptions} from "fs-extra";
import {normalizePath} from "./normalizePath";
import {isString} from "@tsed/core";

export class FakeCliFs {
  static entries = new Map<any, string>();

  static getKeys() {
    return normalizePath(Array.from(FakeCliFs.entries.keys()).sort((a, b) => (a < b ? -1 : 1)));
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  findUpFile() {
    return null;
  }

  exists(path: string): boolean {
    return FakeCliFs.entries.has(normalizePath(path));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  readFile(file: string | Buffer | number, encoding?: any): Promise<string> {
    return Promise.resolve(FakeCliFs.entries.get(normalizePath(file))!);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  readFileSync(file: string | Buffer | number, encoding?: any): string {
    try {
      if (isString(file) && file.match(/_partials/)) {
        return fs.readFileSync(file, encoding) as any as string;
      }
    } catch (er) {}

    return FakeCliFs.entries.get(normalizePath(file))!;
  }

  async readJson(file: string | Buffer | number, encoding?: any): Promise<string> {
    const content = await this.readFile(file, encoding);

    return content ? JSON.parse(content) : {};
  }

  readJsonSync(file: string | Buffer | number, encoding?: any): Promise<string> {
    const content = this.readFileSync(file, encoding);

    return content ? JSON.parse(content) : {};
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  writeFileSync(path: PathLike | number, data: any, options?: WriteFileOptions): void {
    FakeCliFs.entries.set(normalizePath(path), data);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  writeFile(file: string | Buffer | number, data: any, options?: WriteFileOptions | string): void {
    FakeCliFs.entries.set(normalizePath(file), data);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ensureDir(path: string, options?: EnsureOptions | number): Promise<void> {
    FakeCliFs.entries.set(normalizePath(path), path);
    return Promise.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ensureDirSync(path: string, options?: EnsureOptions | number) {
    FakeCliFs.entries.set(normalizePath(path), path);
  }

  $onDestroy() {
    FakeCliFs.entries.clear();
  }
}
