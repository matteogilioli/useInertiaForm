import { type InputStrategy } from './inputStrategy';
import { type NestedObject } from '../useInertiaForm';
export interface UseInertiaInputProps<T = string | number | boolean> {
    name: string;
    model?: string;
    defaultValue?: T;
    errorKey?: string;
    strategy?: InputStrategy;
    clearErrorsOnChange?: boolean;
}
declare const useInertiaInput: <T = string | number | boolean, TForm = NestedObject>({ name, model, defaultValue, errorKey, strategy, clearErrorsOnChange, }: UseInertiaInputProps<T>) => {
    form: import("../Form").UseFormProps<TForm>;
    inputName: string;
    inputId: string;
    value: T;
    setValue: (value: T) => void;
    error: string | string[];
};
export default useInertiaInput;
//# sourceMappingURL=index.d.ts.map