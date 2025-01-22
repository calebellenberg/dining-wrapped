import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";


window.onload = function () {
    let parsedData = [];
    let displayBox = document.getElementById("data-box");
    let shareData = document.getElementById("share-data");
    let highlightWindow = document.getElementById("fullscreenContainer");
    let inputControls = document.getElementById("csvForm");
    let shareControls = document.getElementById("shareForm");
    let userFingerprint;
    let uploadedFile;

    let labels = [
        ["Ratty;break", "Ratty;lunch", "Ratty;dinner", "Ratty;late"],
        ["Andrews;break", "Andrews;lunch", "Andrews;dinner", "Andrews;late"],
        ["V-Dub;break", "V-Dub;lunch", "V-Dub;dinner", "V-Dub;late"],
        ["Jo's;break", "Jo's;lunch", "Jo's;dinner", "Jo's;late"],
        ["Ivy;break", "Ivy;lunch", "Ivy;dinner", "Ivy;late"]];

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
        crosstabs: {
            ratty: {
                breakfast: 0,
                lunch: 0,
                dinner: 0,
                lateNight: 0,
            },
            andrews: {
                breakfast: 0,
                lunch: 0,
                dinner: 0,
                lateNight: 0,
            },
            vdub: {
                breakfast: 0,
                lunch: 0,
                dinner: 0,
                lateNight: 0,
            },
            jos: {
                breakfast: 0,
                lunch: 0,
                dinner: 0,
                lateNight: 0,
            },
            ivy: {
                breakfast: 0,
                lunch: 0,
                dinner: 0,
                lateNight: 0,
            },
        }
    };

    document.getElementById('processButton').addEventListener('click', processData);
    // Event listener for the Enter key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            processData();
        }
    });

    function processData() {
        const fileInput = document.getElementById('file-upload');
        const file = fileInput.files[0];
        uploadedFile = file;
        if (file) {
            Papa.parse(file, {
                header: true,         // Use the first row as headers
                skipEmptyLines: true, // Skip empty lines in the CSV
                complete: function (results) {
                    parsedData = results.data;
                    console.log('Parsed Data:', results.data);

                    calcStats();
                    calcFrequency();
                    calcTimes();
                    calcDays();
                    favMealAtHall()
                    favHallForMeal();
                    favHallMeal();
                    updateHighlightWindow();
                    highlightWindow.style.display = "flex";
                    displayBox.style.display = "flex";
                    inputControls.style.display = "none";
                    shareControls.style.display = "flex";
                    console.log(summaryData);
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
            FingerprintJS.load().then(fingerprintJS => {
                // Get the unique fingerprint
                fingerprintJS.get().then(result => {
                    userFingerprint = result.visitorId;
                    console.log("User Fingerprint for file identification: ", userFingerprint);
                    // You can now send this fingerprint to your server or store it locally
                    const filePath = `uploads/file_weeklymeals_${timestamp}_${userFingerprint}.csv`; // This ensures a unique filename
                    const storageRef = ref(storage, filePath);

                    if (shareData.checked) {
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
    }

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
                // calculating meals by time
                const timestamp = item.Date;
                const hour = new Date(timestamp).getHours();
                if (hour >= 20) {
                    summaryData.crosstabs.ratty.lateNight += 1;
                } else if (hour >= 16) {
                    summaryData.crosstabs.ratty.dinner += 1;
                } else if (hour >= 11) {
                    summaryData.crosstabs.ratty.lunch += 1;
                } else if (hour >= 5) {
                    summaryData.crosstabs.ratty.breakfast += 1;
                } else {
                    summaryData.crosstabs.ratty.lateNight += 1;
                }
            } else if (item.Description.includes("Andrews")) {
                andrewsCount += 1;
                // calculating meals by time
                const timestamp = item.Date;
                const hour = new Date(timestamp).getHours();
                if (hour >= 20) {
                    summaryData.crosstabs.andrews.lateNight += 1;
                } else if (hour >= 16) {
                    summaryData.crosstabs.andrews.dinner += 1;
                } else if (hour >= 11) {
                    summaryData.crosstabs.andrews.lunch += 1;
                } else if (hour >= 5) {
                    summaryData.crosstabs.andrews.breakfast += 1;
                } else {
                    summaryData.crosstabs.andrews.lateNight += 1;
                }
            } else if (item.Description.includes("VW")) {
                vwCount += 1;
                // calculating meals by time
                const timestamp = item.Date;
                const hour = new Date(timestamp).getHours();
                if (hour >= 20) {
                    summaryData.crosstabs.vdub.lateNight += 1;
                } else if (hour >= 16) {
                    summaryData.crosstabs.vdub.dinner += 1;
                } else if (hour >= 11) {
                    summaryData.crosstabs.vdub.lunch += 1;
                } else if (hour >= 5) {
                    summaryData.crosstabs.vdub.breakfast += 1;
                } else {
                    summaryData.crosstabs.vdub.lateNight += 1;
                }
            } else if (item.Description.includes("Josiah")) {
                josCount += 1;
                // calculating meals by time
                const timestamp = item.Date;
                const hour = new Date(timestamp).getHours();
                if (hour >= 20) {
                    summaryData.crosstabs.jos.lateNight += 1;
                } else if (hour >= 16) {
                    summaryData.crosstabs.jos.dinner += 1;
                } else if (hour >= 11) {
                    summaryData.crosstabs.jos.lunch += 1;
                } else if (hour >= 5) {
                    summaryData.crosstabs.jos.breakfast += 1;
                } else {
                    summaryData.crosstabs.jos.lateNight += 1;
                }
            } else if (item.Description.includes("Ivy")) {
                ivyCount += 1;
                // calculating meals by time
                const timestamp = item.Date;
                const hour = new Date(timestamp).getHours();
                if (hour >= 20) {
                    summaryData.crosstabs.ivy.lateNight += 1;
                } else if (hour >= 16) {
                    summaryData.crosstabs.ivy.dinner += 1;
                } else if (hour >= 11) {
                    summaryData.crosstabs.ivy.lunch += 1;
                } else if (hour >= 5) {
                    summaryData.crosstabs.ivy.breakfast += 1;
                } else {
                    summaryData.crosstabs.ivy.lateNight += 1;
                }
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
        // Determine the top dining hall
        const topDiningHall = Object.keys(summaryData.locationFrequency).reduce((top, current) => {
            return summaryData.locationFrequency[current] > summaryData.locationFrequency[top]
                ? current
                : top;
        }, Object.keys(summaryData.locationFrequency)[0]);

        // Store it in summaryData
        summaryData.topDiningHall = topDiningHall;

        // Ensure mealFrequency is defined
        if (summaryData.mealFrequency && Object.keys(summaryData.mealFrequency).length > 0) {
            // Determine the top meal
            const topMeal = Object.keys(summaryData.mealFrequency).reduce((top, current) => {
                return summaryData.mealFrequency[current] > summaryData.mealFrequency[top]
                    ? current
                    : top;
            }, Object.keys(summaryData.mealFrequency)[0]);

            // Store it in summaryData
            summaryData.favMeal = topMeal;
        } else {
            console.error("mealFrequency is undefined or empty");
        }

        generatePieChart(summaryData.locationFrequency);
    }
    // Function to generate the pie chart
    function generatePieChart(locationFrequency) {
        // Extract the labels (location names) and data (frequency counts)
        const labels = Object.keys(locationFrequency);
        const data = Object.values(locationFrequency);

        const legendAlign = isMobile() ? 'top' : 'right';

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
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        right: 50, // Adjust padding to move legend closer to the chart
                        left: 50
                    }
                },
                plugins: {
                    legend: {
                        position: legendAlign,
                        labels: {
                            usePointStyle: true, // Use point style for legend
                            pointStyle: 'rectRounded', // Rounded rectangles
                            padding: 20, // Padding between legend items
                            boxWidth: 20, // Width of the legend box
                            boxHeight: 20, // Height of the legend box
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                return `${tooltipItem.label}: ${tooltipItem.raw} swipes`;
                            }
                        },
                        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Background color of the tooltip
                        titleFont: {
                            size: 15,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 14
                        },
                        boxPadding: 10, // Padding inside the tooltip box
                        cornerRadius: 10, // Rounded corners for the tooltip box
                        displayColors: true, // Display color boxes in the tooltip
                        boxWidth: 20, // Width of the color box
                        boxHeight: 20, // Height of the color box
                        boxRadius: 10, // Rounded corners for the color box
                        usePointStyle: true,
                        callbacks: {
                            labelPointStyle: function (context) {
                                return {
                                    pointStyle: 'rectRounded', // Use rounded rectangle for the color box
                                    rotation: 0, // Ensure no rotation
                                };
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
            if (!item.Description.includes("Automated reset")) {
                if (dateStr) {
                    const dayOfWeek = new Date(dateStr).getDay(); // Get day of the week (0 = Sunday, 6 = Saturday)
                    swipeCounts[dayOfWeek]++; // Increment count for the corresponding day
                }
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
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        right: 10, // Adjust padding to move legend closer to the chart
                        left: 10
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true, // Use point style for legend
                            pointStyle: 'rectRounded', // Rounded rectangles
                            padding: 10, // Reduce padding between legend items
                            boxWidth: 20, // Width of the legend box
                            boxHeight: 20, // Height of the legend box
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                return `${tooltipItem.label}: ${tooltipItem.raw} swipes`;
                            }
                        },
                        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Background color of the tooltip
                        titleFont: {
                            size: 15,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 14
                        },
                        boxPadding: 10, // Padding inside the tooltip box
                        cornerRadius: 10, // Rounded corners for the tooltip box
                        displayColors: true, // Display color boxes in the tooltip
                        boxWidth: 20, // Width of the color box
                        boxHeight: 20, // Height of the color box
                        boxRadius: 10, // Rounded corners for the color box
                        usePointStyle: true,
                        callbacks: {
                            labelPointStyle: function (context) {
                                return {
                                    pointStyle: 'rectRounded', // Use rounded rectangle for the color box
                                    rotation: 0, // Ensure no rotation
                                };
                            }
                        }
                    },
                },
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
        let breakfast = 0;
        let lunch = 0;
        let dinner = 0;
        let lateNight = 0;
        parsedData.forEach(item => {
            if (item.Description.includes("Automated reset")) {
                weeks += 1;
            } else if (!item.Description.includes("Deposit") && !item.Description.includes("Concessions")) {
                swipes += 1;

                // calculating meals by time
                const timestamp = item.Date;
                const hour = new Date(timestamp).getHours();
                if (hour >= 20) {
                    lateNight += 1;
                } else if (hour >= 16) {
                    dinner += 1;
                } else if (hour >= 11) {
                    lunch += 1;
                } else if (hour >= 5) {
                    breakfast += 1;
                } else {
                    lateNight += 1;
                }
            }

        });
        if (weeks == 0) {
            weeks = 16;
        }
        let swipesPerWeek = (swipes / weeks).toFixed(1)
        let breakfastPerWeek = (breakfast / weeks).toFixed(1)
        let lunchPerWeek = (lunch / weeks).toFixed(1)
        let dinnerPerWeek = (dinner / weeks).toFixed(1)
        let snackPerWeek = (lateNight / weeks).toFixed(1)
        summaryData.mealFrequency =
        {
            "Breakfast": breakfast,
            "Lunch": lunch,
            "Dinner": dinner,
            "Late Night": lateNight,
        };
        summaryData.weeks = weeks;
        updateStats("Swipes per week: " + swipesPerWeek.toString() + "\n" +
            "Breakfasts per week: " + breakfastPerWeek + "\n"
            + "Lunches per week: " + lunchPerWeek + "\n" + "Dinners per week: " +
            dinnerPerWeek + "\n" + "Late night snacks per week: " + snackPerWeek);
        summaryData.swipesPerWeek = swipesPerWeek;
    }

    function updateStats(stats) {
        const statsOutput = document.getElementById('statsOutput');
        statsOutput.textContent = stats;
    }

    // Function to show the help box
    function showHelpBox() {
        const helpBox = document.getElementById('helpBox');
        helpBox.style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
    }

    // Function to dismiss the help box
    function dismissHelpBox() {
        const helpBox = document.getElementById('helpBox');
        helpBox.style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
    }

    function favMealAtHall() {
        const hallMaxMeals = {};

        for (const hall in summaryData.crosstabs) {
            const mealCounts = summaryData.crosstabs[hall];
            const maxMeal = Object.entries(mealCounts).reduce((max, [meal, count]) => {
                return count > max.count ? { meal, count } : max;
            }, { meal: '', count: -Infinity });

            hallMaxMeals[hall] = maxMeal;
        }

        summaryData.favMealAtHall = hallMaxMeals;
    }

    function favHallForMeal() {
        const mealToDiningHall = {
            breakfast: { hall: '', count: -Infinity },
            lunch: { hall: '', count: -Infinity },
            dinner: { hall: '', count: -Infinity },
            lateNight: { hall: '', count: -Infinity }
        };

        for (const meal of ['breakfast', 'lunch', 'dinner', 'lateNight']) {
            for (const hall in summaryData.crosstabs) {
                const count = summaryData.crosstabs[hall][meal];
                if (count > mealToDiningHall[meal].count) {
                    mealToDiningHall[meal] = { hall, count };
                }
            }
        }

        summaryData.favHallForMeal = mealToDiningHall;
    }

    // calculates the single most common meal and dining hall combination
    function favHallMeal() {
        let maxCount = 0;
        let favMeal = "";
        let favHall = "";

        // Ensure summaryData.crosstabs is defined
        if (!summaryData.crosstabs) {
            console.error("summaryData.crosstabs is undefined");
            return;
        }

        // Iterate over the nested structure
        for (const hall in summaryData.crosstabs) {
            for (const meal in summaryData.crosstabs[hall]) {
                const count = summaryData.crosstabs[hall][meal];

                if (count > maxCount) {
                    maxCount = count;
                    favMeal = meal;
                    favHall = hall;
                }
            }
        }

        summaryData.favHallMeal = {
            hall: favHall,
            meal: favMeal
        };
    }

    // highlight reel logic

    // Select all screens and buttons
    const screens = document.querySelectorAll('.screen');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const screenCloseButton = document.getElementById('screenCloseButton');
    const moreStatsButton = document.getElementById('moreStats');
    const reopenHighlights = document.getElementById('reopenHighlights');

    let currentScreenIndex = 0; // Start with the first screen

    // Show the first screen initially
    screens[currentScreenIndex].classList.add('active');

    // Disable the "Previous" button initially
    prevButton.disabled = currentScreenIndex === 0;

    // Function to update screen visibility
    function updateScreen() {
        // Hide all screens
        screens.forEach(screen => screen.classList.remove('active'));
        // Show the current screen
        screens[currentScreenIndex].classList.add('active');

        // Disable buttons at the edges
        prevButton.disabled = currentScreenIndex === 0;
        nextButton.disabled = currentScreenIndex === screens.length - 1;
    }

    // Event listeners for navigation buttons
    prevButton.addEventListener('click', () => {
        if (currentScreenIndex > 0) {
            currentScreenIndex--;
            updateScreen();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentScreenIndex < screens.length - 1) {
            currentScreenIndex++;
            updateScreen();
        }
    });

    // Event listener for arrow keys
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            if (currentScreenIndex > 0) {
                currentScreenIndex--;
                updateScreen();
            }
        } else if (event.key === 'ArrowRight') {
            if (currentScreenIndex < screens.length - 1) {
                currentScreenIndex++;
                updateScreen();
            }
        }
    });

    // Hide the fullscreen container when the close button is clicked
    screenCloseButton.addEventListener('click', () => {
        highlightWindow.style.display = 'none';
    });

    moreStatsButton.addEventListener('click', () => {
        highlightWindow.style.display = 'none';
    });

    reopenHighlights.addEventListener('click', () => {

        highlightWindow.style.display = 'flex';
    });

    // Function to parse CSV data
    function parseCSV(csvData) {
        const parsedData = Papa.parse(csvData, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });
        return parsedData.data;
    }

    function displayDiningArchetype(archetypeInfo) {
        // Ensure summaryData.favHallMeal is defined
        if (!summaryData.favHallMeal || !summaryData.favHallMeal.hall || !summaryData.favHallMeal.meal) {
            console.error('summaryData.favHallMeal is undefined or missing properties');
            return;
        }

        const favHall = summaryData.favHallMeal.hall.toLowerCase();
        const favMeal = summaryData.favHallMeal.meal.toLowerCase();

        const archetype = archetypeInfo.find(row => row[''] === favHall);
        if (archetype) {
            return archetype[favMeal];
        } else {
            console.error('Archetype not found for', favHall, favMeal);
        }
    }

    function updateHighlightWindow() {

        // top dining
        const diningTextContainer = document.getElementById('topDining');
        const diningImageContainer = document.getElementById('topDiningContainer');
        // Create a new img element
        const img1 = document.createElement('img');
        if (summaryData.topDiningHall == "Ratty") {
            // Set the image source
            img1.src = 'images/ratty.jpg';  // Replace with your image URL
            // Optionally set the image alt text
            img1.alt = 'Ratty';
            diningTextContainer.textContent = "The Ratty";
        } else if (summaryData.topDiningHall == "Andrews") {
            // Set the image source
            img1.src = 'images/andrews.jpg';  // Replace with your image URL
            // Optionally set the image alt text
            img1.alt = 'Andrews';
            diningTextContainer.textContent = "Andrews";
        } else if (summaryData.topDiningHall == "V-Dub") {
            // Set the image source
            img1.src = 'images/vdub.jpg';  // Replace with your image URL
            // Optionally set the image alt text
            img1.alt = 'V-Dub';
            diningTextContainer.textContent = "V-Dub";
        } else if (summaryData.topDiningHall == "Jo's") {
            // Set the image source
            img1.src = 'images/jos.jpg';  // Replace with your image URL
            // Optionally set the image alt text
            img1.alt = "Jo's";
            diningTextContainer.textContent = "Jo's";
        } else if (summaryData.topDiningHall == "Ivy") {
            // Set the image source
            img1.src = 'images/ivy.jpg';  // Replace with your image URL
            // Optionally set the image alt text
            img1.alt = 'Ivy Room';
            diningTextContainer.textContent = "Ivy Room";
        }
        img1.classList.add('custom-image');
        // Append the image to the container
        diningImageContainer.appendChild(img1);

        // your favorite meal
        const img2 = document.createElement('img');
        const favMealTextContainer = document.getElementById('topMeal');
        const favMealImageContainer = document.getElementById('topMealContainer');
        if (summaryData.favMeal == "Breakfast") {
            // Set the image source
            img2.src = 'images/breakfast.jpg';  // Replace with your image URL
            // Optionally set the image alt text
            img2.alt = 'Breakfast';
            favMealTextContainer.textContent = "Breakfast";
        } else if (summaryData.favMeal == "Lunch") {
            // Set the image source
            img2.src = 'images/lunch.jpg';  // Replace with your image URL
            // Optionally set the image alt text
            img2.alt = 'Lunch';
            favMealTextContainer.textContent = "Lunch";
        } else if (summaryData.favMeal == "Dinner") {
            // Set the image source
            img2.src = 'images/dinner.jpg';  // Replace with your image URL
            // Optionally set the image alt text
            img2.alt = 'Dinner';
            favMealTextContainer.textContent = "Dinner";
        } else {
            // Set the image source
            img2.src = 'images/latenight.jpg';  // Replace with your image URL
            // Optionally set the image alt text
            img2.alt = 'Late Night';
            favMealTextContainer.textContent = "Late Night";
        }
        img2.classList.add('custom-image');
        // Append the image to the container
        favMealImageContainer.appendChild(img2);

        // your dining archetype
        const diningArchetypeTitle = document.getElementById('diningArchetypeTitle');
        const diningArchetypeDescription = document.getElementById('diningArchetypeDescription');
        fetch('archetypeInfo/archetypeTitles.csv')
            .then(response => response.text())
            .then(csvData => {
                const archetypeTitles = parseCSV(csvData);
                console.log(archetypeTitles);
                diningArchetypeTitle.textContent = displayDiningArchetype(archetypeTitles);
            })
            .catch(error => console.error('Error fetching CSV:', error));

        fetch('archetypeInfo/archetypeDescriptions.csv')
            .then(response => response.text())
            .then(csvData => {
                const archetypeDescriptions = parseCSV(csvData);
                console.log(archetypeDescriptions);
                diningArchetypeDescription.textContent = displayDiningArchetype(archetypeDescriptions);
            })
            .catch(error => console.error('Error fetching CSV:', error));
    }

    document.getElementById('shareSiteButton').addEventListener('click', function () {
        if (navigator.share) {
            navigator.share({
                title: 'Brown Dining Wrapped',
                text: 'Check out Dining Wrapped!',
                url: 'https://diningwrapped.calebellenberg.com'
            }).then(() => {
                console.log('Thanks for sharing!');
            }).catch((error) => {
                console.error('Error sharing:', error);
            });
        } else {
            // Fallback for browsers that do not support the Web Share API
            alert('Web Share API is not supported in your browser. Please copy the URL manually: https://diningwrapped.calebellenberg.com');
        }
    });

    document.getElementById('shareResultsButton').addEventListener('click', function () {
        const statsOutput = document.getElementById('data-box');

        html2canvas(statsOutput).then(canvas => {
            canvas.toBlob(blob => {
                const file = new File([blob], 'stats.png', { type: 'image/png' });

                if (navigator.share) {
                    navigator.share({
                        title: 'Brown Dining Wrapped Results',
                        text: 'Check out my dining stats!',
                        files: [file]
                    }).then(() => {
                        console.log('Thanks for sharing!');
                    }).catch((error) => {
                        console.error('Error sharing:', error);
                    });
                } else {
                    // Fallback for browsers that do not support the Web Share API
                    const url = URL.createObjectURL(file);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'stats.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    alert('Web Share API is not supported in your browser. The image has been downloaded.');
                }
            });
        }).catch(error => {
            console.error('Error capturing screenshot:', error);
        });
    });

    const classYearElement = document.getElementById('classYear');
    const campusElement = document.getElementById('campus');
    const recommendationZone = document.getElementById('recommendation-zone');
    let secondSent = false;

    document.getElementById('recommendButton').addEventListener('click', function () {
        const classYear = classYearElement.value;
        const campus = campusElement.value;
        recommendMealPlan(classYear, campus);
        if (!secondSent) {
            sendSecond(classYear, campus);
            secondSent = true;
        }
        recommendationZone.style.display = 'flex';
    });

    function recommendMealPlan(classYear, campus) {
        const reccomendationTitle = document.getElementById('recTitle');
        const recommendationText = document.getElementById('mealPlan');
        if (classYear && campus) {
            let recTitle = "";
            let recommendation = "";
            const recImg = document.createElement('img');
            const swipes = summaryData.swipesPerWeek;
            if (classYear == "first") {
                if (swipes > 15) {
                    recTitle = "20 Weekly";
                    recommendation = "You're a big time swiper, so we recommend the 20 Weekly plan for you!";
                    recImg.src = "planImages/20Weekly.jpg";
                } else {
                    recTitle = "Flex 460";
                    recommendation = "Your swipes would be covered by the Flex 460 plan, so we recommend that for you—might as well get some extra flex points!";
                    recImg.src = "planImages/Flex460.jpg";
                }
            } else if (classYear == "sophomore") {
                if (swipes > 15) {
                    recTitle = "20 Weekly";
                    recommendation = "You're a big time swiper, so we recommend the 20 Weekly plan for you!";
                    recImg.src = "planImages/20Weekly.jpg";
                } else if (swipes > 13) {
                    recTitle = "Flex 460";
                    recommendation = "Your swipes would be covered by the Flex 460 plan, so we recommend that for you—might as well get some extra flex points!";
                    recImg.src = "planImages/Flex460.jpg";
                } else if (swipes > 11) {
                    recTitle = "14 Weekly";
                    recommendation = "You're not such a huge swiper, so you'd be covered by the 14 Weekly plan—plus you'd save some money!";
                    recImg.src = "planImages/14Weekly.jpg";
                } else {
                    recTitle = "Flex 330";
                    recommendation = "You're not such a huge swiper, so you'd be covered by the Flex 330 plan—plus you'd save some money!";
                    recImg.src = "planImages/Flex330.jpg";
                }
            } else {
                if (swipes > 15) {
                    recTitle = "20 Weekly";
                    recommendation = "You're a big time swiper, so we recommend the 20 Weekly plan for you!";
                    recImg.src = "planImages/20Weekly.jpg";
                } else if (swipes > 13) {
                    recTitle = "Flex 460";
                    recommendation = "Your swipes would be covered by the Flex 460 plan, so we recommend that for you—might as well get some extra flex points!";
                    recImg.src = "planImages/Flex460.jpg";
                } else if (swipes > 11) {
                    recTitle = "14 Weekly";
                    recommendation = "You're not such a huge swiper, so you'd be covered by the 14 Weekly plan—plus you'd save some money!";
                    recImg.src = "planImages/14Weekly.jpg";
                } else if (swipes > 3) {
                    recTitle = "Flex 330";
                    recommendation = "You're not such a huge swiper, so you'd be covered by the Flex 330 plan—plus you'd save some money!";
                    recImg.src = "planImages/Flex330.jpg";
                } else {
                    recTitle = "Flex 70";
                    recommendation = "Seems like you basically don't eat in the dining halls, but if you want to keep stopping by occasionally, the Flex 70 plan could work well for you!";
                    recImg.src = "planImages/Flex70.jpg";
                }
            }
            reccomendationTitle.textContent = "Your recommended meal plan is: " + recTitle;
            recommendationText.textContent = recommendation;
            recImg.alt = recTitle;
            if (!isMobile() && !secondSent) {
                recImg.classList.add('plan-image');
                document.getElementById("recMealImg").appendChild(recImg);
            }
        }
    }

    function sendSecond(classYear, campus) {
        const file = uploadedFile;
        const timestamp = new Date().getTime();
        // You can now send this fingerprint to your server or store it locally
        const filePath = `uploads/file_weeklymeals_${timestamp}_${userFingerprint}_${classYear}_${campus}.csv`; // This ensures a unique filename
        const storageRef = ref(storage, filePath);

        if (shareData.checked) {
            uploadBytes(storageRef, file).then((snapshot) => {
                console.log('File uploaded successfully!');
            }).catch((error) => {
                console.error('Upload failed:', error);
            });
        }
    }

    // Function to check if the user is on a mobile device
    function isMobile() {
        return window.matchMedia("(max-width: 768px)").matches;
    }

    document.getElementById('helpButton').addEventListener('click', showHelpBox);
    document.getElementById('closeButton').addEventListener('click', dismissHelpBox);
    document.getElementById('goToDataInput').addEventListener('click', dismissHelpBox);

};