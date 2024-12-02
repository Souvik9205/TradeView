import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useFormik } from "formik";
import * as Yup from "yup";

const CRYPTO_SYMBOLS = [
  "BTC_USDC",
  "ETH_USDC",
  "PYTH_USDC",
  "MOODENG_USDC",
  "SOL_USDC",
];

interface CryptoPageProps {
  user: string;
}

const CryptoPage: React.FC<CryptoPageProps> = ({ user }) => {
  const router = useRouter();
  const [cryptocurrencies, setCryptocurrencies] = useState<
    {
      name: string;
      fullName: string;
      lastPrice: string;
      priceChange: number;
      priceChangePercent: number;
      isPositive: boolean;
    }[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const [email, setEmail] = useState("");

  const backendUrl = "http://localhost:3121";

  const emailForm = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is Required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        setEmail(values.email);
        const res = await axios.post(`${backendUrl}/auth/signup`, {
          email: values.email,
        });
        if (res.status === 200) {
          setLoading(false);
          resetForm();
          openModal();
        }
      } catch (e) {
        console.error(e);
      }
    },
  });
  const otpForm = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: Yup.object({
      otp: Yup.string()
        .length(6, "OTP must be exactly 6 digits")
        .matches(/^[0-9]+$/, "OTP must be numeric")
        .required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const res = await axios.post(`${backendUrl}/auth/verify-otp`, {
          email: email,
          otp: values.otp,
        });
        if (res.status === 200) {
          setEmail("");
          setOtp("");
          localStorage.setItem("user", res.data.user);
          setLoading(false);
          closeModal();
        }
      } catch (e) {
        console.error(e);
      }
    },
  });

  useEffect(() => {
    const fetchCryptocurrencyData = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:3129/api/v1/tickers"
        );
        const filteredData = CRYPTO_SYMBOLS.map((symbol) => {
          const coinData = data.find((item: any) => item.symbol === symbol);
          if (coinData) {
            const [name] = symbol.split("_");
            return {
              name,
              fullName: name.toUpperCase(),
              lastPrice: `$${parseFloat(coinData.lastPrice).toFixed(2)}`,
              priceChange: `${parseFloat(coinData.priceChange)}`,
              priceChangePercent: parseFloat(coinData.priceChangePercent),
              isPositive: parseFloat(coinData.priceChange) >= 0,
            };
          }
          return null;
        }).filter(Boolean); // Remove any null values
        setCryptocurrencies(filteredData as any[]);
      } catch (error) {
        console.error("Error fetching cryptocurrency data:", error);
      }
    };

    fetchCryptocurrencyData();
  }, []);

  return (
    <div className="text-white flex items-center justify-around px-4 gap-20 ">
      {user != "" ? (
        <section className="flex flex-col items-baseline gap-10 w-2/3 pl-10">
          <div className="text-left">
            <h1 className="text-xxxl font-bold leading-tight text-yellow-400">
              Welcome <br />
              {user as string}
            </h1>
          </div>
          <div className="text-left text-base tracking-tight text-white/70 pl-3">
            <p>
              Step into the future of finance! Unlock limitless opportunities,
              grow your wealth, and experience the thrill of crypto trading like
              never before. Your journey to financial freedom starts here!
            </p>
          </div>
        </section>
      ) : (
        <section className="flex flex-col items-baseline gap-8 w-2/3 pl-3 ">
          <div className="text-left">
            <h1 className="text-xxxl font-bold leading-tight text-yellow-400">
              Start <br />
              Trading Today
            </h1>
          </div>
          <div className="flex flex-col items-center pl-3">
            <div className="flex">
              <form onSubmit={emailForm.handleSubmit}>
                <input
                  type="text"
                  name="email"
                  placeholder="Enter Your Email"
                  value={emailForm.values.email}
                  onChange={emailForm.handleChange}
                  onBlur={emailForm.handleBlur}
                  className="px-4 py-2 w-72 rounded-l-lg bg-gradient-to-tl from-neutral-700 to-neutral-900 text-white placeholder-gray-400 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-br text-black/90 from-yellow-300/80 to-yellow-700/80 px-6 py-2 font-semibold rounded-r-lg hover:bg-yellow-500 transition duration-300"
                >
                  {loading ? "Submitting..." : "Sign Up"}
                </button>
                {emailForm.touched.email && emailForm.errors.email ? (
                  <div className="text-red-500 text-sm mt-1">
                    {emailForm.errors.email}
                  </div>
                ) : null}
              </form>
            </div>
          </div>
        </section>
      )}

      <section className="w-1/3">
        <div className="bg-gradient-to-br from-neutral-700 to-neutral-900 border-2 border-neutral-600 mt-6 rounded-lg w-full p-6">
          <div className="w-full">
            <h2 className="text-lg font-semibold mb-4">Popular</h2>
            <div className="border-b-4 border-neutral-500 mb-4"></div>
            <ul>
              {cryptocurrencies.map((crypto, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between py-2 px-3 rounded-lg border-b border-gray-700 last:border-none cursor-pointer hover:bg-neutral-700"
                  onClick={() => {
                    router.push(`/trade/${crypto.fullName}_USDC`);
                  }}
                >
                  <div className="flex items-center gap-5">
                    <img
                      src={`./coins/${crypto.name.toLowerCase()}.png`}
                      alt={crypto.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="ml-2">
                      <h3 className="font-semibold">{crypto.name}</h3>
                      <p className="text-sm text-gray-400">{crypto.fullName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{crypto.lastPrice}</p>
                    <p
                      className={`text-sm ${
                        crypto.isPositive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {(crypto.priceChangePercent * 100).toFixed(2)}%
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gradient-to-tr from-neutral-600 to-neutral-800 rounded-lg border border-gray-600 w-80 p-6">
            <h2 className="text-lg font-semibold mb-4 text-yellow-400">
              Enter OTP
            </h2>
            <p className="text-sm text-white mb-8">
              We've sent a 6-digit OTP to your email. Please enter it below to
              verify your account.
            </p>
            <form
              onSubmit={otpForm.handleSubmit}
              className="flex flex-col items-center gap-4"
            >
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  otpForm.setFieldValue("otp", value);
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              {otpForm.touched.otp && otpForm.errors.otp ? (
                <div className="text-red-500 text-sm mt-1">
                  {otpForm.errors.otp}
                </div>
              ) : null}
              <div className="flex justify-end gap-4">
                <Button
                  type="submit"
                  className="bg-gradient-to-br text-black/90 from-yellow-300/80 to-yellow-700/80 hover:bg-yellow-400"
                  disabled={loading}
                >
                  {loading ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    "Submit OTP"
                  )}
                </Button>
                <Button
                  className="bg-gradient-to-br text-black/90 from-gray-400/80 to-gray-600/80 hover:bg-gray-500"
                  type="button"
                  onClick={closeModal}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoPage;
