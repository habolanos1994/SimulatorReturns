const fs = require('fs');

// Read the JSON file
let jsonData = JSON.parse(fs.readFileSync('./model.json', 'utf8'));

// CSV data
let csvData = `HOPPER with SLING CR,ELP_2,XJ,1
Hopper3,ELP_2,XP,1
HOPPERDUO,ELP_2,XT,1
ViP722kDVR,ELP_8,RM,1
ViP722kOTA Module,ELP_8,RR,1
ViP722k(LF Main Board),ELP_8,R5,1
ViP722kDVR(LF Main Board) w/ DN241 Card,ELP_8,KC,1
ViP722k,ELP_8,AL,1
ViP722k(LF Main Board),ELP_8,AM,0
ViP722KDN552 Chip (LF Main Board),ELP_4,KE,1
Hopperwith Sling,ELP_4,XD,1
WALLY,ELP_4,XN,1
ViP211k,ELP_5,RG,1
ViP211k (LF Main Board),ELP_5,RV,1
ViP211k w/DN241 Card,ELP_5,RY,1
ViP211K (LF Main Board) w/ DN241 Card,ELP_5,RZ,1
ViP211k,ELP_5,AE,1
ViP211k (LF Main Board),ELP_5,AF,1
JOEY3.0,ELP_5,XS,1
Joey CR,ELP_7,XF,1
Hopper Plus,ELP_7,WS,1
WIFIJOEY4,ELP_7,XU,1
JOEY4.0,ELP_7,XV,1
ViP722,ELP_8,RJ,1
ViP722 w/DN241 Chip,ELP_4,RK,1
ViP722 w/DN241 Card,ELP_4,RP,1
ViP722i,ELP_4,KB,1
Wireless Joey,ELP_8,XG,1
4kJoey,ELP_8,XM,1
WAP 2.0,ELP_11,XR,1
Wireless Joey Access Point,ELP_11,XH,1
XiPMoCABridge,ELP_11,UI,0
MoCA Bridge,ELP_11,UH,1
no_read,ELP_11,??
multi,ELP_11,!!
nodata,ELP_11,^^`; // replace with your CSV data

// Split CSV data into lines
let csvLines = csvData.split('\n');

// Convert CSV data to map for easier access
let csvMap = {};
csvLines.forEach(line => {
  let fields = line.split(',');
  if (fields[2] && fields[2] !== "??") {
    csvMap[fields[2]] = fields[1]; // code -> location mapping
  }
});

// Process each model in JSON data
jsonData.models.forEach(model => {
  if (csvMap[model.code]) {
    // If model exists in CSV data, update the location
    model.location = csvMap[model.code];
  } else {
    // If model doesn't exist in CSV data, assign 'ELP_10' as location
    model.location = 'ELP_10';
  }
});

// Write the updated data back to the JSON file
fs.writeFileSync('./model.json', JSON.stringify(jsonData, null, 2), 'utf8');

// Sort Data

// const fs = require('fs');

// // Read the JSON file
// let jsonData = JSON.parse(fs.readFileSync('./model.json', 'utf8'));

// // Sort the models array based on the location
// jsonData.models.sort((a, b) => {
//   let aLocation = a.location || '';
//   let bLocation = b.location || '';

//   // If location is in format ELP_n, compare the numeric part
//   if (aLocation.startsWith('ELP_') && bLocation.startsWith('ELP_')) {
//     let aNumber = parseInt(aLocation.split('_')[1]);
//     let bNumber = parseInt(bLocation.split('_')[1]);

//     return aNumber - bNumber;
//   }

//   // Fall back to string comparison
//   return aLocation.localeCompare(bLocation);
// });

// // Write the sorted data back to the JSON file
// fs.writeFileSync('./model.json', JSON.stringify(jsonData, null, 2), 'utf8');
