CREATE TABLE production_filtered AS (
	SELECT * FROM logs
	WHERE configuration = 'production'
);

CREATE OR REPLACE FUNCTION check_prod_filter()
RETURNS void AS
$$
DECLARE
        row_             RECORD;
BEGIN
		FOR row_ in
			SELECT DISTINCT(configuration) FROM production_filtered
		LOOP
			ASSERT row_.configuration = 'production', 'Non-production data present in table production_filtered';
		END LOOP;
END
$$
LANGUAGE plpgsql;

DO $$
BEGIN
	PERFORM check_prod_filter();
END $$
