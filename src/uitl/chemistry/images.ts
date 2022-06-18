import { Molecule } from "openchemlib";
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const colorReplacements = {
  "rgb(192,0,255)": "rgb(246,246,246)",
  "rgb(0,0,0)": "rgb(255,255,255)",
};

const oldLineColor = /rgb\(192,0,255\)|rgb\(0,0,0\)/g;
const newLineColor = "rgb(255,255,255)";

const editSvg = (svg: string) => {
  return svg.replaceAll(oldLineColor, newLineColor).replaceAll(" Helvetica", "Inter");
};

const openchemlibImage = async (mol: Molecule): Promise<Buffer> => {
  //TODO: use a database

  let svg = mol.toSVG(300, 200, undefined, {
    strokeWidth: "2",
    fontWeight: "800",
    highlightQueryFeatures: false,
    showSymmetryDiastereotopic: false,
    showSymmetryEnantiotopic: false,
    showSymmetrySimple: false,
    suppressChiralText: true,
    suppressCIPParity: true,
    suppressESR: true,
    autoCrop: true,
  });
  svg = editSvg(svg);
  writeFile(`P:/TypeScript/lennon/tmp/${Date.now()}.svg`, svg);
  return sharp(Buffer.from(svg)).png().toBuffer();
};

export enum ImageGenerator {
  Openchemlib = "openchemlib",
}

const generators: Record<ImageGenerator, (mol: Molecule) => Promise<Buffer | URL>> = {
  openchemlib: openchemlibImage,
};

export const generateImage = (mol: Molecule, generator: ImageGenerator) => {
  return generators[generator](mol);
};
