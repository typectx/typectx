/**
 * Runtime validation utilities for the typectx package.
 * These validators help catch common errors for users who don't use TypeScript.
 * @internal
 */

import type { RequestService, Service, UnknownAppService } from "#types/public"

/**
 * Validates that a value is a string.
 * @param name - The parameter name for error messages
 * @param value - The value to validate
 * @internal
 * @throws TypeError if the value is not a string
 */
export function assertString(
    name: string,
    value: unknown
): asserts value is string {
    if (typeof value !== "string") {
        throw new TypeError(`${name} must be a string, got ${typeof value}`)
    }
}

/**
 * Validates that a value is a valid JavaScript identifier name
 * (suitable for use as a variable name or object property name).
 * @param value - The value to validate
 * @internal
 * @throws TypeError if the value is not a valid identifier
 */
export function assertName(value: string) {
    // JavaScript identifier must start with letter, underscore, or dollar sign
    // and can contain letters, digits, underscores, and dollar signs
    const identifierPattern = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/

    if (value === "") {
        throw new TypeError(`name must not be empty`)
    }

    if (!identifierPattern.test(value)) {
        throw new TypeError(
            `${value} contains invalid characters for a JavaScript identifier, or doesn't start with a letter, underscore, or dollar sign`
        )
    }
}
/**
 * Validates that a value is a plain object (not null, array, or other special object).
 * @param name - The parameter name for error messages
 * @param value - The value to validate
 * @internal
 * @throws TypeError if the value is not a plain object
 */
export function assertPlainObject(
    name: string,
    value: unknown
): asserts value is object {
    if (value === null || typeof value !== "object") {
        throw new TypeError(
            `${name} must be an object, got ${
                value === null ? "null" : typeof value
            }`
        )
    }
    if (Array.isArray(value)) {
        throw new TypeError(`${name} must be an object, not an array`)
    }
}

export function assertHasProperty<K extends string, V>(
    name: string,
    value: V,
    property: K
): asserts value is V & { [key in K]: unknown } {
    if (!Object.prototype.hasOwnProperty.call(value, property)) {
        throw new TypeError(`${name} must have a '${property}' property`)
    }
}

/**
 * Validates that a value is a function.
 * @param name - The parameter name for error messages
 * @param value - The value to validate
 * @internal
 * @throws TypeError if the value is not a function
 */
export function assertFunction(
    name: string,
    value: unknown
): asserts value is (...args: unknown[]) => unknown {
    if (typeof value !== "function") {
        throw new TypeError(`${name} must be a function, got ${typeof value}`)
    }
}

/**
 * Validates the plan object for app services.
 * @param name - Service name, used in error messages
 * @param plan - The plan object to validate
 * @internal
 * @throws TypeError if the plan is invalid
 */
export function assertAppServicePlan(
    name: string,
    plan: {
        services?: unknown
        optionals?: unknown
        factory?: unknown
        warmup?: unknown
    }
) {
    assertPlainObject(name, plan)
    assertHasProperty(name, plan, "factory")
    if (plan.factory !== undefined) {
        assertFunction(name, plan.factory)
    }

    const services = plan.services ?? []
    const optionals = plan.optionals ?? []

    assertServices(name, services)
    assertRequestServices(name, optionals)

    if (plan.warmup !== undefined) {
        assertFunction(name, plan.warmup)
    }
}

export function assertRequestService(
    service: unknown
): asserts service is RequestService {
    assertHasProperty("noname", service, "name")
    assertString("noname", service.name)

    assertHasProperty(service.name, service, "_request")
    if (!service._request) {
        throw new TypeError(`${service.name} is not a request service`)
    }
}

export function assertAppService(
    service: unknown,
    allowMocks: boolean = false
): asserts service is UnknownAppService {
    assertHasProperty("noname", service, "name")
    assertString("noname", service.name)
    assertHasProperty(service.name, service, "_app")
    assertHasProperty(service.name, service, "_mock")

    if (
        !allowMocks &&
        "hired" in service &&
        Array.isArray(service.hired) &&
        service.hired.length > 0
    ) {
        throw new TypeError(
            `Cannot depend on ${service.name} composite service`
        )
    }

    if (!allowMocks && service._mock) {
        throw new TypeError(`Cannot depend on ${service.name} mock service`)
    }
}

/**
 * Validates that all items in an array are valid services.
 * @param name - The parameter name for error messages
 * @param services - The services array to validate
 * @param allowMocks - Whether to allow mocks
 * @internal
 * @throws TypeError if any service is invalid
 */
export function assertServices(
    name: string,
    services: unknown,
    allowMocks: boolean = false
): asserts services is Service[] {
    if (!Array.isArray(services)) {
        throw new TypeError(`${name} must be an array`)
    }
    services.forEach((service) => {
        try {
            assertRequestService(service)
            return
        } catch (e) {
            assertAppService(service, allowMocks)
        }
    })
}

export function assertRequestServices(
    name: string,
    services: unknown
): asserts services is RequestService[] {
    if (!Array.isArray(services)) {
        throw new TypeError(`${name} must be an array`)
    }
    services.forEach((service) => {
        assertRequestService(service)
    })
}

export function assertAppServices(
    name: string,
    services: unknown,
    allowMocks: boolean = false
): asserts services is UnknownAppService[] {
    if (!Array.isArray(services)) {
        throw new TypeError(`${name} must be an array`)
    }
    services.forEach((service) => {
        assertAppService(service, allowMocks)
    })
}
