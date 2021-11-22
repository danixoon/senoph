-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Хост: localhost
-- Время создания: Ноя 17 2021 г., 07:47
-- Версия сервера: 8.0.21
-- Версия PHP: 7.4.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `senoph_1`
--

--
-- Дамп данных таблицы `departments`
--

INSERT INTO `Departments` (`name`, `description`, `createdAt`, `updatedAt`) VALUES
('АТС', 'Отделение сязи и ИТ', '2021-11-15 06:21:58', '2021-11-15 06:21:58'),
('МТО', 'Отделение сязи и ИТ', '2021-11-15 06:22:15', '2021-11-15 06:22:15'),
('ЛВС', 'Отделение сязи и ИТ', '2021-11-15 06:22:26', '2021-11-15 06:22:26'),
('РОЛП', 'Батальон обеспечения', '2021-11-15 06:23:06', '2021-11-15 06:23:06'),
('РМО', 'Батальон обеспечения', '2021-11-15 06:23:12', '2021-11-15 06:23:12'),
('АР', 'Батальон обеспечения', '2021-11-15 06:23:17', '2021-11-15 06:23:17'),
('Приёмное отделение', 'Хирургический корпус', '2021-11-15 06:23:56', '2021-11-15 06:23:56'),
('ГЦСН', 'Хирургический корпус', '2021-11-15 06:24:31', '2021-11-15 06:24:31'),
('ЦСО', 'Хирургический корпус', '2021-11-15 06:24:45', '2021-11-15 06:24:45'),
('Отделение функциональной диагностики', 'Хирургический корпус', '2021-11-15 06:26:46', '2021-11-15 06:26:46'),
('ЦИТАР', 'Хирургический корпус', '2021-11-15 06:27:01', '2021-11-15 06:27:01'),
('Отделение гипербарической оксигенации', 'Хирургический корпус', '2021-11-15 06:27:40', '2021-11-15 06:27:40'),
('Операционное отделение', 'Хирургический корпус', '2021-11-15 06:28:04', '2021-11-15 06:28:04'),
('Отделение сосудистой хирургии', 'Хирургический корпус', '2021-11-15 06:43:20', '2021-11-15 06:43:20'),
('Хирургическое отделение', 'Хирургический корпус', '2021-11-15 06:43:37', '2021-11-15 06:43:37'),
('Оториноларингологическое  отделение', 'Хирургический корпус', '2021-11-15 06:44:12', '2021-11-15 06:44:12'),
('Отделение челюстно-лицевой хирургии', 'Хирургический корпус', '2021-11-15 06:44:53', '2021-11-15 06:44:53'),
('Гинекологическое отделение', 'Хирургический корпус', '2021-11-15 06:45:08', '2021-11-15 06:45:08'),
('Урологическое отделение', 'Хирургический корпус', '2021-11-15 06:46:28', '2021-11-15 06:46:28'),
('Травматологическое отделение', 'Хирургический корпус', '2021-11-15 06:46:46', '2021-11-15 06:46:46'),
('Нейрохирургическое отделение', 'Хирургический корпус', '2021-11-15 06:47:05', '2021-11-15 06:47:05'),
('Отделение клинической лабораторной диагностики', 'Терапевтический корпус', '2021-11-15 06:48:16', '2021-11-15 06:48:16'),
('Физиотерапевтическое отделение', 'Терапевтический корпус', '2021-11-15 06:50:03', '2021-11-15 06:50:03'),
('Отделение лечебной физкультуры', 'Терапевтический корпус', '2021-11-15 06:50:49', '2021-11-15 06:50:49'),
('Эндоскопическое отделение', 'Терапевтический корпус', '2021-11-15 06:51:20', '2021-11-15 06:51:20'),
('Рентгенохирургическое отделение', 'Терапевтический корпус', '2021-11-15 06:52:04', '2021-11-15 06:52:04'),
('Третье терапевтическое отделение', 'Терапевтический корпус', '2021-11-15 07:12:17', '2021-11-15 07:12:17'),
('Второе терапевтическое отделение', 'Терапевтический корпус', '2021-11-15 07:12:34', '2021-11-15 07:12:34'),
('Гастроэнтерологическое отделение', 'Терапевтический корпус', '2021-11-15 07:14:49', '2021-11-15 07:14:49'),
('Колопроктологическое отделение', 'Терапевтический корпус', '2021-11-15 07:15:12', '2021-11-15 07:15:12'),
('Отделение гнойной хирургии и ожоговое', 'Терапевтический корпус', '2021-11-15 07:17:53', '2021-11-15 07:17:53'),
('Кардиологическое отделение', 'Терапевтический корпус', '2021-11-15 07:18:18', '2021-11-15 07:18:18');

--
-- Дамп данных таблицы `holders`
--

INSERT INTO `Holders` (`id`, `firstName`, `lastName`, `middleName`, `departmentId`, `createdAt`, `updatedAt`) VALUES
('Дмитрий', 'Коновалов', 'Геннадьевич', 1, '2021-11-15 07:19:11', '2021-11-15 07:19:11');

--
-- Дамп данных таблицы `logs`
--


--
-- Дамп данных таблицы `logtargets`
--


INSERT INTO `PhoneTypes` ( `name`, `description`, `createdAt`, `updatedAt`) VALUES
('АТС', 'Автоматические телефонные станции', '2021-11-15 07:21:08', '2021-11-15 07:21:08'),
('ЦТС', 'Оборудование цифровой транспортной сети', '2021-11-15 07:22:04', '2021-11-15 07:22:04'),
('ТА', 'Телефонные аппараты', '2021-11-15 07:22:34', '2021-11-15 07:22:34'),
('БТА', 'Телефонные аппараты системы DECT', '2021-11-15 07:22:53', '2021-11-15 07:22:53'),
('Навигация', 'Навигационные приборы', '2021-11-16 12:43:45', '2021-11-16 12:43:45'),
('МТА', 'Мобильные телефонные аппараты', '2021-11-16 12:44:49', '2021-11-16 12:44:49'),
('Факс', 'Факсимильные аппараты', '2021-11-16 12:45:18', '2021-11-16 12:45:18'),
('ВКС', 'Оборудование видео-конференс связи', '2021-11-16 12:46:03', '2021-11-16 12:46:03'),
('IP-телефон', 'Оборудование VOIP', '2021-11-16 12:47:13', '2021-11-16 12:47:13'),
('Радиостанция', 'Радиостанции', '2021-11-16 12:47:56', '2021-11-16 12:47:56');


--
-- Дамп данных таблицы `phonemodeldetails`
--
INSERT INTO `PhoneModels` (`id`, `name`, `accountingDate`, `phoneTypeId`, `description`, `createdAt`, `updatedAt`) VALUES
(2, 'Cisco 9951', '2009-01-01 00:00:00', 9, 'Спецпроверка (Тип 1)', '2021-11-16 13:17:26', '2021-11-16 13:17:26');


INSERT INTO `PhoneModelDetails` (`id`, `name`, `type`, `units`, `amount`, `modelId`, `createdAt`, `updatedAt`) VALUES
(2, 'gold', 'preciousMetal', 'гр', 0.00103, 2, '2021-11-16 13:17:26', '2021-11-16 13:17:26'),
(3, 'silver', 'preciousMetal', 'гр', 0.0072, 2, '2021-11-16 13:17:26', '2021-11-16 13:17:26');

--
-- Дамп данных таблицы `phonemodels`
--


--
-- Дамп данных таблицы `phonetypes`
--

--
-- Дамп данных таблицы `users`
--

INSERT INTO `Users` (`id`, `name`, `username`, `passwordHash`, `role`, `createdAt`, `updatedAt`) VALUES
(3, 'Надежда', 'Ghidkova', '$2a$13$EUXMqeBUuE9fv0hO5caer.NV0gA8KuHv5I04w7mwsKZhe7VJeXz2u', 'user', '2021-11-12 11:54:50', '2021-11-12 11:54:50'),
(4, 'Алексей', 'Moskvitin', '$2a$13$v5MGa7U/KCR7I0jWQrg0eOb/aWUWRtZ1ZTJG4JsUm13fpTe7wt7uG', 'user', '2021-11-12 11:55:36', '2021-11-12 11:55:36'),
(5, 'Андрей', 'Dragunkin', '$2a$13$OuLa6y7BmFK3cKjRBwaL0.D/X6eEfmnhWthP0uAAGn9DxwRWNFq6S', 'user', '2021-11-12 11:56:25', '2021-11-12 11:56:25');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;