/*
   viernes, 04 de septiembre de 201513:22:30
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
EXECUTE sp_rename N'dbo.ProviderCustomer.ProviderUserID', N'Tmp_ServiceProfessionalUserID', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.ProviderCustomer.CustomerUserID', N'Tmp_ClientUserID_1', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.ProviderCustomer.NotesAboutCustomer', N'Tmp_NotesAboutClient_2', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.ProviderCustomer.Tmp_ServiceProfessionalUserID', N'ServiceProfessionalUserID', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.ProviderCustomer.Tmp_ClientUserID_1', N'ClientUserID', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.ProviderCustomer.Tmp_NotesAboutClient_2', N'NotesAboutClient', 'COLUMN' 
GO
ALTER TABLE dbo.ProviderCustomer SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.ProviderCustomer', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.ProviderCustomer', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.ProviderCustomer', 'Object', 'CONTROL') as Contr_Per 