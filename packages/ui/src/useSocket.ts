import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(path = "/", opts = {}) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      const url = typeof window !== "undefined" ? window.location.origin : "http://localhost:4000";
      socketRef.current = io(url, { path: "/socket.io", autoConnect: true, ...opts });
    }
    const s = socketRef.current;
    return () => { if (s) s.disconnect(); };
  }, [path]);

  const emit = (event: string, payload?: any) => socketRef.current?.emit(event, payload);
  const on = (event: string, cb?: (...args:any[]) => void) => socketRef.current?.on(event, cb);
  const off = (event: string, cb?: (...args:any[]) => void) => socketRef.current?.off(event, cb);

  return { emit, on, off, socket: socketRef.current };
}
