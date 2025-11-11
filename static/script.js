document
  .getElementById("itinerary-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const destination = document.getElementById("destination").value;
    const days = document.getElementById("days").value;

    // Show loading, hide results
    document.getElementById("loading").style.display = "block";
    document.getElementById("results").innerHTML = "";

    try {
      const response = await fetch("/get_itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination: destination,
          days: parseInt(days),
        }),
      });

      const data = await response.json();

      // Hide loading
      document.getElementById("loading").style.display = "none";

      // Display results
      displayResults(data);
    } catch (error) {
      document.getElementById("loading").style.display = "none";
      document.getElementById("results").innerHTML =
        '<p style="color: red;">Error: Could not fetch itinerary. Please try again.</p>';
      console.error("Error:", error);
    }
  });

function displayResults(itinerary) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<h2>Your Itinerary</h2>";

  itinerary.forEach((day) => {
    const dayCard = document.createElement("div");
    dayCard.className = "day-card";

    dayCard.innerHTML = `
            <h2>Day ${day.day}</h2>
            <div class="info-item">
                <strong>🌤 Weather:</strong> ${day.weather}
            </div>
            <div class="info-item">
                <strong>✈️ Flights:</strong> ${day.flights}
            </div>
            <div class="info-item">
                <strong>📍 Attractions:</strong> ${day.attractions.join(", ")}
            </div>
            <div class="info-item">
                <strong>📝 Plan:</strong> ${day.plan}
            </div>
        `;

    resultsDiv.appendChild(dayCard);
  });
}
