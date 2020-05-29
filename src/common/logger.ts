import loglevel from 'loglevel'
import prefix from 'loglevel-plugin-prefix'

prefix.reg(loglevel)
prefix.apply(loglevel, {
    format: (level, name) => `[${name}] ${level}: `
})

export function setDebug(value: string) {
    if (value) loglevel.enableAll()
}

export function getLogger(name: string) {
    return loglevel.getLogger(name)
}
