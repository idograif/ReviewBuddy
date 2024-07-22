console.log("Content script loaded - Log ID: 001");
let isMinimized = true;

function getPlaceName() {
  const titleElement = document.querySelector('[data-attrid="title"]');
  if (titleElement) {
    const placeName = titleElement.innerText;
    console.log(`Place name found: ${placeName} - Log ID: 002`);
    return placeName;
  } else {
    console.log("Place name not found - Log ID: 003");
    return null;
  }
}

function getPlaceAddress() {
  const addressElement = document.querySelector(
    '[data-local-attribute="d3adr"]'
  );
  if (addressElement && addressElement.children.length > 1) {
    const address = addressElement.children[1].innerText;
    console.log(`Address found: ${address} - Log ID: 007`);
    return address;
  } else {
    console.log("Address not found or insufficient children - Log ID: 008");
    return null;
  }
}

function fetchReviewModelScore(placeName, placeCity) {
  const apiUrl = chrome.runtime.getURL("review_model_score.json"); // THIS IS A STUB

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      displayReviewModelScore(data.review_model_score);
      console.log("Review model score fetched and displayed - Log ID: 017");
    })
    .catch((err) => {
      console.error("Failed to fetch review model score - Log ID: 018", err);
    });
}

function displayReviewModelScore(score) {
  const reviewModelScoreContainer = document.getElementById("reviewModelScore");
  reviewModelScoreContainer.innerHTML = `<div><strong>Text Rating:</strong> ${score}</div>`;
}

function injectHTML() {
  fetch(chrome.runtime.getURL("popup.html"))
    .then((response) => response.text())
    .then((data) => {
      const container = document.createElement("div");
      container.innerHTML = data;
      const parentDiv = document.getElementById("lu_pinned_rhs");
      if (parentDiv) {
        parentDiv.appendChild(container);
        console.log("HTML injected - Log ID: 011");
        initializePopup();
      } else {
        console.log("Parent div not found - Log ID: 012");
      }
    })
    .catch((err) => {
      console.error("Failed to fetch HTML - Log ID: 013", err);
    });
}

function initializePopup() {
  const placeName = getPlaceName();
  const placeAddress = getPlaceAddress();

  if (placeName) {
    document.getElementById("placeName").innerText = placeName;
    console.log(`Place name displayed: ${placeName} - Log ID: 005`);
  } else {
    document.getElementById("placeName").innerText = "Place name not found.";
    console.log("Failed to display place name - Log ID: 006");
  }

  if (placeAddress) {
    document.getElementById("placeAddress").innerText = placeAddress;
    console.log(`Address displayed: ${placeAddress} - Log ID: 009`);
    const placeCity = placeAddress.split(",")[1].trim();
    fetchReviewModelScore(placeName, placeCity);
  } else {
    document.getElementById("placeAddress").innerText = "Address not found.";
    console.log("Failed to display address - Log ID: 010");
  }

  document
    .getElementById("reviewBuddyMinimizeButton")
    .addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent the click event from bubbling up to the parent div
      document.getElementById("reviewBuddyContent").style.display = "none";
      document.getElementById("reviewBuddyMinimizeButton").style.display =
        "none";
      isMinimized = true;
      console.log("Minimized - Log ID: 015");
    });

  document
    .getElementById("reviewBuddyContainer")
    .addEventListener("click", () => {
      if (isMinimized) {
        document.getElementById("reviewBuddyContent").style.display = "block";
        document.getElementById("reviewBuddyMinimizeButton").style.display =
          "block";
        isMinimized = false;
        console.log("Maximized - Log ID: 016");
      }
    });
}

function waitForElements() {
  const observer = new MutationObserver((mutations, obs) => {
    const titleElement = document.querySelector('[data-attrid="title"]');
    const addressElement = document.querySelector(
      '[data-local-attribute="d3adr"]'
    );
    if (titleElement && addressElement && addressElement.children.length > 1) {
      console.log("Required elements found - Log ID: 014");
      injectHTML();
      obs.disconnect();
    }
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
  });
}

waitForElements();
