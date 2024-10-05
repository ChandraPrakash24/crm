import React, { useEffect, useState, lazy, Suspense } from "react";
import axios from "axios";
import { Button, Card, Spin } from "antd";
import { Text } from "@/components";
import { BarOptions as G2plotConfig } from '@antv/g2plot';
import { BaseConfig } from "@ant-design/plots";

const BarChart = lazy(() => import("@ant-design/plots/es/components/bar"));

export interface BarConfig extends Omit<G2plotConfig, 'tooltip'>, BaseConfig<G2plotConfig> {}

type DealData = {
  timeText: string;
  value: number;
  state: string;
};

export const DashboardDealsChart: React.FC = () => {
  const [dealData, setDealData] = useState<DealData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://neev-system.neevcloud.org/api/getactive");
        const data = response.data;

        const transformedData: DealData[] = [
          { timeText: "Active", value: data.active, state: "Active User" },
          { timeText: "Suspended", value: data.suspended, state: "Suspended Users" },
          { timeText: "New", value: data.new, state: "New Users" },
        ];

        setDealData(transformedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const config: BarConfig = {
    data: dealData,
    xField: "value",
    yField: "timeText",
    seriesField: "state",
    isStack: true,
    color: (datum) => {
      return datum.state === "Active User"
        ? "#52C41A"
        : datum.state === "Suspended Users"
        ? "#F5222D"
        : "#1890FF";
    },
    legend: {
      position: "top-left", // Ensure this is correct as per the types allowed
    },
    tooltip: {
      customContent: (title: any, items: any[]) => {
        return `<div>${items.map(item => `<p>${item.name}: ${item.value}</p>`).join('')}</div>`;
      },
    },
    interactions: [{ type: "active-region" }],
  };

  return (
    <Card
      className="h-full w-full"
      headStyle={{ padding: "8px 16px" }}
      bodyStyle={{ padding: "24px 24px 0px 24px" }}
      title={
        <div className="flex items-center gap-2">
          <Text size="sm" className="ml-2">
            Deals
          </Text>
        </div>
      }
    >
      {loading ? (
        <div className="flex justify-center items-center h-80">
          <Spin size="large" />
        </div>
      ) : (
        <Suspense fallback={<div>Loading...</div>}>
          <BarChart {...config} height={325} />
        </Suspense>
      )}
    </Card>
  );
};
