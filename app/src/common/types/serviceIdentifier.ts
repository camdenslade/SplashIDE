//********************************************************************
//
// ServiceIdentifier Interface
//
// VS Code-style service identifier pattern for dependency injection.
// Each service has a unique identifier that can be used to register
// and retrieve services from the dependency injection container.
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

export interface ServiceIdentifier<T> {
	(...args: unknown[]): void;
	type: T;
}

//********************************************************************
//
// createServiceIdentifier Function
//
// Creates a service identifier for dependency injection. Returns a
// marker function that can be used to uniquely identify and retrieve
// services from the dependency injection container.
//
// Return Value
// ------------
// ServiceIdentifier<T>    The service identifier
//
// Value Parameters
// ----------------
// serviceName    string    Unique name for the service
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// id    ServiceIdentifier<T>    The created identifier function
//
//*******************************************************************

export function createServiceIdentifier<T>(serviceName: string): ServiceIdentifier<T> {
	const id = <ServiceIdentifier<T>>function (_target: Function): void {
	};
	id.toString = () => serviceName;
	return id;
}
