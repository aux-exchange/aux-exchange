import { AptosClient } from "aptos";
import { Pool } from "../src";
import { AuxClient } from "../src/client";

async function main() {
  const auxClient = new AuxClient(
    "mainnet",
    new AptosClient("http://100.110.50.17:8280")
  );
  const pool = await Pool.read({    
  })
}

main()
