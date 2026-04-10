import passport from 'passport';
import { Strategy as strategyLocal, VerifyFunction, VerifyFunctionWithRequest } from 'passport-local';
import { Strategy as strategyJwt, VerifyCallback, ExtractJwt } from 'passport-jwt';

import Logger from '../Logger';
import { JwtPayload } from '../typings/jwtPayload';
import * as AuthService from '../services/AuthService';
import * as FirebaseService from '../services/FirebaseService';
import { setRequestTenancy } from '../utils';

const LOG = new Logger('passport');

export default (): void => {
  const localVerifyFunction: VerifyFunction = async (username, password, done) => {
    try {
      const user = await AuthService.verifyUserCredentials(username, password);

      // Setting the tenancy so that the database schema is correct
      setRequestTenancy(user.get('TenantKey') as string);

      return done(null, user, { message: 'Logged in successfully' });
    } catch (err) {
      LOG.error(err);
      return done(err, false);
    }
  };

  const jwtVerifyFunction: VerifyCallback = async (payload: JwtPayload, done) => {
    try {
      const isValidSession = await AuthService.checkIfValidSession(payload.id, payload.jti);

      if (!isValidSession) {
        LOG.warn(`User ID: ${payload.id}'s token is not whitelisted`);
        return done(false, null);
      }

      // Setting the tenancy so that the database schema is correct
      setRequestTenancy(payload.tenant);

      return done(false, payload);
    } catch (err) {
      LOG.error(err);
      return done(err, false);
    }
  };

  const mobileVerifyFunction: VerifyFunctionWithRequest = async (req, username, password, done) => {
    try {
      const contactNumber = username;
      const tokenFirebase = password;
      // Assuming countryCode is present in the request body
      const countryCode = req.body.countryCode || '+65'; // Set a default value if not provided

      // validate contact
      const user = await AuthService.verifyContactNumber(countryCode, contactNumber);
      if (!user) {
        LOG.warn(`User : ${contactNumber} not found try to login`);
        return done(false, null);
      }

      // validate tokenFirebase
      const verifyUid = await FirebaseService.verifyIdToken(tokenFirebase);
      if (!verifyUid) {
        LOG.warn(`User : ${contactNumber} login with not verified firebase token`);
        return done(false, null);
      }

      // validate firebase user with current contact
      const firebaseUser = await FirebaseService.retriveUserId(verifyUid);
      if (firebaseUser.phoneNumber !== `${countryCode}${contactNumber}`) {
        LOG.warn(`User : ${contactNumber} login with not valid phone firebase`);
        return done(false, null);
      }

      setRequestTenancy(user.get('TenantKey') as string);

      LOG.warn(`User : ${contactNumber} successfully login from mobile app`);
      return done(null, user, { message: 'Logged in successfully' });
    } catch (err) {
      LOG.error(err);
      return done(err, false);
    }
  };

  const jwtStrategy = new strategyJwt(
    {
      secretOrKey: process.env.APP_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    },
    jwtVerifyFunction
  );

  const localStrategy = new strategyLocal(
    {
      session: false,
      usernameField: 'username',
      passwordField: 'password'
    },
    localVerifyFunction
  );

  const mobileStrategy = new strategyLocal(
    {
      session: false,
      passReqToCallback: true,
      usernameField: 'contactNumber',
      passwordField: 'tokenFirebase'
    },
    mobileVerifyFunction
  );

  passport.use('local', localStrategy);
  passport.use('jwt', jwtStrategy);
  passport.use('mobile', mobileStrategy);
};

export const Authentication = {
  TO_AUTHENTICATE: passport.authenticate('local', { session: false, failWithError: true }),
  TO_MOBILE_AUTHENTICATE: passport.authenticate('mobile', { session: false, failWithError: true, passReqToCallback: true }),
  AUTHENTICATED: passport.authenticate('jwt', { session: false, failWithError: true })
};
