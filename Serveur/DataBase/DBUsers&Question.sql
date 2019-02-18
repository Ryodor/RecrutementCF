#
#Database reserved for the administrative interface part
#

DROP DATABASE AdministrativeInterface;
CREATE DATABASE IF NOT EXISTS AdministrativeInterface;

CREATE TABLE Users
(
    id INT PRIMARY KEY NOT NULL,
    lastName VARCHAR(100),
    firstName VARCHAR(100),
    email VARCHAR(255),
    birthDate DATE,
    userPassword VARCHAR(100),
    lawLevel INT,
    lastDateConnection DATETIME
);

CREATE TABLE Question
(
    id INT PRIMARY KEY NOT NULL,
    theQuestion VARCHAR(100),
    firstName VARCHAR(100),
    email VARCHAR(255),
    birthDate DATE,
    userPassword VARCHAR(100),
    lawLevel INT,
    lastDateConnection DATETIME
)
