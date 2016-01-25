from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from base import ModelBase, get_sql_table_data

# http://stackoverflow.com/questions/34945722/flask-sqlalchemy-many-to-many-adjacency-list-changes-after-commit/34950945?noredirect=1

import sqlalchemy as db
from sqlalchemy.ext.declarative import declared_attr

db.Model = ModelBase


class FilteringMixin(object):
    FILTER_TYPES = {
        'whitelist': 0,
        'blacklist': 1,
    }

    @declared_attr
    def filter_type(cls):
        return db.Column(db.SmallInteger, nullable=False,
                         default=cls.FILTER_TYPES['whitelist'])

    @declared_attr
    def __table_args__(cls):
        return (
             db.CheckConstraint(
                 'filter_type in (%s)' %
                 ','.join(str(t) for t in cls.FILTER_TYPES.values())),
        )


class FilteredConnectionType(FilteringMixin, db.Model):
    CONNECTION_TYPES = {
        'wifi': 0,
        'cellular': 1,
    }

    __tablename__ = 'filtered_connection_types'
    # Changed to db.Integer from db.BigInteger because of SQLite
    id = db.Column(db.Integer, primary_key=True)
    connection_type = db.Column(db.SmallInteger, nullable=False,
                                default=CONNECTION_TYPES['cellular'])

    @declared_attr
    def __table_args__(cls):
        return (
            db.CheckConstraint(cls.connection_type.in_(cls.CONNECTION_TYPES.values())),
        ) + FilteringMixin.__table_args__


if __name__ == "__main__":
    engine = create_engine("sqlite://")
    ModelBase.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    # saves the record with defaults
    conn_type = FilteredConnectionType()
    session.add(conn_type)
    session.commit()
    print get_sql_table_data(session, FilteredConnectionType)

    # raises an error: Check constraint failed
    conn_type = FilteredConnectionType(filter_type=3)
    session.add(conn_type)
    session.commit()

    print get_sql_table_data(session, FilteredConnectionType)
