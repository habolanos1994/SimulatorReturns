const fs = require('fs');
const moment = require('moment'); // If not already installed, install using `npm install moment`

function logError(errorMessage, soucefunction, sourcefile) {
    // Format the current time
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    
    // Format the error message with the timestamp, function, and file
    const logMessage = `${timestamp}, ${sourcefile}, ${soucefunction}, ${errorMessage}\n`;
  
    // Append the log message to the errorlog.csv file
    fs.appendFile('errorlog.csv', logMessage, (err) => {
      if (err) {
        console.log('Error logging the message: ', err);
      } else {
        //console.log('Error logged successfully!');
      }
    });
  }
  

logError('humberto test')


module.exports = { logError
    }

