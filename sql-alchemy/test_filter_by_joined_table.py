from sqlalchemy import Column, Integer, String
from sqlalchemy import ForeignKey, text
from sqlalchemy.orm import relationship, backref
from sqlalchemy.schema import Table

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from base import ModelBase, get_sql_table_data

Base = ModelBase

treatment_association = Table('tr_association', Base.metadata,
    # Issue 1 - Integer here, String in the ChronicTreatment
    # Column('chronic_treatments_id', Integer, ForeignKey('chronic_treatments.code')),
    Column('chronic_treatments_id', Integer, ForeignKey('chronic_treatments.id')),
    Column('animals_id', Integer, ForeignKey('animals.id'))
)

class ChronicTreatment(Base):
    __tablename__ = "chronic_treatments"
    id = Column(Integer, primary_key=True, nullable=False)
    code = Column(String)

class Animal(Base):
    __tablename__ = "animals"
    id = Column(Integer, primary_key=True, nullable=False)
    # Issue 2 treatment is actually 'treatments'
    treatments = relationship("ChronicTreatment", secondary=treatment_association, backref="animals")


if __name__ == "__main__":
    engine = create_engine("sqlite://", echo=False)
    ModelBase.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    treat1 = ChronicTreatment(code="chr1")
    session.add(treat1)
    session.commit()

    treat2 = ChronicTreatment(code="chrFlu")
    session.add(treat2)
    session.commit()

    animal1 = Animal()
    animal1.treatments = [treat1]
    session.add(animal1)
    animal2 = Animal()
    animal2.treatments = [treat2]
    session.add(animal2)
    animal3 = Animal()
    animal3.treatments = [treat1, treat2]
    session.add(animal3)
    session.commit()
    # print Animal.treatments
    # print animal3.treatments

    # print get_sql_table_data(session, Animal)
    # print get_sql_table_data(session, ChronicTreatment)

    animals = session.query(Animal).from_statement(text(
        """
           select distinct animals.* from animals
           left join tr_association assoc on assoc.animals_id = animals.id
           left join chronic_treatments on chronic_treatments.id = assoc.chronic_treatments_id
           where chronic_treatments.code = :code
     """)
    ).params(code='chrFlu')
    # print animals.all()
    for animal in animals:
        print animal.to_dict()
        print animal.treatments

    print '-------------------'

    sql_query = session.query(Animal).join(Animal.treatments).filter(
        ChronicTreatment.code == "chrFlu")
    for animal in sql_query:
        print animal.to_dict()
        print animal.treatments
