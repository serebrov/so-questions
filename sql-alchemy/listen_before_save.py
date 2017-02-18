from sqlalchemy import Column, Integer, Text

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from sqlalchemy.event import listen

Base = declarative_base()

def hash_method(password):
    return str(list(reversed(password)))


class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    name = Column(Text)
    password = Column(Text)  # should be a hash

    @staticmethod
    def _hash_password(mapper, connection, target):
        user = target
        user.password = hash_method(user.password)


listen(User, 'before_insert', User._hash_password)
listen(User, 'before_update', User._hash_password)


if __name__ == "__main__":
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    user = User()
    user.name = 'test'
    user.password = 'jack'
    session.add(user)
    session.commit()

    Session = sessionmaker(bind=engine)
    session = Session()
    print(session.query(User).one().password)
