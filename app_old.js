/*
 * Developer Best Practices & Security Guidelines
 *
 * 1. Code Quality:
 *    - Follow SOLID principles for clean and maintainable code.
 *    - Use consistent naming conventions and meaningful variable names.
 *    - Keep your code DRY (Don’t Repeat Yourself) by reusing logic.
 *    - Write unit tests to ensure code reliability and maintain high coverage.
 *
 * 2. Security:
 *    - Validate and sanitize all user inputs to prevent common attacks.
 *    - Implement secure authentication and session management practices.
 *    - Encrypt sensitive data both at rest and in transit.
 *    - Follow the principle of least privilege in access control.
 *    - Regularly update dependencies and apply security patches.
 *
 * 3. Performance:
 *    - Optimize critical code paths for performance.
 *    - Implement caching and lazy loading to improve responsiveness.
 *
 * 4. Version Control:
 *    - Follow a clear branching strategy (e.g., Git Flow).
 *    - Use descriptive commit messages and conduct code reviews before merging.
 *
 * For more information on secure coding practices, visit: https://owasp.org/
 */

// Some DataSets are massive and will bring any web browser to its knees if you
// try to load the entire thing. To keep your app performing optimally, take
// advantage of filtering, aggregations, and group by's to bring down just the
// data your app needs. Do not include all columns in your data mapping file,
// just the ones you need.
//
// For additional documentation on how you can query your data, please refer to
// https://developer.domo.com/portal/8s3y9eldnjq8d-data-api

// domo refers to the included ryuu.js from the index.html file
// Replace alias with your dataset alias in the manifest.json
domo.get('/data/v2/alias?limit=100')
    .then(function(alias){
    console.log("alias", alias);
})