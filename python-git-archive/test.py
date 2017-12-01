import git
import tempfile
import os

tempdir = tempfile.mkdtemp()
temppath = os.path.join(tempdir)
print(temppath)
repo = git.Repo.clone_from(
    'https://github.com/serebrov/nodejs-typescript.git',
    to_path=temppath)

with open("archive.zip", "wb") as zipfile:
    repo.archive(zipfile, format='zip')
