const fs = require('fs');

function updateLog(requestor, request, response, caller) {

const jsonData = {
    requestor: requestor,
    request: request,
    response: response,
    caller: caller
}


  // Read the existing data from monitor.json file
let existingData = {};
try {
  const fileData = fs.readFileSync('monitor.json', 'utf8');
  existingData = JSON.parse(fileData);
} catch (error) {
  console.error('Error reading or parsing monitor.json:', error);
  existingData = {};
}

  // Check if the requester key already exists
  if (existingData.hasOwnProperty(jsonData.caller)) {
    // Update the existing record with new data
    existingData[jsonData.caller] = jsonData;
  } else {
    // Add a new key with the requester and its data
    existingData[jsonData.caller] = jsonData;
  }

  // Write the updated data back to monitor.json file
  try {
    fs.writeFileSync('monitor.json', JSON.stringify(existingData));
    //console.log('monitor.json file updated successfully.');
  } catch (error) {
    console.error('Error writing to monitor.json:', error);
  }
}

module.exports = { updateLog };
