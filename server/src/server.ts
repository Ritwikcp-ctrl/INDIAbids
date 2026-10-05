import "dotenv/config";

import app from "./app";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { prisma } from "./lib/prisma";

let server: ReturnType<typeof app.listen> | undefined;

async function startServer(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info("Database connection established");

    server = app.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          environment: env.NODE_ENV,
        },
        "INDIAbids API started"
      );
    });
  } catch (error) {
    logger.fatal(
      {
        err: error,
      },
      "Failed to start INDIAbids API"
    );
    await prisma.$disconnect();
    process.exit(1);
  }
}


async function shutdown(signal:string):Promise<void> {
    logger.info({signal}, "Shutdown signal received");

    if(!server) {
        await prisma.$disconnect();
        process.exit(0);
    }

    server.close(async () => {
        try {
            await prisma.$disconnect();
            logger.info("Database connection closed");
            process.exit(0);
        }catch(error) {
            logger.error (
                 {
                    err:error,
                 },
                 "Error while closing databse connection"
            );
            process.exit(1);
        }
    });
}

process.on("SIGINT", () => {
    void shutdown("SIGINT");
});

process.on("SIGTERM", () =>{
    void shutdown("SIGTERM");
});

void startServer();