import { createElement, render, Component } from './toyreact';

class MyComponent extends Component {
  render() {
    return (
      <div>
        <h1>123</h1>
        {this.children}
      </div>
    );
  }
}

render(
  <MyComponent id='id' className='class'>
    <div>123</div>
    <div>456</div>
    <div></div>
  </MyComponent>,
  document.body
);
