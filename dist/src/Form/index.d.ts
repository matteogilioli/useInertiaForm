import React from 'react';
import { NestedObject } from '../useInertiaForm';
import { useForm, type UseFormProps, type HTTPVerb } from './FormProvider';
import { useFormMeta, type FormMetaValue } from './FormMetaWrapper';
type PartialHTMLForm = Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onChange' | 'onSubmit' | 'onError'>;
export interface FormProps<TForm> extends PartialHTMLForm {
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
declare const WrappedForm: <TForm extends Partial<NestedObject>>({ children, model, railsAttributes, ...props }: FormProps<TForm>) => import("react/jsx-runtime").JSX.Element;
export { WrappedForm as Form, useForm, useFormMeta, type HTTPVerb, type UseFormProps, type FormMetaValue, };
//# sourceMappingURL=index.d.ts.map