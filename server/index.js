import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

app.use(cors());
app.use(express.json());

const VALID_PRODUCTS = {
  "flag-3pk": {
    name: "3 Pack Flags",
    price: 29.99,
    category: "flags",
    type: "bundle",
    sizes: ["2x3ft", "3x5ft", "4x6ft"],
    bundleCount: 3,
  },
  "flag-america": {
    name: "America Flag",
    price: 14.99,
    category: "flags",
    type: "single",
    sizes: ["2x3ft", "3x5ft", "4x6ft"],
  },
  "flag-canada": {
    name: "Canada Flag",
    price: 14.99,
    category: "flags",
    type: "single",
    sizes: ["2x3ft", "3x5ft", "4x6ft"],
  },
  "flag-mexico": {
    name: "Mexico Flag",
    price: 14.99,
    category: "flags",
    type: "single",
    sizes: ["2x3ft", "3x5ft", "4x6ft"],
  },
  "jersey-brazil": {
    name: "Brazil Jersey",
    price: 34.99,
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  "jersey-portugal": {
    name: "Portugal Jersey",
    price: 34.99,
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  "jersey-argentina": {
    name: "Argentina Jersey",
    price: 34.99,
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
};

const VALID_WORLD_CUP_NATIONS = new Set([
  "Argentina",
  "Australia",
  "Belgium",
  "Brazil",
  "Canada",
  "Colombia",
  "Croatia",
  "Denmark",
  "England",
  "France",
  "Germany",
  "Ghana",
  "Italy",
  "Japan",
  "Mexico",
  "Morocco",
  "Netherlands",
  "Portugal",
  "South Korea",
  "Spain",
  "United States",
  "Uruguay",
]);

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

function validateCustomer(customer = {}) {
  const required = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "address",
    "city",
    "zip",
  ];

  for (const field of required) {
    if (!customer[field] || String(customer[field]).trim() === "") {
      throw new Error(`Missing customer field: ${field}`);
    }
  }

  return {
    firstName: String(customer.firstName).trim(),
    lastName: String(customer.lastName).trim(),
    email: String(customer.email).trim(),
    phone: String(customer.phone).trim(),
    address: String(customer.address).trim(),
    apartment: customer.apartment ? String(customer.apartment).trim() : "",
    city: String(customer.city).trim(),
    zip: String(customer.zip).trim(),
  };
}

function validateItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart is empty.");
  }

  return items.map((item) => {
    const productId = item.id || item.productId;
    const product = VALID_PRODUCTS[productId];

    if (!product) {
      throw new Error(`Invalid product: ${productId}`);
    }

    const quantity = Number(item.quantity || 1);

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Invalid quantity.");
    }

    const selectedSize =
      item.selectedSize || item.selectedSizeLabel || item.size || product.sizes[0];

    if (!product.sizes.includes(selectedSize)) {
      throw new Error(`Invalid size for ${product.name}.`);
    }

    let selectedCountries = [];

    if (product.type === "bundle") {
      selectedCountries = Array.isArray(item.selectedCountries)
        ? item.selectedCountries
        : [];

      if (selectedCountries.length !== product.bundleCount) {
        throw new Error(`${product.name} requires ${product.bundleCount} countries.`);
      }

      for (const country of selectedCountries) {
        if (!VALID_WORLD_CUP_NATIONS.has(country)) {
          throw new Error(`Invalid country: ${country}`);
        }
      }
    }

    const lineTotal = roundMoney(product.price * quantity);

    return {
      id: productId,
      name: product.name,
      price: product.price,
      quantity,
      selectedSize,
      selectedSizeLabel: selectedSize,
      selectedCountries,
      lineTotal,
    };
  });
}

function formatItemsText(items = []) {
  return items
    .map((item) => {
      const flags =
        item.selectedCountries?.length > 0
          ? ` | Flags: ${item.selectedCountries.join(", ")}`
          : "";

      return `${item.quantity}x ${item.name} (${item.selectedSize}) - $${item.lineTotal.toFixed(
        2
      )}${flags}`;
    })
    .join("\n");
}

function formatItemsHtml(items = []) {
  return items
    .map((item) => {
      const countries =
        item.selectedCountries?.length > 0
          ? `
            <div style="margin-top:6px;font-size:13px;color:#666666;">
              Flags: ${escapeHtml(item.selectedCountries.join(", "))}
            </div>
          `
          : "";

      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #eeeeee;">
            <div style="font-size:15px;font-weight:800;color:#111111;">
              ${escapeHtml(item.quantity)}x ${escapeHtml(item.name)}
            </div>
            <div style="margin-top:4px;font-size:13px;color:#666666;">
              Size: ${escapeHtml(item.selectedSize)}
            </div>
            ${countries}
          </td>
          <td style="padding:14px 0;border-bottom:1px solid #eeeeee;text-align:right;font-size:15px;font-weight:800;color:#111111;">
            $${item.lineTotal.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");
}

async function saveOrderToNotion(order) {
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    console.log("Skipping Notion save: missing Notion env vars.");
    return;
  }

  await notion.pages.create({
    parent: {
      database_id: process.env.NOTION_DATABASE_ID,
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: order.id,
            },
          },
        ],
      },
      Customer: {
        rich_text: [
          {
            text: {
              content: `${order.customer.firstName} ${order.customer.lastName}`,
            },
          },
        ],
      },
      Email: {
        email: order.customer.email,
      },
      Phone: {
        phone_number: order.customer.phone,
      },
      Total: {
        number: order.total,
      },
      Items: {
        rich_text: [
          {
            text: {
              content: formatItemsText(order.items),
            },
          },
        ],
      },
      Address: {
        rich_text: [
          {
            text: {
              content: `${order.customer.address}${
                order.customer.apartment ? `, ${order.customer.apartment}` : ""
              }, ${order.customer.city}, ${order.customer.zip}`,
            },
          },
        ],
      },
    },
  });
}

async function sendBrevoEmail(order) {
  if (!process.env.BREVO_API_KEY) {
    console.log("Skipping Brevo email: missing BREVO_API_KEY.");
    return;
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || "orders@tif0.store";
  const senderName = process.env.BREVO_SENDER_NAME || "TIF0";

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [
        {
          email: order.customer.email,
          name: `${order.customer.firstName} ${order.customer.lastName}`,
        },
      ],
      subject: `TIF0 Order Confirmation - ${order.id}`,
      htmlContent: `
        <div style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#111111;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f5f5f5;padding:30px 12px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eaeaea;">
                  
                  <tr>
                    <td style="background:#111111;padding:34px 28px;text-align:center;">
                      <div style="font-size:34px;font-weight:900;letter-spacing:5px;color:#ffffff;">
                        TIF0
                      </div>
                      <div style="margin-top:8px;font-size:12px;font-weight:800;letter-spacing:2px;color:#cccccc;text-transform:uppercase;">
                        Order Confirmation
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:32px 30px 16px;text-align:center;">
                      <h1 style="margin:0;font-size:26px;line-height:1.3;font-weight:900;color:#111111;">
                        Thank you, ${escapeHtml(order.customer.firstName)}!
                      </h1>

                      <p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:#555555;">
                        Your order has been received successfully. We’ll contact you soon with updates.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:10px 30px 0;">
                      <div style="background:#f7f7f7;border:1px solid #eeeeee;border-radius:14px;padding:18px;text-align:center;">
                        <div style="font-size:12px;font-weight:900;letter-spacing:2px;color:#006a4e;text-transform:uppercase;">
                          Order ID
                        </div>
                        <div style="margin-top:8px;font-size:18px;font-weight:900;color:#111111;">
                          ${escapeHtml(order.id)}
                        </div>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:28px 30px 0;">
                      <h2 style="margin:0 0 12px;font-size:18px;font-weight:900;color:#111111;">
                        Order Summary
                      </h2>

                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        ${formatItemsHtml(order.items)}

                        <tr>
                          <td style="padding:18px 0;font-size:18px;font-weight:900;color:#111111;">
                            Total
                          </td>
                          <td style="padding:18px 0;text-align:right;font-size:18px;font-weight:900;color:#111111;">
                            $${order.total.toFixed(2)}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 30px 0;">
                      <div style="background:#ffffff;border:1px solid #eeeeee;border-radius:14px;padding:20px;text-align:center;">
                        <div style="font-size:12px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#006a4e;">
                          Shipping Address
                        </div>

                        <p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:#333333;">
                          <strong>
                            ${escapeHtml(order.customer.firstName)} ${escapeHtml(order.customer.lastName)}
                          </strong><br />
                          ${escapeHtml(order.customer.phone)}<br />
                          ${escapeHtml(order.customer.address)}<br />
                          ${
                            order.customer.apartment
                              ? `${escapeHtml(order.customer.apartment)}<br />`
                              : ""
                          }
                          ${escapeHtml(order.customer.city)}, ${escapeHtml(order.customer.zip)}
                        </p>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:26px 30px 34px;text-align:center;">
                      <p style="margin:0;font-size:14px;line-height:1.7;color:#666666;">
                        Keep this email for your records. Reply here if you need help with your order.
                      </p>

                      <div style="margin-top:24px;padding-top:22px;border-top:1px solid #eeeeee;">
                        <div style="font-size:18px;font-weight:900;letter-spacing:3px;color:#111111;">
                          TIF0
                        </div>

                        <div style="margin-top:8px;font-size:11px;font-weight:800;letter-spacing:2px;color:#888888;text-transform:uppercase;">
                          Football culture. National pride. Streetwear energy.
                        </div>
                      </div>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Brevo failed: ${error}`);
  }

  return response.json();
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TIF0 backend running",
  });
});

app.post("/api/orders", async (req, res) => {
  try {
    const validatedCustomer = validateCustomer(req.body.customer);
    const validatedItems = validateItems(req.body.items);

    const total = roundMoney(
      validatedItems.reduce((sum, item) => sum + item.lineTotal, 0)
    );

    const order = {
      id: `TIF0-${Date.now()}`,
      customer: validatedCustomer,
      items: validatedItems,
      total,
    };

    await saveOrderToNotion(order);
    await sendBrevoEmail(order);

    res.status(201).json({
      success: true,
      orderId: order.id,
      total,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("SERVER ERROR:", error);
});
