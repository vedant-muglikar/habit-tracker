CREATE TABLE habit_category (
id INT PRIMARY KEY AUTO_INCREMENT,
type VARCHAR(50) NOT NULL,
polarity VARCHAR(20) NOT NULL
);

CREATE TABLE habits (
id INT PRIMARY KEY AUTO_INCREMENT,
habit_name VARCHAR(100) NOT NULL,
cat_hab_id INT NOT NULL,
is_active BOOLEAN DEFAULT TRUE,
FOREIGN KEY (cat_hab_id) REFERENCES habit_category(id)
);

CREATE TABLE habit_description (
id INT PRIMARY KEY AUTO_INCREMENT,
habit_id INT NOT NULL,
description TEXT,
FOREIGN KEY (habit_id) REFERENCES habits(id)
);

CREATE TABLE performance (
id INT PRIMARY KEY AUTO_INCREMENT,
habit_id INT NOT NULL,
start_date DATE NOT NULL,
end_date DATE,
streak INT DEFAULT 0,
FOREIGN KEY (habit_id) REFERENCES habits(id)
);

CREATE TABLE check_in (
id INT PRIMARY KEY AUTO_INCREMENT,
habit_id INT NOT NULL,
followed BOOLEAN NOT NULL,
FOREIGN KEY (habit_id) REFERENCES habits(id)
);
