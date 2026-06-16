import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { readJson, writeJson } from '../utils/storage';

export const usePersistedState = <T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => readJson(key, initial));

  useEffect(() => {
    writeJson(key, state);
  }, [key, state]);

  return [state, setState];
};
