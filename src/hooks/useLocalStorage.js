
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to localStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
};

// Custom hook for managing multiple localStorage items
export const useMultipleLocalStorage = (keys) => {
  const [values, setValues] = useState(() => {
    const initialValues = {};
    keys.forEach(({ key, initialValue }) => {
      try {
        const item = window.localStorage.getItem(key);
        initialValues[key] = item ? JSON.parse(item) : initialValue;
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        initialValues[key] = initialValue;
      }
    });
    return initialValues;
  });

  const updateValue = (key, value) => {
    try {
      const valueToStore = value instanceof Function ? value(values[key]) : value;
      setValues(prev => ({ ...prev, [key]: valueToStore }));
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const clearValue = (key) => {
    try {
      setValues(prev => ({ ...prev, [key]: undefined }));
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  const clearAllValues = () => {
    keys.forEach(({ key }) => {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing localStorage key "${key}":`, error);
      }
    });
    setValues({});
  };

  return { values, updateValue, clearValue, clearAllValues };
};

// Hook for managing localStorage with expiration
export const useLocalStorageWithExpiry = (key, initialValue, ttl) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      const parsedItem = JSON.parse(item);
      const now = new Date();

      // Check if item has expired
      if (parsedItem.expiry && now.getTime() > parsedItem.expiry) {
        window.localStorage.removeItem(key);
        return initialValue;
      }

      return parsedItem.value || initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      const now = new Date();
      const item = {
        value: valueToStore,
        expiry: ttl ? now.getTime() + ttl : null
      };

      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const clearValue = () => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, clearValue];
};
