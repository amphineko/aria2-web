import { createMessageConnection, DataCallback, Message, Logger } from 'vscode-jsonrpc'
import { AbstractMessageReader } from 'vscode-jsonrpc/lib/messageReader'
import { AbstractMessageWriter } from 'vscode-jsonrpc/lib/messageWriter'

class WebSocketReader extends AbstractMessageReader {
    private buffer: MessageEvent[] = []

    constructor(private readonly socket: WebSocket) {
        super()
        socket.addEventListener('close', ({ code, reason }) => {
            if (code !== 1000) this.fireError({
                message: `WebSocket closed: ${code} ${reason}`,
                name: code
            })
            this.fireClose()
        })
        socket.addEventListener('error', (error) => this.fireError(error))
        socket.addEventListener('message', this.enqueue)
    }

    public listen(callback: DataCallback): void {
        this.socket.removeEventListener('message', this.enqueue)
        this.socket.addEventListener('message', (event) => {
            callback(JSON.parse(event.data))
        })

        while (this.buffer.length > 0) {
            const m = this.buffer.shift()
            callback(JSON.parse(m?.data))
        }
    }

    private enqueue(event: MessageEvent) {
        this.buffer.push(event)
    }
}

class WebSocketWriter extends AbstractMessageWriter {
    private errorCount = 0

    constructor(private readonly socket: WebSocket) {
        super()
    }

    public write(message: Message) {
        try {
            const payload = JSON.stringify(message)
            this.socket.send(payload)
        } catch (err) {
            this.fireError(err, message, ++this.errorCount)
        }
    }
}

export function createWebSocketConnection(socket: WebSocket, logger: Logger) {
    return createMessageConnection(new WebSocketReader(socket), new WebSocketWriter(socket))
}
