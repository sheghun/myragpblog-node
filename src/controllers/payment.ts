import {check, validationResult} from 'express-validator/check';
import {Response, Request} from 'express';
import Package from '../models/Package';
import Paystack from 'paystack';
import Transaction from '../models/Transaction';
import User from '../models/User';
import {distributePayment} from '../middlewares';

export const payOnce = [
  check('id')
    .exists()
    .isLength({min: 1})
    .toInt()
    .custom(async (id, {req}) => {
      const pack = (await Package.findOne({where: {id}})) as Package;
      if (pack === null) {
        return false;
      }
      // Append to the body of the application
      req.body.pack = pack;
      return true;
    }),
  async (req: Request, res: Response): Promise<Response> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
    }

    const pack = req.body.pack as Package;
    const reference = Date.now();
    const user = (await User.findOne({
      where: ({username: req.body.username} as User) as any,
    })) as User;

    const trans = await Paystack(process.env.PAYSTACK_SECRET_KEY).transaction.initialize({
      // @ts-ignore
      amount: pack.amount * 100,
      reference,
      email: user.email,
    } as any);

    const authorizationUrl = trans.data && trans.data.authorization_url;

    if (!authorizationUrl) {
      return res.sendStatus(400);
    }

    try {
      await Transaction.create<Transaction>({
        amount: pack.amount,
        reference,
        description: `Registration of ${pack.name} package`,
        username: user.username,
      });
    } catch (error) {
      return res.status(500);
    }

    return res.status(200).json({authorizationUrl});
  },
];

export const verifyPayment = [
  check('trxref')
    .exists()
    .isLength({min: 1}),
  check('reference')
    .exists()
    .isLength({min: 1}),

  async (req: Request, res: Response): Promise<Response> => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.sendStatus(400);
    }
    const reference = req.body.reference;
    const username = req.body.username;

    // Get the transaction
    const transaction = await Transaction.findOne({where: {reference}});
    if (transaction === null) {
      return res.sendStatus(404);
    }

    // Check if the transaction has success has already been recorded
    if (transaction.successful) {
      return res.sendStatus(202);
    }

    const trxn = await Paystack(process.env.PAYSTACK_SECRET_KEY).transaction.verify(reference);

    if (!trxn.status) {
      return res.sendStatus(408);
    }

    if (trxn.status === false && trxn.message) {
      return res.sendStatus(404);
    }

    if (trxn.data.status === 'success') {
      // Get the user
      const user = (await User.findOne({where: ({username} as User) as any})) as User;

      // Update the transaction fields
      transaction.successful = new Date() as any;
      transaction.detail = JSON.stringify(trxn);

      // Update the user paid column
      user.paid = transaction.successful;

      await transaction.save();
      await user.save();

      await distributePayment(transaction, user);
    }

    return res.sendStatus(202);
  },
];

/**
 * Responsible for paying manually
 * @param {Request} req
 * @param {Response} res
 */
export const payManual = [
  check('ragpUsername')
    .exists()
    .isString(),
  check('date')
    .exists()
    .toDate(),
  async (req: Request, res: Response): Promise<Response> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
    }

    const username = req.body.username;
    const ragpUsername = req.body.ragpUsername;
    const date = req.body.date;

    const user = (await User.findOne({where: {username}})) as User;
    if (!user.paid && !user.paymentMethod) {
      user.paymentMethod = 'MANUAL';
      await user.save();

      // Get transaction
      const reference = Date.now();
      const pack = (await Package.findOne({where: {id: 1}})) as Package;
      let details = {date, ragpUsername} as any;
      details = JSON.stringify(details);
      console.log(details);

      try {
        const trans = await Transaction.create<Transaction>({
          amount: pack.amount,
          reference,
          description: `Registration of ${pack.name} package`,
          details,
          username: user.username,
        });
        trans.detail = details;
        await trans.save();
        return res.status(200).json({
          success: true,
          message: `
            Successful your account will be activated in 24 hours. \n Make sure you save this number ${reference}. \n 
            It will be used in tracking your payment
            `,
        });
      } catch (error) {
        return res
          .status(500)
          .json({success: false, message: 'An error occurred when payment was made'});
      }
    }
    return res.status(200).json({success: true});
  },
];
