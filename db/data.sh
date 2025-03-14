psql -U $USER -f sweep-db.sql
psql -U $USER -f 01-setup-db.sql
python3 02-insert-logs.py
psql -U $USER -d ibf-logs -f 03-filter-prod.sql
psql -U $USER -d ibf-logs -f 04-separate-pages.sql
psql -U $USER -d ibf-logs -f 050-dashboard-tests.sql
psql -U $USER -d ibf-logs -f 051-num_interactions.sql

