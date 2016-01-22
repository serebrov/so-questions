from sqlalchemy import Column, Integer, Boolean
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, backref
from sqlalchemy.schema import Table

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from base import ModelBase, get_sql_table_data

customer_organization = Table(
    'base_user_customer_organization', ModelBase.metadata,
    Column('user_id', Integer, ForeignKey('base_user.id')),
    Column('org_id', Integer, ForeignKey('base_user.id'))
)


class BaseUser(ModelBase):
    __tablename__ = 'base_user'

    id = Column(Integer, primary_key=True, nullable=False)
    org = Column(Boolean, default=False, nullable=False)
    # Shared Fields
    __mapper_args__ = {
        'polymorphic_on': org,
    }
    customers = relationship(
        "BaseUser",
        backref=backref('organization', order_by=id),
        secondary=customer_organization,
        primaryjoin=id == customer_organization.c.org_id and org is True,
        secondaryjoin=id == customer_organization.c.user_id and org is False
    )


class CustomerUser(BaseUser):
    # Customer Fields
    __mapper_args__ = {
        'polymorphic_identity': False
    }


class OrganizationUser(BaseUser):
    # Organization Fields
    __mapper_args__ = {
        'polymorphic_identity': True
    }


if __name__ == "__main__":
    engine = create_engine("sqlite://")
    ModelBase.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    sql = Session()

    #sql = sqldb.get_session()
    customer1 = CustomerUser()
    sql.add(customer1)
    customer2 = CustomerUser()
    sql.add(customer2)
    organization = OrganizationUser()
    organization.customers = [customer1, customer2]
    sql.add(organization)
    sql.commit()
    print get_sql_table_data(sql, BaseUser)
    print organization.customers
    print customer1.organization
    print customer2.organization
