import { MessageConnection, RequestType } from 'vscode-jsonrpc'
import { createWebSocketConnection } from './rpc'
import { getLogger } from '../common/logger'
import { Download } from './types'

export type Aria2ClientState = 'closed' | 'connecting' | 'connected' | 'ready'

const rpcLogger = getLogger('Aria2Client.RPC')

export class Aria2Client {
    onstatechanged: (state: Aria2ClientState) => void = () => { }

    public state: Aria2ClientState = 'connecting'

    private rpc: MessageConnection

    constructor(url: string) {
        const socket = new WebSocket(url)

        const rpc = this.rpc = createWebSocketConnection(socket, rpcLogger)
        rpc.listen()
        rpc.onClose(() => this.setState('closed'))

        socket.addEventListener('open', () => this.setState('ready'))
    }

    public addUri(uri: string) {
        const type = new RequestType<string[][], string, void, void>('aria2.addUri')
        return this.rpc.sendRequest(type, [[uri]])
    }

    public tellActive() {
        return this.rpc.sendRequest<Download[]>('aria2.tellActive', [])
    }

    private setState(state: Aria2ClientState) {
        if (state === this.state) return
        this.state = state
        setImmediate(() => this.onstatechanged(state))
    }
}