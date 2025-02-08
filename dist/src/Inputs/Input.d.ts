import React from 'react';
import { NestedObject } from '../useInertiaForm';
import { BaseFormInputProps, InputConflicts } from '.';
interface InputProps<TForm extends NestedObject, T = string> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, InputConflicts>, BaseFormInputProps<T, TForm> {
    component?: React.ElementType;
}
declare const Input: <TForm extends NestedObject, T = string>({ name, component, type, model, onChange, errorKey, defaultValue, clearErrorsOnChange, ...props }: InputProps<TForm, T>) => import("react/jsx-runtime").JSX.Element;
export default Input;
//# sourceMappingURL=Input.d.ts.map