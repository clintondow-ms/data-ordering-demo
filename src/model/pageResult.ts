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
 * GeoJSON Feature
 */
export interface PageResult { 
    /**
     * Links to relevant resources.
     */
    links?: any;
    /**
     * The total number of the returned items.
     */
    readonly totalResults?: number;
    /**
     * The number of items to skip from the result.
     */
    readonly skip?: number;
    /**
     * The number of items to select from the top of the result.
     */
    readonly top?: number;
}
