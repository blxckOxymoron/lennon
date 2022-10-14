import { container } from "@sapphire/framework";
import { createHash } from "node:crypto";
import ocl from "openchemlib";
const { Molecule } = ocl;

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

type MoleculeResult = {
  molecule: ocl.Molecule;
  cid?: number;
};

const findMoleculePubchem = async (query: string): Promise<MoleculeResult | undefined> => {
  const compoundRes: ChemCompoundResponse | undefined = await fetch(
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${query}/property/CanonicalSMILES/JSON`
  )
    .then(res => (res.ok ? res.json() : undefined))
    .catch(() => container.logger.warn("Failed to fetch from PubChem."));

  if (!compoundRes || "Fault" in compoundRes) return;

  const smiles = compoundRes.PropertyTable.Properties[0]?.CanonicalSMILES;
  const cid = compoundRes.PropertyTable.Properties[0]?.CID;
  if (!smiles || !cid) return;

  const molecule = Molecule.fromSmiles(smiles);
  return {
    molecule,
    cid,
  };
};

const findMoleculeCactus = async (query: string): Promise<MoleculeResult | undefined> => {
  const smiles = await fetch(
    `https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(query)}/smiles`
  )
    .then(res => (res.ok ? res.text() : undefined))
    .catch(() => container.logger.warn("Failed to fetch from Cactus."));
  if (!smiles) return;

  const molecule = Molecule.fromSmiles(smiles);
  return {
    molecule,
  };
};

export const findMolecule = async (query: string): Promise<MoleculeResult | undefined> => {
  return (await findMoleculePubchem(query)) ?? (await findMoleculeCactus(query));
};

export const moleculeHash = (molecule: ocl.Molecule): Buffer => {
  return createHash("sha256").update(molecule.toMolfile()).digest();
};
