import { BaseMode } from './BaseMode';
import type { DrawFeature, DrawLineString } from '../types';

export class LineMode extends BaseMode {
  protected currentFeature: DrawLineString | null = null;
  protected coordinates: [number, number][] = [];

  enable(): void {
    this.isActive = true;
    this.map.getCanvas().style.cursor = 'crosshair';

    this.addEventHandler('mousedown', this.onMouseDown.bind(this));
    this.addEventHandler('mousemove', this.onMouseMove.bind(this));
    this.addEventHandler('mouseup', this.onMouseUp.bind(this));
    this.addEventHandler('click', this.onClick.bind(this));
    this.addEventHandler('dblclick', this.onDoubleClick.bind(this));
  }

  disable(): void {
    this.isActive = false;
    this.map.getCanvas().style.cursor = '';
    this.removeEventHandlers();
    this.cancelCurrent();
  }

  protected onClick(e: any): void {
    if (!this.isActive) return;
    const coords = this.getCoordinatesFromEvent(e);
    
    if (this.coordinates.length === 0) {
      this.coordinates = [coords];
      this.startLine(coords);
    } else {
      this.coordinates.push(coords);
      this.updateLine();
    }
  }

  protected onMouseDown(e: any): void {
    if (!this.isActive) return;
    e.preventDefault();
  }

  protected onMouseMove(e: any): void {
    if (!this.isActive || this.coordinates.length === 0) return;
    const coords = this.getCoordinatesFromEvent(e);
    const previewCoords = [...this.coordinates, coords];
    this.updateLinePreview(previewCoords);
  }

  protected onMouseUp(e: any): void {
    if (!this.isActive) return;
  }

  protected onDoubleClick(e: any): void {
    if (!this.isActive) return;
    e.preventDefault();
    // Finish the current line on double-click
    if (this.currentFeature && this.coordinates.length >= 2) {
      // Line is already complete, just reset for next line
      this.currentFeature = null;
      this.coordinates = [];
    }
  }

  protected startLine(coords: [number, number]): void {
    this.currentFeature = {
      type: 'Feature',
      id: undefined,
      geometry: {
        type: 'LineString',
        coordinates: [coords, coords],
      },
      properties: {
        mode: 'line',
        color: this.options.color || '#3388ff',
        thickness: this.options.thickness || 2,
      },
    };
    const id = this.store.addFeature(this.currentFeature);
    this.currentFeature.id = id;
    this.updateMapLayers(this.store.getAllFeatures());
  }

  protected updateLine(): void {
    if (!this.currentFeature) return;
    this.currentFeature.geometry.coordinates = this.coordinates;
    this.store.updateFeature(this.currentFeature.id!, this.currentFeature);
    this.updateMapLayers(this.store.getAllFeatures());
  }

  protected updateLinePreview(coords: [number, number][]): void {
    if (!this.currentFeature) return;
    const previewFeature: DrawLineString = {
      ...this.currentFeature,
      geometry: {
        type: 'LineString',
        coordinates: coords,
      },
    };
    this.store.updateFeature(this.currentFeature.id!, previewFeature);
    this.updateMapLayers(this.store.getAllFeatures());
  }

  protected cancelCurrent(): void {
    if (this.currentFeature) {
      if (this.coordinates.length < 2) {
        this.store.removeFeature(this.currentFeature.id!);
      }
      this.currentFeature = null;
      this.coordinates = [];
      this.updateMapLayers(this.store.getAllFeatures());
    }
  }
}

