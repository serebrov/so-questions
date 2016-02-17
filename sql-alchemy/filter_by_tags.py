# see http://stackoverflow.com/questions/35447296/trying-to-filter-by-an-intermediate-table

from sqlalchemy import Column, Integer, String
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, backref, joinedload
from sqlalchemy.schema import Table

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from base import ModelBase, get_sql_table_data

class Subsidiary(ModelBase):
    __tablename__ = 'subsidiary'

    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String)

class Tag(ModelBase):
    __tablename__ = 'tag'
    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String)

tags_by_commerce = Table(
    "tags_by_commerce", ModelBase.metadata,
    Column("id_commerce", Integer, ForeignKey("commerce.id")),
    Column("id_tag", Integer, ForeignKey("tag.id")))

class Commerce(ModelBase):
    __tablename__ = 'commerce'

    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String)
    subsidiary_id = Column(Integer, ForeignKey('subsidiary.id'))
    subsidiary = relationship("Subsidiary", backref="commerce")
    tags = relationship("Tag", secondary=tags_by_commerce)


if __name__ == "__main__":
    engine = create_engine("sqlite://")
    ModelBase.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    sub1 = Subsidiary(name="sub1")
    sub2 = Subsidiary(name="sub2")
    session.add_all([sub1, sub2])
    session.commit()

    tag1 = Tag(name="tag1")
    tag2 = Tag(name="tag2")
    session.add_all([tag1, tag2])
    session.commit()

    comm1 = Commerce(name="comm1", subsidiary=sub1)
    comm2 = Commerce(name="comm2", subsidiary=sub1)
    comm3 = Commerce(name="comm3", subsidiary=sub2)
    comm1.tags = [tag1, tag2]
    comm2.tags = [tag2]
    comm3.tags = [tag2]
    session.add_all([comm1, comm2, comm3])
    session.commit()

    print get_sql_table_data(session, Subsidiary)
    print get_sql_table_data(session, Commerce)
    print get_sql_table_data(session, Tag)

    subsidiaries = session.query(Subsidiary)\
                    .options(joinedload(Subsidiary.commerce)\
                             .joinedload(Commerce.tags)).all()
    print 'All Subs: ', subsidiaries

    subsidiaries = session.query(Subsidiary)\
                    .options(joinedload(Subsidiary.commerce)\
                             .joinedload(Commerce.tags))\
                    .filter(Tag.id == tag1.id)
    print 'Filtered Subs: ', subsidiaries
    # SELECT subsidiary.id AS subsidiary_id, subsidiary.name AS subsidiary_name,
    #        tag_1.id AS tag_1_id, tag_1.name AS tag_1_name,
    #        commerce_1.id AS commerce_1_id, commerce_1.name AS commerce_1_name,
    #        commerce_1.subsidiary_id AS commerce_1_subsidiary_id
    # FROM tag, subsidiary
    # LEFT OUTER JOIN commerce AS commerce_1 ON subsidiary.id = commerce_1.subsidiary_id
    # LEFT OUTER JOIN (
    #     tags_by_commerce AS tags_by_commerce_1
    #     JOIN tag AS tag_1 ON tag_1.id = tags_by_commerce_1.id_tag
    # ) ON commerce_1.id = tags_by_commerce_1.id_commerce
    # WHERE tag.id = :id_1
    print 'Filtered Subs data: ', subsidiaries.all()
    # Filtered Subs data:  [<Subsidiary(id=1, name=u'sub1')>, <Subsidiary(id=2, name=u'sub2')>]

    subsidiaries = session.query(Subsidiary)\
                    .join(Subsidiary.commerce)\
                    .join(Commerce.tags)\
                    .filter(Tag.id == tag1.id)
    print '3 - Filtered Subs: ', subsidiaries
    # SELECT subsidiary.id AS subsidiary_id, subsidiary.name AS subsidiary_name
    # FROM subsidiary JOIN commerce ON subsidiary.id = commerce.subsidiary_id
    # JOIN tags_by_commerce AS tags_by_commerce_1 ON commerce.id = tags_by_commerce_1.id_commerce
    # JOIN tag ON tag.id = tags_by_commerce_1.id_tag
    # WHERE tag.id = :id_1
    print '3 - Filtered Subs data: ', subsidiaries.all()
    # 3 - Filtered Subs data:  [<Subsidiary(id=1, name=u'sub1')>]
