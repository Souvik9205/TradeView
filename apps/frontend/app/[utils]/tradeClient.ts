import axios from "axios";
import { ApiResponse, Buy, Sell } from "./types";

// const BASE_URL = "http://localhost:3121";
const BASE_URL = "https://server-v7fg.onrender.com";
const token = localStorage.getItem("token");

export async function TradeClient(data: Buy): Promise<ApiResponse<Buy>> {
  try {
    if (!token) throw new Error("Unauthorized: No token provided");

    const response = await axios.post(`${BASE_URL}/trade/buy`, data, {
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
export async function SellClient(data: Sell): Promise<ApiResponse<Sell>> {
  try {
    if (!token) throw new Error("Unauthorized: No token provided");

    const response = await axios.post(`${BASE_URL}/trade/sell`, data, {
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
