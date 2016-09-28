from sqlalchemy import Column, Integer, String, Text
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, backref
from sqlalchemy.orm import subqueryload, joinedload, immediateload, aliased
from sqlalchemy.schema import Table

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from base import ModelBase, get_sql_table_data

import logging


class Author(ModelBase):
    __tablename__ = 'authors'
    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String(255))


if __name__ == "__main__":
    engine = create_engine("sqlite://")
    ModelBase.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    author1 = Author(name="author1")
    session.add(author1)
    author2 = Author(name="author2")
    session.add(author2)
    session.commit()

    print(session.query(Author).all())

    query = session.query(Author.id)
    print(query)
    records = query.all()
    # do we do another select here to get the name?
    # no, we just have [(1,), (2,)]
    print(records)

    # Now the query which may be useful if we want to group / order something
    # in a subquery and then get the full data
    # The subquery can return only ids and we then join the same table again to
    # get the full data:
    # SELECT authors.*
    # FROM (
    #   SELECT authors.id FROM authors
    # ) as sub_authors
    # JOIN authors on authors.id = sub_authors.id
    query = session.query(Author.id)
    #query = query.add_entity(Author).from_self()
    author_data = aliased(Author)
    query = query.from_self(author_data)
    query = query.join(author_data, author_data.id==Author.id)
    print(query)
    records = query.all()
    print(records)

