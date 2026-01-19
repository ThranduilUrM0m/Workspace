import { useEffect, useRef } from 'react';
import * as Comlink from 'comlink';

export function useWorker() {
  const workerRef = useRef<Worker>();
  const workerApiRef = useRef<any>();

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerApiRef.current = Comlink.wrap(workerRef.current);

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  return workerApiRef.current;
}
