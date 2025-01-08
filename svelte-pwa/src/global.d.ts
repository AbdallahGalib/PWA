import * as L from 'leaflet';

declare module 'leaflet' {
  namespace Control {
    interface DrawConstructorOptions {
      position?: string;
      draw?: {
        polyline?: boolean | any;
        polygon?: boolean | any;
        circle?: boolean | any;
        rectangle?: boolean | any;
        marker?: boolean | any;
        circlemarker?: boolean | any;
      };
      edit?: {
        featureGroup: L.FeatureGroup;
        remove?: boolean;
      };
    }

    class Draw extends Control {
      constructor(options?: DrawConstructorOptions);
    }
  }
}

// Add ServiceWorker types
interface ServiceWorkerRegistration {
  periodicSync?: {
    register(tag: string, options?: { minInterval: number }): Promise<void>;
  };
  sync?: {
    register(tag: string): Promise<void>;
  };
}
