import { useEffect, useRef, useCallback } from 'react';

export const usePolling = (callback, interval, dependencies = []) => {
  const savedCallback = useRef();
  const intervalId = useRef(null);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    const tick = async () => {
      if (savedCallback.current) {
        try {
          await savedCallback.current();
        } catch (error) {
          console.error('Polling error:', error);
        }
      }
    };

    if (interval && interval > 0) {
      // Clear existing interval
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
      
      // Set new interval
      intervalId.current = setInterval(tick, interval);
      
      // Initial call
      tick();
      
      // Cleanup on unmount or when dependencies change
      return () => {
        if (intervalId.current) {
          clearInterval(intervalId.current);
          intervalId.current = null;
        }
      };
    }
  }, [interval, ...dependencies]);

  const stopPolling = useCallback(() => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  }, []);

  const startPolling = useCallback((newInterval = interval) => {
    stopPolling();
    if (newInterval && newInterval > 0) {
      intervalId.current = setInterval(async () => {
        if (savedCallback.current) {
          try {
            await savedCallback.current();
          } catch (error) {
            console.error('Polling error:', error);
          }
        }
      }, newInterval);
      
      // Initial call
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
  }, [interval, stopPolling]);

  return { stopPolling, startPolling, isPolling: intervalId.current !== null };
};