import { CLAccountHash, CLByteArray, CLPublicKey } from "casper-js-sdk";
import {ERC20Events} from "./constants";

export type RecipientType = CLPublicKey | CLAccountHash | CLByteArray;

export interface IPendingDeploy {
  deployHash: string;
  deployType: ERC20Events;
}
