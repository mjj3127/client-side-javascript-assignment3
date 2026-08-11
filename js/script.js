"use strict";

// Add your NASA API key here
const apiKey = "gHLiZHlGfGYAkEDEtwQJt23B0XzeOHc1wpOIswjI";

// NASA Astronomy Picture of the Day API
const apiUrl = "https://api.nasa.gov/planetary/apod";

// Get the HTML elements
const studentInfo = document.querySelector("#student-info");
const dateInput = document.querySelector("#space-date");
const searchButton = document.querySelector("#search-button");
const randomButton = document.querySelector("#random-button");
const formError = document.querySelector("#form-error");

const loadingSection = document.querySelector("#loading");
const errorSection = document.querySelector("#error-message");
const errorText = document.querySelector("#error-text");
const resultSection = document.querySelector("#result");

const mediaContainer = document.querySelector("#media-container");
const resultDate = document.querySelector("#result-date");
const resultTitle = document.querySelector("#result-title");
const resultDescription = document.querySelector("#result-description");
const copyrightText = document.querySelector("#copyright");
const mediaBadge = document.querySelector("#media-badge");
const highQualityLink = document.querySelector("#high-quality-link");


studentInfo.textContent =
    "Mariya Josephine Jemy | Student ID: 200594567";

// Get today's date
const today = new Date().toISOString().split("T")[0];

// Set the date input
dateInput.value = today;
dateInput.max = today;
dateInput.min = "1995-06-16";

// Search for the selected date
searchButton.addEventListener("click", function () {
    const selectedDate = dateInput.value;

    formError.textContent = "";

    if (selectedDate === "") {
        formError.textContent = "Please choose a date.";
        return;
    }

    if (selectedDate > today) {
        formError.textContent =
            "NASA does not have pictures from the future.";
        return;
    }

    getSpaceData(
        `api_key=${apiKey}&date=${selectedDate}&thumbs=true`
    );
});

// Search using a random date
randomButton.addEventListener("click", function () {
    formError.textContent = "";

    const randomDate = getRandomDate();

    // Show the random date inside the date input
    dateInput.value = randomDate;

    getSpaceData(
        `api_key=${apiKey}&date=${randomDate}&thumbs=true`
    );
});

// Generate a random date between June 16, 1995 and today
function getRandomDate() {
    const firstApodDate = new Date("1995-06-16T00:00:00");
    const currentDate = new Date(`${today}T00:00:00`);

    const randomTime =
        firstApodDate.getTime() +
        Math.random() *
        (currentDate.getTime() - firstApodDate.getTime());

    const randomDate = new Date(randomTime);

    return randomDate.toISOString().split("T")[0];
}

// Request information from NASA
async function getSpaceData(queryString) {
    showLoading();

    try {
        const response = await fetch(`${apiUrl}?${queryString}`);

        if (!response.ok) {
            throw new Error(
                `NASA returned an error with status ${response.status}.`
            );
        }

        let data = await response.json();

        // This also supports array responses
        if (Array.isArray(data)) {
            data = data[0];
        }

        if (!data || !data.title) {
            throw new Error(
                "NASA did not return valid astronomy data."
            );
        }

        displaySpaceData(data);
    } catch (error) {
        showError(error.message);
        console.error("NASA API error:", error);
    } finally {
        setButtonsDisabled(false);
        loadingSection.hidden = true;
    }
}

// Display NASA's result on the page
function displaySpaceData(data) {
    // Remove the previous image or video
    mediaContainer.replaceChildren();

    resultDate.textContent = formatDate(data.date);
    resultTitle.textContent = data.title;
    resultDescription.textContent = data.explanation;
    mediaBadge.textContent = data.media_type;

    // Show the image credit when available
    if (data.copyright) {
        copyrightText.textContent =
            `Image credit: ${data.copyright}`;
    } else {
        copyrightText.textContent = "Image credit: NASA";
    }

    // Display an image
    if (data.media_type === "image") {
        const image = document.createElement("img");

        image.className = "space-image";
        image.src = data.url;
        image.alt = data.title;
        image.loading = "lazy";

        mediaContainer.appendChild(image);

        highQualityLink.href = data.hdurl || data.url;
        highQualityLink.textContent =
            "View high-resolution image ↗";
        highQualityLink.hidden = false;
    }

    // Display a video
    else if (data.media_type === "video") {
        const video = document.createElement("iframe");

        video.className = "space-video";
        video.src = data.url;
        video.title = data.title;
        video.allow =
            "accelerometer; autoplay; clipboard-write; " +
            "encrypted-media; gyroscope; picture-in-picture";
        video.allowFullscreen = true;

        mediaContainer.appendChild(video);

        highQualityLink.href = data.url;
        highQualityLink.textContent =
            "Open original video ↗";
        highQualityLink.hidden = false;
    }

    // Handle an unsupported media type
    else {
        const message = document.createElement("p");

        message.textContent =
            "This media type cannot be displayed.";

        mediaContainer.appendChild(message);
        highQualityLink.hidden = true;
    }

    // Reveal the result
    errorSection.hidden = true;
    resultSection.hidden = false;

    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Show the loading message
function showLoading() {
    resultSection.hidden = true;
    errorSection.hidden = true;
    loadingSection.hidden = false;

    setButtonsDisabled(true);
}

// Show an error message
function showError(message) {
    resultSection.hidden = true;
    errorSection.hidden = false;

    if (apiKey === "PASTE_YOUR_NASA_API_KEY_HERE") {
        errorText.textContent =
            "Please add your NASA API key inside js/script.js.";
    } else if (message.includes("503")) {
        errorText.textContent =
            "NASA's server is temporarily unavailable. " +
            "Please try again.";
    } else if (message.includes("403")) {
        errorText.textContent =
            "The NASA API key was rejected. Please check your key.";
    } else if (message.includes("429")) {
        errorText.textContent =
            "The API request limit has been reached. " +
            "Please wait and try again.";
    } else {
        errorText.textContent = message;
    }
}

// Disable or enable the buttons
function setButtonsDisabled(isDisabled) {
    searchButton.disabled = isDisabled;
    randomButton.disabled = isDisabled;
}

// Format a date for display
function formatDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-CA", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

// Load today's NASA content when the page opens
getSpaceData(
    `api_key=${apiKey}&date=${today}&thumbs=true`
);