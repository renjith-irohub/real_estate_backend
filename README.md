📦 EstateHub – Real Estate Web Platform
EstateHub is a full-stack real estate web application that connects property seekers with real estate agents. Built with the MERN stack (MongoDB, Express.js, React.js, Node.js), it offers features such as property listings, user authentication, secure payments, media uploads, and real-time interactions.

🌐 Tech Stack
Frontend: React.js (Vite)

Backend: Node.js, Express.js

Database: MongoDB

Cloud Storage: Cloudinary

Payment Integration: Stripe

Email Service: Nodemailer with Gmail SMTP

🔐 Environment Variables
Create a .env file in the root directory of your backend project and add the following environment variables:

PORT=3500
JWT_SECRET_KEY=your_jwt_secret_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe Keys
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLIC_KEY=your_stripe_public_key

# Email Configuration (Gmail SMTP for sending alerts or verifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Frontend URL for CORS and redirects
FRONTEND_URL=http://localhost:5173
