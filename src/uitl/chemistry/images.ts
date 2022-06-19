import { Molecule } from "openchemlib";
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { prisma } from "../../lib";
import { moleculeHash } from "./molecule";
import { recolorSVG } from "../svg";
import { RenderFunction } from "../svg";

type MoleculeRenderer = RenderFunction<Molecule>;

const openchemlibImage: MoleculeRenderer = async mol => {
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
  svg = recolorSVG(svg);
  writeFile(`P:/TypeScript/lennon/tmp/${Date.now()}.svg`, svg);
  return sharp(Buffer.from(svg)).png().toBuffer();
};

export enum ImageGenerator {
  Openchemlib = "openchemlib",
}

const generators: Record<ImageGenerator, MoleculeRenderer> = {
  openchemlib: openchemlibImage,
};

export const generateImage = (mol: Molecule, generator: ImageGenerator) => {
  return generators[generator](mol);
};
