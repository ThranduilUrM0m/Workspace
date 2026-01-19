import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(path: string = "/", opts: Record<string, any> = {}): { emit: (event: string, payload?: any) => void; on: (event: string, cb?: (...args: any[]) => void) => void; off: (event: string, cb?: (...args: any[]) => void) => void; socket: Socket | null } {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      const url = typeof window !== "undefined" ? window.location.origin : "http://localhost:4000";
      socketRef.current = io(url, { path: "/socket.io", autoConnect: true, ...opts });
    }
    const s = socketRef.current;
    return (): void => { if (s) s.disconnect(); };
  }, [path]);

  const emit = (event: string, payload?: any): void => { socketRef.current?.emit(event, payload); };
  const on = (event: string, cb?: (...args:any[]) => void): void => { socketRef.current?.on(event, cb); };
  const off = (event: string, cb?: (...args:any[]) => void): void => { socketRef.current?.off(event, cb); };

  return { emit, on, off, socket: socketRef.current };
}
