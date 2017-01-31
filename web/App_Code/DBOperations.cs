﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebMatrix.Data;
using System.Text.RegularExpressions;
using System.Data;
using System.Data.Common;

/// <summary>
/// Utility class to perform a set of special operations
/// at the database, like to query database scheme, create scripts,
/// bulk import/export data.
/// The class is disposable, meant to use at a 'using {..}' block
/// where the internal connection is ensured to get closed 
/// at dispose.
/// </summary>
public class DBOperations : IDisposable
{
    #region Constructor/Dispose
    Database db;

    public Database Db { get { return db; } }

    public DBOperations(Database database = null)
    {
        if (database == null) db = new LcDatabase().Db;
    }
    public void Dispose()
    {
        db.Dispose();
    }
    #endregion

    #region Read Schema
    /// <summary>
    /// MS-SQL-Server specific objects query
    /// </summary>
    const string sqlGetAllTables = @"select name from sysobjects where xtype = 'U' order by name ASC";
    public IEnumerable<string> EnumerateTables()
    {
        foreach (var r in db.Query(sqlGetAllTables))
        {
            yield return r.name;
        }
    }

    public DataTable GetTables()
    {
        db.Connection.Open();
        return db.Connection.GetSchema("tables", new string[] { null, null, null, "BASE TABLE" });
    }

    public DataTable GetColumnsFrom(string tableName)
    {
        db.Connection.Open();
        return db.Connection.GetSchema("columns", new string[] { null, null, tableName });
    }
    #endregion

    #region Bulk operations
    const string sqlDisableAllConstraints = @"
        /*__NOT_IN_BATCH__*/EXEC sp_msforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT all'
        /*__NOT_IN_BATCH__*/EXEC sp_msforeachtable 'ALTER TABLE ? DISABLE TRIGGER  all'
    ";
    const string sqlEnableAllConstraints = @"
        /*__NOT_IN_BATCH__*/EXEC sp_msforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all'
        /*__NOT_IN_BATCH__*/EXEC sp_msforeachtable 'ALTER TABLE ? ENABLE TRIGGER  all'
    ";
    public DBOperations DisableAllConstraints()
    {
        db.Execute(sqlDisableAllConstraints);
        return this;
    }
    public DBOperations EnableAllConstraints()
    {
        db.Execute(sqlEnableAllConstraints);
        return this;
    }
    public IEnumerable<dynamic> GetAllDataFrom(string table)
    {
        return db.Query("SELECT * FROM [" + table + "]");
    }
    #endregion

    #region Bulk data script generation
    /// <summary>
    /// Create SQL script to replicate table.
    /// Helpful ressources for single table and multi table changes,
    /// Identity reseed and temporarly disable contraints (foreign keys, triggers).
    /// http://stackoverflow.com/questions/159038/can-foreign-key-constraints-be-temporarily-disabled-using-t-sql
    /// http://stackoverflow.com/questions/155246/how-do-you-truncate-all-tables-in-a-database-using-tsql#156813
    /// </summary>
    /// <param name="folder"></param>
    /// <param name="fprefix"></param>
    /// <param name="tablename"></param>
    /// <param name="tdata"></param>
    public string CreateTableInsertScript(string tablename, dynamic tdata, string insertTemplate)
    {
        var sql = "";

        // Disable constraints FOR ALL TABLES (do it per table gets errors):
        sql += sqlDisableAllConstraints;
        // Delete all rows (don't forget \n)
        sql += String.Format("\nDELETE FROM {0} \n", tablename);

        // Upserts for the new data
        foreach (var tr in tdata)
        {
            var sqltr = insertTemplate;
            foreach (var col in tr.Columns)
            {
                var r = new System.Text.RegularExpressions.Regex("@" + col + "\\b");
                sqltr = r.Replace(sqltr, PrepareSqlValue(tr[col]));
                //sqltr = sqltr.Replace("@" + col, PrepareSqlValue(tr[col]));
            }
            sql += sqltr + "\n";
        }

        // Re-enable constraints FOR ALL TABLES (do it per table gets errors):
        sql += sqlEnableAllConstraints;
        sql += "\n";

        return sql;
    }
    string PrepareSqlValue(object val)
    {
        var strval = "NULL";
        if (N.D(val) != null)
        {
            strval = val.ToString().Replace("'", "''");
            return "'" + strval + "'";
        }
        return strval;
    }
    /// <summary>
    /// It splits a batchSql into different strings with each
    /// batch step.
    /// It just split 'GO' keywords without beggining white-spaces and
    /// doesn't discard GOs inside comments.
    /// SPECIAL: It removes every line of SQL that starts with the
    /// special comment: /*__NOT_IN_BATCH__*/
    /// The purpose of this is allow creation of individual scripts that works
    /// fine itself (with that lines), but can be executed several of them in the same batch with
    /// some additions to ensure the success (as disable contraints temporarly)
    /// and that lines can be counterproductive for a batch.
    /// </summary>
    /// <param name="batchSql"></param>
    /// <returns></returns>
    public IEnumerable<string> GetSqlBatchSteps(string batchSql)
    {
        // Get different batch steps, separated by the GO keyword
        Regex regex = new Regex(@"^GO\b", RegexOptions.IgnoreCase | RegexOptions.Multiline);
        var ret = regex.Split(batchSql);
        // Remove lines with the special comment "/*__NOT_IN_BATCH__*/"
        for (var i = 0; i < ret.Length; i++)
        {
            // Clean-up: avoid unwanted lines, not for batch
            var str = (new Regex(@"^/\*__NOT_IN_BATCH__\*/.*$", RegexOptions.Multiline)).Replace(ret[i], "");
            // Return only lines with content
            if (!string.IsNullOrWhiteSpace(str))
                yield return str;
        }
    }
    #endregion

    #region DBCLIENT
    public class XClient : IDisposable
    {
        #region Constructor - dispose
        DbClient.Client db;
        public DbClient.Client Db { get { return db; } }

        public XClient(string connectionName)
        {
            db = new DbClient.Client(connectionName);
        }

        public void Dispose()
        {
            db.Dispose();
        }
        #endregion

        #region Schema
        public DataTable GetTables()
        {
            return db.GetConnection(true).GetSchema("tables", new string[] { null, null, null, "BASE TABLE" });
        }

        public IEnumerable<string> EnumerateTables()
        {
            foreach (DataRow r in GetTables().Rows)
            {
                yield return (string)r["TABLE_NAME"];
            }
        }
        #endregion

        #region Info
        public long GetTotalDatabaseRows()
        {
            var cb = db.GetCommandBuilder();
            long c = 0;
            foreach (var table in EnumerateTables())
            {
                var sql = "SELECT count(*) FROM " + cb.QuoteIdentifier(table);
                c += (long)(int)db.GetScalar(sql, 0);
            }
            return c;
        }
        #endregion

        #region SQL
        public string GetSelectAllSql(string tableName)
        {
            var cb = db.GetCommandBuilder();
            var select = "SELECT * FROM " + cb.QuoteIdentifier(tableName);
            return select;
        }

        public DbCommand GetInsertCommand(string tableName, bool enableIdentityInsert)
        {
            // Instance a builder, that needs almost a Select to be able to
            // get schema info to create other commands.
            var cb = db.GetCommandBuilder();
            // Create SELECT and Command as part of a new Adapter
            var select = "SELECT * FROM " + cb.QuoteIdentifier(tableName);
            cb.DataAdapter = db.GetDataAdapter(select);
            // Table Mapping, from default 'Table' to the given TableName
            cb.DataAdapter.TableMappings.Add("Table", tableName);
            // Finally, our insert
            var insertCmd = cb.GetInsertCommand(true);

            if (enableIdentityInsert)
            {
                // Identity parameters are not automatically added,
                // we need to detect them from table and add them
                var dt = new DataTable();
                cb.DataAdapter.FillSchema(dt, SchemaType.Source);
                foreach (var k in dt.PrimaryKey)
                {
                    if (k.AutoIncrement)
                    {
                        var par = insertCmd.CreateParameter();
                        par.ParameterName = "@" + k.ColumnName;
                        insertCmd.Parameters.Add(par);
                    }
                }
            }
            return insertCmd;
        }

        public string GetInsertTemplate(string tableName)
        {
            return GetInsertCommand(tableName, false).CommandText;
        }

        public string GetDeleteAllSql(string tableName)
        {
            var cb = db.GetCommandBuilder();
            // Create SELECT and Command as part of a new Adapter
            var select = "DELETE FROM " + cb.QuoteIdentifier(tableName);
            return select;
        }

        public string GetEmptyDatabaseSql()
        {
            var sqls = new List<string>();
            foreach (var table in EnumerateTables())
            {
                sqls.Add(GetDeleteAllSql(table));
            }
            var sql = sqlDisableAllConstraints;
            sql += sqls.Aggregate("", (ac, x) => ac + "\n" + x);
            sql += sqlEnableAllConstraints;
            return sql;
        }
        #endregion

        #region Bulk

        public string GetDisableIdentityInsertFor(string tableName)
        {
            var cb = db.GetCommandBuilder();
            return "SET IDENTITY_INSERT " + cb.QuoteIdentifier(tableName) + " OFF";
        }
        public string GetEnableIdentityInsertFor(string tableName)
        {
            var cb = db.GetCommandBuilder();
            return "SET IDENTITY_INSERT " + cb.QuoteIdentifier(tableName) + " ON";
        }

        public class CopyReport
        {
            List<Exception> errors = new List<Exception>();
            public List<Exception> Errors { get { return errors; } }

            List<string> extraTablesAtSource = new List<string>();
            public List<string> ExtraTablesAtSource { get { return extraTablesAtSource; } }

            List<string> extraTablesAtTarget = new List<string>();
            public List<string> ExtraTablesAtTarget { get { return extraTablesAtTarget; } }

            internal int copiedRowsCount = 0;
            public int CopiedRowsCount { get { return copiedRowsCount; } }
        }

        public CopyReport CopyDataFromDatabase(string connectionName)
        {
            var target = this;
            var report = new CopyReport();
            try
            {
                var targetTables = target.EnumerateTables().ToList();
                target.Db.ExecuteSql(sqlDisableAllConstraints);

                using (var source = new XClient(connectionName))
                {
                    var sourceTables = source.EnumerateTables().ToList();
                    foreach (var sourceTable in sourceTables)
                    {
                        try
                        {
                            if (targetTables.Contains(sourceTable))
                            {
                                // Copy data
                                // Prepare table to allow all data as-is (include identity)
                                // Can raise exception when there is no autoincrement for the primary key in the table
                                try
                                {
                                    target.Db.ExecuteSql(target.GetDisableIdentityInsertFor(sourceTable));
                                } catch {}
                                // Prepare command to insert at target for current table
                                var cmd = target.GetInsertCommand(sourceTable, true);
                                cmd.Connection.Open();
                                // Start reading remote data
                                var selectAll = source.GetSelectAllSql(sourceTable);
                                using (var reader = source.Db.GetDataReader(selectAll))
                                {
                                    // For each record
                                    while (reader.Read())
                                    {
                                        // Get data of each columns and prepare at parameters
                                        for (var iColumn = 0; iColumn < reader.FieldCount; iColumn++)
                                        {
                                            var columnName = reader.GetName(iColumn);
                                            cmd.Parameters["@" + columnName].Value = reader[columnName];
                                        }
                                        // Insert data
                                        report.copiedRowsCount += cmd.ExecuteNonQuery();
                                    }
                                }
                                // Reset table identity constraint
                                // Can raise exception when there is no autoincrement for the primary key in the table
                                try
                                {
                                    target.Db.ExecuteSql(target.GetEnableIdentityInsertFor(sourceTable));
                                }
                                catch { }
                            }
                            else
                            {
                                report.ExtraTablesAtSource.Add(sourceTable);
                            }
                        }
                        catch (Exception ex)
                        {
                            report.Errors.Add(ex);
                        }
                    }
                    // Final check of what tables there are at target but not at source
                    // so can be reported as 'no copied because no source'
                    foreach (var targetTable in targetTables)
                    {
                        if (!sourceTables.Contains(targetTable))
                        {
                            report.ExtraTablesAtTarget.Add(targetTable);
                        }
                    }
                }
            }
            catch (Exception bigEx)
            {
                report.Errors.Add(bigEx);
            }
            finally
            {
                try
                {
                    target.Db.ExecuteSql(sqlEnableAllConstraints);
                }
                catch (Exception constraintEx)
                {
                    report.Errors.Add(constraintEx);
                }
            }
            return report;
        }
        #endregion
    }
    #endregion
}