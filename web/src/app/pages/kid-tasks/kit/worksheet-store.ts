import { Signal, WritableSignal, signal } from '@angular/core';
import { readJson, writeJson } from '../../../core/storage/local-storage';
import { clone } from './random';

/* One store per worksheet page: the working state plus a library of saved sheets under `<key>:lib`.
   `current` overrides where the working state lives (the writing page keeps it under `…:current`).
   Never rename a page's key: that would lose the user's saved sheets. */
export class WorksheetStore<T> {
  private readonly stateKey: string;
  private readonly libKey: string;
  private readonly entries: WritableSignal<T[]>;

  /* the saved sheets, newest first */
  readonly library: Signal<T[]>;

  constructor(key: string, opts?: { current?: string }) {
    this.stateKey = opts?.current ?? key;
    this.libKey = `${key}:lib`;
    this.entries = signal<T[]>(readJson<T[]>(this.libKey, []));
    this.library = this.entries.asReadonly();
  }

  load<F>(fallback: F): Partial<T> | F {
    return readJson<Partial<T> | F>(this.stateKey, fallback);
  }

  save(state: T): boolean {
    return writeJson(this.stateKey, state);
  }

  setLibrary(list: T[]): boolean {
    this.entries.set(list);
    return writeJson(this.libKey, list);
  }

  /* put a copy of the sheet at the top of the library, replacing one with the same name */
  remember(state: T, nameOf: (entry: T) => string, max = 12): boolean {
    const name = nameOf(state);
    const list = this.entries().filter((x) => nameOf(x) !== name);
    list.unshift(clone(state));
    return this.setLibrary(list.slice(0, max));
  }

  forget(entry: T, nameOf: (entry: T) => string): void {
    const name = nameOf(entry);
    this.setLibrary(this.entries().filter((x) => nameOf(x) !== name));
  }
}
