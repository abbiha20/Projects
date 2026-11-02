"use client";

import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { SetStateAction, Suspense, useEffect, useState } from "react";
import { toast } from "react-toastify";

import AWS from 'aws-sdk';

function UpdateVehicle() {
  const { token, data } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isModalImageOpen, setIsModalImageOpen] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState(null);

  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [sellers, setSellers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSellers, setTotalSellers] = useState(0);
  const [totalBuyers, setTotalBuyers] = useState(0);

  // const [sellersPerPage] = useState(2);
  // const [sellersPerPage] = useState(5);
  const [buyersPerPage] = useState(5);

  // const handlePageChange = (page: string | number) => {
  const handlePageChange = (page: string | SetStateAction<number>) => {
    // console.log("handlePageChange:", page);
    if (page === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (page === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (typeof page === "number" && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    } else if (
      typeof page === "string" &&
      parseInt(page) >= 1 &&
      parseInt(page) <= totalPages
    ) {
      setCurrentPage(parseInt(page));
    }
  };

  // Get the current sellers to display based on the current page
  // const indexOfLastSeller = currentPage * sellersPerPage;
  // const indexOfFirstSeller = indexOfLastSeller - sellersPerPage;
  // const currentSellers = sellers.slice(indexOfFirstSeller, indexOfLastSeller);
  // const currentSellers = sellers;

  // Calculate total number of pages
  // const totalPages = Math.ceil(sellers.length / sellersPerPage);
  // const totalPages = Math.ceil(totalSellers / sellersPerPage);
  const totalPages = Math.ceil(totalBuyers / buyersPerPage);

  // const handleOpenSellModal = () => setIsSellModalOpen(true);
  const handleOpenSellModal = () => {
    setIsSellModalOpen(true);
    // fetchSellers();
  };

  const handleCloseSellModal = () => setIsSellModalOpen(false);

  const [currentDateTime, setCurrentDateTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        // weekday: "short",
        // day: "2-digit",
        // month: "short",
        // year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setCurrentDateTime(now.toLocaleString("en-US", options));

      const dateOptions: Intl.DateTimeFormatOptions  = {
        // weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      };
      setCurrentDate(now.toLocaleDateString("en-US", dateOptions));
    };


    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  // useEffect(() => {
  //   const updateDateTime = () => {
  //     const now = new Date();
  //     const options = {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //       second: "2-digit",
  //       hour12: true,
  //     };
  //     setCurrentDateTime(now.toLocaleString("en-US", options));
  //   };

  //   updateDateTime();
  //   const timer = setInterval(updateDateTime, 1000);

  //   return () => clearInterval(timer);
  // }, []);

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: 2022,
    VIN: "",
    engineNo: "",
    variant: "",
    retail: 0,
    regoSerialNo: "",
    rego: "",
    odometerIn: 0,
    badge: "",
    purchasePrice: 0,
    state: "",
    colour: "",
    bodyType: "",
    fuelType: "Petrol",
    wholesale: 0,
    vendor: "",
    supplierInvoice: "",
    location: "",
    compliance: "",
    manufacture: "",
    gears: 0,
    doors: 0,
    seats: 0,
    capacity: "",
    cylinders: 0,
    itcType: "Actual",
    stockNo: "",
    status: "",
    expiry: "",
    purchaseDate: "",
    NVIC: "",
    Redbook: "",
    transmissionType: "",
    kilometresAtSale: 0,
    dateOfSale: "",
    timeOfSale: "",
    images: [],

  });

  const [vehicleId, setVehicleId] = useState<string | null>(null);

  const [userId, setUserID] = useState(data?.id);

  useEffect(() => {
    setUserID(data?.id);
  }, [data]);
  
  useEffect(() => {
    // fetchSellers();
    const fetchSellers = async () => {
      console.log("s1")
      try {
        const searchTerm = '';


        const response = await axios.get(
          // `${process.env.NEXT_PUBLIC_HOST}/sellers`,
          // `${process.env.NEXT_PUBLIC_HOST}/sellers/fetch?page=${currentPage}&limit=${sellersPerPage}`,
          // `${process.env.NEXT_PUBLIC_HOST}/sellers/search1?userId=${userId}&searchQuery=${searchTerm}&page=${currentPage}&limit=${sellersPerPage}`,
          `${process.env.NEXT_PUBLIC_HOST}/buyers/search1?userId=${userId}&searchQuery=${searchTerm}&page=${currentPage}&limit=${buyersPerPage}`,
          
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // setSellers(response.data.data);
        setBuyers(response.data.data);
        // console.log(response.data.data);
        // console.log(response.data);
        // setTotalSellers(response.data.total);
        setTotalBuyers(response.data.total);
        // setTotalSellers(response.data.totalCount);
      } catch (error) {
        // console.error("Error fetching sellers:", error);
        console.error("Error fetching buyers:", error);
      }
    };

    const vehicleData = searchParams.get("vehicle");
    if (vehicleData) {
      const parsedVehicle = JSON.parse(vehicleData);
      setFormData(parsedVehicle);
      setVehicleId(parsedVehicle.id);
      // const updatedParsedVehicle = {
      //   ...parsedVehicle,
      //   // timeOfSale: parsedVehicle.timeOfSale !== ""? parsedVehicle.timeOfSale : currentDateTime,
      //   timeOfSale: parsedVehicle.timeOfSale !== ""? currentDateTime : parsedVehicle.timeOfSale,
      // }
      // setFormData(updatedParsedVehicle);
      // setVehicleId(parsedVehicle.id);
    }

    if (token) {
      fetchSellers();
    }
  // }, [currentPage, searchParams, sellersPerPage, token]);
  }, [currentPage, searchParams, buyersPerPage, token]);

  // console.log(formData);

  // useEffect(() => {
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     timeOfSale: formData.timeOfSale ? formData.timeOfSale : currentDateTime,
  //   }));
  // }, [currentDateTime]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation for required fields
    if (
      [
        "VIN",
        "NVIC",
        "Redbook",
        "make",
        "retailPrice",
        "purchasePrice",
        "wholesale",
        "bodyType",
        "variant",
        "model",
        "purchaseDate",
        "expiry",
        "transmissionType",
        "kilometresAtSale",
        "dateOfSale",
        "timeOfSale",
      ].includes(name)
    ) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]:
          name === "retailPrice" ||
          name === "purchasePrice" ||
          name === "wholesale" // Numeric fields
            ? parseFloat(value) <= 0 || isNaN(parseFloat(value))
            : value.trim() === "", // String fields
      }));
    }
  };

  const handleSubmit = async () => {
    // Reset field errors
    setFieldErrors({
      VIN: false,
      NVIC: false,
      Redbook: false,
      make: false,
      model: false,
      retailPrice: false,
      purchasePrice: false,
      wholesale: false,
      bodyType: false,
      variant: false,
      purchaseDate: false,
      expiry: false,
      transmissionType: false,
      kilometresAtSale: false,
      dateOfSale: false,
      timeOfSale: false,
    });

    // Validation
    const errors = {
      VIN: !formData.VIN.trim(),
      NVIC: !formData.NVIC.trim(),
      Redbook: !formData.Redbook.trim(),
      make: !formData.make.trim(),
      model: !formData.model.trim(),
      retailPrice: formData.retailPrice <= 0 || formData.retailPrice === null,
      purchasePrice:
        formData.purchasePrice <= 0 || formData.purchasePrice === null,
      wholesale: formData.wholesale <= 0 || formData.wholesale === null,
      bodyType: !formData.bodyType.trim(),
      variant: !formData.variant.trim(),
      purchaseDate: !formData.purchaseDate.trim(),
      expiry: !formData.expiry.trim(),
      transmissionType: !formData.transmissionType.trim(),
      kilometresAtSale: !String(formData.kilometresAtSale || "").trim(),
      // kilometresAtSale: formData.kilometresAtSale <= 0 || formData.kilometresAtSale === null ,
      // kilometresAtSale: !formData.kilometresAtSale.trim(),
      // dateOfSale:!formData.dateOfSale.trim(),
      dateOfSale: String(formData.dateOfSale || "").trim() === "",
      timeOfSale:!formData.timeOfSale.trim(),
      // timeOfSale:!formData.timeOfSale <= 0 || formData.timeOfSale === null,
    };

    // If any errors exist, set them and stop submission
    if (Object.values(errors).some((error) => error)) {
      setFieldErrors(errors);
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!token || !vehicleId) {
      alert("Token or Vehicle ID is missing. Please try again later.");
      return;
    }

    const payload = {
      ...formData, // Use existing form data for update
    };

    try {
      // console.log("before sending...: Payload is: ", payload);

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_HOST}/vehicles/${vehicleId}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Vehicle Updated successfully!");
      // console.log("API Response:", response.data);

      handleBack();
    } catch (error) {
      console.error("Error updating vehicle:", error);
      const errorMessage =
        error?.response?.data?.message || "An unexpected error occurred.";

      const duplicateEntryMatch = errorMessage.match(/Duplicate entry '(.+?)'/);
      const duplicateEntryValue = duplicateEntryMatch
        ? duplicateEntryMatch[1]
        : null;

      if (duplicateEntryValue) {
        toast.error(`Duplicate entry found in data: ${duplicateEntryValue}`);
      } else {
        toast.error("Failed to update vehicle. Please try again.");
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  // const handleSellVehicle = async (sellerId) => {
  // const handleSellVehicle = async (buyerId: any) => {
  const handleSellVehicle = async (buyerId: any, sellerId: any) => {
    // console.log("Seller id " + sellerId);
    // console.log("Buyer id " + buyerId);

    const payload = {
      ...formData,
      status: "PendingApproval",
      buyer: buyerId,
      seller: sellerId,
      // status: "Sold",
      // buyer: sellerId,
      // buyer: { id: sellerId },
    };

    setFormData((prevData) => ({
      ...prevData,
      status: "PendingApproval",
      buyer: buyerId,
      seller: sellerId,
      // status: "Sold",
      // buyer: sellerId,
      // buyerId: { id: sellerId },
    }));

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_HOST}/vehicles/${vehicleId}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Vehicle updated successfully!");
      // console.log("API Response:", response.data);
      handleBack();
    } catch (error) {
      console.error("Error updating vehicle:", error);
      // alert("Failed to update vehicle. Please try again.");
      console.log("Error: " + error?.response?.data?.message);

      const errorMessage =
        error?.response?.data?.message || "An unexpected error occurred.";

      const duplicateEntryMatch = errorMessage.match(/Duplicate entry '(.+?)'/);
      const duplicateEntryValue = duplicateEntryMatch
        ? duplicateEntryMatch[1]
        : null;

      if (duplicateEntryValue) {
        // toast.error(`Duplicate entry found in data: ${duplicateEntryValue}`);
        // toast.error(`Duplicate entry found: ${duplicateEntryValue}`);
      } else {
        // toast.error(`Error: ${errorMessage}`);
        toast.error(`Failed to update vehicle. Please try again.`);
      }
    }

    toast.success("Vehicle Sold!");
    console.log("Vehicle sold!");
    handleCloseSellModal();
  };

  const closeImageModal = () => {
    setIsModalImageOpen(false);
    setSelectedFiles(null);
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    // setSelectedFiles(files);
    setSelectedFiles(Array.from(files));

    if (files.length > 0) {
      const urls = Array.from(files).map((file) => URL.createObjectURL(file));
      setImageUrls(urls);
      // console.log("Image Asset URLs: ", urls);
    }
  };

  const uploadToS3 = async (file) => {
    const s3 = new AWS.S3({
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY,
      region: process.env.NEXT_PUBLIC_AWS_REGION,
    });

    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET,
      Key: `cars/${Date.now()}-${file.name}`,
      Body: file,
    };

    try {
      const data = await s3.upload(params).promise();
      // console.log("File uploaded to S3: ", data.Location);

      return data.Location; // return the url of the uploaded file
      // const fileName = data.Key.split('/').pop();
      // return fileName;
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw new Error("Error uploading file to S3");
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("Please select at least one image to upload.");
      return;
    }

    try {
      const uploadPromises = Array.from(selectedFiles).map((file) =>
        uploadToS3(file)
      );
      const uploadedUrls = await Promise.all(uploadPromises);

      // const uploadPromises = Array.from(selectedFiles).map((file) => uploadToS3(file));
      // const uploadedFileNames = await Promise.all(uploadPromises);

      // console.log("All Images uploaded successfully: ", uploadedUrls);
      setImageUrls(uploadedUrls);

      setFormData({ ...formData, images: uploadedUrls });

      // console.log("New FormData: ", formData);

      // handleSubmit(e);

      toast.success("Images uploaded successfully!");
      closeImageModal();
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload image. Please try again.");
    }
  };

  const [fieldErrors, setFieldErrors] = useState({
    VIN: false,
    NVIC: false,
    Redbook: false,
    make: false,
    model: false,
    retailPrice: false,
    wholesale: false,
    purchasePrice: false,
    bodyType: false,
    variant: false,
    purchaseDate: false,
    expiry: false,
    transmissionType: false,
    kilometresAtSale: false,
    dateOfSale: false,
    timeOfSale: false,
  });

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between flex-wrap">
        <div className="mb-4">
          <h1 className="text-4xl font-bold text-black">Vehicle Information</h1>
          <p className="text-red-500 font-bold">
            ━━━━ Update Vehicle Information Form
          </p>
        </div>
        <div className="mb-4">
          <Image
            src="/images/vehicleform.png"
            alt="Logo"
            width={150}
            height={50}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="flex flex-col">
          <label className="text-black">Stock No</label>
          <input
            name="stockNo"
            type="text"
            value={formData.stockNo}
            onChange={handleInputChange}
            placeholder="Value"
            className="p-2 border rounded-md text-black w-full"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-black">VIN/Chassis</label>
          <input
            type="text"
            name="VIN"
            value={formData.VIN}
            onChange={handleInputChange}
            placeholder="Value"
            className={`p-2 border rounded-md text-black w-full transition-all duration-200 ${
              fieldErrors.VIN
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-gray-300"
            }`}
          />
          {fieldErrors.VIN && (
            <p className="text-red-500 text-sm">This field is required.</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-black">NVIC</label>
          <input
            name="NVIC"
            value={formData.NVIC}
            onChange={handleInputChange}
            type="text"
            placeholder="Value"
            className={`p-2 border rounded-md text-black w-full transition-all duration-200 ${
              fieldErrors.NVIC
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-gray-300"
            }`}
          />
          {fieldErrors.NVIC && (
            <p className="text-red-500 text-sm">This field is required.</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-black">Redbook</label>
          <input
            name="Redbook"
            value={formData.Redbook}
            onChange={handleInputChange}
            type="text"
            placeholder="Value"
            className={`p-2 border rounded-md text-black w-full transition-all duration-200 ${
              fieldErrors.Redbook
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-gray-300"
            }`}
          />
          {fieldErrors.Redbook && (
            <p className="text-red-500 text-sm">This field is required.</p>
          )}
        </div>
      </div>

      <hr className="my-6 border-black" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <label className="text-black">Make</label>
          <input
            type="text"
            name="make"
            value={formData.make}
            onChange={handleInputChange}
            placeholder="Value"
            className={`p-2 border rounded-md text-black w-full transition-all duration-200 ${
              fieldErrors.make
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-gray-300"
            }`}
          />
          {fieldErrors.make && (
            <p className="text-red-500 text-sm">This field is required.</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-black">Model</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            placeholder="Value"
            className={`p-2 border rounded-md text-black w-full transition-all duration-200 ${
              fieldErrors.model
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-gray-300"
            }`}
          />
          {fieldErrors.model && (
            <p className="text-red-500 text-sm">This field is required.</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-black">Variant</label>
          <input
            type="text"
            name="variant"
            value={formData.variant}
            onChange={handleInputChange}
            placeholder="Value"
            className={`p-2 border rounded-md text-black w-full transition-all duration-200 ${
              fieldErrors.variant
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-gray-300"
            }`}
          />
          {fieldErrors.variant && (
            <p className="text-red-500 text-sm">This field is required.</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-black">Badge</label>
          <input
            type="text"
            name="badge"
            value={formData.badge}
            onChange={handleInputChange}
            placeholder="Value"
            className="p-2 border rounded-md text-black w-full"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-black">Body Type</label>
          <select
            name="bodyType"
            value={formData.bodyType}
            onChange={handleInputChange}
            className={`p-2 border rounded-md text-black w-full bg-white transition-all duration-200 ${
              fieldErrors.bodyType
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
          >
            <option value="" disabled>
              Select Body Type
            </option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Coupe">Coupe</option>
            <option value="Convertible">Convertible</option>
            <option value="Wagon">Wagon</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Crossover">Crossover</option>
            <option value="Sports Car">Sports Car</option>
          </select>
          {fieldErrors.bodyType && (
            <p className="text-red-500 text-sm mt-1">Body Type is required.</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-black">Year</label>
          <select
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            className="p-2 border rounded-md text-black w-full bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="" disabled>
              Select Year
            </option>
            {Array.from(
              { length: 50 },
              (_, i) => new Date().getFullYear() - i
            ).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-black">Transmission Type</label>
          <select
            name="transmissionType"
            value={formData.transmissionType}
            onChange={handleInputChange}
            className={`p-2 border rounded-md text-black w-full bg-white transition-all duration-200 ${
              fieldErrors.transmissionType
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
          >
            <option value="" disabled>
              Select Transmission Type
            </option>
            <option value="Hybrid">Hybrid</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
          {fieldErrors.transmissionType && (
            <p className="text-red-500 text-sm mt-1">Transmission Type is required.</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-black">Rego Serial No</label>
          <input
            type="text"
            name="regoSerialNo"
            value={formData.regoSerialNo}
            onChange={handleInputChange}
            placeholder="Value"
            className="p-2 border rounded-md text-black w-full"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-black">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            disabled={formData.status === "Sold"} // Disable when 'Sold' is selected
            className="p-2 border rounded-md text-black w-full"
          >
            {/* <option value="InStock">InStock</option> */}
            <option value="Active">Active</option>
            <option value="Sold" disabled={formData.status !== "PendingApproval"}>Sold</option>
            <option value="Pending">Pending</option>
            <option value="PendingApproval">Pending Approval</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-black">Fuel Type</label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleInputChange}
            className="p-2 border rounded-md text-black w-full"
          >
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
          </select>
        </div>
        
        <div className="flex flex-col">
          <label className="text-black">Engine No</label>
          <input
            type="text"
            name="engineNo"
            value={formData.engineNo}
            onChange={handleInputChange}
            placeholder="Value"
            className="p-2 border rounded-md text-black w-full"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-black">Capacity</label>
          <input
            type="text"
            name="capacity"
            value={formData.capacity}
            onChange={handleInputChange}
            placeholder="Litres"
            className="p-2 border rounded-md text-black w-full"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-black">Kilometers Run</label>
          <input
            type="number"
            name="kilometresAtSale"
            value={formData.kilometresAtSale}
            onChange={handleInputChange}
            placeholder="1000"
            className={`p-2 border rounded-md text-black w-full transition-all duration-200 ${
              fieldErrors.kilometresAtSale
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-gray-300"
            }`}
          />
          {fieldErrors.kilometresAtSale && (
            <p className="text-red-500 text-sm">This field is required.</p>
          )}
        </div>
        
        <div className="flex flex-col">
          <label className="text-black">Purchase Price</label>
          <input
            type="number"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handleInputChange}
            placeholder="9000"
            className={`p-2 border rounded-md text-black w-full transition-all duration-200 ${
              fieldErrors.purchasePrice
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-gray-300"
            }`}
          />
          {fieldErrors.purchasePrice && (
            <p className="text-red-500 text-sm">This field is required.</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-black">Wholesale</label>
          <input
            type="number"
            name="wholesale"
            value={formData.wholesale}
            onChange={handleInputChange}
            placeholder="9000"
            className={`p-2 border rounded-md text-black w-full transition-all duration-200 ${
              fieldErrors.wholesale
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-gray-300"
            }`}
          />
          {fieldErrors.wholesale && (
            <p className="text-red-500 text-sm">This field is required.</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-black">Retail Price</label>
          <input
            type="number"
            name="retailPrice"
            value={formData.retailPrice}
            onChange={handleInputChange}
            placeholder="9000"
            className={`p-2 border rounded-md text-black w-full transition-all duration-200 ${
              fieldErrors.retailPrice
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-gray-300"
            }`}
          />
          {fieldErrors.retailPrice && (
            <p className="text-red-500 text-sm">This field is required.</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-black">Purchase Date</label>
          <input
            type="date"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleInputChange}
            className={`p-2 border rounded-md text-black w-full transition-all duration-200 ${
              fieldErrors.purchaseDate
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-gray-300"
            }`}
          />
          {fieldErrors.purchaseDate && (
            <p className="text-red-500 text-sm">This field is required.</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-black">Expiry</label>
          <input
            type="date"
            name="expiry"
            value={formData.expiry}
            onChange={handleInputChange}
            className={`p-2 border rounded-md text-black w-full transition-all duration-200 ${
              fieldErrors.expiry
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-gray-300"
            }`}
          />
          {fieldErrors.expiry && (
            <p className="text-red-500 text-sm">This field is required.</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-black">Selling Date</label>
          <input
            type="date"
            name="dateOfSale"
            value={formData.dateOfSale}
            onChange={handleInputChange}
            className={`p-2 border rounded-md text-black w-full transition-all duration-200 ${
              fieldErrors.dateOfSale
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-gray-300"
            }`}
          />
          {fieldErrors.dateOfSale && (
            <p className="text-red-500 text-sm">This field is required.</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-black">Selling Time</label>
          <input
            type="text"
            name="timeOfSale"
            value={formData.timeOfSale === "" ? currentDateTime : formData.timeOfSale}
            // value={currentDateTime}
            onChange={handleInputChange}
            // disabled={formData.timeOfSale === "" ? currentDateTime : formData.timeOfSale}
            // disabled={formData.timeOfSale === ""}
            disabled={formData.status === "Sold" || formData.status === ""}
            className={`p-2 border rounded-md text-black w-full transition-all duration-200 ${
              fieldErrors.timeOfSale
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-gray-300"
            }`}
          />
          {fieldErrors.timeOfSale && (
            <p className="text-red-500 text-sm">This field is required.</p>
          )}
        </div>

      </div>

      <div className="mt-6 flex flex-wrap space-x-8 items-center">
        <label className="text-black font-bold">ITC Type:</label>

        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="Actual"
            checked={formData.itcType === "Actual"}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, itcType: e.target.value }))
            }
            className="w-6 h-6 border-2 border-black appearance-none rounded-full checked:bg-black checked:border-black"
          />
          <span className="text-black">Actual</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="Notional"
            checked={formData.itcType === "Notional"}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, itcType: e.target.value }))
            }
            className="w-6 h-6 border-2 border-black appearance-none rounded-full checked:bg-black checked:border-black"
          />
          <span className="text-black">Notional</span>
        </label>
      </div>

      <div className="flex justify-start space-x-4 mt-8">
        {/* Add Images Button */}
        <button
          className="flex items-center space-x-2 bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400"
          onClick={() => setIsModalImageOpen(true)}
        >
          <span className="text-black font-semibold">+ Add Images</span>
        </button>

        {/* Modal Image Modal */}
        {isModalImageOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 modal backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 shadow-md w-11/12 max-w-md">
              <h2 className="text-lg font-semibold text-black mb-4">
                Upload Image
              </h2>
              <div className="flex flex-col gap-4">
                <label
                  htmlFor="fileUpload"
                  className="border border-gray-300 rounded-md px-4 py-2 text-center text-white cursor-pointer bg-blue-500 hover:bg-blue-400"
                >
                  Choose File
                  <input
                    id="fileUpload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg"
                    multiple={true}
                  />
                </label>
                <p className="text-sm text-gray-600">
                  {selectedFiles && selectedFiles.length > 0 ? (
                    <div>
                      <div>Selected files:</div>
                      <ul>
                        {selectedFiles.map((file: File) => (
                          <li key={file.name}>
                            {`${file.name} (${(file.size / 1024).toFixed(
                              2
                            )} KB)`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    "No files chosen"
                  )}
                </p>
              </div>
              <div className="flex justify-end mt-4">
                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-400"
                    onClick={handleImageSubmit}
                  >
                    Submit
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    onClick={closeImageModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <button
          onClick={handleOpenSellModal}
          disabled={
            formData.status === "" || formData.status.toLowerCase() === "sold"
          }
          className={`px-6 py-3 rounded-lg text-white ${
            formData.status === "" || formData.status.toLowerCase() === "sold"
              ? "bg-gray-500 opacity-50 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
          }`}
        >
          Mark As Sold
        </button>

        {/* Modal Sell Vehicle */}
        {isSellModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 modal backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 sm:p-8 relative">
              {/* Modal Heading */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-6">
                Sell Vehicle
              </h2>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse bg-gray-100 rounded-lg">
                  <thead>
                    <tr className="text-left text-gray-500 text-sm border-b">
                      <th className="p-2 md:p-4">No.</th>
                      <th className="p-2 md:p-4">Buyer Name</th>
                      <th className="p-2 md:p-4">Seller Name</th>
                      <th className="p-2 md:p-4">Seller Type</th>
                      <th className="p-2 md:p-4">Trade-In</th>
                      <th className="p-2 md:p-4">Road Worthy Certificate</th>
                      <th className="p-2 md:p-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* {currentSellers.map((seller, index) => ( */}
                    {/* {sellers.map((seller, index) => ( */}
                    {buyers.map((buyer, index) => (
                      <tr
                        // key={seller.id}
                        key={buyer.id}
                        className="border-t text-sm text-black"
                      >
                        <td className="p-2 md:p-4">
                          {(index + 1).toString().padStart(2, "0")}
                        </td>
                        <td className="p-2 md:p-4">{buyer.firstName} {buyer.lastName}</td>
                        <td className="p-2 md:p-4">{buyer.seller ? ( buyer.seller.name ) : 'No Seller'}</td>
                        <td className="p-2 md:p-4">
                          <span className="inline-block px-2 md:px-3 py-1 bg-gray-200 text-sm rounded-lg">
                            {/* {seller.sellerType} */}
                            {buyer.seller ? ( buyer.seller.sellerType ) : 'No Data'}
                          </span>
                        </td>
                        <td className="p-2 md:p-4">
                          {/* {seller.tradeIn ? "Yes" : "No"} */}
                          {buyer.seller ? (buyer.seller.tradeIn ? "Yes" : "No" ) : "No"}
                        </td>
                        <td className="p-2 md:p-4">
                          {/* {seller.roadWorthyCertificate ? "Yes" : "No"} */}
                          {buyer.seller ? (buyer.seller.roadWorthyCertificate ? "Yes" : "No") : "No"}
                        </td>
                        <td className="p-2 md:p-4">
                          <div className="flex flex-col md:flex-row gap-2">
                            <button
                              onClick={() =>{
                                buyer.seller ? 
                                (  
                                    handleSellVehicle(buyer.id, buyer.seller.id)
                                  ) : (
                                    handleSellVehicle(buyer.id, null)  
                                  )
                                }
                              }
                              // onClick={() =>handleSellVehicle( (buyer.id, buyer.seller.id) : (buyer.id, null))}
                              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-400"
                            >
                              Sell
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center items-center mt-4">
                {/* Previous Button */}
                <button
                  className="rounded-md rounded-r-none border border-r-0 border-slate-300 py-2 px-4 text-center text-sm text-slate-600 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() => handlePageChange("prev")}
                  disabled={currentPage === 1}
                >
                  &larr;
                </button>

                {/* Page Numbers */}
                <div className="flex border border-slate-300">
                  {/* First Page */}
                  {currentPage > 3 ? (
                    <button
                      className={`px-4 py-2 text-sm ${
                        1 === currentPage
                          ? "bg-slate-800 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                      onClick={() => handlePageChange(1)}
                    >
                      1
                    </button>
                  ) : (
                    <button
                      className={`px-4 py-2 text-sm ${
                        1 === currentPage
                          ? "bg-slate-800 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                      onClick={() => handlePageChange(1)}
                    >
                      1
                    </button>
                  )}

                  {/* Dots */}
                  {currentPage > 4 && (
                    <span className="px-4 py-2 text-sm text-slate-600">
                      ...
                    </span>
                  )}

                  {/* Page Numbers */}
                  {totalPages > 1 &&
                    [...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      if (pageNumber !== 1 && pageNumber !== totalPages) {
                        return (
                          <button
                            key={pageNumber}
                            className={`px-4 py-2 text-sm ${
                              pageNumber === currentPage
                                ? "bg-slate-800 text-white"
                                : "text-slate-600 hover:bg-slate-100"
                            }`}
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                      return null;
                    })}

                  {/* Dots */}
                  {currentPage < totalPages - 3 && (
                    <span className="px-4 py-2 text-sm text-slate-600">
                      ...
                    </span>
                  )}

                  {/* Last Page */}
                  {currentPage < totalPages - 1 && (
                    <button
                      className={`px-4 py-2 text-sm ${
                        totalPages === currentPage
                          ? "bg-slate-800 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </button>
                  )}
                </div>

                {/* Next Button */}
                <button
                  className="rounded-md rounded-l-none border border-l-0 border-slate-300 py-2 px-4 text-center text-sm text-slate-600 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() => handlePageChange("next")}
                  disabled={currentPage === totalPages}
                >
                  &rarr;
                </button>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end mt-6">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 ml-4"
                  onClick={handleCloseSellModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
        >
          Save
        </button>
        <a
          href="/patient"
          className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 block text-center"
        >
          Close
        </a>
      </div>
    </div>
  );
}

// export default UpdateVehicle;
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdateVehicle />
    </Suspense>
  );
}
