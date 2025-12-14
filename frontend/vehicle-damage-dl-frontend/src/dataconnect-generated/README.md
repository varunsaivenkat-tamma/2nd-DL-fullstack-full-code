# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListImagesForVehicle*](#listimagesforvehicle)
  - [*ListVehicles*](#listvehicles)
- [**Mutations**](#mutations)
  - [*CreateDamagePoint*](#createdamagepoint)
  - [*UpdateDamageDetectionResult*](#updatedamagedetectionresult)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListImagesForVehicle
You can execute the `ListImagesForVehicle` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listImagesForVehicle(vars: ListImagesForVehicleVariables): QueryPromise<ListImagesForVehicleData, ListImagesForVehicleVariables>;

interface ListImagesForVehicleRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListImagesForVehicleVariables): QueryRef<ListImagesForVehicleData, ListImagesForVehicleVariables>;
}
export const listImagesForVehicleRef: ListImagesForVehicleRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listImagesForVehicle(dc: DataConnect, vars: ListImagesForVehicleVariables): QueryPromise<ListImagesForVehicleData, ListImagesForVehicleVariables>;

interface ListImagesForVehicleRef {
  ...
  (dc: DataConnect, vars: ListImagesForVehicleVariables): QueryRef<ListImagesForVehicleData, ListImagesForVehicleVariables>;
}
export const listImagesForVehicleRef: ListImagesForVehicleRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listImagesForVehicleRef:
```typescript
const name = listImagesForVehicleRef.operationName;
console.log(name);
```

### Variables
The `ListImagesForVehicle` query requires an argument of type `ListImagesForVehicleVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListImagesForVehicleVariables {
  vehicleId: UUIDString;
}
```
### Return Type
Recall that executing the `ListImagesForVehicle` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListImagesForVehicleData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListImagesForVehicleData {
  images: ({
    id: UUIDString;
    imageUrl: string;
    description?: string | null;
    uploadDate: TimestampString;
  } & Image_Key)[];
}
```
### Using `ListImagesForVehicle`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listImagesForVehicle, ListImagesForVehicleVariables } from '@dataconnect/generated';

// The `ListImagesForVehicle` query requires an argument of type `ListImagesForVehicleVariables`:
const listImagesForVehicleVars: ListImagesForVehicleVariables = {
  vehicleId: ..., 
};

// Call the `listImagesForVehicle()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listImagesForVehicle(listImagesForVehicleVars);
// Variables can be defined inline as well.
const { data } = await listImagesForVehicle({ vehicleId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listImagesForVehicle(dataConnect, listImagesForVehicleVars);

console.log(data.images);

// Or, you can use the `Promise` API.
listImagesForVehicle(listImagesForVehicleVars).then((response) => {
  const data = response.data;
  console.log(data.images);
});
```

### Using `ListImagesForVehicle`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listImagesForVehicleRef, ListImagesForVehicleVariables } from '@dataconnect/generated';

// The `ListImagesForVehicle` query requires an argument of type `ListImagesForVehicleVariables`:
const listImagesForVehicleVars: ListImagesForVehicleVariables = {
  vehicleId: ..., 
};

// Call the `listImagesForVehicleRef()` function to get a reference to the query.
const ref = listImagesForVehicleRef(listImagesForVehicleVars);
// Variables can be defined inline as well.
const ref = listImagesForVehicleRef({ vehicleId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listImagesForVehicleRef(dataConnect, listImagesForVehicleVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.images);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.images);
});
```

## ListVehicles
You can execute the `ListVehicles` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listVehicles(): QueryPromise<ListVehiclesData, undefined>;

interface ListVehiclesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListVehiclesData, undefined>;
}
export const listVehiclesRef: ListVehiclesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listVehicles(dc: DataConnect): QueryPromise<ListVehiclesData, undefined>;

interface ListVehiclesRef {
  ...
  (dc: DataConnect): QueryRef<ListVehiclesData, undefined>;
}
export const listVehiclesRef: ListVehiclesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listVehiclesRef:
```typescript
const name = listVehiclesRef.operationName;
console.log(name);
```

### Variables
The `ListVehicles` query has no variables.
### Return Type
Recall that executing the `ListVehicles` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListVehiclesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListVehiclesData {
  vehicles: ({
    id: UUIDString;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  } & Vehicle_Key)[];
}
```
### Using `ListVehicles`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listVehicles } from '@dataconnect/generated';


// Call the `listVehicles()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listVehicles();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listVehicles(dataConnect);

console.log(data.vehicles);

// Or, you can use the `Promise` API.
listVehicles().then((response) => {
  const data = response.data;
  console.log(data.vehicles);
});
```

### Using `ListVehicles`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listVehiclesRef } from '@dataconnect/generated';


// Call the `listVehiclesRef()` function to get a reference to the query.
const ref = listVehiclesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listVehiclesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.vehicles);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.vehicles);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateDamagePoint
You can execute the `CreateDamagePoint` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createDamagePoint(vars: CreateDamagePointVariables): MutationPromise<CreateDamagePointData, CreateDamagePointVariables>;

interface CreateDamagePointRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateDamagePointVariables): MutationRef<CreateDamagePointData, CreateDamagePointVariables>;
}
export const createDamagePointRef: CreateDamagePointRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createDamagePoint(dc: DataConnect, vars: CreateDamagePointVariables): MutationPromise<CreateDamagePointData, CreateDamagePointVariables>;

interface CreateDamagePointRef {
  ...
  (dc: DataConnect, vars: CreateDamagePointVariables): MutationRef<CreateDamagePointData, CreateDamagePointVariables>;
}
export const createDamagePointRef: CreateDamagePointRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createDamagePointRef:
```typescript
const name = createDamagePointRef.operationName;
console.log(name);
```

### Variables
The `CreateDamagePoint` mutation requires an argument of type `CreateDamagePointVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateDamagePointVariables {
  damageDetectionResultId: UUIDString;
  damageType: string;
  severity: string;
  xCoordinate: number;
  yCoordinate: number;
}
```
### Return Type
Recall that executing the `CreateDamagePoint` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateDamagePointData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateDamagePointData {
  damagePoint_insert: DamagePoint_Key;
}
```
### Using `CreateDamagePoint`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createDamagePoint, CreateDamagePointVariables } from '@dataconnect/generated';

// The `CreateDamagePoint` mutation requires an argument of type `CreateDamagePointVariables`:
const createDamagePointVars: CreateDamagePointVariables = {
  damageDetectionResultId: ..., 
  damageType: ..., 
  severity: ..., 
  xCoordinate: ..., 
  yCoordinate: ..., 
};

// Call the `createDamagePoint()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createDamagePoint(createDamagePointVars);
// Variables can be defined inline as well.
const { data } = await createDamagePoint({ damageDetectionResultId: ..., damageType: ..., severity: ..., xCoordinate: ..., yCoordinate: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createDamagePoint(dataConnect, createDamagePointVars);

console.log(data.damagePoint_insert);

// Or, you can use the `Promise` API.
createDamagePoint(createDamagePointVars).then((response) => {
  const data = response.data;
  console.log(data.damagePoint_insert);
});
```

### Using `CreateDamagePoint`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createDamagePointRef, CreateDamagePointVariables } from '@dataconnect/generated';

// The `CreateDamagePoint` mutation requires an argument of type `CreateDamagePointVariables`:
const createDamagePointVars: CreateDamagePointVariables = {
  damageDetectionResultId: ..., 
  damageType: ..., 
  severity: ..., 
  xCoordinate: ..., 
  yCoordinate: ..., 
};

// Call the `createDamagePointRef()` function to get a reference to the mutation.
const ref = createDamagePointRef(createDamagePointVars);
// Variables can be defined inline as well.
const ref = createDamagePointRef({ damageDetectionResultId: ..., damageType: ..., severity: ..., xCoordinate: ..., yCoordinate: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createDamagePointRef(dataConnect, createDamagePointVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.damagePoint_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.damagePoint_insert);
});
```

## UpdateDamageDetectionResult
You can execute the `UpdateDamageDetectionResult` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateDamageDetectionResult(vars: UpdateDamageDetectionResultVariables): MutationPromise<UpdateDamageDetectionResultData, UpdateDamageDetectionResultVariables>;

interface UpdateDamageDetectionResultRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateDamageDetectionResultVariables): MutationRef<UpdateDamageDetectionResultData, UpdateDamageDetectionResultVariables>;
}
export const updateDamageDetectionResultRef: UpdateDamageDetectionResultRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateDamageDetectionResult(dc: DataConnect, vars: UpdateDamageDetectionResultVariables): MutationPromise<UpdateDamageDetectionResultData, UpdateDamageDetectionResultVariables>;

interface UpdateDamageDetectionResultRef {
  ...
  (dc: DataConnect, vars: UpdateDamageDetectionResultVariables): MutationRef<UpdateDamageDetectionResultData, UpdateDamageDetectionResultVariables>;
}
export const updateDamageDetectionResultRef: UpdateDamageDetectionResultRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateDamageDetectionResultRef:
```typescript
const name = updateDamageDetectionResultRef.operationName;
console.log(name);
```

### Variables
The `UpdateDamageDetectionResult` mutation requires an argument of type `UpdateDamageDetectionResultVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateDamageDetectionResultVariables {
  id: UUIDString;
  isAIConfirmed?: boolean | null;
  overallAssessment?: string | null;
}
```
### Return Type
Recall that executing the `UpdateDamageDetectionResult` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateDamageDetectionResultData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateDamageDetectionResultData {
  damageDetectionResult_update?: DamageDetectionResult_Key | null;
}
```
### Using `UpdateDamageDetectionResult`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateDamageDetectionResult, UpdateDamageDetectionResultVariables } from '@dataconnect/generated';

// The `UpdateDamageDetectionResult` mutation requires an argument of type `UpdateDamageDetectionResultVariables`:
const updateDamageDetectionResultVars: UpdateDamageDetectionResultVariables = {
  id: ..., 
  isAIConfirmed: ..., // optional
  overallAssessment: ..., // optional
};

// Call the `updateDamageDetectionResult()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateDamageDetectionResult(updateDamageDetectionResultVars);
// Variables can be defined inline as well.
const { data } = await updateDamageDetectionResult({ id: ..., isAIConfirmed: ..., overallAssessment: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateDamageDetectionResult(dataConnect, updateDamageDetectionResultVars);

console.log(data.damageDetectionResult_update);

// Or, you can use the `Promise` API.
updateDamageDetectionResult(updateDamageDetectionResultVars).then((response) => {
  const data = response.data;
  console.log(data.damageDetectionResult_update);
});
```

### Using `UpdateDamageDetectionResult`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateDamageDetectionResultRef, UpdateDamageDetectionResultVariables } from '@dataconnect/generated';

// The `UpdateDamageDetectionResult` mutation requires an argument of type `UpdateDamageDetectionResultVariables`:
const updateDamageDetectionResultVars: UpdateDamageDetectionResultVariables = {
  id: ..., 
  isAIConfirmed: ..., // optional
  overallAssessment: ..., // optional
};

// Call the `updateDamageDetectionResultRef()` function to get a reference to the mutation.
const ref = updateDamageDetectionResultRef(updateDamageDetectionResultVars);
// Variables can be defined inline as well.
const ref = updateDamageDetectionResultRef({ id: ..., isAIConfirmed: ..., overallAssessment: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateDamageDetectionResultRef(dataConnect, updateDamageDetectionResultVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.damageDetectionResult_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.damageDetectionResult_update);
});
```

