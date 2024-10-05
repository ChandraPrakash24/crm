import { useEffect, useState } from "react";

import AdvancedUserFilter from "./AdvancedUserFilter";

export const ContactsListPage: React.FC = () => {
  const [allUsersData, setAllUsersData] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch("https://admin2-dash.zata.ai/api/allusers");
      // const response = await fetch("https://admin2-dash.zata.ai/api/allusers");
      const data = await response.json();
      // console.log(data);
      setAllUsersData(data);
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">Users Data</h1>
      <AdvancedUserFilter allUsersData={allUsersData} />
    </div>
  );
};
