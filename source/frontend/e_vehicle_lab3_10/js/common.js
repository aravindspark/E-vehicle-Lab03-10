export async function fetchWithToken(url, options = {}) {
  // 从 localStorage 获取 token
  // const token = localStorage.getItem("authToken");

  // 设置默认 headers，如果 options 中已经有 headers 则合并
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // 如果 token 存在，添加 Authorization 头
  // if (token) {
  //   headers["Authorization"] = `Bearer ${token}`;
  // } else {
  //   console.warn("Token not found. Please ensure user is authenticated.");
  // }

  try {
    // Send the request using fetch and include headers
    const response = await fetch(url, {
      ...options,
      headers: headers,
    });

    let responseData;

    // Check if the response has JSON content
    const contentType = response.headers.get("Content-Type");
    // console.log(response);
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    // console.log(responseData);
    // If the response is not OK, throw an error with the response data
    if (!response.ok) {
      console.error("Error response data:", responseData);
      const error = new Error("Request failed with status " + response.status);
      error.response = response;
      error.responseData = responseData;
      throw error;
    }

    // Return the parsed response data
    return responseData;
  } catch (error) {
    console.error("Error:", error);

    // Handle and display the error message from the backend
    if (error.responseData) {
      alert("An error occurred: " + JSON.stringify(error.responseData));
    } else {
      alert("An error occurred: " + error.message);
    }

    throw error;
  }
}
