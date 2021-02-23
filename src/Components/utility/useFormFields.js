import React from 'react';
import Logit from '../../logit';
var logit = Logit('components/utility/useFormData');
export function useFormFields(parseInitialValues = (x) => x) {
  const [initialData, setInitialData] = React.useState({});
  const [formFields, setFormFields] = React.useState({});
  const dirty = React.useRef({});

  const createChangeHandler = (normalizer = (x) => x) => (e) => {
    let value = normalizer(e?.target?.value ?? '');
    let key = e?.target?.name;
    setValue(key, value);
  };

  const initializeData = (data) => {
    logit('initializeData', data);
    setInitialData(data);
    setFormFields(data);
    dirty.current = {};
  };
  const setValue = (key, value) => {
    if (value !== initialData[key]) dirty.current[key] = value;
    else delete dirty.current[key];
    logit('changeHandler', key, value, initialData[key], dirty.current);

    setFormFields((prev) => ({ ...prev, [key]: value }));
  };

  const isDirty = () => {
    return Object.keys(dirty.current).length > 0;
  };
  const getDirty = () => dirty.current;

  const reset = () => {
    setFormFields(initialData);
    dirty.current = {};
  };
  return {
    formFields,
    createChangeHandler,
    isDirty,
    reset,
    setValue,
    initializeData,
    getDirty,
  };
}
