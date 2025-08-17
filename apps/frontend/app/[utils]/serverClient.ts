import axios from "axios";

const BASE_URL = process.env.SERVER_URL;
const user = localStorage.getItem("userId");
const token = localStorage.getItem("token");

export async function getUser(user: string): Promise<any> {
  try {
    if (!token) throw new Error("Unauthorized: No token provided");

    const response = await axios.get(`${BASE_URL}/auth/user/${user}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

export async function getUserTrades(): Promise<any> {
  try {
    if (!token) throw new Error("Unauthorized: No token provided");

    const response = await axios.get(`${BASE_URL}/auth/user/trades/${user}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching trades:", error);
    throw error;
  }
}

export async function getCoins(): Promise<any> {
  try {
    if (!token) throw new Error("Unauthorized: No token provided");

    const response = await axios.get(`${BASE_URL}/trade/portfolio`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    throw error;
  }
}

export async function getCurrentProfit(): Promise<any> {
  try {
    if (!token) throw new Error("Unauthorized: No token provided");

    const response = await axios.get(`${BASE_URL}/trade/current-profit`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching current profit:", error);
    throw error;
  }
}

export async function getMonthlyStats(): Promise<any> {
  try {
    if (!token) throw new Error("Unauthorized: No token provided");

    const response = await axios.get(`${BASE_URL}/trade/monthlystat`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching monthly stats:", error);
    throw error;
  }
}
