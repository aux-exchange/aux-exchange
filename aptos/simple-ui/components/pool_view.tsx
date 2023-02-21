import { Pool } from "@/lib/pool";

export default function PoolView(pool: Pool) {
  return (
    <div className="container-xxl">
      <dl className="row">
        <dt className="col-1"></dt>
        <dt className="col-2">Name</dt>
        <dt className="col-1">Symbol</dt>
        <dt className="col-2">Reserve</dt>
        <dt className="col-6">Type</dt>

        <dt className="col-1">
          <img src={pool.x_info?.coin_info?.logo_url} width="24" height="24" />
        </dt>
        <dd className="col-2">{pool.x_info?.coin_info?.name}</dd>
        <dd className="col-1">{pool.x_info?.coin_info?.symbol}</dd>
        <dd className="col-2">{pool.x_info?.number_reserve}</dd>
        <dd className="col-6">{pool.x_info?.coin_type_str}</dd>

        <dt className="col-1">
          <img src={pool.y_info?.coin_info?.logo_url} width="24" height="24" />
        </dt>
        <dd className="col-2">{pool.y_info?.coin_info?.name}</dd>
        <dd className="col-1">{pool.y_info?.coin_info?.symbol}</dd>
        <dd className="col-2">{pool.y_info?.number_reserve}</dd>
        <dd className="col-6">{pool.y_info?.coin_type_str}</dd>
      </dl>
      <div className="row">
        <div className="col-12">
          <ul className="nav nav-tabs" id="poolTab" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className="nav-link active"
                id="swap-tab"
                data-bs-toggle="tab"
                data-bs-target="#swap-panel"
                type="button"
                role="tab"
                aria-controls="swap-panel"
                aria-selected="true"
              >
                Swap
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                id="provide-tab"
                data-bs-toggle="tab"
                data-bs-target="#provide-panel"
                type="button"
                role="tab"
                aria-controls="provide-panel"
              >
                Add Liquidity
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                id="remove-tab"
                data-bs-toggle="tab"
                data-bs-target="#remove-panel"
                type="button"
                role="tab"
                aria-controls="remove-panel"
              >
                Remove Liquidity
              </button>
            </li>
          </ul>
          <div className="tab-content">
            <div
              className="tab-pane fade show active"
              id="swap-panel"
              role="tabpanel"
              aria-labelledby="swap-tab"
            >
              TODO: Add swap
            </div>
            <div
              className="tab-pane fade"
              id="provide-panel"
              role="tabpanel"
              aria-labelledby="provide-tab"
            >
              TODO: Add provide liquidity
            </div>
            <div
              className="tab-pane fade"
              id="remove-panel"
              role="tabpanel"
              aria-labelledby="remove-tab"
            >
              TODO: Add remove liquidity
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
