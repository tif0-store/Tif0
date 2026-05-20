import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  products,
  PRODUCT_CATEGORIES,
  SIZE_CHARTS,
  WORLD_CUP_NATIONS,
} from "./data/products";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

const BRAND = "Tif0";
const ACCENT = "#da291c";
const SOFT_BACKGROUND = "#f5f5f4";
const INSTAGRAM_HANDLE = "@tif0.bd";
const FACEBOOK_ID = "61567978760829";
const WHATSAPP_NUMBER = "+8801701210000";
const BANGLADESH_GREEN = "#006a4e";
const LOGO_SRC = "/logo.png";
const NAVBAR_HEIGHT = 96;
const CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Bebas+Neue&display=swap');

  :root {
    width: 100%;
    min-width: 100%;
    min-height: 100%;
    font-family: "Inter", Arial, sans-serif;
    color: #0a0a0a;
    background: #ffffff;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  html,
  body,
  #root,
  #__next,
  .app,
  .App {
    width: 100% !important;
    min-width: 100% !important;
    max-width: none !important;
    min-height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #0a0a0a !important;
    overflow-x: hidden !important;
  }

  body {
    min-height: 100vh;
    min-height: 100svh;
    font-family: "Inter", Arial, sans-serif !important;
    background: #0a0a0a !important;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  img,
  picture,
  video,
  canvas,
  svg {
    display: block;
    max-width: 100%;
  }

  button,
  input,
  textarea,
  select {
    font: inherit;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  .display-font {
    font-family: "Bebas Neue", Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif !important;
    letter-spacing: 0.03em;
  }

  .brand-page {
    width: 100%;
    min-height: 100vh;
    overflow-x: hidden;
    background: #0a0a0a;
  }

  .brand-page main {
    width: 100%;
    background: #ffffff;
  }

  .full-bleed {
    width: 100%;
    margin: 0;
    padding-left: 0;
    padding-right: 0;
    overflow: hidden;
  }

  .hero-fullscreen-fix {
    width: 100%;
    margin: 0;
    background: #0a0a0a;
  }

  .store-container {
    width: 100%;
    max-width: none;
    margin-inline: auto;
    padding-inline: clamp(1rem, 3vw, 3rem);
  }

  .page-section {
    width: 100%;
  }

  .responsive-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(205px, 255px));
    gap: 1rem;
    width: 100%;
    justify-content: center;
    align-items: stretch;
  }

  .responsive-collection-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
    width: 100%;
  }

  .image-frame {
    position: relative;
    width: 100%;
    overflow: hidden;
    background: #f5f5f4;
  }

  .image-frame > img {
    width: 100%;
    height: 100%;
    object-position: center;
  }
`;

const styles = {
  heroBackdrop: {
    background: "#ffffff",
  },
  categoryBackdrop: {
    background:
      "linear-gradient(to bottom, rgba(255,255,255,0.82), rgba(245,245,244,0.92))",
  },
};

const heroImages = [
  {
    id: "hero-1",
    title: "Streetwear Flags Drop",
    subtitle: "Bold colors. Clean fits. Everyday statement pieces.",
    image: "/Home-1.webp",
    fit: "cover",
  },
  {
    id: "hero-2",
    title: "Jerseys That Stand Out",
    subtitle: "Oversized cuts and match-day energy with a premium look.",
    image: "/Home-2.webp",
    fit: "cover",
  },
];

function getCartItemKey(item) {
  const bundleKey = item.selectedCountries?.join("-") || "";
  return `${item.id}::${item.selectedSize || "one-size"}::${bundleKey}`;
}

function addItemToCart(currentCart, product) {
  const normalizedProduct = {
    ...product,
    selectedSize: product.selectedSize || "One Size",
    selectedSizeLabel: product.selectedSizeLabel || product.selectedSize || "One Size",
    selectedCountries: product.selectedCountries || [],
  };

  const existing = currentCart.find(
    (item) => getCartItemKey(item) === getCartItemKey(normalizedProduct),
  );

  if (existing) {
    return currentCart.map((item) =>
      getCartItemKey(item) === getCartItemKey(normalizedProduct)
        ? { ...item, quantity: item.quantity + 1 }
        : item,
    );
  }

  return [...currentCart, { ...normalizedProduct, quantity: 1 }];
}

function updateCartItemQuantity(currentCart, cartKey, delta) {
  return currentCart
    .map((item) =>
      getCartItemKey(item) === cartKey
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item,
    )
    .filter((item) => item.quantity > 0);
}

function removeCartItem(currentCart, cartKey) {
  return currentCart.filter((item) => getCartItemKey(item) !== cartKey);
}

function getCartCount(cart) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartSubtotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getHeroIndex(currentIndex, direction, total) {
  if (total <= 0) return 0;
  if (direction === "prev") return currentIndex === 0 ? total - 1 : currentIndex - 1;
  return currentIndex === total - 1 ? 0 : currentIndex + 1;
}

function GlobalStyle() {
  return <style>{GLOBAL_STYLES}</style>;
}

function SmartImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  fit = "cover",
  position = "center",
  aspectRatio,
  minHeight,
  maxHeight,
  height,
}) {
  return (
    <div
      className={`image-frame ${className}`}
      style={{ aspectRatio, minHeight, maxHeight, height }}
    >
      <img
        src={src}
        alt={alt}
        className={imgClassName}
        style={{ objectFit: fit, objectPosition: position }}
        loading="lazy"
        onError={(event) => {
          event.currentTarget.style.opacity = "0";
          event.currentTarget.parentElement?.classList.add("border", "border-neutral-200");
        }}
      />
    </div>
  );
}

function runSelfTests() {
  console.assert(LOGO_SRC === "/logo.png", "Logo should point to /logo.png");
  console.assert(ACCENT === "#da291c", "Accent color should remain brand red");
  console.assert(NAVBAR_HEIGHT === 96, "Navbar height should stay consistent");

  const sample = products[0];
  const addedOnce = addItemToCart([], sample);
  console.assert(addedOnce.length === 1, "Item should be added to empty cart");
  console.assert(addedOnce[0].quantity === 1, "Initial quantity should be 1");

  const addedTwice = addItemToCart(addedOnce, sample);
  console.assert(addedTwice[0].quantity === 2, "Quantity should increment");

  const reduced = updateCartItemQuantity(addedTwice, getCartItemKey(addedTwice[0]), -1);
  console.assert(reduced[0].quantity === 1, "Quantity should decrement");

  const removedByZero = updateCartItemQuantity(reduced, getCartItemKey(reduced[0]), -1);
  console.assert(removedByZero.length === 0, "Item should be removed at zero quantity");

  const mixedCart = [
    { ...products[0], quantity: 2 },
    { ...products[4], quantity: 1 },
  ];
  console.assert(getCartCount(mixedCart) === 3, "Cart count should sum quantities");
  console.assert(
    getCartSubtotal(mixedCart) === products[0].price * 2 + products[4].price,
    "Subtotal should match line totals",
  );

  console.assert(getHeroIndex(0, "prev", 2) === 1, "Previous should wrap");
  console.assert(getHeroIndex(1, "next", 2) === 0, "Next should wrap");
  console.assert(heroImages[0].image === "/Home-1.png", "Home hero asset should point to /Home-1.png");
}

function IconBase({ children, className = "", size = 18, strokeWidth = 1.8, style }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function ShoppingBagIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M6 8h12l-1 11H7L6 8Z" />
      <path d="M9 8a3 3 0 1 1 6 0" />
    </IconBase>
  );
}

function FlagIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M5 21V4" />
      <path d="M5 5c4-2 6 2 10 0l-1 6c-4 2-6-2-10 0" />
    </IconBase>
  );
}

function ShirtIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M9 5 7 7 4 8l2 4 2-1v8h8v-8l2 1 2-4-3-1-2-2" />
      <path d="M9 5c1 1 2 2 3 2s2-1 3-2" />
    </IconBase>
  );
}

function InfoIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <path d="M12 7h.01" />
    </IconBase>
  );
}

function ChevronLeftIcon(props) {
  return (
    <IconBase {...props}>
      <path d="m15 18-6-6 6-6" />
    </IconBase>
  );
}

function ChevronRightIcon(props) {
  return (
    <IconBase {...props}>
      <path d="m9 18 6-6-6-6" />
    </IconBase>
  );
}

function TrashIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 12h10l1-12" />
      <path d="M9 7V5h6v2" />
    </IconBase>
  );
}

function PlusIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconBase>
  );
}

function MinusIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14" />
    </IconBase>
  );
}


function XIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </IconBase>
  );
}

function CheckCircleIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5L16 9.5" />
    </IconBase>
  );
}

function CartIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h9.8a1 1 0 0 0 1-.8L21 7H7" />
    </IconBase>
  );
}

function App() {
  useEffect(() => {
    runSelfTests();
  }, []);

  return (
    <>
      <GlobalStyle />
      <StorefrontApp />
    </>
  );
}

function StorefrontApp() {
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState("");
  const [customerForm, setCustomerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    zip: "",
  });

  const location = useLocation();
  const isCheckoutPage = location.pathname.startsWith("/checkout");

  const addToCart = (product) => {
    setCart((current) => addItemToCart(current, product));
    setNotification(`${product.name} added to cart`);

    setTimeout(() => {
      setNotification("");
    }, 2200);
  };

  const updateQuantity = (id, delta) =>
    setCart((current) => updateCartItemQuantity(current, id, delta));

  const removeFromCart = (id) =>
    setCart((current) => removeCartItem(current, id));

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  return (
    <div className="brand-page bg-white text-neutral-950">
      <Navbar cartCount={getCartCount(cart)} />

      <CartNotification message={notification} />

      <main className="w-full min-w-0">
        <Routes>
          <Route path="/" element={<HomePage addToCart={addToCart} />} />
          <Route path="/flags" element={<FlagsPage addToCart={addToCart} />} />
          <Route path="/flags/bundle" element={<BundleBuilderPage addToCart={addToCart} />} />
          <Route path="/products/:productId" element={<ProductDetailPage addToCart={addToCart} />} />
          <Route path="/jerseys" element={<JerseysPage addToCart={addToCart} />} />
          <Route path="/about" element={<AboutPage />} />

          <Route
            path="/checkout/cart"
            element={
              <CartPage
                cart={cart}
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
              />
            }
          />

          <Route
            path="/checkout/details"
            element={
              <DetailsPage
                cart={cart}
                form={customerForm}
                setForm={setCustomerForm}
              />
            }
          />

          <Route
            path="/checkout/review"
            element={
              <ReviewPage
                cart={cart}
                customer={customerForm}
                clearCart={clearCart}
              />
            }
          />

          <Route
            path="/checkout/success"
            element={<SuccessPage clearCart={clearCart} />}
          />

          <Route path="*" element={<HomePage addToCart={addToCart} />} />
        </Routes>

        {!isCheckoutPage && (
          <Link
            to="/checkout/cart"
            className="fixed bottom-17 right-3 z-[9999] grid h-14 w-14 place-items-center rounded-full shadow-xl transition hover:scale-110"
            style={{ backgroundColor: "#DA291C" }}
            aria-label="Open cart"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="24"
              height="24"
              aria-hidden="true"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>

            <span
              className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full text-[11px] font-black"
              style={{
                backgroundColor: "#ffffff",
                color: "#DA291C",
              }}
            >
              {getCartCount(cart)}
            </span>
          </Link>
        )}
      </main>

      <Footer />
    </div>
  );
}

function Navbar({ cartCount }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: "/", label: "Home", icon: ShoppingBagIcon },
    { to: "/jerseys", label: "Jerseys", icon: ShirtIcon },
    { to: "/flags", label: "Flags", icon: FlagIcon },
    { to: "/about", label: "About Us", icon: InfoIcon },
  ];

  return (
    <header
      className="sticky top-0 z-[999] w-full border-b border-red-800 shadow-sm"
      style={{ backgroundColor: ACCENT, minHeight: NAVBAR_HEIGHT }}
    >
      <div className="mx-auto flex min-h-[96px] w-full max-w-[1920px] items-center justify-between px-2 py-4 sm:px-8 lg:px-5">
        <Link to="/" className="inline-flex shrink-0 items-center">
          <img
            src={LOGO_SRC}
            alt={`${BRAND} logo`}
            className="h-14 w-auto object-contain sm:h-16"
          />
        </Link>

        <nav className="hidden flex-1 justify-center gap-3 lg:flex">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-full px-5 py-3 text-base font-bold transition ${isActive ? "bg-white" : "hover:bg-white/10"
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? ACCENT : "#ffffff",
              })}
            >
              <Icon size={24} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/checkout/cart"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/30 bg-white px-4 py-3 text-base font-semibold transition hover:bg-neutral-100"
            style={{ color: ACCENT }}
          >
            <CartIcon size={24} />

            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
              style={{ backgroundColor: ACCENT }}
            >
              {cartCount}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white text-red-700 transition hover:bg-neutral-100 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="26"
              height="26"
              aria-hidden="true"
            >
              {menuOpen ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/20 px-4 pb-5 lg:hidden"
          >
            <div className="mx-auto grid max-w-md gap-2 rounded-[24px] bg-white p-3 shadow-xl">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-4 text-base font-black transition"
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? "#da291c" : "#ffffff",
                    color: isActive ? "#ffffff" : "#da291c",
                    border: "2px solid #da291c",
                  })}
                >
                  <Icon size={26} />
                  {label}
                </NavLink>
              ))}
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function CartNotification({ message }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.22 }}
          className="fixed bottom-6 left-1/2 z-[1000] w-fit max-w-[90vw] -translate-x-1/2 rounded-full border-2 bg-white px-6 py-4 text-sm font-black shadow-2xl"
          style={{
            borderColor: ACCENT,
            color: ACCENT,
          }}
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function HomePage({ addToCart }) {
  const featuredProducts = products.filter((product) => product.featured);
  const flagProducts = products
    .filter((product) => product.category === PRODUCT_CATEGORIES.FLAGS)
    .slice(0, 3);
  const jerseyProducts = products
    .filter((product) => product.category === PRODUCT_CATEGORIES.JERSEYS)
    .slice(0, 3);

  return (
    <div className="page-section bg-white">
      <HeroSection />
      <StorePromoStrip />
      <SectionHeader
        eyebrow="Featured drop"
        title="Top picks this week"
        description="A cleaner product grid with proper spacing, consistent image sizing, and a more realistic shop layout."
      />
      <ProductGrid items={featuredProducts} addToCart={addToCart} />
      <LookbookBand />
      <CollectionTiles />
      <SectionHeader
        eyebrow="Flags"
        title="Shop statement flags"
        description="Built for rooms, events, content backdrops, and brand-heavy everyday styling."
      />
      <ProductGrid items={flagProducts} addToCart={addToCart} />
      <SectionHeader
        eyebrow="Jerseys"
        title="Premium jersey cuts"
        description="Oversized silhouettes, breathable textures, and easy styling across the full collection."
      />
      <ProductGrid items={jerseyProducts} addToCart={addToCart} />
    </div>
  );
}

function StorePromoStrip() {
  return (
    <section className="full-bleed bg-neutral-950 text-white border border-white">
      <div className="grid text-center text-xs font-bold uppercase tracking-[0.22em] sm:grid-cols-3">
        <div className="flex items-center justify-center border-b border-white py-4 sm:border-b-0 sm:border-r">
          <p>Free shipping</p>
        </div>

        <div className="flex items-center justify-center border-b border-white py-4 sm:border-b-0 sm:border-r">
          <p>Limited drops</p>
        </div>

        <div className="flex items-center justify-center py-4">
          <p>Cash on Delivery</p>
        </div>
      </div>
    </section>
  );
}

function CollectionTiles() {
  const tiles = [
    {
      title: "Jerseys",
      buttonLabel: "Shop Jerseys",
      text: "Explore the latest Tif0 jerseys.",
      href: "/jerseys",
      image: "/collection-jersey.webp",
    },
    {
      title: "Flags",
      buttonLabel: "Shop Flags",
      text: "Browse Tif0 flags.",
      href: "/flags",
      image: "/collection-flags.webp",
    },
  ];

  return (
    <section className="store-container pt-10 pb-0">
      <div className="mx-auto grid w-fit grid-cols-1 justify-center gap-x-8 gap-y-2 md:grid-cols-2">
        {tiles.map((tile) => (
          <Link
            key={tile.title}
            to={tile.href}
            aria-label={tile.buttonLabel}
            className="group relative h-[460px] w-[300px] overflow-hidden rounded-[22px] border-2 text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ borderColor: ACCENT, backgroundColor: "#111111" }}
          >
            <SmartImage
              src={tile.image}
              alt={tile.title}
              fit="cover"
              className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-110"
              height="100%"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

            <div className="absolute inset-0 z-200 flex items-center justify-center p-6 text-center sm:p-7">
              <span
                className="mx-auto inline-flex w-fit rounded-full px-6 py-3 text-xs font-black uppercase text-white shadow-lg transition duration-300 group-hover:scale-105 group-hover:brightness-110"
                style={{ backgroundColor: ACCENT, letterSpacing: "0.22em" }}
              >
                {tile.buttonLabel}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LookbookBand() {
  return (
    <section className="full-bleed my-12 bg-neutral-100">
      <div className="store-container flex justify-center py-16 text-center">
        <div>
          <h2 className="display-font mt-4 text-6xl uppercase leading-none sm:text-7xl" style={{ color: "#da291c" }}>
            MORE ABOUT TIF0
          </h2>
          <p className="mt-5 max-w-xl text-neutral-600">
            Tif0 blends football culture, national pride, and modern streetwear
            into clean everyday pieces made to feel bold without trying too hard.
          </p>
          <Link
            to="/about"
            className="mt-8 inline-flex rounded-full px-6 py-3 text-xs font-black uppercase transition duration-300 hover:scale-[1.02] hover:brightness-110"
            style={{ backgroundColor: ACCENT, color: "#ffffff", letterSpacing: "0.22em" }}
          >
            About Us
          </Link>
        </div>
      </div>
    </section>
  );
}

function HeroSection() {
  const [index, setIndex] = useState(0);
  const current = heroImages[index];

  const previous = () => setIndex((value) => getHeroIndex(value, "prev", heroImages.length));
  const next = () => setIndex((value) => getHeroIndex(value, "next", heroImages.length));

  return (
    <section className="full-bleed hero-fullscreen-fix relative overflow-hidden">
      <div className="absolute inset-0" style={styles.heroBackdrop} />
      <div className="relative w-full">
        <div
          className="relative w-full overflow-hidden bg-neutral-950"
          style={{ minHeight: `calc(100svh - ${NAVBAR_HEIGHT}px)` }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0"
            >
              <SmartImage
                src={current.image}
                alt={current.title}
                fit={current.fit || "cover"}
                className="h-full min-h-full"
                height="100%"
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />

          <button
            type="button"
            onClick={previous}
            aria-label="Previous hero image"
            className="absolute left-4 top-1/2 z-[1000] flex h-14 w-14 -translate-y-[80%] items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition hover:scale-110 hover:bg-black/45 sm:left-6 lg:left-8"
          >
            <ChevronLeftIcon size={28} />
          </button>

          <button
            type="button"
            onClick={next}
            aria-label="Next hero image"
            className="absolute right-4 top-1/2 z-[1000] flex h-14 w-14 -translate-y-[80%] items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition hover:scale-110 hover:bg-black/45 sm:right-6 lg:right-8"
          >
            <ChevronRightIcon size={28} />
          </button>
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="relative z-10 flex min-h-[calc(100svh-96px)] items-center justify-center text-center">
            <div className="store-container flex justify-center py-16 lg:py-24">
              <div className="mx-auto max-w-5xl text-center text-white">
                <p className="mb-4 text-sm font-bold uppercase tracking-[0.4em] text-white/80">
                  New Season / Tif0 Drop
                </p>
                <h1 className="display-font text-7xl uppercase leading-[0.82] drop-shadow-2xl sm:text-8xl lg:text-[10rem]">
                  <span className="block text-white/85">made to</span>
                  <span className="block" style={{ color: ACCENT, WebkitTextStroke: "0.5px rgba(0, 0, 0, 0.45)" }}>
                    stand out.
                  </span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
                  {current.subtitle} Shop flags, jerseys, and bold essentials in one clean storefront.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FlagsPage({ addToCart }) {
  const featuredPack = products.find((product) => product.type === "bundle");

  const singleFlags = products.filter(
    (product) =>
      product.category === PRODUCT_CATEGORIES.FLAGS &&
      product.type === "single",
  );

  return (
    <div className="w-full pt-0 pb-16">
      <SectionHeader eyebrow="Bundle" title="3 flags pack" />
      <div className="store-container pt-5">
        {featuredPack ? (
          <div
            className="group mx-auto mb-0 grid w-full max-w-2xl overflow-hidden rounded-[22px] border-2 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl lg:grid-cols-[0.85fr_0.75fr]"
            style={{ borderColor: ACCENT }}
          >
            <div className="m-6 h-[calc(100%-3rem)] overflow-hidden rounded-[22px]">
              <SmartImage
                src={featuredPack.image}
                alt={featuredPack.name}
                fit={featuredPack.fit || "cover"}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />

              <span
                className="absolute left-4 top-4 rounded-full px-4 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-sm"
                style={{ backgroundColor: BANGLADESH_GREEN }}
              >
                Featured
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-center p-6">
              <div className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-4">
                <p
                  className="text-[11px] font-black uppercase"
                  style={{ color: BANGLADESH_GREEN, letterSpacing: "0.22em" }}
                >
                  Flags
                </p>

                <p className="text-2xl font-black leading-none" style={{ color: ACCENT }}>
                  {CURRENCY.format(featuredPack.price)}
                </p>
              </div>

              <div className="flex flex-1 flex-col pt-4">
                <h2 className="display-font text-6xl uppercase leading-none">
                  {featuredPack.name}
                </h2>

                <p className="mt-4 text-sm leading-7 text-neutral-600">
                  {featuredPack.description}
                </p>
              </div>
              <Link
                to="/flags/bundle"
                className="mt-4 flex h-10 w-full items-center justify-center rounded-full px-2 text-[10px] font-black uppercase text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
                style={{
                  backgroundColor: ACCENT,
                  color: "#ffffff",
                  letterSpacing: "0.05em",
                  fontFamily: "Inter, Arial, sans-serif",
                  fontSize: "16px",
                  fontWeight: 700,
                  lineHeight: "1",
                  WebkitTextStroke: "0.15px currentColor",
                  textDecoration: "none",
                }}
              >
                CHOOSE 3 FLAGS
              </Link>
            </div>
          </div>
        ) : null}
      </div>
      <SectionHeader
        eyebrow="Collection"
        title="Single flags"
        description="Extra flag designs shown underneath the hero section as shoppable product cards."
      />
      <ProductGrid items={singleFlags} addToCart={addToCart} />
    </div>
  );
}

function BundleBuilderPage({ addToCart }) {
  const navigate = useNavigate();
  const bundleProduct = products.find((product) => product.customBundle || product.type === "bundle");
  const sizeOptions = SIZE_CHARTS[bundleProduct?.sizeType || PRODUCT_CATEGORIES.FLAGS] || [];
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]?.code || "One Size");
  const [selectedCountries, setSelectedCountries] = useState(["", "", ""]);

  useEffect(() => {
    setSelectedSize(sizeOptions[0]?.code || "One Size");
  }, [bundleProduct?.id, sizeOptions]);

  if (!bundleProduct) {
    return (
      <section className="store-container py-16">
        <EmptyState
          title="Bundle Not Found"
          description="The 3-pack bundle is not available right now."
          actionLabel="Back To Flags"
          actionHref="/flags"
        />
      </section>
    );
  }

  const selectedSizeOption = sizeOptions.find((size) => size.code === selectedSize);
  const selectedSizeLabel = selectedSizeOption?.label || selectedSize || "One Size";
  const bundleComplete = selectedCountries.every(Boolean);

  const updateCountry = (index, value) => {
    setSelectedCountries((current) =>
      current.map((country, countryIndex) =>
        countryIndex === index ? value : country,
      ),
    );
  };

  const handleAddBundle = () => {
    if (!bundleComplete) return;

    addToCart({
      ...bundleProduct,
      selectedSize,
      selectedSizeLabel,
      selectedCountries,
    });

  };

  return (
    <div className="w-full bg-white pb-16">
      <SectionHeader
        eyebrow="Bundle Builder"
        title="Choose 3 flags"
        description="Pick three different World Cup nation flags for your custom 3-pack."
      />

      <section className="store-container py-5">
        <div
          className="group mx-auto flex h-full w-full max-w-[400px] flex-col overflow-hidden rounded-[18px] border-2 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          style={{ borderColor: ACCENT }}
        >
          <div className="relative overflow-hidden bg-neutral-100">
            <SmartImage
              src={bundleProduct.image}
              alt={bundleProduct.name}
              fit={bundleProduct.fit || "cover"}
              className="w-full transition-transform duration-700 ease-out group-hover:scale-110"
              aspectRatio="1 / 1"
              minHeight={175}
              maxHeight={230}
            />

            <span
              className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-sm"
              style={{ backgroundColor: BANGLADESH_GREEN }}
            >
              Bundle
            </span>
          </div>

          <div className="flex flex-1 flex-col px-5 pb-5 pt-2">
            <div className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-3">
              <p
                className="text-[10px] font-black uppercase"
                style={{ color: BANGLADESH_GREEN, letterSpacing: "0.22em" }}
              >
                Flags
              </p>

              <p className="text-lg font-black leading-none" style={{ color: ACCENT }}>
                {CURRENCY.format(bundleProduct.price)}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <h1
                className="m-0 text-left text-5xl font-black leading-none tracking-tight text-neutral-950"
                style={{
                  fontWeight: 950,
                  WebkitTextStroke: "0.4px currentColor",
                }}
              >
                {bundleProduct.name}
              </h1>
              <p className="m-0 text-left text-sm leading-5 text-neutral-600">
                {bundleProduct.description}
              </p>
            </div>

            <div className="mt-3">
              <p
                className="mb-1.5 text-left text-[10px] font-black uppercase text-neutral-500"
                style={{ letterSpacing: "0.18em" }}
              >
                Choose Countries
              </p>

              <div className="grid gap-2">
                {selectedCountries.map((country, index) => {
                  const usedCountries = selectedCountries.filter(
                    (selectedCountry, selectedIndex) =>
                      selectedCountry && selectedIndex !== index,
                  );

                  return (
                    <div key={index} className="relative">
                      <select
                        value={country}
                        onChange={(event) => updateCountry(index, event.target.value)}
                        className="h-11 w-full appearance-none rounded-xl border border-neutral-300 bg-white px-4 pr-10 text-sm font-bold text-neutral-900 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
                      >
                        <option value="">Country {index + 1}</option>
                        {WORLD_CUP_NATIONS.map((nation) => (
                          <option
                            key={nation}
                            value={nation}
                            disabled={usedCountries.includes(nation)}
                          >
                            {nation}
                          </option>
                        ))}
                      </select>

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
                        ▼
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3">
              <label
                htmlFor="bundle-size"
                className="mb-1.5 block text-left text-[10px] font-black uppercase text-neutral-500"
                style={{ letterSpacing: "0.18em" }}
              >
                Flag Size
              </label>

              <div className="relative">
                <select
                  id="bundle-size"
                  value={selectedSize}
                  onChange={(event) => setSelectedSize(event.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-neutral-300 bg-white px-4 pr-10 text-sm font-bold text-neutral-900 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
                >
                  {sizeOptions.map((size) => (
                    <option key={size.code} value={size.code}>
                      {size.label}
                    </option>
                  ))}
                </select>

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
                  ▼
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddBundle}
              disabled={!bundleComplete}
              className="mt-4 flex h-10 w-full items-center justify-center rounded-full px-2 text-[10px] font-black uppercase text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                backgroundColor: ACCENT,
                color: "#ffffff",
                letterSpacing: "0.05em",
                fontFamily: "Inter, Arial, sans-serif",
                fontSize: "16px",
                fontWeight: 700,
                lineHeight: "1",
                WebkitTextStroke: "0.15px currentColor",
                textDecoration: "none",
              }}
            >
              {bundleComplete ? "ADD TO CART" : "CHOOSE 3 FLAGS"}
            </button>

            <Link
              to="/flags"
              className="mt-4 text-center text-[10px] font-black uppercase text-neutral-500 transition hover:text-neutral-900"
              style={{ letterSpacing: "0.18em" }}
            >
              Back To Flags
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function JerseysPage({ addToCart }) {
  const jerseys = products.filter(
    (product) =>
      product.category === PRODUCT_CATEGORIES.JERSEYS &&
      product.type === "jersey",
  );

  return (
    <div className="w-full pb-16">
      <SectionHeader
        eyebrow="Shop"
        title="All jerseys"
        description="Clean layout, quick add-to-cart, and space for future product filtering."
      />
      <ProductGrid items={jerseys} addToCart={addToCart} />
    </div>
  );
}

function AboutPage() {
  const instagramUrl = `https://instagram.com/${INSTAGRAM_HANDLE.replace("@", "")}`;
  const facebookUrl = `https://www.facebook.com/profile.php?id=${FACEBOOK_ID}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`;

  return (
    <div className="w-full bg-white">
      <section className="w-full px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex w-full justify-center">
          <p
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-black uppercase text-white"
            style={{
              backgroundColor: ACCENT,
              letterSpacing: "0.35em",
            }}
          >
            About us
          </p>
        </div>

        <div className="mt-10 flex w-full justify-center">
          <div
            className="flex h-[420px] w-full max-w-[420px] items-center justify-center overflow-hidden rounded-[40px] border-2 bg-neutral-100"
            style={{ borderColor: ACCENT }}
          >
            <div className="text-center">
              <p
                className="text-sm font-black uppercase"
                style={{
                  color: ACCENT,
                  letterSpacing: "0.35em",
                }}
              >
                Add Image
              </p>

              <p className="mt-4 text-neutral-500">
                Replace this container with your brand image.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-neutral-100 px-4 py-15 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl text-center">
          <p
            className="text-sm font-black uppercase"
            style={{
              color: ACCENT,
              letterSpacing: "0.35em",
            }}
          >
            Contact us
          </p>

          <div className="mt-1 flex w-full justify-center">
            <p className="max-w-2xl text-center text-neutral-600">
              Reach out for support, collaborations, or product questions.
            </p>
          </div>

          <div className="mx-auto mt-10 flex w-full max-w-[500px] flex-col gap-5">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="group rounded-[28px] border-2 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ borderColor: ACCENT }}
            >
              <p
                className="text-xs font-black uppercase"
                style={{
                  color: ACCENT,
                  letterSpacing: "0.3em",
                }}
              >
                Instagram
              </p>

              <h3 className="mt-4 text-3xl font-black transition group-hover:text-red-700">
                {INSTAGRAM_HANDLE}
              </h3>

              <p className="mt-4 text-sm leading-7 text-neutral-600">
                Follow for drops, updates, and styling content.
              </p>
            </a>

            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="group rounded-[28px] border-2 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ borderColor: ACCENT }}
            >
              <p
                className="text-xs font-black uppercase"
                style={{
                  color: ACCENT,
                  letterSpacing: "0.3em",
                }}
              >
                Facebook
              </p>

              <h3 className="mt-4 text-3xl font-black transition group-hover:text-red-700">
                @Tif0
              </h3>

              <p className="mt-4 text-sm leading-7 text-neutral-600">
                Direct contact for support and orders.
              </p>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="group rounded-[28px] border-2 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ borderColor: ACCENT }}
            >
              <p
                className="text-xs font-black uppercase"
                style={{
                  color: ACCENT,
                  letterSpacing: "0.3em",
                }}
              >
                WhatsApp
              </p>

              <h3 className="mt-4 text-3xl font-black transition group-hover:text-red-700">
                {WHATSAPP_NUMBER}
              </h3>

              <p className="mt-4 text-sm leading-7 text-neutral-600">
                Direct contact for support and orders.
              </p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function CategoryHero({ title, description, image, fit = "cover" }) {
  return (
    <section className="full-bleed relative overflow-hidden border-b border-neutral-200 bg-neutral-950 text-white">
      <SmartImage
        src={image}
        alt=""
        fit={fit}
        className="absolute inset-0 h-full w-full opacity-45"
        height="100%"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25" />
      <div className="relative store-container py-24 lg:py-32">
        <p className="text-sm font-bold uppercase text-white/75" style={{ letterSpacing: "0.35em" }}>
          Tif0 Collection
        </p>
        <h1 className="display-font mt-4 text-7xl uppercase leading-none sm:text-8xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">{description}</p>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="store-container flex flex-col items-center pt-14 text-center">
      <p className="text-sm uppercase text-red-700" style={{ letterSpacing: "0.35em" }}>
        {eyebrow}
      </p>

      <h2 className="mt-4 uppercase text-8xl font-black tracking-tight text-black sm:text-5xl">
        {title}
      </h2>

      {description ? <p className="mx-auto mt-4 max-w-2xl text-neutral-600">{description}</p> : null}
    </div>
  );
}


function getProductGallery(product) {
  const gallery = product.gallery || product.images || {};
  const imageList = Array.isArray(gallery) ? gallery : [];

  if (imageList.length > 0) {
    return imageList.map((image, index) => ({
      label: image.label || `Photo ${index + 1}`,
      src: image.src || image.image || image,
      fit: image.fit || product.fit || "cover",
    }));
  }

  return [
    {
      label: "Front",
      src: product.frontImage || gallery.front || product.image,
      fit: product.fit || "cover",
    },
    {
      label: "Back",
      src: product.backImage || gallery.back || `/products/${product.id}-back.png`,
      fit: product.fit || "cover",
    },
    {
      label: "Close Up",
      src: product.closeUpImage || gallery.closeUp || `/products/${product.id}-close-up.png`,
      fit: product.fit || "cover",
    },
    {
      label: "Size Chart",
      src: product.sizeChartImage || gallery.sizeChart || `/products/${product.id}-size-chart.png`,
      fit: "contain",
    },
  ].filter((image) => image.src);
}

function ProductDetailPage({ addToCart }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const product = products.find((item) => item.id === productId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("One Size");
  const [zoomOpen, setZoomOpen] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const isCustomBundle = product?.customBundle || product?.type === "bundle";
  const sizeType = product?.sizeType || product?.category;
  const sizeOptions = isCustomBundle ? [] : SIZE_CHARTS[sizeType] || [];

  const galleryImages = useMemo(() => {
    if (!product) return [];

    const rawImages = Array.isArray(product.gallery) && product.gallery.length > 0
      ? product.gallery
      : [product.image];

    return rawImages.filter(Boolean);
  }, [product]);

  useEffect(() => {
    setSelectedSize(sizeOptions[0]?.code || "One Size");
    setActiveImageIndex(0);
  }, [product?.id, sizeOptions]);

  if (!product || isCustomBundle) {
    return (
      <section className="store-container py-16">
        <EmptyState
          title="Product Not Found"
          description="This product page is not available."
          actionLabel="Back To Shop"
          actionHref="/"
        />
      </section>
    );
  }

  const selectedSizeOption = sizeOptions.find((size) => size.code === selectedSize);
  const selectedSizeLabel = selectedSizeOption?.label || selectedSize || "One Size";
  const activeImage = galleryImages[activeImageIndex] || product.image;

  const goToPreviousImage = () => {
    setActiveImageIndex((current) =>
      current === 0 ? galleryImages.length - 1 : current - 1,
    );
  };

  const goToNextImage = () => {
    setActiveImageIndex((current) =>
      current === galleryImages.length - 1 ? 0 : current + 1,
    );
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (event) => {
    touchEndX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const distance = touchStartX.current - touchEndX.current;
    const minimumSwipeDistance = 45;

    if (distance > minimumSwipeDistance) {
      goToNextImage();
    }

    if (distance < -minimumSwipeDistance) {
      goToPreviousImage();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      selectedSize,
      selectedSizeLabel,
    });

  };

  return (
    <div className="w-full bg-white pb-16">
      <SectionHeader
        eyebrow={product.category}
        title={product.name}
        description={product.description}
      />

      <section className="store-container py-5">
        <div
          className="mx-auto grid w-full max-w-[940px] gap-6 rounded-[24px] border-2 bg-white p-5 shadow-sm lg:grid-cols-[0.85fr_0.75fr] lg:p-6"
          style={{ borderColor: ACCENT }}
        >
          <div>
            <div
              className="relative overflow-hidden rounded-[20px] bg-neutral-100"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <button
                type="button"
                onClick={() => setZoomOpen(true)}
                className="block w-full cursor-zoom-in"
                aria-label="Zoom product image"
              >
                <SmartImage
                  src={activeImage}
                  alt={product.name}
                  fit={product.fit || "cover"}
                  className="w-full"
                  aspectRatio="1 / 1"
                  minHeight={300}
                  maxHeight={420}
                />
              </button>

              {galleryImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={goToPreviousImage}
                    className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-lg transition hover:scale-110"
                    style={{ color: ACCENT }}
                    aria-label="Previous product image"
                  >
                    <ChevronLeftIcon size={24} />
                  </button>

                  <button
                    type="button"
                    onClick={goToNextImage}
                    className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-lg transition hover:scale-110"
                    style={{ color: ACCENT }}
                    aria-label="Next product image"
                  >
                    <ChevronRightIcon size={24} />
                  </button>
                </>
              ) : null}
            </div>

            {galleryImages.length > 1 ? (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className="overflow-hidden rounded-[14px] border-2 bg-neutral-100 transition hover:-translate-y-0.5"
                    style={{
                      borderColor: activeImageIndex === index ? ACCENT : "#e5e5e5",
                    }}
                    aria-label={`Choose product image ${index + 1}`}
                  >
                    <SmartImage
                      src={image}
                      alt={product.name}
                      fit={product.fit || "cover"}
                      aspectRatio="1 / 1"
                      minHeight={62}
                      maxHeight={74}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-4">
              <p
                className="text-[10px] font-black uppercase"
                style={{ color: BANGLADESH_GREEN, letterSpacing: "0.22em" }}
              >
                {product.category}
              </p>

              <p className="text-2xl font-black leading-none" style={{ color: ACCENT }}>
                {CURRENCY.format(product.price)}
              </p>
            </div>

            <h1 className="display-font mt-5 text-5xl uppercase leading-none sm:text-6xl">
              {product.name}
            </h1>

            <p className="mt-4 text-sm leading-7 text-neutral-600">
              {product.description}
            </p>

            {sizeOptions.length > 0 ? (
              <div className="mt-5">
                <label
                  htmlFor={`detail-size-${product.id}`}
                  className="mb-1.5 block text-left text-[10px] font-black uppercase text-neutral-500"
                  style={{ letterSpacing: "0.18em" }}
                >
                  Size
                </label>

                <div className="relative">
                  <select
                    id={`detail-size-${product.id}`}
                    value={selectedSize}
                    onChange={(event) => setSelectedSize(event.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-neutral-300 bg-white px-4 pr-10 text-sm font-bold text-neutral-900 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
                  >
                    {sizeOptions.map((size) => (
                      <option key={size.code} value={size.code}>
                        {size.label}
                      </option>
                    ))}
                  </select>

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
                    ▼
                  </span>
                </div>
              </div>
            ) : null}

            {selectedSizeOption?.measurements ? (
              <div className="mt-3 rounded-2xl bg-neutral-100 p-3 text-left text-[10px] leading-5 text-neutral-600">
                {Object.entries(selectedSizeOption.measurements).map(([label, value]) => (
                  <p key={label}>
                    <span className="font-black capitalize text-neutral-950">{label}:</span> {value}
                  </p>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-5 flex h-10 w-full items-center justify-center rounded-full px-2 text-[10px] font-black uppercase text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
              style={{
                backgroundColor: ACCENT,
                letterSpacing: "0.05em",
                fontFamily: "Inter, Arial, sans-serif",
                fontSize: "16px",
                fontWeight: 600,
                lineHeight: "1",
                WebkitTextStroke: "0.15px currentColor",
              }}
            >
              ADD TO CART
            </button>

            <Link
              to={product.category === PRODUCT_CATEGORIES.JERSEYS ? "/jerseys" : "/flags"}
              className="mt-4 text-center text-[10px] font-black uppercase text-neutral-500 transition hover:text-neutral-900"
              style={{ letterSpacing: "0.18em" }}
            >
              Back To Collection
            </Link>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {zoomOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setZoomOpen(false)}
          >
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-white text-neutral-950 shadow-xl transition hover:scale-110"
              aria-label="Close zoom"
            >
              <XIcon size={26} />
            </button>

            {galleryImages.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    goToPreviousImage();
                  }}
                  className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-neutral-950 shadow-xl transition hover:scale-110"
                  aria-label="Previous product image"
                >
                  <ChevronLeftIcon size={28} />
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    goToNextImage();
                  }}
                  className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-neutral-950 shadow-xl transition hover:scale-110"
                  aria-label="Next product image"
                >
                  <ChevronRightIcon size={28} />
                </button>
              </>
            ) : null}

            <motion.img
              src={activeImage}
              alt={product.name}
              className="max-h-[88vh] max-w-[92vw] cursor-grab rounded-[20px] object-contain active:cursor-grabbing"
              drag
              dragConstraints={{ left: -220, right: 220, top: -220, bottom: 220 }}
              whileTap={{ scale: 1.7 }}
              onClick={(event) => event.stopPropagation()}
              style={{
                touchAction: "pinch-zoom",
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ProductGrid({ items, addToCart }) {
  return (
    <section className="store-container py-5">
      <div className="responsive-card-grid">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} addToCart={addToCart} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product, addToCart }) {
  const isCustomBundle = product.customBundle || product.type === "bundle";
  const sizeType = product.sizeType || product.category;
  const sizeOptions = isCustomBundle ? [] : SIZE_CHARTS[sizeType] || [];
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]?.code || "One Size");

  useEffect(() => {
    setSelectedSize(sizeOptions[0]?.code || "One Size");
  }, [product.id, sizeOptions]);

  const selectedSizeOption = sizeOptions.find((size) => size.code === selectedSize);
  const selectedSizeLabel = selectedSizeOption?.label || selectedSize || "One Size";

  const handleAddToCart = () => {
    addToCart({
      ...product,
      selectedSize,
      selectedSizeLabel,
    });
  };

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-[18px] border-2 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ borderColor: ACCENT }}
    >
      <Link to={`/products/${product.id}`} className="relative block overflow-hidden bg-neutral-100">
        <SmartImage
          src={product.image}
          alt={product.name}
          fit={product.fit || "cover"}
          className="w-full transition-transform duration-700 ease-out group-hover:scale-110"
          aspectRatio="1 / 1"
          minHeight={175}
          maxHeight={230}
        />
        {product.featured ? (
          <span
            className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-sm"
            style={{ backgroundColor: BANGLADESH_GREEN }}
          >
            Featured
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-3">
          <p
            className="text-[10px] font-black uppercase"
            style={{ color: BANGLADESH_GREEN, letterSpacing: "0.22em" }}
          >
            {product.category}
          </p>
          <p className="text-lg font-black leading-none" style={{ color: ACCENT }}>
            {CURRENCY.format(product.price)}
          </p>
        </div>

        <div className="flex flex-1 flex-col pt-3">
          <h3 className="min-h-[42px] text-left text-lg font-black leading-tight tracking-tight text-neutral-950">
            {product.name}
          </h3>
          <p className="mt-2 line-clamp-2 min-h-[40px] text-left text-xs leading-5 text-neutral-600">
            {product.description}
          </p>
        </div>

        {sizeOptions.length > 0 ? (
          <div className="mt-3">
            <label
              htmlFor={`size-${product.id}`}
              className="mb-1.5 block text-left text-[10px] font-black uppercase text-neutral-500"
              style={{ letterSpacing: "0.18em" }}
            >
              Size
            </label>

            <div className="relative">
              <select
                id={`size-${product.id}`}
                value={selectedSize}
                onChange={(event) => setSelectedSize(event.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-neutral-300 bg-white px-4 pr-10 text-sm font-bold text-neutral-900 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
              >
                {sizeOptions.map((size) => (
                  <option key={size.code} value={size.code}>
                    {size.label}
                  </option>
                ))}
              </select>

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
                ▼
              </span>
            </div>
          </div>
        ) : null}

        {selectedSizeOption?.measurements ? (
          <div className="mt-3 rounded-2xl bg-neutral-100 p-3 text-left text-[10px] leading-5 text-neutral-600">
            {Object.entries(selectedSizeOption.measurements).map(([label, value]) => (
              <p key={label}>
                <span className="font-black capitalize text-neutral-950">{label}:</span> {value}
              </p>
            ))}
          </div>
        ) : null}
        {!isCustomBundle ? (
          <Link
            to={`/products/${product.id}`}
            className="mt-4 flex h-10 w-full items-center justify-center rounded-full border-2 px-2 text-[10px] font-black uppercase shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
            style={{
              borderColor: ACCENT,
              color: ACCENT,
              backgroundColor: "#ffffff",
              letterSpacing: "0.05em",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "16px",
              fontWeight: 700,
              lineHeight: "1",
              WebkitTextStroke: "0.15px currentColor",
              textDecoration: "none",
            }}
          >
            VIEW DETAILS
          </Link>
        ) : null}

        {isCustomBundle ? (
          <Link
            to="/flags/bundle"
            className="mt-4 flex h-10 w-full items-center justify-center rounded-full px-2 text-[10px] font-black uppercase text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
            style={{
              backgroundColor: ACCENT,
              color: "#ffffff",
              letterSpacing: "0.05em",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: "16px",
              fontWeight: 700,
              lineHeight: "1",
              WebkitTextStroke: "0.15px currentColor",
              textDecoration: "none",
            }}
          >
            CHOOSE 3 FLAGS
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-4 flex h-10 w-full items-center justify-center rounded-full px-2 text-[10px] font-black uppercase text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
            style={{
              backgroundColor: ACCENT,
              letterSpacing: "0.05em",
              fontFamily: "Inter, Arial, sans-serif",
              fontWeight: 600,
              WebkitTextStroke: "0.15px currentColor",
            }}
          >
            ADD TO CART
          </button>
        )}
      </div>
    </article>
  );
}

function CartPage({ cart, updateQuantity, removeFromCart }) {
  const navigate = useNavigate();
  const subtotal = useMemo(() => getCartSubtotal(cart), [cart]);

  return (
    <CheckoutLayout
      step={1}
      title="Your Cart"
      description="Review your products before checkout."
    >
      <div className="mx-auto grid max-w-[980px] items-start gap-6 lg:grid-cols-[520px_360px]">
        <div className="space-y-5">
          {cart.length === 0 ? (
            <EmptyState
              title="Cart Empty"
              description="Add some jerseys or flags before continuing."
              actionLabel="Continue Shopping"
              actionHref="/"
            />
          ) : (
            cart.map((item) => (
              <div
                key={getCartItemKey(item)}
                className="mx-auto w-full max-w-[320px] rounded-[22px] border-2 bg-white p-4 shadow-md transition-all duration-300 hover:shadow-xl"
                style={{ borderColor: ACCENT }}
              >
                <div className="flex justify-center">
                  <SmartImage
                    src={item.image}
                    alt={item.name}
                    fit="cover"
                    className="w-full rounded-[18px]"
                    aspectRatio="1 / 1"
                    minHeight={240}
                    maxHeight={240}
                  />
                </div>

                <div className="mt-4 flex items-start justify-between gap-4">
                  <div className="text-left">
                    <p
                      className="text-[9px] font-black uppercase"
                      style={{
                        color: BANGLADESH_GREEN,
                        letterSpacing: "0.18em",
                      }}
                    >
                      {item.category}
                    </p>

                    <h2 className="display-font mt-1 text-3xl uppercase leading-none">
                      {item.name}
                    </h2>
                  </div>

                  <p
                    className="shrink-0 text-xl font-black"
                    style={{ color: ACCENT }}
                  >
                    {CURRENCY.format(item.price)}
                  </p>
                </div>

                <p className="mt-3 text-left text-xs leading-6 text-neutral-600">
                  {item.description}
                </p>

                <p
                  className="mt-3 text-left text-[10px] font-black uppercase"
                  style={{ color: ACCENT, letterSpacing: "0.14em" }}
                >
                  Size: {item.selectedSizeLabel || item.selectedSize || "One Size"}
                </p>

                {item.selectedCountries?.length > 0 ? (
                  <p
                    className="mt-2 text-left text-[10px] font-black uppercase"
                    style={{ color: BANGLADESH_GREEN, letterSpacing: "0.14em" }}
                  >
                    Flags: {item.selectedCountries.join(", ")}
                  </p>
                ) : null}

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div
                    className="inline-flex h-[36px] items-center rounded-full border-2 bg-white px-2"
                    style={{ borderColor: ACCENT }}
                  >
                    <button
                      type="button"
                      onClick={() => updateQuantity(getCartItemKey(item), -1)}
                      className="flex h-6 w-6 items-center justify-center transition"
                      style={{ color: ACCENT }}
                    >
                      <MinusIcon size={18} />
                    </button>

                    <span
                      className="min-w-6 text-center text-[10px] font-black"
                      style={{
                        color: ACCENT,
                        letterSpacing: "0.08em",
                      }}
                    >
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => updateQuantity(getCartItemKey(item), 1)}
                      className="flex h-6 w-6 items-center justify-center transition"
                      style={{ color: ACCENT }}
                    >
                      <PlusIcon size={18} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(getCartItemKey(item))}
                    className="inline-flex h-[36px] w-[36px] items-center justify-center rounded-full border-2 transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      borderColor: ACCENT,
                      color: ACCENT,
                    }}
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <OrderSummary
          subtotal={subtotal}
          actionLabel="Continue"
          onAction={() => navigate("/checkout/details")}
          disabled={!cart.length}
        />
      </div>
    </CheckoutLayout>
  );
}

function DetailsPage({ cart, form, setForm }) {
  const navigate = useNavigate();

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const canContinue =
    cart.length > 0 &&
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.address.trim();

  const inputClass =
    "w-full rounded-full border-2 bg-white px-5 py-3 text-center text-sm font-semibold outline-none transition-all duration-300 placeholder:text-neutral-400 focus:shadow-lg";

  const labelClass = "mb-2 block text-center text-xs font-black uppercase";

  const labelStyle = {
    color: ACCENT,
    letterSpacing: "0.18em",
  };

  return (
    <CheckoutLayout
      step={2}
      title="Your Details"
      description="Shipping information for your order."
    >
      <div className="grid items-start gap-4 lg:grid-cols-[520px_380px] lg:justify-center">
        <div className="flex w-full justify-center">
          <div
            className="w-full max-w-[340px] rounded-[28px] border-2 bg-white p-4 shadow-md sm:max-w-[420px] sm:p-5"
            style={{ borderColor: ACCENT }}
          >
            <div className="grid gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label>
                  <span className={labelClass} style={labelStyle}>
                    First Name
                  </span>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={updateField}
                    placeholder="Neptune"
                    className={inputClass}
                    style={{ borderColor: ACCENT }}
                  />
                </label>

                <label>
                  <span className={labelClass} style={labelStyle}>
                    Last Name
                  </span>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={updateField}
                    placeholder="Rahman"
                    className={inputClass}
                    style={{ borderColor: ACCENT }}
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label>
                  <span className={labelClass} style={labelStyle}>
                    Email
                  </span>
                  <input
                    name="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="ahmed@email.com"
                    className={inputClass}
                    style={{ borderColor: ACCENT }}
                  />
                </label>

                <label>
                  <span className={labelClass} style={labelStyle}>
                    Phone
                  </span>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={updateField}
                    placeholder="+8801701210000"
                    className={inputClass}
                    style={{ borderColor: ACCENT }}
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label>
                  <span className={labelClass} style={labelStyle}>
                    Address
                  </span>
                  <input
                    name="address"
                    value={form.address}
                    onChange={updateField}
                    placeholder="H-1, R-1, Block-A, Banani"
                    className={inputClass}
                    style={{ borderColor: ACCENT }}
                  />
                </label>

                <label>
                  <span className={labelClass} style={labelStyle}>
                    Apartment
                  </span>
                  <input
                    name="apartment"
                    value={form.apartment}
                    onChange={updateField}
                    placeholder="Apt-1"
                    className={inputClass}
                    style={{ borderColor: ACCENT }}
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label>
                  <span className={labelClass} style={labelStyle}>
                    City
                  </span>
                  <input
                    name="city"
                    value={form.city}
                    onChange={updateField}
                    placeholder="Dhaka"
                    className={inputClass}
                    style={{ borderColor: ACCENT }}
                  />
                </label>

                <label>
                  <span className={labelClass} style={labelStyle}>
                    ZIP Code
                  </span>
                  <input
                    name="zip"
                    value={form.zip}
                    onChange={updateField}
                    placeholder="1229"
                    className={inputClass}
                    style={{ borderColor: ACCENT }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => navigate("/checkout/cart")}
            className="w-full rounded-full border-2 px-6 py-3 text-xs font-black uppercase shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            style={{
              borderColor: ACCENT,
              color: ACCENT,
              backgroundColor: "#ffffff",
              letterSpacing: "0.22em",
            }}
          >
            Back To Cart
          </button>

          <OrderSummary
            subtotal={getCartSubtotal(cart)}
            actionLabel="Review Order"
            onAction={() => navigate("/checkout/review")}
            disabled={!canContinue}
          />
        </div>
      </div>
    </CheckoutLayout>
  );
}

function ReviewPage({ cart, customer, clearCart }) {
  const navigate = useNavigate();
  const subtotal = getCartSubtotal(cart);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const placeOrder = async () => {
  if (isSubmitting) return;

  setIsSubmitting(true);

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer,
        items: cart,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Order failed.");
    }

    clearCart();
    navigate("/checkout/success");
  } catch (error) {
    alert(error.message);
  } finally {
    setIsSubmitting(false);
  }
};
  

  return (
    <CheckoutLayout
      step={3}
      title="Review Order"
      description="Review your products before placing your order."
    >
      <div className="mx-auto grid max-w-[980px] items-start gap-6 lg:grid-cols-[520px_360px]">
        <div
          className="rounded-[28px] border-2 bg-white p-6 shadow-md"
          style={{ borderColor: ACCENT }}
        >
          <div className="text-center">
            <p
              className="text-xs font-black uppercase"
              style={{ color: ACCENT, letterSpacing: "0.3em" }}
            >
              Items
            </p>

            <h2 className="display-font mt-2 text-5xl uppercase leading-none">
              Your Order
            </h2>
          </div>

          <div className="mt-8 space-y-4">
            {cart && cart.length > 0 ? (
              cart.map((item) => (
                <div
                  key={getCartItemKey(item)}
                  className="mx-auto w-full max-w-[520px] rounded-[22px] border-2 bg-white p-4 shadow-md"
                  style={{ borderColor: ACCENT }}
                >
                  <div className="flex justify-center">
                    <SmartImage
                      src={item.image}
                      alt={item.name}
                      fit="cover"
                      className="w-full rounded-[18px]"
                      aspectRatio="1 / 1"
                      minHeight={240}
                      maxHeight={240}
                    />
                  </div>

                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div className="text-left">
                      <p
                        className="text-[9px] font-black uppercase"
                        style={{
                          color: BANGLADESH_GREEN,
                          letterSpacing: "0.18em",
                        }}
                      >
                        {item.category}
                      </p>

                      <h2 className="display-font mt-1 text-3xl uppercase leading-none">
                        {item.name}
                      </h2>
                    </div>

                    <p
                      className="shrink-0 text-xl font-black"
                      style={{ color: ACCENT }}
                    >
                      {CURRENCY.format(item.price * item.quantity)}
                    </p>
                  </div>

                  <p className="mt-3 text-left text-xs leading-6 text-neutral-600">
                    {item.description}
                  </p>

                  <p
                    className="mt-3 text-left text-[10px] font-black uppercase"
                    style={{ color: ACCENT, letterSpacing: "0.14em" }}
                  >
                    Size: {item.selectedSizeLabel || item.selectedSize || "One Size"}
                  </p>

                  <p
                    className="mt-4 text-left text-[10px] font-black uppercase"
                    style={{ color: ACCENT, letterSpacing: "0.14em" }}
                  >
                    Qty: {item.quantity}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                title="No Products"
                description="Go back to your cart and add products before reviewing."
                actionLabel="Back To Cart"
                actionHref="/checkout/cart"
              />
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate("/checkout/details")}
            disabled={isSubmitting}
            className="mt-6 w-full rounded-full border-2 px-6 py-3 text-[10px] font-black uppercase shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              borderColor: ACCENT,
              color: ACCENT,
              backgroundColor: "#ffffff",
              letterSpacing: "0.05em",
              fontFamily: "Inter, Arial, sans-serif",
              fontWeight: 600,
              WebkitTextStroke: "0.15px currentColor",
            }}
          >
            Back To Details
          </button>
        </div>

        <OrderSummary
          subtotal={subtotal}
          actionLabel={isSubmitting ? "Processing..." : "Place Order"}
          onAction={placeOrder}
          disabled={!cart || cart.length === 0 || isSubmitting}
          helperText="Demo checkout only. No real payment is processed."
        />
      </div>
    </CheckoutLayout>
  );
}

function SuccessPage({ clearCart }) {
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <CheckoutLayout
      step={4}
      title="Order Complete"
      description="Your order has been submitted successfully."
    >
      <div
        className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-[26px] border-2 bg-white p-10 text-center shadow-xl"
        style={{ borderColor: ACCENT }}
      >
        <CheckCircleIcon
          className="mx-auto"
          size={70}
          style={{ color: "#da291c" }}
        />

        <h2 className="display-font mt-6 text-center text-7xl uppercase leading-none">
          Thank You
        </h2>

        <p className="mx-auto mt-5 max-w-lg text-center text-neutral-600">
          Your order request has been received.
        </p>

        <Link
          to="/"
          className="mt-10 inline-flex items-center justify-center rounded-full border-2 px-8 py-3 text-xs font-black uppercase text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110"
          style={{
            backgroundColor: ACCENT,
            borderColor: ACCENT,
            color: "#ffffff",
            letterSpacing: "0.22em",
            fontWeight: 800,
            WebkitTextStroke: "0.2px currentColor",
          }}
        >
          Back Home
        </Link>
      </div>
    </CheckoutLayout>
  );
}

function CheckoutButton({ children, onClick, disabled, type = "button" }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { y: -2, scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      className="w-full rounded-full border-2 px-6 py-3 text-[10px] font-black uppercase text-white shadow-md hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        backgroundColor: ACCENT,
        borderColor: ACCENT,
        color: "#ffffff",
        letterSpacing: "0.05em",
        fontFamily: "Inter, Arial, sans-serif",
        fontWeight: 600,
        WebkitTextStroke: "0.15px currentColor",
      }}
    >
      {children}
    </motion.button>
  );
}

function CheckoutLayout({ step, title, description, children }) {
  const steps = ["Cart", "Details", "Review", "Done"];

  return (
    <section className="w-full bg-white">
      <div className="store-container py-16">
        <div className="mb-12 flex flex-col items-center text-center">
          <p
            className="text-sm font-black uppercase"
            style={{ color: ACCENT, letterSpacing: "0.35em" }}
          >
            Checkout
          </p>

          <h1 className="display-font mt-3 text-center text-6xl uppercase leading-none sm:text-7xl">
            {title}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-center text-neutral-600">
            {description}
          </p>
        </div>

        <div className="mx-auto mb-12 flex max-w-4xl flex-wrap items-center justify-center gap-3">
          {steps.map((label, index) => {
            const active = index + 1 <= step;

            return (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-black transition"
                  style={{
                    backgroundColor: active ? ACCENT : "#ffffff",
                    borderColor: ACCENT,
                    color: active ? "#ffffff" : ACCENT,
                  }}
                >
                  {index + 1}
                </div>

                <span
                  className="hidden text-xs font-black uppercase sm:inline"
                  style={{
                    color: active ? ACCENT : "#9ca3af",
                    letterSpacing: "0.16em",
                  }}
                >
                  {label}
                </span>

                {index < steps.length - 1 ? (
                  <div className="hidden h-[2px] w-10 bg-neutral-200 sm:block" />
                ) : null}
              </div>
            );
          })}
        </div>

        {children}
      </div>
    </section>
  );
}

function OrderSummary({ subtotal, actionLabel, onAction, disabled, helperText }) {
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <aside
      className="sticky top-[120px] h-fit rounded-[22px] border-2 bg-white p-5 shadow-md transition-all duration-300 hover:shadow-xl"
      style={{ borderColor: ACCENT }}
    >
      <p
        className="text-xs font-black uppercase"
        style={{ color: ACCENT, letterSpacing: "0.3em" }}
      >
        Order
      </p>

      <h2 className="display-font mt-2 text-5xl uppercase leading-none">
        Summary
      </h2>

      <div className="mt-6 space-y-4 text-sm text-neutral-600">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-bold text-neutral-950">
            {CURRENCY.format(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span className="font-bold text-neutral-950">
            {shipping === 0 ? "Free" : CURRENCY.format(shipping)}
          </span>
        </div>

        <div className="h-px bg-neutral-200" />

        <div className="flex items-center justify-between text-lg font-black text-neutral-950">
          <span>Total</span>
          <span style={{ color: ACCENT }}>{CURRENCY.format(total)}</span>
        </div>
      </div>

      {helperText ? (
        <p className="mt-4 text-sm leading-6 text-neutral-500">
          {helperText}
        </p>
      ) : null}

      <div className="mt-6">
        <CheckoutButton onClick={onAction} disabled={disabled}>
          {actionLabel}
        </CheckoutButton>
      </div>
    </aside>
  );
}

function EmptyState({ title, description, actionLabel, actionHref }) {
  return (
    <div
      className="flex flex-col items-center rounded-[28px] border-2 border-dashed bg-white p-10 text-center shadow-md"
      style={{ borderColor: ACCENT }}
    >
      <h2 className="display-font text-center text-5xl uppercase leading-none">
        {title}
      </h2>

      <p className="mx-auto mt-4 max-w-md text-center text-neutral-600">
        {description}
      </p>

      <Link
        to={actionHref}
        className="mt-6 inline-flex rounded-full border-2 px-6 py-3 text-xs font-black uppercase shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
        style={{
          backgroundColor: ACCENT,
          borderColor: ACCENT,
          color: "#ffffff",
          letterSpacing: "0.22em",
        }}
      >
        {actionLabel}
      </Link>
    </div>
  );
}

function Footer() {
  return (
    <footer className="w-full border-t border-neutral-200 bg-white">
      <div className="flex w-full items-center justify-between px-6 py-5 text-xs sm:px-8 sm:text-sm">
        <p className="shrink-0">© 2026 TIF0</p>

        <div className="ml-auto flex flex-nowrap items-center gap-4 whitespace-nowrap">
          <Link to="/about" className="transition hover:text-red-700">
            About
          </Link>
          <Link to="/flags" className="transition hover:text-red-700">
            Flags
          </Link>
          <Link to="/jerseys" className="transition hover:text-red-700">
            Jerseys
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default App;
