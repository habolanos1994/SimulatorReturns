const sql = require('mssql');
const logError = require('./errorlog').logError;
const fs = require('fs');
const path = require('path');
const sourcefile = path.basename(__filename)

const sqlConfig = {
  user: 'admindb',
  password: 'pass',
  database: 'Returns',
  server: '10.63.192.30', 
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, 
    trustServerCertificate: true 
  }
}

let sqlPool;

async function connectToSql() {
  if (!sqlPool) {
    try {
      sqlPool = await sql.connect(sqlConfig);
    } catch (err) {
      logError(err,'connectToSql',sourcefile);
      console.error("Error connecting to SQL: ", err);
      sqlPool = null; // Reset the pool so we will try to connect again next time
      throw err;
    }
  }

  return sqlPool;
}

async function SQLSorter(serial, source) {
  try {
    const pool = await connectToSql();
    const request = new sql.Request(pool);
    request.input('Sorter_Scan', sql.VarChar, serial);
    request.input('Sorter_Source', sql.VarChar, source);
    const result = await request.query(`
      INSERT INTO Sorter
      (
      [Sorter_Scan]
      ,[Sorter_Source]
      ,LOG_DTTM
      )
      VALUES
      (
          @Sorter_Scan, @Sorter_Source, GETDATE()
      )
    `);
    return result
  } catch (err) {
    logError(err,'SQLSorter',sourcefile);
    console.error("Error occurred: ", err);
    return err
  }
}

async function SQLBOX(serial, source) {
  try {
    const pool = await connectToSql();
    const request = new sql.Request(pool);
    request.input('BoxTracker_Scan', sql.VarChar, serial);
    request.input('BoxTracker_Source', sql.VarChar, source);
    const result = await request.query(`
      INSERT INTO BoxTracker
      (
      [BoxTracker_Scan]
      ,[BoxTracker_Source]
      ,LOG_DTTM
      )
      VALUES
      (
          @BoxTracker_Scan, @BoxTracker_Source, GETDATE()
      )
    `);
    return result
  } catch (err) {
    logError(err,'SQLBOX',sourcefile);
    console.error("Error occurred: ", err);
    return err
  }
}

async function SQLReceiving(serial, source) {
    try {
      const pool = await connectToSql();
      const request = new sql.Request(pool);
      request.input('Receiving_Scan', sql.VarChar, serial);
      request.input('Receiving_Source', sql.VarChar, source);
      const result = await request.query(`
        INSERT INTO Receiving
        (
        [Receiving_Scan]
        ,[Receiving_Source]
        ,LOG_DTTM
        )
        VALUES
        (
            @Receiving_Scan, @Receiving_Source, GETDATE()
        )
      `);
      return result;
    } catch (err) {
      logError(err,'SQLBOX',sourcefile);
      console.error("Error occurred: ", err);
      return null; // Return null when an error occurs
    }
  }


module.exports = { SQLSorter, SQLBOX, SQLReceiving }
