# 🌍 Travel Itinerary Flask Application

## 🧭 Overview

This project is a **full-stack Flask web application** that generates personalized day-wise travel itineraries with **real-time data integration**. The app fetches **weather information**, **flight prices**, **notable attractions**, and **AI-generated itineraries** from multiple external APIs to provide travelers with comprehensive trip planning in seconds.

**Live on:** `http://localhost:5000` (local)

---

## ✨ Features

- 🌦️ **Real-time Weather Data** — Get current and accurate weather conditions for your destination via OpenWeather API
- ✈️ **Flight Search & Pricing** — Find the cheapest flights from major Indian cities using Amadeus API
- 🗺️ **Smart Attraction Recommendations** — Discover top tourist spots and landmarks via Wikipedia and Google Maps APIs
- 🤖 **AI-Generated Daily Plans** — Get personalized itinerary suggestions using OpenAI (with smart fallback)
- 📸 **Beautiful Gallery** — Browse destination images powered by Pixabay API
- 💾 **Save & Revisit** — Store your itineraries in browser storage and access them anytime
- 🖨️ **Export/Print** — Download or print your complete trip plan
- 📱 **Responsive UI** — Beautiful, modern design that works on all devices
- 🔌 **REST API Backend** — Easy-to-integrate endpoints for custom frontend development

---

## 🛠️ Tech Stack

### **Backend**
- **Python 3.8+** — Core programming language
- **Flask** — Lightweight web framework
- **requests** — HTTP library for API calls
- **openai** — OpenAI API client (v1.0+)
- **beautifulsoup4** — HTML parsing for Wikipedia data
- **python-dotenv** — Environment variable management

### **Frontend**
- **HTML5** — Semantic markup
- **CSS3** — Modern styling with gradients and animations
- **JavaScript (Vanilla)** — Dynamic interactions and API calls
- **Responsive Design** — Mobile-first approach

### **APIs Integrated**
| API | Purpose | Free Tier |
|-----|---------|-----------|
| **OpenWeather** | Real-time weather data | 1,000 calls/day |
| **Google Maps Places** | Tourist attractions | 150 requests/day |
| **Amadeus** | Flight search & pricing | Sandbox available |
| **Wikipedia** | Attraction descriptions | Unlimited |
| **Pixabay** | Destination images | 50 requests/hour |
| **OpenAI (GPT-3.5)** | AI itinerary generation | $5 free credits |

---

## 🔍 How It Works

### **Backend Flow**

1. **User Input** → Destination + Number of Days
2. **Weather Fetch** → OpenWeather API
3. **Flight Search** → Amadeus API (different origin/destination pairs)
4. **Attractions** → Wikipedia API (with HTML parsing)
5. **AI Planning** → OpenAI generates custom itinerary
6. **Response** → JSON with complete itinerary

### **Frontend Flow**

1. User enters destination and days
2. JavaScript sends POST request to `/get_itinerary`
3. Shows loading skeletons while fetching
4. Displays results as beautiful cards
5. Saves to localStorage automatically
6. Can export/print the itinerary

---

## 🎯 Features in Detail

### **Weather Integration**
- Current temperature, humidity, wind speed
- Weather description (sunny, cloudy, rainy, etc.)
- Used in itinerary planning (e.g., "pack an umbrella")

### **Flight Search**
- Origin: Delhi (DEL) by default, can be customized
- Destination: Major Indian cities (Mumbai, Bangalore, Kolkata, Dehradun)
- Date: Next day from current date
- Returns: Cheapest flight option with price and airline

### **Attractions Database**
- Fetches from Wikipedia automatically
- Extracts key sentences about tourist spots
- Fallback: Generic attraction list if Wikipedia fails
- Used to personalize itinerary

### **AI Itinerary**
- Custom 1-2 sentence plans for each day
- Incorporates weather, attractions, and flights
- Fallback text if OpenAI quota exceeded
- Temperature setting: 0.7 (creative but coherent)

### **Image Gallery**
- Pixabay integration for destination photos
- Responsive grid layout
- High-quality images with attribution

---

## 🐛 Troubleshooting

### **"No attractions found"**
- Wikipedia API might be rate-limited
- Check internet connection
- Try a different destination

### **"OpenAI quota exceeded"**
- Free trial credits have been used
- Add billing to OpenAI account, or
- Use fallback itinerary mode (already implemented)

### **"No flight data available"**
- Amadeus test credentials have limitations
- Ensure origin ≠ destination
- Check API credentials in `.env`

### **"Cannot find API key"**
- Verify `.env` file exists in project root
- Check variable names match exactly (case-sensitive)
- Restart Flask server after creating `.env`

### **Port 5000  in Use**

## 💡 Future Enhancements

- 🗺️ **Google Maps Integration** — Interactive map view of attractions
- 🔐 **User Authentication** — Save trips to cloud
- 💳 **Booking Integration** — Direct flight/hotel bookings
- 🌍 **Multi-language Support** — Generate itineraries in different languages
- 📊 **Trip Analytics** — Popular destinations, avg. trip cost, ratings
- 🤝 **Social Sharing** — Share itineraries with friends
- 🏨 **Hotel Integration** — Find and book accommodations
- 🚗 **Transportation Modes** — Train, bus, car rental options

---

## 📄 License

This project is open-source and available under the **MIT License**.

---

## 🙏 Acknowledgments

- **OpenWeather** — Weather data API
- **Google Maps** — Places and location data
- **Amadeus** — Flight search and booking
- **Wikipedia** — Tourism information
- **Pixabay** — Stock photography
- **OpenAI** — AI-powered itinerary generation
- **Flask Community** — Amazing framework
- **Community Contributors** — Bug fixes and improvements

---

**Happy Travels! 🌍✈️**