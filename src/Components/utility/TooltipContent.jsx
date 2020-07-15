/* jshint quotmark: false, jquery: true */
var React = require('react');
const TooltipContent = (props) => {
  var { className, placement, tiptext, visible, active, img, lable, onClick } = props;
  if (!visible) return null;
  if (!tiptext)
    return (
      <button onClick={onClick} active={active} className={className + ' ttbtn'}>
        {img ? <img src={img} alt='' /> : null}
        {lable ? lable : null}
      </button>
    );
  return (
    <div
      className={className + ' ttbtn hint--' + placement + ' hint--rounded hint--medium'}
      aria-label={tiptext}
    >
      {props.children}
    </div>
  );
};
TooltipContent.defaultProps = {
  active: true,
  visible: true,
  placement: 'top',
};
export default TooltipContent;
