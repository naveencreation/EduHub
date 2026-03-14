import { Request, Response, NextFunction } from "express";
declare module "express-serve-static-core" {
    interface Request {
        admin?: {
            id: string;
            email: string;
        };
    }
}
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=requireAuth.d.ts.map