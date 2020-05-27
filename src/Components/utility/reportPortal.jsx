import React from 'react';
import ReactDOM from 'react-dom';
export class ReportPortal extends React.PureComponent {
  constructor(props) {
    super(props);
    // STEP 1: create a container <div>
    this.containerEl = document.createElement('div');
    this.externalWindow = null;
  }

  componentDidMount() {
    // STEP 3: open a new browser window and store a reference to it
    this.externalWindow = window.open(
      '',
      '_blank',
      // 'width=1200,height=800,left=100,top=100,titlebar="St.Edwards Report"'
    );

    // STEP 4: append the container <div> (that has props.children appended to it) to the body of the new window
    this.externalWindow.document.body.appendChild(this.containerEl);
    this.externalWindow.document.title = this.props.title;
    // this.externalWindow.onclose(this.props.onclose);
    console.log('externalWindow', this.externalWindow);
  }
  componentDidUpdate(prevProps) {
    if (this.props.reportReady && !prevProps.reportReady) {
      const win = this.externalWindow;
      console.log('launch print', new Date());
      win.print();
      console.log('return print', new Date());
      this.externalWindow.close(); //commented out to help debug

      const closeReport = this.props.closeReport;
      closeReport();
    }
  }

  componentWillUnmount() {
    // STEP 5: This will fire when this.state.showWindowPortal in the parent component becomes false
    // So we tidy up by closing the window
    console.log('closing external window');
    this.externalWindow.close();
  }
  render() {
    // STEP 2: append props.children to the container <div> that isn't mounted anywhere yet
    return ReactDOM.createPortal(this.props.children, this.containerEl);
  }
}

// export const Portal = ({ children, className = 'root-portal', el = 'div' }) => {
//   const [container] = React.useState(document.createElement(el))

//   container.classList.add(className)

//   React.useEffect(() => {
//     document.body.appendChild(container)
//     return () => {
//       document.body.removeChild(container)
//     }
//   }, [])

//   return ReactDOM.createPortal(children, container)
// }
