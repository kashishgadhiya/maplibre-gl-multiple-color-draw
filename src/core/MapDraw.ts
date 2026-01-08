import type { Map } from 'maplibre-gl';
import type { GeoJSON } from 'geojson';
import { Store } from './store';
import { BaseMode } from './modes/BaseMode';
import { LineMode } from './modes/LineMode';
import { DashedLineMode } from './modes/DashedLineMode';
import { FreehandMode } from './modes/FreehandMode';
import { FreehandDashedMode } from './modes/FreehandDashedMode';
import { PolygonMode } from './modes/PolygonMode';
import { SelectMode } from './modes/SelectMode';
import type { DrawMode, MapDrawOptions, DrawOptions, DrawFeature } from './types';

export class MapDraw {
  private map: Map;
  private store: Store;
  private currentMode: BaseMode | null = null;
  private modes: globalThis.Map<DrawMode, BaseMode> = new globalThis.Map();
  private options: MapDrawOptions;
  private isEnabled: boolean = false;

  constructor(map: Map, options: MapDrawOptions = {}) {
    this.map = map;
    this.options = {
      color: '#3388ff',
      thickness: 2,
      dashArray: [5, 5],
      defaultMode: 'line',
      enabled: false,
      ...options,
    };
    this.store = new Store();
    this.initializeModes();

    // Wait for map to load before setting up layers
    if (this.map.loaded()) {
      this.setupMapLayers();
      if (this.options.enabled) {
        this.enable();
      }
    } else {
      this.map.once('load', () => {
        this.setupMapLayers();
        if (this.options.enabled) {
          this.enable();
        }
      });
    }
  }

  private initializeModes(): void {
    const context = {
      map: this.map,
      store: this.store,
      options: this.getDrawOptions(),
    };

    this.modes.set('line', new LineMode(context));
    this.modes.set('dashed-line', new DashedLineMode(context));
    this.modes.set('freehand', new FreehandMode(context));
    this.modes.set('freehand-dashed', new FreehandDashedMode(context));
    this.modes.set('polygon', new PolygonMode(context));
    this.modes.set('select', new SelectMode(context));
  }

  private setupMapLayers(): void {
    if (!this.map.getSource('mapdraw-features')) {
      this.map.addSource('mapdraw-features', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Solid lines (line, freehand)
      this.map.addLayer({
        id: 'mapdraw-features-line',
        type: 'line',
        source: 'mapdraw-features',
        filter: ['in', ['get', 'mode'], ['literal', ['line', 'freehand']]],
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['to-number', ['get', 'thickness']],
        },
      });

      // Dashed lines
      this.map.addLayer({
        id: 'mapdraw-features-dashed-line',
        type: 'line',
        source: 'mapdraw-features',
        filter: ['in', ['get', 'mode'], ['literal', ['dashed-line', 'freehand-dashed']]],
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['to-number', ['get', 'thickness']],
          'line-dasharray': this.options.dashArray || [5, 5],
        },
      });

      this.map.addLayer({
        id: 'mapdraw-features-polygon',
        type: 'fill',
        source: 'mapdraw-features',
        filter: ['==', ['get', 'mode'], 'polygon'],
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.3,
        },
      });

      this.map.addLayer({
        id: 'mapdraw-features-polygon-outline',
        type: 'line',
        source: 'mapdraw-features',
        filter: ['==', ['get', 'mode'], 'polygon'],
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['to-number', ['get', 'thickness']],
        },
      });
    }

    if (!this.map.getSource('mapdraw-selected')) {
      this.map.addSource('mapdraw-selected', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      this.map.addLayer({
        id: 'mapdraw-selected-line',
        type: 'line',
        source: 'mapdraw-selected',
        paint: {
          'line-color': '#ff0000',
          'line-width': 3,
          'line-dasharray': [2, 2],
        },
      });

      this.map.addLayer({
        id: 'mapdraw-selected-polygon',
        type: 'fill',
        source: 'mapdraw-selected',
        paint: {
          'fill-color': '#ff0000',
          'fill-opacity': 0.2,
        },
      });

      this.map.addLayer({
        id: 'mapdraw-selected-polygon-outline',
        type: 'line',
        source: 'mapdraw-selected',
        paint: {
          'line-color': '#ff0000',
          'line-width': 3,
          'line-dasharray': [2, 2],
        },
      });
    }
  }

  enable(): void {
    if (this.isEnabled) return;
    this.isEnabled = true;
    const mode = this.options.defaultMode || 'line';
    this.setMode(mode);
  }

  disable(): void {
    if (!this.isEnabled) return;
    this.isEnabled = false;
    if (this.currentMode) {
      this.currentMode.disable();
      this.currentMode = null;
    }
  }

  setMode(mode: DrawMode): void {
    if (!this.isEnabled) {
      throw new Error('MapDraw must be enabled before setting mode. Call enable() first.');
    }

    if (this.currentMode) {
      this.currentMode.disable();
    }

    const newMode = this.modes.get(mode);
    if (!newMode) {
      throw new Error(`Invalid mode: ${mode}`);
    }

    this.currentMode = newMode;
    if (this.currentMode) {
      this.currentMode.setOptions(this.getDrawOptions());
      this.currentMode.enable();
    }
  }

  setColor(color: string): void {
    this.options.color = color;
    this.updateAllModesOptions();
  }

  setThickness(thickness: number): void {
    this.options.thickness = thickness;
    this.updateAllModesOptions();
  }

  setDashArray(dashArray: number[]): void {
    this.options.dashArray = dashArray;
    this.updateAllModesOptions();
    // Update the dashed line layer paint property
    const dashedLayer = this.map.getLayer('mapdraw-features-dashed-line');
    if (dashedLayer) {
      this.map.setPaintProperty('mapdraw-features-dashed-line', 'line-dasharray', dashArray);
    }
  }

  getFeatures(): DrawFeature[] {
    return this.store.getAllFeatures();
  }

  getGeoJSON(): GeoJSON {
    return this.store.getGeoJSON();
  }

  clear(): void {
    this.store.clear();
    const source = this.map.getSource('mapdraw-features') as any;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: [],
      });
    }
    const selectedSource = this.map.getSource('mapdraw-selected') as any;
    if (selectedSource) {
      selectedSource.setData({
        type: 'FeatureCollection',
        features: [],
      });
    }
  }

  private getDrawOptions(): DrawOptions {
    return {
      color: this.options.color,
      thickness: this.options.thickness,
      dashArray: this.options.dashArray,
      lineCap: this.options.lineCap,
      lineJoin: this.options.lineJoin,
    };
  }

  private updateAllModesOptions(): void {
    const options = this.getDrawOptions();
    this.modes.forEach((mode: BaseMode) => {
      mode.setOptions(options);
    });
  }

  destroy(): void {
    this.disable();
    this.store.clear();

    if (this.map.getLayer('mapdraw-features-line')) {
      this.map.removeLayer('mapdraw-features-line');
    }
    if (this.map.getLayer('mapdraw-features-dashed-line')) {
      this.map.removeLayer('mapdraw-features-dashed-line');
    }
    if (this.map.getLayer('mapdraw-features-polygon')) {
      this.map.removeLayer('mapdraw-features-polygon');
    }
    if (this.map.getLayer('mapdraw-features-polygon-outline')) {
      this.map.removeLayer('mapdraw-features-polygon-outline');
    }
    if (this.map.getLayer('mapdraw-selected-line')) {
      this.map.removeLayer('mapdraw-selected-line');
    }
    if (this.map.getLayer('mapdraw-selected-polygon')) {
      this.map.removeLayer('mapdraw-selected-polygon');
    }
    if (this.map.getLayer('mapdraw-selected-polygon-outline')) {
      this.map.removeLayer('mapdraw-selected-polygon-outline');
    }

    if (this.map.getSource('mapdraw-features')) {
      this.map.removeSource('mapdraw-features');
    }
    if (this.map.getSource('mapdraw-selected')) {
      this.map.removeSource('mapdraw-selected');
    }
  }
}

