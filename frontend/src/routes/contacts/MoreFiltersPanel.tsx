import React, { useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  attributes: {
    utm_term?: string[];
    phoneNumber?: string[];
    utm_source?: string[];
    utm_campaign?: string[];
    utm_id?: string[];
    utm_content?: string[];
    utm_medium?: string[];
    country?: string[];
    storage?: string[];
    how?: string[];
    referral_id?: string[];
  };
  enabled: boolean;
}

const MoreFiltersPanel: React.FC = () => {
  const [allUsersData, setAllUsersData] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState({
    filterType: "all",
    filterValue: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state

  useEffect(() => {
    axios.get("https://admin2-dash.zata.ai/api/allusers").then((response) => {
      setAllUsersData(response.data);
    });
  }, []);

  // Handle Filter Type Change
  const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      filterType: e.target.value,
    });
  };

  // Handle Filter Value Change
  const handleFilterValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      filterValue: e.target.value.toLowerCase(),
    });
    filterUsers({
      ...filters,
      filterValue: e.target.value.toLowerCase(),
    });
  };

  // Filtering Logic
  const filterUsers = (filters: {
    filterType: string;
    filterValue: string;
  }) => {
    if (filters.filterType === "all") {
      setFilteredUsers([]);
      return;
    }

    let filtered = allUsersData;

    // Apply Specific Filters
    if (filters.filterType === "emailVerified") {
      filtered = filtered.filter(
        (user) => user.emailVerified === (filters.filterValue === "true")
      );
    } else if (filters.filterType === "utm_term") {
      filtered = filtered.filter(
        (user) =>
          user.attributes?.utm_term?.[0]?.toLowerCase() === filters.filterValue
      );
    } else if (filters.filterType === "utm_source") {
      filtered = filtered.filter(
        (user) =>
          user.attributes?.utm_source?.[0]?.toLowerCase() ===
          filters.filterValue
      );
    } else if (filters.filterType === "utm_campaign") {
      filtered = filtered.filter(
        (user) =>
          user.attributes?.utm_campaign?.[0]?.toLowerCase() ===
          filters.filterValue
      );
    } else if (filters.filterType === "utm_id") {
      filtered = filtered.filter(
        (user) =>
          user.attributes?.utm_id?.[0]?.toLowerCase() === filters.filterValue
      );
    } else if (filters.filterType === "utm_content") {
      filtered = filtered.filter(
        (user) =>
          user.attributes?.utm_content?.[0]?.toLowerCase() ===
          filters.filterValue
      );
    } else if (filters.filterType === "utm_medium") {
      filtered = filtered.filter(
        (user) =>
          user.attributes?.utm_medium?.[0]?.toLowerCase() ===
          filters.filterValue
      );
    } else if (filters.filterType === "country") {
      filtered = filtered.filter(
        (user) =>
          user.attributes?.country?.[0]?.toLowerCase() === filters.filterValue
      );
    } else if (filters.filterType === "storage") {
      filtered = filtered.filter(
        (user) =>
          user.attributes?.storage?.[0]?.toLowerCase() === filters.filterValue
      );
    } else if (filters.filterType === "how") {
      filtered = filtered.filter(
        (user) =>
          user.attributes?.how?.[0]?.toLowerCase() === filters.filterValue
      );
    } else if (filters.filterType === "referral_id") {
      filtered = filtered.filter(
        (user) =>
          user.attributes?.referral_id?.[0]?.toLowerCase() ===
          filters.filterValue
      );
    }

    setFilteredUsers(filtered);
  };

  // Function to close the modal
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      {/* UTM Filter Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-100 text-black px-4 py-2 rounded-lg shadow-lg mb-4 w-40"
      >
        UTM Filter
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-3/4 max-w-3xl rounded-lg shadow-lg p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>

            <h1 className="text-2xl font-semibold text-gray-700 mb-4">
              Filtered Users
            </h1>

            {/* Filter Section */}
            <div className="flex justify-between mb-4">
              <div className="flex w-full space-x-2">
                <select
                  value={filters.filterType}
                  onChange={handleFilterTypeChange}
                  className="px-4 py-2 border rounded-lg shadow-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent w-1/3"
                >
                  <option value="all">All Filters</option>
                  <option value="emailVerified">Email Verified</option>
                  <option value="utm_term">UTM Term</option>
                  <option value="utm_campaign">UTM Campaign</option>
                  <option value="utm_source">UTM Source</option>
                  <option value="utm_id">UTM ID</option>
                  <option value="utm_content">UTM Content</option>
                  <option value="utm_medium">UTM Medium</option>
                  <option value="country">Country</option>
                  <option value="storage">Storage Requirement</option>
                  <option value="how">How did they hear about us?</option>
                  <option value="referral_id">Referral ID</option>
                </select>

                {filters.filterType !== "all" && (
                  <input
                    type="text"
                    value={filters.filterValue}
                    onChange={handleFilterValueChange}
                    className="px-4 py-2 border rounded-lg shadow-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent w-2/3"
                    placeholder="Enter filter value"
                  />
                )}
              </div>
            </div>

            {/* User List */}
            <div
              className="overflow-x-auto"
              style={{ maxHeight: "300px", overflowY: "scroll" }}
            >
              {filteredUsers.length > 0 ? (
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-4 text-center text-sm font-semibold text-gray-600">
                        Username
                      </th>
                      <th className="py-2 px-4 text-center text-sm font-semibold text-gray-600">
                        First Name
                      </th>
                      <th className="py-2 px-4 text-center text-sm font-semibold text-gray-600">
                        Last Name
                      </th>
                      <th className="py-2 px-4 text-center text-sm font-semibold text-gray-600">
                        Email
                      </th>
                      <th className="py-2 px-4 text-center text-sm font-semibold text-gray-600">
                        Email Verified
                      </th>
                      <th className="py-2 px-4 text-center text-sm font-semibold text-gray-600">
                        Phone
                      </th>
                      <th className="py-2 px-4 text-center text-sm font-semibold text-gray-600">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 border-b border-gray-200 last:border-none"
                      >
                        <td className="py-2 px-4 text-center">
                          {user.username}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {user.firstName}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {user.lastName}
                        </td>
                        <td className="py-2 px-4 text-center">{user.email}</td>
                        <td className="py-2 px-4 text-center">
                          {user.emailVerified ? "Verified" : "Not Verified"}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {user.attributes?.phoneNumber?.[0] || "N/A"}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {user.enabled ? "Enabled" : "Disabled"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-600">
                  No users to display. Please select a filter.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoreFiltersPanel;
