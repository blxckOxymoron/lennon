import molecule from "./molecule";
import equation from "./equation";
import timer from "./timer";

export type Tutorial = {
  name: string;
  info: {
    us: string;
    de: string;
  };
};

const tutorials: Tutorial[] = [molecule, equation, timer];

export default tutorials;
