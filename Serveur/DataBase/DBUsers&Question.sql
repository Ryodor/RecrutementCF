#
#Database reserved for the administrative interface part
#

DROP DATABASE IF EXISTS CodingFactoryPreAdmission;
CREATE DATABASE IF NOT EXISTS CodingFactoryPreAdmission;
use CodingFactoryPreAdmission;

/* Informations sur les utilisateurs */
CREATE TABLE Users
(
    ID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    lastName VARCHAR(100),
    firstName VARCHAR(100),
    email VARCHAR(255),
    userPassword VARCHAR(100),
    lawLevel INT,
    birthdate DATE,
    testDate DATETIME,
    activatedAccount BOOLEAN DEFAULT true
);

/* Réfèrence la liste des types de question possible */
CREATE TABLE Categories
(
	ID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    categoryName varchar(100)
);

/* Réfèrence la liste des types de question possible */
CREATE TABLE ProgLanguage
(
    ID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    languageName varchar(100)
);

/* Contient la liste de toutes les questions */
CREATE TABLE Question
(
    ID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    questionText TEXT,
    categoryId INT,
    progLanguageId INT,
    difficulty INT,
	FOREIGN KEY (categoryId) REFERENCES Categories(ID),
	FOREIGN KEY (progLanguageId) REFERENCES ProgLanguage(ID)
);


/* Cette table contient les information sur les résultats d'examen du postulant */
CREATE TABLE SessionStudent
(
    ID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    userId INT,
    beginningSession DATETIME, #Calcul du chrono de l'étudiant via la différence entre les deux dates
    endSession DATETIME,
    questionsAnswered INT, #Nombre de questions auxquelles il à répondu
    score INT, #Score
	FOREIGN KEY (userId) REFERENCES Users(ID)
);


/* Les choix de chaques questions */
CREATE TABLE  Choice
(
	ID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	textResponse text,
    questionId INT,
    rightAnswer BOOLEAN,
    iDontKnow BOOLEAN,
	FOREIGN KEY (questionId) REFERENCES Question(ID)  ON DELETE SET NULL
);

/* Réponses du postulant */
CREATE TABLE Answers
(
    ID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    userId int, 
    questionId int, #Id de la question
	rightAnswer BOOLEAN, #s'il à répondu, est ce que c'est la bonne réponse
    choiceId VARCHAR(50),
    timer TIMESTAMP,
    correct BOOLEAN,
	FOREIGN KEY (userId) REFERENCES Users(ID),
    FOREIGN KEY (questionId) REFERENCES Question(ID)
);

INSERT INTO Choice (textResponse, questionId, rightAnswer, iDontKnow)
VALUES
('Je ne sais pas', null, false, true);
select * FROM Choice;