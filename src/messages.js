const { ERRORS } = require('./const.errors')

let MESSAGES = []

function isValid (message) {
  return true
}

function isCommand (message) {
  return typeof message === 'string' && message[0] === '/'
}

function isSpam (socket) {
  if (socket.lastMessage && socket.lastMessage > Date.now() - 1300) {
    if (socket.tries > 3) return true
    else socket.tries += 1
  } else {
    socket.tries = 0
  }
  socket.lastMessage = Date.now()
  return false
}

function getCommand (message) {
  return {
    command: 'commandName',
    value: 'someValue'
  }
}

function formatMessage (socket, message, isCommand = false) {
  return {
    type: isCommand ? 'command' : 'message',
    text: message,
    created: new Date(),
    user: socket.user
  }
}

exports.default = {
  add (message, socket) {
    if (isSpam(socket)) {
      return Promise.reject(ERRORS.MESSAGE_SPAMMING)
    }
    // TODO: Strip message spaces
    if (!isValid(message)) {
      return Promise.reject(ERRORS.MESSAGE_INVALID)
    }
    if (isCommand(message)) {
      return Promise.resolve({
        message: formatMessage(socket, message, true)
      })
    }
    const m = formatMessage(socket, message)
    MESSAGES.push(m)
    if (MESSAGES.length > 50) {
      MESSAGES = MESSAGES.slice(-50)
    }
    return Promise.resolve({ 
      message: m, 
      messages: MESSAGES 
    })
  }
}