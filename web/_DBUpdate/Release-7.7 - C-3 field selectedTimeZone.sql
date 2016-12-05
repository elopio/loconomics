/*
   lunes, 05 de diciembre de 201613:53:10
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
ALTER TABLE dbo.CalendarProviderAttributes ADD
	SelectedTimeZone varchar(50) NULL
GO
ALTER TABLE dbo.CalendarProviderAttributes SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.CalendarProviderAttributes', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.CalendarProviderAttributes', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.CalendarProviderAttributes', 'Object', 'CONTROL') as Contr_Per 