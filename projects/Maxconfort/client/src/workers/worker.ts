import * as Comlink from 'comlink';

// Worker API
export const api = {
  // Heavy computation example
  computeExpensive: async (data: any) => {
    // CPU-intensive task here
    return data;
  },
  
  // Image processing example
  processImage: async (imageData: ImageData) => {
    // Image processing logic here
    return imageData;
  },
};

// Expose the API using Comlink
Comlink.expose(api);
