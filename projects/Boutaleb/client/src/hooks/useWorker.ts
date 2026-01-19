import { useEffect, useRef } from 'react';
import * as Comlink from 'comlink';

interface WorkerAPI {}

export function useWorker(): any {
  const workerRef = useRef<Worker | null>(null);
  const workerApiRef = useRef<Comlink.Remote<WorkerAPI> | null>(null);

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
