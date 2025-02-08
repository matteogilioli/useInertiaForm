import React from 'react';
export interface NestedFieldsProps {
    children: React.ReactNode | React.ReactElement[];
    model: string;
}
declare const useNestedAttribute: <T extends string = string>() => T;
export { useNestedAttribute };
declare const NestedFields: ({ children, model }: NestedFieldsProps) => import("react/jsx-runtime").JSX.Element;
export default NestedFields;
//# sourceMappingURL=NestedFields.d.ts.map