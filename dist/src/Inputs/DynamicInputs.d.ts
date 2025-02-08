import React from 'react';
export interface DynamicInputsProps {
    children: React.ReactNode;
    model?: string;
    emptyData: Record<string, unknown>;
    addInputButton?: React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;
    removeInputButton?: React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;
}
declare const DynamicInputs: ({ children, model, emptyData, addInputButton, removeInputButton, }: DynamicInputsProps) => import("react/jsx-runtime").JSX.Element;
export default DynamicInputs;
//# sourceMappingURL=DynamicInputs.d.ts.map