export default class WebSocketService {
  constructor(url, options = {}) {
    this.url = url
    this.onVotes = options.onVotes || null
    this.onStatusChange = options.onStatusChange || null

    this.socket = null
    this.pendingVotes = []
    this.reconnectTimer = null
    this.reconnectAttempts = 0
    this.maxReconnectDelay = 10000
    this.shouldReconnect = false
    this.manuallyClosed = false
  }

  connect() {
    this.manuallyClosed = false
    this.shouldReconnect = true

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return
    }

    this.clearReconnectTimer()
    this.notifyStatus('connecting')

    let socket
    try {
      socket = new WebSocket(this.url)
    } catch (error) {
      this.notifyStatus('error')
      this.scheduleReconnect()
      return
    }
    this.socket = socket

    socket.onopen = () => {
      this.reconnectAttempts = 0
      this.notifyStatus('open')
      this.flushPendingVotes()
    }

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        const votes = Array.isArray(payload) ? payload : payload.votes
        if (Array.isArray(votes) && typeof this.onVotes === 'function') {
          this.onVotes(votes)
        }
      } catch (error) {
      }
    }

    socket.onerror = () => {
      this.notifyStatus('error')
    }

    socket.onclose = () => {
      if (this.socket === socket) {
        this.socket = null
      }
      this.notifyStatus('closed')

      if (this.shouldReconnect && !this.manuallyClosed) {
        this.scheduleReconnect()
      }
    }
  }

  sendVote(optionIndex) {
    const vote = {
      vote: Number(optionIndex),
    }

    if (!Number.isInteger(vote.vote)) {
      return false
    }

    if (this.isOpen()) {
      this.socket.send(JSON.stringify(vote))
      return true
    }

    this.pendingVotes.push(vote)
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.connect()
    }
    return true
  }

  flushPendingVotes() {
    if (!this.isOpen()) {
      return
    }

    const pending = this.pendingVotes
    this.pendingVotes = []

    pending.forEach((vote) => {
      try {
        this.socket.send(JSON.stringify(vote))
      } catch (error) {
        this.pendingVotes.push(vote)
      }
    })
  }

  isOpen() {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN
  }

  scheduleReconnect() {
    if (this.reconnectTimer || this.manuallyClosed || !this.shouldReconnect) {
      return
    }

    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, this.maxReconnectDelay)
    this.reconnectAttempts += 1
    this.notifyStatus('reconnecting')

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }

  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  notifyStatus(status) {
    if (typeof this.onStatusChange === 'function') {
      this.onStatusChange(status)
    }
  }

  disconnect() {
    this.manuallyClosed = true
    this.shouldReconnect = false
    this.clearReconnectTimer()
    this.pendingVotes = []

    if (this.socket) {
      this.socket.onclose = null
      this.socket.onerror = null
      this.socket.onmessage = null
      this.socket.onopen = null

      if (
        this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING
      ) {
        this.socket.close()
      }
      this.socket = null
    }

    this.notifyStatus('closed')
  }
}
