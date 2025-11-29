const BASE_URL = "http://localhost:8080/api/student/scheduling";
export const getOfficialMeetings = async (studentId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/meetings/official?studentId=${studentId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Lỗi API: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch meetings:", error);
    throw error;
  }
};
