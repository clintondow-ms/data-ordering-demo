/**
 * Azure Maps Data Ordering Service
 * Azure Maps Data Ordering REST APIs
 *
 * OpenAPI spec version: 2021-03-01-preview
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */


/**
 * This object is returned when an error occurs in the Maps API.
 */
export interface ODataError { 
    /**
     * The ODataError code.
     */
    readonly code?: string;
    /**
     * If available, a human readable description of the error.
     */
    readonly message?: string;
    details?: Array<ODataError>;
    /**
     * If available, the target causing the error.
     */
    readonly target?: string;
}
