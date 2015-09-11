﻿using System;
using System.Collections.Generic;
using System.Linq;
using WebMatrix.Data;
using System.Web;

namespace LcRest
{
    /// <summary>
    /// 
    /// </summary>
    public class PricingSummary
    {
        #region Fields
        public int pricingSummaryID;
        public int pricingSummaryRevision;
        public decimal? serviceDurationMinutes;
        public decimal? firstSessionDurationMinutes;
        public decimal? subtotalPrice;
        public decimal? feePrice;
        public decimal? totalPrice;
        public decimal? pFeePrice;
        public DateTime createdDate;
        public DateTime updatedDate;
        public decimal? subtotalRefunded;
        public decimal? feeRefunded;
        public decimal? totalRefunded;
        public decimal? dateRefunded;
        #endregion

        #region Links
        public IEnumerable<PricingSummaryDetail> details;
        #endregion

        #region Instances
        public PricingSummary() { }

        public static PricingSummary FromDB(dynamic record)
        {
            return new PricingSummary
            {
                pricingSummaryID = record.pricingSummaryID,
                pricingSummaryRevision = record.pricingSummaryRevision,
                serviceDurationMinutes = record.serviceDurationMinutes,
                firstSessionDurationMinutes = record.firstSessionDurationMinutes,
                subtotalPrice = record.subtotalPrice,
                feePrice = record.feePrice,
                totalPrice = record.totalPrice,
                pFeePrice = record.pFeePrice,
                createdDate = record.createdDate,
                updatedDate = record.updatedDate,
                subtotalRefunded = record.subtotalRefunded,
                feeRefunded = record.feeRefunded,
                totalRefunded = record.totalRefunded,
                dateRefunded = record.dateRefunded
            };
        }
        #endregion

        #region Fetch
        const string sqlGetItem = @"
            SELECT
                pricingEstimateID,
                pricingEstimateRevision,
                serviceDurationMinutes,
                firstSessionDurationMinutes,
                subtotalPrice,
                feePrice,                        
                totalPrice,
                pFeePrice,
                createdDate,
                updatedDate,
                subtotalRefunded,
                feeRefunded,
                totalRefunded,
                dateRefunded
            FROM
                PricingSummary
            WHERE
                PricingSummaryID = @0
                AND PricingSummaryRevision = @1
                AND Active = 1
        ";
        public static PricingSummary Get(int id, int revision)
        {
            using (var db = Database.Open("sqlloco"))
            {
                return FromDB(db.QuerySingle(sqlGetItem, id, revision));
            }
        }
        /// <summary>
        /// Load from database all the links data
        /// </summary>
        public void FillLinks()
        {
            details = PricingSummaryDetail.GetList(pricingSummaryID, pricingSummaryRevision);
        }
        #endregion

        #region Set
        #region SQL
        const string sqlInsertItem = @"
            DECLARE @id int
            DECLARE @revision int

            -- estimate ID by param, 0 for new, any other to create a new pricing revision for that existing one
            SET @id = @0
                    
            -- Getting the ID and Revision
            IF @id = 0 BEGIN
                -- new id
                SELECT @id = MAX(PricingSummaryID) + 1 FROM PricingSummary WITH (UPDLOCK, HOLDLOCK)
                -- first revision
                SET @revision = 1
            END ELSE BEGIN
                -- use updated id and get new revision
                SELECT @revision = MAX(PricingSummaryRevision) + 1 FROM PricingSummary WITH (UPDLOCK, HOLDLOCK)
                WHERE PricingSummaryID = @id
            END

            -- Creating record
            INSERT INTO PricingSummary (
                PricingSummaryID,
                PricingSummaryRevision,
                ServiceDurationMinutes,
                FirstSessionDurationMinutes,
                SubtotalPrice,
                FeePrice,
                TotalPrice,
                PFeePrice,
                CreatedDate,
                UpdatedDate,
                ModifiedBy,
                Active
            ) VALUES (
                @id,
                @revision,
                @1, -- duration
                @2, -- first session duration
                @3, -- subtotal price
                @4, -- fee price
                @5, -- total price
                @6, -- pfee price
                getdate(), getdate(), 'sys', 1
            )

            SELECT * FROM PricingSummary WHERE PricingSummaryID = @id AND PricingSummaryRevision = @revision
        ";
        #endregion

        /// <summary>
        /// Save the given pricing summary and returns a copy of the record from database after
        /// that (so it includes andy generated IDs, dates,..)
        /// </summary>
        /// <param name="data"></param>
        public static PricingSummary Set(PricingSummary data, Database sharedDb = null)
        {
            using (var db = new LcDatabase(sharedDb))
            {
                return FromDB(db.QuerySingle(sqlInsertItem,
                    data.pricingSummaryID, data.serviceDurationMinutes, data.firstSessionDurationMinutes,
                    data.subtotalPrice, data.feePrice,
                    data.totalPrice, data.pFeePrice));
            }
        }

        public static void SetDetails(PricingSummary summary, Database sharedDb = null)
        {
            foreach (var detail in summary.details)
            {
                // Enforce IDs to be up-to-date
                detail.pricingSummaryID = summary.pricingSummaryID;
                detail.pricingSummaryRevision = summary.pricingSummaryRevision;
                // Save each detail
                PricingSummaryDetail.Set(detail, sharedDb);
            }
        }
        #endregion

        #region Instance calculations
        /// <summary>
        /// Generates the pricing details list (List of PricingSummaryDetail)
        /// for a given list service professional services, fetching from database
        /// the data for each service and computing it as a PricingSummaryDetail.
        /// It replaces any previous details list.
        /// Its recommended a manual call of Calculate* methods to update the summary after this
        /// 
        /// TODO Add possibility to include serviceProfessional defined price per service (it allows for 
        /// serviceProfessional bookings to set a different price than the default one for the service)
        /// 
        /// TODO Add calculation delegation for ProviderPackageMods and support 
        /// for fields clientDataInput/serviceProfessionalDataInput (special pricings like housekeeper)
        /// </summary>
        /// <param name="serviceProfessionalUserID"></param>
        /// <param name="services"></param>
        /// <returns>Returns the jobTitleID shared by the given services. 0 if no services.
        /// An exceptions happens if services from different jobTitles are provided</returns>
        public int SetDetailServices(int serviceProfessionalUserID, IEnumerable<int> services)
        {
            var details = new List<PricingSummaryDetail>();
            var jobTitleID = 0;

            foreach (var service in ServiceProfessionalService.GetListByIds(serviceProfessionalUserID, services))
            {
                if (jobTitleID == 0)
                    jobTitleID = service.jobTitleID;

                var allSessionsMinutes = service.numberOfSessions > 0 ? service.serviceDurationMinutes * service.numberOfSessions : service.serviceDurationMinutes;

                var detail = new PricingSummaryDetail
                {
                    pricingSummaryID = pricingSummaryID,
                    pricingSummaryRevision = pricingSummaryRevision,
                    serviceDurationMinutes = allSessionsMinutes,
                    firstSessionDurationMinutes = service.serviceDurationMinutes,
                    price = service.price,
                    serviceProfessionalServiceID = service.serviceProfessionalServiceID,
                    hourlyPrice = service.priceRateUnit == "hour" ? service.priceRate : null
                };

                details.Add(detail);
            }

            this.details = details;

            return jobTitleID;
        }

        /// <summary>
        /// It calculates summary price and duration from the current
        /// list of details.
        /// Directly touches: subtotalPrice, firstSessionDurationMinutes and serviceDurationMinutes
        /// </summary>
        public void CalculateDetails()
        {
            this.subtotalPrice = 0;
            this.firstSessionDurationMinutes = 0;
            this.serviceDurationMinutes = 0;

            if (details != null)
            {
                foreach (var detail in details)
                {
                    this.subtotalPrice += detail.price;
                    this.serviceDurationMinutes += detail.serviceDurationMinutes;
                    this.firstSessionDurationMinutes = detail.firstSessionDurationMinutes;
                }
            }
        }

        /// <summary>
        /// Just sum subtotal and fee to update the totalPrice field,
        /// if not null.
        /// </summary>
        public void CalculateTotalPrice()
        {
            if (!this.subtotalPrice.HasValue ||
                !this.feePrice.HasValue)
            {
                this.totalPrice = null;
            }
            else
            {
                this.totalPrice = this.subtotalPrice.Value + this.feePrice.Value;
            }
        }

        public void CalculateFees()
        {
            this.feePrice = 0;
            this.pFeePrice = 0;
            // TODO
        }
        #endregion
    }
}
