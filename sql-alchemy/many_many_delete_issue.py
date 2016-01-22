from sqlalchemy import Column, Integer, String, Text
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, backref
from sqlalchemy.schema import Table

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from base import ModelBase, get_sql_table_data

# http://stackoverflow.com/questions/34945722/flask-sqlalchemy-many-to-many-adjacency-list-changes-after-commit/34950945?noredirect=1


class User(ModelBase):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String(255))


class Post(ModelBase):
    __tablename__ = 'posts'
    id = Column(Integer, primary_key=True)
    body = Column(Text)
    user_id = Column(Integer, ForeignKey('users.id'))
    # tasks = relationship('Task', secondary='tasks_posts')
            # backref=backref('post', lazy='joined'))
            # lazy='dynamic', cascade='all, delete-orphan')
            # single_parent=True)


class Task(ModelBase):
    __tablename__ = 'tasks'
    id = Column(Integer, primary_key=True)
    title = Column(String(24))
    description = Column(String(64))
    user_id = Column(Integer, ForeignKey('users.id'))
    posts = relationship(
        'Post', secondary='tasks_posts',
        lazy='dynamic',
        backref=backref('tasks', lazy='joined'))
            # backref=backref('task', lazy='joined'))
            # lazy='dynamic', cascade='all, delete-orphan')
            #single_parent=True)


tasks_posts = Table('tasks_posts', ModelBase.metadata,
        Column('task_id', Integer, ForeignKey('tasks.id')),
        Column('post_id', Integer, ForeignKey('posts.id'))
        )

def delete_task(session, id):
    task = session.query(Task).get(id)
    session.delete(task)
    session.commit()

def delete_post(session, id):
    post = session.query(Post).get(id)
    session.delete(post)
    session.commit()

if __name__ == "__main__":
    engine = create_engine("sqlite://")
    ModelBase.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    user = User(name="user")
    session.add(user)
    session.commit()

    task1 = Task(title="task1", description="?", user_id=user.id)
    session.add(task1)
    session.commit()

    delete_task(session, task1.id)
    print get_sql_table_data(session, Task)

    task2 = Task(title="task1", description="?", user_id=user.id)
    session.add(task2)

    post1 = Post(body="post1", user_id=user.id)
    session.add(post1)
    post2 = Post(body="post2", user_id=user.id)
    session.add(post2)
    task2.posts = [post1, post2]
    session.commit()
    print post1.tasks, task2.posts
    print 'Task:', get_sql_table_data(session, Task)
    print 'Post:', get_sql_table_data(session, Post)
    # print get_sql_table_data(session, tasks_posts)

    delete_task(session, task2.id)
    print 'Task:', get_sql_table_data(session, Task)
    print 'Post:', get_sql_table_data(session, Post)
    # print get_sql_table_data(session, tasks_posts)

    post3 = Post(body="post3", user_id=user.id)
    session.add(post3)

    task3 = Task(title="task3", description="?", user_id=user.id)
    session.add(task3)
    task4 = Task(title="task4", description="?", user_id=user.id)
    session.add(task4)

    post3.tasks = [task3, task4]
    session.commit()
    print 'Task:', get_sql_table_data(session, Task)
    print 'Post:', get_sql_table_data(session, Post)
    # print get_sql_table_data(session, tasks_posts)

    delete_post(session, post3.id)
    print 'Task:', get_sql_table_data(session, Task)
    print 'Post:', get_sql_table_data(session, Post)
