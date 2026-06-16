import { ReactNode } from 'react';

interface AutoSizerProps {
  children: (size: { height: number; width: number }) => ReactNode;
}

const AutoSizer = ({ children }: AutoSizerProps) => children({ height: 600, width: 400 });

export default AutoSizer;
