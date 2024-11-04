import { fetchWithToken } from "./common.js";
import {
  profile_url,
} from "./config.js";


// const user_id = localStorage.getItem("user_id");


// Display Profile Infomation
async function DisplayCustomerProfile() {
  const cat = localStorage.getItem("myCat");

  try {
    const response = await fetch(profile_url + /*user_id*/2)
    console.log(response)
    const data = await response.json()
    //   document.getElementById('avatarPreview').src = response[0].avatar;
    document.getElementById('displayName').innerText = data.firstname;
    document.getElementById('displayEmail').innerText = data.email;
    document.getElementById('displayBirthday').innerText = data.birth_date;
  } catch (error) {
    console.error("Error fetching customer profile:", error);
  }
}

document.addEventListener("DOMContentLoaded", DisplayCustomerProfile);