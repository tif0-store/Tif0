import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

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
    category: "jerseys",
    type: "jersey",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  "jersey-portugal": {
    name: "Portugal Jersey",
    price: 34.99,
    category: "jerseys",
    type: "jersey",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  "jersey-argentina": {
    name: "Argentina Jersey",
    price: 34.99,
    category: "jerseys",
    type: "jersey",
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
  if (!customer || typeof customer !== "object") {
    throw new Error("Customer details are required.");
  }

  const requiredFields = ["firstName", "lastName", "email", "address"];

  for (const field of requiredFields) {
    if (!String(customer[field] || "").trim()) {
      throw new Error(`Customer ${field} is required.`);
    }
  }

  const email = String(customer.email).trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid email address is required.");
  }

  return {
    firstName: String(customer.firstName).trim(),
    lastName: String(customer.lastName).trim(),
    email,
    phone: String(customer.phone || "").trim(),
    address: String(customer.address).trim(),
    apartment: String(customer.apartment || "").trim(),
    city: String(customer.city || "").trim(),
    zip: String(customer.zip || "").trim(),
  };
}

function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("At least one item is required.");
  }

  return items.map((item) => {
    const product = VALID_PRODUCTS[item?.id];

    if (!product) {
      throw new Error("Invalid product selected.");
    }

    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error(`Invalid quantity for ${product.name}.`);
    }

    const selectedSize = String(item.selectedSize || "").trim();

    if (!product.sizes.includes(selectedSize)) {
      throw new Error(`Invalid size selected for ${product.name}.`);
    }

    let selectedCountries = [];

    if (product.type === "bundle") {
      selectedCountries = Array.isArray(item.selectedCountries)
        ? item.selectedCountries.map((country) => String(country).trim()).filter(Boolean)
        : [];

      if (selectedCountries.length !== product.bundleCount) {
        throw new Error(`${product.name} requires exactly ${product.bundleCount} flags.`);
      }

      if (new Set(selectedCountries).size !== selectedCountries.length) {
        throw new Error("Bundle flags must be different countries.");
      }

      const invalidCountry = selectedCountries.find(
        (country) => !VALID_WORLD_CUP_NATIONS.has(country)
      );

      if (invalidCountry) {
        throw new Error(`Invalid bundle country: ${invalidCountry}.`);
      }
    }

    return {
      id: item.id,
      name: product.name,
      category: product.category,
      type: product.type,
      quantity,
      price: product.price,
      selectedSize,
      selectedSizeLabel: item.selectedSizeLabel || selectedSize,
      selectedCountries,
      lineTotal: roundMoney(product.price * quantity),
    };
  });
}

function formatItemLine(item) {
  const size = item.selectedSizeLabel || item.selectedSize || "One Size";
  const countries = item.selectedCountries?.length
    ? `\nFlags: ${item.selectedCountries.join(", ")}`
    : "";

  return `${item.quantity}x ${item.name} (${size}) — $${item.price.toFixed(
    2
  )} each${countries}`;
}

function formatItems(items = []) {
  return items.map(formatItemLine).join("\n");
}

function buildOrderEmailHtml(order) {
  const itemsHtml = order.items
    .map((item) => {
      const size = escapeHtml(item.selectedSizeLabel || item.selectedSize || "One Size");

      const countries = item.selectedCountries?.length
        ? `
          <div style="margin-top:6px;font-size:13px;color:#666666;">
            Flags: ${escapeHtml(item.selectedCountries.join(", "))}
          </div>
        `
        : "";

      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #eeeeee;">
            <div style="font-size:15px;font-weight:900;color:#111111;">
              ${item.quantity}x ${escapeHtml(item.name)}
            </div>
            <div style="margin-top:5px;font-size:13px;color:#777777;">
              Size: ${size}
            </div>
            ${countries}
          </td>
          <td style="padding:16px 0;border-bottom:1px solid #eeeeee;text-align:right;font-size:15px;font-weight:900;color:#da291c;">
            $${item.lineTotal.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <div style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;color:#111111;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f8f8f6;padding:34px 12px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;background:#ffffff;border-radius:30px;overflow:hidden;border:2px solid #da291c;">
              
              <tr>
                <td style="background:#ffffff;padding:34px 28px;text-align:center;">
                  <img
                    src="https://tif0-store-tif0-s-projects.vercel.app/logo.png"
                    alt="TIF0"
                    width="180"
                    style="display:block;margin:0 auto;width:180px;max-width:180px;height:auto;border:0;outline:none;text-decoration:none;"
                  />

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

                        <div style="margin-top:8px;font-size:20px;font-weight:900;color:#111111;">
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
                    <div style="font-size:12px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#006a4e;text-align:center;">
                      Shipping Address
                    </div>

                    <p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:#333333;text-align:center;">
                      <strong>
                        ${escapeHtml(order.customer.firstName)} ${escapeHtml(order.customer.lastName)}
                        ${order.customer.phone ? `, ${escapeHtml(order.customer.phone)}` : ""}
                      </strong><br />
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
  `;
}

async function sendBrevoEmail(order) {
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
      htmlContent: buildOrderEmailHtml(order),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Brevo email failed: ${error}`);
  }

  return response.json();
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
        phone_number: order.customer.phone || "",
      },
      Address: {
        rich_text: [
          {
            text: {
              content: `${order.customer.address} ${
                order.customer.apartment || ""
              }, ${order.customer.city}, ${order.customer.zip}`,
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { customer, items } = req.body;

    const validatedCustomer = validateCustomer(customer);
    const validatedItems = validateItems(items);

    const calculatedSubtotal = roundMoney(
      validatedItems.reduce((sum, item) => sum + item.lineTotal, 0)
    );

    const order = {
      id: `TIF0-${Date.now()}`,
      customer: validatedCustomer,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      total: calculatedSubtotal,
      createdAt: new Date().toISOString(),
    };

    await saveOrderToNotion(order);
    await sendBrevoEmail(order);

    return res.status(201).json({
      success: true,
      orderId: order.id,
      total: order.total,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message || "Order failed.",
    });
  }
}
