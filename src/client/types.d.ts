export interface File {
    index: string
    path: string
    length: string
    completedLength: string
    selected: string
    uris: any[]
}

export interface Download {
    gid: string
    status: 'active' | 'waiting' | 'paused' | 'error' | 'complete' | 'removed'
    totalLength: string
    completedLength: string
    files: File[]
}