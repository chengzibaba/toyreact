import { createElement, render, Component } from './toyreact';

class MyComponent extends Component {
  constructor() {
    super();
    this.state = {
      count: 0,
    };
  }
  render() {
    return (
      <div>
        {this.children}
        <h1>{this.state.count.toString()}</h1>
        <button
          onClick={(e) => {
            this.setState({ count: this.state.count + 1 });
          }}
        >
          add
        </button>
      </div>
    );
  }
}

render(
  <MyComponent id='id' className='class'>
    <div>123</div>
    <div>456</div>
  </MyComponent>,
  document.body
);
