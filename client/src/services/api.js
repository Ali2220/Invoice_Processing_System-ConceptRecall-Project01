import axios from "axios";

/**
 * API Service
 * Handles all HTTP requests to the backend
 */

const API_BASE_URL = "/api";

class ApiService {
  /**
   * Upload invoice PDF
   * @param {File} file - PDF file to upload
   * @returns {Promise<Object>} Response data
   */
  async uploadInvoice(file) {
    try {
      const formData = new FormData();
      formData.append("invoice", file);

      const response = await axios.post(
        `${API_BASE_URL}/invoice/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        },
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all invoices
   * @returns {Promise<Array>} List of invoices
   */
  async getAllInvoices() {
    try {
      const response = await axios.get(`${API_BASE_URL}/invoice`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get invoice by ID
   * @param {string} id - Invoice ID
   * @returns {Promise<Object>} Invoice details
   */
  async getInvoiceById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/invoice/${id}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Download invoices as CSV
   */
  async exportInvoices() {
    try {
      const response = await axios.get(`${API_BASE_URL}/invoice/export`, {
        responseType: "blob",
        withCredentials: true,
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "invoices.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Axios error object
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const message =
        error.response.data?.error ||
        error.response.data?.message ||
        "Server error";
      return new Error(message);
    } else if (error.request) {
      // Request made but no response
      return new Error(
        "No response from server. Please check if the backend is running.",
      );
    } else {
      // Something else happened
      return new Error(error.message || "An unexpected error occurred");
    }
  }
}

export default new ApiService();
