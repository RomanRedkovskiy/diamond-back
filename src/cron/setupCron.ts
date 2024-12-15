import cron from 'node-cron';
import {UserService} from '../services/UserService.js';

export const setupCronTasks = () => {
    const userService = new UserService();

    cron.schedule('* * * * *', async () => {
        console.log('Running cron task.');
        try {
            await userService.handleInterest();
        } catch (error) {
            console.error('Error during cron task execution:', error);
        }
    });

    console.log('Cron task scheduled.');
};