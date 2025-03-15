CREATE TABLE production_filtered_login AS (
	SELECT * FROM production_filtered
	WHERE operation_name = '/login'
);

CREATE TABLE production_filtered_dashboard AS (
	SELECT * FROM production_filtered
	WHERE operation_name = '/'
);
