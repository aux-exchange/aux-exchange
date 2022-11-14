import pandas as pd
import dask.dataframe as dd

df = pd.read_sql(
    'select * from bars_6s',
    'postgresql://materialize@localhost:6875/materialize'
)
df.sort_values(['symbol', 'start'])

# dask requires sqlalchemy which currently has some incompatibility with materialize
# df = dd.read_sql('bars_6s', 'postgresql://materialize@localhost:6875/materialize',
# index_col='symbol'
# )

print(df)