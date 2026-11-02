import Image from "next/image";
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import { EyeIcon } from "@heroicons/react/24/outline";
import "react-phone-input-2/lib/style.css";

function Userprofile() {
  const [isModalImageOpen, setIsModalImageOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("/images/userimg.png");

  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+923365896324",
    country: "Pakistan",
    city: "Islamabad",
    role: "Super Admin",
    status: "Enable",
    sellerType: "Individual",
    profilePic: "/images/userimg.png",
  });

  const [modalData, setModalData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [modalErrors, setModalErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: { target: any }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleModalChange = (e: { target: any }) => {
    setModalData({ ...modalData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: { target: { files: any[] } }) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const closeImageModal = () => {
    setIsModalImageOpen(false);
    setSelectedFile(null);
  };

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  return (
    <div className="flex flex-col p-4 sm:p-10 bg-gray-100">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start mb-8">
        <div className="relative">
          <Image
            src={imageUrl}
            alt="Profile"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-blue-500"
            width={96}
            height={96}
          />
          <button
            className="absolute bottom-1 right-1 bg-blue-500 p-1 rounded-full hover:bg-blue-600"
            onClick={() => setIsModalImageOpen(true)}
          >
            <img
              src="/images/CameraIcon.svg"
              alt="Camera Icon"
              className="w-4 h-4"
            />
          </button>

          {isModalImageOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
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
                      multiple={false}
                    />
                  </label>
                  <p className="text-sm text-gray-600">
                    {selectedFile
                      ? `Selected file: ${selectedFile.name} (${(
                          selectedFile.size / 1024
                        ).toFixed(2)} KB)`
                      : "No file chosen"}
                  </p>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-400"
                    onClick={closeImageModal}
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
          )}
        </div>

        <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {formData.name}
          </h2>
          <p className="text-gray-600">Your account is ready</p>
        </div>
      </div>

      {/* Edit Profile Form */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
        Edit Profile
      </h2>
      <form>
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Personal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-lg text-black"
              />
            </div>

            <div>
              <label className="block text-gray-700">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-lg text-black"
              >
                <option value="Admin">Admin</option>
                <option value="Company">Company</option>
                <option value="Dealer">Dealer</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Status</label>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    status: formData.status === "Enable" ? "Disable" : "Enable",
                  })
                }
                className={`relative inline-flex items-center h-10 w-20 rounded-full transition-colors duration-300 focus:outline-none ${
                  formData.status === "Enable" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                <span
                  className={`inline-block h-8 w-8 transform bg-white rounded-full shadow-md transition-transform duration-300 ${
                    formData.status === "Enable"
                      ? "translate-x-10"
                      : "translate-x-1"
                  }`}
                />
              </button>
              <span className="ml-4 font-medium text-gray-700">
                {formData.status === "Enable" ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Contact</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                className="w-full border border-gray-300 p-2 rounded-lg text-black"
              />
            </div>

            <div>
              <label className="block text-gray-700">Phone Number</label>
              <PhoneInput
                country={"pk"}
                value={formData.phone}
                onChange={(phone) =>
                  handleChange({
                    target: { name: "phone", value: phone },
                  })
                }
                inputStyle={{
                  width: "100%",
                  height: "40px",
                  padding: "8px 8px 8px 48px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  color: "#000",
                  fontSize: "14px",
                  backgroundColor: "#fff",
                }}
                containerStyle={{
                  width: "100%",
                }}
                dropdownStyle={{
                  color: "#000",
                }}
              />
            </div>

            <div>
              <label className="block text-gray-700">Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-lg text-black"
              >
                <option value="Pakistan">Pakistan</option>
                <option value="USA">USA</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-lg text-black"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end mt-8">
          <button
            type="button"
            className="bg-black text-white py-2 px-4 sm:px-6 rounded-lg mb-4 sm:mb-0 sm:mr-4 hover:bg-black/80"
            onClick={handleModalOpen}
          >
            Change Password
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 sm:px-6 rounded-lg hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </form>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 sm:p-8 relative">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-6">
              Password Manager
            </h2>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={modalData.currentPassword}
                    placeholder="•••••••••••••"
                    onChange={handleModalChange}
                    className="w-full border p-2 rounded-lg text-black border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600 hover:text-blue-500 transition duration-200"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={modalData.newPassword}
                    placeholder="•••••••••••••"
                    onChange={handleModalChange}
                    className="w-full border p-2 rounded-lg text-black border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600 hover:text-blue-500 transition duration-200"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={modalData.confirmPassword}
                    placeholder="•••••••••••••"
                    onChange={handleModalChange}
                    className="w-full border p-2 rounded-lg text-black border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600 hover:text-blue-500 transition duration-200"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  onClick={handleModalClose}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Userprofile;
