import { Pool } from "@/lib/pool";
import Link from "next/link";

export function PoolListing(pools: Pool[]) {
  return pools.map((pool) => (
    <div
      className="row align-items-center"
      key={`${pool.x_info?.coin_type_str || ""}-${
        pool.y_info?.coin_type_str || ""
      }`}
    >
      <div className="col-1">
        <img
          src={pool.x_info?.coin_info?.logo_url || ""}
          alt={pool.x_info?.coin_type_str || ""}
          height={32}
          width={32}
        />
        <img
          src={pool.y_info?.coin_info?.logo_url || ""}
          alt={pool.y_info?.coin_type_str || ""}
          height={32}
          width={32}
        />
      </div>
      <div className="col-2">
        {`${pool.x_info?.coin_info?.symbol}/${pool.y_info?.coin_info?.symbol}`}
      </div>
      <div className="col-4">
        {`${pool.x_info?.number_reserve}/${pool.y_info?.number_reserve}`}
      </div>
      <div className="col-5">
        <Link
          className="btn btn-outline-primary"
          href={`/pool?coins=${pool.x_info?.coin_type_str}-${pool.y_info?.coin_type_str}`}
        >
          Go to Pool
        </Link>
      </div>
    </div>
  ));
}
