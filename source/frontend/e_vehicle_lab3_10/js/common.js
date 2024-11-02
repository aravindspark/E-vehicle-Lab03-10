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
    // 使用 fetch 发送请求，将 headers 添加到 options 中
    const response = await fetch(url, {
      ...options,
      headers: headers,
    });

    // 检查响应状态
    if (!response.ok) {
      alert("Response is not OK1");
      console.log("response", response);
      console.log("response", await response.json());
      console.log("response", await response.text());
      throw new Error("Response is not OK");
    }

    // 返回解析后的 JSON 数据
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again later1.");
    throw error;
  }
}
