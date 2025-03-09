CREATE TABLE production_filtered AS (
	SELECT * FROM logs
	WHERE configuration = 'production'
	AND client_country != 'Netherlands'
);

CREATE OR REPLACE FUNCTION check_prod_filter()
RETURNS void AS
$$
DECLARE
        row_    RECORD;
	count_  INTEGER;
BEGIN
	FOR row_ in
		SELECT DISTINCT(configuration) FROM production_filtered
	LOOP
		ASSERT row_.configuration = 'production', 'Non-production data present in table production_filtered';
	END LOOP;

	SELECT COUNT(*) FROM production_filtered
	INTO count_
	WHERE client_country = 'Netherlands';

	ASSERT count_ = 0, 'Interactions from clients within the Netherlands are still in the logs';
END
$$
LANGUAGE plpgsql;

DO $$
BEGIN
   PERFORM check_prod_filter();
END $$
