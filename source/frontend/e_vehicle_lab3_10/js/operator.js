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
}

function initMap() {
  // Center the map (e.g., center of Glasgow)
  const centerCoordinates = { lat: 55.864237, lng: -4.251806 };

  // Create a new map instance
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: centerCoordinates,
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

    // Optional: Add an info window
    const infoWindow = new google.maps.InfoWindow({
      content: `<div>
                  <h6>${type_name}</h6>
                  <p>Battery Level: ${battery_level}%</p>
                  <p>Status: ${status_name}</p>
                </div>`,
    });

    // Show info window on marker click
    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
    markers.push(marker);
  });
}
// Function clearMarkers
function clearMarkers() {
  markers.forEach((marker) => marker.setMap(null));
  markers = [];
}

// Function to apply filters
function applyFilters() {
  console.log("Apply Filters button clicked"); // For debugging

  const selectedType = document.getElementById("filter-type").value;
  const selectedStatus = document.getElementById("filter-status").value;

  console.log("Selected Type:", selectedType); // For debugging
  console.log("Selected Status:", selectedStatus); // For debugging
  console.log(allVehicleData);
  // Filter the allVehicleData array
  filteredVehicleData = allVehicleData.filter((vehicle) => {
    const matchesType = selectedType
      ? vehicle.type_id.toString() === selectedType || selectedType === "0"
      : true;
    const matchesStatus = selectedStatus
      ? vehicle.status_id.toString() === selectedStatus ||
        selectedStatus === "0"
      : true;
    console.log(matchesType, matchesStatus);
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
  const battery_level = document.getElementById("battery-level").value;

  if (!type_id || !status_id || !current_location || !battery_level) {
    alert("Please fill in all required fields.");
    return;
  }

  // Prepare the data object to send to the backend
  const vehicleData = {
    type_id,
    status_id,
    current_location,
    battery_level,
  };
  console.log(vehicleData);

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

// Modify the loadVehicleData function to initialize filteredVehicleData
async function loadVehicleData() {
  try {
    const data = await fetchWithToken(vehicles_url);
    allVehicleData = data; // Store all data
    filteredVehicleData = data; // Initialize filtered data with all data
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
    locationCell.textContent = vehicle.current_location;

    // Create action cell
    const actionCell = document.createElement("td");

    if (vehicle.status_name === "damaged") {
      const repairBtn = document.createElement("button");
      repairBtn.className = "btn btn-outline-secondary btn-sm";
      repairBtn.textContent = "Repair";
      repairBtn.onclick = () => {
        window.location.href = "operator_repair.html";
      };
      actionCell.appendChild(repairBtn);
    }

    const chargeBtn = document.createElement("button");
    chargeBtn.className = "btn btn-outline-secondary btn-sm";
    chargeBtn.textContent = "Charge";
    chargeBtn.onclick = () => {
      window.location.href = "operator_charge.html";
    };

    const moveBtn = document.createElement("button");
    moveBtn.className = "btn btn-outline-secondary btn-sm";
    moveBtn.textContent = "Move";
    moveBtn.onclick = () => {
      window.location.href = "operator_move.html";
    };

    actionCell.appendChild(chargeBtn);
    actionCell.appendChild(moveBtn);

    // Append cells to the row
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
