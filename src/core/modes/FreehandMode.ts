import { BaseMode } from './BaseMode';
import type { DrawFeature, DrawLineString } from '../types';

export class FreehandMode extends BaseMode {
  protected currentFeature: DrawLineString | null = null;
  protected isDrawing: boolean = false;
  protected coordinates: [number, number][] = [];

  enable(): void {
    this.isActive = true;
    this.map.getCanvas().style.cursor = 'crosshair';

    this.addEventHandler('click', this.onClick.bind(this));
    this.addEventHandler('mousemove', this.onMouseMove.bind(this));
    this.addEventHandler('mouseleave', this.onMouseLeave.bind(this));
  }

  disable(): void {
    this.isActive = false;
    this.map.getCanvas().style.cursor = '';
    this.removeEventHandlers();
    this.finishDrawing();
  }

  protected onClick(e: any): void {
    if (!this.isActive) return;
    e.preventDefault();
    
    if (!this.isDrawing) {
      // Start drawing on first click
      this.isDrawing = true;
      const coords = this.getCoordinatesFromEvent(e);
      this.coordinates = [coords];
      this.startLine(coords);
    } else {
      // Finish drawing on second click
      this.finishDrawing();
    }
  }

  protected onMouseMove(e: any): void {
    if (!this.isActive || !this.isDrawing) return;
    e.preventDefault();
    const coords = this.getCoordinatesFromEvent(e);
    // Only add point if it's different from the last one (avoid duplicates)
    if (this.coordinates.length === 0 || 
        this.coordinates[this.coordinates.length - 1][0] !== coords[0] || 
        this.coordinates[this.coordinates.length - 1][1] !== coords[1]) {
      this.coordinates.push(coords);
      this.updateLine();
    }
  }

  protected onMouseLeave(e: any): void {
    if (!this.isActive) return;
    this.finishDrawing();
  }

  protected startLine(coords: [number, number]): void {
    this.currentFeature = {
      type: 'Feature',
      id: undefined,
      geometry: {
        type: 'LineString',
        coordinates: [coords],
      },
      properties: {
        mode: 'freehand',
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

  protected finishDrawing(): void {
    if (this.isDrawing && this.currentFeature) {
      if (this.coordinates.length < 2) {
        // Remove feature if it has less than 2 points
        this.store.removeFeature(this.currentFeature.id!);
        this.updateMapLayers(this.store.getAllFeatures());
      }
      // Reset for next drawing
      this.isDrawing = false;
      this.currentFeature = null;
      this.coordinates = [];
    }
  }
}

