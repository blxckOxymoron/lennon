export * from "./color";

export type RenderFunction<T> = (input: T) => Promise<Buffer | URL>;
