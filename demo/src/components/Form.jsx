import React, { Component } from 'react';

export default class Form extends Component {
  state = {};

  onInputChange = ({ target }) => {
    this.setState({ [target.name]: target.value });
  };

  onSubmitClick = () => {
    const { fields, onSubmitClick } = this.props;
    onSubmitClick(this.state);
    fields.forEach((field) => {
      this.setState({ [field]: '' });
    });
  };

  render() {
    const { fields } = this.props;
    return (
      <div className="form">
        {fields.map((field) => (
          <div key={field}>
            <textarea
              onChange={this.onInputChange}
              name={field}
              placeholder={field}
              value={this.state[field]}
            />
            <br />
            <br />
          </div>
        ))}
        <button type="submit" onClick={this.onSubmitClick}>
          Submit
        </button>
      </div>
    );
  }
}
