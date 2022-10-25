package aptos

type AuxCritbit struct {
	Entries  *TableWithLength `json:"entries,omitempty"`
	MaxIndex JsonUint64       `json:"max_index"`
	MinIndex JsonUint64       `json:"min_index"`
	Root     JsonUint64       `json:"root"`
	Tree     *TableWithLength `json:"tree"`
}

type AuxClobMarket struct {
	Asks          *AuxCritbit `json:"asks,omitempty"`
	Bids          *AuxCritbit `json:"bids,omitempty"`
	BaseDecimals  uint8       `json:"base_decimals"`
	QuoteDecimals uint8       `json:"quote_decimals"`
	LotSize       JsonUint64  `json:"lot_size"`
	TickSize      JsonUint64  `json:"tick_size"`

	FillEvents   *EventHandler `json:"fill_events"`
	PlacedEvents *EventHandler `json:"placed_events"`
	CancelEvents *EventHandler `json:"cancel_events"`
}

type AuxAmmPool struct {
	FeeBps   JsonUint64 `json:"feebps"`
	Frozen   bool       `json:"frozen"`
	XReserve Coin       `json:"x_reserve"`
	YReserve Coin       `json:"y_reserve"`

	AddLiquidityEvents    *EventHandler `json:"add_liquidity_events"`
	RemoveLiquidityEvents *EventHandler `json:"remove_liquidity_events"`
	SwapEvents            *EventHandler `json:"swap_events"`
}

// MarketType provides the market for a pair of currencies
func (info *AuxClientConfig) MarketType(baseCoin *MoveTypeTag, quoteCoin *MoveTypeTag) (*MoveTypeTag, error) {
	return NewMoveTypeTag(info.Address, "clob_market", "Market", []*MoveTypeTag{baseCoin, quoteCoin})
}

// AuxLevel2Event_Level is price/quantity in an aux level 2 event
type AuxLevel2Event_Level struct {
	Price    JsonUint64 `json:"price"`
	Quantity JsonUint64 `json:"quantity"`
}

// AuxLevel2Event contains the bids and asks from a `load_market_into_event` call.
// Since tranversing the orderbook from off-chain is difficult, we run those entry functions to emit data into event queues.
type AuxLevel2Event struct {
	Bids []*AuxLevel2Event_Level `json:"bids"`
	Asks []*AuxLevel2Event_Level `json:"asks"`
}

type AuxOpenOrderEventInfo struct {
	Id                string     `json:"id"`
	CilentOrderId     string     `json:"client_order_id"`
	Price             JsonUint64 `json:"price"`
	Quantity          JsonUint64 `json:"quantity"`
	AuxAuToBurnPerLot JsonUint64 `json:"aux_au_to_burn_per_lot"`
	IsBid             bool       `json:"is_bid"`
	OwnerId           Address    `json:"order_id"`
	TimeoutTimestamp  JsonUint64 `json:"timeout_timestsamp"`
	OrderType         JsonUint64 `json:"order_type"`
	Timestamp         JsonUint64 `json:"timestamp"`
}

type AuxAllOrdersEvent struct {
	Bids [][]*AuxOpenOrderEventInfo `json:"bids"`
	Asks [][]*AuxOpenOrderEventInfo `json:"asks"`
}
