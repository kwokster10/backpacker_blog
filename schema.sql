DROP TABLE IF EXISTS backpackers;
CREATE TABLE backpackers (
	id INTEGER PRIMARY KEY AUTOINCREMENT, 
	name TEXT, 
	password TEXT, 
	image TEXT, 
	background TEXT, 
	info TEXT
);

DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
	p_id INTEGER PRIMARY KEY, 
	p_body TEXT, 
	p_image TEXT, 
	b_id INTEGER,
	created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

CREATE TRIGGER timestamp_update BEFORE UPDATE ON posts BEGIN UPDATE posts SET updated_on = CURRENT_TIMESTAMP WHERE id = new.id;);
END;

CREATE TABLE comments (
	c_id INTEGER PRIMARY KEY, 
	c_name TEXT, 
	c_body TEXT, 
	p_id INTEGER,
	created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

CREATE TRIGGER timestamp_update BEFORE UPDATE ON comments BEGIN UPDATE comments SET updated_on = CURRENT_TIMESTAMP WHERE id = new.id;);
END;


