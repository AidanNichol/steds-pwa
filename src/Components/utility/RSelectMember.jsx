import Select, { components } from "react-select";
import { useStoreState, useStoreActions } from "easy-peasy";
import Logit from "logit";
// eslint-disable-next-line no-unused-vars
var logit = Logit("components/utility/RSelectMember", true);
var React = require("react");

var SearchBox = function (props) {
  // logit('props', props);
  const Option = (props) => {
    var regex = new RegExp(`^(.*?)(${props.selectProps.inputValue})(.*)$`, "i");
    const parts = props.label.match(regex);
    if (!parts) {
      return null;
    }
    return (
      <components.Option {...props}>
        {parts[1]}
        <strong style={{ color: "blue" }}>{parts[2]}</strong>
        {parts[3]}
      </components.Option>
    );
  };
  var found = false;
  const memberList = useStoreState((state) => state.members.sortedByName);
  const setAccount = useStoreActions((actions) =>
    actions.accountStatus.setAccount
  );
  const ValueContainer = ({ children, ...props }) => {
    // logit('ValueContainer', found, noFound, props, children);
    return <components.ValueContainer {...props}>
      {children}
    </components.ValueContainer>;
  };
  const memberSelected = (option) => {
    const { accountId } = option;
    setAccount(accountId);
  };
  const MenuList = (props) => {
    found = props.children.length === 1;
    // logit('MenuList', found, noFound, props);
    return <components.MenuList {...props} />;
  };
  return (
    <Select
      placeholder="enter member name"
      components={{ Option, MenuList, ValueContainer }}
      styles={{
        singleValue: (base) => ({ ...base, color: "white" }),
        valueContainer: (base) => ({
          ...base,
          background: found ? "cyan" : "white",
        }),
      }}
      name="form-field-name"
      value="one"
      options={memberList}
      onChange={memberSelected}
      // options={props.options}
      // onChange={props.onSelected}
      getOptionLabel={(option) => option.sortName}
      getOptionValue={(option) => option}
    />
  );
};
export default SearchBox;
