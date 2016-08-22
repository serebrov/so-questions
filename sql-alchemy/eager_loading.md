*TLDR:*

I think the `joinedload` strategy should be used where possible, as it is more efficient than other strategies, including the suggested in the question strategy to load related data using the "IN" statement.

The "IN" strategy can be easily enough implemented "outside" of the SQLAlchemy (see the code below) and probably it should not be complex to implement it as a new loading strategy (as logically it is similar to existing `subqueryload` strategy).

*Full version:*

I started with a simple experiment to see the queries produced by different strategies

The full source code of the experiment is [on Github](https://github.com/serebrov/so-questions/blob/master/sql-alchemy/eager_loading.py).

My models look this way:

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

Now, the tests, first is **lazy** loading:

    books = session.query(Book).all()
    print books[0].author.name
    session.commit()

Output (cleaned up):

    -------------Lazy--------------
    sqlalchemy.engine.base.Engine:
    SELECT
      books.id AS books_id, books.name AS books_name, books.author_id AS books_author_id
    FROM books

    SELECT
      authors.id AS authors_id, authors.name AS authors_name
    FROM authors
    WHERE authors.id = ?
    INFO:sqlalchemy.engine.base.Engine:(1,)
    author1

As expected, lazy loading runs one query to fetch books and one query each time we access an author.

**Subquery** loading:

    books = session.query(Book).options(subqueryload(Book.author)).all()
    print books[0].author.name
    session.commit()

    -------------Subquery----------
    SELECT
      books.id AS books_id, books.name AS books_name, books.author_id AS books_author_id
    FROM books

    SELECT
      authors.id AS authors_id, authors.name AS authors_name,
      anon_1.books_author_id AS anon_1_books_author_id
    FROM (
      SELECT DISTINCT books.author_id AS books_author_id
      FROM books) AS anon_1
    JOIN authors
      ON authors.id = anon_1.books_author_id
    ORDER BY anon_1.books_author_id
    author1

For the subquery, we have two queries, first fetches books and another fetches authors using the subquery.

**Joined** loading:

    books = session.query(Book).options(joinedload(Book.author)).all()
    print books[0].author.name
    session.commit()

    -------------Joined------------
    SELECT
      books.id AS books_id, books.name AS books_name,
      books.author_id AS books_author_id,
      authors_1.id AS authors_1_id, authors_1.name AS authors_1_name
    FROM books
    LEFT OUTER JOIN authors AS authors_1 ON authors_1.id = books.author_id
    author1

The joined strategy runs just one query to fetch both books and authors.

**Immediate** loading:

    books = session.query(Book).options(immediateload(Book.author)).all()
    print books[0].author.name
    session.commit()

    -------------Immediate---------
    SELECT
       books.id AS books_id, books.name AS books_name, books.author_id AS books_author_id
    FROM books

    SELECT
      authors.id AS authors_id, authors.name AS authors_name
    FROM authors
    WHERE authors.id = ?
    INFO:sqlalchemy.engine.base.Engine:(1,)

    SELECT authors.id AS authors_id, authors.name AS authors_name
    FROM authors
    WHERE authors.id = ?
    INFO:sqlalchemy.engine.base.Engine:(2,)

    author1

And the `immediate` strategy loads books with the first query and then, when we try to access the relation, fetches all the related data with separate query for each related record.

It looks that "joinedload()" should be most efficient in most cases (amd more efficient than "IN" strategy) - we just get all the data with single query.

Now, lets try to implement the **IN** strategy outside of SQL alchemy:


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

Output:

    -------------IN----------------
    SELECT
      books.id AS books_id, books.name AS books_name, books.author_id AS books_author_id
    FROM books

    SELECT authors.id AS authors_id, authors.name AS authors_name
    FROM authors
    WHERE authors.id IN (?, ?)
    INFO:sqlalchemy.engine.base.Engine:(1, 2)

    author1
    author1
    author2
    author2

As we can see, it runs two queries and then we can access all the authors.

Note that we don't join authors to books explicitly, but it still works when we try to access authors through the books, since SQLAlchemy finds author records in the internal identity map and doesn't run additional DB queries.

The "IN" strategy code similar to above can be generalized into the function which can be used with any model / relation.  And probably, the "IN" strategy should be relatively easy to implement as a new SQLAlchemy strategy, it is similar to the existing `subqueryloading` - it also should run the second query to get the related data.
