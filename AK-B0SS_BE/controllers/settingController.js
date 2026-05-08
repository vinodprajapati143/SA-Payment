const db = require("../config/db");
const dotenv = require('dotenv');
const sanitizeHtml = require('sanitize-html');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');

dotenv.config();

const parseValue = (value, type) => {
  try {
    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true';
      case 'json':
        return JSON.parse(value);
      default:
        return value;
    }
  } catch {
    return value;
  }
};

exports.getSettings = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM app_settings WHERE is_public = 1"
    );

    const result = {};

    rows.forEach(item => {
      if (!result[item.group]) {
        result[item.group] = {};
      }

      result[item.group][item.key] = parseValue(
        item.value,
        item.type
      );
    });

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings"
    });
  }
};

exports.updateSettings = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const data = req.body;

    await connection.beginTransaction();

    for (const group in data) {
      for (const key in data[group]) {

        let value = data[group][key];
        let type = typeof value;

        // Convert value properly
        if (type === 'object') {
          value = JSON.stringify(value);
          type = 'json';
        } else if (type === 'boolean') {
          value = value.toString();
        } else if (type === 'number') {
          value = value.toString();
        }

        await connection.query(
          `INSERT INTO app_settings (\`group\`, \`key\`, \`value\`, type)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           value = VALUES(value),
           type = VALUES(type)`,
          [group, key, value, type]
        );
      }
    }

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Settings updated successfully"
    });

  } catch (error) {
    await connection.rollback();
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update settings"
    });

  } finally {
    connection.release();
  }
};