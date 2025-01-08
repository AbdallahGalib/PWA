import * as L from 'leaflet';

declare module 'leaflet' {
  namespace Control {
    class Draw extends L.Control {
      constructor(options?: DrawConstructorOptions);
    }
  }

  interface DrawConstructorOptions {
    position?: string;
    draw?: {
      polyline?: any;
      polygon?: any;
      circle?: any;
      rectangle?: any;
      marker?: any;
      circlemarker?: any;
    };
    edit?: {
      featureGroup?: L.FeatureGroup;
      remove?: boolean;
      edit?: boolean;
    };
  }

  namespace Draw {
    namespace Event {
      const CREATED: string;
      const EDITED: string;
      const DELETED: string;
      const DRAWSTART: string;
      const DRAWSTOP: string;
      const DRAWVERTEX: string;
      const EDITSTART: string;
      const EDITMOVE: string;
      const EDITRESIZE: string;
      const EDITVERTEX: string;
      const EDITSTOP: string;
      const DELETESTART: string;
      const DELETESTOP: string;
    }
  }
}
