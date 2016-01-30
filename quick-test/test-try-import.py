class app:
    config = dict()

try:
    import local_config
    app.config['SQLALCHEMY_DATABASE_URI'] = local_config.DB_URI
except ImportError:
    print "No Local config, use defaults"
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://username:password@localhost/dbname'

print app.config
