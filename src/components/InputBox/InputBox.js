/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import styles from './InputBox.css';
import withStyles from '../../decorators/withStyles';
import GameStore from '../../stores/GameStore';
import ActionCreators from '../../actions/ActionCreators';

@withStyles(styles)
class InputBox extends Component {

  constructor() {
    super();
    this.state = {
      loggingIn: false,
      placeholder: ''
    };
    this.characterName = '';
    this.characterPass = '';
  }

  componentDidMount() {
    GameStore.addConnectedListener(this.handleServerConnection.bind(this));
    ReactDOM.findDOMNode(this.refs.txtInput).focus();
  }

  componentWillUnmount() {
    GameStore.removeConnectedListener(this.handleServerConnection.bind(this));
  }

  handleServerConnection() {
    this.setState({
      loggingIn: true,
      placeholder: 'Character Name?'
    });
  }

  handleKeyDown = event => {
    if(event.keyCode === 13) {
      this.handleCommand(ReactDOM.findDOMNode(this.refs.txtInput).value);
    } else if(event.keyCode === 104) {
      ActionCreators.command('n', '');
      event.preventDefault();
    } else if(event.keyCode === 98) {
      ActionCreators.command('s', '');
      event.preventDefault();
    } else if(event.keyCode === 102) {
      ActionCreators.command('e', '');
      event.preventDefault();
    } else if(event.keyCode === 100) {
      ActionCreators.command('w', '');
      event.preventDefault();
    } else if(event.keyCode === 101) {
      ActionCreators.command('say', '');
      event.preventDefault();
    }
  }

  handleCommand = command => {
    if(this.state.loggingIn === true && this.characterName === '') {
      this.characterName = command;
      this.setState({
        placeholder: 'Password?'
      });
      ActionCreators.addText(`<br>Thanks! What is your password, ${this.characterName}? If this is a new character, choose a password now.`);
    } else if(this.state.loggingIn === true && this.characterName !== '' && this.characterPass === '') {
      this.characterPass = command;
      ActionCreators.addText(`<br>Great! Let's get you into the world! One moment..`);
      ActionCreators.login(this.characterName, this.characterPass);
      this.setState({
        loggingIn: false,
        placeholder: 'Type in a command or ? for help'
      });
    } else if(this.state.loggingIn === true && this.characterName !== '' && this.characterPass !== '') {
      ActionCreators.addText(`<br>Whoa! Hold on there.. we're still trying to log you in.`);
    } else {
      let cmd = command.split(' ')[0];
      ActionCreators.command(cmd, command.substr(cmd.length + 1));
    }

    ReactDOM.findDOMNode(this.refs.txtInput).value = '';
  }

  render() {
    return (
      <div className="InputBox">
        <input ref="txtInput" type={ ((this.state.loggingIn && this.characterName !== '' ) ? 'password' : 'text') } onKeyDown={this.handleKeyDown.bind(this)} placeholder={this.state.placeholder} />
      </div>
    );
  }

}

export default InputBox;
