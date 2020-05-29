import React, { useEffect, useRef, useState } from 'react'

import { Aria2Client, Aria2ClientState } from './client/client'
import { Download } from './client/types'

export function DownloadState(props: { download: Download }) {
    const { download } = props
    return (
        <div>
            [#{download.gid} {download.completedLength}/{download.totalLength} ({download.status})]
            <br />
            {download.files.map((file) => (
                <span style={{ display: 'block' }} key={file.index}>
                    FILE: {file.path} ({file.completedLength}/{file.length})
                </span>
            ))}
        </div>
    )
}

export function App() {
    const client = useRef<Aria2Client>(null!)
    const [clientState, setClientState] = useState<Aria2ClientState>('closed')
    const [downloads, setDownload] = useState<Record<string, Download>>({})

    function addTestUri() {
        if (client.current === null) return
        client.current.addUri('https://speed.hetzner.de/10GB.bin').then((gid) => console.log(gid))
    }

    useEffect(() => {
        const timer = setInterval(() => {
            if (client.current === null || client.current.state !== 'ready') return
            client.current.tellActive().then(downloads => {
                const update: Record<string, Download> = {}
                downloads.forEach(download => {
                    update[download.gid] = download
                })
                setDownload(update)
            })
        }, 1000)
        return () => clearInterval(timer)
    })

    useEffect(() => {
        if (client.current === null) {
            client.current = new Aria2Client('ws://localhost:6800/jsonrpc')
            client.current.onstatechanged = (state) => setClientState(state)
        }
    }, [])

    return (
        <div>
            {Object.values(downloads).map((download) => (
                <React.Fragment key={download.gid}>
                    <DownloadState download={download} key={download.gid} />
                    <hr />
                </React.Fragment>
            ))}
            <span>JSON-RPC WebSocket state: {clientState}</span>
            <button onClick={addTestUri}>Add test URI</button>
        </div >
    )
}
