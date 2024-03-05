/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { MutableRefObject } from 'react'
import { Socket } from 'socket.io-client'

export const emitAdd = ({obj, socket, room, canvasState}: {obj: {}, socket: Socket, room:string|null, canvasState:string})=>{
    console.log("emmitting")
    socket.emit('objectAdded', ({obj, room, canvasState}))
}

export const emitModify = ({obj, socket, room, canvasState}: {obj: {}, socket: Socket, room:string|null, canvasState:string})=>{
    console.log("modfifyeing")
    socket.emit('objectModify', ({obj, room, canvasState}))
}

export const emitRemove = ({id, socket, room, canvasState}: {id: string, socket: Socket, room:string|null, canvasState:string}) =>{
    socket.emit('objectRemove', {id, room, canvasState})
}

export const emitPathAdd = ({Object, room, canvasState, socket}: {Object: {}, room: string|null, canvasState: MutableRefObject<string | null>, socket: Socket})=>{
    socket.emit("newPathCreated", { Object, id: (Object as any).path.id, room , canvasState: canvasState.current});
}

export const emitMouseMove = ({x, y, room, socket}: {x: number, y: number, room: string|null ,socket: Socket})=>{
    socket.emit("mouseMove", {x, y, room})
}
