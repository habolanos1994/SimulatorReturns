// Imports
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const logError = require('./errorlog').logError;
const { updateLog } = require("./monitorlog")
const { GetDivertInfoForEquipment, GetPLCIDForEquipment, PostSerialForReceiving, GetPLCTNUMForEquipment, GetPLCIDForTrackNum } = require("./APIRequest.js");
const os = require('os'); // Assuming you forgot to import os

// Variables
const app = express();
const port = 8088;
const sourcefile = path.basename(__filename);
const hostname = os.hostname();

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, 'node_modules', 'papaparse')))
app.use('/js', express.static(path.join(__dirname, 'public')));
app.use('/libs', express.static(path.join(__dirname, 'node_modules')));
app.use('/lib', express.static(path.join(__dirname, 'lib')));




// Middleware to set headers
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'Cache-Control');
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Server', 'Linux/Rocky8');
    res.setHeader('X-Nodejs-Version', '18.15.0');
    res.setHeader('X-Powered-By', 'Node.js, Express');
    next();
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.get('/errorLog', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'errorLog.html'));
});

app.get('/getErrorLog', (req, res) => {
  fs.readFile('errorlog.csv', 'utf8', (err, data) => {
    if (err) {
      logError(err, 'getErrorLog', sourcefile);
      res.status(500).send("Error reading error log");
    } else {
      res.type('text/csv');
      res.send(data);
    }
  });
});

app.post('/clearErrorLog', (req, res) => {
  fs.writeFile('errorlog.csv', '', (err) => {
    if (err) {
        logError(err, 'clearErrorLog', sourcefile);
      res.status(500).send("Error clearing error log");
    } else {
      res.sendStatus(200);
    }
  });
});

app.get('/QRA', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'QRA.html'));
});


app.get("/Programs_NET_2/RCVX/api/RCV/GetPLCIDForEquipment", async (req, res) => {
    let response;
    if ('tnum' in req.query && !('srl' in req.query)) {
      response = await GetPLCTNUMForEquipment(req.query.tnum, req.ip);
      updateLog( req.ip, req.query.tnum, response, 'GetPLCIDForEquipmentTnum')

    } else {
      response = await GetPLCIDForEquipment(req.query.tnum, req.query.loc, req.query.srl, req.query.sensor, req.ip);
      updateLog( req.ip, req.query.srl, response, 'GetPLCIDForEquipment')
    }
    res.setHeader('Content-Type', 'application/json');

    res.send(response);


  });


app.get("/Programs_NET_2/RCVX/api/RCV/GetDivertInfoForEquipment", async (req, res) => {
  let response = await GetDivertInfoForEquipment(
    req.query.tnum,
    req.query.loc,
    req.query.srl,
    req.query.divertinfo,
    req.query.code,
    req.ip
  );
  updateLog( req.ip, divertinfo, response, 'GetDivertInfoForEquipment')
  res.setHeader('Content-Type', 'application/json');
  res.send(response);
});

app.get("/Programs_NET_2/RCVX/api/RCV/GetPLCIDForTrackNum", async (req, res) => {
  let response = await GetPLCIDForTrackNum(
    req.query.loc,
    req.query.tracknum1,
    req.ip
  );
  updateLog( req.ip, req.query.tracknum1, response, 'GetPLCIDForTrackNum')
  res.setHeader('Content-Type', 'application/json');
  res.send(response);
});

app.get('/trackScan', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Trackscan.html'));
  });


app.get("/Programs_NET_2/RCVX/api/RCV/PostSerialForReceiving", async (req, res) => {
  if ('loc' in req.query && 'srl' in req.query) {
    let response = await PostSerialForReceiving(req.query.loc, req.query.srl, req.ip);
    updateLog( req.ip, req.query.srl, response, 'PostSerialForReceiving')
    res.setHeader('Content-Type', 'application/json');
    res.send(response);
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: "Query Fail please follow the query: loc: 'string', srl: 'string'" });
  }
});

app.get('/models', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'models.html'));
});

app.get('/api/models', (req, res) => {
  fs.readFile(path.join(__dirname, 'model.json'), 'utf8', (err, data) => {
    if (err) {
        logError(err, 'getModels', sourcefile);
        res.status(500).send("Error reading model file");
    } else {
        try {
            const parsedData = JSON.parse(data);
            res.json(parsedData.models);
        } catch (jsonErr) {
            console.error('Error parsing model.json:', jsonErr);
            res.status(500).send("Error parsing model file");
        }
    }
  });
});

app.post('/api/models/update', (req, res) => {
  let updatedModel = req.body;
  console.log(updatedModel);

  fs.readFile(path.join(__dirname, 'model.json'), 'utf8', (err, data) => {
      if (err) {
          logError(err, 'updateModels', sourcefile);
          res.status(500).send("Error reading model file");
          return;
      }
      
      let models = JSON.parse(data).models;
      let index = models.findIndex(model => model.model === updatedModel.model && model.code === updatedModel.code);

      if (index >= 0) {
          models[index] = updatedModel;  // Update the model
      } else {
          models.push(updatedModel);  // Add new model if it doesn't exist
      }
      
      fs.writeFile(path.join(__dirname, 'model.json'), JSON.stringify({ models: models }, null, 2), 'utf8', (err) => {
          if (err) {
              logError(err, 'updateModels', sourcefile);
              res.status(500).send("Error updating model file");
              return;
          }
          
          res.status(200).send("Model updated successfully");
      });
  });
});

app.post('/api/models/reset', (req, res) => {
  fs.readFile(path.join(__dirname, 'modelbackup.json'), 'utf8', (err, data) => {
      if (err) {
          logError(err, 'resetModels', sourcefile);
          res.status(500).send("Error reading backup model file");
          return;
      }
      
      fs.writeFile(path.join(__dirname, 'model.json'), data, 'utf8', (err) => {
          if (err) {
              logError(err, 'resetModels', sourcefile);
              res.status(500).send("Error resetting model file");
              return;
          }
          
          res.status(200).send("Model reset to defaults successfully");
      });
  });
});

app.get('/APIMonittor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'APIMonittor.html'));
});


app.get('/api/APIMonittor', (req, res) => {
  fs.readFile(path.join(__dirname, 'monitor.json'), 'utf8', (err, data) => {
    if (err) {
        logError(err, 'APIMonittor', sourcefile);
        res.status(500).send("Error reading model file");
    } else {
        try {
            const jsonData = JSON.parse(data);  // Parse the data
            res.json(jsonData);  // Send it back
        } catch (jsonErr) {
            console.error('Error parsing monitor.json:', jsonErr);
            res.status(500).send("Error parsing model file");
        }
    }
  });
});




// Middleware for handling 404 errors
app.use((req, res, next) => {
    let errMsg = `errorApiNotFound:${req.originalUrl},Requestor:${req.ip}`;
    res.status(404).send('Cannot GET /');
    logError(errMsg, 'errorApiNotFound', sourcefile);
});
  
  // Error Handling Middleware
  app.use((err, req, res, next) => {
      logError(err.message, 'middleware', sourcefile);
      console.error(`Error: ${err.message}`);
      res.status(500).send('Server error');
  });
  
  // Start the server
  app.listen(port, () => {
    console.log(`${hostname}:${port}`);
  });