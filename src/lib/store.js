import axios from "axios";
// const URL = "https://git.truet.net";
const URL = "http://localhost:6619"
export const getTaskList = async (req, res) => {
  try {
    const response = await axios.get(`${URL}/get-all-data-timesheet`);
    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};
// Login Api
export const sendOTP = async (email) => {
  try {
    const res = await fetch(`${URL}/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    // const data = await res.json();
    return res;
  } catch (error) {
    return { error: error.message || "An unexpected error occurred" };
  }
};

// Login API - Verify OTP using fetch
export const verifyOTP = async (email, otp) => {
  try {
    const res = await fetch(`${URL}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return res;
  } catch (error) {
    return { error: error.message || "An unexpected error occurred during OTP verification" };
  }
};

export const getDataButton = async (payload) => {
  await fetch(`${URL}/sync-all-data`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

export const updateTimelogStatus = async (projectName, id, newStatus) => {
  console.log("dataa", projectName, id, newStatus)
  await fetch(`${URL}/time-log-update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project_name: projectName,
      comment_id: id,
      timelog_status: newStatus,
    }),
  });
};

export const getTodoList = async (req, res) => {
  try {
    const response = await axios.get(`${URL}/get-todo-list`);
    return response;
  } catch (error) {
    return error;
  }
};