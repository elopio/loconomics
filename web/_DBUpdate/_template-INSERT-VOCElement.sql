INSERT INTO [VOCElement]
   ([VOCElementID]
   ,[LanguageID]
   ,[CountryID]
   ,[VOCElementName]
   ,[ScoreStartValue]
   ,[ScoreMidValue]
   ,[ScoreEndValue]
   ,[ScoreStartLabel]
   ,[ScoreMidLabel]
   ,[ScoreEndLabel]
   ,[CreateDate]
   ,[UpdatedDate]
   ,[ModifiedBy]
   ,[Active])
VALUES
   (@VOCElementID
   ,@LanguageID
   ,@CountryID
   ,@VOCElementName
   ,@ScoreStartValue
   ,@ScoreMidValue
   ,@ScoreEndValue
   ,@ScoreStartLabel
   ,@ScoreMidLabel
   ,@ScoreEndLabel
   ,@CreateDate
   ,@UpdatedDate
   ,@ModifiedBy
   ,@Active)
