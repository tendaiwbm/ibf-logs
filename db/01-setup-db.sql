CREATE DATABASE "ibf-logs";

\c ibf-logs;

CREATE TABLE logs (
	time_generated TIMESTAMP,
	name VARCHAR(50),
	properties VARCHAR,
	operation_name VARCHAR(50),
	operation_id VARCHAR(50),
	parent_id VARCHAR(50),
	session_id VARCHAR(50),
	user_id VARCHAR(50),
	client_country VARCHAR(50),
	client_browser VARCHAR(50),
	client_os VARCHAR(50));



