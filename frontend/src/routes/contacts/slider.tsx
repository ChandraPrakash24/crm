import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";
import email from "../../assets/icons8-mail-30.png";

type Contact = {
  id: string;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | boolean;
  address: string;
  city: string;
  zip_code: string;
  region: string;
  country: string;
  phone: string;
  currency: string;
  created_at: string;
  updated_at: string;
};

type Comment = {
  id: string;
  billing_profile_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
};

type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  attributes: {
    phoneNumber?: string[];
    utm_id?: string[];
    utm_term?: string[];
    utm_campaign?: string[];
    utm_medium?: string[];
    utm_content?: string[];
    utm_source?: string[];
    country?: string[];
    how?: string[];
    storage?: string[];
    referral_id?: string[];
  };
  createdTimestamp: number;
  enabled: boolean;
};

type SliderProps = {
  userId: string;
  onClose: () => void;
};

const Slider: React.FC<SliderProps> = ({ userId, onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          // `http://admin2-dash.zata.ai:3001/api/users/${userId}`
          `https://admin2-dash.zata.ai/api/users/${userId}`
        );
        setUser(response.data);

        // Introduce a delay before updating the loading state
        setTimeout(() => {
          setLoading(false);
          // Set isVisible to true after a short delay to trigger the transition
          setTimeout(() => setIsVisible(true), 50);
        }, 300); // Delay duration in milliseconds
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Failed to fetch user data");
        setLoading(false);
      }
    };

    fetchUser();

    // Cleanup function to handle component unmount
    return () => setIsVisible(false);
  }, [userId]);

  const formatTimestamp = (timestamp: number) => {
    return format(new Date(timestamp), "PPpp");
  };

  // Close on Esc key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for the transition to complete before calling onClose
    setTimeout(onClose, 300);
  };

  // Trap focus inside the modal
  useEffect(() => {
    const focusableElements = sliderRef.current?.querySelectorAll<HTMLElement>(
      "a[href], button, textarea, input, select"
    );
    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleTab);
    firstElement?.focus();

    return () => window.removeEventListener("keydown", handleTab);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded-lg shadow-lg animate-pulse">
          <svg
            className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          <p className="text-lg font-semibold text-gray-700 text-center">
            Loading user data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-lg font-semibold text-red-600 mb-4 text-center">
            {error}
          </p>
          <button
            className="w-full px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-lg font-semibold text-gray-700 mb-4 text-center">
            User not found
          </p>
          <button
            className="w-full px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-gray-700 bg-opacity-75 transition-opacity"
        onClick={handleClose}
      ></div>
      <section
        className={`absolute inset-y-0 right-0 max-w-full flex transform transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="w-screen max-w-3xl">
          <div
            ref={sliderRef}
            className="h-full flex flex-col bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-semibold text-gray-800">
                User Details
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                onClick={handleClose}
                aria-label="Close panel"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Basic Information
                  </h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Username
                      </dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {user.username}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Full Name
                      </dt>
                      <dd className="mt-1 text-base text-gray-900">{`${user.firstName} ${user.lastName}`}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Email
                      </dt>
                      <dd className="mt-1 text-base text-gray-900 flex items-center">
                        <img
                          src={email}
                          alt="Email Icon"
                          className="mr-2 w-5 h-5"
                        />
                        {user.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Email Verified
                      </dt>
                      <dd className="mt-1 text-base text-gray-900">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            user.emailVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.emailVerified ? "Verified" : "Not Verified"}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Phone
                      </dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {user.attributes.phoneNumber?.[0] || "N/A"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Status
                      </dt>
                      <dd className="mt-1 text-base text-gray-900">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            user.enabled
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </dd>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Created At
                      </dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {formatTimestamp(user.createdTimestamp)}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    UTM Parameters
                  </h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(user.attributes).map(([key, value]) => {
                      if (key.startsWith("utm_")) {
                        const formattedKey = key
                          .replace("utm_", "UTM ")
                          .toUpperCase();
                        return (
                          <div key={key}>
                            <dt className="text-sm font-medium text-gray-500">
                              {formattedKey}
                            </dt>
                            <dd className="mt-1 text-base text-gray-900">
                              {value?.[0] || "N/A"}
                            </dd>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </dl>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Additional Information
                  </h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Country
                      </dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {user.attributes.country?.[0] || "N/A"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        How did they hear about us?
                      </dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {user.attributes.how?.[0] || "N/A"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Storage Requirement
                      </dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {user.attributes.storage?.[0] || "N/A"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Referral ID
                      </dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {user.attributes.referral_id?.[0] || "N/A"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
            {/* Close button at the bottom right corner */}
            <div className="p-4 flex justify-end">
              <button
                className="text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full p-3"
                onClick={handleClose}
                aria-label="Close panel"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {/* End of bottom close button */}
          </div>
        </div>
      </section>
      <Toaster position="top-right" />
    </div>
  );
};

export default Slider;
