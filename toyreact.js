const RENDER_TO_DOM = Symbol('render to dom');
const TEXT_TYPE = Symbol('#text');

export class Component {
  constructor() {
    this.props = Object.create(null);
    this.children = [];
    this._range = null;
  }
  get vdom() {
    return this.render().vdom;
  }
  get vchildren() {
    return this.children.map((child) => child.vdom);
  }
  setAttribute(name, value) {
    this.props[name] = value;
  }
  appendChild(component) {
    this.children.push(component);
  }
  [RENDER_TO_DOM](range) {
    this._range = range;
    this.render()[RENDER_TO_DOM](range);
  }
  rerender() {
    this._range.deleteContents();
    this[RENDER_TO_DOM](this._range);
  }
  setState(newState) {
    if (this.state === null || typeof this.state !== 'object') {
      this.state = newState;
      this.rerender();
      return;
    }
    const merge = (oldState, newState) => {
      for (const key in newState) {
        if (oldState[key] === null || typeof oldState[key] !== 'object') {
          oldState[key] = newState[key];
        } else {
          merge(oldState[key], newState[key]);
        }
      }
    };
    merge(this.state, newState);
    this.rerender();
  }
}

class ElementWrapper extends Component {
  constructor(type) {
    super();
    this.type = type;
  }
  get vdom() {
    return this;
  }

  [RENDER_TO_DOM](range) {
    range.deleteContents();

    this._root = document.createElement(this.type);

    for (const p in this.props) {
      this._setAttribute(p, this.props[p]);
    }

    for (const child of this.children) {
      this._appendChild(child);
    }

    range.insertNode(this._root);
  }

  _setAttribute(name, value) {
    if (name.match(/^on([\s\S]+)$/)) {
      this._root.addEventListener(
        RegExp.$1.replace(/^[\s\S]/, (c) => c.toLowerCase()),
        value
      );
    } else if (name === 'className') {
      this._root.setAttribute('class', value);
    } else {
      this._root.setAttribute(name, value);
    }
  }
  _appendChild(component) {
    const range = document.createRange();
    range.setStart(this._root, this._root.childNodes.length);
    range.setEnd(this._root, this._root.childNodes.length);
    component[RENDER_TO_DOM](range);
  }
}

class TextWrapper extends Component {
  constructor(content) {
    super();
    this.type = TEXT_TYPE;
    this.content = content;
  }
  get vdom() {
    return this;
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents();
    this._root = document.createTextNode(this.content);
    range.insertNode(this._root);
  }
}

export function createElement(type, attributes, ...children) {
  let e;
  if (typeof type === 'string') {
    e = new ElementWrapper(type);
  } else {
    e = new type();
  }

  for (const p in attributes) {
    e.setAttribute(p, attributes[p]);
  }
  let insertChildren = (children) => {
    for (const child of children) {
      if (child === null) {
        continue;
      }
      if (typeof child === 'string') {
        child = new TextWrapper(child);
      }
      if (Array.isArray(child)) {
        insertChildren(child);
      } else {
        e.appendChild(child);
      }
    }
  };
  insertChildren(children);
  return e;
}

export function render(component, parentElement) {
  const range = document.createRange();
  range.setStart(parentElement, 0);
  range.setEnd(parentElement, parentElement.childNodes.length);
  range.deleteContents();

  component[RENDER_TO_DOM](range);
}
