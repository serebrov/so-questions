from sqlalchemy import Column, Integer, String, Text
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, backref
from sqlalchemy.orm import subqueryload, joinedload, immediateload
from sqlalchemy.schema import Table

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from base import ModelBase, get_sql_table_data

import logging


class Author(ModelBase):
    __tablename__ = 'authors'
    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String(255))


class Book(ModelBase):
    __tablename__ = 'books'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    author_id = Column(Integer, ForeignKey('authors.id'))
    author = relationship(
        'Author', backref=backref('books'))


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

    book1 = Book(name="book_a1_1", author_id=author1.id)
    session.add(book1)
    book2 = Book(name="book_a1_2", author_id=author1.id)
    session.add(book2)
    book3 = Book(name="book_a2_1", author_id=author2.id)
    session.add(book3)
    book4 = Book(name="book_a2_2", author_id=author2.id)
    session.add(book4)
    session.commit()

    logging.basicConfig()
    logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

    print '-------------Lazy--------------'
    books = session.query(Book).all()
    print books[0].author.name
    session.commit()
    print '-------------Subquery----------'
    books = session.query(Book).options(subqueryload(Book.author)).all()
    print books[0].author.name
    session.commit()
    print '-------------Joined------------'
    books = session.query(Book).options(joinedload(Book.author)).all()
    print books[0].author.name
    session.commit()
    print '-------------Immediate---------'
    books = session.query(Book).options(immediateload(Book.author)).all()
    print books[0].author.name
    session.commit()
    print '-------------IN----------------'
    books = session.query(Book).all()
    ids = set()
    for b in books:
        ids.add(b.author_id)
    authors = session.query(Author).filter(Author.id.in_(ids)).all()
    print books[0].author.name
    print books[1].author.name
    print books[2].author.name
    print books[3].author.name

    # session.commit()

