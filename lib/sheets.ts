import { google } from "googleapis";

export interface Listing {
  id: string;
  sport: string;
  teamName: string;
  organization: string;
  category: "Recreational" | "Competitive";
  level: string;
  ageGroup: string;
  city: string;
  zip: string;
  coachName: string;
  coachContact: string;
  coachEmail: string;
  practiceLocation: string;
  tryoutDate: string;
  tryoutTime: string;
  tryoutLocation: string;
  tryoutAddress: string;
  tryoutDate2: string;
  tryoutTime2: string;
  tryoutLocation2: string;
  tryoutAddress2: string;
  tryoutDate3: string;
  tryoutTime3: string;
  tryoutLocation3: string;
  tryoutAddress3: string;
  website: string;
  registrationUrl: string;
  notes: string;
  status: string;
}

function getAuth() {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credentialsJson) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON not set");
  const credentials = JSON.parse(credentialsJson);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function getListings(): Promise<Listing[]> {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEET_ID not set");

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Listings!A2:AC",
  });

  const rows = res.data.values || [];
  return rows
    .filter((row) => row[28]?.toLowerCase() === "active")
    .map((row) => ({
      id: row[0] || "",
      sport: row[1] || "",
      teamName: row[2] || "",
      organization: row[3] || "",
      category: row[4] || "",
      level: row[5] || "",
      ageGroup: row[6] || "",
      city: row[7] || "",
      zip: row[8] || "",
      coachName: row[9] || "",
      coachContact: row[10] || "",
      coachEmail: row[11] || "",
      practiceLocation: row[12] || "",
      tryoutDate: row[13] || "",
      tryoutTime: row[14] || "",
      tryoutLocation: row[15] || "",
      tryoutAddress: row[16] || "",
      tryoutDate2: row[17] || "",
      tryoutTime2: row[18] || "",
      tryoutLocation2: row[19] || "",
      tryoutAddress2: row[20] || "",
      tryoutDate3: row[21] || "",
      tryoutTime3: row[22] || "",
      tryoutLocation3: row[23] || "",
      tryoutAddress3: row[24] || "",
      website: row[25] || "",
      registrationUrl: row[26] || "",
      notes: row[27] || "",
      status: row[28] || "",
    }));
}

export async function appendSubmission(data: Omit<Listing, "id" | "status">) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEET_ID not set");

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const now = new Date().toISOString();
  const row = [
    now,
    data.sport,
    data.teamName,
    data.organization,
    data.category,
    data.level,
    data.ageGroup,
    data.city,
    data.zip,
    data.coachName,
    data.coachContact,
    data.coachEmail,
    data.practiceLocation,
    data.tryoutDate,
    data.tryoutTime,
    data.tryoutLocation,
    data.tryoutAddress,
    data.tryoutDate2,
    data.tryoutTime2,
    data.tryoutLocation2,
    data.tryoutAddress2,
    data.tryoutDate3,
    data.tryoutTime3,
    data.tryoutLocation3,
    data.tryoutAddress3,
    data.website,
    data.registrationUrl,
    data.notes,
    "Pending",
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Submissions!A:U",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}
