from flask import Flask, request, jsonify, render_template
import requests
import html
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from dotenv import load_dotenv
from openai import OpenAI
import os

load_dotenv()

app = Flask(__name__)

# API KEYS
OPENWEATHER_KEY = os.getenv('OPENWEATHER_KEY')
GOOGLE_MAPS_KEY = os.getenv('GOOGLE_MAPS_KEY')
AMADEUS_CLIENT_ID = os.getenv('AMADEUS_CLIENT_ID')
AMADEUS_CLIENT_SECRET = os.getenv('AMADEUS_CLIENT_SECRET')
OPENAI_KEY = os.getenv('OPENAI_KEY')

client = OpenAI(api_key=OPENAI_KEY)

# ==============================
# WEATHER API
# ==============================
def get_weather(destination):
    print(f"\n🔹 FETCHING WEATHER FOR: {destination}")
    url = f"https://api.openweathermap.org/data/2.5/weather?q={destination}&appid={OPENWEATHER_KEY}&units=metric"
    print(f"  Weather API URL: {url[:80]}...")
    try:
        res = requests.get(url).json()
        print(f"  Weather response: {res.get('main')}")
        temp = res.get('main', {}).get('temp', "N/A")
        desc = res.get('weather', [{}])[0].get('description', "N/A")
        result = f"{temp}°C, {desc}"
        print(f"  ✅ Weather: {result}")
        return result
    except Exception as e:
        print(f"  ❌ Weather error: {e}")
        return "N/A"

# ==============================
# AMADEUS: GET TOKEN
# ==============================
def get_amadeus_token():
    print(f"\n🔹 AMADEUS TOKEN REQUEST")
    token_url = "https://test.api.amadeus.com/v1/security/oauth2/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "grant_type": "client_credentials",
        "client_id": AMADEUS_CLIENT_ID,
        "client_secret": AMADEUS_CLIENT_SECRET
    }
    try:
        res = requests.post(token_url, headers=headers, data=data).json()
        print(f"  Response: {res}")
        token = res.get("access_token")
        if token:
            print(f"  ✅ Token received")
            return token
        else:
            print(f"  ❌ No token in response")
            return None
    except Exception as e:
        print(f"  ❌ Token error: {e}")
        return None

# ==============================
# AMADEUS: FLIGHT SEARCH (FIXED)
# ==============================
def get_flight(destination):
    print(f"\n🔹 SEARCHING FLIGHTS FOR: {destination}")
    token = get_amadeus_token()
    if not token:
        print(f"  ❌ No token!")
        return "No flight data available"
    
    iata_mapping = {
        "Dehradun": "DED",
        "Delhi": "DEL",
        "Mumbai": "BOM",
        "Bangalore": "BLR",
        "Kolkata": "CCU"
    }
    
    dest_code = iata_mapping.get(destination, None)
    if not dest_code:
        print(f"  ❌ No IATA code for {destination}")
        return "No airport found for this city"
    
    # FIX: Don't request DEL->DEL. Pick different origin/destination
    if dest_code == "DEL":
        origin = "BOM"  # Mumbai to Delhi
    elif dest_code == "BOM":
        origin = "DEL"  # Delhi to Mumbai
    else:
        origin = "DEL"  # Default to Delhi for others
    
    departure_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

    flight_url = "https://test.api.amadeus.com/v2/shopping/flight-offers"
    params = {
        "originLocationCode": origin,
        "destinationLocationCode": dest_code,
        "adults": 1,
        "currencyCode": "INR",
        "departureDate": departure_date,
        "max": 1
    }
    
    print(f"  Requesting flights from {origin} to {dest_code}")
    try:
        res = requests.get(flight_url, headers={"Authorization": f"Bearer {token}"}, params=params).json()
        print(f"  Flight response: {res}")
        
        if "data" in res and len(res["data"]) > 0:
            price = res["data"][0]["price"]["total"]
            airline = res["data"][0]["validatingAirlineCodes"][0]
            result = f"Cheapest flight ~₹{price} via {airline}"
            print(f"  ✅ {result}")
            return result
        else:
            print(f"  ❌ No flights in response")
            return "No flight data available"
    except Exception as e:
        print(f"  ❌ Flight error: {e}")
        return "No flight data available"

# ==============================
# WIKIPEDIA: ATTRACTIONS (FIXED)
# ==============================
def get_places_wiki(city):
    print(f"\n🔹 WIKIPEDIA ATTRACTIONS FOR: {city}")
    
    # Try multiple search strategies
    search_titles = [
        f"Tourist attractions in {city}",
        f"{city} landmarks",
        f"Tourism in {city}",
        city  # Just the city name
    ]
    
    url = "https://en.wikipedia.org/w/api.php"
    headers = {"User-Agent": "MyTravelPlanner/1.0 (student project)"}

    for title in search_titles:
        print(f"  Trying: {title}")
        params = {
            "action": "query",
            "format": "json",
            "prop": "extracts|links",
            "titles": title,
            "exintro": True,
            "redirects": 1,
            "explaintext": True  # Get plain text instead of HTML
        }

        try:
            res = requests.get(url, params=params, headers=headers, timeout=5)
            res.raise_for_status()
            data = res.json()
            
            pages = data.get("query", {}).get("pages", {})
            for page in pages.values():
                if "missing" not in page:  # Article exists
                    text = page.get("extract", "")
                    if text and len(text) > 50:  # Has content
                        # Split by periods and get non-empty sentences
                        attractions = [
                            t.strip() 
                            for t in text.split('.') 
                            if len(t.strip()) > 15 and not t.strip().startswith('(')
                        ][:5]
                        
                        if attractions:
                            print(f"  ✅ Found attractions for '{title}'")
                            return attractions
        except Exception as e:
            print(f"  ⚠️ Error with '{title}': {e}")
            continue
    
    print(f"  ❌ No attractions found after trying all titles")
    return ["Museum", "Historical Site", "Local Market", "Park", "Temple"]  # Fallback generic list


# ==============================
# GOOGLE MAPS: PLACES
# ==============================
def get_places(destination):
    print(f"\n🔹 GOOGLE PLACES FOR: {destination}")
    url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query=tourist+attractions+in+{destination}&key={GOOGLE_MAPS_KEY}"
    print(f"  URL: {url[:80]}...")
    try:
        res = requests.get(url).json()
        print(f"  Status: {res.get('status')}")
        
        places = []
        for p in res.get("results", [])[:3]:
            places.append(p.get("name"))
        
        result = places if places else ["No attractions found"]
        print(f"  ✅ Places: {result}")
        return result
    except Exception as e:
        print(f"  ❌ Google Places error: {e}")
        return ["No attractions found"]

# ==============================
# OPENAI: ITINERARY (FIXED - NEW v1.0+ FORMAT)
# ==============================
def get_ai_plan(destination, day, weather, attractions):
    print(f"\n🔹 OPENAI PLAN FOR: {destination}, Day {day}")
    prompt = f"Create a brief 1-2 sentence itinerary for Day {day} in {destination}. Weather: {weather}. Attractions: {', '.join(attractions[:2])}."
    
    try:
        print(f"  Calling OpenAI...")
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=60,  # Reduced
            temperature=0.5
        )
        plan = response.choices[0].message.content.strip()
        print(f"  ✅ Plan: {plan[:50]}...")
        return plan
    except Exception as e:
        print(f"  ⚠️ OpenAI quota exceeded, using fallback")
        # Fallback when quota is exceeded
        return f"Day {day}: Explore {destination} in {weather} weather. Visit: {', '.join(attractions[:2])}"


# ==============================
# ROUTES
# ==============================
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_itinerary', methods=['POST'])
def get_itinerary():
    print("\n" + "="*50)
    print("REQUEST RECEIVED")
    print("="*50)
    
    data = request.json
    destination = data.get("destination", "").strip()
    days = int(data.get("days", 1))
    
    print(f"Destination: {destination}, Days: {days}")
    
    if not destination:
        return jsonify({"error": "Destination required"}), 400
    
    # Fetch data for each day
    weather_info = get_weather(destination)
    flight_info = get_flight(destination)
    attractions = get_places_wiki(destination)
    
    print(f"\n📋 SUMMARY FOR {destination}:")
    print(f"  Weather: {weather_info}")
    print(f"  Flights: {flight_info}")
    print(f"  Attractions: {attractions}")
    
    itinerary = []
    for i in range(1, days + 1):
        plan = get_ai_plan(destination, i, weather_info, attractions)
        itinerary.append({
            "day": i,
            "plan": plan,
            "weather": weather_info,
            "flights": flight_info,
            "attractions": attractions
        })
    
    print(f"\n✅ ITINERARY COMPLETE")
    return jsonify(itinerary)

if __name__ == "__main__":
    print("🚀 Starting Flask app...")
    app.run(debug=True, port=5000)
