import { Progress, Method, VisitOptions as VisitOptions$1, Page, PageProps } from '@inertiajs/core';
import { AxiosResponse } from 'axios';
import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';

type Increment<A extends any[]> = [0, ...A];
type PathImpl<T, K extends keyof T, A extends any[] = []> = A['length'] extends 5 ? never : K extends string ? T[K] extends Record<string, any> ? T[K] extends ArrayLike<any> ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof any[]>, Increment<A>>}` : K | `${K}.${PathImpl<T[K], keyof T[K], Increment<A>>}` : K : never;
type Path<T> = PathImpl<T, keyof T> | Extract<keyof T, string>;
type PathValue<T, P extends Path<Required<T>>> = P extends `${infer K}.${infer Rest}` ? K extends keyof Required<T> ? Rest extends Path<Required<T>[K]> ? PathValue<Required<T>[K], Rest> : never : never : P extends keyof Required<T> ? Required<T>[P] : never;

type VisitOptions<TAsync extends boolean = boolean> = (Omit<VisitOptions$1, 'errors' | 'onSuccess'> & {
    errors?: Record<string, string | string[]>;
    async: TAsync;
    onSuccess?: (page: TAsync extends true ? AxiosResponse<any, any> : Page<PageProps>) => void;
});
type OnChangeCallback = (key: string | undefined, value: unknown, prev: unknown) => void;
type NestedObject = {
    [key: string]: unknown | NestedObject | NestedObject[];
};
type setDataByPath<TForm> = <P extends Path<TForm>>(key: P, value: PathValue<TForm, P>) => void;
type setDataByString = (key: string, value: unknown) => void;
type setDataByObject<TForm> = (data: TForm) => void;
type setDataByMethod<TForm> = (data: (previousData: TForm) => TForm) => void;
type getDataByPath<TForm> = <P extends Path<TForm>>(key: P) => PathValue<TForm, P>;
type getDataByString = (key: string) => unknown;
type unsetDataByPath<TForm> = (key: Path<TForm>) => void;
type unsetDataByString = (key: string) => void;
type resetAll = () => void;
type resetByPath<TForm> = (field: Path<TForm> | Path<TForm>[]) => void;
type resetByString = (field: string | string[]) => void;
type setErrorByPath<TForm> = (field: Path<TForm>, value: string | string[]) => void;
type setErrorByString = (field: string, value: string | string[]) => void;
type setErrorByObject = (errors: Record<string, string | string[]>) => void;
type getErrorByPath<TForm> = (field: Path<TForm>) => string | string[] | undefined;
type getErrorByString = (field: string) => string | string[] | undefined;
type clearAllErrors = () => void;
type clearErrorsByPath<TForm> = (field: Path<TForm> | Path<TForm>[]) => void;
type clearErrorsByString = (field: string | string[]) => void;
interface UseInertiaFormProps<TForm> {
    data: TForm;
    isDirty: boolean;
    errors: Partial<Record<keyof TForm, string | string[]>>;
    hasErrors: boolean;
    processing: boolean;
    progress: Progress | null;
    wasSuccessful: boolean;
    recentlySuccessful: boolean;
    setData: setDataByObject<TForm> & setDataByMethod<TForm> & setDataByPath<TForm> & setDataByString;
    getData: getDataByPath<TForm> & getDataByString;
    unsetData: unsetDataByPath<TForm> & unsetDataByString;
    transform: (callback: (data: TForm) => TForm) => void;
    onChange: (callback: OnChangeCallback) => void;
    setDefaults(): void;
    setDefaults(field: string, value: string): void;
    setDefaults(fields: TForm): void;
    reset: resetAll & resetByPath<TForm> & resetByString;
    clearErrors: clearAllErrors & clearErrorsByPath<TForm> & clearErrorsByString;
    setError: setErrorByPath<TForm> & setErrorByString & setErrorByObject;
    getError: getErrorByPath<TForm> & getErrorByString;
    submit: (method: Method, url: string, options?: VisitOptions) => void;
    get: (url: string, options?: VisitOptions) => void;
    patch: (url: string, options?: VisitOptions) => void;
    post: (url: string, options?: VisitOptions) => void;
    put: (url: string, options?: VisitOptions) => void;
    delete: (url: string, options?: VisitOptions) => void;
    cancel: () => void;
}
declare function useInertiaForm<TForm>(initialValues?: TForm): UseInertiaFormProps<TForm>;
declare function useInertiaForm<TForm>(rememberKey: string, initialValues?: TForm): UseInertiaFormProps<TForm>;

type HTTPVerb = 'post' | 'put' | 'get' | 'patch' | 'delete';
interface UseFormProps<TForm = NestedObject> extends UseInertiaFormProps<TForm> {
    model?: string;
    method: HTTPVerb;
    to?: string;
    submit: () => Promise<AxiosResponse<any> | UseInertiaFormProps<TForm> | void>;
}
declare const useForm: <T extends unknown = unknown>() => UseFormProps<T>;

type PartialHTMLForm = Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onChange' | 'onSubmit' | 'onError'>;
interface FormProps<TForm> extends PartialHTMLForm {
    data?: TForm;
    model?: string;
    method?: HTTPVerb;
    to: string;
    async?: boolean;
    resetAfterSubmit?: boolean;
    remember?: boolean;
    railsAttributes?: boolean;
    filter?: string[];
    onChange?: (form: UseFormProps<TForm>) => void;
    onSubmit?: (form: UseFormProps<TForm>) => boolean | void;
    onBefore?: (form: UseFormProps<TForm>) => void;
    onStart?: (form: UseFormProps<TForm>) => void;
    onSuccess?: (form: UseFormProps<TForm>) => void;
    onError?: (form: UseFormProps<TForm>) => void;
    onFinish?: (form: UseFormProps<TForm>) => void;
}
declare const WrappedForm: <TForm extends Partial<NestedObject>>({ children, model, railsAttributes, ...props }: FormProps<TForm>) => react_jsx_runtime.JSX.Element;

type InputStrategy = (name: string, model?: string) => {
    inputId: string;
    inputName: string;
};

interface UseInertiaInputProps<T = string | number | boolean> {
    name: string;
    model?: string;
    defaultValue?: T;
    errorKey?: string;
    strategy?: InputStrategy;
    clearErrorsOnChange?: boolean;
}
/**
 * Returns form data and input specific methods to use with an input.
 */
declare const useInertiaInput: <T = string | number | boolean, TForm = NestedObject>({ name, model, defaultValue, errorKey, strategy, clearErrorsOnChange, }: UseInertiaInputProps<T>) => {
    form: UseFormProps<TForm>;
    inputName: string;
    inputId: string;
    value: T;
    setValue: (value: T) => void;
    error: string | string[];
};

interface InputProps<TForm extends NestedObject, T = string> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, InputConflicts>, BaseFormInputProps<T, TForm> {
    component?: React.ElementType;
}
declare const Input: <TForm extends NestedObject, T = string>({ name, component, type, model, onChange, errorKey, defaultValue, clearErrorsOnChange, ...props }: InputProps<TForm, T>) => react_jsx_runtime.JSX.Element;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    component?: string | React.ComponentType;
    requiredFields?: string[];
}
declare const _default: React.NamedExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;

interface NestedFieldsProps {
    children: React.ReactNode | React.ReactElement[];
    model: string;
}
declare const NestedFields: ({ children, model }: NestedFieldsProps) => react_jsx_runtime.JSX.Element;

interface DynamicInputsProps$1 {
    children: React.ReactNode;
    model?: string;
    emptyData: Record<string, unknown>;
    addInputButton?: React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;
    removeInputButton?: React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;
}
declare const DynamicInputs: ({ children, model, emptyData, addInputButton, removeInputButton, }: DynamicInputsProps$1) => react_jsx_runtime.JSX.Element;

interface DynamicInputsProps<T = Record<string, unknown>> {
    model?: string;
    emptyData: T;
}
type AddInputHandler<T> = (override?: Partial<T> | ((records: T[]) => Partial<T>)) => void;
type DynamicInputsReturn<T = Record<string, unknown>> = {
    addInput: AddInputHandler<T>;
    removeInput: (i: number) => T;
    paths: string[];
};
declare const useDynamicInputs: <T extends Record<string, unknown>>({ model, emptyData }: DynamicInputsProps<T>) => DynamicInputsReturn<T>;

type InputConflicts = 'name' | 'onChange' | 'onBlur' | 'onFocus' | 'value' | 'defaultValue';
interface BaseFormInputProps<T, TForm extends NestedObject = NestedObject> extends UseInertiaInputProps<T> {
    model?: string;
    errorKey?: string;
    field?: boolean;
    required?: boolean;
    hidden?: boolean;
    onChange?: (value: T, form: UseFormProps<TForm>) => void;
    onBlur?: (value: T, form: UseFormProps<TForm>) => void;
    onFocus?: (value: T, form: UseFormProps<TForm>) => void;
    wrapperProps?: Record<string, any>;
}

export { DynamicInputs, type DynamicInputsProps, WrappedForm as Form, type FormProps, type HTTPVerb, Input, NestedFields, type NestedFieldsProps, type NestedObject, _default as Submit, type UseFormProps, type UseInertiaFormProps, type UseInertiaInputProps, useDynamicInputs, useForm, useInertiaForm, useInertiaInput };
