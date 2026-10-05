import type {AuthContext} from "../modules/auth/auth.types";
import "http";

declare module "http" {
    interface IncomingMessage {
        rawBody?:Buffer;
    }
}

declare global{
    namespace Express {
        interface Request {
            auth?: AuthContext;
            rawBody?:Buffer;
        }
    }
}

export {};