INSERT INTO [alert]
   ([AlertID]
   ,[AlertTypeID]
   ,[LanguageID]
   ,[CountryID]
   ,[AlertName]
   ,[AlertHeadlineDisplay]
   ,[AlertTextDisplay]
   ,[AlertDescription]
   ,[AlertEmailText]
   ,[ProviderProfileCompletePoints]
   ,[CustomerProfileCompletePoints]
   ,[CreatedDate]
   ,[UpdatedDate]
   ,[ModifiedBy]
   ,[Active]
   ,[AlertPageURL]
   ,[Required]
   ,[PositionSpecific]
   ,[DisplayRank]
   ,[ProviderAlert]
   ,[CustomerAlert]
   ,[bookMeButtonRequired])
VALUES
   (@AlertID
   ,@AlertTypeID
   ,@LanguageID
   ,@CountryID
   ,@AlertName
   ,@AlertHeadlineDisplay
   ,@AlertTextDisplay
   ,@AlertDescription
   ,@AlertEmailText
   ,@ProviderProfileCompletePoints
   ,@CustomerProfileCompletePoints
   ,@CreatedDate
   ,@UpdatedDate
   ,@ModifiedBy
   ,@Active
   ,@AlertPageURL
   ,@Required
   ,@PositionSpecific
   ,@DisplayRank
   ,@ProviderAlert
   ,@CustomerAlert
   ,@bookMeButtonRequired)
