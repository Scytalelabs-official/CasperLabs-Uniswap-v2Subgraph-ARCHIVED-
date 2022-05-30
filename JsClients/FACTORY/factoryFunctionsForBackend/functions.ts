import { config } from "dotenv";
config();
import { FACTORYClient} from "../src";

const {
  NODE_ADDRESS,
  EVENT_STREAM_ADDRESS,
  CHAIN_NAME
} = process.env;

const factory = new FACTORYClient(
  NODE_ADDRESS!,
  CHAIN_NAME!,
  EVENT_STREAM_ADDRESS!
);

export const getPair = async (contractHash:string,TOKEN0_CONTRACT:string,TOKEN1_CONTRACT:string) => {
  
  console.log(`... Contract Hash: ${contractHash}`);

  // We don't need hash- prefix so i'm removing it
  await factory.setContractHash(contractHash);

  //pair
  let pair = await factory.getPair(TOKEN0_CONTRACT, TOKEN1_CONTRACT);
  console.log(`... Pair: ${pair}`);

  return pair;
  
};
