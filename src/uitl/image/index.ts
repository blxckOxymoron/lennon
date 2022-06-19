export * from "./color";
export * from "./twemoji";

export type RenderFunction<T> = (input: T) => Promise<Buffer | URL>;

export enum CachedImage {
  Molecule = "molecule",
  Equation = "equation",
}
