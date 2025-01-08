// Simple in-memory storage for geofence data
let geofences = new Map();

/**
 * Fetches all geofences from the in-memory storage.
 * 
 * @returns {Promise<Object>} A promise that resolves with an object containing the geofences.
 */
export async function fetchGeofences() {
  try {
    const geofenceArray = Array.from(geofences.entries()).map(([name, polygon]) => ({
      name,
      polygon
    }));
    return { geofences: geofenceArray };
  } catch (error) {
    console.error('Error fetching geofences:', error);
    throw error;
  }
}

/**
 * Adds a new geofence to the in-memory storage.
 * 
 * @param {string} name The name of the geofence.
 * @param {Array<number[]>} polygon The polygon coordinates of the geofence.
 * @returns {Promise<Object>} A promise that resolves with an object containing the result of the operation.
 */
export async function addGeofence(name, polygon) {
  try {
    if (typeof name !== 'string' || !Array.isArray(polygon) || polygon.length < 3) {
      throw new Error('Invalid input: Name must be a string and polygon must be an array with at least 3 points');
    }

    geofences.set(name, polygon);
    return { success: true, message: `Geofence "${name}" added successfully` };
  } catch (error) {
    console.error('Error adding geofence:', error);
    throw error;
  }
}

/**
 * Deletes a geofence from the in-memory storage.
 * 
 * @param {string} name The name of the geofence to delete.
 * @returns {Promise<Object>} A promise that resolves with an object containing the result of the operation.
 */
export async function deleteGeofence(name) {
  try {
    if (typeof name !== 'string') {
      throw new Error('Invalid input: Name must be a string');
    }

    if (geofences.has(name)) {
      geofences.delete(name);
      return { success: true, message: `Geofence "${name}" deleted successfully` };
    } else {
      throw new Error(`Geofence "${name}" not found`);
    }
  } catch (error) {
    console.error('Error deleting geofence:', error);
    throw error;
  }
}
