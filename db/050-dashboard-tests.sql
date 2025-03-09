CREATE OR REPLACE FUNCTION check_client_country()
RETURNS void AS
$$

DECLARE
	row_   RECORD;
BEGIN
	FOR row_ IN 
		SELECT country,client_country 
		FROM production_filtered_dashboard
	LOOP
		ASSERT row_.country = row_.client_country, 'Mismatch found between ''client_country'' AND dashboard country';
	END LOOP;
END
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_page_operation()
RETURNS void AS 
$$

DECLARE
	row_   RECORD;
BEGIN
	FOR row_ IN
		SELECT operation_name 
		FROM production_filtered_dashboard
	LOOP
		ASSERT row_.operation_name = '/', 'Mismatch found between operation_name  and page = dashbord.';
	END LOOP;
END
$$
LANGUAGE plpgsql;

DO $$
BEGIN
	PERFORM check_client_country();
	PERFORM check_page_operation();
END $$
