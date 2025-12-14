const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'vehicle-damage-dl-frontend',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createDamagePointRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateDamagePoint', inputVars);
}
createDamagePointRef.operationName = 'CreateDamagePoint';
exports.createDamagePointRef = createDamagePointRef;

exports.createDamagePoint = function createDamagePoint(dcOrVars, vars) {
  return executeMutation(createDamagePointRef(dcOrVars, vars));
};

const listImagesForVehicleRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListImagesForVehicle', inputVars);
}
listImagesForVehicleRef.operationName = 'ListImagesForVehicle';
exports.listImagesForVehicleRef = listImagesForVehicleRef;

exports.listImagesForVehicle = function listImagesForVehicle(dcOrVars, vars) {
  return executeQuery(listImagesForVehicleRef(dcOrVars, vars));
};

const updateDamageDetectionResultRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateDamageDetectionResult', inputVars);
}
updateDamageDetectionResultRef.operationName = 'UpdateDamageDetectionResult';
exports.updateDamageDetectionResultRef = updateDamageDetectionResultRef;

exports.updateDamageDetectionResult = function updateDamageDetectionResult(dcOrVars, vars) {
  return executeMutation(updateDamageDetectionResultRef(dcOrVars, vars));
};

const listVehiclesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListVehicles');
}
listVehiclesRef.operationName = 'ListVehicles';
exports.listVehiclesRef = listVehiclesRef;

exports.listVehicles = function listVehicles(dc) {
  return executeQuery(listVehiclesRef(dc));
};
