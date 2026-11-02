import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken"); // Replace with your token retrieval logic
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const addPatient = async (data: any) => {
  try {
    const response = await axios.post(`${baseUrl}/api/patients/add`, data, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error adding patient:", error);
    throw error;
  }
};

export const updatePatient = async (patientId: string, data: any) => {
  try {
    const response = await axios.put(`${baseUrl}/api/patients/update/${patientId}`, data, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error updating patient:", error);
    throw error;
  }
};

export const getPatientById = async (patientId: string) => {
  try {
    const response = await axios.get(`${baseUrl}/api/patients/${patientId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching patient data:", error);
    throw error;
  }
};

export const fetchPatients = async (
  pageNumber: number,
  pageSize: number,
  searchQuery: string = "",
  gender: string = ""
) => {
  try {
    const response = await axios.get(
      `${baseUrl}/api/patients?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${searchQuery}&gender=${gender}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching patients:", error);
    throw error;
  }
};

export const deletePatient = async (patientId: string) => {
  try {
    const response = await axios.delete(
      `${baseUrl}/api/patients/delete/${patientId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting patient:", error);
    throw error;
  }
};
