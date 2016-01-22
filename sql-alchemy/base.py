import sys

from collections import Iterable

from sqlalchemy import inspect
from sqlalchemy.ext.declarative import declarative_base

from sqlalchemy import Column, Integer, BigInteger
from sqlalchemy import String, Text, DateTime, Boolean
from sqlalchemy import ForeignKey, UniqueConstraint, CheckConstraint, Index
from sqlalchemy import text


PY3 = sys.version_info[0] == 3
if PY3:
    def iteritems(d):
        return iter(d.items())
    string_types = (str,)
else:
    def iteritems(d):
        return d.iteritems()
    string_types = (str, unicode)


def is_sequence(obj):
    """Test if `obj` is an iterable but not ``dict`` or ``str``. Mainly used to
    determine if `obj` can be treated like a ``list`` for iteration purposes.
    """
    return (isinstance(obj, Iterable) and
            not isinstance(obj, string_types) and
            not isinstance(obj, dict))


def get_mapper_class(model, field):
    """Return mapper class given ORM model and field string."""
    relation = getattr(model, field)
    return relation.property.mapper.class_


class ModelProto(object):
    """
    Based on https://github.com/dgilland/alchy/blob/develop/alchy/model.py
    """

    # def __init__(self, *args, **kargs):
    #     """Initialize model instance by calling :meth:`update`."""
    #     self.update(*args, **kargs)

    def __repr__(self):  # pragma: no cover
        values = ', '.join(['{0}={1}'.format(c, repr(getattr(self, c)))
                            for c in self.columns()])
        return '<{0}({1})>'.format(self.__class__.__name__, values)

    def update(self, data_dict=None, **kargs):
        """Update model with arbitrary set of data."""

        data = data_dict if isinstance(data_dict, dict) else kargs

        for field, value in iteritems(data):
            if hasattr(self, field):
                self._set_field(field, value)

    def _set_field(self, field, value):
        """Set model field with value."""
        # Consider value a dict if any of its elements are a dict.
        if is_sequence(value):
            is_dict = any([isinstance(val, dict) for val in value])
        else:
            is_dict = isinstance(value, dict)

        attr = getattr(self, field)

        if (hasattr(attr, 'update') and
                value and
                is_dict and
                not isinstance(attr, dict)):
            # Nest calls to attr.update.
            attr.update(value)
        else:
            if field in self.relationships():
                self._set_relationship_field(field, value)
            else:
                setattr(self, field, value)

    def _set_relationship_field(self, field, value):
        """Set model relationships field with value."""
        relationship_class = get_mapper_class(self.__class__, field)
        is_sequence_relationship = is_sequence(getattr(self, field))

        if is_sequence_relationship and is_sequence(value):
            # Convert each value instance to relationship class.
            value = [relationship_class(val) if isinstance(val, dict)
                     else val
                     for val in value]
        elif not value and isinstance(value, dict):
            # If value is {} and we're trying to update a relationship
            # attribute, then we need to set to None to nullify relationship
            # value.
            value = None
        elif not is_sequence_relationship and isinstance(value, dict):
            # Convert single value to relationship class.
            value = relationship_class(value)

        setattr(self, field, value)

    @property
    def __to_dict__(self):
        return set(self.descriptor_dict.keys())

    @property
    def descriptor_dict(self):
        """Return :attr:`__dict__` key-filtered by :attr:`descriptors`."""
        return dict([(key, value)
                     for key, value in iteritems(self.__dict__)
                     if key in self.descriptors()])

    def to_dict(self, parent_relations=None):
        """Return dict representation of model by filtering fields using
        :attr:`__to_dict__`.
        """
        data = {}
        relationships = self.relationships()
        #print relationships, dir(self), self.__table__.name
        parent_relations = parent_relations or set()
        parent_relations.add(self.__table__.name)
        #print parent_relations

        for field in self.__to_dict__:
            value = getattr(self, field)

            if field in relationships and field in parent_relations:
                # skip parent relations to avoid infinite recursion
                continue

            # Nest calls to `to_dict`. Try to find method on base value,
            # sequence values, or dict values.
            if hasattr(value, 'to_dict'):
                value = value.to_dict(parent_relations)
            elif is_sequence(value):
                value = [v.to_dict(parent_relations) if hasattr(v, 'to_dict') else v
                         for v in value]
            elif isinstance(value, dict):
                value = dict([(k, v.to_dict(parent_relations) if hasattr(v, 'to_dict') else v)
                              for k, v in iteritems(value)])
            elif field in relationships and value is None:
                value = {}

            data[field] = value

        return data

    def __iter__(self):
        """Implement ``__iter__`` so model can be converted to dict via
        ``dict()``.
        """
        return iteritems(self.to_dict())

    ##
    # SQLAlchemy.inspect() based methods/properties
    ##

    @classmethod
    def primary_key(cls):
        """Return primary key as either single column (one primary key) or
        tuple otherwise.
        """
        primary = inspect(cls).primary_key

        if len(primary) == 1:
            primary = primary[0]

        return primary

    @classmethod
    def primary_keys(cls):
        """Return primary keys as tuple."""
        return inspect(cls).primary_key

    @classmethod
    def primary_attrs(cls):
        """Return class attributes from primary keys."""
        primary_keys = cls.primary_keys()
        return [getattr(cls, attr)
                for attr in cls.columns()
                if getattr(cls, attr).property.columns[0] in primary_keys]

    @classmethod
    def attrs(cls):
        """Return ORM attributes"""
        return inspect(cls).attrs.keys()

    @classmethod
    def descriptors(cls):
        """Return all ORM descriptors"""
        # pylint: disable=maybe-no-member
        return [descr for descr in inspect(cls).all_orm_descriptors.keys()
                if not descr.startswith('__')]

    @classmethod
    def relationships(cls):
        """Return ORM relationships"""
        return inspect(cls).relationships.keys()

    @classmethod
    def column_attrs(cls):
        """Return table columns as list of class attributes at the class level.
        """
        return inspect(cls).column_attrs

    @classmethod
    def columns(cls):
        """Return table columns."""
        return inspect(cls).columns.keys()


def get_sql_table_data(session, table_object, order_by='id'):
    tab_data = session.query(table_object).order_by(order_by).all()
    data = []
    for record in tab_data:
        data.append(record.to_dict())
    return data


ModelBase = declarative_base(cls=ModelProto)
