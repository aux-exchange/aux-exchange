import datetime
from confluent_kafka import Consumer
import json
import uuid
from clickhouse_driver import Client
import re

def camel_to_snake(s):
    return ''.join(['_'+c.lower() if c.isupper() else c for c in s]).lstrip('_')

c = Consumer({
    'bootstrap.servers': 'localhost:9092',
    'group.id': uuid.uuid4(),
    'auto.offset.reset': 'earliest'
})

c.subscribe(['swaps'])

data = []
while len(data) < 1000:
    msg = c.poll(1.0)

    if msg is None:
        continue
    if msg.error():
        print("Consumer error: {}".format(msg.error()))
        continue

    d = json.loads(msg.value().decode('utf-8'))
    d['timestamp'] = datetime.datetime.utcfromtimestamp(d['timestamp'] / (1000 * 1000))
    orig_keys = list(d.keys())
    for orig_key in orig_keys:
        d[camel_to_snake(orig_key)] = d[orig_key]
        if camel_to_snake(orig_key) != orig_key:
            del d[orig_key]
    print(d)

    data.append(d)

client = Client(host = 'localhost')
client.execute(
    'insert into swaps (kind, pool_type, sequence_number, timestamp, sender, coin_type_in, coin_type_out, fee_bps, amount_in, amount_out, reserve_in, reserve_out) values',
    data 
)

print(data)

c.close()
