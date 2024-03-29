// https://pubchem.ncbi.nlm.nih.gov/pcautocp/pcautocp.cgi?dict=pc_compoundnames&n=10&q=glu
// /rest/autocomplete/compound,gene,taxonomy/mea
// https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/glu ⭐

type AutocompleteResponse = {
  status: {
    code: number;
  };
  total: number;
  dictionary_terms: {
    compound: string[];
  };
};

const autocompleteInspiration = [
  "Type at least 3 letters to get more suggestions.",
  "Glucose",
  "Vitamin B1",
  "Vitamin C",
  "Adrenaline",
  "Pentanol",
];

export const autocomplete = async (query: string): Promise<string[]> => {
  if (query.length < 3) return autocompleteInspiration;
  const response: AutocompleteResponse | undefined = await fetch(
    `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${query}`
  ).then(res => (res.ok ? res.json() : undefined));

  if (!response || response.total === 0) return [];
  return response.dictionary_terms.compound;
};
