import type { Map } from 'maplibre-gl';

export function createMockMap(): Map {
  const layers: Map<string, any> = new Map();
  const sources: Map<string, any> = new Map();
  const eventHandlers: Map<string, Function[]> = new Map();

  const mockMap = {
    loaded: () => true,
    on: (event: string, handler: Function) => {
      if (!eventHandlers.has(event)) {
        eventHandlers.set(event, []);
      }
      eventHandlers.get(event)!.push(handler);
      return this as any;
    },
    once: (event: string, handler: Function) => {
      if (!eventHandlers.has(event)) {
        eventHandlers.set(event, []);
      }
      eventHandlers.get(event)!.push(handler);
      // Immediately call for 'load' event
      if (event === 'load') {
        setTimeout(() => handler(), 0);
      }
      return this as any;
    },
    off: (event: string, handler?: Function) => {
      if (handler && eventHandlers.has(event)) {
        const handlers = eventHandlers.get(event)!;
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      } else if (!handler) {
        eventHandlers.delete(event);
      }
      return this as any;
    },
    addLayer: (layer: any) => {
      layers.set(layer.id, layer);
      return this as any;
    },
    removeLayer: (id: string) => {
      layers.delete(id);
      return this as any;
    },
    getLayer: (id: string) => {
      return layers.get(id);
    },
    addSource: (id: string, source: any) => {
      sources.set(id, source);
      return this as any;
    },
    removeSource: (id: string) => {
      sources.delete(id);
      return this as any;
    },
    getSource: (id: string) => {
      const source = sources.get(id);
      // Add setData method for GeoJSON sources
      if (source && (id === 'mapdraw-features' || id === 'mapdraw-selected' || id === 'mapdraw-preview')) {
        return {
          ...source,
          setData: (data: any) => {
            // Mock implementation
          },
        };
      }
      return source;
    },
    setPaintProperty: (layerId: string, property: string, value: any) => {
      const layer = layers.get(layerId);
      if (layer) {
        layer.paint = layer.paint || {};
        layer.paint[property] = value;
      }
      return this as any;
    },
    setLayoutProperty: (layerId: string, property: string, value: any) => {
      const layer = layers.get(layerId);
      if (layer) {
        layer.layout = layer.layout || {};
        layer.layout[property] = value;
      }
      return this as any;
    },
    getPaintProperty: (layerId: string, property: string) => {
      const layer = layers.get(layerId);
      return layer?.paint?.[property];
    },
    getLayoutProperty: (layerId: string, property: string) => {
      const layer = layers.get(layerId);
      return layer?.layout?.[property];
    },
    queryRenderedFeatures: () => [],
    project: (lnglat: [number, number]) => ({ x: lnglat[0] * 100, y: lnglat[1] * 100 }),
    unproject: (point: { x: number; y: number }) => [point.x / 100, point.y / 100] as [number, number],
    getCenter: () => [0, 0] as [number, number],
    getZoom: () => 2,
    getBounds: () => ({
      getNorth: () => 1,
      getSouth: () => -1,
      getEast: () => 1,
      getWest: () => -1,
    }),
    getCanvas: () => ({
      style: {
        cursor: '',
      },
    }),
  } as any as Map;

  // Mock source with setData method
  const originalGetSource = (mockMap as any).getSource;
  (mockMap as any).getSource = (id: string) => {
    const source = originalGetSource(id);
    if (source && id === 'mapdraw-features') {
      return {
        ...source,
        setData: (data: any) => {
          // Mock implementation
        },
      };
    }
    return source;
  };

  return mockMap;
}

