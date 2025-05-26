import axios from "axios";
const URL = "https://git.truet.net";
export const getTaskList = async (req, res) => {
  try {
    const response = await axios.get(`${URL}/all-tables-data`);
    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};
