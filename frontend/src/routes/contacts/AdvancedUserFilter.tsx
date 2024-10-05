import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  KeyboardEvent,
} from "react";
import {
  FaDownload,
  FaFilter,
  FaSyncAlt,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

// Define the User interface based on the expected structure of user objects
interface User {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  emailVerified?: boolean;
  createdTimestamp?: string;
  attributes?: Record<string, any>;
  disableableCredentialTypes?: any;
  totp?: any;
  access?: any;
  notBefore?: any;
  requiredActions?: any;
  // Add other fields as necessary
}

// Define the shape of the component's props
interface AdvancedUserFilterProps {
  allUsersData: User[];
}

// Define the type for filters
type Filters = Record<string, string>;

const AdvancedUserFilter: React.FC<AdvancedUserFilterProps> = ({
  allUsersData,
}) => {
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // State for sidebar

  // Accordion state for filter sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    general: false,
    utm: false,
    other: false,
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const usersPerPage: number = 10;

  // Synchronize filteredData with allUsersData when it changes
  useEffect(() => {
    setFilteredData(allUsersData || []);
    setCurrentPage(1); // Reset to first page when data changes
  }, [allUsersData]);

  // Function to get all unique attributes from the data
  const getAllAttributes = useCallback((): string[] => {
    const excludedAttributes: string[] = [
      "attributes",
      "disableableCredentialTypes",
      "totp",
      "access",
      "notBefore",
      "requiredActions",
    ];
    const attributes: Set<string> = new Set();
    allUsersData.forEach((user: User) => {
      Object.keys(user).forEach((key: string) => {
        if (!excludedAttributes.includes(key)) {
          attributes.add(key);
        }
      });
      // Include nested attributes
      if (user.attributes) {
        Object.keys(user.attributes).forEach((key: string) => {
          attributes.add(key);
        });
      }
    });
    return Array.from(attributes);
  }, [allUsersData]);

  const attributes: string[] = useMemo(
    () => getAllAttributes(),
    [getAllAttributes]
  );

  // Function to apply filters with exact matching
  const applyFilters = useCallback(() => {
    let result = allUsersData.filter((user: User) => {
      for (let key in filters) {
        if (filters[key]) {
          if (key === "emailVerified") {
            if (filters[key] === "Verified" && !user.emailVerified)
              return false;
            if (filters[key] === "Not Verified" && user.emailVerified)
              return false;
          } else {
            const value: any =
              user[key as keyof User] ||
              (user.attributes && user.attributes[key]);
            if (Array.isArray(value)) {
              // Exact match for array values
              if (
                !value.some(
                  (v: any) =>
                    typeof v === "string" &&
                    v.toLowerCase() === filters[key].toLowerCase()
                )
              )
                return false;
            } else if (typeof value === "string") {
              // Exact match for string values
              if (value.toLowerCase() !== filters[key].toLowerCase())
                return false;
            } else {
              return false;
            }
          }
        }
      }
      return true;
    });

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (user: User) =>
          (user.username && user.username.toLowerCase() === lowerSearchTerm) ||
          (user.firstName && user.firstName.toLowerCase() === lowerSearchTerm)
      );
    }

    setFilteredData(result);
    setCurrentPage(1); // Reset to first page when filters are applied
  }, [allUsersData, filters, searchTerm]);

  // Effect to apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Function to reset all filters
  const resetFilters = () => {
    setFilters({});
    setSearchTerm("");
    setFilteredData(allUsersData || []);
    setCurrentPage(1);
  };

  // Handle Escape key to close sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false);
        setSelectedUser(null);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("keydown", handleKeyDown as any);
    } else {
      document.removeEventListener("keydown", handleKeyDown as any);
    }

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown as any);
    };
  }, [isSidebarOpen]);

  // Handle body overflow when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isSidebarOpen]);

  // Toggle accordion sections
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Function to render user details in the sidebar
  const renderUserDetails = () => {
    if (!selectedUser) return null;

    const renderValue = (value: any): React.ReactNode => {
      if (Array.isArray(value)) {
        return value.join(", ") || "N/A";
      }
      if (typeof value === "object" && value !== null) {
        return JSON.stringify(value) || "N/A";
      }
      return value || "N/A";
    };

    return (
      <>
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-60 transition-opacity duration-300 ${
            isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          onClick={() => {
            setIsSidebarOpen(false);
            setSelectedUser(null);
          }}
          aria-hidden={!isSidebarOpen}
        ></div>

        {/* Sidebar */}
        <div
          className={`fixed top-0 right-0 h-full w-11/12 sm:w-2/3 md:w-1/2 lg:w-1/3 bg-white shadow-2xl transform transition-transform duration-500 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-details-title"
        >
          <div className="p-6 relative h-full flex flex-col">
            {/* Close Button at Top-Right */}
            <button
              onClick={() => {
                setIsSidebarOpen(false);
                setSelectedUser(null);
              }}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaTimes size={24} />
            </button>
            <h3
              id="user-details-title"
              className="text-3xl font-semibold mb-6 text-gray-800"
            >
              User Details
            </h3>
            <div className="flex-1 overflow-y-auto">
              {Object.entries(selectedUser).map(([key, value]) => {
                if (
                  key === "attributes" &&
                  typeof value === "object" &&
                  value !== null
                ) {
                  return Object.entries(value).map(
                    ([attrKey, attrValue]: [string, any]) => (
                      <div
                        key={attrKey}
                        className="mb-3 flex justify-between mr-4"
                      >
                        <span className="font-semibold text-gray-700">
                          {attrKey.replace(/([A-Z])/g, " $1").trim()}:
                        </span>
                        <span className="text-gray-600 ml-2">
                          {renderValue(attrValue)}
                        </span>
                      </div>
                    )
                  );
                } else if (
                  ![
                    "disableableCredentialTypes",
                    "totp",
                    "access",
                    "notBefore",
                  ].includes(key)
                ) {
                  return (
                    <div key={key} className="mb-3 flex justify-between mr-4">
                      <span className="font-semibold text-gray-700">
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </span>
                      <span className="text-gray-600 ml-2">
                        {renderValue(value)}
                      </span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
            {/* Close Button at Bottom */}
            <button
              onClick={() => {
                setIsSidebarOpen(false);
                setSelectedUser(null);
              }}
              className="mt-6 self-end bg-gray-200 hover:bg-gray-300 p-5 rounded-full transition-colors"
            >
              <FaTimes size={20} className="text-gray-700" />
            </button>
          </div>
        </div>
      </>
    );
  };

  // Function to categorize filters
  const categorizeFilters = () => {
    const generalFilters: string[] = [];
    const utmFilters: string[] = [];
    const otherFilters: string[] = [];

    attributes.forEach((attr: string) => {
      if (attr.startsWith("utm_")) {
        utmFilters.push(attr);
      } else if (
        [
          "username",
          "firstName",
          "lastName",
          "email",
          "emailVerified",
        ].includes(attr)
      ) {
        generalFilters.push(attr);
      } else {
        otherFilters.push(attr);
      }
    });

    return { generalFilters, utmFilters, otherFilters };
  };

  // Function to render filter inputs with accordion sections
  const renderFilterInputs = () => {
    const { generalFilters, utmFilters, otherFilters } = categorizeFilters();

    return (
      <div className="space-y-4">
        {/* General Filters */}
        {generalFilters.length > 0 && (
          <div className="border border-gray-300 rounded-md">
            <button
              onClick={() => toggleSection("general")}
              className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 text-left text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span>General Filters</span>
              {openSections.general ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {openSections.general && (
              <div className="p-4 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {generalFilters.map((attr: string) =>
                    attr === "emailVerified" ? (
                      <div key={attr} className="flex flex-col">
                        <label className="mb-2 text-sm font-medium text-gray-700">
                          {attr}
                        </label>
                        <select
                          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={filters[attr] || ""}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setFilters({
                              ...filters,
                              [attr]: e.target.value,
                            })
                          }
                        >
                          <option value="">All</option>
                          <option value="Verified">Verified</option>
                          <option value="Not Verified">Not Verified</option>
                        </select>
                      </div>
                    ) : (
                      <div key={attr} className="flex flex-col">
                        <label className="mb-2 text-sm font-medium text-gray-700">
                          {attr}
                        </label>
                        <input
                          type="text"
                          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={filters[attr] || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFilters({
                              ...filters,
                              [attr]: e.target.value,
                            })
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* UTM Filters */}
        {utmFilters.length > 0 && (
          <div className="border border-gray-300 rounded-md">
            <button
              onClick={() => toggleSection("utm")}
              className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 text-left text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span>UTM Filters</span>
              {openSections.utm ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {openSections.utm && (
              <div className="p-4 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {utmFilters.map((attr: string) => (
                    <div key={attr} className="flex flex-col">
                      <label className="mb-2 text-sm font-medium text-gray-700">
                        {attr}
                      </label>
                      <input
                        type="text"
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={filters[attr] || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFilters({
                            ...filters,
                            [attr]: e.target.value,
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Other Filters */}
        {otherFilters.length > 0 && (
          <div className="border border-gray-300 rounded-md">
            <button
              onClick={() => toggleSection("other")}
              className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 text-left text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span>Other Filters</span>
              {openSections.other ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {openSections.other && (
              <div className="p-4 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {otherFilters.map((attr: string) => (
                    <div key={attr} className="flex flex-col">
                      <label className="mb-2 text-sm font-medium text-gray-700">
                        {attr}
                      </label>
                      <input
                        type="text"
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={filters[attr] || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFilters({
                            ...filters,
                            [attr]: e.target.value,
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Define the structure of table columns
  interface Column {
    title: string;
    dataIndex: string;
    key: string;
    render: (text: any, record: User) => React.ReactNode;
  }

  // Function to render table columns
  const renderColumns = (): Column[] => {
    const cols: Column[] = attributes.map((attr: string) => ({
      title: attr,
      dataIndex: attr,
      key: attr,
      render: (text: any, record: User): React.ReactNode => {
        let value: any;
        if (record.attributes && record.attributes[attr]) {
          value = record.attributes[attr][0];
        } else {
          //   value = record[attr];
          value = attr in record ? record[attr as keyof User] : undefined;
        }

        if (value === undefined || value === null || value === "") {
          return <span className="text-gray-400">N/A</span>;
        }

        // Specific formatting for 'createdTimestamp'
        if (attr === "createdTimestamp") {
          const date = new Date(value);
          // Check if the timestamp is valid
          if (!isNaN(date.getTime())) {
            return (
              <span className="text-gray-700">
                {date.toLocaleString()} {/* Adjust format as needed */}
              </span>
            );
          } else {
            return <span className="text-gray-400">Invalid Date</span>;
          }
        }

        if (Array.isArray(value)) {
          return <span>{value.join(", ")}</span>;
        }
        if (typeof value === "boolean") {
          return (
            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                value
                  ? "text-green-700 bg-green-100"
                  : "text-red-700 bg-red-100"
              }`}
            >
              {value ? "Yes" : "No"}
            </span>
          );
        }
        if (typeof value === "object" && value !== null) {
          return <span>{JSON.stringify(value)}</span>;
        }
        return <span>{value}</span>;
      },
    }));

    // Add "Actions" column
    cols.push({
      title: "Actions",
      key: "actions",
      dataIndex: "actions",
      render: (text: any, record: User): React.ReactNode => (
        <button
          onClick={() => {
            setSelectedUser(record);
            setIsSidebarOpen(true);
          }}
          className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <FaFilter className="mr-2" /> View
        </button>
      ),
    });

    return cols;
  };

  const columns: Column[] = useMemo(() => renderColumns(), [attributes]);

  // Calculate total pages
  const totalPages: number = Math.ceil(filteredData.length / usersPerPage);

  // Get current page users
  const indexOfLastUser: number = currentPage * usersPerPage;
  const indexOfFirstUser: number = indexOfLastUser - usersPerPage;
  const currentUsers: User[] = filteredData.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

  // Function to handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Function to render pagination controls with a maximum of 5 page numbers and ellipses
  const renderPagination = () => {
    // Calculate total pages
    const totalPages: number = Math.ceil(filteredData.length / usersPerPage);

    // If no pages, don't render pagination
    if (totalPages === 0) return null;

    // Helper function to generate the pagination range
    const getPaginationRange = (): (number | string)[] => {
      const maxPageButtons = 5; // Maximum number of page buttons to display
      const pages: (number | string)[] = [];

      if (totalPages <= maxPageButtons) {
        // If total pages less than or equal to max, show all pages
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const half = Math.floor(maxPageButtons / 2);
        let start = currentPage - half;
        let end = currentPage + half;

        // Adjust start and end if they exceed the limits
        if (start <= 1) {
          start = 1;
          end = maxPageButtons;
        } else if (end >= totalPages) {
          start = totalPages - maxPageButtons + 1;
          end = totalPages;
        }

        // Add the first page
        if (start > 1) {
          pages.push(1);
          if (start > 2) {
            pages.push("...");
          }
        }

        // Add the range of pages
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }

        // Add the last page
        if (end < totalPages) {
          if (end < totalPages - 1) {
            pages.push("...");
          }
          pages.push(totalPages);
        }
      }

      return pages;
    };

    const paginationRange = getPaginationRange();

    return (
      <div className="flex justify-center items-center mt-6">
        <nav className="inline-flex -space-x-px" aria-label="Pagination">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 ${
              currentPage === 1
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            }`}
          >
            Previous
          </button>

          {/* Page Numbers with Ellipsis */}
          {paginationRange.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-4 py-2 text-gray-500 bg-white border border-gray-300"
                >
                  ...
                </span>
              );
            } else {
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(Number(page))}
                  className={`px-4 py-2 leading-tight border border-gray-300 ${
                    currentPage === page
                      ? "text-white bg-indigo-600 hover:bg-indigo-700"
                      : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  {page}
                </button>
              );
            }
          })}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 ${
              currentPage === totalPages
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            }`}
          >
            Next
          </button>
        </nav>
      </div>
    );
  };

  // Function to convert filteredData to CSV
  const downloadCSV = () => {
    if (filteredData.length === 0) {
      alert("No data to download.");
      return;
    }

    // Combine top-level and attributes into a single object for each user
    const csvData: Record<string, any>[] = filteredData.map((user: User) => {
      const flattenedUser: Record<string, any> = { ...user };
      if (user.attributes) {
        Object.keys(user.attributes).forEach((attrKey: string) => {
          let attrValue: any = user.attributes![attrKey][0] || "";
          // Format 'createdTimestamp' if present
          if (attrKey === "createdTimestamp") {
            const date = new Date(attrValue);
            if (!isNaN(date.getTime())) {
              attrValue = date.toLocaleString(); // Adjust format as needed
            } else {
              attrValue = "Invalid Date";
            }
          }
          flattenedUser[attrKey] = attrValue;
        });
        delete flattenedUser.attributes;
      }
      // Remove unwanted fields
      delete flattenedUser.disableableCredentialTypes;
      delete flattenedUser.totp;
      delete flattenedUser.access;
      delete flattenedUser.notBefore;
      delete flattenedUser.requiredActions;
      return flattenedUser;
    });

    // Extract headers
    const headers: string[] = Object.keys(csvData[0]);

    // Convert to CSV string
    const csvRows: string = [
      headers.join(","), // Header row
      ...csvData.map((row: Record<string, any>) =>
        headers
          .map((header: string) => {
            let cell = row[header];
            if (typeof cell === "string") {
              // Escape double quotes by replacing " with ""
              cell = cell.replace(/"/g, '""');
              // If cell contains comma, newline, or double quotes, wrap it in double quotes
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              }
            }
            return cell;
          })
          .join(",")
      ),
    ].join("\n");

    // Create a Blob from the CSV string
    const blob: Blob = new Blob([csvRows], { type: "text/csv" });
    const url: string = window.URL.createObjectURL(blob);

    // Create a link and trigger the download
    const a: HTMLAnchorElement = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "filtered_users.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        {/* Search Input */}
        <div className="relative w-full sm:w-1/3 mb-4 sm:mb-0">
          <input
            type="text"
            placeholder="Search by username or first name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-10"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
          />
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex space-x-3">
          {/* Show/Hide Filters Button */}
          <button
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter className="mr-2" />{" "}
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          {/* Download CSV Button */}
          <button
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={downloadCSV}
          >
            <FaDownload className="mr-2" /> Download CSV
          </button>
          {/* Reset Filters Button */}
          <button
            className={`flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
              Object.keys(filters).length === 0 && searchTerm === ""
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={resetFilters}
            disabled={Object.keys(filters).length === 0 && searchTerm === ""}
          >
            <FaSyncAlt className="mr-2" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Filter Inputs with Accordion Sections */}
      {showFilters && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg shadow-md">
          {renderFilterInputs()}
          {/* Apply Filters Button */}
          <div className="flex justify-end mt-6">
            <button
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={applyFilters}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column: Column) => (
                <th
                  key={column.key}
                  className="py-2 px-4 text-center text-sm font-semibold text-gray-600"
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentUsers.length > 0 ? (
              currentUsers.map((user: User) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((column: Column) => (
                    <td
                      key={`${user.id}-${column.key}`}
                      className="py-2 px-4 whitespace-nowrap text-sm text-gray-700"
                    >
                      {column.render(null, user)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {renderPagination()}

      {/* User Details Sidebar */}
      {renderUserDetails()}
    </div>
  );
};

export default AdvancedUserFilter;
