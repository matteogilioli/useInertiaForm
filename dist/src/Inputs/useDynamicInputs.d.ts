export interface DynamicInputsProps<T = Record<string, unknown>> {
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
export default useDynamicInputs;
//# sourceMappingURL=useDynamicInputs.d.ts.map