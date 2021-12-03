import {Events} from "./constants";

export interface IPendingDeploy {
  deployHash: string;
  deployType: Events;
}
