import React from 'react';
import TextInput from 'react-textarea-autosize';

const wrappedFields = {
  Input: props => <input {...props} />,
  Textarea: props => <TextInput {...props} />,
  Select: props => (
    <select {...props}>
      {Object.entries(props.options || {}).map(([key, label]) => (
        <option value={key} key={key}>
          {label}
        </option>
      ))}
    </select>
  )
};
export default wrappedFields;
