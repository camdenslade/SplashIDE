//********************************************************************
//
// IAppInfo Interface
//
// Application information interface. Contains application metadata
// including version, build timestamp, environment, and name from
// the application manifest.
//
// Return Value
// ------------
// None (interface definition)
//
// Value Parameters
// ----------------
// None
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// None
//
//*******************************************************************

import { createServiceIdentifier } from '../types/serviceIdentifier';

export interface IAppInfo {
	readonly version: string;
	readonly buildTimestamp: string;
	readonly environment: string;
	readonly name: string;
}

//********************************************************************
//
// IAppInfoService Interface
//
// App info service interface. Provides access to application metadata
// and build information. Service for accessing version, build timestamp,
// and environment information from the application manifest.
//
// Return Value
// ------------
// None (interface definition)
//
// Value Parameters
// ----------------
// None
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// None
//
//*******************************************************************

export interface IAppInfoService {
	getAppInfo(): IAppInfo;
}

//********************************************************************
//
// IAppInfoService Constant
//
// Service identifier for the app info service. Used for dependency
// injection to access the app info service instance.
//
// Return Value
// ------------
// ServiceIdentifier<IAppInfoService>    The service identifier
//
// Value Parameters
// ----------------
// None (constant definition)
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// None
//
//*******************************************************************

export const IAppInfoService = createServiceIdentifier<IAppInfoService>('IAppInfoService');
