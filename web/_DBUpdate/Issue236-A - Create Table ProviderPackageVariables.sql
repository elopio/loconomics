/*
   miércoles, 19 de junio de 201314:37:31
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
CREATE TABLE dbo.ProviderPackageVariables
	(
	UserID int NOT NULL,
	PackageID int NOT NULL,
	BookingID int NOT NULL,
	CleaningRate decimal(7, 2) NULL,
	BedsNumber int NULL,
	BathsNumber int NULL,
	HoursNumber decimal(5, 2) NULL,
	ChildsNumber int NULL,
	ChildSurcharge decimal(7, 2) NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.ProviderPackageVariables ADD CONSTRAINT
	PK_ProviderPackageVariables PRIMARY KEY CLUSTERED 
	(
	UserID,
	PackageID,
	BookingID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
ALTER TABLE dbo.ProviderPackageVariables SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.ProviderPackageVariables', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.ProviderPackageVariables', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.ProviderPackageVariables', 'Object', 'CONTROL') as Contr_Per 