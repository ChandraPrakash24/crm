import React, { FC, PropsWithChildren, useState, useEffect } from "react";
import { Card } from "antd";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import styles from "./index.module.css";
import { AreaConfig } from "@ant-design/plots";

const Area = React.lazy(() => import("@ant-design/plots/es/components/area"));

export const DashboardTotalCountCard: React.FC<{
  resource: Type;
}> = ({ resource }) => {
  const { primaryColor, secondaryColor, icon, title, status } = variants[resource];

  const [userCount, setUserCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axios.get("https://neev-system.neevcloud.org/api/getactive");
        console.log("API Response:", response.data);
        
        // Update the count based on the status
        const count = response.data[status.toLowerCase()];
        setUserCount(count);
        setLoading(false);
      } catch (err) {
        console.error("Error during API call:", err);
        setError("Failed to fetch counts");
        setLoading(false);
      }
    };

    fetchCounts();
  }, [status]);

  const config: AreaConfig = {
    className: styles.area,
    appendPadding: [1, 0, 0, 0],
    padding: 0,
    syncViewPadding: true,
    data: [
      { index: title, value: userCount },
    ],
    autoFit: true,
    tooltip: false,
    animation: false,
    xField: "index",
    yField: "value",
    xAxis: false,
    yAxis: {
      tickCount: 12,
      label: {
        style: {
          fill: "transparent",
        },
      },
      grid: {
        line: {
          style: {
            stroke: "transparent",
          },
        },
      },
    },
    smooth: true,
    areaStyle: () => {
      return {
        fill: `l(270) 0:#fff 0.2:${secondaryColor} 1:${primaryColor}`,
      };
    },
    line: {
      color: primaryColor,
    },
  };

  return (
    <Card
      style={{ height: "96px", padding: 0 }}
      bodyStyle={{
        padding: "8px 8px 8px 12px",
      }}
      size="small"
    >
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap",
          }}
        >
          {icon}
          <div style={{ marginLeft: "8px" }}>
            <div style={{ fontSize: "15px", fontWeight: 500 }}>{title}</div>
            <div style={{ fontSize: "22px", fontWeight: 700, marginTop: "8px" }}>
              {loading ? <Skeleton width={50} /> : ` ${userCount}`}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const IconWrapper: FC<PropsWithChildren<{ color: string }>> = ({
  color,
  children,
}) => {
  return (
    <div
      className={`flex items-center justify-center w-8 h-8 rounded-full ${color}`}
      style={{ backgroundColor: color }}
    >
      {children}
    </div>
  );
};

type Type = "companies" | "contacts" | "deals";

const variants: {
  [key in Type]: {
    primaryColor: string;
    secondaryColor?: string;
    icon: React.ReactNode;
    title: string;
    status: string;
  };
} = {
  companies: {
    primaryColor: "#1677FF",
    secondaryColor: "bg-blue-100",
    icon: (
      <IconWrapper color="bg-blue-200">
        <i className="fas fa-building"></i>
      </IconWrapper>
    ),
    title: "Active Users",
    status: "ACTIVE",
  },
  contacts: {
    primaryColor: "#52C41A",
    secondaryColor: "bg-green-100",
    icon: (
      <IconWrapper color="bg-green-200">
        <i className="fas fa-users"></i>
      </IconWrapper>
    ),
    title: "New Users",
    status: "NEW",
  },
  deals: {
    primaryColor: "#FA541C",
    secondaryColor: "bg-red-100",
    icon: (
      <IconWrapper color="bg-red-200">
        <i className="fas fa-exclamation-circle"></i>
      </IconWrapper>
    ),
    title: "Suspended Users",
    status: "SUSPENDED",
  },
};

export default DashboardTotalCountCard;
