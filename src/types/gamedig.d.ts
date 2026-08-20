declare module "gamedig" {
  export const GameDig: {
    query(options: {
      type: string;
      host: string;
      port: number;
      socketTimeout?: number;
      attemptTimeout?: number;
      maxRetries?: number;
    }): Promise<{
      name?: string;
      map?: string;
      maxplayers?: number;
      numplayers?: number;
      players?: unknown[];
      ping?: number;
      raw?: Record<string, unknown>;
    }>;
  };
}
