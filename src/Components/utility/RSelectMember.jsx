// import Select, { components } from 'react-select';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';

import { useStoreState, useStoreActions } from 'easy-peasy';
import Logit from '../../logit';
// eslint-disable-next-line no-unused-vars
var logit = Logit('components/utility/RSelectMember', true);
var React = require('react');

// var SearchBox0 = function (props) {
//   // logit('props', props);
//   const Option = (props) => {
//     var regex = new RegExp(`^(.*?)(${props.selectProps.inputValue})(.*)$`, 'i');
//     const parts = props.label.match(regex);
//     if (!parts) {
//       return null;
//     }
//     return (
//       <components.Option {...props}>
//         {parts[1]}
//         <strong style={{ color: 'blue' }}>{parts[2]}</strong>
//         {parts[3]}
//       </components.Option>
//     );
//   };
//   var found = false;
//   const memberList = useStoreState((state) => state.members.sortedByName);
//   const setAccount = useStoreActions((actions) => actions.accountStatus.setAccount);
//   const ValueContainer = ({ children, ...props }) => {
//     // logit('ValueContainer', found, noFound, props, children);
//     return <components.ValueContainer {...props}>{children}</components.ValueContainer>;
//   };
//   const memberSelected = (option) => {
//     const { accountId } = option;
//     setAccount(accountId);
//   };
//   const MenuList = (props) => {
//     found = props.children.length === 1;
//     // logit('MenuList', found, noFound, props);
//     return <components.MenuList {...props} />;
//   };
//   return (
//     <Select
//       placeholder='enter member name'
//       components={{ Option, MenuList, ValueContainer }}
//       styles={{
//         singleValue: (base) => ({ ...base, color: 'white' }),
//         valueContainer: (base) => ({
//           ...base,
//           background: found ? 'cyan' : 'white',
//         }),
//       }}
//       name='form-field-name'
//       value='one'
//       options={memberList}
//       onChange={memberSelected}
//       // options={props.options}
//       // onChange={props.onSelected}
//       getOptionLabel={(option) => option.sortName}
//       getOptionValue={(option) => option}
//     />
//   );
// };

const useStyles = makeStyles({
  option: {
    fontSize: 15,
    '& > span': {
      marginRight: 10,
      fontSize: 18,
    },
  },
});

export default function SearchBox() {
  const classes = useStyles();
  const memberList = useStoreState((state) => state.members.sortedByName);
  const setAccount = useStoreActions((actions) => actions.accountStatus.setAccount);
  const [inputValue, setInputValue] = React.useState('');
  const [selected, setSelected] = React.useState(false);

  const memberSelected = (event, option) => {
    if (!option) return;
    setAccount(option.accountId);
    setInputValue('');
    setSelected(true);
  };
  const filterOptions = (options, { inputValue, getOptionLabel }) => {
    if (inputValue.length < 1) return options;
    const regexp = new RegExp(`\\b${inputValue}`, 'i');
    return options.filter((option) => {
      return regexp.test(option.sortName);
    });
  };

  return (
    <div>
      <Autocomplete
        id='select-member'
        style={{ width: 300 }}
        options={memberList}
        filterOptions={filterOptions}
        classes={{
          option: classes.option,
        }}
        onChange={memberSelected}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          if (selected) setSelected(false);
          else setInputValue(newInputValue);
        }}
        autoHighlight
        autoSelect
        getOptionLabel={(option) => option.sortName}
        // renderOption={(option) => <React.Fragment>{option.sortName}</React.Fragment>}
        renderInput={(params) => (
          <TextField
            {...params}
            label='Select a Member'
            variant='outlined'
            margin='dense'
            inputProps={{
              ...params.inputProps,
              // autoComplete: 'new-password', // disable autocomplete and autofill
            }}
          />
        )}
        renderOption={(option, { inputValue }) => {
          var regex = new RegExp(`^(.*?)(${inputValue})(.*)$`, 'i');
          const parts = option.sortName.match(regex);
          if (!parts) {
            return null;
          }
          if (inputValue?.length > 2) {
            logit('option', option);
          }
          return (
            <div
              style={{
                textDecoration: option.deleteState !== '' ? 'line-through' : 'none',
              }}
            >
              {parts[1]}
              <strong style={{ color: 'blue' }}>{parts[2]}</strong>
              {parts[3]}
            </div>
          );
        }}
      />
    </div>
  );
}
