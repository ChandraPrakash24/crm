import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import this for navigation
import { useGetIdentity } from "@refinedev/core";
import { Button, Popover } from "antd";
import { CustomAvatar } from "../custom-avatar";
import { Text } from "../text";
import { AccountSettings } from "./account-settings";
import { User } from "@/graphql/schema.types";

export const CurrentUser: React.FC = () => {
  const [opened, setOpened] = useState(false);
  const { data: user } = useGetIdentity<User>();
  const navigate = useNavigate(); // Use this to redirect the user

  const handleLogout = () => {
    // Clear the user data
    localStorage.removeItem('user'); // or sessionStorage.removeItem('user');
    
    // Redirect to the login page
    navigate('/login');
  };

  const content = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Text
        strong
        style={{
          padding: "12px 20px",
        }}
      >
        {user?.name || "Admin"}
      </Text>
      <div
        style={{
          borderTop: "1px solid #d9d9d9",
          padding: "4px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <Button
          style={{ textAlign: "left" }}
          type="text"
          danger
          block
          onClick={handleLogout} // Use the logout function here
        >
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Popover
        placement="bottomRight"
        content={content}
        trigger="click"
        overlayInnerStyle={{ padding: 0 }}
        overlayStyle={{ zIndex: 999 }}
      >
        <CustomAvatar
          name={user?.name || "User Name"}
          src={user?.avatarUrl}
          size="default"
          style={{ cursor: "pointer" }}
        />
      </Popover>
      {user && (
        <AccountSettings
          opened={opened}
          setOpened={setOpened}
          userId={user.id}
        />
      )}
    </>
  );
};
