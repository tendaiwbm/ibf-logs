CREATE TABLE production_filtered AS (
	SELECT * FROM logs
	WHERE configuration = 'production'
);

-- FUNCTION to test
--	len(distinct(configuration)) == 1 AND
--	all(config == 'production' for config in """select * from production_filtered""")
