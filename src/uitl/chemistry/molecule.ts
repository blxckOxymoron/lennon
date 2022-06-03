import { Molecule } from "openchemlib";
/*
const query = "4,4-dimethylnonan";

const printResponse = async (res: Response) => {
  const text = await res.text().then(it => it.trimEnd());
  console.log(text);
  return text;
};

const rgb = /rgb\((\d+),(\d+),(\d+)\)/g;
const bg = Color("#1A1C20", "hex");

const recolorSvg = (svg: string) => {
  return svg.replaceAll(rgb, (_, r, g, b) => {
    let clr = Color.rgb(+r, +g, +b);

    if (clr.contrast(bg) < 3) {
      clr = clr.negate();
    }

    return clr.string();
  });
};

const compound = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${query}/cids/TXT`;
const cid = fetch(compound).then(printResponse);

const smilesURL = `https://cactus.nci.nih.gov/chemical/structure/${query}/smiles`;
const smiles = fetch(smilesURL).then(printResponse);

const mol = Molecule.fromSmiles(smiles);
const svg = mol.toSVG(300, 300, query, {
  suppressChiralText: true,
  suppressCIPParity: true,
  suppressESR: true,
  autoCrop: true,
});
writeFile("out.svg", recolorSvg(svg)).then(() => console.log("done"));

const infoURL = `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`;
console.log(infoURL);

const imageURL = `https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid=${cid}&t=l`;
console.log(imageURL);
*/

type ChemCompoundResponse =
  | {
      PropertyTable: {
        Properties: {
          CID: number;
          CanonicalSMILES: string;
        }[];
      };
    }
  | {
      Fault: {
        Code: string;
        Message: string;
        Details: string[];
      };
    };

type MoleculeResult =
  | {
      molecule: Molecule;
      cid?: number;
    }
  | undefined;

const findMoleculePubchem = async (query: string): Promise<MoleculeResult> => {
  const compoundRes: ChemCompoundResponse = await fetch(
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${query}/property/CanonicalSMILES/JSON`
  ).then(res => res.json());

  if ("Fault" in compoundRes) return;

  const smiles = compoundRes.PropertyTable.Properties[0]?.CanonicalSMILES;
  const cid = compoundRes.PropertyTable.Properties[0]?.CID;
  if (!smiles || !cid) return;

  const molecule = Molecule.fromSmiles(smiles);
  return {
    molecule,
    cid,
  };
};

const findMoleculeCactus = async (query: string): Promise<MoleculeResult> => {
  const smiles = await fetch(`https://cactus.nci.nih.gov/chemical/structure/${query}/smiles`).then(
    res => (res.ok ? res.text() : undefined)
  );
  if (!smiles) return;

  const molecule = Molecule.fromSmiles(smiles);
  return {
    molecule,
  };
};

export const findMolecule = async (query: string): Promise<MoleculeResult> => {
  return (await findMoleculePubchem(query)) ?? (await findMoleculeCactus(query));
};
