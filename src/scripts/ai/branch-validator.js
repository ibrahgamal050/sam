/**
 * Validates a branch object against the improved schema
 * @param {Object} branch - Branch object to validate
 * @returns {Object} - Validation result {isValid, errors}
 */
function validateBranch(branch) {
    const errors = [];
    
    // Check name
    if (!branch.name) errors.push("Missing name object");
    else {
      if (!branch.name.ar) errors.push("Missing Arabic name");
      if (!branch.name.en) errors.push("Missing English name");
    }
    
    // Check location
    if (!branch.location) errors.push("Missing location object");
    else {
      if (!branch.location.address) errors.push("Missing address object");
      else {
        if (!branch.location.address.ar) errors.push("Missing Arabic address");
        if (!branch.location.address.en) errors.push("Missing English address");
      }
      
      // Coordinates are optional but if provided should be numbers
      if (branch.location.latitude !== null && branch.location.latitude !== undefined) {
        if (typeof branch.location.latitude !== 'number') {
          errors.push("Latitude must be a number");
        }
      }
      
      if (branch.location.longitude !== null && branch.location.longitude !== undefined) {
        if (typeof branch.location.longitude !== 'number') {
          errors.push("Longitude must be a number");
        }
      }
    }
    
    // isMainBranch should be a boolean if provided
    if (branch.isMainBranch !== undefined && typeof branch.isMainBranch !== 'boolean') {
      errors.push("isMainBranch must be a boolean");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Export the validator
  export { validateBranch };