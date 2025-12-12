// backend/api/getNotionPage.js
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

export default async function handler(req, res) {
  try {
    const { date, type } = req.query;

    // Query by Name property instead of Date
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Name",
        title: { equals: date }   // match the exact page name
      }
    });

    if (response.results.length > 0) {
      // Found an existing page
      res.status(200).json({ url: response.results[0].url });
    } else {
      // Create a new page with Name = date string
      const newPage = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          Name: { title: [{ text: { content: date } }] },
          Date: { date: { start: date } }, // optional, can keep for sorting
          "Journal Entry Type": { select: { name: type } }
        }
      });

      res.status(200).json({ url: newPage.url });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
