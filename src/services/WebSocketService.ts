import WebSocket from 'ws';

const userConnections: Map<bigint, WebSocket> = new Map();

export function setUserConnection(userId: bigint, ws: WebSocket) {
    userConnections.set(userId, ws);
}

export function removeUserConnection(userId: bigint) {
    userConnections.delete(userId);
}

export function sendDataToUser(userId: bigint, data: string) {
    const userConnection = userConnections.get(userId);
    if (userConnection) {
        userConnection.send(data);
    } else {
        console.log(`User ${userId} is not connected.`);
    }
}