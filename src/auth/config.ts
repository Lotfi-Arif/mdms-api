// config.ts
export default () => ({
  security: {
    bcryptSaltOrRound: 10, // or use process.env.BCRYPT_SALT_OR_ROUND if you're using .env
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  },
});
