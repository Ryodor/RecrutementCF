
/* Création d'un user */ #niveau 3 : GodMode #niveau 2 : Admin #niveau 1 : user
INSERT INTO Users (lastName, firstName, email, userPassword,lawLevel, testDate)
 VALUES
 ('Selatni', 'Ryad', 'selatniryadg@gmail.com', 'myPassWord', 3, null),
 ('Drieux', 'Alan', 'alan.drieux@outlook.fr','password', 3, null);
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
INSERT INTO Question(questionText, categoryId, progLanguageId)
VALUES 
('Qui est Joey Star ?', 1, null),
('En java, comment déclarer une variable globale ?', null, 2);
select * from Question;

/* Insertion des questions */
INSERT INTO Choice(textResponse, questionId, rightAnswer)
VALUES 
('Un acteur ', 1, false),
('Un Rappeur', 1, false),
('Un personage fictif', 1, false),
('Un maltraiteur de petit singe', 1, true);
select * from Choice;


