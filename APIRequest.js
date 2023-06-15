//const { mqttpub } = require("./mqttpublish")
const os = require("os");
const { logError } = require("./errorlog");
const fs = require("fs");
const { SQLSorter, SQLBOX, SQLReceiving } = require("./SQLFuntions");
const path = require("path");
const sourcefile = path.basename(__filename);

function setHeaders(res) {
  res.setHeader("Content-Type", "application/json");
}

async function SendToMQTT(data, operation, Datatype) {
  //mqttpub(`ELP/Returns/PROXY/${operation}/${Datatype}`, data)
}

async function GetPLCIDForEquipment(tnum, loc, srl, sensor, reqIP) {
  let result;

  try {
    // SQLSorter operation
    sqlresult = await SQLSorter(srl, reqIP);

    if (srl.length === 12) {
      const searchStr2 = srl.substring(3, 5);

      // Read the JSON file
      let jsonData = JSON.parse(fs.readFileSync("./model.json", "utf8"));

      // Look for the model with the same code
      let model = jsonData.models.find((model) => model.code === searchStr2);

      if (model && model.location) {
        result = model.location;
      } else {
        result = "ELP_11";
      }
    }
  } catch (err) {
    logError(err, "GetPLCIDForEquipment", sourcefile);
    console.error("Error occurred: ", err);
    result = "ELP_11";
  }

  const data = {
    tnum: tnum,
    plc_route_value: result,
  };

  return data;
}

async function GetPLCTNUMForEquipment(tnum, reqIP) {
  try {
    const data = {
      tnum: tnum,
      plc_route_value: null,
    };
    return data;
  } catch (err) {
    logError(err, "GetPLCTNUMForEquipment", sourcefile);
    return;
  }
}

async function GetPLCIDForTrackNum(loc, track1, reqIP) {
  let result;

  try {
    // track1 operation
    await SQLBOX(track1, reqIP);
    if (
      !track1 ||
      track1.includes("?") ||
      track1.includes("!") ||
      track1.includes("^")
    ) {
      result = "RA";
    } else {
      result = "PASS";
    }
  } catch (err) {
    logError(err, "GetPLCIDForTrackNum", sourcefile);
    console.error("Error occurred: ", err);
    result = "RA";
  }

  const data = {
    plc_route_value: result,
  };

  return data;
}

async function GetDivertInfoForEquipment(
  tnum,
  loc,
  srl,
  divertinfo,
  code,
  reqIP
) {

    const data = {
        Serial: srl,
        Result: code,
        Requester: reqIP,
        Operation: 'GetDivertInfoForEquipment'
      };

    return data

}

async function PostSerialForReceiving(loc, srl, reqIP) {
    let result;
    try {
      // SQLSorter operation
      const sqlResult = await SQLReceiving(srl, reqIP);
      
      if (sqlResult) {
        result = "Success";
      } else {
        result = "Error please Call Test Engineer";
      }
    } catch (err) {
      logError(err, "PostSerialForReceiving", sourcefile);
      console.error("Error occurred: ", err);
      result = "Error please Call Test Engineer";
    }
  
    return result;
  }

module.exports = {
  GetPLCIDForEquipment,
  PostSerialForReceiving,
  GetPLCTNUMForEquipment,
  GetPLCIDForTrackNum,
  SendToMQTT,
  GetDivertInfoForEquipment,
};
