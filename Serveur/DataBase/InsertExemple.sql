USE CodingFactoryPreAdmission;

/* Création d'un user */ #niveau 3 : GodMode #niveau 2 : Admin #niveau 1 : user
INSERT INTO Users (lastName, firstName, email, userPassword,lawLevel, testDate, birthdate)
 VALUES
 ('Selatni', 'Ryad', 'selatniryadg@gmail.com', 'myPassWord', 3, null, NOW()),
 ('Drieux', 'Alan', 'alan.drieux@outlook.fr','password', 3, null, NOW());
select * from Users;

/* Création d'un type de question */
INSERT INTO Categories (categoryName)
VALUES 
('CultureG'),
('Agilite');
select * from Categories;

/* Création d'un langage */
INSERT INTO ProgLanguage (languageName)
VALUES 
('Java'),
('C++');
select * from ProgLanguage;

/* Insertion des questions */
INSERT INTO Question(questionText, categoryId, progLanguageId, difficulty)
VALUES 
('Qui est Joey Star ?', 1, null, 1),
('En java, comment déclarer une variable globale ?', null, 2, 1);
select * from Question;

/* Insertion des questions */
INSERT INTO Choice(textResponse, questionId, rightAnswer, IDontKnow)
VALUES 
('Un acteur ', 1, false,false),
('Un Rappeur', 1, false,false),
('Un personage fictif', 1, false,false),
('Un maltraiteur de petit singe', 1, true,false);
select * from Choice;

/* Insertion de la session des résultats de l'étudiant APRES sa session */
INSERT INTO SessionStudent (userId, beginningSession, endSession, questionsAnswered, score)
VALUES
(1, NOW(), NOW(), 21, 2094);


/*INSERT INTO Answers (userId, questionId, rightAnswer, choiceId)
VALUES
(1, 2, true, '1,3');*/



