CREATE OR REPLACE FUNCTION num_interactions_per_interval()
RETURNS void AS
$$

DECLARE
	sourceTable TEXT := 'production_filtered_dashboard';
	destTable   TEXT := NULL;
	altText     TEXT := NULL;
	updText     TEXT := NULL;
	createText  TEXT := NULL;
	queryText   TEXT := NULL;
	interval    RECORD;
BEGIN
	FOR interval in 
		SELECT * FROM 
		(VALUES
			('week'),
			('month')
		) AS t(name)
	LOOP
		destTable  := concat('dashboard_',interval.name,'ly_interactions');
		altText    := concat('ALTER TABLE ',sourceTable,' ADD COLUMN ',interval.name,'_number INTEGER;');
		updText    := concat('UPDATE ',sourceTable,' SET ',interval.name,'_number = (SELECT EXTRACT(''',interval.name,''' from time_generated));');
		createText := concat('CREATE TABLE ',destTable,' AS (SELECT count(*),',interval.name,'_number FROM ',sourceTable,' GROUP BY ',interval.name,'_number);');
		queryText  := concat(altText,updText,createText);
		EXECUTE queryText;
	END LOOP;
END
$$
LANGUAGE plpgsql;



DO $$
BEGIN
	PERFORM num_interactions_per_interval();
END $$
