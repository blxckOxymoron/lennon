import { Molecule } from "openchemlib";
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { prisma } from "../../lib";
import { moleculeHash } from "./molecule";

type GeneratorFunction = (mol: Molecule) => Promise<Buffer | URL>;

const colorReplacements = {
  "rgb(192,0,255)": "rgb(185,187,190)",
  "rgb(0,0,0)": "rgb(255,255,255)",
};

const editSvg = (svg: string) => {
  for (const [from, to] of Object.entries(colorReplacements)) {
    svg = svg.replaceAll(from, to);
  }
  return svg;
};

const openchemlibImage: GeneratorFunction = async mol => {
  //TODO: use a database

  const cached = await prisma.image.findFirst({
    where: {
      key: moleculeHash(mol),
      type: ImageGenerator.Openchemlib,
    },
    select: {
      url: true,
    },
  });
  if (cached) return new URL(cached.url);

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

const generators: Record<ImageGenerator, GeneratorFunction> = {
  openchemlib: openchemlibImage,
};

export const generateImage = (mol: Molecule, generator: ImageGenerator) => {
  return generators[generator](mol);
};
