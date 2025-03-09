CREATE TABLE production_filtered_login AS (
	SELECT * FROM production_filtered
	WHERE page = 'login'
);

CREATE TABLE production_filtered_dashboard AS (
	SELECT * FROM production_filtered
	WHERE page = 'dashboard'
);
