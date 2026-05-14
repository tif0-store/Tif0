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
  "Iran",
  "Italy",
  "Japan",
  "Mexico",
  "Morocco",
  "Netherlands",
  "Portugal",
  "Qatar",
  "Saudi Arabia",
  "Senegal",
  "South Korea",
  "Spain",
  "Switzerland",
  "Tunisia",
  "Uruguay",
  "USA",
  "Wales",
]);

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function validateCustomer(customer) {
  if (!customer) {
    throw new Error("Customer details missing.");
  }

  if (!customer.firstName || !customer.lastName || !customer.email || !customer.address) {
    throw new Error("Required customer details missing.");
  }

  return {
    firstName: customer.firstName.trim(),
    lastName: customer.lastName.trim(),
    email: customer.email.trim(),
    phone: customer.phone?.trim() || "",
    address: customer.address.trim(),
    apartment: customer.apartment?.trim() || "",
    city: customer.city?.trim() || "",
    zip: customer.zip?.trim() || "",
  };
}

function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("No items in order.");
  }

  return items.map((item) => {
    const product = VALID_PRODUCTS[item.id];

    if (!product) {
      throw new Error("Invalid product.");
    }

    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error(`Invalid quantity for ${product.name}`);
    }

    if (!product.sizes.includes(item.selectedSize)) {
      throw new Error(`Invalid size for ${product.name}`);
    }

    let selectedCountries = [];

    if (product.type === "bundle") {
      selectedCountries = item.selectedCountries || [];

      if (selectedCountries.length !== 3) {
        throw new Error("Bundle requires 3 countries.");
      }

      if (new Set(selectedCountries).size !== selectedCountries.length) {
        throw new Error("Duplicate bundle countries.");
      }

      for (const country of selectedCountries) {
        if (!VALID_WORLD_CUP_NATIONS.has(country)) {
          throw new Error(`Invalid country: ${country}`);
        }
      }
    }

    return {
      id: item.id,
      name: product.name,
      quantity,
      price: product.price,
      selectedSize: item.selectedSize,
      selectedSizeLabel: item.selectedSizeLabel || item.selectedSize,
      selectedCountries,
      lineTotal: roundMoney(product.price * quantity),
    };
  });
}

function formatItems(items = []) {
  return items
    .map((item) => {
      const size = item.selectedSizeLabel || item.selectedSize;
      const countries = item.selectedCountries?.length
        ? ` | Flags: ${item.selectedCountries.join(", ")}`
        : "";

      return `${item.quantity}x ${item.name} (${size}) — $${item.price}${countries}`;
    })
    .join("\n");
}

async function saveOrderToNotion(order) {
  return notion.pages.create({
    parent: {
      database_id: process.env.NOTION_ORDERS_DATABASE_ID,
    },

    properties: {
      "Order ID": {
        title: [{ text: { content: order.id } }],
      },

      "Customer Name": {
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

      Address: {
        rich_text: [
          {
            text: {
              content: `${order.customer.address}, ${order.customer.city}, ${order.customer.zip}`,
            },
          },
        ],
      },

      Items: {
        rich_text: [
          {
            text: {
              content: formatItems(order.items),
            },
          },
        ],
      },

      Total: {
        number: order.total,
      },

      Status: {
        status: {
          name: "Pending",
        },
      },
    },
  });
}

async function sendBrevoEmail(order) {
  console.log("Sending premium white TIF0 email template...");

  const itemsHtml = order.items
    .map((item) => {
      const size = escapeHtml(
        item.selectedSizeLabel || item.selectedSize || "One Size"
      );

      const countries = item.selectedCountries?.length
        ? `
          <div style="margin-top:8px;color:#006a4e;font-size:13px;font-weight:700;">
            Flags: ${escapeHtml(item.selectedCountries.join(", "))}
          </div>
        `
        : "";

      return `
        <tr>
          <td style="padding:18px 0;border-bottom:1px solid #eeeeee;">
            <div style="font-size:16px;font-weight:900;color:#111111;">
              ${item.quantity}x ${escapeHtml(item.name)}
            </div>

            <div style="margin-top:6px;font-size:13px;color:#666666;">
              Size: <strong style="color:#111111;">${size}</strong>
            </div>

            ${countries}
          </td>

          <td align="right" style="padding:18px 0;border-bottom:1px solid #eeeeee;font-size:16px;font-weight:900;color:#da291c;">
            $${item.lineTotal.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL,
      },

      to: [
        {
          email: order.customer.email,
          name: `${order.customer.firstName} ${order.customer.lastName}`,
        },
      ],

      subject: `Your TIF0 order is confirmed — ${order.id}`,

      htmlContent: `
        <div style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;color:#111111;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f8f8f6;padding:34px 12px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;background:#ffffff;border-radius:30px;overflow:hidden;border:2px solid #da291c;">
                  
                  <tr>
                    <td style="background:#ffffff;padding:34px 28px;text-align:center;">
  <a
    href="https://tif0-store-tif0-s-projects.vercel.app"
    target="_blank"
    style="text-decoration:none;display:inline-block;"
  >
    <img
      src="https://doeantbttqofenfvmjyo.supabase.co/storage/v1/object/public/Tif0/TIF0.png"
      alt="TIF0"
      width="180"
      style="
        display:block;
        margin:0 auto;
        width:180px;
        max-width:180px;
        height:auto;
        border:0;
        outline:none;
        text-decoration:none;
      "
    />
  </a>

  <div style="margin-top:12px;font-size:12px;font-weight:900;letter-spacing:4px;color:#000000;text-transform:uppercase;">
    Order Confirmed
  </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:34px 30px 18px;text-align:center;">
                      <div style="display:inline-block;background:#006a4e;color:#ffffff;border-radius:999px;padding:10px 18px;font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
                        We received your order
                      </div>

                      <h1 style="margin:22px 0 0;font-size:32px;line-height:1.15;color:#111111;">
                        Thank you, ${escapeHtml(order.customer.firstName)}.
                      </h1>

                      <p style="margin:14px auto 0;max-width:440px;font-size:15px;line-height:1.7;color:#555555;">
                        Your TIF0 order is confirmed. We’ll review it and contact you soon with the next steps.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:12px 30px;">
                      <table width="100%" role="presentation" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;border:2px solid #da291c;">
                        <tr>
                          <td style="padding:22px;">
                            <div style="font-size:11px;font-weight:900;letter-spacing:3px;color:#da291c;text-transform:uppercase;">
                              Order ID
                            </div>

                            <div style="margin-top:8px;font-size:20px;font-weight:900;color:#fffff;">
                              ${escapeHtml(order.id)}
                            </div>
                          </td>

                          <td align="right" style="padding:22px;">
                            <div style="font-size:11px;font-weight:900;letter-spacing:3px;color:#da291c;text-transform:uppercase;">
                              Total
                            </div>

                            <div style="margin-top:8px;font-size:28px;font-weight:900;color:#da291c;">
                              $${order.total.toFixed(2)}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:24px 30px 0;">
                      <div style="font-size:12px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#da291c;">
                        Order Summary
                      </div>

                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        ${itemsHtml}
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:28px 30px 8px;">
                      <div style="background:#f8f8f6;border-radius:24px;padding:22px;border:1px solid #eeeeee;">
                        <div
  style="
    font-size:12px;
    font-weight:900;
    letter-spacing:3px;
    text-transform:uppercase;
    color:#006a4e;
    text-align:center;
  "
>
  Shipping Address
</div>

                        <p
  style="
    margin:14px 0 0;
    font-size:15px;
    line-height:1.7;
    color:#333333;
    text-align:center;
  "
>
                          <strong>
                            ${escapeHtml(order.customer.firstName)} ${escapeHtml(order.customer.lastName)},
                            ${escapeHtml(order.customer.phone)}
                            </strong><br />
                          ${escapeHtml(order.customer.address)}<br />
                          ${order.customer.apartment
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

// Keeps local backend alive
setInterval(() => { }, 1000);
