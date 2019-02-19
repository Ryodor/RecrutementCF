
/* Création d'un user */ #niveau 3 : GodMode #niveau 2 : Admin #niveau 1 : user
INSERT INTO Users (lastName, firstName, email, userPassword,lawLevel, testDate)
 VALUES
 ('Selatni', 'Ryad', 'selatniryadg@gmail.com', 'myPassWord', 3, null),
 ('Drieux', 'Alan', 'alan.drieux@outlook.fr','password', 3, null);


select * from Users;