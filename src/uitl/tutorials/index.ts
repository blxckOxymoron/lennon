import molecule from "./molecule";
import equation from "./equation";

export type Tutorial = {
  name: string;
  info: {
    us: string;
    de: string;
  };
};

const tutorials: Tutorial[] = [molecule, equation];

export default tutorials;
