import { Response } from 'express';

interface ApiResponse {
     message: string;
     data?: Record<string, any> | null;
     error?: string | null;
     statusCode?: number;
}

const sendApiResponse = (res: Response, message: string, data?: Record<string, any> | null, error?: string | null, statusCode: number = 200): void => {
     const response: ApiResponse = { message };

     if (data !== undefined && data !== null) {
          response.data = data;
     }

     if (error !== undefined && error !== null) {
          response.error = error;
     }

     res.status(statusCode).json(response);
};

export default sendApiResponse;
