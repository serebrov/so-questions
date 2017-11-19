from sqlalchemy import create_engine
from sqlalchemy import Table, MetaData, Column, Integer, String
from sqlalchemy.orm import mapper, sessionmaker

from base import get_sql_table_data

metadata = MetaData()


class DataObject(object):

    def __init__(self):
        self.id = 1
        self.data = {'name': 'Joe Doe', 'age': 24}

    @property
    def name(self):
        __import__('ipdb').set_trace()
        return self.data['name']

    @name.setter
    def name(self, value):
        __import__('ipdb').set_trace()
        self.data['name'] = value

    @property
    def age(self):
        return self.data['age']

    def __getstate__(self):
        d = self.__dict__.copy()
        for key in self.__dict__["data"].keys():
            d[key] = self.__dict__["data"][key]
        return d


table = Table("my_table", metadata,
              Column("id", Integer, primary_key=True),
              Column("name", String),
              Column("age", Integer)
)


mapper(DataObject, table, properties={
    "name": table.c.name,
    "age": table.c.age,
})


if __name__ == "__main__":
    engine = create_engine("sqlite://")
    metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    do = DataObject()
    __import__('ipdb').set_trace()
    session.add(do)
    session.commit()

    data = session.query(table).all()
    for item in data:
        print(item)
