import React from 'react';
import { type UseInertiaFormProps } from '../useInertiaForm';
import { type AxiosResponse } from 'axios';
import { NestedObject } from '../useInertiaForm';
export type HTTPVerb = 'post' | 'put' | 'get' | 'patch' | 'delete';
export interface UseFormProps<TForm = NestedObject> extends UseInertiaFormProps<TForm> {
    model?: string;
    method: HTTPVerb;
    to?: string;
    submit: () => Promise<AxiosResponse<any> | UseInertiaFormProps<TForm> | void>;
}
export declare const createContext: <CT extends unknown | null>() => readonly [<T extends CT = CT>() => UseFormProps<T>, React.Provider<CT>];
declare const useForm: <T extends unknown = unknown>() => UseFormProps<T>, FormProvider: React.Provider<unknown>;
export { FormProvider, useForm };
//# sourceMappingURL=FormProvider.d.ts.map