#
#Database reserved for the administrative interface part
#

DROP DATABASE IF EXISTS CodingFactoryPreAdmission;
CREATE DATABASE IF NOT EXISTS CodingFactoryPreAdmission;
use CodingFactoryPreAdmission;

/* Informations sur les utilisateurs */
CREATE TABLE Users
(
    userId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    lastName VARCHAR(100),
    firstName VARCHAR(100),
    email VARCHAR(255),
    userPassword VARCHAR(100),
    lawLevel INT,
    testDate DATETIME
);

/* Réfèrence la liste des types de question possible */
CREATE TABLE QuestionType
(
    typeId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    typeName varchar(100)
);

/* Réfèrence la liste des types de question possible */
CREATE TABLE ProgLanguage
(
    languageId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    languageName varchar(100)
);

/* Contient la liste de toutes les questions */
CREATE TABLE Question
(
    questionId INT PRIMARY KEY NOT NULL,
    questionText TEXT,
    questionTypeId INT,
    progLanguageId INT,
	FOREIGN KEY (questionTypeId) REFERENCES QuestionType(typeId),
	FOREIGN KEY (progLanguageId) REFERENCES ProgLanguage(languageId)

);


/* Cette table contient les information sur les résultats d'examen du postulant */
CREATE TABLE SessionStudent
(
    sessionStudentId INT PRIMARY KEY NOT NULL,
    userId INT,
    beginningSession DATETIME, #Calcul du chrono de l'étudiant via la différence entre les deux dates
    endSession DATETIME,
    questionsAnswered INT, #Nombre de questions auxquelles il à répondu
    score INT, #Score
	FOREIGN KEY (userId) REFERENCES Users(userId)
);

/* Réponses du postulant */
CREATE TABLE Answers
(
    answerId INT PRIMARY KEY NOT NULL,
    sessionStudentId int, 
    questionId int, #Id de la question
	rightAnswer BOOLEAN, #s'il à répondu, est ce que c'est la bonne réponse
    choiceId int,
	FOREIGN KEY (sessionStudentId) REFERENCES SessionStudent(sessionStudentId),
    FOREIGN KEY (questionId) REFERENCES Question(questionId),
	FOREIGN KEY (choiceId) REFERENCES Question(questionId)
);

/* Les choix de chaques questions */
CREATE TABLE  Choice
(
	choiceId INT PRIMARY KEY NOT NULL,
	textResponse text,
    questionId INT,
    rightAnswer BOOLEAN,
	FOREIGN KEY (questionId) REFERENCES Question(questionId)
);

