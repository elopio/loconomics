/*
   jueves, 28 de enero de 201622:07:26
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
EXECUTE sp_rename N'dbo.pricingSummary.FeePrice', N'Tmp_ClientServiceFeePrice_3', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.pricingSummary.PFeePrice', N'Tmp_ServiceFeeAmount_4', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.pricingSummary.Tmp_ClientServiceFeePrice_3', N'ClientServiceFeePrice', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.pricingSummary.Tmp_ServiceFeeAmount_4', N'ServiceFeeAmount', 'COLUMN' 
GO
ALTER TABLE dbo.pricingSummary SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.pricingSummary', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.pricingSummary', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.pricingSummary', 'Object', 'CONTROL') as Contr_Per 