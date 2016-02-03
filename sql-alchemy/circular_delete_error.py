from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from sqlalchemy import Column, Integer, String, Text
from sqlalchemy import ForeignKey, Sequence
from sqlalchemy.orm import relationship, backref
from sqlalchemy.schema import Table

from base import ModelBase, get_sql_table_data

# http://stackoverflow.com/questions/34945722/flask-sqlalchemy-many-to-many-adjacency-list-changes-after-commit/34950945?noredirect=1

import sqlalchemy as db
from sqlalchemy.ext.declarative import declared_attr

Model = ModelBase


class HasID(object):
    @declared_attr
    def id(cls):
        return Column('id', Integer, Sequence('test_id_seq'), primary_key=True)

class TestParent(HasID, Model):
    __tablename__ = 'tests'
    discriminator = Column(String(50))
    __mapper_args__ = {'polymorphic_on': discriminator}


class FooTest(TestParent):
    __tablename__ = 'footests'
    __mapper_args__ = {'polymorphic_identity': 'footests'}
    id = Column(Integer, ForeignKey('tests.id'), primary_key=True)
    parent_id = Column(Integer, ForeignKey('footests.id'))
    children = relationship('FooTest',
                            foreign_keys='FooTest.id',
                            lazy='joined',
                            join_depth=2,
                            cascade='save-update, merge, delete, delete-orphan')

class BarTest(TestParent):
    __tablename__ = 'bartests'
    __mapper_args__ = {'polymorphic_identity': 'bartests'}
    id = Column(Integer, ForeignKey('tests.id'), primary_key=True)


if __name__ == "__main__":
    engine = create_engine("sqlite://")
    ModelBase.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db_session = Session()

    foo1 = FooTest()
    db_session.add(foo1)
    db_session.commit()

    foo2 = FooTest(parent_id=foo1.id)
    foo3 = FooTest(parent_id=foo1.id)
    db_session.add(foo2)
    db_session.add(foo3)
    db_session.commit()

    bar = BarTest()
    db_session.add(bar)
    db_session.commit()

    print get_sql_table_data(db_session, TestParent)
    #print get_sql_table_data(db_session, BarTest)

    mytest = db_session.query(TestParent).get(bar.id) # is an instance of BarTest
    db_session.delete(mytest)
    db_session.commit()

    #print get_sql_table_data(db_session, BarTest)
