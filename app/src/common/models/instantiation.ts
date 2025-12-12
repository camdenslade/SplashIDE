//********************************************************************
//
// IServiceDescriptor Interface
//
// Service descriptor for registration in the dependency injection
// container. Defines the service identifier, factory function, and
// whether the service should be a singleton.
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

import { ServiceIdentifier } from '../types/serviceIdentifier';
import { IDisposable } from '../types/disposable';

export interface IServiceDescriptor<T> {
	readonly id: ServiceIdentifier<T>;
	readonly factory: IServiceFactory<T>;
	readonly singleton?: boolean;
}

//********************************************************************
//
// IServiceFactory Type
//
// Service factory function type. Accepts a service accessor for
// dependency injection and returns a service instance.
//
// Return Value
// ------------
// None (type definition)
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

export type IServiceFactory<T> = (accessor: IServiceAccessor) => T;

//********************************************************************
//
// IServiceAccessor Interface
//
// Service accessor for dependency injection. Provides access to other
// services for dependency injection. Services can request other services
// via this accessor.
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

export interface IServiceAccessor {
	get<T>(id: ServiceIdentifier<T>): T;
}

//********************************************************************
//
// InstantiationService Class
//
// VS Code-style dependency injection container for service instantiation.
// Provides dependency injection following VS Code's pattern. Services are
// registered with unique identifiers and can be retrieved by their identifier.
// Services can be singletons or created on-demand. This is the core dependency
// injection container. Services are registered with their identifier and
// factory function. When a service is requested, it is instantiated using
// the factory and cached if it's a singleton.
//
// Return Value
// ------------
// None (class definition)
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
// services       Map<ServiceIdentifier<unknown>, unknown>           Map of service ID to instance
// factories      Map<ServiceIdentifier<unknown>, IServiceFactory>   Map of service ID to factory
// singletons     Set<ServiceIdentifier<unknown>>                    Set of singleton service IDs
//
//*******************************************************************

export class InstantiationService implements IServiceAccessor {
	private readonly services = new Map<ServiceIdentifier<unknown>, unknown>();
	private readonly factories = new Map<ServiceIdentifier<unknown>, IServiceFactory<unknown>>();
	private readonly singletons = new Set<ServiceIdentifier<unknown>>();

	registerService<T>(descriptor: IServiceDescriptor<T>): IDisposable {
		this.factories.set(descriptor.id, descriptor.factory);
		if (descriptor.singleton) {
			this.singletons.add(descriptor.id);
		}
		return {
			dispose: () => {
				this.factories.delete(descriptor.id);
				this.singletons.delete(descriptor.id);
				this.services.delete(descriptor.id);
			}
		};
	}

	get<T>(id: ServiceIdentifier<T>): T {
		const existing = this.services.get(id);
		if (existing !== undefined) {
			return existing as T;
		}

		const factory = this.factories.get(id);
		if (!factory) {
			throw new Error(`Service not registered: ${String(id)}`);
		}

		const instance = factory(this) as T;

		if (this.singletons.has(id)) {
			this.services.set(id, instance);
		}

		return instance;
	}

	createInstance<T>(ctor: new (...args: unknown[]) => T, ...args: unknown[]): T {
		return new ctor(...args);
	}
}
