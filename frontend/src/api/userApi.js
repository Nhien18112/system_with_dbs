// Giả sử Backend của bạn chạy ở cổng 8080
const BASE_URL = "http://localhost:9001/api"; 

export const getUserProfile = async (bkNetId) => {
  try {
   
    const response = await fetch(`${BASE_URL}/users/${bkNetId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Không tìm thấy thông tin người dùng");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi gọi API user:", error);
    throw error;
  }
};