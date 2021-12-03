import { config } from "dotenv";
config();
import { Client ,constants} from "../src";
import { getDeploy } from "./utils";
import { request } from 'graphql-request';

const { Events } = constants;

const {
  NODE_ADDRESS,
  EVENT_STREAM_ADDRESS,
  CHAIN_NAME,
  GRAPHQL
} = process.env;

const erc20 = new Client(
  NODE_ADDRESS!,
  CHAIN_NAME!,
  EVENT_STREAM_ADDRESS!
);

function splitdata(data:string)
{
    var temp=data.split('(');
    var result=temp[1].split(')');
    return result[0];
}
const listener = async () => {
 
  const listener = erc20.onEvent(
    [
      Events.Approval,
      Events.Transfer
    ],
    async (eventName, deploy, result) => {
      if (deploy.success) {
          console.log(`Successfull deploy of: ${eventName}, deployHash: ${deploy.deployHash}`);
          const [timestamp,block_hash]= await getDeploy(NODE_ADDRESS!, deploy.deployHash);
          console.log("... Deployhash: ",  deploy.deployHash);
          console.log("... Timestamp: ", timestamp);
          console.log("... Block hash: ", block_hash);
          console.log("result.value(): ",result.value());
          let newData = JSON.parse(JSON.stringify(result.value()));

          if(eventName =="pair_created")
          {
            console.log(eventName+ " Event result: ");
            console.log(newData[0][0].data + " = " + newData[0][1].data);
            console.log(newData[1][0].data + " = " + newData[1][1].data);
            console.log(newData[2][0].data + " = " + newData[2][1].data);
            console.log(newData[3][0].data + " = " + newData[3][1].data);
            console.log(newData[4][0].data + " = " + newData[4][1].data);
            console.log(newData[5][0].data + " = " + newData[5][1].data);
            
            var allpairslength=parseInt(newData[0][1].data);
            var pair=splitdata(newData[3][1].data);
            var token0=splitdata(newData[4][1].data);
            var token1=splitdata(newData[5][1].data);
            
            console.log("allpairslength: ", allpairslength);
            console.log("pair splited: ", pair);
            console.log("token0 splited: ", token0);
            console.log("token1 splited: ", token1);

            request(GRAPHQL!,
            `mutation handleNewPair( $token0: String!, $token1: String!, $pair: String!, $all_pairs_length: Int!, $timeStamp: String!, $blockHash: String!){
            handleNewPair( token0: $token0, token1: $token1, pair: $pair, all_pairs_length: $all_pairs_length, timeStamp: $timeStamp, blockHash: $blockHash) {
              result
            }
          
            }`,
            {token0:token0, token1:token1, pair: pair, all_pairs_length: allpairslength, timeStamp:timestamp.toString(), blockHash:block_hash})
            .then(data => console.log(data))
            .catch(error => console.error(error));
          }
          else if(eventName=="approve")
          {
            console.log(eventName+ " Event result: ");
            console.log(newData[0][0].data + " = " + newData[0][1].data);
            console.log(newData[1][0].data + " = " + newData[1][1].data);
            console.log(newData[2][0].data + " = " + newData[2][1].data);
            console.log(newData[3][0].data + " = " + newData[3][1].data);
            console.log(newData[4][0].data + " = " + newData[4][1].data);
          }
          else if(eventName=="transfer")
            {
              console.log(eventName+ " Event result: ");
              console.log(newData[0][0].data + " = " + newData[0][1].data);
              console.log(newData[1][0].data + " = " + newData[1][1].data);

              console.log(newData[2][0].data + " = " + newData[2][1].data);
              console.log(newData[3][0].data + " = " + newData[3][1].data);
              console.log(newData[4][0].data + " = " + newData[4][1].data);
              console.log(newData[5][0].data + " = " + newData[5][1].data);

              var from=splitdata(newData[2][1].data);
              var to=splitdata(newData[4][1].data);
              var value=parseInt(newData[5][1].data);
              var pair=splitdata(newData[3][1].data);

              console.log("from: ", from);
              console.log("to: ", to);
              console.log("value: ",value);
              console.log("pair: ", pair);

              request(GRAPHQL!,
                `mutation handleTransfer( $from: String!, $to: String!, $value: Int!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
                handleTransfer( from: $from, to: $to, value: $value, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
                  result
                }
              
                }`,
                {from:from, to: to, value: value, pairAddress: pair, deployHash:deploy.deployHash,timeStamp:timestamp.toString(), blockHash:block_hash})
                .then(data => console.log(data))
                .catch(error => console.error(error));
            }
            else if (eventName=="mint")
            {

              console.log(eventName+ " Event result: ");
              console.log(newData[0][0].data + " = " + newData[0][1].data);
              console.log(newData[1][0].data + " = " + newData[1][1].data);
              console.log(newData[2][0].data + " = " + newData[2][1].data);
              console.log(newData[3][0].data + " = " + newData[3][1].data);
              console.log(newData[4][0].data + " = " + newData[4][1].data);
              console.log(newData[5][0].data + " = " + newData[5][1].data);

              var amount0=parseInt(newData[0][1].data);
              var amount1=parseInt(newData[1][1].data);
              var pair=splitdata(newData[4][1].data);
              var sender=splitdata(newData[5][1].data);

              console.log("amount0: ", amount0);
              console.log("amount1: ", amount1);
              console.log("pair: ",pair);
              console.log("sender: ", sender);

              request(GRAPHQL!,
                `mutation handleMint( $amount0: Int!, $amount1: Int!, $sender: String!,$logIndex: Int!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
                  handleMint( amount0: $amount0, amount1: $amount1, sender: $sender, logIndex: $logIndex, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
                    result
                  }
                
                  }`,
                  {amount0:amount0, amount1: amount1, sender: sender,logIndex:0, pairAddress: pair, deployHash:deploy.deployHash,timeStamp:timestamp.toString(), blockHash:block_hash})
                  .then(data => console.log(data))
                  .catch(error => console.error(error));
            }
            else if (eventName=="burn")
            {

              console.log(eventName+ " Event result: ");
              console.log(newData[0][0].data + " = " + newData[0][1].data);
              console.log(newData[1][0].data + " = " + newData[1][1].data);
              console.log(newData[2][0].data + " = " + newData[2][1].data);
              console.log(newData[3][0].data + " = " + newData[3][1].data);
              console.log(newData[4][0].data + " = " + newData[4][1].data);
              console.log(newData[5][0].data + " = " + newData[5][1].data);
              console.log(newData[6][0].data + " = " + newData[6][1].data);
              
              var amount0=parseInt(newData[0][1].data);
              var amount1=parseInt(newData[1][1].data);
              var pair=splitdata(newData[4][1].data);
              var sender=splitdata(newData[5][1].data);
              var to=splitdata(newData[6][1].data);

              console.log("amount0: ", amount0);
              console.log("amount1: ", amount1);
              console.log("pair: ",pair);
              console.log("sender: ", sender);
              console.log("to: ", to);

              request(GRAPHQL!,
                `mutation handleBurn( $amount0: Int!, $amount1: Int!, $sender: String!,$logIndex: Int!,$to: String!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
                  handleBurn( amount0: $amount0, amount1: $amount1, sender: $sender, logIndex: $logIndex, to:$to, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
                    result
                  }
                
                  }`,
                  {amount0:amount0, amount1: amount1, sender: sender,logIndex:0, to:to,pairAddress: pair, deployHash:deploy.deployHash,timeStamp:timestamp.toString(), blockHash:block_hash})
                  .then(data => console.log(data))
                  .catch(error => console.error(error));
            }
            else if (eventName=="sync")
            {

              console.log(eventName+ " Event result: ");
              console.log(newData[0][0].data + " = " + newData[0][1].data);
              console.log(newData[1][0].data + " = " + newData[1][1].data);
              console.log(newData[2][0].data + " = " + newData[2][1].data);
              console.log(newData[3][0].data + " = " + newData[3][1].data);
              console.log(newData[4][0].data + " = " + newData[4][1].data);

              var reserve0=parseInt(newData[3][1].data);
              var reserve1=parseInt(newData[4][1].data);
              var pair=splitdata(newData[2][1].data);

              console.log("reserve0: ", reserve0);
              console.log("reserve1: ", reserve1);
              console.log("pair: ",pair);
            

              request(GRAPHQL!,
                `mutation handleSync( $reserve0: Int!, $reserve1: Int!, $pairAddress: String!){
                handleSync( reserve0: $reserve0, reserve1: $reserve1, pairAddress: $pairAddress) {
                  result
                }
              
                }`,
                {reserve0:reserve0, reserve1: reserve1, pairAddress: pair})
                .then(data => console.log(data))
                .catch(error => console.error(error));
            }
            else if (eventName=="swap")
            {

              console.log(eventName+ " Event result: ");
              console.log(newData[0][0].data + " = " + newData[0][1].data);
              console.log(newData[1][0].data + " = " + newData[1][1].data);
              console.log(newData[2][0].data + " = " + newData[2][1].data);
              console.log(newData[3][0].data + " = " + newData[3][1].data);
              console.log(newData[4][0].data + " = " + newData[4][1].data);
              console.log(newData[5][0].data + " = " + newData[5][1].data);
              console.log(newData[6][0].data + " = " + newData[6][1].data);
              console.log(newData[7][0].data + " = " + newData[7][1].data);
              console.log(newData[8][0].data + " = " + newData[8][1].data);
              console.log(newData[9][0].data + " = " + newData[9][1].data);

              var amount0In=parseInt(newData[0][1].data);
              var amount1In=parseInt(newData[1][1].data);
              var amount0Out=parseInt(newData[2][1].data);
              var amount1Out=parseInt(newData[3][1].data);
              var from=splitdata(newData[6][1].data);
              var pair=splitdata(newData[7][1].data);
              var sender=splitdata(newData[8][1].data);
              var to=splitdata(newData[9][1].data);

              console.log("amount0In: ", amount0In);
              console.log("amount1In: ", amount1In);
              console.log("amount0Out: ", amount0Out);
              console.log("amount1Out: ", amount1Out);
              console.log("from: ",from);
              console.log("pair: ",pair);
              console.log("sender: ", sender);
              console.log("to: ", to);

              request(GRAPHQL!,
                `mutation handleSwap( $amount0In: Int!, $amount1In: Int!, $amount0Out: Int!, $amount1Out: Int!, $to: String!,$from: String!,$sender: String!,$logIndex: Int!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
                  handleSwap( amount0In: $amount0In, amount1In: $amount1In, amount0Out: $amount0Out, amount1Out: $amount1Out, to:$to, from:$from,sender: $sender,logIndex: $logIndex, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
                    result
                  }
                
                  }`,
                  {amount0In:amount0In, amount1In: amount1In,amount0Out:amount0Out, amount1Out: amount1Out,to:to,from:from, sender: sender,logIndex:0,pairAddress: pair, deployHash:deploy.deployHash,timeStamp:timestamp.toString(), blockHash:block_hash})
                  .then(data => console.log(data))
                  .catch(error => console.error(error));
            }

      } else {
        console.log(`Failed deploy of ${eventName}, deployHash: ${deploy.deployHash}`);
        console.log(`Error: ${deploy.error}`);
      }
    }
  );
  console.log("listener: ",listener);

};

listener();

export const addpendingDeploy = async (event:string,contract_Hash:string,deployHash:string) => {

  await erc20.setContractHash(contract_Hash);

  if(event == Events.Approval)
  {
    erc20.addPendingDeploy(Events.Approval,deployHash);
    console.log("approve");
  }
  else if (event == Events.Transfer){
    erc20.addPendingDeploy(Events.Transfer,deployHash);
    console.log("transfer");
    
  }
  else if (event == Events.PairCreated){
    erc20.addPendingDeploy(Events.PairCreated,deployHash);
    console.log("pair created");
    
  }
  else if (event == Events.Mint){
    erc20.addPendingDeploy(Events.Mint,deployHash);
    console.log("mint");
    
  }
  else if (event == Events.Burn){
    erc20.addPendingDeploy(Events.Burn,deployHash);
    console.log("burn");
    
  }
  else if (event == Events.Sync){
    erc20.addPendingDeploy(Events.Sync,deployHash);
    console.log("sync");
    
  }
  else if (event == Events.Swap){
    erc20.addPendingDeploy(Events.Swap,deployHash);
    console.log("swap");
    
  }

  await getDeploy(NODE_ADDRESS!, deployHash);
  console.log("Get Deploy successfull");
};
