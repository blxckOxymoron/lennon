const defaultColorReplacements: ColorReplacementMap = {
  "rgb(192,0,255)": "rgb(185,187,190)",
  "rgb(0,0,0)": "rgb(255,255,255)",
};

type rgbColor = `rgb(${number},${number},${number})`;
type ColorReplacementMap = Record<rgbColor, rgbColor>;

export const recolorSVG = (
  svg: string,
  replacements: ColorReplacementMap = defaultColorReplacements
) => {
  let replacedSvg: string = svg;
  for (const [from, to] of Object.entries(replacements)) {
    replacedSvg = replacedSvg.replaceAll(from, to);
  }
  return replacedSvg;
};
