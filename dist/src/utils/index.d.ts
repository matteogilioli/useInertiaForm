export { createContext } from './createContext';
export { fillEmptyValues } from './fillEmptyValues';
export { isUnset } from './isUnset';
export { renameObjectWithAttributes } from './renameObjectWithAttributes';
export { unsetCompact } from './unsetCompact';
export { useMaybeRemember } from './useMaybeRemember';
export declare const stripAttributes: (str: string, attribute?: string) => string;
export declare const coerceArray: <T = unknown>(arg: T | T[]) => T[];
type Increment<A extends any[]> = [0, ...A];
type PathImpl<T, K extends keyof T, A extends any[] = []> = A['length'] extends 5 ? never : K extends string ? T[K] extends Record<string, any> ? T[K] extends ArrayLike<any> ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof any[]>, Increment<A>>}` : K | `${K}.${PathImpl<T[K], keyof T[K], Increment<A>>}` : K : never;
export type Path<T> = PathImpl<T, keyof T> | Extract<keyof T, string>;
export type PathValue<T, P extends Path<Required<T>>> = P extends `${infer K}.${infer Rest}` ? K extends keyof Required<T> ? Rest extends Path<Required<T>[K]> ? PathValue<Required<T>[K], Rest> : never : never : P extends keyof Required<T> ? Required<T>[P] : never;
//# sourceMappingURL=index.d.ts.map