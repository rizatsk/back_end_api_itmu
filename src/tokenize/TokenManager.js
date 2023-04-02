const JwtIO = require("@hapi/jwt");
const InvariantError = require("../exceptions/InvariantError");

const TokenManager = {
  generateAccessToken: (payload) =>
    JwtIO.token.generate(payload, process.env.ACCESS_TOKEN_KEY),
  generateRefreshToken: (payload) =>
    JwtIO.token.generate(payload, process.env.REFRESH_TOKEN_KEY),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = JwtIO.token.decode(refreshToken);
      JwtIO.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError("Refresh token tidak valid");
    }
  },
  // User ITindo token
  generateAccessUserToken: (payload) =>
    JwtIO.token.generate(payload, process.env.ACCESS_TOKEN_KEY_USER),
  generateRefreshUserToken: (payload) =>
    JwtIO.token.generate(payload, process.env.REFRESH_TOKEN_KEY_USER),
  verifyRefreshUserToken: (refreshToken) => {
    try {
      const artifacts = JwtIO.token.decode(refreshToken);
      JwtIO.token.verifySignature(
        artifacts,
        process.env.REFRESH_TOKEN_KEY_USER
      );
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError("Refresh token tidak valid");
    }
  },
};

module.exports = TokenManager;
