import { Molecule } from "openchemlib";
import Color from "color";
import sharp from "sharp";

const rgb = /rgb\((\d+),(\d+),(\d+)\)/g;

const recolorSvg = (svg: string, bg: Color) => {
  return svg.replaceAll(rgb, (_, r, g, b) => {
    let clr = Color.rgb(+r, +g, +b);

    if (clr.contrast(bg) < 3) {
      clr = clr.negate();
    }

    return clr.string();
  });
};

export const openchemlibImage = async (
  mol: Molecule,
  background: Color = Color("#1A1C20", "hex")
): Promise<Buffer> => {
  //TODO: use a database

  let svg = mol.toSVG(300, 200);
  svg = recolorSvg(svg, background);
  return sharp(svg).png().toBuffer();
};
