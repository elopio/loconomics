/*
   martes, 25 de febrero de 201414:04:28
   User: 
   Server: localhost\SQLEXPRESS
   Database: loconomics
   Application: 
*/

/* To prevent any potential data loss issues, you should review this script in detail before running it outside the context of the database designer.*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
CREATE TABLE dbo.Tmp_CalendarProviderAttributes
	(
	UserID int NOT NULL,
	AdvanceTime decimal(10, 2) NOT NULL,
	MinTime decimal(10, 2) NULL,
	MaxTime decimal(10, 2) NULL,
	BetweenTime decimal(10, 2) NOT NULL,
	UseCalendarProgram bit NOT NULL,
	CalendarType varchar(200) NULL,
	CalendarURL varchar(500) NULL,
	PrivateCalendarToken varchar(128) NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.Tmp_CalendarProviderAttributes SET (LOCK_ESCALATION = TABLE)
GO
IF EXISTS(SELECT * FROM dbo.CalendarProviderAttributes)
	 EXEC('INSERT INTO dbo.Tmp_CalendarProviderAttributes (UserID, AdvanceTime, MinTime, MaxTime, BetweenTime, UseCalendarProgram, CalendarType, CalendarURL, PrivateCalendarToken)
		SELECT UserID, AdvanceTime, MinTime, MaxTime, BetweenTime, UseCalendarProgram, CalendarType, CalendarURL, PrivateCalendarToken FROM dbo.CalendarProviderAttributes WITH (HOLDLOCK TABLOCKX)')
GO
DROP TABLE dbo.CalendarProviderAttributes
GO
EXECUTE sp_rename N'dbo.Tmp_CalendarProviderAttributes', N'CalendarProviderAttributes', 'OBJECT' 
GO
ALTER TABLE dbo.CalendarProviderAttributes ADD CONSTRAINT
	PK__Calendar__1788CCAC22B5168E PRIMARY KEY CLUSTERED 
	(
	UserID
	) WITH( PAD_INDEX = OFF, FILLFACTOR = 100, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
COMMIT
select Has_Perms_By_Name(N'dbo.CalendarProviderAttributes', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.CalendarProviderAttributes', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.CalendarProviderAttributes', 'Object', 'CONTROL') as Contr_Per 