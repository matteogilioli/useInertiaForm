import React, { useState, useReducer, useCallback, useMemo, useRef, useEffect } from 'react';
import { useRemember, router } from '@inertiajs/react';
import { isPlainObject, isEmpty, get, unset, isEqual, set } from 'lodash-es';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import axios from 'axios';

const createContext$1 = () => {
  const context = /*#__PURE__*/React.createContext(null);
  const useContext = () => {
    const c = React.useContext(context);
    if (c === null) {
      throw new Error('useContext must be inside a Provider with a value');
    }
    return c;
  };
  return [useContext, context.Provider];
};

const fillEmptyValues = data => {
  const clone = structuredClone(data ?? {});
  for (const key in clone) {
    if (isPlainObject(clone[key])) {
      clone[key] = fillEmptyValues(clone[key]);
    } else if (Array.isArray(clone[key])) {
      clone[key] = clone[key].map(el => fillEmptyValues(el));
    } else if (clone[key] === undefined || clone[key] === null) {
      clone[key] = '';
    }
  }
  return clone;
};

const isUnset = v => {
  if (v === undefined || v === null) {
    return true;
  }
  if (typeof v === 'string') {
    return v === '';
  }
  if (typeof v === 'number') {
    return v === 0 ? false : !Boolean(v);
  }
  if (v instanceof Date) {
    return isNaN(v.valueOf());
  }
  if (typeof v === 'boolean') {
    return false;
  }
  return isEmpty(v);
};

const renameObjectWithAttributes = (data, str = '_attributes') => {
  const clone = structuredClone(data);
  Object.values(clone).forEach(value => {
    if (isPlainObject(value)) {
      recursiveAppendString(value, str);
    }
  });
  return clone;
};
const recursiveAppendString = (data, str) => {
  Object.entries(data).forEach(([key, value]) => {
    if (isPlainObject(value)) {
      renameKey(data, key, `${key}${str}`);
      recursiveAppendString(value, str);
    } else if (Array.isArray(value)) {
      renameKey(data, key, `${key}${str}`);
    }
  });
};
const renameKey = (obj, oldKey, newKey) => {
  if (oldKey !== newKey) {
    obj[newKey] = obj[oldKey];
    delete obj[oldKey];
  }
};

const unsetCompact = (data, path) => {
  const sanitizedPath = path.replace(/\[\]$/, '');
  if (sanitizedPath.includes('[]')) {
    const emptyArrayPosition = sanitizedPath.indexOf('[]');
    const startPath = sanitizedPath.slice(0, emptyArrayPosition);
    const restPath = sanitizedPath.slice(emptyArrayPosition + 2);
    const arr = get(data, startPath);
    if (Array.isArray(arr)) {
      for (let i = 0; i < arr.length; i++) {
        unsetCompact(data, `${startPath}[${i}]${restPath}`);
      }
    }
  }
  if (sanitizedPath.charAt(sanitizedPath.length - 1) === ']') {
    const match = sanitizedPath.match(/(?<index>\d*)\]$/);
    const arr = get(data, sanitizedPath.slice(0, sanitizedPath.lastIndexOf('[')));
    if (Array.isArray(arr) && match?.groups?.index !== undefined) {
      arr.splice(Number(match.groups.index), 1);
    }
  } else {
    unset(data, sanitizedPath);
  }
};

const useMaybeRemember = (initialValue, rememberKey) => {
  const [rememberedData, setRememberedData] = useRemember(initialValue, rememberKey);
  const [localData, setLocalData] = useState(initialValue);
  if (rememberKey) {
    return [rememberedData, setRememberedData];
  }
  return [localData, setLocalData];
};

const coerceArray = arg => Array.isArray(arg) ? arg : [arg];

const [useFormMeta, FormMetaProvider] = createContext$1();
const attributesReducer = (state, attribute) => {
  const newState = new Set(state);
  newState.add(attribute);
  return newState;
};
const FormMetaWrapper = ({
  children,
  model,
  railsAttributes
}) => {
  const [nestedAttributes, addAttribute] = useReducer(attributesReducer, new Set());
  const metaValues = {
    nestedAttributes,
    addAttribute,
    model,
    railsAttributes
  };
  return jsx(FormMetaProvider, {
    value: metaValues,
    children: children
  });
};

function useInertiaForm(rememberKeyOrInitialValues, maybeInitialValues) {
  const getFormArguments = useCallback(() => {
    let rememberKey = null;
    let transformedData = rememberKeyOrInitialValues;
    if (typeof rememberKeyOrInitialValues === 'string') {
      rememberKey = rememberKeyOrInitialValues;
      transformedData = maybeInitialValues;
    }
    return [rememberKey, fillEmptyValues(transformedData)];
  }, [rememberKeyOrInitialValues, maybeInitialValues]);
  const [rememberKey, transformedData] = getFormArguments();
  const [defaults, setDefaults] = useState(transformedData || {});
  const [data, setData] = useMaybeRemember(transformedData, rememberKey ? `${rememberKey}:data` : undefined);
  const rootModelKey = useMemo(() => {
    const keys = data ? Object.keys(data) : [];
    if (keys.length === 1 && isPlainObject(data[keys[0]])) {
      return keys[0];
    }
    return undefined;
  }, [data]);
  const [errors, setErrors] = useMaybeRemember({}, rememberKey ? `${rememberKey}:errors` : undefined);
  const [hasErrors, setHasErrors] = useState(false);
  const rewriteErrorKeys = errors => {
    if (!errors || !rootModelKey) return errors;
    const newErrors = {};
    Object.keys(errors).forEach(key => {
      newErrors[`${rootModelKey}.${key}`] = errors[key];
    });
    return newErrors;
  };
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState();
  const [wasSuccessful, setWasSuccessful] = useState(false);
  const [recentlySuccessful, setRecentlySuccessful] = useState(false);
  const cancelToken = useRef(null);
  const recentlySuccessfulTimeoutId = useRef(null);
  let transformRef = useRef(data => data);
  const isMounted = useRef(null);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  let onChangeRef = useRef(null);
  let onChangeArgsRef = useRef(null);
  useEffect(() => {
    if (onChangeRef.current && onChangeArgsRef.current) {
      onChangeRef.current(...onChangeArgsRef.current);
    }
  }, [data]);
  let railsAttributes = false;
  try {
    const meta = useFormMeta();
    railsAttributes = meta.railsAttributes;
  } catch (e) {}
  const submit = (method, url, options = {
    async: false
  }) => {
    const _options = {
      ...options,
      onCancelToken: token => {
        cancelToken.current = token;
        if (options.onCancelToken) {
          return options.onCancelToken(token);
        }
      },
      onBefore: visit => {
        setWasSuccessful(false);
        setRecentlySuccessful(false);
        clearTimeout(recentlySuccessfulTimeoutId.current);
        if (options.onBefore) {
          return options.onBefore(visit);
        }
      },
      onStart: visit => {
        setProcessing(true);
        if (options.onStart) {
          return options.onStart(visit);
        }
      },
      onProgress: event => {
        setProgress(event);
        if (options.onProgress) {
          return options.onProgress(event);
        }
      },
      onSuccess: page => {
        if (isMounted.current) {
          setProcessing(false);
          setProgress(null);
          setErrors({});
          setHasErrors(false);
          setWasSuccessful(true);
          setRecentlySuccessful(true);
          recentlySuccessfulTimeoutId.current = setTimeout(() => {
            if (isMounted.current) {
              setRecentlySuccessful(false);
            }
          }, 2000);
        }
        if (options.onSuccess) {
          return options.onSuccess(page);
        }
      },
      onError: errors => {
        if (isMounted.current) {
          setProcessing(false);
          setProgress(null);
          setErrors(rewriteErrorKeys(errors));
          setHasErrors(true);
        }
        if (options.onError) {
          return options.onError(errors);
        }
      },
      onCancel: () => {
        if (isMounted.current) {
          setProcessing(false);
          setProgress(null);
        }
        if (options.onCancel) {
          return options.onCancel();
        }
      },
      onFinish: visit => {
        if (isMounted.current) {
          setProcessing(false);
          setProgress(null);
        }
        cancelToken.current = null;
        if (options.onFinish) {
          return options.onFinish(visit);
        }
      }
    };
    let transformedData = transformRef.current(structuredClone(data));
    if (railsAttributes) {
      transformedData = renameObjectWithAttributes(transformedData);
    }
    if (options.async === true) {
      _options.onBefore(undefined);
      _options.onStart(undefined);
      axios[method](url, transformedData, {
        onUploadProgress: progessEvent => {
          _options.onProgress(progessEvent);
        }
      }).then(response => {
        _options.onSuccess(response);
      }).catch(error => {
        _options.onError(error);
      }).finally(() => {
        _options.onFinish(undefined);
      });
    } else {
      if (method === 'delete') {
        router.delete(url, {
          ..._options,
          data: transformedData
        });
      } else {
        router[method](url, transformedData, _options);
      }
    }
  };
  const clearErrors = fields => {
    if (!fields) {
      setErrors({});
      return;
    }
    const arrFields = coerceArray(fields);
    setErrors(errors => {
      const newErrors = Object.keys(errors).reduce((carry, field) => ({
        ...carry,
        ...(arrFields.length > 0 && !arrFields.includes(String(field)) ? {
          [field]: errors[field]
        } : {})
      }), {});
      setHasErrors(Object.keys(newErrors).length > 0);
      return newErrors;
    });
  };
  return {
    data,
    isDirty: !isEqual(data, defaults),
    errors,
    hasErrors,
    processing,
    progress,
    wasSuccessful,
    recentlySuccessful,
    transform: callback => {
      transformRef.current = callback;
    },
    onChange: callback => {
      onChangeRef.current = callback;
    },
    setData: (keyOrData, maybeValue) => {
      if (typeof keyOrData === 'string') {
        return setData(data => {
          const clone = structuredClone(data);
          if (onChangeRef.current) {
            onChangeArgsRef.current = [keyOrData, maybeValue, get(data, keyOrData)];
          }
          set(clone, keyOrData, maybeValue);
          return clone;
        });
      }
      if (keyOrData instanceof Function) {
        setData(data => {
          const clone = keyOrData(structuredClone(data));
          if (onChangeRef.current) {
            onChangeArgsRef.current = [undefined, clone, data];
          }
          return clone;
        });
        return;
      }
      if (onChangeRef.current) {
        onChangeArgsRef.current = [undefined, data, keyOrData];
      }
      setData(keyOrData);
    },
    getData: key => {
      return get(data, key);
    },
    unsetData: key => {
      setData(data => {
        const clone = structuredClone(data);
        if (onChangeRef.current) {
          onChangeArgsRef.current = [key, get(data, key), undefined];
        }
        unsetCompact(clone, key);
        return clone;
      });
    },
    setDefaults: (fieldOrFields, maybeValue) => {
      if (fieldOrFields === undefined) {
        setDefaults(() => data);
        return;
      }
      setDefaults(defaults => ({
        ...defaults,
        ...(typeof fieldOrFields === 'string' ? {
          [fieldOrFields]: maybeValue
        } : fieldOrFields)
      }));
    },
    reset: fields => {
      if (!fields) {
        if (onChangeRef.current) {
          onChangeArgsRef.current = [undefined, defaults, data];
        }
        setData(defaults);
        setErrors({});
        return;
      }
      const arrFields = coerceArray(fields);
      const clone = structuredClone(data);
      arrFields.forEach(field => {
        set(clone, field, get(defaults, field));
      });
      clearErrors(fields);
      if (onChangeRef.current) {
        onChangeArgsRef.current = [undefined, clone, data];
      }
      setData(clone);
    },
    setError: (fieldOrFields, maybeValue) => {
      setErrors(errors => {
        const newErrors = {
          ...errors,
          ...(typeof fieldOrFields === 'string' ? {
            [fieldOrFields]: maybeValue
          } : fieldOrFields)
        };
        setHasErrors(Object.keys(newErrors).length > 0);
        return newErrors;
      });
    },
    getError: key => {
      return get(errors, key);
    },
    clearErrors,
    submit,
    get: (url, options) => {
      submit('get', url, options);
    },
    post: (url, options) => {
      submit('post', url, options);
    },
    put: (url, options) => {
      submit('put', url, options);
    },
    patch: (url, options) => {
      submit('patch', url, options);
    },
    delete: (url, options) => {
      submit('delete', url, options);
    },
    cancel: () => {
      if (cancelToken.current) {
        cancelToken.current.cancel();
      }
    }
  };
}

const createContext = () => {
  const context = /*#__PURE__*/React.createContext(null);
  const useContext = () => {
    const c = React.useContext(context);
    if (c === null) {
      throw new Error('useContext must be inside a Provider with a value');
    }
    return c;
  };
  return [useContext, context.Provider];
};
const [useForm, FormProvider] = createContext();

const Form = ({
  children,
  model,
  data,
  method = 'post',
  to,
  async = false,
  resetAfterSubmit,
  remember = true,
  filter,
  onChange,
  onSubmit,
  onBefore,
  onStart,
  onSuccess,
  onError,
  onFinish,
  ...props
}) => {
  const filteredData = useCallback(data => {
    if (!filter) return data;
    const clone = structuredClone(data);
    filter.forEach(path => {
      unsetCompact(clone, path);
    });
    return clone;
  }, [data, filter]);
  const form = remember ? useInertiaForm(`${method}/${model || to}`, filteredData(data)) : useInertiaForm(filteredData(data));
  const contextValueObject = useCallback(() => ({
    ...form,
    model,
    method,
    to,
    submit
  }), [data, form, form.data, form.errors, model, method, to]);
  const submit = async options => {
    let shouldSubmit = to && onSubmit?.(contextValueObject()) === false ? false : true;
    if (!shouldSubmit) return;
    return form.submit(method, to, {
      ...options,
      async: async === true ? true : false
    });
  };
  const handleSubmit = e => {
    e.preventDefault();
    e.stopPropagation();
    const submitOptions = {
      onSuccess: () => {
        if (resetAfterSubmit || resetAfterSubmit !== false && async === true) {
          form.reset();
        }
        onSuccess?.(contextValueObject());
      }
    };
    if (onBefore) {
      submitOptions.onBefore = () => {
        onBefore(contextValueObject());
      };
    }
    if (onStart) {
      submitOptions.onStart = () => {
        onStart(contextValueObject());
      };
    }
    if (onFinish) {
      submitOptions.onFinish = () => {
        onFinish(contextValueObject());
      };
    }
    submit(submitOptions);
  };
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.forEach((value, key) => {
      form.setData(key, value);
    });
  }, []);
  useEffect(() => {
    onChange?.(contextValueObject());
  }, [form.data]);
  useEffect(() => {
    onError?.(contextValueObject());
  }, [form.errors]);
  return jsx(FormProvider, {
    value: contextValueObject(),
    children: jsx("form", {
      onSubmit: handleSubmit,
      ...props,
      children: children
    })
  });
};
const WrappedForm = ({
  children,
  model,
  railsAttributes = false,
  ...props
}) => {
  return jsx(FormMetaWrapper, {
    model: model,
    railsAttributes: railsAttributes,
    children: jsx(Form, {
      model: model,
      ...props,
      children: children
    })
  });
};

const [useNestedAttribute, NestedAttributeProvider] = createContext$1();
const NestedFields = ({
  children,
  model
}) => {
  let inputModel = model;
  try {
    const nested = useNestedAttribute();
    if (model.charAt(0) === '[') {
      inputModel = `${nested}${model}`;
    } else {
      inputModel = `${nested}.${model}`;
    }
  } catch (e) {}
  const {
    addAttribute
  } = useFormMeta();
  useEffect(() => {
    addAttribute(model);
  }, []);
  return jsx(NestedAttributeProvider, {
    value: inputModel,
    children: Array.isArray(children) ? children.map((child, i) => /*#__PURE__*/React.cloneElement(child, {
      key: i
    })) : children
  });
};

const inputStrategy = (name, model) => {
  if (!model) {
    return {
      inputId: name,
      inputName: name
    };
  }
  let inputName;
  if (name.charAt(0) === '[') {
    inputName = `${model}${name}`;
  } else {
    inputName = `${model}.${name}`;
  }
  return {
    inputId: `${model}_${name}`.replace('.', '_').replace(/\[(\d)\]/, '_$1'),
    inputName: inputName
  };
};

const useInertiaInput = ({
  name,
  model,
  defaultValue,
  errorKey,
  strategy = inputStrategy,
  clearErrorsOnChange = true
}) => {
  const form = useForm();
  let usedModel = model ?? form.model;
  try {
    const nested = useNestedAttribute();
    usedModel += `.${nested}`;
  } catch (e) {}
  const {
    inputName,
    inputId
  } = strategy(name, usedModel);
  const initializingRef = useRef(true);
  useEffect(() => {
    if (!initializingRef.current) return;
    const inputValue = form.getData(inputName);
    if (inputValue === null || inputValue === undefined) {
      form.setData(inputName, defaultValue || '');
    }
    initializingRef.current = false;
  }, []);
  const value = form.getData(inputName);
  const usedErrorKey = errorKey ?? inputName;
  const error = form.getError(usedErrorKey);
  useEffect(() => {
    if (initializingRef.current || !clearErrorsOnChange || !error) return;
    form.clearErrors(usedErrorKey);
  }, [value]);
  return {
    form,
    inputName: inputName,
    inputId,
    value: value ?? '',
    setValue: value => {
      return form.setData(inputName, value);
    },
    error
  };
};

const Input = ({
  name,
  component = 'input',
  type = 'text',
  model,
  onChange,
  errorKey,
  defaultValue,
  clearErrorsOnChange,
  ...props
}) => {
  const {
    form,
    inputName,
    inputId,
    value,
    setValue
  } = useInertiaInput({
    name,
    model,
    errorKey,
    defaultValue,
    clearErrorsOnChange
  });
  const handleChange = e => {
    const value = e.target?.checked || e.target.value;
    setValue(value);
    onChange?.(value, form);
  };
  const Element = component;
  return jsx(Element, {
    type: type,
    name: inputName,
    id: inputId,
    value: value,
    onChange: handleChange,
    ...props
  });
};

const Submit = /*#__PURE__*/React.forwardRef(({
  children,
  type = 'submit',
  disabled = false,
  component: Component = 'button',
  requiredFields,
  ...props
}, ref) => {
  const {
    data,
    getData,
    processing
  } = useForm();
  const hasEmptyRequiredFields = useCallback(() => {
    if (!requiredFields || requiredFields.length === 0) return false;
    return requiredFields.some(field => isUnset(getData(field)));
  }, [data, requiredFields]);
  return jsx(Component, {
    children,
    type,
    disabled: disabled || processing || requiredFields && hasEmptyRequiredFields(),
    ref,
    ...props
  });
});
var Submit$1 = /*#__PURE__*/React.memo(Submit);

const useDynamicInputs = ({
  model,
  emptyData
}) => {
  const {
    setData,
    unsetData,
    getData
  } = useForm();
  const {
    model: formModel
  } = useFormMeta();
  let inputModel = formModel ?? '';
  try {
    const nestedModel = useNestedAttribute();
    inputModel = formModel ? `${inputModel}.${nestedModel}` : nestedModel;
  } catch (e) {}
  inputModel = `${inputModel}.${model || ''}`;
  const handleAddInputs = useCallback(override => {
    setData(formData => {
      const clone = structuredClone(formData);
      let node = get(clone, inputModel);
      if (!node || !Array.isArray(node)) {
        set(clone, inputModel, []);
        node = get(clone, inputModel);
      }
      let merge = {};
      if (override instanceof Function) {
        merge = override(node);
      } else if (override !== undefined) {
        merge = override;
      }
      node.push(Object.assign(emptyData, merge));
      set(clone, inputModel, node);
      return clone;
    });
  }, []);
  const handleRemoveInputs = useCallback(i => {
    const record = getData(`${inputModel}[${i}]`);
    unsetData(`${inputModel}[${i}]`);
    return record;
  }, []);
  const data = getData(inputModel);
  const generatePaths = useCallback(() => {
    if (!Array.isArray(data)) return [];
    return data.map((_, i) => `${model || ''}[${i}]`);
  }, [data]);
  return {
    addInput: handleAddInputs,
    removeInput: handleRemoveInputs,
    paths: generatePaths()
  };
};

const DynamicInputs = ({
  children,
  model,
  emptyData,
  addInputButton = jsx("button", {
    children: "+"
  }),
  removeInputButton = jsx("button", {
    children: "-"
  })
}) => {
  const {
    addInput,
    removeInput,
    paths
  } = useDynamicInputs({
    model,
    emptyData
  });
  return jsxs(Fragment, {
    children: [/*#__PURE__*/React.cloneElement(addInputButton, {
      onClick: () => addInput(),
      type: 'button'
    }), paths.map((path, i) => jsxs(NestedFields, {
      model: path,
      children: [jsx("div", {
        children: children
      }), /*#__PURE__*/React.cloneElement(removeInputButton, {
        onClick: () => removeInput(i),
        type: 'button'
      })]
    }, i))]
  });
};

export { DynamicInputs, WrappedForm as Form, Input, NestedFields, Submit$1 as Submit, useDynamicInputs, useForm, useInertiaForm, useInertiaInput };
//# sourceMappingURL=useInertiaForm.js.map
