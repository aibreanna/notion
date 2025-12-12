// backend/api/getNotionPage.js
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

export default async function handler(req, res) {
  try {
    const { date, type } = req.query;
    console.log("Incoming request:", { date, type });

    // Query by Name property
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Name",
        title: { equals: date }
      }
    });

    if (response.results.length > 0) {
      console.log("Found existing page:", response.results[0].url);
      res.status(200).json({ url: response.results[0].url });
    } else {
      console.log("No page found, creating new:", date, type);
      const newPage = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          Name: { title: [{ text: { content: date } }] },
          Date: { date: { start: date } },
          ...(type && { "Journal Entry Type": { select: { name: type } } })
        }
      });

      console.log("New page created:", newPage.url);
      res.status(200).json({ url: newPage.url });
    }
  } catch (error) {
    console.error("Error in getNotionPage:", error);
    res.status(500).json({ error: error.message });
  }
}
