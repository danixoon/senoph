DROP TABLE [User];
DROP TABLE [Holding];
DROP TABLE [PhoneCategory];
DROP TABLE [Phone];
DROP TABLE [Holder];
DROP TABLE [Department];
DROP TABLE [Model];
DROP TABLE [PhoneType];


CREATE TABLE [PhoneType] (
  [id] INT PRIMARY KEY NOT NULL IDENTITY(1, 1),
  [name] VARCHAR(100) NOT NULL
);

CREATE TABLE [Model] (
  [id] INT PRIMARY KEY NOT NULL IDENTITY(1, 1),
  [name] VARCHAR(100) NOT NULL,
  [accountingDate] DATETIME,

  [phoneTypeId] INT FOREIGN KEY REFERENCES [PhoneType]([id]) NOT NULL
);

CREATE TABLE [Department] (
  [id] INT PRIMARY KEY NOT NULL IDENTITY(1, 1),
  [name] VARCHAR(100) NOT NULL
);


CREATE TABLE [Holder] (
  [id] INT PRIMARY KEY NOT NULL IDENTITY(1, 1),
  [firstName] VARCHAR(100) NOT NULL, 
  [lastName] VARCHAR(100) NOT NULL,
  [middleName] VARCHAR(100),
  [departmentId] INT FOREIGN KEY REFERENCES [Department]([id]) NOT NULL
);


CREATE TABLE [Phone] (
  [id] INT PRIMARY KEY NOT NULL IDENTITY(1, 1),
  [inventoryKey] VARCHAR(100),
  [factoryKey] VARCHAR(100),

  [assemblyDate] DATETIME,
  [accountingDate] DATETIME,
  [commissioningDate] DATETIME,

  [modelId] INT FOREIGN KEY REFERENCES [Model]([id]) NOT NULL,
  [holderId] INT FOREIGN KEY REFERENCES [Holder]([id]) NOT NULL,
  -- [typeId] INT FOREIGN KEY REFERENCES [PhoneType]([id]) NOT NULL
);

CREATE TABLE [PhoneCategory] (
  [id] INT PRIMARY KEY NOT NULL IDENTITY (1, 1),
  [category] INT NOT NULL DEFAULT 1,
  [date] DATETIME NOT NULL,

  [phoneId] INT FOREIGN KEY REFERENCES [Phone]([id]) NOT NULL
)

CREATE TABLE [Holding] (
  [id] INT PRIMARY KEY NOT NULL IDENTITY(1, 1),
  [actDate] DATETIME NOT NULL,
  [actKey] VARCHAR(50) NOT NULL,

  [holderId] INT FOREIGN KEY REFERENCES [Holder]([id]) NOT NULL,
  [phoneId] INT FOREIGN KEY REFERENCES [Phone]([id]) NOT NULL
);

CREATE TABLE [User] (
  [id] INT PRIMARY KEY NOT NULL IDENTITY(1, 1),
  [username] VARCHAR(50) NOT NULL,
  [passwordHash] VARCHAR(50) NOT NULL,
  [role] VARCHAR(50) NOT NULL DEFAULT 'user'
);