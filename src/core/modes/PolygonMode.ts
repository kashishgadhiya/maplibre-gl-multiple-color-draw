import { BaseMode } from './BaseMode';
import type { DrawFeature, DrawPolygon } from '../types';

export class PolygonMode extends BaseMode {
  private currentFeature: DrawPolygon | null = null;
  private coordinates: [number, number][] = [];
  private previewCoordinate: [number, number] | null = null;

  enable(): void {
    this.isActive = true;
    this.map.getCanvas().style.cursor = 'crosshair';

    this.addEventHandler('click', this.onClick.bind(this));
    this.addEventHandler('mousemove', this.onMouseMove.bind(this));
    this.addEventHandler('dblclick', this.onDoubleClick.bind(this));
    this.addEventHandler('contextmenu', this.onContextMenu.bind(this));
  }

  disable(): void {
    this.isActive = false;
    this.map.getCanvas().style.cursor = '';
    this.removeEventHandlers();
    this.cancelCurrent();
  }

  private onClick(e: any): void {
    if (!this.isActive) return;
    e.preventDefault();
    const coords = this.getCoordinatesFromEvent(e);

    if (this.coordinates.length === 0) {
      this.coordinates = [coords];
      this.startPolygon(coords);
    } else {
      this.coordinates.push(coords);
      this.updatePolygon();
    }
  }

  private onMouseMove(e: any): void {
    if (!this.isActive || this.coordinates.length === 0) return;
    this.previewCoordinate = this.getCoordinatesFromEvent(e);
    this.updatePolygonPreview();
  }

  private onDoubleClick(e: any): void {
    if (!this.isActive) return;
    e.preventDefault();
    this.finishPolygon();
  }

  private onContextMenu(e: any): void {
    if (!this.isActive) return;
    e.preventDefault();
    this.finishPolygon();
  }

  private startPolygon(coords: [number, number]): void {
    this.currentFeature = {
      type: 'Feature',
      id: undefined,
      geometry: {
        type: 'Polygon',
        coordinates: [[coords, coords, coords, coords]],
      },
      properties: {
        mode: 'polygon',
        color: this.options.color || '#3388ff',
        thickness: this.options.thickness || 2,
      },
    };
    const id = this.store.addFeature(this.currentFeature);
    this.currentFeature.id = id;
    this.updateMapLayers(this.store.getAllFeatures());
  }

  private updatePolygon(): void {
    if (!this.currentFeature) return;
    const ring = [...this.coordinates];
    this.currentFeature.geometry.coordinates = [ring];
    this.store.updateFeature(this.currentFeature.id!, this.currentFeature);
    this.updateMapLayers(this.store.getAllFeatures());
  }

  private updatePolygonPreview(): void {
    if (!this.currentFeature || !this.previewCoordinate) return;
    const ring = [...this.coordinates, this.previewCoordinate];
    const previewFeature: DrawPolygon = {
      ...this.currentFeature,
      geometry: {
        type: 'Polygon',
        coordinates: [ring],
      },
    };
    this.store.updateFeature(this.currentFeature.id!, previewFeature);
    this.updateMapLayers(this.store.getAllFeatures());
  }

  private finishPolygon(): void {
    if (this.currentFeature && this.coordinates.length >= 3) {
      const ring = [...this.coordinates];
      if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
        ring.push(ring[0]);
      }
      this.currentFeature.geometry.coordinates = [ring];
      this.store.updateFeature(this.currentFeature.id!, this.currentFeature);
      this.updateMapLayers(this.store.getAllFeatures());
    }
    this.currentFeature = null;
    this.coordinates = [];
    this.previewCoordinate = null;
  }

  private cancelCurrent(): void {
    if (this.currentFeature) {
      if (this.coordinates.length < 3) {
        this.store.removeFeature(this.currentFeature.id!);
      }
      this.currentFeature = null;
      this.coordinates = [];
      this.previewCoordinate = null;
      this.updateMapLayers(this.store.getAllFeatures());
    }
  }
}

