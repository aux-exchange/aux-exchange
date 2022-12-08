import pandas as pd
import dask.dataframe as dd

df = pd.read_sql(
    'select * from sum_amount_in',
    'postgresql://materialize@localhost:6875/materialize'
)

# dask requires sqlalchemy which currently has some incompatibility with materialize
# df = dd.read_sql('bars_6s', 'postgresql://materialize@localhost:6875/materialize',
# index_col='symbol'
# )

print(df)