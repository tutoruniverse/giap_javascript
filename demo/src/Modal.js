import React, { Component } from 'react';

export default class Modal extends Component {
  state = {}

  onInputChange = ({ target }) => {
    this.setState({ [target.name]: target.value });
  }

  render() {
    const { fields, onSubmitClick } = this.props;
    return (
      <div className="modallll">
        {fields.map(field => (
          <div>
            <input
              type="text"
              onChange={this.onInputChange}
              name={field}
              placeholder={field}
              value={this.state[field]}
            />
            <br />
            <br />
          </div>
        ))}
        <button
          type="submit"
          onClick={() => {
            onSubmitClick(this.state);
          }}
        >
        Submit
        </button>
      </div>
    );
  }
}
