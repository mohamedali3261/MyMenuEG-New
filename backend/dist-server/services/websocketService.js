import { WebSocketServer, WebSocket } from 'ws';
import { logger } from '../utils/logger';
let wss = null;
const clients = new Set();
/**
 * Initialize WebSocket server
 */
export const initWebSocket = (server) => {
    wss = new WebSocketServer({ server, path: '/ws' });
    wss.on('connection', (ws) => {
        clients.add(ws);
        logger.info(`WebSocket client connected. Total clients: ${clients.size}`);
        ws.on('close', () => {
            clients.delete(ws);
            logger.info(`WebSocket client disconnected. Total clients: ${clients.size}`);
        });
        ws.on('error', (err) => {
            logger.error('WebSocket error', err);
            clients.delete(ws);
        });
        // Send welcome message
        ws.send(JSON.stringify({ type: 'connected', message: 'Connected to MyMenuEG' }));
    });
    logger.info('WebSocket server initialized');
};
/**
 * Broadcast message to all connected clients
 */
export const broadcast = (data) => {
    if (!wss || clients.size === 0)
        return;
    const message = JSON.stringify(data);
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
};
/**
 * Broadcast new order notification
 */
export const notifyNewOrder = (order) => {
    broadcast({
        type: 'new_order',
        data: {
            id: order.id,
            customer_name: order.customer_name,
            total_price: order.total_price,
            created_at: order.created_at
        }
    });
};
/**
 * Broadcast order status update
 */
export const notifyOrderUpdate = (orderId, status) => {
    broadcast({
        type: 'order_update',
        data: {
            orderId,
            status
        }
    });
};
/**
 * Broadcast new notification
 */
export const notifyNewNotification = (notification) => {
    broadcast({
        type: 'notification',
        data: notification
    });
};
/**
 * Get connected clients count
 */
export const getConnectedClientsCount = () => {
    return clients.size;
};
/**
 * Close WebSocket server
 */
export const closeWebSocket = () => {
    if (wss) {
        wss.close();
        wss = null;
        clients.clear();
    }
};
