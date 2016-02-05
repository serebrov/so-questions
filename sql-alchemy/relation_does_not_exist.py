import sqlalchemy as sa

engine = sa.create_engine('postgresql+psycopg2://postgres:root@localhost/test')

metadata = sa.MetaData()

# Real table has more columns
mytable = sa.Table(
    'my_temp_table', metadata,
    sa.Column('id', sa.Integer, primary_key=True),
    sa.Column('something', sa.String(200)),
    prefixes=['TEMPORARY'],
)

metadata.create_all(engine)

conn = engine.connect()

# pg_conn = engine.raw_connection()
# with pg_conn.cursor() as cursor:
with conn.connection.cursor() as cursor:
    cursor.copy_expert('''COPY my_temp_table (id, something)
                          FROM STDIN WITH CSV''',
                       open('somecsvfile', 'r'))
# print dir(pg_conn.connection)
# result = pg_conn.connection.execute(sa.text('SELECT count(*) FROM my_temp_table'))

# connection doesn't see my_temp_table if we create it before
# metadata.create_all()
# but also it doesn't see it if the code above (with cursor) is executed
# can it destroy the table? so there is actually no such table anymore?
# conn = engine.connect()
# print conn.get_isolation_level()
#conn.commit()
result = conn.execute(sa.text('SELECT count(*) FROM my_temp_table'))
