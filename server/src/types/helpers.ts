export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type Overwrite<T, U> = Omit<T, keyof U> & U;
