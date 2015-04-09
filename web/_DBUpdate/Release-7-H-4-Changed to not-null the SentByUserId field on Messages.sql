
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
ALTER TABLE dbo.Messages
	DROP CONSTRAINT FK__Messages__Thread__20ACD28B
GO
ALTER TABLE dbo.MessagingThreads SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.MessagingThreads', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.MessagingThreads', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.MessagingThreads', 'Object', 'CONTROL') as Contr_Per BEGIN TRANSACTION
GO
ALTER TABLE dbo.Messages
	DROP CONSTRAINT Fk_Messages
GO
ALTER TABLE dbo.messagetype SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.messagetype', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.messagetype', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.messagetype', 'Object', 'CONTROL') as Contr_Per BEGIN TRANSACTION
GO
CREATE TABLE dbo.Tmp_Messages
	(
	MessageID int NOT NULL IDENTITY (1, 1),
	ThreadID int NOT NULL,
	MessageTypeID int NOT NULL,
	AuxID int NULL,
	AuxT nvarchar(50) NULL,
	BodyText varchar(5000) NOT NULL,
	CreatedDate datetime NOT NULL,
	UpdatedDate datetime NOT NULL,
	ModifiedBy varchar(50) NOT NULL,
	SentByUserId int NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.Tmp_Messages SET (LOCK_ESCALATION = TABLE)
GO
ALTER TABLE dbo.Tmp_Messages ADD CONSTRAINT
	DF_Messages_SentByUserId DEFAULT 0 FOR SentByUserId
GO
SET IDENTITY_INSERT dbo.Tmp_Messages ON
GO
IF EXISTS(SELECT * FROM dbo.Messages)
	 EXEC('INSERT INTO dbo.Tmp_Messages (MessageID, ThreadID, MessageTypeID, AuxID, AuxT, BodyText, CreatedDate, UpdatedDate, ModifiedBy, SentByUserId)
		SELECT MessageID, ThreadID, MessageTypeID, AuxID, AuxT, BodyText, CreatedDate, UpdatedDate, ModifiedBy, coalesce(SentByUserId, 0) FROM dbo.Messages WITH (HOLDLOCK TABLOCKX)')
GO
SET IDENTITY_INSERT dbo.Tmp_Messages OFF
GO
DROP TABLE dbo.Messages
GO
EXECUTE sp_rename N'dbo.Tmp_Messages', N'Messages', 'OBJECT' 
GO
ALTER TABLE dbo.Messages ADD CONSTRAINT
	PK_Messages_messageID PRIMARY KEY CLUSTERED 
	(
	MessageID
	) WITH( PAD_INDEX = OFF, FILLFACTOR = 100, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
CREATE NONCLUSTERED INDEX idx_Messages ON dbo.Messages
	(
	MessageTypeID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE dbo.Messages ADD CONSTRAINT
	Fk_Messages FOREIGN KEY
	(
	MessageTypeID
	) REFERENCES dbo.messagetype
	(
	MessageTypeID
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.Messages ADD CONSTRAINT
	FK__Messages__Thread__20ACD28B FOREIGN KEY
	(
	ThreadID
	) REFERENCES dbo.MessagingThreads
	(
	ThreadID
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
-- =============================================
-- Author:		Iago Lorenzo Salgueiro
-- Create date: 2014-02-18
-- Description:	Set field SentByUserId based on
-- the MessageTypeID
-- =============================================
CREATE TRIGGER AutoSetMessageSentByUserId
   ON  dbo.Messages
   AFTER INSERT
AS 
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	UPDATE Messages SET
		SentByUserId = CASE 
		WHEN MessageTypeID IN (1, 2, 4, 5, 6, 9, 12, 14, 16, 18) THEN T.CustomerUserID
		WHEN MessageTypeID IN (3, 7, 10, 13, 15, 17) THEN T.ProviderUserID
		WHEN MessageTypeID IN (8, 19) THEN 0 -- the system
		END
	FROM MessagingThreads AS T
	WHERE T.ThreadID = Messages.ThreadID
	AND SentByUserId is null
END
GO
COMMIT
select Has_Perms_By_Name(N'dbo.Messages', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.Messages', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.Messages', 'Object', 'CONTROL') as Contr_Per 