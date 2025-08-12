export type Branded<T, Brand extends string> = T & { __brand: Brand };

export type Uuid = Branded<string, 'Uuid'>;
