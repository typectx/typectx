/**
 * Runtime validation utilities for the typectx package.
 * These validators help catch common errors for users who don't use TypeScript.
 * @internal
 */

import { Supplier, type StaticSupplier, type DynamicSupplier } from "#types"

/**
 * Validates that a value is a non-empty string.
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
 * @param name - The parameter name for error messages
 * @param value - The value to validate
 * @internal
 * @throws TypeError if the value is not a valid identifier
 */
export function assertName(
    value: string
) {
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

export function assertHasProperty<K extends string>(
    name: string,
    value: unknown,
    property: K
): asserts value is { [key in K]: unknown } {
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
 * Validates the configuration object for static supplier.
 * @param config - The configuration object to validate
 * @internal
 * @throws TypeError if the configuration is invalid
 */
export function assertStaticConfig(
    name: string,
    config: {
        suppliers?: unknown
        optionals?: unknown
        assemblers?: unknown
        hiredSuppliers?: unknown
        hiredAssemblers?: unknown
        init?: unknown
        lazy?: unknown
    }
) {
    assertPlainObject(name, config)
    assertHasProperty(name, config, "factory")
    assertFunction(name, config.factory)

    const suppliers = config.suppliers ?? []
    const optionals = config.optionals ?? []
    const assemblers = config.assemblers ?? []
    const hiredSuppliers = config.hiredSuppliers ?? []
    const hiredAssemblers = config.hiredAssemblers ?? []

    assertSuppliers(name, suppliers)
    assertDynamicSuppliers(name, optionals)
    assertStaticSuppliers(name, assemblers, true)
    assertSuppliers(name, hiredSuppliers, true)
    assertStaticSuppliers(name, hiredAssemblers, true)

    if (config.init !== undefined) {
        assertFunction(name, config.init)
    }

    if (config.lazy !== undefined && typeof config.lazy !== "boolean") {
        throw new TypeError(
            `${name}.lazy must be a boolean, got ${typeof config.lazy}`
        )
    }
}

export function assertDynamicSupplier(
    supplier: unknown
): asserts supplier is DynamicSupplier {
    assertHasProperty("noname", supplier, "name")
    assertString("noname", supplier.name)
    assertHasProperty(supplier.name, supplier, "_")
    assertHasProperty(supplier.name, supplier._, "dynamic")
}

export function assertStaticSupplier(
    supplier: unknown,
    allowMocks: boolean = false
): asserts supplier is StaticSupplier {
    assertHasProperty("noname", supplier, "name")
    assertString("noname", supplier.name)
    assertHasProperty(supplier.name, supplier, "_")
    assertHasProperty(supplier.name, supplier._, "static")
    assertHasProperty(supplier.name, supplier._, "isMock")

    if (
        !allowMocks &&
        "hiredSuppliers" in supplier &&
        Array.isArray(supplier.hiredSuppliers) &&
        supplier.hiredSuppliers.length > 0
    ) {
        throw new TypeError(
            `Cannot depend on ${supplier.name} composite supplier`
        )
    }

    if (
        !allowMocks &&
        "hiredAssemblers" in supplier &&
        Array.isArray(supplier.hiredAssemblers) &&
        supplier.hiredAssemblers.length > 0
    ) {
        throw new TypeError(
            `Cannot depend on ${supplier.name} composite supplier`
        )
    }

    if (!allowMocks && supplier._.isMock) {
        throw new TypeError(`Cannot depend on ${supplier.name} mock supplier`)
    }
}

/**
 * Validates that all items in an array are valid suppliers.
 * @param name - The parameter name for error messages
 * @param suppliers - The suppliers array to validate
 * @param allowMocks - Whether to allow mocks
 * @internal
 * @throws TypeError if any supplier is invalid
 */
export function assertSuppliers(
    name: string,
    suppliers: unknown,
    allowMocks: boolean = false
): asserts suppliers is Supplier[] {
    if (!Array.isArray(suppliers)) {
        throw new TypeError(`${name} must be an array`)
    }

    suppliers.forEach((supplier) => {
        try {
            assertDynamicSupplier(supplier)
            return
        } catch (e) {
            assertStaticSupplier(supplier, allowMocks)
        }
    })
}

export function assertDynamicSuppliers(
    name: string,
    suppliers: unknown
): asserts suppliers is DynamicSupplier[] {
    if (!Array.isArray(suppliers)) {
        throw new TypeError(`${name} must be an array`)
    }
    suppliers.forEach((supplier) => {
        assertDynamicSupplier(supplier)
    })
}

export function assertStaticSuppliers(
    name: string,
    suppliers: unknown,
    allowMocks: boolean = false
): asserts suppliers is StaticSupplier[] {
    if (!Array.isArray(suppliers)) {
        throw new TypeError(`${name} must be an array`)
    }
    suppliers.forEach((supplier) => {
        assertStaticSupplier(supplier, allowMocks)
    })
}
