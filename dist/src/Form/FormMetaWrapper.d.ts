import React from 'react';
export type FormMetaValue = {
    nestedAttributes: Set<string>;
    addAttribute: (attribute: string) => void;
    model?: string;
    railsAttributes: boolean;
};
declare const useFormMeta: <T extends FormMetaValue = FormMetaValue>() => T;
export { useFormMeta };
interface FormMetaWrapperProps {
    children: React.ReactNode;
    model?: string;
    railsAttributes: boolean;
}
declare const FormMetaWrapper: ({ children, model, railsAttributes }: FormMetaWrapperProps) => import("react/jsx-runtime").JSX.Element;
export default FormMetaWrapper;
//# sourceMappingURL=FormMetaWrapper.d.ts.map