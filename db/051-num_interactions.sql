CREATE OR REPLACE FUNCTION weekly_interactions()
RETURNS void AS
$$

DECLARE
	sourceTable TEXT := 'production_filtered_dashboard';
	destTable   TEXT := 'dashboard_weekly_interations';
	altText     TEXT := NULL;
	updText     TEXT := NULL;
	createText  TEXT := NULL;
	queryText   TEXT := NULL;
BEGIN
	altText    := concat('ALTER TABLE ',sourceTable,' ADD COLUMN week_number INTEGER;');
	updText    := concat('UPDATE ',sourceTable,' SET week_number = (SELECT EXTRACT(''week'' from time_generated));');
	createText := concat('CREATE TABLE ',destTable,' AS (SELECT count(*),week_number FROM ',sourceTable,' GROUP BY week_number);');
	queryText  := concat(altText,updText,createText);

	EXECUTE queryText;
END
$$
LANGUAGE plpgsql;



DO $$
BEGIN
	PERFORM weekly_interactions();
END $$
