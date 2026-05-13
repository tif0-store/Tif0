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
                ? item.selectedCountries
                    .map((country) => String(country).trim())
                    .filter(Boolean)
                : [];

            if (selectedCountries.length !== product.bundleCount) {
                throw new Error(
                    `${product.name} requires exactly ${product.bundleCount} flags.`
                );
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
        ? `\n   Flags: ${item.selectedCountries.join(", ")}`
        : "";

    return `${item.quantity}x ${item.name} (${size}) — $${item.price.toFixed(
        2
    )} each${countries}`;
}

function formatItems(items = []) {
    return items.map(formatItemLine).join("\n");
}

function formatItemsHtml(items = []) {
    return items
        .map((item) => {
            const size = escapeHtml(
                item.selectedSizeLabel || item.selectedSize || "One Size"
            );

            const countries = item.selectedCountries?.length
                ? `<br /><small><strong>Flags:</strong> ${escapeHtml(
                    item.selectedCountries.join(", ")
                )}</small>`
                : "";

            return `
        <li>
          ${item.quantity}x ${escapeHtml(item.name)} (${size}) — $${item.price.toFixed(
                2
            )}
          ${countries}
        </li>
      `;
        })
        .join("");
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

            htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 24px;">
          <h2>Thank you for your order, ${escapeHtml(
                order.customer.firstName
            )}!</h2>

          <p>Your TIF0 order has been received successfully.</p>

          <div style="margin-top: 24px;">
            <p><strong>Order ID:</strong> ${escapeHtml(order.id)}</p>
            <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
          </div>

          <div style="margin-top: 24px;">
            <h3>Items</h3>

            <ul>
              ${formatItemsHtml(order.items)}
            </ul>
          </div>

          <div style="margin-top: 24px;">
            <h3>Shipping Address</h3>

            <p>
              ${escapeHtml(order.customer.firstName)} ${escapeHtml(
                order.customer.lastName
            )}<br />
              ${escapeHtml(order.customer.address)}<br />
              ${escapeHtml(order.customer.apartment || "")}<br />
              ${escapeHtml(order.customer.city)}, ${escapeHtml(
                order.customer.zip
            )}
            </p>
          </div>

          <p style="margin-top: 32px;">
            We’ll contact you soon with updates regarding your order.
          </p>

          <p>
            <strong>TIF0</strong>
          </p>
        </div>
      `,
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
                title: [
                    {
                        text: {
                            content: order.id,
                        },
                    },
                ],
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
                            content: `${order.customer.address} ${order.customer.apartment || ""
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