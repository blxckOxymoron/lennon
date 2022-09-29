import { Molecule } from "openchemlib";
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { prisma } from "../../lib";
import { moleculeHash } from "./molecule";
import { CachedImage, recolorSVG } from "../image";
import { RenderFunction } from "../image";

type MoleculeRenderer = RenderFunction<Molecule>;

export const generateImage: MoleculeRenderer = async mol => {
  //TODO: use a database

  const cached = await prisma.image.findFirst({
    where: {
      key: moleculeHash(mol),
      type: CachedImage.Molecule,
    },
    select: {
      url: true,
    },
  });
  if (cached) return new URL(cached.url);

  let svg = mol.toSVG(500, 200, undefined, {
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
  return sharp(Buffer.from(svg)).png().toBuffer();
};
