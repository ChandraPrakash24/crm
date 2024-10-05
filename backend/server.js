import express from "express";
import axios from "axios";
import cors from "cors";
import NodeCache from "node-cache";
import createCsvStringifier from "csv-writer";
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
const REALM = process.env.REALM;
const REALM_ALLUSERS = process.env.REALM_ALLUSERS;
const CLIENT_ID = process.env.CLIENT_ID;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const PASSWORD = process.env.PASSWORD;

const HARD_CODED_EMAIL = process.env.HARD_CODED_EMAIL;
const HARD_CODED_PASSWORD = process.env.HARD_CODED_PASSWORD;


const cache = new NodeCache({ stdTTL: 60 }); // Cache for 1 minutes

let accessToken = null;
let tokenExpiration = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiration) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: "password",
        client_id: CLIENT_ID,
        username: ADMIN_USERNAME,
        password: PASSWORD,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiration = Date.now() + response.data.expires_in * 1000;
    return accessToken;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

app.get("/api/users", async (req, res) => {
  try {
    const token = await getAccessToken();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const emailVerified = req.query.emailVerified;
    const enabled = req.query.enabled;
    const utmSource = req.query.utm_source;
    const utmMedium = req.query.utm_medium;
    const utmCampaign = req.query.utm_campaign;
    const utmTerm = req.query.utm_term;
    const utmContent = req.query.utm_content;
    const country = req.query.country;
    const how = req.query.how;
    const storage = req.query.storage;

    let params = {
      first: (page - 1) * limit,
      max: limit,
    };

    if (search) {
      params.search = search;
    }

    if (emailVerified !== undefined) {
      params.emailVerified = emailVerified === "true";
    }

    if (enabled !== undefined) {
      params.enabled = enabled === "true";
    }

    // Add UTM and other attribute filters
    const attributeFilters = {
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      country,
      how,
      storage,
    };
    Object.entries(attributeFilters).forEach(([key, value]) => {
      if (value) {
        params[`attribute.${key}`] = value;
      }
    });

    const response = await axios.get(
      `${KEYCLOAK_URL}/admin/realms/zata/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: params,
      }
    );

    // Get total count of users
    const countResponse = await axios.get(
      `${KEYCLOAK_URL}/admin/realms/${REALM_ALLUSERS}/users/count`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          search: search,
          emailVerified: emailVerified,
          enabled: enabled,
        },
      }
    );

    const totalUsers = countResponse.data;
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users: response.data,
      currentPage: page,
      totalPages: totalPages,
      totalUsers: totalUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/allusers", async (req, res) => {
  try {
    const token = await getAccessToken();

    const allResponse = await axios.get(
      // `${KEYCLOAK_URL}/admin/realms/${REALM}/users`, // this won't work
      `${KEYCLOAK_URL}/admin/realms/zata/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Send only the user data (allResponse.data)
    res.json(allResponse.data); // This will send the actual array of users
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login Route
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  // Validate request
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  // Check credentials
  if (email === HARD_CODED_EMAIL && password === HARD_CODED_PASSWORD) {
    // In a real application, you'd generate a token here
    // userzata@example.com
    // i want to send data like this:{"id": 1,"email": "userzata@example.com" }
    return res.status(200).json({
      message: "Login successful.",
      user: { id: 1, email: "noel@neevcloud.com" },
    });
  } else {
    return res.status(401).json({ message: "Invalid email or password." });
  }
});

// The /api/dashboard endpoint
app.get("/api/dashboard", async (req, res) => {
  try {
    const token = await getAccessToken();

    // Fetch users from Keycloak
    const response = await axios.get(
      `${KEYCLOAK_URL}/admin/realms/${REALM_ALLUSERS}/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const users = response.data;

    // Calculate Summary Statistics
    const totalUsers = users.length;
    const verifiedEmails = users.filter((user) => user.emailVerified).length;
    const unverifiedEmails = totalUsers - verifiedEmails;
    const enabledAccounts = users.filter((user) => user.enabled).length;
    const totpEnabled = users.filter((user) => user.totp).length;
    const usersNeedingVerification = users.filter((user) =>
      user.requiredActions.includes("VERIFY_EMAIL")
    ).length;

    // Prepare simplified data
    const summary = {
      totalUsers,
      verifiedEmails: {
        count: verifiedEmails,
        percentage: ((verifiedEmails / totalUsers) * 100).toFixed(2) + "%",
      },
      unverifiedEmails: {
        count: unverifiedEmails,
        percentage: ((unverifiedEmails / totalUsers) * 100).toFixed(2) + "%",
      },
      enabledAccounts: {
        count: enabledAccounts,
        percentage: ((enabledAccounts / totalUsers) * 100).toFixed(2) + "%",
      },
      totpEnabled: {
        count: totpEnabled,
        percentage: ((totpEnabled / totalUsers) * 100).toFixed(2) + "%",
      },
      usersNeedingVerification,
    };

    // Send the summary as the response
    // console.log(summary);
    res.json({ summary });
  } catch (error) {
    console.error(
      "Error fetching dashboard data:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/users/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const token = await getAccessToken();

    // Fetch user metadata first
    const userMetadata = await axios.get(
      `${KEYCLOAK_URL}/admin/realms/${REALM_ALLUSERS}/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          briefRepresentation: true,
        },
      }
    );

    const cachedUser = cache.get(`user_${userId}`);
    if (
      cachedUser &&
      cachedUser.updatedTimestamp === userMetadata.data.updatedTimestamp
    ) {
      return res.json(cachedUser);
    }

    // If not in cache or outdated, fetch full user data
    const fullUserData = await axios.get(
      `${KEYCLOAK_URL}/admin/realms/${REALM_ALLUSERS}/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    cache.set(`user_${userId}`, fullUserData.data);
    res.json(fullUserData.data);
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(error.response?.status || 500)
      .json({ error: "Internal Server Error" });
  }
});

// Add this new endpoint to clear the cache
app.post("/api/clear-cache", (req, res) => {
  cache.flushAll();
  res.json({ message: "Cache cleared successfully" });
});

app.get("/api/users/export", async (req, res) => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(
      `${KEYCLOAK_URL}/admin/realms/${REALM_ALLUSERS}/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const csvStringifier = createCsvStringifier({
      header: [
        { id: "id", title: "ID" },
        { id: "username", title: "Username" },
        { id: "firstName", title: "First Name" },
        { id: "lastName", title: "Last Name" },
        { id: "email", title: "Email" },
        { id: "emailVerified", title: "Email Verified" },
        { id: "enabled", title: "Enabled" },
      ],
    });

    const csvString =
      csvStringifier.getHeaderString() +
      csvStringifier.stringifyRecords(response.data);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users.csv");
    res.send(csvString);
  } catch (error) {
    console.error("Error exporting users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
