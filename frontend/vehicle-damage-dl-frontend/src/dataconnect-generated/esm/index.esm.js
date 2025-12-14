import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'vehicle-damage-dl-frontend',
  location: 'us-east4'
};

export const createDamagePointRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateDamagePoint', inputVars);
}
createDamagePointRef.operationName = 'CreateDamagePoint';

export function createDamagePoint(dcOrVars, vars) {
  return executeMutation(createDamagePointRef(dcOrVars, vars));
}

export const listImagesForVehicleRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListImagesForVehicle', inputVars);
}
listImagesForVehicleRef.operationName = 'ListImagesForVehicle';

export function listImagesForVehicle(dcOrVars, vars) {
  return executeQuery(listImagesForVehicleRef(dcOrVars, vars));
}

export const updateDamageDetectionResultRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateDamageDetectionResult', inputVars);
}
updateDamageDetectionResultRef.operationName = 'UpdateDamageDetectionResult';

export function updateDamageDetectionResult(dcOrVars, vars) {
  return executeMutation(updateDamageDetectionResultRef(dcOrVars, vars));
}

export const listVehiclesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListVehicles');
}
listVehiclesRef.operationName = 'ListVehicles';

export function listVehicles(dc) {
  return executeQuery(listVehiclesRef(dc));
}

