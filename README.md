# Информационная система учёта средства связи (ИСУСС)

Актуальная версия руководства находится [здесь](https://github.com/danixoon/senoph).

Приложение реализует функцию контроля данных о средствах связи, предоставляя следующий функционал:

- Сохранение информации в базе данных;
- Фильтрация и поиск средств связи, категорий, движений и сопутствующих данных по критериям;
- Управление движениями средств связи между подразделениями и владельцами;
- Управление категорированием средств связи с контролем их порядка;
- Разделение полномочий администраторского и пользовательского доступа;
- Резервирование данных;
- Импортирование данных из внешнего источника;
- Функционалом подсчёта сроков переработки;
- Логгирование и просмотр системного журнала приложения;
- Управление целостностью данных путём подтверждения операций администратором;

## Системные требования

### Операционная система

`Linux`, `Windows 7` и выше.

### Установленное ПО

- `NodeJS` версии `12.13.0` и выше.
- База данных `MySQL`.

## Установка

Релизную версию приложения можно скачать по ссылке: **TODO**, либо собрать самостоятельно. Подрбности в разделе [cборки](#cборка).

### Установка на IIS

При корректной настройке приложение может работать на `IIS` веб-сервере. Для этого на `IIS` должны быть установлены следующие плагины:

- `UrlRewrite`
- `IISNode`

Необходим созданный сайт в корневой категории и настроенный конфигурационный файл следующего вида:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
		<httpErrors existingResponse="PassThrough" />
		<iisnode nodeProcessCommandLine="C:\Program Files\nodejs\node.exe" />
        <handlers>
			<add name="iisnode" path="/ПУТЬ_К_ПРИЛОЖЕНИЮ/build/index.js" verb="*" modules="iisnode" />
		</handlers>
		<rewrite>
		  <rules>
			<rule name="api">
			  <match url="/*" />
			  <action type="Rewrite" url="/ПУТЬ_К_ПРИЛОЖЕНИЮ/build/index.js" />
			</rule>
		  </rules>
		</rewrite>
    </system.webServer>
</configuration>
```

### Настройка конфиругации

Перед запуском приложения необходимо настроить его конфигурацию. В ней прописываются параметры подключения к базе данных и приватный ключ приложения.

**ВАЖНО** Секретный ключ -- особая строка, на основе которой шифруется приложение. Среди данных, подлежащих шифровке -- пароль и резервная копия. Если запустить приложение с другим секретным ключом, все данные аутентификации будут некорректны и использование без пересинхронизации базы данных будет невозможно. Таким же образом это касается резервных копий.

Конфигурация задаётся в файле `.production.env` в формате `.env` находящегося в корневой директории следующим образом:

```env
# Порт приложения (данный параметр следует убрать при запуске на IIS)
PORT=5000
# Хост (IP-адрес) базы данных
DB_HOST=localhost
# Порт подключения базы данных (по умолчанию у mysql 3306)
DB_PORT=3306
# Имя пользователя базы данных
DB_USERNAME=root
# Пароль пользователя базы данных
DB_PASSWORD=*******
# Имя базы данных
DB_NAME=senoph
# Резервный пароль администраторского аккаунта
DEFAULT_PASSWORD=*******
# Секретный ключ приложения
SECRET=*******
# Путь к исполняемым файлам mysql и mysqldump
MYSQL=**/*
```

### Запуск

Убедитесь, что корректно настроили конфигурацию приложения.

**ВАЖНО**
При первом чистом запуске приложения (используя новую базу данных) необходимо произвести синхронизацию и настроить базу данных. Во время данной операции производится удаление всего содержимого базы данных и пересоздание её с корректной структурой. Это поведение по умолчанию не включено ввиду её деструктивности, но это обязательное условие для корректной работы приложения при первом чистом запуске. Если же приложение запускается при заведомо синхронизированной базе данных, данную операцию проводить не нужно.

Для этой операции необходимо один раз запустить приложение (из терминала) с флагом `--sync` и дождаться сообщения об успешном запуске сервера. Если операция завершится успешно, в корневой директории создастся файл `sync.json` с данными о синхронизации.

![Процесс синхронизации базы данных](/readme/server_log_sync-ok.png)

При повторном запуске приложения с флагом `--sync` и наличии `sync.json` синхронизация не произведётся и выведется сообщение об ошибке.

![Повторная синхронизации базы данных](/readme/server_log_sync-error.png)

Это необходимо для предотвращения случайного очищения базы данных, если синхронизация уже производилась. В таком случае всё ещё возможно произвести пересинхронизацию (например, при повереждении структуры базы данных или обновлении версии приложения), запустив приложение с флагами `--sync --force`, пересоздав базу данных.

Дальнейший штатный запуск приложения возможен с помощью файла командного пакета `start.bat` и скрипта `start.sh` на `Windows` и `Linux` соответственно.

**Запуск приложения из терминала**

В среде `Windows` достаточно запустить `cmd.exe` или `powershell.exe`, перейдя в корневую директорию приложения. Либо, находясь в корневой директории приложения в проводнике, зажать клавишу `SHIFT` и выбрать _Открыть окно команд_. В среде `Linux` достаточно открыть терминал, перейдя в корневую директорию релиза.

Для запуска прописывается команда:

- В случае `Windows`: `start.bat [--sync | --force]`
- В случае `Linux`: `bash ./start.sh [--sync | --force]`
- Напрямую: `node ./build/index.js [--sync | --force]`

# Использование

Если журнал веб-сервера вывел сообщение об успешном запуске, в приложение можно зайти по локальному IP-адресу и указанному в конфигурации порту (в случае запуска на `IIS` -- на порту указанном в `IIS`). Пользователю представится окно входа в аккаунт, где необходимо ввести учётные данные.

![Страница входа в аккаунт](/readme/client_login_page.png)

**ВАЖНО** При первом запуске приложения создаётся резервный администраторский аккаунт, на котором обязательно нужно сменить пароль. Учётные данные для него: имя пользователя -- _admin_, пароль указан в конфигурационном файле по параметру `DEFAULT_PASSWORD`. Смена пароля производится на странице `/admin/users`.

В зависимости от роли пользователя, список доступных функций различен. Пользовательский аккаунт не имеет доступа к администраторской панели и не может подтверждать изменения в системе.

![Начальная страница](/readme/client_index_page.png)

## Навигация

Левая панель используется для навигации по системе. Функционал сгруппирован по группам, при выборе которых происходит раскрытие подробных пунктов.

![Панель навигации](/readme/client_side-bar.png)

## Администрирование

Данный раздел позволяет производить управление пользователями, владельцами, местоположениями, подразделениями, типами средств связи, моделями средств связи, резервным копированием и осуществлять просмотр журнала системы.

Раздел доступен только пользователем с правами администратора.

Структура большинства страниц данного раздела состоит из формы добавления элемента и списком уже существующих в формате таблицы. Например, страница моделей средств связи выглядит следующим образом:

![Модели средств связи](/readme/client_models_page.png)

Обязательные поля форм указываются красной звёздочкой последним символом заголовка и без их заполнения запрос не будет выполнен. В данном случае, поля _Наименование_ и _Тип СС_ являются обязательными, в отличие от поля _Описание_.

На странице моделей средств связи также доступно добавление драгоценных металлов с помощью кнопки на форме Предусмотрена возможность добавления нескольких драгоценных металлов разных типов указанного количества.

![Всплывающее окно добавления драгоценных металлов](/readme/client_models_add-detail_popup.png)

Изменение элементов страниц производится через кнопку управления в левой части соответствующей записи таблицы. В зависимости от возможных действий с элементом, выводится всплывающая панель вариантов. В случае страницы _моделей средств связи_, доступно два варианта: _удаление_ и _изменение_.

![Всплывающее окно действий с записью](/readme/client_models_item-actions_popup.png)

Изменение производится в форме всплывающего окна. В зависимости от страницы и параметров элемента, поля различаются. _Применить_ и _отменить_ изменения возможно через кнопки управления в подвале формы.

![Всплывающее окно изменения записи](/readme/client_models_item-update_popup.png)

В стандартной таблице выводится не вся информация об элементах, которой они обладают. Например, на странице моделей средств связи не выводятся столбцы _дата обновления/создания_. Отображение столбцов настраивается в параметрах таблицы, изменение которых производится нажатием на кнопку в её правом верхнем углу, в шапке.

![Всплывающее окно изменения параметров таблицы](/readme/client_models_table-settings_popup.png)

**ВАЖНО**
Удаление записей в администраторском разделе производится без всякого предупреждения и подтверждения, это необходимо учитывать. Если удалить запись без потери целостности данных невозможно (имеются какие-либо связи, например, удаляется _тип средства связи_ и он уже привязан к какой-либо _модели_) операция завершится с ошибкой.

## Резервное копирование

Страница доступна по адресу `/admin/backups`.

Управление резервными копиями производится в _администраторском разделе_ в пункте _Резервные копии_. Резервная копия представляет собой снимок базы данных, который при необходимости можно _восстановить_, _экспортировать_ или _удалить_. Сохраняются все таблицы базы данных, в том числе логи действий пользователей в системе (например, удаление/добавление моделей средств связи). Поэтому при восстановлении резервной копии история действий соответствует актуальной на момент снимка.

![Страница резервных копий](/readme/client_backup_page.png)

### Создание резервной копии

При создании необходимо указать _метку_, представляющую собой некоторую строку, идентифицирующую резервную копию. Метки могут повторяться, это не уникальное значение. Нажав на кнопку _Создать_ резервная копия добавится в конец списка, ей назначится указанная _метка_ и уникальный идентификатор _id_.

### Восстановление резервной копии

Производится с помощью кнопки управления целевой записью, пунктом _Восстановление_. При нажатии, система пересоздаст базу данных, залив актуальные данные и её структуру на момент резервной копии.

![Всплывающая панель управления записью резервной копии](/readme/client_backup_item-actions_popup.png)

### Экспортирование резервной копии

Производится через соответствующий пункт в всплывающем окне управления целевой записью. Представляет собой файл расширения `.sbac` с данными резервной копии.

### Удаление резервной копии

Производится через соответствующий пунукт в всплывающем окне управления целевой записью.

### Импортирование резервной копии

На верхней панели страницы расположены элементы управления импортированием резервных копий. Перед импортом проверяется целостность резервной копии и достоверность её источника. В случае несовпадения хеш-сумм импорт завершится с ошибкой. Это позволяет обеспечить дополнительный слой безопасности системы, а также защищает от непреднамеренного импорта копии неподдерживающейся системой.

Данную проверку можно пропустить, активировав чек-бокс _без проверки_.

![Панель импорта резервной копии](/readme/client_backup_import-bar.png)

## Просмотр истории (логи)

Производится на странице `/admin/logs`.

Логи отображаются в виде записей в таблице, разделённой по следующим столбцам:

- Цель -- Наимнование сущности, с которой производилась операция (_средство связи_, _движение_, _владелец_ и т.д.);
- Тип действия -- Тип операции, которая производилась (_удаление_, _изменение_, _подтверждение_).
- Затрагиваемое -- _Идентификаторы_ сущностей, которых затронула операция. Если запись ещё присутствует в базе данных, при нажатии на идентификатор произойдёт переход на соответствующую страницу;
- Время -- _Дата_ совершения операции;
- Автор (по умолчанию скрыт в настройках таблицы) -- _Имя аккаунта_ автора и его идентификатор.

![Панель импорта резервной копии](/readme/client_logs_page.png)

Некоторые операции обладают дополнительной информацией, которую возможно отобразить с помощью кнопки _Подробности_ в всплывающем окне управления целевой записью.

![Всплывающая панель управления записью истории](/readme/client_logs_item-actions_popup.png)

Дополнительная информация представлена в формате `JSON` и может использоваться для подробного изучения мета-данных операции.

![Подробности записи в журнале истории](/readme/client_logs_details_popup.png)

## Управление средствами связи

Система позволяет производить со средствами связи следующие операции:

- Выводить средства связи по указанным параметрам фильтрации;
- Сортировать средства связи по выбранным столбцам;
- Изменять отдельные поля конкретного средства связи (_инвентарный номер_, _год сборки_ и т.д.);
- Выбирать множественное число средств связи для прикрепления к категории/движению, а также удаления;
- Импортировать средства связи и первоначальные движения из `.xlsx` (Excel) файла согласно шаблону;
- Добавлять средства связи с первоначальным прикреплением к существующему движению;
- Пользователям с администраторским доступом подтверждать изменения отдельных полей, а также удаления и добавления средств связи;

Для вступления в силу изменений средств связи с помощью операций создания, обновления и удаления необходимо подтверждение администраторским аккаунтом. Подтверждения контролируются на страницах `/phone/commit/updates` для обновления полей и `/phone/commit/actions` для удаления/добавления цельных записей средств связи.

Поддерживаются два вида интерфейса для данной страницы: _просмотр_ и _редактирование_ (управление). Они доступны в соответствующих пунктах меню навигации.

### Просмотр и фильтрация

Просмотр доступен на странице `/phone/view/`. Считается, что на данной странице пользователь находится в режиме просмотра средств связи.

![Просмотр средств связи](/readme/client_phone-view_page.png)

На правой части страницы расположен фильтр запросов, фильтрация поддерживается по следующим полям:

- Тип СС -- Фильтр средств связи только с указанным типом;
- Модель СС -- Фильтр по конкретной модели выбранного типа связи (если тип не выбран, модели в выпадающем списке не отобразятся);
- Подразделение -- Идёт сравнение по подразделению последнего (по дате) движения, в котором в актуальный момент находится средство связи.
- Материально-ответственное лицо -- Таким же образом, как и с подразделением, происходит сравнение с мат. лицом.
- Категория -- Фильтруются средства связи по последней назначенной им категории;
- Инвентарный номер -- Указанный _инвентарный номер_ сопоставляется с актуальным _инвентарным номером_ средства связи и при совпадении подстроки, средство связи включается в запрос;
- Заводской номер -- Работает аналогично фильтрации по _инвентарному номеру_.
- Год сборки -- Фильтрует по _году сборки_ средства связи;
- Дата принятия к учёту -- Фильтрует по конкретной дате;
- Дата ввода в эксплуатацию -- Фильтрация аналогичным образом как и в предыдущем пункте;

Пользователь может изменить количество выдаваемых записей путём изменения поля _Результатов_ в правом верхем углу страницы.

![Фильтр по средствам связи](/readme/client_phone_filter.png)

### Просмотр сведений о средстве связи

Записи средств связи в таблице интерактивны и при нажатии на конкретную появляется высплывающее окно с подробной информацией. Оно содержит поля: _тип_, _модель_, _заводской номер_, _инвентарный номер_, _год сборки_, _переработка_, _дата приянтия к учёту_, _дата ввода в эксплуатацию_, _подразделение_ и _материально-ответственное лицо_.

На правой панели окна расположена панель с категориями и движениями, к которым средство связи прикреплено. Между панелями осуществляется переход с помощью переключателя над списком. Движения и категории расположены в порядке убывания даты акта/приказа.

**Просмотр категорий средства связи**

В списке категорий, прикреплённых к средству связи с каждым элементом возможно произвести следующие операции:

- Просмотр файла акта категории осуществляется по ссылке _Акт_;
- При нажатии на дату производится переход на страницу _категорирования_ с фильтрацей по соответствующей дате;
- При нажатии на номер категории, соответствующий переход и отображение отфильтрованных результатов;
- При нажатии на иконку правее от номера категории, производится переход и отображение подробной записи акта категории на соответствующей странице;

**Просмотр движений средства связи**

В списке движений, прикреплённых к средству связи с каждым элементом возможно произвести следующие операции:

- Просмотр _файла акта категории_ осуществляется при нажатии на _номер акта_ (если файл прикреплён);
- При нажатии на _дату движения_ производится переход на страницу _движений_ с фильтрацей по соответствующей дате;
- При нажатии на _название подразделения_ или _имя владельца_, соответствующий переход и отображение отфильтрованных результатов;
- При нажатии на самую правую кнопку категории, производится переход и отображение подробной записи _акта категории_ на соответствующей странице;

![Просмотр конкретного средства связи](/readme/client_phone_item-view_popup.png)

### Редактирование сведений о средстве связи и выборка

Функционал доступен на странице `/phone/edit/`. Пользователь находится в режиме редактирования средств связи.

**Изменение отдельных полей средства связи**

При открытии средства связи (кликнув по записи в таблице), появляется всплывающее окно с полями и операциями.

![Изменение конкретного средства связи](/readme/client_phone_item-edit_popup.png)

В режиме редактирования присутствует возможность изменения полей. Для этого необходимо нажать на необходимое поле (изменяемые поля подсвечены красной линией) и в появившейся всплывающей форме вписать новое значение.

![Изменение поля конкретного средства связи](/readme/client_phone_item-view_popup.png)

При корректном значении изменение будет считаться ожидающим подтверждения администратором и справа от значения отобразится иконка, подразумевающая неподтверждённое изменение.

![Изменённое поле конкретного средства связи](/readme/client_phone_field-edited.png)

## Дополнительно

## Логгирование

Системный журнал приложения хранится в корневой директории по пути `./logs/`. Журналы записываются в три лог-файла:

- `combined.log`: Общие логи приложения, выводящиеся в консоль с доп. информацией (payload)
- `db.log`: Логи `SQL`-запросов к базе данных
- `error.log`: Схож с `combined.log`, но хранит только ошибки.

Также логи можно просмотреть в клиентском интерфейсе с учётной записи администратора, перейдя в пункт администрирование/история(логи), либо перейдя по URL `/admin/logs`. В данном разделе также хранится история действий пользователей системы

**ВАЖНО** История действий привязывается к резервной копии, при её изменении также загружается актуальная для резервной копии история.

# Техническая сторона

## Описание приложения

Это SPA-приложение, использующее `NodeJS` в качестве бека и `ReactJS` на фронте. Связь производится посредством HTTP REST-API по адресу `/api/**/*`. Бекенд использует ORM `Sequelize` для взаимодействия с базой данных. Фронт использует собственную библиотеку визуальных компонентов, а также `React Feather` для иконок. В качестве системы управления состоянием используется `@reduxjs/toolkit`, бóльшая взаимодействия с `API` осуществляется с помощью хуков `ReactJS`.

## Используемый стек технологий

### Бекенд

- Языки: `TypeScript`, `NodeJS`, `SQL`
- Модули: `Express`, `Sequelize`

### Фронтенд

- Языки: `TypeScript`, `Stylus`
- Модули: `ReactJS`, `Webpack`, `@reduxjs/toolkit`, `ReactRouter`

## Сборка

Для контроля зависимостями используется пакетный менеджер `Yarn`. Сборка производится с помощью `bash` скрипта (желательно на `Linux`), запускаемого командой `yarn deploy` из корневой директории исходного кода. Также существует вариант сборки портативной версии билда командой `yarn deploy:zip`, собирающей `.zip` архив со всем необходимым для работы приложения.

## HTTP API

С помощью `TypeScript` реализована типизация HTTP запросов к `API`. Все варианты запросов описаны в файле `/src/route/types.d.ts`, их конкретное описание приведено ниже:

### Оповещения

`GET` `/notice` -- возвращает данные о количестве неподтверждённых действий

```ts
// Ответ
phone: {
  changes: number;
  commits: number;
}
holding: {
  commits: number;
  changes: number;
}
category: {
  commits: number;
  changes: number;
}
```

### Администрирование

`GET` `/admin/backups` -- возвращает данные о резервных копиях, доступных на сервере.

```ts
// Ответ
{
  id: string;
  tag: string;
  date: string;
  size: number;
}
```

`GET` `/admin/backup/export` -- возвращает файл, `Blob` с резервной копией.

```ts
// Запрос
{
  id: string;
}
```