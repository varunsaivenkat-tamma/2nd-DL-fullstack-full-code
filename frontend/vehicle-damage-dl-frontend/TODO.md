# Subscription Integration TODO

## 1. Add Razorpay SDK dependency
- Update package.json to include Razorpay SDK

## 2. Create Subscription Page
- Create src/pages/Subscription.jsx with 3 plans (1 month, 3 months, 1 year)
- Implement Razorpay payment integration in test mode
- Add payment success/failure handling

## 3. Update App.jsx
- Add /subscription route to App.jsx

## 4. Modify AIDashboard.jsx
- Add usage tracking logic (count user_reports from Firestore)
- Implement 2 free tries limit
- Add subscription status checks
- Redirect to subscription page when limit exceeded

## 5. Subscription Management
- Create Firestore collection for subscriptions
- Add functions to check subscription status
- Handle payment verification and subscription activation

## 6. Testing
- Install dependencies
- Test payment flow in Razorpay test mode
- Verify usage limits and subscription logic
