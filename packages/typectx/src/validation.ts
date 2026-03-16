/**
 * Runtime validation utilities for the typectx package.
 * These validators help catch common errors for users who don't use TypeScript.
 * @internal
 */

import type {
    RequestSupplier,
    Supplier,
    UnknownProductSupplier
} from "#types/public"

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
 * Validates the configuration object for product suppliers.
 * @param name - Supplier name, used in error messages
 * @param config - The configuration object to validate
 * @internal
 * @throws TypeError if the configuration is invalid
 */
export function assertProductConfig(
    name: string,
    config: {
        suppliers?: unknown
        optionals?: unknown
        assemblers?: unknown
        factory?: unknown
        init?: unknown
        lazy?: unknown
    }
) {
    assertPlainObject(name, config)
    assertHasProperty(name, config, "factory")
    if (config.factory !== undefined) {
        assertFunction(name, config.factory)
    }

    const suppliers = config.suppliers ?? []
    const optionals = config.optionals ?? []
    const assemblers = config.assemblers ?? []

    assertSuppliers(name, suppliers)
    assertRequestSuppliers(name, optionals)
    assertProductSuppliers(name, assemblers, true)

    if (config.init !== undefined) {
        assertFunction(name, config.init)
    }

    if (config.lazy !== undefined && typeof config.lazy !== "boolean") {
        throw new TypeError(
            `${name}.lazy must be a boolean, got ${typeof config.lazy}`
        )
    }
}

export function assertRequestSupplier(
    supplier: unknown
): asserts supplier is RequestSupplier {
    assertHasProperty("noname", supplier, "name")
    assertString("noname", supplier.name)

    assertHasProperty(supplier.name, supplier, "_request")
    if (!supplier._request) {
        throw new TypeError(`${supplier.name} is not a request supplier`)
    }
}

export function assertProductSupplier(
    supplier: unknown,
    allowMocks: boolean = false
): asserts supplier is UnknownProductSupplier {
    assertHasProperty("noname", supplier, "name")
    assertString("noname", supplier.name)
    assertHasProperty(supplier.name, supplier, "_product")
    assertHasProperty(supplier.name, supplier, "_mock")

    if (
        !allowMocks &&
        "hired" in supplier &&
        Array.isArray(supplier.hired) &&
        supplier.hired.length > 0
    ) {
        throw new TypeError(
            `Cannot depend on ${supplier.name} composite supplier`
        )
    }

    if (!allowMocks && supplier._mock) {
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
            assertRequestSupplier(supplier)
            return
        } catch (e) {
            assertProductSupplier(supplier, allowMocks)
        }
    })
}

export function assertRequestSuppliers(
    name: string,
    suppliers: unknown
): asserts suppliers is RequestSupplier[] {
    if (!Array.isArray(suppliers)) {
        throw new TypeError(`${name} must be an array`)
    }
    suppliers.forEach((supplier) => {
        assertRequestSupplier(supplier)
    })
}

export function assertProductSuppliers(
    name: string,
    suppliers: unknown,
    allowMocks: boolean = false
): asserts suppliers is UnknownProductSupplier[] {
    if (!Array.isArray(suppliers)) {
        throw new TypeError(`${name} must be an array`)
    }
    suppliers.forEach((supplier) => {
        assertProductSupplier(supplier, allowMocks)
    })
}
