import { CreateDamagePointData, CreateDamagePointVariables, ListImagesForVehicleData, ListImagesForVehicleVariables, UpdateDamageDetectionResultData, UpdateDamageDetectionResultVariables, ListVehiclesData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateDamagePoint(options?: useDataConnectMutationOptions<CreateDamagePointData, FirebaseError, CreateDamagePointVariables>): UseDataConnectMutationResult<CreateDamagePointData, CreateDamagePointVariables>;
export function useCreateDamagePoint(dc: DataConnect, options?: useDataConnectMutationOptions<CreateDamagePointData, FirebaseError, CreateDamagePointVariables>): UseDataConnectMutationResult<CreateDamagePointData, CreateDamagePointVariables>;

export function useListImagesForVehicle(vars: ListImagesForVehicleVariables, options?: useDataConnectQueryOptions<ListImagesForVehicleData>): UseDataConnectQueryResult<ListImagesForVehicleData, ListImagesForVehicleVariables>;
export function useListImagesForVehicle(dc: DataConnect, vars: ListImagesForVehicleVariables, options?: useDataConnectQueryOptions<ListImagesForVehicleData>): UseDataConnectQueryResult<ListImagesForVehicleData, ListImagesForVehicleVariables>;

export function useUpdateDamageDetectionResult(options?: useDataConnectMutationOptions<UpdateDamageDetectionResultData, FirebaseError, UpdateDamageDetectionResultVariables>): UseDataConnectMutationResult<UpdateDamageDetectionResultData, UpdateDamageDetectionResultVariables>;
export function useUpdateDamageDetectionResult(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateDamageDetectionResultData, FirebaseError, UpdateDamageDetectionResultVariables>): UseDataConnectMutationResult<UpdateDamageDetectionResultData, UpdateDamageDetectionResultVariables>;

export function useListVehicles(options?: useDataConnectQueryOptions<ListVehiclesData>): UseDataConnectQueryResult<ListVehiclesData, undefined>;
export function useListVehicles(dc: DataConnect, options?: useDataConnectQueryOptions<ListVehiclesData>): UseDataConnectQueryResult<ListVehiclesData, undefined>;
