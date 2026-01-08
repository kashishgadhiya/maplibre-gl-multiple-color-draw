import { BaseMode } from './BaseMode';
import type { DrawFeature } from '../types';
import type { Feature, Point, LineString, Polygon } from 'geojson';

export class SelectMode extends BaseMode {
  private selectedFeatureId: string | null = null;
  private isDragging: boolean = false;
  private dragStart: [number, number] | null = null;
  private originalCoordinates: any = null;

  enable(): void {
    this.isActive = true;
    this.map.getCanvas().style.cursor = 'pointer';
    this.updateSelectLayer();

    this.addEventHandler('click', this.onClick.bind(this));
    this.addEventHandler('mousedown', this.onMouseDown.bind(this));
    this.addEventHandler('mousemove', this.onMouseMove.bind(this));
    this.addEventHandler('mouseup', this.onMouseUp.bind(this));
  }

  disable(): void {
    this.isActive = false;
    this.map.getCanvas().style.cursor = '';
    this.removeEventHandlers();
    this.deselect();
  }

  private onClick(e: any): void {
    if (!this.isActive || this.isDragging) return;
    const coords = this.getCoordinatesFromEvent(e);
    const feature = this.getFeatureAtPoint(coords);

    if (feature) {
      this.selectFeature(feature.id!);
    } else {
      this.deselect();
    }
  }

  private onMouseDown(e: any): void {
    if (!this.isActive) return;
    const coords = this.getCoordinatesFromEvent(e);
    const feature = this.getFeatureAtPoint(coords);

    if (feature) {
      this.isDragging = true;
      this.dragStart = coords;
      this.selectedFeatureId = feature.id!;
      if (feature.geometry.type === 'LineString' || feature.geometry.type === 'Polygon') {
        this.originalCoordinates = JSON.parse(JSON.stringify(feature.geometry.coordinates));
      }
      this.map.getCanvas().style.cursor = 'move';
      e.preventDefault();
    }
  }

  private onMouseMove(e: any): void {
    if (!this.isActive || !this.isDragging || !this.dragStart || !this.selectedFeatureId) return;

    const currentCoords = this.getCoordinatesFromEvent(e);
    const dx = currentCoords[0] - this.dragStart[0];
    const dy = currentCoords[1] - this.dragStart[1];

    const feature = this.store.getFeature(this.selectedFeatureId);
    if (feature) {
      const newCoordinates = this.translateCoordinates(this.originalCoordinates, dx, dy);
      if (feature.geometry.type === 'LineString') {
        const updatedFeature: DrawFeature = {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: newCoordinates as [number, number][],
          },
        };
        this.store.updateFeature(this.selectedFeatureId, updatedFeature);
        this.updateMapLayers(this.store.getAllFeatures());
      } else if (feature.geometry.type === 'Polygon') {
        const updatedFeature: DrawFeature = {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: newCoordinates as [number, number][][],
          },
        };
        this.store.updateFeature(this.selectedFeatureId, updatedFeature);
        this.updateMapLayers(this.store.getAllFeatures());
      }
    }
  }

  private onMouseUp(e: any): void {
    if (!this.isActive) return;
    if (this.isDragging) {
      this.isDragging = false;
      this.dragStart = null;
      this.originalCoordinates = null;
      this.map.getCanvas().style.cursor = 'pointer';
    }
  }

  private getFeatureAtPoint(coords: [number, number]): DrawFeature | null {
    const features = this.store.getAllFeatures();
    const point: Feature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: coords,
      } as Point,
      properties: {},
    };

    for (const feature of features) {
      if (this.isPointInFeature(point, feature)) {
        return feature;
      }
    }
    return null;
  }

  private isPointInFeature(point: Feature, feature: DrawFeature): boolean {
    if (point.geometry.type !== 'Point') return false;
    const [lng, lat] = point.geometry.coordinates;

    if (feature.geometry.type === 'LineString') {
      const coords = feature.geometry.coordinates;
      for (let i = 0; i < coords.length - 1; i++) {
        if (this.isPointNearLine([lng, lat], coords[i] as [number, number], coords[i + 1] as [number, number])) {
          return true;
        }
      }
      return false;
    } else if (feature.geometry.type === 'Polygon') {
      return this.isPointInPolygon([lng, lat], feature.geometry.coordinates[0] as [number, number][]);
    }
    return false;
  }

  private isPointNearLine(
    point: [number, number],
    lineStart: [number, number],
    lineEnd: [number, number],
    threshold: number = 0.001
  ): boolean {
    const [px, py] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;

    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx: number, yy: number;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy) < threshold;
  }

  private isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  private translateCoordinates(coordinates: any, dx: number, dy: number): any {
    if (Array.isArray(coordinates[0])) {
      if (Array.isArray(coordinates[0][0])) {
        return coordinates.map((ring: any) =>
          ring.map((coord: any) => [coord[0] + dx, coord[1] + dy])
        );
      } else {
        return coordinates.map((coord: any) => [coord[0] + dx, coord[1] + dy]);
      }
    }
    return coordinates;
  }

  private selectFeature(id: string): void {
    this.selectedFeatureId = id;
    this.updateSelectLayer();
  }

  private deselect(): void {
    this.selectedFeatureId = null;
    this.updateSelectLayer();
  }

  private updateSelectLayer(): void {
    const source = this.map.getSource('mapdraw-selected') as any;
    if (source && this.selectedFeatureId) {
      const feature = this.store.getFeature(this.selectedFeatureId);
      if (feature) {
        const { id, ...featureWithoutId } = feature;
        source.setData({
          type: 'FeatureCollection',
          features: [featureWithoutId],
        });
      }
    } else if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: [],
      });
    }
  }
}

