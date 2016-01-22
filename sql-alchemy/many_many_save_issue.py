from sqlalchemy import Column, Integer, String
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, backref
from sqlalchemy.schema import Table

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from base import ModelBase, get_sql_table_data


class BodyPart(ModelBase):
    __tablename__ = 'body_part'

    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String)


operation_to_operation = Table(
    "preventing_operations", ModelBase.metadata,
    Column("id", Integer, primary_key=True),
    Column("preventing_operation_id", Integer, ForeignKey("operation.id")),
    Column("prevents_operation_id", Integer, ForeignKey("operation.id")))

class Operation(ModelBase):
    __tablename__ = 'operation'
    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String)

    bodypart_id = Column(Integer, ForeignKey(BodyPart.id))
    bodypart = relationship("BodyPart", backref="operations")

    prevents = relationship(
        "Operation",
        secondary=operation_to_operation,
        primaryjoin=id == operation_to_operation.c.preventing_operation_id,
        secondaryjoin=id == operation_to_operation.c.prevents_operation_id,
        # foreign_keys=[
        #     # operation_to_operation_association_table.c.preventing_operation_id
        #     operation_to_operation_association_table.c.prevents_operation_id
        # ],
        backref="prevented_by")


if __name__ == "__main__":
    engine = create_engine("sqlite://")
    ModelBase.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    bp = BodyPart(name="liver")
    session.add(bp)
    session.commit()
    o1 = Operation(name="viewing", bodypart=bp)
    o2 = Operation(name="removing", bodypart=bp)
    session.add_all([o1, o2])
    session.commit()
    print o1, o2
    print o1.prevents, o2.prevents
    o2.prevents.append(o1)
    print o1.prevents, o2.prevents
    session.commit()
    print o1.prevents, o2.prevents
