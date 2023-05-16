import molecule from "./molecule.js";
import equation from "./equation.js";
import timer from "./timer.js";

export type Tutorial = {
  name: string;
  info: {
    us: string;
    de: string;
  };
};

const tutorials: Tutorial[] = [molecule, equation, timer];

export default tutorials;
