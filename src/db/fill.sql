INSERT INTO [PhoneType] VALUES
  ('СС'),
  ('ТА'),
  ('БТА'),
  ('РС'),
  ('IP');

INSERT INTO [Model] VALUES 
  ('Gigaset A420', DATEADD(day, (ABS(CHECKSUM(NEWID())) % 65530), 0), (SELECT TOP 1 [id] FROM [PhoneType] ORDER BY NEWID())),
  ('Gigaset A540', DATEADD(day, (ABS(CHECKSUM(NEWID())) % 65530), 0), (SELECT TOP 1 [id] FROM [PhoneType] ORDER BY NEWID())),
  ('Gigaset A220', DATEADD(day, (ABS(CHECKSUM(NEWID())) % 65530), 0), (SELECT TOP 1 [id] FROM [PhoneType] ORDER BY NEWID())),
  ('Gigaset A430', DATEADD(day, (ABS(CHECKSUM(NEWID())) % 65530), 0), (SELECT TOP 1 [id] FROM [PhoneType] ORDER BY NEWID())),
  ('Gigaset A520', DATEADD(day, (ABS(CHECKSUM(NEWID())) % 65530), 0), (SELECT TOP 1 [id] FROM [PhoneType] ORDER BY NEWID())),
  ('Euroset 805', DATEADD(day, (ABS(CHECKSUM(NEWID())) % 65530), 0), (SELECT TOP 1 [id] FROM [PhoneType] ORDER BY NEWID())),
  ('Euroset 815', DATEADD(day, (ABS(CHECKSUM(NEWID())) % 65530), 0), (SELECT TOP 1 [id] FROM [PhoneType] ORDER BY NEWID())),
  ('Euroset 2005', DATEADD(day, (ABS(CHECKSUM(NEWID())) % 65530), 0), (SELECT TOP 1 [id] FROM [PhoneType] ORDER BY NEWID())),
  ('Euroset 2010', DATEADD(day, (ABS(CHECKSUM(NEWID())) % 65530), 0), (SELECT TOP 1 [id] FROM [PhoneType] ORDER BY NEWID())),
  ('Euroset 2015', DATEADD(day, (ABS(CHECKSUM(NEWID())) % 65530), 0), (SELECT TOP 1 [id] FROM [PhoneType] ORDER BY NEWID())),
  ('Gigaset 4000', DATEADD(day, (ABS(CHECKSUM(NEWID())) % 65530), 0), (SELECT TOP 1 [id] FROM [PhoneType] ORDER BY NEWID()));

INSERT INTO [Department] VALUES 
  ('Кардиологическое отделение'),
  ('Отделение информационных технологий'),
  ('Инфекционное отделение'),
  ('Медицинская часть'),
  ('Отделение правового обеспечения'),
  ('Отделение функциональной диагностики'),
  ('Отеделение гипербарической оксигенации'),
  ('ЦИТАР'),
  ('Отделение сосудистой хирургии'),
  ('Хирургическое отделение'),
  ('Гинекологическое отделение'),
  ('Травматологическое отделение'),
  ('Нейрохирургическое отделение'),
  ('Физиотерапевтическое отделение');

INSERT INTO [Holder] VALUES
  ('Ариша', 'Козлова', 'Юрьевна', (SELECT TOP 1 [id] FROM [Department] ORDER BY NEWID())),
  ('Антонов', 'Иван', 'Михайлович', (SELECT TOP 1 [id] FROM [Department] ORDER BY NEWID())),
  ('Афанасьева', 'Валерия', 'Андреевна', (SELECT TOP 1 [id] FROM [Department] ORDER BY NEWID())),
  ('Афанасьева', 'Ника', 'Львовна', (SELECT TOP 1 [id] FROM [Department] ORDER BY NEWID())),
  ('Большаков', 'Ярослав', 'Макарович', (SELECT TOP 1 [id] FROM [Department] ORDER BY NEWID())),
  ('Воробьёва', 'Юльяна', 'Андреевна', (SELECT TOP 1 [id] FROM [Department] ORDER BY NEWID())),
  ('Голикова', 'Надежда', 'Михайловна', (SELECT TOP 1 [id] FROM [Department] ORDER BY NEWID())),
  ('Гончаров', 'Владимир', 'Никитич', (SELECT TOP 1 [id] FROM [Department] ORDER BY NEWID())),
  ('Громов', 'Тимофей', 'Николаевич', (SELECT TOP 1 [id] FROM [Department] ORDER BY NEWID())),
  ('Давыдова', 'Юлия', 'Викторовна', (SELECT TOP 1 [id] FROM [Department] ORDER BY NEWID())),
  ('Дмитриев', 'Роман', 'Андреевич', (SELECT TOP 1 [id] FROM [Department] ORDER BY NEWID())),
  ('Ермаков', 'Максим', 'Никитич', (SELECT TOP 1 [id] FROM [Department] ORDER BY NEWID())),
  ('Капустина', 'Анастасия', 'Макаровна', (SELECT TOP 1 [id] FROM [Department] ORDER BY NEWID())),
  ('Королёв', 'Герман', 'Никитич', (SELECT TOP 1 [id] FROM [Department] ORDER BY NEWID())),
  ('Логинова', 'Елизавета', 'Тимофеевна', (SELECT TOP 1 [id] FROM [Department] ORDER BY NEWID()));



-- Заполнение средств связи

DECLARE @i int = 0
WHILE @i < 100
BEGIN
  INSERT INTO [Phone] VALUES 
    (CONVERT (VARCHAR(1000), NEWID()),
    CONVERT (VARCHAR(1000), NEWID()),
    DATEADD(day, (ABS(CHECKSUM(NEWID())) % 65530), 0),
    DATEADD(day, (ABS(CHECKSUM(NEWID())) % 65530), 0),
    DATEADD(day, (ABS(CHECKSUM(NEWID())) % 65530), 0),
    (SELECT TOP 1 [id] FROM [Model] ORDER BY NEWID()),
    (SELECT TOP 1 [id] FROM [Holder] ORDER BY NEWID()),
    (SELECT TOP 1 [id] FROM [PhoneType] ORDER BY NEWID())
    );
  SET @i = @i + 1;
END


-- Заполнение категорий ТА

DECLARE @j INT;
DECLARE @j_max INT;
DECLARE @category_id INT;
DECLARE @date_offset INT;
DECLARE @date_from DATETIME;
DECLARE category_cursor CURSOR FOR
  SELECT TOP 20 [id] FROM [Phone] ORDER BY NEWID()
OPEN category_cursor
FETCH NEXT FROM category_cursor
INTO @category_id
  WHILE @@FETCH_STATUS = 0
    BEGIN
      SET @j = 0;
      SET @j_max = ABS(CHECKSUM(NEWID()) % 4) + 1;
      SET @date_offset = 0;
      SET @date_from = DATEADD(day, (ABS(CHECKSUM(NEWID())) % 65530), 0);
      -- DECLARE @j_id int = (SELECT TOP 1 [id] FROM [Phone] ORDER BY NEWID());
      WHILE @j < @j_max
      BEGIN
        INSERT INTO [PhoneCategory] VALUES
          (@j, @date_from + @date_offset, @category_id);
        SET @j = @j + 1;
        SET @date_offset = @date_offset + 1000;
      END;

    FETCH NEXT FROM category_cursor
    INTO @category_id

    END;

CLOSE category_cursor;
DEALLOCATE category_cursor;

DECLARE @phone_id INT;
DECLARE @holder_id INT;
DECLARE holding_cursor CURSOR FOR
  SELECT TOP 20 [id] FROM [Holder] ORDER BY NEWID()
OPEN holding_cursor
FETCH NEXT FROM holding_cursor
INTO @holder_id
  WHILE @@FETCH_STATUS = 0
    BEGIN
      SET @j = 0;
      SET @j_max = ABS(CHECKSUM(NEWID()) % 4) + 1; 
      WHILE @j < @j_max
      BEGIN
        INSERT INTO [Holding] VALUES
          (DATEADD(day, (ABS(CHECKSUM(NEWID())) % 65530), 0),
           CONVERT (VARCHAR(1000), NEWID()),
           @holder_id,
           (SELECT TOP 1 [id] FROM [Phone] p WHERE p.[id] NOT IN (SELECT [phoneId] FROM [Holding]) ORDER BY NEWID())
          );
        SET @j = @j + 1;
      END;

    FETCH NEXT FROM holding_cursor
    INTO @holder_id

    END;

CLOSE holding_cursor;
DEALLOCATE holding_cursor;

INSERT INTO [User] VALUES 
  ('admin', '1234', 'admin');