CREATE TABLE production_filtered AS (
	SELECT * FROM logs
	WHERE configuration = 'production'
);

CREATE OR REPLACE FUNCTION check_prod_filter()
RETURNS void AS
$$

DECLARE
	count_  INTEGER;
BEGIN
	SELECT COUNT(DISTINCT(configuration))
       	INTO count_
	FROM production_filtered;
	ASSERT count_ = 1, 'Non-production data present in table production_filtered';
END
$$
LANGUAGE plpgsql;

DO $$
BEGIN
   PERFORM check_prod_filter();
END $$
