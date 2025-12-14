/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as dotenv from 'dotenv';
dotenv.config();

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import {params} from "firebase-functions";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

admin.initializeApp();

// Razorpay order creation function
export const createRazorpayOrder = onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }

    // Check if Razorpay credentials are configured
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      logger.error('Razorpay credentials not configured');
      res.status(500).json({ error: 'Payment service not configured' });
      return;
    }

    // Import Razorpay dynamically to avoid issues in serverless environment
    const Razorpay = (await import('razorpay')).default;

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const orderOptions = {
      amount: amount, // Amount in paisa
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(orderOptions);

    logger.info('Order created successfully', { orderId: order.id });

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
    });

  } catch (error) {
    logger.error('Error creating Razorpay order', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
