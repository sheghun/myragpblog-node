import {Request, Response, NextFunction} from 'express';
import {check, validationResult} from 'express-validator/check';
import JWT from 'jsonwebtoken';
import User from '../models/User';
import {promisify} from 'util';
import Transaction from '../models/Transaction';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const create = [
  check('referalId', 'Referal ID is required')
    .exists()
    .isLength({min: 4})
    .custom(async referalId => {
      const user = await User.count({where: ({username: referalId} as User) as any});
      // If user does not exist fail
      return user !== 0;
    })
    .withMessage('Referal ID doest not exist'),
  check('phoneNumber', 'Phone number is required and must be 11 digits')
    .exists()
    .isLength({min: 11, max: 11}),
  check('firstName', 'First name is required')
    .exists()
    .isLength({min: 1}),
  check('lastName', 'Last name is required')
    .exists()
    .isLength({min: 1}),
  check('email', 'E-mail is required and must be valid')
    .isEmail()
    .custom(async email => {
      // Check if the email exists
      const user = await User.findOne({where: {email}});
      return user === null;
    })
    .withMessage('E-mail has already be used'),
  check('username', 'Username is required')
    .exists()
    .custom(async username => {
      // Check if the username exists
      const user = await User.findOne({where: {username}});
      return user === null;
    })
    .withMessage('Username has already been used')
    .isLength({min: 4}),
  check('password', 'Password is required and must contain at least 6 characters')
    .exists()
    .isLength({min: 6}),

  async (req: Request, res: Response) => {
    // Check if the req contains errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
    }

    // save the user
    try {
      await User.create({...req.body, packageId: 1} as User);
      return res.sendStatus(201);
    } catch (error) {
      return res.status(500).json({errors: ['Could not create user']});
    }
  },
];

export const login = [
  check('username')
    .exists()
    .not()
    .matches(/\W+/)
    .custom(async (username, {req}) => {
      const user = await User.findOne({where: ({username} as User) as any});
      if (!user) {
        return false;
      }

      // Inject the user to the request object
      (req as any).user = user;
      return true;
    }),

  check('password')
    .exists()
    .not()
    .isEmpty()
    .custom(async (password, {req}) => {
      // @ts-ignore
      return await (req.user as User).comparePassword(password);
    }),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    const r = req as Request & {user: User};
    if (!errors.isEmpty()) {
      return res.sendStatus(401);
    }

    // Set the payload
    const payload: JwtPayloadType = {
      username: r.user.username,
    };

    const options: JWT.SignOptions = {
      expiresIn: '30m',
    };

    // Generate the token and add it as a cookie
    const signToken = promisify(JWT.sign);
    // @ts-ignore
    const token = await signToken(payload, process.env.JWT_TOKEN as string, options);
    res.cookie(process.env.USER_TOKEN_COOKIE as string, token, {
      // expires: new Date(Date.now() + 3600),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    if (r.user.whatsappNumber === null) {
      return res.status(200).json({notDone: true});
    }

    if (r.user.paid === null && r.user.paymentMethod === null) {
      return res.status(200).json({notPaid: true});
    } else if (r.user.paymentMethod === 'MANUAL') {
      return res.status(200).json({notVerified: true});
    }
    return res.sendStatus(200);
  },
];

export const update = [
  check('firstName', 'Must contain only strings')
    .optional()
    .escape()
    .isLength({min: 1}),
  check('lastName', "Can't be empty")
    .optional()
    .escape()
    .isLength({min: 1}),
  check('email', 'E-mail is invalid')
    .optional()
    .escape()
    .isLength({min: 1})
    .custom(async email => {
      // Check if the email exists
      const user = await User.findOne({where: {email}});
      return user === null;
    })
    .withMessage("E-mail already exists, can't use two emails"),
  check('password', 'Must contain minimum of 6 letters')
    .optional()
    .escape()
    .isLength({min: 1}),
  check('bankAccountName')
    .optional()
    .escape()
    .isLength({min: 1}),
  check('bankAccountNumber', 'Minimum of 10 digits')
    .optional()
    .escape()
    .isLength({min: 10}),
  check('whatsappNumber')
    .optional()
    .escape()
    .isLength({min: 1}),
  check('bank')
    .optional()
    .escape()
    .isLength({min: 1}),
  check('phoneNumber', 'Minimum of 11 digits')
    .optional()
    .escape()
    .isLength({min: 11}),
  check('ragpReferalId')
    .optional()
    .escape()
    .isLength({min: 1}),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    // From the decoded token;
    const username = req.body.username;

    if (!errors.isEmpty()) {
      return res.status(422).json(errors.array());
    }

    try {
      // @ts-ignore
      const user = (await User.findOne({where: ({username} as any) as User})) as User;
      await user.update({...req.body});
      return res.sendStatus(200);
    } catch (error) {
      return res.status(500).send(error);
    }
  },
];

/**
 * User dashboard details
 * @param {Request} req
 * @param {Response} res
 */
export const dashboard = async (req: Request, res: Response) => {
  const username = req.body.username;
  console.log(username);
  let details = (await User.findOne({
    where: ({username} as User) as any,
    attributes: ['cummulativePv', 'pv', 'wallet', 'transactions', 'username'],
  })) as any;

  const network = (await User.count({where: ({referalId: username} as User) as any})) as number;
  details = details.toJSON() as {
    cummulativePv: number;
    pv: number;
    transactions: string;
    username: string;
    wallet: number;
  };

  // Get the transactions
  type transArray = {id: number; level: number};
  const transactions: (string | number)[][] = [];

  let transArray;
  try {
    transArray = JSON.parse(details.transactions) as Array<transArray>;
  } catch {
    transArray = null;
  }
  // Check if the transArray is not null
  if (transArray !== null) {
    transArray = transArray.slice(0, 50);
    // Check if the
    for (const trans of transArray) {
      const {amount, description, username} = (await Transaction.findOne({
        where: {id: trans.id},
        attributes: ['amount', 'description', 'username'],
      })) as Transaction;
      let percentage = 0;
      // Calculate the percentage
      // Calculate for percentage
      switch (true) {
        case trans.level === 1:
          percentage = 20 / 100;
          break;
        case trans.level === 2:
          percentage = 10 / 100;
          break;
        case trans.level === 3:
          percentage = 5 / 100;
          break;
        case trans.level === 4:
          percentage = 3 / 100;
          break;
        case trans.level === 5:
          percentage = 2 / 100;
          break;
        default:
          percentage = 1 / 100;
      }

      const t = [amount * percentage, username, description];

      transactions.push(t);
    }
  }
  const data = {
    ...details,
    network,
    notifications: [],
    transactions,
  };
  return res.status(200).json(data);
};

/**
 * For getting the users info
 * @param {Request} req
 * @param {Response} res
 */
export const profile = async (req: Request, res: Response) => {
  // Get the username from the request object
  // @ts-ignore
  const username = req.username;
  const user = (await User.findOne({where: {username}})) as User;
  const data = user.toJSON();
  data.image = data.image ? data.image : 'images/default.png';
  res.json(data);
};

export const logout = async (req: Request, res: Response) => {
  // Clear the cookie
  res.clearCookie(process.env.USER_TOKEN_COOKIE).sendStatus(200);
};

/**
 * To save the user image
 *
 * @return {RequestHandler} requestHandler
 */
export const updateProfileImage = () => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Get the path
      const filePath = path.join(__dirname, '/../assets/images/');
      cb(null, filePath);
    },
    filename: async (req, file, cb) => {
      console.log(file);
      // @ts-ignore
      const username = req.username;
      const user = await User.findOne({where: {username}});

      const filename = `${user.username}-${file.fieldname}-${Date.now()}.png`;
      cb(null, filename);
    },
  });

  const upload = multer({storage});
  return [
    upload.fields([{name: 'image', maxCount: 1}]),
    async (req: Request, res: Response, next: NextFunction) => {
      const r = req as Request & {
        files: {
          image: Array<Express.Multer.File>;
        };
      };
      // @ts-ignore
      const username = req.username;
      const user = await User.findOne({where: {username}});
      const image = r.files.image[0];

      if (user.image !== null) {
        const pathToOldImage = path.join(__dirname, `/../assets/${user.image}`);
        fs.unlink(pathToOldImage, err => {
          if (err) {
            next(err);
          }
        });
      }

      user.image = `images/${image.filename}`;
      await user.save();

      return res.status(202).send(`images/${image.filename}`);
    },
  ];
};
