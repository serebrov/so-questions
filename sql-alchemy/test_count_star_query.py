from sqlalchemy import Column, Integer, String, Boolean, and_, func
from sqlalchemy import ForeignKey

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from base import ModelBase


class Song(ModelBase):
    __tablename__ = 'song'

    id = Column(Integer, primary_key=True, nullable=False)
    title = Column(String, nullable=False)
    genre = Column(String, nullable=False)

class User(ModelBase):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String, nullable=False)

class UserSong(ModelBase):
    __tablename__ = 'user_song'

    user_id = Column(Integer, ForeignKey('user.id'), primary_key=True, nullable=False)
    song_id = Column(Integer, ForeignKey('song.id'), primary_key=True, nullable=False)
    is_liked = Column(Boolean, nullable=False)


if __name__ == "__main__":
    engine = create_engine("sqlite://")
    ModelBase.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    user = User(name='user')
    session.add(user)

    song1 = Song(title='song1', genre='pop')
    song2 = Song(title='song2', genre='rock')
    song3 = Song(title='song3', genre='jazz')
    song4 = Song(title='song4', genre='rock')
    session.add_all([song1, song2, song3, song4])
    session.commit()

    user_song1 = UserSong(user_id=user.id, song_id=song1.id, is_liked=False)
    user_song2 = UserSong(user_id=user.id, song_id=song2.id, is_liked=True)
    user_song3 = UserSong(user_id=user.id, song_id=song4.id, is_liked=True)

    session.add_all([user_song1, user_song2, user_song3])
    session.commit()

    query = session.query(UserSong)
    query = query.join(Song, Song.id == UserSong.song_id)
    query = query.filter(
        and_(
            UserSong.user_id == user.id, 
            UserSong.is_liked.is_(True),
            Song.genre == 'rock'
        )
    )
    # Note: important to place `with_entities` after the join
    query = query.with_entities(func.count())
    liked_count = query.scalar()

    print liked_count

