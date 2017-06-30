from sqlalchemy import __version__
from sqlalchemy import create_engine, ForeignKey, Column, Integer, String
from sqlalchemy.orm import relationship, backref, contains_eager, sessionmaker
from sqlalchemy.ext.declarative import declarative_base

ModelBase = declarative_base()


class Author(ModelBase):
    __tablename__ = 'authors'
    _id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String(255))


class Book(ModelBase):
    __tablename__ = 'books'
    _id = Column(Integer, primary_key=True)
    name = Column(String)
    author_id = Column(Integer, ForeignKey('authors._id'))
    author = relationship(
        'Author', backref=backref('books'))


if __name__ == "__main__":
    print('SQLAlchemy version', __version__)
    engine = create_engine("sqlite://")
    ModelBase.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    author = Author(name="author1")
    session.add(author)
    session.commit()

    book1 = Book(name="book_a1_1", author_id=author._id)
    session.add(book1)
    book2 = Book(name="book_a1_2", author_id=author._id)
    session.add(book2)
    session.commit()

    query = session.query(Author)
    query = query.join(Author.books)
    query = query.options(contains_eager(Author.books))
    query = query.filter(Book._id == book1._id)
    print(query.one().books)
    assert query.one().books[0]._id == book1._id

    query = session.query(Author)
    # it works with populate_existing()
    # query = session.query(Author).populate_existing()
    query = query.join(Author.books)
    query = query.options(contains_eager(Author.books))
    query = query.filter(Book._id == book2._id)
    print(query.one().books)
    assert query.one().books[0]._id == book2._id
