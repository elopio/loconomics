INSERT INTO [verificationstatus]
   ([VerificationStatusID]
   ,[LanguageID]
   ,[CountryID]
   ,[VerificationStatusName]
   ,[VerificationStatusDisplayDescription]
   ,[CreatedDate]
   ,[UpdatedDate]
   ,[ModifiedBy]
   ,[Active])
VALUES
   (@VerificationStatusID
   ,@LanguageID
   ,@CountryID
   ,@VerificationStatusName
   ,@VerificationStatusDisplayDescription
   ,@CreatedDate
   ,@UpdatedDate
   ,@ModifiedBy
   ,@Active)