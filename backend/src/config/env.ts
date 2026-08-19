export const env = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  frontendUrl: process.env.FRONTEND_URL!,
};
