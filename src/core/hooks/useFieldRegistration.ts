import { useState, useCallback, useRef } from 'react';

export const useFieldRegistration = () => {
  const [registeredFields, setRegisteredFields] = useState<Set<string>>(new Set());
  const registeredFieldsRef = useRef<Set<string>>(new Set());

  const registerField = useCallback((fieldName: string) => {
    if (fieldName) {
      setRegisteredFields((prev) => {
        const newSet = new Set(prev);
        newSet.add(fieldName);
        registeredFieldsRef.current = newSet;
        return newSet;
      });
    }
  }, []);

  return {
    registeredFields,
    registeredFieldsRef,
    registerField,
  };
};

