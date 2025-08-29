# Medzy Frontend

A modern React.js frontend for the Medzy healthcare platform, built with Vite and TailwindCSS.

## Features

- 🔐 **User Authentication** - Secure login/signup with JWT
- 💊 **Medicine Management** - Browse, search, and manage medicines
- 🛒 **Shopping Cart** - Add medicines to cart and checkout
- 💳 **Payment Integration** - Multiple payment gateways (bKash, SSLCommerz, Stripe)
- 🤖 **AI Doctor** - Smart healthcare assistant powered by Gemini AI
- 💝 **Medicine Donation** - Donate and browse medicine donations
- ⏰ **Medicine Reminders** - Set and manage medication schedules
- 📊 **Order Tracking** - Track order status and history
- ⭐ **Reviews & Ratings** - Rate medicines and services
- 🎯 **Customer Support** - Integrated support system
- 📱 **Responsive Design** - Mobile-first approach with TailwindCSS

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/abdulla2025/medzy-web-frontend)

## Environment Variables

Configure these environment variables in Vercel:

### API Configuration
- `VITE_API_URL` - Backend API URL (e.g., https://your-backend.vercel.app)
- `VITE_FRONTEND_URL` - Frontend URL (e.g., https://your-frontend.vercel.app)

### Optional Services
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key (for pharmacy locations)
- `VITE_GEMINI_API_KEY` - Google Gemini API key (for AI Doctor feature)

## Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom hooks
- **UI Components**: Custom components with Lucide React icons
- **Maps**: Leaflet for interactive maps
- **OCR**: Tesseract.js for prescription reading
- **Build Tool**: Vite for fast development and optimized builds

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── AdminDashboard.jsx
│   ├── CustomerDashboard.jsx
│   ├── AuthForm.jsx
│   ├── Homepage.jsx
│   └── ...
├── context/            # React context providers
│   ├── AuthContext.jsx
│   ├── DarkModeContext.jsx
│   └── NotificationContext.jsx
├── config/             # Configuration files
│   └── api.js         # API endpoints configuration
├── App.jsx            # Main app component
└── main.jsx          # App entry point
```

## Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/abdulla2025/medzy-web-frontend.git
   cd medzy-web-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## Key Features

### Authentication System
- Secure JWT-based authentication
- Email verification
- Password reset functionality
- Role-based access control

### Medicine Management
- Advanced search and filtering
- Category-based browsing
- Detailed medicine information
- Stock management

### Payment System
- Multiple payment gateways
- Secure transaction processing
- Payment history tracking
- Refund management

### AI-Powered Features
- Smart Doctor chatbot
- Prescription OCR scanning
- Personalized recommendations

### Admin Dashboard
- User management
- Medicine inventory
- Order management
- Revenue analytics
- Dispute handling

## Deployment Notes

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

### Environment Setup
Make sure to update the `VITE_API_URL` to point to your deployed backend API.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@medzy.com or create an issue in the GitHub repository.
