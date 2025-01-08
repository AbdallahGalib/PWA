import express from 'express';
import bodyParser from 'body-parser';

// Simple in-memory storage for geofence data
let geofences = new Map();

export function createServer() {
  const app = express();
  
  // Middleware
  app.use(bodyParser.json());
  
  // API Routes
  app.get('/api/geofence', (req, res) => {
    try {
      const geofenceArray = Array.from(geofences.entries()).map(([name, polygon]) => ({
        name,
        polygon
      }));
      
      res.json({ geofences: geofenceArray });
    } catch (error) {
      console.error('Error in GET /api/geofence:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/geofence', (req, res) => {
    try {
      const { name, polygon } = req.body;
      
      if (!name || !polygon) {
        return res.status(400).json({ error: 'Name and polygon are required' });
      }

      geofences.set(name, polygon);
      res.json({ success: true });
    } catch (error) {
      console.error('Error in POST /api/geofence:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/geofence', (req, res) => {
    try {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const deleted = geofences.delete(name);
      res.json({ success: deleted });
    } catch (error) {
      console.error('Error in DELETE /api/geofence:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  return app;
}
