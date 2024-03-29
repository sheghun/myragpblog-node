import {Router} from 'express';
import * as UserController from '../controllers/user';
import JWT, {JsonWebTokenError} from 'jsonwebtoken';
import {promisify} from 'util';

const UserRoutes = (router: Router): Router => {
  router.post('/', UserController.create);
  router.post('/login', UserController.login);
  router.get('/logout', UserController.logout);

  router.use(async (req, res, next) => {
    if (!req.cookies[process.env.USER_TOKEN_COOKIE as string]) {
      return res.sendStatus(403);
    }
    // Try decoding the jwt
    const verify = promisify(JWT.verify);
    try {
      const d = (await verify(req.cookies[process.env.USER_TOKEN_COOKIE], process.env
        .JWT_TOKEN as string)) as JwtPayloadType;
      req.body.username = d.username;
      // Append the request to the request object the body might lose it contents
      // @ts-ignore
      req.username = d.username;
      // @ts-ignore
      // Call the next function
      next();
    } catch (error) {
      const err = error as JsonWebTokenError;
      return res.status(403).json(err);
    }
  });

  router.put('/', UserController.update);
  router.get('/dashboard', UserController.dashboard);
  router.get('/profile', UserController.profile);
  router.post('/update-image', UserController.updateProfileImage());

  return router;
};

export default UserRoutes;
