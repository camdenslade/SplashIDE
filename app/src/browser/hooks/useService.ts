//********************************************************************
//
// InstantiationContext Constant
//
// React context providing access to the global instantiation service
// for dependency injection in React components.
//
// Return Value
// ------------
// Object with instantiationService property
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

import { ServiceIdentifier } from '../../common/types/serviceIdentifier';
import { getInstantiationService } from '../bootstrap';

export const InstantiationContext = {
	instantiationService: getInstantiationService()
};

//********************************************************************
//
// useService Function
//
// React hook for accessing services via dependency injection. Follows
// VS Code's pattern for service access in React components. Returns
// the service instance identified by the provided service identifier.
//
// Return Value
// ------------
// T    The service instance of type T
//
// Value Parameters
// ----------------
// id    ServiceIdentifier<T>    Service identifier to look up
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// context    Object    InstantiationContext containing the service container
//
//*******************************************************************

export function useService<T>(id: ServiceIdentifier<T>): T {
	const context = InstantiationContext;
	return context.instantiationService.get(id);
}
