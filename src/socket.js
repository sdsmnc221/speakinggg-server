const messages = require('./messages').default;
const { EVENTS_IN, EVENTS_OUT } = require('./const.events');
const { ERRORS, ERROR_MESSAGES } = require('./const.errors');

exports.default = io => socket => new Socket(socket, io);

class Socket {
  constructor(socket, io) {
    this.io = io;
    this.socket = socket;

    socket.on(EVENTS_IN.MESSAGE_NEW, this.onMessageNew.bind(this));
  }

  // Events

  onMessageNew(data) {
    messages
      .add(data, this.socket)
      .then(data => {
        this.emitMessage(data);
      })
      .catch(errorCode => {
        this.emitError(errorCode);
        console.error('Error sendMessage');
        // Message can't be sent for some reason
      });
  }

  // Emits

  emitError(errCode) {
    this.socket.emit(EVENTS_OUT.ERROR, {
      code: errCode,
      message: ERROR_MESSAGES[errCode]
    });
  }

  emitMessage(data) {
    switch (data.message.type) {
      case 'command': {
        const regex = /^\/(\w+) ?(.*)$/;
        const exec = regex.exec(data.message.text);
        this.io.emit(EVENTS_OUT.COMMAND_NEW, {
          command: exec[1],
          value: exec[2]
        });
        break;
      }
      case 'message':
      default:
        this.io.emit(EVENTS_OUT.MESSAGE_NEW, data);
    }
  }

  emitMessagesUpdate() {
    this.socket.emit(EVENTS_OUT.MESSAGES_UPDATE, {
      messages: messages.get()
    });
  }
}

exports.Socket = Socket;
