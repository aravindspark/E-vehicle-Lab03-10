// main.js
import { fetchWithToken } from "./common.js";
import {
  vehicle_status_url,
  vehicle_types_url,
  vehicles_url,
} from "./config.js";
// Global variables
let map;
let markers = [];
let allVehicleData = []; // Store all vehicle data
let currentPage = 1; // Current page number
let rowsPerPage = 5; // Number of rows per page
let filteredVehicleData = []; // Stores data after applying filters
let infoWindow = new google.maps.InfoWindow(); // only show one info window at a time
let lanlatInfoWindow = new google.maps.InfoWindow(); // only show one info window at a time
let statusIdMap = new Map(); // Map to store status ID and status name
let idStatusMap = new Map(); // Map to store status name and status ID
let idMarkerMap = new Map(); // Map to store vehicle ID and marker
// Initialization function
async function initConditions() {
  // Load vehicle types, statuses, and data
  await loadVehicleTypes();
  await loadVehicleStatus();
  await loadVehicleData();

  // Listen for changes in the rows-per-page selector
  document
    .getElementById("rows-per-page")
    .addEventListener("change", handleRowsPerPageChange);

  // Listen for the add vehicle form submission
  document
    .getElementById("add-vehicle-form")
    .addEventListener("submit", addVehicleListener);

  // Add event listener for the Apply Filters button**
  document
    .getElementById("apply-filters")
    .addEventListener("click", applyFilters);

  // AddVehicleModal button click
  document
    .getElementById("addVehicleBtn")
    .addEventListener("click", addVehicleModalListener);
}

function addVehicleModalListener() {
  document.getElementById("latitude-container").style.display = "none";
  document.getElementById("longitude-container").style.display = "none";
  document.getElementById("current-location-container").style.display = "block";
  document.getElementById("vehicle-latitude").value = "";
  document.getElementById("vehicle-longitude").value = "";
}

function initMap() {
  // Center the map (e.g., center of Glasgow)
  const centerCoordinates = { lat: 55.864237, lng: -4.251806 };

  // Create a new map instance
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: centerCoordinates,
  });
  // var infoWindow = new google.maps.InfoWindow();
  // var infoWindow = new google.maps.InfoWindow();
  map.addListener("rightclick", function (event) {
    var lat = event.latLng.lat();
    var lng = event.latLng.lng();
    var contentString =
      "<div>" +
      "<p>lat" +
      lat.toFixed(6) +
      "<br>lan" +
      lng.toFixed(6) +
      "</p>" +
      '<button id="selectLocationButton" data-bs-toggle="modal" data-bs-target="#addVehicleModal">add vehicle</button>' +
      "</div>";

    lanlatInfoWindow.setContent(contentString);
    lanlatInfoWindow.setPosition(event.latLng);
    lanlatInfoWindow.open(map);

    google.maps.event.addListenerOnce(
      lanlatInfoWindow,
      "domready",
      function () {
        document
          .getElementById("selectLocationButton")
          .addEventListener("click", function () {
            document.getElementById(
              "current-location-container"
            ).style.display = "none";

            document.getElementById("latitude-container").style.display =
              "block";
            document.getElementById("longitude-container").style.display =
              "block";

            document.getElementById("vehicle-latitude").value = lat.toFixed(6);
            document.getElementById("vehicle-longitude").value = lng.toFixed(6);
            document.getElementById("vehicle-location").value = "";

            // close InfoWindow
            lanlatInfoWindow.close();
          });
      }
    );
  });
  // Add markers for each vehicle
  showVehicleMarkers(filteredVehicleData);
}

function showVehicleMarkers(vehicleData) {
  clearMarkers();
  vehicleData.forEach((vehicle) => {
    // Extract latitude and longitude
    const {
      current_lat,
      current_lng,
      type_id,
      type_name,
      battery_level,
      status_name,
      id,
    } = vehicle;

    let emoji = "🌳";
    if (type_id == 1) emoji = "🛴";
    else if (type_id == 2) emoji = "🚲";
    // Create a marker
    const marker = new google.maps.Marker({
      position: { lat: current_lat, lng: current_lng },
      map: map,
      label: {
        text: emoji,
        fontSize: "24px",
      },
      title: `${type_name} - Battery: ${battery_level}% - Status: ${status_name}`,
    });
    idMarkerMap.set(vehicle.id, marker);
    // Add an event listener to the marker to open the info window
    marker.addListener("click", () => {
      infoWindow.setContent(` <div>
                                <h6>id: ${id}</h6>
                                <p>${type_name}</p>
                                <p>Battery Level: ${battery_level}%</p>
                                <p>Status: ${status_name}</p>
                                <button id="move-button">Move</button>
                              </div>`);
      infoWindow.open(map, marker);

      console.log(idMarkerMap);
      // Wait until the DOM is ready
      getInfoWindowWithMove(infoWindow, vehicle, marker);
    });

    markers.push(marker);
  });
}

function getInfoWindowWithMove(infowindow_new, vehicle, marker) {
  google.maps.event.addListenerOnce(infowindow_new, "domready", () => {
    // Add click event listener to the Move button
    document.getElementById("move-button").addEventListener("click", () => {
      // Ask the user for their preferred method
      const choice = confirm(
        "Click 'OK' to select a point on the map, or 'Cancel' to input location information."
      );
      if (choice) {
        // Allow the user to click on the map to select a new location
        alert("Click on the map to choose a new location.");
        const clickListener = map.addListener("click", (event) => {
          const newPosition = event.latLng;
          // Move the marker to the new position
          marker.setPosition(newPosition);
          map.panTo(newPosition);
          // Remove the click listener to prevent multiple selections
          google.maps.event.removeListener(clickListener);
          sendNewPositionToBackend(
            newPosition.lat(),
            newPosition.lng(),
            vehicle.id
          ).then((result) => {
            console.log("result", result); // true 或 false
            if (result) {
              marker.setPosition(newPosition);
              map.panTo(newPosition);
            }
          });
        });
      } else {
        // Allow the user to input location information
        const locationInput = prompt(
          "Enter coordinates (lat,lng) or an address:"
        );
        if (locationInput) {
          const coords = locationInput.split(",");
          if (coords.length === 2) {
            const lat = parseFloat(coords[0]);
            const lng = parseFloat(coords[1]);
            if (!isNaN(lat) && !isNaN(lng)) {
              const newPosition = new google.maps.LatLng(lat, lng);
              marker.setPosition(newPosition);
              map.panTo(newPosition);
              sendNewPositionToBackend(lat, lng, vehicle.id).then((result) => {
                console.log("result", result); // true 或 false
                if (result) {
                  marker.setPosition(newPosition);
                  map.panTo(newPosition);
                }
              });
              return;
            }
          }
          // Use Geocoding API to convert address to coordinates
          const geocoder = new google.maps.Geocoder();
          console.log("locationInput", locationInput);
          geocoder.geocode({ address: locationInput }, (results, status) => {
            if (status === "OK" && results[0]) {
              const newPosition = results[0].geometry.location;
              sendNewPositionToBackend(
                newPosition.lat(),
                newPosition.lng(),
                vehicle.id
              ).then((result) => {
                console.log("result", result); // true or false
                if (result) {
                  marker.setPosition(newPosition);
                  map.panTo(newPosition);
                }
              });
            } else {
              alert("Geocoding failed: " + status);
            }
          });
        } else {
          alert("No input provided.");
        }
      }
    });
  });
}
// Function to send new position to the backend
function sendNewPositionToBackend(lat, lng, vehicle_id) {
  const data = { current_lat: lat, current_lng: lng };
  console.log("move", data);
  return fetch(vehicles_url + "/" + vehicle_id, {
    // 返回 fetch 的 Promise
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        alert("Position updated successfully.");
        return true;
      } else {
        alert("Failed to update position.");
        return false;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error updating position.");
      return false;
    });
}
// Function clearMarkers
function clearMarkers() {
  markers.forEach((marker) => marker.setMap(null));
  markers = [];
}

// Function to apply filters
function applyFilters() {
  const selectedType = document.getElementById("filter-type").value;
  const selectedStatus = document.getElementById("filter-status").value;
  // Filter the allVehicleData array
  filteredVehicleData = allVehicleData.filter((vehicle) => {
    const matchesType = selectedType
      ? vehicle.type_id.toString() === selectedType || selectedType === "0"
      : true;
    const matchesStatus = selectedStatus
      ? vehicle.status_id.toString() === selectedStatus ||
        selectedStatus === "0"
      : true;
    return matchesType && matchesStatus;
  });

  console.log(allVehicleData); // For debugging
  // Reset current page and re-render table and pagination
  currentPage = 1;
  clearMarkers();
  showVehicleMarkers(filteredVehicleData);
  renderTable(currentPage);
  renderPagination();
}

// Handle changes in rows per page
function handleRowsPerPageChange() {
  rowsPerPage = parseInt(this.value, 10); // Get the selected number of rows per page
  currentPage = 1; // Reset to the first page
  renderTable(currentPage); // Re-render the table
  renderPagination(); // Re-render pagination
}

// Load vehicle types
async function loadVehicleTypes() {
  try {
    const vehicleTypes = await fetchWithToken(vehicle_types_url);
    const selectElement = document.getElementById("vehicle-type");
    selectElement.innerHTML = '<option value="">Select Vehicle Type</option>'; // Clear old options

    const filterTypeElement = document.getElementById("filter-type"); // For filtering

    vehicleTypes.forEach((vehicleType) => {
      // Add vehicle type options to the add vehicle form
      const option = document.createElement("option");
      option.value = `vehicleid-${vehicleType.id}`;
      option.textContent = vehicleType.type_name;
      selectElement.appendChild(option);

      // Add vehicle type options to the filter
      const filterOption = document.createElement("option");
      filterOption.value = vehicleType.id;
      filterOption.textContent = vehicleType.type_name;
      filterTypeElement.appendChild(filterOption);
    });
  } catch (error) {
    console.error("Error fetching vehicle types:", error);
  }
}

// Load vehicle statuses
async function loadVehicleStatus() {
  try {
    const statusOptions = await fetchWithToken(vehicle_status_url);
    // console.log(statusOptions);
    statusIdMap = statusOptions.reduce((acc, status) => {
      acc[status.status_name] = status.id;
      return acc;
    }, {});
    idStatusMap = statusOptions.reduce((acc, status) => {
      acc[status.id] = status.status_name;
      return acc;
    }, {});
    console.log(statusIdMap);
    console.log(idStatusMap);
    const container = document.getElementById("vehicle-status-container");
    container.innerHTML = ""; // Clear the container
    const filterStatusElement = document.getElementById("filter-status"); // For filtering

    statusOptions.forEach((status, index) => {
      // Create hidden radio input
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "vehicle-status";
      input.id = `status-${status.id}`;
      input.value = `status-${status.id}`;
      input.required = true;
      input.classList.add("btn-check"); // Use Bootstrap's btn-check style
      if (index === 0) input.checked = true; // Default to the first option

      // Create label styled as a button
      const label = document.createElement("label");
      const statusClassMap = {
        available: ["btn", "btn-outline-success", "me-2"],
        "in use": ["btn", "btn-outline-warning", "me-2"],
        damaged: ["btn", "btn-outline-danger", "me-2"],
        repairing: ["btn", "btn-outline-info", "me-2"],
      };
      const classes = statusClassMap[status.status_name] || [
        "btn",
        "btn-outline-secondary",
        "me-2",
      ];
      label.classList.add(...classes);
      label.htmlFor = input.id;
      label.textContent = status.status_name;

      // Append input and label to the container
      container.appendChild(input);
      container.appendChild(label);

      // Add status options to the filter
      const option = document.createElement("option");
      option.value = status.id;
      option.textContent = status.status_name;
      filterStatusElement.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching vehicle statuses:", error);
  }
}

// Event listener for adding a vehicle
async function addVehicleListener(event) {
  event.preventDefault(); // Prevent default form submission

  // Get values from the form fields
  const typeValue = document.getElementById("vehicle-type").value;
  const type_id = typeValue ? typeValue.split("-")[1] : null;
  const statusInput = document.querySelector(
    'input[name="vehicle-status"]:checked'
  );
  const status_id = statusInput ? statusInput.value.split("-")[1] : null;
  const current_location = document.getElementById("vehicle-location").value;
  const current_lat = document.getElementById("vehicle-latitude").value;
  const current_lng = document.getElementById("vehicle-longitude").value;
  const battery_level = document.getElementById("battery-level").value;
  const cost_per_hour = document.getElementById("vehicle-cost").value;

  if (!type_id || !status_id || !battery_level) {
    alert("Please fill in all required fields.");
    return;
  }

  // Prepare the data object to send to the backend
  const vehicleData = {
    type_id,
    status_id,
    current_location,
    battery_level,
    current_lat,
    current_lng,
    cost_per_hour,
  };
  console.log("add vehicle:", vehicleData);
  try {
    // Send the data to the backend
    await fetchWithToken(vehicles_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vehicleData),
    });

    alert("Vehicle added successfully!");
    document.getElementById("add-vehicle-form").reset();
    document.getElementById("battery-level-display").innerText = "100%"; // Reset battery display
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("addVehicleModal")
    );
    modal.hide();

    // Reload vehicle data
    await loadVehicleData();
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again later.");
  }
}

// Get the battery icon
function getBatteryIcon(batteryLevel) {
  if (batteryLevel >= 75) return "full";
  if (batteryLevel >= 50) return "three-quarters";
  if (batteryLevel >= 25) return "quarter";
  return "empty";
}
// Confirm repair
async function confirmRepair(vehicle_id) {
  try {
    const data = await fetchWithToken(`${vehicles_url}/${vehicle_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status_id: statusIdMap["repairing"] }),
    });
    alert("Vehicle repaired successfully!");
    await loadVehicleData();
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again later.");
  }
}
// Confirm finish repair
async function confirmFinishRepair(vehicle_id) {
  try {
    const data = await fetchWithToken(`${vehicles_url}/${vehicle_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status_id: statusIdMap["available"] }),
    });
    console.log(statusIdMap);
    console.log(idStatusMap);
    console.log("confirmFinishRepair", { status_id: idStatusMap["available"] });
    alert("Vehicle finished repairing successfully!");
    await loadVehicleData();
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again later.");
  }
}
// Confirm Charge
async function confirmCharge(vehicle_id) {
  try {
    const data = await fetchWithToken(`${vehicles_url}/${vehicle_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status_id: statusIdMap["charging"] }),
    });
    alert("Vehicle charged successfully!");
    await loadVehicleData();
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again later.");
  }
}
// Confirm finish charge
async function confirmFinishCharge(vehicle_id) {
  try {
    const chargeAmount = document.getElementById("chargeBattery").value;
    console.log("chargeAmount", chargeAmount);
    const data = await fetchWithToken(`${vehicles_url}/${vehicle_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status_id: statusIdMap["available"],
        battery_level: parseInt(chargeAmount, 10),
      }),
    });
    alert("Vehicle finished charging successfully!");
    await loadVehicleData();
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again later.");
  }
}
// Modify the loadVehicleData function to initialize filteredVehicleData
async function loadVehicleData() {
  try {
    const data = await fetchWithToken(vehicles_url);
    allVehicleData = [...data].reverse(); // Store all data
    filteredVehicleData = [...data].reverse(); // Initialize filtered data with all data
    initMap();
    renderTable(currentPage); // Render the table
    renderPagination(); // Render pagination buttons
  } catch (error) {
    console.error("Error loading vehicle data:", error);
  }
}

// Render the table for the current page
function renderTable(page) {
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = filteredVehicleData.slice(start, end);

  const tableBody = document.getElementById("vehicle-table-body");
  tableBody.innerHTML = ""; // Clear the table

  pageData.forEach((vehicle) => {
    const row = document.createElement("tr");

    // Create image cell
    const imgCell = document.createElement("td");
    const img = document.createElement("img");
    const typeId = parseInt(vehicle.type_id, 10);
    const imageSrcMap = {
      1: "./images/escooter.png",
      2: "./images/ebikes.png",
    };
    img.src = imageSrcMap[typeId] || "./images/default.png";
    img.alt = vehicle.type_name;
    img.className = "img-thumbnail";
    img.style.width = "100px";
    img.style.height = "100px";
    imgCell.appendChild(img);

    // Create id cell
    const idCell = document.createElement("td");
    idCell.innerHTML =
      '<span class="clickable-number" data-lat="' +
      vehicle.current_lat +
      '" data-lng="' +
      vehicle.current_lng +
      '">' +
      vehicle.id +
      "</span>";
    idCell
      .querySelector(".clickable-number")
      .addEventListener("click", function () {
        document.getElementById("map").scrollIntoView({ behavior: "smooth" });
        const lat = parseFloat(this.getAttribute("data-lat"));
        const lng = parseFloat(this.getAttribute("data-lng"));
        map.setCenter({ lat, lng });
        const markerInfo = idMarkerMap.get(vehicle.id);
        if (markerInfo) {
          infoWindow.setContent(` <div>
                          <h6>id: ${vehicle.id}</h6>
                          <p>${vehicle.type_name}</p>
                          <p>Battery Level: ${vehicle.battery_level}%</p>
                          <p>Status: ${vehicle.status_name}</p>
                          <button id="move-button">Move</button>
                        </div>`);
          infoWindow.open(map, markerInfo);
          getInfoWindowWithMove(infoWindow, vehicle, markerInfo);

          // markerInfo.infoWindow.open(map, markerInfo.marker);
          // map.panTo(markerInfo.marker.getPosition());
          map.setZoom(16);
        } else {
          console.error("No marker found for this location.", vehicle.id);
          console.log(idMarkerMap);
        }
      });

    // Create model cell
    const modelCell = document.createElement("td");
    modelCell.textContent = vehicle.type_name;

    // Create status cell
    const statusCell = document.createElement("td");
    const statusBadge = document.createElement("span");
    statusBadge.textContent = vehicle.status_name;
    const statusClassMap = {
      available: "btn-success",
      "in use": "btn-warning",
      damaged: "btn-danger",
      repairing: "btn-info",
    };
    statusBadge.classList.add(
      "btn",
      statusClassMap[vehicle.status_name] || "btn-secondary"
    );
    statusCell.appendChild(statusBadge);

    // Create battery cell
    const batteryCell = document.createElement("td");
    batteryCell.innerHTML = `<i class="fas fa-battery-${getBatteryIcon(
      vehicle.battery_level
    )}"></i> ${vehicle.battery_level}%`;

    // Create location cell
    const locationCell = document.createElement("td");
    locationCell.innerHTML = vehicle.current_location;

    // Create action cell
    const actionCell = document.createElement("td");

    // if status is damaged, add repair button
    if (vehicle.status_name === "damaged") {
      const repairBtn = document.createElement("button");
      repairBtn.className = "btn btn-outline-secondary btn-sm";
      repairBtn.textContent = "Repair";
      repairBtn.onclick = async () => {
        const repairModal = new bootstrap.Modal(
          document.getElementById("repairModal")
        );
        repairModal.show();
        document.getElementById("confirmRepairBtn").onclick = async () => {
          try {
            confirmRepair(vehicle.id);
            repairModal.hide();
          } catch (error) {
            console.error(error);
          }
        };
      };
      actionCell.appendChild(repairBtn);
    }
    // if status is repairing, add finish repair button
    if (vehicle.status_name === "repairing") {
      const finishRepairBtn = document.createElement("button");
      finishRepairBtn.className = "btn btn-outline-secondary btn-sm";
      finishRepairBtn.textContent = "Finish Repair";
      finishRepairBtn.onclick = () => {
        const finishRepairModal = new bootstrap.Modal(
          document.getElementById("finishRepairModal")
        );
        finishRepairModal.show();
        document.getElementById("confirmFinishRepairBtn").onclick = () => {
          try {
            confirmFinishRepair(vehicle.id);
            finishRepairModal.hide();
          } catch (error) {
            console.error(error);
          }
        };
      };
      actionCell.appendChild(finishRepairBtn);
    }
    // if status is charging, add finish charge button
    if (vehicle.status_name === "charging") {
      const finishChargeBtn = document.createElement("button");
      finishChargeBtn.className = "btn btn-outline-secondary btn-sm";
      finishChargeBtn.textContent = "Finish Charge";
      finishChargeBtn.onclick = () => {
        const finishChargeModal = new bootstrap.Modal(
          document.getElementById("finishChargeModal")
        );
        finishChargeModal.show();
        finishChargeModal.show();
        document.getElementById("confirmFinishChargeBtn").onclick = () => {
          try {
            confirmFinishCharge(vehicle.id);
            finishChargeModal.hide();
          } catch (error) {
            console.error(error);
          }
        };
      };
      actionCell.appendChild(finishChargeBtn);
    }

    const chargeBtn = document.createElement("button");
    chargeBtn.className = "btn btn-outline-secondary btn-sm";
    chargeBtn.textContent = "Charge";
    chargeBtn.onclick = () => {
      const chargeModal = new bootstrap.Modal(
        document.getElementById("chargeModal")
      );
      chargeModal.show();
      document.getElementById("confirmChargeBtn").onclick = () => {
        try {
          confirmCharge(vehicle.id);
          chargeModal.hide();
        } catch (error) {
          console.error(error);
        }
      };
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-outline-danger btn-sm";
    deleteBtn.textContent = "delete";
    deleteBtn.onclick = async () => {
      var deleteModal = new bootstrap.Modal(
        document.getElementById("deleteModal")
      );
      deleteModal.show();
      document.getElementById("confirmDeleteBtn").onclick = async () => {
        try {
          console.log("Deleting vehicle:", vehicle);
          const data = await fetchWithToken(vehicles_url + "/" + vehicle.id, {
            method: "DELETE",
          });
          // console.log("Deleted vehicle:", data);
          alert(data["message"]);
          await loadVehicleData();
          bootstrap.Modal.getInstance(
            document.getElementById("deleteModal")
          ).hide();

          // await loadVehicleData;
        } catch (error) {
          console.error("Error:", error);
          alert(error);
        }
      };
    };

    actionCell.appendChild(chargeBtn);
    actionCell.appendChild(deleteBtn);

    // Append cells to the row
    row.appendChild(idCell);
    row.appendChild(imgCell);
    row.appendChild(modelCell);
    row.appendChild(statusCell);
    row.appendChild(batteryCell);
    row.appendChild(locationCell);
    row.appendChild(actionCell);

    tableBody.appendChild(row); // Append the row to the table
  });
}

// Render pagination controls
function renderPagination() {
  const pageCount = Math.ceil(allVehicleData.length / rowsPerPage);
  const paginationControls = document.getElementById("pagination-controls");
  paginationControls.innerHTML = ""; // Clear pagination

  // Create "Previous" button
  const prevLi = document.createElement("li");
  prevLi.classList.add("page-item");
  if (currentPage === 1) {
    prevLi.classList.add("disabled");
  }
  const prevLink = document.createElement("a");
  prevLink.classList.add("page-link");
  prevLink.href = "#";
  prevLink.textContent = "Previous";
  prevLink.addEventListener("click", handlePrevPage);
  prevLi.appendChild(prevLink);
  paginationControls.appendChild(prevLi);

  // Create page number buttons
  for (let i = 1; i <= pageCount; i++) {
    const li = document.createElement("li");
    li.classList.add("page-item");
    if (i === currentPage) li.classList.add("active");
    const link = document.createElement("a");
    link.classList.add("page-link");
    link.href = "#";
    link.textContent = i;
    link.addEventListener("click", (e) => handlePageClick(e, i));
    li.appendChild(link);
    paginationControls.appendChild(li);
  }

  // Create "Next" button
  const nextLi = document.createElement("li");
  nextLi.classList.add("page-item");
  if (currentPage === pageCount || pageCount === 0) {
    nextLi.classList.add("disabled");
  }
  const nextLink = document.createElement("a");
  nextLink.classList.add("page-link");
  nextLink.href = "#";
  nextLink.textContent = "Next";
  nextLink.addEventListener("click", handleNextPage);
  nextLi.appendChild(nextLink);
  paginationControls.appendChild(nextLi);
}

// Handle "Previous" page click
function handlePrevPage(e) {
  e.preventDefault();
  if (currentPage > 1) {
    currentPage--;
    renderTable(currentPage);
    renderPagination();
  }
}

// Handle "Next" page click
function handleNextPage(e) {
  e.preventDefault();
  const pageCount = Math.ceil(allVehicleData.length / rowsPerPage);
  if (currentPage < pageCount) {
    currentPage++;
    renderTable(currentPage);
    renderPagination();
  }
}

// Handle page number click
function handlePageClick(e, pageNumber) {
  e.preventDefault();
  currentPage = pageNumber;
  renderTable(currentPage);
  renderPagination();
}

// Initialize after the page is fully loaded
document.addEventListener("DOMContentLoaded", initConditions);
