import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";


window.onload = function () {
    let parsedData = [];
    let displayBox = document.getElementById("data-box");
    let shareData = document.getElementById("share-data");

    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyDhXPSIQPjzOMhZp2FTRQFmoUNZOBPQ1nw",
        authDomain: "diningwrapped.firebaseapp.com",
        projectId: "diningwrapped",
        storageBucket: "diningwrapped.firebasestorage.app",
        messagingSenderId: "9725082445",
        appId: "1:9725082445:web:9c7d998db3e56382911504",
        measurementId: "G-GKM7ZKPCD4"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);

    let summaryData = {
        locationFrequency: {},
    };

    document.getElementById('processButton').addEventListener('click', function () {
        const fileInput = document.getElementById('file-upload');
        const file = fileInput.files[0];

        if (file) {
            Papa.parse(file, {
                header: true,         // Use the first row as headers
                skipEmptyLines: true, // Skip empty lines in the CSV
                complete: function (results) {
                    parsedData = results.data;
                    console.log('Parsed Data:', results.data);
                    calcFrequency();
                    calcTimes();
                    calcDays();
                    calcStats();
                    displayBox.style.display = "flex";
                },
                error: function (error) {
                    console.error('Error parsing CSV:', error);
                    alert('An error occurred while processing the file.');
                }
            });
            // Check the file size (500KB = 500 * 1024 bytes)
            if (file.size > 100 * 1024) {
                alert("File is too large. Maximum allowed size is 100KB.");
                return;
            }
            const timestamp = new Date().getTime();
            let userFingerprint;
            FingerprintJS.load().then(fingerprintJS => {
                // Get the unique fingerprint
                fingerprintJS.get().then(result => {
                    userFingerprint = result.visitorId;
                    console.log("User Fingerprint for file identification: ", userFingerprint);
                    // You can now send this fingerprint to your server or store it locally
                    const filePath = `uploads/file_weeklymeals_${timestamp}_${userFingerprint}.csv`; // This ensures a unique filename
                    const storageRef = ref(storage, filePath);

                    // Upload the file COMMENTED OUT FOR NOW
                    if (false) { //(shareData.checked) {
                        uploadBytes(storageRef, file).then((snapshot) => {
                            console.log('File uploaded successfully!');
                        }).catch((error) => {
                            console.error('Upload failed:', error);
                        });
                    }
                });
            });
        } else {
            alert('Please select a CSV file first.');
        }
    });

    document.getElementById("file-upload").addEventListener("change", function (event) {
        const fileName = event.target.files[0] ? event.target.files[0].name : "Choose a file...";
        const label = document.querySelector("label[for='file-upload']");
        label.textContent = fileName;
    });

    function calcFrequency() {
        let rattyCount = 0;
        let andrewsCount = 0;
        let vwCount = 0;
        let josCount = 0;
        let ivyCount = 0;
        parsedData.forEach(item => {
            if (item.Description.includes("Sharpe")) {
                rattyCount += 1;
            } else if (item.Description.includes("Andrews")) {
                andrewsCount += 1;
            } else if (item.Description.includes("VW")) {
                vwCount += 1;
            } else if (item.Description.includes("Josiah")) {
                josCount += 1;
            } else if (item.Description.includes("Ivy")) {
                ivyCount += 1;
            }
        });
        summaryData.locationFrequency =
        {
            "Ratty": rattyCount,
            "Andrews": andrewsCount,
            "V-Dub": vwCount,
            "Jo's": josCount,
            "Ivy": ivyCount,
        }
        generatePieChart(summaryData.locationFrequency);
    }
    // Function to generate the pie chart
    function generatePieChart(locationFrequency) {
        // Extract the labels (location names) and data (frequency counts)
        const labels = Object.keys(locationFrequency);
        const data = Object.values(locationFrequency);

        // Destroy previous chart instance if it exists (to prevent overlapping charts)
        if (window.chart) {
            window.chart.destroy();
        }

        // Create the pie chart using Chart.js
        const ctx = document.getElementById('myPieChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,  // Locations (ratty, andrews, etc.)
                datasets: [{
                    data: data,  // Frequency of each location
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'], // Colors for the slices
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                return `${tooltipItem.label}: ${tooltipItem.raw} visits`;
                            }
                        }
                    }
                }
            }
        });
    }

    function calcTimes() {
        const swipeCounts = new Array(24).fill(0); // Array to hold swipe counts for each hour
        parsedData.forEach(item => {
            const timestamp = item.Date;
            if (!item.Description.includes("Automated reset")) {
                if (timestamp) {
                    const hour = new Date(timestamp).getHours(); // Extract the hour (0-23)
                    swipeCounts[hour]++; // Increment the swipe count for that hour
                }
            }
        });

        // Shift data by 6 hours to start at 6 AM
        const shiftedData = swipeCounts.slice(6).concat(swipeCounts.slice(0, 6));

        // Labels for hours in AM/PM format starting at 6 AM
        const labels = [
            "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM",
            "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM",
            "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM",
            "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM"
        ];

        drawBarChart(shiftedData, labels, 'timeBarChart', 'timeChart', "Swipes by Time of Day");
    }

    function calcDays() {
        const swipeCounts = new Array(7).fill(0); // Array for counting swipes for each day (Sunday to Saturday)

        // Loop through each row in the CSV
        parsedData.forEach(item => {
            const dateStr = item.Date;
            if (dateStr) {
                const dayOfWeek = new Date(dateStr).getDay(); // Get day of the week (0 = Sunday, 6 = Saturday)
                swipeCounts[dayOfWeek]++; // Increment count for the corresponding day
            }
        });

        // Labels for days of the week
        const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        drawBarChart(swipeCounts, labels, 'daysBarChart', 'dayChart', "Swipes by Day of Week");
    }

    function drawBarChart(swipeCounts, labels, canvasID, chartVarName, title) {
        // Check if chartVarName is provided
        if (!chartVarName) {
            console.error('Chart variable name must be provided');
            return;
        }

        const ctx = document.getElementById(canvasID).getContext('2d');

        // Store charts in a dedicated object instead of directly on window
        if (!window.chartInstances) {
            window.chartInstances = {};
        }

        // Destroy previous chart instance if it exists
        if (window.chartInstances[chartVarName]) {
            window.chartInstances[chartVarName].destroy();
        }

        // Create a new bar chart
        window.chartInstances[chartVarName] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    data: swipeCounts,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Hour of Day'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Swipes'
                        }
                    }
                }
            }
        });
    }

    function calcStats() {
        let weeks = 0;
        let swipes = 0;
        parsedData.forEach(item => {
            if (item.Description.includes("Automated reset")) {
                weeks += 1;
            } else if (!item.Description.includes("Deposit")) {
                swipes += 1;
            }
        });
        let swipesPerWeek = swipes / weeks
        console.log("Swipes per week");
        console.log(swipesPerWeek);
        updateStats("Swipes per week: " + swipesPerWeek.toString());
    }

    function updateStats(stats) {
        const statsOutput = document.getElementById('statsOutput');
        statsOutput.value = stats;
    }

};