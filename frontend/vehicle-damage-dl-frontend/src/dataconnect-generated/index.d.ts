import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateDamagePointData {
  damagePoint_insert: DamagePoint_Key;
}

export interface CreateDamagePointVariables {
  damageDetectionResultId: UUIDString;
  damageType: string;
  severity: string;
  xCoordinate: number;
  yCoordinate: number;
}

export interface DamageDetectionResult_Key {
  id: UUIDString;
  __typename?: 'DamageDetectionResult_Key';
}

export interface DamagePoint_Key {
  id: UUIDString;
  __typename?: 'DamagePoint_Key';
}

export interface Image_Key {
  id: UUIDString;
  __typename?: 'Image_Key';
}

export interface ListImagesForVehicleData {
  images: ({
    id: UUIDString;
    imageUrl: string;
    description?: string | null;
    uploadDate: TimestampString;
  } & Image_Key)[];
}

export interface ListImagesForVehicleVariables {
  vehicleId: UUIDString;
}

export interface ListVehiclesData {
  vehicles: ({
    id: UUIDString;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  } & Vehicle_Key)[];
}

export interface UpdateDamageDetectionResultData {
  damageDetectionResult_update?: DamageDetectionResult_Key | null;
}

export interface UpdateDamageDetectionResultVariables {
  id: UUIDString;
  isAIConfirmed?: boolean | null;
  overallAssessment?: string | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface Vehicle_Key {
  id: UUIDString;
  __typename?: 'Vehicle_Key';
}

interface CreateDamagePointRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateDamagePointVariables): MutationRef<CreateDamagePointData, CreateDamagePointVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateDamagePointVariables): MutationRef<CreateDamagePointData, CreateDamagePointVariables>;
  operationName: string;
}
export const createDamagePointRef: CreateDamagePointRef;

export function createDamagePoint(vars: CreateDamagePointVariables): MutationPromise<CreateDamagePointData, CreateDamagePointVariables>;
export function createDamagePoint(dc: DataConnect, vars: CreateDamagePointVariables): MutationPromise<CreateDamagePointData, CreateDamagePointVariables>;

interface ListImagesForVehicleRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListImagesForVehicleVariables): QueryRef<ListImagesForVehicleData, ListImagesForVehicleVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListImagesForVehicleVariables): QueryRef<ListImagesForVehicleData, ListImagesForVehicleVariables>;
  operationName: string;
}
export const listImagesForVehicleRef: ListImagesForVehicleRef;

export function listImagesForVehicle(vars: ListImagesForVehicleVariables): QueryPromise<ListImagesForVehicleData, ListImagesForVehicleVariables>;
export function listImagesForVehicle(dc: DataConnect, vars: ListImagesForVehicleVariables): QueryPromise<ListImagesForVehicleData, ListImagesForVehicleVariables>;

interface UpdateDamageDetectionResultRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateDamageDetectionResultVariables): MutationRef<UpdateDamageDetectionResultData, UpdateDamageDetectionResultVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateDamageDetectionResultVariables): MutationRef<UpdateDamageDetectionResultData, UpdateDamageDetectionResultVariables>;
  operationName: string;
}
export const updateDamageDetectionResultRef: UpdateDamageDetectionResultRef;

export function updateDamageDetectionResult(vars: UpdateDamageDetectionResultVariables): MutationPromise<UpdateDamageDetectionResultData, UpdateDamageDetectionResultVariables>;
export function updateDamageDetectionResult(dc: DataConnect, vars: UpdateDamageDetectionResultVariables): MutationPromise<UpdateDamageDetectionResultData, UpdateDamageDetectionResultVariables>;

interface ListVehiclesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListVehiclesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListVehiclesData, undefined>;
  operationName: string;
}
export const listVehiclesRef: ListVehiclesRef;

export function listVehicles(): QueryPromise<ListVehiclesData, undefined>;
export function listVehicles(dc: DataConnect): QueryPromise<ListVehiclesData, undefined>;

