import { fetchWithToken } from "./common.js";
import {
  profile_url,
} from "./config.js";


// const user_id = localStorage.getItem("user_id");


// Display Profile Infomation
async function CustomerProfile() {
  const cat = localStorage.getItem("myCat");

  try {
    const response = await fetch(profile_url + /*user_id*/2)
    console.log(response)
    const data = await response.json()
    //   document.getElementById('avatarPreview').src = response[0].avatar;
    document.getElementById('name').value = data.firstname;
    document.getElementById('email').value = data.email;
    document.getElementById('birthday').value = data.birth_date;
  } catch (error) {
    console.error("Error fetching customer profile:", error);
  }
}

async function saveProfile() {
  // const profileData = new FormData(document.getElementById('profileForm'));
  console.log("111111111111")
  const firstname = document.getElementById('name').value;
  const middlename = document.getElementById('name').value;
  const lastname = document.getElementById('name').value;
  const birth_date = document.getElementById('birthday').value;
  // const avatar = document.getElementById('avatarPreview').value;

  const userData = {
    firstname ,
    middlename,
    lastname,
    birth_date,
  }
  console.log(userData)

  return fetch(profile_url + 2, {
    // 返回 fetch 的 Promise
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
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
  // console.log("--------")
  // const response = fetch(profile_url + 2, {
  //   headers: {"Content-Type" : "application/json"},
  //   method: 'PUT',
  //   body: JSON.stringify(userData)
  // })
  // const data =  response.json();
  // console.log(data)
  // .then(response => response.json())
    // .then(data => alert('Profile updated successfully!'))
    // .catch(error => console.error('Error updating profile:', error));
}


// document.getElementById("save_btn").onclick = saveProfile;
document.getElementById("save_btn").addEventListener("click", saveProfile)
document.addEventListener("DOMContentLoaded", CustomerProfile);