/*
   jueves, 28 de enero de 201621:41:54
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
EXECUTE sp_rename N'dbo.booking.TotalPricePaidByClient', N'Tmp_ClientPayment', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.booking.TotalPaidToServiceProfessional', N'Tmp_ServiceProfessionalPaid_1', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.booking.TotalServiceFeesPaidByServiceProfessional', N'Tmp_ServiceProfessionalPPFeePaid_2', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.booking.Tmp_ClientPayment', N'ClientPayment', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.booking.Tmp_ServiceProfessionalPaid_1', N'ServiceProfessionalPaid', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.booking.Tmp_ServiceProfessionalPPFeePaid_2', N'ServiceProfessionalPPFeePaid', 'COLUMN' 
GO
ALTER TABLE dbo.booking
	DROP COLUMN TotalServiceFeesPaidByClient
GO
ALTER TABLE dbo.booking SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.booking', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.booking', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.booking', 'Object', 'CONTROL') as Contr_Per 