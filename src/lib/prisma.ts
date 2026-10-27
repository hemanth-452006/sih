/**
 * Database client adapter.
 * Uses global database store with in-memory persistence in demo mode.
 */
export const prisma = {
  $connect: async () => {},
  $disconnect: async () => {},
};

export default prisma;
