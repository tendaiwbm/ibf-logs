psql -U tendaiwbm -f sweep-db.sql
psql -U tendaiwbm -f 01-setup-db.sql
python3 02-insert-logs.py
psql -U tendaiwbm -d ibf-logs -f 03-filter-prod.sql
