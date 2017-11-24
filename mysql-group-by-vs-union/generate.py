from random import randint

"""
See https://stackoverflow.com/questions/47471521/union-vs-group-by-or-better-solution#47471521

Use as:
   python generate.py > test.sql
   cat test.sql | mysql -umyuser
"""

create_statement = """
DROP DATABASE IF EXISTS temp;
CREATE DATABASE temp;
USE temp;

CREATE TABLE MyTable (columnOne integer, columnTwo integer) ENGINE InnoDB;

CREATE INDEX col_two_one_idx on MyTable(columnTwo, columnOne);
"""

inserts = ["insert into MyTable (columnOne, columnTwo) values"]
num_col_two = 600*7
num_col_one = 30*7

for col_two in range(1, num_col_two):
    for row in range(1, num_col_one):
        col_one = randint(1, num_col_two*num_col_one)
        inserts.append("""({}, {}),""".format(col_one, col_two))
inserts[-1] = inserts[-1][:-1] + ";"

print(create_statement)
print("\n".join(inserts))

"""
mysql> SELECT MIN(columnOne), columnTwo FROM MyTable WHERE columnTwo IN (1,2,3) GROUP BY columnTwo;
+----------------+-----------+
| MIN(columnOne) | columnTwo |
+----------------+-----------+
|           2694 |         1 |
|           3172 |         2 |
|          11088 |         3 |
+----------------+-----------+
3 rows in set (0.00 sec)

mysql> EXPLAIN SELECT MIN(columnOne), columnTwo FROM MyTable WHERE columnTwo IN (1,2,3) GROUP BY columnTwo;
+----+-------------+---------+------------+-------+-----------------+-----------------+---------+------+------+----------+--------------------------+
| id | select_type | table   | partitions | type  | possible_keys   | key             | key_len | ref  | rows | filtered | Extra                    |
+----+-------------+---------+------------+-------+-----------------+-----------------+---------+------+------+----------+--------------------------+
|  1 | SIMPLE      | MyTable | NULL       | range | col_two_one_idx | col_two_one_idx | 5       | NULL |  627 |   100.00 | Using where; Using index |
+----+-------------+---------+------------+-------+-----------------+-----------------+---------+------+------+----------+--------------------------+
1 row in set, 1 warning (0.00 sec)

SELECT MIN(columnOne), columnTwo FROM MyTable WHERE columnTwo = 1
UNION
SELECT MIN(columnOne), columnTwo FROM MyTable WHERE columnTwo = 2
UNION
SELECT MIN(columnOne), columnTwo FROM MyTable WHERE columnTwo = 3;

mysql> SELECT MIN(columnOne), columnTwo FROM MyTable WHERE columnTwo = 1 UNION SELECT MIN(columnOne), columnTwo FROM MyTable WHERE columnTwo = 2 UNION SELECT MIN(columnOne), columnTwo FROM MyTable WHERE columnTwo = 3;
+----------------+-----------+
| MIN(columnOne) | columnTwo |
+----------------+-----------+
|           7722 |         1 |
|          10776 |         2 |
|          12911 |         3 |
+----------------+-----------+
3 rows in set (0.01 sec)

mysql> EXPLAIN SELECT MIN(columnOne), columnTwo FROM MyTable WHERE columnTwo = 1 UNION SELECT MIN(columnOne), columnTwo FROM MyTable WHERE columnTwo = 2 UNION SELECT MIN(columnOne), columnTwo FROM MyTable WHERE columnTwo = 3;
+----+--------------+--------------+------------+------+-----------------+-----------------+---------+-------+------+----------+-----------------+
| id | select_type  | table        | partitions | type | possible_keys   | key             | key_len | ref   | rows | filtered | Extra           |
+----+--------------+--------------+------------+------+-----------------+-----------------+---------+-------+------+----------+-----------------+
|  1 | PRIMARY      | MyTable      | NULL       | ref  | col_two_one_idx | col_two_one_idx | 5       | const |  209 |   100.00 | Using index     |
|  2 | UNION        | MyTable      | NULL       | ref  | col_two_one_idx | col_two_one_idx | 5       | const |  209 |   100.00 | Using index     |
|  3 | UNION        | MyTable      | NULL       | ref  | col_two_one_idx | col_two_one_idx | 5       | const |  209 |   100.00 | Using index     |
| NULL | UNION RESULT | <union1,2,3> | NULL       | ALL  | NULL            | NULL            | NULL    | NULL  | NULL |     NULL | Using temporary |
+----+--------------+--------------+------------+------+-----------------+-----------------+---------+-------+------+----------+-----------------+
4 rows in set, 1 warning (0.00 sec)

"""
