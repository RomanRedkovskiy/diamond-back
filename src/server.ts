import express from 'express';
import cookieParser from 'cookie-parser'
import {fileURLToPath} from 'url';
import path from 'path';
import cors from 'cors';
import {setupCronTasks} from "./cron/setupCron.js";
import {UserController} from "./controller/UserController.js";
import {ProjectController} from "./controller/ProjectController.js";
import {SecurityTokenController} from "./controller/SecurityTokenController.js";
import {LogController} from "./controller/LogController.js";
import {InterestLogController} from "./controller/InterestLogController.js";
import {InterestLogService} from "./services/InterestLogService.js";
import {LogService} from "./services/LogService.js";
import WebSocket, {WebSocketServer} from 'ws';
import {removeUserConnection, setUserConnection} from "./services/WebSocketService.js";
import {buildSchema} from "graphql";
import {graphqlHTTP} from "express-graphql";

const app = express();
const PORT = process.env.PORT;
const API = process.env.API
const dirname = path.dirname(fileURLToPath(import.meta.url));

app.set('view engine', 'ejs');
app.set('views', path.join(dirname, 'views'));
app.use(cookieParser());
app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Access-Control-Allow-Credentials'],
    exposedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Access-Control-Allow-Credentials'],
    credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws: WebSocket, req: any) => {
    const userId = BigInt(req.url!.split('/').pop()); // Extract user ID from the WebSocket URL
    setUserConnection(userId, ws);

    ws.on('close', () => {
        removeUserConnection(userId);
    });
});

setupCronTasks();

const userController = new UserController();
const projectController = new ProjectController();
const securityTokenController = new SecurityTokenController();
const logController = new LogController();
const interestLogController = new InterestLogController();

const interestLogService = new InterestLogService();
const logService = new LogService();

const schema = buildSchema(`
  type InterestLog {
    id: String!          
    amount: String!
    userId: String!      
    logId: String!       
    type: String!
    dateTime: String!
    projectTitle: String!
  }
  
  type Log {
    id: String!          
    amount: String!
    userId: String!      
    projectId: String!       
    type: String!
    dateTime: String!
    projectTitle: String!
  }

  type Query {
    lastInterestLogs(userId: ID!): [InterestLog!]!
    lastInvestLogs(userId: ID!): [Log!]!
  }
`);

const resolvers = {
    lastInterestLogs: async ({ userId }: { userId: bigint }, _: any, context: any) => {
        try {
            const logs = await interestLogService.getUserLastInterestLogs(userId);
            return logs.map((log: any) => ({
                id: log.id.toString(),
                amount: log.amount.toString(),
                userId: log.userId.toString(),
                logId: log.logId.toString(),
                type: log.type,
                dateTime: log.dateTime.toISOString(),
                projectTitle: log.log?.project?.title || '',
            }));
        } catch (error) {
            console.error('Error retrieving logs:', error);
            throw new Error('Failed to retrieve logs');
        }
    },
    lastInvestLogs: async ({ userId }: { userId: bigint }) => {
        try {
            const logs = await logService.getUserLastInvestLogs(userId);
            return logs.map((log: any) => ({
                id: log.id.toString(),
                amount: log.amount.toString(),
                userId: log.userId.toString(),
                projectId: log.projectId.toString(),
                type: log.type,
                dateTime: log.dateTime.toISOString(),
                projectTitle: log.project?.title || '',
            }));
        } catch (error) {
            console.error('Error retrieving logs:', error);
            throw new Error('Failed to retrieve logs');
        }
    }
};

app.use(`/${API}/graphql`, graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: true
}));

app.get(`/${API}/user`, (req, res, next) =>
    securityTokenController.useAuthMiddleware(req, res, () => {
        userController.getCurrentUser(req, res, next).then()
    })
);

app.post(`/${API}/user/register`, (req, res, next) =>
    userController.registerUser(req, res, next)
);

app.post(`/${API}/user/login`, (req, res, next) =>
    userController.loginUser(req, res, next)
);

app.put(`/${API}/user`, (req, res, next) =>
    securityTokenController.useAuthMiddleware(req, res, () => {
        userController.updateUser(req, res, next).then()
    })
);

app.post(`/${API}/user/deposit`, (req, res, next) =>
    securityTokenController.useAuthMiddleware(req, res, () => {
        userController.depositUser(req, res, next).then()
    })
);

app.post(`/${API}/user/withdraw`, (req, res, next) =>
    securityTokenController.useAuthMiddleware(req, res, () => {
        userController.withdrawUser(req, res, next).then();
    })
);

app.get(`/${API}/project`, (req, res) =>
    securityTokenController.useAuthMiddleware(req, res, () => {
        projectController.getActiveProjects(req, res).then();
    })
);

app.post(`/${API}/project/invest/:id`, (req, res) =>
    securityTokenController.useAuthMiddleware(req, res, () => {
        userController.investIntoProject(req, res).then();
    })
);

app.get(`/${API}/log`, (req, res) =>
    securityTokenController.useAuthMiddleware(req, res, () => {
        logController.getLastInvestLogs(req, res).then();
    })
);

app.get(`/${API}/interest-log`, (req, res) =>
    securityTokenController.useAuthMiddleware(req, res, () => {
        interestLogController.getLastInterestLogs(req, res).then();
    })
);

app.listen(PORT, () => {
    console.log(`APP is running on http://localhost:${PORT}/${API}/`);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.stack || err);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

