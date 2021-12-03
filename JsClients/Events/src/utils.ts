import {
  CasperServiceByJsonRPC
} from "casper-js-sdk";


export const camelCased = (myString: string) =>
  myString.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

/**
 * Returns global state root hash at current block.
 * @param {Object} client - JS SDK client for interacting with a node.
 * @return {String} Root hash of global state at most recent block.
 */
export const getStateRootHash = async (nodeAddress: string) => {
  const client = new CasperServiceByJsonRPC(nodeAddress);
  const { block } = await client.getLatestBlockInfo();
  if (block) {
    return block.header.state_root_hash;
  } else {
    throw Error("Problem when calling getLatestBlockInfo");
  }
};

/**
 * Returns a value under an on-chain account's storage.
 * @param accountInfo - On-chain account's info.
 * @param namedKey - A named key associated with an on-chain account.
 */
export const getAccountNamedKeyValue = (accountInfo: any, namedKey: string) => {
  const found = accountInfo.namedKeys.find((i: any) => i.name === namedKey);
  if (found) {
    return found.key;
  }
  return undefined;
};

export const getContractData = async (
  nodeAddress: string,
  stateRootHash: string,
  contractHash: string,
  path: string[] = []
) => {
  const client = new CasperServiceByJsonRPC(nodeAddress);
  const blockState = await client.getBlockState(
    stateRootHash,
    `hash-${contractHash}`,
    path
  );
  return blockState;
};




